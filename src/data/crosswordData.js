const clean = value => value.toUpperCase().replace(/[^A-Z]/g, '');
const cellId = (r, c) => `${r}-${c}`;
const blockRow = size => '#'.repeat(size);

const FACTS = [
  ['MORDECAI', 'Regular Show blue jay who usually tries to be the responsible friend.', 'regular', 1],
  ['RIGBY', 'Regular Show raccoon whose bad ideas often start the chaos.', 'regular', 1],
  ['BENSON', 'Gumball-machine park boss from Regular Show.', 'regular', 1],
  ['SKIPS', 'Wise immortal park worker from Regular Show.', 'regular', 1],
  ['POPS', 'Gentle lollipop-shaped friend from Regular Show.', 'regular', 1],
  ['MUSCLEMAN', 'Regular Show character famous for loud my-mom jokes.', 'regular', 2],
  ['HIFIVEGHOST', 'Floating hand ghost from Regular Show.', 'regular', 2],
  ['MARGARET', 'Red robin coffee-shop worker Mordecai likes.', 'regular', 2],
  ['EILEEN', 'Mole character who is close to Rigby.', 'regular', 2],
  ['PARK', 'Workplace setting where Regular Show begins ordinary before turning cosmic.', 'regular', 1],
  ['FINN', 'Human hero from Adventure Time.', 'adventure', 1],
  ['JAKE', 'Stretchy magical dog from Adventure Time.', 'adventure', 1],
  ['BUBBLEGUM', 'Candy Kingdom princess from Adventure Time.', 'adventure', 2],
  ['MARCELINE', 'Vampire queen from Adventure Time.', 'adventure', 2],
  ['ICEKING', 'Crown-wearing lonely wizard from Adventure Time.', 'adventure', 2],
  ['BMO', 'Small living game console from Adventure Time.', 'adventure', 1],
  ['LICH', 'Ancient dark villain from Adventure Time.', 'adventure', 3],
  ['OOO', 'Land where Adventure Time takes place.', 'adventure', 2],
  ['GUMBALL', 'Blue cat from The Amazing World of Gumball.', 'gumball', 1],
  ['DARWIN', 'Orange fish brother from The Amazing World of Gumball.', 'gumball', 1],
  ['ANAIS', 'Young genius rabbit sibling in Gumball.', 'gumball', 2],
  ['NICOLE', 'Gumball mother with intense energy.', 'gumball', 2],
  ['RICHARD', 'Gumball father known for laziness and food.', 'gumball', 2],
  ['ELMORE', 'Town where The Amazing World of Gumball takes place.', 'gumball', 1],
  ['STEVEN', 'Young hero raised by the Crystal Gems.', 'steven', 1],
  ['GARNET', 'Crystal Gem with future vision.', 'steven', 2],
  ['AMETHYST', 'Purple Crystal Gem with wild energy.', 'steven', 2],
  ['PEARL', 'Precise spear-wielding Crystal Gem.', 'steven', 2],
  ['CONNIE', 'Steven Universe friend and sword trainee.', 'steven', 2],
  ['LION', 'Pink magical animal linked to Steven.', 'steven', 2],
  ['BLOSSOM', 'Powerpuff leader in pink.', 'powerpuff', 1],
  ['BUBBLES', 'Powerpuff sister in blue.', 'powerpuff', 1],
  ['BUTTERCUP', 'Powerpuff sister in green with tough attitude.', 'powerpuff', 1],
  ['MOJOJOJO', 'Powerpuff villain with a giant brain.', 'powerpuff', 2],
  ['PROFESSOR', 'Scientist father of the Powerpuff Girls.', 'powerpuff', 2],
  ['TOWNSVILLE', 'City protected by the Powerpuff Girls.', 'powerpuff', 2],
  ['DEXTER', 'Boy genius with a secret lab.', 'classic', 1],
  ['DEEDEE', 'Dexter sister who ruins lab experiments.', 'classic', 1],
  ['MANDARK', 'Dexter rival boy genius.', 'classic', 2],
  ['COURAGE', 'Pink dog protecting Muriel from strange threats.', 'classic', 1],
  ['MURIEL', 'Kind elderly owner of Courage.', 'classic', 2],
  ['EUSTACE', 'Grumpy farmer who scares Courage.', 'classic', 2],
  ['EDDY', 'Greedy schemer from Ed Edd n Eddy.', 'classic', 1],
  ['DOUBLEDEE', 'Smart hat-wearing Ed from Ed Edd n Eddy.', 'classic', 2],
  ['PLANK', 'Jonny imaginary wooden friend.', 'classic', 2],
  ['SAMURAIJACK', 'Time-displaced warrior trying to defeat Aku.', 'action', 1],
  ['AKU', 'Shape-shifting master of darkness from Samurai Jack.', 'action', 1],
  ['KATANA', 'Samurai Jack weapon type.', 'action', 2],
  ['BEN', 'Kid hero linked to alien transformations.', 'action', 1],
  ['GWEN', 'Ben cousin with magic and intelligence.', 'action', 1],
  ['KEVIN', 'Ben 10 rival turned ally with absorption powers.', 'action', 2],
  ['OMNITRIX', 'Watch-like device that lets Ben transform.', 'action', 1],
  ['HEATBLAST', 'Fire alien form from Ben 10.', 'action', 2],
  ['FOURARMS', 'Strong red four-armed Ben 10 alien.', 'action', 2],
  ['XLR8', 'Speed alien from Ben 10.', 'action', 2],
  ['ROBIN', 'Teen Titans leader.', 'action', 1],
  ['STARFIRE', 'Alien princess member of the Teen Titans.', 'action', 1],
  ['RAVEN', 'Dark magic Teen Titan with emotional control issues.', 'action', 1],
  ['CYBORG', 'Half-machine Teen Titan.', 'action', 1],
  ['BEASTBOY', 'Teen Titan who changes into animals.', 'action', 1],
  ['SLADE', 'Major Teen Titans villain.', 'action', 2],
  ['BATMAN', 'Gotham hero often in Cartoon Network action blocks.', 'action', 1],
  ['SUPERMAN', 'Metropolis hero with Kryptonian power.', 'action', 1],
  ['WONDERWOMAN', 'Amazon hero in Justice League stories.', 'action', 2],
  ['FLASH', 'Speedster from Justice League.', 'action', 1],
  ['GREENLANTERN', 'Ring-powered Justice League hero.', 'action', 2],
  ['HAWKGIRL', 'Winged mace fighter from Justice League.', 'action', 2],
  ['JOHNNYBRAVO', 'Muscle-bound blond cartoon character with big confidence.', 'classic', 1],
  ['CHOWDER', 'Young apprentice chef in a surreal food city.', 'classic', 1],
  ['SCHNITZEL', 'Rock monster chef who mostly says one word.', 'classic', 2],
  ['FLAPJACK', 'Sailor kid seeking adventure with a whale.', 'classic', 2],
  ['KNUCKLES', 'Captain mentor from The Marvelous Misadventures of Flapjack.', 'classic', 2],
  ['KND', 'Initials for Kids Next Door.', 'classic', 2],
  ['NUMBUHONE', 'Bald leader of Sector V.', 'classic', 2],
  ['GRIM', 'Reaper character forced to be friends with Billy and Mandy.', 'classic', 1],
  ['BILLY', 'Goofy kid paired with Mandy and Grim.', 'classic', 1],
  ['MANDY', 'Cold, bossy kid paired with Billy and Grim.', 'classic', 1],
  ['FOSTERS', 'Home for imaginary friends series shorthand.', 'classic', 2],
  ['BLOO', 'Blue imaginary friend with selfish energy.', 'classic', 1],
  ['MAC', 'Boy connected to Bloo in Foster home.', 'classic', 1],
  ['CRAIG', 'Creek kid whose adventures turn ordinary places epic.', 'modern', 1],
  ['KELSEY', 'Sword-carrying friend from Craig of the Creek.', 'modern', 2],
  ['JP', 'Tall gentle friend from Craig of the Creek.', 'modern', 2],
  ['GRIZZ', 'Leader bear from We Bare Bears.', 'modern', 1],
  ['PANDA', 'Phone-loving middle bear from We Bare Bears.', 'modern', 1],
  ['ICEBEAR', 'Quiet youngest bear who speaks in third person.', 'modern', 1],
  ['TULIP', 'Main passenger in Infinity Train season one.', 'modern', 2],
  ['ONION', 'Steven Universe quiet strange friend.', 'steven', 3],
  ['WIRT', 'Older brother lost in the Unknown.', 'modern', 2],
  ['GREG', 'Younger brother from Over the Garden Wall.', 'modern', 1],
  ['UNKNOWN', 'Mystery setting of Over the Garden Wall.', 'modern', 2],
  ['AQUATEEN', 'Adult Swim series with talking fast-food characters.', 'adult', 1],
  ['FRYLOCK', 'Floating fries who is usually the smartest Aqua Teen.', 'adult', 1],
  ['MEATWAD', 'Shapeshifting meatball from Aqua Teen.', 'adult', 1],
  ['SHAKE', 'Selfish talking milkshake from Aqua Teen.', 'adult', 1],
  ['CARL', 'Aqua Teen neighbor who suffers from their chaos.', 'adult', 1],
  ['MOONINITE', 'Pixel-styled alien type from Aqua Teen.', 'adult', 2],
  ['RABBOT', 'Robot rabbit from the first Aqua Teen episode.', 'adult', 2],
  ['RICK', 'Genius scientist grandfather in Rick and Morty.', 'adult', 1],
  ['MORTY', 'Nervous grandson in Rick and Morty.', 'adult', 1],
  ['PORTALGUN', 'Device Rick uses to move between places and dimensions.', 'adult', 2],
  ['BOONDOCKS', 'Adult animated series about the Freeman family in Woodcrest.', 'adult', 1],
  ['HUEY', 'Politically serious Freeman brother.', 'adult', 1],
  ['RILEY', 'Younger Freeman brother obsessed with street image.', 'adult', 1],
  ['RUCKUS', 'Boondocks character known for hateful rants.', 'adult', 2],
  ['WOODCREST', 'Suburb where the Freeman family lives.', 'adult', 1],
  ['HOMER', 'Springfield dad who works at the nuclear plant.', 'sitcom', 1],
  ['MARGE', 'Blue-haired Simpson mother.', 'sitcom', 1],
  ['BART', 'Skateboarding Simpson son.', 'sitcom', 1],
  ['LISA', 'Saxophone-playing Simpson daughter.', 'sitcom', 1],
  ['KRUSTY', 'Springfield TV clown.', 'sitcom', 2],
  ['BURNS', 'Springfield nuclear plant owner.', 'sitcom', 2],
  ['SMITHERS', 'Mr Burns loyal assistant.', 'sitcom', 2],
  ['PETER', 'Chaotic Griffin father.', 'sitcom', 1],
  ['LOIS', 'Griffin mother.', 'sitcom', 1],
  ['STEWIE', 'Brilliant Griffin baby.', 'sitcom', 1],
  ['BRIAN', 'Talking Griffin dog.', 'sitcom', 1],
  ['QUAHOG', 'Rhode Island town in Family Guy.', 'sitcom', 1],
  ['HANK', 'Propane salesman from Arlen.', 'sitcom', 1],
  ['PEGGY', 'Confident substitute teacher and Hank wife.', 'sitcom', 1],
  ['BOBBY', 'Hank and Peggy son who loves performance.', 'sitcom', 1],
  ['DALE', 'Conspiracy-minded exterminator from Arlen.', 'sitcom', 1],
  ['BOOMHAUER', 'Fast-talking neighbor from King of the Hill.', 'sitcom', 2],
  ['ARLEN', 'Texas town setting of King of the Hill.', 'sitcom', 1],
  ['SIMBA', 'Lion cub who becomes king.', 'disney', 1],
  ['ARIEL', 'Mermaid princess who wants the human world.', 'disney', 1],
  ['URSULA', 'Sea witch who makes a dangerous deal.', 'disney', 2],
  ['MULAN', 'Heroine who joins the army in disguise.', 'disney', 1],
  ['GENIE', 'Blue wish-granter from Aladdin.', 'disney', 1],
  ['JAFAR', 'Aladdin sorcerer villain.', 'disney', 2],
  ['YZMA', 'Emperor New Groove villain working with Kronk.', 'disney', 2],
  ['KRONK', 'Yzma henchman with a good heart.', 'disney', 2],
  ['MOANA', 'Wayfinder chosen by the ocean.', 'disney', 1],
  ['MAUI', 'Demigod with a magical hook.', 'disney', 1],
  ['STITCH', 'Alien also known as Experiment 626.', 'disney', 1],
  ['MIGUEL', 'Young musician from Coco.', 'disney', 1],
  ['COCO', 'Disney film tied to memory, family, and music.', 'disney', 1],
  ['ENCANTO', 'Disney film about the magical Madrigal family.', 'disney', 1],
  ['MIRABEL', 'Madrigal family member without a traditional gift.', 'disney', 1],
  ['SCAR', 'Lion King villain who takes the throne.', 'disney', 2],
  ['MALEFICENT', 'Villain who curses Aurora.', 'disney', 2],
  ['GHOSTFACE', 'Masked identity from Scream.', 'horror', 1],
  ['MICHAEL', 'First name of the Halloween slasher.', 'horror', 1],
  ['FREDDY', 'Dream-stalking Elm Street killer.', 'horror', 1],
  ['JASON', 'Hockey-mask slasher linked to Crystal Lake.', 'horror', 1],
  ['PINHEAD', 'Hellraiser icon tied to the puzzle box.', 'horror', 2],
  ['CANDYMAN', 'Mirror-summoned horror figure.', 'horror', 2],
  ['XENOMORPH', 'Alien franchise creature.', 'horror', 2],
  ['PREDATOR', 'Sci-fi hunter from the jungle action-horror series.', 'horror', 2],
  ['CHUCKY', 'Killer doll from Childs Play.', 'horror', 1],
  ['JIGSAW', 'Saw mastermind identity.', 'horror', 1],
  ['MIDSOMMAR', 'Daylight folk-horror title.', 'horror', 3],
  ['HEREDITARY', 'Family-trauma horror film by Ari Aster.', 'horror', 3],
  ['OMNITRIX', 'Ben 10 wrist device that unlocks alien forms.', 'objects', 1],
  ['KATANA', 'Blade associated with Samurai Jack.', 'objects', 1],
  ['CROWN', 'Magic object worn by Ice King.', 'objects', 2],
  ['PORTAL', 'Sci-fi doorway idea used across many action cartoons.', 'objects', 2],
  ['SWORD', 'Common action-cartoon hero weapon.', 'objects', 1],
  ['GEMS', 'Magical beings from Steven Universe.', 'objects', 1],
  ['LAB', 'Secret place where Dexter creates inventions.', 'objects', 1],
  ['PROPANE', 'Fuel Hank Hill sells.', 'objects', 1],
  ['SAXOPHONE', 'Instrument associated with Lisa Simpson.', 'objects', 1],
  ['PIZZA', 'Food that appears constantly in many cartoon hangout scenes.', 'objects', 1]
].map(([answer, clue, category, difficulty]) => ({ answer: clean(answer), clue, category, difficulty }));

const categoryNames = {
  regular: 'Regular Show', adventure: 'Adventure Time', gumball: 'Gumball', steven: 'Steven Universe', powerpuff: 'Powerpuff Girls', classic: 'Classic Cartoon Network', action: 'Cartoon Action', modern: 'Modern Cartoon Network', adult: 'Adult Animation', sitcom: 'Animated Sitcoms', disney: 'Disney Films', horror: 'Horror + Action Icons', objects: 'Objects + Things'
};

function canPlace(grid, word, row, col, dir) {
  const size = grid.length;
  const dr = dir === 'down' ? 1 : 0;
  const dc = dir === 'across' ? 1 : 0;
  const beforeR = row - dr;
  const beforeC = col - dc;
  const afterR = row + dr * word.length;
  const afterC = col + dc * word.length;
  if (beforeR >= 0 && beforeC >= 0 && beforeR < size && beforeC < size && grid[beforeR][beforeC] !== '#') return false;
  if (afterR >= 0 && afterC >= 0 && afterR < size && afterC < size && grid[afterR][afterC] !== '#') return false;
  for (let i = 0; i < word.length; i++) {
    const r = row + dr * i;
    const c = col + dc * i;
    if (r < 0 || c < 0 || r >= size || c >= size) return false;
    const existing = grid[r][c];
    if (existing !== '#' && existing !== word[i]) return false;
    if (existing === '#') {
      if (dir === 'across') {
        if (r > 0 && grid[r - 1][c] !== '#') return false;
        if (r < size - 1 && grid[r + 1][c] !== '#') return false;
      } else {
        if (c > 0 && grid[r][c - 1] !== '#') return false;
        if (c < size - 1 && grid[r][c + 1] !== '#') return false;
      }
    }
  }
  return true;
}

function placeWord(grid, word, row, col, dir) {
  const dr = dir === 'down' ? 1 : 0;
  const dc = dir === 'across' ? 1 : 0;
  for (let i = 0; i < word.length; i++) grid[row + dr * i][col + dc * i] = word[i];
}

function tryPlaceCrossing(grid, fact, placed, seed) {
  const word = fact.answer;
  const attempts = [];
  for (const placedWord of placed) {
    const dir = placedWord.dir === 'across' ? 'down' : 'across';
    for (let i = 0; i < word.length; i++) {
      for (let j = 0; j < placedWord.answer.length; j++) {
        if (word[i] !== placedWord.answer[j]) continue;
        const row = dir === 'down' ? placedWord.row - i : placedWord.row;
        const col = dir === 'across' ? placedWord.col - i : placedWord.col;
        const crossRow = placedWord.row + (placedWord.dir === 'down' ? j : 0);
        const crossCol = placedWord.col + (placedWord.dir === 'across' ? j : 0);
        const startRow = dir === 'down' ? crossRow - i : row;
        const startCol = dir === 'across' ? crossCol - i : col;
        attempts.push({ row: startRow, col: startCol, dir });
      }
    }
  }
  attempts.sort((a, b) => ((a.row * 31 + a.col * 17 + seed) % 97) - ((b.row * 31 + b.col * 17 + seed) % 97));
  for (const attempt of attempts) {
    if (canPlace(grid, word, attempt.row, attempt.col, attempt.dir)) {
      placeWord(grid, word, attempt.row, attempt.col, attempt.dir);
      placed.push({ ...fact, row: attempt.row, col: attempt.col, dir: attempt.dir });
      return true;
    }
  }
  return false;
}

function fallbackRows(size, facts) {
  const rows = [];
  for (const fact of facts.slice(0, Math.floor(size / 2))) {
    rows.push(fact.answer.padEnd(size, '#').slice(0, size));
    if (rows.length < size) rows.push(blockRow(size));
  }
  while (rows.length < size) rows.push(blockRow(size));
  return rows.slice(0, size);
}

function findWords(rows, size) {
  const numberMap = new Map();
  const words = [];
  let number = 1;
  const isBlock = (r, c) => rows[r]?.[c] === '#';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (isBlock(r, c)) continue;
      const startsAcross = (c === 0 || isBlock(r, c - 1)) && c + 1 < size && !isBlock(r, c + 1);
      const startsDown = (r === 0 || isBlock(r - 1, c)) && r + 1 < size && !isBlock(r + 1, c);
      if (startsAcross || startsDown) numberMap.set(cellId(r, c), number++);
    }
  }
  for (let r = 0; r < size; r++) {
    let c = 0;
    while (c < size) {
      if (isBlock(r, c)) { c++; continue; }
      const start = c;
      let answer = '';
      while (c < size && !isBlock(r, c)) answer += rows[r][c++];
      if (answer.length > 1) words.push({ number: numberMap.get(cellId(r, start)), answer, direction: 'across' });
    }
  }
  for (let c = 0; c < size; c++) {
    let r = 0;
    while (r < size) {
      if (isBlock(r, c)) { r++; continue; }
      const start = r;
      let answer = '';
      while (r < size && !isBlock(r, c)) answer += rows[r++][c];
      if (answer.length > 1) words.push({ number: numberMap.get(cellId(start, c)), answer, direction: 'down' });
    }
  }
  return words;
}

function buildPuzzle(seed, difficulty) {
  const size = difficulty === 'easy' ? 11 : difficulty === 'medium' ? 13 : 15;
  const maxDifficulty = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 4;
  const primary = FACTS[seed % FACTS.length].category;
  const candidates = FACTS
    .filter(fact => fact.answer.length <= size && fact.difficulty <= maxDifficulty + 1)
    .sort((a, b) => {
      const av = (a.category === primary ? -200 : 0) + ((seed * 37 + a.answer.length * 11 + a.clue.length) % 101);
      const bv = (b.category === primary ? -200 : 0) + ((seed * 37 + b.answer.length * 11 + b.clue.length) % 101);
      return av - bv;
    });

  const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => '#'));
  const placed = [];
  const first = candidates.find(fact => fact.answer.length <= size - 2) || candidates[0];
  const startRow = Math.floor(size / 2);
  const startCol = Math.max(0, Math.floor((size - first.answer.length) / 2));
  placeWord(grid, first.answer, startRow, startCol, 'across');
  placed.push({ ...first, row: startRow, col: startCol, dir: 'across' });

  for (const fact of candidates) {
    if (placed.some(item => item.answer === fact.answer)) continue;
    if (placed.length >= (difficulty === 'easy' ? 7 : difficulty === 'medium' ? 9 : 11)) break;
    tryPlaceCrossing(grid, fact, placed, seed + placed.length);
  }

  let rows = grid.map(row => row.join(''));
  if (placed.length < 4) rows = fallbackRows(size, candidates);

  const clueByAnswer = new Map(candidates.concat(placed).map(fact => [fact.answer, fact.clue]));
  const clues = { across: {}, down: {} };
  for (const word of findWords(rows, size)) {
    const clue = clueByAnswer.get(word.answer) || `Cartoon/action reference: ${word.answer.length} letters.`;
    clues[word.direction][word.number] = clue;
  }

  return {
    title: `${categoryNames[primary] || 'Cartoon'} Mix ${seed + 1}`,
    size,
    grid: rows,
    clues
  };
}

function buildBank() {
  const bank = { easy: [], medium: [], hard: [] };
  for (let i = 0; i < 334; i++) bank.easy.push(buildPuzzle(i, 'easy'));
  for (let i = 334; i < 667; i++) bank.medium.push(buildPuzzle(i, 'medium'));
  for (let i = 667; i < 1000; i++) bank.hard.push(buildPuzzle(i, 'hard'));
  return bank;
}

export const crosswordPuzzleBank = buildBank();
export const crosswordPuzzleCount = 1000;
