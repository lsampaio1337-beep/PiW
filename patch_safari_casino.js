const fs = require('fs');
let code = fs.readFileSync('src/ui/map.js', 'utf8');

// Fix Safari Zone
let searchSafari = `        vGym.replaceChildren();
        vGym.style.position = "relative";
        vGym.style.height = "100%";
        vGym.style.width = "100%";
        vGym.style.backgroundImage = "url('Assets/BG/SafariZone.png')";
        vGym.style.backgroundSize = "contain";
        vGym.style.backgroundPosition = "center";
        vGym.style.backgroundRepeat = "no-repeat";
        vGym.style.backgroundColor = "black";

        const safariCost = state.config.balance.safariZonePrice || 500;
        const uiContainer = document.createElement('div');
        uiContainer.style.position = 'absolute';
        uiContainer.style.top = '30%';
        uiContainer.style.left = '50%';
        uiContainer.style.transform = 'translateX(-50%)';`;

let replaceSafari = `        vGym.replaceChildren();
        vGym.style.position = "relative";
        vGym.style.height = "100%";
        vGym.style.width = "100%";
        vGym.style.backgroundImage = "none";
        vGym.style.backgroundColor = "black";

        const flexContainer = document.createElement('div');
        flexContainer.style.width = '100%';
        flexContainer.style.height = '100%';
        flexContainer.style.display = 'flex';
        flexContainer.style.justifyContent = 'center';
        flexContainer.style.alignItems = 'center';
        flexContainer.style.position = 'relative';

        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        wrapper.style.maxWidth = '100%';
        wrapper.style.maxHeight = '100%';

        const imgEl = document.createElement('img');
        imgEl.src = "Assets/BG/SafariZone.png";
        imgEl.style.maxWidth = '100%';
        imgEl.style.maxHeight = '100%';
        imgEl.style.display = 'block';
        imgEl.style.objectFit = 'contain';

        wrapper.appendChild(imgEl);

        const overlayContainer = document.createElement('div');
        overlayContainer.style.position = 'absolute';
        overlayContainer.style.top = '0';
        overlayContainer.style.left = '0';
        overlayContainer.style.width = '100%';
        overlayContainer.style.height = '100%';

        const safariCost = state.config.balance.safariZonePrice || 500;
        const uiContainer = document.createElement('div');
        uiContainer.style.position = 'absolute';
        uiContainer.style.top = '30%';
        uiContainer.style.left = '50%';
        uiContainer.style.transform = 'translateX(-50%)';`;

code = code.replace(searchSafari, replaceSafari);

// Finish Safari
let searchSafariEnd = `        uiContainer.appendChild(msg);
        uiContainer.appendChild(btn);
        vGym.appendChild(uiContainer);

        const overlay = document.getElementById('map-inner-modal-overlay');`;

let replaceSafariEnd = `        uiContainer.appendChild(msg);
        uiContainer.appendChild(btn);

        overlayContainer.appendChild(uiContainer);
        wrapper.appendChild(overlayContainer);
        flexContainer.appendChild(wrapper);
        vGym.appendChild(flexContainer);

        const overlay = document.getElementById('map-inner-modal-overlay');`;

code = code.replace(searchSafariEnd, replaceSafariEnd);

// Fix Casino Hub (Celadon/Goldenrod)
let searchCasino = `        vGym.replaceChildren();
        vGym.style.position = "relative";
        vGym.style.height = "100%";
        vGym.style.width = "100%";
        vGym.style.backgroundImage = "url('./Assets/BG/Casino.png')";
        vGym.style.backgroundSize = "contain";
        vGym.style.backgroundPosition = "center";
        vGym.style.backgroundRepeat = "no-repeat";
        vGym.style.backgroundColor = "black";

        const completedChallenges = state.stats.completedChallengeIds || [];
        const isUnlockedByAreaId = (areaId) => completedChallenges.some(id => parseAreaNames(id).includes(areaId));

        let machinesHtml = \`
            <div style="position: absolute; top: 20px; left: 0; width: 100%; text-align: center; z-index: 10; color: white; text-shadow: 2px 2px 4px black; font-size: 24px;">
                <h3>Standard Route $\${state.config.balance.casinoPrices?.standard || 75} 2x Shiny $\${state.config.balance.casinoPrices?.doubleShiny || 200}</h3>
            </div>
            <div style="display: flex; justify-content: space-evenly; align-items: center; width: 100%; height: 100%; padding: 15px; box-sizing: border-box;">\`;`;

let replaceCasino = `        vGym.replaceChildren();
        vGym.style.position = "relative";
        vGym.style.height = "100%";
        vGym.style.width = "100%";
        vGym.style.backgroundImage = "none";
        vGym.style.backgroundColor = "black";

        const flexContainer = document.createElement('div');
        flexContainer.style.width = '100%';
        flexContainer.style.height = '100%';
        flexContainer.style.display = 'flex';
        flexContainer.style.justifyContent = 'center';
        flexContainer.style.alignItems = 'center';
        flexContainer.style.position = 'relative';

        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        wrapper.style.maxWidth = '100%';
        wrapper.style.maxHeight = '100%';

        const imgEl = document.createElement('img');
        imgEl.src = "./Assets/BG/Casino.png";
        imgEl.style.maxWidth = '100%';
        imgEl.style.maxHeight = '100%';
        imgEl.style.display = 'block';
        imgEl.style.objectFit = 'contain';

        wrapper.appendChild(imgEl);

        const completedChallenges = state.stats.completedChallengeIds || [];
        const isUnlockedByAreaId = (areaId) => completedChallenges.some(id => parseAreaNames(id).includes(areaId));

        let machinesHtml = \`
            <div style="position: absolute; top: 20px; left: 0; width: 100%; text-align: center; z-index: 10; color: white; text-shadow: 2px 2px 4px black; font-size: 24px;">
                <h3>Standard Route $\${state.config.balance.casinoPrices?.standard || 75} 2x Shiny $\${state.config.balance.casinoPrices?.doubleShiny || 200}</h3>
            </div>
            <div style="position: absolute; top: 0; left: 0; display: flex; justify-content: space-evenly; align-items: center; width: 100%; height: 100%; padding: 15px; box-sizing: border-box;">\`;`;

code = code.replace(searchCasino, replaceCasino);

// Finish Casino Hub
let searchCasinoEnd = `            machinesHtml += \`</div>\`;

            // Render it in inner modal instead of a view container
            const containerDiv = document.createElement('div');
            containerDiv.style.width = '100%';
            containerDiv.style.height = '100%';
            containerDiv.style.display = 'flex';
            containerDiv.style.flexDirection = 'column';
            containerDiv.innerHTML = machinesHtml;
            vGym.appendChild(containerDiv);`;

let replaceCasinoEnd = `            machinesHtml += \`</div>\`;

            const overlayContainer = document.createElement('div');
            overlayContainer.style.position = 'absolute';
            overlayContainer.style.top = '0';
            overlayContainer.style.left = '0';
            overlayContainer.style.width = '100%';
            overlayContainer.style.height = '100%';
            overlayContainer.innerHTML = machinesHtml;

            wrapper.appendChild(overlayContainer);
            flexContainer.appendChild(wrapper);
            vGym.appendChild(flexContainer);`;

code = code.replace(searchCasinoEnd, replaceCasinoEnd);

fs.writeFileSync('src/ui/map.js', code);
