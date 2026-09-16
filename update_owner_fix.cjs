const fs = require('fs');
const file = 'src/pages/OwnerPlayerDevelopments.tsx';
let code = fs.readFileSync(file, 'utf-8');

code = code.replace('playerCardDb.subscribe', 'playerCardDb.onCardsSnapshot');
code = code.replace('<ExactCardImage card={card} />', '<ExactCardImage cardId={card.id} alt={card.playerName} />');

fs.writeFileSync(file, code);
