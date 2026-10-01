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

window.openMultiplayerModal = function(tab = 'host') {
    openMultiplayerModal(tab);
};

window.switchMultiplayerTab = function(tab) {
    const hostContainer = document.getElementById('mp-host-container');
    const joinContainer = document.getElementById('mp-join-container');
    const hostBtn = document.getElementById('btn-tab-host');
    const joinBtn = document.getElementById('btn-tab-join');

    if (tab === 'host') {
        hostContainer.style.display = 'block';
        joinContainer.style.display = 'none';
        hostBtn.style.background = 'linear-gradient(to bottom, #3498db, #2980b9)';
        hostBtn.style.color = 'white';
        hostBtn.style.border = '1px solid #3498db';
        hostBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        joinBtn.style.background = 'transparent';
        joinBtn.style.color = 'rgba(255, 255, 255, 0.7)';
        joinBtn.style.border = '1px solid transparent';
        joinBtn.style.boxShadow = 'none';
    } else {
        hostContainer.style.display = 'none';
        joinContainer.style.display = 'block';
        joinBtn.style.background = 'linear-gradient(to bottom, #3498db, #2980b9)';
        joinBtn.style.color = 'white';
        joinBtn.style.border = '1px solid #3498db';
        joinBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        hostBtn.style.background = 'transparent';
        hostBtn.style.color = 'rgba(255, 255, 255, 0.7)';
        hostBtn.style.border = '1px solid transparent';
        hostBtn.style.boxShadow = 'none';
    }
};

export function openMultiplayerModal(tab = 'host') {
    const btnStyle = "background: linear-gradient(to bottom, #3498db, #2980b9); color: white; border: 1px solid #3498db; box-shadow: 0 2px 4px rgba(0,0,0,0.2); border-radius: 5px; font-weight: bold; cursor: pointer; transition: all 0.2s;";

    let titleHtml = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
            <div style="font-weight: bold; font-size: 18px; color: white;">Multiplayer</div>
            <div style="display: inline-flex; background: rgba(0, 0, 0, 0.2); border-radius: 20px; padding: 3px; gap: 5px;">
                <button id="btn-tab-host" onclick="window.switchMultiplayerTab('host')" style="${tab === 'host' ? 'background: linear-gradient(to bottom, #3498db, #2980b9); color: white; border: 1px solid #3498db; box-shadow: 0 2px 4px rgba(0,0,0,0.2);' : 'background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent;'} border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;" onmousedown="event.stopPropagation()">Host</button>
                <button id="btn-tab-join" onclick="window.switchMultiplayerTab('join')" style="${tab === 'join' ? 'background: linear-gradient(to bottom, #3498db, #2980b9); color: white; border: 1px solid #3498db; box-shadow: 0 2px 4px rgba(0,0,0,0.2);' : 'background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent;'} border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;" onmousedown="event.stopPropagation()">Join</button>
            </div>
        </div>
    `;

    let html = `
        <div style="text-align: center; color: white; display: flex; flex-direction: column; gap: 20px; padding-bottom: 20px; min-width: 400px;">
            <p style="margin: 0;">Connect with a friend to battle using your current active party!</p>

            <div style="display: flex; justify-content: center; width: 100%;">
                <div id="mp-host-container" style="display: ${tab === 'host' ? 'block' : 'none'}; background: rgba(0,0,0,0.5); padding: 20px; border-radius: 10px; width: 100%; box-sizing: border-box;">
                    <button id="btn-mp-host" style="padding: 10px; width: 100%; ${btnStyle}">Generate Code</button>
                    <p style="margin-top: 15px; font-size: 14px;">Send this code to your friend:</p>
                    <div style="display: flex; gap: 5px; align-items: center;">
                        <input type="text" id="multiplayer-host-id" readonly placeholder="Waiting..." style="flex: 1; padding: 8px; box-sizing: border-box; font-size: 12px; background: #222; color: white; border: 1px solid #555; border-radius: 5px;">
                        <button id="btn-copy-host" style="padding: 8px 12px; font-size: 12px; ${btnStyle}">Copy</button>
                    </div>
                    <p style="margin-top: 20px; font-size: 14px;">Paste your friend's Answer Code here:</p>
                    <div style="display: flex; gap: 5px; align-items: center;">
                        <input type="text" id="mp-host-answer-input" placeholder="Paste Answer Code" style="flex: 1; padding: 8px; box-sizing: border-box; font-size: 12px; border-radius: 5px;">
                        <button id="btn-paste-host" style="padding: 8px 12px; font-size: 12px; ${btnStyle}">Paste</button>
                    </div>
                    <button id="btn-mp-complete" style="padding: 10px; margin-top: 15px; width: 100%; ${btnStyle}">Connect</button>
                </div>

                <div id="mp-join-container" style="display: ${tab === 'join' ? 'block' : 'none'}; background: rgba(0,0,0,0.5); padding: 20px; border-radius: 10px; width: 100%; box-sizing: border-box;">
                    <p style="margin-top: 0; font-size: 14px;">Paste Host's Offer Code here:</p>
                    <div style="display: flex; gap: 5px; align-items: center;">
                        <input type="text" id="mp-join-input" placeholder="Paste Code Here" style="flex: 1; padding: 8px; box-sizing: border-box; font-size: 12px; border-radius: 5px;">
                        <button id="btn-paste-join" style="padding: 8px 12px; font-size: 12px; ${btnStyle}">Paste</button>
                    </div>
                    <button id="btn-mp-join" style="padding: 10px; margin-top: 15px; width: 100%; ${btnStyle}">Generate Code</button>

                    <p style="margin-top: 20px; font-size: 14px;">Send this Answer Code back to Host:</p>
                    <div style="display: flex; gap: 5px; align-items: center;">
                        <input type="text" id="multiplayer-client-id" readonly placeholder="Waiting..." style="flex: 1; padding: 8px; box-sizing: border-box; font-size: 12px; background: #222; color: white; border: 1px solid #555; border-radius: 5px;">
                        <button id="btn-copy-client" style="padding: 8px 12px; font-size: 12px; ${btnStyle}">Copy</button>
                    </div>
                </div>
            </div>

            <div style="display: flex; justify-content: center; gap: 20px;">
                <div style="display: flex; width: 220px;">
                    <button id="btn-mp-connection-status" disabled style="width: 100%; padding: 15px 0; font-size: 18px; font-weight: bold; background: #e74c3c; color: white; border: none; border-radius: 5px; opacity: 1; cursor: default;">No Connection</button>
                </div>
                <div style="display: flex; width: 220px;">
                    <button id="btn-mp-battle" disabled style="width: 100%; padding: 15px 0; font-size: 18px; font-weight: bold; background: #95a5a6; color: white; border: none; border-radius: 5px; cursor: not-allowed;">Battle</button>
                </div>
            </div>
        </div>
    `;

    if (window.showModal) {
        window.showModal(titleHtml, html);

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
