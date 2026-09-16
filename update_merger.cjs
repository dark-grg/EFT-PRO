const fs = require('fs');
const path = require('path');
const mergerFile = path.join(__dirname, 'src/services/progression/MultiSourceMerger.ts');
let mergerCode = fs.readFileSync(mergerFile, 'utf-8');

mergerCode = mergerCode.replace(
  "progressionStatus: hasConflict ? 'CONFLICT' : 'SOURCE_ONLY',",
  `progressionStatus: hasConflict ? 'CONFLICT' : (validSources.length > 1 && confidence === 'EXACT' ? 'VERIFIED' : 'SOURCE_ONLY'),`
);

fs.writeFileSync(mergerFile, mergerCode);
