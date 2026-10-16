const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

let showModal;
let window;
let document;

test.beforeAll(() => {
    // Read the file content
    const uiContent = fs.readFileSync(path.join(__dirname, '..', 'ui.js'), 'utf-8');

    // As per the project memory: "Node utility scripts cannot natively import project configuration files...
    // Parsing the file contents as strings using Regex, eval(), or stripping exports for new Function() is a required workaround for standalone script execution."
    // We will use the simplest regex to strip exports from the specific function, but only extract what we need.
    const match = uiContent.match(/export function showModal\s*\([^)]*\)\s*\{([\s\S]*?)\n\}/);
    if (!match) throw new Error("Could not find showModal function");

    // Extract the full function including the signature, but without export
    const startIndex = uiContent.indexOf('export function showModal');
    let firstBraceIndex = uiContent.indexOf('{', startIndex);
    let openBraces = 0;
    let endIndex = firstBraceIndex;

    for (let i = firstBraceIndex; i < uiContent.length; i++) {
        if (uiContent[i] === '{') openBraces++;
        if (uiContent[i] === '}') openBraces--;

        if (openBraces === 0) {
            endIndex = i + 1;
            break;
        }
    }

    const showModalString = uiContent.substring(startIndex, endIndex).replace('export ', '');

    const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`, { runScripts: "dangerously" });
    window = dom.window;

    global.window = window;
    global.document = window.document;
    document = window.document;

    // Attach the function to global context
    const fn = new Function('title', 'htmlContent', 'windowId', 'width', 'height', `
        ${showModalString}
        return showModal(title, htmlContent, windowId, width, height);
    `);

    showModal = fn;
});

test.describe('showModal function unit tests', () => {
    let mockWindowManager;

    test.beforeEach(() => {
        document.body.innerHTML = '';
        mockWindowManager = {
            createDynamicWindow: () => {}
        };
        window.windowManager = mockWindowManager;
    });

    test('extracts function successfully', () => {
        expect(typeof showModal).toBe('function');
    });

    test('calls windowManager.createDynamicWindow with default args', () => {
        let createCalled = false;
        let createArgs = [];
        window.windowManager.createDynamicWindow = (...args) => {
            createCalled = true;
            createArgs = args;
        };

        showModal('Test Title', '<p>Test Content</p>');

        expect(createCalled).toBe(true);
        expect(createArgs).toEqual(['dynamic-modal', 'Test Title', '<p>Test Content</p>', '800px', 'auto']);
    });

    test('does nothing if window.windowManager is undefined', () => {
        window.windowManager = undefined;
        expect(() => showModal('Test Title', '<p>Test Content</p>')).not.toThrow();
    });

    test('handles windowId === "window-map" and updates DOM elements if they exist', () => {
        let createCalled = false;
        window.windowManager.createDynamicWindow = () => { createCalled = true; };

        document.body.innerHTML = `
            <div id="window-map">
                <div class="content-panel"></div>
                <div class="window-content-scaler"></div>
            </div>
        `;

        showModal('Map View', '<div>Map</div>', 'window-map', '1000px', '600px');

        expect(createCalled).toBe(true);

        const winEl = document.getElementById('window-map');
        expect(winEl.style.width).toBe('1000px');
        expect(winEl.style.height).toBe('auto');

        const contentPanel = winEl.querySelector('.content-panel');
        expect(contentPanel.style.padding).toBe('0px');
        expect(contentPanel.style.overflow).toBe('hidden');

        const scaler = winEl.querySelector('.window-content-scaler');
        expect(scaler.style.height).toBe('100%');
        expect(scaler.style.width).toBe('100%');
    });

    test('handles windowId === "window-map" gracefully if child elements are missing', () => {
        let createCalled = false;
        window.windowManager.createDynamicWindow = () => { createCalled = true; };

        document.body.innerHTML = `
            <div id="window-map"></div>
        `;

        expect(() => showModal('Map View', '<div>Map</div>', 'window-map', '1000px', '600px')).not.toThrow();
        expect(createCalled).toBe(true);

        const winEl = document.getElementById('window-map');
        expect(winEl.style.width).toBe('1000px');
        expect(winEl.style.height).toBe('auto');
    });

    test('handles windowId === "window-map" gracefully if window element is missing', () => {
        let createCalled = false;
        window.windowManager.createDynamicWindow = () => { createCalled = true; };

        document.body.innerHTML = '';

        expect(() => showModal('Map View', '<div>Map</div>', 'window-map', '1000px', '600px')).not.toThrow();
        expect(createCalled).toBe(true);
    });
});
