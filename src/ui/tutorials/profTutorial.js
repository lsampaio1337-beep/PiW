import { state } from '../../state.js';
import { updateUI } from '../../ui.js';

const profTutorialMessages = [
    "<p>Hello, Trainer!</p><p>Here I will give you some tips for introduce you to game.</p><p>Do you want a tutorial guide to help you understand better the game or do you want to skip and start the game?</p>",
    "<p>This game runs only on the Main Control Tab.</p><p>It is in there that you will open and close all modules</p><p>This module you are seeing it is called “Main View” and it will display all the visual when battling or shopping.</p>",
    "<p>Icons are displayed in the Main Control Tab. You will be able to open modules with them.</p><p>The first two modules are “Main View” and “Team View”, and they will help when you are in battle mode.</p>",
    "<p>Next set of icons will help you to play the game.</p><p>Map will let you travel to different spots and places.</p><p>Backpack will allow you to see items and Pokémons.</p><p>Pokedex with bring all info of Pokémons.</p><p>Trainer have Statistics of the game.</p>",
    "<p>Next set of icon are “Objectives Related”</p><p>Here we have Daily Calendar. It will have daily challenges and rewards you each day you play. It also have a shop to spend Daily Tokens earned… Make sure to expend them on upgrades!</p><p>Next is the Progress Challenges. Completing the Challenge grants a new spot to travel and may grant some gifts.</p>",
    "<p>The last set of icons are related to settings.</p><p>The first is “Help”. In there you can find information about the whole game (with formulas).</p><p>“Settings” will let you change configurations of the game.</p><p>If you want to leave game, just go to the “Exit” icon.</p>",
    "<p>Along the gameplay, some new icons will appear in Main Control.</p><p>But don’t worry, you will be told what they are.</p>",
    "<p>On maps you can find places that are HUB for interactions.</p><p>You are at “Professor Lab” now, and I have some assignments for you… make sure to conclude them to earn boosts.</p>",
    "<p>Now you are all set!</p><p>If you need more help, make sure to open the Help Module!</p><p>Have fun and CATCH THEM ALL!</p>"
];
let currentProfTutorialIndex = 0;

export function skipProfTutorial() {
    state.globalStats.hasSeenProfTutorial = true;
    const overlay = document.getElementById('prof-tutorial-overlay');
    if (overlay) overlay.style.display = 'none';
    if (window.storageRef) window.storageRef.save(state);
};

export function proceedProfTutorial() {
    currentProfTutorialIndex++;
    if (currentProfTutorialIndex >= profTutorialMessages.length - 1) {
        // Switch to the conclude button on the last message
        document.getElementById('btn-prof-tutorial-skip').style.display = 'none';
        document.getElementById('btn-prof-tutorial-proceed').style.display = 'none';
        document.getElementById('btn-prof-tutorial-conclude').style.display = 'inline-block';
    } else {
        document.getElementById('btn-prof-tutorial-proceed').innerText = `Proceed ${currentProfTutorialIndex + 1}/${profTutorialMessages.length - 1}`;
    }

    if (currentProfTutorialIndex < profTutorialMessages.length) {
        document.getElementById('prof-tutorial-text').innerHTML = profTutorialMessages[currentProfTutorialIndex];
    }
};

export function concludeProfTutorial() {
    skipProfTutorial();
};

export function showProfTutorialIfNeeded() {
    if (!state.globalStats.hasSeenProfTutorial) {
        const overlay = document.getElementById('prof-tutorial-overlay');
        if (overlay) {
            currentProfTutorialIndex = 0;
            document.getElementById('prof-tutorial-text').innerHTML = profTutorialMessages[currentProfTutorialIndex];

            // Reset buttons visibility
            document.getElementById('btn-prof-tutorial-skip').style.display = 'inline-block';

            const proceedBtn = document.getElementById('btn-prof-tutorial-proceed');
            proceedBtn.innerText = `Proceed 1/${profTutorialMessages.length - 1}`;
            proceedBtn.style.display = 'inline-block';

            document.getElementById('btn-prof-tutorial-conclude').style.display = 'none';

            overlay.style.display = 'flex';
        }
    }
}

export { profTutorialMessages };
