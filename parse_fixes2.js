// Wait, is Hoenn 33-40? I don't know the exact order.
// Let's look at map.js and how it handles badges, maybe there's an easier way!
// map.js manually queries window.getBadgeFileName('Region', number) for each gym.
// Does the badge array have a flat gym configuration somewhere? Yes, `config/gyms.js`.
// And in battleSystem.js:
// const gymIndex = this.state.config.gyms.findIndex(g => g.name === gym.name);
// So gymIndex ALWAYS corresponds to the index in config/gyms.js!

// But what if it's NOT in config/gyms.js yet? (e.g. Hoenn). Then it's -1.
// So the function above mapping gymIndex is safe!
