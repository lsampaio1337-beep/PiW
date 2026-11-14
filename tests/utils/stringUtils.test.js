import { escapeHTML } from '../../src/utils/stringUtils.js';

describe('stringUtils - escapeHTML', () => {
    test('returns empty string for null and undefined', () => {
        expect(escapeHTML(null)).toBe('');
        expect(escapeHTML(undefined)).toBe('');
    });

    test('converts numbers to strings', () => {
        expect(escapeHTML(0)).toBe('0');
        expect(escapeHTML(42)).toBe('42');
        expect(escapeHTML(-3.14)).toBe('-3.14');
    });

    test('escapes &, <, >, ", and \' characters', () => {
        expect(escapeHTML('&')).toBe('&amp;');
        expect(escapeHTML('<')).toBe('&lt;');
        expect(escapeHTML('>')).toBe('&gt;');
        expect(escapeHTML('"')).toBe('&quot;');
        expect(escapeHTML("'")).toBe('&#039;');
    });

    test('escapes combined HTML and XSS payloads safely', () => {
        expect(escapeHTML(`<img src="x" onerror='alert("1 & 2")'>`)).toBe(
            '&lt;img src=&quot;x&quot; onerror=&#039;alert(&quot;1 &amp; 2&quot;)&#039;&gt;'
        );
    });

    test('leaves plain safe strings unchanged', () => {
        expect(escapeHTML('Pikachu #025')).toBe('Pikachu #025');
        expect(escapeHTML('')).toBe('');
    });
});
