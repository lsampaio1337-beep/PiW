const fs = require('fs');

let content = fs.readFileSync('src/ui/pokedex.js', 'utf8');

const regex = /export function getSpeciesDataHtml[\s\S]*$/;

const replacement = `export function getSpeciesDataHtml(pData, state) {
    const bst = pData.hp + pData.atk + pData.def + pData.spa + pData.spd + pData.spe;

    // Calculate Type Effectiveness
    const tConfig = state.config.types;
    let defMatchups = {};
    let offMatchups = {};

    // Defending Matchups
    for (const atkType in tConfig) {
        let multiplier = 1;
        for (const defType of pData.types) {
            if (tConfig[atkType] && tConfig[atkType][defType] !== undefined) {
                multiplier *= tConfig[atkType][defType];
            }
        }
        if (multiplier !== 1) defMatchups[atkType] = multiplier;
    }

    // Attacking Matchups
    for (const defType in tConfig) {
        let maxMult = 0;
        for (const atkType of pData.types) {
            let m = 1;
            if (tConfig[atkType] && tConfig[atkType][defType] !== undefined) {
                m = tConfig[atkType][defType];
            }
            if (m > maxMult) maxMult = m;
        }
        if (maxMult !== 1) offMatchups[defType] = maxMult;
    }

    const def4x = {}, def2x = {}, def05x = {}, def025x = {}, def0x = {};
    for (const t in defMatchups) {
        if (defMatchups[t] === 4) def4x[t] = 4;
        else if (defMatchups[t] === 2) def2x[t] = 2;
        else if (defMatchups[t] === 0.5) def05x[t] = 0.5;
        else if (defMatchups[t] === 0.25) def025x[t] = 0.25;
        else if (defMatchups[t] === 0) def0x[t] = 0;
    }

    const off2x = {}, off05x = {}, off0x = {};
    for (const t in offMatchups) {
        if (offMatchups[t] === 2) off2x[t] = 2;
        else if (offMatchups[t] === 0.5) off05x[t] = 0.5;
        else if (offMatchups[t] === 0) off0x[t] = 0;
    }

    let movesHtml = \`
        <table style="width: 100%; text-align: left; font-size: 14px; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #fff;">
                <th style="padding-bottom: 5px;">Lvl</th>
                <th style="padding-bottom: 5px;">Move</th>
                <th style="padding-bottom: 5px;">Type</th>
                <th style="padding-bottom: 5px;">Pwr</th>
                <th style="padding-bottom: 5px;">Cat</th>
            </tr>
    \`;
    if (pData.learnset) {
        pData.learnset.forEach(m => {
            let mData = state.config.moves[m.move];
            movesHtml += \`<tr style="border-bottom: 1px solid #444;">
                <td>\${m.level}</td>
                <td>\${m.move}</td>
                <td>\${mData ? formatType(mData.type) : '?'}</td>
                <td>\${mData ? mData.power : '?'}</td>
                <td>\${mData ? mData.category : '?'}</td>
            </tr>\`;
        });
    }
    movesHtml += \`</table>\`;

    return \`
        <p><b>BST:</b> \${bst} (HP:\${pData.hp} | Speed:\${pData.spe} | Atk:\${pData.atk} | SpAtk:\${pData.spa} | Def:\${pData.def} | SpDef:\${pData.spd})</p>

        <div style="text-align: left; margin: 15px 0; font-size: 14px; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 5px;">
            <h4 style="margin: 0 0 5px 0;">Defensive Effectiveness</h4>
            \${Object.keys(def4x).length ? \`<b>Very Weak To (4x):</b> \${formatTypes(def4x)}<br>\` : ''}
            \${Object.keys(def2x).length ? \`<b>Weak To (2x):</b> \${formatTypes(def2x)}<br>\` : ''}
            \${Object.keys(def05x).length ? \`<b>Resists (0.5x):</b> \${formatTypes(def05x)}<br>\` : ''}
            \${Object.keys(def025x).length ? \`<b>Strongly Resists (0.25x):</b> \${formatTypes(def025x)}<br>\` : ''}
            \${Object.keys(def0x).length ? \`<b>Immune To (0x):</b> \${formatTypes(def0x)}<br>\` : ''}

            <h4 style="margin: 10px 0 5px 0;">Offensive Effectiveness</h4>
            \${Object.keys(off2x).length ? \`<b>Super Effective (2x):</b> \${formatTypes(off2x)}<br>\` : ''}
            \${Object.keys(off05x).length ? \`<b>Not Very Effective (0.5x):</b> \${formatTypes(off05x)}<br>\` : ''}
            \${Object.keys(off0x).length ? \`<b>No Effect (0x):</b> \${formatTypes(off0x)}<br>\` : ''}
        </div>

        <h4 style="text-align: left;">Moveset</h4>
        \${movesHtml}
    \`;
}
`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/ui/pokedex.js', content);
