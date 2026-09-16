const { chromium } = require('playwright');
const fs = require('fs');

async function run() {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
    <style>
        body { background-color: #2c3e50; color: white; display: flex; flex-wrap: wrap; gap: 20px; padding: 20px; font-family: sans-serif; }
        .box { width: 200px; height: 300px; background-color: #34495e; border: 2px solid #1abc9c; border-radius: 8px; overflow-y: scroll; padding: 10px; }
        .content { height: 600px; }
        h3 { text-align: center; margin-top: 0; }

        /* Style 1: Thin solid cyan */
        .style1::-webkit-scrollbar { width: 8px; }
        .style1::-webkit-scrollbar-track { background: transparent; }
        .style1::-webkit-scrollbar-thumb { background: #1abc9c; border-radius: 4px; }

        /* Style 2: Thin cyan with border radius and transparent track */
        .style2::-webkit-scrollbar { width: 10px; }
        .style2::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 5px; }
        .style2::-webkit-scrollbar-thumb { background: #1abc9c; border-radius: 5px; }

        /* Style 3: Flat blocky cyan */
        .style3::-webkit-scrollbar { width: 12px; }
        .style3::-webkit-scrollbar-track { background: #2c3e50; border-left: 1px solid #1abc9c; }
        .style3::-webkit-scrollbar-thumb { background: #1abc9c; }

        /* Style 4: Minimalist thin cyan */
        .style4::-webkit-scrollbar { width: 4px; }
        .style4::-webkit-scrollbar-track { background: transparent; }
        .style4::-webkit-scrollbar-thumb { background: #1abc9c; border-radius: 2px; }

        /* Style 5: Cyan gradient */
        .style5::-webkit-scrollbar { width: 10px; }
        .style5::-webkit-scrollbar-track { background: transparent; }
        .style5::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #16a085, #1abc9c); border-radius: 5px; }

        /* Style 6: Neon Cyan (shadow) */
        .style6::-webkit-scrollbar { width: 10px; }
        .style6::-webkit-scrollbar-track { background: transparent; }
        .style6::-webkit-scrollbar-thumb { background: #1abc9c; border-radius: 5px; box-shadow: inset 0 0 5px rgba(255,255,255,0.5); }

        /* Style 7: Inset borders */
        .style7::-webkit-scrollbar { width: 12px; }
        .style7::-webkit-scrollbar-track { background: transparent; }
        .style7::-webkit-scrollbar-thumb { background: #1abc9c; border: 3px solid #34495e; border-radius: 8px; }

        /* Style 8: Hover focus effect */
        .style8::-webkit-scrollbar { width: 8px; }
        .style8::-webkit-scrollbar-track { background: transparent; }
        .style8::-webkit-scrollbar-thumb { background: rgba(26, 188, 156, 0.5); border-radius: 4px; }
        .style8:hover::-webkit-scrollbar-thumb { background: #1abc9c; }

        /* Style 9: Wide track, narrow thumb */
        .style9::-webkit-scrollbar { width: 16px; }
        .style9::-webkit-scrollbar-track { background: rgba(26, 188, 156, 0.1); border-radius: 8px; }
        .style9::-webkit-scrollbar-thumb { background: #1abc9c; border: 4px solid rgba(0,0,0,0); background-clip: padding-box; border-radius: 8px; }

        /* Style 10: Dashed/segmented (simulated with gradient) */
        .style10::-webkit-scrollbar { width: 10px; }
        .style10::-webkit-scrollbar-track { background: transparent; }
        .style10::-webkit-scrollbar-thumb { background: repeating-linear-gradient(45deg, #1abc9c, #1abc9c 5px, #16a085 5px, #16a085 10px); border-radius: 5px; }

    </style>
    </head>
    <body>
    `;

    let bodyContent = '';
    for (let i = 1; i <= 10; i++) {
        bodyContent += `
        <div>
            <h3>Style ${i}</h3>
            <div class="box style${i}">
                <div class="content">Scroll me down...<br><br><br><br>More content<br><br><br><br>End</div>
            </div>
        </div>
        `;
    }

    const htmlEnd = `</body></html>`;
    await page.setContent(htmlContent + bodyContent + htmlEnd);
    await page.screenshot({ path: 'scroll_variations.png' });
    await browser.close();
    console.log("Screenshot saved.");
}
run();
