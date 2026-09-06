<<<<<<< SEARCH
    handleEnemyDefeat() {
        const leader = this.state.party[0];
        const ev = this.activeEncounter.ev;

        // Bonus Candy Defeats Tracker
=======
    handleEnemyDefeat() {
        const leader = this.state.party[0];
        const ev = this.activeEncounter.ev;

        if (typeof window.triggerDefeatAnimation === 'function') {
            window.triggerDefeatAnimation(this.activeEncounter);
        }

        // Bonus Candy Defeats Tracker
>>>>>>> REPLACE
