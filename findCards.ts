import fs from 'fs';

const cards = JSON.parse(fs.readFileSync('./src/data/efhubCards.json', 'utf8'));

const targets = [
  "Nagatomo",
  "Pedri",
  "Agüero",
  "Araújo",
  "Cristiano Ronaldo",
  "Calafiori",
  "Zanetti",
  "Suárez",
  "Sneijder",
  "Rui Costa",
  "Eto'o",
  "Mahrez",
  "Neymar",
  "Maradona",
  "Élber",
  "Rodri"
];

for (const t of targets) {
  const matches = cards.filter((c: any) => 
    c.playerName.toLowerCase().includes(t.toLowerCase()) ||
    c.cardName.toLowerCase().includes(t.toLowerCase())
  );
  console.log(`=== Matches for ${t} (${matches.length}) ===`);
  matches.forEach((m: any) => {
    console.log(`ID: ${m.cardId} | Name: ${m.playerName} | CardName: ${m.cardName} | MaxLevel: ${m.maxLevel}`);
  });
}
