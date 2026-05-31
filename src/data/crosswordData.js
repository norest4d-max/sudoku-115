const blockRow = (size) => '#'.repeat(size);
const answerRow = (answer, size) => answer.toUpperCase().replace(/[^A-Z]/g, '').padEnd(size, '#').slice(0, size);
const makeRows = (size, answers) => {
  const rows = [];
  for (const answer of answers) {
    rows.push(answerRow(answer, size));
    if (rows.length < size) rows.push(blockRow(size));
  }
  return rows.slice(0, size);
};

const makePuzzle = (title, size, answers, clues) => ({ title, size, grid: makeRows(size, answers), clues: { across: clues, down: {} } });

export const crosswordPuzzleBank = {
      easy: [
        makePuzzle('Park Friends', 10, ['Mordecai', 'Rigby', 'Benson', 'Skips', 'Pops'], {
          1: 'Blue bird Regular Show lead.',
          2: 'Mordecai best friend.',
          3: 'Gumball-machine park boss.',
          4: 'Wise park worker.',
          5: 'Cheerful lollipop-shaped friend.'
        }),
        makePuzzle('Cartoon Network', 10, ['Gumball', 'Darwin', 'Finn', 'Jake', 'Bubbles'], {
          1: 'Blue cat from Elmore.',
          2: 'Orange fish brother from Elmore.',
          3: 'Human hero of Adventure Time.',
          4: 'Stretchy dog from Adventure Time.',
          5: 'Blue Powerpuff sister.'
        }),
        makePuzzle('Disney Starts', 10, ['Simba', 'Ariel', 'Mulan', 'Genie', 'Moana'], {
          1: 'Lion cub who becomes king.',
          2: 'Mermaid princess with a human-world dream.',
          3: 'Heroine who joins the army in disguise.',
          4: 'Blue wish-granter from Aladdin.',
          5: 'Wayfinder chosen by the ocean.'
        }),
        makePuzzle('Springfield', 10, ['Homer', 'Marge', 'Bart', 'Lisa', 'Krusty'], {
          1: 'Springfield dad in Sector 7-G.',
          2: 'Blue-haired Simpson mother.',
          3: 'Skateboarding Simpson son.',
          4: 'Saxophone-playing Simpson daughter.',
          5: 'Television clown from Springfield.'
        })
      ],
      medium: [
        makePuzzle('Adult Swim', 11, ['Frylock', 'Meatwad', 'Carl', 'Mooninite', 'Rabbot', 'Shake'], {
          1: 'Floating fries with the level head.',
          2: 'Childlike shapeshifting meatball.',
          3: 'Aqua Teens neighbor.',
          4: 'Pixel-styled alien type.',
          5: 'Robot from the first Aqua Teen episode.',
          6: 'Selfish talking milkshake.'
        }),
        makePuzzle('Family Table', 11, ['Peter', 'Lois', 'Stewie', 'Brian', 'Quahog', 'Cleveland'], {
          1: 'Chaotic Griffin father.',
          2: 'Griffin mother.',
          3: 'Brilliant Griffin baby.',
          4: 'Talking Griffin dog.',
          5: 'Rhode Island town in Family Guy.',
          6: 'Neighbor who got a spinoff.'
        }),
        makePuzzle('Propane Alley', 11, ['Hank', 'Peggy', 'Bobby', 'Dale', 'Boomhauer', 'Strickland'], {
          1: 'Propane salesman from Arlen.',
          2: 'Confident substitute teacher.',
          3: 'Hank and Peggy son.',
          4: 'Conspiracy-minded exterminator.',
          5: 'Fast-talking neighbor.',
          6: 'Propane company name.'
        }),
        makePuzzle('Villain Shelf', 11, ['Mojojojo', 'Ursula', 'Scar', 'Yzma', 'Jafar', 'Maleficent'], {
          1: 'Powerpuff villain with a big brain.',
          2: 'Sea witch from The Little Mermaid.',
          3: 'Lion King usurper.',
          4: 'Emperor New Groove schemer.',
          5: 'Aladdin sorcerer.',
          6: 'Aurora-cursing villain.'
        })
      ],
      hard: [
        makePuzzle('Deep Cuts', 14, ['Stinkmeaner', 'Thugnificent', 'Gangstalicious', 'Wuncler', 'Ruckus', 'Woodcrest'], {
          1: 'Recurring blind fighter from The Boondocks.',
          2: 'Rapper who moves into Woodcrest.',
          3: 'Rapper tied to Riley fan worship.',
          4: 'Powerful family name in The Boondocks.',
          5: 'Controversial neighbor from The Boondocks.',
          6: 'Freeman family suburb.'
        }),
        makePuzzle('Horror Icons', 12, ['Ghostface', 'Michael', 'Freddy', 'Jason', 'Pinhead', 'Candyman'], {
          1: 'Masked identity used in Scream.',
          2: 'Silent Halloween killer first name.',
          3: 'Dream-stalking slasher first name.',
          4: 'Hockey-mask slasher first name.',
          5: 'Hellraiser icon.',
          6: 'Mirror-summoned horror figure.'
        }),
        makePuzzle('Creature Features', 12, ['Xenomorph', 'Predator', 'Leatherface', 'Chucky', 'Jigsaw', 'Midsommar'], {
          1: 'Alien franchise creature.',
          2: 'Hunter from the jungle sci-fi horror series.',
          3: 'Texas chainsaw killer nickname.',
          4: 'Killer doll.',
          5: 'Saw mastermind identity.',
          6: 'Daylight folk-horror title.'
        }),
        makePuzzle('Hard Animation', 12, ['Muscleman', 'Quagmire', 'Smithers', 'Burns', 'Cotton', 'Luanne'], {
          1: 'Regular Show character known for loud jokes.',
          2: 'Family Guy neighbor with a famous catchphrase.',
          3: 'Mr. Burns assistant.',
          4: 'Springfield plant owner.',
          5: 'Hank Hill father.',
          6: 'Peggy niece who lives with the Hills.'
        })
      ]
    };
