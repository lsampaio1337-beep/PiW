import re

with open('src/ui/gift.js', 'r') as f:
    content = f.read()

# Replace in pending gifts
pending_search = """const badgeNum = state.currentRegionName === 'Johto' ? (gift.gymIndex > 8 ? gift.gymIndex - 8 : gift.gymIndex + 9) : gift.gymIndex + 1;
                html += `
                    <div onclick="window.claimPendingGift(${index})" style="cursor: pointer; padding: 10px; border: 1px solid #ccc; border-radius: 5px; background: rgba(0,0,0,0.5); transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(0,0,0,0.5)'">
                        <img src="./Assets/Gym/Badges/${window.getBadgeFileName(state.currentRegionName || 'Kanto', badgeNum)}" style="width: 50px; height: 50px;" title="${gift.gymName} Badge">"""

pending_replace = """const badgeInfo = window.getGlobalBadgeInfo(gift.gymIndex);
                html += `
                    <div onclick="window.claimPendingGift(${index})" style="cursor: pointer; padding: 10px; border: 1px solid #ccc; border-radius: 5px; background: rgba(0,0,0,0.5); transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(0,0,0,0.5)'">
                        <img src="./Assets/Gym/Badges/${window.getBadgeFileName(badgeInfo.region, badgeInfo.number)}" style="width: 50px; height: 50px;" title="${gift.gymName} Badge">"""

content = content.replace(pending_search, pending_replace)

# Replace in claimed gifts
claimed_search = """const badgeNum = state.currentRegionName === 'Johto' ? (gift.gymIndex > 8 ? gift.gymIndex - 8 : gift.gymIndex + 9) : gift.gymIndex + 1;
                html += `
                    <div style="padding: 10px; border: 1px solid #444; border-radius: 5px; background: rgba(0,0,0,0.2);">
                        <img src="./Assets/Gym/Badges/${window.getBadgeFileName(state.currentRegionName || 'Kanto', badgeNum)}" style="width: 50px; height: 50px; filter: drop-shadow(0 0 5px gold);" title="${gift.gymName ? gift.gymName + ' Badge' : 'Badge'}">"""

claimed_replace = """const badgeInfo = window.getGlobalBadgeInfo(gift.gymIndex);
                html += `
                    <div style="padding: 10px; border: 1px solid #444; border-radius: 5px; background: rgba(0,0,0,0.2);">
                        <img src="./Assets/Gym/Badges/${window.getBadgeFileName(badgeInfo.region, badgeInfo.number)}" style="width: 50px; height: 50px; filter: drop-shadow(0 0 5px gold);" title="${gift.gymName ? gift.gymName + ' Badge' : 'Badge'}">"""

content = content.replace(claimed_search, claimed_replace)

with open('src/ui/gift.js', 'w') as f:
    f.write(content)
