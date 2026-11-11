const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const search = `      <!-- View 5: Casino Hub -->
      <div id="view-casino" class="game-view" style="display:none; background-image: url('./Assets/BG/Casino.png'); text-align: center; background-size: 100% 100%; height: 100%; position: relative;">
        <!-- Casino Content Container, so we can hide/show lobby vs specific background overlays -->
        <div id="casino-content" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
            <div id="casino-buttons-container" style="display: flex; flex-direction: row; gap: 10px;">
                <!-- Dynamically injected -->
            </div>
        </div>
      </div>

      <!-- View 6: Battle Stadium -->`;

const replace = `      <!-- View 6: Battle Stadium -->`;

if (code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync('index.html', code);
    console.log("Replaced successfully (Casino)!");
} else {
    console.log("Search string not found (Casino)!");
}
