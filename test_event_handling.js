const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const dom = new JSDOM(`<!DOCTYPE html><html><body><div id="target"></div></body></html>`, { url: "http://localhost" });
global.window = dom.window;
global.document = dom.window.document;
global.DOMParser = dom.window.DOMParser;
global.Event = dom.window.Event;
global.HTMLElement = dom.window.HTMLElement;

// Dummy methods to simulate state
window.state = { config: { balance: { expansions: { ballPocket: [] } } }, settings: {} };
let calledFunc = false;
window.renderBackpackTab = function(arg) {
    calledFunc = arg;
};

// Evaluate the windowManager
const code = fs.readFileSync('src/windowManager.js', 'utf-8');
const transformedCode = code.replace(/import { state } from "\.\/state\.js";/, '').replace(/export class WindowManager/, 'global.WindowManager = class WindowManager');
eval(transformedCode);

const wm = new WindowManager();
const targetEl = document.getElementById('target');
const htmlString = `<div onclick="event.stopPropagation(); window.renderBackpackTab('pokeballs')"></div>`;

wm._parseAndSanitizeToElement(htmlString, targetEl);
const insertedDiv = targetEl.querySelector('div');

let propagationStopped = false;
const event = new Event('click', { bubbles: true, cancelable: true });
const originalStopPropagation = event.stopPropagation;
event.stopPropagation = function() {
    propagationStopped = true;
    originalStopPropagation.apply(this, arguments);
};

insertedDiv.dispatchEvent(event);

console.log('Stop propagation called:', propagationStopped);
console.log('Func called with:', calledFunc);
