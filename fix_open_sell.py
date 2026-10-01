import re

with open('src/ui/market.js', 'r') as f:
    content = f.read()

# Add the renderPokeMarketSellTab call to openPokeMarketSell
block_to_replace = """    if (overlay && title && content) {
        title.innerHTML = titleHtml;
        content.innerHTML = html;
        overlay.style.display = 'flex';
    } else {
        if (window.showModal) window.showModal('Sell', html, 'window-market-sell');

        const modalBox = document.getElementById('modal-content-box');
        if (modalBox) {
            modalBox.dataset.originalStyles = modalBox.getAttribute('style') || '';
            modalBox.style.width = 'max-content';
            modalBox.style.maxWidth = '95vw';
        }
    }"""

replacement = """    if (overlay && title && content) {
        title.innerHTML = titleHtml;
        content.innerHTML = html;
        overlay.style.display = 'flex';
    } else {
        if (window.showModal) window.showModal('Sell', html, 'window-market-sell');

        const modalBox = document.getElementById('modal-content-box');
        if (modalBox) {
            modalBox.dataset.originalStyles = modalBox.getAttribute('style') || '';
            modalBox.style.width = 'max-content';
            modalBox.style.maxWidth = '95vw';
        }
    }
    setTimeout(() => {
        if (window.renderPokeMarketSellTab) {
            window.renderPokeMarketSellTab(category || 'pokeballs');
        }
    }, 10);"""

content = content.replace("export function openPokeMarketSell() {", "export function openPokeMarketSell(category) {")
content = content.replace(block_to_replace, replacement)

# Replace the inner function calls in buttons for sell
content = content.replace("window.openPokeMarketSell()", "window.openPokeMarketSell('pokeballs')")


with open('src/ui/market.js', 'w') as f:
    f.write(content)
