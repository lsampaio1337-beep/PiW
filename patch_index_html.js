const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const search = `      <div id="view-safari-hub" class="game-view" style="display:none; background: url('Assets/BG/SafariZone.png') no-repeat center center; background-size: 100% 100%; width: 100%; height: 100%; position: relative;">
        <div style="position: absolute; top: 30%; left: 50%; transform: translateX(-50%); text-align: center; color: white; background: rgba(0,0,0,0.8); padding: 20px; border-radius: 10px; font-size: 20px; width: 60%; font-family: monospace;">
          <p id="safari-welcome-msg">Welcome to Safari Zone! Here we charge a fee of $500 per battle you have and you can use our SafariBalls at will.<br><br>Do you wanna enter Safari Zone?</p>
          <button id="btn-enter-safari" style="margin-top: 20px; padding: 10px 20px; font-size: 18px; cursor: pointer; background: #ffcc00; border: none; border-radius: 5px; color: black; font-weight: bold;">Enter ($500)</button>
        </div>
      </div>

      <!-- View 2: Battle Arena -->`;

const replace = `      <!-- View 2: Battle Arena -->`;

if (code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync('index.html', code);
    console.log("Replaced successfully (Safari)!");
} else {
    console.log("Search string not found (Safari)!");
}
