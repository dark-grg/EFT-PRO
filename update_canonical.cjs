const fs = require('fs');
const file = 'src/services/progression/CanonicalDatabase.ts';
let code = fs.readFileSync(file, 'utf-8');

code = code.replace(
  "import data from '../../data/progressions_efootball_2025_v1.json';", 
  "import data from '../../data/playerProgressions.json';"
);

code = code.replace(
  "return data as ProgressionRecordV2[];",
  "return (data as any).records ? Object.values((data as any).records) : [];"
);

fs.writeFileSync(file, code);
