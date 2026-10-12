import re

with open('src/ui.js', 'r') as f:
    content = f.read()

search = """            let zzzIconHtml = pData.isZzZMode ? `<img src="Assets/Extra/IconSleep.png" style="height: 100%; max-height: 60px; margin-left: 10px;" title="ZzZ Mode Active">` : '';

            btn.innerHTML = `
                <div style="flex-grow: 1; display: flex; flex-direction: column; justify-content: center;">
                    <div style="font-size: 18px; margin-bottom: 5px; font-weight: bold; display: flex; align-items: center;">
                        "${profileName}" - ${playtimeStr}
                    </div>
                    <div style="font-size: 14px; font-weight: normal;">Last Played: ${lastPlayedStr}</div>
                    <div style="font-size: 14px; font-weight: normal;">Progress: ${lastRoute}${zzzText}</div>
                </div>
                ${zzzIconHtml}
            `;"""

replace = """            const innerDiv = document.createElement('div');
            innerDiv.style.flexGrow = "1";
            innerDiv.style.display = "flex";
            innerDiv.style.flexDirection = "column";
            innerDiv.style.justifyContent = "center";

            const titleDiv = document.createElement('div');
            titleDiv.style.fontSize = "18px";
            titleDiv.style.marginBottom = "5px";
            titleDiv.style.fontWeight = "bold";
            titleDiv.style.display = "flex";
            titleDiv.style.alignItems = "center";
            titleDiv.textContent = `"${profileName}" - ${playtimeStr}`;

            const playedDiv = document.createElement('div');
            playedDiv.style.fontSize = "14px";
            playedDiv.style.fontWeight = "normal";
            playedDiv.textContent = `Last Played: ${lastPlayedStr}`;

            const progressDiv = document.createElement('div');
            progressDiv.style.fontSize = "14px";
            progressDiv.style.fontWeight = "normal";
            progressDiv.textContent = `Progress: ${lastRoute}${zzzText}`;

            innerDiv.appendChild(titleDiv);
            innerDiv.appendChild(playedDiv);
            innerDiv.appendChild(progressDiv);

            btn.appendChild(innerDiv);

            if (pData.isZzZMode) {
                const sleepImg = document.createElement('img');
                sleepImg.src = "Assets/Extra/IconSleep.png";
                sleepImg.style.height = "100%";
                sleepImg.style.maxHeight = "60px";
                sleepImg.style.marginLeft = "10px";
                sleepImg.title = "ZzZ Mode Active";
                btn.appendChild(sleepImg);
            }"""

if search in content:
    content = content.replace(search, replace)
    with open('src/ui.js', 'w') as f:
        f.write(content)
    print("Success")
else:
    print("Search block not found")
