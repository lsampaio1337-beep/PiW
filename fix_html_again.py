import re

html = open("index.html").read()

new_main_control = """
  <div id="main-control-window" class="floating-window" style="display: none; width: auto; height: auto; overflow: visible; background-color: #34495e; border: 2px solid #1abc9c; border-radius: 10px; box-sizing: border-box; resize: none; min-width: 0;">
    <div id="main-control-header" class="window-header" style="position: relative; display: flex; justify-content: center; align-items: center; padding: 5px; cursor: move; height: 30px;">
      <span id="main-control-title" style="flex-grow: 1; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Main Control</span>
      <div style="position: absolute; right: 5px; top: 5px; display: flex; gap: 5px; z-index: 10;">
        <span id="btn-minimize-main-control" style="cursor: pointer; color: white; font-weight: bold; padding: 0 5px; font-size: 12px; line-height: 1;">-</span>
        <span id="btn-minimize-all-game" style="cursor: pointer; color: white; font-weight: bold; padding: 0 5px; font-size: 12px; line-height: 1;">--</span>
        <span class="btn-exit-game" style="cursor: pointer; color: white; font-weight: bold; padding: 0 5px; font-size: 12px; line-height: 1;">X</span>
      </div>
    </div>
    <div class="window-content-container" style="padding: 0; margin: 0; display: flex; width: 100%; height: auto;">
        <div class="window-content-scaler" style="display: flex; width: 100%; height: 100%; position: relative; transform-origin: top left;">
            <div id="main-control" style="display: flex; align-items: center; padding: 10px; gap: 10px; width: 100%; box-sizing: border-box;">
                <img src="Assets/Extra/IconMainView.png" id="btn-toggle-main" class="nav-icon" title="Main View">
                <img src="Assets/Extra/IconTeam.png" id="btn-toggle-party" class="nav-icon" title="Team">

                <span class="nav-divider"></span>

                <div style="position: relative; display: inline-block; height: 100%;">
                    <img src="Assets/Extra/IconMap.png" id="btn-map" class="nav-icon" title="Map" style="display: block;">
                    <img src="Assets/Extra/ExclamationMark.png" id="map-notification" style="display: none; position: absolute; top: -5px; right: -5px; width: 15px; height: auto; pointer-events: none; z-index: 10;">
                </div>

                <img src="Assets/Extra/IconBackpack.png" id="btn-backpack" class="nav-icon" title="Backpack">
                <img src="Assets/Extra/IconPokedex.png" id="btn-dex" class="nav-icon" title="Pokedex">
                <img src="Assets/Extra/IconTrainer.png" id="btn-stats" class="nav-icon" title="Trainer">

                <div id="multiplayer-container" style="position: relative; display: none; height: 100%;">
                    <img src="Assets/Extra/IconMultiplayer.png" id="btn-multiplayer" class="nav-icon" title="Multiplayer">
                    <img src="Assets/Extra/ExclamationMark.png" id="multiplayer-exclamation" style="position: absolute; top: -5px; right: -5px; width: 15px; height: auto; display: none; pointer-events: none; z-index: 10;">
                </div>

                <span class="nav-divider"></span>

                <div id="bonus-candy-container" style="position: relative; display: none; height: 100%;">
                    <img src="Assets/Extra/BonusCandy.png" id="btn-bonus-candy" class="nav-icon" title="Bonus Candy">
                    <img src="Assets/Extra/ExclamationMark.png" id="bonus-candy-exclamation" style="position: absolute; top: -5px; right: -5px; width: 15px; height: auto; display: none; pointer-events: none; z-index: 10;">
                </div>

                <div id="gift-container" style="position: relative; display: none; height: 100%;">
                    <img src="Assets/Extra/IconGift.png" id="btn-gift" class="nav-icon" title="Gift" style="display: block;">
                    <img src="Assets/Extra/ExclamationMark.png" id="gift-notification" style="display: none; position: absolute; top: -5px; right: -5px; width: 15px; height: auto; pointer-events: none; z-index: 10;">
                </div>

                <div style="position: relative; display: inline-block; height: 100%;">
                    <img src="Assets/Extra/IconCalendar.png" id="btn-calendar" class="nav-icon" title="Daily Calendar" style="display: block;">
                    <img src="Assets/Extra/ExclamationMark.png" id="calendar-notification" style="display: none; position: absolute; top: -5px; right: -5px; width: 15px; height: auto; pointer-events: none; z-index: 10;">
                </div>

                <div style="position: relative; display: inline-block; height: 100%;">
                    <img src="Assets/Extra/ProgressChallange.png" id="btn-challenges" class="nav-icon" title="Progress Challenges" style="display: block;">
                    <img src="Assets/Extra/ExclamationMark.png" id="challenges-notification" style="display: none; position: absolute; top: -5px; right: -5px; width: 15px; height: auto; pointer-events: none; z-index: 10;">
                </div>

                <span class="nav-divider"></span>

                <div id="sleep-container" style="position: relative; display: none; height: 100%;">
                    <img src="Assets/Extra/IconSleep.png" id="btn-sleep" class="nav-icon" title="ZzZ Mode" style="display: block; width: 100%; height: 100%;">
                    <img src="Assets/Extra/ExclamationMark.png" id="sleep-notification" style="display: none; position: absolute; top: -5px; right: -5px; width: 15px; height: auto; pointer-events: none; z-index: 10;">
                </div>

                <img src="Assets/Extra/IconHelp.png" id="btn-help" class="nav-icon" title="Help">
                <img src="Assets/Extra/IconSettings.png" id="btn-settings" class="nav-icon" title="Settings">
                <img src="Assets/Extra/IconExit.png" id="btn-exit" class="nav-icon" title="Exit">
            </div>
        </div>
        <div class="window-resize-handle"></div>
    </div>
  </div>
"""

start = html.find('<div id="top-bar-window"')
end = html.find('<!-- Right Column (Modals/Overlays for Map, Backpack, etc) -->')
# wait, wait! The original index.html had <div id="top-bar-window"...> and then <!-- Right Column (Modals/Overlays for Map, Backpack, etc) --> was WAY down.
# No, let's look at the original index.html
