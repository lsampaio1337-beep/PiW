import { getChallengeData } from './src/ui/topbar.js';
import { unlocks } from './config/routes.js';
import { state } from './src/state.js';

for (let unlock of unlocks) {
    let result = getChallengeData(unlock);
    console.log(result.textParts.join(" && "));
}
