import { state, globals } from '../state.js';

export let peerConnection = null;
export let dataChannel = null;
export let isHost = false;
export let opponentParty = null;
export let isMultiplayerReady = { local: false, remote: false };
export let originalParty = [];
let startBattleTimeout = null;

export function initMultiplayer() {
    if (startBattleTimeout) {
        clearTimeout(startBattleTimeout);
        startBattleTimeout = null;
    }
    isMultiplayerReady = { local: false, remote: false };
    if (dataChannel) {
        dataChannel.onopen = null;
        dataChannel.onmessage = null;
        dataChannel.onclose = null;
        dataChannel.onerror = null;
    }
    if (peerConnection) {
        peerConnection.onicecandidate = null;
        peerConnection.ondatachannel = null;
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
    if (startBattleTimeout) {
        clearTimeout(startBattleTimeout);
        startBattleTimeout = null;
    }
    isMultiplayerReady.local = false;
    isMultiplayerReady.remote = false;
}


function safeEncode(obj) {
    const bytes = new TextEncoder().encode(JSON.stringify(obj));
    const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join("");
    return btoa(binString);
}

function safeDecode(str) {
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

function showMpAlert(msg) {
    if (typeof window !== 'undefined' && typeof window.showGameAlert === 'function') {
        window.showGameAlert(msg, 'view-battle-stadium');
    } else if (typeof alert === 'function') {
        alert(msg);
    }
}

function setMpActionGenerating(btnId, inputId, isGenerating, defaultLabel, defaultPlaceholder) {
    const btn = document.getElementById(btnId);
    if (btn) {
        if (isGenerating && !btn.dataset.defaultLabel) {
            btn.dataset.defaultLabel = btn.innerText || defaultLabel;
        }
        btn.disabled = isGenerating;
        btn.innerText = isGenerating ? 'Generating...' : (btn.dataset.defaultLabel || defaultLabel);
    }
    const inputEl = document.getElementById(inputId);
    if (inputEl) {
        if (isGenerating) {
            if (!inputEl.dataset.defaultPlaceholder) {
                inputEl.dataset.defaultPlaceholder = inputEl.placeholder || defaultPlaceholder;
            }
            inputEl.value = '';
            inputEl.placeholder = 'Generating code...';
        } else if (inputEl.dataset.defaultPlaceholder) {
            inputEl.placeholder = inputEl.dataset.defaultPlaceholder;
        }
    }
}

export async function hostGame() {
    initMultiplayer();
    isHost = true;
    originalParty = [...state.party];
    setMpActionGenerating('btn-mp-host', 'multiplayer-host-id', true, 'Create Host Code', 'Click button to generate Host Code');

    try {
        peerConnection = new window.RTCPeerConnection(rtcConfig);
        dataChannel = peerConnection.createDataChannel('gameData');

        setupDataChannel(dataChannel);

        peerConnection.onicecandidate = (event) => {
            if (event.candidate === null && peerConnection && peerConnection.localDescription) {
                // Trickle ICE finished, now SDP contains all ICE candidates.
                const encodedOffer = safeEncode(peerConnection.localDescription);
                setMpActionGenerating('btn-mp-host', 'multiplayer-host-id', false, 'Create Host Code', 'Click button to generate Host Code');
                const el = document.getElementById('multiplayer-host-id');
                if (el) el.value = encodedOffer;
            }
        };

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
    } catch (e) {
        console.error('Failed to host multiplayer game:', e);
        setMpActionGenerating('btn-mp-host', 'multiplayer-host-id', false, 'Create Host Code', 'Click button to generate Host Code');
        showMpAlert("Failed to host multiplayer game.");
        disconnectAndResetUI();
    }
}

export async function joinGame(encodedOffer) {
    initMultiplayer();
    isHost = false;
    originalParty = [...state.party];
    setMpActionGenerating('btn-mp-join', 'multiplayer-client-id', true, 'Generate Answer Code', 'Generated Answer Code appears here');

    peerConnection = new window.RTCPeerConnection(rtcConfig);

    peerConnection.ondatachannel = (event) => {
        dataChannel = event.channel;
        setupDataChannel(dataChannel);
    };

    peerConnection.onicecandidate = (event) => {
        if (event.candidate === null && peerConnection && peerConnection.localDescription) {
            // Trickle ICE finished
            const encodedAnswer = safeEncode(peerConnection.localDescription);
            setMpActionGenerating('btn-mp-join', 'multiplayer-client-id', false, 'Generate Answer Code', 'Generated Answer Code appears here');
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
        setMpActionGenerating('btn-mp-join', 'multiplayer-client-id', false, 'Generate Answer Code', 'Generated Answer Code appears here');
        showMpAlert("Invalid Host Code.");
        console.error(e);
    }
}

export async function completeConnection(encodedAnswer) {
    if (!peerConnection || !isHost) return;
    try {
        const answerDesc = new window.RTCSessionDescription(safeDecode(encodedAnswer));
        await peerConnection.setRemoteDescription(answerDesc);
    } catch (e) {
        showMpAlert("Invalid Answer Code.");
        console.error(e);
    }
}

export function disconnectAndResetUI() {
    initMultiplayer();
    setMpActionGenerating('btn-mp-host', 'multiplayer-host-id', false, 'Create Host Code', 'Click button to generate Host Code');
    setMpActionGenerating('btn-mp-join', 'multiplayer-client-id', false, 'Generate Answer Code', 'Generated Answer Code appears here');

    const connBtn = document.getElementById('btn-mp-connection-status');
    if (connBtn) {
        connBtn.style.background = '';
        connBtn.classList.remove('piw-btn-success');
        connBtn.classList.add('piw-btn-danger');
        connBtn.innerText = 'Not Connected';
        connBtn.disabled = true;
        connBtn.style.cursor = 'default';
        connBtn.onclick = null;
        connBtn.onmouseenter = null;
        connBtn.onmouseleave = null;
    }
    updateBattleButtonUI();
}

function updateBattleButtonUI() {
    const btn = document.getElementById('btn-mp-battle');
    if (!btn) return;

    btn.style.background = '';
    if (!dataChannel || dataChannel.readyState !== 'open') {
        btn.disabled = true;
        btn.classList.remove('piw-btn-success');
        btn.classList.add('piw-btn-secondary');
        btn.style.cursor = 'not-allowed';
        btn.innerText = 'Battle';
        return;
    }

    btn.disabled = false;
    btn.classList.remove('piw-btn-secondary');
    btn.classList.add('piw-btn-success');
    btn.style.cursor = 'pointer';

    if (isMultiplayerReady.local) {
        btn.innerText = 'Starting Battle...';
    } else {
        btn.innerText = 'Start Battle';
    }
}

function handleDataChannelOpen(channel) {
    const connBtn = document.getElementById('btn-mp-connection-status');
    if (connBtn) {
        connBtn.style.background = '';
        connBtn.classList.remove('piw-btn-danger');
        connBtn.classList.add('piw-btn-success');
        connBtn.innerText = 'Connected';
        connBtn.disabled = false;
        connBtn.style.cursor = 'pointer';

        // Allow disconnection by clicking
        connBtn.onclick = disconnectAndResetUI;

        // Hover effect
        connBtn.onmouseenter = () => {
            connBtn.classList.remove('piw-btn-success');
            connBtn.classList.add('piw-btn-danger');
            connBtn.innerText = 'Disconnect';
        };
        connBtn.onmouseleave = () => {
            connBtn.classList.remove('piw-btn-danger');
            connBtn.classList.add('piw-btn-success');
            connBtn.innerText = 'Connected';
        };
    }
    updateBattleButtonUI();

    // Send our party data to the opponent
    channel.send(JSON.stringify({ type: 'party', party: state.party, region: state.currentRegionName }));
}

function handleDataChannelClose() {
    showMpAlert("Connection closed.");
    if (globals.battleSystem && globals.battleSystem.multiplayerState?.isActive) {
         globals.battleSystem.stopMultiplayerBattle();
    }
    disconnectAndResetUI();
}

function setupDataChannel(channel) {
    const handleOpen = () => handleDataChannelOpen(channel);

    channel.onopen = handleOpen;
    if (channel.readyState === 'open') {
        handleOpen();
    }

    channel.onmessage = handleMessage;
    channel.onclose = handleDataChannelClose;
    channel.onerror = (err) => {
        console.error("Multiplayer data channel error:", err);
    };
}

const messageHandlers = {
    party: handlePartyMessage,
    ready: handleReadyMessage,
    combatEvent: handleCombatEventMessage
};

function handleMessage(event) {
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

    const handler = messageHandlers[data.type];
    if (handler) {
        handler(data);
    } else {
        console.warn("Unhandled multiplayer message type:", data.type);
    }
}

function handlePartyMessage(data) {
    if (!Array.isArray(data.party)) {
        console.warn("Multiplayer party message missing valid party array");
        return;
    }
    if (data.region !== state.currentRegionName) {
        showMpAlert("Cannot connect! You must be in the same region as your opponent.");
        disconnectAndResetUI();
        return;
    }
    opponentParty = data.party;
    checkReadyState();
}

function handleReadyMessage(data) {
    isMultiplayerReady.remote = Boolean(data.state);
    updateBattleButtonUI();
    checkReadyState();
}

function handleCombatEventMessage(data) {
    if (!data.event || typeof data.event !== 'object') {
        console.warn("Multiplayer combatEvent message missing valid event object");
        return;
    }
    if (globals.battleSystem) {
         globals.battleSystem.handleMultiplayerEvent(data.event);
    }
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
        if (!startBattleTimeout) {
            startBattleTimeout = setTimeout(() => {
                 startBattleTimeout = null;
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
    } else if (startBattleTimeout) {
        clearTimeout(startBattleTimeout);
        startBattleTimeout = null;
    }
}

window.resetMultiplayerReady = resetMultiplayerReady;

window.switchMultiplayerTab = function(tab) {
    const hostContainer = document.getElementById('mp-host-container');
    const joinContainer = document.getElementById('mp-join-container');
    const hostBtn = document.getElementById('btn-tab-host');
    const joinBtn = document.getElementById('btn-tab-join');
    if (!hostContainer || !joinContainer || !hostBtn || !joinBtn) return;

    const isHostTab = tab === 'host';
    hostContainer.style.display = isHostTab ? 'block' : 'none';
    joinContainer.style.display = isHostTab ? 'none' : 'block';
    hostBtn.classList.toggle('is-active', isHostTab);
    joinBtn.classList.toggle('is-active', !isHostTab);
};

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
        showMpAlert("Copy failed. Please manually copy the code.");
    }
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
                 showMpAlert("Please use Ctrl+V or Right-Click -> Paste.");
            }
        }
    } catch (err) {
        console.error('Paste failed:', err);
        inputEl.focus();
        showMpAlert("Please use Ctrl+V or Right-Click -> Paste.");
    }
}

window.initMultiplayerView = function() {
    window.switchMultiplayerTab('host');

    const btnHost = document.getElementById('btn-mp-host');
    if (btnHost) btnHost.onclick = hostGame;

    const btnJoin = document.getElementById('btn-mp-join');
    if (btnJoin) {
        btnJoin.onclick = () => {
            const joinInput = document.getElementById('mp-join-input');
            const hostId = joinInput ? joinInput.value.trim() : '';
            if (hostId) joinGame(hostId);
        };
    }

    const btnComplete = document.getElementById('btn-mp-complete');
    if (btnComplete) {
        btnComplete.onclick = () => {
            const answerInput = document.getElementById('mp-host-answer-input');
            const answerId = answerInput ? answerInput.value.trim() : '';
            if (answerId) completeConnection(answerId);
        };
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
