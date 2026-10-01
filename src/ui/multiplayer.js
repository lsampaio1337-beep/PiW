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
            const offer = JSON.stringify(peerConnection.localDescription);
            const encodedOffer = btoa(offer);
            document.getElementById('multiplayer-host-id').innerText = encodedOffer;
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
            const answer = JSON.stringify(peerConnection.localDescription);
            const encodedAnswer = btoa(answer);
            document.getElementById('mp-join-input').value = encodedAnswer;
            alert("Answer generated! Send the new code below back to the host.");
        }
    };

    try {
        const offerStr = atob(encodedOffer);
        const offerDesc = new window.RTCSessionDescription(JSON.parse(offerStr));
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
        const answerStr = atob(encodedAnswer);
        const answerDesc = new window.RTCSessionDescription(JSON.parse(answerStr));
        await peerConnection.setRemoteDescription(answerDesc);
    } catch (e) {
        alert("Invalid Answer Code.");
        console.error(e);
    }
}

function setupDataChannel(channel) {
    channel.onopen = () => {
        document.getElementById('multiplayer-status').innerText = 'Connected!';
        document.getElementById('multiplayer-ready-btn').style.display = 'block';

        // Send our party data to the opponent
        channel.send(JSON.stringify({ type: 'party', party: state.party }));
    };

    channel.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'party') {
            opponentParty = data.party;
            checkReadyState();
        } else if (data.type === 'ready') {
            isMultiplayerReady.remote = true;
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

export function setLocalReady() {
    if (!dataChannel || dataChannel.readyState !== 'open') return;
    isMultiplayerReady.local = true;
    document.getElementById('multiplayer-ready-btn').disabled = true;
    document.getElementById('multiplayer-ready-btn').innerText = 'Waiting for opponent...';
    dataChannel.send(JSON.stringify({ type: 'ready' }));
    checkReadyState();
}

function checkReadyState() {
    if (isMultiplayerReady.local && isMultiplayerReady.remote && opponentParty) {
        document.getElementById('multiplayer-status').innerText = 'Starting Battle...';
        setTimeout(() => {
             if (window.closeModal) window.closeModal();
             if (globals.battleSystem) globals.battleSystem.startMultiplayerBattle(opponentParty);
        }, 1000);
    }
}

export function openMultiplayerModal() {
    let html = `
        <div style="text-align: center; color: white;">
            <p>Connect with a friend to battle using your current active party!</p>

            <div style="display: flex; justify-content: space-around; margin-top: 20px;">
                <div style="background: rgba(0,0,0,0.5); padding: 20px; border-radius: 10px; width: 45%;">
                    <h3>Host Game</h3>
                    <button id="btn-mp-host" style="padding: 10px; cursor: pointer;">1. Generate Offer Code</button>
                    <p style="margin-top: 10px; font-size: 12px;">Send this code to your friend:</p>
                    <div id="multiplayer-host-id" style="background: #222; padding: 10px; min-height: 20px; word-break: break-all; user-select: all; font-size: 10px; max-height: 80px; overflow-y: auto;">Waiting...</div>
                    <p style="margin-top: 10px; font-size: 12px;">Paste your friend's Answer Code here:</p>
                    <input type="text" id="mp-host-answer-input" placeholder="Paste Answer Code" style="width: 100%; padding: 5px; box-sizing: border-box; font-size: 10px;">
                    <button id="btn-mp-complete" style="padding: 10px; margin-top: 5px; cursor: pointer;">3. Complete Connection</button>
                </div>

                <div style="background: rgba(0,0,0,0.5); padding: 20px; border-radius: 10px; width: 45%;">
                    <h3>Join Game</h3>
                    <p style="margin-top: 10px; font-size: 12px;">Paste Host's Offer Code here:</p>
                    <input type="text" id="mp-join-input" placeholder="Paste Code Here" style="width: 100%; padding: 5px; box-sizing: border-box; font-size: 10px;">
                    <button id="btn-mp-join" style="padding: 10px; margin-top: 5px; cursor: pointer;">2. Generate Answer Code</button>
                </div>
            </div>

            <div style="margin-top: 20px;">
                <h3 id="multiplayer-status" style="color: #2ecc71;">Not Connected</h3>
                <button id="multiplayer-ready-btn" style="display: none; padding: 15px 30px; font-size: 18px; cursor: pointer; background: #e74c3c; color: white; border: none; border-radius: 5px; margin: 10px auto;">Ready!</button>
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

            const btnReady = document.getElementById('multiplayer-ready-btn');
            if (btnReady) btnReady.onclick = setLocalReady;
        }, 100);
    }
}
