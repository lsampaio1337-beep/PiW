// Wait! What if we use config.gyms array to dynamically look up the gym name?
// Oh, but window doesn't have access to state.config in ui.js cleanly?
// It DOES! `state.config.gyms` is available!
// Wait! `gift.gymName` is available in `gift` object directly!
// `{ type: 'badge', gymName: gym.name, gymIndex: gymIndex }`
// The `gift` object has `gymName`!!
// We can just find the correct badge by name!
// BUT we only have region and number for the badge filename getter (`getBadgeFileName(region, number)`).
