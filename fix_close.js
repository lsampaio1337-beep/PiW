// Ah, the code reviewer is absolutely right!
// `onclick="document.getElementById('trainer-stats-inner-modal').style.display='none'"`
// gets stripped by safeSetHTML or _executeInlineEvent!
// We must add a proper function `window.closeTrainerInnerModal` and add it to `allowedFuncs`.
