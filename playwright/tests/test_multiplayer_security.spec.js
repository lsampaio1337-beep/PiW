const { test, expect } = require('@playwright/test');

test.describe('Multiplayer Security - safeDecode', () => {
    test.beforeEach(async ({ page }) => {
        // Create a blank HTML file and serve it or use page.goto('http://localhost:8080/blank.html') if available
        // Wait, memory says: "When using Playwright to test frontend ES modules (which fail to import in the CommonJS Node environment), serve a blank HTML page (e.g., blank_test.html) via the local server and use page.evaluate() to dynamically import and test the module in the browser context."

        await page.goto('http://localhost:8080/index.html');
        // Let's just create a blank file on the server.
    });

    test('safeDecode rejects invalid payloads and accepts valid ones', async ({ page }) => {
        const results = await page.evaluate(async () => {
            const module = await import('./src/ui/multiplayer.js');

            // To test safeDecode, we need to extract it or test it via its effects.
            // Since safeDecode is not exported, we can test it through joinGame or completeConnection

            // Mock RTCPeerConnection and RTCSessionDescription to avoid actual networking
            window.RTCPeerConnection = class {
                constructor() {}
                setRemoteDescription() { return Promise.resolve(); }
                createAnswer() { return Promise.resolve({ type: 'answer', sdp: 'fake_sdp' }); }
                setLocalDescription() { return Promise.resolve(); }
                close() {}
            };

            window.RTCSessionDescription = class {
                constructor(init) {
                    this.type = init.type;
                    this.sdp = init.sdp;
                }
            };

            const results = {
                valid: false,
                invalidJson: false,
                invalidSchemaType: false,
                invalidSchemaSdp: false,
                maliciousProps: false
            };

            function encodeForTest(obj) {
                const bytes = new TextEncoder().encode(JSON.stringify(obj));
                const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join("");
                return btoa(binString);
            }

            // 1. Valid Payload
            const validPayload = encodeForTest({ type: 'offer', sdp: 'v=0\r\no=alice 2890844526 2890844526 IN IP4 host.anywhere.com\r\n' });
            try {
                await module.joinGame(validPayload);
                results.valid = true;
            } catch (e) {
                console.error("Valid payload failed:", e);
            }

            // 2. Invalid JSON Payload
            const invalidJson = btoa("this is not json");
            // Since we added an alert in joinGame catch, let's mock alert
            const originalAlert = window.alert;
            let alertCalled = false;
            window.alert = () => { alertCalled = true; };

            try {
                await module.joinGame(invalidJson);
                results.invalidJson = alertCalled;
            } catch (e) {}

            alertCalled = false;

            // 3. Invalid Schema - missing type
            const invalidType = encodeForTest({ sdp: 'v=0\r\n' });
            try {
                await module.joinGame(invalidType);
                results.invalidSchemaType = alertCalled;
            } catch (e) {}

            alertCalled = false;

            // 4. Invalid Schema - invalid sdp type
            const invalidSdp = encodeForTest({ type: 'offer', sdp: 12345 });
            try {
                await module.joinGame(invalidSdp);
                results.invalidSchemaSdp = alertCalled;
            } catch (e) {}

            alertCalled = false;

            // 5. Malicious Properties stripping
            // We can't directly check the stripping easily because safeDecode is internal,
            // but we can check if it throws for other reasons, or if we mock RTCSessionDescription
            // to check what is passed to it.
            let passedInit = null;
            window.RTCSessionDescription = class {
                constructor(init) {
                    passedInit = init;
                    this.type = init.type;
                    this.sdp = init.sdp;
                }
            };

            const maliciousPayload = encodeForTest({
                type: 'offer',
                sdp: 'v=0\r\n',
                __proto__: { polluded: true },
                malicious: "function() { alert('xss') }"
            });

            try {
                await module.joinGame(maliciousPayload);
                if (passedInit && passedInit.type === 'offer' && passedInit.sdp === 'v=0\r\n' && passedInit.malicious === undefined) {
                    results.maliciousProps = true;
                }
            } catch (e) {}

            window.alert = originalAlert;

            return results;
        });

        expect(results.valid).toBe(true);
        expect(results.invalidJson).toBe(true);
        expect(results.invalidSchemaType).toBe(true);
        expect(results.invalidSchemaSdp).toBe(true);
        expect(results.maliciousProps).toBe(true);
    });
});
