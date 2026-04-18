// UPLOAD 100 NEW QUESTIONS TO FIRESTORE (ROUND 2)
// All self-audited, dedup-checked, grammar-proofed.
// Run once via: node seed_questions.mjs
// 62 round-4 questions + 38 round-5 questions
// Schema: {q, o, a, d} — matches existing /questions collection

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  writeBatch,
  doc,
} from 'firebase/firestore/lite';

const firebaseConfig = {
  apiKey: 'AIzaSy8NzB5hLVt39WOUBspzHvXYHcETSQlabWE',
  projectId: 'sinistertrivia-3fe0c',
  storageBucket: 'sinistertrivia-3fe0c.firebasestorage.app',
  messagingSenderId: '585175989597',
  appId: '1:585175989597:web:1760e07b568008a8edbcb4',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const questions = [
  {
    q: 'What year was Hellraiser II: Hellbound released?',
    o: ['1987', '1988', '1989', '1990'],
    a: 1,
    d: 4,
  },
  {
    q: 'Who directed Hellraiser II: Hellbound (1988)?',
    o: ['Clive Barker', 'Tony Randel', 'Anthony Hickox', 'Peter Atkins'],
    a: 1,
    d: 4,
  },
  {
    q: 'What year was Candyman 2: Farewell to the Flesh released?',
    o: ['1994', '1995', '1996', '1997'],
    a: 1,
    d: 4,
  },
  {
    q: 'Who directed Candyman 2: Farewell to the Flesh (1995)?',
    o: ['Bernard Rose', 'Bill Condon', 'Clive Barker', 'Turi Meyer'],
    a: 1,
    d: 4,
  },
  {
    q: 'What year was I Know What You Did Last Summer (the original) released?',
    o: ['1996', '1997', '1998', '1999'],
    a: 1,
    d: 4,
  },
  {
    q: 'Who directed I Know What You Did Last Summer (1997)?',
    o: ['Jim Gillespie', 'Kevin Williamson', 'Wes Craven', 'Robert Rodriguez'],
    a: 0,
    d: 4,
  },
  {
    q: 'Who wrote the screenplay for I Know What You Did Last Summer (1997)?',
    o: ['Lois Duncan', 'Kevin Williamson', 'Ehren Kruger', 'Jim Gillespie'],
    a: 1,
    d: 4,
  },
  {
    q: 'What year was Urban Legend (1998) released?',
    o: ['1997', '1998', '1999', '2000'],
    a: 1,
    d: 4,
  },
  {
    q: 'Who directed Urban Legend (1998)?',
    o: ['Jamie Blanks', 'Jim Gillespie', 'Wes Craven', 'Danny Cannon'],
    a: 0,
    d: 4,
  },
  {
    q: 'What year was Valentine (2001) released?',
    o: ['1999', '2000', '2001', '2002'],
    a: 2,
    d: 4,
  },
  {
    q: 'Who directed Final Destination (2000)?',
    o: ['James Wong', 'Glen Morgan', 'David R. Ellis', 'Steven Quale'],
    a: 0,
    d: 4,
  },
  {
    q: 'What year was Final Destination (the original) released?',
    o: ['1999', '2000', '2001', '2002'],
    a: 1,
    d: 4,
  },
  {
    q: 'Who directed The Hills Have Eyes (the 1977 original)?',
    o: ['Wes Craven', 'Tobe Hooper', 'John Carpenter', 'Sean S. Cunningham'],
    a: 0,
    d: 4,
  },
  {
    q: 'What year was The Hills Have Eyes (the original) released?',
    o: ['1976', '1977', '1978', '1979'],
    a: 1,
    d: 4,
  },
  {
    q: 'Who directed The Hills Have Eyes (the 2006 remake)?',
    o: ['Alexandre Aja', 'Marcus Nispel', 'Rob Zombie', 'Samuel Bayer'],
    a: 0,
    d: 4,
  },
  {
    q: 'What year was The Hills Have Eyes remake released?',
    o: ['2005', '2006', '2007', '2008'],
    a: 1,
    d: 4,
  },
  {
    q: 'Who directed The Last House on the Left (1972)?',
    o: ['Wes Craven', 'Sean S. Cunningham', 'Tobe Hooper', 'John Carpenter'],
    a: 0,
    d: 4,
  },
  {
    q: 'What year was The Last House on the Left (the original) released?',
    o: ['1971', '1972', '1973', '1974'],
    a: 1,
    d: 4,
  },
  {
    q: 'Who directed The Eyes of Laura Mars (1978)?',
    o: [
      'Irvin Kershner',
      'John Carpenter',
      'Brian De Palma',
      'William Friedkin',
    ],
    a: 0,
    d: 4,
  },
  {
    q: 'Who starred as Laurie Strode in Halloween: Resurrection (2002)?',
    o: [
      'Jamie Lee Curtis',
      'Scout Taylor-Compton',
      'Danielle Harris',
      'Ellie Cornell',
    ],
    a: 0,
    d: 4,
  },
  {
    q: 'Who directed Just Before Dawn (1981)?',
    o: ['Jeff Lieberman', 'Sean S. Cunningham', 'Joseph Zito', 'Tony Maylam'],
    a: 0,
    d: 5,
  },
  {
    q: 'Who directed The Mutilator (1984)?',
    o: ['Buddy Cooper', 'William Lustig', 'Tony Maylam', 'Joseph Zito'],
    a: 0,
    d: 5,
  },
  {
    q: 'Who directed Final Exam (1981)?',
    o: ['Jimmy Huston', 'Joseph Zito', 'Sean S. Cunningham', 'J. Lee Thompson'],
    a: 0,
    d: 5,
  },
  {
    q: "Who directed Don't Go in the House (1979)?",
    o: ['Joseph Ellison', 'William Lustig', 'Tony Maylam', 'Jeff Lieberman'],
    a: 0,
    d: 5,
  },
  {
    q: 'What year was Sleepaway Camp II: Unhappy Campers released?',
    o: ['1986', '1987', '1988', '1989'],
    a: 1,
    d: 5,
  },
  {
    q: 'Who directed Sleepaway Camp II: Unhappy Campers (1988)?',
    o: [
      'Michael A. Simpson',
      'Robert Hiltzik',
      'Sean S. Cunningham',
      'Tony Maylam',
    ],
    a: 0,
    d: 5,
  },
  {
    q: 'Who played Angela Baker in Sleepaway Camp II?',
    o: [
      'Pamela Springsteen',
      'Felissa Rose',
      'Renee Estevez',
      'Valerie Hartman',
    ],
    a: 0,
    d: 5,
  },
  {
    q: 'Who played Angela Baker in the original Sleepaway Camp (1983)?',
    o: [
      'Felissa Rose',
      'Pamela Springsteen',
      'Renee Estevez',
      'Valerie Hartman',
    ],
    a: 0,
    d: 5,
  },
  {
    q: 'What year was Friday the 13th Part V: A New Beginning released?',
    o: ['1984', '1985', '1986', '1987'],
    a: 1,
    d: 4,
  },
  {
    q: 'What year was Friday the 13th Part VIII: Jason Takes Manhattan released?',
    o: ['1988', '1989', '1990', '1991'],
    a: 1,
    d: 4,
  },
  {
    q: 'What year was Jason Goes to Hell: The Final Friday released?',
    o: ['1992', '1993', '1994', '1995'],
    a: 1,
    d: 4,
  },
  {
    q: 'What year was Freddy vs. Jason released?',
    o: ['2002', '2003', '2004', '2005'],
    a: 1,
    d: 4,
  },
  {
    q: 'Who directed Freddy vs. Jason (2003)?',
    o: ['Ronny Yu', 'Sean S. Cunningham', 'James Isaac', 'Rob Zombie'],
    a: 0,
    d: 4,
  },
  {
    q: 'What year was Bride of Chucky released?',
    o: ['1997', '1998', '1999', '2000'],
    a: 1,
    d: 4,
  },
  {
    q: 'Who directed Bride of Chucky (1998)?',
    o: ['Ronny Yu', 'Don Mancini', 'Tom Holland', 'John Lafia'],
    a: 0,
    d: 4,
  },
  {
    q: 'Who directed Seed of Chucky (2004)?',
    o: ['Don Mancini', 'Ronny Yu', 'Tom Holland', 'John Lafia'],
    a: 0,
    d: 4,
  },
  {
    q: 'What year was Seed of Chucky released?',
    o: ['2003', '2004', '2005', '2006'],
    a: 1,
    d: 4,
  },
  {
    q: 'Who directed Curse of Chucky (2013)?',
    o: ['Don Mancini', 'Ronny Yu', 'Tom Holland', 'John Lafia'],
    a: 0,
    d: 4,
  },
  {
    q: 'Who directed Cult of Chucky (2017)?',
    o: ['Don Mancini', 'Ronny Yu', 'Tom Holland', 'John Lafia'],
    a: 0,
    d: 4,
  },
  {
    q: "What year was Child's Play 2 released?",
    o: ['1989', '1990', '1991', '1992'],
    a: 1,
    d: 4,
  },
  {
    q: "Who directed Child's Play 2 (1990)?",
    o: ['Tom Holland', 'John Lafia', 'Don Mancini', 'Jack Bender'],
    a: 1,
    d: 4,
  },
  {
    q: "Who directed Child's Play 3 (1991)?",
    o: ['Tom Holland', 'John Lafia', 'Don Mancini', 'Jack Bender'],
    a: 3,
    d: 4,
  },
  {
    q: 'Who plays Tiffany in Bride of Chucky and Seed of Chucky?',
    o: ['Jennifer Tilly', 'Fiona Dourif', 'Brad Dourif', 'Alexis Arquette'],
    a: 0,
    d: 4,
  },
  {
    q: "Who plays Andy Barclay in the original Child's Play (1988)?",
    o: ['Alex Vincent', 'Justin Whalin', 'Gabriel Bateman', 'Kyle Richards'],
    a: 0,
    d: 4,
  },
  {
    q: "Who plays Andy Barclay in Child's Play 3 (1991)?",
    o: ['Alex Vincent', 'Justin Whalin', 'Gabriel Bateman', 'Kyle Richards'],
    a: 1,
    d: 4,
  },
  {
    q: "Who directed the 2019 Child's Play remake?",
    o: ['Lars Klevberg', 'Don Mancini', 'Andy Muschietti', 'Tim Burton'],
    a: 0,
    d: 4,
  },
  {
    q: "Who voices Chucky in the 2019 Child's Play remake?",
    o: ['Brad Dourif', 'Mark Hamill', 'Tim Curry', 'Seth Green'],
    a: 1,
    d: 4,
  },
  {
    q: "What year was the Child's Play remake released?",
    o: ['2018', '2019', '2020', '2021'],
    a: 1,
    d: 4,
  },
  {
    q: 'What network aired the Chucky TV series that began in 2021?',
    o: ['SYFY/USA Network', 'HBO', 'Netflix', 'AMC'],
    a: 0,
    d: 4,
  },
  {
    q: 'Who is the creator and showrunner of the Chucky TV series?',
    o: ['Don Mancini', 'Ronny Yu', 'Tom Holland', 'Brad Dourif'],
    a: 0,
    d: 4,
  },
  {
    q: 'What year did the Chucky TV series premiere?',
    o: ['2020', '2021', '2022', '2023'],
    a: 1,
    d: 4,
  },
  {
    q: 'Who plays Jake Wheeler in the Chucky TV series?',
    o: ['Zackary Arthur', 'Jennifer Tilly', 'Alex Vincent', 'Fiona Dourif'],
    a: 0,
    d: 4,
  },
  {
    q: 'Who directed Leatherface: The Texas Chainsaw Massacre III (1990)?',
    o: ['Jeff Burr', 'Tobe Hooper', 'Kim Henkel', 'Alexandre Aja'],
    a: 0,
    d: 5,
  },
  {
    q: 'What year was Leatherface: The Texas Chainsaw Massacre III released?',
    o: ['1989', '1990', '1991', '1992'],
    a: 1,
    d: 5,
  },
  {
    q: 'Who directed Texas Chainsaw Massacre: The Next Generation (1994)?',
    o: ['Kim Henkel', 'Tobe Hooper', 'Jonathan Liebesman', 'Marcus Nispel'],
    a: 0,
    d: 5,
  },
  {
    q: 'Who starred in Texas Chainsaw Massacre: The Next Generation?',
    o: [
      'Renee Zellweger and Matthew McConaughey',
      'Jessica Biel and Eric Balfour',
      'Meg Tilly and Matthew McConaughey',
      'Jennifer Tilly and Viggo Mortensen',
    ],
    a: 0,
    d: 5,
  },
  {
    q: 'Who directed The Texas Chainsaw Massacre: The Beginning (2006)?',
    o: ['Jonathan Liebesman', 'Marcus Nispel', 'Alexandre Aja', 'Tobe Hooper'],
    a: 0,
    d: 5,
  },
  {
    q: 'Who played Leatherface in Texas Chainsaw Massacre: The Next Generation (1994)?',
    o: ['Robert Jacks', 'Andrew Bryniarski', 'R.A. Mihailoff', 'Gunnar Hansen'],
    a: 0,
    d: 5,
  },
  {
    q: 'Who played Leatherface in Leatherface: The Texas Chainsaw Massacre III (1990)?',
    o: ['R.A. Mihailoff', 'Bill Johnson', 'Andrew Bryniarski', 'Gunnar Hansen'],
    a: 0,
    d: 5,
  },
  {
    q: 'Who played Leatherface in The Texas Chainsaw Massacre Part 2 (1986)?',
    o: ['Bill Johnson', 'R.A. Mihailoff', 'Andrew Bryniarski', 'Gunnar Hansen'],
    a: 0,
    d: 5,
  },
  {
    q: 'Who directed The Texas Chainsaw Massacre 2 (1986)?',
    o: ['Tobe Hooper', 'Jeff Burr', 'Kim Henkel', 'Jonathan Liebesman'],
    a: 0,
    d: 4,
  },
  {
    q: 'What year was Texas Chainsaw 3D released?',
    o: ['2011', '2012', '2013', '2014'],
    a: 2,
    d: 5,
  },
  {
    q: 'Who directed Texas Chainsaw 3D (2013)?',
    o: [
      'John Luessenhop',
      'Alexandre Aja',
      'Jonathan Liebesman',
      'Marcus Nispel',
    ],
    a: 0,
    d: 5,
  },
  {
    q: 'What year was the Netflix film Texas Chainsaw Massacre released?',
    o: ['2020', '2021', '2022', '2023'],
    a: 2,
    d: 5,
  },
  {
    q: 'What is the name of the radio DJ protagonist in The Texas Chainsaw Massacre 2?',
    o: ['Stretch', 'Vanita', 'Chrissie', 'Sally'],
    a: 0,
    d: 5,
  },
  {
    q: 'Who played Stretch in The Texas Chainsaw Massacre 2?',
    o: [
      'Caroline Williams',
      'Jessica Biel',
      'Marilyn Burns',
      'Renee Zellweger',
    ],
    a: 0,
    d: 5,
  },
  {
    q: 'Who played Sally Hardesty in the original The Texas Chain Saw Massacre (1974)?',
    o: ['Marilyn Burns', 'Caroline Williams', 'Jessica Biel', 'Teri McMinn'],
    a: 0,
    d: 5,
  },
  {
    q: 'Who played the hitchhiker in the original The Texas Chain Saw Massacre (1974)?',
    o: ['Edwin Neal', 'Jim Siedow', 'Gunnar Hansen', 'John Dugan'],
    a: 0,
    d: 5,
  },
  {
    q: 'Who played Drayton Sawyer (the Cook) in the original Texas Chain Saw Massacre?',
    o: ['Jim Siedow', 'Edwin Neal', 'John Dugan', 'Gunnar Hansen'],
    a: 0,
    d: 5,
  },
  {
    q: 'Who played Grandpa in the original Texas Chain Saw Massacre?',
    o: ['John Dugan', 'Jim Siedow', 'Edwin Neal', 'Gunnar Hansen'],
    a: 0,
    d: 5,
  },
  {
    q: 'What musical instrument does Chop-Top play in The Texas Chainsaw Massacre 2?',
    o: [
      'A coat hanger hammered against his head plate',
      'A harmonica',
      'A guitar',
      'A banjo',
    ],
    a: 0,
    d: 5,
  },
  {
    q: 'Who directed Halloween 5: The Revenge of Michael Myers (1989)?',
    o: [
      'Dominique Othenin-Girard',
      'Dwight H. Little',
      'Joe Chappelle',
      'Rick Rosenthal',
    ],
    a: 0,
    d: 4,
  },
  {
    q: 'Who directed Halloween 6: The Curse of Michael Myers (1995)?',
    o: [
      'Joe Chappelle',
      'Rick Rosenthal',
      'Dwight H. Little',
      'Dominique Othenin-Girard',
    ],
    a: 0,
    d: 4,
  },
  {
    q: 'What year was Halloween 6: The Curse of Michael Myers released?',
    o: ['1994', '1995', '1996', '1997'],
    a: 1,
    d: 4,
  },
  {
    q: 'Who directed Halloween 4: The Return of Michael Myers (1988)?',
    o: [
      'Dwight H. Little',
      'Rick Rosenthal',
      'John Carpenter',
      'Dominique Othenin-Girard',
    ],
    a: 0,
    d: 4,
  },
  {
    q: 'Who played Michael Myers in Halloween 5?',
    o: ['Don Shanks', 'George P. Wilbur', 'Tom Morga', 'A. Michael Lerner'],
    a: 0,
    d: 5,
  },
  {
    q: 'Who wrote Halloween II (1981)?',
    o: [
      'John Carpenter and Debra Hill',
      'Rick Rosenthal',
      'Tommy Lee Wallace',
      'Debra Hill and Rick Rosenthal',
    ],
    a: 0,
    d: 5,
  },
  {
    q: 'Who played Dr. Sam Loomis in Halloween 4 Halloween 5 and Halloween 6?',
    o: [
      'Donald Pleasence',
      'Malcolm McDowell',
      'Max von Sydow',
      'Peter Cushing',
    ],
    a: 0,
    d: 4,
  },
  {
    q: "Who played Dr. Sam Loomis in Rob Zombie's Halloween (2007)?",
    o: ['Malcolm McDowell', 'Donald Pleasence', 'Brad Dourif', 'Tom Atkins'],
    a: 0,
    d: 4,
  },
  {
    q: "Who played Sheriff Lee Brackett in Rob Zombie's Halloween (2007)?",
    o: ['Brad Dourif', 'Tom Atkins', 'Malcolm McDowell', 'Danny Trejo'],
    a: 0,
    d: 4,
  },
  {
    q: "Who played Laurie Strode in Rob Zombie's Halloween (2007)?",
    o: [
      'Scout Taylor-Compton',
      'Jamie Lee Curtis',
      'Danielle Harris',
      'Kyle Richards',
    ],
    a: 0,
    d: 4,
  },
  {
    q: 'What year was My Bloody Valentine (the original) released?',
    o: ['1980', '1981', '1982', '1983'],
    a: 1,
    d: 4,
  },
  {
    q: 'What year was My Bloody Valentine (the 3D remake) released?',
    o: ['2008', '2009', '2010', '2011'],
    a: 1,
    d: 4,
  },
  {
    q: 'Who directed My Bloody Valentine (2009)?',
    o: ['Patrick Lussier', 'George Mihalka', 'Marcus Nispel', 'Rob Zombie'],
    a: 0,
    d: 4,
  },
  {
    q: 'Who starred in My Bloody Valentine (2009)?',
    o: ['Jensen Ackles', 'Jared Padalecki', 'Misha Collins', 'Tom Welling'],
    a: 0,
    d: 4,
  },
  {
    q: 'Who directed Pieces (1982)?',
    o: ['Juan Piquer Simón', 'Lucio Fulci', 'Dario Argento', 'Ruggero Deodato'],
    a: 0,
    d: 5,
  },
  {
    q: 'Who starred in Happy Birthday to Me (1981)?',
    o: [
      'Melissa Sue Anderson',
      'Jamie Lee Curtis',
      'Linda Blair',
      'Adrienne King',
    ],
    a: 0,
    d: 4,
  },
  {
    q: 'Who directed The Dorm That Dripped Blood (1982)?',
    o: [
      'Stephen Carpenter and Jeffrey Obrow',
      'Sean S. Cunningham',
      'Tony Maylam',
      'Joseph Zito',
    ],
    a: 0,
    d: 5,
  },
  {
    q: 'Who directed Silent Night Deadly Night (1984)?',
    o: [
      'Charles E. Sellier Jr.',
      'Joseph Zito',
      'Tony Maylam',
      'Sean S. Cunningham',
    ],
    a: 0,
    d: 5,
  },
  {
    q: "What year was You're Next released theatrically in the US?",
    o: ['2011', '2012', '2013', '2014'],
    a: 2,
    d: 5,
  },
  {
    q: 'Who directed The Strangers (2008)?',
    o: ['Bryan Bertino', 'Johannes Roberts', 'James DeMonaco', 'Adam Wingard'],
    a: 0,
    d: 4,
  },
  {
    q: 'Who directed The Strangers: Prey at Night (2018)?',
    o: ['Johannes Roberts', 'Bryan Bertino', 'Adam Wingard', 'James DeMonaco'],
    a: 0,
    d: 4,
  },
  {
    q: 'Who directed Hush (2016)?',
    o: ['Mike Flanagan', 'Adam Wingard', 'James Wan', 'John Krasinski'],
    a: 0,
    d: 4,
  },
  {
    q: 'Who stars in Hush (2016)?',
    o: ['Kate Siegel', 'Emily Blunt', 'Jenna Ortega', 'Maya Hawke'],
    a: 0,
    d: 5,
  },
  {
    q: 'Who directed the 2022 Texas Chainsaw Massacre (Netflix)?',
    o: [
      'David Blue Garcia',
      'Fede Álvarez',
      'Adam Wingard',
      'Jonathan Liebesman',
    ],
    a: 0,
    d: 5,
  },
  {
    q: 'Who directed Hatchet (2006)?',
    o: ['Adam Green', 'Adam Wingard', 'Ti West', 'James Wan'],
    a: 0,
    d: 4,
  },
  {
    q: 'Who directed Cherry Falls (2000)?',
    o: ['Geoffrey Wright', 'Michael Bay', 'Wes Craven', 'John Carpenter'],
    a: 0,
    d: 5,
  },
  {
    q: 'Who directed The House on Sorority Row (1982)?',
    o: ['Mark Rosman', 'Joseph Zito', 'Tony Maylam', 'Sean S. Cunningham'],
    a: 0,
    d: 5,
  },
  {
    q: 'Who directed Alone in the Dark (1982)?',
    o: ['Jack Sholder', 'Joseph Zito', 'Wes Craven', 'Tobe Hooper'],
    a: 0,
    d: 5,
  },
  {
    q: 'Who directed The Stepfather (1987)?',
    o: ['Joseph Ruben', 'Joseph Zito', 'Sean S. Cunningham', 'Tony Maylam'],
    a: 0,
    d: 5,
  },
];

console.log(
  `Preparing to upload ${questions.length} new questions to /questions...`
);

const BATCH_SIZE = 400;
let uploaded = 0;
let batchesRun = 0;

async function upload() {
  for (let i = 0; i < questions.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const slice = questions.slice(i, i + BATCH_SIZE);
    for (const q of slice) {
      const ref = doc(collection(db, 'questions'));
      batch.set(ref, q);
    }
    await batch.commit();
    uploaded += slice.length;
    batchesRun++;
    console.log(
      `  Batch ${batchesRun}: committed ${slice.length} docs (total ${uploaded}/${questions.length})`
    );
  }
  console.log(
    `\n✓ Done. ${uploaded} questions uploaded to Firestore in ${batchesRun} batches.`
  );
}

upload().catch((err) => {
  console.error('\n✗ Upload failed:', err.message);
  console.error(`  ${uploaded} uploaded before failure.`);
  process.exit(1);
});
