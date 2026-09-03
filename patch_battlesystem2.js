const fs = require('fs');
let content = fs.readFileSync('src/battleSystem.js', 'utf8');

const catchBlockOld = `                if (!this.state.stats.caughtSpecific) this.state.stats.caughtSpecific = {};
                if (this.activeEncounter.types) {
                     for (let t of this.activeEncounter.types) {
                          this.state.stats.caughtSpecific[t] = (this.state.stats.caughtSpecific[t] || 0) + 1;
                     }
                }`;

const catchBlockNew = `                if (!this.state.stats.caughtSpecific) this.state.stats.caughtSpecific = {};
                if (!this.state.stats.challengeCaughtSpecific) this.state.stats.challengeCaughtSpecific = {};

                let qName = this.activeEncounter.qualityName || "Regular";

                if (this.activeEncounter.types) {
                      for (let t of this.activeEncounter.types) {
                          this.state.stats.caughtSpecific[t] = (this.state.stats.caughtSpecific[t] || 0) + 1;
                          let typeRarityKey = t + "_" + qName;
                          let typeAnyKey = t + "_Any";
                          this.state.stats.challengeCaughtSpecific[typeRarityKey] = (this.state.stats.challengeCaughtSpecific[typeRarityKey] || 0) + 1;
                          this.state.stats.challengeCaughtSpecific[typeAnyKey] = (this.state.stats.challengeCaughtSpecific[typeAnyKey] || 0) + 1;
                      }
                }

                let speciesRarityKey = this.activeEncounter.name + "_" + qName;
                this.state.stats.challengeCaughtSpecific[speciesRarityKey] = (this.state.stats.challengeCaughtSpecific[speciesRarityKey] || 0) + 1;
`;

content = content.replace(catchBlockOld, catchBlockNew);
fs.writeFileSync('src/battleSystem.js', content);
