const fs = require('fs');
const file = 'src/pages/OwnerPlayerDevelopments.tsx';
let code = fs.readFileSync(file, 'utf-8');

// We need to fetch the new dashboard data instead of the old MultiSourceMerger stuff.
// Actually, since I have full control, I can write a script to replace the component.
