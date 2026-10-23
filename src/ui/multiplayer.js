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

window.getMultiplayerIsHost = () => isHost;

export function resetMultiplayerReady() {
    isMultiplayerReady.local = false;
    isMultiplayerReady.remote = false;
}


function safeEncode(obj) {
    const bytes = new TextEncoder().encode(JSON.stringify(obj));
    const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join("");
    return btoa(binString);
}

function safeDecode(str) {
    if (typeof str !== 'string') {
        throw new Error('Payload must be a string');
    }
    if (str.length > 100000) {
        throw new Error('Payload too large');
    }
    try {
        const binString = atob(str.trim());
        const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0));
        const parsed = JSON.parse(new TextDecoder().decode(bytes));

        if (!parsed || typeof parsed !== 'object') {
            throw new Error('Payload is not an object');
        }

        const validTypes = ['offer', 'answer', 'pranswer', 'rollback'];
        if (!validTypes.includes(parsed.type)) {
            throw new Error('Invalid or missing type');
        }

        if (typeof parsed.sdp !== 'string') {
            throw new Error('Invalid or missing sdp');
        }

        if (!parsed.sdp.startsWith('v=')) {
            throw new Error('SDP must start with v=');
        }

        return {
            type: parsed.type,
            sdp: parsed.sdp
        };
    } catch (e) {
        throw new Error('Failed to securely decode payload: ' + e.message);
    }
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
    btn.style.background = '#2ecc71'; // Green

    if (isMultiplayerReady.local) {
        btn.innerText = 'Starting Battle...';
    } else {
        btn.innerText = 'Start Battle';
    }
}

function setupDataChannel(channel) {
    const handleOpen = () => {
        const connBtn = document.getElementById('btn-mp-connection-status');
        if (connBtn) {
            connBtn.style.background = '#2ecc71';
            connBtn.innerText = 'Connected';
            connBtn.disabled = false;
            connBtn.style.cursor = 'pointer';

            // Allow disconnection by clicking
            connBtn.onclick = () => {
                if (peerConnection) {
                    peerConnection.close();
                }
                initMultiplayer();
                connBtn.style.background = '#e74c3c';
                connBtn.innerText = 'Not Connected';
                connBtn.disabled = true;
                connBtn.style.cursor = 'default';
                connBtn.onmouseenter = null;
                connBtn.onmouseleave = null;
                updateBattleButtonUI();
            };

            // Hover effect
            connBtn.onmouseenter = () => {
                connBtn.style.background = '#e74c3c';
                connBtn.innerText = 'Disconnect';
            };
            connBtn.onmouseleave = () => {
                connBtn.style.background = '#2ecc71';
                connBtn.innerText = 'Connected';
            };
        }
        updateBattleButtonUI();

        // Send our party data to the opponent
        channel.send(JSON.stringify({ type: 'party', party: state.party, region: state.currentRegionName }));
    };

    channel.onopen = handleOpen;
    if (channel.readyState === 'open') {
        handleOpen();
    }

    channel.onmessage = (event) => {
        let data;
        try {
            data = JSON.parse(event.data);
        } catch (e) {
            console.warn("Received malformed multiplayer message", e);
            return;
        }

        if (!data || typeof data !== 'object') {
            console.warn("Multiplayer message is not an object");
            return;
        }

        if (data.type === 'party') {
            if (!Array.isArray(data.party)) {
                console.warn("Multiplayer party message missing valid party array");
                return;
            }
            if (data.region !== state.currentRegionName) {
                alert("Cannot connect! You must be in the same region as your opponent.");
                if (peerConnection) {
                    peerConnection.close();
                }
                initMultiplayer();

                const connBtn = document.getElementById('btn-mp-connection-status');
                if (connBtn) {
                    connBtn.style.background = '#e74c3c';
                    connBtn.innerText = 'Not Connected';
                    connBtn.disabled = true;
                    connBtn.style.cursor = 'default';
                    connBtn.onmouseenter = null;
                    connBtn.onmouseleave = null;
                }
                updateBattleButtonUI();
                return;
            }
            opponentParty = data.party;
            checkReadyState();
        } else if (data.type === 'ready') {
            isMultiplayerReady.remote = Boolean(data.state);
            updateBattleButtonUI();
            checkReadyState();
        } else if (data.type === 'combatEvent') {
            if (!data.event || typeof data.event !== 'object') {
                console.warn("Multiplayer combatEvent message missing valid event object");
                return;
            }
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
             // Host needs to initiate the start locally as well
             if (globals.battleSystem) {
                 globals.battleSystem.startMultiplayerBattle(opponentParty, isHost);
             } else if (window.globals && window.globals.battleSystem) {
                 window.globals.battleSystem.startMultiplayerBattle(opponentParty, isHost);
             } else {
                 console.error("Globals.battleSystem is not available");
             }
        }, 1000);
    }
}

window.resetMultiplayerReady = resetMultiplayerReady;

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

window.initMultiplayerView = function() {
    window.switchMultiplayerTab('host');

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
            inputEl.setSelectionRange(0, 99999);
            document.execCommand('copy');
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
};
