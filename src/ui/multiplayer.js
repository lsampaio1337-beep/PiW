import { state, globals } from '../state.js';

export let peerConnection = null;
export let dataChannel = null;
export let isHost = false;
export let opponentParty = null;
export let isMultiplayerReady = { local: false, remote: false };
export let originalParty = [];

export function initMultiplayer() {
    isMultiplayerReady = { local: false, remote: false };
    if (peerConnection) {
        peerConnection.close();
    }
    peerConnection = null;
    dataChannel = null;
    isHost = false;
    opponentParty = null;
    originalParty = [];
}


function safeEncode(obj) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
}

function safeDecode(str) {
    return JSON.parse(decodeURIComponent(escape(atob(str.trim()))));
}

const rtcConfig = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

export async function hostGame() {
    initMultiplayer();
    isHost = true;
    originalParty = [...state.party];

    peerConnection = new window.RTCPeerConnection(rtcConfig);
    dataChannel = peerConnection.createDataChannel('gameData');

    setupDataChannel(dataChannel);

    peerConnection.onicecandidate = (event) => {
        if (event.candidate === null) {
            // Trickle ICE finished, now SDP contains all ICE candidates.

            const encodedOffer = safeEncode(peerConnection.localDescription);
            const el = document.getElementById('multiplayer-host-id');
            if(el) el.value = encodedOffer;
        }
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
}

export async function joinGame(encodedOffer) {
    initMultiplayer();
    isHost = false;
    originalParty = [...state.party];

    peerConnection = new window.RTCPeerConnection(rtcConfig);

    peerConnection.ondatachannel = (event) => {
        dataChannel = event.channel;
        setupDataChannel(dataChannel);
    };

    peerConnection.onicecandidate = (event) => {
        if (event.candidate === null) {
            // Trickle ICE finished

            const encodedAnswer = safeEncode(peerConnection.localDescription);
            const el = document.getElementById('multiplayer-client-id');
            if (el) el.value = encodedAnswer;
            alert("Answer generated! Send the new code below back to the host.");
        }
    };

    try {
        const offerDesc = new window.RTCSessionDescription(safeDecode(encodedOffer));
        await peerConnection.setRemoteDescription(offerDesc);

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
    } catch (e) {
        alert("Invalid Host Code.");
        console.error(e);
    }
}

export async function completeConnection(encodedAnswer) {
    if (!peerConnection || !isHost) return;
    try {
        const answerDesc = new window.RTCSessionDescription(safeDecode(encodedAnswer));
        await peerConnection.setRemoteDescription(answerDesc);
    } catch (e) {
        alert("Invalid Answer Code.");
        console.error(e);
    }
}

function updateBattleButtonUI() {
    const btn = document.getElementById('btn-mp-battle');
    if (!btn) return;

    if (!dataChannel || dataChannel.readyState !== 'open') {
        btn.disabled = true;
        btn.style.background = '#95a5a6';
        btn.style.cursor = 'not-allowed';
        btn.innerText = 'Battle';
        return;
    }

    btn.disabled = false;
    btn.style.cursor = 'pointer';

    if (isMultiplayerReady.local) {
        btn.style.background = '#f39c12'; // Orange/Yellowish for waiting
        btn.innerText = 'Waiting Opponent';
    } else if (isMultiplayerReady.remote) {
        btn.style.background = '#2ecc71'; // Green
        btn.innerText = 'Opponent ready';
    } else {
        btn.style.background = '#2ecc71'; // Green
        btn.innerText = 'Start Battle';
    }
}

function setupDataChannel(channel) {
    channel.onopen = () => {
        const connBtn = document.getElementById('btn-mp-connection-status');
        if (connBtn) {
            connBtn.style.background = '#2ecc71';
            connBtn.innerText = 'Connected';
        }
        updateBattleButtonUI();

        // Send our party data to the opponent
        channel.send(JSON.stringify({ type: 'party', party: state.party }));
    };

    channel.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'party') {
            opponentParty = data.party;
            checkReadyState();
        } else if (data.type === 'ready') {
            isMultiplayerReady.remote = data.state;
            updateBattleButtonUI();
            checkReadyState();
        } else if (data.type === 'combatEvent') {
            if (globals.battleSystem) {
                 globals.battleSystem.handleMultiplayerEvent(data.event);
            }
        }
    };

    channel.onclose = () => {
        alert("Connection closed.");
        if (globals.battleSystem && globals.battleSystem.multiplayerState?.isActive) {
             globals.battleSystem.stopMultiplayerBattle();
        }
        initMultiplayer();
    };
}

export function toggleLocalReady() {
    if (!dataChannel || dataChannel.readyState !== 'open') return;

    isMultiplayerReady.local = !isMultiplayerReady.local;
    updateBattleButtonUI();

    dataChannel.send(JSON.stringify({ type: 'ready', state: isMultiplayerReady.local }));
    checkReadyState();
}

function checkReadyState() {
    if (isMultiplayerReady.local && isMultiplayerReady.remote && opponentParty) {
        const btn = document.getElementById('btn-mp-battle');
        if (btn) {
            btn.innerText = 'Starting Battle...';
            btn.disabled = true;
        }
        setTimeout(() => {
             if (window.closeModal) window.closeModal();
             if (globals.battleSystem) globals.battleSystem.startMultiplayerBattle(opponentParty, isHost);
        }, 1000);
    }
}

export function openMultiplayerModal() {
    let html = `
        <div style="text-align: center; color: white; display: flex; flex-direction: column; gap: 20px; padding-bottom: 20px;">
            <p style="margin: 0;">Connect with a friend to battle using your current active party!</p>

            <div style="display: flex; justify-content: space-around; gap: 20px;">
                <div style="background: rgba(0,0,0,0.5); padding: 20px; border-radius: 10px; width: 45%; box-sizing: border-box;">
                    <h3 style="margin-top: 0;">Host Game</h3>
                    <button id="btn-mp-host" style="padding: 10px; cursor: pointer; width: 100%;">1. Generate Offer Code</button>
                    <p style="margin-top: 10px; font-size: 12px;">Send this code to your friend:</p>
                    <div style="display: flex; gap: 5px; align-items: center;">
                        <input type="text" id="multiplayer-host-id" readonly placeholder="Waiting..." style="flex: 1; padding: 5px; box-sizing: border-box; font-size: 10px; background: #222; color: white; border: 1px solid #555;">
                        <button id="btn-copy-host" style="padding: 5px; cursor: pointer; font-size: 10px;">Copy</button>
                    </div>
                    <p style="margin-top: 10px; font-size: 12px;">Paste your friend's Answer Code here:</p>
                    <div style="display: flex; gap: 5px; align-items: center;">
                        <input type="text" id="mp-host-answer-input" placeholder="Paste Answer Code" style="flex: 1; padding: 5px; box-sizing: border-box; font-size: 10px;">
                        <button id="btn-paste-host" style="padding: 5px; cursor: pointer; font-size: 10px;">Paste</button>
                    </div>
                    <button id="btn-mp-complete" style="padding: 10px; margin-top: 10px; cursor: pointer; width: 100%;">3. Complete Connection</button>
                </div>

                <div style="background: rgba(0,0,0,0.5); padding: 20px; border-radius: 10px; width: 45%; box-sizing: border-box;">
                    <h3 style="margin-top: 0;">Join Game</h3>
                    <p style="margin-top: 10px; font-size: 12px;">Paste Host's Offer Code here:</p>
                    <div style="display: flex; gap: 5px; align-items: center;">
                        <input type="text" id="mp-join-input" placeholder="Paste Code Here" style="flex: 1; padding: 5px; box-sizing: border-box; font-size: 10px;">
                        <button id="btn-paste-join" style="padding: 5px; cursor: pointer; font-size: 10px;">Paste</button>
                    </div>
                    <button id="btn-mp-join" style="padding: 10px; margin-top: 10px; cursor: pointer; width: 100%;">2. Generate Answer Code</button>

                    <p style="margin-top: 10px; font-size: 12px;">Send this Answer Code back to Host:</p>
                    <div style="display: flex; gap: 5px; align-items: center;">
                        <input type="text" id="multiplayer-client-id" readonly placeholder="Waiting..." style="flex: 1; padding: 5px; box-sizing: border-box; font-size: 10px; background: #222; color: white; border: 1px solid #555;">
                        <button id="btn-copy-client" style="padding: 5px; cursor: pointer; font-size: 10px;">Copy</button>
                    </div>
                </div>
            </div>

            <div style="display: flex; justify-content: center; gap: 20px;">
                <button id="btn-mp-connection-status" disabled style="padding: 15px 30px; font-size: 18px; font-weight: bold; background: #e74c3c; color: white; border: none; border-radius: 5px; opacity: 1; cursor: default;">No Connection</button>
                <button id="btn-mp-battle" disabled style="padding: 15px 30px; font-size: 18px; font-weight: bold; background: #95a5a6; color: white; border: none; border-radius: 5px; cursor: not-allowed;">Battle</button>
            </div>
        </div>
    `;

    if (window.showModal) {
        window.showModal("Online Multiplayer", html);

        setTimeout(() => {
            const btnHost = document.getElementById('btn-mp-host');
            if (btnHost) btnHost.onclick = hostGame;

            const btnJoin = document.getElementById('btn-mp-join');
            if (btnJoin) {
                btnJoin.onclick = () => {
                    const hostId = document.getElementById('mp-join-input').value.trim();
                    if (hostId) joinGame(hostId);
                };
            }

            const btnComplete = document.getElementById('btn-mp-complete');
            if (btnComplete) {
                btnComplete.onclick = () => {
                    const answerId = document.getElementById('mp-host-answer-input').value.trim();
                    if (answerId) completeConnection(answerId);
                };
            }


            function copyToClipboard(inputEl, btnEl) {
                if (!inputEl || !inputEl.value) return;

                // Attempt standard navigator clipboard
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(inputEl.value).then(() => {
                        btnEl.innerText = 'Copied!';
                        setTimeout(() => btnEl.innerText = 'Copy', 2000);
                    }).catch(err => {
                        console.error('Clipboard write failed:', err);
                        fallbackCopy(inputEl, btnEl);
                    });
                } else {
                    fallbackCopy(inputEl, btnEl);
                }
            }

            function fallbackCopy(inputEl, btnEl) {
                try {
                    inputEl.select();
                    inputEl.setSelectionRange(0, 99999); // For mobile devices
                    document.execCommand('copy');

                    // Deselect
                    window.getSelection().removeAllRanges();

                    btnEl.innerText = 'Copied!';
                    setTimeout(() => btnEl.innerText = 'Copy', 2000);
                } catch (err) {
                    console.error('Fallback copy failed:', err);
                    alert("Copy failed. Please manually copy the code.");
                }
            }

            const btnCopyHost = document.getElementById('btn-copy-host');
            if (btnCopyHost) {
                btnCopyHost.onclick = () => {
                    copyToClipboard(document.getElementById('multiplayer-host-id'), btnCopyHost);
                };
            }

            const btnCopyClient = document.getElementById('btn-copy-client');
            if (btnCopyClient) {
                btnCopyClient.onclick = () => {
                    copyToClipboard(document.getElementById('multiplayer-client-id'), btnCopyClient);
                };
            }


            async function pasteFromClipboard(inputEl, btnEl) {
                if (!inputEl) return;
                try {
                    if (navigator.clipboard && navigator.clipboard.readText) {
                        const text = await navigator.clipboard.readText();
                        inputEl.value = text;
                        btnEl.innerText = 'Pasted!';
                        setTimeout(() => btnEl.innerText = 'Paste', 2000);
                    } else {
                        // Fallback paste is generally restricted by browsers, alert user
                        inputEl.focus();
                        if (document.execCommand('paste')) {
                             btnEl.innerText = 'Pasted!';
                             setTimeout(() => btnEl.innerText = 'Paste', 2000);
                        } else {
                             alert("Please use Ctrl+V or Right-Click -> Paste.");
                        }
                    }
                } catch (err) {
                    console.error('Paste failed:', err);
                    inputEl.focus();
                    alert("Please use Ctrl+V or Right-Click -> Paste.");
                }
            }

            const btnPasteHost = document.getElementById('btn-paste-host');
            if (btnPasteHost) {
                btnPasteHost.onclick = () => pasteFromClipboard(document.getElementById('mp-host-answer-input'), btnPasteHost);
            }

            const btnPasteJoin = document.getElementById('btn-paste-join');
            if (btnPasteJoin) {
                btnPasteJoin.onclick = () => pasteFromClipboard(document.getElementById('mp-join-input'), btnPasteJoin);
            }

            const btnBattle = document.getElementById('btn-mp-battle');
            if (btnBattle) btnBattle.onclick = toggleLocalReady;
        }, 100);
    }
}
