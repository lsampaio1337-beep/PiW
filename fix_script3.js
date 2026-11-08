const fs = require('fs');

// Ah, the old routes in the repo were "Extra Challenge Z01" up to "Extra Challenge Z09"
// I wrote a regex for "Extra Challenge Z[1-9]", which missed "Z01" through "Z09".
// Wait, my replacement script added a NEW set of Z01 to Z07, which means there are duplicates!

// Let's reset the file and do the replacement correctly from the pristine base.
