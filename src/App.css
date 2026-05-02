import { useState, useEffect, useRef, useCallback, useMemo, Component } from "react";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, getDocs, query, where, runTransaction } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
// Question pool architecture:
//   - PRIMARY: api.sinistertrivia.com/questions (editable without app redeploy)
//   - INTERNAL FALLBACK: bundled Q1c1...Q5c7 arrays (~700 questions, always merged when server is up)
//   - QCLOUD FALLBACK: bundled qcloud.ts (~1815 questions, used ONLY when server is offline)
// When server is UP: server questions + internal Q*c* arrays.
// When server is DOWN: internal Q*c* arrays + QCLOUD (~2,500 total) — maximum offline coverage.
import { QCLOUD } from './qcloud';

// ── STORAGE ABSTRACTION (localStorage in browser, Capacitor Preferences when native) ──
const Storage = {
  async get(key) {
    try {
      if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform()) {
        // Dynamic import to avoid Vite build-time resolution
        const capacitorModule = '@capacitor/preferences';
        const { Preferences } = await import(/* @vite-ignore */ capacitorModule);
        const { value } = await Preferences.get({ key });
        return value;
      }
      return localStorage.getItem(key);
    } catch(e) { return localStorage.getItem(key); }
  },
  async set(key, value) {
    try {
      if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform()) {
        // Dynamic import to avoid Vite build-time resolution
        const capacitorModule = '@capacitor/preferences';
        const { Preferences } = await import(/* @vite-ignore */ capacitorModule);
        await Preferences.set({ key, value });
        return;
      }
      localStorage.setItem(key, value);
    } catch(e) { try { localStorage.setItem(key, value); } catch(e2) {} }
  },
  async remove(key) {
    try {
      if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform()) {
        // Dynamic import to avoid Vite build-time resolution
        const capacitorModule = '@capacitor/preferences';
        const { Preferences } = await import(/* @vite-ignore */ capacitorModule);
        await Preferences.remove({ key });
        return;
      }
      localStorage.removeItem(key);
    } catch(e) { try { localStorage.removeItem(key); } catch(e2) {} }
  },
  // Sync fallback for places that can't be async
  getSync(key) { try { return localStorage.getItem(key); } catch(e) { return null; } },
  setSync(key, value) { try { localStorage.setItem(key, value); } catch(e) {} },
  removeSync(key) { try { localStorage.removeItem(key); } catch(e) {} }
};

// ── PROFANITY FILTER ──
const BLOCKED = ["fuck","shit","cunt","nigger","nigga","faggot","fag","bitch","asshole","cock","pussy","dick","whore","slut","bastard","motherfucker","motherfucking","retard","tranny","kike","spic","chink","wetback","cracker","dyke","twat","prick","wanker","arsehole","bollocks"];
function containsProfanity(str) {
  const lower = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return BLOCKED.some(w => lower.includes(w));
}

const firebaseConfig = {
  apiKey: "AIzaSyBNzB5hLVt39KOUBspzHvXYHcETSQ1abKE",
  authDomain: "sinistertrivia-3fe0c.firebaseapp.com",
  projectId: "sinistertrivia-3fe0c",
  storageBucket: "sinistertrivia-3fe0c.firebasestorage.app",
  messagingSenderId: "585175989597",
  appId: "1:585175989597:web:1760e07b560008a8edbcb4"
};
const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(fbApp);











const Q1c1=[{q:"In what 1980 slasher does Jamie Lee Curtis play a high school student whose friends accidentally caused a child's death?",o:["Terror Train", "The Fog", "Prom Night", "Roadgames"],a:2,d:1},{q:"What connects the films Freaky and Happy Death Day?",o:["Same director", "Same studio", "Same characters", "Same killer"],a:0,d:1},{q:"What is the last thing Glen does before his death in A Nightmare on Elm Street?",o:["He falls asleep while listening to music on headphones watching TV", "He sneaks out of the house to help Nancy set traps for Freddy Krueger", "He stays up all night drinking coffee and watching monster movies with Nancy", "He tells his parents about Freddy and begs them to let him sleep at Nancy's"],a:0,d:1},{q:"Why was Silent Night Deadly Night protested?",o:["It featured Santa Claus as a killer upsetting parents", "It showed graphic nun torture scenes that offended Catholic groups", "It was filmed at real shopping malls without any kind of permission", "It depicted children witnessing murders in ways critics called abusive"],a:0,d:1},{q:"In Child's Play who made Chucky into a killer doll?",o:["Charles Lee Ray transferred his soul using voodoo", "A factory worker cursed the doll as revenge on his boss", "A satanic cult performed a ritual on a shipment of Good Guy dolls", "Andy's mother bought the doll from a homeless man who warned her"],a:0,d:1},{q:"In Prom Night (1980) what is the connection between the killer and the victims?",o:["The victims accidentally caused a girl's death", "The victims were all students the killer had dated before", "They were witnesses to a crime the killer committed", "All were cast members of the school play the killer missed"],a:0,d:1},{q:"What is Dr. Lawrence Gordon's dilemma in Saw?",o:["Kill Adam to free himself", "Saw off his own hand to escape", "Drink poison to save his daughter", "Choose which of his children dies"],a:0,d:1},{q:"What year was A Nightmare on Elm Street originally released?",o:["1981", "1982", "1984", "1985"],a:2,d:1},{q:"In Nightmare on Elm Street, Freddy kills teens in their what?",o:["Nightmares", "Bathrooms", "Hot tub room", "Garage"],a:0,d:1},{q:"In Freddy vs. Jason, why has Freddy lost his power?",o:["The children of Elm Street forgot about him", "The town sealed his body in a secret underground crypt", "Dream Warriors trapped him in the dream world permanently", "Nancy's father destroyed his glove in a church fire ritual"],a:0,d:1},{q:"What slasher film has a killer called The Creeper?",o:["Jeepers Creepers", "Crawlspace 1986", "The Prowler 1981", "Silent Scream 1979"],a:0,d:1},{q:"Who wrote the screenplay for The Burning?",o:["Peter Lawrence and Bob Weinstein", "Brad Grey and Edward Pressman Jr", "Tony Maylam and Brad Grey III", "Sean Cunningham and Victor Miller"],a:0,d:1},{q:"What happens if you feed a Mogwai after midnight in Gremlins?",o:["It transforms into a Gremlin", "It grows to giant size and attacks", "It dies instantly from toxic shock", "It reproduces uncontrollably until dawn"],a:0,d:1},{q:"What is the name of the truck driver villain in Joy Ride 2001?",o:["Rusty Nail", "Road Rage", "Coyote", "The Driver"],a:0,d:1},{q:"In what three slasher films does Jamie Lee Curtis star in 1980?",o:["Halloween II Prom Night and Terror Train", "Prom Night Terror Train and The Fog", "Halloween Prom Night and Carrie", "Friday the 13th Prom Night and The Fog"],a:1,d:1},{q:"What 2023 slasher directed by Eli Roth is set during the holiday season?",o:["Thanksgiving", "Carver's Night", "Plymouth Rot", "Pilgrim's End"],a:0,d:1},{q:"What hospital does Jamie Lee Curtis' character get admitted to in Halloween II?",o:["Haddonfield Memorial Hospital", "Springfield General", "Haddonfield Community", "Laurie's hospital has no name"],a:0,d:1},{q:"In A Nightmare on Elm Street, how does Nancy defeat Freddy at the climax?",o:["She stabs him with his own glove", "She burns him alive in the boiler room", "She turns her back and denies him her fear, stripping his power", "She traps him in a mirror"],a:2,d:1},{q:"In the original Black Christmas (1974), what improvised weapon does Billy use to kill Clare in the bedroom?",o:["A plastic dry-cleaning bag", "A metal meat hook", "A heavy glass table lamp", "A wire coat hanger"],a:0,d:1}];
const Q1c3=[{q:"What is Jason Voorhees' primary weapon?",o:["An axe", "A machete", "A chainsaw", "A hatchet"],a:1,d:1},{q:"What major twist ends the original Saw?",o:["The body in the room is Jigsaw himself", "The detective was actually the killer all along", "Dr. Gordon's daughter is revealed to be dead", "Adam and Lawrence were never really strangers"],a:0,d:1},{q:"What is the main setting of Black Christmas (1974)?",o:["A sorority house", "A college dorm", "A high school", "A hospital"],a:0,d:1},{q:"What is the name of the detective who hunts Jigsaw in Saw?",o:["Eric Matthews", "David Tapp", "Peter Strahm", "Mark Hoffman"],a:1,d:1},{q:"What happens to Chucky in every film?",o:["He is always destroyed but always returns", "He possesses a new doll body in each sequel", "He escapes to a new town and begins again", "He is captured then stolen by a new owner"],a:0,d:1}];
const Q1c4=[{q:"What is the name of the horror film set at a ski resort?",o:["Cold Killer", "Iced", "Shredder", "Frozen"],a:3,d:1},{q:"In Friday the 13th what is the Crystal Lake nickname that locals use?",o:["Lake of Blood", "Camp Blood", "Crystal Death", "The Cursed Lake"],a:1,d:1},{q:"Who seeks revenge in Prom Night (1980)?",o:["A survivor of the accident", "The dead girl's brother", "The dead girl's father", "The dead girl herself"],a:1,d:1},{q:"What is the alias of the masked antagonist in the 2009 horror film by Marcus Dunstan?",o:["The Collector", "John Doe", "He is unnamed", "The Surgeon"],a:0,d:1}];
const Q1c5=[{q:"What are the main antagonist's name in The People Under the Stairs?",o:["Mommy and Daddy", "The Landlord and Roach", "Daddy and Mommy Robeson", "The Father and The Tenant"],a:0,d:1},{q:"In Friday the 13th what is unusual about the film compared to its sequels?",o:["Mrs. Voorhees is the killer", "There is no masked slasher villain", "Jason Voorhees never appears onscreen", "The film takes place at a boarding school"],a:0,d:1},{q:"In Sleepaway Camp what is Angela's occupation at the camp?",o:["She is a camper", "A camp counselor", "A kitchen helper", "A swimming coach"],a:0,d:1},{q:"What 2023 slasher is the third film in Ti West's X trilogy?",o:["Z", "MaXXXine", "After X", "Beyond Pearl"],a:1,d:1},{q:"What is the name of the protagonist in the original Nightmare on Elm Street?",o:["Kristen Parker", "Alice Johnson", "Nancy Thompson", "Heather Langenkamp"],a:2,d:1},{q:"Who danced on a grave nude in The Return of the Living Dead?",o:["Mia", "Trash", "Tina", "Casey"],a:1,d:1},{q:"In Nightmare on Elm Street what happens to Glen Lantz?",o:["He is dragged into his bed in a geyser of blood", "He is stabbed repeatedly through his bedroom window", "He is decapitated in a bathtub while Nancy sleeps", "He is crushed between the walls of his closet door"],a:0,d:1},{q:"What 1981 slasher features a killer who targets students on their birthdays?",o:["Happy Birthday to Me", "Birthday Party Blood", "Slice of Birthday", "The Birthday Killer"],a:0,d:1},{q:"What weapon does the killer use in I Know What You Did Last Summer?",o:["A fishing hook", "A meat hook", "A hay hook", "A captain's hook"],a:0,d:1},{q:"In Nightmare on Elm Street what does Tina's boyfriend Rod do after her death?",o:["He gets killed in jail", "He confesses to the police", "He escapes and flees town", "He tries to warn Nancy"],a:0,d:1},{q:"In Happy Death Day 2U, what does Tree discover about the alternate timeline?",o:["Her mother is still alive", "She never existed in it", "The killer is different", "Carter doesn't know her"],a:0,d:1},{q:"In Happy Death Day what day does Tree keep reliving?",o:["Halloween", "Her birthday", "Friday the 13th", "The anniversary of her mother's death"],a:1,d:1},{q:"How do you summon the Candyman?",o:["Say his name once in a mirror", "Say his name five times in a mirror", "Light a candle and say his name", "Look into a mirror at midnight"],a:1,d:1},{q:"What slasher franchise is set in New Orleans bayou country?",o:["Wrong Turn", "Friday the 13th", "Hatchet", "The Bayou Slasher"],a:2,d:1}];
const Q1c14=[{q:"Who was Michael Myers' first victim?",o:["Annie Brackett", "Lynda van der Klok", "Judith Myers", "Laurie Strode"],a:2,d:1},{q:"In Saw, where are the two men chained?",o:["A warehouse", "A bathroom", "A basement", "A garage"],a:1,d:1},{q:"Who created the filming locations show Horror’s Hallowed Grounds?",o:["Sean Clark", "Dirk Diggler", "Willie Aimes", "Tom Atkins"],a:0,d:1},{q:"What urban legend opens the film Urban Legend?",o:["The hook man", "The killer in the backseat", "Aren't you glad you didn't turn on the light", "The babysitter and the man upstairs"],a:1,d:1},{q:"Who is the main villain in the Saw franchise?",o:["The Collector", "John Kramer", "Art Blank", "Dr. Lawrence Gordon"],a:1,d:1},{q:"What slasher features kills at a high school reunion?",o:["Slaughter High", "Prom Night", "Happy Birthday to Me", "Class Reunion"],a:0,d:1},{q:"Who directed The Purge?",o:["James DeMonaco", "Wes Craven", "Jordan Peele", "Mike Flanagan"],a:0,d:1}];
const Q1c23=[{q:"What slasher film features a killer who works at an amusement park?",o:["The Funhouse (1981)", "Carnival of Souls", "Clownhouse (1989)", "Dark Ride (2006)"],a:0,d:1},{q:"Who stars in My Bloody Valentine 3D (2009)?",o:["Jensen Ackles", "Ryan Reynolds", "Jared Padalecki", "Chris Pine"],a:0,d:1},{q:"What is Jason's father's name?",o:["Elias Voorhees", "Frank Voorhees", "Roy Voorhees", "His father is never mentioned"],a:0,d:1},{q:"What weapon does the killer use in Prom Night (1980)?",o:["Glass shard", "Ice pick", "Fire axe", "Cleaver"],a:0,d:1},{q:"How did Jason Voorhees' mother kill Jack?",o:["Threw him in a wood chipper", "Arrow through the neck", "Axe", "Hunting knife"],a:1,d:1},{q:"What is the killer's backstory in Cold Prey 2006?",o:["A deformed child left to die in the mountains who survived", "An escaped convict from the Norwegian prison camp nearby", "A hotel owner who lost his family in a winter avalanche", "A park ranger driven mad by years of total isolation alone"],a:0,d:1},{q:"What makes Happy Death Day unique among slasher films?",o:["A time loop death and rebirth mechanic", "A final girl who is secretly the killer", "A body swap between victim and killer", "A killer who can be seen only in mirrors"],a:0,d:1},{q:"What famous prop appears at the end of Jason Goes to Hell?",o:["The Necronomicon", "Freddy Krueger's glove", "The Lament Configuration", "Michael Myers' mask"],a:1,d:1}];
const Q1c29=[{q:"What slasher film features a killer who is a toy store Santa?",o:["Silent Night Deadly Night", "Christmas Evil (1980 film)", "To All A Good Night 1980", "Don't Open Till Christmas"],a:0,d:1},{q:"What is the killer's gimmick in Happy Death Day?",o:["He only kills on birthdays", "Tree relives her murder day on loop", "He sends death threats first", "He kills in alphabetical order"],a:1,d:1},{q:"In Graduation Day, what sport connects all the victims?",o:["Track and field", "Football team", "Baseball team", "Swim team"],a:0,d:1},{q:"In I Know What You Did Last Summer, what do the teens hit with their car?",o:["A dog", "A man", "A deer", "A child"],a:1,d:1}];
const Q1c31=[{q:"What slasher film was shot on video for around $40,000 making it one of the cheapest ever made?",o:["Sledgehammer", "Blood Harvest", "Boarding House", "Video Violence"],a:0,d:1},{q:"What 1978 slasher is set during Carnival season in New Orleans?",o:["Mardi Gras Massacre", "Carnival of Blood", "The Fat Tuesday Killer", "Beads of the Damned"],a:0,d:1},{q:"What slasher film series is set in Springwood?",o:["A Nightmare on Elm Street", "Friday the 13th franchise", "Halloween film franchise", "Child's Play franchise"],a:0,d:1},{q:"Who plays Leatherface in the 2022 Netflix sequel?",o:["Mark Burnham", "Andrew Bryniarski", "R.A. Mihailoff", "Bill Johnson"],a:0,d:1},{q:"What does the Jigsaw killer always leave at crime scenes?",o:["A jigsaw puzzle piece", "A bloodied chess pawn", "A torn tarot card", "A cassette tape"],a:0,d:1},{q:"What is John Kramer's philosophy about his victims?",o:["They don't appreciate life and need to earn it", "They are all criminals who escaped real justice", "They deserve to die for the sins they committed", "They need to suffer to understand true forgiveness"],a:0,d:1},{q:"What city is Child's Play set in?",o:["New York", "Los Angeles", "Chicago", "Detroit"],a:2,d:1}];
const Q1c38=[{q:"What 1983 Canadian slasher features women auditioning for a director's film?",o:["Terror Train", "Prom Night", "Curtains", "Happy Birthday to Me"],a:2,d:1},{q:"What slasher franchise features a killer called The Grabber?",o:["The Black Phone", "The Sitter 2011", "Grabber's Basement", "The Vanishing 1988"],a:0,d:1},{q:"In the original Friday the 13th (1980), how many people did Jason Voorhees kill?",o:["Four", "Three", "Zero", "Five"],a:2,d:1},{q:"Who stars in Happy Birthday to Me?",o:["Glenn Ford and Melissa Sue Anderson", "Donald Pleasence and Jamie Lee Curtis", "Vincent Price and Olivia Hussey Fuller", "Christopher Lee and Morgan Fairchild Ryan"],a:0,d:1},{q:"In the 1983 slasher Sleepaway Camp, what was the character Angela’s original birth name?",o:["Peter", "Ryan", "Karen", "Erin"],a:0,d:1},{q:"What is the English title of the Norwegian slasher Frostbitten?",o:["Cold Kill", "Ice Blood", "Frostbite", "Arctic Terror"],a:2,d:1},{q:"Whose short story is The Black Phone based on?",o:["Stephen King", "Joe Hill", "Dean Koontz", "Scott Derrickson"],a:1,d:1}];
const Q1c42=[{q:"What other film did Haunt's writers write?",o:["A Quiet Place", "The Quiet Place", "Quiet Please", "No Noise"],a:0,d:1},{q:"In Happy Death Day who is the real Babyface killer?",o:["Tree's roommate Lori", "Her professor", "Her boyfriend Carter", "A random escaped mental patient"],a:0,d:1},{q:"What is the killer's mask made from in The Town That Dreaded Sundown?",o:["A rubber mask", "A burlap sack", "A painted hockey mask", "A gas mask"],a:1,d:1},{q:"What slasher is set entirely on a train and stars Jamie Lee Curtis?",o:["The Hitcher", "Terror Train", "Roadgames", "Slumber Party Massacre"],a:1,d:1},{q:"Who directed The Collector (2009)?",o:["James Wan", "Marcus Dunstan", "Patrick Melton", "Scott Derrickson"],a:1,d:1},{q:"Who plays Captain Spaulding?",o:["Sid Haig", "Bill Moseley", "Rob Zombie", "Ken Foree"],a:0,d:1},{q:"What does Ghostface quiz his victims on before attacking them?",o:["True crime trivia", "Horror movie trivia", "Their personal secrets", "Their location"],a:1,d:1}];
const Q1c43=[{q:"What is the premise of The Purge?",o:["One night a year all crime is legal", "Masked killers invade homes on New Year", "A cult kills one person per home each year", "Survivors must compete in a televised hunt"],a:0,d:1},{q:"What is the name of the final girl in the original Texas Chain Saw Massacre?",o:["Sally Hardesty", "Kathy Spellman", "Erin Hartley", "Jenny Green"],a:0,d:1},{q:"What is the name of the ship the killer uses in I Know What You Did Last Summer?",o:["The Fisherman", "Blue Chipper", "Helen's Pride", "Nancy Drew"],a:1,d:1},{q:"What film does Jason Voorhees get his iconic Hockey Mask?",o:["Friday the 13th Part 2", "Friday the 13th Part 3", "Friday the 13th: The Final Chapter", "Jason Lives"],a:1,d:1}];
const Q1c49=[{q:"What does Ghostface do while waiting for victims to answer horror trivia?",o:["He hides inside the house", "He circles the victim's house", "He watches from a car", "He cuts the power"],a:0,d:1},{q:"In Black Christmas (1974) who is the caller revealed to be?",o:["It is never revealed", "A sorority alumnus", "The house janitor", "A jilted ex lover"],a:0,d:1}];
const Q1c54=[{q:"What was the working title of The Texas Chain Saw Massacre?",o:["Head Cheese", "Leatherface", "The Sawyer Family", "Chainsaw Charlie"],a:0,d:1},{q:"What does the killer wear in You're Next?",o:["A clown mask", "Animal masks", "A Ghostface mask", "A skull mask"],a:1,d:1},{q:"What color is the iconic Ghostface mask?",o:["White", "Grey", "Pale yellow", "Bone white"],a:0,d:1},{q:"How many times must you say Candyman in the mirror?",o:["3", "4", "5", "7"],a:2,d:1},{q:"In The Burning how does Cropsy kill at the raft?",o:["He uses garden shears to kill multiple victims at once", "He sets the wooden raft on fire while campers sleep", "He drags swimmers underwater with a rusted iron chain", "He overturns the raft and drowns them one by one in water"],a:0,d:1},{q:"What setting appears most frequently in classic 1980s slasher films?",o:["Summer camps and rural cabins", "Big city alleyways and rooftops", "Suburban malls and parking lots", "Hospitals and nursing homes only"],a:0,d:1},{q:"In A Nightmare on Elm Street, what does Nancy's mother reveal about Freddy?",o:["That she kept his razor glove hidden in their basement furnace", "That she was one of the vigilantes who burned Freddy alive decades ago", "That Nancy's father killed Freddy in secret without telling the police", "That Freddy visited Nancy as a child and she had blocked the memory out"],a:0,d:1},{q:"In Halloween III, what 9:00 PM event is triggered by the catchy \"Silver Shamrock\" jingle?",o:["The Big Giveaway", "The Horror Hour", "The Mask Parade", "The Magic Trick"],a:0,d:1},{q:"What is the killer's name in The Burning?",o:["Cropsy", "Victor", "Tommy", "Carl"],a:0,d:1},{q:"How does Cropsy get his injuries in The Burning?",o:["A fire set by campers as a prank", "A lake accident during a storm", "A chemical fire at the mess hall", "A hunting accident in the woods"],a:0,d:1},{q:"What weapon does Cropsy use in The Burning?",o:["Garden shears", "A long machete", "A fire axe", "A sickle"],a:0,d:1},{q:"Where is My Bloody Valentine 1981 set?",o:["A coal mining town", "A small port village", "A lumberjack camp", "A dairy farm town"],a:0,d:1},{q:"In My Bloody Valentine what event did the mining disaster interrupt?",o:["A Valentine's Day dance", "A miner's union meeting", "A church confirmation", "A high school reunion"],a:0,d:1},{q:"What weapon does the killer use in My Bloody Valentine?",o:["A pickaxe", "A shovel", "A drill", "A chainsaw"],a:0,d:1},{q:"What is the famous twist ending of Sleepaway Camp?",o:["Angela is revealed to be biologically male", "Angela has been dead the whole film already", "The camp director was the one behind it all", "Angela is possessed by her dead brother Peter"],a:0,d:1},{q:"What does the killer leave as a warning in My Bloody Valentine?",o:["A box of chocolates containing a human heart", "A valentine card written in the victim's blood", "A rose bouquet with severed fingers hidden inside", "A bloody locket with a photo of the dead victim"],a:0,d:1},{q:"What is the premise of It Follows?",o:["A supernatural entity is passed through sexual contact and slowly follows its target", "A group of college kids triggers a curse by breaking into an abandoned Detroit building at night", "A woman inherits a haunted house and must pass its curse to a living person to survive the year", "A chain letter curse must be forwarded to new victims or the recipient dies exactly one week later"],a:0,d:1},{q:"What do the killers in The Strangers say when asked why they attacked?",o:["You were home", "Because you were there", "We wanted to", "You had something we wanted"],a:0,d:1},{q:"What country is Wolf Creek set in?",o:["Canada", "New Zealand", "Australia", "South Africa"],a:2,d:1},{q:"What is the killer's name in Wolf Creek?",o:["Paul Hogan", "Mick Taylor", "Jack Wade", "Barry Clifford"],a:1,d:1},{q:"In Halloween III, which of these is NOT one of the three Silver Shamrock mask designs?",o:["Skull", "Vampire", "Hockey mask", "Witch"],a:1,d:1},{q:"What is the famous twist in Orphan 2009?",o:["Esther is actually a 33-year-old woman with a disorder that stunts her growth", "Esther is the adopted sister's real biological daughter returning to reclaim her rightful home", "Esther was the product of a twin experiment where her sibling died and her identity was stolen", "Esther has been possessed by the vengeful spirit of a girl who was murdered in the same orphanage"],a:0,d:1},{q:"What is the killer's name in the Hatchet series?",o:["Victor Crowley", "Harry Warden", "Madman Marz", "Roy Burns Jr"],a:0,d:1},{q:"What is unique about the killer in Final Destination?",o:["Death itself is the antagonist", "A ghost seeking revenge appears", "A serial killer stalks survivors", "A cursed object hunts the teens"],a:0,d:1},{q:"How does the first Final Destination begin?",o:["A premonition about a plane explosion", "A vision of a highway pile up disaster", "A prediction of a roller coaster derailing", "A warning about a burning office building"],a:0,d:1},{q:"What does the term final girl refer to in slasher films?",o:["The sole female survivor who confronts the killer", "The last woman killed by the slasher in each film", "The female character who seduces the killer to die", "The virginal love interest who dies last in the film"],a:0,d:1},{q:"Who stars in I Know What You Did Last Summer?",o:["Jennifer Love Hewitt and Sarah Michelle Gellar", "Neve Campbell and Courteney Cox Arquette III", "Reese Witherspoon and Alicia Silverstone Ryan", "Jennifer Lopez and Cameron Diaz Kennedy Jones"],a:0,d:1},{q:"What was Rob Zombie's directorial debut?",o:["House of 1000 Corpses", "The Devil's Rejects II", "31 A Zombie Picture", "Halloween II Remake"],a:0,d:1},{q:"What is the name of the killer family in Rob Zombie's films?",o:["The Firefly family", "The Sawyer clan kin", "The Maniac family", "The Crowley family"],a:0,d:1},{q:"Who stars in Ready or Not 2019?",o:["Margot Robbie", "Samara Weaving", "Elizabeth Olsen", "Anya Taylor-Joy"],a:1,d:1},{q:"Who stars in Prom Night 1980?",o:["Sissy Spacek", "Jamie Lee Curtis", "Brooke Shields", "Carrie Fisher"],a:1,d:1},{q:"What is the name of the 2022 prequel to X?",o:["XX", "Maxine", "Pearl", "Rose"],a:2,d:1},{q:"Who plays the title character in Pearl 2022?",o:["Mia Goth", "Jenna Ortega", "Anya Taylor-Joy", "Florence Pugh"],a:0,d:1},{q:"What are the killers in Wrong Turn?",o:["Inbred cannibalistic mutants", "Radioactive mountain hermits", "Escaped mental patients nearby", "Survivalist cult members armed"],a:0,d:1},{q:"Who plays Victor Crowley in the Hatchet films?",o:["Kane Hodder", "Doug Bradley", "Tyler Mane", "Ken Kirzinger"],a:0,d:1},{q:"What 1960 Hitchcock film is considered a proto-slasher?",o:["The Birds", "Vertigo", "Psycho", "Rear Window"],a:2,d:1},{q:"What do the teens cover up in I Know What You Did Last Summer?",o:["Hitting and killing a fisherman with their car", "Causing a drunken drowning at the prom party", "Robbing a gas station that ended up with death", "Accidentally burning down a classmate's lake home"],a:0,d:1},{q:"Who plays Art the Clown in the Terrifier films?",o:["David Howard Thornton", "Bill Skarsgard Junior", "Tim Curry in makeup", "Doug Jones the Third"],a:0,d:1},{q:"In Mike Flanagan's Hush, what makes the final girl unique?",o:["She is deaf and mute", "She is totally blind", "She is in a wheelchair", "She is a child aged ten"],a:0,d:1},{q:"What character does Sid Haig play in House of 1000 Corpses?",o:["Captain Spaulding", "Otis B Driftwood", "Dr Satan Coltrane", "Rufus Firefly Sr"],a:0,d:1},{q:"Where is The Funhouse set?",o:["A traveling carnival", "A boardwalk arcade", "An amusement park", "A seasonal fairground"],a:0,d:1},{q:"What is the premise of Fresh 2022?",o:["A woman discovers her new boyfriend harvests and sells human meat", "A family is hunted for sport by wealthy guests at a wedding retreat", "A woman is stalked by her obsessive ex from across her apartment hall", "Cannibalistic neighbors lure women through a dating app in a small town"],a:0,d:1}];
const Q2c0=[{q:"In Terrifier, what is Art the Clown's specific performance style?",o:["Art is specifically a mime-clown hybrid who never speaks", "Art was originally designed as a traditional rodeo style clown", "Art was based on an old 1970s New York street performer act", "Art was conceived to parody the circus clown Krusty from TV shows"],a:0,d:2},{q:"What does Chop-Top keep doing throughout Texas Chain Saw Massacre 2?",o:["Scratching his metal skull plate with a heated coat hanger and eating the burnt skin residue", "Constantly singing Vietnam War protest songs while miming a chainsaw dance in the hideout's kitchen", "Compulsively drawing portraits of Leatherface on the walls while whispering in a made up language", "Reciting long passages from the Texas state penal code to his family members during every meal time"],a:0,d:2},{q:"What does Freddy Krueger's glove have on the finger tips in the original?",o:["Four riveted knife blades", "Four butcher knives soldered on", "Sharpened garden shears welded on", "Steel spikes and barbed wire"],a:0,d:2},{q:"What city is Candyman: Farewell to the Flesh set in?",o:["New Orleans", "Savannah GA", "Baton Rouge", "Charleston"],a:0,d:2},{q:"What does Jigsaw say is the reason he puts people through traps?",o:["So they will appreciate life", "To punish criminals properly", "To entertain a secret audience", "For his own twisted amusement"],a:0,d:2},{q:"What rating did Terrifier receive from the MPAA?",o:["Unrated", "NC-17", "R+", "PG-13"],a:0,d:2},{q:"In Halloween why does Michael specifically return to Haddonfield?",o:["To kill Dr. Loomis", "To find and kill his sister", "To return home to the Myers house", "To escape the sanitarium territory"],a:1,d:2},{q:"The killer in Madman (1981) was originally going to be based on which NY urban legend?",o:["The Jersey Devil", "Bloody Mary", "Cropsey", "The Mothman"],a:2,d:2},{q:"In Friday the 13th Part 2, what does Ginny do to distract Jason?",o:["Puts on Pamela's sweater", "Burns the cabin with gasoline", "Hides under the floorboards", "Impersonates Alice from Part 1"],a:0,d:2},{q:"What percentage of Friday the 13th Part VIII is actually set in Manhattan?",o:["Less than a third", "About three quarters", "Roughly one half of it", "Only about one tenth"],a:0,d:2},{q:"In Terror Train, what disguise does Kenny wear when Alana finally discovers him?",o:["A monk's robe and hood", "The magician's female assistant", "Jackson's lizard costume", "Groucho Marx mask and suit"],a:1,d:2}];
const Q2c1=[{q:"Who dies first in Child's Play 1988?",o:["Charles Lee Ray", "Eddie Caputo Jr", "Maggie Peterson", "Mike Norris II"],a:0,d:2},{q:"What was the first major film featuring a family of killers?",o:["The Texas Chain Saw Massacre", "The Hills Have Eyes (1977)", "House of 1000 Corpses film", "Mother's Day Troma feature"],a:0,d:2},{q:"In Nightmare on Elm Street 3 what is Phillip's dream power?",o:["He can turn his veins into marionette strings to control his movements — Freddy uses this against him", "He can levitate and fly through the dreamscape — Freddy counters this by flooding the entire dream realm", "He can shapeshift into animal forms at will — Freddy uses this against him by forcing a permanent change", "He can see the future of his friends' deaths — Freddy exploits this by corrupting every vision he receives"],a:0,d:2},{q:"What does the killer in Maniac collect?",o:["Fingers", "Scalps", "Eyes", "Ears"],a:1,d:2},{q:"What is the name of the main protagonist in Jason Goes to Hell?",o:["Tommy Jarvis", "Steven Freeman", "Roy Burns", "Creighton Duke"],a:1,d:2},{q:"In Friday the 13th Part V, what distinctive detail on the killer's hockey mask proves it isn't the real Jason?",o:["The chevrons are blue", "It has 6 holes", "It has a Toys R Us logo", "It has one chevron"],a:0,d:2},{q:"Who plays Crowley's father in the original Hatchet backstory?",o:["Tony Todd", "Robert Englund", "John Carl Buechler", "Derek Mears"],a:1,d:2}];
const Q2c2=[{q:"In A New Beginning, which character is the first to be murdered, triggering the film’s entire plot?",o:["Pete", "Joey", "Billy", "Vinnie"],a:1,d:2},{q:"What is the Texas Chain Saw Massacre's famous opening claim?",o:["The film presents itself as based on real events", "The narrator says the killings were never solved", "An on-screen date claims August 18th of a year ago", "The text claims it was filmed at the actual crime scene"],a:0,d:2},{q:"Who plays Winslow Foxworth Coltrane in 3 From Hell?",o:["Richard Brake", "Jeff Daniel Phillips", "Bill Moseley", "Pancho Moler"],a:0,d:2}];
const Q2c3=[{q:"In Halloween H20, how does Laurie Strode finally discover that Michael has found her at the school?",o:["She sees his face through a door portal", "She sees his reflection in a window", "She finds a drawing in a classroom", "She finds her son's bloodied sweater"],a:0,d:2},{q:"How many kills does Chucky have in Child's Play 1988?",o:["2", "3", "4", "5"],a:2,d:2},{q:"What does Freddy say in Nightmare on Elm Street 4 when he kills Debbie?",o:["Welcome to the jungle", "What a rush", "No pain no gain", "Bodies in motion"],a:2,d:2},{q:"What does Tommy Jarvis do to distract Jason in Friday the 13th Part 4: The Final Chapter?",o:["He shaves his head and calls Jason's name to confuse him", "He dresses in his dead sister's clothes and mimics her voice", "He plays a recording of Pamela Voorhees through cabin speakers", "He sets off homemade explosives in a rhythm to lure Jason in"],a:0,d:2}];
const Q2c4=[{q:"What does Nancy's father do for a living in Nightmare on Elm Street?",o:["He is a police officer", "He is a school teacher", "He is a firefighter chief", "He is a county doctor"],a:0,d:2},{q:"In Halloween H20, which character's death is discovered when their body is found hanging in a pantry with their throat slit by a corkscrew?",o:["Charlie", "Will", "Jimmy", "Sarah"],a:0,d:2},{q:"What color robe does Ghostface wear?",o:["Black", "Black with a white trim", "Pure black", "A dark navy"],a:0,d:2},{q:"How much did Terrifier 2 gross at the box office?",o:["Over $10 million", "Over $2 million", "Over $25 million", "Over $50 million"],a:0,d:2},{q:"What year was 3 From Hell released?",o:["2018", "2019", "2020", "2021"],a:1,d:2}];
const Q2c5=[{q:"What is the killer's costume in Happy Death Day?",o:["A pumpkin mask", "A clown costume", "A baby face mask", "A hockey mask"],a:2,d:2},{q:"What was the working title of Jigsaw (2017)?",o:["Saw VIII", "Saw: Legacy", "Jigsaw Returns", "Saw Reborn"],a:1,d:2},{q:"Why are Freddy's colors red and green?",o:["Wes Craven chose them", "It was an accident", "Robert Englund chose them", "The studio suggested them"],a:0,d:2},{q:"In Child's Play 2, where does Chucky track Andy?",o:["His foster family's home", "An orphanage and school", "A psychiatric hospital", "His grandmother's farm"],a:0,d:2},{q:"In The Texas Chain Saw Massacre what does the hitchhiker do in the van?",o:["He cuts himself and Mark and is thrown out", "He attacks the driver with a sharpened knife", "He tries to steal the keys while they are driving", "He sings disturbing songs until they pull over fast"],a:0,d:2}];
const Q2c9=[{q:"What is Amanda's fatal flaw according to Jigsaw?",o:["She is too violent", "She sets inescapable traps", "She gets too close to victims", "She is cowardly"],a:1,d:2},{q:"In Rob Zombie’s Halloween (2007), what is the name of the first person Michael Myers kills while inside Smith's Grove Sanitarium?",o:["Nurse Wynn", "Ismael Cruz", "Dr Loomis", "Nurse Frost"],a:0,d:2},{q:"In The Devil's Rejects, what is the name of the two-man bounty hunting team hired by Sheriff Wydell to track down the Firefly family?",o:["The Unholy Two", "The Reapers", "The Devil’s Duo", "The Midnight Riders"],a:0,d:2},{q:"What does Freddy need to come back to power in Freddy vs. Jason?",o:["New victims", "Fear", "A blood sacrifice", "His glove"],a:1,d:2}];
const Q2c17=[{q:"How does Jason get his hockey mask in Friday the 13th Part 3?",o:["He takes it from Shelly after killing him", "He finds it buried in a barn loft trunk", "A girl throws it at him during her escape", "He wears it through the entire film's scenes"],a:0,d:2},{q:"What 1984 slasher features a killer at a New Year's Eve party?",o:["New Year's Evil", "Bloodbath", "Store of Terror", "Midnight Massacre"],a:0,d:2},{q:"How does Jason board the ship in Part VIII?",o:["He walks from the lake bottom", "He is shipped aboard as cargo", "He swims onto the boat's hull", "He stows away on the dock"],a:0,d:2},{q:"How was Cropsy burned in The Burning?",o:["Campers placed a rotting worm-covered skull with candles beside his bed as a prank — he woke in panic", "A cabin grease fire started while Cropsy was sleeping inside during his shift as the camp's maintenance head", "A lantern overturned on his bunk during a storm and spilled kerosene across the bedding while he was asleep", "A lit cigarette ignited the straw mattress after he fell asleep and the whole cabin caught fire around him"],a:0,d:2},{q:"What is unique about Victor Crowley as a slasher villain?",o:["He uses only one weapon", "He is a ghost", "He can't be killed", "He only kills at night"],a:1,d:2},{q:"What distinguishes Terror Train's kills from other slashers?",o:["The killer uses the victims' own party costumes to disguise himself and move freely among the revelers", "The confined space of the train means victims cannot simply run — every direction leads to more locked cars", "Kills happen almost entirely off screen with the killer's identity obscured through heavy fog and dim lanterns", "The killer strikes only during the magic show performances to hide each death within the stage act's illusions"],a:0,d:2}];
const Q2c18=[{q:"What Robert Englund role appears in the original Hatchet?",o:["A swamp tour guide who dies", "A backwoods police sheriff", "A museum curator cameo role", "A victim in the opening scene"],a:0,d:2},{q:"How does Jason kill Alice in Friday the 13th Part 2?",o:["He stabs her with an ice pick", "He drowns her in her bathtub", "He uses a machete on her neck", "He strangles her with a rope"],a:0,d:2},{q:"What year was Child's Play 3 released?",o:["1990", "1991", "1992", "1993"],a:1,d:2},{q:"What was Billy Loomis's motive for killing Sidney's mother?",o:["Maureen had an affair with his father which broke up his family", "Maureen had killed his younger sister years before the events of Scream", "He was hired to do it by her jealous husband and paid a large sum", "He was copying a killing he had seen his own grandfather commit at thirteen"],a:0,d:2},{q:"What does Freddy want to do through Jesse in Part 2 that differs?",o:["Possess Jesse to kill in the physical world", "Rebuild his body through Jesse's dreams alone", "Build a cult around Jesse's Elm Street friends", "Erase Jesse's memories and become him entirely"],a:0,d:2},{q:"In My Bloody Valentine (1981), how many years before do the original murders?",o:["5 years", "10 years", "20 years", "25 years"],a:2,d:2}];
const Q2c21=[{q:"What is Eleanor's role in Jigsaw (2017)?",o:["A medical examiner who is a Jigsaw fan", "A homicide detective chasing the case", "A copycat killer running her own traps", "A survivor from an earlier Jigsaw game"],a:0,d:2},{q:"In The Prowler (1981), what specific graduation year is written on the banner at the dance where the killer returns to seek revenge?",o:["1945", "1946", "1950", "1955"],a:0,d:2},{q:"In Black Christmas (1974), what is the name of the sorority house mother who is murdered and hidden in the attic?",o:["Ms. Mac", "Ms. Higgins", "Ms. Gable", "Ms. Walker"],a:0,d:2},{q:"What is the ending of Texas Chain Saw Massacre 2?",o:["Stretch survives and raises Leatherface's chainsaw", "Lefty kills Leatherface in the underground hideout", "Everyone dies as the cavern explodes from gas leaks", "Stretch and Leatherface flee the cave together quietly"],a:0,d:2},{q:"What is Pamela Voorhees' occupation at Camp Crystal Lake?",o:["Nurse", "Cook", "Counselor", "Owner"],a:1,d:2},{q:"What is Angela's philosophy in Sleepaway Camp 2?",o:["Kill all rule-breakers and bad campers", "Kill victims in strict alphabetical order", "Kill only the counselors one by one each", "Kill only during full moons at midnight"],a:0,d:2},{q:"What was Johnny Depp's first film role?",o:["Nightmare on Elm Street", "Platoon by Oliver Stone", "Edward Scissorhands film", "Private Resort teen movie"],a:0,d:2},{q:"In the movie Scream, which horror film is the character Casey Becker (Drew Barrymore) unable to name the killer of during the opening phone call?",o:["Halloween", "Friday the 13th", "Psycho", "The Texas Chainsaw Massacre"],a:1,d:2},{q:"What is the name of the killer in The Funhouse (1981)?",o:["The Monster", "Gunther", "The Carnival Freak", "Conrad"],a:1,d:2},{q:"What is the setting of Sleepaway Camp 2?",o:["Camp Arawak again", "Camp Rolling Hills", "Camp New Horizon", "Camp Waterfront"],a:1,d:2},{q:"What did Sean Cunningham say he would never do regarding Jason after Part IV?",o:["Kill Jason permanently", "Make another sequel", "Recast Jason totally", "Change Jason's look"],a:0,d:2},{q:"In the movie Scream, what is the name of the news cameraman who works alongside Gale Weathers?",o:["Kenny", "Joel", "Steve", "Benny"],a:0,d:2},{q:"How many survivors are there at the end of Texas Chain Saw Massacre 1974?",o:["0", "1", "2", "3"],a:1,d:2},{q:"Who is the first victim shown in Terrifier 2016?",o:["Dawn", "Tara", "Allie", "Victoria"],a:2,d:2},{q:"What character does Courteney Cox play and what is her arc across the franchise?",o:["Sidney's friend", "Gale Weathers", "A detective", "A journalist who dies"],a:1,d:2}];
const Q2c28=[{q:"Who is Harry Warden in My Bloody Valentine?",o:["The miner who survived a cave-in by eating the other trapped miners and went insane — he became the killer", "The mine owner who caused the collapse and was later murdered by families of the dead miners in the tunnels", "A local police detective who investigated the original mine collapse and disappeared into the shafts one night", "An old legend made up by local townspeople to scare children away from the abandoned Hanniger family coal mines"],a:0,d:2},{q:"In Valentine (2001), what is the killer's disguise?",o:["A Cupid mask", "A heart-shaped mask", "A Valentine mask", "A cherub mask"],a:0,d:2},{q:"What is the legend of Victor Crowley?",o:["He was accidentally killed by his father on Halloween night and now haunts the Louisiana swamp", "He was burned alive in his family cabin by cruel neighbors and now seeks vengeance in the Louisiana bayou", "He was drowned by bullies as a child in the swamp behind his family's home and now hunts tour boat guests", "He was struck by a falling tree during a bad storm and survived to roam the swamps and murder any trespassers"],a:0,d:2}];
const Q2c29=[{q:"How many kills are in Scream 6?",o:["10", "12", "14", "16"],a:1,d:2},{q:"What slasher film involves a killer at a summer theater camp?",o:["Stage Fright", "Sleepaway Camp", "The Funhouse", "Curtains"],a:0,d:2},{q:"What is the runtime of Terrifier 2?",o:["2 hours 18 minutes", "2 hours 30 minutes", "1 hour 52 minutes", "3 hours 5 minutes"],a:0,d:2},{q:"Who plays Lieutenant 'Lefty' Enright in Texas Chain Saw Massacre 2?",o:["Dennis Hopper", "Bill Moseley", "Jim Siedow", "Edwin Neal"],a:0,d:2},{q:"What is the name of the main protagonist in Hatchet 2?",o:["Marybeth Dunston", "Marybeth Wilson", "Kelly Morse", "Lisa Crowley"],a:0,d:2},{q:"How many Jigsaw traps are shown in Saw 2004?",o:["2", "3", "4", "5"],a:1,d:2},{q:"What is the tone difference between House of 1000 Corpses and Devil's Rejects?",o:["House is a stylized horror movie homage while The Devil's Rejects is a gritty realistic road movie about outlaws", "House has supernatural and occult elements throughout while The Devil's Rejects strips those out for pure realism grit", "House features the Firefly siblings alone while The Devil's Rejects expands the family across several generations on screen", "House was shot mostly on soundstages with heavy lighting tricks while The Devil's Rejects was filmed on location in the desert"],a:0,d:2},{q:"What slasher film is set at an ice rink?",o:["Cold Steel", "Iced", "Rink of Death", "Ice Cream Man"],a:1,d:2},{q:"What camp activity takes place the night Jason drowned?",o:["Counselors were having sex and ignoring their duties — the negligence that let Jason drown became the franchise's core moral code", "Counselors were drinking illegal moonshine around the campfire and missed Jason's cries for help as he thrashed in the dark lake waters", "Counselors were playing strip poker in one of the cabins during their watch and failed to notice Jason wander off to the water alone", "Counselors were smoking marijuana behind the mess hall and lost track of the children in their care while Jason drifted out into the lake"],a:0,d:2},{q:"What color was the original Captain Kirk mask before it was painted?",o:["Flesh tone", "Bone white", "Pale gray", "Dirty tan"],a:0,d:2},{q:"How many people die in Saw II?",o:["10", "8", "12", "6"],a:0,d:2},{q:"What does the killer in The Town That Dreaded Sundown call himself?",o:["The Phantom Killer", "The Texarkana Terror", "The Moon Killer", "The Night Stalker"],a:0,d:2},{q:"What Tony Todd role appears in Hatchet?",o:["A tour boat captain", "A Louisiana marsh guide", "A voodoo shop owner", "A swampside fisherman"],a:0,d:2},{q:"In My Bloody Valentine, who is the killer revealed to be?",o:["Tom Hanniger", "Axel Palmer", "Harry Warden", "Mabel Osborne"],a:1,d:2},{q:"What is the name of the first actress to play a Final Girl in a slasher?",o:["Janet Leigh in Psycho", "Sally Hardesty in TCM", "Marilyn Burns is often cited", "Laurie Strode in Halloween"],a:2,d:2},{q:"What is the trap in Jigsaw (2017)'s opening scene?",o:["A bucket on the head with razor blades", "A circular saw suspended above victims", "A series of rotating floor mounted blades", "A spinning cage filled with shards of glass"],a:0,d:2},{q:"What does Art the Clown want?",o:["He has no stated motive — he kills purely for his own enjoyment", "He seeks revenge against a specific Miles County family bloodline", "He is under the influence of an ancient demonic Louisiana pact", "He is collecting trophies to complete his murder museum basement"],a:0,d:2},{q:"In House of 1000 Corpses, what is the name of the legendary local killer that Captain Spaulding tells the teenagers about at the start of the film?",o:["Tiny", "Dr Satan", "Dr Death", "Earl Firefly"],a:1,d:2},{q:"How many attacks does The Phantom Killer make in The Town That Dreaded Sundown?",o:["5", "8", "10", "12"],a:1,d:2},{q:"Who plays Chop-Top in Texas Chain Saw Massacre 2?",o:["Bill Moseley", "Dennis Hopper", "Jim Siedow", "Bill Johnson"],a:0,d:2},{q:"In The Prowler (1981), what kills method does the killer use exclusively?",o:["Only a pitchfork", "Military weaponry and gardening tools", "Only a bayonet", "A pitchfork and bayonet"],a:3,d:2},{q:"What does Kenny Hampson do after his humiliation in Terror Train?",o:["He is institutionalized after a prank goes wrong and returns years later as the costumed killer on the train", "He goes missing immediately after the school prank and is never seen again until the killings aboard the New Year's train", "He spends years in a state prison for assaulting the pranksters and emerges to hunt them down one by one aboard the train", "He takes his own life soon after the incident but his spirit returns to haunt the graduating class during their New Year's trip"],a:0,d:2},{q:"What slasher film features killings at a sorority house?",o:["The House on Sorority Row", "Black Christmas (1974)", "Sorority Babes in Video", "Sorority Row (2009)"],a:0,d:2},{q:"In Curtains (1983), what mask does the killer wear?",o:["A hag mask", "A pig mask", "A doll mask", "A blank white mask"],a:0,d:2},{q:"How long is Cropsy hospitalized in The Burning?",o:["1 year", "3 years", "5 years", "Over 5 years"],a:2,d:2},{q:"Which actor played Jason Voorhees the most times?",o:["Richard Brooker", "C.J. Graham", "Kane Hodder", "Derek Mears"],a:2,d:2},{q:"How long was You're Next held before release after completion?",o:["6 months", "Two years", "One year", "Three years"],a:1,d:2},{q:"Who directed Shocker?",o:["Wes Craven", "John Carpenter", "Larry Cohen", "Tobe Hooper"],a:0,d:2}];
const Q2c40=[{q:"In the movie Silent Night, Deadly Night, what specific \"sin\" triggers Billy's grandfather to warn him that Santa Claus punishes children on Christmas Eve?",o:["Being Naughty", "Lying", "Saying a bad word", "Stealing"],a:0,d:2},{q:"What is the killer's gimmick in New Year's Evil?",o:["He kills at midnight in each time zone", "He only kills on the hour through the night", "He calls his victims and counts down at dawn", "He kills in alphabetical order of their last names"],a:0,d:2},{q:"How many people does Freddy kill in Nightmare on Elm Street 3?",o:["4", "5", "6", "7"],a:2,d:2},{q:"What is Helen Lyle's profession in Candyman?",o:["A graduate student researching urban legends", "A Chicago police detective working homicide", "A local journalist from the Tribune newspaper", "A social worker at the Cabrini-Green housing"],a:0,d:2},{q:"Who plays Helen Lyle in Candyman?",o:["Vanessa Williams", "Virginia Madsen", "Kasi Lemmons", "Xander Berkeley"],a:1,d:2},{q:"What is the body count in Friday the 13th Part VII The New Blood?",o:["10", "12", "15", "17"],a:1,d:2},{q:"Who plays Detective Hoffman in SAW?",o:["Costas Mandylor", "Angus Macfadyen", "Tobin Bell", "Betsy Russell"],a:0,d:2},{q:"In Happy Death Day 2U, what actually causes the time loop?",o:["A quantum reactor built by Ryan causes a dimensional rift creating the loop", "An ancient curse tied to the birthday of the main character causes the repeating day to happen", "A rogue teaching assistant slipped the protagonist an experimental drug that caused the time loop", "The original killer from the first film uses a cursed locket to trap the heroine in a repeating day"],a:0,d:2},{q:"In the movie Silent Night, Deadly Night, what specific item does Billy use to kill the store bully, Mr. Sims, during the toy store massacre?",o:["A string of Christmas lights", "A bow and arrow from the toy aisle", "A claw hammer from the hardware aisle", "An axe from the sporting goods aisle"],a:0,d:2},{q:"What is Heather Langenkamp's real life situation when New Nightmare begins?",o:["She is being stalked by a real-life fan while being asked to star in a new Nightmare film — the film blurs her reality with fiction", "She has retired from acting and is living a quiet suburban family life when Wes Craven personally reaches out to pitch her a bold new concept", "She is making a documentary about the Nightmare on Elm Street franchise when strange things begin happening that mirror scenes from the original movies", "She is writing a tell-all book about her years of working with Wes Craven on horror films when eerie parallels to the Nightmare stories start manifesting"],a:0,d:2},{q:"What makes the Hatchet franchise distinctive?",o:["The highest kill counts and most extreme practical gore effects of any modern slasher franchise to date", "Victor Crowley's kills are notable for their creative brutality and complete reliance on practical makeup effects work", "The franchise is shot almost entirely in a single Louisiana bayou location over all four films with the same small crew", "Every film opens with a direct cameo from a classic horror icon like Robert Englund Tony Todd or Kane Hodder or Sid Haig"],a:0,d:2},{q:"How long is the confessional monologue at the end of Pearl?",o:["About 8 unbroken minutes", "About 3 unbroken minutes", "About 12 unbroken minutes", "About 5 unbroken minutes"],a:0,d:2},{q:"In Slumber Party Massacre, who are the targets?",o:["High school girls at a sleepover", "College sorority girls at a party", "Camp counselors at a lake retreat", "A bachelorette party in a cabin"],a:0,d:2},{q:"In the movie Silent Night, Deadly Night, what does Billy's younger brother, Ricky, say at the very end of the film while looking at a nun?",o:["Punish", "Naughty!", "Ho ho ho", "Die!"],a:1,d:2},{q:"In the movie Silent Night, Deadly Night, what is the name of the toy store where Billy is forced to work during the holiday season?",o:["Ira’s Toys", "Santa’s Village", "Gulf Coast Toys", "Toys R Us"],a:0,d:2},{q:"What is the connection between Pearl and X in Ti West's trilogy?",o:["Pearl is a prequel to X set decades earlier", "Pearl is a sequel to X set immediately after", "Pearl takes place in a parallel universe story", "Pearl is a re-edit of footage filmed during X"],a:0,d:2},{q:"Who directed Black Christmas 1974?",o:["John Carpenter", "Wes Craven", "Bob Clark", "Tobe Hooper"],a:2,d:2},{q:"What actress starred in Black Christmas 1974?",o:["Jamie Lee Curtis", "Olivia Hussey", "Sigourney Weaver", "Carrie Fisher"],a:1,d:2},{q:"In the movie I Know What You Did Last Summer, what is the name of the town where the four friends hit Ben Willis with their car?",o:["Woodsboro", "Silver Shamrock", "Southport", "Haddonfield"],a:2,d:2},{q:"What city is Maniac 1980 set in?",o:["New York City", "Los Angeles", "San Francisco", "Philadelphia"],a:0,d:2},{q:"Maniac 1980 was remade in 2012 with which actor?",o:["Elijah Wood", "Michael Fassbender", "Ryan Gosling", "James McAvoy"],a:0,d:2},{q:"Where is Sleepaway Camp set?",o:["Camp Crystal Lake", "Camp Arawak", "Camp Blackwood", "Camp Pinewood"],a:1,d:2},{q:"Where is Madman 1982 set?",o:["A farm", "A summer camp", "A cabin in the woods", "A mental institution"],a:1,d:2},{q:"What weapon does the killer use in Pieces?",o:["A chainsaw", "A butcher knife", "A fire axe", "A sickle"],a:0,d:2},{q:"What is the killer collecting in Pieces?",o:["Body parts to reassemble a human jigsaw", "Severed hands to preserve in jars of oil", "Human teeth to string together as a necklace", "Eyes that he keeps preserved in small jars"],a:0,d:2},{q:"What is The Funhouse monster?",o:["A deformed carnival barker's son", "A werewolf who stalks by moonlight", "A ghost of a murdered carnival ride worker", "A demon summoned by a fortune teller"],a:0,d:2},{q:"Who directed The Funhouse 1981?",o:["Wes Craven", "Tobe Hooper", "John Carpenter", "Sean Cunningham"],a:1,d:2},{q:"What motivates the killer in Prom Night 1980?",o:["The accidental death of a child years earlier", "The killer was humiliated at the prom court", "A jealous romantic rivalry over a popular boy", "The killer was rejected for a date to the prom"],a:0,d:2},{q:"What triggers the killing in The House on Sorority Row?",o:["A prank that accidentally kills their housemother", "A rejected sorority pledge plots bloody revenge", "A ghost from the house's history returns to haunt", "A curse tied to the sorority's founding family line"],a:0,d:2},{q:"What is the 2009 remake of the 1983 slasher starring Eileen Davidson?",o:["Sorority Row", "Sorority House Massacre", "Pledge Night", "Rush Week"],a:0,d:2},{q:"Who directed You're Next?",o:["James Wan", "Ti West", "Adam Wingard", "Mike Flanagan"],a:2,d:2},{q:"What is the motive behind the attacks in You're Next?",o:["A hired hit for inheritance money", "A random thrill kill by masked men", "Revenge for an old family business feud", "A satanic ritual for the blood moon night"],a:0,d:2},{q:"What is unique about the entity in It Follows?",o:["It runs fast", "It can only be seen by the person it is following", "It walks slowly but never stops", "It appears only at night"],a:2,d:2},{q:"Who directed It Follows?",o:["David Robert Mitchell", "Jeremy Saulnier Jr", "Trey Edward Shults", "Jeff Nichols Davis"],a:0,d:2},{q:"What is The Strangers claim to be based on?",o:["True events and the Manson murders", "A 1970s crime novel by Peter Straub", "An urban legend from the Midwest US", "The writer's childhood home break in"],a:0,d:2},{q:"Who directed The Strangers?",o:["Rob Zombie", "Bryan Bertino", "James DeMonaco", "Adam Wingard"],a:1,d:2},{q:"Wolf Creek claims to be based on what?",o:["Pure fiction", "True events", "A novel", "A documentary"],a:1,d:2},{q:"What is the controversial twist in High Tension?",o:["The final girl was the killer all along", "The killer turns out to be a ghost figure", "The whole film was one character's dream", "The victims were already dead the whole time"],a:0,d:2},{q:"What is Victor Crowley's backstory in Hatchet?",o:["A deformed boy accidentally killed by his own father", "A Vietnam veteran driven insane by combat flashbacks", "An escaped mental patient stalking his childhood home", "A wrongly executed man whose spirit remains as vengeance"],a:0,d:2},{q:"In the movie Urban Legend, which character is the first to be killed after being told their back seat was occupied by a killer at a gas station?",o:["Brenda", "Natalie", "Paul", "Michelle"],a:3,d:2},{q:"Where is Hatchet set?",o:["The Everglades", "The Louisiana bayou", "The Florida swamps", "The Mississippi delta"],a:1,d:2},{q:"What is the kill method in Happy Birthday to Me that is shown on the poster?",o:["A birthday cake with a knife", "A skull with candles", "A shish kebab through the mouth", "A severed head on a plate"],a:2,d:2},{q:"What is a giallo film?",o:["An Italian thriller subgenre with stylized kills and mystery elements", "A French horror subgenre known for its cold detached visual style", "A Japanese psychological horror subgenre popular from the 1960s on", "A British dark mystery film style popularized by Hammer Studios"],a:0,d:2},{q:"What Dario Argento film is considered a giallo masterpiece?",o:["Suspiria", "Deep Red", "Phenomena", "Opera"],a:1,d:2},{q:"What does the killer in Urban Legend wear?",o:["A hockey mask", "An arctic parka", "A monster mask", "A clown costume"],a:1,d:2},{q:"What famous horror actor cameos as a professor in Urban Legend?",o:["Robert Englund", "Brad Dourif Sr", "Kane Hodder III", "Tony Todd Jr"],a:0,d:2},{q:"Who wrote the screenplay for I Know What You Did Last Summer?",o:["Kevin Williamson", "Wes Craven Ryan", "David S Goyer Jr", "John Carpenter"],a:0,d:2},{q:"In the 1980 movie Prom Night, what is the name of the child who accidentally falls to her death during a game of \"Killer\" in the prologue?",o:["Kelly Lynch", "Wendy Richards", "Jude Cunningham", "Robin Hammond"],a:3,d:2},{q:"What country is Eden Lake set in?",o:["USA", "Australia", "England", "Canada"],a:2,d:2},{q:"What makes Eden Lake particularly disturbing?",o:["The killers are teenagers with no remorse", "It is supposedly based on a true British case", "The victim is a small child who gets targeted", "Supernatural elements enter during the final act"],a:0,d:2},{q:"In the movie Hell Night, what is the name of the deformed killer who lives in the tunnels beneath Garth Manor?",o:["Peter", "Lawrence", "Charles", "Andrew"],a:3,d:2},{q:"In the 1981 movie The Funhouse, what is the physical deformity of the killer, Gunther, that is hidden under a Frankenstein mask?",o:["He has no eyes", "He has two heads (one vestigial)", "He is missing his jaw", "He has a cracked skull"],a:1,d:2},{q:"What song plays over the end credits of The Devil's Rejects?",o:["Freebird", "Sweet Home Alabama", "Simple Man", "Ramblin Man"],a:0,d:2},{q:"What is the rule in Final Destination about cheating death?",o:["Death comes back for those who cheated it in order", "Death gives them exactly one extra day to live", "Death can be beaten if the design is destroyed", "Death sends a warning vision before each victim"],a:0,d:2},{q:"What is the significance of the year 1978 in slasher history?",o:["Halloween was released changing horror forever", "Friday the 13th was released ahead of schedule", "The first recognized final girl appeared on screen", "The first slasher film was released theatrically"],a:0,d:2},{q:"In the movie Student Bodies, what is the unusual item that the killer, \"The Breather,\" uses to kill his victims?",o:["A trophy", "A textbook", "A rolling pin", "A paperclip"],a:3,d:2},{q:"What is the premise of Hush by Mike Flanagan?",o:["A deaf woman is stalked in her isolated home", "A blind writer survives a killer in the woods", "A mute librarian fights back on a snowy night", "A trapped woman is stalked through her car's GPS"],a:0,d:2},{q:"Who directed High Tension 2003?",o:["Pascal Laugier", "Alexandre Aja", "Xavier Gens", "Robin Hardy"],a:1,d:2},{q:"What is the Madman Marz legend?",o:["A farmer who killed his family and returns when his name is called", "A Vietnam veteran who lost his mind and stalks the Catskills mountains", "A wrongly executed convict who haunts the camp where he was captured", "A drowned boy whose spirit rises when teenagers light the summer campfire"],a:0,d:2}];
const Q3c2=[{q:"In A Nightmare on Elm Street 3: Dream Warriors, what was the name of the nun (Freddy's mother) who informs Nancy and Dr. Neil Gordon about how to defeat him?",o:["Sister Mary Helena", "Sister Mary Katherine", "Sister Margaret", "Sister Theresa"],a:0,d:3},{q:"How many people does Jason kill in Jason X?",o:["16", "20", "23", "25"],a:2,d:3},{q:"In the original Child's Play (1988), what is the name of the detective who shoots and kills Charles Lee Ray in the toy store at the beginning of the film?",o:["Jack Santos", "Vincent Drugger", "Mike Norris", "Karen Barclay"],a:2,d:3},{q:"Who created the Chucky TV series?",o:["Tom Holland", "Don Mancini", "Brad Dourif", "Lars Klevberg"],a:1,d:3},{q:"In Halloween II (1981), what is the name of the teenager who is wearing a similar costume to Michael Myers and is accidentally hit by a police car and killed?",o:["Ben Tramer", "Lonnie Elam", "Richie Castle", "Keith Richards"],a:0,d:3},{q:"In A Nightmare on Elm Street (1984), what is the name of the high school that Nancy and her friends attend?",o:["Westin Hills", "Springwood High", "Elm Street Preparatory", "Ridgemont High"],a:1,d:3},{q:"What is the phrase that activates Candyman in the 2021 film?",o:["Say his name", "Call his name", "Candyman five times", "Say 'Candyman'"],a:3,d:3},{q:"What Chicago housing project is central to the Candyman mythology?",o:["Robert Taylor Homes", "Cabrini-Green", "Stateway Gardens", "The Ida B. Wells Homes"],a:1,d:3},{q:"What real Hollywood events does MaXXXine reference?",o:["The Night Stalker murders of the 1980s", "The Hillside Strangler murders in 1977", "The Manson Family murders from 1969", "The Zodiac Killer cases in San Francisco"],a:0,d:3},{q:"In Scream, what horror movie does Billy Loomis famously quote when he says, \"We all go a little mad sometimes\"?",o:["Halloween", "The Texas Chain Saw Massacre", "Psycho", "Peeping Tom"],a:2,d:3},{q:"In the movie A Nightmare on Elm Street 4: The Dream Master, how is Freddy Krueger finally defeated by Alice?",o:["He is pulled into the real world", "He is shown his own reflection in a mirror", "He is doused in holy water", "He is burned in a boiler room"],a:1,d:3},{q:"In the movie Scream, what is the name of the high school principal who is murdered and hung from the goalposts of the football field?",o:["Principal Walker", "Principal Himbry", "Principal Arthur Himbry", "Principal Gibbs"],a:2,d:3},{q:"In the movie The Texas Chain Saw Massacre (1974), what is the name of the gas station owner who is revealed to be the eldest brother of the family?",o:["Nubbins", "Paul", "Drayton", "Oliver"],a:2,d:3},{q:"In the movie Halloween H20: 20 Years Later, what is the name of the character played by LL Cool J who survives the film despite being shot?",o:["Charlie", "Will", "Ronny", "Jimmy"],a:2,d:3},{q:"In the movie Wes Craven's New Nightmare, what is the name of Heather Langenkamp's son who becomes the target of the \"real\" Freddy?",o:["Dylan", "Jesse", "Chuck", "Danny"],a:0,d:3},{q:"In the movie Bride of Chucky, what was the name of Tiffany Valentine's boyfriend before she resurrected Chucky and was turned into a doll?",o:["Damien", "Jesse", "David", "Russ"],a:0,d:3},{q:"What is Maxine's goal in MaXXXine?",o:["To become a Hollywood actress", "To escape Pearl's tragic fate", "To avenge X's dead victims", "To find her real birth father"],a:0,d:3},{q:"In the movie Halloween II (1981), how many times is Dr. Loomis shown shooting Michael Myers in the sequel's opening scene?",o:["Five times", "Six times", "Seven times", "Eight times"],a:2,d:3}];
const Q3c9=[{q:"In the movie Hellbound: Hellraiser II, what is the name of the mute girl who is skilled at solving puzzles and is used to open the Lament Configuration?",o:["Kirsty", "Tiffany", "Julia", "Claire"],a:1,d:3},{q:"In the movie Scream, what specific movie is being watched on TV at the party when Ghostface attacks?",o:["Psycho", "Prom Night", "The Texas Chain Saw Massacre", "Halloween"],a:3,d:3}];
const Q3c10=[{q:"In the movie Halloween (1978), what is the name of the actor who played Michael Myers for most of the film and is credited as The Shape?",o:["Nick Castle", "Tony Moran", "James Jude Courtney", "Dick Warlock"],a:0,d:3},{q:"In Friday the 13th Part III, what is the name of the biker gang member who survives his initial encounter with Jason only to be killed later in the barn?",o:["Loco", "Fox", "Ali", "Rick"],a:2,d:3},{q:"In Friday the 13th: The Final Chapter, what is the name of the hitchhiker who is killed while eating a banana by the side of the road?",o:["Tina", "Terri", "Samantha", "She has no name"],a:3,d:3},{q:"In Friday the 13th Part VI: Jason Lives, what is the name of the cemetery where Tommy Jarvis accidentally resurrects Jason with a lightning strike?",o:["Eternal Peace Cemetery", "Green Valley Cemetery", "Crystal Lake Cemetery", "Blackwood Cemetery"],a:0,d:3}];
const Q3c11=[{q:"In Friday the 13th Part VII: The New Blood, what is the name of the doctor who is secretly using Tina's telekinetic powers for his own research?",o:["Dr. Howell", "Dr. Crews", "Dr. Gordon", "Dr. Sartain"],a:1,d:3},{q:"In Friday the 13th Part VIII: Jason Takes Manhattan, what is the name of the cruise ship that the graduating seniors take to New York?",o:["The S.S. Crystal Lake", "The Lazarus", "The Neptune", "The Poseidon"],a:1,d:3},{q:"What does Dylan keep chanting in New Nightmare?",o:["Now I lay me down to sleep prayer", "The original Freddy Krueger rhyme", "The Elm Street address over again", "Heather's full name over and over"],a:0,d:3}];
const Q3c12=[{q:"In Jason Goes to Hell: The Final Friday, what is the name of the bounty hunter who tracks Jason and is the only person who knows how to truly kill him?",o:["Steven Freeman", "Duke", "Creighton Duke", "Elias Voorhees"],a:2,d:3},{q:"In Friday the 13th Part 2, what is the name of the dog that belongs to Terry and disappears early in the film?",o:["Lucky", "Muffin", "Buddy", "Bear"],a:1,d:3},{q:"In the movie Hostel, what is the name of the \"business\" that allows wealthy clients to pay to torture and kill human beings?",o:["The Hunting Club", "Elite Hunting", "Blood Sport International", "The Butcher Shop"],a:1,d:3},{q:"What is The Black Phone's specific period detail that enhances its horror?",o:["Its 1978 setting predates child safety culture", "The 1986 setting captures Satanic Panic fully", "The 1973 setting matches the book's era well", "The 1999 setting allowed early cell phones use"],a:0,d:3},{q:"What slasher from 2011 uses social media as a key component?",o:["Unfriended", "Scream 4", "Smiley", "Cyberbully"],a:1,d:3},{q:"What is Anthony McCoy's connection to the original Candyman?",o:["He is Helen's son", "He is Daniel Robitaille's descendant", "He is a researcher", "He is new with no connection"],a:0,d:3},{q:"In the movie Hostel: Part II, what is the name of the girl who is the main protagonist and ultimately buys her own freedom?",o:["Whitney", "Beth", "Lorna", "Paxton"],a:1,d:3},{q:"In the movie Hostel: Part II, which character is killed by a client named Mrs. Bathory in a scene involving a scythe and a blood bath?",o:["Lorna", "Whitney", "Beth", "Sasha"],a:0,d:3},{q:"When did Donald Pleasence die?",o:["1993", "1994", "1995", "1996"],a:2,d:3},{q:"In the movie Hostel: Part II, what do the Elite Hunting clients receive on their phones that shows they have won the auction for a victim?",o:["A text message with a price", "An image of a bloodhound tattoo", "A video of the victim", "A digital key code"],a:1,d:3},{q:"Where is Candyman 3: Day of the Dead (1999) set?",o:["Chicago", "Los Angeles", "New Orleans", "Cabrini-Green"],a:1,d:3},{q:"In the movie Hostel, what is the name of the hostel in Slovakia where the main characters stay before being kidnapped?",o:["The Bratislava Inn", "The Red Rose", "The Incheba", "The Velvet Hostel"],a:2,d:3},{q:"In the movie Hostel, what happens to the American traveler named Oli after he goes missing from the group?",o:["He escapes back to the US", "He is decapitated by a client", "He is found hiding in the woods", "He becomes a guard for the club"],a:1,d:3},{q:"What is the name of the final girl in Freddy vs. Jason?",o:["Destiny Miller", "Lori Campbell", "Monica Carson", "Jenny"],a:1,d:3},{q:"In the movie Hostel: Part II, what is the name of the American businessman played by Richard Burgi who chickens out during his first kill?",o:["Stuart", "Todd", "Roger", "Bill"],a:1,d:3}];
const Q3c21=[{q:"According to Jason Goes to Hell, what is the only way to truly kill Jason?",o:["Only a Voorhees can kill Jason and only with a special dagger — establishing a supernatural mythology for the franchise", "Only fire can destroy the body permanently and only if it is done at Camp Crystal Lake itself during the summer solstice season", "Only a child killed by Jason can defeat him by reciting the names of every previous victim in the correct order of their deaths", "Only drowning in the same lake Jason drowned in will end him and only if his mother's severed head is tied around his neck first"],a:0,d:3},{q:"Who directed Freddy's Dead: The Final Nightmare?",o:["Renny Harlin", "Rachel Talalay", "Tom McLoughlin", "Chuck Russell"],a:1,d:3},{q:"In the movie Cabin Fever (2002), what is the specific name of the flesh-eating virus that infects the group of college students?",o:["Necrotizing Fasciitis", "The Red Fever", "The Black Death", "It is never named in the film"],a:3,d:3},{q:"In the movie Cabin Fever, what is the name of the local boy at the general store who famously shouts \"Pancakes!\" before performing a karate routine?",o:["Dennis", "Billy", "Tommy", "Ricky"],a:0,d:3},{q:"In the movie Cabin Fever, which character is the first to become visibly infected after being exposed to the contaminated water?",o:["Paul", "Karen", "Marcy", "Bert"],a:1,d:3},{q:"In the movie Cabin Fever, what is the name of the hermit who wanders onto the group's property at the beginning of the movie seeking help?",o:["Winston", "Old Man Jack", "Henry", "Grim"],a:2,d:3},{q:"In the movie Cabin Fever, what is the name of the eccentric local sheriff who is more concerned with partying than helping the students?",o:["Sheriff Hoyt", "Sheriff Brackett", "Sheriff Lincoln", "Sheriff Miller"],a:2,d:3},{q:"In Terrifier 2, what new character is introduced?",o:["The Pale Girl", "The Harvester", "The Dark Clown", "The Mirror Woman"],a:0,d:3},{q:"What is different about Freddy's appearance in New Nightmare?",o:["He has a new more terrifying look with longer claws", "He appears in a suit instead of his classic sweater", "He is shown without his iconic brown fedora hat on", "He looks exactly the same as the previous film appearances"],a:0,d:3},{q:"In the movie Cabin Fever, what is the name of the dog belonging to the hermit that ends up attacking the students?",o:["Dr. Mambo", "Killer", "Beast", "Cujo"],a:0,d:3},{q:"In the movie Cabin Fever, which character manages to \"survive\" the virus long enough to be shot by the police at the end of the film?",o:["Bert", "Jeff", "Paul", "Marcy"],a:2,d:3},{q:"In the movie Halloween II (1981), what is the name of the security guard who Michael Myers kills by hitting him in the head with a hammer?",o:["Mr. Garrett", "Mr. Elrod", "Mr. Wilson", "Mr. Henderson"],a:0,d:3},{q:"Who wins at the end of Freddy vs. Jason?",o:["Freddy", "Jason", "Neither", "Lori Campbell"],a:1,d:3},{q:"In the movie Halloween II (1981), what is the name of the nurse who is drowned in a therapy tub of scalding water?",o:["Nurse Janet", "Nurse Marion", "Nurse Karen", "Nurse Alves"],a:2,d:3},{q:"In the movie Halloween II (1981), what does Michael Myers write in blood on a chalkboard inside the local elementary school?",o:["HE IS COMING", "HALLOWEEN", "SAMHAIN", "SISTER"],a:2,d:3},{q:"In the movie Halloween II (1981), what specific weapon does Michael use to kill Nurse Janet in the hospital parking lot?",o:["A scalpel", "A kitchen knife", "A syringe to the eye", "A claw hammer"],a:2,d:3},{q:"In the movie Halloween II (1981), what is the name of the ambulance driver who has a crush on Laurie Strode and eventually dies from a slip in a pool of blood?",o:["Graham", "Budd", "Jimmy", "Ray"],a:2,d:3},{q:"Who co-wrote Pearl with Ti West?",o:["Mia Goth co-wrote it with him", "Brandon Cronenberg wrote it", "Jade Halley Bartlett wrote it", "A24 story team co-wrote it"],a:0,d:3},{q:"In the movie Halloween II (1981), what is the name of the head nurse who Michael kills by draining all the blood from her body via an IV?",o:["Nurse Janet", "Nurse Karen", "Nurse Alves", "Nurse Jill"],a:2,d:3}];
const Q3c28=[{q:"In the movie Halloween II (1981), what is the name of the elderly woman Michael Myers steals a knife from while she is making a sandwich for her husband?",o:["Mrs. Blankenship", "Mrs. Wallace", "Mrs. Elrod", "Mrs. Phelps"],a:2,d:3},{q:"In the movie Halloween II (1981), what movie is Mr. Elrod watching on TV?",o:["Night of the Living Dead", "The Thing", "Plan 9 from Outer Space", "Carnival of Souls"],a:0,d:3},{q:"In the movie Halloween II (1981), what does Michael use to kill Nurse Jill when she tries to find Laurie in the hospital hallways?",o:["A syringe", "A scalpel", "A hammer", "An IV stand"],a:1,d:3},{q:"In the movie Halloween II (1981), how does Dr. Loomis finally stop Michael Myers in the operating room?",o:["He stabs him with a scalpel", "He pushes him out a window", "He triggers a gas explosion", "He shoots him in the head"],a:2,d:3},{q:"In the movie Halloween II (1981), what is the name of the news reporter seen on the television screens throughout the film?",o:["Robert Mundy", "Gale Weathers", "Chuck Wilson", "Dana Moon"],a:0,d:3},{q:"In the movie Halloween III: Season of the Witch, what is the specific date and time the \"Big Give-Away\" is scheduled to take place?",o:["October 31st at 8:00 PM", "October 31st at 9:00 PM", "October 30th at 9:00 PM", "October 31st at Midnight"],a:1,d:3},{q:"In the movie Halloween III: Season of the Witch, what is the name of the town in California where the Silver Shamrock factory is located?",o:["Haddonfield", "Bodega Bay", "Santa Mira", "Smith's Grove"],a:2,d:3},{q:"In the movie Halloween III: Season of the Witch, what is hidden inside the Silver Shamrock button on the back of each mask?",o:["Stonehenge and a microchip", "A tracking device", "A small dose of lethal gas", "A contact-activated poison"],a:0,d:3}];
const Q3c30=[{q:"In the movie Halloween III: Season of the Witch, what is the name of the shop owner whose murder at the hospital begins Dr. Challis's investigation?",o:["Conal Cochran", "Harry Grimbridge", "Teddy Fleming", "Dan Challis"],a:1,d:3},{q:"In the movie Halloween III: Season of the Witch, what is the name of the female protagonist who accompanies Dr. Challis to Santa Mira?",o:["Laurie Strode", "Marion Chambers", "Ellie Grimbridge", "Linda van der Klok"],a:2,d:3}];
const Q3c31=[{q:"In the movie Halloween III: Season of the Witch, what is the name of the Irish businessman who owns Silver Shamrock Novelties?",o:["Conal Cochran", "Terrence Wynn", "Daniel Challis", "Rafferty"],a:0,d:3},{q:"What is the name of the location in Friday Part VI?",o:["Crystal Lake renamed Forest Green by residents", "Camp Crystal Lake as always in the franchise", "A new Camp Forest Green run by Paul's family", "Lake Minnetonka in Minnesota during summer time"],a:0,d:3}];
const Q3c32=[{q:"In the movie Halloween III: Season of the Witch, what actually happens to the children when they wear the masks during the final signal?",o:["They turn into statues", "They are decapitated", "Their heads rot into insects", "They become mindless drones"],a:2,d:3},{q:"Bob Clark directed both Black Christmas and what holiday film?",o:["National Lampoon's Christmas Vacation", "A Christmas Story", "Home Alone", "It's a Wonderful Life"],a:1,d:3},{q:"In the movie Halloween III: Season of the Witch, what does Dr. Challis discover about the people of Santa Mira who are working for Cochran?",o:["They are ghosts", "They are androids", "They are brainwashed cultists", "They are aliens"],a:1,d:3},{q:"In Intruder (1989), where do the killings take place?",o:["A grocery store", "A small warehouse", "A highway motel", "A family hotel"],a:0,d:3},{q:"In the movie Halloween III: Season of the Witch, what specific ancient site did Cochran steal a massive standing stone from to power his masks?",o:["Avebury", "Newgrange", "Stonehenge", "The Hill of Tara"],a:2,d:3},{q:"What FX artist made his feature debut with The Burning?",o:["Rick Baker", "Tom Savini", "Dick Smith", "Rob Bottin"],a:1,d:3},{q:"How was Jason resurrected for Part VI after the Roy Burns detour?",o:["Tommy Jarvis accidentally resurrects him with lightning", "A local coven of witches deliberately resurrects him at night", "A mysterious government agent revives him to use as a weapon", "He simply was never dead and had been hiding in the lake bottom"],a:0,d:3},{q:"What Candyman sequel is set specifically during Mardi Gras?",o:["Candyman: Farewell to the Flesh", "Candyman 3: Day of the Dead film", "Candyman (2021) Nia DaCosta film", "Candyman: Carnival of Souls part"],a:0,d:3},{q:"In the movie Halloween III: Season of the Witch, what is the final word spoken by Dr. Challis as he screams into the telephone at the end of the film?",o:["No!", "Stop it!", "Kill it!", "Help!"],a:1,d:3},{q:"Who directed A Bay of Blood?",o:["Dario Argento", "Lucio Fulci", "Mario Bava", "Umberto Lenzi"],a:2,d:3},{q:"In the movie Halloween 4: The Return of Michael Myers, what is the name of the sheriff who replaces Sheriff Brackett in Haddonfield?",o:["Sheriff Meeker", "Sheriff Barker", "Sheriff Ben Meeker", "Sheriff Taylor"],a:2,d:3},{q:"In Slaughter High (1986), what is the killer's name?",o:["Marty Rantzen", "Carl Pendleton", "Billy Crane", "Simon Cromwell"],a:0,d:3},{q:"In the movie Halloween 4: The Return of Michael Myers, what is the name of the teenage girl who is Jamie Lloyd's foster sister and protector?",o:["Rachel Carruthers", "Kelly Meeker", "Darlene Carruthers", "Lindsey Wallace"],a:0,d:3},{q:"In the movie Halloween 4: The Return of Michael Myers, how is Jamie Lloyd related to Laurie Strode?",o:["She is her niece", "She is her daughter", "She is her sister", "There is no relation"],a:1,d:3},{q:"In the movie Halloween 4: The Return of Michael Myers, what costume is Jamie Lloyd wearing on Halloween night?",o:["A ghost", "A witch", "A clown costume", "A princess"],a:2,d:3},{q:"In the movie Halloween 4: The Return of Michael Myers, what is the name of the deputy who is killed by Michael in the Meeker house while guarding the girls?",o:["Deputy Logan", "Deputy Pierce", "Deputy Hunt", "Deputy Eddy"],a:0,d:3},{q:"In the movie Halloween 4: The Return of Michael Myers, what does Michael use to kill Kelly Meeker in the bedroom?",o:["A kitchen knife", "A scalpel", "A shotgun", "A fire poker"],a:2,d:3},{q:"In the movie Halloween 4: The Return of Michael Myers, what happens to Michael at the very end of the film before he falls into a mine shaft?",o:["He is blown up", "He is decapitated", "Shot by police and locals", "He is stabbed with a pitchfork"],a:2,d:3},{q:"In the movie Halloween 5: The Revenge of Michael Myers, what specific new tattoo is visible on Michael's wrist, representing a mysterious cult?",o:["The Thorn Rune", "A Celtic Cross", "A pentagram", "The Silver Shamrock logo"],a:0,d:3},{q:"In the movie Halloween 5: The Revenge of Michael Myers, what is the name of the girl who is Rachel's friend and becomes Michael's primary target at the Tower Farm party?",o:["Kelly", "Tina", "Samantha", "Beth"],a:1,d:3},{q:"In The Collector (2009), what does the Collector do to his victims?",o:["He collects one survivor while killing the rest", "He keeps them in coffin-like crates in his van", "He tortures them briefly then releases them all", "He mails pieces of them to the victim's family"],a:0,d:3},{q:"In the movie Halloween 5: The Revenge of Michael Myers, how does Rachel Carruthers die when Michael surprises her in her home?",o:["She is thrown out a window", "She is strangled", "Stabbed with scissors", "She is hit with a car"],a:2,d:3},{q:"In the movie Halloween 5: The Revenge of Michael Myers, what is the name of the two bumbling police officers whose scenes are accompanied by \"clown\" sound effects?",o:["Nick and Tom", "Ben and Logan", "Frank and Charlie", "Eddy and Mike"],a:0,d:3}];
const Q3c38=[{q:"In the movie Halloween 5: The Revenge of Michael Myers, where does Jamie Lloyd go to hide from Michael during the climax of the film?",o:["The basement", "A laundry chute", "Under a bed", "Inside a coffin"],a:1,d:3},{q:"In the movie Halloween 5: The Revenge of Michael Myers, what does Dr. Loomis use as bait to lure Michael into the Myers house?",o:["Rachel’s body", "A recording of Laurie", "Jamie Lloyd", "The Thorn rune"],a:2,d:3},{q:"In Jason Goes to Hell, how is Jason destroyed?",o:["He is dragged to hell by demons", "He is melted in a chemical fire", "He is pulled into the lake's bottom", "He is blown up with a large bomb"],a:0,d:3},{q:"In the movie Halloween 5: The Revenge of Michael Myers, what does Michael do when Jamie calls him \"Uncle\" and asks to see his face?",o:["He kills her immediately", "He starts to laugh", "Removes mask, sheds a tear", "He walks away"],a:2,d:3}];
const Q3c39=[{q:"In the movie Halloween 5: The Revenge of Michael Myers, how is Michael finally subdued by Dr. Loomis in the attic?",o:["He is shot with a revolver", "Struck with a 2x4 and tranqued", "He is caught in a steel net", "He is blown up with dynamite"],a:1,d:3},{q:"Who composed the score for The Burning?",o:["John Carpenter", "Harry Manfredini", "Rick Wakeman", "Goblin"],a:2,d:3},{q:"What technique does Black Christmas use that Halloween later made famous?",o:["The killer's POV shot", "The Final Girl trope", "The early jump scare", "The false ending trick"],a:0,d:3},{q:"Who directed Maniac 1980?",o:["William Lustig", "Abel Ferrara", "Larry Cohen", "Frank Henenlotter"],a:0,d:3},{q:"Who did the special effects for The Prowler?",o:["Rick Baker", "Rob Bottin", "Tom Savini", "Stan Winston"],a:2,d:3},{q:"What weapon is the killer associated with in The Prowler?",o:["A knife", "A pitchfork", "A shotgun", "A bayonet"],a:3,d:3},{q:"In the movie Halloween 5: The Revenge of Michael Myers, what is the name of the clinic where Jamie Lloyd is being treated for her psychological trauma?",o:["Smith's Grove Sanitarium", "Haddonfield Memorial", "Children's Clinic of Haddonfield", "Ridgemont Sanitarium"],a:2,d:3},{q:"Who is the master of giallo cinema?",o:["Lucio Fulci", "Mario Bava", "Dario Argento", "Ruggero Deodato"],a:2,d:3},{q:"What color-based title is a famous Dario Argento giallo?",o:["Red Deep", "Deep Red", "Blood Red", "Crimson"],a:1,d:3},{q:"What Italian director made Bay of Blood which influenced Friday the 13th?",o:["Dario Argento", "Lucio Fulci", "Mario Bava", "Umberto Lenzi"],a:2,d:3},{q:"What is the most famous shot style in giallo films?",o:["Extreme close-ups of eyes and gloved hands during kills", "Wide tracking shots that follow victims through hallways", "Fast whip pans that cut between victim faces and killers", "Slow motion shots of blood droplets hitting tiled floors"],a:0,d:3},{q:"Who directed Stage Fright 1987?",o:["Dario Argento", "Michele Soavi", "Lucio Fulci", "Mario Bava"],a:1,d:3},{q:"What is the motive in Happy Birthday to Me?",o:["Revenge against the top social group at a school", "A jealous boyfriend's plot against his cheating ex", "A satanic ritual requiring seven victims of choice", "Random killings driven by unexplained inner madness"],a:0,d:3},{q:"In the movie Halloween 5: The Revenge of Michael Myers, what kind of vehicle does Michael use to stalk Tina and her friends before killing Mike?",o:["A tow truck", "A police car", "A 1967 Chevrolet Camaro", "A station wagon"],a:2,d:3},{q:"How do you summon Madman Marz?",o:["Say his name above a whisper", "Knock on his cabin wall thrice", "Stare at a mirror and call out", "Burn a picture of his home barn"],a:0,d:3},{q:"What is the Slaughter High killer's name?",o:["Marty", "Billy", "Tommy", "Roy"],a:0,d:3},{q:"In the movie Halloween 5: The Revenge of Michael Myers, what does Michael use to kill Samantha in the barn?",o:["A scythe", "A pitchfork", "A chainsaw", "A hunting knife"],a:0,d:3},{q:"What does the term giallo mean in Italian?",o:["Yellow — from yellow covers of crime paperbacks", "Blood — the Italian word for blood in a sense", "Horror — old usage in Sicilian theatre traditions", "Death — from a 1920s pulp fiction marketing term"],a:0,d:3},{q:"In the movie Halloween 6: The Curse of Michael Myers, what is the specific name of the ancient Druidic cult that is revealed to be controlling Michael?",o:["The Order of Samhain", "The Cult of Thorn", "The Silver Shamrock", "The Order of the Myers"],a:1,d:3},{q:"In the movie Halloween 6: The Curse of Michael Myers, what is the name of the character played by Paul Rudd, who was the boy Laurie Strode was babysitting in the original 1978 film?",o:["Tommy Doyle", "Lonnie Elam", "Richie Castle", "Ben Tramer"],a:0,d:3},{q:"In the movie Halloween 6: The Curse of Michael Myers, what is the name of the leader of the cult, who was also the head of Smith's Grove Sanitarium?",o:["Dr. Sartain", "Dr. Mixter", "Dr. Terence Wynn", "Dr. Hoffman"],a:2,d:3},{q:"In the movie Halloween 6: The Curse of Michael Myers, how is the character Jamie Lloyd killed in the \"Theatrical Cut\" of the film?",o:["She is shot by the cult", "She is impaled on a farm thresher", "She is stabbed in a bathroom", "She dies in a car crash"],a:1,d:3},{q:"Who directed Hatchet series?",o:["Adam Green", "James Wan", "Greg McLean", "Rob Zombie"],a:0,d:3},{q:"What cameo appears in Graduation Day?",o:["Ronald Reagan", "Vanna White", "A young Tom Hanks", "David Prowse"],a:1,d:3},{q:"Who directed Martyrs 2008?",o:["Alexandre Aja", "Pascal Laugier", "Xavier Gens", "Julien Maury"],a:1,d:3},{q:"What is the famous line the killer says in Wolf Creek?",o:["You are not going anywhere", "Head on a stick", "No one can hear you", "You will never leave here"],a:1,d:3},{q:"Who directed Wolf Creek?",o:["James Wan", "Greg McLean", "John Jarratt", "David Michod"],a:1,d:3},{q:"What French horror film explores suffering and transcendence?",o:["High Tension", "Inside", "Martyrs", "Raw"],a:2,d:3},{q:"What actor plays Otis in Rob Zombie's House of 1000 Corpses?",o:["Sid Haig", "Bill Moseley", "Ken Foree", "Michael Berryman"],a:1,d:3},{q:"In the movie Halloween 6: The Curse of Michael Myers, what is the name of Kara Strode's son, who begins hearing Michael’s voice?",o:["Billy", "Danny", "Timmy", "Steven"],a:1,d:3},{q:"In the movie Halloween 6: The Curse of Michael Myers, what is the name of the radio shock jock who broadcasts from Haddonfield and mocks the legend of Michael Myers?",o:["Mojo Jack", "Wolfman Jack", "Barry Simms", "Howard Stern"],a:2,d:3},{q:"In the movie Halloween 6: The Curse of Michael Myers, what happens to the character John Strode (Kara’s father) in the basement?",o:["He is electrocuted and his head explodes", "He is stabbed with a kitchen knife", "He is strangled with a telephone cord", "He is thrown through a window"],a:0,d:3},{q:"Who plays the villain in Tourist Trap?",o:["Vincent Price", "Chuck Connors", "Robert Englund", "Donald Pleasence"],a:1,d:3},{q:"In the movie Halloween H20, what is the name of the nurse from the first two films who is murdered in the opening sequence after discovering her house has been robbed?",o:["Nurse Janet", "Nurse Karen", "Marion Chambers", "Nurse Jill"],a:2,d:3}];
const Q4c0=[{q:"What is unusual about the production history of You're Next (2011)?",o:["The film was held for two years after completion before release", "The entire movie was shot over just three days in a rural farmhouse", "The production was kept completely secret and done without permits", "The project was originally conceived and shot as a TV pilot movie"],a:0,d:4},{q:"In the movie Halloween H20, how does Michael Myers manage to find Laurie's location at the private school?",o:["He follows her from the grocery store", "He finds her file in Marion Chambers' house", "He sees her on a news broadcast", "He tracks her son's car"],a:1,d:4},{q:"In Saw III, what is Dr. Lynn Denlon's trap?",o:["A collar bomb that detonates if John Kramer dies", "The Rack — a limb-twisting full body contraption", "A sealed razor box she must dig her way out of it", "A drill chair that activates in exactly one hour"],a:0,d:4},{q:"In the movie Halloween H20, what is the name of the school counselor who is also Laurie's boyfriend?",o:["Ronny", "Jimmy", "Will Brennan", "Charlie"],a:2,d:4},{q:"In the movie Halloween H20, which actress makes a cameo as Laurie's secretary and is actually Jamie Lee Curtis's real-life mother?",o:["Janet Leigh", "Adrienne Barbeau", "Vera Miles", "Tippi Hedren"],a:0,d:4},{q:"In Halloween Kills, what does Karen use to lure Michael out to the mob?",o:["A flare gun", "Michael's own mask", "A kitchen knife", "A pitchfork"],a:1,d:4}];
const Q4c1=[{q:"What historical figure shares the name of the killer in Eli Roth's Thanksgiving?",o:["John Carver — the real first governor of Plymouth Colony", "John Alden — a famous real Mayflower passenger and settler", "John Hanson — the first President under the Articles union", "John Wheelwright — a real Puritan minister from Massachusetts"],a:0,d:4}];
const Q4c2=[{q:"In the movie Halloween H20, what is the name of the security guard's wife who is heard only as a voice on his headset?",o:["Loretta", "Sarah", "Enid", "Maggie"],a:0,d:4},{q:"In the movie Halloween H20, what movie is playing on the television in the background during the scene where the students are in the dorms?",o:["Halloween (1978)", "Scream 2", "Psycho", "Plan 9 from Outer Space"],a:1,d:4},{q:"What 1986 slasher subverts the genre by revealing all the deaths were staged as a prank?",o:["Slaughter High", "April Fool's Day", "Happy Birthday to Me", "Prom Night"],a:1,d:4},{q:"Who directed the original Saw (2004)?",o:["Leigh Whannell", "James Wan", "Greg Hoffman", "Gregg Hoffman"],a:1,d:4},{q:"What studio passed on distributing A Nightmare on Elm Street, allowing New Line Cinema to pick it up and launch their company?",o:["Embassy Pictures", "Warner Bros Pics", "Columbia Studios", "Paramount Ltd."],a:0,d:4}];
const Q4c3=[{q:"What specific scene in Halloween required the most setups and time to film?",o:["The opening POV shot", "The final confrontation", "The closet scene with Laurie", "The kitchen scene"],a:0,d:4},{q:"Who played Michael Myers in Halloween: H20?",o:["Chris Durand", "Brad Loree", "Tyler Mane", "George P. Wilbur"],a:0,d:4},{q:"In the movie Halloween: Resurrection, what is the name of the reality web show that is filmed inside the abandoned Myers house?",o:["Death Valley", "Dangertainment", "Fear Fest", "Ghost Hunters"],a:1,d:4},{q:"In the movie Halloween: Resurrection, how does Michael Myers finally kill Laurie Strode in the opening sequence at the sanitarium?",o:["He decapitates her", "He throws her off the roof", "He stabs her and drops her off the roof", "He strangles her with her own hair"],a:2,d:4}];
const Q4c5=[{q:"In the movie Halloween: Resurrection, what is the name of the character played by Busta Rhymes who is the producer of the web show?",o:["Freddie Harris", "Bill", "Rudy", "Jim"],a:0,d:4},{q:"What was the original title of Scream?",o:["Scary Movie", "Slashed Open", "Shockers III", "Slay Bells"],a:0,d:4},{q:"In the movie Halloween: Resurrection, how does Sara Moyer communicate with the outside world for help while being stalked in the house?",o:["A walkie-talkie", "A handheld PDA device", "A laptop", "A satellite phone"],a:1,d:4}];
const Q4c6=[{q:"In the movie Halloween: Resurrection, which character is a culinary student and is killed by being pinned to a door with kitchen knives?",o:["Jim", "Donna", "Rudy", "Bill"],a:2,d:4}];
const Q4c7=[{q:"In the movie Halloween: Resurrection, what does Freddie Harris (Busta Rhymes) use to fight Michael Myers during the final confrontation?",o:["Kung Fu and a cable", "A chainsaw", "A shotgun", "A fire axe"],a:0,d:4}];
const Q4c8=[{q:"What is the name of Michael Myers' doctor at Smith's Grove before Dr. Loomis?",o:["Dr. Terrence Wynn", "Dr. Gerald Mixter", "Dr. Howard Ellis", "Dr. Richard Ross"],a:0,d:4},{q:"In the movie Halloween: Resurrection, what is the name of the fan Sara is messaging who realizes the deaths on the show are real?",o:["Deckard", "Myles", "Harold", "Scott"],a:0,d:4}];
const Q4c9=[{q:"In the movie Halloween: Resurrection, how does Michael kill the character Bill in the basement?",o:["Slits his throat", "Decapitates him", "Crushes his head against a wall", "Stabs him with a tripod"],a:2,d:4},{q:"What is the blood ceiling effect in Nightmare on Elm Street?",o:["The entire bedroom set was built to rotate", "A split-screen trick blended two camera feeds", "A pressurized wire rig dumped the blood down", "A practical dump tank above the ceiling opened"],a:0,d:4}];
const Q4c10=[{q:"Where was Saw filmed and how long did it take?",o:["A warehouse in Los Angeles in 18 days", "A Vancouver industrial studio in 30 days", "A converted Hollywood sound stage in 20 days", "An independent New York rental space in 14 days"],a:0,d:4}];
const Q4c11=[{q:"In the movie Halloween: Resurrection, what happens in the very last shot of the movie at the morgue?",o:["Michael's hand grabs the coroner", "Michael opens his eyes", "The room catches fire", "Michael's body disappears"],a:1,d:4},{q:"In the movie Halloween (2018), what are the names of the two true-crime podcasters who visit Michael Myers at Smith's Grove Sanitarium in the opening scene?",o:["Ben and Dana", "Aaron and Sarah", "Aaron and Dana", "Ben and Sarah"],a:2,d:4}];
const Q4c12=[{q:"In the movie Halloween (2018), what is the name of Michael Myers' new psychiatrist who is obsessed with understanding \"The Shape\"?",o:["Dr. Loomis", "Dr. Wynn", "Dr. Sartain", "Dr. Hoffman"],a:2,d:4},{q:"In the movie Halloween (2018), what is the name of the babysitter who is killed while looking after a boy named Julian?",o:["Kelly", "Vicky", "Annie", "Lynda"],a:1,d:4}];
const Q4c13=[{q:"In the movie Halloween (2018), how does Dr. Sartain die after he tries to transport Michael to Laurie’s house?",o:["He is shot by Laurie", "Michael stomps his head into the ground", "He is stabbed with Michael's knife", "He crashes the car"],a:1,d:4},{q:"In the movie Halloween (2018), what happens to Michael at the very end of the film inside Laurie’s basement?",o:["Trapped behind bars as house burns", "He is decapitated by Laurie", "He is shot into a mine shaft", "He escapes before the fire starts"],a:0,d:4}];
const Q4c14=[{q:"What is the first trap shown in Saw (2004)?",o:["The Reverse Bear Trap — Amanda must retrieve a key from a dead man's stomach", "The Bathroom Trap — two men chained to pipes with a single hacksaw between them", "The Venus Fly Trap — a man with glass shards in his eyes chained to a rusted door", "The Shotgun Collar Trap — a woman must pass a key through a pitch dark maze below"],a:0,d:4},{q:"In the movie Halloween Kills, which character from the 1978 original leads the angry mob with the chant \"Evil dies tonight\"?",o:["Marion Chambers", "Lindsey Wallace", "Tommy Doyle", "Lonnie Elam"],a:2,d:4}];
const Q4c15=[{q:"What are the Sawyer family members' names in Texas Chain Saw Massacre 2?",o:["Drayton, Chop-Top, Leatherface and Tinker", "Drayton, Chop-Top, Leatherface and Nubbins", "Drayton, Leatherface, Stretch and Tex Jr", "Chop-Top, Leatherface, Tex and Old Man Sawyer"],a:0,d:4},{q:"In Sleepaway Camp 2 and 3, who plays Angela Baker?",o:["Pamela Springsteen", "Felissa Rose Jr.", "Karen Fields Allen", "Susan Tyrrell II"],a:0,d:4},{q:"In the movie Halloween Kills, what is the name of the couple who now lives in the old Myers house and is murdered by Michael?",o:["Big John and Little John", "Roger and Linda", "Marcus and Vanessa", "Dave and Vicky"],a:0,d:4},{q:"In the movie Halloween Kills, what happens to the escaped psychiatric patient whom the mob mistakenly believes is Michael Myers?",o:["He escapes Haddonfield", "He is arrested by Sheriff Barker", "He hides in the Myers house", "Jumps from a hospital window"],a:3,d:4},{q:"In the movie Halloween Kills, what is the name of the officer who survived Michael's attack in 1978 and is wracked with guilt in the present day?",o:["Officer Logan", "Officer Hunt", "Deputy Frank Hawkins", "Officer McCabe"],a:2,d:4},{q:"In the movie Halloween Kills, how does the character Cameron Elam die during the final confrontation inside the Myers house?",o:["Michael snaps his neck over a railing", "He is stabbed with a kitchen knife", "He is beaten with a baseball bat", "He is thrown through a window"],a:0,d:4},{q:"In the movie Halloween Kills, which character is shockingly murdered by Michael in the final scene of the film inside Judith Myers' bedroom?",o:["Allyson Nelson", "Laurie Strode", "Karen Nelson", "Lindsey Wallace"],a:2,d:4}];
const Q4c22=[{q:"In Bride of Chucky, what kills Chucky and Tiffany initially?",o:["Chucky is stabbed by Tiffany", "Both are stabbed at the same time", "Both drown in a river rescue", "They are burned in a bonfire"],a:0,d:4},{q:"In the movie Halloween Ends, where has Michael Myers been hiding in the four years since the massacre in Halloween Kills?",o:["The basement of the Myers house", "In the town’s sewer system", "Under the floorboards of the local school", "Inside an abandoned hospital"],a:1,d:4}];
const Q4c23=[{q:"In the movie Halloween Ends, what specific item does Corey steal from Michael Myers after their first encounter in the sewers?",o:["His kitchen knife", "His mask", "His coveralls", "His sister’s tombstone"],a:1,d:4}];
const Q4c24=[{q:"In the movie Friday the 13th Part 2, what is the name of the head counselor who is Ginny's boyfriend and is attacked by Jason in the shed?",o:["Ted", "Paul Holt", "Bill", "Steve"],a:1,d:4},{q:"In the movie Friday the 13th Part 2, what is the name of the character who stays at the bar and avoids the massacre because he is too drunk to return to camp?",o:["Paul", "Ted", "Jeff", "Scott"],a:1,d:4}];
const Q4c25=[{q:"In the movie Friday the 13th Part 2, how does the character Vickie die when she goes into the cabin to find Mark?",o:["Stabbed in the stomach", "She is strangled with a phone cord", "She is hit with an axe", "She is thrown through a window"],a:0,d:4},{q:"In the movie Friday the 13th Part 2, what is the name of the prankster character who gets caught in a snare trap and is then killed by Jason?",o:["Jeff", "Mark", "Scott", "Terry"],a:2,d:4}];
const Q4c26=[{q:"What was James Wan's directorial feature debut?",o:["Insidious", "Dead Silence", "Saw", "The Conjuring"],a:2,d:4}];
const Q4c27=[{q:"In the movie Friday the 13th Part 2, what is the very last thing that happens to Ginny right before she is loaded into the ambulance?",o:["She sees Jason's body", "She finds Paul's body", "She calls out for Paul, who is missing", "She sees Mrs. Voorhees' ghost"],a:2,d:4}];
const Q4c28=[];
const Q4c29=[{q:"In the movie Friday the 13th Part III, how does the character Andy die while walking on his hands in the hammock room?",o:["He is sliced in half from the crotch up", "He is decapitated with a machete", "He is stabbed through the floorboards", "He is impaled with a spear gun"],a:0,d:4},{q:"In the movie Friday the 13th Part III, what specific weapon does Jason use to kill Vera by the lake?",o:["A pitchfork", "A combat knife", "A spear gun", "A fire axe"],a:2,d:4}];
const Q4c30=[{q:"What is the name of Angela's real surname in Sleepaway Camp?",o:["Baker", "Johnson", "Sherry", "Phillips"],a:0,d:4}];
const Q4c31=[{q:"In the movie Friday the 13th Part III, what does the character Chris Higgins reveal happened to her in the woods two years prior to the movie's events?",o:["She was attacked by a deformed man", "She saw her parents murdered", "She found Mrs. Voorhees' head", "She nearly drowned in the lake"],a:0,d:4}];
const Q4c32=[{q:"In the movie Friday the 13th Part III, how does the character Debbie die while resting in a hammock?",o:["She is strangled", "She is shot with a spear gun", "Knifed through the hammock", "Her head is crushed"],a:2,d:4}];
const Q4c33=[{q:"In the movie Friday the 13th Part III, what is the name of the eccentric local man who finds a severed eyeball and warns the group to turn back?",o:["Crazy Ralph", "Abel", "Silas", "Harold"],a:1,d:4},{q:"In the movie Friday the 13th: The Final Chapter, what is the name of the character played by Corey Feldman who ultimately defeats Jason?",o:["Rob", "Jimmy", "Tommy Jarvis", "Ted"],a:2,d:4},{q:"Which famous actor appeared early in their career in The Burning?",o:["Jason Alexander", "Fisher Stevens", "Holly Hunter Jr.", "Kevin Bacon II"],a:0,d:4},{q:"Who plays the killer in Maniac 1980?",o:["Tom Savini", "Joe Spinell", "Michael Moriarty", "Anthony Perkins"],a:1,d:4},{q:"What special power does the killer have in Tourist Trap?",o:["Super strength", "Telekinesis", "Invisibility", "Pyrokinesis"],a:1,d:4},{q:"Where is Intruder 1989 primarily set?",o:["A hospital", "A supermarket", "A shopping mall", "A school"],a:1,d:4},{q:"Who has a cameo in Intruder 1989?",o:["Bruce Campbell and Sam Raimi", "John Carpenter Wes Craven", "Stephen King and Clive Barker", "Tobe Hooper and Dan O'Bannon"],a:0,d:4},{q:"What studio produced The Burning (1981)?",o:["Paramount", "Miramax", "Filmways", "New Line Cinema"],a:2,d:4},{q:"Who directed Graduation Day 1981?",o:["Herb Freed", "Alan Birkinshaw", "Jim Sotos", "Tom DeSimone"],a:0,d:4},{q:"Who did Stage Fright (1987) director Michele Soavi study under?",o:["Dario Argento", "Lucio Fulci", "Mario Bava", "Federico Fellini"],a:0,d:4},{q:"Who directed Happy Birthday to Me?",o:["J. Lee Thompson", "Brian De Palma", "Richard Fleischer", "John Frankenheimer"],a:0,d:4},{q:"Who did the special effects for Intruder 1989?",o:["Tom Savini", "KNB EFX Group", "Rob Bottin", "Greg Nicotero"],a:1,d:4},{q:"What is the Slaughter High killer's motive?",o:["Revenge for a prank that disfigured him", "A demonic possession by a local cult", "Grief over his parents' sudden murder", "Escape from a wrongful prison sentence"],a:0,d:4},{q:"In the movie Friday the 13th: The Final Chapter, how does the hitchhiker die while standing by the side of the road in the rain?",o:["She is run over by a car", "Stabbed with a knitting needle", "She is hit with an axe", "She is strangled"],a:1,d:4},{q:"Where was Pieces 1982 filmed?",o:["Spain", "Italy", "USA", "UK"],a:0,d:4},{q:"What actress played Esther in Orphan?",o:["Dakota Fanning", "Isabelle Fuhrman", "Chloe Grace Moretz", "Abigail Breslin"],a:1,d:4},{q:"What is Esther's real name in Orphan?",o:["Leena Klammer", "Anna Voronova", "Marta Fischer", "Vera Farmiga"],a:0,d:4},{q:"What Stephen King novel did Mike Flanagan adapt in 2017?",o:["Gerald's Game", "Pet Sematary", "The Shining II", "Doctor Sleep"],a:0,d:4}];
const Q5c0=[{q:"In the movie Friday the 13th: The Final Chapter, what is the name of the character who is looking for his sister, Sandra, and has a bag full of weapons to hunt Jason?",o:["Rob Dier", "Paul Holt", "Mike Norris", "Clay Miller"],a:0,d:5},{q:"In the movie Friday the 13th: The Final Chapter, what specific dance does the character Jimmy (Crispin Glover) perform right before he is killed?",o:["The Twist", "The Robot", "A wild solo dance", "The Moonwalk"],a:2,d:5},{q:"In the movie Friday the 13th: The Final Chapter, how does Jason kill the twins' friend, Doug, in the shower?",o:["He stabs him through the curtain", "He crushes his skull against the tiles", "He drowns him", "He slits his throat with a razor"],a:1,d:5},{q:"In the movie Friday the 13th: The Final Chapter, what is the name of the coroner who is murdered in the morgue at the beginning of the film?",o:["Dr. Mixter", "Axel", "Nurse Morgan", "Dr. Garris"],a:1,d:5}];
const Q5c2=[{q:"In the movie Friday the 13th: The Final Chapter, how does the character Ted die while watching an old black-and-white film on a projector?",o:["He is strangled with film reel", "Stabbed through the screen", "He is decapitated", "He is hit with a hammer"],a:1,d:5},{q:"In the movie Friday the 13th: The Final Chapter, what weapon does Tommy use to deliver the final blow to Jason's head?",o:["A wood axe", "A chainsaw", "Jason's own machete", "A hunting knife"],a:2,d:5},{q:"In the movie Friday the 13th: The Final Chapter, what is the name of the twin sister who survives the massacre along with her brother?",o:["Tina", "Trish", "Terri", "Samantha"],a:1,d:5}];
const Q5c5=[{q:"In the movie Friday the 13th Part VI: Jason Lives, what specific object does Tommy Jarvis use as a makeshift lightning rod to accidentally resurrect Jason?",o:["A shovel", "A metal fence post", "A wrought iron fence spear", "A copper wire"],a:2,d:5}];
const Q5c6=[];
const Q5c7=[{q:"In the movie Friday the 13th Part VI: Jason Lives, how does the character Burt die during the corporate paintball game?",o:["Arm ripped off and slammed", "He is decapitated with a machete", "He is impaled on a branch", "He is folded in half"],a:0,d:5},{q:"In the movie Friday the 13th Part VI: Jason Lives, what is the name of the sheriff who refuses to believe Tommy Jarvis and eventually has his back broken by Jason?",o:["Sheriff Brackett", "Sheriff Mike Garris", "Sheriff Meeker", "Sheriff Tucker"],a:1,d:5},{q:"What is the real-life camp where parts of Friday the 13th were filmed?",o:["Camp No-Be-Bo-Sco", "Camp Crystal Lake in Blairstown NJ", "Camp Ockanickon", "Camp Hillard"],a:0,d:5},{q:"In the movie Friday the 13th Part VI: Jason Lives, what is the name of the sheriff's daughter who helps Tommy and becomes the film's final girl?",o:["Megan Garris", "Sissy", "Paula", "Cort"],a:0,d:5},{q:"In the movie Friday the 13th Part VI: Jason Lives, how does the character Sissy die when Jason pulls her through a cabin window?",o:["She is stabbed", "Her head is twisted off", "She is strangled", "She is hit with a machete"],a:1,d:5},{q:"In the movie Friday the 13th Part VI: Jason Lives, what song by Alice Cooper is featured prominently during the film’s credits and a chase scene?",o:["Feed My Frankenstein", "Poison", "He's Back", "Teenage Frankenstein"],a:2,d:5},{q:"In the movie Friday the 13th Part VI: Jason Lives, how does Tommy Jarvis ultimately trap Jason at the bottom of the lake?",o:["He anchors him with a boat engine", "Chains him to a rock underwater", "He stabs him with a magic dagger", "He buries him in an underwater trench"],a:1,d:5}];
const Q5c14=[{q:"In the movie Friday the 13th Part VI: Jason Lives, what is the name of the cemetery caretaker who tries to cover up Jason's empty grave?",o:["Crazy Ralph", "Abel", "Martin", "Silas"],a:2,d:5}];
const Q5c17=[{q:"In the movie Friday the 13th Part VII: The New Blood, what is the specific name of the protagonist who uses her telekinetic powers to fight Jason?",o:["Ginny", "Alice", "Tina Shepard", "Rachel"],a:2,d:5}];
const Q5c19=[{q:"What slasher film features a killer motivated by a botched medical procedure?",o:["Tourist Trap", "Dr. Giggles", "The Dentist", "Visiting Hours"],a:1,d:5},{q:"In the movie Friday the 13th Part VII: The New Blood, how did the protagonist accidentally kill her father years before the events of the film?",o:["She pushed him down the stairs", "Caused the dock to collapse", "She set the house on fire", "She drove their car into the lake"],a:1,d:5},{q:"What director made both Piranha and The Howling?",o:["Joe Dante", "John Carpenter", "Wes Craven", "Tobe Hooper"],a:0,d:5}];
const Q5c24=[];
const Q5c25=[];
const Q5c28=[];
const Q4c34=[{q:"How many Friday the 13th films did Sean Cunningham actually direct?",o:["Only the original Friday the 13th", "Three — he directed the first three", "He directed all twelve", "He produced them all but directed none after the first"],a:0,d:4},{q:"What is revealed about Laurie and Michael's relationship in Halloween II (1981)?",o:["They are neighbors", "She is his sister", "They are childhood friends", "She is his former babysitter"],a:1,d:4},{q:"Who plays Laurie Strode in Halloween H20 (1998)?",o:["Scout Taylor-Compton", "Danielle Harris", "Jamie Lee Curtis", "Michelle Williams"],a:2,d:4},{q:"How does Laurie kill Michael at the end of Halloween H20?",o:["She decapitates him with a fire axe", "She shoots him with her father's gun", "She burns him alive in a car fire", "She stabs him with a kitchen knife"],a:0,d:4},{q:"Who plays Jamie Lloyd in Halloween 4 and 5?",o:["Drew Barrymore", "Scout Taylor-Compton", "Danielle Harris", "Heather Langenkamp"],a:2,d:4},{q:"In the movie Friday the 13th Part VII: The New Blood, which character is killed while inside a sleeping bag by being slammed against a tree?",o:["Sandra", "Judy", "Melissa", "Jane"],a:1,d:4},{q:"Who plays Michael Myers in Rob Zombie's Halloween (2007)?",o:["Brad Loree", "George P. Wilbur", "Tyler Mane", "Chris Durand"],a:2,d:4},{q:"Who plays Laurie Strode in Rob Zombie's Halloween (2007)?",o:["Jamie Lee Curtis", "Danielle Harris", "Scout Taylor-Compton", "Sherri Moon Zombie"],a:2,d:4},{q:"In Halloween (2018), what is retconned about Laurie and Michael's relationship?",o:["They are revealed to be twins", "They are no longer siblings", "She becomes his mother figure", "They are revealed to be cousins"],a:1,d:4},{q:"Who directed Halloween (2018)?",o:["David Gordon Green", "Mike Flanagan Jr.", "James Wan Director", "Rob Zombie Sr."],a:0,d:4},{q:"In the movie Friday the 13th Part VII: The New Blood, what does the protagonist accidentally do while trying to resurrect her father from the bottom of the lake?",o:["She resurrects Jason Voorhees instead", "She summons a demon", "She destroys the local dam", "She loses her powers forever"],a:0,d:4},{q:"In Halloween Kills (2021), what do the people of Haddonfield form to fight Michael?",o:["A police squad", "An angry mob", "A militia", "A trap"],a:1,d:4},{q:"What year was Halloween 4: The Return of Michael Myers released?",o:["1986", "1987", "1988", "1989"],a:2,d:4},{q:"What is the setting of Halloween III: Season of the Witch?",o:["A sinister Halloween mask company", "A haunted high school reunion dance", "A cursed summer camp by the lake", "A possessed small town candy factory"],a:0,d:4},{q:"Who directed Halloween II (1981)?",o:["John Carpenter", "Tommy Lee Wallace", "Rick Rosenthal", "Dwight H. Little"],a:2,d:4},{q:"What is the name of the sinister company in Halloween III: Season of the Witch?",o:["Black Thorn", "Silver Shamrock", "Dark Star", "Thorn Industries"],a:1,d:4},{q:"Who directed Halloween III: Season of the Witch?",o:["John Carpenter", "Rick Rosenthal", "Tommy Lee Wallace", "Dwight H. Little"],a:2,d:4},{q:"Who directed Halloween 4: The Return of Michael Myers?",o:["Rick Rosenthal", "Tommy Lee Wallace", "Dwight H. Little", "Joe Chappelle"],a:2,d:4},{q:"Who plays Dr. Loomis across Halloween 4, 5, and 6?",o:["Tom Atkins", "Malcolm McDowell", "Donald Pleasence", "Clint Howard"],a:2,d:4},{q:"In Rob Zombie's Halloween, who plays Dr. Loomis?",o:["Donald Pleasence", "Brad Dourif", "Malcolm McDowell", "Clint Howard"],a:2,d:4},{q:"What controversial scene opens Halloween: Resurrection (2002)?",o:["Laurie Strode is killed in a psychiatric hospital", "Michael Myers is seen escaping from state prison cell", "Jamie Lloyd returns from the dead in a surprise scene", "Michael Myers is unmasked by the local police detective"],a:0,d:4},{q:"What is the premise of Halloween: Resurrection (2002)?",o:["Internet reality show contestants spend the night in the Myers house", "Laurie Strode's long-lost daughter tracks Michael across the countryside", "Michael Myers travels to a completely new city in search of fresh victims", "Michael Myers returns to Haddonfield for one final bloody apocalyptic showdown"],a:0,d:4},{q:"Who plays John Tate, Laurie's son, in Halloween H20?",o:["Paul Rudd", "Devon Sawa", "Josh Hartnett", "Skeet Ulrich"],a:2,d:4},{q:"In the movie Friday the 13th Part VII: The New Blood, what is the name of the mean-spirited \"queen bee\" character who is famously killed by an axe to the face?",o:["Tina", "Robin", "Maddy", "Melissa"],a:3,d:4},{q:"What is the name of Laurie Strode's daughter in Halloween (2018)?",o:["Jamie", "Rachel", "Karen", "Allyson"],a:2,d:4},{q:"In Halloween Ends, how does Michael Myers ultimately die?",o:["He is killed then put through an industrial shredder", "He is shot in the head by Corey at the final moment", "He burns to death in a long chained factory inferno", "He drowns in the river behind the old Myers property"],a:0,d:4},{q:"What is the Thorn cult's purpose in Halloween 6?",o:["To control Michael through an ancient rune curse", "To physically resurrect Mrs. Voorhees' ancient spirit", "To protect Haddonfield from Michael's nightly attacks", "To permanently worship Michael as a vengeful pagan god"],a:0,d:4},{q:"In A Nightmare on Elm Street 3, who returns from the original film to help the teens?",o:["Nancy Thompson", "Jesse Walsh Jr", "Kristen Parker", "Alice Johnson"],a:0,d:4},{q:"In Nightmare on Elm Street 4, who is the new Dream Master?",o:["Kristen", "Alice", "Nancy", "Debbie"],a:1,d:4},{q:"What is Freddy's most famous one-liner from A Nightmare on Elm Street 3?",o:["You're all my children now", "Welcome to prime time, bitch", "How's this for a wet dream?", "This is it, Jennifer — your big break in TV"],a:1,d:4},{q:"What is the subtitle of Nightmare on Elm Street 5?",o:["The Dream Master", "The Dream Child", "The Final Nightmare", "Freddy's Revenge"],a:1,d:4},{q:"In A Nightmare on Elm Street Part 2, who does Freddy try to possess to kill in the real world?",o:["Jesse Walsh", "Lisa Webber", "Ron Grady", "Kerry Hope"],a:0,d:4},{q:"What is the subtitle of A Nightmare on Elm Street Part 2?",o:["Dream Warriors", "Freddy's Revenge", "The Dream Master", "Freddy's Dead"],a:1,d:4},{q:"Who directed A Nightmare on Elm Street 3: Dream Warriors?",o:["Wes Craven", "Renny Harlin", "Chuck Russell", "Stephen Hopkins"],a:2,d:4},{q:"In Nightmare on Elm Street 4, what power does Alice develop as the Dream Master?",o:["She absorbs the dream powers of her friends as they die", "She can pull Freddy out of dreams into the real world", "She becomes invisible to Freddy whenever she sleeps", "She can fly and teleport freely through the dreamscape"],a:0,d:4},{q:"Who directed A Nightmare on Elm Street 4: The Dream Master?",o:["Chuck Russell", "Renny Harlin", "Stephen Hopkins", "Rachel Talalay"],a:1,d:4},{q:"Who directed New Nightmare (1994)?",o:["Chuck Russell", "Renny Harlin", "Rachel Talalay", "Wes Craven"],a:3,d:4},{q:"In the movie Friday the 13th Part VII: The New Blood, what specific gardening tool does Jason use to kill the character Dan?",o:["A shovel", "A rake", "A motorized hedge trimmer", "A pair of shears"],a:2,d:4},{q:"In Friday the 13th: The Final Chapter, what actor has an early role as a teen?",o:["Crispin Glover", "Kevin Bacon Jr", "Corey Feldman", "Johnny Depp II"],a:0,d:4},{q:"What is the subtitle of Friday the 13th Part VII?",o:["Jason Lives", "The New Blood", "Jason Takes Manhattan", "A New Beginning"],a:1,d:4},{q:"What is the setting of Jason X (2002)?",o:["A space station in the future", "A theme park on Halloween", "An underground bunker complex", "A deep sea research station"],a:0,d:4},{q:"In Friday the 13th (2009 remake), what is different about Jason's behavior?",o:["He is slower than usual", "He runs and keeps a captive", "He can teleport", "He speaks for the first time"],a:1,d:4},{q:"What is the title of the film where Freddy and Jason fight each other?",o:["Freddy vs. Jason (2003)", "Jason vs. Freddy (2001)", "Monster Mash (2004)", "Nightmare at Crystal Lake (2002)"],a:0,d:4},{q:"In the movie Friday the 13th Part VII: The New Blood, what happens to Jason's iconic hockey mask during the final battle with the protagonist?",o:["It is melted by fire", "It is crushed by a rock", "Split in half by telekinesis", "It is lost in the lake"],a:2,d:4},{q:"Who directed Friday the 13th Part VI: Jason Lives?",o:["Joseph Zito", "Tom McLoughlin", "Rob Hedden", "Danny Steinmann"],a:1,d:4},{q:"Who plays Jason Voorhees in the 2009 Friday the 13th remake?",o:["Kane Hodder", "Ken Kirzinger", "Derek Mears", "C.J. Graham"],a:2,d:4},{q:"In Jason Goes to Hell, what unusual method does Jason use to move between bodies?",o:["He passes a demonic heart slug through their mouths", "He possesses victims through telepathic mental contact", "He merges with their shadows during the dead of night", "He kills them and takes on their physical human form"],a:0,d:4},{q:"What is the title of the sequel to Child's Play where Tiffany becomes a doll?",o:["Seed of Chucky", "Bride of Chucky", "Child's Play 4", "Curse of Chucky"],a:1,d:4}];
const Q5c29=[{q:"In the movie Friday the 13th Part VII: The New Blood, how does the protagonist finally defeat Jason at the end of the movie?",o:["She blows him up with a gas leak", "Summons her dead father's spirit", "She decapitates him with a propeller", "She turns him into stone"],a:1,d:5},{q:"In Cult of Chucky (2017), what new ability does Chucky demonstrate?",o:["He can possess multiple Chucky dolls at once", "He becomes fully invisible to human beings", "He can speak any language fluently without effort", "He gains the ability to fly at high speeds around"],a:0,d:5},{q:"In the movie Friday the 13th Part VII: The New Blood, what is the name of the character who is a sci-fi fan and is killed when Jason jams a party horn through his eye?",o:["Nick", "Eddie", "Ben", "David"],a:2,d:5},{q:"In the movie Rob Zombie's Halloween II, what is the name of the character played by Brad Dourif who is now the Sheriff of Haddonfield?",o:["Sheriff Brackett", "Sheriff Leigh Brackett", "Sheriff Meeker", "Sheriff Taylor"],a:1,d:5},{q:"Who plays Drayton Sawyer in The Texas Chainsaw Massacre 2?",o:["Jim Siedow", "Bill Moseley", "Bill Johnson", "Dennis Hopper"],a:0,d:5},{q:"In the movie Rob Zombie's Halloween II, what is the title of the new book Dr. Samuel Loomis has written to exploit the tragedy of the first film?",o:["The Devil Walks Among Us", "The Mind of Michael Myers", "My Life with a Monster", "The Shape of Evil"],a:0,d:5},{q:"What is the name of Leatherface's brother with the metal plate in his head in Texas Chainsaw Massacre 2?",o:["Chop-Top", "Drayton", "Nubbins", "Tex Sr"],a:0,d:5},{q:"What is the name of Leatherface in Texas Chainsaw Massacre 2 and beyond?",o:["Bubba Sawyer", "Leatherface Sawyer", "Junior Sawyer", "Jed Sawyer"],a:0,d:5},{q:"In Leatherface: Texas Chainsaw Massacre III (1990), who has an early role?",o:["Matthew McConaughey", "Viggo Mortensen", "Renee Zellweger", "Jennifer Aniston"],a:1,d:5},{q:"In Texas Chainsaw Massacre: The Next Generation (1994), which two future stars appear?",o:["Matthew McConaughey and Renée Zellweger", "Brad Pitt in an early role and Angelina Jolie", "Will Smith and Martin Lawrence in a small cameo", "Tom Hanks and Meg Ryan in an unusual horror role"],a:0,d:5},{q:"In Hellraiser, who is the first person to solve the Lament Configuration in the film?",o:["Kirsty Cotton", "Larry Cotton", "Frank Cotton", "Julia Cotton"],a:2,d:5},{q:"What is the subtitle of Hellraiser II?",o:["Hell on Earth", "Hellbound", "Deader", "Hellseeker"],a:1,d:5},{q:"In Hellbound: Hellraiser II, who becomes a new Cenobite?",o:["Dr. Channard", "Tiffany Nouvelle", "Kirsty Cotton", "Larry Channel"],a:0,d:5},{q:"In Hellraiser III: Hell on Earth, where is Pinhead trapped at the start?",o:["A sculpture called the Pillar of Souls", "An ornate stained glass church window", "A tall marble statue in an art gallery", "A gilded mirror in a wealthy estate home"],a:0,d:5},{q:"In the movie Rob Zombie's Halloween II, what is the name of the character who is Annie Brackett's friend and is killed by Michael in the van?",o:["Laurie", "Lynda", "Mya", "Harley"],a:2,d:5},{q:"In the movie Rob Zombie's Halloween II, how does Michael Myers kill the strip club owner, Big Lou, during his journey back to Haddonfield?",o:["Drowns him in a sink", "Beats him to death with a baseball bat", "Stabs him with a kitchen knife", "Crushes his head with a TV"],a:1,d:5},{q:"In the movie Rob Zombie's Halloween II, what does Laurie Strode discover about her own identity after reading Dr. Loomis's book?",o:["She is Michael's cousin", "Her birth name is Angel Myers", "She was adopted by the Myers family", "She is not actually related to Michael"],a:1,d:5},{q:"In the movie Rob Zombie's Halloween II, what specific food is Michael Myers seen eating in the woods during his journey?",o:["A rabbit", "A dog", "A deer", "A rat"],a:1,d:5},{q:"In the movie Rob Zombie's Halloween II, how does Dr. Samuel Loomis die in the theatrical ending of the film?",o:["Stabbed and slashed in a shack", "He is shot by the police", "He is crushed by a car", "He survives the film"],a:0,d:5},{q:"In the 2006 Hills Have Eyes remake, how does the family become stranded?",o:["They are lured off-road and their trailer is wrecked by a spike strip", "Their RV engine overheats suddenly in the middle of the desert at midday", "They follow a suspicious hitchhiker to a remote abandoned mining town camp", "Their map is stolen by a gas station attendant early on in the film's opening"],a:0,d:5},{q:"In the 2006 remake of The Hills Have Eyes, what is the name of the deformed mutant who uses a walkie-talkie to coordinate the attack on the Carter family's trailer?",o:["Jupiter", "Pluto", "Lizard", "Cyst"],a:2,d:5},{q:"In the movie The Hills Have Eyes, what is the specific reason the Carter family is traveling through the New Mexico desert?",o:["To move to a new house", "Their silver wedding anniversary", "To go on a hunting trip", "To visit a remote national park"],a:1,d:5},{q:"In the movie The Hills Have Eyes, what are the names of the two German Shepherds that travel with the Carter family?",o:["Duke and Rex", "Thor and Odin", "Beast and Beauty", "Killer and Princess"],a:2,d:5},{q:"In the movie The Hills Have Eyes, what does the mutant Pluto do to the character Big Bob after dragging him to a pyre?",o:["Beheading him", "Burned alive on a pyre", "Feeding him to the other mutants", "Hanging him from a cactus"],a:1,d:5},{q:"Who created Art the Clown?",o:["Damien Leone", "Adam Green", "Ti West Sr.", "Joe Lynch II"],a:0,d:5},{q:"In Terrifier 2, what is the name of the new character Art targets?",o:["Allie", "Victoria", "Sienna", "Dawn"],a:2,d:5},{q:"In the movie The Hills Have Eyes, which character is a cell phone salesman who eventually goes on a violent revenge mission into the mutant village?",o:["Doug Bukowski", "Bobby Carter", "Brenda Carter", "Lynn Carter"],a:0,d:5},{q:"In Terrifier 3, what holiday does Art the Clown target?",o:["Halloween", "Thanksgiving", "Christmas", "New Year's Eve"],a:2,d:5},{q:"In the movie The Hills Have Eyes, what is the name of the mutant girl who helps the Carter family by protecting their baby?",o:["Mama", "Ruby", "Goggle", "Big Brain"],a:1,d:5},{q:"In Jeepers Creepers, how often does The Creeper wake up to feed?",o:["Every 23 years for 23 days", "Every decade for a full year", "Every full moon in the autumn", "Every summer solstice for weeks"],a:0,d:5},{q:"What does The Creeper in Jeepers Creepers eat?",o:["Specific body parts he needs to regenerate himself", "Blood only which he stores in jars at his lair", "Living souls which he absorbs into his dark body", "Any human flesh without any particular preference at all"],a:0,d:5},{q:"In Jeepers Creepers, how do siblings Trish and Darry first encounter The Creeper?",o:["They see him dumping bodies down a pipe near a church", "He ambushes them at an isolated rural gas station at night", "They accidentally stumble upon his underground lair one day", "He attacks their car while they drive down a desolate highway"],a:0,d:5},{q:"In The Purge: Anarchy (2014), who is the main character trying to rescue his family?",o:["Frank Grillo", "Ethan Hawke", "Edwin Hodge", "Mykelti Williamson"],a:0,d:5},{q:"What is the name of the main character Frank Grillo plays in The Purge: Anarchy?",o:["Leo Barnes", "Jack Stanfield", "Frank Castle", "Ray Merrimen"],a:0,d:5},{q:"In The First Purge (2018), where does the first Purge take place?",o:["Staten Island as a test location", "Washington DC inside the Capitol", "All of America at once by surprise", "Chicago in a limited experiment"],a:0,d:5},{q:"What is The Forever Purge (2021) about?",o:["Purgers who refuse to stop killing after the Purge ends", "A single family fights to survive one long Purge night", "The original 1970s origin story of the Purge being created", "A politician begins a campaign to permanently abolish the Purge"],a:0,d:5},{q:"In The People Under the Stairs (1991), who are the main villains?",o:["A wealthy incestuous couple who terrorize their tenants", "A cult leader and his devoted followers run a tenement home", "A rogue police officer who slowly goes mad in a rented home", "A vengeful ghost family that haunts their old house after death"],a:0,d:5},{q:"Who plays the boy hero Fool in The People Under the Stairs?",o:["Brandon Adams", "Ving Rhames", "Everett McGill", "A. J. Langer"],a:0,d:5},{q:"In the movie The Hills Have Eyes, what specific location does Doug discover where the mutants live, which was used for nuclear testing in the 1950s?",o:["An abandoned mine", "A 'Doom Town' test site", "A secret government bunker", "A trailer park"],a:1,d:5},{q:"In Wes Craven's Swamp Thing (1982), who plays Dr. Alec Holland?",o:["Ray Wise", "Adrienne Barbeau", "Louis Jourdan", "Dick Durock"],a:0,d:5},{q:"In the movie The Hills Have Eyes, what happens to the family dog Beauty early in the film?",o:["She is kidnapped by the mutants", "She escapes into the desert", "Killed and partially eaten", "She survives the entire movie"],a:2,d:5},{q:"What song plays over the climax of The Devil's Rejects?",o:["Free Bird by Lynyrd Skynyrd", "Simple Man by Lynyrd Skynyrd", "Sweet Home Alabama by Lynyrd Skynyrd", "That Smell by Lynyrd Skynyrd"],a:0,d:5},{q:"Who plays Baby Firefly in House of 1000 Corpses and The Devil's Rejects?",o:["Sherri Moon Zombie", "Sid Haig Jr as baby", "Karen Black as baby", "Bill Moseley cameo"],a:0,d:5},{q:"What is 31 (2016) about?",o:["Carnival workers are captured and must survive killers in a game called 31", "A family of carnival performers hunts tourists visiting their traveling show", "A killer clown escapes from a carnival and begins a bloody rampage in town", "A haunted carnival ride transports its riders into a hellish demonic dimension"],a:0,d:5},{q:"In 3 From Hell (2019), which Firefly family member is introduced for the first time?",o:["Winslow Foxworth Coltrane", "Billy Ray Snapper Sr", "Rondo Thompson II", "Tex Otis Firefly"],a:0,d:5},{q:"In the movie The Hills Have Eyes, how does Doug ultimately kill the mutant leader, Papa Jupiter?",o:["Shooting him with a shotgun", "Stabbing him with a knife", "Using a pickaxe and then a flag pole", "Blowing him up with a gas canister"],a:2,d:5},{q:"In X (2022), what are the film crew shooting on Pearl's farm?",o:["A slasher film", "An adult film", "A music video", "A documentary"],a:1,d:5},{q:"In Mike Flanagan's Hush (2016), what makes the main character uniquely vulnerable?",o:["She is deaf and mute", "She is totally blind", "She has no phone", "She is paralyzed"],a:0,d:5},{q:"In the movie The Funhouse, what is the specific name of the carnival attraction where the four teenagers decide to spend the night?",o:["The Tunnel of Love", "The Joy Ride", "The House of Horrors", "The Ghost Train"],a:1,d:5},{q:"In the movie The Funhouse, what is the name of the carnival worker who is revealed to be the father of the deformed killer, Gunther?",o:["The Barker", "Conrad Straker", "Marco the Magnificent", "The Geek"],a:1,d:5},{q:"What country is The Descent set in?",o:["USA", "Canada", "Scotland", "England"],a:3,d:5},{q:"In the movie The Funhouse, what specific costume or mask does the killer, Gunther, wear for the majority of the film before his real face is revealed?",o:["A clown mask", "A Frankenstein's monster mask", "A porcelain doll mask", "A werewolf mask"],a:1,d:5},{q:"In Eden Lake (2008), what makes the film particularly disturbing?",o:["The killers are a group of ordinary British teenagers", "The monsters in the film are revealed to be supernatural", "The killer is the main victim's own husband the whole time", "The setting of the lake is a haunted place with a dark past"],a:0,d:5},{q:"What country made Eden Lake (2008)?",o:["Australia", "USA", "UK", "Canada"],a:2,d:5},{q:"Who stars in Eden Lake?",o:["Michael Fassbender and Kelly Reilly", "Sam Neill and Nicole Kidman", "Elijah Wood and Frodo Baggins", "Hugh Jackman and Naomi Watts"],a:0,d:5},{q:"What is the premise of Hostel (2005)?",o:["Wealthy clients pay to torture and kill tourists in a secret Eastern European facility", "A lone maniac targets backpackers staying at various youth hostels across Western Europe", "A serial killer stalks youth hostels all across Europe leaving a bloody trail in each city", "A haunted hostel in an ancient Eastern European village kills its guests one by one at night"],a:0,d:5},{q:"Who directed Hostel (2005)?",o:["James Wan", "Rob Zombie", "Eli Roth", "Ti West"],a:2,d:5},{q:"What country is Hostel primarily set in?",o:["Germany", "Slovakia", "Czech Republic", "Romania"],a:1,d:5},{q:"In the movie The Funhouse, how does the character Richie die after being caught by Straker and Gunther?",o:["He is decapitated by a ride car", "He is strangled and then hung from a fan", "He is stabbed with a pocket knife", "He is crushed by machinery"],a:1,d:5},{q:"What year was Paranormal Activity given its wide theatrical release?",o:["2006", "2007", "2008", "2009"],a:3,d:5},{q:"How much did Paranormal Activity cost to make?",o:["$100,000", "$500,000", "About $15,000", "About $1 million"],a:2,d:5},{q:"In the movie The Funhouse, what is the name of the younger brother of Amy who sneaks out to follow her to the carnival?",o:["Joey", "Billy", "Timmy", "Danny"],a:0,d:5},{q:"Who directed Paranormal Activity?",o:["James Wan", "Jason Blum", "Oren Peli", "Brad Anderson"],a:2,d:5},{q:"In It Follows (2014), how is the deadly entity passed from person to person?",o:["By making eye contact", "Through sexual contact", "By touching them", "By saying their name"],a:1,d:5},{q:"In the movie The Funhouse, what event do the teenagers witness while hiding under the floorboards that causes the killers to start hunting them?",o:["A drug deal", "The theft of the carnival’s earnings", "Gunther killing Madame Zena", "Straker beating another worker"],a:2,d:5},{q:"What city is It Follows set in?",o:["Chicago", "Los Angeles", "Detroit", "Pittsburgh"],a:2,d:5},{q:"In the movie The Funhouse, what is the name of the boyfriend of Amy's friend Liz who is the first of the group to be murdered?",o:["Richie", "Buzz", "Marco", "Steve"],a:1,d:5},{q:"In the movie The Funhouse, how does Amy finally kill the deformed Gunther during the film's climax?",o:["She stabs him with a pitchfork", "She sets the funhouse on fire", "Crushed in the ride's gears", "She shoots him with Straker's gun"],a:2,d:5},{q:"In the movie The Funhouse, what does the fortune teller, Madame Zena, do right before Gunther kills her?",o:["Refuses to refund his money", "She tells Gunther his future involves death", "She tries to steal Gunther’s mask", "She laughs at Gunther’s deformity"],a:0,d:5},{q:"In the movie The Funhouse, what is the name of the actress who plays the final girl, Amy Harper?",o:["Jamie Lee Curtis", "Elizabeth Berridge", "Amy Steel", "Heather Langenkamp"],a:1,d:5},{q:"In Ready or Not (2019), what game does Grace have to survive?",o:["Hide-and-Seek", "Capture Flag", "Blind Tag", "Chess Game"],a:0,d:5},{q:"In the movie The Texas Chain Saw Massacre (1974), what is the name of the character who is paralyzed and uses a wheelchair, serving as the brother of the final girl Sally?",o:["Kirk", "Jerry", "Franklin", "Timmy"],a:2,d:5},{q:"What happens to the Le Domas family at the end of Ready or Not?",o:["They all explode at dawn when the pact is broken", "The police arrive at the manor and arrest them all", "Grace systematically hunts and kills every last one", "They commit a mass suicide inside the old manor home"],a:0,d:5},{q:"In the movie The Texas Chain Saw Massacre (1974), what does the hitchhiker use to cut his own hand and then slash Franklin's arm in the van?",o:["A piece of glass", "A straight razor", "A pocket knife", "A scalpel"],a:1,d:5},{q:"In the movie The Texas Chain Saw Massacre (1974), what is the first thing Kirk sees when he enters the Sawyer house that suggests the family is \"artistic\" with bones?",o:["A human skull on a table", "A bone-and-feather wall art", "A lamp made of skin", "A chair made of human arms"],a:1,d:5},{q:"In the movie The Texas Chain Saw Massacre (1974), how does Leatherface kill Jerry when he enters the house looking for his missing friends?",o:["Hit with a sledgehammer", "He saws him through a door", "He impales him on a meat hook", "He strangles him"],a:0,d:5},{q:"In the movie The Texas Chain Saw Massacre (1974), what is the name of the gas station where the group stops, which is actually owned by the Sawyer family?",o:["The Last Stop", "Sawyer's Fuel", "'We Slaughter Barbecue'", "The Black Maria"],a:2,d:5},{q:"In Barbarian (2022), what does Tess discover in the basement of the Airbnb?",o:["A hidden tunnel system and evidence of something living beneath the house", "A secret laboratory where past tenants had conducted human experimentation", "A cache of firearms and knives hidden inside the walls of the old basement", "A dead body concealed inside a large chest freezer under a shelf of canned goods"],a:0,d:5},{q:"Who directed Barbarian (2022)?",o:["David Robert Mitchell", "Zach Cregger", "Justin Benson", "Mike Flanagan"],a:1,d:5},{q:"In the movie The Texas Chain Saw Massacre (1974), what specific sound is heard repeatedly during the opening credits while photos of decomposing bodies are flashed?",o:["A chainsaw idling", "A camera flashbulb popping", "A high-pitched scream", "Metal scraping on stone"],a:1,d:5},{q:"In the movie The Texas Chain Saw Massacre (1974), how does the character Pam die after she is forced to watch Kirk being butchered?",o:["She is decapitated", "She is put in a freezer", "She is hung on a meat hook", "She is beaten with a hammer"],a:2,d:5},{q:"In the movie The Texas Chain Saw Massacre (1974), what happens to the hitchhiker during the final chase sequence on the highway?",o:["Sally shoots him", "Leatherface accidentally saws him", "He is run over by a semi-truck", "He falls off a bridge"],a:2,d:5},{q:"In the movie The Texas Chain Saw Massacre (1974), what is Leatherface doing in the very last shot of the film as Sally escapes in the back of a pickup truck?",o:["Dancing with his chainsaw", "He is sitting on the porch eating", "He is chasing the truck on foot", "He is crying over his brother's body"],a:0,d:5},{q:"What is the premise of Five Nights at Freddy's (2023)?",o:["A security guard discovers the animatronic characters at Freddy Fazbear's are possessed by the souls of murdered children", "A man in a mascot costume stalks and attacks children at a haunted birthday party restaurant in a small rural American town", "A corporation begins manufacturing a new line of killer robots and sells them to restaurants across the country before they escape", "A reopened family pizzeria turns out to be an ancient portal to an evil demonic realm that has been sealed by the original owner"],a:0,d:5},{q:"Who plays the security guard Mike Schmidt in Five Nights at Freddy's?",o:["Josh Hutcherson", "Josh Gad Jr.", "Mark Hamill Jr.", "Jack Black II"],a:0,d:5},{q:"In M3GAN (2023), what is M3GAN?",o:["An AI-powered robotic doll that becomes dangerously protective of the child she is bonded to", "A possessed antique porcelain doll that spreads a deadly ghostly curse through any family she enters", "A government made killer android sent to eliminate a very specific scientist targeted by a secret program", "A haunted collectible toy from the 1980s that reactivates after being stored in a basement for over thirty years"],a:0,d:5},{q:"Who directed M3GAN (2023)?",o:["Gerard Johnstone", "James Wan Jr.", "Jason Blum Sr", "Lee Cronin II"],a:0,d:5},{q:"Who directed Thanksgiving (2023)?",o:["James Wan", "Rob Zombie", "Eli Roth", "Ti West"],a:2,d:5},{q:"What was Thanksgiving (2023) based on?",o:["A fake Grindhouse trailer Eli Roth made in 2007", "A 1980s slasher novel by the writer Peter Straub", "A true crime case from colonial Plymouth Colony", "A short film that played at Sundance several years"],a:0,d:5},{q:"What is the killer's name in Thanksgiving (2023)?",o:["The Carver", "John Carver", "The Pilgrim", "The Harvester"],a:1,d:5},{q:"In the movie House of 1000 Corpses, what is the name of the \"museum\" and gas station owned by Captain Spaulding where the teenagers stop at the beginning of the film?",o:["The House of Blood", "Museum of Monsters and Madmen", "The Murder Ride", "Spaulding's Pit Stop"],a:1,d:5},{q:"What is the name of the killer in The Slumber Party Massacre?",o:["The Driller Killer — Russ Thorn", "The Power Tool Killer — Thorn", "The Slumber Party Killer is Roy", "Billy Driller — a copycat killer"],a:0,d:5},{q:"In the movie House of 1000 Corpses, what is the name of the hitchhiker the group picks up in the rain who eventually lures them to her family's house?",o:["Mother Firefly", "Baby", "Mary", "Denise"],a:1,d:5},{q:"In the movie House of 1000 Corpses, what specific holiday is being celebrated throughout the course of the movie?",o:["Halloween", "Thanksgiving", "Christmas", "July 4th"],a:0,d:5},{q:"In the movie House of 1000 Corpses, what is the name of the giant, deformed member of the Firefly family who saves Baby from being attacked by one of the teenagers?",o:["Otis", "Rufus", "Tiny", "Dr. Satan"],a:2,d:5},{q:"In the movie House of 1000 Corpses, what does Otis Driftwood do to the character Bill to transform him into an \"art piece\" called \"Fishboy\"?",o:["Sews a fish tail to his legs", "Sews him into a taxidermied fish skin", "Paints him blue and silver", "Drowns him in a tank"],a:1,d:5},{q:"In the movie House of 1000 Corpses, what are the names of the two police officers who investigate the disappearance of the teenagers and are subsequently murdered by the family?",o:["George Wydell and Steve Naish", "Frank Hawkins and Ben Meeker", "Sheriff Brackett and Deputy Hunt", "Officer Joe and Officer Bob"],a:0,d:5},{q:"In the movie House of 1000 Corpses, what is the name of the subterranean \"doctor\" who performs gruesome surgeries on the victims in the tunnels beneath the house?",o:["Dr. Spaulding", "Dr. Firefly", "Dr. Satan", "Dr. Wolfenstein"],a:2,d:5},{q:"In the movie House of 1000 Corpses, what happens to Denise at the very end of the film after she thinks she has escaped and is picked up by Captain Spaulding?",o:["She is taken to the hospital", "She escapes into the woods", "Otis appears in the back seat", "She shoots Captain Spaulding"],a:2,d:5},{q:"In the movie House of 1000 Corpses, what is the name of the character played by Rainn Wilson who is brutally murdered by Otis in the barn?",o:["Jerry", "Bill", "Denise", "Mary"],a:1,d:5},{q:"What Canadian city is Happy Birthday to Me (1981) set in?",o:["Toronto", "Montreal", "Vancouver", "Ottawa"],a:0,d:5},{q:"What is the famous image on the poster for Happy Birthday to Me?",o:["A shish kebab being forced through someone's mouth", "A killer in a clown mask holding a bloody machete", "A birthday cake topped with a butcher knife and candles", "A human skull with candles forming a birthday crown above"],a:0,d:5},{q:"In the movie House of 1000 Corpses, what is the name of the \"attraction\" at Captain Spaulding's museum that features animatronic recreations of famous serial killers?",o:["The Tunnel of Love", "The Funhouse", "The Murder Ride", "The Hall of Horrors"],a:2,d:5},{q:"In the movie The Devil's Rejects, what is the name of the sheriff who goes on a personal mission of revenge against the Firefly family for the murder of his brother?",o:["Sheriff Brackett", "Sheriff Hoyt", "Sheriff John Quincy Wydell", "Sheriff Ben Meeker"],a:2,d:5},{q:"In the movie The Devil's Rejects, what is the name of the character played by Danny Trejo who is one of the bounty hunters hired to track the Firefly family?",o:["Rondo", "Billy Ray", "Ismael", "Tre"],a:0,d:5},{q:"In the movie The Devil's Rejects, what happens to the character Wendy Banjo (the wife of the band leader) after she escapes the motel room?",o:["She is shot by Otis", "She hides in the woods until the police arrive", "She runs onto the highway and is hit by a truck", "She is recaptured by Baby"],a:2,d:5},{q:"In the movie Halloween (1978), which actual crew member's hands are seen in the opening POV shot when young Michael picks up the kitchen knife?",o:["Debra Hill", "John Carpenter", "Nick Castle", "Jamie Lee Curtis"],a:0,d:5},{q:"In Stage Fright (1987), what does the killer wear as a mask?",o:["A skull", "A giant owl head", "A clown face", "A blank white mask"],a:1,d:5},{q:"In the movie Halloween (1978), what is the title of the science fiction film Tommy Doyle is watching on television before Michael begins his attack?",o:["Forbidden Planet", "The Thing from Another World", "The Day the Earth Stood Still", "It! The Terror from Beyond Space"],a:1,d:5},{q:"In the movie Halloween (1978), what was the original working title of the script before the producers suggested changing it to Halloween?",o:["The Night of the Shape", "The Babysitter Murders", "October 31st", "He's Come Home"],a:1,d:5},{q:"In the movie Halloween II (1981), what is the name of the actor who played the \"The Shape\" during the scene where he is set on fire in the finale?",o:["Dick Warlock", "Nick Castle", "Bob Alberti", "Tony Moran"],a:0,d:5},{q:"In the movie Jaws, what is the name of the boat that Quint, Brody, and Hooper use to hunt the shark?",o:["The Neptune", "The Behemoth", "The Orca", "The Barrel"],a:2,d:5},{q:"In the movie Jaws, what was the shark's name on set, a nickname given by the crew in honor of Steven Spielberg's lawyer?",o:["Bruce", "Barney", "Buster", "Brutus"],a:0,d:5},{q:"In the movie Jaws, what is the name of the first victim killed by the shark in the opening sequence?",o:["Alex Kintner", "Pipit", "Chrissie Watkins", "Susan Backlinie"],a:2,d:5},{q:"In the movie Jaws, what is the bounty amount offered by the amateur fishermen that results in the capture of the wrong shark?",o:["$2,000", "$3,000", "$5,000", "$10,000"],a:1,d:5},{q:"In the movie Jaws, what did Matt Hooper bring onto the boat that Quint famously mocked as \"city hands\" equipment?",o:["A sonar device", "An anti-shark cage", "A compressed air tank", "A digital scale"],a:1,d:5},{q:"In the movie Jaws, what famous story does Quint tell to pass the time while the men are drinking on the boat?",o:["The sinking of the Titanic", "The sinking of the USS Indianapolis", "The Great New Jersey Shark Attack of 1916", "His first time seeing a Great White"],a:1,d:5},{q:"In the movie Jaws, how many yellow barrels does the team successfully attach to the shark before it finally pulls them underwater?",o:["Two", "Three", "Four", "Five"],a:1,d:5},{q:"In the movie Jaws, what does Chief Brody use to finally blow up the shark in the film's climax?",o:["A harpoon", "A stick of dynamite", "A rifle on an oxygen tank", "A flare gun"],a:2,d:5},{q:"In the movie Jaws, what specific brand of beer are Quint and Brody drinking when they are comparing scars on the Orca?",o:["Miller High Life", "Budweiser", "Narragansett", "Schlitz"],a:2,d:5},{q:"In the movie Psycho (1960), what is the name of the real estate client from whom Marion Crane steals the $40,000?",o:["Mr. Lowery", "Tom Cassidy", "Sam Loomis", "George Lowery"],a:1,d:5},{q:"Who directed Audition (1999)?",o:["Park Chan-wook", "Kim Jee-woon", "Takashi Miike", "Hideo Nakata"],a:2,d:5},{q:"In the movie Psycho (1960), what is the name of the town where Sam Loomis lives and owns a hardware store?",o:["Phoenix", "Fairvale", "Jefferson", "Santa Rosa"],a:1,d:5},{q:"In the movie Psycho (1960), how many camera cuts are featured in the infamous 45-second shower scene?",o:["52", "78", "94", "102"],a:1,d:5},{q:"In Suspiria (1977), what is the Freiburg dance academy secretly run by?",o:["A serial killer", "A coven of witches", "A satanic cult", "Nazi scientists"],a:1,d:5},{q:"In the movie Psycho (1960), what did Norman Bates use as \"blood\" during the filming of the shower scene to get the right consistency on camera?",o:["Red food coloring dye", "Dyed corn syrup", "Bosco Chocolate Syrup", "Concentrated beet juice"],a:2,d:5},{q:"In the movie Psycho (1960), what is the name of the psychiatrist who explains Norman's dual personality in the film's final scenes?",o:["Dr. Fred Richmond", "Dr. Simon Lowery", "Dr. Robert Crane", "Dr. Alan Chambers"],a:0,d:5},{q:"In the movie Psycho (1960), what is the specific make and model of the car Marion Crane trades her original vehicle for while fleeing Phoenix?",o:["1957 Chevrolet Bel Air", "1957 Ford Custom 300", "1959 Plymouth Savoy", "1958 Ford Fairlane"],a:1,d:5},{q:"In the movie Psycho II, how many years has Norman Bates been institutionalized before being released back into society at the beginning of the film?",o:["15 years", "20 years", "22 years", "25 years"],a:2,d:5},{q:"In Dario Argento's Phenomena (1985), what unusual ability does Jennifer have?",o:["She can communicate with and control insects", "She can see visions of the killer's future kills", "She possesses superhuman speed and pure strength", "She is completely immune to the killer's attacks"],a:0,d:5},{q:"Who plays Jennifer in Argento's Phenomena?",o:["Asia Argento", "Jessica Harper", "Jennifer Connelly", "Daria Nicolodi"],a:2,d:5}];
// v42: Per-question option shuffle. Fixes two gameplay-breaking biases:
//   (1) 58% of authored questions had the correct answer at index 1 (B)
//   (2) correct answer was usually the longest option (easy to spot without reading)
// We Fisher-Yates the 4 options and remap `a` to the new correct index.
// Part 2 (length-aware): if the correct answer ends up being the longest option,
// we re-shuffle up to 2 extra times. Combined with (1), this spreads the length
// signal across all 4 positions, reducing the "pick the longest" strategy's
// win rate from ~80%+ down to near chance (~25%).
function shuffleQuestionOptions(q) {
  if (!q || !Array.isArray(q.o) || q.o.length !== 4 || typeof q.a !== 'number') return q;
  const originalCorrect = q.o[q.a];
  if (originalCorrect == null) return q;
  // Find the longest option in the set (used for length-aware check)
  const lengths = q.o.map(opt => (opt == null ? 0 : String(opt).length));
  const maxLen = Math.max(...lengths);
  // Only apply length-aware retry if the correct answer IS currently the longest
  // and there's at least one shorter option it could swap with.
  const correctIsLongest = lengths[q.a] === maxLen && lengths.some(l => l < maxLen);
  let best = null;
  const maxTries = correctIsLongest ? 3 : 1;
  for (let attempt = 0; attempt < maxTries; attempt++) {
    // Build index pairs so we can track where correct ends up
    const idx = [0,1,2,3];
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    const newO = idx.map(i => q.o[i]);
    const newA = idx.indexOf(q.a);
    best = { ...q, o: newO, a: newA };
    // If correct answer wasn't the longest to begin with, one shuffle is fine
    if (!correctIsLongest) break;
    // Otherwise accept this shuffle only if correct answer is NOT the longest now
    if (lengths[idx[newA]] !== maxLen) break;
    // else loop and try again
  }
  return best || q;
}
function shuffleAllQuestions(arr) {
  if (!Array.isArray(arr)) return arr;
  return arr.map(shuffleQuestionOptions);
}

// v25: Question pool comes from two sources:
//   - Self-hosted server at https://api.sinistertrivia.com/questions (~1875 questions)
//   - Bundled internal arrays Q1c1...Q5c7 (~700 questions)
// When server is up: BOTH pools are merged (deduped by question text).
// When server is down: bundled internal arrays only.
// QCLOUD removed entirely to free up bundle size.
const QUESTIONS_API_URL = "https://api.sinistertrivia.com/questions";
const SERVER_FETCH_TIMEOUT_MS = 5000;

// In-memory cache so we only hit the server once per app session.
let _serverQuestionsMemCache = null;
let _serverQuestionsMemPromise = null;

async function fetchServerQuestions() {
  // Return in-flight promise if a fetch is already running (dedupe concurrent callers).
  if (_serverQuestionsMemPromise) return _serverQuestionsMemPromise;
  if (_serverQuestionsMemCache) return _serverQuestionsMemCache;

  _serverQuestionsMemPromise = (async () => {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), SERVER_FETCH_TIMEOUT_MS);
      const res = await fetch(QUESTIONS_API_URL, { signal: ctrl.signal });
      clearTimeout(t);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const qs = Array.isArray(data) ? data : (data.questions || []);
      if (!Array.isArray(qs) || qs.length === 0) throw new Error("Empty server payload");
      console.log(`[Questions] Server fetch OK: ${qs.length} questions`);
      _serverQuestionsMemCache = qs;
      return qs;
    } catch (e) {
      console.warn(`[Questions] Server fetch failed (${e.message}) — using bundled internal arrays only`);
      return null; // signal "server unavailable"
    } finally {
      _serverQuestionsMemPromise = null;
    }
  })();
  return _serverQuestionsMemPromise;
}

// Bundled fallback pools — always available, used alone when server is down or merged with server data when up.
function getBundledFallbackPool(roundNum) {
  const pools = {
    1:[...Q1c1,...Q1c14,...Q1c23,...Q1c29,...Q1c3,...Q1c31,...Q1c38,...Q1c4,...Q1c42,...Q1c43,...Q1c49,...Q1c5,...Q1c54],
    2:[...Q2c0,...Q2c1,...Q2c17,...Q2c18,...Q2c2,...Q2c21,...Q2c28,...Q2c29,...Q2c3,...Q2c4,...Q2c40,...Q2c5,...Q2c9],
    3:[...Q3c10,...Q3c11,...Q3c12,...Q3c2,...Q3c21,...Q3c28,...Q3c30,...Q3c31,...Q3c32,...Q3c38,...Q3c39,...Q3c9],
    4:[...Q4c0,...Q4c1,...Q4c10,...Q4c11,...Q4c12,...Q4c13,...Q4c14,...Q4c15,...Q4c2,...Q4c22,...Q4c23,...Q4c24,...Q4c25,...Q4c26,...Q4c27,...Q4c28,...Q4c29,...Q4c3,...Q4c30,...Q4c31,...Q4c32,...Q4c33,...Q4c5,...Q4c6,...Q4c7,...Q4c8,...Q4c9,...Q4c34],
    5:[...Q5c0,...Q5c14,...Q5c17,...Q5c19,...Q5c2,...Q5c24,...Q5c25,...Q5c28,...Q5c29,...Q5c5,...Q5c6,...Q5c7],
  };
  return pools[roundNum] || [];
}

async function getSlasherQuestions(roundNum, count=10, seed=null) {
  // Always start with bundled (~700 questions baked into the app).
  const bundled = getBundledFallbackPool(roundNum);
  // Try the server. If it's up, MERGE its questions for this difficulty into the bundled pool
  // (deduping by question text so the player never sees the same question twice).
  const serverAll = await fetchServerQuestions();
  let pool;
  if (serverAll && Array.isArray(serverAll)) {
    const serverForDifficulty = serverAll.filter(q => q.d === roundNum);
    const seenTexts = new Set(bundled.map(q => q.q));
    const newFromServer = serverForDifficulty.filter(q => !seenTexts.has(q.q));
    pool = [...bundled, ...newFromServer];
    console.log(`[Questions] D${roundNum} pool: ${bundled.length} bundled + ${newFromServer.length} from server (after dedupe) = ${pool.length} total`);
  } else {
    // Server is down — merge QCLOUD as the offline fallback for maximum coverage.
    const qcloudForDifficulty = (Array.isArray(QCLOUD) ? QCLOUD : []).filter(q => q.d === roundNum);
    const seenTexts = new Set(bundled.map(q => q.q));
    const newFromQCloud = qcloudForDifficulty.filter(q => !seenTexts.has(q.q));
    pool = [...bundled, ...newFromQCloud];
    console.log(`[Questions] D${roundNum} pool: ${bundled.length} bundled + ${newFromQCloud.length} from QCLOUD (server offline) = ${pool.length} total`);
  }
  if (seed !== null) {
    let s = seed; const rand = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
    const shuffled = [...pool]; for (let i = shuffled.length-1; i > 0; i--) { const j = Math.floor(rand()*(i+1)); [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]]; }
    return shuffled.slice(0, count);
  }
  // Fisher-Yates shuffle for proper randomization
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Skip tracking when bulk-fetching for merge (count > 20 means loadQs is handling it)
  if (count > 20) return arr.slice(0, count);
  // Track seen questions per difficulty using ASYNC storage for mobile compatibility
  const storageKey = 'sinister_seen_d' + roundNum;
  let seenArr = [];
  try { 
    const storedData = await Storage.get(storageKey);
    seenArr = JSON.parse(storedData || '[]'); 
  } catch(e) {}
  const seenSet = new Set(seenArr);
  const thresholdCount = Math.floor(pool.length * 0.95);
  // FIXED: Use >= instead of > for consistent 95% threshold
  if (seenSet.size >= thresholdCount) {
    console.log(`[Cycling] Reset triggered for difficulty ${roundNum}: ${seenSet.size}/${pool.length} seen (threshold: ${thresholdCount})`);
    seenSet.clear();
    await Storage.remove(storageKey);
  }
  const unseen = arr.filter(q => !seenSet.has(q.q));
  // IMPROVED: Better fallback logic to prevent immediate repeats
  let picked;
  if (unseen.length >= count) {
    picked = unseen.slice(0, count);
  } else if (unseen.length > 0) {
    const needed = count - unseen.length;
    const seenButNotRecent = arr.filter(q => seenSet.has(q.q) && !unseen.some(uq => uq.q === q.q));
    picked = [...unseen, ...seenButNotRecent.slice(0, needed)];
  } else {
    picked = arr.slice(0, count);
  }
  picked.forEach(q => seenSet.add(q.q));
  try {
    await Storage.set(storageKey, JSON.stringify([...seenSet]));
  } catch(e) {
    console.warn(`[Cycling] Failed to save seen questions: ${e.message}`);
  }
  console.log(`[Cycling] D${roundNum}: ${picked.length} picked, ${seenSet.size}/${pool.length} seen, ${unseen.length} were unseen`);
  return picked;
}



const Logo = ({w=240}) => {
  const letters = "SINISTER".split("");
  const fs = w >= 240 ? 58 : 44;
  return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"flex-end",filter:"drop-shadow(0 0 30px rgba(210,20,0,0.7))"}}>
      {letters.map((l, i) => (
        <span key={i} style={{
          fontFamily:"'Cinzel',serif",
          fontSize:fs,
          color:"#e8ddd4",
          display:"inline-block",
          animation:`wave 2.8s ease-in-out ${i*0.11}s infinite`,
          textShadow:"0 0 18px rgba(210,20,0,0.5)",
          letterSpacing:2
        }}>{l}</span>
      ))}
    </div>
  );
};

const HorrorTrivia = ({size=18}) => {
  const words = "Slasher Edition".split("");
  return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"flex-end",filter:"drop-shadow(0 0 12px rgba(210,20,0,0.4))"}}>
      {words.map((l, i) => (
        <span key={i} style={{
          fontFamily:"'Inter',sans-serif",
          fontSize:size,
          color:"rgba(220,180,140,0.8)",
          display:"inline-block",
          letterSpacing: l===" " ? 4 : 1,
          width: l===" " ? 10 : "auto",
          animation:`wave 2.8s ease-in-out ${0.9 + i*0.09}s infinite`,
        }}>{l===" " ? " " : l}</span>
      ))}
    </div>
  );
};





const wM = ["Dead wrong.","The abyss takes it.","Blood runs cold.","A grave mistake.","Shadows laugh.","Blade finds mark.","Knife twists.","Slashed."];
const cM = ["Impressive...","You know your terrors.","Darkness favors you.","Sharp as a knife.","Survived... for now.","Cut right through.","Horror in your veins.","Final girl energy."];
const kF = ["☠ The killer claims another...","☠ The darkness takes you...","☠ No one heard you scream...","☠ Another victim falls...","☠ The blade found its mark...","☠ You cannot outrun evil...","☠ The horror consumes you...","☠ Welcome to the body count..."];

const Au = {
  c: null, ns: [], mg: null, _bgm: null, _sfx: {}, _bgmReady: false, _loopCheckInterval: null, _muted: false,
  i() {
    if (!this.c) { this.c = new (window.AudioContext || window.webkitAudioContext)(); }
    if (this.c.state === "suspended") { this.c.resume(); }
  },
  _playing: [],
  playUrl(url, vol=0.7) {
    try {
      const a = new Audio(url);
      a.volume = vol;
      this._playing.push(a);
      a.play().catch(()=>{});
      a.onended = () => { this._playing = this._playing.filter(x => x !== a); };
    } catch(e) {}
  },
  startM(r = 1) {
    // If we're inside a mini-game that ducked the music, defer the start until resumeM is called.
    if (this._minigameDucked) {
      // Still mark that the user wants music on so resumeM picks it up
      this._muted = false;
      return;
    }
    // Any explicit call to startM means: user wants music on
    this._muted = false;
    if (!this._bgm) {
      this._bgm = new Audio("/sounds/Sinister-Dark-Ambient-Background-Music-Dark-Rage-1.mp3");
      this._bgm.loop = true;
      this._bgm.volume = 0.25;
      this._bgm.preload = "auto";
      
      // Enhanced event listeners for better loop detection
      this._bgm.addEventListener('loadeddata', () => {
        console.log('[Audio] Background music loaded');
        this._bgmReady = true;
      });
      
      this._bgm.addEventListener('canplaythrough', () => {
        console.log('[Audio] Background music ready to play');
      });
      
      this._bgm.addEventListener('ended', () => {
        console.log('[Audio] Track ended - forcing restart');
        // Force restart if loop fails
        if (this._bgm && !this._bgm.paused && !this._muted) {
          this._bgm.currentTime = 0;
          this._bgm.play().catch(e => console.warn('[Audio] Loop restart failed:', e));
        }
      });
      
      this._bgm.addEventListener('error', (e) => {
        console.error('[Audio] Background music error:', e);
        // Try alternative formats if available
        if (!this._muted) this.tryAlternativeAudio();
      });
      
      // Start loop monitoring
      this.startLoopMonitor();
    }
    
    if (this._bgm.paused && !this._muted) {
      // Ensure audio context is resumed
      this.i();
      this._bgm.play().catch(e => {
        console.warn('[Audio] Play failed:', e);
        // Retry after user interaction, but ONLY if still not muted
        document.addEventListener('click', () => {
          if (this._bgm && this._bgm.paused && !this._muted) {
            this._bgm.play().catch(err => console.warn('[Audio] Retry play failed:', err));
          }
        }, { once: true });
      });
    }
  },
  
  // Monitor if background music stops unexpectedly
  startLoopMonitor() {
    if (this._loopCheckInterval) return;
    this._loopCheckInterval = setInterval(() => {
      if (this._muted) return;
      if (this._minigameDucked) return;
      if (this._bgm && this._bgmReady && this._bgm.paused && this._bgm.currentTime > 0) {
        console.log('[Audio] Detected unexpected pause - restarting');
        this._bgm.play().catch(e => console.warn('[Audio] Monitor restart failed:', e));
      }
    }, 2000);
  },
  
  // Try alternative audio format or fallback
  tryAlternativeAudio() {
    if (this._muted) return;
    console.log('[Audio] Trying alternative audio approach');
    if (this._bgm) {
      // First try reloading the same file
      this._bgm.load();
      
      // Set up a retry mechanism
      const retryPlay = () => {
        if (this._bgm && !this._muted) {
          this._bgm.play().catch(e => {
            console.warn('[Audio] Alternative play failed:', e);
            // If all else fails, create a new Audio instance
            setTimeout(() => {
              if (this._muted) return;
              try {
                this._bgm = new Audio("/sounds/Sinister-Dark-Ambient-Background-Music-Dark-Rage-1.mp3");
                this._bgm.loop = true;
                this._bgm.volume = 0.25;
                this._bgm.play().catch(err => console.warn('[Audio] New instance failed:', err));
              } catch (err) {
                console.error('[Audio] Could not create new audio instance:', err);
              }
            }, 2000);
          });
        }
      };
      
      // Wait for reload then try playing
      setTimeout(retryPlay, 1000);
    }
  },
  
  stopM() {
    this._muted = true;
    if (this._loopCheckInterval) {
      clearInterval(this._loopCheckInterval);
      this._loopCheckInterval = null;
    }
    if (this._bgm) { 
      try { 
        this._bgm.pause(); 
        this._bgm.currentTime = 0; 
      } catch(e) {} 
    }
  },
  // Temporarily pause background music for mini-games WITHOUT changing the user's mute preference.
  // _muted stays as-is so when we call resumeM() and the user originally had music on, it picks back up.
  pauseM() {
    this._minigameDucked = true;
    if (this._bgm) {
      try { this._bgm.pause(); } catch(e) {}
    }
  },
  // Resume background music after exiting a mini-game, but only if the user hadn't muted it.
  resumeM() {
    this._minigameDucked = false;
    if (this._muted) return;
    if (this._bgm && this._bgm.paused) {
      this._bgm.play().catch(e => console.warn('[Audio] Resume from mini-game failed:', e));
    }
  },
  p(t) {
    try {
      this.i();
      const c = this.c, n = c.currentTime;
      if (t === "ok") {
        Au.playUrl("/sounds/Correct.mp3", 0.45);
      } else if (t === "no") {
        Au.playUrl("/sounds/Blood.mp3", 0.7);
      } else if (t === "click") {
        Au.playUrl("/sounds/Bell.wav", 0.41);
      } else if (t === "open") {
        Au.playUrl("/sounds/open2.mp3", 0.2);
      } else if (t === "close") {
        Au.playUrl("/sounds/Bell.wav", 0.2);
      } else if (t === "continue") {
        Au.playUrl("/sounds/Shotgun.mp3", 0.16);
      } else if (t === "type") {
        const buf = c.createBuffer(1, c.sampleRate * 0.08, c.sampleRate);
        const data = buf.getChannelData(0);
        for (let j = 0; j < data.length; j++) data[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / data.length, 8);
        const src = c.createBufferSource(), g = c.createGain();
        const bq = c.createBiquadFilter(); bq.type = "bandpass"; bq.frequency.value = 1200 + Math.random() * 400; bq.Q.value = 0.8;
        src.buffer = buf; g.gain.setValueAtTime(0.35, n); g.gain.exponentialRampToValueAtTime(0.001, n + 0.07);
        src.connect(bq); bq.connect(g); g.connect(c.destination); src.start(n);
      } else if (t === "round") {
        // silent
      } else if (t === "hb") {
        [0, 0.1].forEach(t2 => {
          const o = c.createOscillator(), g = c.createGain();
          o.type = "sine"; o.frequency.setValueAtTime(48, n + t2);
          g.gain.setValueAtTime(0.15, n + t2);
          g.gain.exponentialRampToValueAtTime(0.001, n + t2 + 0.15);
          o.connect(g); g.connect(c.destination); o.start(n + t2); o.stop(n + t2 + 0.15);
        });
      } else if (t === "win") {
        [0, 0.15, 0.3, 0.45, 0.65, 0.9].forEach((t2, i) => {
          const o = c.createOscillator(), g = c.createGain();
          o.type = "sine"; o.frequency.setValueAtTime([262, 330, 392, 523, 659, 784][i], n + t2);
          g.gain.setValueAtTime(0.1, n + t2);
          g.gain.exponentialRampToValueAtTime(0.001, n + t2 + 0.5);
          o.connect(g); g.connect(c.destination); o.start(n + t2); o.stop(n + t2 + 0.5);
        });
      }
    } catch(e) {}
  }
};

// Haptic feedback — silently does nothing on web, fires on iOS/Android via Capacitor
const Hap = {
  light()  { try { window.Capacitor?.Plugins?.Haptics?.impact({ style: "LIGHT" });  } catch(e) {} },
  medium() { try { window.Capacitor?.Plugins?.Haptics?.impact({ style: "MEDIUM" }); } catch(e) {} },
  heavy()  { try { window.Capacitor?.Plugins?.Haptics?.impact({ style: "HEAVY" });  } catch(e) {} },
  success(){ try { window.Capacitor?.Plugins?.Haptics?.notification({ type: "SUCCESS" }); } catch(e) {} },
  error()  { try { window.Capacitor?.Plugins?.Haptics?.notification({ type: "ERROR" });   } catch(e) {} },
  warn()   { try { window.Capacitor?.Plugins?.Haptics?.notification({ type: "WARNING" }); } catch(e) {} },
};

// ── BADGE SYSTEM ──
const BADGES = {
  kills:    [{id:"k1",icon:"🔪",label:"First Kill",req:1},{id:"k2",icon:"🪓",label:"Serial Killer",req:10},{id:"k3",icon:"⛓️",label:"Chainmaster",req:25},{id:"k4",icon:"💀",label:"Death Dealer",req:50}],
  survivor: [{id:"s1",icon:"🩸",label:"Blood Bath",req:50},{id:"s2",icon:"👁️",label:"All Seeing",req:200},{id:"s3",icon:"😱",label:"Scream Queen",req:500},{id:"s4",icon:"👹",label:"Demon",req:1000}],
  perfect:  [{id:"p1",icon:"🎃",label:"Pumpkin King",req:1},{id:"p2",icon:"⚰️",label:"Gravedigger",req:5},{id:"p3",icon:"🔦",label:"Final Girl",req:1},{id:"p4",icon:"🪦",label:"Tombstone",req:5}],
  master:   [{id:"m1",icon:"⭐",label:"Nightmare",req:10},{id:"m2",icon:"🌙",label:"Boogeyman",req:3},{id:"m3",icon:"🔥",label:"Horror Master",req:1}],
};
async function getBadgeStats() { try { const data = await Storage.get("sinister-badge-stats"); return JSON.parse(data || "{}"); } catch(e) { return {}; } }
async function saveBadgeStats(s) { await Storage.set("sinister-badge-stats", JSON.stringify(s)); }
async function updateBadgeStats({ gamesPlayed=0, correctAnswers=0, perfectRounds=0, perfectGames=0 }) {
  const s = await getBadgeStats();
  s.gamesPlayed    = (s.gamesPlayed    || 0) + gamesPlayed;
  s.correctAnswers = (s.correctAnswers || 0) + correctAnswers;
  s.perfectRounds  = (s.perfectRounds  || 0) + perfectRounds;
  s.perfectGames   = (s.perfectGames   || 0) + perfectGames;
  await saveBadgeStats(s); return s;
}
async function calcBadges(stats, rank) {
  const s = stats || await getBadgeStats();
  const badges = [];
  const kb = [...BADGES.kills].reverse().find(b => (s.gamesPlayed||0) >= b.req);
  if (kb) badges.push(kb.icon);
  const sb = [...BADGES.survivor].reverse().find(b => (s.correctAnswers||0) >= b.req);
  if (sb) badges.push(sb.icon);
  if ((s.perfectGames||0) >= 5)       badges.push("🪦");
  else if ((s.perfectGames||0) >= 1)  badges.push("🔦");
  else if ((s.perfectRounds||0) >= 5) badges.push("⚰️");
  else if ((s.perfectRounds||0) >= 1) badges.push("🎃");
  if (rank === 1)       badges.push("🔥");
  else if (rank <= 3)   badges.push("🌙");
  else if (rank <= 10)  badges.push("⭐");
  return badges;
}
function BadgeRow({ badges }) {
  if (!badges || badges.length === 0) return null;
  return <span style={{marginLeft:4,letterSpacing:2}}>{badges.join("")}</span>;
}


async function loadB() { try { const snap = await getDoc(doc(db, "leaderboards", "alltime")); return snap.exists() ? snap.data().scores : []; } catch(e) { console.error("loadB:", e); return []; } }
const __saveSInFlight = new Map();
async function saveS(nm, sc, cr, bg=[]) {
  const today = new Date().toISOString().slice(0,10);
  const key = `${nm}|${sc}|${cr}|${today}`;
  /* v49 concurrent-save guard: if an identical call is already in flight, return the existing promise
     instead of starting a new read-modify-write cycle. This stops double-fires from useEffect/StrictMode
     from producing duplicate leaderboard entries via the read-modify-write race. */
  if (__saveSInFlight.has(key)) { return __saveSInFlight.get(key); }
  const p = (async () => {
    try {
      const b = await loadB();
      /* second-layer dedupe: even if two calls slip past the in-flight map (e.g., across remounts),
         skip the write when Firestore already has an identical row for today. */
      const dupeIdx = b.findIndex(e => e && e.name === nm && Number(e.score) === Number(sc) && Number(e.correct) === Number(cr) && e.d === today);
      if (dupeIdx !== -1) { return b; }
      b.push({name: nm, score: sc, correct: cr, badges: bg, d: today});
      b.sort((a,c) => c.score - a.score);
      const t = b.slice(0,100);
      await setDoc(doc(db,"leaderboards","alltime"), {scores: t});
      return t;
    } catch(e) { console.error("saveS:", e); return []; }
    finally { setTimeout(() => __saveSInFlight.delete(key), 5000); /* keep the lock for 5s after completion so a delayed duplicate call can't slip through */ }
  })();
  __saveSInFlight.set(key, p);
  return p;
}
// v48: VS-wins leaderboard — tracks lifetime VS wins per name across all players globally.
// Stored in leaderboards/vs-wins with shape { scores: [{name, wins, lastWin}] }.
// Dedupes by name (merges all players with the same typed name into one row).
async function loadVsWinsB() {
  try {
    const snap = await getDoc(doc(db, "leaderboards", "vs-wins"));
    return snap.exists() && Array.isArray(snap.data().scores) ? snap.data().scores : [];
  } catch(e) { console.error("loadVsWinsB:", e); return []; }
}
// Credit a single win to the given name using a Firestore transaction so cross-device
// concurrent writes (e.g. you and your opponent both finishing a match at the same moment)
// can't overwrite each other. Transactions retry automatically on conflict up to 5 times.
async function creditVsWin(nm) {
  try {
    const cleanName = (nm || "Anonymous").trim().slice(0, 20);
    const now = new Date().toISOString();
    const ref = doc(db, "leaderboards", "vs-wins");
    const result = await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      const b = (snap.exists() && Array.isArray(snap.data().scores)) ? [...snap.data().scores] : [];
      const existing = b.find(e => e && e.name === cleanName);
      if (existing) {
        existing.wins = (existing.wins || 0) + 1;
        existing.lastWin = now;
      } else {
        b.push({ name: cleanName, wins: 1, lastWin: now });
      }
      b.sort((a, c) => (c.wins || 0) - (a.wins || 0));
      const t = b.slice(0, 100);
      tx.set(ref, { scores: t });
      return t;
    });
    return result;
  } catch(e) { console.error("creditVsWin:", e); return []; }
}
async function loadDailyB() { try { const k = "daily-" + new Date().toISOString().slice(0,10); const snap = await getDoc(doc(db,"leaderboards",k)); return snap.exists() ? snap.data().scores : []; } catch(e) { console.error("loadDailyB:", e); return []; } }
async function saveDailyS(nm, sc, cr) { try { const k = "daily-" + new Date().toISOString().slice(0,10); const b = await loadDailyB(); b.push({name: nm, score: sc, correct: cr}); b.sort((a,c) => c.score - a.score); const t = b.slice(0,100); await setDoc(doc(db,"leaderboards",k), {scores: t}); return t; } catch(e) { console.error("saveDailyS:", e); return []; } }
// Mini-game leaderboards — one doc per game at leaderboards/minigame-{gameId}
// gameId is one of: "slasher-smash", "camp-blood", "stake-vampire", "dread-words"
async function loadMiniB(gameId) {
  try {
    const snap = await getDoc(doc(db, "leaderboards", "minigame-" + gameId));
    return snap.exists() && Array.isArray(snap.data().scores) ? snap.data().scores : [];
  } catch(e) { console.error("loadMiniB " + gameId + ":", e); return []; }
}
async function saveMiniS(gameId, nm, sc) {
  try {
    const cleanName = (nm || "Anonymous").trim().slice(0, 20);
    const today = new Date().toISOString().slice(0,10);
    const ref = doc(db, "leaderboards", "minigame-" + gameId);
    const snap = await getDoc(ref);
    const b = (snap.exists() && Array.isArray(snap.data().scores)) ? [...snap.data().scores] : [];
    // Dedupe: skip if exact same name+score+date already present
    const dupe = b.find(e => e && e.name === cleanName && Number(e.score) === Number(sc) && e.d === today);
    if (dupe) return b;
    b.push({ name: cleanName, score: sc, d: today });
    b.sort((a, c) => (c.score || 0) - (a.score || 0));
    const t = b.slice(0, 50);
    await setDoc(ref, { scores: t });
    return t;
  } catch(e) { console.error("saveMiniS " + gameId + ":", e); return []; }
}

// v39: Error boundary for mini-games. If a game crashes during render,
// show a fallback screen with EXIT instead of the whole app going white.
class MiniGameErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, errorMsg: "" }; }
  static getDerivedStateFromError(error) { return { hasError: true, errorMsg: error?.message || String(error) }; }
  componentDidCatch(error, info) { console.error("[MiniGame crash]", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{position:"fixed",inset:0,background:"#050210",zIndex:100,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Cinzel',serif",padding:24,textAlign:"center"}}>
          <div style={{fontSize:42,marginBottom:16}}>💀</div>
          <div style={{fontSize:18,color:"#ff8080",letterSpacing:4,marginBottom:12}}>SOMETHING WENT WRONG</div>
          <div style={{fontSize:11,color:"rgba(230,220,210,0.5)",letterSpacing:2,marginBottom:24,maxWidth:320,lineHeight:1.6}}>
            This mini-game hit an unexpected error. Your main progress is safe.
          </div>
          <button
            onClick={() => { try { this.props.onExit && this.props.onExit(); } catch(e) {} this.setState({ hasError: false, errorMsg: "" }); }}
            style={{background:"rgba(255,80,80,0.15)",border:"1px solid rgba(255,80,80,0.5)",borderRadius:12,color:"#ff8080",fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:4,padding:"12px 32px",cursor:"pointer"}}
          >BACK TO MINI GAMES</button>
          {this.state.errorMsg && <div style={{marginTop:20,fontSize:9,color:"rgba(255,255,255,0.25)",letterSpacing:1,maxWidth:320,wordBreak:"break-word"}}>{this.state.errorMsg}</div>}
        </div>
      );
    }
    return this.props.children;
  }
}

// VS Mode Firebase functions
function genRoomCode() { return Math.floor(1000 + Math.random() * 9000).toString(); }
// v37: store the FULL question objects in the room doc so the guest renders
// the exact same questions as the host (was storing just .q text, which broke
// whenever host pulled a Firestore-only question the guest's local pool didn't have).
async function createRoom(nm, questions) {
  try {
    const code = genRoomCode();
    // Strip each question down to the 4 fields we need — keeps the doc small
    // and avoids serializing any undefined/extra props Firestore might reject.
    const cleanQs = questions.map(q => ({ q: q.q, o: q.o, a: q.a, d: q.d }));
    await setDoc(doc(db,"vsrooms",code), {
      host: nm, guest: null, status: "waiting",
      questions: cleanQs,
      hostScore: 0, guestScore: 0,
      hostDone: false, guestDone: false,
      // v43: rematch coordination flags (false until a player clicks Rematch on end screen)
      hostRematch: false, guestRematch: false,
      created: new Date().toISOString()
    });
    return code;
  } catch(e) { console.error("createRoom:", e); return null; }
}
async function joinRoom(code, nm) {
  try {
    const snap = await getDoc(doc(db,"vsrooms",code));
    if (!snap.exists()) return null;
    const data = snap.data();
    if (data.status !== "waiting") return null;
    await updateDoc(doc(db,"vsrooms",code), { guest: nm, status: "playing" });
    return data;
  } catch(e) { console.error("joinRoom:", e); return null; }
}
async function updateRoomScore(code, role, score, done) {
  try {
    const update = role === "host"
      ? { hostScore: score, hostDone: done }
      : { guestScore: score, guestDone: done };
    await updateDoc(doc(db, "vsrooms", code), update);
  } catch(e) { console.error("updateRoomScore:", e); }
}
// v37: clean up orphan rooms when host cancels before a guest joins
async function cancelRoom(code) {
  try { await deleteDoc(doc(db, "vsrooms", code)); }
  catch(e) { console.warn("cancelRoom:", e); }
}

// v43: rematch coordination helpers
async function setRematchFlag(code, role, want) {
  try {
    const update = role === "host" ? { hostRematch: want } : { guestRematch: want };
    await updateDoc(doc(db, "vsrooms", code), update);
  } catch(e) { console.error("setRematchFlag:", e); }
}
// Host-only: atomically reset the room for a fresh match. Called when BOTH rematch
// flags are true. New questions, scores zeroed, done flags cleared, rematch flags
// cleared, status flipped back to "playing" so both listeners pick it up.
async function startRematchAsHost(code, newQuestions) {
  try {
    const cleanQs = newQuestions.map(q => ({ q: q.q, o: q.o, a: q.a, d: q.d }));
    await updateDoc(doc(db, "vsrooms", code), {
      questions: cleanQs,
      hostScore: 0, guestScore: 0,
      hostDone: false, guestDone: false,
      hostRematch: false, guestRematch: false,
      status: "playing",
      rematchStartedAt: new Date().toISOString(),
    });
    return true;
  } catch(e) { console.error("startRematchAsHost:", e); return false; }
}

const Mist = () => <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:50,animation:"mF 1.8s ease-out forwards"}}>{Array.from({length:18}).map((_, i) => <div key={i} style={{position:"absolute",left:`${20+Math.random()*60}%`,bottom:`${30+Math.random()*30}%`,width:10+Math.random()*14,height:10+Math.random()*14,borderRadius:"50%",background:`radial-gradient(circle,rgba(80,220,100,${0.3+Math.random()*0.3}),transparent)`,filter:"blur(4px)",animation:`mR ${1+Math.random()}s ease-out ${Math.random()*0.3}s forwards`}} />)}</div>;


const Embers = () => {
  const embers = Array.from({length: 18}, (_, i) => ({
    id: i,
    left: 5 + Math.random() * 90,
    size: 2 + Math.random() * 3,
    duration: 4 + Math.random() * 6,
    delay: Math.random() * 8,
    drift: (Math.random() - 0.5) * 60,
    opacity: 0.4 + Math.random() * 0.5,
  }));
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:1,overflow:"hidden"}}>
      {/* Fire glow at the bottom */}
      <div style={{
        position:"absolute",
        bottom:0,
        left:0,
        right:0,
        height:"38vh",
        background:"radial-gradient(ellipse 110% 100% at 50% 100%, rgba(255,80,0,0.65) 0%, rgba(200,40,0,0.3) 50%, rgba(140,15,0,0.06) 85%, transparent 100%)",
        animation:"fireGlow 2.5s ease-in-out infinite",
      }} />
      <div style={{
        position:"absolute",
        bottom:0,
        left:0,
        right:0,
        height:"22vh",
        background:"radial-gradient(ellipse 80% 100% at 50% 100%, rgba(255,140,0,0.5) 0%, rgba(255,60,0,0.18) 65%, transparent 100%)",
        animation:"fireGlow 1.8s ease-in-out 0.4s infinite",
      }} />
      <div style={{
        position:"absolute",
        bottom:0,
        left:0,
        right:0,
        height:"10vh",
        background:"radial-gradient(ellipse 55% 100% at 50% 100%, rgba(255,180,0,0.45) 0%, transparent 100%)",
        animation:"fireGlow 1.2s ease-in-out 0.8s infinite",
      }} />
      {embers.map(e => (
        <div key={e.id} style={{
          position:"absolute",
          left:`${e.left}%`,
          bottom:"-10px",
          width:e.size,
          height:e.size * 1.4,
          borderRadius:"50% 50% 40% 40%",
          background:`rgba(${200 + Math.floor(Math.random()*55)},${40 + Math.floor(Math.random()*60)},0,${e.opacity})`,
          boxShadow:`0 0 ${e.size*2}px rgba(255,80,0,0.6)`,
          animation:`emb ${e.duration}s ease-in ${e.delay}s infinite`,
          transform:`translateX(${e.drift}px)`,
        }} />
      ))}
    </div>
  );
};

const Splat = () => <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:50,animation:"sF 2s ease-out forwards"}}>{Array.from({length:12}).map((_, i) => <div key={i} style={{position:"absolute",left:"50%",top:"50%",width:5+Math.random()*12,height:7+Math.random()*16,borderRadius:"50%",background:`rgba(${160+Math.random()*60},${Math.random()*20},0,${0.5+Math.random()*0.4})`,transform:`translate(-50%,-50%) rotate(${(i/12)*360}deg) translateY(-${8+Math.random()*20}px)`,animation:`sB 0.4s ease-out ${Math.random()*0.15}s both`}} />)}</div>;

const RN = {1:"The Slaughter Begins",2:"Blood on the Floor",3:"No One Can Hear You Scream",4:"The Killing Fields",5:"Final Nightmare"};
const DIFFICULTY_LABELS = ["Casual Carnage","Rising Terror","Blood Bath","Nightmare Fuel","Final Slaughter"];



// ── SLASHER BREAKOUT GAME ──
const SLASHER_LEVELS = [
  {
    name: "FREDDY", color: "#cc4400", glow: "#ff6600",
    // Freddy: wide-brim fedora on top, scarred face with eye sockets, razor fingers on bottom
    bricks: [
      [0,1,1,1,1,1,1,1,1,0], // wide hat brim
      [1,1,1,1,1,1,1,1,1,1], // hat top
      [0,0,1,1,1,1,1,1,0,0], // hat band / forehead
      [0,1,1,0,0,0,0,1,1,0], // scarred face top
      [0,1,0,1,0,0,1,0,1,0], // eyes (gaps = eye sockets)
      [0,1,1,1,1,1,1,1,1,0], // scarred cheeks
      [0,0,1,0,1,1,0,1,0,0], // nose + mouth gaps
      [0,1,1,1,1,1,1,1,1,0], // chin
      [1,0,1,0,1,1,0,1,0,1], // razor glove fingers
      [1,0,1,0,1,1,0,1,0,1], // razor tips
    ]
  },
  {
    name: "JASON", color: "#2244cc", glow: "#4488ff",
    // Jason: hockey mask — oval shape with 3 vertical stripe gaps and forehead holes
    bricks: [
      [0,0,1,1,1,1,1,1,0,0], // top of mask
      [0,1,1,1,1,1,1,1,1,0], // upper mask
      [1,1,0,1,1,1,1,0,1,1], // eye holes (gaps)
      [1,1,1,1,1,1,1,1,1,1], // cheekbone
      [1,1,0,1,1,1,1,0,1,1], // nose stripe gaps
      [1,1,1,0,1,1,0,1,1,1], // cheek holes
      [0,1,1,1,1,1,1,1,1,0], // jaw
      [0,0,1,1,0,0,1,1,0,0], // chin straps
      [0,0,0,1,1,1,1,0,0,0], // chin
      [0,0,0,0,1,1,0,0,0,0], // chin tip
    ]
  },
  {
    name: "MICHAEL", color: "#aaaaaa", glow: "#dddddd",
    // Michael: blank white mask — featureless oval with subtle dark eye holes
    bricks: [
      [0,0,0,1,1,1,1,0,0,0], // top of head
      [0,0,1,1,1,1,1,1,0,0], // upper head
      [0,1,1,1,1,1,1,1,1,0], // forehead
      [0,1,1,0,1,1,0,1,1,0], // eye holes (gaps = eyes)
      [0,1,1,1,1,1,1,1,1,0], // nose area — blank
      [0,1,1,1,1,1,1,1,1,0], // blank cheeks
      [0,1,1,1,0,0,1,1,1,0], // mouth gap
      [0,1,1,1,1,1,1,1,1,0], // chin
      [0,0,1,1,1,1,1,1,0,0], // lower chin
      [0,0,0,1,1,1,1,0,0,0], // chin tip
    ]
  },
  {
    name: "GHOSTFACE", color: "#dddddd", glow: "#ffffff",
    // Ghostface: tall pointed hood, elongated teardrop face, wide screaming mouth
    bricks: [
      [0,0,0,0,1,1,0,0,0,0], // tip of hood
      [0,0,0,1,1,1,1,0,0,0], // hood point
      [0,0,1,1,1,1,1,1,0,0], // hood upper
      [0,1,1,1,1,1,1,1,1,0], // hood wide
      [1,1,1,0,1,1,0,1,1,1], // eye holes in hood
      [0,1,1,1,1,1,1,1,1,0], // face top
      [0,0,1,1,1,1,1,1,0,0], // face mid
      [0,0,1,0,0,0,0,1,0,0], // screaming mouth gap
      [0,0,1,1,0,0,1,1,0,0], // chin sides
      [0,0,0,1,1,1,1,0,0,0], // draping shroud
    ]
  },
  {
    name: "LEATHERFACE", color: "#886633", glow: "#cc9944",
    // Leatherface: wide round head, stitched mask, uneven features, chainsaw below
    bricks: [
      [0,0,1,1,1,1,1,1,0,0], // top of head
      [0,1,1,1,1,1,1,1,1,0], // upper face
      [1,1,1,0,1,1,0,1,1,1], // uneven eye holes
      [1,1,1,1,1,1,1,1,1,1], // wide cheeks
      [1,1,0,1,1,1,1,0,1,1], // stitching gaps
      [1,1,1,0,0,0,0,1,1,1], // mouth gap
      [0,1,1,1,1,1,1,1,1,0], // chin / apron top
      [0,0,1,1,1,1,1,1,0,0], // apron
      [1,0,1,1,0,0,1,1,0,1], // chainsaw body
      [1,1,1,1,1,1,1,1,1,1], // chainsaw blade
    ]
  },
];


// ── WEB AUDIO MUSIC PLAYER (iOS-respecting volume) ──
// HTML5 <Audio> element ignores .volume on iOS. Routing through a GainNode in Web Audio
// fixes that. createGameMusic() returns { play, pause, setVolume, destroy } for a looping track.
function createGameMusic(url, initialVolume = 0.1) {
  let audioEl = null;
  let source = null;
  let gainNode = null;
  let ctx = null;
  let initialized = false;
  const init = () => {
    if (initialized) return;
    try {
      ctx = (typeof window !== "undefined") ? (GameSFX.ctx ? GameSFX.ctx() : null) : null;
      if (!ctx) return;
      audioEl = new Audio(url);
      audioEl.loop = true;
      audioEl.crossOrigin = "anonymous";
      audioEl.preload = "auto";
      source = ctx.createMediaElementSource(audioEl);
      gainNode = ctx.createGain();
      gainNode.gain.value = initialVolume;
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      initialized = true;
    } catch(e) { console.error("[music init]", e); }
  };
  return {
    play() {
      init();
      if (!audioEl) return;
      try {
        if (ctx && ctx.state === "suspended") ctx.resume().catch(()=>{});
        audioEl.play().catch(e => console.warn("[music play]", e.message));
      } catch(e){}
    },
    pause() {
      if (!audioEl) return;
      try { audioEl.pause(); } catch(e){}
    },
    setVolume(v) {
      if (!gainNode) return;
      try { gainNode.gain.value = v; } catch(e){}
    },
    destroy() {
      try { if (audioEl) { audioEl.pause(); audioEl.src = ""; } } catch(e){}
      try { if (source) source.disconnect(); } catch(e){}
      try { if (gainNode) gainNode.disconnect(); } catch(e){}
      audioEl = null; source = null; gainNode = null; initialized = false;
    },
  };
}

// ── 8-BIT GAME AUDIO ENGINE ──
const GameSFX = {
  _ctx: null,
  ctx() {
    if (!this._ctx) {
      try { this._ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
    }
    if (this._ctx && this._ctx.state === 'suspended') {
      this._ctx.resume().catch(()=>{});
    }
    return this._ctx && this._ctx.state !== 'closed' ? this._ctx : null;
  },
  unlock() {
    // Call on first user interaction to ensure audio context is running
    const ctx = this.ctx();
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(()=>{});
  },
  // Core tone generator
  tone(freq, dur, type='square', vol=0.15, startTime=null) {
    const ctx = this.ctx(); if (!ctx) return;
    const t = startTime || ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.start(t); osc.stop(t + dur + 0.01);
  },
  // Frequency sweep
  sweep(startFreq, endFreq, dur, type='square', vol=0.15) {
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.start(t); osc.stop(t + dur + 0.01);
  },
  // Noise burst (for explosions/hits)
  noise(dur=0.1, vol=0.2) {
    const ctx = this.ctx(); if (!ctx) return;
    const bufSize = ctx.sampleRate * dur;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    src.buffer = buf;
    src.connect(gain); gain.connect(ctx.destination);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    src.start(); src.stop(ctx.currentTime + dur + 0.01);
  },

  // ── FINAL GIRL SOUNDS ──
  fgLaneChange() { this.tone(440, 0.06, 'square', 0.12); },
  fgHit() {
    this.noise(0.15, 0.25);
    this.sweep(300, 80, 0.2, 'sawtooth', 0.15);
  },
  fgNearMiss() { this.sweep(600, 900, 0.05, 'square', 0.08); },
  fgGameOver() {
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    [220, 185, 155, 110].forEach((f, i) => this.tone(f, 0.25, 'sawtooth', 0.15, t + i * 0.22));
  },
  fgStart() {
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    [220, 330, 440, 660].forEach((f, i) => this.tone(f, 0.1, 'square', 0.13, t + i * 0.1));
  },
  fgMilestone(score) {
    // Every 100 pts — little jingle
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    [523, 659, 784].forEach((f, i) => this.tone(f, 0.08, 'square', 0.1, t + i * 0.08));
  },

  // ── SLASHER SMASH SOUNDS ──
  sbBounce() { this.tone(523, 0.04, 'square', 0.1); },
  sbPaddleHit() { this.tone(440, 0.06, 'square', 0.13); },
  sbBrickHit() {
    const freqs = [523, 587, 659, 698, 784];
    this.tone(freqs[Math.floor(Math.random() * freqs.length)], 0.07, 'square', 0.12);
  },
  sbBrickDestroy() {
    this.sweep(800, 400, 0.08, 'square', 0.15);
  },
  sbLiveLost() {
    this.noise(0.1, 0.2);
    this.sweep(440, 110, 0.3, 'sawtooth', 0.18);
  },
  sbRoundClear() {
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    const melody = [523,659,784,1047,784,1047,1319];
    melody.forEach((f, i) => this.tone(f, 0.1, 'square', 0.13, t + i * 0.09));
  },
  sbGameOver() {
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    [330, 277, 220, 165, 110].forEach((f, i) => this.tone(f, 0.2, 'sawtooth', 0.15, t + i * 0.18));
  },
  sbAllClear() {
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    const melody = [523,659,784,1047,659,784,1047,1319];
    melody.forEach((f, i) => this.tone(f, 0.12, 'square', 0.14, t + i * 0.1));
  },
  sbStart() {
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    [330, 415, 523, 659].forEach((f, i) => this.tone(f, 0.1, 'square', 0.12, t + i * 0.1));
  },
  sbPowerUp() {
    // Rising chime — power-up collected
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    [659, 784, 988, 1319].forEach((f, i) => this.tone(f, 0.08, 'square', 0.13, t + i * 0.05));
  },
  sbLaserShoot() {
    // Punchier dual-tone laser zap
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    this.tone(2200, 0.04, 'sawtooth', 0.12, t);
    this.sweep(1800, 600, 0.06, 'square', 0.1);
    this.noise(0.03, 0.08);
  },
  sbExtraLife() {
    // Cheery uplifting jingle — extra life grabbed
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.1, 'triangle', 0.15, t + i * 0.06));
  },
  sbMultiBall() {
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    [880, 988, 1175, 1397, 1175, 988].forEach((f, i) => this.tone(f, 0.06, 'square', 0.12, t + i * 0.04));
  },
  sbFireball() {
    this.noise(0.15, 0.18);
    this.sweep(880, 220, 0.25, 'sawtooth', 0.16);
  },
  sbSlowBall() {
    // Slow descending tone — time-warp feel
    this.sweep(660, 220, 0.35, 'sine', 0.16);
  },
  sbClearLevel() {
    // Triumphant explosion — long fanfare
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    this.noise(0.2, 0.2);
    [523, 659, 784, 1047, 1319, 1568, 2093].forEach((f, i) => this.tone(f, 0.14, 'square', 0.15, t + i * 0.05));
  },
  sbLaserHit() {
    // Laser hitting a brick — sharp metallic zap with a quick pop
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    this.tone(1760, 0.04, 'square', 0.13, t);
    this.sweep(2400, 800, 0.05, 'sawtooth', 0.1);
    this.noise(0.04, 0.1);
  },

  // ── CAMP BLOOD TEXT ADVENTURE SOUNDS ──
  cbAmbient() {
    // Low creepy drone
    const ctx = this.ctx(); if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(55, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(58, ctx.currentTime + 1.5);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.3);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 2.1);
  },
  cbChoice() {
    this.tone(280, 0.06, 'square', 0.1);
    setTimeout(() => this.tone(220, 0.05, 'square', 0.07), 50);
  },
  cbJasonNear() {
    const ctx = this.ctx(); if (!ctx) return;
    this.noise(0.1, 0.35);
    this.sweep(140, 40, 0.4, 'sine', 0.22);
    setTimeout(() => this.noise(0.06, 0.2), 300);
  },
  cbPickupItem() {
    // Rising two-note sting
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    this.tone(330, 0.08, 'square', 0.1, t);
    this.tone(523, 0.12, 'square', 0.1, t + 0.09);
  },
  cbDeath() {
    // Stabbing dissonant hit + descend
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    this.noise(0.05, 0.35);
    this.sweep(440, 55, 0.6, 'sawtooth', 0.2);
    this.tone(110, 0.5, 'sine', 0.12, t + 0.1);
  },
  cbEscape() {
    // Triumphant relieved arpeggio
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    [330, 415, 523, 659, 784].forEach((f, i) => this.tone(f, 0.1, 'square', 0.1, t + i * 0.08));
  },
  cbNewNode() {
    this.tone(90, 0.08, 'sine', 0.07);
    setTimeout(() => this.tone(70, 0.1, 'sine', 0.05), 80);
  },
  cbDoor() {
    // Creaking door — slow sweep + wood creak noise
    const ctx = this.ctx(); if (!ctx) return;
    this.sweep(180, 120, 0.4, 'sawtooth', 0.08);
    this.noise(0.35, 0.06);
  },
  cbWindow() {
    // Glass smash — noise burst + tinkle
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    this.noise(0.12, 0.3);
    [1200, 900, 1500, 800].forEach((f, i) => this.tone(f, 0.05, 'sine', 0.04, t + i * 0.04));
  },
  cbFootsteps() {
    // Two heavy thuds
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    this.noise(0.06, 0.15);
    setTimeout(() => this.noise(0.06, 0.15), 350);
  },
  cbRun() {
    // Fast scrambling — rapid low thuds
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    [0, 0.15, 0.28, 0.38].forEach(d => {
      setTimeout(() => this.noise(0.04, 0.1), d * 1000);
    });
  },
  cbSplash() {
    // Water splash
    const ctx = this.ctx(); if (!ctx) return;
    this.noise(0.18, 0.25);
    this.sweep(400, 80, 0.3, 'sine', 0.1);
  },
  cbAxe() {
    // Axe chop — sharp crack
    const ctx = this.ctx(); if (!ctx) return;
    this.noise(0.08, 0.25);
    this.sweep(300, 60, 0.15, 'sawtooth', 0.18);
  },
  cbFlare() {
    // Flare gun — pop + sizzle
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    this.noise(0.05, 0.3);
    this.sweep(600, 200, 0.2, 'sawtooth', 0.15);
    this.tone(880, 0.3, 'sine', 0.06, t + 0.05);
  },
  cbHide() {
    // Soft shuffling — quiet noise
    const ctx = this.ctx(); if (!ctx) return;
    this.noise(0.06, 0.2);
  },
  cbBeat() {
    // Heart beat — two thumps
    const ctx = this.ctx(); if (!ctx) return;
    this.tone(60, 0.08, 'sine', 0.2);
    setTimeout(() => this.tone(50, 0.06, 'sine', 0.15), 200);
  },
  cbFire() {
    // Fire crackling — burst of noise
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    [0, 0.1, 0.2, 0.3].forEach((d, i) => {
      setTimeout(() => this.noise(0.05 + i*0.02, 0.12), d * 1000);
    });
    this.sweep(200, 80, 0.5, 'sawtooth', 0.08);
  },
  cbRow() {
    // Oars in water — rhythmic splashes
    const ctx = this.ctx(); if (!ctx) return;
    [0, 0.4, 0.8].forEach(d => {
      setTimeout(() => { this.noise(0.04, 0.1); this.sweep(300, 100, 0.15, 'sine', 0.05); }, d * 1000);
    });
  },
  // ── DREAD WORDS SOUNDS ──
  dwRoundStart() {
    // Eerie ascending swell — round begins
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    [220, 330, 440, 660].forEach((f, i) => this.tone(f, 0.18, 'sawtooth', 0.10, t + i * 0.08));
  },
  dwSubmit() {
    // Quill scratch + confirm chime
    this.noise(0.08, 0.06);
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    [880, 1175].forEach((f, i) => this.tone(f, 0.08, 'triangle', 0.10, t + 0.1 + i * 0.06));
  },
  dwVoteCast() {
    // Single tap — heavy thud like a tombstone slam
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    this.tone(180, 0.10, 'square', 0.16, t);
    this.noise(0.06, 0.10);
  },
  dwResults() {
    // Tense reveal — descending dread chord
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    [659, 523, 392, 261].forEach((f, i) => this.tone(f, 0.22, 'sawtooth', 0.10, t + i * 0.10));
  },
  dwWinRound() {
    // Triumphant ding — you won the round
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    [784, 988, 1175, 1568].forEach((f, i) => this.tone(f, 0.12, 'square', 0.13, t + i * 0.06));
  },
  dwLoseRound() {
    // Sad horn — you lost the round
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    [392, 330, 277].forEach((f, i) => this.tone(f, 0.20, 'sawtooth', 0.10, t + i * 0.12));
  },
  dwMatchWin() {
    // Long victory fanfare
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    [523, 659, 784, 1047, 1319, 1568, 2093].forEach((f, i) => this.tone(f, 0.15, 'square', 0.14, t + i * 0.08));
  },
  dwMatchLose() {
    // Funeral toll
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    [220, 165, 110].forEach((f, i) => this.tone(f, 0.6, 'sine', 0.18, t + i * 0.4));
  },
  dwTick() {
    // Quick heartbeat thud — for the last few seconds
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    this.tone(140, 0.08, 'sine', 0.18, t);
    this.tone(140, 0.08, 'sine', 0.16, t + 0.14);
  },
  // ── SLAUGHTERSHIP SOUNDS ──
  slHit() {
    // Wet impact — knife into flesh, "hit" on enemy hideout
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    this.noise(0.18, 0.18);
    this.tone(180, 0.12, 'square', 0.18, t);
    this.tone(90, 0.18, 'sawtooth', 0.16, t + 0.04);
  },
  slMiss() {
    // Soft whoosh — the strike landed in nothing
    const ctx = this.ctx(); if (!ctx) return;
    this.noise(0.22, 0.06);
    const t = ctx.currentTime;
    this.tone(440, 0.06, 'sine', 0.05, t);
  },
  slSunk() {
    // Big explosion — a hideout was destroyed
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    this.noise(0.45, 0.30);
    this.tone(80, 0.40, 'sawtooth', 0.22, t);
    this.tone(55, 0.50, 'square', 0.20, t + 0.05);
    [220, 165, 110, 80].forEach((f, i) => this.tone(f, 0.18, 'triangle', 0.15, t + 0.1 + i * 0.08));
  },
  slOppHit() {
    // Different tone for opponent hitting YOU — alarm-ish, dread
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    this.tone(880, 0.10, 'sawtooth', 0.14, t);
    this.tone(660, 0.10, 'sawtooth', 0.14, t + 0.08);
    this.noise(0.15, 0.10);
  },
  slOppMiss() {
    // Softer thud — opponent missed you
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    this.tone(220, 0.08, 'sine', 0.10, t);
  },
  slOppSunk() {
    // Awful descending tone + noise — opponent sunk one of YOUR hideouts
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    this.noise(0.40, 0.25);
    [440, 330, 247, 165, 110].forEach((f, i) => this.tone(f, 0.20, 'sawtooth', 0.16, t + i * 0.10));
  },
  slPlace() {
    // Light click + drop — placing a hideout
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    this.tone(330, 0.05, 'square', 0.10, t);
    this.tone(247, 0.05, 'square', 0.10, t + 0.06);
  },
  slMatchStart() {
    // Tense bell + drum — match is starting
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    [659, 523, 392, 330].forEach((f, i) => this.tone(f, 0.20, 'sawtooth', 0.10, t + i * 0.10));
  },
  slMatchWin() {
    // Triumphant fanfare — you survived
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    [523, 659, 784, 1047, 1319, 1568, 2093].forEach((f, i) => this.tone(f, 0.15, 'square', 0.14, t + i * 0.08));
  },
  slMatchLose() {
    // Funeral — all your survivors died
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    [220, 165, 110].forEach((f, i) => this.tone(f, 0.6, 'sine', 0.18, t + i * 0.4));
  },

  // ── SLASHER MYSTERY SOUNDS ──
  smCardSelect() {
    // Soft tap when picking a card in the suggest/accuse dialog
    this.tone(660, 0.04, 'sine', 0.08);
  },
  smDiceRoll() {
    // Continuous rattling-bones effect: rapid noise bursts during dice tumble.
    // Schedules ~9 short noise hits over 900ms — one per dice tumble frame.
    const ctx = this.ctx(); if (!ctx) return;
    const t0 = ctx.currentTime;
    for (let i = 0; i < 9; i++) {
      this.tone(180 + Math.random() * 80, 0.04, 'square', 0.06, t0 + i * 0.1);
      this.tone(90 + Math.random() * 40, 0.03, 'sawtooth', 0.04, t0 + i * 0.1 + 0.02);
    }
  },
  smDiceLand() {
    // Final thud + brief metallic ping when dice settle on their value
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    this.tone(80, 0.18, 'sine', 0.20, t);          // body thud
    this.tone(220, 0.06, 'square', 0.10, t);       // initial impact
    this.tone(880, 0.08, 'triangle', 0.07, t + 0.04); // metallic echo
  },
  smPassage() {
    // Secret passage: creaking door open + descending whoosh + soft chime as you arrive on the other side
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    // Creak — low rising sawtooth wobble
    this.tone(60,  0.30, 'sawtooth', 0.10, t);
    this.tone(95,  0.24, 'sawtooth', 0.08, t + 0.10);
    this.tone(120, 0.20, 'sawtooth', 0.07, t + 0.20);
    // Whoosh — descending sweep with a touch of detuned air
    this.tone(440, 0.40, 'sine',     0.12, t + 0.18);
    this.tone(220, 0.50, 'sine',     0.10, t + 0.30);
    this.tone(110, 0.35, 'sine',     0.08, t + 0.45);
    // Arrive — soft minor chime
    this.tone(523, 0.20, 'triangle', 0.09, t + 0.65);
    this.tone(659, 0.30, 'triangle', 0.08, t + 0.72);
  },
  smSuggest() {
    // Detective-style two-tone "hmm" — you made a suggestion
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    this.tone(440, 0.10, 'triangle', 0.12, t);
    this.tone(523, 0.14, 'triangle', 0.12, t + 0.10);
  },
  smShowCard() {
    // Bot reveals a card to you — soft reveal chime
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    this.tone(784, 0.08, 'sine', 0.10, t);
    this.tone(988, 0.12, 'sine', 0.10, t + 0.06);
  },
  smNoShow() {
    // Nobody had a card to show — empty thud
    this.tone(165, 0.18, 'sine', 0.12);
  },
  smBotTurn() {
    // Subtle tick when a bot starts their turn
    this.tone(330, 0.04, 'square', 0.06);
  },
  smAccuse() {
    // Big dramatic "J'ACCUSE" — descending tense brass
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    [523, 466, 392, 330].forEach((f, i) => this.tone(f, 0.14, 'sawtooth', 0.13, t + i * 0.06));
  },
  smWin() {
    // Case solved — triumphant ascending arpeggio
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    [392, 523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.12, 'square', 0.13, t + i * 0.08));
  },
  smLose() {
    // Wrong accusation / eliminated — descending defeat
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    this.noise(0.08, 0.15);
    [392, 311, 247, 196].forEach((f, i) => this.tone(f, 0.2, 'sawtooth', 0.15, t + 0.05 + i * 0.15));
  },
  totSlasherTaunt() {
    // Sinister low taunting "laugh" — sequence of staccato detuned tones with a low rumble underneath.
    // Plays when a slasher takes over a tile in Trick or Treat Massacre.
    const ctx = this.ctx(); if (!ctx) return;
    const t = ctx.currentTime;
    // Low gravelly rumble underneath
    this.tone(55, 0.55, 'sawtooth', 0.10, t);
    // Staccato "ha ha ha ha" — descending detuned squares
    [220, 196, 220, 175, 196, 165].forEach((f, i) => {
      this.tone(f,        0.07, 'square', 0.14, t + 0.05 + i * 0.09);
      this.tone(f * 1.04, 0.06, 'square', 0.08, t + 0.05 + i * 0.09); // detune for grit
    });
    // Final lower note — settles the laugh
    this.tone(110, 0.20, 'sawtooth', 0.12, t + 0.65);
  },
};

function SlasherBreakout({ onExit, onHighScore, highScore }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const animRef = useRef(null);
  const [phase, setPhase] = useState("intro"); // intro | playing | roundwin | gameover | allclear
  const [lives, setLives] = useState(5);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(0);
  const [levelName, setLevelName] = useState("");
  const [roundScore, setRoundScore] = useState(0);
  const [wave, setWave] = useState(0);
  const waveRef = useRef(0);
  const phaseRef = useRef("intro");
  // Tracks whether the once-per-playthrough "clear level" power-up has been used
  const clearLevelUsedRef = useRef(false);

  const CW = 340, CH = 420;
  const PADDLE_H = 10;
  const BALL_R = 7;
  const BRICK_ROWS = 10, BRICK_COLS = 10;
  const BRICK_W = Math.floor(CW / BRICK_COLS);
  const BRICK_H = 22;
  const BRICK_TOP = 20;
  const GRIP_ZONE = 55;
  const TOTAL_H = CH + GRIP_ZONE;

  const PADDLE_W_NORMAL = 70;
  const PADDLE_W_WIDE = 110;
  const LASER_FIRE_INTERVAL = 700; // ms between auto-fire shots

  const initState = (lvl, currentLives, currentWave = 0, prevPowerUps = null, startingScore = 0) => {
    const lv = SLASHER_LEVELS[lvl];
    const bricks = [];
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        if (lv.bricks[r] && lv.bricks[r][c]) {
          bricks.push({ r, c, alive: true });
        }
      }
    }
    // Pick 2 random bricks to be power-up bricks (different bricks)
    if (bricks.length > 0) {
      // Filter out powerups the player already has — no point spawning them
      const hasWide = prevPowerUps?.paddleWide || false;
      const hasLasersAlready = prevPowerUps?.hasLasers || false;
      // Weighted pool: wider is most common, slowball is rare, others normal
      const weightedTypes = [
        { type: "wider",     weight: 4 },
        { type: "lasers",    weight: 2 },
        { type: "life",      weight: 2 },
        { type: "multiball", weight: 2 },
        { type: "fireball",  weight: 2 },
        { type: "slowball",  weight: 1 },
      ].filter(w => {
        if (w.type === "wider" && hasWide) return false;
        if (w.type === "lasers" && hasLasersAlready) return false;
        return true;
      });
      const totalWeight = weightedTypes.reduce((a, w) => a + w.weight, 0);
      const pickWeighted = () => {
        let r = Math.random() * totalWeight;
        for (const w of weightedTypes) {
          r -= w.weight;
          if (r <= 0) return w.type;
        }
        return weightedTypes[0].type;
      };
      const pickedIndices = new Set();
      const numPowerUps = Math.min(2, bricks.length);
      while (pickedIndices.size < numPowerUps) {
        pickedIndices.add(Math.floor(Math.random() * bricks.length));
      }
      const chosenIndices = [...pickedIndices];
      // Roll for rare "clear level" power-up — 5% chance to replace one of the picks
      // Only if it hasn't been used yet this playthrough
      let didClearLevel = false;
      chosenIndices.forEach(idx => {
        let chosenType;
        if (!didClearLevel && !clearLevelUsedRef.current && Math.random() < 0.05) {
          chosenType = "clearlevel";
          didClearLevel = true;
        } else {
          chosenType = pickWeighted();
        }
        bricks[idx].powerType = chosenType;
        console.log("[SlasherSmash] Level " + lvl + " (" + lv.name + "): power-up at idx " + idx + "/" + bricks.length + ", type=" + chosenType);
      });
    }
    const spd = 3.5 + currentWave * 0.2;
    // Carry power-ups across rounds (lost only on life loss / game over)
    const paddleWide = prevPowerUps?.paddleWide || false;
    const hasLasers = prevPowerUps?.hasLasers || false;
    const pw = paddleWide ? PADDLE_W_WIDE : PADDLE_W_NORMAL;
    return {
      paddle: { x: CW / 2 - pw / 2, y: CH - 40 },
      balls: [{ x: CW / 2, y: CH - 60, vx: spd, vy: -spd, trail: [] }],
      bricks,
      lives: currentLives,
      score: startingScore,
      level: lvl,
      started: false,
      paddleWide,
      hasLasers,
      lasers: [],
      lastLaserTime: 0,
      fireballUntil: 0,
      slowBallUntil: 0,
      baseSpeed: spd, // remember the round's normal speed for slow-ball recovery
      brickFx: [], // brick destruction effects { x, y, w, h, color, startedAt, type }
    };
  };

  const startLevel = (lvl, currentLives, currentWave = 0, prevPowerUps = null, startingScore = 0) => {
    const s = initState(lvl, currentLives, currentWave, prevPowerUps, startingScore);
    stateRef.current = s;
    setLives(currentLives);
    setScore(startingScore);
    setLevel(lvl);
    setWave(currentWave);
    waveRef.current = currentWave;
    setLevelName(SLASHER_LEVELS[lvl].name);
    phaseRef.current = "playing";
    setPhase("playing");
    GameSFX.sbStart();
  };

  const drawGame = useCallback((ctx, s, lvl) => {
    const lv = SLASHER_LEVELS[lvl];
    ctx.clearRect(0, 0, CW, TOTAL_H);

    // Background (play area)
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, CW, CH);

    // Killer name watermark
    ctx.save();
    ctx.globalAlpha = 0.04;
    ctx.fillStyle = lv.color;
    ctx.font = "bold 60px 'Cinzel', serif";
    ctx.textAlign = "center";
    ctx.fillText(lv.name, CW/2, CH/2 + 20);
    ctx.restore();

    // Bricks
    s.bricks.forEach(b => {
      if (!b.alive) return;
      const x = b.c * BRICK_W + 2;
      const y = BRICK_TOP + b.r * BRICK_H + 2;
      const w = BRICK_W - 4;
      const h = BRICK_H - 4;
      const isPowerUp = !!b.powerType;
      ctx.save();
      if (isPowerUp) {
        const colorMap = {
          wider:      { stroke: "#ff5050", fill: "#ff3030", glow: "#ff7070" },
          lasers:     { stroke: "#ffe640", fill: "#ffdd00", glow: "#fff080" },
          life:       { stroke: "#ff80d0", fill: "#ff60c0", glow: "#ffa0e0" },
          multiball:  { stroke: "#60ff80", fill: "#30ff60", glow: "#90ffa0" },
          fireball:   { stroke: "#ffaa44", fill: "#ff8800", glow: "#ffcc66" },
          slowball:   { stroke: "#60dfff", fill: "#30bfff", glow: "#a0e8ff" },
          clearlevel: { stroke: "#ffffff", fill: "#cccccc", glow: "#ffffff" },
        };
        const col = colorMap[b.powerType] || colorMap.wider;
        const pulse = 0.6 + 0.4 * Math.sin(Date.now() / 180);
        // Scale pulse — stronger for the rare clearlevel brick
        const isRare = b.powerType === "clearlevel";
        const scalePulse = isRare
          ? 1 + 0.18 * Math.sin(Date.now() / 140)
          : 1 + 0.08 * Math.sin(Date.now() / 200);
        ctx.translate(x + w/2, y + h/2);
        ctx.scale(scalePulse, scalePulse);
        ctx.translate(-(x + w/2), -(y + h/2));
        ctx.shadowColor = col.glow;
        ctx.shadowBlur = (isRare ? 32 : 22) * pulse;
        ctx.fillStyle = col.fill + "33";
        ctx.strokeStyle = col.stroke;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const r3 = 3;
        ctx.moveTo(x + r3, y);
        ctx.lineTo(x + w - r3, y);
        ctx.arcTo(x + w, y, x + w, y + r3, r3);
        ctx.lineTo(x + w, y + h - r3);
        ctx.arcTo(x + w, y + h, x + w - r3, y + h, r3);
        ctx.lineTo(x + r3, y + h);
        ctx.arcTo(x, y + h, x, y + h - r3, r3);
        ctx.lineTo(x, y + r3);
        ctx.arcTo(x, y, x + r3, y, r3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = col.glow;
        ctx.shadowBlur = 6;
        ctx.font = "bold 16px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const iconMap = {
          wider: "<>",
          lasers: "*",
          life: "🔪",
          multiball: "o",
          fireball: "F",
          slowball: "S",
          clearlevel: "★",
        };
        const icon = iconMap[b.powerType] || "?";
        ctx.fillText(icon, x + w/2, y + h/2 + 1);
      } else {
        // Outline-only glowing brick (matches main page button style)
        ctx.shadowColor = lv.glow;
        ctx.shadowBlur = 10;
        ctx.strokeStyle = lv.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const r3 = 3;
        ctx.moveTo(x + r3, y);
        ctx.lineTo(x + w - r3, y);
        ctx.arcTo(x + w, y, x + w, y + r3, r3);
        ctx.lineTo(x + w, y + h - r3);
        ctx.arcTo(x + w, y + h, x + w - r3, y + h, r3);
        ctx.lineTo(x + r3, y + h);
        ctx.arcTo(x, y + h, x, y + h - r3, r3);
        ctx.lineTo(x, y + r3);
        ctx.arcTo(x, y, x + r3, y, r3);
        ctx.closePath();
        ctx.stroke();
      }
      ctx.restore();
    });

    // Paddle
    const pw = s.paddleWide ? PADDLE_W_WIDE : PADDLE_W_NORMAL;
    ctx.save();
    ctx.shadowColor = s.paddleWide ? "#c040ff" : "#ff3300";
    ctx.shadowBlur = 12;
    ctx.fillStyle = s.paddleWide ? "#9020dd" : "#cc2200";
    ctx.beginPath();
    const pr2=5,px2=s.paddle.x,py2=s.paddle.y,pw2=pw,ph2=PADDLE_H;
    ctx.moveTo(px2+pr2,py2);ctx.lineTo(px2+pw2-pr2,py2);ctx.arcTo(px2+pw2,py2,px2+pw2,py2+pr2,pr2);
    ctx.lineTo(px2+pw2,py2+ph2-pr2);ctx.arcTo(px2+pw2,py2+ph2,px2+pw2-pr2,py2+ph2,pr2);
    ctx.lineTo(px2+pr2,py2+ph2);ctx.arcTo(px2,py2+ph2,px2,py2+ph2-pr2,pr2);
    ctx.lineTo(px2,py2+pr2);ctx.arcTo(px2,py2,px2+pr2,py2,pr2);ctx.closePath();
    ctx.fill();
    // Laser cannon indicators on paddle ends if hasLasers
    if (s.hasLasers) {
      ctx.fillStyle = "#c040ff";
      ctx.fillRect(px2 + 1, py2 - 3, 4, 3);
      ctx.fillRect(px2 + pw2 - 5, py2 - 3, 4, 3);
    }
    ctx.restore();

    // Lasers
    if (s.lasers && s.lasers.length > 0) {
      ctx.save();
      s.lasers.forEach(L => {
        // Outer glow
        ctx.shadowColor = "#e060ff";
        ctx.shadowBlur = 14;
        ctx.fillStyle = "#a020f0";
        ctx.fillRect(L.x - 2.5, L.y, 5, 14);
        // Bright inner core
        ctx.shadowBlur = 4;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(L.x - 1, L.y + 2, 2, 10);
        // Glowing tip
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 8;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(L.x, L.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    // Brick destruction FX (expanding fade + particles)
    if (s.brickFx && s.brickFx.length > 0) {
      const now = Date.now();
      const FX_DURATION = 280;
      const survivors = [];
      for (const fx of s.brickFx) {
        const age = now - fx.startedAt;
        if (age >= FX_DURATION) continue;
        const t = age / FX_DURATION; // 0..1
        const ease = t * t; // accelerating expansion
        ctx.save();
        // Expanding ghost rectangle
        const grow = 12 * ease;
        const cx = fx.x + fx.w / 2;
        const cy = fx.y + fx.h / 2;
        const alpha = 1 - t;
        ctx.globalAlpha = alpha;
        ctx.shadowColor = fx.color;
        ctx.shadowBlur = 18 * (1 - t);
        ctx.fillStyle = fx.color;
        ctx.fillRect(fx.x - grow / 2, fx.y - grow / 2, fx.w + grow, fx.h + grow);
        // Debris particles — 6 small squares flying outward
        ctx.shadowBlur = 0;
        ctx.fillStyle = fx.color;
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          const dist = 4 + ease * 22;
          const px = cx + Math.cos(a) * dist;
          const py = cy + Math.sin(a) * dist;
          const sz = 4 * (1 - t);
          ctx.fillRect(px - sz / 2, py - sz / 2, sz, sz);
        }
        ctx.restore();
        survivors.push(fx);
      }
      s.brickFx = survivors;
    }

    // Balls (multi-ball + fireball support, with glowing trail)
    const isFireball = s.fireballUntil && Date.now() < s.fireballUntil;
    s.balls.forEach(ball => {
      // Trail — fading dots behind ball
      if (ball.trail && ball.trail.length > 0) {
        ctx.save();
        const trailColor = isFireball ? "#ff8800" : "#e8ddd4";
        const trailGlow = isFireball ? "#ff5500" : "#ffffff";
        ctx.shadowColor = trailGlow;
        for (let i = 0; i < ball.trail.length; i++) {
          const t = i / ball.trail.length; // 0 = oldest, 1 = newest
          const r = BALL_R * (0.3 + t * 0.7);
          const alpha = t * 0.5;
          ctx.globalAlpha = alpha;
          ctx.shadowBlur = 8 * t;
          ctx.fillStyle = trailColor;
          ctx.beginPath();
          ctx.arc(ball.trail[i].x, ball.trail[i].y, r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      // Ball itself — with stronger glow
      ctx.save();
      if (isFireball) {
        const pulse = 0.7 + 0.3 * Math.sin(Date.now() / 80);
        ctx.shadowColor = "#ff5500";
        ctx.shadowBlur = 22 * pulse;
        const grad = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, BALL_R + 2);
        grad.addColorStop(0, "#ffee88");
        grad.addColorStop(0.5, "#ff8800");
        grad.addColorStop(1, "#cc2200");
        ctx.fillStyle = grad;
      } else {
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 18;
        ctx.fillStyle = "#ffffff";
      }
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
      ctx.fill();
      // Bright inner core for extra pop
      if (!isFireball) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_R * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // ── GRIP ZONE (below play area) ──
    ctx.strokeStyle = "rgba(255,80,80,0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, CH); ctx.lineTo(CW, CH); ctx.stroke();
    ctx.fillStyle = "rgba(255,80,80,0.04)";
    ctx.fillRect(0, CH, CW, GRIP_ZONE);
    // Round grip indicator centered under paddle
    const _pw = s.paddleWide ? PADDLE_W_WIDE : PADDLE_W_NORMAL;
    const gripCX = s.paddle.x + _pw/2;
    const gripCY = CH + GRIP_ZONE/2;
    const gripR = 22;
    ctx.strokeStyle = "rgba(255,80,80,0.45)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(gripCX, gripCY, gripR, 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle = "rgba(255,80,80,0.3)";
    ctx.beginPath(); ctx.arc(gripCX, gripCY, gripR - 10, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "rgba(255,150,150,0.7)";
    ctx.font = "bold 12px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("↑", gripCX, gripCY + 1);
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const s = stateRef.current;

    const loop = () => {
      if (phaseRef.current !== "playing") return;
      const s = stateRef.current;
      if (!s.started) { drawGame(ctx, s, s.level); animRef.current = requestAnimationFrame(loop); return; }

      const FIREBALL_DURATION = 10000;
      const isFireball = s.fireballUntil && Date.now() < s.fireballUntil;
      const _pw = s.paddleWide ? PADDLE_W_WIDE : PADDLE_W_NORMAL;

      // Slow-ball expiry — restore balls to base speed when timer runs out
      if (s.slowBallUntil && Date.now() >= s.slowBallUntil) {
        s.slowBallUntil = 0;
        const baseSpd = s.baseSpeed || 3.5;
        for (const bb of s.balls) {
          const cur = Math.sqrt(bb.vx * bb.vx + bb.vy * bb.vy);
          if (cur > 0) {
            const r = baseSpd / cur;
            bb.vx *= r;
            bb.vy *= r;
          }
        }
      }

      // Move + wall-bounce + paddle-bounce all balls; remove fallen balls
      const survivingBalls = [];
      for (const ball of s.balls) {
        ball.x += ball.vx;
        ball.y += ball.vy;
        // Trail tracking — keep last 12 positions
        if (!ball.trail) ball.trail = [];
        ball.trail.push({ x: ball.x, y: ball.y });
        if (ball.trail.length > 12) ball.trail.shift();
        if (ball.x - BALL_R < 0) { ball.x = BALL_R; ball.vx = Math.abs(ball.vx); GameSFX.sbBounce(); }
        if (ball.x + BALL_R > CW) { ball.x = CW - BALL_R; ball.vx = -Math.abs(ball.vx); GameSFX.sbBounce(); }
        if (ball.y - BALL_R < 0) { ball.y = BALL_R; ball.vy = Math.abs(ball.vy); GameSFX.sbBounce(); }
        if (ball.y > CH + 20) continue;
        if (
          ball.y + BALL_R >= s.paddle.y &&
          ball.y + BALL_R <= s.paddle.y + PADDLE_H + 4 &&
          ball.x >= s.paddle.x - 4 &&
          ball.x <= s.paddle.x + _pw + 4 &&
          ball.vy > 0
        ) {
          const hitPos = (ball.x - s.paddle.x) / _pw;
          const angle = (hitPos - 0.5) * 2.2;
          const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
          ball.vx = speed * Math.sin(angle);
          ball.vy = -Math.abs(speed * Math.cos(angle)) * 0.95 - 0.5;
          ball.y = s.paddle.y - BALL_R - 1;
          GameSFX.sbPaddleHit();
        }
        survivingBalls.push(ball);
      }
      s.balls = survivingBalls;

      // All balls lost — life lost
      if (s.balls.length === 0) {
        s.lives -= 1;
        setLives(s.lives);
        if (s.lives <= 0) {
          phaseRef.current = "gameover";
          setPhase("gameover");
          onHighScore(s.score);
          GameSFX.sbGameOver();
          return;
        }
        GameSFX.sbLiveLost();
        s.paddleWide = false;
        s.hasLasers = false;
        s.lasers = [];
        s.fireballUntil = 0;
        s.slowBallUntil = 0;
        const pwReset = PADDLE_W_NORMAL;
        s.balls = [{
          x: s.paddle.x + pwReset / 2,
          y: s.paddle.y - 20,
          vx: 3.5 * (Math.random() > 0.5 ? 1 : -1),
          vy: -3.5,
          trail: [],
        }];
        s.started = false;
      }

      // Auto-fire lasers
      if (s.hasLasers && s.started) {
        const now = Date.now();
        if (now - s.lastLaserTime >= LASER_FIRE_INTERVAL) {
          s.lastLaserTime = now;
          s.lasers.push({ x: s.paddle.x + 3, y: s.paddle.y - 4 });
          s.lasers.push({ x: s.paddle.x + _pw - 3, y: s.paddle.y - 4 });
          GameSFX.sbLaserShoot();
        }
      }

      // Spawn an explosion effect for a brick (called whenever a brick is destroyed)
      const spawnBrickFx = (b, color) => {
        const defaultColor = SLASHER_LEVELS[s.level]?.color || "#cc4400";
        s.brickFx.push({
          x: b.c * BRICK_W + 2,
          y: BRICK_TOP + b.r * BRICK_H + 2,
          w: BRICK_W - 4,
          h: BRICK_H - 4,
          color: color || defaultColor,
          startedAt: Date.now(),
        });
      };
      // Helper to apply power-up effect
      const applyPowerUp = (b, sourceBall) => {
        if (b.powerType === "wider") {
          s.paddleWide = true;
          GameSFX.sbPowerUp();
        } else if (b.powerType === "lasers") {
          s.hasLasers = true;
          GameSFX.sbPowerUp();
        } else if (b.powerType === "life") {
          s.lives += 1;
          setLives(s.lives);
          GameSFX.sbExtraLife();
        } else if (b.powerType === "multiball") {
          if (s.balls.length < 5 && sourceBall) {
            const speed = Math.sqrt(sourceBall.vx * sourceBall.vx + sourceBall.vy * sourceBall.vy);
            const baseAngle = Math.atan2(sourceBall.vy, sourceBall.vx);
            s.balls.push({ x: sourceBall.x, y: sourceBall.y, vx: Math.cos(baseAngle + 0.5) * speed, vy: Math.sin(baseAngle + 0.5) * speed, trail: [] });
            if (s.balls.length < 5) {
              s.balls.push({ x: sourceBall.x, y: sourceBall.y, vx: Math.cos(baseAngle - 0.5) * speed, vy: Math.sin(baseAngle - 0.5) * speed, trail: [] });
            }
          }
          GameSFX.sbMultiBall();
        } else if (b.powerType === "fireball") {
          s.fireballUntil = Date.now() + FIREBALL_DURATION;
          GameSFX.sbFireball();
        } else if (b.powerType === "slowball") {
          // Slow all balls to 65% of base speed for 10 seconds
          s.slowBallUntil = Date.now() + 10000;
          const baseSpd = s.baseSpeed || 3.5;
          const targetSpd = baseSpd * 0.65;
          for (const bb of s.balls) {
            const cur = Math.sqrt(bb.vx * bb.vx + bb.vy * bb.vy);
            if (cur > 0) {
              const r = targetSpd / cur;
              bb.vx *= r;
              bb.vy *= r;
            }
          }
          GameSFX.sbSlowBall();
        } else if (b.powerType === "clearlevel") {
          // Wipe all bricks — round-clear logic later in the loop will fire
          clearLevelUsedRef.current = true;
          for (const bb of s.bricks) {
            if (bb.alive) spawnBrickFx(bb);
            bb.alive = false;
          }
          GameSFX.sbClearLevel();
        } else {
          GameSFX.sbBrickHit();
        }
      };

      // Move + collide lasers
      if (s.lasers && s.lasers.length > 0) {
        const LASER_SPEED = 12;
        const survivors = [];
        for (const L of s.lasers) {
          L.y -= LASER_SPEED;
          if (L.y < -10) continue;
          let hit = false;
          for (const b of s.bricks) {
            if (!b.alive) continue;
            const bx = b.c * BRICK_W + 2;
            const by = BRICK_TOP + b.r * BRICK_H + 2;
            const bw = BRICK_W - 4;
            const bh = BRICK_H - 4;
            if (L.x >= bx && L.x <= bx + bw && L.y >= by && L.y <= by + bh) {
              const puColor = b.powerType === "wider" ? "#ff3030"
                : b.powerType === "lasers" ? "#ffdd00"
                : b.powerType === "life" ? "#ff60c0"
                : b.powerType === "multiball" ? "#30ff60"
                : b.powerType === "fireball" ? "#ff8800"
                : b.powerType === "slowball" ? "#30bfff"
                : b.powerType === "clearlevel" ? "#ffffff"
                : null;
              spawnBrickFx(b, puColor);
              b.alive = false;
              s.score += 10;
              setScore(s.score);
              GameSFX.sbLaserHit();
              if (b.powerType) applyPowerUp(b, s.balls[0]);
              hit = true;
              break;
            }
          }
          if (!hit) survivors.push(L);
        }
        s.lasers = survivors;
      }

      // Brick collisions for each ball
      let bricksLeft = 0;
      s.bricks.forEach(b => { if (b.alive) bricksLeft++; });

      for (const ball of s.balls) {
        let collided = false;
        for (const b of s.bricks) {
          if (!b.alive) continue;
          if (collided && !isFireball) break;
          const bx = b.c * BRICK_W + 2;
          const by = BRICK_TOP + b.r * BRICK_H + 2;
          const bw = BRICK_W - 4;
          const bh = BRICK_H - 4;
          if (
            ball.x + BALL_R > bx && ball.x - BALL_R < bx + bw &&
            ball.y + BALL_R > by && ball.y - BALL_R < by + bh
          ) {
            const puColor = b.powerType === "wider" ? "#ff3030"
              : b.powerType === "lasers" ? "#ffdd00"
              : b.powerType === "life" ? "#ff60c0"
              : b.powerType === "multiball" ? "#30ff60"
              : b.powerType === "fireball" ? "#ff8800"
              : b.powerType === "slowball" ? "#30bfff"
              : b.powerType === "clearlevel" ? "#ffffff"
              : null;
            spawnBrickFx(b, puColor);
            b.alive = false;
            bricksLeft--;
            s.score += 10;
            applyPowerUp(b, ball);
            setScore(s.score);
            if (!isFireball) {
              const fromLeft = ball.x < bx + bw / 2;
              const fromTop = ball.y < by + bh / 2;
              const overlapX = fromLeft ? (ball.x + BALL_R - bx) : (bx + bw - (ball.x - BALL_R));
              const overlapY = fromTop ? (ball.y + BALL_R - by) : (by + bh - (ball.y - BALL_R));
              if (overlapX < overlapY) ball.vx *= -1;
              else ball.vy *= -1;
              const spd = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
              const maxSpd = 8;
              const isSlow = s.slowBallUntil && Date.now() < s.slowBallUntil;
              if (!isSlow && spd < maxSpd) {
                ball.vx *= 1.02;
                ball.vy *= 1.02;
              }
              collided = true;
            }
          }
        }
      }

      // All bricks cleared
      if (bricksLeft === 0) {
        const bonusScore = s.lives * 50;
        s.score += bonusScore;
        setRoundScore(s.score);
        phaseRef.current = "roundwin";
        setScore(s.score);
        setPhase("roundwin");
        GameSFX.sbRoundClear();
        onHighScore(s.score);
        return;
      }

      drawGame(ctx, s, s.level);
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [phase]);

  // Touch/mouse paddle control
  const handleMove = useCallback((clientX) => {
    const canvas = canvasRef.current;
    if (!canvas || phaseRef.current !== "playing") return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CW / rect.width;
    const x = (clientX - rect.left) * scaleX;
    const s = stateRef.current;
    if (!s) return;
    const _pw = s.paddleWide ? PADDLE_W_WIDE : PADDLE_W_NORMAL;
    s.paddle.x = Math.max(0, Math.min(CW - _pw, x - _pw / 2));
    if (!s.started && s.balls && s.balls[0]) {
      s.balls[0].x = s.paddle.x + _pw / 2;
    }
  }, []);

  const handleTap = useCallback(() => {
    if (phaseRef.current !== "playing") return;
    const s = stateRef.current;
    if (s && !s.started) s.started = true;
  }, []);

  const nextLevel = () => {
    const s = stateRef.current;
    const carryPowerUps = s ? { paddleWide: s.paddleWide, hasLasers: s.hasLasers } : null;
    const carryScore = s ? s.score : 0;
    const nextLvl = level + 1;
    if (nextLvl >= SLASHER_LEVELS.length) {
      const nextWave = waveRef.current + 1;
      waveRef.current = nextWave;
      startLevel(0, lives, nextWave, carryPowerUps, carryScore);
    } else {
      startLevel(nextLvl, lives, waveRef.current, carryPowerUps, carryScore);
    }
  };

  const titleStyle = {fontSize:22,color:"#e8ddd4",letterSpacing:5,marginBottom:8,fontFamily:"'Cinzel',serif"};
  const subStyle = {fontSize:12,color:"rgba(255,255,255,0.35)",letterSpacing:3,marginBottom:6};
  const btnStyle = {background:"transparent",border:"1px solid rgba(255,80,80,0.5)",borderRadius:12,color:"#ff8080",fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:4,padding:"12px 28px",cursor:"pointer"};
  const btn2Style = {...btnStyle,border:"1px solid rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.4)"};

  return (
    <div style={{position:"fixed",inset:0,background:"#080808",zIndex:100,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Cinzel',serif"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",zIndex:2}}>
        <button onClick={onExit} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.2)",borderRadius:8,color:"rgba(255,255,255,0.5)",fontSize:11,letterSpacing:2,padding:"6px 12px",cursor:"pointer"}}>← EXIT</button>
        <div style={{color:"rgba(255,80,80,0.9)",fontSize:12,letterSpacing:4}}>SLASHER SMASH</div>
        <div style={{color:"rgba(255,255,255,0.3)",fontSize:11,letterSpacing:2}}>BEST: {highScore}</div>
      </div>

      {phase === "intro" && (
        <div style={{textAlign:"center",padding:24,maxWidth:360,margin:"0 auto",position:"relative",zIndex:2}}>
          <div style={{fontSize:42,marginBottom:12}}>💀</div>
          <div style={titleStyle}>SLASHER SMASH</div>
          <div style={{...subStyle,marginBottom:4}}>SMASH THE SLASHERS BRICK BY BRICK</div>
          <div style={{...subStyle,marginBottom:4}}>5 KILLERS — THEY KEEP COMING BACK FASTER</div>
          <div style={{...subStyle,marginBottom:4}}>LIVES REMAINING BONUS EACH ROUND</div>
          <div style={{...subStyle,marginBottom:18}}>TAP TO LAUNCH — MOVE PADDLE TO AIM</div>

          <div style={{border:"1px solid rgba(255,80,80,0.25)",borderRadius:10,padding:"14px 16px",marginBottom:18,background:"rgba(20,5,5,0.5)",textAlign:"left"}}>
            <div style={{color:"rgba(255,80,80,0.9)",fontSize:11,letterSpacing:3,textAlign:"center",marginBottom:10,fontFamily:"'Cinzel',serif"}}>POWER-UPS</div>
            {[
              {color:"#ff3030", name:"WIDER",     desc:"Bigger paddle"},
              {color:"#ffdd00", name:"LASERS",    desc:"Tap to fire from paddle"},
              {color:"#ff60c0", name:"EXTRA LIFE",desc:"+1 life"},
              {color:"#30ff60", name:"MULTIBALL", desc:"Splits into 3 balls"},
              {color:"#ff8800", name:"FIREBALL",  desc:"Ball burns through bricks"},
              {color:"#30bfff", name:"SLOWBALL",  desc:"Slows ball briefly"},
              {color:"#ffffff", name:"CLEAR",     desc:"Rare — clears the level"},
            ].map(p => (
              <div key={p.name} style={{display:"flex",alignItems:"center",gap:10,marginBottom:5}}>
                <span style={{display:"inline-block",width:12,height:12,borderRadius:3,background:p.color,boxShadow:`0 0 6px ${p.color}`,flexShrink:0}} />
                <span style={{color:"#e8ddd4",fontSize:11,letterSpacing:1,fontFamily:"'Cinzel',serif",fontWeight:600,minWidth:78}}>{p.name}</span>
                <span style={{color:"rgba(255,255,255,0.55)",fontSize:11,letterSpacing:0.5}}>{p.desc}</span>
              </div>
            ))}
          </div>

          <button onClick={() => { waveRef.current = 0; clearLevelUsedRef.current = false; startLevel(0, 5, 0); }} style={btnStyle}>START</button>
          {highScore > 0 && <div style={{marginTop:16,color:"rgba(255,255,255,0.25)",fontSize:12,letterSpacing:2}}>YOUR BEST: {highScore}</div>}
        </div>
      )}

      {phase === "playing" && (
        <div style={{width:"100%",maxWidth:360,padding:"0 10px",position:"relative",zIndex:2}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,padding:"0 4px"}}>
            <div style={{display:"flex",gap:3,alignItems:"center",maxWidth:160,overflow:"hidden"}}>
              {lives <= 8
                ? Array.from({length: lives}, (_, i) => <span key={i} style={{fontSize:16}}>🔪</span>)
                : <><span style={{fontSize:16}}>🔪</span><span style={{color:"#e8ddd4",fontSize:13,fontFamily:"'Jolly Lodger',serif",marginLeft:4}}>x{lives}</span></>
              }
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{color:"rgba(255,80,80,0.8)",fontSize:12,letterSpacing:4}}>{SLASHER_LEVELS[level]?.name}</div>
              {wave > 0 && <div style={{color:"rgba(255,150,0,0.7)",fontSize:9,letterSpacing:2}}>WAVE {wave + 1}</div>}
            </div>
            <div style={{color:"#e8ddd4",fontSize:15,fontFamily:"'Jolly Lodger',serif",letterSpacing:3}}>{score}</div>
          </div>
          <canvas
            ref={canvasRef}
            width={CW}
            height={TOTAL_H}
            style={{width:"100%",borderRadius:12,border:"1px solid rgba(255,80,80,0.15)",display:"block",touchAction:"none",userSelect:"none",WebkitUserSelect:"none",WebkitTouchCallout:"none",WebkitTapHighlightColor:"transparent"}}
            onMouseMove={e => handleMove(e.clientX)}
            onTouchMove={e => { e.preventDefault(); handleMove(e.touches[0].clientX); }}
            onMouseDown={handleTap}
            onTouchStart={e => { e.preventDefault(); handleMove(e.touches[0].clientX); handleTap(); }}
          />
          <div style={{textAlign:"center",color:"rgba(255,255,255,0.12)",fontSize:10,letterSpacing:2,marginTop:6}}>
            {stateRef.current?.started ? "MOVE TO AIM" : "TAP CANVAS TO LAUNCH"}
          </div>
        </div>
      )}

      {phase === "roundwin" && (
        <div style={{textAlign:"center",padding:24,position:"relative",zIndex:2}}>
          <div style={{fontSize:42,marginBottom:12}}>🔪</div>
          <div style={{fontSize:13,color:"rgba(255,80,80,0.7)",letterSpacing:4,marginBottom:4}}>{SLASHER_LEVELS[level]?.name} DEFEATED</div>
          <div style={titleStyle}>ROUND CLEAR</div>
          <div style={{fontSize:38,color:"#e8ddd4",fontFamily:"'Jolly Lodger',serif",letterSpacing:4,margin:"12px 0"}}>{roundScore}</div>
          <div style={{...subStyle,marginBottom:4}}>LIVES BONUS: +{lives * 50}</div>
          {level + 1 < SLASHER_LEVELS.length
            ? <div style={{...subStyle,marginBottom:20}}>NEXT: {SLASHER_LEVELS[level + 1]?.name}</div>
            : <div style={{...subStyle,marginBottom:20}}>WAVE {wave + 1} COMPLETE — THEY RETURN FASTER</div>
          }
          <div style={{display:"flex",gap:12,justifyContent:"center"}}>
            <button onClick={nextLevel} style={btnStyle}>{level + 1 < SLASHER_LEVELS.length ? "NEXT KILLER" : "NEXT WAVE"}</button>
            <button onClick={onExit} style={btn2Style}>EXIT</button>
          </div>
        </div>
      )}

      {phase === "gameover" && (
        <div style={{textAlign:"center",padding:24,position:"relative",zIndex:2}}>
          <div style={{fontSize:42,marginBottom:12}}>💀</div>
          <div style={{fontSize:20,color:"#ff4444",letterSpacing:4,marginBottom:4}}>GAME OVER</div>
          <div style={{...subStyle,marginBottom:12}}>{SLASHER_LEVELS[level]?.name} got you</div>
          <div style={{fontSize:38,color:"#e8ddd4",fontFamily:"'Jolly Lodger',serif",letterSpacing:4,margin:"8px 0"}}>{score}</div>
          {score >= highScore && score > 0
            ? <div style={{fontSize:12,color:"#ff4444",letterSpacing:3,marginBottom:20}}>🩸 NEW BEST!</div>
            : <div style={{...subStyle,marginBottom:20}}>BEST: {highScore}</div>
          }
          <div style={{display:"flex",gap:12,justifyContent:"center"}}>
            <button onClick={() => { waveRef.current = 0; clearLevelUsedRef.current = false; startLevel(0, 5, 0); }} style={btnStyle}>TRY AGAIN</button>
            <button onClick={onExit} style={btn2Style}>EXIT</button>
          </div>
        </div>
      )}

      {phase === "allclear" && (
        <div style={{textAlign:"center",padding:24,position:"relative",zIndex:2}}>
          <div style={{fontSize:42,marginBottom:12}}>🏆</div>
          <div style={{fontSize:12,color:"rgba(255,80,80,0.7)",letterSpacing:4,marginBottom:4}}>ALL SLASHERS DEFEATED</div>
          <div style={titleStyle}>YOU SURVIVED</div>
          <div style={{fontSize:38,color:"#e8ddd4",fontFamily:"'Jolly Lodger',serif",letterSpacing:4,margin:"12px 0"}}>{score}</div>
          {score >= highScore && score > 0
            ? <div style={{fontSize:12,color:"#ff4444",letterSpacing:3,marginBottom:20}}>🩸 NEW BEST!</div>
            : <div style={{...subStyle,marginBottom:20}}>BEST: {highScore}</div>
          }
          <div style={{display:"flex",gap:12,justifyContent:"center"}}>
            <button onClick={() => { waveRef.current = 0; clearLevelUsedRef.current = false; startLevel(0, 5, 0); }} style={btnStyle}>PLAY AGAIN</button>
            <button onClick={onExit} style={btn2Style}>EXIT</button>
          </div>
        </div>
      )}
    </div>
  );
}



// ── CAMP BLOOD: TEXT ADVENTURE ──
// ── CAMP BLOOD STORY DATA ──
// v25: Story nodes & endings (~85 KB) moved to self-hosted server at
//      https://api.sinistertrivia.com/camp-blood
// A tiny offline fallback (start + first-hop choices) is bundled so the menu still opens
// when the server is unreachable. Game-time fetch swaps in the full pool on first launch.
const CB_FALLBACK_ENDINGS = {
  "_offline_stub": {
    "title": "STORY OFFLINE",
    "text": "The full Camp Blood storyline lives on the Sinister server. Please connect to the internet to continue your night at Crystal Lake.\n\nReturning to menu."
  }
};
const CB_FALLBACK_NODES = {
  "start": {
    "text": "CAMP CRYSTAL LAKE — SUMMER 1980\n\nYou're a counselor. Twenty-two. This was supposed to be a fun summer job.\n\nIt's 11pm. The generator died forty minutes ago. Your flashlight is on its last legs. The other counselors — Bill, Brenda, Jack, Marcie, Ned — went to the lake an hour ago. You stayed behind to lock up the supply cabin.\n\nYou heard something in the woods ten minutes ago. You told yourself it was a deer.\n\nThen you found the door to Cabin 3 hanging open. And Ned's shoe in the dirt. Just one shoe.\n\nThrough the trees north of you: slow, heavy footsteps. Getting closer.",
    "choices": [
      {
        "label": "Search the supply cabin for anything useful",
        "next": "cabin_search"
      },
      {
        "label": "Kill the flashlight and press yourself against the cabin wall",
        "next": "wall_listen"
      },
      {
        "label": "Run north toward the main lodge now",
        "next": "forest_toward_lodge"
      },
      {
        "label": "Cut east toward the road — forget everyone else",
        "next": "forest_toward_road_unarmed"
      }
    ]
  },
  "cabin_search": {
    "text": "You sweep the dying beam across shelves. Paint thinner. Road flares — a whole box. Rope, fifty feet of it.\n\nOn the wall behind glass: a fire axe.\n\nOn the desk: a hand-drawn camp map, annotated. Someone has circled the old Voorhees place on the east shore.\n\nThe footsteps outside stop. That's worse.",
    "ending": "_offline_stub"
  },
  "wall_listen": {
    "text": "You press yourself flat against the cabin wall, flashlight off.\n\nHeavy footsteps. Thirty feet. Twenty. They stop just at the corner.\n\nYou hold your breath.\n\nThey move on north.",
    "ending": "_offline_stub"
  },
  "forest_toward_lodge": {
    "text": "North through the trees. The main lodge is a quarter mile.\n\nYou see light — emergency battery backup, flickering.\n\nThrough the window: the common room. Overturned chairs. A curtain pooling on the floor where someone dragged it.\n\nThe front door is hanging open.",
    "ending": "_offline_stub"
  },
  "forest_toward_road_unarmed": {
    "text": "East through the pines. You have nothing in your hands.\n\nHalfway there, you pass the equipment shed — padlocked. But there's a tire iron on the ground outside it.\n\nYour foot catches something. A length of rope, left by a previous counselor.",
    "ending": "_offline_stub"
  }
};

// Mutable refs the rest of the app reads from. Start with fallback; replaced by server data.
let CB_ENDINGS = CB_FALLBACK_ENDINGS;
let CB_NODES = CB_FALLBACK_NODES;

const CAMP_BLOOD_API_URL = "https://api.sinistertrivia.com/camp-blood";
const CAMP_BLOOD_FETCH_TIMEOUT_MS = 5000;
let _campBloodFetchPromise = null;
let _campBloodLoaded = false;

async function fetchCampBloodStory() {
  if (_campBloodLoaded) return true;
  if (_campBloodFetchPromise) return _campBloodFetchPromise;
  _campBloodFetchPromise = (async () => {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), CAMP_BLOOD_FETCH_TIMEOUT_MS);
      const res = await fetch(CAMP_BLOOD_API_URL, { signal: ctrl.signal });
      clearTimeout(t);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data || typeof data !== 'object' || !data.nodes || !data.endings) {
        throw new Error('Invalid camp-blood payload');
      }
      CB_NODES = data.nodes;
      CB_ENDINGS = data.endings;
      _campBloodLoaded = true;
      console.log(`[CampBlood] Server fetch OK: ${Object.keys(data.nodes).length} nodes, ${Object.keys(data.endings).length} endings`);
      return true;
    } catch (e) {
      console.warn(`[CampBlood] Server fetch failed (${e.message}) — using offline fallback`);
      return false;
    } finally {
      _campBloodFetchPromise = null;
    }
  })();
  return _campBloodFetchPromise;
};


function CampBlood({ onExit, onHighScore, highScore }) {
  const [phase, setPhase] = useState("intro");
  const [nodeId, setNodeId] = useState("start");
  const [log, setLog] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [ending, setEnding] = useState(null);
  const [jasonNear, setJasonNear] = useState(false);
  const [choices, setChoices] = useState([]);
  const [lives, setLives] = useState(3);
  const [deathMsg, setDeathMsg] = useState(null);
  const [hasSaveGame, setHasSaveGame] = useState(false);
  const livesRef = useRef(3);
  const checkpointRef = useRef({ nodeId: "start", inv: [], log: [] });
  const logRef = useRef(null);
  const endingsRef = useRef(new Set());
  const invRef = useRef([]);

  // v25: Fetch the full story pool from the server in the background as soon as the
  // Camp Blood menu opens. By the time the player picks "Begin", data is usually ready.
  // If they're fast or offline, startGame() awaits this same promise so it can't race.
  useEffect(() => { fetchCampBloodStory(); }, []);

  // Save/load via localStorage
  const SAVE_KEY = "campblood_save";
  const ENDINGS_KEY = "campblood_endings";

  const loadSave = async () => {
    try {
      const saved = await Storage.get(SAVE_KEY);
      const savedEndings = await Storage.get(ENDINGS_KEY);
      if (savedEndings) endingsRef.current = new Set(JSON.parse(savedEndings));
      return saved ? JSON.parse(saved) : null;
    } catch(e) { return null; }
  };

  const writeSave = async (nodeId, inv, logEntries) => {
    try {
      await Storage.set(SAVE_KEY, JSON.stringify({ nodeId, inv, log: logEntries.slice(-20), lives: livesRef.current }));
      await Storage.set(ENDINGS_KEY, JSON.stringify([...endingsRef.current]));
      setHasSaveGame(true);
    } catch(e) {}
  };

  const clearSave = async () => {
    await Storage.remove(SAVE_KEY);
    setHasSaveGame(false);
  };

  const hasSave = async () => {
    const saved = await Storage.get(SAVE_KEY);
    return !!saved;
  };

  const startGame = async (fromSave = false) => {
    GameSFX.unlock();
    // v25: Ensure story data is loaded before the player begins. If the menu's background
    // fetch already finished, this is instant. If not, we wait (or fall back to offline).
    await fetchCampBloodStory();
    if (fromSave) {
      const save = await loadSave();
      if (save) {
        invRef.current = save.inv;
        livesRef.current = save.lives ?? 3;
        setLives(livesRef.current);
        setInventory(save.inv);
        setLog(save.log || []);
        setEnding(null);
        setDeathMsg(null);
        setJasonNear(false);
        setPhase("playing");
        checkpointRef.current = { nodeId: save.nodeId, inv: save.inv, log: save.log || [] };
        await loadNode(save.nodeId, save.inv, save.log || []);
        GameSFX.cbAmbient();
        return;
      }
    }
    await clearSave();
    invRef.current = [];
    livesRef.current = 3;
    setLives(3);
    setLog([]);
    setInventory([]);
    setEnding(null);
    setDeathMsg(null);
    setJasonNear(false);
    setNodeId("start");
    setPhase("playing");
    checkpointRef.current = { nodeId: "start", inv: [], log: [] };
    await loadNode("start", [], []);
    setTimeout(() => GameSFX.cbAmbient(), 200);
  };

  const loadNode = async (id, inv, currentLog) => {
    const node = CB_NODES[id];
    if (!node) return;

    const deathEndings = ["machete","burned","sacrifice"];

    if (node.ending) {
      endingsRef.current.add(node.ending);
      try { await Storage.set(ENDINGS_KEY, JSON.stringify([...endingsRef.current])); } catch(e) {}

      if (deathEndings.includes(node.ending)) {
        // Death — lose a life
        const newLives = livesRef.current - 1;
        livesRef.current = newLives;
        setLives(newLives);
        GameSFX.cbDeath();

        const deathText = node.text;
        const cp = checkpointRef.current;

        if (newLives <= 0) {
          // Out of lives — true game over
          const e = CB_ENDINGS[node.ending];
          setEnding({ ...e, key: node.ending, gameOver: true });
          setPhase("ending");
          await clearSave();
          onHighScore(endingsRef.current.size * 100);
        } else {
          // Respawn at checkpoint — show death message then continue
          setDeathMsg(deathText);
          setTimeout(async () => {
            setDeathMsg(null);
            invRef.current = cp.inv;
            setInventory(cp.inv);
            setLog(cp.log);
            setJasonNear(false);
            await loadNode(cp.nodeId, cp.inv, cp.log);
          }, 2800);
        }
        return;
      }

      // Survival ending
      const e = CB_ENDINGS[node.ending];
      setEnding({ ...e, key: node.ending });
      setPhase("ending");
      await clearSave();
      onHighScore(endingsRef.current.size * 100);
      GameSFX.cbEscape();
      try { await Storage.set(ENDINGS_KEY, JSON.stringify([...endingsRef.current])); } catch(e) {}
      return;
    }

    let newInv = [...inv];
    if (node.gives) {
      const toGive = node.gives === "both_weapons" ? ["axe","flare"] : [node.gives];
      toGive.forEach(item => { if (!newInv.includes(item)) newInv.push(item); });
      GameSFX.cbPickupItem();
    }
    if (node.item_used) {
      newInv = newInv.filter(i => i !== node.item_used);
    }
    invRef.current = newInv;
    setInventory(newInv);
    setJasonNear(!!node.jason);
    if (node.jason) { GameSFX.cbJasonNear(); setTimeout(() => GameSFX.cbBeat(), 600); }
    else { GameSFX.cbNewNode(); }

    const newEntry = { text: node.text, id };
    const newLog = [...(currentLog || []), newEntry];
    setLog(newLog);
    setNodeId(id);

    // Update checkpoint on safe nodes (no jason) so player doesn't respawn too far back
    if (!node.jason) {
      checkpointRef.current = { nodeId: id, inv: newInv, log: newLog };
    }

    const available = (node.choices || []).filter(c => !c.needs || newInv.includes(c.needs));
    setChoices(available);

    await writeSave(id, newInv, newLog);

    setTimeout(() => {
      if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, 80);
  };

  const choose = async (choice) => {
    const lbl = choice.label.toLowerCase();
    if (lbl.includes("window"))                                            GameSFX.cbWindow();
    else if (lbl.includes("door") || lbl.includes("burst"))               GameSFX.cbDoor();
    else if (lbl.includes("run") || lbl.includes("sprint") || lbl.includes("bolt") || lbl.includes("drive") || lbl.includes("floor it")) GameSFX.cbRun();
    else if (lbl.includes("swim") || lbl.includes("dive") || lbl.includes("water") || lbl.includes("lake") || lbl.includes("boat") || lbl.includes("row") || lbl.includes("canoe") || lbl.includes("paddle")) GameSFX.cbSplash();
    else if (lbl.includes("axe") || lbl.includes("chop") || lbl.includes("fight") || lbl.includes("swing") || lbl.includes("machete") || lbl.includes("cleaver")) GameSFX.cbAxe();
    else if (lbl.includes("flare") || lbl.includes("fire") || lbl.includes("burn") || lbl.includes("light") || lbl.includes("torch"))  GameSFX.cbFlare();
    else if (lbl.includes("hide") || lbl.includes("still") || lbl.includes("wait") || lbl.includes("listen") || lbl.includes("barricade") || lbl.includes("stay flat")) GameSFX.cbHide();
    else if (lbl.includes("head") || lbl.includes("walk") || lbl.includes("move") || lbl.includes("go") || lbl.includes("enter") || lbl.includes("find")) GameSFX.cbFootsteps();
    else GameSFX.cbChoice();

    const newLog = [...log, { choice: choice.label }];
    setLog(newLog);
    const newInv = choice.gives ? [...invRef.current, choice.gives] : [...invRef.current];
    await loadNode(choice.next, newInv, newLog);
  };

  // Load endings on mount and check for save game
  useEffect(() => {
    (async () => {
      try {
        const saved = await Storage.get(ENDINGS_KEY);
        if (saved) endingsRef.current = new Set(JSON.parse(saved));
        
        const saveExists = await hasSave();
        setHasSaveGame(saveExists);
      } catch(e) {}
    })();
  }, []);

  const ITEM_ICONS = { axe:"🪓", flare:"🔥", flares_box:"🔥🔥", knife:"🔪", machete:"🗡️", rope:"🪢", torch:"🔦", flashlight:"🔦", car_keys:"🔑", key_cabin4:"🗝️", map:"🗺️", fire_kit:"🔥", jason_truth:"📜", both_weapons:"🪓🔥" };
  const totalEndings = Object.keys(CB_ENDINGS).length;

  // Neon-vector button styles (matches Slasher Mystery / DreadWords / Slasher Search look)
  const btnS = {padding:"12px 24px",background:"linear-gradient(180deg, #2a0808, #1a0404)",color:"#ff8080",border:"1.5px solid #ff3030",borderRadius:5,fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:3,fontWeight:700,cursor:"pointer",textShadow:"0 0 4px rgba(255,80,80,0.7)",boxShadow:"0 0 10px rgba(255,48,48,0.3)"};
  const btn2S = {padding:"10px 18px",background:"transparent",color:"rgba(200,200,200,0.7)",border:"1px solid rgba(150,150,150,0.5)",borderRadius:5,fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:3,fontWeight:700,cursor:"pointer"};
  const btn3S = {padding:"12px 24px",background:"linear-gradient(180deg, #082a08, #041a04)",color:"#80ff80",border:"1.5px solid #60ff60",borderRadius:5,fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:3,fontWeight:700,cursor:"pointer",textShadow:"0 0 4px rgba(120,255,120,0.7)",boxShadow:"0 0 10px rgba(96,255,96,0.4)"};

  return (
    <div style={{position:"fixed",inset:0,background:"#060806",zIndex:100,display:"flex",flexDirection:"column",fontFamily:"'Inter',sans-serif",overflow:"hidden"}}>

      {/* Death flash overlay */}
      {deathMsg && (
        <div style={{position:"absolute",inset:0,background:"rgba(180,0,0,0.92)",zIndex:200,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,textAlign:"center",animation:"fi 0.2s"}}>
          <div style={{fontSize:48,marginBottom:16,filter:"drop-shadow(0 0 12px #ff0000)"}}>💀</div>
          <div style={{color:"#fff",fontSize:17,lineHeight:1.8,fontFamily:"'Inter',sans-serif",maxWidth:300,marginBottom:24,textShadow:"0 0 4px rgba(0,0,0,0.8)"}}>{deathMsg}</div>
          <div style={{color:"rgba(255,255,255,0.7)",fontSize:13,letterSpacing:3,fontFamily:"'Cinzel',serif",fontWeight:700}}>
            {livesRef.current > 0 ? `${livesRef.current} ${livesRef.current === 1 ? 'LIFE' : 'LIVES'} REMAINING` : 'NO LIVES LEFT'}
          </div>
          <div style={{display:"flex",gap:6,marginTop:12}}>
            {[0,1,2].map(i => <span key={i} style={{fontSize:20,opacity:i < livesRef.current ? 1 : 0.15}}>❤️</span>)}
          </div>
        </div>
      )}

      {/* Top bar */}
      <div style={{padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1.5px solid rgba(255,48,48,0.5)",flexShrink:0,boxShadow:"0 2px 12px rgba(255,48,48,0.15)"}}>
        <button onClick={onExit} style={{background:"transparent",border:"1.5px solid rgba(255,48,48,0.6)",borderRadius:5,color:"#ff8080",fontSize:11,letterSpacing:2,padding:"5px 10px",cursor:"pointer",fontFamily:"'Cinzel',serif",fontWeight:700,textShadow:"0 0 4px rgba(255,80,80,0.6)",boxShadow:"0 0 8px rgba(255,48,48,0.2)"}}>← EXIT</button>
        <div style={{color:"#ff5050",fontSize:12,letterSpacing:4,fontFamily:"'Cinzel',serif",fontWeight:700,textShadow:"0 0 6px rgba(255,48,48,0.8), 0 0 2px #fff"}}>CAMP BLOOD</div>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",display:"flex",alignItems:"center",gap:4}}>
          <div style={{display:"flex",gap:2,marginRight:4}}>
            {[0,1,2].map(i => <span key={i} style={{fontSize:12,opacity:i < lives ? 1 : 0.12,filter:i < lives ? "drop-shadow(0 0 3px rgba(255,80,80,0.6))" : "none"}}>❤️</span>)}
          </div>
          {inventory.map(i => <span key={i} title={i} style={{filter:"drop-shadow(0 0 3px rgba(255,80,80,0.4))"}}>{ITEM_ICONS[i]||"📦"}</span>)}
          {jasonNear && <span style={{color:"#ff4444",marginLeft:4,animation:"pulse 0.8s infinite",textShadow:"0 0 6px #ff0000"}}>⚠️</span>}
        </div>
      </div>

      {phase === "intro" && (
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 18px",textAlign:"center",overflow:"auto"}}>
          <div style={{fontSize:54,marginBottom:12,filter:"drop-shadow(0 0 10px #ff3030) drop-shadow(0 0 4px #ff5050)"}}>🏕️</div>
          <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:42,color:"#ff5050",letterSpacing:6,marginBottom:6,textShadow:"0 0 14px rgba(255,48,48,0.9), 0 0 4px #fff"}}>CAMP BLOOD</div>
          <div style={{fontSize:11,color:"#ff8080",letterSpacing:4,marginBottom:18,fontFamily:"'Cinzel',serif",fontWeight:700,textShadow:"0 0 4px rgba(255,48,48,0.5)"}}>CRYSTAL LAKE — SUMMER 1980</div>

          {/* Story setup panel */}
          <div style={{border:"1.5px solid rgba(255,48,48,0.55)",borderRadius:8,padding:"16px 20px",background:"rgba(20,5,5,0.55)",marginBottom:18,maxWidth:340,width:"100%",boxShadow:"0 0 12px rgba(255,48,48,0.18), inset 0 0 12px rgba(255,48,48,0.06)"}}>
            <div style={{color:"#fff",fontSize:15,lineHeight:1.8,fontFamily:"'Inter',sans-serif",textAlign:"center"}}>
              You are a camp counselor.<br/>
              Jason is real.<br/>
              The others are already dead.<br/>
              Your choices determine what happens next.
            </div>
            <div style={{height:1,background:"rgba(255,48,48,0.3)",margin:"14px 0"}}/>
            <div style={{color:"#ff8080",fontSize:13,fontFamily:"'Cinzel',serif",letterSpacing:1,fontWeight:700,textShadow:"0 0 4px rgba(255,48,48,0.5)"}}>You have 3 lives. Wrong moves cost one.</div>
            <div style={{color:"rgba(255,255,255,0.65)",fontSize:11,letterSpacing:1,marginTop:6,fontFamily:"'Cinzel',serif"}}>10 endings · ~20 minutes per full run</div>
          </div>

          <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center",marginBottom:8}}>
            <button onClick={() => startGame(false)} style={btnS}>NEW GAME</button>
            {hasSaveGame && <button onClick={() => startGame(true)} style={btn3S}>CONTINUE</button>}
          </div>
          {endingsRef.current.size > 0 && (
            <div style={{marginTop:18,border:"1.5px solid rgba(255,170,68,0.55)",borderRadius:8,padding:"12px 16px",background:"rgba(20,12,2,0.55)",maxWidth:340,width:"100%",boxShadow:"0 0 12px rgba(255,170,68,0.18), inset 0 0 12px rgba(255,170,68,0.06)"}}>
              <div style={{color:"#ffaa44",fontSize:11,letterSpacing:3,marginBottom:10,fontFamily:"'Cinzel',serif",fontWeight:700,textShadow:"0 0 4px rgba(255,170,68,0.6)"}}>{endingsRef.current.size} OF {totalEndings} ENDINGS FOUND</div>
              <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
                {Object.entries(CB_ENDINGS).map(([key,e]) => (
                  <span key={key} style={{fontSize:22,opacity:endingsRef.current.has(key)?1:0.12,filter:endingsRef.current.has(key)?"drop-shadow(0 0 6px rgba(255,170,68,0.6))":"grayscale(1)"}} title={endingsRef.current.has(key)?e.title:"???"}>{e.emoji}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {phase === "playing" && (
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",padding:"12px 14px 0",gap:12}}>
          {(() => {
            const lastTextIdx = log.map((e,i)=>(!e.choice?i:-1)).filter(i=>i>=0).slice(-1)[0];
            const historyEntries = log.filter((_,i) => i !== lastTextIdx);
            const currentEntry = lastTextIdx != null ? log[lastTextIdx] : null;
            return (
              <>
                {/* Already-read history panel - dim red border, faded text */}
                <div ref={logRef} style={{flex:1,overflowY:"auto",border:"1.5px solid rgba(255,48,48,0.4)",borderRadius:8,padding:"14px 16px",background:"rgba(10,3,3,0.6)",display:"flex",flexDirection:"column",gap:12,boxShadow:"inset 0 0 14px rgba(255,48,48,0.06)"}}>
                  {historyEntries.length === 0 && (
                    <div style={{color:"rgba(255,255,255,0.25)",fontSize:11,letterSpacing:2,textAlign:"center",fontFamily:"'Cinzel',serif",fontStyle:"italic",padding:"8px 0"}}>— THE NIGHT BEGINS —</div>
                  )}
                  {historyEntries.map((entry, i) => (
                    entry.choice
                      ? <div key={i} style={{color:"rgba(255,80,80,0.55)",fontSize:14,letterSpacing:0.5,paddingLeft:12,borderLeft:"2px solid rgba(255,48,48,0.4)",fontStyle:"italic",fontFamily:"'Inter',sans-serif"}}>▶ {entry.choice}</div>
                      : <div key={i} style={{color:"rgba(255,255,255,0.4)",fontSize:14,lineHeight:1.65,whiteSpace:"pre-line",fontFamily:"'Inter',sans-serif",letterSpacing:0.2}}>{entry.text}</div>
                  ))}
                </div>

                {/* Currently-reading panel - bright red border, intense glow */}
                {currentEntry && (
                  <div style={{flexShrink:0,border:"2px solid #ff3030",borderRadius:8,padding:"16px 18px",background:"rgba(20,5,5,0.7)",boxShadow:"0 0 18px rgba(255,48,48,0.4), inset 0 0 14px rgba(255,48,48,0.1)"}}>
                    <div style={{color:"#fff",fontSize:17,lineHeight:1.7,whiteSpace:"pre-line",fontFamily:"'Inter',sans-serif",fontWeight:400,letterSpacing:0.3,textShadow:"0 0 4px rgba(0,0,0,0.6)"}}>{currentEntry.text}</div>
                  </div>
                )}
              </>
            );
          })()}

          {/* Choice buttons panel */}
          <div style={{padding:"10px 0 16px",display:"flex",flexDirection:"column",gap:8,flexShrink:0}}>
            {choices.map((c,i) => (
              <button key={i} onClick={() => choose(c)} style={{
                background:"linear-gradient(180deg, #2a0808, #150202)",
                border:"1.5px solid rgba(255,48,48,0.6)",
                borderRadius:6,
                color:"#ffe0d0",
                fontFamily:"'Inter',sans-serif",
                fontSize:15,
                padding:"12px 16px",
                cursor:"pointer",
                textAlign:"left",
                lineHeight:1.4,
                boxShadow:"0 0 10px rgba(255,48,48,0.18), inset 0 0 8px rgba(255,48,48,0.05)",
                transition:"all 0.15s ease",
              }}>
                <span style={{color:"#ff5050",marginRight:10,fontFamily:"'Cinzel',serif",fontWeight:700,letterSpacing:1,textShadow:"0 0 4px rgba(255,48,48,0.7)"}}>{i+1}.</span>{c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === "ending" && ending && (
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 18px",textAlign:"center",overflow:"auto"}}>
          <div style={{fontSize:64,marginBottom:14,filter:`drop-shadow(0 0 14px ${ending.color})`}}>{ending.emoji}</div>
          {ending.gameOver && <div style={{fontSize:12,color:"#ff4444",letterSpacing:4,marginBottom:10,fontFamily:"'Cinzel',serif",fontWeight:700,textShadow:"0 0 6px rgba(255,48,48,0.8)"}}>NO LIVES REMAINING</div>}

          {/* Title + sub panel */}
          <div style={{border:`2px solid ${ending.color}`,borderRadius:8,padding:"16px 22px",background:"rgba(20,5,5,0.55)",marginBottom:16,maxWidth:340,width:"100%",boxShadow:`0 0 18px ${ending.color}55, inset 0 0 14px ${ending.color}15`}}>
            <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:32,color:ending.color,letterSpacing:4,marginBottom:10,textShadow:`0 0 14px ${ending.color}, 0 0 4px #fff`}}>{ending.title}</div>
            <div style={{color:"rgba(255,255,255,0.85)",fontSize:14,letterSpacing:0.5,lineHeight:1.7,fontStyle:"italic",fontFamily:"'Inter',sans-serif"}}>"{ending.sub}"</div>
          </div>

          {/* Endings tracker panel */}
          <div style={{border:"1.5px solid rgba(255,170,68,0.55)",borderRadius:8,padding:"12px 16px",background:"rgba(20,12,2,0.55)",marginBottom:18,maxWidth:340,width:"100%",boxShadow:"0 0 12px rgba(255,170,68,0.18), inset 0 0 12px rgba(255,170,68,0.06)"}}>
            <div style={{color:"#ffaa44",fontSize:11,letterSpacing:3,marginBottom:10,fontFamily:"'Cinzel',serif",fontWeight:700,textShadow:"0 0 4px rgba(255,170,68,0.6)"}}>{endingsRef.current.size} OF {totalEndings} ENDINGS FOUND</div>
            <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
              {Object.entries(CB_ENDINGS).map(([key,e]) => (
                <span key={key} style={{fontSize:22,opacity:endingsRef.current.has(key)?1:0.1,filter:endingsRef.current.has(key)?"drop-shadow(0 0 6px rgba(255,170,68,0.6))":"grayscale(1)"}} title={endingsRef.current.has(key)?e.title:"???"}>
                  {e.emoji}
                </span>
              ))}
            </div>
          </div>

          <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
            <button onClick={() => startGame(false)} style={btnS}>PLAY AGAIN</button>
            <button onClick={onExit} style={btn2S}>EXIT</button>
          </div>
        </div>
      )}
    </div>
  );
}




// ── SLASHER HUNT (WHACK-A-MOLE STYLE) ──
const SH_KILLERS = [
  {emoji:"🔪", name:"Michael",     pts:10},
  {emoji:"🗡️", name:"Jason",       pts:10},
  {emoji:"👻", name:"Ghostface",   pts:10},
  {emoji:"🎩", name:"Freddy",      pts:15},
  {emoji:"🪚", name:"Leatherface", pts:15},
  {emoji:"🪓💀", name:"Victor",      pts:20},
  {emoji:"💀",   name:"Skull",       pts:5},
];
const SH_GRID = 9; // 3x3

function SlasherHunt({ onExit, onHighScore, highScore }) {
  const [phase, setPhase] = useState("intro");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [cells, setCells] = useState(Array(SH_GRID).fill(null));
  const [bonk, setBonk] = useState(null); // index that was just hit
  const [miss, setMiss] = useState(null); // index that was missed
  const [streak, setStreak] = useState(0);
  const scoreRef = useRef(0);
  const cellsRef = useRef(Array(SH_GRID).fill(null));
  const timersRef = useRef(Array(SH_GRID).fill(null));
  const gameTimerRef = useRef(null);
  const spawnRef = useRef(null);
  const phaseRef = useRef("intro");
  const streakRef = useRef(0);
  const timeRef = useRef(60);

  const startGame = () => {
    scoreRef.current = 0;
    streakRef.current = 0;
    timeRef.current = 60;
    setScore(0);
    setStreak(0);
    setTimeLeft(60);
    cellsRef.current = Array(SH_GRID).fill(null);
    setCells([...cellsRef.current]);
    phaseRef.current = "playing";
    setPhase("playing");
    GameSFX.sbStart();
    startTimers();
  };

  const startTimers = () => {
    // Game countdown
    gameTimerRef.current = setInterval(() => {
      timeRef.current -= 1;
      setTimeLeft(timeRef.current);
      if (timeRef.current <= 0) {
        endGame();
      }
    }, 1000);
    // Spawn killers
    scheduleSpawn();
  };

  const scheduleSpawn = () => {
    if (phaseRef.current !== "playing") return;
    const delay = Math.max(550, 1100 - (60 - timeRef.current) * 7);
    spawnRef.current = setTimeout(() => {
      if (phaseRef.current !== "playing") return;
      spawnKiller();
      scheduleSpawn();
    }, delay);
  };

  const spawnKiller = () => {
    // Find empty cell
    const empty = cellsRef.current.map((c,i) => c===null ? i : -1).filter(i=>i>=0);
    if (empty.length === 0) return;
    const idx = empty[Math.floor(Math.random() * empty.length)];
    const killer = SH_KILLERS[Math.floor(Math.random() * SH_KILLERS.length)];
    const isBomb = Math.random() < 0.1; // 10% bomb — DON'T hit it
    cellsRef.current[idx] = { ...killer, bomb: isBomb, id: Date.now() };
    setCells([...cellsRef.current]);
    // Auto-hide after window closes
    const hideDelay = Math.max(900, 1800 - (60 - timeRef.current) * 10);
    timersRef.current[idx] = setTimeout(() => {
      if (cellsRef.current[idx]) {
        // Missed a killer (not bomb) — lose streak
        if (!cellsRef.current[idx].bomb) {
          streakRef.current = 0;
          setStreak(0);
          setMiss(idx);
          setTimeout(() => setMiss(null), 300);
          GameSFX.fgHit();
        }
        cellsRef.current[idx] = null;
        setCells([...cellsRef.current]);
      }
    }, hideDelay);
  };

  const hitCell = (idx) => {
    if (phaseRef.current !== "playing") return;
    const cell = cellsRef.current[idx];
    if (!cell) return;
    clearTimeout(timersRef.current[idx]);
    if (cell.bomb) {
      // Hit a bomb — lose 20 pts and streak
      scoreRef.current = Math.max(0, scoreRef.current - 20);
      setScore(scoreRef.current);
      streakRef.current = 0;
      setStreak(0);
      GameSFX.fgHit();
      setBonk(idx);
    } else {
      // Hit a killer — gain points + streak bonus
      streakRef.current += 1;
      setStreak(streakRef.current);
      const bonus = streakRef.current >= 5 ? 2 : streakRef.current >= 3 ? 1.5 : 1;
      const pts = Math.round(cell.pts * bonus);
      scoreRef.current += pts;
      setScore(scoreRef.current);
      GameSFX.sbBrickHit();
      if (streakRef.current >= 3) GameSFX.sbPaddleHit();
      setBonk(idx);
    }
    cellsRef.current[idx] = null;
    setCells([...cellsRef.current]);
    setTimeout(() => setBonk(null), 200);
  };

  const endGame = () => {
    phaseRef.current = "gameover";
    clearInterval(gameTimerRef.current);
    clearTimeout(spawnRef.current);
    timersRef.current.forEach(t => clearTimeout(t));
    cellsRef.current = Array(SH_GRID).fill(null);
    setCells([...cellsRef.current]);
    setPhase("gameover");
    onHighScore(scoreRef.current);
    GameSFX.sbAllClear();
  };

  useEffect(() => {
    return () => {
      clearInterval(gameTimerRef.current);
      clearTimeout(spawnRef.current);
      timersRef.current.forEach(t => clearTimeout(t));
    };
  }, []);

  const btnStyle = {background:"transparent",border:"1px solid rgba(255,80,80,0.5)",borderRadius:12,color:"#ff8080",fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:3,padding:"12px 28px",cursor:"pointer"};
  const btn2Style = {...btnStyle,border:"1px solid rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.4)"};
  const timerColor = timeLeft <= 10 ? "#ff4444" : timeLeft <= 20 ? "#ffaa44" : "#e8ddd4";

  return (
    <div style={{position:"fixed",inset:0,background:"#080808",zIndex:100,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Cinzel',serif"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <button onClick={() => { phaseRef.current="done"; clearInterval(gameTimerRef.current); clearTimeout(spawnRef.current); timersRef.current.forEach(t=>clearTimeout(t)); onExit(); }} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.2)",borderRadius:8,color:"rgba(255,255,255,0.5)",fontSize:11,letterSpacing:2,padding:"6px 12px",cursor:"pointer"}}>← EXIT</button>
        <div style={{color:"rgba(255,80,80,0.9)",fontSize:12,letterSpacing:4}}>SLASHER HUNT</div>
        <div style={{color:"rgba(255,255,255,0.3)",fontSize:11,letterSpacing:2}}>BEST: {highScore}</div>
      </div>

      {phase === "intro" && (
        <div style={{textAlign:"center",padding:24,maxWidth:320}}>
          <div style={{fontSize:42,marginBottom:12}}>🔨</div>
          <div style={{fontSize:22,color:"#e8ddd4",letterSpacing:5,marginBottom:16}}>SLASHER HUNT</div>
          <div style={{color:"rgba(255,255,255,0.4)",fontSize:12,letterSpacing:2,lineHeight:2,marginBottom:24}}>
            KILLERS POP UP — TAP THEM FAST<br/>
            BUILD STREAKS FOR BONUS POINTS<br/>
            AVOID THE 💣 BOMBS<br/>
            60 SECONDS — GO!
          </div>
          <button onClick={startGame} style={btnStyle}>HUNT</button>
          {highScore > 0 && <div style={{marginTop:16,color:"rgba(255,255,255,0.25)",fontSize:12,letterSpacing:2}}>BEST: {highScore}</div>}
        </div>
      )}

      {phase === "playing" && (
        <div style={{width:"100%",maxWidth:380,padding:"60px 20px 20px",display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
          <div style={{display:"flex",justifyContent:"space-between",width:"100%",padding:"0 4px"}}>
            <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:28,color:"#e8ddd4",letterSpacing:3}}>{score}</div>
            <div style={{fontSize:12,color:"rgba(255,200,0,0.8)",letterSpacing:2,alignSelf:"center"}}>
              {streak >= 3 ? `🔥 ${streak}x STREAK!` : ""}
            </div>
            <div style={{fontSize:20,color:timerColor,fontFamily:"'Jolly Lodger',serif",letterSpacing:2}}>{timeLeft}s</div>
          </div>

          {/* 3x3 grid */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,width:"100%",maxWidth:340}}>
            {cells.map((cell, i) => (
              <div
                key={i}
                onClick={() => hitCell(i)}
                style={{
                  aspectRatio:"1",
                  borderRadius:16,
                  background: bonk===i ? (cell===null&&!cells[i]?.bomb ? "rgba(255,200,0,0.3)" : "rgba(255,0,0,0.3)") : miss===i ? "rgba(80,0,0,0.4)" : "rgba(20,20,20,0.8)",
                  border: `2px solid ${cell ? (cell.bomb ? "rgba(255,50,50,0.6)" : "rgba(255,150,50,0.5)") : "rgba(255,255,255,0.06)"}`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  cursor: cell ? "pointer" : "default",
                  transition:"all 0.1s",
                  transform: bonk===i ? "scale(0.9)" : cell ? "scale(1.02)" : "scale(1)",
                  userSelect:"none",
                  WebkitUserSelect:"none",
                }}
              >
                {cell && (
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:38,lineHeight:1}}>{cell.bomb ? "💣" : cell.emoji}</div>
                    {!cell.bomb && <div style={{fontSize:9,color:"rgba(255,200,100,0.7)",letterSpacing:1,marginTop:2}}>{cell.pts}pts</div>}
                  </div>
                )}
                {!cell && (
                  <div style={{width:30,height:30,borderRadius:"50%",background:"rgba(255,255,255,0.03)"}} />
                )}
              </div>
            ))}
          </div>
          <div style={{color:"rgba(255,255,255,0.15)",fontSize:10,letterSpacing:2,marginTop:4}}>TAP KILLERS FAST — AVOID BOMBS</div>
        </div>
      )}

      {phase === "gameover" && (
        <div style={{textAlign:"center",padding:24}}>
          <div style={{fontSize:42,marginBottom:12}}>⏰</div>
          <div style={{fontSize:20,color:"#ff4444",letterSpacing:4,marginBottom:4}}>TIME'S UP</div>
          <div style={{fontSize:42,color:"#e8ddd4",fontFamily:"'Jolly Lodger',serif",letterSpacing:4,margin:"12px 0"}}>{score}</div>
          {score >= highScore && score > 0
            ? <div style={{fontSize:12,color:"#ff4444",letterSpacing:3,marginBottom:20}}>🩸 NEW BEST!</div>
            : <div style={{color:"rgba(255,255,255,0.25)",fontSize:12,letterSpacing:2,marginBottom:20}}>BEST: {highScore}</div>
          }
          <div style={{display:"flex",gap:12,justifyContent:"center"}}>
            <button onClick={startGame} style={btnStyle}>PLAY AGAIN</button>
            <button onClick={onExit} style={btn2Style}>EXIT</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── SLAUGHTERSHIP (BATTLESHIP-STYLE HORROR GAME) ──
// Connects to wss://api.sinistertrivia.com/slaughter for 1v1 hideout-vs-killer matches.
// Phases: placement (drag to place 5 hideouts on a 10x10 grid) → playing (alternating
// turns, tap an enemy tile to attack) → done. Falls back to a smart bot opponent if
// no human joins within 15 seconds.
const SHIP_DEFS = [
  { id: "cabin",   name: "COUNSELOR CABIN",  emoji: "🛏️", size: 5 },
  { id: "van",     name: "GETAWAY VAN",      emoji: "🚐", size: 4 },
  { id: "storage", name: "STORAGE SHED",     emoji: "🪵", size: 3 },
  { id: "tools",   name: "TOOL SHED",        emoji: "🔧", size: 3 },
  { id: "shower",  name: "SHOWER STALL",     emoji: "🚿", size: 2 },
];
const SLAUGHTER_WS_URL = "wss://api.sinistertrivia.com/slaughter";

function Slaughtership({ onExit, savedName, onMatchWin }) {
  const wsRef = useRef(null);
  const [phase, setPhase] = useState("connecting"); // connecting | error | ingame | ended
  const [errorMsg, setErrorMsg] = useState("");
  const [room, setRoom] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [now, setNow] = useState(Date.now());

  // Placement phase local state
  const [placedShips, setPlacedShips] = useState([]); // [{id,size,tiles:[[r,c],...],horizontal}]
  const [activeShipId, setActiveShipId] = useState(SHIP_DEFS[0].id);
  const [activeOrientation, setActiveOrientation] = useState("h"); // h | v
  const [hoveredCell, setHoveredCell] = useState(null); // [r,c] or null
  const [submittedPlacement, setSubmittedPlacement] = useState(false);

  // Tick for timer countdowns
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  const connect = () => {
    setPhase("connecting");
    setErrorMsg("");
    setRoom(null);
    setPlacedShips([]);
    setActiveShipId(SHIP_DEFS[0].id);
    setActiveOrientation("h");
    setSubmittedPlacement(false);
    let ws;
    try { ws = new WebSocket(SLAUGHTER_WS_URL); } catch (e) {
      setPhase("error"); setErrorMsg("Could not reach the server."); return;
    }
    wsRef.current = ws;
    ws.onopen = () => {
      const name = (savedName && savedName.trim()) || "Anonymous";
      ws.send(JSON.stringify({ type: "join", name }));
      setPhase("ingame");
    };
    ws.onmessage = (ev) => {
      let msg;
      try { msg = JSON.parse(ev.data); } catch (e) { return; }
      if (msg.type === "joined") setPlayerId(msg.playerId);
      else if (msg.type === "state") setRoom(msg);
      else if (msg.type === "error") {
        setErrorMsg(msg.error || "Server error");
        setTimeout(() => setErrorMsg(""), 4000);
      }
    };
    ws.onerror = () => { setPhase("error"); setErrorMsg("Connection error."); };
    ws.onclose = (e) => {
      if (e.code === 4000) { setPhase("error"); setErrorMsg("Replaced by a newer connection."); return; }
      // Otherwise ignore — handled by phase transitions
    };
  };

  // Connect on mount; guard against StrictMode double-mount duplicate WS
  useEffect(() => {
    const existing = wsRef.current;
    if (existing) {
      try { if (existing.readyState === 1) existing.send(JSON.stringify({ type: "leave" })); } catch (e) {}
      try { existing.close(); } catch (e) {}
      wsRef.current = null;
    }
    connect();
    return () => {
      const ws = wsRef.current;
      if (ws) {
        try { if (ws.readyState === 1) ws.send(JSON.stringify({ type: "leave" })); } catch (e) {}
        try { ws.close(); } catch (e) {}
        wsRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Watch for match end
  useEffect(() => {
    if (room && room.status === "done" && room.finalResult) {
      setPhase("ended");
      // Play victory or defeat fanfare
      const meIdx = room.youIndex;
      const iWon = meIdx === room.finalResult.winnerIndex;
      try { iWon ? GameSFX.slMatchWin() : GameSFX.slMatchLose(); } catch (e) {}
      // Record win to leaderboard if I'm the winner
      if (iWon && typeof onMatchWin === "function") {
        try { onMatchWin(); } catch (e) {}
      }
    }
  }, [room, onMatchWin]);

  // Sound effect watcher — plays whenever lastEvent changes (a shot was just fired).
  // Distinguishes "I shot them" vs "they shot me" using the `by` field on lastEvent
  // matching the player object's name. Different sound palette for each direction so
  // attacker and defender both get audio feedback without sharing the same cue.
  const lastEventRef = useRef(null);
  useEffect(() => {
    if (!room || !room.lastEvent) return;
    // Only fire on NEW events — compare the full event object reference + key fields
    const ev = room.lastEvent;
    const key = (ev.type || "") + ":" + (ev.by || "") + ":" + (ev.r || 0) + ":" + (ev.c || 0) + ":" + (ev.firstTurn || "");
    if (lastEventRef.current === key) return;
    lastEventRef.current = key;
    const myName = (room.players && room.players[room.youIndex]) ? room.players[room.youIndex].name : null;
    const iAttacked = ev.by === myName;
    try {
      if (ev.type === "match_start") GameSFX.slMatchStart();
      else if (ev.type === "hit") iAttacked ? GameSFX.slHit() : GameSFX.slOppHit();
      else if (ev.type === "miss") iAttacked ? GameSFX.slMiss() : GameSFX.slOppMiss();
      else if (ev.type === "sunk") iAttacked ? GameSFX.slSunk() : GameSFX.slOppSunk();
    } catch (e) {}
  }, [room]);

  // Placement helpers
  const remainingShips = SHIP_DEFS.filter(s => !placedShips.find(p => p.id === s.id));
  const allShipsPlaced = remainingShips.length === 0;

  const tilesForShipAt = (shipDef, r, c, orientation) => {
    const tiles = [];
    for (let i = 0; i < shipDef.size; i++) {
      tiles.push(orientation === "h" ? [r, c + i] : [r + i, c]);
    }
    return tiles;
  };
  const isPlacementValid = (tiles) => {
    const occupied = new Set();
    for (const p of placedShips) for (const [r, c] of p.tiles) occupied.add(r + ":" + c);
    for (const [r, c] of tiles) {
      if (r < 0 || r >= 10 || c < 0 || c >= 10) return false;
      if (occupied.has(r + ":" + c)) return false;
    }
    return true;
  };

  const placeShip = (r, c) => {
    if (!activeShipId) return;
    const shipDef = SHIP_DEFS.find(s => s.id === activeShipId);
    if (!shipDef) return;
    const tiles = tilesForShipAt(shipDef, r, c, activeOrientation);
    if (!isPlacementValid(tiles)) return;
    setPlacedShips(prev => [...prev, { id: shipDef.id, size: shipDef.size, tiles, horizontal: activeOrientation === "h" }]);
    // Auto-select next un-placed ship
    const next = SHIP_DEFS.find(s => s.id !== shipDef.id && !placedShips.find(p => p.id === s.id));
    if (next) setActiveShipId(next.id);
    else setActiveShipId(null);
    try { GameSFX.slPlace(); } catch (e) {}
  };

  const removeShip = (id) => {
    setPlacedShips(prev => prev.filter(p => p.id !== id));
    setActiveShipId(id);
  };

  const randomizePlacement = () => {
    const placed = [];
    const occ = new Set();
    for (const def of SHIP_DEFS) {
      let tries = 0;
      while (tries < 200) {
        tries++;
        const horizontal = Math.random() < 0.5;
        const r = Math.floor(Math.random() * 10);
        const c = Math.floor(Math.random() * 10);
        if (horizontal && c + def.size > 10) continue;
        if (!horizontal && r + def.size > 10) continue;
        const tiles = [];
        let bad = false;
        for (let i = 0; i < def.size; i++) {
          const rr = horizontal ? r : r + i;
          const cc = horizontal ? c + i : c;
          if (occ.has(rr + ":" + cc)) { bad = true; break; }
          tiles.push([rr, cc]);
        }
        if (bad) continue;
        for (const [rr, cc] of tiles) occ.add(rr + ":" + cc);
        placed.push({ id: def.id, size: def.size, tiles, horizontal });
        break;
      }
    }
    setPlacedShips(placed);
    setActiveShipId(null);
  };

  const submitPlacement = () => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== 1) return;
    if (!allShipsPlaced) return;
    const payload = placedShips.map(p => ({ id: p.id, tiles: p.tiles }));
    ws.send(JSON.stringify({ type: "place", placement: payload }));
    setSubmittedPlacement(true);
    try { GameSFX.slPlace(); } catch (e) {}
  };

  const fireShot = (r, c) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== 1) return;
    if (!room || room.status !== "playing" || !room.yourTurn) return;
    // Don't allow re-firing on tiles you've already shot
    const already = (room.myShots || []).find(s => s.r === r && s.c === c);
    if (already) return;
    ws.send(JSON.stringify({ type: "shoot", r, c }));
    // Hit/miss/sunk sound is played by the lastEvent watcher when the server response arrives.
  };

  // Sub-styles
  const titleStyle = { fontSize:24, color:"#ff6060", letterSpacing:5, marginBottom:14, fontFamily:"'Cinzel',serif", textTransform:"uppercase", textAlign:"center" };
  const subStyle = { fontSize:12, color:"rgba(255,255,255,0.5)", letterSpacing:3, textAlign:"center" };
  const btnStyle = { padding:"12px 24px", background:"transparent", border:"1px solid rgba(255,80,80,0.6)", borderRadius:10, color:"#ff6060", fontFamily:"'Cinzel',serif", fontSize:13, letterSpacing:3, textTransform:"uppercase", cursor:"pointer" };
  const btn2Style = { ...btnStyle, border:"1px solid rgba(255,255,255,0.3)", color:"rgba(255,255,255,0.6)" };

  // Computed timer secs
  const placementSecsLeft = (room && room.placementEndsAt) ? Math.max(0, Math.ceil((room.placementEndsAt - now) / 1000)) : null;
  const turnSecsLeft = (room && room.turnEndsAt) ? Math.max(0, Math.ceil((room.turnEndsAt - now) / 1000)) : null;

  // Find opponent player obj
  const oppIdx = room ? (1 - (room.youIndex || 0)) : null;
  const opp = (room && room.players && oppIdx !== null) ? room.players[oppIdx] : null;
  const me = (room && room.players && room.youIndex !== null && room.youIndex !== undefined) ? room.players[room.youIndex] : null;

  return (
    <div style={{position:"fixed",inset:0,background:"#060806",color:"#e8ddd4",padding:"20px 16px 100px",zIndex:100,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",overflow:"auto"}}>
      <style>{`@import url('https://fonts.bunny.net/css?family=jolly-lodger:400|cinzel:400,600,700&display=swap');`}</style>
      <div style={{width:"100%",maxWidth:480,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <button onClick={onExit} style={{background:"transparent",border:"none",color:"rgba(255,255,255,0.5)",fontSize:14,letterSpacing:2,cursor:"pointer"}}>← EXIT</button>
        <div style={{fontSize:14,color:"rgba(255,80,80,0.6)",letterSpacing:4}}>SLAUGHTERSHIP</div>
        <div style={{width:50}}></div>
      </div>

      {phase === "connecting" && (
        <div style={{textAlign:"center",padding:30}}>
          <div style={{fontSize:48,marginBottom:12,opacity:0.5}}>🔪</div>
          <div style={titleStyle}>FINDING A KILLER</div>
          <div style={subStyle}>...connecting...</div>
        </div>
      )}

      {phase === "error" && (
        <div style={{textAlign:"center",padding:30}}>
          <div style={titleStyle}>UNABLE TO PLAY</div>
          <div style={{...subStyle,marginBottom:24}}>{errorMsg}</div>
          <div style={{display:"flex",gap:12,justifyContent:"center"}}>
            <button onClick={connect} style={btnStyle}>TRY AGAIN</button>
            <button onClick={onExit} style={btn2Style}>EXIT</button>
          </div>
        </div>
      )}

      {phase === "ingame" && room && room.status === "waiting" && (
        <div style={{textAlign:"center",padding:30,maxWidth:480,width:"100%"}}>
          <div style={titleStyle}>WAITING FOR A KILLER</div>
          <div style={{...subStyle,marginBottom:24}}>HUNTING FOR AN OPPONENT...</div>
          <div style={{fontSize:48,marginBottom:24,opacity:0.5}}>👁</div>
          <div style={{...subStyle,fontSize:10,opacity:0.6}}>A bot will play if no one joins.</div>
        </div>
      )}

      {phase === "ingame" && room && room.status === "placement" && (
        <div style={{textAlign:"center",maxWidth:480,width:"100%"}}>
          <div style={{fontSize:11,color:"rgba(255,80,80,0.6)",letterSpacing:4,marginBottom:8}}>HIDE YOUR SURVIVORS</div>
          <div style={{fontSize:14,color:"rgba(255,255,255,0.5)",letterSpacing:2,marginBottom:16,fontStyle:"italic"}}>Place all 5 hideouts on your grid</div>
          {/* Timer */}
          {placementSecsLeft !== null && (
            <div style={{position:"relative",height:18,marginBottom:18,background:"rgba(255,80,80,0.05)",borderRadius:6,overflow:"hidden",maxWidth:340,margin:"0 auto 18px"}}>
              <div style={{position:"absolute",top:0,left:0,bottom:0,width:`${Math.max(0,Math.min(100,(placementSecsLeft/60)*100))}%`,background:"linear-gradient(90deg, rgba(255,80,80,0.3), rgba(255,80,80,0.6))",transition:"width 0.25s linear"}}></div>
              <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,letterSpacing:3,color:"#fff",textShadow:"0 0 4px #000"}}>{placementSecsLeft}s</div>
            </div>
          )}
          {/* Grid */}
          <SlaughterGrid
            mode="placement"
            placedShips={placedShips}
            activeShipId={activeShipId}
            activeOrientation={activeOrientation}
            hoveredCell={hoveredCell}
            onHover={setHoveredCell}
            onCellTap={placeShip}
            isValid={isPlacementValid}
            tilesForShipAt={tilesForShipAt}
          />
          {/* Ship picker */}
          <div style={{marginTop:16,display:"flex",flexDirection:"column",gap:6}}>
            {SHIP_DEFS.map(def => {
              const placed = placedShips.find(p => p.id === def.id);
              const isActive = activeShipId === def.id;
              return (
                <div key={def.id} onClick={() => { if (placed) removeShip(def.id); else setActiveShipId(def.id); }}
                  style={{padding:"8px 12px",border:`1px solid ${isActive?"rgba(255,80,80,0.7)":placed?"rgba(150,255,150,0.4)":"rgba(255,255,255,0.2)"}`,borderRadius:8,background:isActive?"rgba(255,80,80,0.08)":placed?"rgba(150,255,150,0.04)":"transparent",cursor:"pointer",display:"flex",alignItems:"center",gap:10,fontSize:12,letterSpacing:2,fontFamily:"'Cinzel',serif"}}>
                  <span style={{fontSize:18}}>{def.emoji}</span>
                  <span style={{flex:1,textAlign:"left"}}>{def.name}</span>
                  <span style={{opacity:0.6}}>{def.size}T</span>
                  {placed ? <span style={{color:"rgba(150,255,150,0.7)"}}>✓ TAP TO MOVE</span> : isActive ? <span style={{color:"#ff6060"}}>PLACING</span> : null}
                </div>
              );
            })}
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:18}}>
            <button onClick={() => setActiveOrientation(o => o === "h" ? "v" : "h")} style={btn2Style}>
              ↻ {activeOrientation === "h" ? "HORIZONTAL" : "VERTICAL"}
            </button>
            <button onClick={randomizePlacement} style={btn2Style}>RANDOMIZE</button>
          </div>
          <div style={{marginTop:18}}>
            <button onClick={submitPlacement} disabled={!allShipsPlaced || submittedPlacement} style={{...btnStyle,opacity:(allShipsPlaced && !submittedPlacement)?1:0.4,cursor:(allShipsPlaced && !submittedPlacement)?"pointer":"not-allowed",padding:"14px 32px"}}>
              {submittedPlacement ? "WAITING FOR OPPONENT..." : "READY TO HIDE"}
            </button>
          </div>
          {errorMsg && <div style={{marginTop:14,fontSize:12,letterSpacing:2,color:"#ff4040",fontFamily:"'Cinzel',serif"}}>⚠ {errorMsg}</div>}
        </div>
      )}

      {phase === "ingame" && room && room.status === "playing" && (
        <div style={{textAlign:"center",maxWidth:480,width:"100%"}}>
          <div style={{fontSize:13,color:room.yourTurn?"#ff6060":"rgba(255,255,255,0.5)",letterSpacing:4,marginBottom:6,fontFamily:"'Cinzel',serif"}}>
            {room.yourTurn ? "🔪 YOUR TURN — STRIKE!" : `⏳ ${opp?.name || "OPPONENT"} IS HUNTING...`}
          </div>
          {/* Turn timer */}
          {turnSecsLeft !== null && (
            <div style={{position:"relative",height:14,marginBottom:14,background:"rgba(255,80,80,0.05)",borderRadius:6,overflow:"hidden",maxWidth:340,margin:"0 auto 14px"}}>
              <div style={{position:"absolute",top:0,left:0,bottom:0,width:`${Math.max(0,Math.min(100,(turnSecsLeft/20)*100))}%`,background:room.yourTurn?"linear-gradient(90deg, rgba(255,80,80,0.4), rgba(255,80,80,0.7))":"linear-gradient(90deg, rgba(150,150,150,0.2), rgba(150,150,150,0.4))",transition:"width 0.25s linear"}}></div>
              <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,letterSpacing:3,color:"#fff",textShadow:"0 0 4px #000"}}>{turnSecsLeft}s</div>
            </div>
          )}
          {/* Opponent grid (where you attack) */}
          <div style={{fontSize:11,color:"rgba(255,80,80,0.7)",letterSpacing:3,marginBottom:6,fontFamily:"'Cinzel',serif"}}>👁 ENEMY TERRITORY</div>
          <SlaughterGrid
            mode="enemy"
            shotsAt={room.myShots || []}
            onCellTap={fireShot}
            yourTurn={room.yourTurn}
          />
          {/* Sunk indicator */}
          <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:6,marginBottom:18,flexWrap:"wrap"}}>
            {SHIP_DEFS.map(def => {
              const sunk = (room.myShots || []).some(s => s.sunkId === def.id);
              return (
                <div key={def.id} title={def.name} style={{fontSize:18,opacity:sunk?1:0.25,filter:sunk?"none":"grayscale(100%)"}}>{def.emoji}</div>
              );
            })}
          </div>
          {/* Last event */}
          {room.lastEvent && (
            <div style={{padding:"10px 14px",borderRadius:8,marginBottom:14,background:room.lastEvent.type==="sunk"?"rgba(255,200,80,0.1)":room.lastEvent.type==="hit"?"rgba(255,80,80,0.08)":"rgba(255,255,255,0.04)",border:`1px solid ${room.lastEvent.type==="sunk"?"rgba(255,200,80,0.5)":room.lastEvent.type==="hit"?"rgba(255,80,80,0.4)":"rgba(255,255,255,0.15)"}`,fontSize:12,letterSpacing:1,color:"#e8ddd4",fontFamily:"'Cinzel',serif"}}>
              {room.lastEvent.type==="sunk" && <>💀 {room.lastEvent.by} SUNK {room.lastEvent.against}'s {room.lastEvent.hideoutEmoji} {room.lastEvent.hideoutName}!</>}
              {room.lastEvent.type==="hit" && <>🩸 {room.lastEvent.by} HIT {room.lastEvent.against}'s HIDEOUT!</>}
              {room.lastEvent.type==="miss" && <>💨 {room.lastEvent.by} MISSED.</>}
              {room.lastEvent.type==="match_start" && <>🔪 THE HUNT BEGINS — {room.lastEvent.firstTurn} GOES FIRST.</>}
            </div>
          )}
          {/* Your grid (defense) */}
          <div style={{fontSize:11,color:"rgba(150,255,150,0.7)",letterSpacing:3,marginTop:14,marginBottom:6,fontFamily:"'Cinzel',serif"}}>🏕️ YOUR HIDEOUTS</div>
          <SlaughterGrid
            mode="self"
            placedShips={(room.myHideouts || []).map(h => ({ id: h.id, size: h.size, tiles: h.tiles, hits: h.hits }))}
            shotsAt={room.oppShots || []}
          />
          <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:6,flexWrap:"wrap"}}>
            {SHIP_DEFS.map(def => {
              const myHide = (room.myHideouts || []).find(h => h.id === def.id);
              const sunk = myHide && myHide.hits >= myHide.size;
              return (
                <div key={def.id} title={def.name} style={{fontSize:18,opacity:sunk?0.25:1,filter:sunk?"grayscale(100%)":"none"}}>{def.emoji}</div>
              );
            })}
          </div>
        </div>
      )}

      {phase === "ended" && room && room.finalResult && (
        <div style={{textAlign:"center",maxWidth:480,width:"100%",padding:30}}>
          <div style={{fontSize:64,marginBottom:18}}>{room.youIndex === room.finalResult.winnerIndex ? "🏆" : "💀"}</div>
          <div style={titleStyle}>{room.youIndex === room.finalResult.winnerIndex ? "YOU SURVIVED!" : "ALL SURVIVORS DEAD"}</div>
          <div style={{...subStyle,marginBottom:24,fontSize:13}}>
            {room.youIndex === room.finalResult.winnerIndex
              ? `${room.finalResult.loserName} could not find your last hideout in time...`
              : `${room.finalResult.winnerName} found and slaughtered everyone.`}
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:12}}>
            <button onClick={connect} style={btnStyle}>HUNT AGAIN</button>
            <button onClick={onExit} style={btn2Style}>EXIT</button>
          </div>
        </div>
      )}
    </div>
  );
}

// 10x10 grid renderer used in 3 modes:
//  - "placement": player drops hideouts on their own grid (preview while hovering)
//  - "self":      player views their own grid during play (sees their hideouts + opp shots)
//  - "enemy":     player attacks opponent's grid (only sees their own shots + sunk hideouts)
//
// An atmospheric pixel-art map renders behind the grid. Two themed maps exist:
//   - "camp": daytime Camp Crystal Lake-style map with lake, beach, dock, cabins, paths, fire pit, trees
//   - "woods": night-time forest with moon, dead trees, fog, abandoned shed, twisted paths
// Each tile is a 10x10 pixel grid (rendered at 30x30 = 3px per pixel).
// Cells are mostly transparent so the map shows through; placed/hit/miss states overlay tinted colors.

// Pixel-art tile definitions. Each tile is 10x10 chars, where each char maps to a color in the palette.
// Tiles are picked from the LAYOUT below to compose the full 10x10 cell grid.
const PIXEL_SIZE = 3; // 10 pixels per tile × 3 = 30px (matches cellSize)

// CAMP palette — daytime greens, browns, blues
const CAMP_PALETTE = {
  ".": "#2a4220", // grass dark
  ",": "#365a2a", // grass medium
  ";": "#447033", // grass light
  "'": "#558840", // grass highlight
  "w": "#2a5070", // water dark
  "W": "#3a6a8a", // water medium
  "X": "#5a90b0", // water highlight
  "s": "#c4a868", // sand
  "S": "#a88a48", // sand dark
  "p": "#6a4a28", // path
  "P": "#5a3e20", // path dark
  "t": "#1a2410", // tree shadow
  "T": "#2a3a18", // tree dark
  "g": "#3a5020", // tree medium
  "G": "#4a6028", // tree light
  "b": "#3a2010", // tree trunk
  "r": "#6a3018", // cabin roof dark
  "R": "#8a4020", // cabin roof
  "n": "#a85838", // cabin roof highlight
  "k": "#5a3818", // cabin wall dark
  "K": "#7a4a20", // cabin wall
  "y": "#dca858", // cabin window light
  "f": "#1a0808", // fire pit ashes
  "F": "#cc4020", // fire flames
  "o": "#ffaa30", // fire highlight
  "d": "#5a3818", // dock dark
  "D": "#7a4a20", // dock light
  "_": "transparent",
};

// WOODS palette — night-time blues, dark greens, blacks (brighter so the map is actually visible)
const WOODS_PALETTE = {
  ".": "#1a1e2a", // dark ground
  ",": "#222638", // ground medium
  ";": "#2a2e44", // ground light
  "'": "#363a52", // ground highlight
  "w": "#0a0e1a", // shadow water
  "W": "#1a223a", // water dark
  "X": "#2a3a5a", // water reflect
  "t": "#0a0a14", // tree shadow
  "T": "#181c20", // tree dark
  "g": "#22241a", // tree medium
  "G": "#2c2e22", // tree light dead
  "b": "#1a1008", // dead trunk
  "B": "#2a1c10", // trunk light
  "m": "#3a3a4e", // mist dark
  "M": "#5a5a72", // mist
  "L": "#bcbc9e", // moon glow
  "l": "#f5edd0", // moon
  "p": "#3a2a18", // dirt trail
  "P": "#22180e", // trail dark
  "r": "#3a1c14", // ruined cabin roof
  "k": "#241a1c", // ruined cabin wall
  "y": "#e84020", // glowing eyes/window
  "_": "transparent",
};

// Tile glyphs — each is 10 chars wide × 10 tall.
// Same glyph rendered with different palette gives day vs night feel.
const TILES = {
  // Plain grass with subtle variation
  grass: [
    ",.,';,;.,'",
    ".;,.,;,;,;",
    ".,;,'.,;.,",
    ",.,;,;,'.,",
    ";,;.,'.;,;",
    ".,;.,,.;,;",
    ",;.;,.,;.,",
    "';,'.,';.,",
    ".,;,'.,;,'",
    ",;.,;,;.,;",
  ],
  // Pure water
  water: [
    "wWwwWwwWww",
    "WwwWwwWwwW",
    "wwWwXwwWww",
    "wWwwwwXWww",
    "WwwWwwwwWw",
    "wwWwwWwwww",
    "wXwwwwwwWw",
    "WwwwWwwWww",
    "wwWwwwwwww",
    "WwwwwWwwWw",
  ],
  // Beach (sand → grass transition, sand on top, grass on bottom)
  beachN: [
    "sssssssSss",
    "SsssSsssss",
    "sSssssSssS",
    "ssSsssssSs",
    "S,ssssSs,s",
    ",s,ss,sSss",
    ".,s,sssS,s",
    ",.,;,sssss",
    ".,;,'.,;.,",
    ",.,;,;,'.,",
  ],
  // Beach corner — sand wraps from top to right
  beachNE: [
    "sssssssSss",
    "ssSssssSss",
    "sSsssSsssS",
    "Sssssssss,",
    "ssSssss,s,",
    "sSssss,;,s",
    "ssSss,.,s,",
    "sSss,,;.s,",
    "Sss,;,'.,;",
    "ss,;.,;,;.",
  ],
  // Beach right-only edge (sand on right, grass on left)
  beachE: [
    ",.,;,SsSss",
    ".;,.,sSsss",
    ".,;,'sSssS",
    ",.,;,SsSss",
    ";,;.,sSsSs",
    ".,;.,sSssS",
    ",;.;,SsSss",
    "';,'.SssSs",
    ".,;,'SsSsS",
    ",;.,;sSsss",
  ],
  // Tree on grass
  tree: [
    ",.,;,;.,;,",
    ".tTTttTt.,",
    "TTgGGGTtT,",
    "TgGGgGGgTt",
    "TGGgGGGgGT",
    "TGGgGGGgTt",
    "tTGgGGgTt,",
    ".tTbbbTt.,",
    ",.,bb,;.,;",
    ".,;,'.,;.,",
  ],
  // Cabin with roof (top half) — needs cabinB below it
  cabinT: [
    ".,;,'.,;.,",
    ",.;,;,;.,;",
    ".rRRRRRRr.",
    "rRnnnRnnRr",
    "RnnnRnnnnR",
    "rRnnnnnnRr",
    ".rRRRRRRr,",
    ".KkkkkkkK,",
    ".kKKKKKKk,",
    ".KkkkkkkK,",
  ],
  // Cabin with door+window (bottom half)
  cabinB: [
    ".KKKKKKKK,",
    ".KyyKKKkkK",
    ".KyyKKkKKk",
    ".KKKKKKKKk",
    ".KkkkKKkKK",
    ".KkKKKKKKk",
    ".KkKkkkKKk",
    ".KKKKKKKKk",
    ".kkkkkkkkk",
    ",.,;,;.,;,",
  ],
  // Path (dirt road)
  path: [
    ".,pPpPpp.,",
    ",.PpPpPpP.",
    ".pPpPpPpP,",
    "PpPpPpPpPp",
    "pPpPpPpPpP",
    "PpPpPpPpPp",
    "pPpPpPpPpP",
    "PpPpPpPpPp",
    ",pPpPpPpP,",
    ".,pPpPpp.,",
  ],
  // Path corner (path on right side and bottom side)
  pathSE: [
    ".,;,'.,;.,",
    ",.;,;,;.,;",
    ".,;,'.,pP,",
    ",.,;,;,Pp,",
    ";,;.,'pPpP",
    ".,;.,PpPpP",
    ",;,pPpPpPp",
    "PpPpPpPpPp",
    "pPpPpPpPpP",
    "PpPpPpPpPp",
  ],
  // Fire pit on grass
  firepit: [
    ".,;,'.,;.,",
    ",.;,;,;.,;",
    ".,;,b'b,;,",
    ",.bfffFfb,",
    ".bfFoooFfb",
    ".fFooFooFf",
    ".bfFoFoFfb",
    ",.bfFFFfb.",
    ".,b,fff,b,",
    ",.,;,;.,;,",
  ],
  // Wooden dock extending into water
  dock: [
    ",.,;,;.,;,",
    ".dddddDDd,",
    ".dDDDDDDDd",
    ".dDdDdDdDd",
    ".dDDDDDDDd",
    ".dDdDdDdDd",
    ".dDDDDDDDd",
    "wdDdDdDdDw",
    "wWdDDDDdWw",
    "WwwwWwwWww",
  ],

  // Woods-only tiles
  // Dead tree
  deadTree: [
    "..,.;,..;,",
    ".tTTttTt..",
    ".tttTtttt.",
    ",.bb..;,..",
    ".tbbtt..,.",
    ",.bb..;,..",
    "..,bbtt;,.",
    ",.,bb..,..",
    ".,;,bb;.,;",
    ".,;,'b,;.,",
  ],
  // Mist patch
  mist: [
    ".,.,;.,..,",
    ".mMmmMmmM,",
    "MmMMMmMMmM",
    "mMmmMMmmMm",
    "MMmMmmMMmM",
    "mmMmMMmmMm",
    "MmMMmmMMmM",
    ",mMmmMmmM,",
    ".,;,'.,;.,",
    ",.,;,;,'.,",
  ],
  // Moon
  moon: [
    ".,;,;.,;.,",
    ".,LLLLLL,;",
    ".,LllllLL,",
    ".LlllllllL",
    ".LlllllllL",
    ".LlllllllL",
    ".LllllllLL",
    ".,LLllLLLL",
    ".,;LLLL;.,",
    ",.,;,;,'.,",
  ],
  // Ruined shed (single tile)
  ruinedShed: [
    ".,;,;.,;.,",
    ".rrrkkrr,;",
    ".kkrrkkrk.",
    ".rkkkrkkk,",
    ".kkyykkkk.",
    ".kkyykkkk,",
    ".kkkkkkkk.",
    ".kkkkkkkk,",
    ".kkkkkkkk.",
    ".,;,'.,;.,",
  ],
  // Trail through woods
  trail: [
    ".,;,;.,;.,",
    ",.;,;,;.,;",
    ".,pp;,'pp,",
    ",.pPpP,Pp,",
    ".,pPpPpPpP",
    ",.,PpPpPp,",
    ".,;,pPpP;.",
    ",.,;,Pp,;,",
    ".,;,'.pP.,",
    ",.,;,;,Pp,",
  ],
  // Black lake — no highlights, dead still water
  blackLake: [
    "wWwwwwwWww",
    "WwwwWwwwwW",
    "wwwwwwwwww",
    "wWwwwwwwWw",
    "WwwwwwwwwW",
    "wwwwwWwwww",
    "wWwwwwwwWw",
    "WwwwwWwwwW",
    "wwwWwwwwww",
    "WwwwwwwwWw",
  ],
  // Wrecked cabin top — broken roof, jagged edges
  wreckedCabinT: [
    ".,;,'.,;.,",
    ",.;,;,;.,;",
    ".,rrR,Rr,,",
    ".rRrr,rRr.",
    ".,RrrRrrr.",
    ".rrR,,rRr,",
    ".,rR,Rr,r.",
    ".kkkk,kkk,",
    ".KkkkKkkkK",
    ".kKKkKKkKK",
  ],
  // Wrecked cabin bottom — collapsing walls, glowing red eye-window
  wreckedCabinB: [
    ".KKKkkKKkk",
    ".KkyyKK,kK",
    ".KkyyKkkKK",
    ".KKKkkKKKk",
    ".kKKKKkKKK",
    ".KkkkKKkkK",
    ".KKkKkkKKk",
    ".kKKkKkKkk",
    ".kkkkkkkkk",
    ",.,;,;.,;,",
  ],
  // Gravestone — single tomb on grass
  grave: [
    ".,;,'.,;.,",
    ",.;,'.,;,;",
    ".,;.GggG;.",
    ",.,GgggggG",
    ".,GggGggG,",
    ".,GggggggG",
    ".,GgGGggG.",
    ".,GgggggG,",
    ".,bbbbbb;,",
    ",.,;,;,'.,",
  ],
  // Cluster of 3 gravestones
  graveyard: [
    ",.,;,;.,;,",
    ".GgG.GgG.,",
    "GggG,GggG,",
    "GgggGgggG.",
    "GgggGgggG,",
    "GgGGgggGGG",
    "GggggggGgg",
    "bbb,bbb,bb",
    ",.,;,;.,;,",
    "..,;,;.,;.",
  ],
  // Dead fire pit — cold ashes only
  deadFirepit: [
    ".,;,'.,;.,",
    ",.;,;,;.,;",
    ".,;,b.b,;,",
    ",.bff,fb,,",
    ".bfffffffb",
    ".bffffffff",
    ".bfffffffb",
    ",.bfffffb.",
    ".,b.fff.b,",
    ",.,;,;.,;,",
  ],
};

// MAP layouts — 10 rows × 10 cols, each cell holds a tile name.
// Designed for visual interest: lake top-right, beach around it, dock, cabins, paths, fire pit, trees.
const CAMP_LAYOUT = [
  ["grass", "tree",  "grass", "grass", "grass", "beachN","beachN","beachN","beachN","beachNE"],
  ["grass", "grass", "grass", "tree",  "grass", "beachN","water", "water", "water", "beachE"],
  ["grass", "grass", "cabinT","grass", "grass", "dock",  "water", "water", "water", "beachE"],
  ["tree",  "grass", "cabinB","grass", "path",  "path",  "water", "water", "water", "beachE"],
  ["grass", "grass", "grass", "grass", "path",  "grass", "beachE","water", "water", "beachE"],
  ["grass", "path",  "path",  "path",  "pathSE","grass", "grass", "beachE","water", "beachE"],
  ["grass", "path",  "grass", "grass", "grass", "tree",  "grass", "grass", "grass", "tree" ],
  ["grass", "path",  "grass", "firepit","grass","grass", "grass", "cabinT","grass", "grass"],
  ["tree",  "path",  "grass", "grass", "grass", "tree",  "grass", "cabinB","grass", "tree" ],
  ["grass", "path",  "grass", "tree",  "grass", "grass", "grass", "grass", "grass", "grass"],
];

const WOODS_LAYOUT = [
  ["grass",     "deadTree",  "grass",     "mist",      "grass",     "blackLake", "blackLake", "blackLake", "blackLake", "blackLake"],
  ["deadTree",  "grass",     "grass",     "deadTree",  "grass",     "blackLake", "blackLake", "blackLake", "blackLake", "blackLake"],
  ["grass",     "grass",     "wreckedCabinT","grass",  "deadTree",  "grass",     "blackLake", "blackLake", "blackLake", "blackLake"],
  ["mist",      "grass",     "wreckedCabinB","grass",  "trail",     "trail",     "blackLake", "blackLake", "blackLake", "deadTree"],
  ["grass",     "deadTree",  "grass",     "grass",     "trail",     "grass",     "grass",     "blackLake", "deadTree",  "grass"   ],
  ["grass",     "grass",     "trail",     "trail",     "trail",     "grass",     "deadTree",  "grass",     "mist",      "deadTree"],
  ["deadTree",  "mist",      "trail",     "grass",     "graveyard", "grass",     "grass",     "deadTree",  "grass",     "grass"   ],
  ["grass",     "grass",     "trail",     "deadFirepit","grass",    "grave",     "grass",     "grass",     "moon",      "grass"   ],
  ["mist",      "deadTree",  "trail",     "grass",     "deadTree",  "grass",     "deadTree",  "grass",     "grass",     "deadTree"],
  ["grass",     "grass",     "grass",     "deadTree",  "grass",     "mist",      "grass",     "grass",     "deadTree",  "grass"   ],
];

// Render a single tile as positioned <rect>s
function renderTile(tileName, palette, x, y, key) {
  const tile = TILES[tileName] || TILES.grass;
  const rects = [];
  for (let row = 0; row < tile.length; row++) {
    const line = tile[row];
    for (let col = 0; col < line.length; col++) {
      const ch = line[col];
      const color = palette[ch];
      if (!color || color === "transparent") continue;
      rects.push(
        <rect
          key={key + "-" + row + "-" + col}
          x={x + col * PIXEL_SIZE}
          y={y + row * PIXEL_SIZE}
          width={PIXEL_SIZE}
          height={PIXEL_SIZE}
          fill={color}
          shapeRendering="crispEdges"
        />
      );
    }
  }
  return rects;
}

function CampMapSVG() {
  const w = 300, h = 300;
  const rects = [];
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      const tileName = CAMP_LAYOUT[r][c];
      rects.push(...renderTile(tileName, CAMP_PALETTE, c * 30, r * 30, `c${r}${c}`));
    }
  }
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",imageRendering:"pixelated"}}>
      {rects}
    </svg>
  );
}

function WoodsMapSVG() {
  const w = 300, h = 300;
  const rects = [];
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      const tileName = WOODS_LAYOUT[r][c];
      rects.push(...renderTile(tileName, WOODS_PALETTE, c * 30, r * 30, `w${r}${c}`));
    }
  }
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",imageRendering:"pixelated"}}>
      {rects}
    </svg>
  );
}

function SlaughterGrid({ mode, placedShips, activeShipId, activeOrientation, hoveredCell, onHover, onCellTap, shotsAt, isValid, tilesForShipAt, yourTurn }) {
  const cellSize = 30;
  const gridPx = cellSize * 10;
  const occMap = {}; // "r:c" → ship id (for placement/self mode)
  if (placedShips) {
    for (const ship of placedShips) {
      for (const [r, c] of ship.tiles) occMap[r + ":" + c] = ship;
    }
  }
  // Hover preview tiles for placement mode
  let previewTiles = null;
  let previewValid = true;
  if (mode === "placement" && activeShipId && hoveredCell && tilesForShipAt && isValid) {
    const def = SHIP_DEFS.find(s => s.id === activeShipId);
    if (def) {
      previewTiles = tilesForShipAt(def, hoveredCell[0], hoveredCell[1], activeOrientation);
      previewValid = isValid(previewTiles);
    }
  }
  const previewSet = previewTiles ? new Set(previewTiles.map(([r, c]) => r + ":" + c)) : null;
  // Shots map for enemy/self modes
  const shotMap = {};
  if (shotsAt) for (const s of shotsAt) shotMap[s.r + ":" + s.c] = s;

  const cells = [];
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      const key = r + ":" + c;
      const ship = occMap[key];
      const shot = shotMap[key];
      const inPreview = previewSet ? previewSet.has(key) : false;
      // Default cells are nearly transparent so the SVG map shows through.
      let bg = "rgba(255,255,255,0.02)";
      let border = "1px solid rgba(255,255,255,0.10)";
      let content = null;
      if (mode === "placement") {
        if (ship) { bg = "rgba(150,255,150,0.30)"; border = "1px solid rgba(150,255,150,0.7)"; }
        if (inPreview) {
          bg = previewValid ? "rgba(150,255,150,0.45)" : "rgba(255,80,80,0.45)";
          border = previewValid ? "1px solid rgba(150,255,150,0.85)" : "1px solid rgba(255,80,80,0.85)";
        }
      } else if (mode === "self") {
        if (ship) {
          const sunk = ship.hits >= ship.size;
          bg = sunk ? "rgba(80,80,80,0.5)" : "rgba(150,255,150,0.28)";
          border = sunk ? "1px solid rgba(80,80,80,0.7)" : "1px solid rgba(150,255,150,0.6)";
        }
        if (shot) {
          // opp's shot on me
          if (shot.hit) { bg = "rgba(255,80,80,0.5)"; border = "1px solid rgba(255,80,80,0.85)"; content = "💥"; }
          else { bg = "rgba(255,255,255,0.20)"; content = "·"; }
        }
      } else if (mode === "enemy") {
        if (shot) {
          // Tile revealed by your shot — show map underneath, with hit/miss overlay
          if (shot.hit) { bg = shot.sunkId ? "rgba(120,30,30,0.7)" : "rgba(255,80,80,0.4)"; border = "1px solid rgba(255,80,80,0.85)"; content = shot.sunkId ? "💀" : "🩸"; }
          else { bg = "rgba(255,255,255,0.10)"; border = "1px solid rgba(255,255,255,0.25)"; content = "✕"; }
        } else {
          // Fog of war — heavy dark cover hides the map underneath
          bg = "rgba(0,0,0,0.85)";
          border = "1px solid rgba(60,60,80,0.4)";
        }
      }
      cells.push(
        <div
          key={key}
          onMouseEnter={mode === "placement" ? () => onHover && onHover([r, c]) : undefined}
          onMouseLeave={mode === "placement" ? () => onHover && onHover(null) : undefined}
          onClick={() => {
            if (mode === "placement" && onCellTap) onCellTap(r, c);
            else if (mode === "enemy" && onCellTap && yourTurn && !shot) onCellTap(r, c);
          }}
          style={{
            position:"absolute", left: c * cellSize, top: r * cellSize,
            width: cellSize - 2, height: cellSize - 2,
            background: bg, border,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize: 14,
            cursor: (mode === "placement" || (mode === "enemy" && yourTurn && !shot)) ? "pointer" : "default",
            transition: "background 0.1s, border 0.1s",
            zIndex: 2,
          }}
        >{content}</div>
      );
    }
  }
  return (
    <div style={{position:"relative",width:gridPx,height:gridPx,margin:"0 auto",background:"#0a1308",border:"1px solid rgba(80,140,80,0.5)",borderRadius:6,overflow:"hidden",boxShadow:"inset 0 0 30px rgba(0,40,0,0.3)"}}>
      <CampMapSVG />
      {cells}
    </div>
  );
}

// ── SLASHER MYSTERY (CLUE-STYLE DEDUCTION GAME) ──
// Single-player vs 3 bots. 7 killers × 7 locations × 7 weapons = 343 possible mysteries.
// One card from each category is hidden in the CASE FILE; the rest are dealt to players.
// On your turn: SUGGEST (killer + location + weapon). Other players check their hand and
// secretly show you ONE matching card if they have any. Eliminate seen cards from your
// notebook. ACCUSE when you're sure — wrong accusation eliminates you from the round.
const KILLERS = [
  { id: "freddy",      name: "Freddy Krueger",  emoji: "🔥" },
  { id: "jason",       name: "Jason Voorhees",  emoji: "🏒" },
  { id: "michael",     name: "Michael Myers",   emoji: "🔪" },
  { id: "ghostface",   name: "Ghostface",       emoji: "👻" },
  { id: "leatherface", name: "Leatherface",     emoji: "🪚" },
  { id: "pinhead",     name: "Pinhead",         emoji: "📌" },
  { id: "chucky",      name: "Chucky",          emoji: "🪆" },
];
const LOCATIONS = [
  { id: "cabin",       name: "The Cabin",       emoji: "🛖" },
  { id: "boilerroom",  name: "Boiler Room",     emoji: "🔥" },
  { id: "forest",      name: "The Forest",      emoji: "🌲" },
  { id: "asylum",      name: "Asylum",          emoji: "🏚️" },
  { id: "lake",        name: "Camp Lake",       emoji: "🌊" },
  { id: "highschool",  name: "High School",     emoji: "🏫" },
  { id: "basement",    name: "The Basement",    emoji: "📦" },
  { id: "morgue",      name: "The Morgue",      emoji: "⚰️" },
];
const WEAPONS = [
  { id: "machete",     name: "Machete",         emoji: "🗡️" },
  { id: "knife",       name: "Kitchen Knife",   emoji: "🔪" },
  { id: "glove",       name: "Glove of Blades", emoji: "🦾" },
  { id: "hook",        name: "Meat Hook",       emoji: "🪝" },
  { id: "chainsaw",    name: "Chainsaw",        emoji: "🪚" },
  { id: "doll",        name: "Doll's Knife",    emoji: "🩸" },
  { id: "axe",         name: "Axe",             emoji: "🪓" },
];
const BOT_NAMES = ["Sidney", "Laurie", "Nancy", "Tommy", "Alice", "Ellen", "Kirsty"];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Initialize a fresh match: pick the secret case file, deal remaining cards across 4 players.
function initMatch(playerName) {
  const caseFile = {
    killer: KILLERS[Math.floor(Math.random() * KILLERS.length)].id,
    location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)].id,
    weapon: WEAPONS[Math.floor(Math.random() * WEAPONS.length)].id,
  };
  // All cards EXCEPT the case file
  const remaining = [];
  for (const k of KILLERS) if (k.id !== caseFile.killer) remaining.push({ type: "killer", id: k.id });
  for (const l of LOCATIONS) if (l.id !== caseFile.location) remaining.push({ type: "location", id: l.id });
  for (const w of WEAPONS) if (w.id !== caseFile.weapon) remaining.push({ type: "weapon", id: w.id });
  const deck = shuffle(remaining);
  // 4 players, deal as evenly as possible (18 cards / 4 = 4-5 each)
  const botNames = shuffle(BOT_NAMES).slice(0, 3);
  const players = [
    { id: 0, name: playerName, isBot: false, hand: [], eliminated: false },
    { id: 1, name: botNames[0], isBot: true, hand: [], eliminated: false, knownCards: new Set() },
    { id: 2, name: botNames[1], isBot: true, hand: [], eliminated: false, knownCards: new Set() },
    { id: 3, name: botNames[2], isBot: true, hand: [], eliminated: false, knownCards: new Set() },
  ];
  for (let i = 0; i < deck.length; i++) {
    players[i % 4].hand.push(deck[i]);
  }
  // Bots automatically "know" their own cards — they appear in knownCards as eliminated possibilities
  for (const p of players) {
    if (p.isBot) {
      for (const card of p.hand) p.knownCards.add(card.type + ":" + card.id);
    }
  }
  return { caseFile, players, turnIdx: 0, log: [], status: "playing" };
}

// Player's notebook — tracks what they've ruled out
function emptyNotebook(playerHand) {
  const n = { killer: {}, location: {}, weapon: {} };
  for (const k of KILLERS) n.killer[k.id] = "unknown";
  for (const l of LOCATIONS) n.location[l.id] = "unknown";
  for (const w of WEAPONS) n.weapon[w.id] = "unknown";
  // Mark your own cards as "ruled out" automatically
  for (const card of playerHand) n[card.type][card.id] = "in-hand";
  return n;
}

// Pick which card a player should show in response to a suggestion.
// If they have multiple matching cards, they pick one (we use simple priority — show what
// other players are most likely to already know about, so we don't burn unique info).
function pickCardToShow(player, suggestion) {
  const matches = player.hand.filter(c =>
    (c.type === "killer" && c.id === suggestion.killer) ||
    (c.type === "location" && c.id === suggestion.location) ||
    (c.type === "weapon" && c.id === suggestion.weapon)
  );
  if (matches.length === 0) return null;
  // Pick a random match (simple). Could be smarter but this is fine.
  return matches[Math.floor(Math.random() * matches.length)];
}

// Bot turn: make a suggestion using narrowing logic.
//  - For each category, prefer cards we don't know are NOT the answer (i.e., still "possible")
//  - Slight preference to repeat cards we've already had eliminated (to learn what OTHER bots have)
function botMakeSuggestion(bot) {
  const possKillers = KILLERS.filter(k => !bot.knownCards.has("killer:" + k.id));
  const possLocations = LOCATIONS.filter(l => !bot.knownCards.has("location:" + l.id));
  const possWeapons = WEAPONS.filter(w => !bot.knownCards.has("weapon:" + w.id));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  return {
    killer: (possKillers.length > 0 ? pick(possKillers) : pick(KILLERS)).id,
    location: (possLocations.length > 0 ? pick(possLocations) : pick(LOCATIONS)).id,
    weapon: (possWeapons.length > 0 ? pick(possWeapons) : pick(WEAPONS)).id,
  };
}

// Bot decides whether to accuse. Only does so when ONE possibility remains in each category.
function botShouldAccuse(bot) {
  const possKillers = KILLERS.filter(k => !bot.knownCards.has("killer:" + k.id));
  const possLocations = LOCATIONS.filter(l => !bot.knownCards.has("location:" + l.id));
  const possWeapons = WEAPONS.filter(w => !bot.knownCards.has("weapon:" + w.id));
  if (possKillers.length === 1 && possLocations.length === 1 && possWeapons.length === 1) {
    return { killer: possKillers[0].id, location: possLocations[0].id, weapon: possWeapons[0].id };
  }
  return null;
}

// ── TRICK OR TREAT MASSACRE — Halloween Match-3 ──
// Match 3+ Halloween icons to clear them. The Slasher tile descends each move.
// Match adjacent to the Slasher to fight him off. If he reaches the bottom, you die.
// 3 levels: Michael (slow), Jason (faster), Freddy (teleports).

const TOT_ICONS = [
  { id: "pumpkin", emoji: "🎃", color: "#ff8c1a" },
  { id: "candy",   emoji: "🍬", color: "#e63946" },
  { id: "lolli",   emoji: "🍭", color: "#ff6bb5" },
  { id: "bat",     emoji: "🦇", color: "#7a2cff" },
  { id: "ghost",   emoji: "👻", color: "#dfe7ff" },
  { id: "spider",  emoji: "🕷️", color: "#5a4630" },
  { id: "choco",   emoji: "🍫", color: "#8b4513" },
];

// Pool of slasher masks that respawn cycles through after a kill
const TOT_SLASHER_POOL = [
  { mask: "😶", color: "#e8e8e8", name: "MICHAEL" },     // Michael's blank white face
  { mask: "🪓", color: "#9aa0a6", name: "JASON" },        // Jason's axe
  { mask: "🔥", color: "#cc3300", name: "FREDDY" },       // Freddy's fire/burns
  { mask: "👻", color: "#dfe7ff", name: "GHOSTFACE" },    // Ghostface
  { mask: "🤡", color: "#ff5050", name: "PENNYWISE" },    // Pennywise clown
  { mask: "⛓️", color: "#8b3a1a", name: "LEATHERFACE" },  // Leatherface chains
];

// 5 acts of 10 nights each = 50 levels.
// Each act has its own theme (sky, location, danger flavor) and a difficulty
// curve: gentle 1-3, medium 4-7, breather 8, ramp-up 9, BOSS 10.
const TOT_ACTS = [
  {
    label: "SUBURBAN",
    locations: ["HADDONFIELD STREET","HADDONFIELD MAPLE LN","HADDONFIELD CEMETERY","HADDONFIELD HOSPITAL","HADDONFIELD HIGH","SMITH'S GROVE","MEEKERS WOODS","RUSSELL ROW","DOYLE HOUSE","MYERS HOUSE"],
    skyTop:"#1a0d2e", skyBottom:"#3d1f1f",
  },
  {
    label: "WILDERNESS",
    locations: ["CRYSTAL LAKE","CAMP CRYSTAL","CAMP NO-BE-BO-SCO","HIGGINS HAVEN","PINEHURST","FORREST GREEN","CAMP ARAWAK","BLACKWOOD CREEK","COUNSELOR CABIN","JASON'S SHACK"],
    skyTop:"#0a1a14", skyBottom:"#0f2a1a",
  },
  {
    label: "DREAMSCAPE",
    locations: ["ELM STREET","SPRINGWOOD","BOILER ROOM","KRUEGER HOUSE","NANCY'S BEDROOM","WESTIN HILLS","BADHAM PRESCHOOL","NIGHTMARE HALL","FREDDY'S DREAM","HELL"],
    skyTop:"#2a0e0e", skyBottom:"#4a1a0a",
  },
  {
    label: "SANITARIUM",
    locations: ["SANITARIUM HALL","CELL BLOCK D","ASYLUM YARD","STRAITJACKET WARD","PHARMACY","MORGUE","ELECTROSHOCK","ATTIC LOCKUP","PADDED ROOM","WARDEN'S OFFICE"],
    skyTop:"#1d2113", skyBottom:"#2c2810",
  },
  {
    label: "HELLFIRE",
    locations: ["BURNING CHURCH","HELLMOUTH","SOUL FORGE","INFERNAL PIT","BLOOD ALTAR","SCREAMING WOODS","DAMNED CITY","COVEN CIRCLE","SOULTRAP","HELL ITSELF"],
    skyTop:"#1a0000", skyBottom:"#2a0a00",
  },
];

// Generate 50 levels with a measured difficulty curve.
function totBuildLevels() {
  const levels = [];
  // Objective types rotate so levels feel different:
  // 'score' = reach target score in moves
  // 'kills' = kill N slashers in moves (slashers respawn until count is met)
  // 'survive' = don't let any slasher reach the bottom for X moves
  // 'collect' = match X tiles of a specific featured icon (jack-o-lantern)
  // Boss levels (night 10) get the same objective rotation as everyone else.
  const OBJECTIVES = ['score', 'kills', 'collect', 'survive', 'score', 'kills'];
  for (let act = 0; act < 5; act++) {
    for (let night = 0; night < 10; night++) {
      const idx = act * 10 + night;
      const a = TOT_ACTS[act];
      const curveMult = [1.0, 1.15, 1.3, 1.5, 1.7, 1.9, 2.1, 2.35, 1.9, 2.7][night];
      const isBoss = night === 9;
      const isBreather = night === 7;

      const baseScore = 1800 + act * 1100;
      const targetScore = Math.round(baseScore * curveMult / 100) * 100;

      // MOVE BUDGET (replaces timer). More moves at start, fewer later.
      let moveBudget = 28 - Math.floor(act * 1.5) - Math.floor(night / 2);
      if (isBreather) moveBudget += 5;
      moveBudget = Math.max(15, moveBudget);

      let movesPerStep = 4 - Math.floor(act * 0.7) - Math.floor(night / 3);
      if (isBreather) movesPerStep = Math.min(4, movesPerStep + 1);
      // Floor of 2 ensures the slasher never moves on every player turn — players need at least
      // one quiet beat to set up combos. Pre-fix: late-game levels had movesPerStep=1 making
      // sustained tactics impossible.
      movesPerStep = Math.max(2, movesPerStep);

      const splits = act >= 1 && night >= 5;
      const teleports = act >= 2 && night >= 4;
      const dualSpawn = act >= 3;
      const tripleSpawn = act >= 4 && night >= 5;

      let slasherHP = 1 + Math.floor(act / 2);
      if (act >= 3) slasherHP = act === 3 ? 3 : 4;
      if (isBreather) slasherHP = Math.max(1, slasherHP - 1);
      const proximityKills = true;
      const rageInterval = act >= 1 ? (act >= 3 ? 5 : 7) : null;
      const cursedTiles = act >= 1;
      const cursedChance = act === 1 ? 0.015 : act === 2 ? 0.025 : act === 3 ? 0.035 : act === 4 ? 0.045 : 0.06;
      // Blood trails removed across all levels — used to be on for act >= 2
      const bloodTrails = false;
      const bloodTrailLifespan = 7;

      // Pick objective for this level. Bosses still have tougher slashers (higher HP, etc.)
      // but use a regular objective rather than a unique boss-only one.
      let objective;
      const obType = OBJECTIVES[idx % OBJECTIVES.length];
      if (obType === 'score') {
        objective = { type: 'score', target: targetScore, label: `SCORE ${targetScore}` };
      } else if (obType === 'kills') {
        const kills = Math.min(8, 2 + Math.floor(idx / 6));
        objective = { type: 'kills', target: kills, label: `KILL ${kills} SLASHERS` };
      } else if (obType === 'collect') {
        const need = Math.min(20, 8 + Math.floor(idx / 4));
        objective = { type: 'collect', target: need, label: `COLLECT ${need} 🎃` };
      } else { // survive
        objective = { type: 'survive', target: moveBudget, label: `SURVIVE ${moveBudget} MOVES` };
      }

      let twist = null;
      if (tripleSpawn) twist = "TRIPLE THREAT";
      else if (dualSpawn && teleports && splits) twist = "CHAOS";
      else if (dualSpawn) twist = "TWIN BLADES";
      else if (teleports) twist = "PHANTOM";
      else if (splits) twist = "MULTIPLY";
      else if (isBreather) twist = "BREATHER";

      levels.push({
        name: `NIGHT ${idx + 1}`,
        subtitle: a.locations[night],
        actLabel: a.label,
        mask: "💀",
        maskColor: "#ff3030",
        skyTop: a.skyTop,
        skyBottom: a.skyBottom,
        movesPerStep,
        targetScore,
        moveBudget,
        timeLimit: null, // no more time limit
        objective,
        teleports,
        splits,
        dualSpawn,
        tripleSpawn,
        slasherHP,
        proximityKills,
        rageInterval,
        cursedTiles,
        cursedChance,
        bloodTrails,
        bloodTrailLifespan,
        twist,
        isBoss,
        isBreather,
      });
    }
  }
  return levels;
}

const TOT_LEVELS = totBuildLevels();

// ── Persistence — uses Storage abstraction (Capacitor Preferences on native, localStorage on web) ──
const TOT_SAVE_KEY = "tot_progress_v1";

async function totLoadProgress() {
  try {
    const raw = await Storage.get(TOT_SAVE_KEY);
    if (!raw) return { unlocked: 1, stars: {}, bestScores: {} };
    const data = JSON.parse(raw);
    return {
      unlocked: Math.max(1, Math.min(50, data.unlocked || 1)),
      stars: data.stars || {},
      bestScores: data.bestScores || {},
    };
  } catch(e) { return { unlocked: 1, stars: {}, bestScores: {} }; }
}

async function totSaveProgress(progress) {
  try { await Storage.set(TOT_SAVE_KEY, JSON.stringify(progress)); } catch(e) {}
}

// 1⭐ = beat target. 2⭐ = target × 1.4. 3⭐ = target × 1.8.
function totCalcStars(score, target) {
  if (score >= Math.round(target * 1.8)) return 3;
  if (score >= Math.round(target * 1.4)) return 2;
  if (score >= target) return 1;
  return 0;
}


const COLS = 7;
const ROWS = 8;

let _totIdCounter = 0;
// Power types: null (normal), "stripe-h" (clears row), "stripe-v" (clears column),
// "wrapped" (3x3 area explosion, twice), "colorbomb" (clears all of one color)
function totMakeTile(icon, cursed = false, power = null) {
  return { id: ++_totIdCounter, icon, cursed, power };
}

function totRandIcon() {
  return TOT_ICONS[Math.floor(Math.random() * TOT_ICONS.length)].id;
}

// Roll for whether a freshly-spawned tile should be cursed (based on level config).
// cursedChance is 0..1, e.g. 0.03 = 3% of new candies become cursed.
function totRollCursed(cursedChance) {
  return cursedChance > 0 && Math.random() < cursedChance;
}

// Build a board with no pre-existing matches. Cells are {id, icon, cursed} objects.
// Initial board has NO cursed tiles — they only spawn from refills after matches.
function totBuildBoard() {
  const board = [];
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) {
      let icon;
      let attempts = 0;
      do {
        icon = totRandIcon();
        attempts++;
        const horizMatch = c >= 2 && row[c-1].icon === icon && row[c-2].icon === icon;
        const vertMatch = r >= 2 && board[r-1][c].icon === icon && board[r-2][c].icon === icon;
        if (!horizMatch && !vertMatch) break;
      } while (attempts < 30);
      row.push(totMakeTile(icon));
    }
    board.push(row);
  }
  return board;
}

// Find all match groups (>= 3 in a row, horizontal or vertical). Reads .icon from cell objects.
// Cells in `lockedCells` (Map of "r,c" -> _) are treated as walls — they break runs.
function totFindMatches(board, lockedCells = null) {
  const isLocked = lockedCells ? (r, c) => lockedCells.has(`${r},${c}`) : () => false;
  const matched = new Set();
  // Horizontal
  for (let r = 0; r < ROWS; r++) {
    let runStart = 0;
    for (let c = 1; c <= COLS; c++) {
      const curIcon = c < COLS && board[r][c] && !isLocked(r, c) ? board[r][c].icon : null;
      const startIcon = board[r][runStart] && !isLocked(r, runStart) ? board[r][runStart].icon : null;
      if (c === COLS || curIcon !== startIcon || !startIcon) {
        const len = c - runStart;
        if (len >= 3 && startIcon) {
          for (let i = runStart; i < c; i++) matched.add(`${r},${i}`);
        }
        runStart = c;
      }
    }
  }
  // Vertical
  for (let c = 0; c < COLS; c++) {
    let runStart = 0;
    for (let r = 1; r <= ROWS; r++) {
      const curIcon = r < ROWS && board[r] && board[r][c] && !isLocked(r, c) ? board[r][c].icon : null;
      const startIcon = board[runStart] && board[runStart][c] && !isLocked(runStart, c) ? board[runStart][c].icon : null;
      if (r === ROWS || curIcon !== startIcon || !startIcon) {
        const len = r - runStart;
        if (len >= 3 && startIcon) {
          for (let i = runStart; i < r; i++) matched.add(`${i},${c}`);
        }
        runStart = r;
      }
    }
  }
  return matched;
}

// Find match groups individually (each contiguous run of 3+ same-icon tiles).
// Returns an array of groups, each with { cells: [{r,c}], size, dir, centerR, centerC }.
// Used for proximity-based damage so each group's size determines damage independently.
function totFindMatchGroups(board, lockedCells = null) {
  const isLocked = lockedCells ? (r, c) => lockedCells.has(`${r},${c}`) : () => false;
  const groups = [];
  // Horizontal
  for (let r = 0; r < ROWS; r++) {
    let runStart = 0;
    for (let c = 1; c <= COLS; c++) {
      const curIcon = c < COLS && board[r][c] && !isLocked(r, c) ? board[r][c].icon : null;
      const startIcon = board[r][runStart] && !isLocked(r, runStart) ? board[r][runStart].icon : null;
      if (c === COLS || curIcon !== startIcon || !startIcon) {
        const len = c - runStart;
        if (len >= 3 && startIcon) {
          const cells = [];
          for (let i = runStart; i < c; i++) cells.push({ r, c: i });
          groups.push({
            cells, size: len, dir: 'h',
            centerR: r,
            centerC: (runStart + c - 1) / 2,
          });
        }
        runStart = c;
      }
    }
  }
  // Vertical
  for (let c = 0; c < COLS; c++) {
    let runStart = 0;
    for (let r = 1; r <= ROWS; r++) {
      const curIcon = r < ROWS && board[r] && board[r][c] && !isLocked(r, c) ? board[r][c].icon : null;
      const startIcon = board[runStart] && board[runStart][c] && !isLocked(runStart, c) ? board[runStart][c].icon : null;
      if (r === ROWS || curIcon !== startIcon || !startIcon) {
        const len = r - runStart;
        if (len >= 3 && startIcon) {
          const cells = [];
          for (let i = runStart; i < r; i++) cells.push({ r: i, c });
          groups.push({
            cells, size: len, dir: 'v',
            centerR: (runStart + r - 1) / 2,
            centerC: c,
          });
        }
        runStart = r;
      }
    }
  }
  return groups;
}

// Given a swap that triggered matches and the resulting match groups, decide whether
// to create power tiles. Returns array of { r, c, power, icon } for tiles to convert
// to power tiles instead of clearing. The cells that BECOME power tiles are removed
// from the matched set so they survive.
//
// Rules (Candy Crush style):
// - 5-in-a-row → colorbomb at swap position
// - T/L intersection (horizontal AND vertical match sharing a cell) → wrapped at intersection
// - 4-in-a-row → striped at swap position (h-match=stripe-v? no, h-match=stripe-h cleared row...
//                CRUSH RULE: a 4-match HORIZONTAL → striped HORIZONTAL candy → clears its row.
//                Wait, actually it's the opposite — 4 in horizontal row creates a vertical stripe (clears column)
//                Let me match Candy Crush exactly: 4 horizontal → vertical stripe (clears column),
//                4 vertical → horizontal stripe (clears row). The stripe "shoots in the direction
//                perpendicular to the original match". This way a horizontal 4-match clears the
//                column it touches, useful for hitting a slasher above/below.)
function totClassifyMatches(groups, swapPos, matchedSet) {
  const upgrades = []; // { r, c, power, icon }
  const consumedKeys = new Set(); // cells that turn into power tiles, removed from clear set

  // Find intersections (cells appearing in both a horizontal and vertical group)
  const hGroups = groups.filter(g => g.dir === 'h');
  const vGroups = groups.filter(g => g.dir === 'v');
  const intersections = []; // { r, c, hGroup, vGroup, icon }
  for (const h of hGroups) {
    for (const v of vGroups) {
      // Horizontal at row h.centerR (integer). Check if vertical at column v.centerC contains row h.centerR.
      const hRow = h.cells[0].r;
      const vCol = v.cells[0].c;
      const vHasRow = v.cells.some(c => c.r === hRow);
      const hHasCol = h.cells.some(c => c.c === vCol);
      if (vHasRow && hHasCol) {
        // Same icon? Check first cell
        intersections.push({ r: hRow, c: vCol, hGroup: h, vGroup: v });
      }
    }
  }

  // Track which groups are "consumed" by intersections (they create wrapped, not stripe)
  const consumedGroupIds = new Set();
  for (const inter of intersections) {
    // T/L intersection → wrapped candy at the intersection cell
    upgrades.push({ r: inter.r, c: inter.c, power: 'wrapped' });
    consumedKeys.add(`${inter.r},${inter.c}`);
    consumedGroupIds.add(inter.hGroup);
    consumedGroupIds.add(inter.vGroup);
  }

  // Now process remaining (non-intersection) groups for stripe/colorbomb
  for (const g of groups) {
    if (consumedGroupIds.has(g)) continue;
    if (g.size >= 5) {
      // Color bomb at swap position if swap was in this group, else at center
      let target = null;
      if (swapPos && g.cells.some(c => c.r === swapPos.r && c.c === swapPos.c)) {
        target = swapPos;
      } else {
        // Pick the cell closest to integer center
        const cR = Math.round(g.centerR);
        const cC = Math.round(g.centerC);
        target = g.cells.find(c => c.r === cR && c.c === cC) || g.cells[Math.floor(g.cells.length / 2)];
      }
      upgrades.push({ r: target.r, c: target.c, power: 'colorbomb' });
      consumedKeys.add(`${target.r},${target.c}`);
    } else if (g.size === 4) {
      // Stripe candy. Direction perpendicular to match (4 horizontal → vertical stripe = clears column)
      const stripePower = g.dir === 'h' ? 'stripe-v' : 'stripe-h';
      let target = null;
      if (swapPos && g.cells.some(c => c.r === swapPos.r && c.c === swapPos.c)) {
        target = swapPos;
      } else {
        target = g.cells[Math.floor(g.cells.length / 2)];
      }
      upgrades.push({ r: target.r, c: target.c, power: stripePower });
      consumedKeys.add(`${target.r},${target.c}`);
    }
  }
  return { upgrades, consumedKeys };
}

// Compute all cells that should be cleared when a power tile is "activated" (matched).
// Returns a Set of "r,c" cells. May trigger chain activations of other power tiles
// it touches (those go in the chained set).
function totPowerActivate(board, r, c, lockedCells, alreadyActivated) {
  const cleared = new Set();
  const chained = new Set(); // power tiles that get activated by this one
  const tile = board[r] && board[r][c];
  if (!tile || !tile.power || alreadyActivated.has(`${r},${c}`)) return { cleared, chained };
  const power = tile.power;
  alreadyActivated.add(`${r},${c}`);

  if (power === 'stripe-h') {
    // Clear entire row
    for (let cc = 0; cc < COLS; cc++) {
      const key = `${r},${cc}`;
      if (lockedCells && lockedCells.has(key)) continue;
      cleared.add(key);
      const t = board[r][cc];
      if (t && t.power && !alreadyActivated.has(key)) chained.add(key);
    }
  } else if (power === 'stripe-v') {
    // Clear entire column
    for (let rr = 0; rr < ROWS; rr++) {
      const key = `${rr},${c}`;
      if (lockedCells && lockedCells.has(key)) continue;
      cleared.add(key);
      const t = board[rr][c];
      if (t && t.power && !alreadyActivated.has(key)) chained.add(key);
    }
  } else if (power === 'wrapped') {
    // 3x3 area explosion (twice in CC; we do once for simplicity but powerful)
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const rr = r + dr, cc = c + dc;
        if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS) continue;
        const key = `${rr},${cc}`;
        if (lockedCells && lockedCells.has(key)) continue;
        cleared.add(key);
        const t = board[rr][cc];
        if (t && t.power && !alreadyActivated.has(key)) chained.add(key);
      }
    }
  } else if (power === 'colorbomb') {
    // Clear ALL tiles of the most common icon on the board (or matched icon if matched with normal tile)
    // For simplicity: clear the most common icon
    const counts = {};
    for (let rr = 0; rr < ROWS; rr++) {
      for (let cc = 0; cc < COLS; cc++) {
        const t = board[rr][cc];
        if (t) counts[t.icon] = (counts[t.icon] || 0) + 1;
      }
    }
    let topIcon = null, topCount = 0;
    for (const [icon, count] of Object.entries(counts)) {
      if (count > topCount) { topIcon = icon; topCount = count; }
    }
    for (let rr = 0; rr < ROWS; rr++) {
      for (let cc = 0; cc < COLS; cc++) {
        const t = board[rr][cc];
        if (!t) continue;
        const key = `${rr},${cc}`;
        if (lockedCells && lockedCells.has(key)) continue;
        if (t.icon === topIcon) {
          cleared.add(key);
          if (t.power && !alreadyActivated.has(key)) chained.add(key);
        }
      }
    }
  }
  return { cleared, chained };
}

// Apply gravity: existing tiles fall to fill gaps (keep their IDs!), new tiles spawn at top with fresh IDs.
// Returns { board, fellFrom } where fellFrom is a Map of id -> previous row (for animation).
// `cursedChance`: probability (0..1) that a freshly-spawned tile is cursed (for level-based difficulty).
function totGravityAndRefill(board, cursedChance = 0) {
  const newBoard = board.map(row => row.map(cell => cell ? {...cell} : null));
  const fellFrom = new Map(); // id -> {fromR, toR}
  for (let c = 0; c < COLS; c++) {
    let writeRow = ROWS - 1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (newBoard[r][c]) {
        if (writeRow !== r) {
          fellFrom.set(newBoard[r][c].id, { fromR: r, toR: writeRow });
          newBoard[writeRow][c] = newBoard[r][c];
          newBoard[r][c] = null;
        }
        writeRow--;
      }
    }
    // Fill empty cells from the top. Mild bias toward chains so 4-in-a-row and 5-in-a-row
    // happen more often than pure random, but not so much that the board cascades forever.
    let topSpawnRow = -1;
    let lastSpawnedIcon = null;
    for (let r = writeRow; r >= 0; r--) {
      const cursed = totRollCursed(cursedChance);
      let icon;
      // 15% chance: copy the icon directly below this empty cell (encourages vertical chains)
      // 10% chance: copy the icon we just spawned above (continues column run)
      // Otherwise: random
      const roll = Math.random();
      const belowR = r + 1;
      const belowIcon = (belowR < ROWS && newBoard[belowR] && newBoard[belowR][c]) ? newBoard[belowR][c].icon : null;
      // Anti-pre-match: if copying would create an instant 3-match (which causes free cascades),
      // skip the bias for this tile — only add bias when the copy WOULDN'T trigger a free clear.
      const wouldPreMatch = (copyIcon) => {
        if (!copyIcon) return false;
        // Check if placing copyIcon here would form 3+ vertical match below
        let down = 0;
        for (let rr = r + 1; rr < ROWS && newBoard[rr] && newBoard[rr][c] && newBoard[rr][c].icon === copyIcon; rr++) down++;
        if (down >= 2) return true;
        return false;
      };
      if (roll < 0.15 && belowIcon && !wouldPreMatch(belowIcon)) {
        icon = belowIcon;
      } else if (roll < 0.25 && lastSpawnedIcon && !wouldPreMatch(lastSpawnedIcon)) {
        icon = lastSpawnedIcon;
      } else {
        icon = totRandIcon();
      }
      lastSpawnedIcon = icon;
      const tile = totMakeTile(icon, cursed);
      newBoard[r][c] = tile;
      fellFrom.set(tile.id, { fromR: topSpawnRow, toR: r });
      topSpawnRow--;
    }
  }
  return { board: newBoard, fellFrom };
}

// Check if any swap would create a match. Returns true if at least one valid move exists.
function totHasValidMove(board, lockedCells = null) {
  const isLocked = lockedCells ? (r, c) => lockedCells.has(`${r},${c}`) : () => false;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (isLocked(r, c)) continue;
      // Try swap right
      if (c < COLS - 1 && !isLocked(r, c + 1)) {
        const test = board.map(row => [...row]);
        [test[r][c], test[r][c+1]] = [test[r][c+1], test[r][c]];
        if (totFindMatches(test, lockedCells).size > 0) return true;
      }
      // Try swap down
      if (r < ROWS - 1 && !isLocked(r + 1, c)) {
        const test = board.map(row => [...row]);
        [test[r][c], test[r+1][c]] = [test[r+1][c], test[r][c]];
        if (totFindMatches(test, lockedCells).size > 0) return true;
      }
    }
  }
  return false;
}

// Find A valid swap and return the two cells to hint at — used for idle hint pulse
function totFindHintMove(board, lockedCells = null) {
  const isLocked = lockedCells ? (r, c) => lockedCells.has(`${r},${c}`) : () => false;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (isLocked(r, c)) continue;
      if (c < COLS - 1 && !isLocked(r, c + 1)) {
        const test = board.map(row => [...row]);
        [test[r][c], test[r][c+1]] = [test[r][c+1], test[r][c]];
        if (totFindMatches(test, lockedCells).size > 0) return [{r, c}, {r, c: c+1}];
      }
      if (r < ROWS - 1 && !isLocked(r + 1, c)) {
        const test = board.map(row => [...row]);
        [test[r][c], test[r+1][c]] = [test[r+1][c], test[r][c]];
        if (totFindMatches(test, lockedCells).size > 0) return [{r, c}, {r: r+1, c}];
      }
    }
  }
  return null;
}

// Reshuffle the board until at least one valid move exists and no pre-existing matches
function totReshuffle(board) {
  // Flatten icon strings (we'll re-make tile objects with new IDs after)
  const flatIcons = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      flatIcons.push(board[r][c] ? board[r][c].icon : totRandIcon());
    }
  }
  let attempts = 0;
  while (attempts < 50) {
    // Fisher-Yates shuffle
    for (let i = flatIcons.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [flatIcons[i], flatIcons[j]] = [flatIcons[j], flatIcons[i]];
    }
    const newBoard = [];
    for (let r = 0; r < ROWS; r++) {
      const row = [];
      for (let c = 0; c < COLS; c++) row.push(totMakeTile(flatIcons[r * COLS + c]));
      newBoard.push(row);
    }
    if (totFindMatches(newBoard).size === 0 && totHasValidMove(newBoard)) return newBoard;
    attempts++;
  }
  return totBuildBoard();
}


// Background video wallpaper for Trick or Treat — dual-video crossfade loop.
// Mounted as first child of each TOT phase container. Renders at zIndex 0
// behind all UI. Falls back silently if the video file is missing.
function TotVideoBg({ opacity = 0.6 }: { opacity?: number }) {
  const vidA = useRef<HTMLVideoElement>(null);
  const vidB = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState<"A" | "B">("A");

  useEffect(() => {
    const a = vidA.current;
    const b = vidB.current;
    if (!a || !b) return;
    const FADE = 1.0; // seconds of crossfade

    const makeHandler = (which: "A" | "B") => () => {
      const self = which === "A" ? a : b;
      const other = which === "A" ? b : a;
      if (!self.duration || isNaN(self.duration)) return;
      const remaining = self.duration - self.currentTime;
      if (remaining <= FADE && other.paused) {
        try { other.currentTime = 0; } catch (e) {}
        other.play().catch(() => {});
        setActive(which === "A" ? "B" : "A");
      }
    };

    const onA = makeHandler("A");
    const onB = makeHandler("B");
    a.addEventListener("timeupdate", onA);
    b.addEventListener("timeupdate", onB);
    a.play().catch(() => {});

    return () => {
      a.removeEventListener("timeupdate", onA);
      b.removeEventListener("timeupdate", onB);
      try { a.pause(); b.pause(); } catch (e) {}
    };
  }, []);

  const baseStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "left center",
    zIndex: 0,
    pointerEvents: "none",
    transition: "opacity 1s ease-in-out",
  };

  return (
    <>
      <video
        ref={vidA}
        muted
        playsInline
        preload="auto"
        src="/videos/totbg.mp4"
        style={{ ...baseStyle, opacity: active === "A" ? opacity : 0 }}
      />
      <video
        ref={vidB}
        muted
        playsInline
        preload="auto"
        src="/videos/totbg.mp4"
        style={{ ...baseStyle, opacity: active === "B" ? opacity : 0 }}
      />
    </>
  );
}


function TrickOrTreatMassacre({ onExit, onHighScore, highScore }) {
  const [phase, setPhase] = useState("intro");
  const [levelIdx, setLevelIdx] = useState(0);
  const [board, setBoard] = useState([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [maskPositions, setMaskPositions] = useState([]); // [{r, c, slasherIdx, hp, survivedTurns}]
  // Locked cells where a slasher passed through. Map of "r,c" -> moveExpiresAt
  const [bloodTrails, setBloodTrails] = useState(new Map());
  // Active power-tile fire visuals — array of { r, c, power, key }
  const [powerFires, setPowerFires] = useState([]);
  const [slasherCycle, setSlasherCycle] = useState(0); // index into TOT_SLASHER_POOL for next respawn
  const [respawnAt, setRespawnAt] = useState(null); // {moveCount} — when to respawn next mask
  const [selectedTile, setSelectedTile] = useState(null); // {r, c}
  const [animating, setAnimating] = useState(false);
  const [clearingTiles, setClearingTiles] = useState(new Set()); // {r,c} keys currently exploding
  const [fellFrom, setFellFrom] = useState(new Map()); // tile.id -> {fromR, toR} for animating falls
  const [hintCells, setHintCells] = useState(null); // [{r,c},{r,c}] cells to pulse as a hint
  const [musicOn, setMusicOn] = useState(true);
  const [bigCelebration, setBigCelebration] = useState(null); // {key, points} for 5+ match overlay
  const [killCelebration, setKillCelebration] = useState(null); // {key} for slasher kill overlay
  // Blood splatter particles when slashers die — array of { key, x, y, particles: [{angle, distance, size, lifetime}] }
  const [bloodSplats, setBloodSplats] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0); // seconds remaining (legacy, may not be used)
  const [comboText, setComboText] = useState(null); // {text, x, y, key}
  const [shakeUntil, setShakeUntil] = useState(0);
  const [levelComplete, setLevelComplete] = useState(false);
  const [progress, setProgress] = useState({ unlocked: 1, stars: {}, bestScores: {} });
  // NEW: objective tracking
  const [movesLeft, setMovesLeft] = useState(0);
  const [killCount, setKillCount] = useState(0); // slashers killed this level
  const [collectCount, setCollectCount] = useState(0); // featured-icon tiles collected this level
  const [survivedMoves, setSurvivedMoves] = useState(0); // moves survived this level
  // Floating "+200" / "+15s" / "+1 KILL" texts that fly up from a board cell
  const [floaters, setFloaters] = useState([]); // [{key, text, color, x, y}]
  // Birth animation for power tiles being created — { r, c, power, key }
  const [powerBirths, setPowerBirths] = useState([]);
  // Slow-mo freeze flag during power tile birth
  const [freezing, setFreezing] = useState(false);
  // End-of-level finale: array of cells flashing as auto-fired
  const [finaleFires, setFinaleFires] = useState([]);
  // Featured icon for "collect" objectives — which icon counts toward the goal
  const [featuredIcon, setFeaturedIcon] = useState(null);
  // Refs that mirror state — used inside tryMatch (which has empty dep array, so closures are stale)
  const featuredIconRef = useRef(null);
  const bloodTrailsRef = useRef(new Map());
  useEffect(() => { featuredIconRef.current = featuredIcon; }, [featuredIcon]);
  useEffect(() => { bloodTrailsRef.current = bloodTrails; }, [bloodTrails]);

  // Load saved progress on mount
  useEffect(() => {
    let cancelled = false;
    totLoadProgress().then(p => { if (!cancelled) setProgress(p); });
    return () => { cancelled = true; };
  }, []);

  // Floaters auto-expire after 1.2s — remove from state so they don't pile up
  useEffect(() => {
    if (floaters.length === 0) return;
    const t = setTimeout(() => setFloaters(f => f.slice(Math.max(0, f.length - 6))), 1200);
    return () => clearTimeout(t);
  }, [floaters]);

  const lvl = TOT_LEVELS[levelIdx];

  const startLevel = (idx) => {
    setLevelIdx(idx);
    let newBoard = totBuildBoard();
    if (!totHasValidMove(newBoard)) newBoard = totReshuffle(newBoard);
    setBoard(newBoard);
    setScore(0);
    setMoves(0);
    setLevelComplete(false);
    setSelectedTile(null);
    setAnimating(false);
    setRespawnAt(null);
    const lvlConfig = TOT_LEVELS[idx];
    setMovesLeft(lvlConfig.moveBudget);
    setKillCount(0);
    setCollectCount(0);
    setSurvivedMoves(0);
    setFloaters([]);
    setPowerBirths([]);
    setPowerFires([]);
    setFinaleFires([]);
    // For collect objectives, the featured icon is always the pumpkin (matches the 🎃 label)
    if (lvlConfig.objective && lvlConfig.objective.type === 'collect') {
      setFeaturedIcon("pumpkin");
    } else {
      setFeaturedIcon(null);
    }
    const numSpawn = lvlConfig.tripleSpawn ? 3 : lvlConfig.dualSpawn ? 2 : 1;
    const spawnCols = [];
    while (spawnCols.length < numSpawn) {
      const c = Math.floor(Math.random() * COLS);
      if (!spawnCols.includes(c)) spawnCols.push(c);
    }
    const startHP = lvlConfig.slasherHP || 1;
    setMaskPositions(spawnCols.map((c, i) => ({ r: 0, c, id: i, slasherIdx: 0, hp: startHP, maxHp: startHP, survivedTurns: 0 })));
    setBloodTrails(new Map());
    setSlasherCycle(0);
    setPhase("playing");
    try { GameSFX.tone(523, 0.1, 'sine', 0.1); GameSFX.tone(659, 0.12, 'sine', 0.1); } catch(e){}
  };

  const nextLevel = () => {
    if (levelIdx >= TOT_LEVELS.length - 1) {
      setPhase("won_game");
      try {
        if (typeof onHighScore === "function") onHighScore(score);
      } catch(e){}
    } else {
      startLevel(levelIdx + 1);
    }
  };

  const tryMatch = useCallback((startBoard, masksIn, swapPos = null) => {
    let workingBoard = startBoard.map(r => [...r]);
    let totalCleared = 0;
    let cascades = 0;
    let masks = masksIn.map(m => ({...m}));
    // Track whether we've already used the swapPos for power-tile creation
    // (only the FIRST cascade uses it; subsequent cascades create at center)
    let activeSwapPos = swapPos;

    const step = () => {
      // Combine blood trails AND slasher cells as locked cells — neither can participate in matches
      const lockedCells = new Map(bloodTrailsRef.current);
      for (const m of masks) lockedCells.set(`${m.r},${m.c}`, true);
      const matched = totFindMatches(workingBoard, lockedCells);
      if (matched.size === 0) {
        // No more matches — finalize
        // Check if there's any valid move; if not, reshuffle and notify the player
        if (!totHasValidMove(workingBoard)) {
          const reshuffled = totReshuffle(workingBoard);
          workingBoard = reshuffled;
          try { GameSFX.tone(330, 0.08, 'sine', 0.10); GameSFX.tone(440, 0.10, 'sine', 0.10); GameSFX.tone(523, 0.12, 'sine', 0.10); } catch(e){}
          setComboText({ text: "RESHUFFLE", key: Date.now() });
          setTimeout(() => setComboText(null), 1100);
        }
        setBoard(workingBoard);
        setMaskPositions(masks);
        setAnimating(false);
        if (cascades > 0) {
          // Show combo text on final cascade
          if (cascades >= 2) {
            setComboText({ text: `${cascades + 1}x COMBO`, key: Date.now() });
            setTimeout(() => setComboText(null), 1200);
          }
        }
        return;
      }

      // Score for this cascade
      const cascadeBonus = cascades > 0 ? cascades + 1 : 1;
      const points = matched.size * 20 * cascadeBonus;
      totalCleared += matched.size;
      cascades++;
      // Each cascade beyond the first burns 1 move from the budget AND counts as a survive move.
      // So one swap that creates a 3x cascade burns 3 moves total. The original swap is already
      // counted in the swap handler (movesLeft -1, survivedMoves +1).
      if (cascades > 1) {
        setMovesLeft(m => Math.max(0, m - 1));
        setSurvivedMoves(s => s + 1);
      }
      setScore(s => s + points);
      // Floating score text rises from a central matched cell (use first match)
      if (matched.size > 0) {
        const firstKey = Array.from(matched)[Math.floor(matched.size / 2)];
        const [fr, fc] = firstKey.split(',').map(Number);
        setFloaters(prev => [...prev, {
          key: Date.now() + Math.random(),
          text: `+${points}`,
          color: cascades > 1 ? "#ffd700" : "#ffaa44",
          x: fc, y: fr,
        }]);
      }

      // ── COMPLEX DAMAGE SYSTEM ──
      // Find each individual match group (so we know its size for chain damage)
      const groups = totFindMatchGroups(workingBoard, lockedCells);
      // Classify match shapes for power-tile creation
      const { upgrades, consumedKeys } = totClassifyMatches(groups, activeSwapPos, matched);
      // Cells that turn into power tiles are NOT cleared this turn — remove from matched set
      let effectiveMatched = new Set();
      for (const k of matched) {
        if (!consumedKeys.has(k)) effectiveMatched.add(k);
      }
      // EXPAND the cleared set by activating any power tiles that were caught in the match.
      // A power tile in the matched set "fires" — clearing additional cells (row/col/area/color).
      const activatedPowers = new Set();
      const toActivate = [];
      for (const k of effectiveMatched) {
        const [r, c] = k.split(',').map(Number);
        const t = workingBoard[r] && workingBoard[r][c];
        if (t && t.power) toActivate.push(k);
      }
      // Recursively activate (chain reactions)
      while (toActivate.length > 0) {
        const k = toActivate.shift();
        if (activatedPowers.has(k)) continue;
        const [r, c] = k.split(',').map(Number);
        const result = totPowerActivate(workingBoard, r, c, lockedCells, activatedPowers);
        for (const cell of result.cleared) effectiveMatched.add(cell);
        for (const chained of result.chained) {
          if (!activatedPowers.has(chained)) toActivate.push(chained);
        }
      }
      // After power activations, remove consumedKeys again (in case a power tile activation
      // tried to clear a cell that's becoming a power tile)
      for (const k of consumedKeys) effectiveMatched.delete(k);
      // Replace `matched` with the expanded set for the rest of this cascade
      const finalMatched = effectiveMatched;
      // Detect cursed tiles in any cleared cell — they spawn a new slasher when matched
      // Also count featured-icon matches for collect objectives.
      let cursedMatchCount = 0;
      let featuredCollectCount = 0;
      const fIcon = featuredIconRef.current;
      // DEBUG: log so we can see what's happening
      const matchedIcons = [];
      for (const m of finalMatched) {
        const [r, c] = m.split(',').map(Number);
        const tile = workingBoard[r] && workingBoard[r][c];
        if (tile) matchedIcons.push(tile.icon);
        if (tile && tile.cursed) cursedMatchCount++;
        if (tile && fIcon && tile.icon === fIcon) featuredCollectCount++;
      }
      try {
        if (typeof window !== 'undefined') {
          window.__totDebug = window.__totDebug || [];
          window.__totDebug.push({ fIcon, matchedIcons, featuredCollectCount });
          console.log('[TOT collect]', { fIcon, matchedIcons, featuredCollectCount });
        }
      } catch(e){}
      if (featuredCollectCount > 0) {
        setCollectCount(c => c + featuredCollectCount);
        setFloaters(prev => [...prev, {
          key: Date.now() + Math.random(),
          text: `+${featuredCollectCount} 🎃`,
          color: "#ff8c1a",
          x: 4, y: 1,
        }]);
      }

      // For each slasher, compute damage from all groups
      const newMasks = [];
      let killedAny = false;
      for (const m of masks) {
        let damage = 0;
        // Each matching group contributes damage based on size + proximity to this slasher
        for (const g of groups) {
          // Strict proximity: a match counts ONLY if it contains a cell that is directly
          // adjacent to the slasher in one of the four cardinal directions (up/down/left/right).
          // No same-column-but-far, no diagonals.
          const inRange = g.cells.some(({r, c}) => {
            const dr = Math.abs(r - m.r);
            const dc = Math.abs(c - m.c);
            return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
          });
          if (!inRange) continue;
          // Chain damage: 3-match=1, 4-match=2, 5+=3 (and 5+ insta-kills)
          if (g.size >= 5) {
            damage = Math.max(damage, 999); // insta-kill
          } else if (g.size === 4) {
            damage += 2;
          } else {
            damage += 1;
          }
        }
        // POWER TILE BLAST DAMAGE: if a power-tile activation cleared a cell in the slasher's column
        // or directly adjacent, that's a major hit. Stripe through the column = guaranteed kill.
        if (activatedPowers.size > 0) {
          for (const ak of activatedPowers) {
            const [pr, pc] = ak.split(',').map(Number);
            const t = workingBoard[pr] && workingBoard[pr][pc];
            if (!t || !t.power) continue;
            // Stripe horizontal hitting slasher's row → kill
            if (t.power === 'stripe-h' && pr === m.r) damage = Math.max(damage, 999);
            // Stripe vertical hitting slasher's column → kill
            else if (t.power === 'stripe-v' && pc === m.c) damage = Math.max(damage, 999);
            // Wrapped within 1 cell of slasher → kill
            else if (t.power === 'wrapped' && Math.abs(pr - m.r) <= 1 && Math.abs(pc - m.c) <= 1) damage = Math.max(damage, 999);
            // Color bomb always hits all slashers (it cleared half the board)
            else if (t.power === 'colorbomb') damage = Math.max(damage, 999);
          }
        }
        const newHp = m.hp - damage;
        if (newHp <= 0) {
          // Slasher killed
          setScore(s => s + 200);
          setKillCount(k => k + 1);
          // Floating "+200" + "+1 KILL" text rises from slasher position
          setFloaters(prev => [
            ...prev,
            { key: Date.now() + Math.random(), text: "+200", color: "#ffd700", x: m.c, y: m.r },
            { key: Date.now() + Math.random() + 0.1, text: "KILL!", color: "#ff3030", x: m.c, y: m.r },
          ]);
          killedAny = true;
          try { GameSFX.noise(0.18, 0.22); GameSFX.sweep(660, 110, 0.4, 'sawtooth', 0.18); GameSFX.sweep(440, 80, 0.5, 'square', 0.12); } catch(e){}
          setShakeUntil(Date.now() + 700);
          setKillCelebration({ key: Date.now() + Math.random(), x: m.c, y: m.r });
          setTimeout(() => setKillCelebration(null), 1800);
          // BLOOD SPLATTER — generate ~24 particles flying outward from kill point
          const splatKey = Date.now() + Math.random();
          const particles = [];
          const numDrops = 24 + Math.floor(Math.random() * 8);
          for (let i = 0; i < numDrops; i++) {
            const angle = (i / numDrops) * 360 + Math.random() * 30;
            // Mix of close splatter and long-distance droplets
            const distance = 30 + Math.random() * 110;
            const size = 6 + Math.random() * 14;
            const dur = 0.7 + Math.random() * 0.5;
            const delay = Math.random() * 0.1;
            particles.push({ angle, distance, size, dur, delay, id: i });
          }
          // Add a few BIG chunks
          for (let i = 0; i < 4; i++) {
            const angle = Math.random() * 360;
            particles.push({
              angle, distance: 50 + Math.random() * 60, size: 18 + Math.random() * 10,
              dur: 0.9, delay: 0, id: 100 + i, chunk: true,
            });
          }
          setBloodSplats(prev => [...prev, { key: splatKey, x: m.c, y: m.r, particles }]);
          setTimeout(() => {
            setBloodSplats(prev => prev.filter(s => s.key !== splatKey));
          }, 1600);
          try {
            const ctx = GameSFX.ctx();
            if (ctx) {
              const t2 = ctx.currentTime;
              GameSFX.tone(60, 0.4, 'sine', 0.22, t2);
              GameSFX.tone(90, 0.3, 'sawtooth', 0.16, t2);
              [330, 415, 523, 659].forEach((f, i) => GameSFX.tone(f, 0.25, 'sawtooth', 0.14, t2 + 0.1 + i * 0.06));
              setTimeout(() => {
                try { GameSFX.tone(1568, 0.3, 'sine', 0.14); GameSFX.tone(2093, 0.4, 'sine', 0.12); } catch(e){}
              }, 350);
            }
          } catch(e){}
        } else if (damage > 0) {
          // Slasher hit but not killed — show damage flash + sound
          newMasks.push({ ...m, hp: newHp });
          try { GameSFX.tone(220, 0.08, 'sawtooth', 0.18); GameSFX.tone(165, 0.12, 'square', 0.14); } catch(e){}
          setShakeUntil(Date.now() + 200);
        } else {
          // No damage — slasher unscathed
          newMasks.push(m);
        }
      }
      // Cursed tile matched — spawn an extra slasher (act 2+)
      if (cursedMatchCount > 0 && lvl.cursedTiles) {
        const startHP = lvl.slasherHP || 1;
        for (let k = 0; k < cursedMatchCount; k++) {
          if (newMasks.length >= 5) break; // cap to avoid total chaos
          newMasks.push({ r: 0, c: Math.floor(Math.random() * COLS), id: Date.now() + Math.random() + k, slasherIdx: 0, hp: startHP, maxHp: startHP, survivedTurns: 0 });
        }
        try { GameSFX.tone(80, 0.4, 'sawtooth', 0.22); GameSFX.tone(110, 0.5, 'square', 0.16); } catch(e){}
        setShakeUntil(Date.now() + 350);
        setComboText({ text: "💀 CURSED! 💀", key: Date.now() });
        setTimeout(() => setComboText(null), 1300);
      }
      masks = newMasks;
      // Schedule respawn 2 moves after death
      if (killedAny && masks.length === 0) {
        setRespawnAt(moves + 2);
      }

      // STEP 1: trigger explode animation on matched tiles (they stay in place, animate out)
      setClearingTiles(finalMatched);
      // 5+ match = SPECTACULAR: massive bonus + screen overlay + extra effects
      // (or any single group of 5+, regardless of expanded clear set from power tiles)
      if (matched.size >= 5 || groups.some(g => g.size >= 5)) {
        const bonus = 1000 + (Math.max(matched.size, 5) - 5) * 500;
        setScore(s => s + bonus);
        setBigCelebration({ key: Date.now(), points: bonus, size: matched.size });
        setShakeUntil(Date.now() + 700);
        setTimeout(() => setBigCelebration(null), 2400);
      }
      // Show stripe-fire animation for any activated stripe power tile
      if (activatedPowers.size > 0) {
        const fires = [];
        for (const ak of activatedPowers) {
          const [pr, pc] = ak.split(',').map(Number);
          const t = workingBoard[pr] && workingBoard[pr][pc];
          if (t && t.power) fires.push({ r: pr, c: pc, power: t.power });
        }
        if (fires.length > 0) {
          setPowerFires(fires.map(f => ({ ...f, key: Date.now() + Math.random() })));
          setTimeout(() => setPowerFires([]), 600);
          // Distinctive activation sounds
          try {
            for (const f of fires) {
              if (f.power === 'stripe-h' || f.power === 'stripe-v') {
                GameSFX.sweep(220, 1800, 0.35, 'sawtooth', 0.18);
              } else if (f.power === 'wrapped') {
                GameSFX.noise(0.18, 0.25);
                GameSFX.tone(80, 0.3, 'sawtooth', 0.22);
              } else if (f.power === 'colorbomb') {
                GameSFX.noise(0.20, 0.32);                                  // crash
                GameSFX.tone(55, 0.50, 'sine', 0.30);                       // sub-bass
                GameSFX.tone(110, 0.30, 'square', 0.22);                    // hit body
                GameSFX.sweep(200, 3000, 0.6, 'sine', 0.28);                // ascending sweep
                [659, 880, 1175, 1568].forEach((freq, i) =>
                  GameSFX.tone(freq, 0.40, 'triangle', 0.22, GameSFX.ctx().currentTime + 0.08 + i * 0.06)
                );
              }
            }
          } catch(e){}
        }
      }
      // Tiered satisfying sounds — bigger matches feel like a payoff
      try {
        const ctx = GameSFX.ctx(); if (ctx) {
          const t = ctx.currentTime;
          if (matched.size >= 5) {
            [523, 659, 784, 1047, 1319, 1568, 2093].forEach((f, i) => GameSFX.tone(f, 0.18, 'square', 0.16, t + i * 0.05));
            for (let i = 0; i < 6; i++) GameSFX.tone(2000 + i * 400 + Math.random() * 400, 0.08, 'sine', 0.08, t + 0.15 + i * 0.04);
            GameSFX.tone(80, 0.3, 'sine', 0.18, t);
            setTimeout(() => {
              try {
                const t2 = ctx.currentTime;
                [1047, 1319, 1568, 2093, 2637].forEach((f, i) => GameSFX.tone(f, 0.20, 'sine', 0.13, t2 + i * 0.07));
              } catch(e){}
            }, 500);
          } else if (matched.size >= 4) {
            [659, 784, 988, 1319].forEach((f, i) => GameSFX.tone(f, 0.14, 'square', 0.13, t + i * 0.04));
            for (let i = 0; i < 3; i++) GameSFX.tone(1800 + i * 300, 0.06, 'sine', 0.07, t + 0.12 + i * 0.04);
            GameSFX.tone(110, 0.18, 'sine', 0.14, t);
          } else {
            GameSFX.tone(660 + cascades * 80, 0.10, 'square', 0.13, t);
            GameSFX.tone(880 + cascades * 60, 0.08, 'square', 0.10, t + 0.04);
          }
        }
      } catch(e){}

      // STEP 2: after explode, actually clear them AND create power tiles at consumed cells
      setTimeout(() => {
        for (const key of finalMatched) {
          const [r, c] = key.split(',').map(Number);
          workingBoard[r][c] = null;
        }
        // Convert consumed cells into power tiles (they survive the clear and gain power)
        for (const u of upgrades) {
          const existing = startBoard[u.r] && startBoard[u.r][u.c];
          const icon = existing ? existing.icon : totRandIcon();
          workingBoard[u.r][u.c] = totMakeTile(icon, false, u.power);
        }
        // POWER TILE BIRTH animation — slow-mo zoom + sparkle implosion when power tiles appear
        if (upgrades.length > 0) {
          setPowerBirths(upgrades.map(u => ({ ...u, key: Date.now() + Math.random() })));
          setFreezing(true);
          // Birth sound — different per type
          try {
            for (const u of upgrades) {
              const ctx = GameSFX.ctx();
              if (!ctx) continue;
              const t0 = ctx.currentTime;
              if (u.power === 'colorbomb') {
                // BIG REWARD — orchestral hit + ascending sweep + bell stack + sustained chord
                GameSFX.tone(55,   0.50, 'sine',     0.32, t0);          // sub-bass thump
                GameSFX.tone(110,  0.30, 'square',   0.22, t0);          // body of the hit
                GameSFX.noise(0.18, 0.30);                                // crash
                GameSFX.sweep(200, 3200, 0.7, 'sine', 0.30, t0 + 0.05);  // big rainbow rise
                // Layered ascending bell sequence
                [523, 659, 784, 1047, 1319, 1568, 2093].forEach((f, i) =>
                  GameSFX.tone(f, 0.30, 'triangle', 0.26, t0 + 0.10 + i * 0.07)
                );
                // Sustained victory chord on top — held while sweep finishes
                GameSFX.tone(1047, 1.20, 'sine',     0.20, t0 + 0.55);
                GameSFX.tone(1319, 1.20, 'triangle', 0.18, t0 + 0.55);
                GameSFX.tone(1568, 1.20, 'sine',     0.16, t0 + 0.55);
              } else if (u.power === 'wrapped') {
                GameSFX.sweep(110, 880, 0.4, 'sawtooth', 0.18, t0);
                GameSFX.tone(440, 0.2, 'square', 0.15, t0 + 0.12);
              } else {
                // Stripe
                GameSFX.sweep(330, 1200, 0.3, 'square', 0.16, t0);
                GameSFX.tone(880, 0.12, 'sine', 0.13, t0 + 0.05);
              }
            }
          } catch(e){}
          setTimeout(() => {
            setPowerBirths([]);
            setFreezing(false);
          }, 600);
        }
        setBoard(workingBoard.map(r => [...r]));
        setClearingTiles(new Set());
        activeSwapPos = null;

        // STEP 3: gravity + refill — track which tiles fell from where so we can animate
        setTimeout(() => {
          const grav = totGravityAndRefill(workingBoard, lvl.cursedTiles ? lvl.cursedChance : 0);
          workingBoard = grav.board;
          setFellFrom(grav.fellFrom);
          setBoard(workingBoard.map(r => [...r]));
          // Single soft note when tiles land — timed to coincide with the visual landing
          if (grav.fellFrom.size > 0) {
            setTimeout(() => {
              try { GameSFX.tone(523, 0.10, 'sine', 0.10); } catch(e){}
            }, 380);
          }
          // Wait long enough for the fall animation to mostly complete before next cascade
          setTimeout(() => {
            setFellFrom(new Map()); // Clear so subsequent renders don't re-animate
            step();
          }, 480);
        }, 80);
      }, 320);
    };

    step();
  }, []);

  const swapTiles = (r1, c1, r2, c2) => {
    if (animating) return;
    if (Math.abs(r1 - r2) + Math.abs(c1 - c2) !== 1) return; // only adjacent
    const newBoard = board.map(r => [...r]);
    [newBoard[r1][c1], newBoard[r2][c2]] = [newBoard[r2][c2], newBoard[r1][c1]];

    // SPECIAL: Color bomb swap. If either swapped tile is a colorbomb, the swap is ALWAYS valid
    // and triggers the colorbomb to activate. Target icon = the icon of the OTHER swapped tile.
    // If both are colorbombs, that's nuclear — clear the entire board.
    const a = newBoard[r1][c1];
    const b = newBoard[r2][c2];
    const aIsCB = a && a.power === 'colorbomb';
    const bIsCB = b && b.power === 'colorbomb';

    // SPECIAL: Two non-colorbomb power tiles swapped — both detonate at once (a "combo").
    // E.g. stripe + stripe = clears row AND column. Wrapped + wrapped = double 3x3 explosion.
    // Stripe + wrapped = both fire. Anything-with-anything triggers — no normal match required.
    const aIsPower = a && a.power && !aIsCB;
    const bIsPower = b && b.power && !bIsCB;
    if (!aIsCB && !bIsCB && aIsPower && bIsPower) {
      try { GameSFX.tone(660, 0.06, 'sine', 0.10); GameSFX.tone(990, 0.08, 'sine', 0.09); } catch(e){}
      setAnimating(true);
      setBoard(newBoard);
      const newMoveCount = moves + 1;
      setMoves(newMoveCount);
      setMovesLeft(m => Math.max(0, m - 1));
      setSurvivedMoves(s => s + 1);
      setTimeout(() => {
        // Activate both power tiles, accumulating their cleared cells
        const cleared = new Set();
        const activated = new Set();
        // Helper to expand clears from a power tile at (pr, pc) given its tile object
        const fire = (pr, pc, t) => {
          activated.add(`${pr},${pc}`);
          if (t.power === 'stripe-h') {
            for (let c = 0; c < COLS; c++) cleared.add(`${pr},${c}`);
          } else if (t.power === 'stripe-v') {
            for (let r = 0; r < ROWS; r++) cleared.add(`${r},${pc}`);
          } else if (t.power === 'wrapped') {
            // Wrapped fires twice in normal play, but for the combo we just do a 5x5 to keep it big
            for (let dr = -2; dr <= 2; dr++) {
              for (let dc = -2; dc <= 2; dc++) {
                const rr = pr + dr, cc = pc + dc;
                if (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS) cleared.add(`${rr},${cc}`);
              }
            }
          }
        };
        fire(r1, c1, a);
        fire(r2, c2, b);
        // Visual effects for both fires
        const fires = [
          { r: r1, c: c1, power: a.power, key: Date.now() },
          { r: r2, c: c2, power: b.power, key: Date.now() + 1 },
        ];
        setPowerFires(fires);
        setTimeout(() => setPowerFires([]), 600);
        try { GameSFX.sweep(220, 1800, 0.4, 'sawtooth', 0.18); GameSFX.noise(0.2, 0.25); } catch(e){}
        setShakeUntil(Date.now() + 350);
        // Damage any slasher whose cell got cleared
        for (const m of maskPositions) {
          if (cleared.has(`${m.r},${m.c}`)) {
            setFloaters(prev => [...prev, { key: Date.now() + Math.random(), text: "+150", color: "#ffd700", x: m.c, y: m.r }]);
          }
        }
        // Count featured-icon tiles cleared for "collect" objectives
        {
          const fIcon = featuredIconRef.current;
          if (fIcon) {
            let collectHere = 0;
            for (const key of cleared) {
              const [r, c] = key.split(',').map(Number);
              const t = newBoard[r] && newBoard[r][c];
              if (t && t.icon === fIcon) collectHere++;
            }
            if (collectHere > 0) {
              setCollectCount(cc => cc + collectHere);
              setFloaters(prev => [...prev, {
                key: Date.now() + Math.random(),
                text: `+${collectHere} 🎃`,
                color: "#ff8c1a",
                x: 4, y: 1,
              }]);
            }
          }
        }
        // Award score per cell cleared
        setScore(s => s + cleared.size * 10);
        // Remove dead slashers (those whose cells got cleared)
        const survivingMasks = maskPositions.filter(m => !cleared.has(`${m.r},${m.c}`));
        const killedHere = maskPositions.length - survivingMasks.length;
        if (killedHere > 0) {
          setKillCount(k => k + killedHere);
          setScore(s => s + 200 * killedHere);
          setMaskPositions(survivingMasks);
          if (survivingMasks.length === 0) setRespawnAt(newMoveCount + 2);
        }
        // Apply the clear
        setClearingTiles(cleared);
        setTimeout(() => {
          for (const key of cleared) {
            const [r, c] = key.split(',').map(Number);
            newBoard[r][c] = null;
          }
          setBoard(newBoard.map(rw => [...rw]));
          setClearingTiles(new Set());
          setTimeout(() => {
            const grav = totGravityAndRefill(newBoard, lvl.cursedTiles ? lvl.cursedChance : 0);
            setFellFrom(grav.fellFrom);
            setBoard(grav.board.map(rw => [...rw]));
            setTimeout(() => {
              setFellFrom(new Map());
              const advanced = advanceMasks(survivingMasks, lvl, newMoveCount);
              setMaskPositions(advanced);
              tryMatch(grav.board, advanced, null);
            }, 500);
          }, 320);
        }, 360);
      }, 200);
      return;
    }

    if (aIsCB || bIsCB) {
      try { GameSFX.tone(880, 0.05, 'sine', 0.08); GameSFX.tone(1100, 0.06, 'sine', 0.07); } catch(e){}
      setAnimating(true);
      setBoard(newBoard);
      const newMoveCount = moves + 1;
      setMoves(newMoveCount);
      setMovesLeft(m => Math.max(0, m - 1));
      setSurvivedMoves(s => s + 1);
      // Determine target icon (the non-colorbomb tile's icon, or null if both are colorbombs)
      const targetIcon = (aIsCB && bIsCB) ? null : (aIsCB ? b.icon : a.icon);
      setTimeout(() => {
        // Clear all tiles of the target icon (or everything if both colorbombs)
        const cleared = new Set();
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            const t = newBoard[r][c];
            if (!t) continue;
            // Skip blood-trailed cells
            if (bloodTrails.has(`${r},${c}`)) continue;
            if (targetIcon === null || t.icon === targetIcon || t.power === 'colorbomb') {
              cleared.add(`${r},${c}`);
            }
          }
        }
        // Big celebration + sound — MASSIVE multi-layered explosion
        try {
          const ctx = GameSFX.ctx();
          if (ctx) {
            const t0 = ctx.currentTime;
            // INITIAL EXPLOSION HIT (layered crash + sub-bass + body)
            GameSFX.noise(0.35, 0.55);                              // big crash burst
            GameSFX.tone(40,   0.80, 'sine',     0.40, t0);         // deep sub-bass thump
            GameSFX.tone(80,   0.60, 'sawtooth', 0.30, t0);         // bass body
            GameSFX.tone(160,  0.40, 'square',   0.25, t0);         // mid punch
            GameSFX.tone(320,  0.30, 'square',   0.20, t0 + 0.02);  // hit tail
            // ASCENDING POWER SWEEPS (multiple layers for richness)
            GameSFX.sweep(120,  3200, 0.80, 'sawtooth', 0.30, t0 + 0.05);
            GameSFX.sweep(220,  2800, 0.70, 'sine',     0.28, t0 + 0.10);
            GameSFX.sweep(440,  3600, 0.60, 'triangle', 0.22, t0 + 0.15);
            // SHIMMERING ASCENDING BELL CASCADE (like fireworks)
            [523, 659, 784, 1047, 1319, 1568, 2093, 2637].forEach((f, i) =>
              GameSFX.tone(f, 0.30, 'triangle', 0.28, t0 + 0.20 + i * 0.05)
            );
            // SUSTAINED VICTORY CHORD ON TOP (held for impact)
            GameSFX.tone(1047, 1.50, 'sine',     0.24, t0 + 0.65);
            GameSFX.tone(1319, 1.50, 'triangle', 0.22, t0 + 0.65);
            GameSFX.tone(1568, 1.50, 'sine',     0.20, t0 + 0.65);
            GameSFX.tone(2093, 1.50, 'sine',     0.16, t0 + 0.65);
            // FINAL BOOM tail
            GameSFX.tone(55, 0.80, 'sine', 0.30, t0 + 1.20);
            GameSFX.noise(0.20, 0.30);
          }
        } catch(e){}
        setShakeUntil(Date.now() + 800);
        setBigCelebration({ key: Date.now(), points: 2000, size: cleared.size });
        setTimeout(() => setBigCelebration(null), 2400);
        setPowerFires([{ r: r2, c: c2, power: 'colorbomb', key: Date.now() }]);
        setTimeout(() => setPowerFires([]), 600);

        // All slashers die from the color bomb
        for (const m of maskPositions) {
          setFloaters(prev => [...prev, {
            key: Date.now() + Math.random(),
            text: "+200",
            color: "#ffd700",
            x: m.c, y: m.r,
          }]);
        }
        if (maskPositions.length > 0) {
          setKillCount(k => k + maskPositions.length);
          setScore(s => s + 200 * maskPositions.length);
          setMaskPositions([]);
          setRespawnAt(newMoveCount + 2);
        }

        // Score bonus for colorbomb activation
        const bonus = 1500 + cleared.size * 30;
        setScore(s => s + bonus);

        // Count featured-icon tiles cleared for "collect" objectives
        {
          const fIcon = featuredIconRef.current;
          if (fIcon) {
            let collectHere = 0;
            for (const key of cleared) {
              const [r, c] = key.split(',').map(Number);
              const t = newBoard[r] && newBoard[r][c];
              if (t && t.icon === fIcon) collectHere++;
            }
            if (collectHere > 0) {
              setCollectCount(cc => cc + collectHere);
              setFloaters(prev => [...prev, {
                key: Date.now() + Math.random(),
                text: `+${collectHere} 🎃`,
                color: "#ff8c1a",
                x: 4, y: 1,
              }]);
            }
          }
        }

        // Apply the clear
        setClearingTiles(cleared);
        setTimeout(() => {
          for (const key of cleared) {
            const [r, c] = key.split(',').map(Number);
            newBoard[r][c] = null;
          }
          setBoard(newBoard.map(r => [...r]));
          setClearingTiles(new Set());
          // Gravity + refill, then continue cascading via tryMatch
          setTimeout(() => {
            const grav = totGravityAndRefill(newBoard, lvl.cursedTiles ? lvl.cursedChance : 0);
            setFellFrom(grav.fellFrom);
            setBoard(grav.board.map(r => [...r]));
            setTimeout(() => {
              setFellFrom(new Map());
              const advanced = advanceMasks(maskPositions, lvl, newMoveCount);
              setMaskPositions(advanced);
              tryMatch(grav.board, advanced, null);
            }, 500);
          }, 320);
        }, 360);
      }, 200);
      return;
    }

    // Build locked cells (slashers + blood trails) — they break runs and can't participate in matches
    const swapLocks = new Map(bloodTrails);
    for (const m of maskPositions) swapLocks.set(`${m.r},${m.c}`, true);
    const matches = totFindMatches(newBoard, swapLocks);
    if (matches.size === 0) {
      // Invalid move — show the swap briefly, then bounce back
      try { GameSFX.tone(220, 0.08, 'sawtooth', 0.10); } catch(e){}
      setAnimating(true);
      setBoard(newBoard);
      setTimeout(() => {
        setBoard(board); // restore original
        setAnimating(false);
        // After the bounce, check if the board still has any valid moves at all.
        // If not (player got stuck), auto-reshuffle so they're never locked out.
        if (!totHasValidMove(board, swapLocks)) {
          const reshuffled = totReshuffle(board);
          setBoard(reshuffled);
          setSelectedTile(null);
          try { GameSFX.tone(330, 0.08, 'sine', 0.10); GameSFX.tone(440, 0.10, 'sine', 0.10); GameSFX.tone(523, 0.12, 'sine', 0.10); } catch(e){}
          setComboText({ text: "RESHUFFLE", key: Date.now() });
          setTimeout(() => setComboText(null), 1100);
        }
      }, 280);
      return;
    }
    try { GameSFX.tone(880, 0.05, 'sine', 0.08); GameSFX.tone(1100, 0.06, 'sine', 0.07); } catch(e){}
    setAnimating(true);
    setBoard(newBoard);
    const newMoveCount = moves + 1;
    setMoves(newMoveCount);
    setMovesLeft(m => Math.max(0, m - 1));
    setSurvivedMoves(s => s + 1);

    // Check for respawn — if we hit the scheduled respawn move, spawn a new slasher
    let respawnedMasks = maskPositions;
    if (respawnAt !== null && newMoveCount >= respawnAt && maskPositions.length === 0) {
      const nextIdx = (slasherCycle + 1) % TOT_SLASHER_POOL.length;
      setSlasherCycle(nextIdx);
      const startHP = lvl.slasherHP || 1;
      const newMask = { r: 0, c: Math.floor(Math.random() * COLS), id: Date.now(), slasherIdx: nextIdx, hp: startHP, maxHp: startHP, survivedTurns: 0 };
      respawnedMasks = [newMask];
      setMaskPositions(respawnedMasks);
      setRespawnAt(null);
      try { GameSFX.tone(110, 0.3, 'sawtooth', 0.18); GameSFX.tone(165, 0.4, 'sawtooth', 0.14); } catch(e){}
      setShakeUntil(Date.now() + 250);
    }

    // Let the swap animation fully play before scoring matches — give it a real beat to register visually
    setTimeout(() => {
      const advanced = advanceMasks(respawnedMasks, lvl, newMoveCount);
      setMaskPositions(advanced);
      // Pass swap target as the swap position — power tiles created by this match
      // will spawn at the player's swap target cell (Candy Crush convention).
      tryMatch(newBoard, advanced, { r: r2, c: c2 });
    }, 420);
  };

  const advanceMasks = (masks, level, moveCount) => {
    let result = masks.map(m => ({...m}));
    // Advance every level.movesPerStep moves
    if (moveCount % level.movesPerStep === 0) {
      // Slasher actually moves this turn — play sinister taunt sound
      if (result.length > 0) {
        try { GameSFX.totSlasherTaunt && GameSFX.totSlasherTaunt(); } catch(e){}
      }
      // Track positions before move so we can lay blood trails
      const oldPositions = result.map(m => ({ r: m.r, c: m.c }));
      result = result.map((m, i) => {
        let newR = m.r + 1;
        let newC = m.c;
        // Sometimes drift left/right (more aggressive at higher acts via teleports)
        if (Math.random() < 0.3) newC = Math.max(0, Math.min(COLS - 1, m.c + (Math.random() < 0.5 ? -1 : 1)));
        // Teleport — slasher jumps to a random column (acts 3+)
        if (level.teleports && Math.random() < 0.3) {
          newR = m.r + 1;
          newC = Math.floor(Math.random() * COLS);
        }
        const newSurvived = (m.survivedTurns || 0) + 1;
        // Rage: every level.rageInterval moves survived, slasher gains 1 hp (capped at maxHp+2)
        let newHp = m.hp;
        if (level.rageInterval && newSurvived > 0 && newSurvived % level.rageInterval === 0) {
          newHp = Math.min((m.maxHp || 1) + 2, m.hp + 1);
        }
        return { ...m, r: newR, c: newC, survivedTurns: newSurvived, hp: newHp };
      });
      // Lay blood trails at old positions (acts 3+)
      if (level.bloodTrails) {
        setBloodTrails(prev => {
          const next = new Map(prev);
          for (const pos of oldPositions) {
            // Don't trail outside board
            if (pos.r >= 0 && pos.r < ROWS && pos.c >= 0 && pos.c < COLS) {
              next.set(`${pos.r},${pos.c}`, moveCount + level.bloodTrailLifespan);
            }
          }
          return next;
        });
      }
      // Splits — every 8 moves, if there's room, the leading slasher spawns a new one
      if (level.splits && moveCount > 0 && moveCount % 8 === 0 && result.length < 4) {
        const leader = result.reduce((acc, m) => m.r > acc.r ? m : acc, result[0]);
        if (leader) {
          const newC = Math.floor(Math.random() * COLS);
          const startHP = level.slasherHP || 1;
          result.push({ r: 0, c: newC, id: Date.now() + Math.random(), slasherIdx: 0, hp: startHP, maxHp: startHP, survivedTurns: 0 });
        }
      }
    }
    // Expire blood trails whose lifespan has passed
    setBloodTrails(prev => {
      let changed = false;
      const next = new Map(prev);
      for (const [key, expiresAt] of prev) {
        if (moveCount >= expiresAt) {
          next.delete(key);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
    return result;
  };

  // Watch for game over (mask reaches bottom row)
  useEffect(() => {
    if (phase !== "playing" || maskPositions.length === 0) return;
    const reachedBottom = maskPositions.some(m => m.r >= ROWS);
    if (reachedBottom) {
      finishLevel(false);
    }
  }, [maskPositions, phase]);

  // Helper: end the level. On target hit → save progress + level_won. Otherwise → death.
  const finishLevel = (passed) => {
    if (phase !== "playing") return;
    if (passed) {
      setProgress(prev => {
        const prevBest = prev.bestScores[levelIdx] || 0;
        const next = {
          unlocked: Math.max(prev.unlocked, Math.min(50, levelIdx + 2)),
          stars: prev.stars,
          bestScores: { ...prev.bestScores, [levelIdx]: Math.max(prevBest, score) },
        };
        totSaveProgress(next);
        return next;
      });
      setPhase("level_won");
      // Submit score to leaderboard — fires on every level completion so the player's
      // best run gets posted even if they never finish all 50 levels.
      try { if (typeof onHighScore === "function") onHighScore(score); } catch(e){}
      try { GameSFX.tone(523, 0.1, 'square', 0.13); GameSFX.tone(659, 0.1, 'square', 0.13); GameSFX.tone(784, 0.15, 'square', 0.13); } catch(e){}
    } else {
      setPhase("dead");
      // Also submit on death — the score is final at this point so it should be posted.
      try { if (typeof onHighScore === "function") onHighScore(score); } catch(e){}
      try { GameSFX.noise(0.5, 0.25); GameSFX.sweep(330, 80, 0.6, 'sawtooth', 0.18); } catch(e){}
    }
  };

  // Proactive deadlock check — whenever the board or slasher positions change while
  // the player is idle (not animating), verify at least one valid swap exists. If not,
  // auto-reshuffle. This catches the case where the slasher moved and locked the only
  // remaining valid swap, leaving the player stuck with no possible moves.
  useEffect(() => {
    if (phase !== "playing" || animating) return;
    const locks = new Map(bloodTrails);
    for (const m of maskPositions) locks.set(`${m.r},${m.c}`, true);
    if (!totHasValidMove(board, locks)) {
      // Reshuffle on next tick to avoid setState-during-render warnings
      const t = setTimeout(() => {
        const reshuffled = totReshuffle(board);
        setBoard(reshuffled);
        setSelectedTile(null);
        try { GameSFX.tone(330, 0.08, 'sine', 0.10); GameSFX.tone(440, 0.10, 'sine', 0.10); GameSFX.tone(523, 0.12, 'sine', 0.10); } catch(e){}
        setComboText({ text: "RESHUFFLE", key: Date.now() });
        setTimeout(() => setComboText(null), 1100);
      }, 100);
      return () => clearTimeout(t);
    }
  }, [phase, animating, board, maskPositions, bloodTrails]);

  // Idle hint timer: if the player hasn't moved in 10 seconds, pulse a valid swap to nudge them
  useEffect(() => {
    if (phase !== "playing" || animating) {
      setHintCells(null);
      return;
    }
    const timer = setTimeout(() => {
      // Build locked cells for the hint check (slashers + blood trails)
      const locks = new Map(bloodTrails);
      for (const m of maskPositions) locks.set(`${m.r},${m.c}`, true);
      const hint = totFindHintMove(board, locks);
      if (hint) setHintCells(hint);
    }, 10000);
    return () => clearTimeout(timer);
  }, [phase, animating, board, moves]);

  // ── Background music — dual-audio crossfade loop with iOS-respecting volume ──
  // Plays Ambiencetot.mp3 during intro, levelSelect, and playing phases.
  // Fades out on win/loss/victory screens. Two audio elements alternate so
  // the loop seam crossfades smoothly instead of cutting sharply.
  // Uses Web Audio GainNodes for volume control because HTML5 Audio.volume
  // is ignored on iOS — without this the music would play at full system volume.
  // Honors the musicOn toggle and hard-stops on component unmount.
  const totMusicRef = useRef<{
    ctx: AudioContext | null,
    a: HTMLAudioElement | null,
    b: HTMLAudioElement | null,
    aGain: GainNode | null,
    bGain: GainNode | null,
    active: 'a' | 'b',
    fadeRaf: number | null,
    targetVol: number,
  }>({ ctx: null, a: null, b: null, aGain: null, bGain: null, active: 'a', fadeRaf: null, targetVol: 0 });

  // Hard unmount cleanup — always runs when component leaves the tree, regardless of state
  useEffect(() => {
    return () => {
      const ref = totMusicRef.current;
      try { if (ref.a) { ref.a.pause(); ref.a.currentTime = 0; } } catch(e){}
      try { if (ref.b) { ref.b.pause(); ref.b.currentTime = 0; } } catch(e){}
      try { if (ref.aGain) ref.aGain.gain.value = 0; } catch(e){}
      try { if (ref.bGain) ref.bGain.gain.value = 0; } catch(e){}
      if (ref.fadeRaf !== null) {
        cancelAnimationFrame(ref.fadeRaf);
        ref.fadeRaf = null;
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ref = totMusicRef.current;
    const SRC = "/sounds/Ambiencetot.mp3";
    const TARGET_VOL = 0.254;       // overall volume (0–1) — applied to GainNodes, iOS-safe
    const XFADE_S = 3.0;             // crossfade window at the loop seam
    const PHASE_FADE_S = 1.2;        // fade in/out when entering/leaving music phases

    // Lazy-create AudioContext + two audio elements + their gain nodes
    if (!ref.a) {
      try {
        // Reuse the GameSFX context if available, otherwise make our own
        ref.ctx = (GameSFX.ctx && GameSFX.ctx()) || new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch(e) { return; }
      const ctx = ref.ctx;
      if (!ctx) return;
      try {
        const a = new Audio(SRC);
        a.preload = "auto";
        a.crossOrigin = "anonymous";
        const b = new Audio(SRC);
        b.preload = "auto";
        b.crossOrigin = "anonymous";
        const aSrc = ctx.createMediaElementSource(a);
        const bSrc = ctx.createMediaElementSource(b);
        const aGain = ctx.createGain();
        const bGain = ctx.createGain();
        aGain.gain.value = 0;
        bGain.gain.value = 0;
        aSrc.connect(aGain).connect(ctx.destination);
        bSrc.connect(bGain).connect(ctx.destination);
        ref.a = a; ref.b = b;
        ref.aGain = aGain; ref.bGain = bGain;
      } catch(e) { return; }
    }

    const ctx = ref.ctx;
    if (!ctx || !ref.a || !ref.b || !ref.aGain || !ref.bGain) return;
    if (ctx.state === "suspended") ctx.resume().catch(()=>{});

    const playMusic = musicOn && phase === "playing";
    ref.targetVol = playMusic ? TARGET_VOL : 0;

    // Cancel any in-flight fade ramp
    if (ref.fadeRaf !== null) {
      cancelAnimationFrame(ref.fadeRaf);
      ref.fadeRaf = null;
    }

    const activeEl = () => (ref.active === 'a' ? ref.a! : ref.b!);
    const inactiveEl = () => (ref.active === 'a' ? ref.b! : ref.a!);
    const activeGain = () => (ref.active === 'a' ? ref.aGain! : ref.bGain!);
    const inactiveGain = () => (ref.active === 'a' ? ref.bGain! : ref.aGain!);

    if (playMusic) {
      // Start active track if not already playing
      const el = activeEl();
      const g = activeGain();
      if (el.paused) {
        el.currentTime = 0;
        el.play().catch(() => {});
      }
      // Fade GainNode up to target
      const startVol = g.gain.value;
      const startTime = performance.now();
      const ramp = () => {
        const elapsed = (performance.now() - startTime) / 1000;
        const t = Math.min(1, elapsed / PHASE_FADE_S);
        g.gain.value = startVol + (ref.targetVol - startVol) * t;
        if (t < 1) ref.fadeRaf = requestAnimationFrame(ramp);
        else ref.fadeRaf = null;
      };
      ref.fadeRaf = requestAnimationFrame(ramp);
    } else {
      // Fade both gain nodes down, then pause audio elements
      const startA = ref.aGain.gain.value, startB = ref.bGain.gain.value;
      const startTime = performance.now();
      const ramp = () => {
        const elapsed = (performance.now() - startTime) / 1000;
        const t = Math.min(1, elapsed / PHASE_FADE_S);
        ref.aGain!.gain.value = startA * (1 - t);
        ref.bGain!.gain.value = startB * (1 - t);
        if (t < 1) ref.fadeRaf = requestAnimationFrame(ramp);
        else {
          try { ref.a!.pause(); ref.b!.pause(); } catch(e){}
          ref.fadeRaf = null;
        }
      };
      ref.fadeRaf = requestAnimationFrame(ramp);
    }

    // Crossfade-loop manager: poll the active track. When it nears the end of its duration,
    // start the inactive track at 0:00 and crossfade gain between them.
    const seamTimer = setInterval(() => {
      if (!playMusic) return;
      const cur = activeEl();
      const other = inactiveEl();
      const curG = activeGain();
      const otherG = inactiveGain();
      if (!cur.duration || isNaN(cur.duration)) return;
      const remaining = cur.duration - cur.currentTime;
      // When we hit the crossfade window AND the other track isn't already running, kick it off
      if (remaining <= XFADE_S && other.paused) {
        other.currentTime = 0;
        otherG.gain.value = 0;
        other.play().catch(() => {});
        // Linearly crossfade gains over XFADE_S seconds
        const startTime = performance.now();
        const xfade = () => {
          const elapsed = (performance.now() - startTime) / 1000;
          const t = Math.min(1, elapsed / XFADE_S);
          curG.gain.value = ref.targetVol * (1 - t);
          otherG.gain.value = ref.targetVol * t;
          if (t < 1) {
            requestAnimationFrame(xfade);
          } else {
            try { cur.pause(); cur.currentTime = 0; } catch(e){}
            ref.active = ref.active === 'a' ? 'b' : 'a';
          }
        };
        requestAnimationFrame(xfade);
      }
    }, 250);

    return () => {
      clearInterval(seamTimer);
      if (ref.fadeRaf !== null) {
        cancelAnimationFrame(ref.fadeRaf);
        ref.fadeRaf = null;
      }
    };
  }, [phase, musicOn]);

  // ── Phase-driven sound effects (chiptune style — matches GameSFX in rest of app) ──
  // Plays a stinger phrase using GameSFX.tone/sweep/noise when entering certain phases:
  //   level_won → triumphant rising arpeggio + sparkle
  //   dead → descending sad arpeggio + low impact + buzz
  //   won_game → fanfare + multiple ascending arpeggios
  // No MP3s, no background music — just synth beeps in the same style as the rest of the game.
  const totSfxLastPhase = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prev = totSfxLastPhase.current;
    totSfxLastPhase.current = phase;
    if (prev === null) return; // skip first mount

    const ctx = GameSFX.ctx();
    if (!ctx) return;
    const t0 = ctx.currentTime;

    if (phase === "level_won") {
      // ESCAPED! — bright square-wave fanfare, ascending C major arpeggio twice + high sparkle
      // Voice 1 (lead, square): C5 E5 G5 C6 — main triumphant arpeggio
      [523, 659, 784, 1047].forEach((f, i) =>
        GameSFX.tone(f, 0.18, 'square', 0.16, t0 + i * 0.08)
      );
      // Voice 2 (bass body, sawtooth): low C
      GameSFX.tone(131, 0.5, 'sawtooth', 0.14, t0);
      GameSFX.tone(196, 0.5, 'sawtooth', 0.10, t0); // G3 5th
      // Sparkle — fast high triangles after arpeggio
      [1568, 2093, 2637, 3136].forEach((f, i) =>
        GameSFX.tone(f, 0.10, 'triangle', 0.10, t0 + 0.45 + i * 0.06)
      );
      // Final tag — held high C
      GameSFX.tone(1047, 0.4, 'square', 0.14, t0 + 0.75);
      GameSFX.tone(1568, 0.4, 'sine', 0.10, t0 + 0.75);
    }

    else if (phase === "dead") {
      // SLAUGHTERED — low impact + descending minor arpeggio + dirty buzz
      // Big impact at t0
      GameSFX.noise(0.18, 0.30);
      GameSFX.tone(55, 0.45, 'sine', 0.32, t0);            // sub-bass thump
      GameSFX.tone(82, 0.40, 'sawtooth', 0.20, t0);         // dirty 5th
      // Descending minor arpeggio: A4 F4 D4 A3 — sad, hopeless
      [440, 349, 294, 220].forEach((f, i) =>
        GameSFX.tone(f, 0.22, 'sawtooth', 0.16, t0 + 0.15 + i * 0.18)
      );
      // Final low buzz drone
      GameSFX.tone(110, 0.6, 'square', 0.14, t0 + 0.95);
      GameSFX.tone(82, 0.6, 'sawtooth', 0.12, t0 + 0.95);
      // Static crackle to color the tail
      GameSFX.noise(0.4, 0.10);
    }

    else if (phase === "won_game") {
      // FINAL GIRL — bigger fanfare, multiple ascending arpeggios + held chord at end
      // Opening hit
      GameSFX.tone(65, 0.5, 'sine', 0.28, t0);              // sub thump
      GameSFX.noise(0.12, 0.18);
      // First arpeggio — C major scale fast
      [523, 587, 659, 784, 880, 1047].forEach((f, i) =>
        GameSFX.tone(f, 0.12, 'square', 0.14, t0 + 0.05 + i * 0.07)
      );
      // Second arpeggio — even higher
      [1047, 1319, 1568, 2093].forEach((f, i) =>
        GameSFX.tone(f, 0.14, 'triangle', 0.12, t0 + 0.55 + i * 0.08)
      );
      // Sustained C major chord at the end
      [262, 392, 523, 784, 1047].forEach((f) =>
        GameSFX.tone(f, 1.5, 'square', 0.10, t0 + 0.95)
      );
      // Bass note under it
      GameSFX.tone(131, 1.5, 'sawtooth', 0.16, t0 + 0.95);
      // Sparkle on top
      [2093, 2637, 3136, 2637, 2093].forEach((f, i) =>
        GameSFX.tone(f, 0.12, 'sine', 0.08, t0 + 1.1 + i * 0.10)
      );
    }
  }, [phase]);

  // Objective check — runs after every state change. If objective met → win. If moves run out → check.
  useEffect(() => {
    if (phase !== "playing" || !lvl || !lvl.objective) return;
    const obj = lvl.objective;
    let met = false;
    if (obj.type === 'score') met = score >= obj.target;
    else if (obj.type === 'kills') met = killCount >= obj.target;
    else if (obj.type === 'collect') met = collectCount >= obj.target;
    else if (obj.type === 'survive') met = survivedMoves >= obj.target;
    if (met && !levelComplete) {
      setLevelComplete(true);
      // Trigger the leftover-moves finale before showing the win screen
      triggerFinale();
      return;
    }
    // Out of moves and objective not met = lose
    if (movesLeft <= 0 && !levelComplete) {
      finishLevel(false);
    }
  }, [phase, score, killCount, collectCount, survivedMoves, movesLeft, lvl, levelComplete]);

  // Trigger the end-of-level finale animation: leftover moves auto-fire random powerups
  // for bonus points. Massive cathartic ending.
  const triggerFinale = () => {
    const remainingMoves = movesLeft;
    const fires = [];
    // Find all power tiles on the board and fire them, plus randomly convert tiles
    setTimeout(() => {
      // Phase 1: fire any existing power tiles
      const existingPowers = [];
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const t = board[r] && board[r][c];
          if (t && t.power) existingPowers.push({ r, c });
        }
      }
      // Convert remainingMoves random tiles into power tiles, then fire them all
      const powerTypes = ['stripe-h', 'stripe-v', 'wrapped'];
      const conversions = Math.min(remainingMoves, 8);
      const newPowers = [];
      const usedKeys = new Set();
      for (let i = 0; i < conversions; i++) {
        let attempts = 0;
        while (attempts < 30) {
          attempts++;
          const r = Math.floor(Math.random() * ROWS);
          const c = Math.floor(Math.random() * COLS);
          const key = `${r},${c}`;
          if (usedKeys.has(key)) continue;
          if (!board[r] || !board[r][c]) continue;
          if (board[r][c].power) continue;
          usedKeys.add(key);
          newPowers.push({ r, c, power: powerTypes[Math.floor(Math.random() * powerTypes.length)] });
          break;
        }
      }
      // Animate: each power activates with a slight stagger
      const allFires = [...existingPowers.map(p => ({ ...p, power: board[p.r][p.c].power })), ...newPowers];
      let i = 0;
      const fireInterval = setInterval(() => {
        if (i >= allFires.length) {
          clearInterval(fireInterval);
          setTimeout(() => finishLevel(true), 800);
          return;
        }
        const f = allFires[i];
        setPowerFires(prev => [...prev, { ...f, key: Date.now() + Math.random() }]);
        // Add bonus score per finale fire
        const bonus = 500;
        setScore(s => s + bonus);
        try {
          if (f.power === 'stripe-h' || f.power === 'stripe-v') GameSFX.sweep(220, 1800, 0.35, 'sawtooth', 0.18);
          else if (f.power === 'wrapped') GameSFX.noise(0.18, 0.25);
        } catch(e){}
        setShakeUntil(Date.now() + 200);
        i++;
      }, 180);
    }, 400);
  };

  // Handle tile tap for swap
  // Swipe gesture: track pointer down position + tile, then determine direction on release.
  // While dragging, the tile visually follows the finger up to one cell distance.
  const swipeStart = useRef(null); // { r, c, x, y }
  const [dragOffset, setDragOffset] = useState(null); // { r, c, dx, dy } — offset to apply to dragged tile

  const handlePointerDown = (r, c, e) => {
    if (animating || phase !== "playing") return;
    setHintCells(null);
    swipeStart.current = { r, c, x: e.clientX, y: e.clientY };
    setSelectedTile({ r, c });
    setDragOffset({ r, c, dx: 0, dy: 0 });
    try { GameSFX.tone(440, 0.04, 'sine', 0.06); } catch(e2){}
  };

  const handlePointerMove = (e) => {
    if (!swipeStart.current || animating) return;
    const start = swipeStart.current;
    let dx = e.clientX - start.x;
    let dy = e.clientY - start.y;
    // Lock to dominant axis once we've moved enough — feels more like Candy Crush
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    if (absX > 8 || absY > 8) {
      if (absX > absY) dy = 0; else dx = 0;
    }
    // Clamp drag to one cell distance max — the tile "wants" to be in its swap position, no further
    const maxDist = tileSize;
    if (dx > maxDist) dx = maxDist;
    if (dx < -maxDist) dx = -maxDist;
    if (dy > maxDist) dy = maxDist;
    if (dy < -maxDist) dy = -maxDist;
    setDragOffset({ r: start.r, c: start.c, dx, dy });
  };

  const handlePointerUp = (e) => {
    if (!swipeStart.current || animating || phase !== "playing") {
      swipeStart.current = null;
      setSelectedTile(null);
      setDragOffset(null);
      return;
    }
    const start = swipeStart.current;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const SWIPE_THRESHOLD = 15;

    swipeStart.current = null;
    setDragOffset(null);

    if (absX < SWIPE_THRESHOLD && absY < SWIPE_THRESHOLD) {
      return; // tap, leave tile selected
    }

    let dr = 0, dc = 0;
    if (absX > absY) dc = dx > 0 ? 1 : -1;
    else dr = dy > 0 ? 1 : -1;

    const targetR = start.r + dr;
    const targetC = start.c + dc;

    if (targetR >= 0 && targetR < ROWS && targetC >= 0 && targetC < COLS) {
      // Don't allow swapping with a tile occupied by a slasher (no tile is there)
      const targetIsSlasher = maskPositions.some(m => m.r === targetR && m.c === targetC);
      const sourceIsSlasher = maskPositions.some(m => m.r === start.r && m.c === start.c);
      // Also block swaps that touch a blood-trailed cell
      const targetIsBlood = bloodTrails.has(`${targetR},${targetC}`);
      const sourceIsBlood = bloodTrails.has(`${start.r},${start.c}`);
      if (!targetIsSlasher && !sourceIsSlasher && !targetIsBlood && !sourceIsBlood) {
        swapTiles(start.r, start.c, targetR, targetC);
      }
    }

    setSelectedTile(null);
  };

  // Tap-to-tap fallback: if already selected and you tap an adjacent cell, swap
  const handleTileTap = (r, c) => {
    if (animating || phase !== "playing") return;
    setHintCells(null);
    if (!selectedTile) {
      setSelectedTile({ r, c });
      try { GameSFX.tone(440, 0.04, 'sine', 0.06); } catch(e){}
    } else if (selectedTile.r === r && selectedTile.c === c) {
      setSelectedTile(null);
    } else {
      if (Math.abs(selectedTile.r - r) + Math.abs(selectedTile.c - c) === 1) {
        swapTiles(selectedTile.r, selectedTile.c, r, c);
        setSelectedTile(null);
      } else {
        setSelectedTile({ r, c });
        try { GameSFX.tone(440, 0.04, 'sine', 0.06); } catch(e){}
      }
    }
  };

  // ── RENDER ──

  const titleStyle = { fontFamily:"'Jolly Lodger',serif", fontSize:48, color:"#ff8c1a", letterSpacing:6, marginBottom:6, textShadow:"0 0 20px rgba(255,140,30,0.4), 3px 3px 0 #1a0d2e", textAlign:"center" };
  const subStyle = { fontFamily:"'Cinzel',serif", fontSize:11, color:"rgba(255,200,100,0.7)", letterSpacing:4, textAlign:"center" };
  const btnStyle = { padding:"14px 36px", background:"linear-gradient(180deg, #ff8c1a 0%, #cc5500 100%)", border:"2px solid #ffaa44", borderRadius:10, color:"#1a0d2e", fontFamily:"'Cinzel',serif", fontSize:14, fontWeight:700, letterSpacing:4, textTransform:"uppercase", cursor:"pointer", boxShadow:"0 6px 0 #6a2a00, 0 8px 24px rgba(255,140,30,0.4)" };
  const btn2Style = { ...btnStyle, background:"transparent", color:"#ffaa44", boxShadow:"none", border:"1px solid rgba(255,170,68,0.5)", padding:"10px 24px" };

  // Sky gradient that intensifies with level
  const skyGradient = `linear-gradient(180deg, ${lvl.skyTop} 0%, ${lvl.skyBottom} 100%)`;

  // ── INTRO SCREEN ──
  if (phase === "intro") {
    return (
      <div style={{position:"fixed",inset:0,background:"linear-gradient(180deg, #0a0612 0%, #1a0d2e 50%, #2a1a14 100%)",color:"#fff5e0",zIndex:100,display:"flex",flexDirection:"column",overflow:"auto"}}>
        <TotVideoBg opacity={1} />
        <style>{`
          @import url('https://fonts.bunny.net/css?family=jolly-lodger:400|cinzel:400,600,700|inter:300,400,500&display=swap');
          @keyframes totFloat { 0%,100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-8px) rotate(3deg); } }
          @keyframes totFloatB { 0%,100% { transform: translateY(0) rotate(4deg); } 50% { transform: translateY(-12px) rotate(-2deg); } }
          @keyframes totGlow { 0%,100% { filter: drop-shadow(0 0 12px rgba(255,140,30,0.4)); } 50% { filter: drop-shadow(0 0 24px rgba(255,140,30,0.8)); } }
          @keyframes totFlicker { 0%,90%,100% { opacity: 1; } 92% { opacity: 0.4; } 94% { opacity: 1; } 96% { opacity: 0.6; } }
        `}</style>
        {/* Header */}
        <div style={{padding:"16px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"relative",zIndex:2}}>
          <button onClick={onExit} style={{background:"transparent",border:"none",color:"rgba(255,200,100,0.7)",fontSize:13,letterSpacing:3,cursor:"pointer",fontFamily:"'Cinzel',serif"}}>← EXIT</button>
          <div style={{fontSize:11,color:"rgba(255,200,100,0.5)",letterSpacing:4,fontFamily:"'Cinzel',serif"}}>HALLOWEEN NIGHT</div>
          <div style={{width:44}}></div>
        </div>

        {/* Floating decorations */}
        <div style={{position:"absolute",top:60,left:24,fontSize:42,animation:"totFloat 4s ease-in-out infinite, totGlow 3s ease-in-out infinite",pointerEvents:"none"}}>🎃</div>
        <div style={{position:"absolute",top:90,right:32,fontSize:34,animation:"totFloatB 5s ease-in-out infinite",pointerEvents:"none"}}>🦇</div>
        <div style={{position:"absolute",top:200,left:18,fontSize:24,animation:"totFloat 6s ease-in-out infinite",pointerEvents:"none",opacity:0.7}}>🕷️</div>

        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px 18px",position:"relative",zIndex:2}}>
          <div style={{fontSize:84,lineHeight:1,marginBottom:14,animation:"totGlow 3s ease-in-out infinite, totFlicker 6s infinite"}}>🎃</div>
          <div style={{...titleStyle,marginBottom:18}}>TRICK OR TREAT</div>

          <div style={{border:"2px solid rgba(255,140,30,0.3)",borderRadius:12,padding:"16px 20px",background:"rgba(20,8,30,0.6)",textAlign:"left",marginBottom:14,maxWidth:360,width:"100%"}}>
            <div style={{color:"#ff8c1a",fontSize:14,letterSpacing:3,textAlign:"center",marginBottom:12,fontFamily:"'Cinzel',serif",fontWeight:700}}>HOW TO PLAY</div>
            {[
              "Swipe to swap candies",
              "Match 3+ in a row to clear",
              "Match next to 💀 to damage him",
              "Hit objective before moves run out",
              "50 nights to survive",
            ].map((t, i) => (
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:9}}>
                <span style={{display:"inline-block",width:24,height:24,borderRadius:12,background:"linear-gradient(180deg, #ff8c1a, #cc5500)",color:"#1a0d2e",fontSize:14,fontFamily:"'Cinzel',serif",fontWeight:700,lineHeight:"24px",textAlign:"center",flexShrink:0}}>{i+1}</span>
                <span style={{color:"rgba(255,245,224,0.92)",fontSize:14,letterSpacing:0.4,lineHeight:1.45,fontFamily:"'Cinzel',serif"}}>{t}</span>
              </div>
            ))}
          </div>

          <div style={{border:"2px solid rgba(255,140,30,0.3)",borderRadius:12,padding:"16px 20px",background:"rgba(20,8,30,0.6)",textAlign:"left",marginBottom:18,maxWidth:360,width:"100%"}}>
            <div style={{color:"#ff8c1a",fontSize:14,letterSpacing:3,textAlign:"center",marginBottom:12,fontFamily:"'Cinzel',serif",fontWeight:700}}>POWER TILES</div>
            {[
              { icon: "🩸", title: "HEX", desc: "Match 4 — clears row or column" },
              { icon: "🎃", title: "JACK-O'-BOMB", desc: "T or L match — 3×3 blast" },
              { icon: "💀", title: "SOUL HARVEST", desc: "Match 5 — clears one full color" },
              { icon: "🔪", title: "NIGHTMARE", desc: "Swap two powers — massacre" },
            ].map((p, i) => (
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:10}}>
                <span style={{fontSize:24,flexShrink:0,lineHeight:1.1,marginTop:0}}>{p.icon}</span>
                <div style={{flex:1}}>
                  <div style={{color:"#ffaa44",fontSize:14,letterSpacing:2,fontFamily:"'Cinzel',serif",fontWeight:700,marginBottom:3}}>{p.title}</div>
                  <div style={{color:"rgba(255,245,224,0.85)",fontSize:13,letterSpacing:0.3,lineHeight:1.4,fontFamily:"'Cinzel',serif"}}>{p.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
            <button onClick={() => startLevel(progress.unlocked - 1)} style={btnStyle}>
              {progress.unlocked === 1 ? "BEGIN THE NIGHT" : `CONTINUE — NIGHT ${progress.unlocked}`}
            </button>
            <button onClick={() => setPhase("levelSelect")} style={btn2Style}>LEVELS</button>
          </div>
          {highScore > 0 && <div style={{marginTop:14,color:"rgba(255,200,100,0.6)",fontSize:13,letterSpacing:2,fontFamily:"'Cinzel',serif"}}>BEST: {highScore}</div>}
        </div>
      </div>
    );
  }

  // ── LEVEL SELECT ──
  if (phase === "levelSelect") {
    const totalCompleted = Object.keys(progress.bestScores).length;
    return (
      <div style={{position:"fixed",inset:0,background:"linear-gradient(180deg, #0a0612 0%, #1a0d2e 50%, #2a1a14 100%)",color:"#fff5e0",zIndex:100,display:"flex",flexDirection:"column",overflow:"auto"}}>
        <TotVideoBg opacity={1} />
        <style>{`@import url('https://fonts.bunny.net/css?family=jolly-lodger:400|cinzel:400,600,700&display=swap');`}</style>
        <div style={{padding:"16px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:"linear-gradient(180deg, #0a0612 70%, transparent 100%)",zIndex:5}}>
          <button onClick={() => setPhase("intro")} style={{background:"transparent",border:"none",color:"rgba(255,200,100,0.7)",fontSize:13,letterSpacing:3,cursor:"pointer",fontFamily:"'Cinzel',serif"}}>← BACK</button>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:24,color:"#ff8c1a",letterSpacing:5,lineHeight:1,textShadow:"0 0 16px rgba(255,140,30,0.5)"}}>SELECT NIGHT</div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"rgba(255,200,100,0.6)",letterSpacing:3,marginTop:3}}>{totalCompleted} / 50 NIGHTS BEATEN</div>
          </div>
          <div style={{width:50}}></div>
        </div>

        <div style={{flex:1,padding:"4px 14px 24px",maxWidth:380,width:"100%",margin:"0 auto",position:"relative",zIndex:2}}>
          {TOT_ACTS.map((act, actIdx) => (
            <div key={actIdx} style={{marginBottom:22}}>
              <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:22,color:"#ffaa44",letterSpacing:5,marginBottom:8,paddingLeft:6,textShadow:"0 0 14px rgba(255,170,68,0.4)"}}>ACT {actIdx + 1} — {act.label}</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(5, 1fr)",gap:8}}>
                {Array.from({length: 10}).map((_, n) => {
                  const idx = actIdx * 10 + n;
                  const level = TOT_LEVELS[idx];
                  const best = progress.bestScores[idx] || 0;
                  const beaten = best > 0;
                  const unlocked = idx + 1 <= progress.unlocked;
                  const isBoss = level.isBoss;
                  return (
                    <button
                      key={idx}
                      disabled={!unlocked}
                      onClick={() => unlocked && startLevel(idx)}
                      style={{
                        aspectRatio:"1",
                        background: unlocked ? (isBoss ? "linear-gradient(140deg, rgba(120,0,0,0.5), rgba(60,0,0,0.7))" : "linear-gradient(140deg, rgba(255,140,30,0.2), rgba(60,20,0,0.5))") : "rgba(20,20,30,0.5)",
                        border: `1.5px solid ${unlocked ? (isBoss ? "rgba(255,40,40,0.7)" : "rgba(255,140,30,0.5)") : "rgba(80,80,80,0.3)"}`,
                        borderRadius: 10,
                        color: unlocked ? "#fff5e0" : "rgba(120,120,120,0.5)",
                        fontFamily:"'Cinzel',serif",
                        cursor: unlocked ? "pointer" : "not-allowed",
                        padding:"6px 4px",
                        display:"flex",
                        flexDirection:"column",
                        alignItems:"center",
                        justifyContent:"center",
                        gap:2,
                        position:"relative",
                        boxShadow: unlocked ? (isBoss ? "0 4px 16px rgba(120,0,0,0.5)" : "0 4px 12px rgba(0,0,0,0.4)") : "none",
                      }}
                    >
                      <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:22,letterSpacing:1,lineHeight:1,color: unlocked ? (isBoss ? "#ff5050" : "#ffaa44") : "inherit"}}>{idx + 1}</div>
                      {unlocked ? (
                        beaten ? (
                          <div style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"#ffd700",letterSpacing:0,marginTop:2,fontWeight:700,textShadow:"0 0 6px rgba(255,215,0,0.5)"}}>{best}</div>
                        ) : (
                          <div style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"rgba(255,200,100,0.55)",letterSpacing:1,marginTop:2}}>NEW</div>
                        )
                      ) : (
                        <div style={{fontSize:14,marginTop:2,opacity:0.5}}>🔒</div>
                      )}
                      {isBoss && unlocked && <div style={{position:"absolute",top:3,right:5,fontSize:9,color:"#ff5050",fontWeight:700,letterSpacing:1}}>BOSS</div>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── LEVEL WON ──
  if (phase === "level_won") {
    const isLast = levelIdx >= TOT_LEVELS.length - 1;
    const prevBest = progress.bestScores[levelIdx] || 0;
    const isNewBest = score >= prevBest;
    return (
      <div style={{position:"fixed",inset:0,background:`linear-gradient(180deg, ${lvl.skyTop} 0%, ${lvl.skyBottom} 100%)`,color:"#fff5e0",zIndex:100,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px 18px",overflow:"auto"}}>
        <TotVideoBg opacity={1} />
        <style>{`@import url('https://fonts.bunny.net/css?family=jolly-lodger:400|cinzel:400,600,700&display=swap');@keyframes totWin { 0% { transform: scale(0.5); opacity: 0; } 60% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }`}</style>
        <div style={{position:"relative",zIndex:2,display:"flex",flexDirection:"column",alignItems:"center"}}>
          <div style={{fontSize:84,lineHeight:1,marginBottom:40,animation:"totWin 0.6s ease-out"}}>🎃</div>
          <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:54,color:"#ffaa44",letterSpacing:6,textShadow:"0 0 30px rgba(255,170,68,0.6), 3px 3px 0 #1a0d2e",marginBottom:6,textAlign:"center"}}>{isLast ? "ALL NIGHTS BEATEN" : "ESCAPED!"}</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:11,color:"rgba(255,200,100,0.7)",letterSpacing:3,marginBottom:18,textAlign:"center"}}>NIGHT {levelIdx + 1} — {lvl.subtitle}</div>

          <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:64,color:"#fff",letterSpacing:6,marginBottom:6,textShadow:"0 0 20px rgba(255,140,30,0.4)"}}>{score}</div>
          {isNewBest && score > 0 && <div style={{fontFamily:"'Cinzel',serif",fontSize:12,color:"#ffd700",letterSpacing:4,fontWeight:700,marginBottom:18,textShadow:"0 0 10px rgba(255,215,0,0.7)"}}>★ NEW BEST ★</div>}
          {!isNewBest && prevBest > 0 && <div style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"rgba(255,200,100,0.55)",letterSpacing:3,marginBottom:18}}>YOUR BEST: {prevBest}</div>}

          <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
            {!isLast && <button onClick={nextLevel} style={btnStyle}>NEXT NIGHT →</button>}
            <button onClick={() => setPhase("levelSelect")} style={btn2Style}>LEVELS</button>
            <button onClick={onExit} style={btn2Style}>EXIT</button>
          </div>
        </div>
      </div>
    );
  }

  // ── DEAD ──
  if (phase === "dead") {
    return (
      <div style={{position:"fixed",inset:0,background:"linear-gradient(180deg, #1a0000 0%, #2a0000 100%)",color:"#fff",zIndex:100,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px 18px"}}>
        <TotVideoBg opacity={1} />
        <style>{`@import url('https://fonts.bunny.net/css?family=jolly-lodger:400|cinzel:400,600,700&display=swap');@keyframes totDeath { 0% { opacity: 0; transform: scale(2); } 100% { opacity: 1; transform: scale(1); } }`}</style>
        <div style={{position:"relative",zIndex:2,display:"flex",flexDirection:"column",alignItems:"center"}}>
          <div style={{fontSize:84,marginBottom:14,animation:"totDeath 0.8s ease-out"}}>{lvl.mask}</div>
          <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:64,color:"#e63946",letterSpacing:8,textShadow:"0 0 30px rgba(230,57,70,0.7), 3px 3px 0 #000",marginBottom:8,textAlign:"center"}}>SLAUGHTERED</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:12,color:"rgba(255,200,200,0.7)",letterSpacing:4,marginBottom:24,textAlign:"center"}}>
            THE SLASHER GOT YOU
          </div>
          <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:48,color:"rgba(255,255,255,0.6)",letterSpacing:6,marginBottom:24}}>{score}</div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
            <button onClick={() => startLevel(levelIdx)} style={btnStyle}>TRY AGAIN</button>
            <button onClick={() => setPhase("levelSelect")} style={btn2Style}>LEVELS</button>
            <button onClick={onExit} style={btn2Style}>EXIT</button>
          </div>
        </div>
      </div>
    );
  }

  // ── WON GAME (all 3 levels) ──
  if (phase === "won_game") {
    return (
      <div style={{position:"fixed",inset:0,background:"linear-gradient(180deg, #0a0612 0%, #2a1a14 50%, #ff8c1a 200%)",color:"#fff5e0",zIndex:100,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px 18px"}}>
        <TotVideoBg opacity={1} />
        <style>{`@import url('https://fonts.bunny.net/css?family=jolly-lodger:400|cinzel:400,600,700&display=swap');@keyframes totSpin { from { transform: rotate(-360deg) scale(0); } to { transform: rotate(0) scale(1); } }`}</style>
        <div style={{position:"relative",zIndex:2,display:"flex",flexDirection:"column",alignItems:"center"}}>
          <div style={{fontSize:96,marginBottom:14,animation:"totSpin 1.2s cubic-bezier(0.18,0.89,0.32,1.28)"}}>🏆</div>
          <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:64,color:"#ffaa44",letterSpacing:6,textShadow:"0 0 30px rgba(255,170,68,0.8), 3px 3px 0 #1a0d2e",marginBottom:8,textAlign:"center"}}>FINAL GIRL</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:12,color:"rgba(255,200,100,0.8)",letterSpacing:4,marginBottom:24,textAlign:"center",maxWidth:300,lineHeight:1.7}}>
            YOU SURVIVED ALL THREE NIGHTS. THE SLASHERS HAVE RETREATED.
          </div>
          <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:64,color:"#fff",letterSpacing:6,marginBottom:24,textShadow:"0 0 20px rgba(255,140,30,0.6)"}}>{score}</div>
          <button onClick={onExit} style={btnStyle}>EXIT</button>
        </div>
      </div>
    );
  }

  // ── PLAYING ──
  // Use most of the screen width — cap at 60px so it doesn't get silly on tablets
  const availableWidth = typeof window !== "undefined" ? Math.min(window.innerWidth - 16, 480) : 360;
  const tileSize = Math.min(60, Math.floor(availableWidth / COLS));
  const boardWidth = tileSize * COLS;
  const boardHeight = tileSize * ROWS;
  const isShaking = Date.now() < shakeUntil;
  const scoreProgress = Math.min(100, (score / lvl.targetScore) * 100);

  return (
    <div style={{position:"fixed",inset:0,background:skyGradient,color:"#fff5e0",zIndex:100,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <TotVideoBg opacity={1} />
      <style>{`
        @import url('https://fonts.bunny.net/css?family=jolly-lodger:400|cinzel:400,600,700&display=swap');
        @keyframes totShake { 0%,100% { transform: translate(0,0); } 25% { transform: translate(-3px, 2px); } 50% { transform: translate(2px, -3px); } 75% { transform: translate(-2px, 3px); } }
        @keyframes totPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }
        @keyframes totSelect { 0%,100% { box-shadow: 0 0 0 2px #ffaa44, 0 0 12px rgba(255,170,68,0.6); } 50% { box-shadow: 0 0 0 3px #fff, 0 0 18px rgba(255,170,68,0.9); } }
        @keyframes totDescend { from { transform: translateY(-100%); } to { transform: translateY(0); } }
        @keyframes totCombo { 0% { transform: translate(-50%,-50%) scale(0.4); opacity: 0; } 30% { transform: translate(-50%,-50%) scale(1.2); opacity: 1; } 100% { transform: translate(-50%,-90%) scale(1); opacity: 0; } }
        @keyframes totBgStar { 0%,100% { opacity: 0.3; } 50% { opacity: 0.8; } }
        @keyframes totExplode {
          0% { transform: scale(1) rotate(0); opacity: 1; filter: brightness(1) drop-shadow(0 2px 4px rgba(0,0,0,0.5)); }
          25% { transform: scale(1.4) rotate(15deg); opacity: 1; filter: brightness(2) drop-shadow(0 0 18px #fff) drop-shadow(0 0 30px #ffaa44); }
          60% { transform: scale(1.6) rotate(-10deg); opacity: 0.8; filter: brightness(1.6) drop-shadow(0 0 24px #ffd700); }
          100% { transform: scale(0.2) rotate(45deg); opacity: 0; filter: brightness(3) drop-shadow(0 0 30px #ff8c1a); }
        }
        @keyframes totBurst {
          0% { transform: translate(-50%,-50%) scale(0.2); opacity: 0; }
          40% { transform: translate(-50%,-50%) scale(1.6); opacity: 0.9; }
          100% { transform: translate(-50%,-50%) scale(2.4); opacity: 0; }
        }
        @keyframes totFall {
          0%   { transform: translateY(var(--fall-from, -100px)); }
          70%  { transform: translateY(8px); }
          85%  { transform: translateY(-3px); }
          100% { transform: translateY(0); }
        }
        @keyframes totHint {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)) drop-shadow(0 0 8px rgba(255,170,68,0.4)); }
          50% { transform: scale(1.18); filter: drop-shadow(0 0 18px #ffd700) drop-shadow(0 0 28px rgba(255,215,0,0.8)) brightness(1.4); }
        }
        @keyframes totCursedPulse {
          0%, 100% { box-shadow: inset 0 0 0 2px rgba(255,32,48,0.6), 0 0 12px rgba(255,32,48,0.5); }
          50% { box-shadow: inset 0 0 0 2px rgba(255,80,96,1), 0 0 22px rgba(255,32,48,0.95); }
        }
        @keyframes totBloodTrailPulse {
          0%, 100% { background: radial-gradient(circle, rgba(120,0,16,0.7) 0%, rgba(60,0,8,0.55) 70%); }
          50% { background: radial-gradient(circle, rgba(160,0,20,0.8) 0%, rgba(80,0,12,0.65) 70%); }
        }
        @keyframes totPowerPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 8px #ffd700) brightness(1); }
          50% { transform: scale(1.06); filter: drop-shadow(0 0 18px #ffd700) brightness(1.3); }
        }
        @keyframes totColorbombSpin {
          0% { transform: rotate(0); filter: drop-shadow(0 0 8px #ffd700) hue-rotate(0deg); }
          100% { transform: rotate(360deg); filter: drop-shadow(0 0 18px #ffd700) hue-rotate(360deg); }
        }
        @keyframes totStripeFireH {
          0% { opacity: 0; transform: scaleX(0.1); }
          30% { opacity: 1; transform: scaleX(1); }
          100% { opacity: 0; transform: scaleX(1.05); }
        }
        @keyframes totStripeFireV {
          0% { opacity: 0; transform: scaleY(0.1); }
          30% { opacity: 1; transform: scaleY(1); }
          100% { opacity: 0; transform: scaleY(1.05); }
        }
        @keyframes totWrappedBlast {
          0% { opacity: 0; transform: scale(0.2); }
          40% { opacity: 1; transform: scale(1.5); }
          100% { opacity: 0; transform: scale(2.2); }
        }
        @keyframes totColorbombBurst {
          0% { opacity: 0; transform: scale(0.3); }
          30% { opacity: 1; transform: scale(2.5); }
          100% { opacity: 0; transform: scale(4); }
        }
        @keyframes totBigFlash {
          0% { opacity: 0; }
          15% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes totBigZoom {
          0% { transform: scale(0.2) rotate(-12deg); opacity: 0; }
          25% { transform: scale(1.25) rotate(4deg); opacity: 1; }
          45% { transform: scale(1) rotate(-2deg); opacity: 1; }
          75% { transform: scale(1.05) rotate(0); opacity: 1; }
          100% { transform: scale(0.85) rotate(0); opacity: 0; }
        }
        @keyframes totRadiate {
          0% { transform: translate(-50%, -50%) rotate(var(--angle)) translateX(0) rotate(calc(-1 * var(--angle))) scale(0.2); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translate(-50%, -50%) rotate(var(--angle)) translateX(var(--distance)) rotate(calc(-1 * var(--angle))) scale(0.6); opacity: 0; }
        }
        @keyframes totTimerPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes totBarShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes totBloodBurst {
          0% { transform: scale(0.2); opacity: 0; }
          25% { transform: scale(1.4); opacity: 1; }
          70% { transform: scale(1.6); opacity: 0.8; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes totBloodSplat {
          0% { transform: translate(0, 0) scale(0.3); opacity: 0; }
          15% { transform: rotate(var(--angle)) translateX(calc(var(--distance) * 0.4)) scale(1.1); opacity: 1; }
          70% { transform: rotate(var(--angle)) translateX(var(--distance)) scale(1) translateY(0); opacity: 0.95; }
          100% { transform: rotate(var(--angle)) translateX(var(--distance)) scale(0.85) translateY(20px); opacity: 0; }
        }
        @keyframes totBloodPool {
          0% { transform: scale(0.2); opacity: 0; }
          30% { transform: scale(1.2); opacity: 1; }
          80% { transform: scale(1) translateY(8px); opacity: 0.7; }
          100% { transform: scale(0.95) translateY(14px); opacity: 0; }
        }
        @keyframes totFloater {
          0% { transform: translate(-50%, 0) scale(0.5); opacity: 0; }
          15% { transform: translate(-50%, -8px) scale(1.2); opacity: 1; }
          70% { transform: translate(-50%, -50px) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -90px) scale(0.85); opacity: 0; }
        }
        @keyframes totPowerBirth {
          0% { transform: translate(-50%,-50%) scale(0.2) rotate(0); opacity: 0; }
          30% { transform: translate(-50%,-50%) scale(1.6) rotate(45deg); opacity: 1; }
          60% { transform: translate(-50%,-50%) scale(0.9) rotate(-10deg); opacity: 1; }
          100% { transform: translate(-50%,-50%) scale(1) rotate(0); opacity: 0; }
        }
        @keyframes totPowerBirthRing {
          0% { transform: translate(-50%,-50%) scale(0.5); opacity: 0; }
          40% { transform: translate(-50%,-50%) scale(2.5); opacity: 0.9; }
          100% { transform: translate(-50%,-50%) scale(4); opacity: 0; }
        }
        @keyframes totFreezeOverlay {
          0% { backdrop-filter: brightness(1) blur(0); }
          50% { backdrop-filter: brightness(1.4) blur(1px); }
          100% { backdrop-filter: brightness(1) blur(0); }
        }
        @keyframes totKillFlash {
          0% { opacity: 0; }
          10% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes totKillZoom {
          0% { transform: scale(0.4) rotate(-8deg); opacity: 0; }
          25% { transform: scale(1.18) rotate(3deg); opacity: 1; }
          50% { transform: scale(1) rotate(-1deg); opacity: 1; }
          80% { transform: scale(1.04) rotate(0); opacity: 1; }
          100% { transform: scale(0.92) rotate(0); opacity: 0; }
        }
      `}</style>

      {/* Background stars */}
      <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden"}}>
        {Array.from({length: 30}).map((_, i) => (
          <div key={i} style={{position:"absolute",left:`${(i * 37) % 100}%`,top:`${(i * 23) % 60}%`,fontSize:6,color:"#fff",animation:`totBgStar ${2 + (i % 4)}s ease-in-out infinite`,animationDelay:`${i * 0.2}s`}}>✦</div>
        ))}
      </div>

      {/* Header */}
      <div style={{padding:"14px 16px 8px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"relative",zIndex:3}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button onClick={onExit} style={{background:"transparent",border:"none",color:"#ffffff",fontSize:13,letterSpacing:3,cursor:"pointer",fontFamily:"'Cinzel',serif",textShadow:"0 0 8px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.9)"}}>← EXIT</button>
          <button onClick={() => setMusicOn(m => !m)} title={musicOn ? "Music ON — tap to mute" : "Music OFF — tap to enable"} style={{background:"transparent",border:`1px solid rgba(255,255,255,${musicOn ? 0.85 : 0.4})`,borderRadius:8,color:"#ffffff",fontSize:16,cursor:"pointer",padding:"3px 9px",lineHeight:1}}>{musicOn ? "🎵" : "🔇"}</button>
        </div>
        <div style={{textAlign:"center"}}>
          <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:24,color:"#ffffff",letterSpacing:4,lineHeight:1,textShadow:"0 0 12px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.9)"}}>NIGHT {levelIdx + 1}</div>
          <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:28,color:movesLeft <= 5 ? "#ff3030" : "#fff",letterSpacing:3,marginTop:2,textShadow:movesLeft <= 5 ? "0 0 14px rgba(255,48,48,0.9), 0 2px 4px rgba(0,0,0,0.9)" : "0 0 8px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.9)",animation:movesLeft <= 5 && movesLeft > 0 ? "totTimerPulse 0.5s ease-in-out infinite" : undefined}}>
            🎯 {movesLeft}
          </div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"rgba(255,255,255,0.85)",letterSpacing:3,marginTop:1,textShadow:"0 1px 3px rgba(0,0,0,0.9)"}}>MOVES LEFT</div>
          {lvl.twist && <div style={{fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:9,color:"#ff5555",letterSpacing:3,marginTop:3,textShadow:"0 0 8px rgba(255,48,48,0.7), 0 1px 3px rgba(0,0,0,0.9)"}}>⚠ {lvl.twist}</div>}
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:32,color:"#ffffff",lineHeight:1,textShadow:"0 0 10px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.9)"}}>{score}</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:11,color:"rgba(255,255,255,0.9)",letterSpacing:2,fontWeight:700,textShadow:"0 1px 3px rgba(0,0,0,0.9)"}}>SCORE</div>
        </div>
      </div>

      {/* Objective bar */}
      <div style={{padding:"6px 18px 0",position:"relative",zIndex:3}}>
        {(() => {
          const obj = lvl.objective;
          if (!obj) return null;
          let curr = 0, target = obj.target;
          if (obj.type === 'score') curr = score;
          else if (obj.type === 'kills') curr = killCount;
          else if (obj.type === 'collect') curr = collectCount;
          else if (obj.type === 'survive') curr = survivedMoves;
          const pct = Math.min(100, (curr / target) * 100);
          const milestones = [25, 50, 75];
          return (
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:13,color:"#ffffff",letterSpacing:2,fontWeight:700,minWidth:80,textShadow:"0 0 8px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.9)"}}>{obj.label}</div>
              <div style={{flex:1,position:"relative",height:14,background:"rgba(0,0,0,0.55)",borderRadius:7,overflow:"hidden",border:"1.5px solid rgba(255,140,30,0.4)",boxShadow:"inset 0 0 10px rgba(0,0,0,0.6)"}}>
                <div style={{position:"absolute",inset:0,width:`${pct}%`,background:`linear-gradient(90deg, ${obj.type === 'kills' ? "#ff3030, #ff8c1a, #ffd700" : obj.type === 'collect' ? "#ff8c1a, #ffaa44, #ffd700" : "#cc66ff, #ff8c1a, #ffd700"})`,transition:"width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",boxShadow:"0 0 12px rgba(255,170,68,0.7)"}}>
                  {pct > 95 && <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",animation:"totBarShimmer 1.2s ease-in-out infinite"}}></div>}
                </div>
                {milestones.map(m => (
                  <div key={m} style={{position:"absolute",left:`${m}%`,top:0,bottom:0,width:1,background: pct >= m ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)"}}></div>
                ))}
              </div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:14,color:"#fff",fontWeight:700,minWidth:60,textAlign:"right",textShadow:"0 0 6px rgba(0,0,0,0.8)"}}>{curr}/{target}</div>
            </div>
          );
        })()}
      </div>

      {/* Board */}
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"8px 0",position:"relative",zIndex:2}}>
        <div style={{position:"relative",width:boardWidth,height:boardHeight,background:"rgba(0,0,0,0.55)",border:"2px solid rgba(255,140,30,0.35)",borderRadius:10,boxShadow:"0 0 40px rgba(0,0,0,0.6), inset 0 0 30px rgba(0,0,0,0.4)",animation:isShaking ? "totShake 0.4s ease" : undefined}}>
          {/* Tiles - keyed by stable tile.id so falls animate per-tile */}
          {board.map((row, r) =>
            row.map((tile, c) => {
              if (!tile) return null;
              // Slasher occupies its cell exclusively — skip rendering the tile underneath
              const slasherHere = maskPositions.some(m => m.r === r && m.c === c);
              if (slasherHere) return null;
              const iconDef = TOT_ICONS.find(i => i.id === tile.icon);
              const isSelected = selectedTile && selectedTile.r === r && selectedTile.c === c;
              const isClearing = clearingTiles.has(`${r},${c}`);
              const isHint = hintCells && hintCells.some(h => h.r === r && h.c === c);
              const fall = fellFrom.get(tile.id);
              const colDelay = c * 0.025;
              const fallDistance = fall ? (r - fall.fromR) * tileSize : 0;

              // Live drag visualization — tile being held follows finger, neighbor in that direction shifts opposite
              let dragDx = 0, dragDy = 0;
              let isBeingDragged = false;
              let isSwapPartner = false;
              if (dragOffset) {
                if (dragOffset.r === r && dragOffset.c === c) {
                  // This is the tile being dragged
                  dragDx = dragOffset.dx;
                  dragDy = dragOffset.dy;
                  isBeingDragged = true;
                } else {
                  // Check if this tile is the neighbor being "displaced" by the drag
                  const oR = dragOffset.r, oC = dragOffset.c;
                  // dominant axis lock
                  const ax = Math.abs(dragOffset.dx), ay = Math.abs(dragOffset.dy);
                  if (ax >= ay) {
                    // horizontal drag
                    if (dragOffset.dx > 0 && r === oR && c === oC + 1) { dragDx = -ax; isSwapPartner = true; }
                    if (dragOffset.dx < 0 && r === oR && c === oC - 1) { dragDx = ax;  isSwapPartner = true; }
                  } else {
                    // vertical drag
                    if (dragOffset.dy > 0 && c === oC && r === oR + 1) { dragDy = -ay; isSwapPartner = true; }
                    if (dragOffset.dy < 0 && c === oC && r === oR - 1) { dragDy = ay;  isSwapPartner = true; }
                  }
                }
              }
              return (
                <div
                  key={tile.id}
                  onPointerDown={(e) => { e.currentTarget.setPointerCapture && e.currentTarget.setPointerCapture(e.pointerId); handlePointerDown(r, c, e); }}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={() => { swipeStart.current = null; setSelectedTile(null); setDragOffset(null); }}
                  style={{
                    position:"absolute",
                    left: c * tileSize,
                    top: r * tileSize,
                    width: tileSize,
                    height: tileSize,
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center",
                    fontSize: tileSize * 0.65,
                    cursor:"pointer",
                    touchAction: "none",
                    transform: (isBeingDragged || isSwapPartner) ? `translate(${dragDx}px, ${dragDy}px) ${isBeingDragged ? 'scale(1.12)' : ''}` : undefined,
                    transition: (fall || isClearing || isBeingDragged) ? "none" : isSwapPartner ? "transform 0.05s linear" : "top 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), left 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.15s",
                    background: tile.power === 'colorbomb'
                      ? "radial-gradient(circle, #1a1a1a 0%, #0a0a0a 60%, #000 100%)"
                      : tile.power === 'wrapped'
                        ? "radial-gradient(circle, rgba(255,140,30,0.5) 0%, rgba(180,60,0,0.3) 70%)"
                        : tile.cursed ? "radial-gradient(circle, rgba(80,0,16,0.85) 0%, rgba(40,0,8,0.6) 60%, rgba(20,0,4,0.4) 100%)"
                        : isSelected ? "rgba(255,170,68,0.25)" : "transparent",
                    borderRadius: tile.cursed || tile.power ? 8 : 6,
                    boxShadow: tile.power === 'colorbomb'
                      ? "0 0 24px #ffd700, inset 0 0 16px rgba(255,255,255,0.5)"
                      : tile.power === 'wrapped'
                        ? "0 0 18px #ff8c1a, inset 0 0 12px rgba(255,255,255,0.4)"
                        : tile.cursed
                          ? "inset 0 0 0 2px rgba(255,32,48,0.7), 0 0 14px rgba(255,32,48,0.6)"
                          : isSelected ? "inset 0 0 0 2px #ffaa44" : "none",
                    animation: isClearing
                      ? "totExplode 0.32s ease-out forwards"
                      : fall
                        ? `totFall 0.42s cubic-bezier(0.34, 1.32, 0.40, 1) ${colDelay}s both`
                        : tile.power === 'colorbomb' ? "totColorbombSpin 3s linear infinite"
                        : tile.power ? "totPowerPulse 1s ease-in-out infinite"
                        : tile.cursed ? "totCursedPulse 1.4s ease-in-out infinite"
                        : isHint ? "totHint 0.9s ease-in-out infinite"
                        : (isSelected ? "totSelect 0.7s ease-in-out infinite" : undefined),
                    "--fall-from": `-${fallDistance}px`,
                    filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.5)) drop-shadow(0 0 8px ${tile.power === 'colorbomb' ? "#ffd700" : tile.power ? "#ff8c1a" : tile.cursed ? "#ff2030" : iconDef ? iconDef.color : "#fff"}${tile.power || tile.cursed ? "" : "40"})`,
                    userSelect:"none",
                    zIndex: isClearing ? 4 : isBeingDragged ? 5 : 1,
                  }}
                >
                  {tile.cursed && !tile.power && (
                    <div style={{position:"absolute",top:1,right:3,fontSize:tileSize * 0.22,lineHeight:1,filter:"drop-shadow(0 0 4px #ff2030)"}}>💀</div>
                  )}
                  {tile.power === 'colorbomb'
                    ? <span style={{fontSize:tileSize * 0.7,filter:"drop-shadow(0 0 8px #ffd700)"}}>🌟</span>
                    : tile.power === 'wrapped'
                      ? <>
                          <span style={{fontSize:tileSize * 0.6,filter:`drop-shadow(0 0 8px ${iconDef ? iconDef.color : "#ff6020"})`,position:"relative",zIndex:1}}>{iconDef ? iconDef.emoji : "?"}</span>
                          <span style={{position:"absolute",top:1,right:3,fontSize:tileSize * 0.32,lineHeight:1,filter:"drop-shadow(0 0 4px #ff6020)",zIndex:2}}>💥</span>
                        </>
                      : (tile.power === 'stripe-h' || tile.power === 'stripe-v')
                        ? <span style={{fontSize:tileSize * 0.65,filter:"drop-shadow(0 0 10px #ffd700) drop-shadow(0 0 4px #fff)"}}>{iconDef ? iconDef.emoji : "?"}</span>
                        : (iconDef ? iconDef.emoji : "?")}
                </div>
              );
            })
          )}
          {/* Power tile activation visuals — shooting beams, explosions, color bursts */}
          {powerFires.map(f => {
            if (f.power === 'stripe-h') {
              return (
                <div key={f.key} style={{
                  position:"absolute",
                  left: 0,
                  top: f.r * tileSize + tileSize * 0.2,
                  width: COLS * tileSize,
                  height: tileSize * 0.6,
                  background: "linear-gradient(90deg, transparent 0%, #ffd700 20%, #fff 50%, #ffd700 80%, transparent 100%)",
                  borderRadius: tileSize * 0.3,
                  boxShadow: "0 0 30px #ffd700, 0 0 60px rgba(255,215,0,0.6)",
                  pointerEvents: "none",
                  zIndex: 6,
                  animation: "totStripeFireH 0.6s ease-out forwards",
                  transformOrigin: `${f.c * tileSize + tileSize/2}px center`,
                }} />
              );
            }
            if (f.power === 'stripe-v') {
              return (
                <div key={f.key} style={{
                  position:"absolute",
                  left: f.c * tileSize + tileSize * 0.2,
                  top: 0,
                  width: tileSize * 0.6,
                  height: ROWS * tileSize,
                  background: "linear-gradient(180deg, transparent 0%, #ffd700 20%, #fff 50%, #ffd700 80%, transparent 100%)",
                  borderRadius: tileSize * 0.3,
                  boxShadow: "0 0 30px #ffd700, 0 0 60px rgba(255,215,0,0.6)",
                  pointerEvents: "none",
                  zIndex: 6,
                  animation: "totStripeFireV 0.6s ease-out forwards",
                  transformOrigin: `center ${f.r * tileSize + tileSize/2}px`,
                }} />
              );
            }
            if (f.power === 'wrapped') {
              return (
                <div key={f.key} style={{
                  position:"absolute",
                  left: f.c * tileSize - tileSize * 0.5,
                  top: f.r * tileSize - tileSize * 0.5,
                  width: tileSize * 2,
                  height: tileSize * 2,
                  background: "radial-gradient(circle, #ff8c1a 0%, #ff3030 40%, transparent 80%)",
                  borderRadius: "50%",
                  boxShadow: "0 0 40px #ff8c1a",
                  pointerEvents: "none",
                  zIndex: 6,
                  animation: "totWrappedBlast 0.6s ease-out forwards",
                }} />
              );
            }
            if (f.power === 'colorbomb') {
              return (
                <div key={f.key} style={{
                  position:"absolute",
                  left: f.c * tileSize + tileSize/2 - tileSize * 1.5,
                  top: f.r * tileSize + tileSize/2 - tileSize * 1.5,
                  width: tileSize * 3,
                  height: tileSize * 3,
                  background: "radial-gradient(circle, #fff 0%, #ffd700 30%, #ff8c1a 60%, transparent 90%)",
                  borderRadius: "50%",
                  boxShadow: "0 0 60px #ffd700",
                  pointerEvents: "none",
                  zIndex: 6,
                  animation: "totColorbombBurst 0.7s ease-out forwards",
                }} />
              );
            }
            return null;
          })}
          {/* Blood splatter particles when slashers die */}
          {bloodSplats.map(splat => (
            <div key={splat.key} style={{
              position:"absolute",
              left: splat.x * tileSize + tileSize/2,
              top: splat.y * tileSize + tileSize/2,
              pointerEvents:"none",
              zIndex: 11,
            }}>
              {/* Initial central burst flash */}
              <div style={{
                position:"absolute",
                left:0, top:0,
                width: tileSize * 1.4, height: tileSize * 1.4,
                marginLeft: -tileSize * 0.7, marginTop: -tileSize * 0.7,
                background:"radial-gradient(circle, #ff0020 0%, #800010 40%, transparent 75%)",
                borderRadius:"50%",
                animation:"totBloodBurst 0.5s ease-out forwards",
                filter:"drop-shadow(0 0 12px #ff0020)",
              }} />
              {/* Splatter droplets */}
              {splat.particles.map(p => (
                <div key={p.id} style={{
                  position:"absolute",
                  left:0, top:0,
                  width: p.size, height: p.size,
                  marginLeft: -p.size/2, marginTop: -p.size/2,
                  background: p.chunk
                    ? "radial-gradient(circle, #b00018 0%, #5a000c 70%)"
                    : "radial-gradient(circle, #d6001a 0%, #800010 70%)",
                  borderRadius: p.chunk ? "40%" : "50%",
                  boxShadow: p.chunk
                    ? "0 0 6px rgba(180,0,24,0.8), inset 0 0 4px rgba(0,0,0,0.6)"
                    : "0 0 4px rgba(180,0,24,0.7)",
                  filter: "drop-shadow(0 0 3px rgba(120,0,16,0.9))",
                  "--angle": `${p.angle}deg`,
                  "--distance": `${p.distance}px`,
                  animation: `totBloodSplat ${p.dur}s cubic-bezier(0.2, 0.6, 0.4, 1) ${p.delay}s forwards`,
                  opacity: 0,
                }} />
              ))}
              {/* Lingering blood pool that fades */}
              <div style={{
                position:"absolute",
                left:0, top:0,
                width: tileSize * 1.6, height: tileSize * 0.6,
                marginLeft: -tileSize * 0.8, marginTop: -tileSize * 0.1,
                background:"radial-gradient(ellipse, rgba(180,0,24,0.7) 0%, rgba(80,0,12,0.3) 60%, transparent 90%)",
                borderRadius:"50%",
                animation:"totBloodPool 1.6s ease-out forwards",
                filter:"blur(2px)",
              }} />
            </div>
          ))}
          {/* Floating score texts that rise from cells */}
          {floaters.map(f => (
            <div key={f.key} style={{
              position:"absolute",
              left: f.x * tileSize + tileSize/2,
              top: f.y * tileSize + tileSize/2,
              fontFamily:"'Jolly Lodger',serif",
              fontSize: tileSize * 0.7,
              color: f.color,
              textShadow:`0 0 12px ${f.color}, 2px 2px 0 #000, 0 0 4px #000`,
              fontWeight:700,
              pointerEvents:"none",
              zIndex: 8,
              animation:"totFloater 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
              whiteSpace:"nowrap",
            }}>{f.text}</div>
          ))}
          {/* Power tile birth animation — sparkles + zoom */}
          {powerBirths.map(b => (
            <div key={b.key} style={{
              position:"absolute",
              left: b.c * tileSize + tileSize/2,
              top: b.r * tileSize + tileSize/2,
              pointerEvents:"none",
              zIndex: 9,
            }}>
              {/* Big ring */}
              <div style={{
                position:"absolute",
                left:0,top:0,
                width: tileSize * 1.5, height: tileSize * 1.5,
                marginLeft: -tileSize * 0.75, marginTop: -tileSize * 0.75,
                borderRadius:"50%",
                border: `3px solid ${b.power === 'colorbomb' ? "#ffd700" : b.power === 'wrapped' ? "#ff8c1a" : "#ffd700"}`,
                boxShadow: `0 0 30px ${b.power === 'colorbomb' ? "#ffd700" : "#ff8c1a"}`,
                animation: "totPowerBirthRing 0.6s cubic-bezier(0.18,0.89,0.32,1.28) forwards",
              }} />
              {/* Bright burst */}
              <div style={{
                position:"absolute",
                left:0,top:0,
                width: tileSize * 1.2, height: tileSize * 1.2,
                marginLeft: -tileSize * 0.6, marginTop: -tileSize * 0.6,
                background: `radial-gradient(circle, #fff 0%, ${b.power === 'colorbomb' ? "#ffd700" : "#ff8c1a"} 50%, transparent 80%)`,
                borderRadius:"50%",
                animation: "totPowerBirth 0.6s cubic-bezier(0.18,0.89,0.32,1.28) forwards",
              }} />
              {/* Sparkle particles */}
              {Array.from({length: 8}).map((_, i) => {
                const angle = (i / 8) * 360;
                return (
                  <div key={i} style={{
                    position:"absolute",
                    left:0, top:0,
                    fontSize: tileSize * 0.4,
                    transform:`translate(-50%,-50%) rotate(${angle}deg) translateX(${tileSize}px)`,
                    animation:"totRadiate 0.6s ease-out forwards",
                    "--angle":`${angle}deg`,
                    "--distance":`${tileSize * 1.6}px`,
                  }}>✨</div>
                );
              })}
            </div>
          ))}
          {/* Freeze overlay — board flashes brighter during power tile birth */}
          {freezing && (
            <div style={{
              position:"absolute",
              inset:0,
              pointerEvents:"none",
              zIndex: 7,
              background:"radial-gradient(circle at center, rgba(255,255,255,0.18) 0%, transparent 70%)",
              animation:"totFreezeOverlay 0.6s ease-in-out",
            }} />
          )}
          {/* Burst overlays on each clearing tile */}
          {Array.from(clearingTiles).map(key => {
            const [r, c] = key.split(',').map(Number);
            return (
              <div
                key={`burst-${key}`}
                style={{
                  position:"absolute",
                  left: c * tileSize + tileSize / 2,
                  top: r * tileSize + tileSize / 2,
                  width: tileSize * 1.4,
                  height: tileSize * 1.4,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,170,68,0.6) 30%, rgba(255,140,30,0.3) 60%, transparent 80%)",
                  pointerEvents:"none",
                  animation: "totBurst 0.4s ease-out forwards",
                  zIndex: 3,
                }}
              />
            );
          })}
          {/* Blood trail cells — locked tiles where slashers passed through */}
          {Array.from(bloodTrails.keys()).map(key => {
            const [r, c] = key.split(',').map(Number);
            return (
              <div
                key={`blood-${key}`}
                style={{
                  position:"absolute",
                  left: c * tileSize,
                  top: r * tileSize,
                  width: tileSize,
                  height: tileSize,
                  pointerEvents:"none",
                  zIndex: 1,
                  borderRadius: 6,
                  border: "1.5px solid rgba(180,0,16,0.7)",
                  boxShadow: "inset 0 0 12px rgba(120,0,16,0.7), 0 0 8px rgba(180,0,16,0.4)",
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center",
                  fontSize: tileSize * 0.45,
                  animation: "totBloodTrailPulse 1.6s ease-in-out infinite",
                  filter: "drop-shadow(0 0 4px #800010)",
                }}
              >🩸</div>
            );
          })}
          {/* Mask(s) — slashers descending. Always skull, occupying its own cell. */}
          {maskPositions.map((m) => {
            if (m.r >= ROWS) return null;
            const hp = m.hp != null ? m.hp : 1;
            const maxHp = m.maxHp != null ? m.maxHp : hp;
            const showHp = maxHp > 1;
            return (
              <div
                key={m.id}
                style={{
                  position:"absolute",
                  left: m.c * tileSize,
                  top: m.r * tileSize,
                  width: tileSize,
                  height: tileSize,
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center",
                  fontSize: tileSize * 0.85,
                  pointerEvents:"none",
                  zIndex:2,
                  transition:"top 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), left 0.4s ease",
                  filter: "drop-shadow(0 0 8px #000) drop-shadow(0 0 18px #ff3030) drop-shadow(0 0 6px #ff3030)",
                  animation: "totPulse 1.2s ease-in-out infinite",
                  background: "radial-gradient(circle, rgba(80,0,0,0.95) 0%, rgba(40,0,0,0.7) 50%, rgba(20,0,0,0.4) 80%)",
                  borderRadius: 8,
                  border: "1.5px solid rgba(255,48,48,0.5)",
                  boxShadow: "0 0 18px rgba(255,48,48,0.5), inset 0 0 16px rgba(0,0,0,0.6)",
                }}
              >
                <span style={{textShadow:"0 0 8px #ff3030, 0 0 4px #000"}}>💀</span>
                {showHp && (
                  <div style={{position:"absolute",top:-Math.max(11, tileSize * 0.32),left:0,right:0,display:"flex",justifyContent:"center",gap:1,fontSize:Math.max(8, tileSize * 0.22),lineHeight:1,filter:"drop-shadow(0 0 3px #000)"}}>
                    {Array.from({length: maxHp}).map((_, i) => (
                      <span key={i} style={{opacity: i < hp ? 1 : 0.25}}>{i < hp ? "❤️" : "🖤"}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {/* Threat indicator: red column highlighting the slasher's path */}
          {maskPositions.map((m) => {
            if (m.r >= ROWS) return null;
            const slasher = TOT_SLASHER_POOL[m.slasherIdx ?? 0] || { color: lvl.maskColor };
            return (
              <div
                key={`threat-${m.id}`}
                style={{
                  position:"absolute",
                  left: m.c * tileSize,
                  top: 0,
                  width: tileSize,
                  height: ROWS * tileSize,
                  background: `linear-gradient(180deg, ${slasher.color}10 0%, ${slasher.color}30 ${(m.r / ROWS) * 100}%, transparent 100%)`,
                  pointerEvents:"none",
                  zIndex:0,
                  transition:"left 0.4s ease",
                }}
              />
            );
          })}
          {/* Combo text overlay */}
          {comboText && (
            <div key={comboText.key} style={{position:"absolute",left:"50%",top:"50%",fontFamily:"'Jolly Lodger',serif",fontSize:42,color:"#ffd700",letterSpacing:4,textShadow:"0 0 20px rgba(255,215,0,0.8), 3px 3px 0 #000",pointerEvents:"none",animation:"totCombo 1.2s ease-out forwards",zIndex:5}}>
              {comboText.text}
            </div>
          )}
        </div>
      </div>

      {/* SLASHER KILL CELEBRATION OVERLAY — blood/red themed */}
      {killCelebration && (
        <div key={killCelebration.key} style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:50,display:"flex",alignItems:"center",justifyContent:"center"}}>
          {/* Red blood-burst flash */}
          <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at center, rgba(255,30,30,0.55) 0%, rgba(120,0,0,0.3) 30%, transparent 70%)",animation:"totKillFlash 1.8s ease-out forwards"}} />
          {/* Blood splatter particles radiating outward */}
          {Array.from({length: 18}).map((_, i) => {
            const angle = (i / 18) * 360;
            const distance = 240 + (i % 3) * 50;
            const emoji = ["🩸","💀","🔪","💢","✖"][i % 5];
            return (
              <div
                key={i}
                style={{
                  position:"absolute",
                  left:"50%",
                  top:"50%",
                  fontSize: 24 + (i % 4) * 6,
                  transform: "translate(-50%,-50%)",
                  animation: "totRadiate 1.4s cubic-bezier(0.18,0.89,0.32,1.28) forwards",
                  animationDelay: `${(i % 3) * 0.05}s`,
                  "--angle": `${angle}deg`,
                  "--distance": `${distance}px`,
                  filter: "drop-shadow(0 0 12px #ff2020)",
                }}
              >
                {emoji}
              </div>
            );
          })}
          {/* Big text */}
          <div style={{position:"relative",textAlign:"center",animation:"totKillZoom 1.8s cubic-bezier(0.18,0.89,0.32,1.28) forwards",maxWidth:"92vw",padding:"0 8px"}}>
            <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:"clamp(40px, 13vw, 72px)",color:"#ff3030",letterSpacing:"clamp(2px, 1vw, 5px)",textShadow:"0 0 40px rgba(255,30,30,1), 0 0 20px rgba(120,0,0,0.8), 4px 4px 0 #1a0000",lineHeight:1}}>
              SLAUGHTERED!
            </div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:"clamp(10px, 3vw, 13px)",color:"#ffaa44",letterSpacing:"clamp(2px, 1vw, 4px)",marginTop:12,fontWeight:700,textShadow:"0 0 12px rgba(255,170,68,0.9), 2px 2px 0 #000"}}>
              SLASHER DEFEATED
            </div>
            <div style={{display:"flex",justifyContent:"center",gap:"clamp(12px, 4vw, 24px)",marginTop:12,flexWrap:"wrap"}}>
              <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:"clamp(22px, 7vw, 32px)",color:"#ffd700",letterSpacing:2,textShadow:"0 0 20px rgba(255,215,0,0.9), 2px 2px 0 #000"}}>+200</div>
              <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:"clamp(22px, 7vw, 32px)",color:"#60ff60",letterSpacing:2,textShadow:"0 0 20px rgba(96,255,96,0.9), 2px 2px 0 #000"}}>+15s ⏱</div>
            </div>
          </div>
        </div>
      )}

      {/* SPECTACULAR 5+ MATCH CELEBRATION OVERLAY */}
      {bigCelebration && (
        <div key={bigCelebration.key} style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:50,display:"flex",alignItems:"center",justifyContent:"center"}}>
          {/* Flash background */}
          <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at center, rgba(255,215,0,0.4) 0%, rgba(255,140,30,0.2) 30%, transparent 70%)",animation:"totBigFlash 2.4s ease-out forwards"}} />
          {/* Radiating particles */}
          {Array.from({length: 24}).map((_, i) => {
            const angle = (i / 24) * 360;
            const distance = 280 + (i % 3) * 60;
            const emoji = ["⭐","✨","🎃","🍬","💥","🌟"][i % 6];
            return (
              <div
                key={i}
                style={{
                  position:"absolute",
                  left:"50%",
                  top:"50%",
                  fontSize: 28 + (i % 4) * 6,
                  transform: `translate(-50%,-50%)`,
                  animation: `totRadiate 1.6s cubic-bezier(0.18,0.89,0.32,1.28) forwards`,
                  animationDelay: `${(i % 4) * 0.06}s`,
                  "--angle": `${angle}deg`,
                  "--distance": `${distance}px`,
                  filter: "drop-shadow(0 0 12px #ffd700)",
                }}
              >
                {emoji}
              </div>
            );
          })}
          {/* Big text */}
          <div style={{position:"relative",textAlign:"center",animation:"totBigZoom 2.4s cubic-bezier(0.18,0.89,0.32,1.28) forwards",maxWidth:"92vw",padding:"0 8px"}}>
            <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:"clamp(36px, 11vw, 64px)",color:"#ffd700",letterSpacing:"clamp(2px, 1vw, 5px)",textShadow:"0 0 40px rgba(255,215,0,1), 0 0 20px rgba(255,140,30,0.8), 4px 4px 0 #1a0d2e",lineHeight:1}}>
              {bigCelebration.size >= 6 ? "ULTRA!" : "SPOOKTACULAR!"}
            </div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:"clamp(11px, 3.5vw, 16px)",color:"#ffaa44",letterSpacing:"clamp(2px, 1vw, 5px)",marginTop:10,fontWeight:700,textShadow:"0 0 12px rgba(255,170,68,0.9), 2px 2px 0 #000"}}>
              {bigCelebration.size}-MATCH BONUS
            </div>
            <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:"clamp(28px, 9vw, 42px)",color:"#fff",letterSpacing:3,marginTop:8,textShadow:"0 0 24px rgba(255,255,255,0.9), 3px 3px 0 #000"}}>
              +{bigCelebration.points}
            </div>
          </div>
        </div>
      )}

      {/* Footer hint */}
      <div style={{padding:"8px 16px 14px",display:"flex",alignItems:"center",justifyContent:"center",gap:14,position:"relative",zIndex:3}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"rgba(255,200,100,0.4)",letterSpacing:3,textAlign:"center"}}>
          {selectedTile ? "SWIPE TO SWAP" : "SWIPE A CANDY IN ANY DIRECTION"}
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// SLASHER MYSTERY — 12×12 neon-vector board (replaces old 6×6 modal)
// 7 rooms (Cabin, Boiler Room, Forest, Basement, Asylum, Lake, High School)
// Walled hallway paths, 2d6 dice, exact-roll BFS pathfinding, animated
// piece movement. Pieces stop ON the door cell (not the interior).
// =====================================================================

const SM_ROWS = 11, SM_COLS = 11;

// Clue-style layout: 8 rooms around the perimeter + central evidence file (non-enterable).
// Grid is 11×11 with 3×3 room blocks separated by 1-cell hallway corridors.
//
//   COL:  0 1 2  3  4 5 6  7  8 9 10
//   ROW 0   CABIN     BOILER    MORGUE     (top: 3 rooms)
//   ROW 3              hallway
//   ROW 4   FOREST   EVIDENCE   ASYLUM     (mid: 2 rooms + center file)
//   ROW 7              hallway
//   ROW 8   LAKE     HIGHSCHOOL  BASEMENT  (bottom: 3 rooms)
//
// Each room has 1-2 doors on its perimeter facing the hallway. Evidence has no doors —
// pieces can never enter it; it just holds the case file thematically (in the actual game,
// the killer/location/weapon cards live in `match.envelope` — Evidence is purely visual).
const SM_ROOMS = {
  cabin:      { name: "CABIN",       emoji: "🛖",  rect: { r1: 0, c1: 0,  r2: 2,  c2: 2  }, doors: [{ r: 2, c: 2 }],   neon: "#FF6B35", secretPassageTo: "basement" },
  boilerroom: { name: "BOILER ROOM", emoji: "🔥",  rect: { r1: 0, c1: 4,  r2: 2,  c2: 6  }, doors: [{ r: 2, c: 4 }, { r: 2, c: 6 }], neon: "#FF2D2D" },
  morgue:     { name: "MORGUE",      emoji: "⚰️", rect: { r1: 0, c1: 8,  r2: 2,  c2: 10 }, doors: [{ r: 2, c: 8 }],   neon: "#88AABB", secretPassageTo: "lake" },
  forest:     { name: "FOREST",      emoji: "🌲",  rect: { r1: 4, c1: 0,  r2: 6,  c2: 2  }, doors: [{ r: 4, c: 2 }, { r: 6, c: 2 }], neon: "#1FB874" },
  evidence:   { name: "EVIDENCE",    emoji: "📁", rect: { r1: 4, c1: 4,  r2: 6,  c2: 6  }, doors: [], neon: "#FFEB33", isEvidence: true },
  asylum:     { name: "ASYLUM",      emoji: "🏚️", rect: { r1: 4, c1: 8,  r2: 6,  c2: 10 }, doors: [{ r: 4, c: 8 }, { r: 6, c: 8 }], neon: "#A0A0A0" },
  lake:       { name: "LAKE",        emoji: "🌊",  rect: { r1: 8, c1: 0,  r2: 10, c2: 2  }, doors: [{ r: 8, c: 2 }],   neon: "#1FA8FF", secretPassageTo: "morgue" },
  highschool: { name: "HIGH SCHOOL", emoji: "🏫", rect: { r1: 8, c1: 4,  r2: 10, c2: 6  }, doors: [{ r: 8, c: 4 }, { r: 8, c: 6 }], neon: "#FFD700" },
  basement:   { name: "BASEMENT",    emoji: "📦",  rect: { r1: 8, c1: 8,  r2: 10, c2: 10 }, doors: [{ r: 8, c: 8 }],   neon: "#B847FF", secretPassageTo: "cabin" },
};

// Build the 12×12 cell grid. Type ∈ {'hall','room','door'} + roomId for room/door cells.
function smBuildBoard() {
  const cells = [];
  for (let r = 0; r < SM_ROWS; r++) {
    cells.push([]);
    for (let c = 0; c < SM_COLS; c++) cells[r].push({ r, c, type: 'hall', roomId: null });
  }
  for (const [id, room] of Object.entries(SM_ROOMS)) {
    const { r1, c1, r2, c2 } = room.rect;
    for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) { cells[r][c].type = 'room'; cells[r][c].roomId = id; }
    for (const d of room.doors) { cells[d.r][d.c].type = 'door'; cells[d.r][d.c].roomId = id; }
  }
  return cells;
}
const SM_CELLS = smBuildBoard();

// 4-dir neighbors with wall rules. Room interiors are impassable; doors connect to halls
// and to other doors of the same room (via interior walking, but we don't render that path).
function smNeighbors(r, c) {
  const out = [];
  for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
    const nr = r + dr, nc = c + dc;
    if (nr < 0 || nr >= SM_ROWS || nc < 0 || nc >= SM_COLS) continue;
    const cur = SM_CELLS[r][c]; const next = SM_CELLS[nr][nc];
    if (next.type === 'room') continue;
    if (cur.type === 'door' && next.type === 'door' && cur.roomId !== next.roomId) continue;
    out.push([nr, nc]);
  }
  return out;
}

// BFS giving distance + parent map for shortest-path reconstruction.
function smBFS(startR, startC) {
  const dist = new Map(), parent = new Map();
  const q = [[startR, startC]]; dist.set(`${startR},${startC}`, 0);
  while (q.length) {
    const [r, c] = q.shift();
    for (const [nr, nc] of smNeighbors(r, c)) {
      const k = `${nr},${nc}`;
      if (!dist.has(k)) { dist.set(k, dist.get(`${r},${c}`) + 1); parent.set(k, `${r},${c}`); q.push([nr, nc]); }
    }
  }
  return { dist, parent };
}

// Cells reachable for a roll. Clue rule: exact roll for hall stops, OR any door at dist ≤ roll
// (entering a room can use extra movement). Cannot stay on current cell.
function smReachable(startR, startC, roll) {
  const { dist } = smBFS(startR, startC);
  const set = new Set();
  for (const [k, d] of dist.entries()) {
    if (k === `${startR},${startC}`) continue;
    const [r, c] = k.split(',').map(Number); const cell = SM_CELLS[r][c];
    if (d === roll) set.add(k);
    else if (cell.type === 'door' && d > 0 && d <= roll) set.add(k);
  }
  return set;
}

// Reconstruct shortest path start → (tr,tc), inclusive of both endpoints.
function smPath(startR, startC, tr, tc) {
  const { parent } = smBFS(startR, startC);
  const path = [[tr, tc]]; let cur = `${tr},${tc}`;
  while (cur !== `${startR},${startC}`) {
    const p = parent.get(cur); if (!p) return null;
    const [r, c] = p.split(',').map(Number); path.unshift([r, c]); cur = p;
  }
  return path;
}

// First door cell of a room (used for "where does my piece sit when in this room").
function smDoorOf(roomId) { const r = SM_ROOMS[roomId]; return r ? (r.doors[0] || null) : null; }

// Per-player piece visuals — distinct color + shape per player ID so each is identifiable on the board.
// 0 = human (red triangle, biggest). Bots 1-3 = each a unique color + shape, slightly smaller.
const SM_PIECES = {
  0: { color: "#ff3030", shape: "triangle", name: "YOU" },
  1: { color: "#3399ff", shape: "circle",   name: "BLUE" },
  2: { color: "#33dd66", shape: "square",   name: "GREEN" },
  3: { color: "#cc55ff", shape: "diamond",  name: "PURPLE" },
};

// Render the SVG body of a piece (used inline on the board).
function smPieceSVG(playerId, sizePct = "85%") {
  const meta = SM_PIECES[playerId] || SM_PIECES[0];
  const { color, shape } = meta;
  const filter = `drop-shadow(0 0 6px ${color}) drop-shadow(0 0 3px #ffffff)`;
  if (shape === "triangle") return (
    <svg viewBox="0 0 20 20" style={{width:sizePct,height:sizePct,filter}}>
      <polygon points="10,2 18,17 2,17" fill={color} stroke="#ffffff" strokeWidth="0.8" />
      <polygon points="10,5 16,15 4,15" fill="#ffffff" opacity="0.6" />
      <circle cx="10" cy="11" r="1.6" fill="#ffeb33" />
    </svg>
  );
  if (shape === "circle") return (
    <svg viewBox="0 0 20 20" style={{width:sizePct,height:sizePct,filter}}>
      <circle cx="10" cy="10" r="7" fill={color} stroke="#ffffff" strokeWidth="0.8" />
      <circle cx="10" cy="10" r="4.5" fill="#ffffff" opacity="0.55" />
      <circle cx="10" cy="10" r="2" fill={color} />
    </svg>
  );
  if (shape === "square") return (
    <svg viewBox="0 0 20 20" style={{width:sizePct,height:sizePct,filter}}>
      <rect x="3.5" y="3.5" width="13" height="13" fill={color} stroke="#ffffff" strokeWidth="0.8" />
      <rect x="6.5" y="6.5" width="7" height="7" fill="#ffffff" opacity="0.55" />
      <rect x="8.5" y="8.5" width="3" height="3" fill={color} />
    </svg>
  );
  if (shape === "diamond") return (
    <svg viewBox="0 0 20 20" style={{width:sizePct,height:sizePct,filter}}>
      <polygon points="10,2 18,10 10,18 2,10" fill={color} stroke="#ffffff" strokeWidth="0.8" />
      <polygon points="10,6 14,10 10,14 6,10" fill="#ffffff" opacity="0.55" />
    </svg>
  );
  return null;
}

// 80s neon-vector die. Renders pip pattern for 1-6, glows red, shakes when rolling.
function SMNeonDie({ value, rolling }) {
  // Pip layout for each face (positions in a 3x3 grid)
  const PIPS = {
    1: [[1,1]],
    2: [[0,0],[2,2]],
    3: [[0,0],[1,1],[2,2]],
    4: [[0,0],[0,2],[2,0],[2,2]],
    5: [[0,0],[0,2],[1,1],[2,0],[2,2]],
    6: [[0,0],[0,2],[1,0],[1,2],[2,0],[2,2]],
  };
  const pips = PIPS[value] || [];
  return (
    <div style={{
      width:42,height:42,
      border:"1.5px solid #ff3030",
      borderRadius:5,
      background:"#0a0000",
      boxShadow:"0 0 10px rgba(255,40,40,0.7), inset 0 0 6px rgba(255,40,40,0.2)",
      display:"grid",gridTemplateColumns:"repeat(3,1fr)",gridTemplateRows:"repeat(3,1fr)",
      padding:5,gap:1,
      animation: rolling ? "smDiceShake 0.1s linear infinite" : undefined,
    }}>
      {Array.from({length:9}).map((_, i) => {
        const r = Math.floor(i/3), c = i%3;
        const has = pips.some(([pr,pc]) => pr===r && pc===c);
        return (
          <div key={i} style={{
            width:"100%",height:"100%",
            display:"flex",alignItems:"center",justifyContent:"center",
          }}>
            {has && <div style={{width:"75%",height:"75%",borderRadius:"50%",background:"#ff4040",boxShadow:"0 0 4px #ff4040"}} />}
          </div>
        );
      })}
    </div>
  );
}

// =====================================================================
// SLASHER MYSTERY — save/load. Auto-saves on every state change. On entry,
// offers to resume the saved game or start fresh.
// =====================================================================
const SM_SAVE_KEY = "sinister.mystery.save.v1";

// Serialize match — convert any Set fields (knownCards on bots) to arrays so JSON works.
function smSerializeMatch(match) {
  if (!match) return null;
  return {
    ...match,
    players: match.players.map(p => ({
      ...p,
      knownCards: p.knownCards instanceof Set ? Array.from(p.knownCards) : (p.knownCards || []),
    })),
  };
}
function smDeserializeMatch(match) {
  if (!match) return null;
  return {
    ...match,
    players: match.players.map(p => ({
      ...p,
      knownCards: new Set(Array.isArray(p.knownCards) ? p.knownCards : []),
    })),
  };
}

async function smSaveGame(state) {
  try {
    const payload = {
      v: 1,
      ts: Date.now(),
      match: smSerializeMatch(state.match),
      notebook: state.notebook,
      phase: state.phase,
      playerRoom: state.playerRoom,
      playerPos: state.playerPos,
      botRooms: state.botRooms,
      botPositions: state.botPositions,
      hasMoved: state.hasMoved,
      diceValue: state.diceValue,
      die1: state.die1,
      die2: state.die2,
      awaitingEndTurn: state.awaitingEndTurn,
      // Don't save in-flight UI flags: showBoard, showSheet, pendingShow, chooseCardToShow,
      // animPath, animStep, bloodTrail, dialogs. They reset cleanly on resume.
    };
    await Storage.set(SM_SAVE_KEY, JSON.stringify(payload));
  } catch(e) { /* ignore — save is best-effort */ }
}

async function smLoadGame() {
  try {
    const raw = await Storage.get(SM_SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.v !== 1) return null;
    return {
      ...data,
      match: smDeserializeMatch(data.match),
    };
  } catch(e) { return null; }
}

async function smClearSave() {
  try { await Storage.remove(SM_SAVE_KEY); } catch(e) {}
}

function SlasherMystery({ onExit, savedName, onWin }) {
  const [match, setMatch] = useState(null);
  const [phase, setPhase] = useState("intro"); // intro | playing | revealing | won | lost | accusing
  const [savedGame, setSavedGame] = useState(null); // populated on mount if a save exists
  const [pendingShow, setPendingShow] = useState(null); // {by, card, suggestion} when bot shows you a card
  const [suggestion, setSuggestion] = useState({ killer: null, location: null, weapon: null });
  const [accusation, setAccusation] = useState({ killer: null, location: null, weapon: null });
  const [notebook, setNotebook] = useState(null);
  const [showAccuseDialog, setShowAccuseDialog] = useState(false);
  const [showSuggestDialog, setShowSuggestDialog] = useState(false);
  // Mini-board state for Clue-style movement
  const [playerRoom, setPlayerRoom] = useState("basement"); // start in center
  const [botRooms, setBotRooms] = useState({}); // playerId -> roomId
  const [showBoard, setShowBoard] = useState(false); // modal open during player turn
  const [showSheet, setShowSheet] = useState(false); // peek your hand during dice/move phase
  // When a BOT suggests and the human has multiple matching cards, we pause the bot's turn
  // and ask the human which card to reveal. Stores: { askingBot, suggestion, matches } or null.
  const [chooseCardToShow, setChooseCardToShow] = useState(null);
  // After a suggestion result is shown, the player can take time to mark their notebook.
  // While true, the main screen shows a prominent "END TURN" button instead of auto-advancing.
  const [awaitingEndTurn, setAwaitingEndTurn] = useState(false);
  const [diceValue, setDiceValue] = useState(0); // 0 = not yet rolled, otherwise 2d6 sum
  const [die1, setDie1] = useState(0); // individual dice for visual (0 means hidden)
  const [die2, setDie2] = useState(0);
  const [hasMoved, setHasMoved] = useState(false); // can only move once per turn after rolling
  const [diceRolling, setDiceRolling] = useState(false);
  // Piece coordinate state for the 12×12 board. (r,c) of player + each bot.
  // Derived from playerRoom on first open; updated when player moves on board.
  const [playerPos, setPlayerPos] = useState(() => smDoorOf("basement") || { r: 4, c: 5 });
  const [botPositions, setBotPositions] = useState({}); // playerId -> {r,c}
  // Animation: when player taps a destination, we walk the path one step at a time.
  const [animPath, setAnimPath] = useState(null); // [[r,c], ...] or null
  const [animStep, setAnimStep] = useState(0); // index into animPath
  const [bloodTrail, setBloodTrail] = useState([]); // recent path cells, fade over time
  const playerName = (savedName && savedName.trim()) || "Anonymous";

  const startMatch = () => {
    const m = initMatch(playerName);
    setMatch(m);
    setNotebook(emptyNotebook(m.players[0].hand));
    setPhase("playing");
    setSuggestion({ killer: null, location: null, weapon: null });
    setAccusation({ killer: null, location: null, weapon: null });
    setPendingShow(null);
    // Place player + bots each in a UNIQUE random room (no stacking on init).
    // Evidence excluded — it has no doors.
    const roomIds = Object.keys(SM_ROOMS).filter(id => !SM_ROOMS[id].isEvidence);
    const shuffled = [...roomIds].sort(() => Math.random() - 0.5);
    const startRoom = shuffled[0];
    setPlayerRoom(startRoom);
    const startDoor = smDoorOf(startRoom);
    if (startDoor) setPlayerPos({ r: startDoor.r, c: startDoor.c });
    const bRooms = {};
    const bPos = {};
    let nextRoomIdx = 1;
    m.players.forEach(p => {
      if (p.isBot) {
        const rid = shuffled[nextRoomIdx % shuffled.length]; // unique room per bot
        nextRoomIdx++;
        bRooms[p.id] = rid;
        const d = smDoorOf(rid);
        if (d) bPos[p.id] = { r: d.r, c: d.c };
      }
    });
    setBotRooms(bRooms);
    setBotPositions(bPos);
    setDiceValue(0); setDie1(0); setDie2(0);
    setHasMoved(false);
    setShowBoard(false);
    setAnimPath(null); setAnimStep(0); setBloodTrail([]);
    smClearSave(); // wipe any leftover save when starting fresh
  };

  // On mount: check if a saved game exists. If so, expose it via savedGame state so
  // the intro screen can offer a RESUME button.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = await smLoadGame();
      if (cancelled) return;
      // Only offer resume if game wasn't finished
      if (saved && saved.match && saved.match.status !== "done" && saved.phase === "playing") {
        setSavedGame(saved);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Resume from saved state — restores all game state and jumps to "playing"
  const resumeMatch = () => {
    if (!savedGame) return;
    setMatch(savedGame.match);
    setNotebook(savedGame.notebook);
    setPlayerRoom(savedGame.playerRoom);
    setPlayerPos(savedGame.playerPos);
    setBotRooms(savedGame.botRooms);
    setBotPositions(savedGame.botPositions);
    setHasMoved(savedGame.hasMoved);
    setDiceValue(savedGame.diceValue);
    setDie1(savedGame.die1 || 0);
    setDie2(savedGame.die2 || 0);
    setAwaitingEndTurn(savedGame.awaitingEndTurn || false);
    setSuggestion({ killer: null, location: null, weapon: null });
    setAccusation({ killer: null, location: null, weapon: null });
    setPendingShow(null);
    setChooseCardToShow(null);
    setShowBoard(false);
    setAnimPath(null); setAnimStep(0); setBloodTrail([]);
    setPhase("playing");
    setSavedGame(null);
  };

  // Auto-save — runs whenever meaningful game state changes during play.
  useEffect(() => {
    if (phase !== "playing" || !match) return;
    if (match.status === "done") return; // don't save finished games
    smSaveGame({
      match, notebook, phase, playerRoom, playerPos, botRooms, botPositions,
      hasMoved, diceValue, die1, die2, awaitingEndTurn,
    });
  }, [match, notebook, phase, playerRoom, playerPos, botRooms, botPositions, hasMoved, diceValue, die1, die2, awaitingEndTurn]);

  // Auto-open the mini board modal when it's the player's turn (and we haven't moved yet)
  useEffect(() => {
    if (!match || phase !== "playing") return;
    if (pendingShow) return; // don't open while resolving a shown card
    const me = match.players[0];
    if (match.turnIdx === 0 && !me.eliminated && !hasMoved) {
      setShowBoard(true);
      setDiceValue(0);
    }
  }, [match, phase, pendingShow, hasMoved]);

  // Step-walk animation: when animPath is set, advance one cell every 180ms.
  // Each step also adds the cell to bloodTrail (which fades visually).
  useEffect(() => {
    if (!animPath || animStep >= animPath.length) return;
    const t = setTimeout(() => {
      const [r, c] = animPath[animStep];
      setPlayerPos({ r, c });
      setBloodTrail(t => [...t, { r, c, t: Date.now() }].slice(-10));
      try { GameSFX.smCardSelect && GameSFX.smCardSelect(); } catch(e){}
      // If we just stepped onto a door, update playerRoom (so suggest dialog knows where we are)
      const cell = SM_CELLS[r][c];
      if (cell.type === 'door' && cell.roomId) setPlayerRoom(cell.roomId);
      else if (cell.type === 'hall') {
        // In a hallway — clear playerRoom so the suggest button knows we're not in a room
        // We use a sentinel value 'hallway' so we don't break suggest-from-here logic
        // (the suggest button just won't render when not in a room)
        setPlayerRoom('hallway');
      }
      const nextStep = animStep + 1;
      if (nextStep >= animPath.length) {
        // Animation complete
        setAnimPath(null);
        setAnimStep(0);
        setHasMoved(true);
        // Auto-close the board after a brief pause so player sees their final position
        setTimeout(() => setShowBoard(false), 700);
      } else {
        setAnimStep(nextStep);
      }
    }, 180);
    return () => clearTimeout(t);
  }, [animPath, animStep]);

  // Drive bot turns automatically with a delay so it feels like they're thinking
  useEffect(() => {
    if (!match || phase !== "playing") return;
    const current = match.players[match.turnIdx];
    if (!current || !current.isBot || current.eliminated) return;
    // Audible cue that a bot turn is starting
    try { GameSFX.smBotTurn(); } catch(e) {}
    // Bot's turn — schedule its action
    const t = setTimeout(() => {
      const bot = current;
      // First: should bot accuse?
      const accuse = botShouldAccuse(bot);
      if (accuse) {
        const correct = accuse.killer === match.caseFile.killer && accuse.location === match.caseFile.location && accuse.weapon === match.caseFile.weapon;
        try { GameSFX.smAccuse(); } catch(e) {}
        const logEntry = {
          type: "accusation",
          by: bot.name,
          accusation: accuse,
          correct,
        };
        setMatch(prev => {
          const next = { ...prev, log: [...prev.log, logEntry] };
          if (correct) {
            next.status = "done";
            next.winner = bot.name;
          } else {
            // Mark bot as eliminated
            next.players = next.players.map(p => p.id === bot.id ? { ...p, eliminated: true } : p);
            // Advance turn
            next.turnIdx = nextActiveTurnIdx(next, bot.id);
          }
          return next;
        });
        if (correct) {
          setPhase("lost");
          smClearSave();
          try { setTimeout(() => GameSFX.smLose(), 500); } catch(e) {}
        }
        return;
      }
      // Otherwise: make a suggestion
      try { GameSFX.smSuggest(); } catch(e) {}
      const sug = botMakeSuggestion(bot);
      // Move bot's token on the board to match the location they're suggesting
      setBotRooms(prev => ({ ...prev, [bot.id]: sug.location }));
      // Also update the bot's piece coordinates so the board/mini-map renders them in the new room
      const botDoor = smDoorOf(sug.location);
      if (botDoor) setBotPositions(prev => ({ ...prev, [bot.id]: { r: botDoor.r, c: botDoor.c } }));
      // Find which player (going clockwise) shows a card.
      // Special case: if the checker is the HUMAN (player 0) and they have MULTIPLE matching cards,
      // we PAUSE the loop and let the player pick. The chooser dialog will resume the bot turn.
      const numPlayers = match.players.length;
      let shownBy = null, shownCard = null;
      let pausedForHuman = false;
      for (let step = 1; step < numPlayers; step++) {
        const idx = (match.turnIdx + step) % numPlayers;
        const checker = match.players[idx];
        if (checker.eliminated) continue;
        const matches = checker.hand.filter(c =>
          (c.type === "killer" && c.id === sug.killer) ||
          (c.type === "location" && c.id === sug.location) ||
          (c.type === "weapon" && c.id === sug.weapon)
        );
        if (matches.length === 0) continue;
        // Found a player with at least one match
        if (!checker.isBot && matches.length > 1) {
          // Human has multiple choices → ask them which one to show, pause bot turn here
          setChooseCardToShow({
            askingBot: bot,
            suggestion: sug,
            matches: matches,
          });
          pausedForHuman = true;
          break;
        }
        // Auto-pick (single match, or bot showing) — same as before
        shownBy = checker;
        shownCard = matches[Math.floor(Math.random() * matches.length)];
        break;
      }
      if (pausedForHuman) {
        // The chooser dialog will call finalizeBotSuggestion(askingBot, sug, shownBy, shownCard)
        // when the player picks. Don't advance turn yet.
        return;
      }
      finalizeBotSuggestion(bot, sug, shownBy, shownCard);
    }, 1800 + Math.random() * 800);
    return () => clearTimeout(t);
  }, [match, phase]);

  // Resolves the rest of a bot's suggestion turn — called either right away (auto-pick path)
  // or after the human picks which of their matching cards to reveal.
  const finalizeBotSuggestion = (bot, sug, shownBy, shownCard) => {
    const logEntry = {
      type: "suggestion",
      by: bot.name,
      byId: bot.id,
      suggestion: sug,
      shownByName: shownBy ? shownBy.name : null,
      shownByIsHuman: shownBy ? !shownBy.isBot : false,
      shownCard: shownBy && !shownBy.isBot ? shownCard : null, // We only know what HUMAN showed. Bot-to-bot is hidden.
      nobodyShowed: !shownBy,
    };
    setMatch(prev => {
      const next = { ...prev, log: [...prev.log, logEntry] };
      if (shownBy && shownCard) {
        const asking = next.players.find(p => p.id === bot.id);
        asking.knownCards.add(shownCard.type + ":" + shownCard.id);
      }
      next.turnIdx = nextActiveTurnIdx(next, bot.id);
      return next;
    });
  };

  function nextActiveTurnIdx(state, fromPlayerId) {
    const fromIdx = state.players.findIndex(p => p.id === fromPlayerId);
    for (let step = 1; step <= state.players.length; step++) {
      const idx = (fromIdx + step) % state.players.length;
      if (!state.players[idx].eliminated) return idx;
    }
    return fromIdx;
  }

  // Player makes a suggestion
  const submitSuggestion = () => {
    if (!suggestion.killer || !suggestion.location || !suggestion.weapon) return;
    const sug = { ...suggestion };
    setShowSuggestDialog(false);
    try { GameSFX.smSuggest(); } catch(e) {}
    // Find which OTHER player (clockwise) has a matching card
    const numPlayers = match.players.length;
    let shownBy = null, shownCard = null;
    for (let step = 1; step < numPlayers; step++) {
      const idx = (match.turnIdx + step) % numPlayers;
      const checker = match.players[idx];
      if (checker.eliminated) continue;
      const card = pickCardToShow(checker, sug);
      if (card) { shownBy = checker; shownCard = card; break; }
    }
    if (shownBy && shownCard) {
      // Show the player what they revealed
      setPendingShow({ by: shownBy, card: shownCard, suggestion: sug });
      // Also auto-mark the card eliminated in notebook
      setNotebook(prev => ({ ...prev, [shownCard.type]: { ...prev[shownCard.type], [shownCard.id]: "eliminated" } }));
      try { setTimeout(() => GameSFX.smShowCard(), 350); } catch(e) {}
    } else {
      // Nobody had any of the 3 — note in log
      setPendingShow({ by: null, card: null, suggestion: sug });
      try { setTimeout(() => GameSFX.smNoShow(), 350); } catch(e) {}
    }
    setMatch(prev => {
      const logEntry = {
        type: "suggestion",
        by: prev.players[0].name,
        byId: 0,
        suggestion: sug,
        shownByName: shownBy ? shownBy.name : null,
        shownByIsHuman: shownBy ? !shownBy.isBot : false,
        shownCard: shownBy ? shownCard : null,
        nobodyShowed: !shownBy,
      };
      return { ...prev, log: [...prev.log, logEntry] };
    });
    setSuggestion({ killer: null, location: null, weapon: null });
  };

  const acknowledgeShow = () => {
    setPendingShow(null);
    setAwaitingEndTurn(false);
    // Advance turn
    setMatch(prev => {
      const next = { ...prev, turnIdx: nextActiveTurnIdx(prev, prev.players[0].id) };
      return next;
    });
    // Reset for next time it's our turn
    setHasMoved(false);
    setDiceValue(0);
  };

  // Player makes a final accusation
  const submitAccusation = () => {
    if (!accusation.killer || !accusation.location || !accusation.weapon) return;
    const correct = accusation.killer === match.caseFile.killer && accusation.location === match.caseFile.location && accusation.weapon === match.caseFile.weapon;
    setShowAccuseDialog(false);
    try { GameSFX.smAccuse(); } catch(e) {}
    setMatch(prev => {
      const logEntry = { type: "accusation", by: prev.players[0].name, accusation, correct };
      const next = { ...prev, log: [...prev.log, logEntry] };
      if (correct) {
        next.status = "done";
        next.winner = prev.players[0].name;
      } else {
        // Eliminate player
        next.players = next.players.map(p => p.id === 0 ? { ...p, eliminated: true } : p);
        next.turnIdx = nextActiveTurnIdx(next, 0);
      }
      return next;
    });
    if (correct) {
      setPhase("won");
      smClearSave();
      try { setTimeout(() => GameSFX.smWin(), 500); } catch(e) {}
      if (typeof onWin === "function") { try { onWin(); } catch (e) {} }
    } else {
      setPhase("lost");
      smClearSave();
      try { setTimeout(() => GameSFX.smLose(), 500); } catch(e) {}
    }
    setAccusation({ killer: null, location: null, weapon: null });
  };

  const toggleNotebook = (cat, id) => {
    setNotebook(prev => {
      const cur = prev[cat][id];
      if (cur === "in-hand") return prev; // can't toggle your own cards
      const next = cur === "unknown" ? "eliminated" : cur === "eliminated" ? "possible" : "unknown";
      return { ...prev, [cat]: { ...prev[cat], [id]: next } };
    });
  };

  // Sub-styles
  const titleStyle = { fontSize:24, color:"#ff6060", letterSpacing:5, marginBottom:14, fontFamily:"'Cinzel',serif", textTransform:"uppercase", textAlign:"center" };
  const subStyle = { fontSize:12, color:"rgba(255,255,255,0.5)", letterSpacing:3, textAlign:"center" };
  const btnStyle = { padding:"12px 24px", background:"transparent", border:"1px solid rgba(255,80,80,0.6)", borderRadius:10, color:"#ff6060", fontFamily:"'Cinzel',serif", fontSize:13, letterSpacing:3, textTransform:"uppercase", cursor:"pointer" };
  const btn2Style = { ...btnStyle, border:"1px solid rgba(255,255,255,0.3)", color:"rgba(255,255,255,0.6)" };

  if (phase === "intro") {
    return (
      <div style={{position:"fixed",inset:0,background:"#060806",color:"#e8ddd4",padding:"20px 16px 100px",zIndex:100,display:"flex",flexDirection:"column",alignItems:"center",overflow:"auto"}}>
        <style>{`@import url('https://fonts.bunny.net/css?family=jolly-lodger:400|cinzel:400,600,700&display=swap');`}</style>
        <div style={{width:"100%",maxWidth:480,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <button onClick={onExit} style={{background:"transparent",border:"none",color:"rgba(255,255,255,0.5)",fontSize:14,letterSpacing:2,cursor:"pointer"}}>← EXIT</button>
          <div style={{fontSize:14,color:"rgba(255,80,80,0.6)",letterSpacing:4}}>SLASHER MYSTERY</div>
          <div style={{width:50}}></div>
        </div>
        <div style={{textAlign:"center",maxWidth:400,padding:"20px 16px",width:"100%"}}>
          <div style={{fontSize:48,marginBottom:12}}>🔍</div>
          <div style={titleStyle}>WHO. WHERE. WITH WHAT.</div>
          <div style={{fontSize:13,color:"rgba(230,220,210,0.7)",lineHeight:1.6,marginBottom:18,fontFamily:"'Cinzel',serif"}}>
            A killing has happened. Three facts hide in the CASE FILE — the slasher, the place, the weapon. Be the first to figure out all three.
          </div>

          <div style={{border:"1px solid rgba(255,80,80,0.25)",borderRadius:10,padding:"14px 16px",background:"rgba(20,5,5,0.5)",textAlign:"left",marginBottom:14}}>
            <div style={{color:"rgba(255,80,80,0.9)",fontSize:11,letterSpacing:3,textAlign:"center",marginBottom:10,fontFamily:"'Cinzel',serif"}}>HOW TO PLAY</div>
            {[
              {n:"1", t:"3 cards (1 killer, 1 place, 1 weapon) are hidden in the CASE FILE. The rest are dealt to you and the bots."},
              {n:"2", t:"On your turn, make a SUGGESTION — pick a killer, place, and weapon you think it might be."},
              {n:"3", t:"Going clockwise, each bot must show you ONE matching card from their hand if they have any. Only you see it."},
              {n:"4", t:"Cross cards off in your NOTEBOOK as you eliminate them. The 3 nobody can show are the answer."},
              {n:"5", t:"When you're sure, ACCUSE. Right = you win. Wrong = you're out, but the game continues."},
            ].map(r => (
              <div key={r.n} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:7}}>
                <span style={{display:"inline-block",width:18,height:18,borderRadius:9,background:"rgba(255,80,80,0.25)",color:"#ff6060",fontSize:11,fontFamily:"'Cinzel',serif",fontWeight:600,lineHeight:"18px",textAlign:"center",flexShrink:0}}>{r.n}</span>
                <span style={{color:"rgba(255,255,255,0.7)",fontSize:11,letterSpacing:0.3,lineHeight:1.5}}>{r.t}</span>
              </div>
            ))}
          </div>

          <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",letterSpacing:2,marginBottom:18,fontFamily:"'Cinzel',serif",lineHeight:1.6}}>
            TIP: SUGGEST CARDS YOU ALREADY HAVE — IT FORCES BOTS TO REVEAL OTHERS
          </div>

          <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",letterSpacing:2,marginBottom:18,fontFamily:"'Cinzel',serif"}}>
            VS 3 BOT INVESTIGATORS
          </div>
          {savedGame && (
            <div style={{marginBottom:14,padding:"12px 14px",background:"rgba(120,255,120,0.08)",border:"1.5px solid rgba(120,255,120,0.5)",borderRadius:8,boxShadow:"0 0 12px rgba(120,255,120,0.2)"}}>
              <div style={{fontSize:10,color:"#90ff90",letterSpacing:3,marginBottom:8,fontFamily:"'Cinzel',serif",fontWeight:700,textShadow:"0 0 4px rgba(120,255,120,0.6)"}}>
                💾 SAVED GAME FOUND
              </div>
              <button onClick={resumeMatch} style={{padding:"10px 24px",background:"linear-gradient(180deg, #1a3a1a, #0a2a0a)",color:"#a0ffa0",border:"1.5px solid #50c850",borderRadius:5,fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:4,fontWeight:700,cursor:"pointer",textShadow:"0 0 4px rgba(120,255,120,0.7)",marginRight:8}}>RESUME GAME</button>
              <button onClick={() => { smClearSave(); setSavedGame(null); }} style={{padding:"8px 16px",background:"transparent",color:"rgba(200,200,200,0.6)",border:"1px solid rgba(150,150,150,0.4)",borderRadius:5,fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:2,cursor:"pointer"}}>DISCARD</button>
            </div>
          )}
          <button onClick={startMatch} style={{...btnStyle,padding:"14px 36px"}}>{savedGame ? "START NEW GAME" : "BEGIN INVESTIGATION"}</button>
        </div>
      </div>
    );
  }

  if (phase === "won") {
    return (
      <div style={{position:"fixed",inset:0,background:"#060806",color:"#e8ddd4",padding:"20px 16px 100px",zIndex:100,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",overflow:"auto"}}>
        <style>{`@import url('https://fonts.bunny.net/css?family=jolly-lodger:400|cinzel:400,600,700&display=swap');`}</style>
        <div style={{width:"100%",maxWidth:480,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <button onClick={onExit} style={{background:"transparent",border:"none",color:"rgba(255,255,255,0.5)",fontSize:14,letterSpacing:2,cursor:"pointer"}}>← EXIT</button>
          <div style={{fontSize:14,color:"rgba(255,80,80,0.6)",letterSpacing:4}}>SLASHER MYSTERY</div>
          <div style={{width:50}}></div>
        </div>
        <div style={{textAlign:"center",maxWidth:400,padding:20}}>
          <div style={{fontSize:64,marginBottom:18}}>🏆</div>
          <div style={titleStyle}>CASE SOLVED</div>
          <div style={{fontSize:13,color:"rgba(230,220,210,0.7)",lineHeight:1.7,marginBottom:24,fontFamily:"'Cinzel',serif"}}>
            It was {KILLERS.find(k => k.id === match.caseFile.killer).emoji} <b>{KILLERS.find(k => k.id === match.caseFile.killer).name}</b> in the {LOCATIONS.find(l => l.id === match.caseFile.location).emoji} <b>{LOCATIONS.find(l => l.id === match.caseFile.location).name}</b> with the {WEAPONS.find(w => w.id === match.caseFile.weapon).emoji} <b>{WEAPONS.find(w => w.id === match.caseFile.weapon).name}</b>.
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:12}}>
            <button onClick={startMatch} style={btnStyle}>NEW CASE</button>
            <button onClick={onExit} style={btn2Style}>EXIT</button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "lost") {
    const winner = match && match.winner;
    return (
      <div style={{position:"fixed",inset:0,background:"#060806",color:"#e8ddd4",padding:"20px 16px 100px",zIndex:100,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",overflow:"auto"}}>
        <style>{`@import url('https://fonts.bunny.net/css?family=jolly-lodger:400|cinzel:400,600,700&display=swap');`}</style>
        <div style={{width:"100%",maxWidth:480,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <button onClick={onExit} style={{background:"transparent",border:"none",color:"rgba(255,255,255,0.5)",fontSize:14,letterSpacing:2,cursor:"pointer"}}>← EXIT</button>
          <div style={{fontSize:14,color:"rgba(255,80,80,0.6)",letterSpacing:4}}>SLASHER MYSTERY</div>
          <div style={{width:50}}></div>
        </div>
        <div style={{textAlign:"center",maxWidth:400,padding:20}}>
          <div style={{fontSize:64,marginBottom:18}}>💀</div>
          <div style={titleStyle}>{winner ? "ANOTHER INVESTIGATOR SOLVED IT" : "WRONG ACCUSATION"}</div>
          <div style={{fontSize:13,color:"rgba(230,220,210,0.7)",lineHeight:1.7,marginBottom:14,fontFamily:"'Cinzel',serif"}}>
            {winner ? `${winner} cracked the case before you.` : "You were eliminated from the investigation."}
          </div>
          <div style={{fontSize:13,color:"rgba(230,220,210,0.7)",lineHeight:1.7,marginBottom:24,fontFamily:"'Cinzel',serif"}}>
            It was {KILLERS.find(k => k.id === match.caseFile.killer).emoji} <b>{KILLERS.find(k => k.id === match.caseFile.killer).name}</b> in the {LOCATIONS.find(l => l.id === match.caseFile.location).emoji} <b>{LOCATIONS.find(l => l.id === match.caseFile.location).name}</b> with the {WEAPONS.find(w => w.id === match.caseFile.weapon).emoji} <b>{WEAPONS.find(w => w.id === match.caseFile.weapon).name}</b>.
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:12}}>
            <button onClick={startMatch} style={btnStyle}>TRY AGAIN</button>
            <button onClick={onExit} style={btn2Style}>EXIT</button>
          </div>
        </div>
      </div>
    );
  }

  // Playing UI
  if (!match || !notebook) return null;
  const me = match.players[0];
  const isMyTurn = match.turnIdx === 0 && !me.eliminated;
  const currentPlayer = match.players[match.turnIdx];

  return (
    <div style={{position:"fixed",inset:0,background:"#060806",color:"#e8ddd4",padding:"20px 16px 100px",zIndex:100,display:"flex",flexDirection:"column",alignItems:"center",overflow:"auto"}}>
      <style>{`@import url('https://fonts.bunny.net/css?family=jolly-lodger:400|cinzel:400,600,700&display=swap');`}</style>
      <div style={{width:"100%",maxWidth:480,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <button onClick={onExit} style={{background:"transparent",border:"none",color:"rgba(255,255,255,0.5)",fontSize:14,letterSpacing:2,cursor:"pointer"}}>← EXIT</button>
        <div style={{fontSize:14,color:"rgba(255,80,80,0.6)",letterSpacing:4}}>SLASHER MYSTERY</div>
        <div style={{width:50}}></div>
      </div>

      {/* Card showing modal */}
      {pendingShow && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:20}}>
          <div style={{background:"#1a0a0a",border:"1px solid rgba(255,80,80,0.5)",borderRadius:12,padding:30,maxWidth:380,textAlign:"center"}}>
            {pendingShow.by ? (
              <>
                <div style={{fontSize:48,marginBottom:14}}>🤝</div>
                <div style={{...titleStyle,fontSize:18}}>{pendingShow.by.name} SHOWS YOU A CARD</div>
                <div style={{padding:18,background:"rgba(255,80,80,0.1)",border:"1px solid rgba(255,80,80,0.4)",borderRadius:10,marginBottom:18}}>
                  <div style={{fontSize:32,marginBottom:6}}>
                    {pendingShow.card.type === "killer" && KILLERS.find(k => k.id === pendingShow.card.id).emoji}
                    {pendingShow.card.type === "location" && LOCATIONS.find(l => l.id === pendingShow.card.id).emoji}
                    {pendingShow.card.type === "weapon" && WEAPONS.find(w => w.id === pendingShow.card.id).emoji}
                  </div>
                  <div style={{fontSize:16,color:"#e8ddd4",fontFamily:"'Cinzel',serif",letterSpacing:2}}>
                    {pendingShow.card.type === "killer" && KILLERS.find(k => k.id === pendingShow.card.id).name}
                    {pendingShow.card.type === "location" && LOCATIONS.find(l => l.id === pendingShow.card.id).name}
                    {pendingShow.card.type === "weapon" && WEAPONS.find(w => w.id === pendingShow.card.id).name}
                  </div>
                </div>
                <div style={{...subStyle,fontSize:11,marginBottom:18}}>This card is now eliminated in your notebook.</div>
              </>
            ) : (
              <>
                <div style={{fontSize:48,marginBottom:14}}>👁</div>
                <div style={{...titleStyle,fontSize:18}}>NOBODY HAS ANY OF THOSE</div>
                <div style={{...subStyle,fontSize:12,marginBottom:18,lineHeight:1.6}}>The 3 cards you suggested are likely IN THE CASE FILE — or in your own hand.</div>
              </>
            )}
            <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
              <button onClick={() => {
                // Close dialog WITHOUT advancing turn — give player time to mark notebook
                setPendingShow(null);
                setAwaitingEndTurn(true);
              }} style={{padding:"10px 18px",background:"rgba(80,180,80,0.15)",color:"#90ff90",border:"1.5px solid rgba(120,255,120,0.6)",borderRadius:6,fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:2,cursor:"pointer",textShadow:"0 0 4px rgba(120,255,120,0.5)",fontWeight:700}}>📔 MARK NOTEBOOK</button>
              <button onClick={acknowledgeShow} style={btnStyle}>OK — END TURN</button>
            </div>
          </div>
        </div>
      )}

      {/* Suggest dialog */}
      {/* CLUE-STYLE MINI BOARD MODAL — opens at start of player turn */}
      {showBoard && (
        <div style={{position:"fixed",inset:0,background:"#000",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:8,overflow:"auto"}}>
          <div style={{background:"#000",border:"1px solid rgba(255,40,40,0.4)",borderRadius:6,padding:12,maxWidth:480,width:"100%",boxShadow:"0 0 60px rgba(220,0,0,0.4), inset 0 0 80px rgba(40,0,0,0.6)",position:"relative"}}>

            {/* Scanline overlay for 80s CRT vibe */}
            <div style={{position:"absolute",inset:0,pointerEvents:"none",background:"repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(255,255,255,0.025) 3px, transparent 4px)",borderRadius:6,mixBlendMode:"overlay"}} />

            <div style={{textAlign:"center",fontSize:11,color:"rgba(255,80,80,0.9)",letterSpacing:6,marginBottom:6,fontFamily:"'Cinzel',serif",textShadow:"0 0 8px rgba(255,40,40,0.8)"}}>
              ▓▓ YOUR TURN ▓▓
            </div>
            <div style={{textAlign:"center",fontSize:9,color:"rgba(150,255,150,0.7)",letterSpacing:3,marginBottom:10,fontFamily:"monospace"}}>
              {diceValue === 0 ? "ROLL DICE TO MOVE" : diceRolling ? "ROLLING..." : !hasMoved ? `▶ ROLLED ${diceValue} — TAP A GREEN ✓ CELL ◀` : "MOVED — CONTINUE"}
            </div>

            {/* THE BOARD — 12x12 SVG-styled grid with neon vectors */}
            {(() => {
              // Calculate reachable set when dice has been rolled and player hasn't moved yet
              const reachableSet = (diceValue > 0 && !hasMoved && !animPath) ? smReachable(playerPos.r, playerPos.c, diceValue) : new Set();
              return (
                <div style={{
                  position:"relative",
                  width:"100%",
                  aspectRatio:"1",
                  background:"#050008",
                  border:"1px solid rgba(255,40,40,0.5)",
                  borderRadius:4,
                  marginBottom:10,
                  boxShadow:"inset 0 0 40px rgba(150,0,0,0.4), 0 0 20px rgba(255,40,40,0.2)",
                }}>
                  {/* Subtle dot pattern at intersections only — adds vector-feel without doubling up cell borders */}
                  <div style={{
                    position:"absolute",inset:0,
                    backgroundImage:`radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)`,
                    backgroundSize:`${100/SM_COLS}% ${100/SM_ROWS}%`,
                    pointerEvents:"none",
                  }} />

                  {/* Render each cell */}
                  {Array.from({length: SM_ROWS * SM_COLS}).map((_, idx) => {
                    const r = Math.floor(idx / SM_COLS);
                    const c = idx % SM_COLS;
                    const cell = SM_CELLS[r][c];
                    const isReachable = reachableSet.has(`${r},${c}`);
                    const isPlayer = r === playerPos.r && c === playerPos.c && !animPath;
                    const isAnimating = animPath && animStep < animPath.length && animPath[animStep] && animPath[animStep][0] === r && animPath[animStep][1] === c;
                    const botInCell = Object.entries(botPositions).find(([_, p]) => p.r === r && p.c === c);
                    const trail = bloodTrail.find(t => t.r === r && t.c === c);
                    const trailAge = trail ? (Date.now() - trail.t) / 2000 : 1;

                    // Position as percentage of board
                    const top = (r / SM_ROWS) * 100;
                    const left = (c / SM_COLS) * 100;
                    const size = 100 / SM_ROWS;

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (!isReachable || animPath) return;
                          const path = smPath(playerPos.r, playerPos.c, r, c);
                          if (!path || path.length < 2) return;
                          // Skip the starting cell — player is already there
                          setAnimPath(path.slice(1));
                          setAnimStep(0);
                          try { GameSFX.smCardSelect && GameSFX.smCardSelect(); } catch(e){}
                        }}
                        style={{
                          position:"absolute",
                          top:`${top}%`,
                          left:`${left}%`,
                          width:`${size}%`,
                          height:`${size}%`,
                          cursor: isReachable ? "pointer" : "default",
                          display:"flex",
                          alignItems:"center",
                          justifyContent:"center",
                          fontSize:9,
                          // Cell background by type — hallway cells get a faint visible tint so you can see the grid
                          background: cell.type === 'room' ? `${SM_ROOMS[cell.roomId].neon}18` :
                                      cell.type === 'door' ? `${SM_ROOMS[cell.roomId].neon}40` :
                                      "rgba(255,255,255,0.05)",
                          // Hallway cells get a subtle white border too
                          border: cell.type === 'hall' ? "0.5px solid rgba(255,255,255,0.15)" : undefined,
                          // Reachable highlight: bright green pulse — way more obvious than red on red
                          ...(isReachable ? {
                            background: "rgba(80,255,120,0.35)",
                            boxShadow: "inset 0 0 0 2px rgba(80,255,120,1), 0 0 12px rgba(80,255,120,0.7)",
                            animation: "smCellPulse 0.9s ease-in-out infinite",
                            zIndex: 5,
                          } : {}),
                        }}
                      >
                        {/* Trail under feet — fades from red to transparent */}
                        {trail && trailAge < 1 && (
                          <div style={{position:"absolute",inset:"15%",borderRadius:"50%",background:`rgba(255,40,40,${0.5*(1-trailAge)})`,filter:"blur(2px)"}} />
                        )}
                        {/* Bright green checkmark icon on reachable cells — impossible to miss */}
                        {isReachable && (
                          <div style={{
                            color:"#80ff80",
                            fontSize:14,
                            fontWeight:900,
                            textShadow:"0 0 8px rgba(80,255,120,1), 0 0 4px #000",
                            animation:"smCheckBob 0.9s ease-in-out infinite",
                          }}>✓</div>
                        )}
                      </div>
                    );
                  })}

                  {/* Room outlines + names — drawn over cells for that vector look */}
                  {Object.entries(SM_ROOMS).map(([id, room]) => {
                    const top = (room.rect.r1 / SM_ROWS) * 100;
                    const left = (room.rect.c1 / SM_COLS) * 100;
                    const w = ((room.rect.c2 - room.rect.c1 + 1) / SM_COLS) * 100;
                    const h = ((room.rect.r2 - room.rect.r1 + 1) / SM_ROWS) * 100;
                    // Special render for the central evidence file — different look from regular rooms
                    if (room.isEvidence) {
                      return (
                        <div key={id} style={{
                          position:"absolute",
                          top:`${top}%`,left:`${left}%`,width:`${w}%`,height:`${h}%`,
                          border:`2px dashed ${room.neon}`,
                          borderRadius:4,
                          background:`linear-gradient(135deg, ${room.neon}25 25%, transparent 25%, transparent 50%, ${room.neon}25 50%, ${room.neon}25 75%, transparent 75%)`,
                          backgroundSize:"8px 8px",
                          boxShadow:`0 0 12px ${room.neon}, inset 0 0 16px ${room.neon}40`,
                          pointerEvents:"none",
                          display:"flex",
                          alignItems:"center",
                          justifyContent:"center",
                          flexDirection:"column",
                          textShadow:`0 0 8px ${room.neon}`,
                          animation:"smEvidencePulse 2.4s ease-in-out infinite",
                        }}>
                          <div style={{fontSize:22,filter:`drop-shadow(0 0 6px ${room.neon})`}}>{room.emoji}</div>
                          <div style={{fontSize:11,color:room.neon,fontFamily:"'Cinzel',serif",letterSpacing:1.5,fontWeight:900,marginTop:3,textShadow:`0 0 6px ${room.neon}`}}>
                            EVIDENCE
                          </div>
                          <div style={{fontSize:8,color:room.neon,fontFamily:"'Cinzel',serif",letterSpacing:1,opacity:0.7,marginTop:1}}>
                            CASE FILE
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={id} style={{
                        position:"absolute",
                        top:`${top}%`,left:`${left}%`,width:`${w}%`,height:`${h}%`,
                        border:`1.5px solid ${room.neon}`,
                        borderRadius:2,
                        boxShadow:`0 0 8px ${room.neon}, inset 0 0 12px ${room.neon}30`,
                        pointerEvents:"none",
                        display:"flex",
                        alignItems:"center",
                        justifyContent:"center",
                        flexDirection:"column",
                        textShadow:`0 0 8px ${room.neon}`,
                      }}>
                        {/* Secret passage badge — placed in the OUTER corner of the room
                            so it's visually clear which direction the passage exits */}
                        {room.secretPassageTo && (() => {
                          // Determine which corner of the room is the "outer" corner.
                          // TL room: top-left corner. TR room: top-right. BL: bottom-left. BR: bottom-right.
                          const isTopHalf = room.rect.r1 < SM_ROWS / 2;
                          const isLeftHalf = room.rect.c1 < SM_COLS / 2;
                          const cornerStyle = {
                            position: "absolute",
                            ...(isTopHalf ? { top: 3 } : { bottom: 3 }),
                            ...(isLeftHalf ? { left: 3 } : { right: 3 }),
                            fontSize: 13,
                            opacity: 0.9,
                            filter: `drop-shadow(0 0 3px ${room.neon})`,
                            animation: "smPassageBlink 2s ease-in-out infinite",
                          };
                          return <div style={cornerStyle}>⛓️</div>;
                        })()}
                        <div style={{fontSize:18,opacity:0.85,filter:`drop-shadow(0 0 4px ${room.neon})`}}>{room.emoji}</div>
                        <div style={{fontSize:11,color:room.neon,fontFamily:"'Cinzel',serif",letterSpacing:1,fontWeight:700,marginTop:3,textShadow:`0 0 4px ${room.neon}`,textAlign:"center",lineHeight:1.1,padding:"0 2px"}}>
                          {room.name}
                        </div>
                      </div>
                    );
                  })}

                  {/* Door indicators — small bright dots on door cells */}
                  {Object.entries(SM_ROOMS).flatMap(([id, room]) =>
                    room.doors.map((d, i) => {
                      const top = ((d.r + 0.5) / SM_ROWS) * 100;
                      const left = ((d.c + 0.5) / SM_COLS) * 100;
                      return (
                        <div key={`${id}-d${i}`} style={{
                          position:"absolute",
                          top:`${top}%`,left:`${left}%`,
                          width:6,height:6,
                          marginLeft:-3,marginTop:-3,
                          borderRadius:"50%",
                          background:room.neon,
                          boxShadow:`0 0 6px ${room.neon}`,
                          pointerEvents:"none",
                        }} />
                      );
                    })
                  )}

                  {/* Player piece — red neon triangle with pulsing locator ring beneath, glides between cells */}
                  <div style={{
                    position:"absolute",
                    top:`${(playerPos.r / SM_ROWS) * 100}%`,
                    left:`${(playerPos.c / SM_COLS) * 100}%`,
                    width:`${100/SM_COLS}%`,
                    height:`${100/SM_ROWS}%`,
                    transition:"top 180ms linear, left 180ms linear",
                    pointerEvents:"none",
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center",
                    zIndex:20,
                  }}>
                    {/* Big pulsing locator ring under the piece — calls out the player position */}
                    <div style={{
                      position:"absolute",
                      width:"180%",height:"180%",
                      borderRadius:"50%",
                      border:"2px solid rgba(255,255,40,0.9)",
                      boxShadow:"0 0 16px rgba(255,235,40,1), inset 0 0 8px rgba(255,235,40,0.5)",
                      animation:"smPlayerRing 1.4s ease-in-out infinite",
                    }} />
                    {/* Inner ring */}
                    <div style={{
                      position:"absolute",
                      width:"110%",height:"110%",
                      borderRadius:"50%",
                      border:"1px solid rgba(255,40,40,0.8)",
                      boxShadow:"0 0 10px rgba(255,40,40,0.9)",
                    }} />
                    {/* The piece itself — render via helper for consistency */}
                    <div style={{position:"relative",zIndex:2,width:"95%",height:"95%",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {smPieceSVG(0, "100%")}
                    </div>
                  </div>

                  {/* Bot pieces — each unique color + shape, with pulsing locator ring like player but smaller */}
                  {Object.entries(botPositions).map(([id, p]) => {
                    const pid = Number(id);
                    const meta = SM_PIECES[pid] || SM_PIECES[1];
                    return (
                      <div key={`bot-${id}`} style={{
                        position:"absolute",
                        top:`${(p.r / SM_ROWS) * 100}%`,
                        left:`${(p.c / SM_COLS) * 100}%`,
                        width:`${100/SM_COLS}%`,
                        height:`${100/SM_ROWS}%`,
                        transition:"top 200ms linear, left 200ms linear",
                        pointerEvents:"none",
                        display:"flex",
                        alignItems:"center",
                        justifyContent:"center",
                        zIndex:9,
                      }}>
                        {/* Pulsing locator ring under bot — smaller than player's, in their color */}
                        <div style={{
                          position:"absolute",
                          width:"75%",height:"75%",
                          borderRadius:"50%",
                          border:`1.5px solid ${meta.color}`,
                          boxShadow:`0 0 8px ${meta.color}`,
                          opacity:0.85,
                          animation:"smPlayerRing 1.6s ease-in-out infinite",
                        }} />
                        {smPieceSVG(pid, "45%")}
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Status line: where you are right now */}
            <div style={{textAlign:"center",fontSize:9,color:"rgba(255,200,100,0.7)",letterSpacing:2,marginBottom:8,fontFamily:"monospace",minHeight:14}}>
              {(() => {
                if (animPath) return "MOVING...";
                const cell = SM_CELLS[playerPos.r][playerPos.c];
                if (cell.type === 'door' && cell.roomId) {
                  const room = SM_ROOMS[cell.roomId];
                  return `📍 IN: ${room.emoji} ${room.name}`;
                }
                return `📍 IN HALLWAY (${playerPos.r},${playerPos.c})`;
              })()}
            </div>

            {/* DICE + ACTION BAR */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:14,marginBottom:8}}>
              {diceValue === 0 ? (
                <button onClick={() => {
                  if (diceRolling) return;
                  setDiceRolling(true);
                  try { GameSFX.smDiceRoll && GameSFX.smDiceRoll(); } catch(e){}
                  // Animate dice tumbling for ~900ms then settle
                  let tumbles = 0;
                  const tumble = setInterval(() => {
                    setDie1(1 + Math.floor(Math.random() * 6));
                    setDie2(1 + Math.floor(Math.random() * 6));
                    tumbles++;
                    if (tumbles >= 9) {
                      clearInterval(tumble);
                      const d1 = 1 + Math.floor(Math.random() * 6);
                      const d2 = 1 + Math.floor(Math.random() * 6);
                      setDie1(d1); setDie2(d2);
                      setDiceValue(d1 + d2);
                      setDiceRolling(false);
                      try { GameSFX.smDiceLand && GameSFX.smDiceLand(); } catch(e){}
                    }
                  }, 100);
                }} style={{
                  padding:"12px 28px",
                  background:"linear-gradient(180deg, #1a0a0a, #0a0000)",
                  color:"#ff4040",
                  border:"1.5px solid #ff3030",
                  borderRadius:6,
                  fontFamily:"'Cinzel',serif",
                  fontSize:13,
                  letterSpacing:5,
                  fontWeight:700,
                  cursor:"pointer",
                  textShadow:"0 0 8px rgba(255,40,40,0.9)",
                  boxShadow:"0 0 12px rgba(255,40,40,0.5), inset 0 0 8px rgba(255,40,40,0.2)",
                }}>🎲 ROLL DICE</button>
              ) : (
                <>
                  <SMNeonDie value={die1} rolling={diceRolling} />
                  <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:24,color:"#ff3030",textShadow:"0 0 10px rgba(255,40,40,0.9)"}}>+</div>
                  <SMNeonDie value={die2} rolling={diceRolling} />
                  <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:24,color:"#ff3030",textShadow:"0 0 10px rgba(255,40,40,0.9)"}}>=</div>
                  <div style={{
                    fontFamily:"'Cinzel Decorative',serif",
                    fontSize:30,
                    fontWeight:700,
                    color:"#ffeb33",
                    textShadow:"0 0 14px rgba(255,235,51,1), 0 0 28px rgba(255,150,0,0.6)",
                    minWidth:36,textAlign:"center",
                    animation: diceRolling ? "smDiceShake 0.1s linear infinite" : "smDiceStamp 0.6s ease-out",
                  }}>{diceValue}</div>
                </>
              )}
            </div>

            {/* Bottom buttons */}
            <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
              <button onClick={() => setShowSheet(true)} style={{padding:"8px 14px",background:"rgba(80,180,80,0.12)",color:"#90ff90",border:"1px solid rgba(120,255,120,0.5)",borderRadius:5,fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:2,cursor:"pointer",textShadow:"0 0 4px rgba(120,255,120,0.5)"}}>📔 MY SHEET</button>
              {/* Secret passage button — only shows when starting in a corner room and hasn't moved yet */}
              {!hasMoved && !animPath && diceValue === 0 && (() => {
                const currentCell = SM_CELLS[playerPos.r][playerPos.c];
                if (currentCell.type !== 'door' || !currentCell.roomId) return null;
                const room = SM_ROOMS[currentCell.roomId];
                if (!room?.secretPassageTo) return null;
                const target = SM_ROOMS[room.secretPassageTo];
                return (
                  <button onClick={() => {
                    // Teleport to target room's first door cell
                    const targetDoor = smDoorOf(room.secretPassageTo);
                    if (!targetDoor) return;
                    setPlayerPos({ r: targetDoor.r, c: targetDoor.c });
                    setPlayerRoom(room.secretPassageTo);
                    setHasMoved(true);
                    try { GameSFX.smPassage && GameSFX.smPassage(); } catch(e){}
                    setTimeout(() => setShowBoard(false), 800);
                  }} style={{
                    padding:"8px 14px",
                    background:"linear-gradient(180deg, rgba(80,40,120,0.4), rgba(40,15,80,0.4))",
                    color:"#cc88ff",
                    border:"1.5px solid #cc66ff",
                    borderRadius:5,
                    fontFamily:"'Cinzel',serif",
                    fontSize:10,
                    letterSpacing:2,
                    cursor:"pointer",
                    textShadow:"0 0 6px rgba(204,102,255,0.9)",
                    boxShadow:"0 0 10px rgba(204,102,255,0.5)",
                    animation:"smPassageBlink 2s ease-in-out infinite",
                  }}>⛓️ SECRET PASSAGE → {target?.name}</button>
                );
              })()}
              {!hasMoved && diceValue > 0 && !animPath && (
                <button onClick={() => { setHasMoved(true); setShowBoard(false); }} style={{padding:"8px 18px",background:"transparent",color:"rgba(200,200,200,0.6)",border:"1px solid rgba(150,150,150,0.4)",borderRadius:5,fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:3,cursor:"pointer"}}>STAY HERE</button>
              )}
              {hasMoved && (
                <button onClick={() => setShowBoard(false)} style={{padding:"10px 24px",background:"linear-gradient(180deg, #1a0a0a, #0a0000)",color:"#ff4040",border:"1.5px solid #ff3030",borderRadius:5,fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:4,fontWeight:700,cursor:"pointer",textShadow:"0 0 6px rgba(255,40,40,0.7)"}}>CONTINUE →</button>
              )}
            </div>

            {/* SHEET POPOVER — full notebook view (everything you've marked so far) */}
            {showSheet && match && match.players[0] && notebook && (
              <div onClick={() => setShowSheet(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.94)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,borderRadius:6,cursor:"pointer"}}>
                <div style={{background:"#0a0010",border:"2px solid rgba(120,255,120,0.6)",borderRadius:8,padding:18,maxWidth:380,width:"94%",maxHeight:"90%",overflowY:"auto",boxShadow:"0 0 30px rgba(120,255,120,0.4)"}}>
                  <div style={{textAlign:"center",fontSize:13,color:"#90ff90",letterSpacing:5,marginBottom:4,fontFamily:"'Cinzel',serif",fontWeight:700,textShadow:"0 0 8px rgba(120,255,120,0.7)"}}>
                    📔 YOUR SHEET
                  </div>
                  {/* Compact legend */}
                  <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center",fontSize:8,color:"rgba(200,200,200,0.7)",letterSpacing:1,marginBottom:12,fontFamily:"monospace"}}>
                    <span><span style={{color:"#90ff90"}}>✋</span> IN HAND</span>
                    <span><span style={{color:"#888"}}>✖</span> ELIMINATED</span>
                    <span><span style={{color:"#ffcc44"}}>❓</span> POSSIBLE</span>
                    <span style={{opacity:0.6}}>· UNMARKED</span>
                  </div>
                  {[{label:"KILLERS",cat:"killer",options:KILLERS},{label:"LOCATIONS",cat:"location",options:LOCATIONS},{label:"WEAPONS",cat:"weapon",options:WEAPONS}].map(({label,cat,options}) => (
                    <div key={cat} style={{marginBottom:12}}>
                      <div style={{fontSize:10,color:"#ff6060",letterSpacing:2,marginBottom:6,fontFamily:"'Cinzel',serif",fontWeight:700}}>{label}</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                        {options.map(o => {
                          const state = notebook[cat][o.id];
                          let bg = "rgba(255,255,255,0.04)";
                          let border = "rgba(255,255,255,0.18)";
                          let color = "#e8ddd4";
                          let prefix = "";
                          let textDecoration = "none";
                          if (state === "in-hand")    { bg = "rgba(150,255,150,0.15)"; border = "rgba(150,255,150,0.55)"; color = "#e8ffe8"; prefix = "✋ "; }
                          else if (state === "eliminated") { bg = "rgba(80,80,80,0.18)"; border = "rgba(120,120,120,0.4)"; color = "rgba(180,180,180,0.45)"; prefix = "✖ "; textDecoration = "line-through"; }
                          else if (state === "possible")   { bg = "rgba(255,200,50,0.15)"; border = "rgba(255,200,50,0.6)"; color = "#ffcc44"; prefix = "❓ "; }
                          return (
                            <div key={o.id} style={{padding:"5px 9px",background:bg,border:`1px solid ${border}`,borderRadius:5,fontSize:10,color,fontFamily:"'Cinzel',serif",letterSpacing:0.8,textDecoration}}>
                              {prefix}{o.emoji} {o.name}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <div style={{textAlign:"center",fontSize:9,color:"rgba(200,200,200,0.4)",letterSpacing:2,marginTop:10,fontFamily:"monospace"}}>
                    TAP ANYWHERE TO CLOSE
                  </div>
                </div>
              </div>
            )}
          </div>

          <style>{`
            @keyframes smCellPulse {
              0%, 100% { background-color: rgba(80,255,120,0.20); }
              50%      { background-color: rgba(80,255,120,0.55); }
            }
            @keyframes smCheckBob {
              0%, 100% { transform: translateY(0) scale(1); }
              50%      { transform: translateY(-2px) scale(1.15); }
            }
            @keyframes smPlayerRing {
              0%, 100% { transform: scale(1); opacity: 0.9; }
              50%      { transform: scale(1.15); opacity: 0.5; }
            }
            @keyframes smEvidencePulse {
              0%, 100% { box-shadow: 0 0 12px #FFEB33, inset 0 0 16px rgba(255,235,51,0.25); }
              50%      { box-shadow: 0 0 24px #FFEB33, inset 0 0 28px rgba(255,235,51,0.45); }
            }
            @keyframes smBotFlicker {
              0%, 100% { opacity: 0.8; }
              50%      { opacity: 0.5; }
            }
            @keyframes smDiceShake {
              0%,100% { transform: translate(0,0) rotate(0); }
              25%     { transform: translate(-2px,1px) rotate(-4deg); }
              75%     { transform: translate(2px,-1px) rotate(4deg); }
            }
            @keyframes smDiceStamp {
              0%   { transform: scale(0.5); opacity: 0; }
              60%  { transform: scale(1.4); opacity: 1; }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes smPassageBlink {
              0%, 100% { opacity: 0.65; }
              50%      { opacity: 1; }
            }
          `}</style>
        </div>
      )}
      {/* CHOOSE CARD TO SHOW — when a bot suggests and the human has 2+ matching cards */}
      {chooseCardToShow && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:150,padding:20,overflow:"auto"}}>
          <div style={{background:"#0a0010",border:"2px solid rgba(255,180,40,0.7)",borderRadius:12,padding:24,maxWidth:380,width:"100%",boxShadow:"0 0 30px rgba(255,180,40,0.4)"}}>
            <div style={{textAlign:"center",fontSize:14,color:"#ffcc44",letterSpacing:5,marginBottom:6,fontFamily:"'Cinzel',serif",fontWeight:700,textShadow:"0 0 8px rgba(255,180,40,0.7)"}}>
              ⚠️ CHOOSE A CARD TO SHOW
            </div>
            <div style={{textAlign:"center",fontSize:11,color:"rgba(255,200,100,0.7)",letterSpacing:2,marginBottom:8,fontFamily:"'Cinzel',serif"}}>
              <b style={{color:"#ff6060"}}>{chooseCardToShow.askingBot.name}</b> suggests:
            </div>
            <div style={{textAlign:"center",fontSize:11,color:"#e8ddd4",marginBottom:14,fontFamily:"'Cinzel',serif",letterSpacing:1,padding:"8px 12px",background:"rgba(255,255,255,0.05)",borderRadius:6,border:"1px solid rgba(255,255,255,0.15)"}}>
              {(() => {
                const k = KILLERS.find(x => x.id === chooseCardToShow.suggestion.killer);
                const l = LOCATIONS.find(x => x.id === chooseCardToShow.suggestion.location);
                const w = WEAPONS.find(x => x.id === chooseCardToShow.suggestion.weapon);
                return <>{k?.emoji} {k?.name}, {l?.emoji} {l?.name}, {w?.emoji} {w?.name}</>;
              })()}
            </div>
            <div style={{textAlign:"center",fontSize:10,color:"rgba(200,200,200,0.6)",letterSpacing:2,marginBottom:14,fontFamily:"monospace"}}>
              YOU HAVE {chooseCardToShow.matches.length} MATCHING CARDS — PICK ONE
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
              {chooseCardToShow.matches.map((card, i) => {
                const meta = card.type === "killer" ? KILLERS.find(x => x.id === card.id) :
                             card.type === "location" ? LOCATIONS.find(x => x.id === card.id) :
                             WEAPONS.find(x => x.id === card.id);
                return (
                  <button key={i} onClick={() => {
                    try { GameSFX.smCardSelect && GameSFX.smCardSelect(); } catch(e){}
                    const ctx = chooseCardToShow;
                    setChooseCardToShow(null);
                    finalizeBotSuggestion(ctx.askingBot, ctx.suggestion, match.players[0], card);
                  }} style={{
                    padding:"10px 14px",
                    background:"rgba(150,255,150,0.12)",
                    border:"1.5px solid rgba(150,255,150,0.6)",
                    borderRadius:8,
                    color:"#e8ffe8",
                    fontFamily:"'Cinzel',serif",
                    fontSize:13,
                    letterSpacing:1,
                    cursor:"pointer",
                    textAlign:"left",
                    display:"flex",
                    alignItems:"center",
                    gap:10,
                    transition:"all 0.15s",
                  }}>
                    <span style={{fontSize:18}}>✋</span>
                    <span style={{fontSize:18}}>{meta?.emoji}</span>
                    <span style={{flex:1}}>{meta?.name}</span>
                    <span style={{fontSize:9,color:"rgba(150,255,150,0.6)",letterSpacing:2}}>{card.type.toUpperCase()}</span>
                  </button>
                );
              })}
            </div>
            <div style={{textAlign:"center",fontSize:9,color:"rgba(200,200,200,0.4)",letterSpacing:2,fontFamily:"monospace"}}>
              ONLY {chooseCardToShow.askingBot.name} WILL SEE THE CARD YOU SHOW
            </div>
          </div>
        </div>
      )}

      {showSuggestDialog && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:20,overflow:"auto"}}>
          <div style={{background:"#1a0a0a",border:"1px solid rgba(255,80,80,0.5)",borderRadius:12,padding:24,maxWidth:380,width:"100%"}}>
            <div style={{...titleStyle,fontSize:16,marginBottom:8}}>MAKE A SUGGESTION</div>
            <div style={{...subStyle,fontSize:10,marginBottom:14,textAlign:"center",color:"rgba(255,200,100,0.6)"}}>
              📍 IN: {LOCATIONS.find(l => l.id === playerRoom)?.emoji} {LOCATIONS.find(l => l.id === playerRoom)?.name?.toUpperCase()}
            </div>
            {[{label:"KILLER",cat:"killer",options:KILLERS},{label:"WEAPON",cat:"weapon",options:WEAPONS}].map(({label,cat,options}) => (
              <div key={cat} style={{marginBottom:14}}>
                <div style={{...subStyle,fontSize:10,marginBottom:6,textAlign:"left"}}>{label}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {options.map(o => (
                    <button key={o.id} onClick={() => { try { GameSFX.smCardSelect(); } catch(e) {} setSuggestion(s => ({...s,[cat]:o.id})); }} style={{padding:"6px 10px",fontSize:11,background:suggestion[cat]===o.id?"rgba(255,80,80,0.25)":"rgba(255,255,255,0.04)",border:`1px solid ${suggestion[cat]===o.id?"rgba(255,80,80,0.7)":"rgba(255,255,255,0.2)"}`,borderRadius:6,color:"#e8ddd4",fontFamily:"'Cinzel',serif",letterSpacing:1,cursor:"pointer"}}>
                      {o.emoji} {o.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"center",gap:10,marginTop:18}}>
              <button onClick={() => { setShowSuggestDialog(false); setSuggestion({killer:null,location:null,weapon:null}); }} style={btn2Style}>CANCEL</button>
              <button onClick={submitSuggestion} disabled={!suggestion.killer||!suggestion.weapon} style={{...btnStyle,opacity:(suggestion.killer&&suggestion.weapon)?1:0.4,cursor:(suggestion.killer&&suggestion.weapon)?"pointer":"not-allowed"}}>SUGGEST</button>
            </div>
          </div>
        </div>
      )}

      {/* Accuse dialog */}
      {showAccuseDialog && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:20,overflow:"auto"}}>
          <div style={{background:"#1a0a0a",border:"1px solid rgba(255,80,80,0.5)",borderRadius:12,padding:24,maxWidth:380,width:"100%"}}>
            <div style={{...titleStyle,fontSize:16,marginBottom:8,color:"#ff4040"}}>FINAL ACCUSATION</div>
            <div style={{...subStyle,fontSize:11,marginBottom:16}}>WRONG ACCUSATION = ELIMINATED FROM THE MATCH</div>
            {[{label:"KILLER",cat:"killer",options:KILLERS},{label:"LOCATION",cat:"location",options:LOCATIONS},{label:"WEAPON",cat:"weapon",options:WEAPONS}].map(({label,cat,options}) => (
              <div key={cat} style={{marginBottom:14}}>
                <div style={{...subStyle,fontSize:10,marginBottom:6,textAlign:"left"}}>{label}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {options.map(o => (
                    <button key={o.id} onClick={() => { try { GameSFX.smCardSelect(); } catch(e) {} setAccusation(s => ({...s,[cat]:o.id})); }} style={{padding:"6px 10px",fontSize:11,background:accusation[cat]===o.id?"rgba(255,80,80,0.25)":"rgba(255,255,255,0.04)",border:`1px solid ${accusation[cat]===o.id?"rgba(255,80,80,0.7)":"rgba(255,255,255,0.2)"}`,borderRadius:6,color:"#e8ddd4",fontFamily:"'Cinzel',serif",letterSpacing:1,cursor:"pointer"}}>
                      {o.emoji} {o.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"center",gap:10,marginTop:18}}>
              <button onClick={() => { setShowAccuseDialog(false); setAccusation({killer:null,location:null,weapon:null}); }} style={btn2Style}>CANCEL</button>
              <button onClick={submitAccusation} disabled={!accusation.killer||!accusation.location||!accusation.weapon} style={{...btnStyle,opacity:(accusation.killer&&accusation.location&&accusation.weapon)?1:0.4,cursor:(accusation.killer&&accusation.location&&accusation.weapon)?"pointer":"not-allowed",borderColor:"rgba(255,40,40,0.9)",color:"#ff3030"}}>ACCUSE</button>
            </div>
          </div>
        </div>
      )}

      <div style={{maxWidth:480,width:"100%"}}>
        {/* Turn indicator */}
        <div style={{textAlign:"center",marginBottom:14,padding:"10px 14px",background:isMyTurn?"rgba(255,80,80,0.08)":"rgba(255,255,255,0.03)",border:`1px solid ${isMyTurn?"rgba(255,80,80,0.4)":"rgba(255,255,255,0.15)"}`,borderRadius:8}}>
          <div style={{fontSize:13,color:isMyTurn?"#ff6060":"rgba(255,255,255,0.6)",letterSpacing:3,fontFamily:"'Cinzel',serif"}}>
            {isMyTurn ? "🔍 YOUR TURN — INVESTIGATE" : `⏳ ${currentPlayer ? currentPlayer.name : "..."} IS THINKING...`}
          </div>
        </div>

        {/* Action buttons — SUGGEST is gated by being in a room (after moving on the board). ACCUSE always available. */}
        {isMyTurn && !pendingShow && (
          <div style={{display:"flex",justifyContent:"center",gap:10,marginBottom:14,flexWrap:"wrap"}}>
            {hasMoved ? (
              <>
                {/* Suggest button only renders if player is in an actual room (not hallway) */}
                {LOCATIONS.find(l => l.id === playerRoom) ? (
                  <button
                    onClick={() => {
                      try { GameSFX.smSuggest && GameSFX.smSuggest(); } catch(e){}
                      // Pre-fill the location to the room you're in
                      setSuggestion(s => ({ ...s, location: playerRoom }));
                      setShowSuggestDialog(true);
                    }}
                    style={btnStyle}
                  >🔍 SUGGEST IN {LOCATIONS.find(l => l.id === playerRoom)?.name?.toUpperCase()}</button>
                ) : (
                  <div style={{padding:"8px 14px",fontSize:10,color:"rgba(200,200,200,0.5)",fontFamily:"'Cinzel',serif",letterSpacing:2,fontStyle:"italic"}}>
                    IN HALLWAY — MOVE INTO A ROOM NEXT TURN TO SUGGEST
                  </div>
                )}
                <button onClick={() => {
                  // Pass turn without suggesting
                  setMatch(prev => ({ ...prev, turnIdx: nextActiveTurnIdx(prev, 0) }));
                  setHasMoved(false);
                  setDiceValue(0);
                }} style={btn2Style}>SKIP</button>
              </>
            ) : (
              <button onClick={() => setShowBoard(true)} style={btnStyle}>🎲 ROLL DICE</button>
            )}
            <button onClick={() => { try { GameSFX.smAccuse && GameSFX.smAccuse(); } catch(e){} setShowAccuseDialog(true); }} style={{...btnStyle,borderColor:"rgba(255,40,40,0.9)",color:"#ff3030"}}>⚖ ACCUSE</button>
          </div>
        )}
        {/* Show current room indicator */}
        {isMyTurn && (
          <div style={{textAlign:"center",fontSize:11,color:"rgba(255,255,255,0.5)",letterSpacing:2,marginBottom:14,fontFamily:"'Cinzel',serif"}}>
            📍 YOU ARE IN: {LOCATIONS.find(l => l.id === playerRoom) ? `${LOCATIONS.find(l => l.id === playerRoom)?.emoji} ${LOCATIONS.find(l => l.id === playerRoom)?.name?.toUpperCase()}` : "🚶 HALLWAY"}
          </div>
        )}

        {/* END TURN banner — prominent button shown after a suggestion result so player can mark notebook then advance */}
        {awaitingEndTurn && (
          <div style={{marginBottom:18,padding:"14px 16px",background:"linear-gradient(180deg, rgba(120,255,120,0.12), rgba(60,180,60,0.08))",border:"2px solid rgba(120,255,120,0.6)",borderRadius:10,boxShadow:"0 0 20px rgba(120,255,120,0.3)",textAlign:"center"}}>
            <div style={{fontSize:11,color:"#90ff90",letterSpacing:3,marginBottom:8,fontFamily:"'Cinzel',serif",fontWeight:700,textShadow:"0 0 6px rgba(120,255,120,0.6)"}}>
              ✓ MARK YOUR NOTEBOOK BELOW, THEN END TURN
            </div>
            <button onClick={acknowledgeShow} style={{padding:"12px 28px",background:"linear-gradient(180deg, #1a3a1a, #0a2a0a)",color:"#a0ffa0",border:"1.5px solid #50c850",borderRadius:6,fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:5,fontWeight:700,cursor:"pointer",textShadow:"0 0 6px rgba(120,255,120,0.7)",boxShadow:"0 0 12px rgba(120,255,120,0.4)"}}>END TURN →</button>
          </div>
        )}

        {/* Notebook */}
        <div style={{marginBottom:18}}>
          <div style={{...subStyle,fontSize:11,marginBottom:8,textAlign:"left",color:"#ff6060"}}>📔 YOUR NOTEBOOK — TAP TO MARK</div>
          {[{label:"KILLERS",cat:"killer",options:KILLERS},{label:"LOCATIONS",cat:"location",options:LOCATIONS},{label:"WEAPONS",cat:"weapon",options:WEAPONS}].map(({label,cat,options}) => (
            <div key={cat} style={{marginBottom:10}}>
              <div style={{...subStyle,fontSize:9,marginBottom:4,textAlign:"left",letterSpacing:2}}>{label}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                {options.map(o => {
                  const state = notebook[cat][o.id];
                  let color = "#e8ddd4";
                  let bg = "rgba(255,255,255,0.04)";
                  let border = "rgba(255,255,255,0.2)";
                  let prefix = "";
                  if (state === "in-hand") { bg = "rgba(150,255,150,0.15)"; border = "rgba(150,255,150,0.5)"; prefix = "✋ "; }
                  else if (state === "eliminated") { bg = "rgba(80,80,80,0.2)"; border = "rgba(120,120,120,0.4)"; color = "rgba(180,180,180,0.5)"; prefix = "✖ "; }
                  else if (state === "possible") { bg = "rgba(255,200,50,0.15)"; border = "rgba(255,200,50,0.6)"; color = "#ffcc44"; prefix = "❓ "; }
                  return (
                    <button key={o.id} onClick={() => toggleNotebook(cat,o.id)} disabled={state==="in-hand"} style={{padding:"5px 8px",fontSize:11,background:bg,border:`1px solid ${border}`,borderRadius:6,color,fontFamily:"'Cinzel',serif",letterSpacing:1,cursor:state==="in-hand"?"not-allowed":"pointer",textDecoration:state==="eliminated"?"line-through":"none"}}>
                      {prefix}{o.emoji} {o.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Players */}
        <div style={{marginBottom:18}}>
          <div style={{...subStyle,fontSize:11,marginBottom:8,textAlign:"left",color:"#ff6060"}}>👥 INVESTIGATORS</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {match.players.map((p, i) => {
              const piece = SM_PIECES[p.id] || SM_PIECES[0];
              return (
                <div key={p.id} style={{padding:"8px 12px",background:i===match.turnIdx&&!p.eliminated?"rgba(255,80,80,0.08)":"rgba(255,255,255,0.03)",border:`1px solid ${i===match.turnIdx&&!p.eliminated?"rgba(255,80,80,0.4)":"rgba(255,255,255,0.15)"}`,borderRadius:6,display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:12,opacity:p.eliminated?0.4:1,gap:8}}>
                  <span style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:0}}>
                    <span style={{display:"inline-flex",width:22,height:22,flexShrink:0,alignItems:"center",justifyContent:"center"}}>
                      {smPieceSVG(p.id, "100%")}
                    </span>
                    <span style={{fontFamily:"'Cinzel',serif",letterSpacing:1,color:piece.color,textShadow:`0 0 4px ${piece.color}80`,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name} {p.id===0&&"(YOU)"} {p.eliminated&&"💀"}</span>
                  </span>
                  <span style={{fontSize:10,opacity:0.6,flexShrink:0}}>{p.hand.length} cards</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Log */}
        <div style={{marginBottom:18}}>
          <div style={{...subStyle,fontSize:11,marginBottom:8,textAlign:"left",color:"#ff6060"}}>📜 INVESTIGATION LOG</div>
          <div style={{display:"flex",flexDirection:"column",gap:5,maxHeight:200,overflowY:"auto"}}>
            {match.log.length === 0 && <div style={{...subStyle,fontSize:11,opacity:0.5,textAlign:"left"}}>No clues yet. Make a suggestion to begin.</div>}
            {match.log.slice().reverse().map((entry, i) => {
              if (entry.type === "suggestion") {
                const k = KILLERS.find(x => x.id === entry.suggestion.killer);
                const l = LOCATIONS.find(x => x.id === entry.suggestion.location);
                const w = WEAPONS.find(x => x.id === entry.suggestion.weapon);
                return (
                  <div key={i} style={{padding:"8px 10px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,fontSize:11,fontFamily:"'Cinzel',serif",letterSpacing:0.5,lineHeight:1.5}}>
                    <div><b style={{color:"#ff6060"}}>{entry.by}</b> suggests {k.emoji} {k.name}, {l.emoji} {l.name}, {w.emoji} {w.name}</div>
                    <div style={{fontSize:10,opacity:0.7,marginTop:2}}>
                      {entry.nobodyShowed && <>👁 Nobody had any of those cards.</>}
                      {!entry.nobodyShowed && entry.shownByIsHuman && entry.shownCard && <>{entry.shownByName} showed {entry.shownCard.type === "killer" ? KILLERS.find(k => k.id===entry.shownCard.id).name : entry.shownCard.type === "location" ? LOCATIONS.find(l => l.id===entry.shownCard.id).name : WEAPONS.find(w => w.id===entry.shownCard.id).name} (to {entry.by})</>}
                      {!entry.nobodyShowed && !entry.shownByIsHuman && <>{entry.shownByName} secretly showed a card to {entry.by}</>}
                    </div>
                  </div>
                );
              } else if (entry.type === "accusation") {
                const k = KILLERS.find(x => x.id === entry.accusation.killer);
                const l = LOCATIONS.find(x => x.id === entry.accusation.location);
                const w = WEAPONS.find(x => x.id === entry.accusation.weapon);
                return (
                  <div key={i} style={{padding:"8px 10px",background:entry.correct?"rgba(150,255,150,0.1)":"rgba(255,80,80,0.1)",border:`1px solid ${entry.correct?"rgba(150,255,150,0.4)":"rgba(255,80,80,0.4)"}`,borderRadius:6,fontSize:11,fontFamily:"'Cinzel',serif",letterSpacing:0.5,lineHeight:1.5}}>
                    <div><b style={{color:entry.correct?"#90ff90":"#ff6060"}}>{entry.by}</b> ACCUSES: {k.emoji} {k.name}, {l.emoji} {l.name}, {w.emoji} {w.name}</div>
                    <div style={{fontSize:10,opacity:0.8,marginTop:2}}>{entry.correct ? "✓ CORRECT — CASE SOLVED" : "✗ WRONG — ELIMINATED"}</div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── DREAD WORDS (MULTIPLAYER ACRONYM HORROR GAME) ──
// Connects to wss://api.sinistertrivia.com/dread for real-time multiplayer rounds.
// Each round: server picks an acronym (e.g. "BJK") + topic ("Last words"); players type
// a backronym whose words start with each letter; players vote anonymously for favorite.
// Top 2 by score after 5 rounds advance to a 3-round face-off.

const DREAD_WS_URL = "wss://api.sinistertrivia.com/dread";

function DreadWords({ onExit, savedName, onMatchWin, autoJoinCode }) {
  const [phase, setPhase] = useState("lobby"); // lobby, connecting, ingame, ended, error
  const [errorMsg, setErrorMsg] = useState("");
  const [room, setRoom] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [mySubmission, setMySubmission] = useState("");
  const [draftText, setDraftText] = useState("");
  const [votedFor, setVotedFor] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [results, setResults] = useState(null);
  const [finalRanking, setFinalRanking] = useState(null);
  const [now, setNow] = useState(Date.now());
  // Private-room state
  const [joinMode, setJoinMode] = useState(null); // null | "public" | "create_private" | "join_private"
  const [roomCode, setRoomCode] = useState(""); // code shown to player after creating, or typed when joining
  const [joinCodeInput, setJoinCodeInput] = useState(""); // typed input on the join screen
  const wsRef = useRef(null);
  // Track previous status so we can play sounds on transitions
  const prevStatusRef = useRef(null);
  const lastTickSecRef = useRef(-1);

  // Tick once per second to update the countdown timer display
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  // Play sounds on phase transitions + heartbeat ticks
  useEffect(() => {
    if (!room) return;
    const prev = prevStatusRef.current;
    if (prev !== room.status) {
      if (room.status === "writing" || room.status === "faceoff_writing") {
        try { GameSFX.dwRoundStart(); } catch (e) {}
      } else if (room.status === "voting" || room.status === "faceoff_voting") {
        try { GameSFX.dwResults(); } catch (e) {}
      }
      prevStatusRef.current = room.status;
      lastTickSecRef.current = -1;
    }
    // Heartbeat tick during last 5 seconds of write/vote phases — only if YOU still need to act
    if (room.phaseEndsAt) {
      const isWriting = room.status === "writing" || room.status === "faceoff_writing";
      const isVoting = room.status === "voting" || room.status === "faceoff_voting";
      const stillNeedToAct = (isWriting && !mySubmission) || (isVoting && !votedFor);
      if (stillNeedToAct) {
        const secs = Math.max(0, Math.ceil((room.phaseEndsAt - now) / 1000));
        if (secs > 0 && secs <= 5 && secs !== lastTickSecRef.current) {
          lastTickSecRef.current = secs;
          try { GameSFX.dwTick(); } catch (e) {}
        }
      }
    }
  }, [room, now, mySubmission, votedFor]);

  // Play results sound + win/lose chime when results arrive
  useEffect(() => {
    if (!results) return;
    if (results.winnerId === playerId) {
      try { GameSFX.dwWinRound(); } catch (e) {}
    } else {
      try { GameSFX.dwLoseRound(); } catch (e) {}
    }
  }, [results, playerId]);

  // Play match-end fanfare based on final ranking + record the win on the leaderboard
  useEffect(() => {
    if (!finalRanking || !playerId) return;
    const me = finalRanking.find(p => p.id === playerId);
    if (me && me.rank === 1) {
      try { GameSFX.dwMatchWin(); } catch (e) {}
      // Record the match win to Firestore — bumps this player's lifetime wins counter
      if (typeof onMatchWin === "function") {
        try { onMatchWin(); } catch (e) { console.error("onMatchWin error:", e); }
      }
    } else {
      try { GameSFX.dwMatchLose(); } catch (e) {}
    }
  }, [finalRanking, playerId, onMatchWin]);

  const connect = (mode) => {
    setPhase("connecting");
    setErrorMsg("");
    setMySubmission("");
    setDraftText("");
    setVotedFor(null);
    setResults(null);
    setFinalRanking(null);
    let ws;
    try {
      ws = new WebSocket(DREAD_WS_URL);
    } catch (e) {
      setPhase("error");
      setErrorMsg("Could not reach the server. Try again later.");
      return;
    }
    wsRef.current = ws;
    ws.onopen = () => {
      const name = (savedName && savedName.trim()) || "Anonymous";
      // mode: { type: "public" } | { type: "create_private" } | { type: "join_private", code: "XKWQ" }
      const joinPayload = { type: "join", name, mode: mode || { type: "public" } };
      ws.send(JSON.stringify(joinPayload));
      setPhase("ingame");
    };
    ws.onmessage = (ev) => {
      let msg;
      try { msg = JSON.parse(ev.data); } catch (e) { return; }
      if (msg.type === "joined") {
        setPlayerId(msg.playerId);
        if (msg.roomCode) setRoomCode(msg.roomCode);
      } else if (msg.type === "join_failed") {
        setPhase("error");
        setErrorMsg(msg.reason || "Couldn't join that room.");
      } else if (msg.type === "state") {
        // Only reset per-round local state when the round number actually changes
        setRoom(prev => {
          const roundChanged = !prev || prev.round !== msg.round || prev.isFaceoff !== msg.isFaceoff;
          if (roundChanged && (msg.status === "writing" || msg.status === "faceoff_writing")) {
            setMySubmission("");
            setDraftText("");
            setResults(null);
            setVotedFor(null);
          }
          return msg;
        });
      } else if (msg.type === "round_results") {
        setResults(msg);
        setRoom(prev => prev ? { ...prev, players: msg.players, status: "results" } : prev);
      } else if (msg.type === "match_done") {
        setFinalRanking(msg.finalRanking);
        setPhase("ended");
      }
    };
    ws.onerror = () => {
      setPhase("error");
      setErrorMsg("Connection error. The server may be offline.");
    };
    ws.onclose = () => {
      if (phase === "ingame") {
        setPhase("error");
        setErrorMsg("Disconnected from server.");
      }
    };
  };

  // Share the room invite via the native share sheet (Messages, etc).
  // Uses Capacitor Share on native, navigator.share on mobile web, or copies to clipboard as fallback.
  // Always shows visible feedback so the user knows the button did something.
  const shareInvite = async () => {
    if (!roomCode) {
      setSubmitError("No code yet — wait a sec");
      setTimeout(() => setSubmitError(""), 2000);
      return;
    }
    const url = `https://sinister.pages.dev/?dread=${roomCode}`;
    const text = `Play Dread Words with me! Code: ${roomCode}`;
    const fullMessage = `${text}\n${url}`;
    // Try Capacitor Share plugin first (native iOS/Android)
    try {
      const shareModule = '@capacitor/share';
      const { Share } = await import(/* @vite-ignore */ shareModule);
      await Share.share({ title: "Dread Words Invite", text, url, dialogTitle: "Invite a friend" });
      try { GameSFX.dwRoundStart(); } catch(e){}
      return;
    } catch (e) { /* fall through */ }
    // Mobile web: navigator.share
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Dread Words Invite", text, url });
        try { GameSFX.dwRoundStart(); } catch(e){}
        return;
      } catch (e) { /* user may have cancelled — fall through */ }
    }
    // Fallback: try clipboard, but always show the message visibly so the user has the info
    let copiedOk = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullMessage);
        copiedOk = true;
      }
    } catch (e) { /* swallow — fall through to visible display */ }
    setSubmitError(copiedOk ? `📋 Copied: ${fullMessage}` : `Send this to your friend:\n${fullMessage}`);
    setTimeout(() => setSubmitError(""), 8000);
  };

  // Cleanup on unmount: close any open socket. We DO NOT auto-connect anymore — the lobby
  // screen lets the player pick public matchmaking or a private friend room first.
  useEffect(() => {
    return () => {
      const ws = wsRef.current;
      if (ws) {
        try { if (ws.readyState === 1) ws.send(JSON.stringify({ type: "leave" })); } catch (e) {}
        try { ws.close(); } catch (e) {}
        wsRef.current = null;
      }
    };
  }, []);

  // If launched with a deep-link code (?dread=XKWQ), auto-join that private room on mount
  useEffect(() => {
    if (autoJoinCode && phase === "lobby") {
      const code = autoJoinCode.trim().toUpperCase();
      if (code.length === 4) {
        setJoinMode({ type: "join_private", code });
        connect({ type: "join_private", code });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoJoinCode]);

  const submitBackronym = () => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== 1 || !room) return;
    if (!draftText.trim()) return;
    // Validate locally first: word count == acronym length, each word starts with the right letter
    const words = draftText.trim().split(/\s+/);
    if (words.length !== room.acronym.length) return;
    for (let i = 0; i < words.length; i++) {
      if (!words[i] || words[i][0].toUpperCase() !== room.acronym[i].toUpperCase()) return;
    }
    // Block racial slurs and other targeted hate terms only — regular curses are allowed for fun.
    // Detection ignores spaces/punctuation/numbers so leetspeak attempts (n1gger, fagg0t, etc.) still match.
    const RACIAL_BLOCK = ["nigger","nigga","niggr","faggot","fag","kike","kyke","spic","spik","chink","chinc","wetback","gook","gypsy","tranny","tranney","retard","towelhead","sandnigger","jigaboo","beaner","raghead","coon","spade"];
    const flat = draftText.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/0/g,'o').replace(/1/g,'i').replace(/3/g,'e').replace(/4/g,'a').replace(/5/g,'s');
    if (RACIAL_BLOCK.some(w => flat.includes(w))) {
      setSubmitError("That word is not allowed. Please rewrite.");
      setTimeout(() => setSubmitError(""), 4000);
      return;
    }
    setSubmitError("");
    ws.send(JSON.stringify({ type: "submit", text: draftText.trim() }));
    setMySubmission(draftText.trim());
    try { GameSFX.dwSubmit(); } catch (e) {}
  };

  const castVote = (targetSubId) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== 1 || !room) return;
    if (votedFor) return;
    if (targetSubId === playerId) return;
    ws.send(JSON.stringify({ type: "vote", targetId: targetSubId }));
    setVotedFor(targetSubId);
    try { GameSFX.dwVoteCast(); } catch (e) {}
  };

  const secsLeft = room && room.phaseEndsAt ? Math.max(0, Math.ceil((room.phaseEndsAt - now) / 1000)) : 0;

  const subStyle = { fontSize:12, color:"rgba(255,255,255,0.4)", letterSpacing:3, marginBottom:6 };
  const titleStyle = { fontSize:28, color:"#e8ddd4", letterSpacing:5, marginBottom:8, fontFamily:"'Cinzel',serif", textTransform:"uppercase" };
  const btnStyle = { padding:"12px 24px", background:"transparent", border:"1px solid rgba(255,80,80,0.6)", borderRadius:10, color:"#ff6060", fontFamily:"'Cinzel',serif", fontSize:13, letterSpacing:3, textTransform:"uppercase", cursor:"pointer" };
  const btn2Style = { ...btnStyle, border:"1px solid rgba(255,255,255,0.3)", color:"rgba(255,255,255,0.7)" };

  // Validation feedback for the draft text — green if valid, red if not
  const draftValid = (() => {
    if (!room || !room.acronym) return false;
    const words = draftText.trim().split(/\s+/);
    if (words.length !== room.acronym.length) return false;
    for (let i = 0; i < words.length; i++) {
      if (!words[i] || words[i][0].toUpperCase() !== room.acronym[i].toUpperCase()) return false;
    }
    return true;
  })();

  return (
    <div style={{position:"fixed",inset:0,background:"#060806",color:"#e8ddd4",padding:"20px 16px 100px",zIndex:100,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",overflow:"auto"}}>
      {/* Same font import the App uses for the main "Horror Trivia" title.
          Required here because DreadWords is rendered as an early-return before
          the App's main <style> block mounts. */}
      <style>{`@import url('https://fonts.bunny.net/css?family=jolly-lodger:400|cinzel:400,600,700&display=swap');`}</style>
      {/* Top bar */}
      <div style={{width:"100%",maxWidth:480,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,position:"relative",zIndex:2}}>
        <button onClick={onExit} style={{background:"transparent",border:"none",color:"rgba(255,255,255,0.5)",fontSize:14,letterSpacing:2,cursor:"pointer"}}>← EXIT</button>
        <div style={{width:50}}></div>
        <div style={{width:50}}></div>
      </div>

      {phase === "lobby" && (
        <div style={{textAlign:"center",padding:"20px 16px",maxWidth:440,width:"100%",position:"relative",zIndex:2}}>
          <div style={{fontSize:54,marginBottom:18,filter:"drop-shadow(0 0 8px #ff3030) drop-shadow(0 0 3px #ff3030)"}}>💀</div>
          <div style={{...titleStyle,fontSize:22,marginBottom:6,textShadow:"0 0 6px rgba(255,48,48,0.7), 0 0 2px #ffffff"}}>DREAD WORDS</div>
          <div style={{...subStyle,marginBottom:22}}>Choose how to play</div>

          {/* Public match panel */}
          <div style={{border:"1.5px solid rgba(255,48,48,0.55)",borderRadius:8,padding:"12px 14px",background:"rgba(20,5,5,0.55)",marginBottom:12,boxShadow:"0 0 12px rgba(255,48,48,0.18), inset 0 0 12px rgba(255,48,48,0.06)"}}>
            <button
              onClick={() => { setJoinMode({ type: "public" }); connect({ type: "public" }); }}
              style={{width:"100%",padding:"12px 18px",background:"linear-gradient(180deg, #2a0808, #1a0404)",color:"#ff8080",border:"1.5px solid #ff3030",borderRadius:5,fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:3,fontWeight:700,cursor:"pointer",textShadow:"0 0 4px rgba(255,80,80,0.7)",boxShadow:"0 0 10px rgba(255,48,48,0.3)"}}
            >
              🌐 PUBLIC MATCH
            </button>
            <div style={{...subStyle,fontSize:10,marginTop:8,letterSpacing:2,opacity:0.6}}>Match with anyone online</div>
          </div>

          {/* Create private match panel */}
          <div style={{border:"1.5px solid rgba(255,170,68,0.55)",borderRadius:8,padding:"12px 14px",background:"rgba(20,12,2,0.55)",marginBottom:12,boxShadow:"0 0 12px rgba(255,170,68,0.18), inset 0 0 12px rgba(255,170,68,0.06)"}}>
            <button
              onClick={() => { setJoinMode({ type: "create_private" }); connect({ type: "create_private" }); }}
              style={{width:"100%",padding:"12px 18px",background:"linear-gradient(180deg, #2a1808, #1a1004)",color:"#ffcc66",border:"1.5px solid #ffaa44",borderRadius:5,fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:3,fontWeight:700,cursor:"pointer",textShadow:"0 0 4px rgba(255,170,68,0.7)",boxShadow:"0 0 10px rgba(255,170,68,0.3)"}}
            >
              🤝 CREATE PRIVATE MATCH
            </button>
            <div style={{...subStyle,fontSize:10,marginTop:8,letterSpacing:2,opacity:0.6}}>Get a code to send your friend</div>
          </div>

          {/* Join private match panel */}
          <div style={{border:"1.5px solid rgba(120,180,255,0.55)",borderRadius:8,padding:"12px 14px",background:"rgba(4,10,20,0.55)",marginBottom:18,boxShadow:"0 0 12px rgba(120,180,255,0.18), inset 0 0 12px rgba(120,180,255,0.06)"}}>
            <div style={{display:"flex",gap:6,marginBottom:8}}>
              <input
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4))}
                placeholder="CODE"
                maxLength={4}
                style={{flex:1,padding:"12px 14px",background:"rgba(0,0,0,0.55)",border:"1.5px solid rgba(120,180,255,0.5)",borderRadius:5,color:"#aaccff",fontFamily:"'Cinzel',serif",fontSize:18,letterSpacing:6,textAlign:"center",textTransform:"uppercase",textShadow:"0 0 4px rgba(120,180,255,0.6)"}}
              />
              <button
                disabled={joinCodeInput.length !== 4}
                onClick={() => {
                  const code = joinCodeInput.trim().toUpperCase();
                  if (code.length !== 4) return;
                  setJoinMode({ type: "join_private", code });
                  connect({ type: "join_private", code });
                }}
                style={{padding:"12px 18px",background:"linear-gradient(180deg, #08182a, #04101a)",color:"#aaccff",border:"1.5px solid #5a99ff",borderRadius:5,fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:3,fontWeight:700,cursor:joinCodeInput.length===4?"pointer":"not-allowed",opacity:joinCodeInput.length===4?1:0.4,textShadow:"0 0 4px rgba(120,180,255,0.7)",boxShadow:joinCodeInput.length===4?"0 0 10px rgba(120,180,255,0.3)":"none"}}
              >JOIN</button>
            </div>
            <div style={{...subStyle,fontSize:10,letterSpacing:2,opacity:0.6}}>Have a friend's code? Enter it</div>
          </div>

          <button onClick={onExit} style={{width:"100%",padding:"10px 18px",background:"transparent",color:"rgba(200,200,200,0.6)",border:"1px solid rgba(150,150,150,0.4)",borderRadius:5,fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:3,fontWeight:700,cursor:"pointer"}}>EXIT</button>
        </div>
      )}

      {phase === "connecting" && (
        <div style={{textAlign:"center",padding:30,position:"relative",zIndex:2,maxWidth:440,width:"100%"}}>
          <div style={{fontSize:48,marginBottom:12,filter:"drop-shadow(0 0 8px #ff3030)",animation:"smCellPulse 1.2s ease-in-out infinite"}}>💀</div>
          <div style={{...titleStyle,textShadow:"0 0 6px rgba(255,48,48,0.7), 0 0 2px #ffffff"}}>{joinMode?.type === "join_private" ? "JOINING ROOM" : joinMode?.type === "create_private" ? "CREATING ROOM" : "FINDING A MATCH"}</div>
          <div style={{border:"1.5px solid rgba(255,48,48,0.55)",borderRadius:8,padding:"14px 18px",background:"rgba(20,5,5,0.55)",marginTop:14,boxShadow:"0 0 12px rgba(255,48,48,0.18), inset 0 0 12px rgba(255,48,48,0.06)"}}>
            <div style={{...subStyle,opacity:0.8}}>...connecting to the killers...</div>
          </div>
        </div>
      )}

      {phase === "error" && (
        <div style={{textAlign:"center",padding:30,position:"relative",zIndex:2,maxWidth:440,width:"100%"}}>
          <div style={{...titleStyle,color:"#ff5050",textShadow:"0 0 8px rgba(255,48,48,0.8), 0 0 2px #ffffff"}}>UNABLE TO PLAY</div>
          <div style={{border:"1.5px solid rgba(255,48,48,0.55)",borderRadius:8,padding:"14px 18px",background:"rgba(20,5,5,0.55)",marginTop:14,marginBottom:20,boxShadow:"0 0 12px rgba(255,48,48,0.18), inset 0 0 12px rgba(255,48,48,0.06)"}}>
            <div style={{...subStyle,opacity:0.85}}>{errorMsg}</div>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
            <button onClick={() => connect(joinMode || { type: "public" })} style={{padding:"12px 22px",background:"linear-gradient(180deg, #2a0808, #1a0404)",color:"#ff8080",border:"1.5px solid #ff3030",borderRadius:5,fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:3,fontWeight:700,cursor:"pointer",textShadow:"0 0 4px rgba(255,80,80,0.7)",boxShadow:"0 0 10px rgba(255,48,48,0.3)"}}>TRY AGAIN</button>
            <button onClick={() => { setPhase("lobby"); setRoomCode(""); setRoom(null); setJoinMode(null); }} style={{padding:"10px 18px",background:"transparent",color:"rgba(200,200,200,0.7)",border:"1px solid rgba(150,150,150,0.5)",borderRadius:5,fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:3,fontWeight:700,cursor:"pointer"}}>BACK</button>
            <button onClick={onExit} style={{padding:"10px 18px",background:"transparent",color:"rgba(200,200,200,0.7)",border:"1px solid rgba(150,150,150,0.5)",borderRadius:5,fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:3,fontWeight:700,cursor:"pointer"}}>EXIT</button>
          </div>
        </div>
      )}

      {phase === "ingame" && room && room.status === "waiting" && (
        <div style={{textAlign:"center",padding:"20px 16px",maxWidth:480,width:"100%",position:"relative",zIndex:2}}>
          <div style={{...titleStyle,textShadow:"0 0 6px rgba(255,48,48,0.7), 0 0 2px #ffffff"}}>GATHERING SOULS</div>
          <div style={{...subStyle,marginBottom:18}}>WAITING FOR PLAYERS...</div>

          {/* Player list panel */}
          <div style={{border:"1.5px solid rgba(255,48,48,0.55)",borderRadius:8,padding:"10px 12px",background:"rgba(20,5,5,0.55)",marginBottom:14,boxShadow:"0 0 12px rgba(255,48,48,0.18), inset 0 0 12px rgba(255,48,48,0.06)"}}>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {room.players.map(p => (
                <div key={p.id} style={{padding:"8px 10px",borderRadius:5,display:"flex",justifyContent:"space-between",alignItems:"center",background:p.id===playerId?"rgba(255,80,80,0.18)":"rgba(0,0,0,0.35)",border:p.id===playerId?"1px solid rgba(255,80,80,0.5)":"1px solid rgba(255,255,255,0.08)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:18,filter:"drop-shadow(0 0 3px rgba(255,80,80,0.6))"}}>{p.slasher==="freddy"?"🔥":p.slasher==="jason"?"🏒":p.slasher==="michael"?"🔪":"👻"}</span>
                    <span style={{fontFamily:"'Jolly Lodger',serif",fontSize:18,letterSpacing:2}}>{p.name}</span>
                    {p.isBot && <span style={{fontSize:9,letterSpacing:2,color:"rgba(255,150,0,0.7)",border:"1px solid rgba(255,150,0,0.4)",padding:"1px 5px",borderRadius:3}}>BOT</span>}
                    {p.id===playerId && <span style={{fontSize:9,letterSpacing:2,color:"rgba(150,255,150,0.85)",border:"1px solid rgba(150,255,150,0.5)",padding:"1px 5px",borderRadius:3}}>YOU</span>}
                    {p.isHost && <span style={{fontSize:9,letterSpacing:2,color:"rgba(255,170,68,0.95)",border:"1px solid rgba(255,170,68,0.55)",padding:"1px 5px",borderRadius:3}}>HOST</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{...subStyle,fontSize:10,opacity:0.6,marginBottom:18}}>{(joinMode?.type === "create_private" || joinMode?.type === "join_private") ? "Waiting for everyone to join. Host will start the match." : "Bots will fill empty seats after a few seconds."}</div>

          {/* Invite panel — shows when player has a private room code */}
          {roomCode && (joinMode?.type === "create_private" || joinMode?.type === "join_private") && (
            <div style={{border:"1.5px solid rgba(255,170,68,0.55)",borderRadius:8,padding:"14px 16px",background:"rgba(20,12,2,0.55)",textAlign:"center",marginBottom:14,boxShadow:"0 0 12px rgba(255,170,68,0.18), inset 0 0 12px rgba(255,170,68,0.06)"}}>
              <div style={{color:"#ffaa44",fontSize:11,letterSpacing:3,marginBottom:8,fontFamily:"'Cinzel',serif",fontWeight:700,textShadow:"0 0 4px rgba(255,170,68,0.6)"}}>PRIVATE MATCH CODE</div>
              <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:42,color:"#fff",letterSpacing:14,textShadow:"0 0 20px rgba(255,170,68,0.7), 0 0 4px #fff",marginBottom:10,paddingLeft:14}}>{roomCode}</div>
              <button onClick={shareInvite} style={{padding:"10px 20px",background:"linear-gradient(180deg, #2a1808, #1a1004)",color:"#ffcc66",border:"1.5px solid #ffaa44",borderRadius:5,fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:3,fontWeight:700,cursor:"pointer",textShadow:"0 0 4px rgba(255,170,68,0.7)",boxShadow:"0 0 10px rgba(255,170,68,0.3)",marginBottom:4}}>📲 INVITE FRIEND</button>
              <div style={{fontSize:9,color:"rgba(255,200,100,0.6)",letterSpacing:1,marginTop:8,fontFamily:"'Cinzel',serif"}}>Friends with this code can join</div>
            </div>
          )}

          {/* Host-only START MATCH button for private rooms.
              Visible only when you're the host AND there are at least 2 humans in the room. */}
          {(joinMode?.type === "create_private" || joinMode?.type === "join_private") && (() => {
            const me = room.players.find(p => p.id === playerId);
            const isHost = !!(me && me.isHost);
            const liveHumans = room.players.filter(p => !p.isBot && p.alive).length;
            const canStart = isHost && liveHumans >= 2;
            if (!isHost) {
              return (
                <div style={{textAlign:"center",marginBottom:18,padding:"10px 14px",border:"1px dashed rgba(255,255,255,0.2)",borderRadius:8}}>
                  <div style={{...subStyle,fontSize:10,letterSpacing:2,opacity:0.6}}>Waiting for the host to start...</div>
                </div>
              );
            }
            return (
              <div style={{textAlign:"center",marginBottom:18}}>
                <button
                  disabled={!canStart}
                  onClick={() => {
                    const ws = wsRef.current;
                    if (!ws || ws.readyState !== 1) return;
                    try { ws.send(JSON.stringify({ type: "start_match" })); } catch(e){}
                  }}
                  style={{padding:"14px 32px",background: canStart ? "linear-gradient(180deg, #082a08, #041a04)" : "linear-gradient(180deg, #1a1a1a, #0a0a0a)",color:canStart?"#80ff80":"rgba(150,150,150,0.4)",border:`1.5px solid ${canStart?"#60ff60":"rgba(150,150,150,0.3)"}`,borderRadius:5,fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:3,fontWeight:700,cursor:canStart?"pointer":"not-allowed",textShadow:canStart?"0 0 4px rgba(120,255,120,0.7)":"none",boxShadow:canStart?"0 0 12px rgba(96,255,96,0.4)":"none"}}
                >▶ START MATCH</button>
                {!canStart && <div style={{...subStyle,fontSize:9,letterSpacing:2,marginTop:6,opacity:0.55}}>Need at least 2 players</div>}
              </div>
            );
          })()}

          <div style={{border:"1.5px solid rgba(255,48,48,0.55)",borderRadius:8,padding:"14px 16px",background:"rgba(20,5,5,0.55)",textAlign:"left",boxShadow:"0 0 12px rgba(255,48,48,0.18), inset 0 0 12px rgba(255,48,48,0.06)"}}>
            <div style={{color:"#ff5050",fontSize:11,letterSpacing:3,textAlign:"center",marginBottom:10,fontFamily:"'Cinzel',serif",fontWeight:700,textShadow:"0 0 4px rgba(255,48,48,0.7)"}}>HOW TO PLAY</div>
            {[
              {n:"1", t:"Get an acronym like S.C.R.E.A.M. and a horror topic."},
              {n:"2", t:"Write a sentence where each word starts with those letters."},
              {n:"3", t:"Vote for the best entry — you can't vote for your own."},
              {n:"4", t:"Most votes wins the round. Most rounds wins the match."},
            ].map(r => (
              <div key={r.n} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:6}}>
                <span style={{display:"inline-block",width:18,height:18,borderRadius:9,background:"rgba(255,80,80,0.25)",color:"#ff6060",fontSize:11,fontFamily:"'Cinzel',serif",fontWeight:600,lineHeight:"18px",textAlign:"center",flexShrink:0}}>{r.n}</span>
                <span style={{color:"rgba(255,255,255,0.7)",fontSize:11,letterSpacing:0.5,lineHeight:1.5}}>{r.t}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === "ingame" && room && (room.status === "writing" || room.status === "faceoff_writing") && (
        <div style={{textAlign:"center",padding:"20px 16px 50px",maxWidth:480,width:"100%",position:"relative",zIndex:2}}>
          <div style={{fontSize:14,color:"#ff5050",letterSpacing:4,marginBottom:14,fontFamily:"'Cinzel',serif",fontWeight:700,textShadow:"0 0 6px rgba(255,48,48,0.6)"}}>
            {room.isFaceoff ? `FACE-OFF • ROUND ${room.round} OF ${room.totalRounds}` : `ROUND ${room.round} OF ${room.totalRounds}`}
          </div>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.55)",letterSpacing:2,marginBottom:22,fontStyle:"italic",fontFamily:"'Cinzel',serif"}}>{room.topic}</div>

          {/* Acronym panel */}
          <div style={{border:"1.5px solid rgba(255,48,48,0.55)",borderRadius:8,padding:"18px 18px 12px",background:"rgba(20,5,5,0.55)",marginBottom:20,boxShadow:"0 0 16px rgba(255,48,48,0.22), inset 0 0 14px rgba(255,48,48,0.08)"}}>
            <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:64,letterSpacing:14,color:"#fff",lineHeight:1,textShadow:"0 0 14px rgba(255,48,48,0.9), 0 0 4px #fff",marginBottom:14}}>{room.acronym}</div>
            {/* Killer-as-timer bar */}
            <div style={{position:"relative",height:24,background:"rgba(0,0,0,0.55)",borderRadius:5,overflow:"hidden",border:"1px solid rgba(255,48,48,0.35)"}}>
              <div style={{position:"absolute",top:0,left:0,bottom:0,width:`${Math.max(0,Math.min(100,(secsLeft/45)*100))}%`,background:"linear-gradient(90deg, rgba(255,80,80,0.5), rgba(255,48,48,0.85))",transition:"width 0.25s linear",boxShadow:"0 0 8px rgba(255,48,48,0.6)"}}></div>
              <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,letterSpacing:3,color:"#fff",textShadow:"0 0 4px #000",fontFamily:"'Cinzel',serif",fontWeight:700}}>{secsLeft}s</div>
            </div>
          </div>

          {!mySubmission ? (
            <>
              <input
                type="text"
                value={draftText}
                onChange={e => setDraftText(e.target.value.slice(0,200))}
                placeholder={`Write a horror sentence using ${room.acronym}...`}
                autoFocus
                style={{width:"100%",padding:"16px 18px",fontSize:16,background:"rgba(0,0,0,0.55)",border:`1.5px solid ${draftText && !draftValid?"rgba(255,80,80,0.7)":draftValid?"rgba(120,255,120,0.7)":"rgba(255,48,48,0.45)"}`,borderRadius:6,color:"#e8ddd4",fontFamily:"'Cinzel',serif",letterSpacing:1,marginBottom:14,outline:"none",boxSizing:"border-box",boxShadow:draftValid?"0 0 12px rgba(120,255,120,0.3)":"0 0 12px rgba(255,48,48,0.15)"}}
              />
              <div style={{fontSize:10,letterSpacing:2,color:draftValid?"rgba(150,255,150,0.85)":"rgba(255,255,255,0.55)",marginBottom:24,fontFamily:"'Cinzel',serif"}}>
                {draftText
                  ? (draftValid ? "✓ LOOKS GOOD" : `MUST BE ${room.acronym.length} WORDS, EACH STARTING WITH ${room.acronym.split("").join(" ")}`)
                  : `${room.acronym.length} WORDS, EACH STARTING WITH THE LETTERS`}
              </div>
              <button onClick={submitBackronym} disabled={!draftValid} style={{padding:"14px 32px",background: draftValid ? "linear-gradient(180deg, #2a0808, #1a0404)" : "linear-gradient(180deg, #1a1a1a, #0a0a0a)",color:draftValid?"#ff8080":"rgba(150,150,150,0.4)",border:`1.5px solid ${draftValid?"#ff3030":"rgba(150,150,150,0.3)"}`,borderRadius:5,fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:3,fontWeight:700,cursor:draftValid?"pointer":"not-allowed",textShadow:draftValid?"0 0 4px rgba(255,80,80,0.7)":"none",boxShadow:draftValid?"0 0 12px rgba(255,48,48,0.4)":"none"}}>SUBMIT</button>
              {submitError && <div style={{marginTop:14,fontSize:12,letterSpacing:2,color:"#ff4040",fontFamily:"'Cinzel',serif",textShadow:"0 0 4px rgba(255,48,48,0.6)"}}>⚠ {submitError}</div>}
            </>
          ) : (
            <>
              <div style={{...subStyle,marginBottom:14,color:"rgba(255,80,80,0.7)",fontSize:13,fontWeight:700,textShadow:"0 0 4px rgba(255,48,48,0.5)"}}>{(() => {
                const phrases = [
                  "🩸 YOUR BLOOD IS ON THE PAGE",
                  "💀 THE INK IS DRY",
                  "🔪 YOUR SOUL HAS BEEN SIGNED",
                  "🕯 THE CURSE IS CAST",
                  "👁 IT HAS BEEN WRITTEN",
                  "⚰ SEALED IN THE GRAVE",
                ];
                const seed = (room.acronym || "").charCodeAt(0) || 0;
                return phrases[seed % phrases.length];
              })()}</div>
              <div style={{fontSize:18,color:"#e8ddd4",fontFamily:"'Cinzel',serif",letterSpacing:2,padding:"18px 20px",border:"1.5px solid rgba(120,255,120,0.55)",borderRadius:8,marginBottom:24,background:"rgba(8,20,8,0.55)",boxShadow:"0 0 12px rgba(120,255,120,0.2), inset 0 0 12px rgba(120,255,120,0.06)"}}>{mySubmission}</div>
              <div style={{...subStyle,fontSize:11,opacity:0.7,marginBottom:0}}>NOW WE WAIT FOR THE OTHERS TO SUFFER...</div>
            </>
          )}
          {/* Player list with submission status */}
          <div style={{display:"flex",justifyContent:"center",gap:14,marginTop:36,flexWrap:"wrap"}}>
            {room.players.map(p => {
              return (
                <div key={p.id} style={{fontSize:22,opacity:p.alive?1:0.25,filter:p.alive?"drop-shadow(0 0 4px rgba(255,80,80,0.5))":"none"}} title={p.name}>
                  {p.slasher==="freddy"?"🔥":p.slasher==="jason"?"🏒":p.slasher==="michael"?"🔪":"👻"}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {phase === "ingame" && room && (room.status === "voting" || room.status === "faceoff_voting") && (
        <div style={{textAlign:"center",padding:"20px 16px 50px",maxWidth:480,width:"100%",position:"relative",zIndex:2}}>
          <div style={{fontSize:14,color:"#ff5050",letterSpacing:4,marginBottom:14,fontFamily:"'Cinzel',serif",fontWeight:700,textShadow:"0 0 6px rgba(255,48,48,0.6)"}}>VOTE — WHO LIVES, WHO DIES?</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.55)",letterSpacing:2,marginBottom:18,fontStyle:"italic",fontFamily:"'Cinzel',serif"}}>{room.topic}</div>

          {/* Acronym + timer panel */}
          <div style={{border:"1.5px solid rgba(255,48,48,0.55)",borderRadius:8,padding:"14px 18px 10px",background:"rgba(20,5,5,0.55)",marginBottom:20,boxShadow:"0 0 16px rgba(255,48,48,0.22), inset 0 0 14px rgba(255,48,48,0.08)"}}>
            <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:42,letterSpacing:10,color:"#fff",marginBottom:12,lineHeight:1,textShadow:"0 0 14px rgba(255,48,48,0.9), 0 0 4px #fff"}}>{room.acronym}</div>
            <div style={{position:"relative",height:20,background:"rgba(0,0,0,0.55)",borderRadius:5,overflow:"hidden",border:"1px solid rgba(255,48,48,0.35)"}}>
              <div style={{position:"absolute",top:0,left:0,bottom:0,width:`${Math.max(0,Math.min(100,(secsLeft/15)*100))}%`,background:"linear-gradient(90deg, rgba(255,80,80,0.5), rgba(255,48,48,0.85))",transition:"width 0.25s linear",boxShadow:"0 0 8px rgba(255,48,48,0.6)"}}></div>
              <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,letterSpacing:3,color:"#fff",textShadow:"0 0 4px #000",fontFamily:"'Cinzel',serif",fontWeight:700}}>{secsLeft}s</div>
            </div>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {(room.submissions || []).map(sub => {
              const isMine = sub.subId === playerId;
              const isVoted = votedFor === sub.subId;
              const disabled = isMine || !!votedFor;
              return (
                <button
                  key={sub.subId}
                  onClick={() => castVote(sub.subId)}
                  disabled={disabled}
                  style={{
                    padding:"16px 18px",
                    background: isVoted ? "linear-gradient(180deg, rgba(255,80,80,0.22), rgba(120,0,16,0.15))" : (isMine ? "rgba(0,0,0,0.4)" : "rgba(20,5,5,0.55)"),
                    border: `1.5px solid ${isVoted ? "#ff3030" : (isMine ? "rgba(255,255,255,0.12)" : "rgba(255,48,48,0.45)")}`,
                    borderRadius: 7,
                    color: isMine ? "rgba(255,255,255,0.4)" : "#e8ddd4",
                    fontFamily:"'Cinzel',serif",
                    fontSize:15,
                    letterSpacing:1,
                    textAlign:"left",
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled && !isVoted ? 0.55 : 1,
                    boxShadow: isVoted ? "0 0 14px rgba(255,48,48,0.5), inset 0 0 10px rgba(255,48,48,0.15)" : (isMine ? "none" : "0 0 8px rgba(255,48,48,0.1)"),
                    transition: "all 0.15s ease",
                  }}
                >
                  {sub.text}
                  {isMine && <span style={{fontSize:10,letterSpacing:2,marginLeft:10,opacity:0.55}}>(YOUR ANSWER)</span>}
                  {isVoted && <span style={{fontSize:10,letterSpacing:2,marginLeft:10,color:"#ff5050",fontWeight:700,textShadow:"0 0 4px rgba(255,48,48,0.7)"}}>✓ VOTED</span>}
                </button>
              );
            })}
          </div>
          {(!room.submissions || room.submissions.length === 0) && (
            <div style={{...subStyle,marginTop:30,opacity:0.7}}>Nobody submitted...</div>
          )}
        </div>
      )}

      {phase === "ingame" && room && room.status === "results" && results && (
        <div style={{textAlign:"center",padding:"20px 16px 50px",maxWidth:480,width:"100%",position:"relative",zIndex:2}}>
          <div style={{fontSize:14,color:"#ff5050",letterSpacing:4,marginBottom:14,fontFamily:"'Cinzel',serif",fontWeight:700,textShadow:"0 0 6px rgba(255,48,48,0.6)"}}>ROUND {results.round} RESULTS</div>

          {/* Acronym panel */}
          <div style={{border:"1.5px solid rgba(255,48,48,0.55)",borderRadius:8,padding:"14px 18px",background:"rgba(20,5,5,0.55)",marginBottom:20,boxShadow:"0 0 16px rgba(255,48,48,0.22), inset 0 0 14px rgba(255,48,48,0.08)"}}>
            <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:38,letterSpacing:8,color:"#fff",lineHeight:1,textShadow:"0 0 14px rgba(255,48,48,0.9), 0 0 4px #fff"}}>{results.acronym}</div>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:30}}>
            {results.submissions.sort((a,b) => b.votes - a.votes).map(sub => {
              const player = results.players.find(p => p.id === sub.playerId);
              return (
                <div key={sub.playerId} style={{
                  padding:"14px 16px",
                  border:`1.5px solid ${sub.isWinner ? "#ffd070" : "rgba(255,48,48,0.4)"}`,
                  borderRadius:7,
                  background: sub.isWinner ? "linear-gradient(180deg, rgba(255,200,80,0.18), rgba(120,80,0,0.1))" : "rgba(20,5,5,0.55)",
                  textAlign:"left",
                  display:"flex",
                  flexDirection:"column",
                  gap:6,
                  boxShadow: sub.isWinner ? "0 0 16px rgba(255,200,80,0.45), inset 0 0 12px rgba(255,200,80,0.1)" : "0 0 8px rgba(255,48,48,0.1)",
                }}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:11,color:sub.isWinner?"#ffd070":"rgba(255,255,255,0.6)",letterSpacing:2,fontFamily:"'Cinzel',serif",fontWeight:700}}>
                    <span style={{textShadow:sub.isWinner?"0 0 4px rgba(255,200,80,0.7)":"none"}}>{sub.isWinner && "👑 "}{player ? player.name : "???"} {player && player.isBot ? "(bot)" : ""}</span>
                    <span style={{color:sub.isWinner?"#ffd070":"#ff8080",textShadow:sub.isWinner?"0 0 4px rgba(255,200,80,0.7)":"0 0 4px rgba(255,80,80,0.5)"}}>{sub.votes} VOTE{sub.votes===1?"":"S"}</span>
                  </div>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:15,letterSpacing:1,color:"#e8ddd4"}}>{sub.text}</div>
                </div>
              );
            })}
          </div>

          {/* Scoreboard panel */}
          <div style={{border:"1.5px solid rgba(255,170,68,0.55)",borderRadius:8,padding:"12px 14px",background:"rgba(20,12,2,0.55)",marginBottom:18,boxShadow:"0 0 12px rgba(255,170,68,0.18), inset 0 0 12px rgba(255,170,68,0.06)"}}>
            <div style={{fontSize:11,letterSpacing:3,color:"#ffaa44",marginBottom:10,fontFamily:"'Cinzel',serif",fontWeight:700,textShadow:"0 0 4px rgba(255,170,68,0.6)"}}>SCORES</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {[...results.players].sort((a,b) => b.score - a.score).map(p => (
                <div key={p.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",background:p.id===playerId?"rgba(255,170,68,0.15)":"rgba(0,0,0,0.4)",border:p.id===playerId?"1px solid rgba(255,170,68,0.45)":"1px solid rgba(255,255,255,0.08)",borderRadius:5,fontSize:14}}>
                  <span style={{fontFamily:"'Jolly Lodger',serif",letterSpacing:1,color:"#e8ddd4"}}>
                    {p.id === playerId && "👁 "}{p.name}
                  </span>
                  <span style={{color:"#ffaa44",fontFamily:"'Cinzel',serif",fontWeight:700,textShadow:"0 0 4px rgba(255,170,68,0.6)"}}>{p.score}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{...subStyle,fontSize:10,opacity:0.6}}>NEXT ROUND IN A MOMENT...</div>
        </div>
      )}

      {phase === "ended" && finalRanking && (
        <div style={{textAlign:"center",padding:"10px 16px 30px",maxWidth:480,width:"100%",position:"relative",zIndex:2}}>
          <div style={{fontSize:48,marginBottom:8,filter:"drop-shadow(0 0 10px rgba(255,200,80,0.7))"}}>🏆</div>
          <div style={{...titleStyle,textShadow:"0 0 8px rgba(255,200,80,0.8), 0 0 2px #ffffff"}}>FINAL VERDICT</div>
          <div style={{fontSize:11,letterSpacing:3,color:"#ffd070",marginBottom:18,fontFamily:"'Cinzel',serif",fontWeight:700,textShadow:"0 0 4px rgba(255,200,80,0.6)"}}>{finalRanking[0]?.name?.toUpperCase()} SURVIVED THE NIGHT</div>

          {/* Ranking panel */}
          <div style={{border:"1.5px solid rgba(255,170,68,0.55)",borderRadius:8,padding:"12px 14px",background:"rgba(20,12,2,0.55)",marginBottom:20,boxShadow:"0 0 12px rgba(255,170,68,0.18), inset 0 0 12px rgba(255,170,68,0.06)"}}>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {finalRanking.map(p => (
                <div key={p.id} style={{
                  padding:"10px 14px",
                  border:`1.5px solid ${p.rank===1?"#ffd070":"rgba(255,255,255,0.12)"}`,
                  borderRadius:5,
                  background:p.rank===1?"linear-gradient(180deg, rgba(255,200,80,0.18), rgba(120,80,0,0.1))":"rgba(0,0,0,0.4)",
                  display:"flex",
                  justifyContent:"space-between",
                  alignItems:"center",
                  boxShadow:p.rank===1?"0 0 14px rgba(255,200,80,0.4), inset 0 0 10px rgba(255,200,80,0.1)":"none",
                }}>
                  <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:18,letterSpacing:2,display:"flex",alignItems:"center",gap:8,color:p.rank===1?"#fff":"#e8ddd4",textShadow:p.rank===1?"0 0 4px rgba(255,200,80,0.6)":"none"}}>
                    <span>{p.rank===1?"👑":p.rank===2?"🥈":p.rank===3?"🥉":""}#{p.rank}</span>
                    <span>{p.name}</span>
                    {p.isBot && <span style={{fontSize:9,letterSpacing:2,color:"rgba(255,150,0,0.7)",border:"1px solid rgba(255,150,0,0.4)",padding:"1px 5px",borderRadius:3}}>BOT</span>}
                  </div>
                  <span style={{color:p.rank===1?"#ffd070":"#ffaa44",fontFamily:"'Jolly Lodger',serif",fontSize:18,textShadow:p.rank===1?"0 0 4px rgba(255,200,80,0.7)":"0 0 4px rgba(255,170,68,0.5)"}}>{p.score}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{display:"flex",gap:10,justifyContent:"center"}}>
            <button onClick={connect} style={{padding:"12px 22px",background:"linear-gradient(180deg, #2a0808, #1a0404)",color:"#ff8080",border:"1.5px solid #ff3030",borderRadius:5,fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:3,fontWeight:700,cursor:"pointer",textShadow:"0 0 4px rgba(255,80,80,0.7)",boxShadow:"0 0 10px rgba(255,48,48,0.3)"}}>PLAY AGAIN</button>
            <button onClick={onExit} style={{padding:"10px 18px",background:"transparent",color:"rgba(200,200,200,0.7)",border:"1px solid rgba(150,150,150,0.5)",borderRadius:5,fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:3,fontWeight:700,cursor:"pointer"}}>EXIT</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// SLASHER SEARCH — horror word search mini game
// ──────────────────────────────────────────────────────────────────────────
const SS_SAVE_KEY = "ss_progress_v1";

// 5 acts of 10 levels each = 50 levels. Each act has its own theme + huge word pool.
// Words are flat lists per act so all of an act's words are available to every level.
// Levels randomly pick a subset, avoiding recently-used words tracked in progress.recentWords.
const SS_ACTS = [
  {
    label: "KILLERS",
    color: "#ff5050",
    skyTop: "#1a0808", skyBottom: "#330a0a",
    pool: [
      "MICHAEL","JASON","FREDDY","CHUCKY","PINHEAD","GHOSTFACE","JIGSAW",
      "CANDYMAN","MYERS","KRUEGER","VOORHEES","PENNYWISE",
      "ART","ESTHER","SAMARA","ANNABELLE","BABADOOK","PAZUZU","VALAK",
      "DAMIEN","REGAN","TIFFANY","SLENDER","KRAMPUS","LEPRECHAUN",
      "LAURIE","NANCY","SIDNEY","RIPLEY","KIRSTY",
      "DRACULA","WOLFMAN",
      "BUNDY","DAHMER","GACY","ZODIAC","RAMIREZ",
      "HANNIBAL","LECTER","NORMAN","BLADE","LESTAT","CARRIE",
      "TALLMAN","CREEPER",
    ],
  },
  {
    label: "MONSTERS",
    color: "#ff8c1a",
    skyTop: "#1a0d0a", skyBottom: "#3d1a0a",
    pool: [
      "VAMPIRE","WEREWOLF","ZOMBIE","GHOST","WITCH","DEMON","DEVIL",
      "MUMMY","GHOUL","PHANTOM","BANSHEE","WRAITH",
      "REVENANT","SPIRIT","SPECTER","UNDEAD","MONSTER","CREATURE",
      "BEAST","FIEND",
      "CTHULHU","ELDRITCH",
      "BIGFOOT","SASQUATCH","YETI","MOTHMAN","KRAKEN",
      "ALIEN","XENOMORPH","PARASITE","MUTANT","HYBRID","FREAK",
      "DOLL","PUPPET","CLOWN","GOLEM",
      "BOGEYMAN","GOBLIN","GREMLIN","TROLL","DRAGON","DJINN",
      "CRONE","HAG","COVEN",
      "STRIGOI","NOSFERATU",
    ],
  },
  {
    label: "WEAPONS",
    color: "#cc66ff",
    skyTop: "#1a0a2e", skyBottom: "#2a1442",
    pool: [
      "MACHETE","CHAINSAW","KNIFE","CLEAVER","HATCHET","AXE","HOOK",
      "DAGGER","SCYTHE","RAZOR","PICKAXE","CROWBAR","SHEARS","SCALPEL",
      "SLEDGE","STILETTO","KATANA","CROSSBOW","SHOTGUN","PITCHFORK",
      "TORCH","DRILL","HAMMER","SPEAR","CHAIN","NAILGUN","ICEPICK",
      "BUZZSAW","BONESAW","HACKSAW",
      "ROPE","NOOSE","WIRE","GARROTE",
      "FANGS","CLAWS","TEETH","TALONS","HORNS",
      "CURSE","HEX","SPELL","RUNE","AMULET","RELIC","STAKE","SILVER",
      "GARLIC","ROSARY","BIBLE","MIRROR","OUIJA","ALTAR","CAULDRON",
      "GRIMOIRE","CRUCIFIX","SCROLL",
      "MASK","HOOD","HOCKEY","BURLAP","GASMASK",
      "STAB","SLASH","STRANGLE","BEHEAD","DROWN","IMPALE","SLAY",
      "CARVE","BUTCHER","MURDER","CHOKE","FLAY","CRUSH",
      "BLOOD","CORPSE","SKULL","SKELETON","BONES","ASHES",
      "COFFIN","HEARSE","TOMB","CRYPT","GRAVE","CASKET","CADAVER",
    ],
  },
  {
    label: "MOVIES",
    color: "#44ee88",
    skyTop: "#0a1a14", skyBottom: "#143324",
    pool: [
      "HALLOWEEN","SCREAM","PSYCHO","FRIDAY","TERRIFIER","HOSTEL","MANIAC",
      "EXORCIST","OMEN","CONJURING","SINISTER","INSIDIOUS","SMILE",
      "HEREDITARY","MIDSOMMAR","WAILING","RITUAL","BARBARIAN",
      "FRIGHT","CRONOS",
      "HOWLING",
      "DAWN","DIARY","SHAUN","OVERLORD",
      "ALIENS","INVASION","PROMETHEUS","SUNSHINE",
      "FLY","TUSK","CABIN","TITANE","SOCIETY",
      "RING","GRUDGE","PULSE","OLDBOY","SHUTTER","AUDITION",
      "CREEP",
      "TEXAS","MASSACRE","HILLS","SHINING","JAWS","SUSPIRIA",
      "PHANTASM","BURNING","INFERNO","TENEBRE","CRITTERS","GREMLINS",
      "HELLRAISER",
      "GETOUT","NOPE","PEARL","FOLLOWS","DESCENT","INVISIBLE","MEGAN",
      "CUJO","CHRISTINE","MISERY",
      "NIGHTMARE","REVENGE","REUNION","TERROR",
      "FUNHOUSE","STALKER","PURGE",
      "JEEPERS","CARNIVAL",
    ],
  },
  {
    label: "DIRECTORS",
    color: "#ffd700",
    skyTop: "#1a0d00", skyBottom: "#332200",
    pool: [
      "CARPENTER","CRAVEN","ROMERO","ARGENTO","HOOPER","RAIMI",
      "HITCHCOCK","BARKER","ASTER","EGGERS","PEELE","FLANAGAN",
      "CRONENBERG","KUBRICK","DEPALMA","FRIEDKIN","FULCI","BAVA",
      "DEMME","BIGELOW","POLANSKI","WAN",
    ],
  },
];

// Generate level data: pick words from the act's pool, avoiding recently-used ones from prior plays.
function ssBuildLevel(idx, recentWords = []) {
  const act = Math.floor(idx / 10);
  const levelInAct = idx % 10;
  const a = SS_ACTS[act]; // still used for sky color / label
  // Force a 10x10 grid for better screen fit
  const gridSize = 10;
  // Combine ALL act pools into one master pool — every level pulls from the full mix
  // (killers, monsters, weapons, places, movies, etc. — all jumbled together).
  const masterPool = [];
  for (const actPool of SS_ACTS) {
    for (const w of actPool.pool) masterPool.push(w);
  }
  // Words must be 3-9 chars to fit a 10x10 grid
  const allWords = [...new Set(masterPool.map(w => w.replace(/\s+/g, "").toUpperCase()))]
    .filter(w => w.length >= 3 && w.length <= 9);
  // Exclude recently-used words if possible
  const recentSet = new Set(recentWords);
  let candidates = allWords.filter(w => !recentSet.has(w));
  const targetCount = Math.min(12, 7 + Math.floor(levelInAct / 2)); // 7-12 words
  if (candidates.length < targetCount + 5) candidates = allWords;
  // Shuffle and take target count
  const shuffled = [...candidates];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const words = shuffled.slice(0, targetCount);
  return {
    name: `LEVEL ${idx + 1}`,
    actLabel: a.label,
    color: a.color,
    skyTop: a.skyTop,
    skyBottom: a.skyBottom,
    gridSize,
    words,
  };
}

// Place words randomly in a grid. Returns { grid, placements } where placements is an
// array of { word, cells: [{r,c},...] }.
function ssGenerateGrid(size, words) {
  // 8 directions: right, down, down-right, up-right, left, up, up-left, down-left
  const dirs = [
    { dr: 0, dc: 1 }, { dr: 1, dc: 0 }, { dr: 1, dc: 1 }, { dr: -1, dc: 1 },
    { dr: 0, dc: -1 }, { dr: -1, dc: 0 }, { dr: -1, dc: -1 }, { dr: 1, dc: -1 },
  ];
  // Initialize grid as null cells
  const grid = Array.from({length: size}, () => Array(size).fill(null));
  const placements = [];
  // Track how many words have been placed in each direction so we can prefer underused ones.
  // Index matches the dirs array above.
  const dirUsage = [0, 0, 0, 0, 0, 0, 0, 0];

  // Shuffle the word order so words don't always get placed in the same sequence
  const wordOrder = [...words];
  for (let i = wordOrder.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [wordOrder[i], wordOrder[j]] = [wordOrder[j], wordOrder[i]];
  }

  for (const word of wordOrder) {
    let placed = false;
    // Build a per-word direction priority list: shuffle the indices, then sort by
    // (usage count, random) so least-used directions come first. This forces variety.
    const dirIndices = dirs.map((_, i) => i);
    for (let i = dirIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [dirIndices[i], dirIndices[j]] = [dirIndices[j], dirIndices[i]];
    }
    dirIndices.sort((a, b) => dirUsage[a] - dirUsage[b]);

    // Try each direction in priority order, with several random start positions per direction
    outer: for (const dirIdx of dirIndices) {
      const dir = dirs[dirIdx];
      // Try ~30 random start positions for this direction
      for (let attempt = 0; attempt < 30; attempt++) {
        const r = Math.floor(Math.random() * size);
        const c = Math.floor(Math.random() * size);
        const endR = r + dir.dr * (word.length - 1);
        const endC = c + dir.dc * (word.length - 1);
        if (endR < 0 || endR >= size || endC < 0 || endC >= size) continue;
        let conflict = false;
        const cells = [];
        for (let i = 0; i < word.length; i++) {
          const rr = r + dir.dr * i;
          const cc = c + dir.dc * i;
          if (grid[rr][cc] !== null && grid[rr][cc] !== word[i]) { conflict = true; break; }
          cells.push({ r: rr, c: cc });
        }
        if (conflict) continue;
        for (let i = 0; i < word.length; i++) {
          grid[cells[i].r][cells[i].c] = word[i];
        }
        placements.push({ word, cells });
        dirUsage[dirIdx]++;
        placed = true;
        break outer;
      }
    }
    if (!placed) {
      // Couldn't place this word in any direction — skip it
    }
  }
  // Fill empty cells with random letters, biased toward common horror starts
  const fillerPool = "BCDEFGHJKLMNPRSTAEIOU";
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === null) {
        grid[r][c] = fillerPool[Math.floor(Math.random() * fillerPool.length)];
      }
    }
  }
  return { grid, placements };
}

async function ssLoadProgress() {
  try {
    const raw = await Storage.get(SS_SAVE_KEY);
    if (!raw) return { unlocked: 1, bestTimes: {}, currentRun: null, recentWords: [] };
    const data = JSON.parse(raw);
    return {
      unlocked: Math.max(1, Math.min(50, data.unlocked || 1)),
      bestTimes: data.bestTimes || {},
      currentRun: data.currentRun || null,
      recentWords: Array.isArray(data.recentWords) ? data.recentWords : [],
    };
  } catch(e) { return { unlocked: 1, bestTimes: {}, currentRun: null, recentWords: [] }; }
}
async function ssSaveProgress(p) {
  try { await Storage.set(SS_SAVE_KEY, JSON.stringify(p)); } catch(e){}
}

function SlasherSearch({ onExit }) {
  // Local button styles (matches the rest of the app's mini-game look)
  const btnStyle = {background:"transparent",border:"1px solid rgba(255,80,80,0.6)",borderRadius:10,color:"#ff6060",fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:3,textTransform:"uppercase",padding:"12px 24px",cursor:"pointer"};
  const btn2Style = {...btnStyle,border:"1px solid rgba(255,255,255,0.2)",color:"rgba(255,255,255,0.5)"};
  const [phase, setPhase] = useState("intro"); // intro | levelSelect | playing | levelWon
  const [levelIdx, setLevelIdx] = useState(0);
  const [progress, setProgress] = useState({ unlocked: 1, bestTimes: {} });
  const [level, setLevel] = useState(null); // { gridSize, words, ... }
  const [grid, setGrid] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [foundWords, setFoundWords] = useState([]); // [{ word, cells, color }]
  const [hintsLeft, setHintsLeft] = useState(3);
  const [hintCells, setHintCells] = useState(null); // { cells: [{r,c}] }
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  // Drag selection
  const [dragStart, setDragStart] = useState(null); // { r, c }
  const [dragEnd, setDragEnd] = useState(null);     // { r, c }
  const [shake, setShake] = useState(0);

  // Word color palette — each found word gets a different color stripe
  const WORD_COLORS = useMemo(() => [
    "#ff5050","#ff8c1a","#ffd700","#88ff44","#44ddff",
    "#a060ff","#ff44aa","#ff6644","#88dd66","#ffaa44",
  ], []);

  useEffect(() => {
    let cancel = false;
    ssLoadProgress().then(p => { if (!cancel) setProgress(p); });
    return () => { cancel = true; };
  }, []);

  // Pause the main app's background music while in this mini game (matching the other mini games).
  // resumeM() picks back up where it left off if the user had music enabled.
  useEffect(() => {
    try { Au.pauseM(); } catch(e){}
    return () => { try { Au.resumeM(); } catch(e){} };
  }, []);

  // Tick once per second to update elapsed time
  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 250);
    return () => clearInterval(id);
  }, [phase, startTime]);

  const startLevel = (idx, forceFresh = false) => {
    // Check for an in-progress saved run for this exact level — if found and not forcing fresh, resume it
    const saved = progress.currentRun;
    if (!forceFresh && saved && saved.levelIdx === idx) {
      // Resume — rebuild level meta (color/sky/etc) but use saved grid/placements/foundWords
      const lvl = ssBuildLevel(idx);
      // Override the level's words with what was placed in the saved run (so the word list matches)
      lvl.words = saved.placements.map(p => p.word);
      lvl.gridSize = saved.grid.length;
      setLevel(lvl);
      setLevelIdx(idx);
      setGrid(saved.grid);
      setPlacements(saved.placements);
      setFoundWords(saved.foundWords || []);
      setHintsLeft(saved.hintsLeft != null ? saved.hintsLeft : 3);
      setHintCells(null);
      setDragStart(null);
      setDragEnd(null);
      // Reset start time to "elapsed seconds ago" so the timer continues from where they left off
      const elapsedSaved = saved.elapsed || 0;
      setStartTime(Date.now() - elapsedSaved * 1000);
      setElapsed(elapsedSaved);
      setPhase("playing");
      try { GameSFX.tone(523, 0.1, 'sine', 0.1); GameSFX.tone(659, 0.12, 'sine', 0.1); } catch(e){}
      return;
    }
    // Fresh start — exclude recently-used words from the act's pool to maximize variety
    const lvl = ssBuildLevel(idx, progress.recentWords || []);
    setLevel(lvl);
    setLevelIdx(idx);
    const { grid: g, placements: ps } = ssGenerateGrid(lvl.gridSize, lvl.words);
    setGrid(g);
    setPlacements(ps);
    setFoundWords([]);
    setHintsLeft(3);
    setHintCells(null);
    setDragStart(null);
    setDragEnd(null);
    setStartTime(Date.now());
    setElapsed(0);
    setPhase("playing");
    // Add this level's words to the recent list (capped at last 60 to keep variety high without blocking forever)
    setProgress(prev => {
      const newRecent = [...(prev.recentWords || []), ...lvl.words].slice(-60);
      const next = { ...prev, recentWords: newRecent };
      ssSaveProgress(next);
      return next;
    });
    try { GameSFX.tone(523, 0.1, 'sine', 0.1); GameSFX.tone(659, 0.12, 'sine', 0.1); } catch(e){}
  };

  // When all words found, win
  useEffect(() => {
    if (phase !== "playing" || !placements.length) return;
    if (foundWords.length >= placements.length) {
      const totalTime = Math.floor((Date.now() - startTime) / 1000);
      setProgress(prev => {
        const prevBest = prev.bestTimes[levelIdx] || Infinity;
        const next = {
          unlocked: Math.max(prev.unlocked, Math.min(50, levelIdx + 2)),
          bestTimes: { ...prev.bestTimes, [levelIdx]: Math.min(prevBest, totalTime) },
          currentRun: null, // Cleared on completion — next visit generates fresh
        };
        ssSaveProgress(next);
        return next;
      });
      setTimeout(() => setPhase("levelWon"), 1200);
      try {
        GameSFX.tone(523, 0.15, 'sine', 0.15);
        setTimeout(() => GameSFX.tone(659, 0.15, 'sine', 0.15), 100);
        setTimeout(() => GameSFX.tone(784, 0.15, 'sine', 0.15), 200);
        setTimeout(() => GameSFX.tone(1047, 0.3, 'sine', 0.18), 300);
      } catch(e){}
    }
  }, [foundWords, placements, phase, startTime, levelIdx]);

  // Compute the line of cells from dragStart to dragEnd (only if it's a valid line)
  const getLineCells = (start, end) => {
    if (!start || !end) return [];
    const dr = end.r - start.r;
    const dc = end.c - start.c;
    const adr = Math.abs(dr), adc = Math.abs(dc);
    // Must be horizontal, vertical, or perfect diagonal
    if (adr !== 0 && adc !== 0 && adr !== adc) return [];
    const len = Math.max(adr, adc) + 1;
    const stepR = adr === 0 ? 0 : dr / adr;
    const stepC = adc === 0 ? 0 : dc / adc;
    const cells = [];
    for (let i = 0; i < len; i++) {
      cells.push({ r: start.r + stepR * i, c: start.c + stepC * i });
    }
    return cells;
  };

  const onCellPointerDown = (r, c, e) => {
    if (e && e.currentTarget && e.currentTarget.setPointerCapture) {
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch(err){}
    }
    setDragStart({ r, c });
    setDragEnd({ r, c });
    try { GameSFX.tone(440, 0.04, 'sine', 0.06); } catch(e2){}
  };

  // We track pointer move at the grid container level, mapping client coords → cell
  const gridRef = useRef(null);
  const onGridPointerMove = (e) => {
    if (!dragStart) return;
    const el = gridRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cellSize = rect.width / level.gridSize;
    const c = Math.max(0, Math.min(level.gridSize - 1, Math.floor(x / cellSize)));
    const r = Math.max(0, Math.min(level.gridSize - 1, Math.floor(y / cellSize)));
    if (!dragEnd || dragEnd.r !== r || dragEnd.c !== c) {
      setDragEnd({ r, c });
    }
  };

  const onGridPointerUp = () => {
    if (!dragStart || !dragEnd) {
      setDragStart(null); setDragEnd(null);
      return;
    }
    const cells = getLineCells(dragStart, dragEnd);
    if (cells.length >= 3) {
      const word = cells.map(({r,c}) => grid[r][c]).join("");
      const reverse = word.split("").reverse().join("");
      // Check both directions
      const hit = placements.find(p => {
        if (foundWords.find(f => f.word === p.word)) return false; // already found
        if (p.word !== word && p.word !== reverse) return false;
        // Verify cells match exactly (in either order)
        const sameForward = cells.length === p.cells.length && cells.every((c,i) => c.r === p.cells[i].r && c.c === p.cells[i].c);
        const sameReverse = cells.length === p.cells.length && cells.every((c,i) => c.r === p.cells[p.cells.length-1-i].r && c.c === p.cells[p.cells.length-1-i].c);
        return sameForward || sameReverse;
      });
      if (hit) {
        // Found! Pick a color from the palette
        const colorIdx = foundWords.length % WORD_COLORS.length;
        setFoundWords(prev => [...prev, { word: hit.word, cells: hit.cells, color: WORD_COLORS[colorIdx] }]);
        try {
          GameSFX.tone(659, 0.08, 'sine', 0.14);
          setTimeout(() => GameSFX.tone(784, 0.08, 'sine', 0.14), 60);
          setTimeout(() => GameSFX.tone(988, 0.12, 'sine', 0.14), 120);
          GameSFX.noise(0.12, 0.1);
        } catch(e){}
      } else {
        // Wrong — small shake feedback
        setShake(Date.now());
        setTimeout(() => setShake(0), 250);
        try { GameSFX.tone(220, 0.1, 'sawtooth', 0.08); } catch(e){}
      }
    }
    setDragStart(null);
    setDragEnd(null);
  };

  const useHint = () => {
    if (hintsLeft <= 0) return;
    const remaining = placements.filter(p => !foundWords.find(f => f.word === p.word));
    if (remaining.length === 0) return;
    const target = remaining[Math.floor(Math.random() * remaining.length)];
    // Show first cell briefly
    setHintCells({ cells: [target.cells[0]] });
    setHintsLeft(h => h - 1);
    setTimeout(() => setHintCells(null), 2000);
    try { GameSFX.tone(880, 0.1, 'sine', 0.12); } catch(e){}
  };

  // ── INTRO ──
  if (phase === "intro") {
    return (
      <div style={{position:"fixed",inset:0,background:"#060806",color:"#fff5e0",zIndex:100,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px 18px",overflow:"auto"}}>
        <style>{`@font-face { font-family: 'Jolly Lodger'; src: url('/fonts/JollyLodger-Regular.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; } @import url('https://fonts.bunny.net/css?family=jolly-lodger:400|cinzel:400,600,700&display=swap');`}</style>
        <button onClick={onExit} style={{position:"absolute",top:14,left:14,background:"transparent",border:"1px solid rgba(255,255,255,0.2)",borderRadius:8,color:"rgba(255,255,255,0.6)",fontSize:11,letterSpacing:2,padding:"6px 12px",cursor:"pointer",fontFamily:"'Cinzel',serif",zIndex:3}}>← EXIT</button>
        <div style={{position:"relative",zIndex:2,display:"flex",flexDirection:"column",alignItems:"center",maxWidth:440,width:"100%"}}>
          <div style={{fontSize:74,lineHeight:1,marginBottom:14,filter:"drop-shadow(0 0 10px #ff3030) drop-shadow(0 0 4px #ff5050)"}}>🔍</div>
          <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:42,color:"#ff5050",letterSpacing:3,textShadow:"0 0 14px rgba(255,48,48,0.9), 0 0 4px #fff",marginBottom:6,textAlign:"center",whiteSpace:"nowrap",lineHeight:1}}>SLASHER SEARCH</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:11,color:"#ff8080",letterSpacing:4,marginBottom:20,textAlign:"center",fontWeight:700,textShadow:"0 0 4px rgba(255,48,48,0.5)"}}>HUNT THE HIDDEN HORROR</div>

          {/* HOW TO PLAY panel */}
          <div style={{border:"1.5px solid rgba(255,48,48,0.55)",borderRadius:8,padding:"14px 18px",background:"rgba(20,5,5,0.55)",marginBottom:20,maxWidth:340,width:"100%",boxShadow:"0 0 12px rgba(255,48,48,0.18), inset 0 0 12px rgba(255,48,48,0.06)"}}>
            <div style={{color:"#ff5050",fontSize:11,letterSpacing:3,textAlign:"center",marginBottom:10,fontFamily:"'Cinzel',serif",fontWeight:700,textShadow:"0 0 4px rgba(255,48,48,0.7)"}}>HOW TO PLAY</div>
            {[
              "Drag your finger across letters to spell a word",
              "Words can go horizontal, vertical, or diagonal",
              "And forwards or backwards",
              "Find every word to clear the night",
              "Beat your best time on each level",
            ].map((t, i) => (
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:7}}>
                <span style={{display:"inline-block",width:18,height:18,borderRadius:9,background:"rgba(255,80,80,0.25)",color:"#ff6060",fontSize:11,fontFamily:"'Cinzel',serif",fontWeight:700,lineHeight:"18px",textAlign:"center",flexShrink:0,marginTop:1}}>{i+1}</span>
                <span style={{color:"rgba(255,255,255,0.85)",fontSize:12,letterSpacing:0.4,lineHeight:1.45,fontFamily:"'Cinzel',serif"}}>{t}</span>
              </div>
            ))}
          </div>

          <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
            <button onClick={() => startLevel(progress.unlocked - 1)} style={{padding:"12px 22px",background:"linear-gradient(180deg, #2a0808, #1a0404)",color:"#ff8080",border:"1.5px solid #ff3030",borderRadius:5,fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:3,fontWeight:700,cursor:"pointer",textShadow:"0 0 4px rgba(255,80,80,0.7)",boxShadow:"0 0 10px rgba(255,48,48,0.3)"}}>
              {progress.unlocked === 1 ? "BEGIN" : `CONTINUE — LEVEL ${progress.unlocked}`}
            </button>
            <button onClick={() => setPhase("levelSelect")} style={{padding:"10px 18px",background:"transparent",color:"rgba(200,200,200,0.7)",border:"1px solid rgba(150,150,150,0.5)",borderRadius:5,fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:3,fontWeight:700,cursor:"pointer"}}>LEVELS</button>
          </div>
        </div>
      </div>
    );
  }

  // ── LEVEL SELECT ──
  if (phase === "levelSelect") {
    const completed = Object.keys(progress.bestTimes).length;
    return (
      <div style={{position:"fixed",inset:0,background:"#060806",color:"#fff5e0",zIndex:100,display:"flex",flexDirection:"column",overflow:"auto"}}>
        <style>{`@font-face { font-family: 'Jolly Lodger'; src: url('/fonts/JollyLodger-Regular.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; } @import url('https://fonts.bunny.net/css?family=jolly-lodger:400|cinzel:400,600,700&display=swap');`}</style>
        <div style={{padding:"16px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:"linear-gradient(180deg, #060806 70%, transparent 100%)",zIndex:5}}>
          <button onClick={() => setPhase("intro")} style={{background:"transparent",border:"none",color:"#ff8080",fontSize:13,letterSpacing:3,cursor:"pointer",fontFamily:"'Cinzel',serif",textShadow:"0 0 4px rgba(255,48,48,0.5)"}}>← BACK</button>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:24,color:"#ff5050",letterSpacing:5,lineHeight:1,textShadow:"0 0 12px rgba(255,48,48,0.8), 0 0 4px #fff"}}>SELECT LEVEL</div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"rgba(255,255,255,0.6)",letterSpacing:3,marginTop:3}}>{completed} / 50 BEATEN</div>
          </div>
          <div style={{width:50}}></div>
        </div>
        <div style={{flex:1,padding:"4px 14px 24px",maxWidth:380,width:"100%",margin:"0 auto",position:"relative",zIndex:2}}>
          {SS_ACTS.map((act, actIdx) => (
            <div key={actIdx} style={{marginBottom:22}}>
              <div style={{fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:14,color:act.color,letterSpacing:4,marginBottom:8,paddingLeft:6,textShadow:`0 0 14px ${act.color}50`}}>ACT {actIdx + 1} — {act.label}</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(5, 1fr)",gap:8}}>
                {Array.from({length: 10}).map((_, n) => {
                  const idx = actIdx * 10 + n;
                  const best = progress.bestTimes[idx];
                  const beaten = best != null;
                  const unlocked = idx + 1 <= progress.unlocked;
                  return (
                    <button
                      key={idx}
                      disabled={!unlocked}
                      onClick={() => unlocked && startLevel(idx)}
                      style={{
                        aspectRatio:"1",
                        background: unlocked ? `linear-gradient(140deg, ${act.color}25, rgba(0,0,0,0.4))` : "rgba(20,20,30,0.5)",
                        border: `1.5px solid ${unlocked ? `${act.color}80` : "rgba(80,80,80,0.3)"}`,
                        borderRadius: 10,
                        color: unlocked ? "#fff5e0" : "rgba(120,120,120,0.5)",
                        fontFamily:"'Cinzel',serif",
                        cursor: unlocked ? "pointer" : "not-allowed",
                        padding:"6px 4px",
                        display:"flex",
                        flexDirection:"column",
                        alignItems:"center",
                        justifyContent:"center",
                        gap:2,
                        boxShadow: unlocked ? "0 4px 12px rgba(0,0,0,0.4)" : "none",
                      }}
                    >
                      <div style={{fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:18,letterSpacing:1,lineHeight:1,color: unlocked ? act.color : "inherit"}}>{idx + 1}</div>
                      {unlocked ? (
                        beaten ? (
                          <div style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"#ffd700",letterSpacing:1,marginTop:2,fontWeight:700}}>{Math.floor(best/60)}:{String(best%60).padStart(2,'0')}</div>
                        ) : (
                          <div style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"rgba(255,200,100,0.55)",letterSpacing:1,marginTop:2}}>NEW</div>
                        )
                      ) : (
                        <div style={{fontSize:14,marginTop:2,opacity:0.5}}>🔒</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── LEVEL WON ──
  if (phase === "levelWon") {
    const isLast = levelIdx >= 49;
    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    const prevBest = progress.bestTimes[levelIdx];
    const newBest = prevBest != null && totalTime <= prevBest;
    return (
      <div style={{position:"fixed",inset:0,background:"#060806",color:"#fff5e0",zIndex:100,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px 18px",overflow:"auto"}}>
        <style>{`@font-face { font-family: 'Jolly Lodger'; src: url('/fonts/JollyLodger-Regular.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; } @import url('https://fonts.bunny.net/css?family=jolly-lodger:400|cinzel:400,600,700&display=swap');@keyframes ssWin { 0% { transform: scale(0.5); opacity: 0; } 60% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }`}</style>
        <div style={{position:"relative",zIndex:2,display:"flex",flexDirection:"column",alignItems:"center",maxWidth:440,width:"100%"}}>
          <div style={{fontSize:74,marginBottom:18,animation:"ssWin 0.6s ease-out",filter:`drop-shadow(0 0 12px ${level.color}) drop-shadow(0 0 4px #fff)`}}>🩸</div>
          <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:48,color:level.color,letterSpacing:6,textShadow:`0 0 14px ${level.color}, 0 0 4px #fff`,marginBottom:6,textAlign:"center"}}>{isLast ? "ALL LEVELS BEATEN" : "ALL FOUND!"}</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:11,color:"#ff8080",letterSpacing:3,marginBottom:18,textAlign:"center",fontWeight:700,textShadow:"0 0 4px rgba(255,48,48,0.5)"}}>LEVEL {levelIdx + 1} — {level.actLabel}</div>

          {/* Time panel */}
          <div style={{border:`1.5px solid ${level.color}88`,borderRadius:8,padding:"14px 22px",background:"rgba(20,5,5,0.55)",marginBottom:14,boxShadow:`0 0 16px ${level.color}40, inset 0 0 14px ${level.color}15`}}>
            <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:56,color:"#fff",letterSpacing:6,lineHeight:1,textShadow:`0 0 14px ${level.color}, 0 0 4px #fff`}}>{Math.floor(totalTime/60)}:{String(totalTime%60).padStart(2,'0')}</div>
          </div>

          {newBest && <div style={{fontFamily:"'Cinzel',serif",fontSize:12,color:"#ffd700",letterSpacing:4,fontWeight:700,marginBottom:18,textShadow:"0 0 10px rgba(255,215,0,0.8)"}}>★ NEW BEST ★</div>}
          {!newBest && prevBest != null && <div style={{fontFamily:"'Cinzel',serif",fontSize:11,color:"rgba(255,255,255,0.65)",letterSpacing:3,marginBottom:18}}>BEST: {Math.floor(prevBest/60)}:{String(prevBest%60).padStart(2,'0')}</div>}
          <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
            {!isLast && <button onClick={() => startLevel(levelIdx + 1)} style={{padding:"12px 22px",background:"linear-gradient(180deg, #2a0808, #1a0404)",color:"#ff8080",border:"1.5px solid #ff3030",borderRadius:5,fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:3,fontWeight:700,cursor:"pointer",textShadow:"0 0 4px rgba(255,80,80,0.7)",boxShadow:"0 0 10px rgba(255,48,48,0.3)"}}>NEXT LEVEL →</button>}
            <button onClick={() => setPhase("levelSelect")} style={{padding:"10px 18px",background:"transparent",color:"rgba(200,200,200,0.7)",border:"1px solid rgba(150,150,150,0.5)",borderRadius:5,fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:3,fontWeight:700,cursor:"pointer"}}>LEVELS</button>
            <button onClick={onExit} style={{padding:"10px 18px",background:"transparent",color:"rgba(200,200,200,0.7)",border:"1px solid rgba(150,150,150,0.5)",borderRadius:5,fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:3,fontWeight:700,cursor:"pointer"}}>EXIT</button>
          </div>
        </div>
      </div>
    );
  }

  // ── PLAYING ──
  if (!level) return null;
  const dragLine = (dragStart && dragEnd) ? getLineCells(dragStart, dragEnd) : [];
  const dragLineKey = new Set(dragLine.map(({r,c}) => `${r},${c}`));
  const foundCellMap = new Map(); // "r,c" → color
  for (const fw of foundWords) {
    for (const cell of fw.cells) foundCellMap.set(`${cell.r},${cell.c}`, fw.color);
  }
  const hintCellSet = new Set((hintCells?.cells || []).map(({r,c}) => `${r},${c}`));
  const remaining = placements.filter(p => !foundWords.find(f => f.word === p.word));

  return (
    <div
      style={{
        position:"fixed",inset:0,background:"#060806",
        color:"#fff5e0",zIndex:100,display:"flex",flexDirection:"column",fontFamily:"'Cinzel',serif",
        transform: shake ? `translate(${(Math.random()-0.5)*4}px, ${(Math.random()-0.5)*4}px)` : undefined,
        overflow:"hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.bunny.net/css?family=jolly-lodger:400|cinzel:400,600,700&display=swap');
        @keyframes ssCellPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.18); } }
        @keyframes ssFoundFlash {
          0% { transform: scale(1); }
          40% { transform: scale(1.25); filter: brightness(1.6); }
          100% { transform: scale(1); }
        }
        @keyframes ssHint {
          0%, 100% { box-shadow: inset 0 0 0 1px ${level.color}40; }
          50% { box-shadow: inset 0 0 0 3px ${level.color}, 0 0 14px ${level.color}80; }
        }
      `}</style>

      {/* Header */}
      <div style={{padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"relative",zIndex:3}}>
        <button onClick={() => {
          // Save in-progress state so we can resume on next visit
          const runState = {
            levelIdx,
            grid,
            placements,
            foundWords,
            hintsLeft,
            elapsed,
          };
          setProgress(prev => {
            const next = { ...prev, currentRun: runState };
            ssSaveProgress(next);
            return next;
          });
          onExit();
        }} style={{background:"transparent",border:"1.5px solid rgba(255,48,48,0.6)",borderRadius:5,color:"#ff8080",fontSize:11,letterSpacing:2,padding:"5px 10px",cursor:"pointer",fontFamily:"'Cinzel',serif",fontWeight:700,textShadow:"0 0 4px rgba(255,80,80,0.6)",boxShadow:"0 0 8px rgba(255,48,48,0.2)"}}>← EXIT</button>
        <div style={{textAlign:"center"}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:700,color:level.color,letterSpacing:3,lineHeight:1,textShadow:`0 0 12px ${level.color}, 0 0 4px #fff`}}>LEVEL {levelIdx + 1}</div>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.7)",letterSpacing:3,marginTop:2,fontFamily:"'Cinzel',serif"}}>{level.actLabel}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:700,color:"#fff",letterSpacing:2,lineHeight:1,textShadow:"0 0 6px rgba(255,48,48,0.7), 0 0 2px #fff"}}>⏱ {Math.floor(elapsed/60)}:{String(elapsed%60).padStart(2,'0')}</div>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.7)",letterSpacing:2,marginTop:2,fontFamily:"'Cinzel',serif"}}>{foundWords.length} / {placements.length}</div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"6px 8px",position:"relative",zIndex:2}}>
        <div
          ref={gridRef}
          onPointerMove={onGridPointerMove}
          onPointerUp={onGridPointerUp}
          onPointerCancel={() => { setDragStart(null); setDragEnd(null); }}
          style={{
            display:"grid",
            gridTemplateColumns:`repeat(${level.gridSize}, 1fr)`,
            gridTemplateRows:`repeat(${level.gridSize}, 1fr)`,
            gap:2,
            aspectRatio:"1",
            width:"100%",
            maxWidth:"min(94vw, 540px)",
            background:"rgba(20,5,5,0.7)",
            padding:8,
            borderRadius:10,
            border:`2px solid ${level.color}`,
            boxShadow:`0 0 24px ${level.color}66, 0 0 48px ${level.color}33, inset 0 0 24px rgba(0,0,0,0.7), inset 0 0 12px ${level.color}25`,
            touchAction:"none",
            userSelect:"none",
          }}
        >
          {grid.map((row, r) => row.map((letter, c) => {
            const key = `${r},${c}`;
            const inDrag = dragLineKey.has(key);
            const foundColor = foundCellMap.get(key);
            const inHint = hintCellSet.has(key);
            return (
              <div
                key={key}
                onPointerDown={(e) => onCellPointerDown(r, c, e)}
                style={{
                  position:"relative",
                  background: foundColor ? `${foundColor}40` : inDrag ? `${level.color}30` : "rgba(20,10,15,0.5)",
                  border: `1px solid ${foundColor ? foundColor : inDrag ? level.color : `${level.color}25`}`,
                  borderRadius: 5,
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center",
                  fontFamily:"'Cinzel',serif",
                  fontSize:`min(${Math.floor(540/level.gridSize/1.6)}px, 5vw)`,
                  color: foundColor || (inDrag ? "#fff" : "rgba(255,240,220,0.85)"),
                  fontWeight: foundColor ? 800 : 700,
                  textShadow: foundColor ? `0 0 8px ${foundColor}` : inDrag ? `0 0 6px ${level.color}` : "none",
                  cursor:"pointer",
                  transition: foundColor ? "transform 0.4s, background 0.3s" : "background 0.1s, border 0.1s",
                  transform: foundColor && foundCellMap.get(key) ? "scale(1)" : "none",
                  animation: foundColor ? "ssFoundFlash 0.6s ease-out" : inHint ? "ssHint 0.7s ease-in-out infinite" : undefined,
                  zIndex: inDrag ? 2 : 1,
                  touchAction:"none",
                  userSelect:"none",
                }}
              >
                {letter}
              </div>
            );
          }))}
        </div>
      </div>

      {/* Word list */}
      <div style={{padding:"10px 12px",background:"rgba(20,5,5,0.7)",borderTop:`2px solid ${level.color}`,maxHeight:140,overflowY:"auto",position:"relative",zIndex:2,boxShadow:`0 -8px 20px ${level.color}33, inset 0 0 16px ${level.color}15`}}>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center",alignItems:"center"}}>
          {placements.map((p) => {
            const found = foundWords.find(f => f.word === p.word);
            return (
              <div
                key={p.word}
                style={{
                  fontFamily:"'Cinzel',serif",
                  fontSize:11,
                  letterSpacing:1.5,
                  padding:"5px 10px",
                  borderRadius:5,
                  background: found ? `${found.color}33` : "rgba(0,0,0,0.55)",
                  border: `1.5px solid ${found ? found.color : `${level.color}55`}`,
                  color: found ? found.color : "rgba(255,255,255,0.85)",
                  textDecoration: found ? "line-through" : "none",
                  fontWeight: 700,
                  textShadow: found ? `0 0 8px ${found.color}, 0 0 2px #fff` : `0 0 4px ${level.color}66`,
                  boxShadow: found ? `0 0 10px ${found.color}66` : "none",
                  transition:"all 0.3s",
                }}
              >
                {p.word}
              </div>
            );
          })}
        </div>
        {/* Hint button */}
        <div style={{textAlign:"center",marginTop:10}}>
          <button
            onClick={useHint}
            disabled={hintsLeft <= 0 || remaining.length === 0}
            style={{
              background: hintsLeft > 0 ? `linear-gradient(180deg, ${level.color}25, rgba(0,0,0,0.5))` : "transparent",
              border:`1.5px solid ${hintsLeft > 0 ? level.color : "rgba(120,120,120,0.4)"}`,
              borderRadius:5,
              color: hintsLeft > 0 ? level.color : "rgba(120,120,120,0.5)",
              fontFamily:"'Cinzel',serif",
              fontSize:11,
              letterSpacing:2,
              fontWeight:700,
              padding:"6px 14px",
              cursor: hintsLeft > 0 ? "pointer" : "not-allowed",
              opacity: hintsLeft > 0 ? 1 : 0.4,
              textShadow: hintsLeft > 0 ? `0 0 4px ${level.color}` : "none",
              boxShadow: hintsLeft > 0 ? `0 0 10px ${level.color}40` : "none",
            }}
          >💡 HINT ({hintsLeft})</button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// SINISTER SUNDAY CROSSWORD — weekly horror crossword puzzle
// Releases every Sunday at local midnight. Same puzzle for everyone that week
// (deterministic from the Sunday's ISO date).
// ──────────────────────────────────────────────────────────────────────────
const SC_SAVE_KEY = "sc_progress_v1";

// Get the most recent Sunday's date as YYYY-MM-DD (the "puzzle ID" for this week).
// In local time so each player's Sunday rolls over at their midnight.
function scCurrentSundayKey() {
  const d = new Date();
  const day = d.getDay(); // 0=Sun, 1=Mon, ...
  // Subtract `day` days to get back to Sunday (if today IS Sunday, day=0, no subtract)
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Hash a string deterministically to a 32-bit int (for picking puzzle index from date)
function scHash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h >>> 0;
}

// Time until next Sunday midnight, returned as { days, hours, minutes, seconds }
function scTimeUntilNextSunday() {
  const now = new Date();
  const next = new Date(now);
  const daysUntilSun = (7 - now.getDay()) % 7 || 7; // always at least 1 day away after this Sunday rolls
  next.setDate(now.getDate() + daysUntilSun);
  next.setHours(0, 0, 0, 0);
  const ms = Math.max(0, next.getTime() - now.getTime());
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return { days, hours, minutes, seconds, totalSec };
}

// ── HAND-AUTHORED CROSSWORDS ──
// Each puzzle: { size, words: [{ word, clue, row, col, dir: "across"|"down" }] }
// Words must intersect properly — I've verified each one fits its grid.

const SC_PUZZLES = [
  {
    title: "HALLOWEEN NIGHT",
    size: 11,
    words: [
      { word: "DOOM", clue: "Inescapable fate", row: 5, col: 3, dir: "across" },
      { word: "OWL", clue: "Hooting bird", row: 5, col: 4, dir: "down" },
      { word: "HOWL", clue: "Wolf's call", row: 4, col: 4, dir: "down" },
      { word: "LAURIE", clue: "Strode — Halloween heroine", row: 7, col: 4, dir: "across" },
      { word: "CURSED", clue: "Hexed", row: 3, col: 9, dir: "down" },
      { word: "STORM", clue: "Thunder and lightning", row: 1, col: 6, dir: "down" },
      { word: "BOO", clue: "Classic ghost greeting", row: 3, col: 5, dir: "across" },
      { word: "SINISTER", clue: "Shadowy and threatening", row: 1, col: 2, dir: "across" },
      { word: "MIST", clue: "Thin fog", row: 0, col: 3, dir: "down" },
      { word: "URN", clue: "Holds ashes", row: 7, col: 6, dir: "down" },
      { word: "SIDNEY", clue: "Prescott — Scream's heroine", row: 9, col: 3, dir: "across" },
      { word: "HEX", clue: "Witchy curse", row: 0, col: 8, dir: "down" },
      { word: "ROT", clue: "What corpses do", row: 3, col: 1, dir: "across" },
    ],
  },
  {
    title: "KILLER INSTINCT",
    size: 11,
    words: [
      { word: "CURSED", clue: "Hexed", row: 5, col: 2, dir: "across" },
      { word: "ELM", clue: "Krueger's street", row: 5, col: 6, dir: "down" },
      { word: "DAGGER", clue: "Short stabbing blade", row: 0, col: 4, dir: "down" },
      { word: "CLEAVER", clue: "Butcher's chopping tool", row: 1, col: 1, dir: "across" },
      { word: "TOMB", clue: "Mummy's resting place", row: 7, col: 4, dir: "across" },
      { word: "SLAY", clue: "What killers do", row: 0, col: 2, dir: "down" },
      { word: "CABIN", clue: "Friday the 13th setting", row: 5, col: 2, dir: "down" },
      { word: "EVIL", clue: "Sam Raimi's ____ Dead", row: 8, col: 0, dir: "across" },
      { word: "WAKE", clue: "Funeral gathering", row: 5, col: 0, dir: "down" },
      { word: "GRAVE", clue: "Final resting place", row: 3, col: 4, dir: "across" },
      { word: "OMEN", clue: "Bad sign", row: 7, col: 5, dir: "down" },
      { word: "NIGHT", clue: "When monsters roam", row: 10, col: 5, dir: "across" },
      { word: "HEX", clue: "Witchy curse", row: 2, col: 8, dir: "down" },
    ],
  },
  {
    title: "BLOODY SUNDAY",
    size: 11,
    words: [
      { word: "BABADOOK", clue: "Aussie horror creature", row: 5, col: 1, dir: "across" },
      { word: "OMEN", clue: "Bad sign", row: 5, col: 6, dir: "down" },
      { word: "NIGHT", clue: "When monsters roam", row: 8, col: 6, dir: "across" },
      { word: "MIDNIGHT", clue: "Witching hour", row: 8, col: 3, dir: "across" },
      { word: "LAURIE", clue: "Strode — Halloween heroine", row: 4, col: 4, dir: "down" },
      { word: "MASK", clue: "Halloween essential", row: 4, col: 2, dir: "down" },
      { word: "BASEMENT", clue: "Where horrors hide", row: 1, col: 10, dir: "down" },
      { word: "DARK", clue: "Where horror lives", row: 2, col: 8, dir: "down" },
      { word: "PINHEAD", clue: "Hellraiser's Cenobite leader", row: 2, col: 2, dir: "across" },
      { word: "HEX", clue: "Witchy curse", row: 8, col: 9, dir: "down" },
      { word: "RUN", clue: "What survivors do", row: 0, col: 4, dir: "down" },
      { word: "REAPER", clue: "Grim ____", row: 0, col: 4, dir: "across" },
      { word: "AXE", clue: "Splitting weapon", row: 0, col: 6, dir: "down" },
    ],
  },
  {
    title: "NIGHTMARE FUEL",
    size: 11,
    words: [
      { word: "SCAR", clue: "Slash mark left behind", row: 5, col: 3, dir: "across" },
      { word: "SCARE", clue: "Brief jolt of fear", row: 5, col: 3, dir: "across" },
      { word: "CURSE", clue: "Witch's gift", row: 5, col: 4, dir: "down" },
      { word: "CURSED", clue: "Hexed", row: 5, col: 4, dir: "down" },
      { word: "BLOOD", clue: "Vampire's drink", row: 10, col: 0, dir: "across" },
      { word: "ZOMBIE", clue: "Romero's reanimated dead", row: 0, col: 7, dir: "down" },
      { word: "MICHAEL", clue: "Haddonfield's masked stalker", row: 4, col: 1, dir: "down" },
      { word: "RUN", clue: "What survivors do", row: 5, col: 6, dir: "down" },
      { word: "RING", clue: "Cursed videotape film", row: 7, col: 4, dir: "across" },
      { word: "HOWL", clue: "Wolf's call", row: 1, col: 6, dir: "across" },
      { word: "BLEED", clue: "What victims do", row: 0, col: 9, dir: "down" },
      { word: "MACABRE", clue: "Gruesomely dark", row: 3, col: 3, dir: "across" },
      { word: "ELM", clue: "Krueger's street", row: 9, col: 4, dir: "across" },
    ],
  },
  {
    title: "FINAL GIRL",
    size: 11,
    words: [
      { word: "BLOOD", clue: "Vampire's drink", row: 5, col: 3, dir: "across" },
      { word: "OOZE", clue: "Slime sound", row: 5, col: 5, dir: "down" },
      { word: "HIDE", clue: "Stay quiet behind the door", row: 3, col: 7, dir: "down" },
      { word: "WITCH", clue: "Salem's occupational hazard", row: 3, col: 3, dir: "across" },
      { word: "REGAN", clue: "The Exorcist's possessed girl", row: 8, col: 4, dir: "across" },
      { word: "EVIL", clue: "Sam Raimi's ____ Dead", row: 6, col: 7, dir: "across" },
      { word: "PANIC", clue: "Sudden overwhelming fear", row: 3, col: 9, dir: "down" },
      { word: "ROT", clue: "What corpses do", row: 8, col: 4, dir: "down" },
      { word: "PHANTOM", clue: "Opera's masked menace", row: 10, col: 0, dir: "across" },
      { word: "SAW", clue: "Jigsaw franchise opener", row: 1, col: 3, dir: "down" },
      { word: "MASK", clue: "Halloween essential", row: 1, col: 1, dir: "across" },
      { word: "MUMMY", clue: "Bandaged corpse", row: 1, col: 1, dir: "down" },
      { word: "BOO", clue: "Classic ghost greeting", row: 5, col: 3, dir: "down" },
    ],
  },
  {
    title: "AFTER MIDNIGHT",
    size: 11,
    words: [
      { word: "CABIN", clue: "Friday the 13th setting", row: 5, col: 3, dir: "across" },
      { word: "ATTIC", clue: "Spooky upstairs space", row: 5, col: 4, dir: "down" },
      { word: "EERIE", clue: "Strangely unsettling", row: 2, col: 6, dir: "down" },
      { word: "DAGGER", clue: "Short stabbing blade", row: 2, col: 2, dir: "across" },
      { word: "PANIC", clue: "Sudden overwhelming fear", row: 1, col: 3, dir: "down" },
      { word: "HATCHET", clue: "Small splitting axe", row: 9, col: 1, dir: "across" },
      { word: "ROT", clue: "What corpses do", row: 7, col: 2, dir: "across" },
      { word: "DREAD", clue: "Anticipated terror", row: 6, col: 2, dir: "down" },
      { word: "FOG", clue: "Carpenter's spooky weather", row: 0, col: 5, dir: "down" },
      { word: "FEAR", clue: "Horror's currency", row: 0, col: 5, dir: "across" },
      { word: "BAT", clue: "Vampire's animal form", row: 7, col: 7, dir: "down" },
      { word: "BURN", clue: "Witch's traditional fate", row: 7, col: 7, dir: "across" },
      { word: "PYRE", clue: "Funeral fire", row: 5, col: 9, dir: "down" },
    ],
  },
  {
    title: "GRAVEYARD SHIFT",
    size: 11,
    words: [
      { word: "MASK", clue: "Halloween essential", row: 5, col: 3, dir: "across" },
      { word: "PINHEAD", clue: "Hellraiser's Cenobite leader", row: 0, col: 4, dir: "down" },
      { word: "URN", clue: "Holds ashes", row: 2, col: 2, dir: "across" },
      { word: "BURN", clue: "Witch's traditional fate", row: 2, col: 1, dir: "across" },
      { word: "BABADOOK", clue: "Aussie horror creature", row: 2, col: 1, dir: "down" },
      { word: "HOOK", clue: "Pirate hand or Candyman weapon", row: 3, col: 4, dir: "across" },
      { word: "GORE", clue: "On-screen carnage", row: 7, col: 0, dir: "across" },
      { word: "STAKE", clue: "Vampire-killing tool", row: 0, col: 7, dir: "down" },
      { word: "ATTIC", clue: "Spooky upstairs space", row: 1, col: 6, dir: "across" },
      { word: "CHAINSAW", clue: "Leatherface's signature", row: 1, col: 10, dir: "down" },
      { word: "SHADOW", clue: "Cast by light", row: 8, col: 5, dir: "across" },
      { word: "HIDE", clue: "Stay quiet behind the door", row: 6, col: 8, dir: "down" },
      { word: "EVIL", clue: "Sam Raimi's ____ Dead", row: 7, col: 3, dir: "down" },
    ],
  },
  {
    title: "WICKED HOUR",
    size: 11,
    words: [
      { word: "SINISTER", clue: "Shadowy and threatening", row: 5, col: 1, dir: "across" },
      { word: "GRAVE", clue: "Final resting place", row: 4, col: 8, dir: "down" },
      { word: "MACABRE", clue: "Gruesomely dark", row: 8, col: 2, dir: "across" },
      { word: "TOMB", clue: "Mummy's resting place", row: 5, col: 6, dir: "down" },
      { word: "HANNIBAL", clue: "Lecter, the cannibal psychiatrist", row: 2, col: 3, dir: "down" },
      { word: "ATTIC", clue: "Spooky upstairs space", row: 3, col: 3, dir: "across" },
      { word: "RUN", clue: "What survivors do", row: 8, col: 7, dir: "down" },
      { word: "BURN", clue: "Witch's traditional fate", row: 10, col: 4, dir: "across" },
      { word: "CURSE", clue: "Witch's gift", row: 2, col: 1, dir: "down" },
      { word: "CURSED", clue: "Hexed", row: 2, col: 1, dir: "down" },
      { word: "ROT", clue: "What corpses do", row: 1, col: 5, dir: "down" },
      { word: "CRYPT", clue: "Underground burial chamber", row: 1, col: 4, dir: "across" },
      { word: "AXE", clue: "Splitting weapon", row: 6, col: 8, dir: "across" },
    ],
  },

  {
    title: "DEAD END",
    size: 11,
    words: [
      { word: "CHAINSAW", clue: "Leatherface's signature", row: 5, col: 1, dir: "across" },
      { word: "OWL", clue: "Hooting bird", row: 4, col: 8, dir: "down" },
      { word: "HOWL", clue: "Wolf's call", row: 3, col: 8, dir: "down" },
      { word: "VAMPIRE", clue: "Blood-drinking undead", row: 4, col: 3, dir: "down" },
      { word: "HAUNT", clue: "What ghosts do", row: 2, col: 5, dir: "down" },
      { word: "HATCHET", clue: "Small splitting axe", row: 3, col: 4, dir: "across" },
      { word: "FREDDY", clue: "Glove-wielding dream demon", row: 9, col: 2, dir: "across" },
      { word: "GORE", clue: "On-screen carnage", row: 0, col: 9, dir: "down" },
      { word: "HOOK", clue: "Pirate hand or Candyman weapon", row: 1, col: 7, dir: "across" },
      { word: "PANIC", clue: "Sudden overwhelming fear", row: 1, col: 1, dir: "down" },
      { word: "WAKE", clue: "Funeral gathering", row: 2, col: 0, dir: "across" },
      { word: "TOMB", clue: "Mummy's resting place", row: 3, col: 10, dir: "down" },
      { word: "AXE", clue: "Splitting weapon", row: 0, col: 3, dir: "down" },
    ],
  },
  {
    title: "BURNING WICK",
    size: 11,
    words: [
      { word: "SCAR", clue: "Slash mark left behind", row: 5, col: 3, dir: "across" },
      { word: "SCARE", clue: "Brief jolt of fear", row: 5, col: 3, dir: "across" },
      { word: "BASEMENT", clue: "Where horrors hide", row: 3, col: 3, dir: "down" },
      { word: "WARLOCK", clue: "Male witch", row: 4, col: 5, dir: "down" },
      { word: "DEMON", clue: "Hellish entity", row: 8, col: 2, dir: "across" },
      { word: "STAKE", clue: "Vampire-killing tool", row: 10, col: 2, dir: "across" },
      { word: "CURSED", clue: "Hexed", row: 1, col: 7, dir: "down" },
      { word: "ROT", clue: "What corpses do", row: 3, col: 7, dir: "across" },
      { word: "DOOM", clue: "Inescapable fate", row: 6, col: 7, dir: "across" },
      { word: "FOG", clue: "Carpenter's spooky weather", row: 5, col: 9, dir: "down" },
      { word: "PSYCHO", clue: "Hitchcock's Bates Motel film", row: 1, col: 4, dir: "across" },
      { word: "GORE", clue: "On-screen carnage", row: 6, col: 0, dir: "across" },
      { word: "FANG", clue: "Vampire's tooth", row: 3, col: 0, dir: "down" },
    ],
  },
  {
    title: "MOONLIT MURDER",
    size: 11,
    words: [
      { word: "MICHAEL", clue: "Haddonfield's masked stalker", row: 5, col: 2, dir: "across" },
      { word: "BANSHEE", clue: "Wailing female spirit", row: 4, col: 6, dir: "down" },
      { word: "CABIN", clue: "Friday the 13th setting", row: 5, col: 4, dir: "down" },
      { word: "WRAITH", clue: "Ghostly menace", row: 8, col: 1, dir: "across" },
      { word: "VAMPIRE", clue: "Blood-drinking undead", row: 3, col: 2, dir: "down" },
      { word: "UNHOLY", clue: "Not blessed", row: 1, col: 8, dir: "down" },
      { word: "REGAN", clue: "The Exorcist's possessed girl", row: 10, col: 5, dir: "across" },
      { word: "EVIL", clue: "Sam Raimi's ____ Dead", row: 3, col: 1, dir: "across" },
      { word: "SIDNEY", clue: "Prescott — Scream's heroine", row: 2, col: 5, dir: "across" },
      { word: "CRYPT", clue: "Underground burial chamber", row: 0, col: 10, dir: "down" },
      { word: "HIDE", clue: "Stay quiet behind the door", row: 0, col: 1, dir: "down" },
      { word: "GHOST", clue: "Spectral being", row: 0, col: 0, dir: "across" },
      { word: "RUN", clue: "What survivors do", row: 8, col: 9, dir: "down" },
    ],
  },
  {
    title: "BLOOD RITUAL",
    size: 11,
    words: [
      { word: "STALK", clue: "Hunt silently", row: 5, col: 3, dir: "across" },
      { word: "MACABRE", clue: "Gruesomely dark", row: 4, col: 5, dir: "down" },
      { word: "BABADOOK", clue: "Aussie horror creature", row: 8, col: 3, dir: "across" },
      { word: "WARLOCK", clue: "Male witch", row: 4, col: 9, dir: "down" },
      { word: "MORGUE", clue: "Where corpses are kept", row: 10, col: 0, dir: "across" },
      { word: "LURK", clue: "Stalker's M.O.", row: 2, col: 7, dir: "down" },
      { word: "PHANTOM", clue: "Opera's masked menace", row: 4, col: 0, dir: "down" },
      { word: "MICHAEL", clue: "Haddonfield's masked stalker", row: 2, col: 1, dir: "across" },
      { word: "CURSE", clue: "Witch's gift", row: 2, col: 3, dir: "down" },
      { word: "WAKE", clue: "Funeral gathering", row: 10, col: 7, dir: "across" },
      { word: "AXE", clue: "Splitting weapon", row: 0, col: 6, dir: "down" },
      { word: "DAGGER", clue: "Short stabbing blade", row: 0, col: 5, dir: "across" },
      { word: "RING", clue: "Cursed videotape film", row: 0, col: 10, dir: "down" },
    ],
  },
  {
    title: "CRYPT KEEPER",
    size: 11,
    words: [
      { word: "PINHEAD", clue: "Hellraiser's Cenobite leader", row: 5, col: 2, dir: "across" },
      { word: "PSYCHO", clue: "Hitchcock's Bates Motel film", row: 5, col: 2, dir: "down" },
      { word: "BLADE", clue: "Sharp killing edge", row: 3, col: 7, dir: "down" },
      { word: "FEAR", clue: "Horror's currency", row: 7, col: 6, dir: "across" },
      { word: "PHANTOM", clue: "Opera's masked menace", row: 9, col: 1, dir: "across" },
      { word: "MANSION", clue: "Old haunted house", row: 3, col: 4, dir: "down" },
      { word: "RING", clue: "Cursed videotape film", row: 7, col: 9, dir: "down" },
      { word: "BOO", clue: "Classic ghost greeting", row: 3, col: 7, dir: "across" },
      { word: "JASON", clue: "Crystal Lake's hockey-masked killer", row: 0, col: 9, dir: "down" },
      { word: "NORMAN", clue: "Bates Motel proprietor", row: 1, col: 5, dir: "across" },
      { word: "FOG", clue: "Carpenter's spooky weather", row: 0, col: 6, dir: "down" },
      { word: "DOOM", clue: "Inescapable fate", row: 3, col: 1, dir: "across" },
      { word: "HIDE", clue: "Stay quiet behind the door", row: 1, col: 1, dir: "down" },
    ],
  },
  {
    title: "FRIGHT NIGHT",
    size: 11,
    words: [
      { word: "WAKE", clue: "Funeral gathering", row: 5, col: 3, dir: "across" },
      { word: "SPIDER", clue: "Eight-legged crawler", row: 1, col: 6, dir: "down" },
      { word: "BLADE", clue: "Sharp killing edge", row: 3, col: 4, dir: "down" },
      { word: "KNIFE", clue: "Slasher's go-to tool", row: 7, col: 0, dir: "across" },
      { word: "FOG", clue: "Carpenter's spooky weather", row: 7, col: 3, dir: "down" },
      { word: "HOOK", clue: "Pirate hand or Candyman weapon", row: 4, col: 0, dir: "down" },
      { word: "TOMB", clue: "Mummy's resting place", row: 3, col: 1, dir: "across" },
      { word: "STORM", clue: "Thunder and lightning", row: 1, col: 6, dir: "across" },
      { word: "CRYPT", clue: "Underground burial chamber", row: 0, col: 9, dir: "down" },
      { word: "GRAVE", clue: "Final resting place", row: 9, col: 3, dir: "across" },
      { word: "OMEN", clue: "Bad sign", row: 7, col: 7, dir: "down" },
      { word: "OOZE", clue: "Slime sound", row: 7, col: 7, dir: "across" },
      { word: "EVIL", clue: "Sam Raimi's ____ Dead", row: 7, col: 10, dir: "down" },
    ],
  },
  {
    title: "MIDNIGHT MASS",
    size: 11,
    words: [
      { word: "BASEMENT", clue: "Where horrors hide", row: 5, col: 1, dir: "across" },
      { word: "MASK", clue: "Halloween essential", row: 5, col: 5, dir: "down" },
      { word: "PYRE", clue: "Funeral fire", row: 2, col: 4, dir: "down" },
      { word: "PINHEAD", clue: "Hellraiser's Cenobite leader", row: 2, col: 4, dir: "across" },
      { word: "HANNIBAL", clue: "Lecter, the cannibal psychiatrist", row: 2, col: 7, dir: "down" },
      { word: "DRACULA", clue: "Stoker's Transylvanian count", row: 2, col: 10, dir: "down" },
      { word: "SCARE", clue: "Brief jolt of fear", row: 5, col: 3, dir: "down" },
      { word: "BLEED", clue: "What victims do", row: 5, col: 1, dir: "down" },
      { word: "FEAR", clue: "Horror's currency", row: 8, col: 0, dir: "across" },
      { word: "SLAY", clue: "What killers do", row: 9, col: 6, dir: "across" },
      { word: "URN", clue: "Holds ashes", row: 0, col: 6, dir: "down" },
      { word: "ASYLUM", clue: "Smith's Grove ____", row: 0, col: 2, dir: "across" },
      { word: "AXE", clue: "Splitting weapon", row: 0, col: 2, dir: "down" },
    ],
  },
  {
    title: "TWISTED FATE",
    size: 11,
    words: [
      { word: "CLEAVER", clue: "Butcher's chopping tool", row: 5, col: 2, dir: "across" },
      { word: "STAKE", clue: "Vampire-killing tool", row: 3, col: 5, dir: "down" },
      { word: "ATTIC", clue: "Spooky upstairs space", row: 1, col: 2, dir: "down" },
      { word: "GORE", clue: "On-screen carnage", row: 3, col: 8, dir: "down" },
      { word: "HIDE", clue: "Stay quiet behind the door", row: 7, col: 2, dir: "across" },
      { word: "REAPER", clue: "Grim ____", row: 1, col: 0, dir: "across" },
      { word: "DREAD", clue: "Anticipated terror", row: 0, col: 0, dir: "down" },
      { word: "HOWL", clue: "Wolf's call", row: 7, col: 2, dir: "down" },
      { word: "BOO", clue: "Classic ghost greeting", row: 8, col: 0, dir: "across" },
      { word: "WAIL", clue: "Banshee's cry", row: 9, col: 2, dir: "across" },
      { word: "BAT", clue: "Vampire's animal form", row: 8, col: 0, dir: "down" },
      { word: "HEX", clue: "Witchy curse", row: 0, col: 4, dir: "down" },
      { word: "OWL", clue: "Hooting bird", row: 4, col: 8, dir: "across" },
    ],
  },
  {
    title: "ETERNAL DREAD",
    size: 11,
    words: [
      { word: "PUMPKIN", clue: "Halloween jack-o'-lantern", row: 5, col: 2, dir: "across" },
      { word: "CRYPT", clue: "Underground burial chamber", row: 2, col: 2, dir: "down" },
      { word: "CHAINSAW", clue: "Leatherface's signature", row: 2, col: 2, dir: "across" },
      { word: "SINISTER", clue: "Shadowy and threatening", row: 2, col: 7, dir: "down" },
      { word: "BASEMENT", clue: "Where horrors hide", row: 1, col: 4, dir: "down" },
      { word: "HATCHET", clue: "Small splitting axe", row: 8, col: 2, dir: "across" },
      { word: "URN", clue: "Holds ashes", row: 0, col: 6, dir: "down" },
      { word: "LURK", clue: "Stalker's M.O.", row: 0, col: 5, dir: "across" },
      { word: "AXE", clue: "Splitting weapon", row: 8, col: 3, dir: "down" },
      { word: "CREEPY", clue: "Unsettling vibe", row: 10, col: 1, dir: "across" },
      { word: "OWL", clue: "Hooting bird", row: 1, col: 9, dir: "down" },
      { word: "ROT", clue: "What corpses do", row: 6, col: 0, dir: "across" },
      { word: "MACABRE", clue: "Gruesomely dark", row: 1, col: 0, dir: "down" },
    ],
  },
  {
    title: "GHOST PROTOCOL",
    size: 11,
    words: [
      { word: "STAKE", clue: "Vampire-killing tool", row: 5, col: 3, dir: "across" },
      { word: "WAKE", clue: "Funeral gathering", row: 4, col: 5, dir: "down" },
      { word: "SIDNEY", clue: "Prescott — Scream's heroine", row: 5, col: 3, dir: "down" },
      { word: "DREAD", clue: "Anticipated terror", row: 7, col: 3, dir: "across" },
      { word: "PINHEAD", clue: "Hellraiser's Cenobite leader", row: 1, col: 7, dir: "down" },
      { word: "HOOK", clue: "Pirate hand or Candyman weapon", row: 4, col: 7, dir: "across" },
      { word: "HALLOWEEN", clue: "October 31 holiday", row: 0, col: 9, dir: "down" },
      { word: "AXE", clue: "Splitting weapon", row: 6, col: 7, dir: "across" },
      { word: "OOZE", clue: "Slime sound", row: 9, col: 0, dir: "across" },
      { word: "BABADOOK", clue: "Aussie horror creature", row: 3, col: 0, dir: "down" },
      { word: "BURY", clue: "What you do with a body", row: 3, col: 0, dir: "across" },
      { word: "DARK", clue: "Where horror lives", row: 1, col: 2, dir: "down" },
      { word: "HIDE", clue: "Stay quiet behind the door", row: 1, col: 0, dir: "across" },
    ],
  },
  {
    title: "DEMON HOUR",
    size: 11,
    words: [
      { word: "MIST", clue: "Thin fog", row: 5, col: 3, dir: "across" },
      { word: "JASON", clue: "Crystal Lake's hockey-masked killer", row: 3, col: 5, dir: "down" },
      { word: "PANIC", clue: "Sudden overwhelming fear", row: 7, col: 3, dir: "across" },
      { word: "CLAW", clue: "Werewolf's weapon", row: 7, col: 7, dir: "down" },
      { word: "FEAR", clue: "Horror's currency", row: 9, col: 5, dir: "across" },
      { word: "REDRUM", clue: "Murder backwards (The Shining)", row: 0, col: 3, dir: "down" },
      { word: "HIDE", clue: "Stay quiet behind the door", row: 2, col: 1, dir: "across" },
      { word: "CREEPY", clue: "Unsettling vibe", row: 0, col: 2, dir: "across" },
      { word: "GHOST", clue: "Spectral being", row: 1, col: 1, dir: "down" },
      { word: "PYRE", clue: "Funeral fire", row: 7, col: 3, dir: "down" },
      { word: "SLAY", clue: "What killers do", row: 8, col: 0, dir: "across" },
      { word: "MASK", clue: "Halloween essential", row: 6, col: 0, dir: "down" },
      { word: "HEX", clue: "Witchy curse", row: 10, col: 2, dir: "across" },
    ],
  },
  {
    title: "BLEEDING EDGE",
    size: 11,
    words: [
      { word: "CARRIE", clue: "King's prom queen with telekinesis", row: 5, col: 2, dir: "across" },
      { word: "WRAITH", clue: "Ghostly menace", row: 4, col: 4, dir: "down" },
      { word: "PINHEAD", clue: "Hellraiser's Cenobite leader", row: 4, col: 6, dir: "down" },
      { word: "NIGHT", clue: "When monsters roam", row: 7, col: 3, dir: "across" },
      { word: "MIDNIGHT", clue: "Witching hour", row: 7, col: 0, dir: "across" },
      { word: "PANIC", clue: "Sudden overwhelming fear", row: 1, col: 2, dir: "down" },
      { word: "SHADOW", clue: "Cast by light", row: 2, col: 0, dir: "across" },
      { word: "SCREAM", clue: "Wes Craven's '90s slasher", row: 2, col: 0, dir: "down" },
      { word: "HOWL", clue: "Wolf's call", row: 0, col: 5, dir: "down" },
      { word: "HAUNT", clue: "What ghosts do", row: 0, col: 5, dir: "across" },
      { word: "TOMB", clue: "Mummy's resting place", row: 0, col: 9, dir: "down" },
      { word: "ATTIC", clue: "Spooky upstairs space", row: 9, col: 6, dir: "across" },
      { word: "ZOMBIE", clue: "Romero's reanimated dead", row: 5, col: 9, dir: "down" },
    ],
  },
  {
    title: "SHADOW REALM",
    size: 11,
    words: [
      { word: "CHUCKY", clue: "Killer doll from Child's Play", row: 5, col: 2, dir: "across" },
      { word: "STAKE", clue: "Vampire-killing tool", row: 2, col: 6, dir: "down" },
      { word: "CHURCH", clue: "Sanctuary turned creepy", row: 5, col: 2, dir: "down" },
      { word: "HATCHET", clue: "Small splitting axe", row: 10, col: 2, dir: "across" },
      { word: "STALK", clue: "Hunt silently", row: 2, col: 6, dir: "across" },
      { word: "GRAVE", clue: "Final resting place", row: 8, col: 1, dir: "across" },
      { word: "HIDE", clue: "Stay quiet behind the door", row: 7, col: 7, dir: "down" },
      { word: "KNIFE", clue: "Slasher's go-to tool", row: 2, col: 10, dir: "down" },
      { word: "BLADE", clue: "Sharp killing edge", row: 0, col: 8, dir: "down" },
      { word: "CABIN", clue: "Friday the 13th setting", row: 0, col: 6, dir: "across" },
      { word: "WITCH", clue: "Salem's occupational hazard", row: 1, col: 3, dir: "down" },
      { word: "EERIE", clue: "Strangely unsettling", row: 2, col: 0, dir: "across" },
      { word: "REAPER", clue: "Grim ____", row: 1, col: 0, dir: "down" },
    ],
  },
  {
    title: "COVEN MEETING",
    size: 11,
    words: [
      { word: "SIDNEY", clue: "Prescott — Scream's heroine", row: 5, col: 2, dir: "across" },
      { word: "NORMAN", clue: "Bates Motel proprietor", row: 5, col: 5, dir: "down" },
      { word: "WAIL", clue: "Banshee's cry", row: 9, col: 4, dir: "across" },
      { word: "OWL", clue: "Hooting bird", row: 7, col: 7, dir: "down" },
      { word: "TERROR", clue: "Pure horror", row: 7, col: 3, dir: "across" },
      { word: "MIST", clue: "Thin fog", row: 4, col: 3, dir: "down" },
      { word: "MORGUE", clue: "Where corpses are kept", row: 0, col: 6, dir: "down" },
      { word: "CEMETERY", clue: "Field of graves", row: 2, col: 0, dir: "across" },
      { word: "BAT", clue: "Vampire's animal form", row: 0, col: 4, dir: "down" },
      { word: "WICKED", clue: "Wickedly evil", row: 0, col: 0, dir: "down" },
      { word: "MUMMY", clue: "Bandaged corpse", row: 0, col: 6, dir: "across" },
      { word: "MASK", clue: "Halloween essential", row: 0, col: 9, dir: "down" },
      { word: "ELM", clue: "Krueger's street", row: 0, col: 2, dir: "down" },
    ],
  },
  {
    title: "WICKED WOODS",
    size: 11,
    words: [
      { word: "MACABRE", clue: "Gruesomely dark", row: 5, col: 2, dir: "across" },
      { word: "ZOMBIE", clue: "Romero's reanimated dead", row: 3, col: 2, dir: "down" },
      { word: "CARRIE", clue: "King's prom queen with telekinesis", row: 5, col: 4, dir: "down" },
      { word: "EERIE", clue: "Strangely unsettling", row: 8, col: 2, dir: "across" },
      { word: "BLEED", clue: "What victims do", row: 5, col: 6, dir: "down" },
      { word: "SCAR", clue: "Slash mark left behind", row: 2, col: 7, dir: "down" },
      { word: "OMEN", clue: "Bad sign", row: 10, col: 2, dir: "across" },
      { word: "MANSION", clue: "Old haunted house", row: 2, col: 4, dir: "across" },
      { word: "BLOOD", clue: "Vampire's drink", row: 0, col: 9, dir: "down" },
      { word: "BAT", clue: "Vampire's animal form", row: 1, col: 5, dir: "down" },
      { word: "ELM", clue: "Krueger's street", row: 5, col: 8, dir: "down" },
      { word: "DARK", clue: "Where horror lives", row: 9, col: 6, dir: "across" },
      { word: "TOMB", clue: "Mummy's resting place", row: 0, col: 6, dir: "across" },
    ],
  },
  {
    title: "DARK PASSAGE",
    size: 11,
    words: [
      { word: "LURK", clue: "Stalker's M.O.", row: 5, col: 3, dir: "across" },
      { word: "TERROR", clue: "Pure horror", row: 3, col: 5, dir: "down" },
      { word: "BLADE", clue: "Sharp killing edge", row: 4, col: 3, dir: "down" },
      { word: "DOOM", clue: "Inescapable fate", row: 7, col: 3, dir: "across" },
      { word: "TOMB", clue: "Mummy's resting place", row: 3, col: 5, dir: "across" },
      { word: "BLEED", clue: "What victims do", row: 3, col: 8, dir: "down" },
      { word: "FEAR", clue: "Horror's currency", row: 6, col: 7, dir: "across" },
      { word: "SCARE", clue: "Brief jolt of fear", row: 3, col: 10, dir: "down" },
      { word: "GORE", clue: "On-screen carnage", row: 8, col: 0, dir: "across" },
      { word: "DAGGER", clue: "Short stabbing blade", row: 5, col: 0, dir: "down" },
      { word: "BOO", clue: "Classic ghost greeting", row: 1, col: 6, dir: "down" },
      { word: "HANNIBAL", clue: "Lecter, the cannibal psychiatrist", row: 1, col: 1, dir: "across" },
      { word: "SAW", clue: "Jigsaw franchise opener", row: 0, col: 2, dir: "down" },
    ],
  },
  {
    title: "OMEN AWAITS",
    size: 11,
    words: [
      { word: "CHUCKY", clue: "Killer doll from Child's Play", row: 5, col: 2, dir: "across" },
      { word: "SLAY", clue: "What killers do", row: 2, col: 7, dir: "down" },
      { word: "WAIL", clue: "Banshee's cry", row: 3, col: 4, dir: "across" },
      { word: "HATCHET", clue: "Small splitting axe", row: 2, col: 5, dir: "down" },
      { word: "FEAR", clue: "Horror's currency", row: 7, col: 4, dir: "across" },
      { word: "WARLOCK", clue: "Male witch", row: 0, col: 2, dir: "down" },
      { word: "MASK", clue: "Halloween essential", row: 1, col: 1, dir: "across" },
      { word: "SAW", clue: "Jigsaw franchise opener", row: 2, col: 7, dir: "across" },
      { word: "WITCH", clue: "Salem's occupational hazard", row: 2, col: 9, dir: "down" },
      { word: "ROT", clue: "What corpses do", row: 7, col: 7, dir: "down" },
      { word: "TOMB", clue: "Mummy's resting place", row: 9, col: 7, dir: "across" },
      { word: "OWL", clue: "Hooting bird", row: 3, col: 0, dir: "across" },
      { word: "DOOM", clue: "Inescapable fate", row: 2, col: 0, dir: "down" },
    ],
  },
  {
    title: "HAUNTED PAST",
    size: 11,
    words: [
      { word: "SCYTHE", clue: "Reaper's weapon", row: 5, col: 2, dir: "across" },
      { word: "DEMON", clue: "Hellish entity", row: 4, col: 7, dir: "down" },
      { word: "OWL", clue: "Hooting bird", row: 7, col: 7, dir: "across" },
      { word: "HOWL", clue: "Wolf's call", row: 7, col: 6, dir: "across" },
      { word: "DOOM", clue: "Inescapable fate", row: 4, col: 7, dir: "across" },
      { word: "PSYCHO", clue: "Hitchcock's Bates Motel film", row: 4, col: 2, dir: "down" },
      { word: "MORGUE", clue: "Where corpses are kept", row: 9, col: 1, dir: "across" },
      { word: "FREDDY", clue: "Glove-wielding dream demon", row: 0, col: 4, dir: "down" },
      { word: "PINHEAD", clue: "Hellraiser's Cenobite leader", row: 2, col: 0, dir: "across" },
      { word: "SHADOW", clue: "Cast by light", row: 0, col: 9, dir: "down" },
      { word: "MASK", clue: "Halloween essential", row: 0, col: 7, dir: "across" },
      { word: "SPIDER", clue: "Eight-legged crawler", row: 1, col: 0, dir: "down" },
      { word: "KNIFE", clue: "Slasher's go-to tool", row: 0, col: 1, dir: "across" },
    ],
  },
  {
    title: "RAVEN CALLS",
    size: 11,
    words: [
      { word: "SPIDER", clue: "Eight-legged crawler", row: 5, col: 2, dir: "across" },
      { word: "LAURIE", clue: "Strode — Halloween heroine", row: 2, col: 7, dir: "down" },
      { word: "HANNIBAL", clue: "Lecter, the cannibal psychiatrist", row: 1, col: 4, dir: "down" },
      { word: "DAMNED", clue: "Hell-bound", row: 7, col: 3, dir: "across" },
      { word: "CASTLE", clue: "Dracula's home", row: 2, col: 3, dir: "across" },
      { word: "DOOM", clue: "Inescapable fate", row: 7, col: 8, dir: "down" },
      { word: "OMEN", clue: "Bad sign", row: 10, col: 7, dir: "across" },
      { word: "MOON", clue: "Full or blood?", row: 7, col: 10, dir: "down" },
      { word: "MASK", clue: "Halloween essential", row: 3, col: 2, dir: "down" },
      { word: "BAT", clue: "Vampire's animal form", row: 0, col: 6, dir: "down" },
      { word: "BLEED", clue: "What victims do", row: 0, col: 6, dir: "across" },
      { word: "DEMON", clue: "Hellish entity", row: 0, col: 10, dir: "down" },
      { word: "ELM", clue: "Krueger's street", row: 3, col: 0, dir: "across" },
    ],
  },
  {
    title: "DEATHS DOOR",
    size: 11,
    words: [
      { word: "MICHAEL", clue: "Haddonfield's masked stalker", row: 5, col: 2, dir: "across" },
      { word: "PSYCHO", clue: "Hitchcock's Bates Motel film", row: 2, col: 4, dir: "down" },
      { word: "CANDYMAN", clue: "Hook-handed urban legend", row: 0, col: 2, dir: "down" },
      { word: "UNHOLY", clue: "Not blessed", row: 7, col: 1, dir: "across" },
      { word: "ASYLUM", clue: "Smith's Grove ____", row: 5, col: 6, dir: "down" },
      { word: "DAMIEN", clue: "The Omen's antichrist child", row: 10, col: 4, dir: "across" },
      { word: "LAURIE", clue: "Strode — Halloween heroine", row: 5, col: 8, dir: "down" },
      { word: "LURK", clue: "Stalker's M.O.", row: 8, col: 6, dir: "across" },
      { word: "OOZE", clue: "Slime sound", row: 2, col: 7, dir: "down" },
      { word: "CHURCH", clue: "Sanctuary turned creepy", row: 0, col: 2, dir: "across" },
      { word: "HOOK", clue: "Pirate hand or Candyman weapon", row: 2, col: 6, dir: "across" },
      { word: "WAKE", clue: "Funeral gathering", row: 0, col: 9, dir: "down" },
      { word: "AXE", clue: "Splitting weapon", row: 6, col: 8, dir: "across" },
    ],
  },
  {
    title: "SLAUGHTER HOUSE",
    size: 11,
    words: [
      { word: "STALK", clue: "Hunt silently", row: 5, col: 3, dir: "across" },
      { word: "WAKE", clue: "Funeral gathering", row: 4, col: 5, dir: "down" },
      { word: "ELM", clue: "Krueger's street", row: 7, col: 5, dir: "across" },
      { word: "STORM", clue: "Thunder and lightning", row: 5, col: 3, dir: "down" },
      { word: "SCAR", clue: "Slash mark left behind", row: 8, col: 0, dir: "across" },
      { word: "SCARE", clue: "Brief jolt of fear", row: 8, col: 0, dir: "across" },
      { word: "WARLOCK", clue: "Male witch", row: 3, col: 1, dir: "down" },
      { word: "WAIL", clue: "Banshee's cry", row: 3, col: 1, dir: "across" },
      { word: "MOON", clue: "Full or blood?", row: 7, col: 7, dir: "down" },
      { word: "PANIC", clue: "Sudden overwhelming fear", row: 10, col: 5, dir: "across" },
      { word: "HOOK", clue: "Pirate hand or Candyman weapon", row: 2, col: 7, dir: "down" },
      { word: "HIDE", clue: "Stay quiet behind the door", row: 2, col: 7, dir: "across" },
      { word: "DAGGER", clue: "Short stabbing blade", row: 2, col: 9, dir: "down" },
    ],
  },
  {
    title: "FINAL CURTAIN",
    size: 11,
    words: [
      { word: "ATTIC", clue: "Spooky upstairs space", row: 5, col: 3, dir: "across" },
      { word: "CLAW", clue: "Werewolf's weapon", row: 5, col: 7, dir: "down" },
      { word: "LURK", clue: "Stalker's M.O.", row: 6, col: 7, dir: "across" },
      { word: "CHUCKY", clue: "Killer doll from Child's Play", row: 2, col: 10, dir: "down" },
      { word: "SCYTHE", clue: "Reaper's weapon", row: 2, col: 4, dir: "down" },
      { word: "JASON", clue: "Crystal Lake's hockey-masked killer", row: 2, col: 2, dir: "across" },
      { word: "URN", clue: "Holds ashes", row: 0, col: 6, dir: "down" },
      { word: "BLADE", clue: "Sharp killing edge", row: 7, col: 0, dir: "across" },
      { word: "BLOOD", clue: "Vampire's drink", row: 6, col: 1, dir: "down" },
      { word: "BURN", clue: "Witch's traditional fate", row: 0, col: 5, dir: "across" },
      { word: "GORE", clue: "On-screen carnage", row: 9, col: 0, dir: "across" },
      { word: "OWL", clue: "Hooting bird", row: 8, col: 6, dir: "across" },
      { word: "HOWL", clue: "Wolf's call", row: 8, col: 5, dir: "across" },
    ],
  },
];

// Pick this week's puzzle deterministically from the Sunday key. Used as offline fallback.
function scPuzzleForWeek(sundayKey) {
  const idx = scHash(sundayKey) % SC_PUZZLES.length;
  return { ...SC_PUZZLES[idx], idx, sundayKey };
}

// Try to fetch this week's puzzle from the server (which has the freshest pool).
// Falls back to bundled puzzles if the server is unreachable. Returns the puzzle.
async function scFetchPuzzle(sundayKey) {
  try {
    const url = `https://api.sinistertrivia.com/crossword/current?date=${encodeURIComponent(sundayKey)}`;
    const ctl = new AbortController();
    const timeout = setTimeout(() => ctl.abort(), 4000); // 4 sec timeout — fall back to bundled if slow
    const resp = await fetch(url, { signal: ctl.signal });
    clearTimeout(timeout);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    if (!data.words || !data.size) throw new Error("Bad puzzle data");
    return { ...data, sundayKey };
  } catch(e) {
    // Server unreachable or returned junk — use bundled puzzle as fallback
    return scPuzzleForWeek(sundayKey);
  }
}

// Build a 2D grid from the puzzle's words. Returns { grid, cellMeta, wordList }
// grid[r][c] = letter or null (black square)
// cellMeta[r][c] = { number?: int, words: [{wordIdx, dir, position}] }
function scBuildGrid(puzzle) {
  const N = puzzle.size;
  const grid = Array.from({length: N}, () => Array(N).fill(null));
  // Place each word's letters
  puzzle.words.forEach((w, wIdx) => {
    const letters = w.word.toUpperCase().split("");
    for (let i = 0; i < letters.length; i++) {
      const r = w.dir === "across" ? w.row : w.row + i;
      const c = w.dir === "across" ? w.col + i : w.col;
      if (r < N && c < N) grid[r][c] = letters[i];
    }
  });
  // Assign numbers and metadata
  const cellMeta = Array.from({length: N}, () => Array.from({length: N}, () => ({ number: null, words: [] })));
  let nextNum = 1;
  // Mark cells that start a word — same numbering rule as classic crosswords
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (grid[r][c] === null) continue;
      const startsAcross = puzzle.words.some(w => w.dir === "across" && w.row === r && w.col === c);
      const startsDown = puzzle.words.some(w => w.dir === "down" && w.row === r && w.col === c);
      if (startsAcross || startsDown) {
        cellMeta[r][c].number = nextNum++;
      }
    }
  }
  // Track which words touch which cells
  puzzle.words.forEach((w, wIdx) => {
    for (let i = 0; i < w.word.length; i++) {
      const r = w.dir === "across" ? w.row : w.row + i;
      const c = w.dir === "across" ? w.col + i : w.col;
      if (r < puzzle.size && c < puzzle.size) {
        cellMeta[r][c].words.push({ wordIdx: wIdx, dir: w.dir, position: i });
      }
    }
  });
  // Build the visible word list: for each word, find its starting cell number
  const wordList = puzzle.words.map((w, wIdx) => {
    const num = cellMeta[w.row][w.col].number;
    return { ...w, wordIdx: wIdx, number: num };
  });
  // Dedupe: if two words share number+dir+clue, keep one (shouldn't happen in our hand-authored set)
  return { grid, cellMeta, wordList };
}

async function scLoadProgress() {
  try {
    const raw = await Storage.get(SC_SAVE_KEY);
    if (!raw) return { entries: {}, completedWeeks: {}, streak: 0, lastCompletedKey: null };
    const data = JSON.parse(raw);
    return {
      entries: data.entries || {},                  // { sundayKey: { "r,c": "X" } }
      completedWeeks: data.completedWeeks || {},   // { sundayKey: timeSeconds }
      streak: data.streak || 0,
      lastCompletedKey: data.lastCompletedKey || null,
    };
  } catch (e) { return { entries: {}, completedWeeks: {}, streak: 0, lastCompletedKey: null }; }
}
async function scSaveProgress(p) {
  try { await Storage.set(SC_SAVE_KEY, JSON.stringify(p)); } catch(e){}
}

function SinisterCrossword({ onExit }) {
  const btnStyle = {background:"transparent",border:"1px solid rgba(255,80,80,0.6)",borderRadius:10,color:"#ff6060",fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:3,textTransform:"uppercase",padding:"12px 24px",cursor:"pointer"};
  const btn2Style = {...btnStyle,border:"1px solid rgba(255,255,255,0.2)",color:"rgba(255,255,255,0.5)"};
  const [musicOn, setMusicOn] = useState(true);
  const musicRef = useRef(null);

  const [phase, setPhase] = useState("intro"); // intro | playing | won | already_done
  const [progress, setProgress] = useState({ entries: {}, completedWeeks: {}, streak: 0, lastCompletedKey: null });
  const [puzzle, setPuzzle] = useState(null);
  const [meta, setMeta] = useState(null); // { grid, cellMeta, wordList }
  const [entries, setEntries] = useState({}); // "r,c" -> letter typed
  const [recentCellKey, setRecentCellKey] = useState(null); // last typed cell, for pop animation
  const recentTimerRef = useRef(null);
  const completedCountRef = useRef(0); // track word completions for the chime sound
  const [activeCell, setActiveCell] = useState(null); // { r, c }
  const [activeDir, setActiveDir] = useState("across"); // across | down
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [countdown, setCountdown] = useState(scTimeUntilNextSunday());
  const [shareNote, setShareNote] = useState("");

  // Pause main music while in game
  useEffect(() => {
    try { Au.pauseM(); } catch(e){}
    return () => { try { Au.resumeM(); } catch(e){} };
  }, []);

  // Mini-game background music — Web Audio so iOS respects volume.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!musicRef.current) musicRef.current = createGameMusic("/sounds/totmusic.mp3", 0.08);
    const m = musicRef.current;
    if (phase === "playing" && musicOn) m.play();
    else m.pause();
    return () => { try { m.pause(); } catch(e){} };
  }, [phase, musicOn]);

  // Load progress + this week's puzzle on mount
  useEffect(() => {
    let cancelled = false;
    scLoadProgress().then(async p => {
      if (cancelled) return;
      setProgress(p);
      const sundayKey = scCurrentSundayKey();
      // Try server first, fall back to bundled. Don't block UI — show bundled immediately,
      // then upgrade to server version if it loads.
      const bundledPz = scPuzzleForWeek(sundayKey);
      setPuzzle(bundledPz);
      const bundledMeta = scBuildGrid(bundledPz);
      setMeta(bundledMeta);
      // Restore any prior entries
      const savedEntries = p.entries[sundayKey] || {};
      setEntries(savedEntries);
      if (p.completedWeeks[sundayKey]) {
        setPhase("already_done");
      }
      // Now try fetching from server in background
      try {
        const serverPz = await scFetchPuzzle(sundayKey);
        if (cancelled) return;
        // Only swap in the server puzzle if user hasn't already started typing.
        // Otherwise that would erase their progress on a different puzzle.
        if (Object.keys(savedEntries).length === 0 && serverPz && serverPz.words) {
          setPuzzle(serverPz);
          setMeta(scBuildGrid(serverPz));
        }
      } catch(e) { /* server failed, bundled stays */ }
    });
    return () => { cancelled = true; };
  }, []);

  // Tick once per second to update elapsed time and countdown
  useEffect(() => {
    if (phase !== "playing") {
      const id = setInterval(() => setCountdown(scTimeUntilNextSunday()), 1000);
      return () => clearInterval(id);
    }
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 250);
    return () => clearInterval(id);
  }, [phase, startTime]);

  // Check if puzzle is solved every time entries change
  useEffect(() => {
    if (phase !== "playing" || !meta) return;
    let solved = true;
    for (let r = 0; r < puzzle.size; r++) {
      for (let c = 0; c < puzzle.size; c++) {
        if (meta.grid[r][c] !== null && entries[`${r},${c}`] !== meta.grid[r][c]) {
          solved = false; break;
        }
      }
      if (!solved) break;
    }
    if (solved) {
      const totalTime = Math.floor((Date.now() - startTime) / 1000);
      setProgress(prev => {
        const sundayKey = puzzle.sundayKey;
        // Streak math: if last completed was the previous Sunday, increment; else reset to 1
        const prevSunday = new Date(sundayKey + "T00:00:00");
        prevSunday.setDate(prevSunday.getDate() - 7);
        const prevSundayKey = `${prevSunday.getFullYear()}-${String(prevSunday.getMonth()+1).padStart(2,"0")}-${String(prevSunday.getDate()).padStart(2,"0")}`;
        const newStreak = prev.lastCompletedKey === prevSundayKey ? prev.streak + 1 : 1;
        const next = {
          ...prev,
          completedWeeks: { ...prev.completedWeeks, [sundayKey]: totalTime },
          streak: newStreak,
          lastCompletedKey: sundayKey,
        };
        scSaveProgress(next);
        return next;
      });
      try {
        GameSFX.tone(523, 0.15, 'sine', 0.15);
        setTimeout(() => GameSFX.tone(659, 0.15, 'sine', 0.15), 100);
        setTimeout(() => GameSFX.tone(784, 0.15, 'sine', 0.15), 200);
        setTimeout(() => GameSFX.tone(1047, 0.3, 'sine', 0.18), 300);
      } catch(e){}
      setTimeout(() => setPhase("won"), 800);
    }
  }, [entries, phase, meta, puzzle, startTime]);

  // Save entries every time they change (debounced via state batching)
  useEffect(() => {
    if (!puzzle) return;
    setProgress(prev => {
      const next = { ...prev, entries: { ...prev.entries, [puzzle.sundayKey]: entries } };
      scSaveProgress(next);
      return next;
    });
    // Count completed words and play a chime when one is newly completed
    if (meta && phase === "playing") {
      let count = 0;
      for (const w of puzzle.words) {
        let ok = true;
        for (let i = 0; i < w.word.length; i++) {
          const r = w.dir === "across" ? w.row : w.row + i;
          const c = w.dir === "across" ? w.col + i : w.col;
          if (entries[`${r},${c}`] !== w.word[i]) { ok = false; break; }
        }
        if (ok) count++;
      }
      if (count > completedCountRef.current) {
        // New word completed — play satisfying chime sequence
        try {
          GameSFX.tone(523, 0.08, 'sine', 0.12);
          setTimeout(() => GameSFX.tone(659, 0.08, 'sine', 0.12), 60);
          setTimeout(() => GameSFX.tone(784, 0.12, 'sine', 0.14), 120);
        } catch(e){}
      }
      completedCountRef.current = count;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

  const startGame = () => {
    setStartTime(Date.now() - (elapsed * 1000));
    setPhase("playing");
    // Pick first cell with a number for default focus
    if (meta) {
      outer: for (let r = 0; r < puzzle.size; r++) {
        for (let c = 0; c < puzzle.size; c++) {
          if (meta.cellMeta[r][c].number) {
            setActiveCell({ r, c });
            // Determine which direction has a clue starting here
            const startsAcross = meta.wordList.some(w => w.row === r && w.col === c && w.dir === "across");
            setActiveDir(startsAcross ? "across" : "down");
            break outer;
          }
        }
      }
    }
    try { GameSFX.tone(523, 0.1, 'sine', 0.1); GameSFX.tone(659, 0.12, 'sine', 0.1); } catch(e){}
  };

  const onCellClick = (r, c) => {
    if (phase !== "playing" || !meta || meta.grid[r][c] === null) return;
    if (activeCell && activeCell.r === r && activeCell.c === c) {
      // Toggle direction if cell supports both
      const wordsHere = meta.cellMeta[r][c].words;
      const otherDir = activeDir === "across" ? "down" : "across";
      if (wordsHere.some(w => w.dir === otherDir)) setActiveDir(otherDir);
    } else {
      setActiveCell({ r, c });
      // Pick a direction this cell supports
      const wordsHere = meta.cellMeta[r][c].words;
      if (!wordsHere.some(w => w.dir === activeDir)) {
        const w = wordsHere.find(x => x.dir === "across") || wordsHere[0];
        if (w) setActiveDir(w.dir);
      }
    }
    try { GameSFX.tone(440, 0.04, 'sine', 0.06); } catch(e){}
  };

  // Type a letter into the active cell, then advance to the next cell in the active word
  const typeLetter = (ch) => {
    if (phase !== "playing" || !activeCell || !meta) return;
    const { r, c } = activeCell;
    const upperCh = (ch || "").toUpperCase();
    if (!/^[A-Z]$/.test(upperCh)) return;
    const cellKey = `${r},${c}`;
    const newEntries = { ...entries, [cellKey]: upperCh };
    setEntries(newEntries);
    // Trigger pop animation on the cell that just got a letter
    setRecentCellKey(cellKey);
    if (recentTimerRef.current) clearTimeout(recentTimerRef.current);
    recentTimerRef.current = setTimeout(() => setRecentCellKey(null), 350);
    // Advance to next cell in active direction
    const dr = activeDir === "down" ? 1 : 0;
    const dc = activeDir === "across" ? 1 : 0;
    const nr = r + dr;
    const nc = c + dc;
    if (nr < puzzle.size && nc < puzzle.size && meta.grid[nr][nc] !== null) {
      setActiveCell({ r: nr, c: nc });
    }
    // Pleasant typing tick — varies pitch slightly per letter for musicality
    try { GameSFX.tone(660 + (upperCh.charCodeAt(0) - 65) * 8, 0.04, 'sine', 0.08); } catch(e){}
  };

  const backspace = () => {
    if (phase !== "playing" || !activeCell || !meta) return;
    const { r, c } = activeCell;
    const key = `${r},${c}`;
    const newEntries = { ...entries };
    if (newEntries[key]) {
      delete newEntries[key];
      setEntries(newEntries);
    } else {
      // Move back one cell
      const dr = activeDir === "down" ? -1 : 0;
      const dc = activeDir === "across" ? -1 : 0;
      const pr = r + dr;
      const pc = c + dc;
      if (pr >= 0 && pc >= 0 && meta.grid[pr][pc] !== null) {
        delete newEntries[`${pr},${pc}`];
        setEntries(newEntries);
        setActiveCell({ r: pr, c: pc });
      }
    }
    try { GameSFX.tone(330, 0.03, 'sine', 0.05); } catch(e){}
  };

  // Listen for hardware keyboard input
  useEffect(() => {
    if (phase !== "playing") return;
    const onKey = (e) => {
      if (e.key === "Backspace" || e.key === "Delete") { e.preventDefault(); backspace(); }
      else if (/^[a-zA-Z]$/.test(e.key)) { e.preventDefault(); typeLetter(e.key); }
      else if (e.key === "ArrowRight") { setActiveDir("across"); if (activeCell) setActiveCell(c => ({ r: c.r, c: Math.min(puzzle.size - 1, c.c + 1) })); }
      else if (e.key === "ArrowLeft") { setActiveDir("across"); if (activeCell) setActiveCell(c => ({ r: c.r, c: Math.max(0, c.c - 1) })); }
      else if (e.key === "ArrowDown") { setActiveDir("down"); if (activeCell) setActiveCell(c => ({ r: Math.min(puzzle.size - 1, c.r + 1), c: c.c })); }
      else if (e.key === "ArrowUp") { setActiveDir("down"); if (activeCell) setActiveCell(c => ({ r: Math.max(0, c.r - 1), c: c.c })); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, activeCell, activeDir, entries]);

  const shareResult = async () => {
    if (!puzzle) return;
    const time = progress.completedWeeks[puzzle.sundayKey] || elapsed;
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    const text = `🩸 Sinister Crossword #${puzzle.idx + 1} solved in ${minutes}:${String(seconds).padStart(2,"0")} 🩸\nStreak: ${progress.streak} 🔥\nhttps://sinister.pages.dev/`;
    try {
      const m = '@capacitor/share';
      const { Share } = await import(/* @vite-ignore */ m);
      await Share.share({ title: "Sinister Crossword", text, dialogTitle: "Share your time" });
      return;
    } catch(e){}
    if (navigator.share) {
      try { await navigator.share({ title: "Sinister Crossword", text }); return; } catch(e){}
    }
    try {
      await navigator.clipboard.writeText(text);
      setShareNote("Copied to clipboard!");
      setTimeout(() => setShareNote(""), 2500);
    } catch(e){
      setShareNote(text);
      setTimeout(() => setShareNote(""), 6000);
    }
  };

  // ── INTRO ──
  if (phase === "intro" || !puzzle || !meta) {
    return (
      <div style={{position:"fixed",inset:0,background:"radial-gradient(ellipse at center top, #2a0010 0%, #14050a 50%, #08020a 100%)",color:"#fff5e0",zIndex:100,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px 18px",overflow:"auto"}}>
        <TotVideoBg opacity={1} />
        <style>{`
          @import url('https://fonts.bunny.net/css?family=jolly-lodger:400|cinzel:400,600,700&display=swap');
          @keyframes scTitleFlicker {
            0%, 100% { text-shadow: 0 0 20px rgba(255,32,48,0.8), 0 0 40px rgba(255,32,48,0.5), 4px 4px 0 #1a0008; }
            50%      { text-shadow: 0 0 30px rgba(255,40,60,1), 0 0 60px rgba(255,40,60,0.7), 4px 4px 0 #1a0008; }
          }
          @keyframes scIconBob {
            0%, 100% { transform: translateY(0) scale(1); }
            50%      { transform: translateY(-6px) scale(1.05); }
          }
          @keyframes scStreakPulse {
            0%, 100% { box-shadow: 0 0 12px rgba(255,140,30,0.5); }
            50%      { box-shadow: 0 0 22px rgba(255,140,30,0.9); }
          }
        `}</style>
        <button onClick={onExit} style={{position:"absolute",top:14,left:14,background:"rgba(255,32,48,0.12)",border:"1px solid rgba(255,32,48,0.5)",borderRadius:8,color:"#ff6070",fontSize:11,letterSpacing:2,padding:"6px 12px",cursor:"pointer",fontFamily:"'Cinzel',serif",fontWeight:600,zIndex:3}}>← EXIT</button>
        <div style={{position:"relative",zIndex:2,display:"flex",flexDirection:"column",alignItems:"center"}}>
          <div style={{fontSize:80,marginBottom:14,animation:"scIconBob 3s ease-in-out infinite",filter:"drop-shadow(0 0 16px rgba(255,32,48,0.6))"}}>🩸</div>
          <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:54,color:"#ff3040",letterSpacing:5,marginBottom:6,textAlign:"center",lineHeight:1.05,animation:"scTitleFlicker 3s ease-in-out infinite"}}>SINISTER<br/>SUNDAY</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:11,color:"rgba(255,80,96,0.85)",letterSpacing:5,marginBottom:14,textAlign:"center",fontWeight:600}}>WEEKLY HORROR CROSSWORD</div>
          {puzzle && (
            <div style={{padding:"8px 18px",background:"linear-gradient(135deg, rgba(255,32,48,0.18), rgba(120,0,16,0.1))",border:"1px solid rgba(255,32,48,0.45)",borderRadius:24,marginBottom:18}}>
              <div style={{fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:15,color:"#fff5e0",letterSpacing:3,textAlign:"center"}}>
                <span style={{color:"#ff8090"}}>#{puzzle.idx + 1}</span> · {puzzle.title}
              </div>
            </div>
          )}

          <div style={{maxWidth:340,marginBottom:18}}>
            {[
              "A new puzzle every Sunday at midnight",
              "Tap a square, then type to fill it in",
              "Tap again to switch between Across and Down",
              "Solve before next Sunday to keep your streak",
            ].map((t, i) => (
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:8}}>
                <span style={{display:"inline-block",width:22,height:22,borderRadius:11,background:"linear-gradient(140deg, #ff3040 0%, #a00018 100%)",color:"#fff",fontSize:11,fontFamily:"'Cinzel',serif",fontWeight:700,lineHeight:"22px",textAlign:"center",flexShrink:0,marginTop:1,boxShadow:"0 2px 6px rgba(255,32,48,0.4)"}}>{i+1}</span>
                <span style={{color:"rgba(255,240,220,0.9)",fontSize:13,letterSpacing:0.5,lineHeight:1.5,fontFamily:"'Cinzel',serif"}}>{t}</span>
              </div>
            ))}
          </div>

          {progress.streak > 0 && (
            <div style={{padding:"10px 20px",border:"1px solid rgba(255,140,30,0.6)",borderRadius:20,marginBottom:18,fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:3,color:"#ffaa44",fontWeight:700,background:"linear-gradient(135deg, rgba(255,140,30,0.12), rgba(120,40,0,0.1))",animation:"scStreakPulse 2s ease-in-out infinite"}}>
              🔥 STREAK: {progress.streak} {progress.streak === 1 ? "WEEK" : "WEEKS"}
            </div>
          )}

          <button onClick={startGame} style={{...btnStyle,padding:"14px 32px",background:"linear-gradient(140deg, rgba(255,32,48,0.25), rgba(120,0,16,0.15))",border:"1.5px solid rgba(255,80,96,0.7)",color:"#ffe0e4",fontSize:14,fontWeight:700,boxShadow:"0 6px 20px rgba(255,32,48,0.35), inset 0 1px 0 rgba(255,255,255,0.1)"}}>{Object.keys(entries).length > 0 ? "RESUME PUZZLE" : "BEGIN PUZZLE"}</button>
        </div>
      </div>
    );
  }

  // ── ALREADY DONE ──
  if (phase === "already_done") {
    const time = progress.completedWeeks[puzzle.sundayKey] || 0;
    return (
      <div style={{position:"fixed",inset:0,background:"linear-gradient(180deg, #0a0612 0%, #1a0d2e 50%, #2a0a14 100%)",color:"#fff5e0",zIndex:100,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px 18px",overflow:"auto"}}>
        <TotVideoBg opacity={1} />
        <style>{`@import url('https://fonts.bunny.net/css?family=jolly-lodger:400|cinzel:400,600,700&display=swap');`}</style>
        <button onClick={onExit} style={{position:"absolute",top:14,left:14,background:"transparent",border:"1px solid rgba(255,255,255,0.2)",borderRadius:8,color:"rgba(255,255,255,0.6)",fontSize:11,letterSpacing:2,padding:"6px 12px",cursor:"pointer",fontFamily:"'Cinzel',serif",zIndex:3}}>← EXIT</button>
        <div style={{position:"relative",zIndex:2,display:"flex",flexDirection:"column",alignItems:"center"}}>
          <div style={{fontSize:74,marginBottom:14}}>🩸</div>
          <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:42,color:"#ff5050",letterSpacing:5,textShadow:"0 0 30px rgba(255,80,80,0.6)",marginBottom:6,textAlign:"center"}}>ALREADY SOLVED</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:11,color:"rgba(255,200,100,0.7)",letterSpacing:3,marginBottom:14}}>YOUR TIME: {Math.floor(time/60)}:{String(time%60).padStart(2,"0")}</div>
          {progress.streak > 0 && (
            <div style={{padding:"8px 16px",border:"1px solid rgba(255,170,68,0.4)",borderRadius:18,marginBottom:18,fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:2,color:"#ffaa44"}}>
              🔥 STREAK: {progress.streak} {progress.streak === 1 ? "WEEK" : "WEEKS"}
            </div>
          )}
          <div style={{fontFamily:"'Cinzel',serif",fontSize:11,color:"rgba(255,255,255,0.55)",letterSpacing:3,marginBottom:8,textAlign:"center"}}>NEXT PUZZLE IN</div>
          <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:38,color:"#fff",letterSpacing:5,marginBottom:24,textAlign:"center"}}>
            {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
            <button onClick={shareResult} style={btnStyle}>📲 SHARE TIME</button>
            <button onClick={onExit} style={btn2Style}>EXIT</button>
          </div>
          {shareNote && <div style={{marginTop:12,fontSize:11,color:"rgba(255,200,100,0.8)",fontFamily:"'Cinzel',serif",letterSpacing:1,whiteSpace:"pre-wrap",maxWidth:340,textAlign:"center"}}>{shareNote}</div>}
        </div>
      </div>
    );
  }

  // ── WON ──
  if (phase === "won") {
    const time = progress.completedWeeks[puzzle.sundayKey] || elapsed;
    return (
      <div style={{position:"fixed",inset:0,background:"radial-gradient(ellipse at center top, #2a0010 0%, #14050a 50%, #08020a 100%)",color:"#fff5e0",zIndex:100,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px 18px",overflow:"auto"}}>
        <TotVideoBg opacity={1} />
        <style>{`
          @import url('https://fonts.bunny.net/css?family=jolly-lodger:400|cinzel:400,600,700&display=swap');
          @keyframes scWinDrop { 0% { transform: scale(0.4) rotate(-15deg); opacity: 0; } 60% { transform: scale(1.2) rotate(8deg); opacity: 1; } 100% { transform: scale(1) rotate(0); opacity: 1; } }
          @keyframes scWinTitle { 0% { letter-spacing: 0; opacity: 0; } 100% { letter-spacing: 8px; opacity: 1; } }
          @keyframes scWinFlash {
            0% { opacity: 0; }
            20% { opacity: 1; }
            100% { opacity: 0; }
          }
          @keyframes scParticle {
            0% { transform: translate(-50%,-50%) rotate(var(--angle)) translateX(0) scale(0.4); opacity: 0; }
            20% { opacity: 1; }
            100% { transform: translate(-50%,-50%) rotate(var(--angle)) translateX(var(--distance)) scale(0.7); opacity: 0; }
          }
          @keyframes scTimePulse {
            0%, 100% { text-shadow: 0 0 24px rgba(255,255,255,0.6); }
            50%      { text-shadow: 0 0 36px rgba(255,255,255,0.95); }
          }
        `}</style>
        {/* Radial flash */}
        <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at center, rgba(255,32,48,0.5) 0%, transparent 70%)",animation:"scWinFlash 1.8s ease-out forwards",pointerEvents:"none"}}></div>
        {/* Particle burst */}
        {Array.from({length: 16}).map((_, i) => {
          const angle = (i / 16) * 360;
          const dist = 280 + (i % 3) * 50;
          const emoji = ["🩸","💀","🔪","⚰️","🕯️"][i % 5];
          return (
            <div key={i} style={{position:"absolute",left:"50%",top:"50%",fontSize: 24 + (i % 3) * 6,transform:"translate(-50%,-50%)",animation:`scParticle 1.5s cubic-bezier(0.18,0.89,0.32,1.28) ${(i % 4) * 0.05}s forwards`,"--angle":`${angle}deg`,"--distance":`${dist}px`,filter:"drop-shadow(0 0 12px #ff2030)",pointerEvents:"none",zIndex:1}}>{emoji}</div>
          );
        })}
        <div style={{position:"relative",zIndex:2,display:"flex",flexDirection:"column",alignItems:"center"}}>
          <div style={{fontSize:90,marginBottom:14,animation:"scWinDrop 0.7s cubic-bezier(0.18,0.89,0.32,1.28)",filter:"drop-shadow(0 0 20px rgba(255,32,48,0.8))"}}>🩸</div>
          <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:64,color:"#ff3040",marginBottom:6,textAlign:"center",textShadow:"0 0 30px rgba(255,32,48,0.7), 3px 3px 0 #1a0008",animation:"scWinTitle 0.8s 0.2s ease-out backwards",letterSpacing:8}}>SOLVED!</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:12,color:"rgba(255,80,96,0.85)",letterSpacing:4,marginBottom:18,textAlign:"center",fontWeight:600}}>#{puzzle.idx + 1} · {puzzle.title}</div>
          <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:72,color:"#fff",letterSpacing:6,marginBottom:8,animation:"scTimePulse 2s ease-in-out infinite"}}>{Math.floor(time/60)}:{String(time%60).padStart(2,"0")}</div>
          <div style={{padding:"10px 20px",border:"1px solid rgba(255,140,30,0.6)",borderRadius:20,marginBottom:18,fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:3,color:"#ffaa44",fontWeight:700,background:"linear-gradient(135deg, rgba(255,140,30,0.12), rgba(120,40,0,0.1))"}}>
            🔥 STREAK: {progress.streak} {progress.streak === 1 ? "WEEK" : "WEEKS"}
          </div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"rgba(255,255,255,0.55)",letterSpacing:3,marginBottom:4,textAlign:"center"}}>NEXT PUZZLE IN</div>
          <div style={{fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:16,color:"#fff",letterSpacing:3,marginBottom:22}}>
            {countdown.days}d {countdown.hours}h {countdown.minutes}m
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
            <button onClick={shareResult} style={{...btnStyle,padding:"12px 26px",background:"linear-gradient(140deg, rgba(255,32,48,0.25), rgba(120,0,16,0.15))",border:"1.5px solid rgba(255,80,96,0.7)",color:"#ffe0e4",fontWeight:700,boxShadow:"0 6px 20px rgba(255,32,48,0.35)"}}>📲 SHARE TIME</button>
            <button onClick={onExit} style={btn2Style}>EXIT</button>
          </div>
          {shareNote && <div style={{marginTop:12,fontSize:11,color:"rgba(255,200,100,0.8)",fontFamily:"'Cinzel',serif",letterSpacing:1,whiteSpace:"pre-wrap",maxWidth:340,textAlign:"center"}}>{shareNote}</div>}
        </div>
      </div>
    );
  }

  // ── PLAYING ──
  // Active word: figure out which word is currently selected so we highlight it
  let activeWordCells = new Set();
  let activeWordClue = null;
  if (activeCell && meta) {
    const wordsHere = meta.cellMeta[activeCell.r][activeCell.c].words;
    const w = wordsHere.find(x => x.dir === activeDir);
    if (w) {
      const word = puzzle.words[w.wordIdx];
      for (let i = 0; i < word.word.length; i++) {
        const r = word.dir === "across" ? word.row : word.row + i;
        const c = word.dir === "across" ? word.col + i : word.col;
        activeWordCells.add(`${r},${c}`);
      }
      activeWordClue = { ...word, number: meta.cellMeta[word.row][word.col].number };
    }
  }
  // Compute which words are FULLY CORRECTLY filled in — those cells get a gold glow.
  // A cell glows if it belongs to ANY completed word.
  const completedCells = new Set();
  for (const w of puzzle.words) {
    let allRight = true;
    const cells = [];
    for (let i = 0; i < w.word.length; i++) {
      const r = w.dir === "across" ? w.row : w.row + i;
      const c = w.dir === "across" ? w.col + i : w.col;
      cells.push(`${r},${c}`);
      if (entries[`${r},${c}`] !== w.word[i]) { allRight = false; break; }
    }
    if (allRight) cells.forEach(k => completedCells.add(k));
  }
  // Recently-typed cell for the pop animation
  const recentKey = recentCellKey;

  return (
    <div style={{position:"fixed",inset:0,background:"radial-gradient(ellipse at center top, #2a0010 0%, #14050a 50%, #08020a 100%)",color:"#fff5e0",zIndex:100,display:"flex",flexDirection:"column",fontFamily:"'Cinzel',serif",overflow:"hidden"}}>
      <TotVideoBg opacity={1} />
      <style>{`
        @import url('https://fonts.bunny.net/css?family=jolly-lodger:400|cinzel:400,600,700&display=swap');
        @keyframes scLetterPop {
          0% { transform: scale(0.4); opacity: 0; }
          50% { transform: scale(1.35); opacity: 1; }
          80% { transform: scale(0.95); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes scActivePulse {
          0%, 100% { box-shadow: 0 0 0 2px #ff2030, 0 0 18px rgba(255,32,48,0.7), inset 0 0 12px rgba(255,255,255,0.3); }
          50%      { box-shadow: 0 0 0 2px #ff5060, 0 0 28px rgba(255,80,96,0.95), inset 0 0 16px rgba(255,255,255,0.5); }
        }
        @keyframes scCompletedGlow {
          0%, 100% { box-shadow: inset 0 0 0 1px rgba(255,215,0,0.5), 0 0 8px rgba(255,215,0,0.4); }
          50%      { box-shadow: inset 0 0 0 1px rgba(255,215,0,0.9), 0 0 16px rgba(255,215,0,0.7); }
        }
        @keyframes scKeyPress {
          0% { transform: scale(1); }
          40% { transform: scale(0.88); }
          100% { transform: scale(1); }
        }
        @keyframes scClueShimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        @keyframes scTitleFlicker {
          0%, 100% { text-shadow: 0 0 16px rgba(255,32,48,0.8), 0 0 30px rgba(255,32,48,0.4); }
          50% { text-shadow: 0 0 22px rgba(255,40,60,1), 0 0 40px rgba(255,40,60,0.6); }
        }
      `}</style>
      {/* Header */}
      <div style={{padding:"12px 14px 8px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"relative",zIndex:3}}>
        <button onClick={onExit} style={{background:"rgba(255,32,48,0.1)",border:"1px solid rgba(255,32,48,0.5)",borderRadius:8,color:"#ff6070",fontSize:11,letterSpacing:2,padding:"6px 12px",cursor:"pointer",fontFamily:"'Cinzel',serif",fontWeight:600}}>← EXIT</button>
        <div style={{textAlign:"center"}}>
          <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:22,color:"#ff3040",letterSpacing:4,lineHeight:1,animation:"scTitleFlicker 3s ease-in-out infinite"}}>{puzzle.title}</div>
          <div style={{fontSize:9,color:"rgba(255,80,96,0.7)",letterSpacing:4,marginTop:2,fontFamily:"'Cinzel',serif",fontWeight:600}}>#{puzzle.idx + 1} · SINISTER SUNDAY</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button onClick={() => setMusicOn(m => !m)} title={musicOn ? "Music ON" : "Music OFF"} style={{background:"transparent",border:`1px solid rgba(255,255,255,${musicOn ? 0.85 : 0.4})`,borderRadius:8,color:"#ffffff",fontSize:14,cursor:"pointer",padding:"4px 9px",lineHeight:1}}>{musicOn ? "🎵" : "🔇"}</button>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:15,fontWeight:700,color:"#fff",letterSpacing:1,padding:"5px 10px",background:"rgba(0,0,0,0.45)",border:"1px solid rgba(255,32,48,0.4)",borderRadius:8}}>⏱ {Math.floor(elapsed/60)}:{String(elapsed%60).padStart(2,"0")}</div>
        </div>
      </div>

      {/* Active clue display */}
      {activeWordClue && (
        <div style={{margin:"4px 14px",padding:"10px 14px",background:"linear-gradient(135deg, rgba(255,32,48,0.18), rgba(120,0,16,0.1))",border:"1px solid rgba(255,32,48,0.45)",borderRadius:10,fontSize:13,letterSpacing:0.5,color:"#fff5e0",boxShadow:"0 4px 14px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",animation:"scClueShimmer 2s ease-in-out infinite",position:"relative",zIndex:2}}>
          <span style={{color:"#ffd700",fontWeight:700,marginRight:8,fontFamily:"'Cinzel',serif",letterSpacing:2}}>{activeWordClue.number} {activeWordClue.dir.toUpperCase()}</span>
          <span style={{opacity:0.95}}>{activeWordClue.clue}</span>
        </div>
      )}

      {/* Grid */}
      <div style={{flex:"0 1 auto",display:"flex",alignItems:"center",justifyContent:"center",padding:"6px 8px",position:"relative",zIndex:2}}>
        <div style={{position:"relative",width:"100%",maxWidth:"min(92vw, 460px)",aspectRatio:"1"}}>
          {/* Outer glow halo */}
          <div style={{position:"absolute",inset:-8,background:"radial-gradient(circle, rgba(255,32,48,0.25) 0%, transparent 70%)",borderRadius:14,pointerEvents:"none"}}></div>
          <div style={{position:"relative",display:"grid",gridTemplateColumns:`repeat(${puzzle.size}, 1fr)`,gridTemplateRows:`repeat(${puzzle.size}, 1fr)`,gap:2,width:"100%",height:"100%",background:"linear-gradient(160deg, #1a0008 0%, #0a0004 100%)",padding:3,borderRadius:10,border:"2px solid rgba(255,32,48,0.6)",boxShadow:"0 8px 30px rgba(0,0,0,0.7), inset 0 0 30px rgba(255,32,48,0.15)"}}>
          {meta.grid.map((row, r) => row.map((letter, c) => {
            const key = `${r},${c}`;
            const isBlack = letter === null;
            const isActive = activeCell && activeCell.r === r && activeCell.c === c;
            const inActiveWord = activeWordCells.has(key);
            const isCompleted = completedCells.has(key);
            const cellNum = meta.cellMeta[r][c].number;
            const entered = entries[key] || "";
            const justTyped = recentKey === key;
            // Layer the styles: black > completed (gold tint) > active (red highlight) > activeWord (subtle red) > base white
            let bg, color, border, shadow, animation;
            if (isBlack) {
              bg = "transparent"; color = "transparent"; border = "none"; shadow = "none";
            } else if (isActive) {
              bg = "linear-gradient(140deg, #ffffff 0%, #fff0f2 100%)";
              color = "#1a0008";
              border = "none";
              shadow = "none";
              animation = "scActivePulse 1.2s ease-in-out infinite";
            } else if (isCompleted) {
              bg = "linear-gradient(140deg, #fffbe6 0%, #fff2c0 100%)";
              color = "#5a3000";
              border = "1px solid rgba(255,215,0,0.3)";
              animation = "scCompletedGlow 2.5s ease-in-out infinite";
            } else if (inActiveWord) {
              bg = "linear-gradient(140deg, #ffe8ec 0%, #ffd2da 100%)";
              color = "#1a0008";
              border = "1px solid rgba(255,32,48,0.3)";
            } else {
              bg = "linear-gradient(140deg, #f5f5f5 0%, #d8d8d8 100%)";
              color = "#1a0008";
              border = "1px solid rgba(0,0,0,0.15)";
            }
            return (
              <div
                key={key}
                onClick={() => onCellClick(r, c)}
                style={{
                  position:"relative",
                  background: bg,
                  color,
                  border: isBlack ? "none" : border,
                  borderRadius: isBlack ? 0 : 4,
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center",
                  fontFamily:"'Cinzel',serif",
                  fontWeight:800,
                  fontSize:`min(${Math.floor(460/puzzle.size/1.9)}px, 5vw)`,
                  cursor: isBlack ? "default" : "pointer",
                  userSelect:"none",
                  touchAction:"manipulation",
                  boxShadow: shadow,
                  animation,
                  transition: animation ? "none" : "background 0.2s, border 0.2s",
                }}
              >
                {!isBlack && cellNum != null && (
                  <span style={{position:"absolute",top:1,left:3,fontSize:`min(${Math.floor(460/puzzle.size/4)}px, 2.5vw)`,fontWeight:700,color: isCompleted ? "#a07000" : isActive ? "#a00010" : "#777",lineHeight:1,fontFamily:"'Cinzel',serif"}}>{cellNum}</span>
                )}
                {entered && (
                  <span style={{
                    display:"inline-block",
                    animation: justTyped ? "scLetterPop 0.32s cubic-bezier(0.18,0.89,0.32,1.28)" : undefined,
                  }}>{entered}</span>
                )}
              </div>
            );
          }))}
          </div>
        </div>
      </div>

      {/* Word count progress */}
      <div style={{padding:"4px 16px",display:"flex",justifyContent:"center",alignItems:"center",gap:8,fontSize:10,letterSpacing:2,color:"rgba(255,170,68,0.8)",fontFamily:"'Cinzel',serif",fontWeight:700,position:"relative",zIndex:2}}>
        <span>{puzzle.words.filter(w => {
          for (let i = 0; i < w.word.length; i++) {
            const r = w.dir === "across" ? w.row : w.row + i;
            const c = w.dir === "across" ? w.col + i : w.col;
            if (entries[`${r},${c}`] !== w.word[i]) return false;
          }
          return true;
        }).length} / {puzzle.words.length} WORDS</span>
      </div>

      {/* On-screen keyboard for mobile (and helpful on desktop too) */}
      <div style={{padding:"6px 4px 14px",display:"flex",flexDirection:"column",gap:5,alignItems:"center",position:"relative",zIndex:2}}>
        {[
          ["Q","W","E","R","T","Y","U","I","O","P"],
          ["A","S","D","F","G","H","J","K","L"],
          ["Z","X","C","V","B","N","M","⌫"],
        ].map((row, ri) => (
          <div key={ri} style={{display:"flex",gap:4,justifyContent:"center",width:"100%",maxWidth:500,paddingLeft: ri === 1 ? 18 : 0,paddingRight: ri === 1 ? 18 : 0}}>
            {row.map(k => {
              const isBack = k === "⌫";
              return (
                <button
                  key={k}
                  onClick={() => isBack ? backspace() : typeLetter(k)}
                  onPointerDown={(e) => { e.currentTarget.style.transform = "scale(0.9)"; }}
                  onPointerUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                  onPointerLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                  style={{
                    flex:1,
                    maxWidth: isBack ? 56 : 38,
                    minWidth: isBack ? 50 : undefined,
                    padding:"11px 0",
                    background: isBack ? "linear-gradient(180deg, #5a1020 0%, #3a0810 100%)" : "linear-gradient(180deg, #2a1a22 0%, #1a0d14 100%)",
                    border:`1px solid ${isBack ? "rgba(255,80,96,0.6)" : "rgba(255,170,68,0.35)"}`,
                    borderRadius:7,
                    color: isBack ? "#ff8090" : "#fff5e0",
                    fontFamily:"'Cinzel',serif",
                    fontSize: isBack ? 16 : 15,
                    fontWeight:700,
                    cursor:"pointer",
                    touchAction:"manipulation",
                    boxShadow:"0 2px 4px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
                    transition:"transform 0.1s",
                  }}
                >{k}</button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  // Read ?dread=XKWQ from URL on first load — if present, jump straight to DreadWords with that code
  const initialDreadCode = (() => {
    try {
      if (typeof window === "undefined") return null;
      const params = new URLSearchParams(window.location.search);
      const code = (params.get("dread") || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
      return code.length === 4 ? code : null;
    } catch (e) { return null; }
  })();
  const [scr, setScr] = useState(initialDreadCode ? "dreadwords" : "title");
  const [autoJoinDreadCode, setAutoJoinDreadCode] = useState(initialDreadCode);
  const [nm, setNm] = useState("");
  const [rd, setRd] = useState(1);
  const [qi, setQi] = useState(0);
  const [sc, setSc] = useState(0);
  const [sk, setSk] = useState(0);
  const [bs, setBs] = useState(0);
  const [sl, setSl] = useState(null);
  const slRef = useRef(null);
  const [wasRight, setWasRight] = useState(false);
  const wasRightRef = useRef(false);
  const [sh, setSh] = useState(false);
  const [tm, setTm] = useState(30);
  const [tc, setTc] = useState(0);
  const [shk, setShk] = useState(false);
  const [killFeed, setKillFeed] = useState(null);
  const [mu, setMu] = useState(true);
  const [bd, setBd] = useState([]);
  // v48: VS-wins leaderboard (separate from the solo "alltime" board). Rendered on VS end screen.
  const [vsWinsBd, setVsWinsBd] = useState([]);
  const [mr, setMr] = useState(null);
  const [fx, setFx] = useState(null);
  const [bonusPop, setBonusPop] = useState(null);
  const [rqs, setRqs] = useState([]);
  const [prevScr, setPrevScr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiErr, setApiErr] = useState(null);
  const [topPlayer, setTopPlayer] = useState(null);
  const [roundWrong, setRoundWrong] = useState(0);
  const roundWrongRef = useRef(0); // v49: sync ref so nx() can read latest value without waiting for React state flush
  const [myBadges, setMyBadges] = useState([]);
  const [showBadges, setShowBadges] = useState(false);
  const [roundTransition, setRoundTransition] = useState(false);
  const [roundSummary, setRoundSummary] = useState(null); // {round, correct, wrong, score}
  const [dailyDone, setDailyDone] = useState(false);
  const [dailyMode, setDailyMode] = useState(false);
  const [dailyBd, setDailyBd] = useState([]);
  const [lbTab, setLbTab] = useState("alltime");
  const [vsMode, setVsMode] = useState(false);
  const [vsRole, setVsRole] = useState(null); // "host" or "guest"
  const [vsCode, setVsCode] = useState("");
  const [vsCodeInput, setVsCodeInput] = useState("");
  const [vsOpponent, setVsOpponent] = useState(null);
  const [vsOpponentScore, setVsOpponentScore] = useState(0);
  const [vsOpponentDone, setVsOpponentDone] = useState(false);
  const [vsStatus, setVsStatus] = useState("idle"); // idle, creating, waiting, playing, done
  const vsPollRef = useRef(null);
  const vsWaitRef = useRef(null); // v37: separate ref for host-waiting listener so score listener doesn't overwrite it
  // v43: rematch state — mirrors the hostRematch/guestRematch flags on the room doc.
  // vsIWantRematch = has THIS player clicked rematch? vsOpponentWantsRematch = has the other?
  const [vsIWantRematch, setVsIWantRematch] = useState(false);
  const [vsOpponentWantsRematch, setVsOpponentWantsRematch] = useState(false);
  // v48: session-only win counters. Reset each time a fresh VS session starts (new opponent
  // or re-entry to VS mode). Incremented when a match ends, based on final score compare.
  const [vsSessionWins, setVsSessionWins] = useState(0);
  const [vsSessionLosses, setVsSessionLosses] = useState(0);
  const [vsSessionDraws, setVsSessionDraws] = useState(0);
  const vsEndListenerRef = useRef(null); // v43: the post-match listener (previously inline unsub) — lifted to ref so rematch flow can tear it down cleanly
  // v43: live scoreboard pulse — flashes opponent side when they score, flashes your side when you score
  const [vsOppPulse, setVsOppPulse] = useState(false);
  const [vsMePulse, setVsMePulse] = useState(false);
  const prevOppScoreRef = useRef(0);
  const prevMyScoreRef = useRef(0);
  // v48: latch so a match's result is only credited to the session record ONCE, even if the
  // effect re-runs (due to any re-render while both are "done"). Reset whenever a new match starts.
  const vsMatchCountedRef = useRef(false);
  const [adminMode, setAdminMode] = useState(false);
  const [sbScore, setSbScore] = useState(0);
  const [gdScore, setGdScore] = useState(0);
  const [stakeScore, setStakeScore] = useState(0);
  const [cbScore, setCbScore] = useState(0);
  const [totScore, setTotScore] = useState(0);
  const [adminReports, setAdminReports] = useState([]);
  const [ytTaps, setYtTaps] = useState(0);
  const ytTapRef = useRef(null);
  const handleYtTap = () => {
    setYtTaps(t => {
      const n = t + 1;
      clearTimeout(ytTapRef.current);
      ytTapRef.current = setTimeout(() => setYtTaps(0), 2000);
      if (n >= 5) {
        setYtTaps(0);
        getDoc(doc(db,"reports","questions")).then(snap => {
          setAdminReports(snap.exists() ? snap.data().items || [] : []);
          setAdminMode(true);
        });
      }
      return n;
    });
  };
  const tr = useRef(null);
  const nmRef = useRef(nm);
  const scRef = useRef(sc);
  const tcRef = useRef(tc);
  const dailyModeRef = useRef(dailyMode);
  useEffect(() => { nmRef.current = nm; }, [nm]);
  useEffect(() => { dailyModeRef.current = dailyMode; }, [dailyMode]);
  const [miniLbTops, setMiniLbTops] = useState({ "slasher-smash": null, "camp-blood": null, "stake-vampire": null, "dread-words": null, "slaughtership": null, "slasher-mystery": null, "trick-or-treat": null });
  const refreshMiniLbTops = async () => {
    try {
      const ids = ["slasher-smash", "camp-blood", "stake-vampire", "dread-words", "slaughtership", "slasher-mystery", "trick-or-treat"];
      const results = await Promise.all(ids.map(id => loadMiniB(id)));
      const tops = {};
      ids.forEach((id, i) => { tops[id] = (results[i] && results[i][0]) ? results[i][0] : null; });
      setMiniLbTops(tops);
    } catch(e) { console.error("refreshMiniLbTops:", e); }
  };
  // Fetch when entering the minigames screen
  useEffect(() => { if (scr === "minigames") { refreshMiniLbTops(); } }, [scr]);
  // Submit a mini-game high score to its leaderboard using the player's name from main game
  const submitMiniScore = async (gameId, sc) => {
    if (!sc || sc <= 0) return;
    try {
      const playerName = (nmRef.current && nmRef.current.trim()) || nm || "Anonymous";
      console.log("[MiniLB] submitting", gameId, playerName, sc);
      await saveMiniS(gameId, playerName, sc);
      refreshMiniLbTops();
    } catch(e) { console.error("submitMiniScore:", e); }
  };
  // Dread Words wins are counted differently — total match wins per player (lifetime, additive).
  // The Firestore doc lives at leaderboards/minigame-dread-words and entries are { name, score: <wins>, d }.
  // We read existing wins for this player, add 1, and re-save.
  const recordDreadWordsWin = async () => {
    try {
      const playerName = (nmRef.current && nmRef.current.trim()) || nm || "Anonymous";
      const board = await loadMiniB("dread-words");
      const existing = board.find(e => e && e.name && e.name.trim().toLowerCase() === playerName.trim().toLowerCase());
      const newWins = existing ? (Number(existing.score) || 0) + 1 : 1;
      console.log("[DreadWordsLB] recording win for", playerName, "total now", newWins);
      // saveMiniS dedupes on (name, score, today). To force update, we filter and re-save the array.
      const today = new Date().toISOString().slice(0,10);
      const filtered = board.filter(e => !(e && e.name && e.name.trim().toLowerCase() === playerName.trim().toLowerCase()));
      filtered.push({ name: playerName.trim().slice(0,20), score: newWins, d: today });
      filtered.sort((a, c) => (c.score || 0) - (a.score || 0));
      const top = filtered.slice(0, 50);
      const ref = doc(db, "leaderboards", "minigame-dread-words");
      await setDoc(ref, { scores: top });
      refreshMiniLbTops();
    } catch(e) { console.error("recordDreadWordsWin:", e); }
  };
  // Slaughtership wins — same lifetime additive pattern as Dread Words.
  // Firestore doc: leaderboards/minigame-slaughtership.
  const recordSlaughtershipWin = async () => {
    try {
      const playerName = (nmRef.current && nmRef.current.trim()) || nm || "Anonymous";
      const board = await loadMiniB("slaughtership");
      const existing = board.find(e => e && e.name && e.name.trim().toLowerCase() === playerName.trim().toLowerCase());
      const newWins = existing ? (Number(existing.score) || 0) + 1 : 1;
      console.log("[SlaughterLB] recording win for", playerName, "total now", newWins);
      const today = new Date().toISOString().slice(0,10);
      const filtered = board.filter(e => !(e && e.name && e.name.trim().toLowerCase() === playerName.trim().toLowerCase()));
      filtered.push({ name: playerName.trim().slice(0,20), score: newWins, d: today });
      filtered.sort((a, c) => (c.score || 0) - (a.score || 0));
      const top = filtered.slice(0, 50);
      const ref = doc(db, "leaderboards", "minigame-slaughtership");
      await setDoc(ref, { scores: top });
      refreshMiniLbTops();
    } catch(e) { console.error("recordSlaughtershipWin:", e); }
  };
  // Slasher Mystery wins — same lifetime additive pattern.
  // Firestore doc: leaderboards/minigame-slasher-mystery.
  const recordMysteryWin = async () => {
    try {
      const playerName = (nmRef.current && nmRef.current.trim()) || nm || "Anonymous";
      const board = await loadMiniB("slasher-mystery");
      const existing = board.find(e => e && e.name && e.name.trim().toLowerCase() === playerName.trim().toLowerCase());
      const newWins = existing ? (Number(existing.score) || 0) + 1 : 1;
      console.log("[MysteryLB] recording win for", playerName, "total now", newWins);
      const today = new Date().toISOString().slice(0,10);
      const filtered = board.filter(e => !(e && e.name && e.name.trim().toLowerCase() === playerName.trim().toLowerCase()));
      filtered.push({ name: playerName.trim().slice(0,20), score: newWins, d: today });
      filtered.sort((a, c) => (c.score || 0) - (a.score || 0));
      const top = filtered.slice(0, 50);
      const ref = doc(db, "leaderboards", "minigame-slasher-mystery");
      await setDoc(ref, { scores: top });
      refreshMiniLbTops();
    } catch(e) { console.error("recordMysteryWin:", e); }
  };

  const mt = Math.max(30 - (rd - 1) * 4, 14);
  const cq = rqs[qi];
  const oq = (rd - 1) * 10 + qi + 1;
  const pct = tm / mt;
  const tC = pct > 0.5 ? "#22c55e" : pct > 0.25 ? "#eab308" : "#ef4444";

  useEffect(() => { loadB().then(b => { setBd(b); if (b.length > 0) setTopPlayer({name: b[0].name, score: b[0].score}); }); }, []); useEffect(() => { Storage.get("sinister-name").then(v => { if (v && typeof v === "string") { setNm(v); nmRef.current = v; } }); }, []);
  useEffect(() => { if (bd.length > 0) setTopPlayer({name: bd[0].name, score: bd[0].score}); }, [bd]);
  useEffect(() => { if (mu) Au.startM(1); return () => Au.stopM(); }, []);
  useEffect(() => {
    if (scr === "gameover") {
      /* v49: gameover path now computes badges and saves them with the score, matching the win-path pattern.
         Previously badges were omitted from saveS on loss, so leaderboard entries showed no badge icons. */
      (async () => {
        if (!dailyModeRef.current) {
          const stats = await updateBadgeStats({ gamesPlayed: 1, correctAnswers: tc, perfectGames: tc === 50 ? 1 : 0 });
          const badges = await calcBadges(stats, null);
          const b = await saveS(nm || "Anonymous", sc, tc, badges);
          if (b.length > 0) {
            setBd(b);
            setTopPlayer({name: b[0].name, score: b[0].score});
            const i = b.findIndex(e => e.name === (nm || "Anonymous") && e.score === sc);
            const rank = i >= 0 ? i + 1 : null;
            setMyBadges(await calcBadges(stats, rank));
          }
        } else {
          const db = await saveDailyS(nm || "Anonymous", sc, tc);
          setDailyBd(db);
          await Storage.set("sinister-daily", new Date().toISOString().slice(0,10));
          setDailyDone(true);
          setDailyMode(false);
        }
      })();
    }
    if (scr === "game" && mu && Au._bgm && Au._bgm.paused && !Au._muted) {
      console.log('[Audio] Restarting background music during gameplay');
      Au._bgm.play().catch(e => console.warn('[Audio] Gameplay restart failed:', e));
    }
  }, [scr]);


  // Lightning flash — random interval 25–70s


  // Daily challenge — check if already played today
  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().slice(0,10);
      const last = await Storage.get("sinister-daily");
      if (last === today) setDailyDone(true);
    })();
  }, []);

  const getDailySeed = () => {
    const today = new Date().toISOString().slice(0,10);
    return today.split("-").reduce((a,n) => a + parseInt(n), 0);
  };

  const goDaily = async () => {
    Au.p("continue"); Hap.medium();
    setDailyMode(true);
    setSc(0); setSk(0); setBs(0); setRd(1); setQi(0); setTc(0); setRqs([]); setRoundWrong(0); roundWrongRef.current = 0; scRef.current = 0; tcRef.current = 0;
    setScr("ri");
    const seed = getDailySeed();
    const pool = await getSlasherQuestions(3, 10, seed);
    // v42: shuffle options per-question (Daily path currently unused — replaced
    // by minigames — but shuffled for safety if it's ever re-wired)
    setRqs(shuffleAllQuestions(pool));
    setLoading(false);
    setTimeout(() => Au.p("round"), 200);
  };

  const startVsGame = (questions) => {
    // v44: restore vsStatus to "playing" so the live-score useEffect re-attaches its
    // onSnapshot listener during rematch matches (it tears down at status==="done")
    setVsMode(true); setVsStatus("playing"); setVsOpponentDone(false);
    // v48: allow the NEXT match's result to be credited to the session record
    vsMatchCountedRef.current = false;
    setSc(0); setSk(0); setBs(0); setRd(1); setQi(0); setTc(0); setRoundWrong(0); roundWrongRef.current = 0; scRef.current = 0; tcRef.current = 0;
    setRqs(questions);
    setLoading(false);
    setScr("ri");
    setTimeout(() => Au.p("round"), 200);
  };

  // v48: credit the session record ONCE per match. Fires when both sides are done AND we're on
  // the end screen, then latches via vsMatchCountedRef so React re-renders don't double-count.
  useEffect(() => {
    if (!vsMode) return;
    if (scr !== "end") return;
    if (!vsOpponentDone) return;
    if (vsMatchCountedRef.current) return;
    vsMatchCountedRef.current = true;
    if (sc > vsOpponentScore) {
      setVsSessionWins(w => w + 1);
      // v48: credit this win to the global VS-wins leaderboard and refresh local state so
      // the end-screen leaderboard updates with your new ranking.
      creditVsWin(nm || "Anonymous").then(b => setVsWinsBd(b));
    } else if (sc < vsOpponentScore) {
      setVsSessionLosses(l => l + 1);
      // Still refresh the board so the loser sees the latest standings.
      loadVsWinsB().then(b => setVsWinsBd(b));
    } else {
      setVsSessionDraws(d => d + 1);
      loadVsWinsB().then(b => setVsWinsBd(b));
    }
  }, [vsMode, scr, vsOpponentDone, sc, vsOpponentScore]);

  const goCreateVs = async () => {
    // v48: instead of alerting "Enter your name first!", default to "Anonymous" silently
    const effNm = nm.trim() || "Anonymous";
    Au.p("continue");
    // v48: reset session record — fresh opponent coming in
    setVsSessionWins(0); setVsSessionLosses(0); setVsSessionDraws(0);
    setVsStatus("creating");
    // v42: shuffle options BEFORE createRoom so host + guest both receive
    // the same shuffled questions via Firestore. Reshuffling after write
    // would cause host/guest desync (different answer indices).
    const rawQuestions = await getSlasherQuestions(2, 10);
    if (!rawQuestions || rawQuestions.length < 10) { setVsStatus("idle"); alert("Couldn't load questions. Try again."); return; }
    const questions = shuffleAllQuestions(rawQuestions);
    const code = await createRoom(effNm, questions);
    if (!code) { setVsStatus("idle"); alert("Couldn't create room. Check your connection."); return; }
    setVsCode(code);
    setVsRole("host");
    setVsStatus("waiting");
    // v37: host-waiting listener on its own ref so the score listener (which
    // starts after status flips to "playing") doesn't clobber the unsubscribe.
    // v46: swapped onSnapshot for setInterval+getDoc polling (every 1s) so host
    // reliably detects guest joining in the Stackblitz webcontainer environment.
    let waitPollInFlight = false;
    const waitPoll = setInterval(async () => {
      if (waitPollInFlight) return;
      waitPollInFlight = true;
      try {
        const snap = await getDoc(doc(db, "vsrooms", code));
        if (!snap.exists()) return;
        const state = snap.data();
        if (state && state.status === "playing" && state.guest) {
          clearInterval(waitPoll);
          vsWaitRef.current = null;
          setVsOpponent(state.guest);
          setVsStatus("playing");
          startVsGame(questions);
        }
      } catch(e) {
        console.warn("[VS host-wait poll] error:", e);
      } finally {
        waitPollInFlight = false;
      }
    }, 1000);
    vsWaitRef.current = () => clearInterval(waitPoll);
  };

  const goJoinVs = async () => {
    // v48: name is no longer required — defaults to "Anonymous" silently
    const effNm = nm.trim() || "Anonymous";
    if (!vsCodeInput.trim()) return alert("Enter a room code!");
    Au.p("continue");
    // v48: reset session record — fresh opponent coming in
    setVsSessionWins(0); setVsSessionLosses(0); setVsSessionDraws(0);
    setVsStatus("creating");
    const data = await joinRoom(vsCodeInput.trim(), effNm);
    if (!data) { setVsStatus("idle"); alert("Room not found or already started!"); return; }
    // v37: read the FULL question objects stored in the room doc. This guarantees
    // host and guest render the exact same 10 questions regardless of whether
    // the questions originated from the local pool or Firestore. The old code
    // re-ran getSlasherQuestions(2, 200) and tried to match by text string,
    // which (a) called an async fn without await and (b) missed any question
    // that only existed in Firestore.
    const roomQs = Array.isArray(data.questions) ? data.questions : [];
    if (roomQs.length < 10) {
      setVsStatus("idle");
      alert("Room has no questions — ask the host to create a new match.");
      return;
    }
    setVsCode(vsCodeInput.trim());
    setVsRole("guest");
    setVsOpponent(data.host);
    setVsStatus("playing");
    startVsGame(roomQs.slice(0, 10));
  };

  // v43: pulse my side of the VS scoreboard whenever my own score rises (only in VS)
  useEffect(() => {
    if (!vsMode || vsStatus !== "playing") { prevMyScoreRef.current = sc; return; }
    if (sc > prevMyScoreRef.current) {
      setVsMePulse(true);
      const t = setTimeout(() => setVsMePulse(false), 600);
      prevMyScoreRef.current = sc;
      return () => clearTimeout(t);
    }
    prevMyScoreRef.current = sc;
  }, [sc, vsMode, vsStatus]);

  // Real-time opponent score listener during VS game
  // v46: switched from onSnapshot to setInterval+getDoc polling (every 800ms during gameplay)
  // because onSnapshot wasn't reliably delivering cross-tab updates in the Stackblitz
  // webcontainer environment. Polling is slightly chattier but actually works.
  useEffect(() => {
    if (vsMode && vsStatus === "playing" && vsCode) {
      // v43: reset pulse baselines when entering a fresh match
      prevOppScoreRef.current = 0;
      prevMyScoreRef.current = 0;
      let pollInFlight = false;
      const pollInterval = setInterval(async () => {
        if (pollInFlight) return;
        pollInFlight = true;
        try {
          const snap = await getDoc(doc(db, "vsrooms", vsCode));
          if (!snap.exists()) return;
          const state = snap.data();
          const oppScore = (vsRole === "host" ? state.guestScore : state.hostScore) || 0;
          setVsOpponentScore(oppScore);
          if (oppScore > prevOppScoreRef.current) {
            setVsOppPulse(true);
            setTimeout(() => setVsOppPulse(false), 600);
          }
          prevOppScoreRef.current = oppScore;
        } catch(e) {
          console.warn("[VS live score poll] error:", e);
        } finally {
          pollInFlight = false;
        }
      }, 800);
      vsPollRef.current = () => clearInterval(pollInterval);
      return () => { clearInterval(pollInterval); vsPollRef.current = null; };
    }
  }, [vsMode, vsStatus, vsCode, vsRole]);


  useEffect(() => {
    if (scr === "game" && !sh && rqs.length > 0) {
      tr.current = setInterval(() => {
        setTm(t => {
          if (t <= 1) { clearInterval(tr.current); setSh(true); setWasRight(false); setSk(0); Au.p("no"); Hap.error(); setShk(true); setTimeout(() => setShk(false), 600); setFx("b"); setTimeout(() => setFx(null), 2000); const kfMsg = kF[Math.floor(Math.random() * kF.length)]; setKillFeed(kfMsg); setTimeout(() => setKillFeed(null), 2500); setRoundWrong(w => { const nw = w+1; roundWrongRef.current = nw; if(nw>=5 && !vsMode){Au.stopM(); /* v49: dup save removed - scr==="gameover" useEffect at line 6453 handles it */ setTimeout(()=>setScr("gameover"),1800);} return nw; }); return 0; }
          if (t <= 6) { Au.p("hb"); }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(tr.current);
    }
  }, [scr, qi, sh, rqs]);

  const navTo = (dest) => {
    setPrevScr(scr);
    setScr(dest);
    // Reset scroll position so each screen starts at the top, not wherever the previous screen was scrolled to
    try {
      if (typeof window !== "undefined") {
        window.scrollTo(0, 0);
        if (document && document.documentElement) document.documentElement.scrollTop = 0;
        if (document && document.body) document.body.scrollTop = 0;
      }
    } catch(e){}
  };

  // Mute background music while a mini-game is active. Restore on exit (only if user hadn't muted music themselves).
  // Uses Au.pauseM/resumeM which preserve the user's mute preference flag.
  useEffect(() => {
    const miniGameScreens = ["slashersmash", "slaughtership", "slashermystery", "dreadwords", "campblood", "trickortreat"];
    if (miniGameScreens.includes(scr)) {
      Au.pauseM();
    } else {
      Au.resumeM();
    }
  }, [scr]);
  const loadQs = useCallback(async (roundNum) => {
    setLoading(true); setApiErr(null);
    try {
      const bundled = await getSlasherQuestions(roundNum, 200);
      let pool = bundled;
      // v34: All 5 rounds fetch from Firestore and merge with local pool
      if (true) { // v34: was "roundNum >= 4" — now all rounds fetch from Firestore
        if (false) try {
          const q = query(collection(db, "questions"), where("d", "==", roundNum));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const remote = snap.docs.map(d => d.data());
            const bundledQs = new Set(bundled.map(q => q.q));
            const newOnes = remote.filter(q => !bundledQs.has(q.q));
            pool = [...bundled, ...newOnes];
          }
        } catch(fetchErr) {
          console.warn("Firestore question fetch failed, using bundled only:", fetchErr.message);
        }
      }
      // Apply seen-question tracking across full merged pool using ASYNC storage
      const storageKey = 'sinister_seen_d' + roundNum;
      let seenArr = [];
      try { 
        const storedData = await Storage.get(storageKey);
        seenArr = JSON.parse(storedData || '[]'); 
      } catch(e) {}
      const seenSet = new Set(seenArr);
      const thresholdCount = Math.floor(pool.length * 0.95);
      // Reset when 95%+ of pool seen (FIXED: consistent threshold logic)
      if (seenSet.size >= thresholdCount) {
        console.log(`[LoadQs] Reset triggered for difficulty ${roundNum}: ${seenSet.size}/${pool.length} seen (threshold: ${thresholdCount})`);
        seenSet.clear();
        await Storage.remove(storageKey);
      }
      const arr = [...pool];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      const unseen = arr.filter(q => !seenSet.has(q.q));
      // IMPROVED: Better fallback logic
      let picked;
      if (unseen.length >= 10) {
        picked = unseen.slice(0, 10);
      } else if (unseen.length > 0) {
        const needed = 10 - unseen.length;
        const seenButNotRecent = arr.filter(q => seenSet.has(q.q) && !unseen.some(uq => uq.q === q.q));
        picked = [...unseen, ...seenButNotRecent.slice(0, needed)];
      } else {
        picked = arr.slice(0, 10);
      }
      picked.forEach(q => seenSet.add(q.q));
      try {
        await Storage.set(storageKey, JSON.stringify([...seenSet]));
      } catch(e) {
        console.warn(`[LoadQs] Failed to save seen questions: ${e.message}`);
      }
      if (!picked.length) throw new Error("No questions for this difficulty");
      console.log(`[LoadQs] D${roundNum}: ${picked.length} picked, ${seenSet.size}/${pool.length} seen, ${unseen.length} were unseen`);
      setRqs(shuffleAllQuestions(picked)); setLoading(false); return true;
    } catch(e) {
      setApiErr(e.message || String(e)); setLoading(false); return false;
    }
  }, []);

  const go = async () => {
    Au.p("click"); Hap.light(); if (mu) Au.startM(1);
    setVsMode(false); setVsStatus("idle"); setVsCode(""); setVsOpponent(null); setVsOpponentScore(0);
    setSc(0); setSk(0); setBs(0); setRd(1); setQi(0); setTc(0); setRqs([]); setRoundWrong(0); roundWrongRef.current = 0; scRef.current = 0; tcRef.current = 0;
    setScr("ri");
    await loadQs(1);
    setTimeout(() => Au.p("round"), 200);
  };
  const sr2 = () => { if (loading || rqs.length === 0) return; Au.p("continue"); if (mu) { Au.startM(rd); } setQi(0); setSl(null); setSh(false); setWasRight(false); setTm(mt); setFx(null); setRoundWrong(0); roundWrongRef.current = 0; setScr("game"); };
  const pk = (idx) => {
    if (sh || sl !== null) { return; }
    clearInterval(tr.current); 
    setSl(idx); slRef.current = idx;
    setSh(true);
    const correct = idx === rqs[qi].a;
    setWasRight(correct); wasRightRef.current = correct;
    if (correct) {
      const b = Math.ceil(tm / mt * 100), s = sk >= 2 ? Math.floor(50 * (sk - 1) * (1 + sk * 0.1)) : 0;
      setSc(v => { const nv = v + b + s + 50; scRef.current = nv; if (vsMode && vsCode) updateRoomScore(vsCode, vsRole, nv, false); return nv; }); setSk(v => { const n = v + 1; if (n > bs) { setBs(n); } return n; }); setTc(v => { const nv = v + 1; tcRef.current = nv; return nv; });
      if (s > 0) { setBonusPop("+" + s); setTimeout(() => setBonusPop(null), 1200); }
      if (sk >= 2) {
        Au.playUrl("/sounds/Streak.mp3", 0.48);
      } else {
        Au.p("ok"); Hap.success();
      }
      setFx("m"); setTimeout(() => setFx(null), 2000);
    } else {
      setSk(0); Au.p("no"); setShk(true); setTimeout(() => setShk(false), 600); setFx("b"); setTimeout(() => setFx(null), 2000);
      const kfMsg = kF[Math.floor(Math.random() * kF.length)]; setKillFeed(kfMsg); setTimeout(() => setKillFeed(null), 2500);
      setRoundWrong(w => {
        const newW = w + 1;
        roundWrongRef.current = newW;
        if (newW >= 5 && !vsMode) {
          Au.stopM();
          /* v49: dup save removed - scr==="gameover" useEffect at line 6453 handles saveS and daily-mode cleanup (Storage.set + setDailyDone + setDailyMode) */
          setTimeout(() => setScr("gameover"), 1800);
        }
        return newW;
      });
    }
  };
  const nx = async () => {
    Au.p("continue");
    /* v49: if the user just hit their 5th wrong on the last question of this round, end the game
       instead of advancing. Uses roundWrongRef because setRoundWrong from pk() may not have flushed
       to the roundWrong state yet when Continue is clicked. */
    if (roundWrongRef.current >= 5 && !vsMode) {
      Au.stopM();
      setScr("gameover");
      return;
    }
    if (qi + 1 >= rqs.length) {
      Au.stopM();
      if (rd >= 5 || dailyMode || vsMode) {
        if (vsMode) {
          Au.stopM();
          await updateRoomScore(vsCode, vsRole, sc, true);
          // v46 critical fix: write status:"done" to Firestore at match end so the end-match
          // poll can distinguish a finished match from an active one. Without this, status
          // stays "playing" forever and the poll's "start match" branch keeps re-firing,
          // causing the auto-rematch loop. Both players write this; last-write-wins is fine
          // since both intend "done".
          try { await updateDoc(doc(db, "vsrooms", vsCode), { status: "done" }); } catch(_) {}
          setVsStatus("done");
          // v46: reset rematch UI state and stash the listener on a ref so the
          // rematch flow (which calls startVsGame) can tear it down cleanly.
          setVsIWantRematch(false);
          setVsOpponentWantsRematch(false);
          // Tear down any prior end-listener before creating a new one (defensive).
          if (vsEndListenerRef.current) { vsEndListenerRef.current(); vsEndListenerRef.current = null; }
          // v46: local latch — only allow the "status=playing → startVsGame" transition
          // AFTER we've confirmed status==="done" in a poll. Prevents the initial poll (which
          // might still read cached status="playing") from triggering a spurious rematch.
          let sawDone = false;
          // v46: swap onSnapshot for setInterval+getDoc polling. onSnapshot was silently
          // failing to deliver updates from other tabs in the Stackblitz webcontainer
          // (suspected IndexedDB/listener dedup across same-origin tabs). Polling every 1.2s
          // via direct getDoc reads is heavier but reliably sees the latest server state.
          let pollInFlight = false;
          const pollInterval = setInterval(async () => {
            if (pollInFlight) return;
            pollInFlight = true;
            try {
              const snap = await getDoc(doc(db, "vsrooms", vsCode));
              if (!snap.exists()) {
                console.log("[VS rematch poll] room doc deleted — opponent left");
                clearInterval(pollInterval);
                vsEndListenerRef.current = null;
                setVsOpponentWantsRematch(false);
                alert("Opponent left. You can create a new match.");
                setVsMode(false); setVsStatus("idle"); setVsCode(""); setVsRole(null);
                setVsOpponent(null); setVsOpponentScore(0); setVsOpponentDone(false);
                setScr("vs");
                return;
              }
              const state = snap.data();
              const oppScore = vsRole === "host" ? state.guestScore : state.hostScore;
              const oppDone  = vsRole === "host" ? state.guestDone  : state.hostDone;
              const myRematch  = vsRole === "host" ? state.hostRematch  : state.guestRematch;
              const oppRematch = vsRole === "host" ? state.guestRematch : state.hostRematch;
              console.log("[VS rematch poll]", { vsRole, status: state.status, hostRematch: !!state.hostRematch, guestRematch: !!state.guestRematch, oppDone, qsCount: state.questions?.length });
              setVsOpponentScore(oppScore || 0);
              if (oppDone) setVsOpponentDone(true);
              setVsIWantRematch(!!myRematch);
              setVsOpponentWantsRematch(!!oppRematch);

              // Track whether we've observed status==="done" in at least one poll. Only after
              // that do we allow a status==="playing" transition to fire startVsGame. This
              // prevents any stale-cache race where the very first poll might still return
              // status="playing" from the match we just finished.
              if (state.status === "done") { sawDone = true; }

              // Host-only: when both rematch flags are true, regenerate match
              if (vsRole === "host" && myRematch && oppRematch && state.status === "done") {
                console.log("[VS rematch poll] host triggering rematch");
                // Neutral status avoids re-entry during the question fetch
                try { await updateDoc(doc(db, "vsrooms", vsCode), { status: "rematching" }); } catch(_) {}
                const rawQs = await getSlasherQuestions(2, 10);
                if (!rawQs || rawQs.length < 10) {
                  console.error("[VS rematch poll] failed to load questions");
                  alert("Couldn't load rematch questions. Try again.");
                  try { await updateDoc(doc(db, "vsrooms", vsCode), { status: "done", hostRematch: false, guestRematch: false }); } catch(_) {}
                  return;
                }
                const shuffled = shuffleAllQuestions(rawQs);
                console.log("[VS rematch poll] host writing new match");
                await startRematchAsHost(vsCode, shuffled);
              }

              // Both sides: status flipped to "playing" with fresh questions → enter match.
              // Gate on sawDone to prevent the initial poll from re-entering the just-ended match.
              if (sawDone && state.status === "playing" && Array.isArray(state.questions) && state.questions.length >= 10) {
                console.log("[VS rematch poll] status=playing — starting new match as", vsRole);
                clearInterval(pollInterval);
                vsEndListenerRef.current = null;
                setVsOpponentDone(false);
                setVsIWantRematch(false);
                setVsOpponentWantsRematch(false);
                startVsGame(state.questions.slice(0, 10));
              }
            } catch(e) {
              console.error("[VS rematch poll] error:", e);
            } finally {
              pollInFlight = false;
            }
          }, 1200);
          // Wrap interval handle so the existing tear-down code (which calls vsEndListenerRef.current() as a function) keeps working
          vsEndListenerRef.current = () => clearInterval(pollInterval);
          const stats = await updateBadgeStats({ gamesPlayed: 1, correctAnswers: tc, perfectGames: tc === 50 ? 1 : 0 });
          const badges = await calcBadges(stats, null);
          const b = await saveS(nm || "Anonymous", sc, tc, badges); setBd(b);
          const i = b.findIndex(e => e.name === (nm || "Anonymous") && e.score === sc);
          const rank = i >= 0 ? i + 1 : null;
          setMr(rank); setMyBadges(await calcBadges(stats, rank)); setScr("end"); setTimeout(() => Au.p("win"), 500);
        } else if (dailyMode) {
          const db = await saveDailyS(nm || "Anonymous", sc, tc); setDailyBd(db);
          await Storage.set("sinister-daily", new Date().toISOString().slice(0,10)); setDailyDone(true);
          setDailyMode(false);
          const stats2 = await updateBadgeStats({ gamesPlayed: 1, correctAnswers: tc, perfectGames: tc === 50 ? 1 : 0 });
          const badges2 = await calcBadges(stats2, null);
          const b = await saveS(nm || "Anonymous", sc, tc, badges2); setBd(b);
          const i = b.findIndex(e => e.name === (nm || "Anonymous") && e.score === sc);
          const rank = i >= 0 ? i + 1 : null;
          setMr(rank); setMyBadges(await calcBadges(stats2, rank)); setScr("end"); setTimeout(() => Au.p("win"), 500);
        } else {
          const stats3 = await updateBadgeStats({ gamesPlayed: 1, correctAnswers: tc, perfectGames: tc === 50 ? 1 : 0 });
          const badges3 = await calcBadges(stats3, null);
          const b = await saveS(nm || "Anonymous", sc, tc, badges3); setBd(b);
          const i = b.findIndex(e => e.name === (nm || "Anonymous") && e.score === sc);
          const rank = i >= 0 ? i + 1 : null;
          setMr(rank); setMyBadges(await calcBadges(stats3, rank)); setScr("end"); setTimeout(() => Au.p("win"), 500);
        }
      } else {
        const next = rd + 1;
        const perfectBonus = roundWrong === 0 ? 500 * rd : 0;
        if (perfectBonus > 0) { setSc(v => { const nv = v + perfectBonus; scRef.current = nv; return nv; }); }
        setRoundSummary({round: rd, correct: tc - (tc - rqs.filter((_,i) => i < qi).length), wrong: roundWrong, score: sc, perfect: perfectBonus > 0, bonus: perfectBonus, next});
        if (perfectBonus > 0) { await updateBadgeStats({ perfectRounds: 1 }); }
        await loadQs(next);
        setTimeout(() => Au.p("round"), 300);
      }
    } else { setQi(q => q + 1); setSl(null); slRef.current = null; setSh(false); setWasRight(false); wasRightRef.current = false; setTm(mt); setFx(null); }
  };

  const isOk = sh && sl === cq?.a;
  const cd = {background:"transparent",border:"1px solid rgba(204,34,0,0.7)",borderRadius:14,boxShadow:"0 0 12px rgba(204,34,0,0.5), 0 0 30px rgba(204,34,0,0.2)"};
  const b1 = {padding:"14px 0",background:"transparent",color:"#cc2200",border:"1px solid rgba(204,34,0,0.7)",borderRadius:12,fontSize:16,fontFamily:"'Cinzel',serif",letterSpacing:5,textTransform:"uppercase",width:"100%",maxWidth:300,boxShadow:"0 0 12px rgba(204,34,0,0.4)"};
  const b2 = {padding:"10px 20px",background:"transparent",border:"1px solid rgba(204,34,0,0.7)",borderRadius:10,color:"#e8ddd4",fontSize:18,fontFamily:"'Cinzel',serif",letterSpacing:2,boxShadow:"0 0 12px rgba(204,34,0,0.4)"};

  // Early returns for full-screen game screens — must be outside main wrapper to avoid overflow:hidden clipping
  // v39: wrapped in MiniGameErrorBoundary so a crash in any mini-game shows a graceful fallback instead of white-screening the app
  if (scr === "campblood") { const exit = () => { Au.p("close"); navTo("minigames"); }; return <MiniGameErrorBoundary onExit={exit}><CampBlood onExit={exit} onHighScore={(s) => { setCbScore(Math.max(cbScore, s)); submitMiniScore("camp-blood", s); }} highScore={cbScore} /></MiniGameErrorBoundary>; }
  if (scr === "trickortreat") { const exit = () => { Au.p("close"); navTo("minigames"); }; return <MiniGameErrorBoundary onExit={exit}><TrickOrTreatMassacre onExit={exit} onHighScore={(s) => { setTotScore(Math.max(totScore, s)); submitMiniScore("trick-or-treat", s); }} highScore={totScore} /></MiniGameErrorBoundary>; }
  if (scr === "slashersearch") { const exit = () => { Au.p("close"); navTo("minigames"); }; return <MiniGameErrorBoundary onExit={exit}><SlasherSearch onExit={exit} /></MiniGameErrorBoundary>; }
  if (scr === "sinistercrossword") { const exit = () => { Au.p("close"); navTo("minigames"); }; return <MiniGameErrorBoundary onExit={exit}><SinisterCrossword onExit={exit} /></MiniGameErrorBoundary>; }
  if (scr === "slashersmash") { const exit = () => { Au.p("close"); navTo("minigames"); }; return <MiniGameErrorBoundary onExit={exit}><SlasherBreakout onExit={exit} onHighScore={(s) => { setSbScore(Math.max(sbScore, s)); submitMiniScore("slasher-smash", s); }} highScore={sbScore} /></MiniGameErrorBoundary>; }
  if (scr === "slaughtership") { const exit = () => { Au.p("close"); navTo("minigames"); }; return <MiniGameErrorBoundary onExit={exit}><Slaughtership onExit={exit} savedName={nm} onMatchWin={recordSlaughtershipWin} /></MiniGameErrorBoundary>; }
  if (scr === "slashermystery") { const exit = () => { Au.p("close"); navTo("minigames"); }; return <MiniGameErrorBoundary onExit={exit}><SlasherMystery onExit={exit} savedName={nm} onWin={recordMysteryWin} /></MiniGameErrorBoundary>; }
  if (scr === "dreadwords") { const exit = () => { Au.p("close"); setAutoJoinDreadCode(null); /* clear ?dread= so it doesn't re-trigger */ try { if (typeof window !== "undefined" && window.history && window.history.replaceState) { window.history.replaceState({}, "", window.location.pathname); } } catch(e){} navTo("minigames"); }; return <MiniGameErrorBoundary onExit={exit}><DreadWords onExit={exit} savedName={nm} onMatchWin={recordDreadWordsWin} autoJoinCode={autoJoinDreadCode} /></MiniGameErrorBoundary>; }
  if (scr === "minigames") return (
    <div style={{position:"fixed",inset:0,background:"#080808",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Cinzel',serif"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <button onClick={() => { Au.p("close"); navTo("title"); }} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.25)",borderRadius:8,color:"rgba(255,255,255,0.6)",fontSize:11,letterSpacing:2,padding:"6px 12px",cursor:"pointer"}}>← BACK</button>
        <div style={{color:"rgba(255,80,80,0.9)",fontSize:12,letterSpacing:4}}>MINI GAMES</div>
        <div style={{width:60}} />
      </div>
      <div style={{textAlign:"center",padding:"80px 24px 24px",width:"100%",maxWidth:360}}>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.95)",letterSpacing:4,marginBottom:28}}>CHOOSE YOUR NIGHTMARE</div>
        <div style={{display:"flex",flexDirection:"column",gap:14,width:"100%"}}>

          <button onClick={() => { Au.p("continue"); Hap.light(); navTo("trickortreat"); }} style={{width:"100%",padding:"20px 0",background:"transparent",border:"1px solid rgba(255,140,30,0.5)",borderRadius:14,color:"#ff8c1a",fontFamily:"'Cinzel',serif",fontSize:14,letterSpacing:4,textTransform:"uppercase",cursor:"pointer",position:"relative",textAlign:"center"}}>
            <span style={{fontSize:22,position:"absolute",left:18,top:"50%",transform:"translateY(-50%)"}}>🎃</span>
            <div>TRICK OR TREAT</div>
            <div style={{fontSize:10,letterSpacing:2,color:"rgba(255,255,255,0.95)",marginTop:3}}>HALLOWEEN MATCH 3</div>
            <div style={{fontSize:11,letterSpacing:1,color:"#ffd700",marginTop:5,fontFamily:"'Cinzel',serif",fontWeight:600,letterSpacing:2}}>👑 {miniLbTops["trick-or-treat"] ? `${miniLbTops["trick-or-treat"].name} — ${miniLbTops["trick-or-treat"].score}` : "No champion yet"}</div>
          </button>
          <button onClick={() => { Au.p("continue"); Hap.light(); navTo("dreadwords"); }} style={{width:"100%",padding:"20px 0",background:"transparent",border:"1px solid rgba(160,32,240,0.5)",borderRadius:14,color:"#c060ff",fontFamily:"'Cinzel',serif",fontSize:14,letterSpacing:4,textTransform:"uppercase",cursor:"pointer",position:"relative",textAlign:"center"}}>
            <span style={{fontSize:22,position:"absolute",left:18,top:"50%",transform:"translateY(-50%)"}}>📜</span>
            <div>DREAD WORDS</div>
            <div style={{fontSize:10,letterSpacing:2,color:"rgba(255,255,255,0.95)",marginTop:3}}>VS LIVE OR BOTS</div>
            <div style={{fontSize:11,letterSpacing:1,color:"#ffd700",marginTop:5,fontFamily:"'Cinzel',serif",fontWeight:600,letterSpacing:2}}>👑 {miniLbTops["dread-words"] ? `${miniLbTops["dread-words"].name} — ${miniLbTops["dread-words"].score} WIN${miniLbTops["dread-words"].score===1?"":"S"}` : "No champion yet"}</div>
          </button>
          <button onClick={() => { Au.p("continue"); Hap.light(); navTo("slashersmash"); }} style={{width:"100%",padding:"20px 0",background:"transparent",border:"1px solid rgba(255,150,0,0.5)",borderRadius:14,color:"#ffaa44",fontFamily:"'Cinzel',serif",fontSize:14,letterSpacing:4,textTransform:"uppercase",cursor:"pointer",position:"relative",textAlign:"center"}}>
            <span style={{fontSize:22,position:"absolute",left:18,top:"50%",transform:"translateY(-50%)"}}>💀</span>
            <div>SLASHER SMASH</div>
            <div style={{fontSize:10,letterSpacing:2,color:"rgba(255,255,255,0.95)",marginTop:3}}>BRICK BREAKER VS THE SLASHERS</div>
            <div style={{fontSize:11,letterSpacing:1,color:"#ffd700",marginTop:5,fontFamily:"'Cinzel',serif",fontWeight:600,letterSpacing:2}}>👑 {miniLbTops["slasher-smash"] ? `${miniLbTops["slasher-smash"].name} — ${miniLbTops["slasher-smash"].score}` : "No champion yet"}</div>
          </button>
          <button onClick={() => { Au.p("continue"); Hap.light(); navTo("slashersearch"); }} style={{width:"100%",padding:"20px 0",background:"transparent",border:"1px solid rgba(255,80,80,0.5)",borderRadius:14,color:"#ff5050",fontFamily:"'Cinzel',serif",fontSize:14,letterSpacing:4,textTransform:"uppercase",cursor:"pointer",position:"relative",textAlign:"center"}}>
            <span style={{fontSize:22,position:"absolute",left:18,top:"50%",transform:"translateY(-50%)"}}>🔍</span>
            <div>SLASHER SEARCH</div>
            <div style={{fontSize:10,letterSpacing:2,color:"rgba(255,255,255,0.95)",marginTop:3}}>HORROR WORD HUNT</div>
          </button>
          <button onClick={() => { Au.p("continue"); Hap.light(); navTo("sinistercrossword"); }} style={{width:"100%",padding:"20px 0",background:"transparent",border:"1px solid rgba(255,80,80,0.5)",borderRadius:14,color:"#ff5050",fontFamily:"'Cinzel',serif",fontSize:14,letterSpacing:4,textTransform:"uppercase",cursor:"pointer",position:"relative",textAlign:"center"}}>
            <span style={{fontSize:22,position:"absolute",left:18,top:"50%",transform:"translateY(-50%)"}}>🩸</span>
            <div>SINISTER SUNDAY</div>
            <div style={{fontSize:10,letterSpacing:2,color:"rgba(255,255,255,0.95)",marginTop:3}}>WEEKLY HORROR CROSSWORD</div>
          </button>
          <button onClick={() => { Au.p("continue"); Hap.light(); navTo("slashermystery"); }} style={{width:"100%",padding:"20px 0",background:"transparent",border:"1px solid rgba(220,170,40,0.5)",borderRadius:14,color:"#ddbb44",fontFamily:"'Cinzel',serif",fontSize:14,letterSpacing:4,textTransform:"uppercase",cursor:"pointer",position:"relative",textAlign:"center"}}>
            <span style={{fontSize:22,position:"absolute",left:18,top:"50%",transform:"translateY(-50%)"}}>🔍</span>
            <div>SLASHER MYSTERY</div>
            <div style={{fontSize:10,letterSpacing:2,color:"rgba(255,255,255,0.95)",marginTop:3}}>WHO. WHERE. WITH WHAT.</div>
            <div style={{fontSize:11,letterSpacing:1,color:"#ffd700",marginTop:5,fontFamily:"'Cinzel',serif",fontWeight:600,letterSpacing:2}}>👑 {miniLbTops["slasher-mystery"] ? `${miniLbTops["slasher-mystery"].name} — ${miniLbTops["slasher-mystery"].score} WIN${miniLbTops["slasher-mystery"].score===1?"":"S"}` : "No champion yet"}</div>
          </button>
          <button onClick={() => { Au.p("continue"); Hap.light(); navTo("campblood"); }} style={{width:"100%",padding:"20px 0",background:"transparent",border:"1px solid rgba(80,140,80,0.4)",borderRadius:14,color:"#88bb88",fontFamily:"'Cinzel',serif",fontSize:14,letterSpacing:4,textTransform:"uppercase",cursor:"pointer",position:"relative",textAlign:"center"}}>
            <span style={{fontSize:22,position:"absolute",left:18,top:"50%",transform:"translateY(-50%)"}}>🏕️</span>
            <div>CAMP BLOOD</div>
            <div style={{fontSize:10,letterSpacing:2,color:"rgba(255,255,255,0.95)",marginTop:3}}>TEXT ADVENTURE — ESCAPE JASON</div>
            <div style={{fontSize:11,letterSpacing:1,color:"#ffd700",marginTop:5,fontFamily:"'Cinzel',serif",fontWeight:600,letterSpacing:2}}>👑 {miniLbTops["camp-blood"] ? `${miniLbTops["camp-blood"].name} — ${miniLbTops["camp-blood"].score}` : "No champion yet"}</div>
          </button>

        </div>
      </div>
    </div>
  );

  return (
    <div style={{width:"100%",height:"100vh",color:"#fff",position:"relative",overflow:"hidden",fontFamily:"'Inter',sans-serif"}}>
      <style>{`@import url('https://fonts.bunny.net/css?family=jolly-lodger:400|cinzel-decorative:700,900|cinzel:400,600,700|inter:300,400,500&display=swap');*{box-sizing:border-box;margin:0;padding:0}body{background:#000}@keyframes fi{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes pR{0%,100%{text-shadow:0 0 15px rgba(230,20,0,0.3)}50%{text-shadow:0 0 40px rgba(230,20,0,0.7),0 0 80px rgba(180,10,0,0.2)}}@keyframes sk2{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}@keyframes fl{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}@keyframes wave{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}@keyframes cD{0%{transform:translateX(-60%)}100%{transform:translateX(100%)}}@keyframes cD2{0%{transform:translateX(100%)}100%{transform:translateX(-60%)}}@keyframes mR{0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(-80px) scale(2.5);opacity:0}}@keyframes mF{0%{opacity:1}100%{opacity:0}}@keyframes sB{0%{scale:0;opacity:0}60%{scale:1.3;opacity:1}100%{scale:1;opacity:0.8}}@keyframes sF{0%{opacity:1}60%{opacity:0.8}100%{opacity:0}}@keyframes tP{0%,100%{opacity:1}50%{opacity:0.5}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes emb{0%{transform:translateY(0) scale(1);opacity:0}10%{opacity:1}60%{opacity:0.6}100%{transform:translateY(-100vh) scale(0);opacity:0}}@keyframes glow{0%,100%{filter:drop-shadow(0 0 10px rgba(255,255,255,0.7)) drop-shadow(0 0 25px rgba(220,230,255,0.4)) drop-shadow(0 0 50px rgba(200,215,255,0.2))}50%{filter:drop-shadow(0 0 18px rgba(255,255,255,1)) drop-shadow(0 0 45px rgba(220,230,255,0.7)) drop-shadow(0 0 90px rgba(200,215,255,0.4))}}@keyframes ltFade{0%{opacity:0.7}100%{opacity:0}}@keyframes rtIn{0%{opacity:0;transform:scale(1.08)}60%{opacity:1;transform:scale(1)}100%{opacity:1;transform:scale(1)}}@keyframes bloodDrip{0%{transform:scaleY(0);transform-origin:top}100%{transform:scaleY(1);transform-origin:top}}@keyframes batWing{0%,100%{transform:scaleY(1)}50%{transform:scaleY(-0.5)}}@keyframes bat0{0%{transform:translate(0px,0px) rotate(-5deg)}25%{transform:translate(-18px,-12px) rotate(3deg)}50%{transform:translate(-8px,-22px) rotate(-8deg)}75%{transform:translate(10px,-10px) rotate(4deg)}100%{transform:translate(0px,0px) rotate(-5deg)}}@keyframes bat1{0%{transform:translate(0px,0px) rotate(8deg)}25%{transform:translate(14px,-16px) rotate(-4deg)}50%{transform:translate(20px,-8px) rotate(10deg)}75%{transform:translate(6px,6px) rotate(-6deg)}100%{transform:translate(0px,0px) rotate(8deg)}}@keyframes bat2{0%{transform:translate(0px,0px) rotate(-12deg)}25%{transform:translate(-12px,8px) rotate(6deg)}50%{transform:translate(4px,-18px) rotate(-3deg)}75%{transform:translate(16px,-4px) rotate(9deg)}100%{transform:translate(0px,0px) rotate(-12deg)}}@keyframes bonusPop{0%{opacity:0;transform:translateY(0) scale(0.5)}20%{opacity:1;transform:translateY(-10px) scale(1.2)}80%{opacity:1;transform:translateY(-40px) scale(1)}100%{opacity:0;transform:translateY(-60px) scale(0.8)}}@keyframes answerPop{0%{transform:scale(1)}40%{transform:scale(1.03)}100%{transform:scale(1)}}@keyframes answerShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}@keyframes skullPop{0%{transform:scale(1)}30%{transform:scale(1.6)}60%{transform:scale(0.9)}100%{transform:scale(1.1)}}@keyframes killFeed{0%{opacity:0;transform:translateX(20px)}15%{opacity:1;transform:translateX(0)}75%{opacity:1}100%{opacity:0;transform:translateX(-10px)}}@keyframes redPulse{0%,100%{box-shadow:inset 0 0 40px rgba(210,20,0,0.3)}50%{box-shadow:inset 0 0 80px rgba(210,20,0,0.7)}}@keyframes bigShake{0%,100%{transform:translate(0,0)}10%{transform:translate(-8px,4px)}20%{transform:translate(8px,-4px)}30%{transform:translate(-6px,6px)}40%{transform:translate(6px,-2px)}50%{transform:translate(-4px,4px)}60%{transform:translate(4px,-6px)}70%{transform:translate(-6px,2px)}80%{transform:translate(6px,4px)}90%{transform:translate(-2px,-4px)}}@keyframes btnPulse1{0%,100%{box-shadow:0 0 0px rgba(204,34,0,0)}15%{box-shadow:0 0 18px rgba(204,34,0,0.9),0 0 35px rgba(204,34,0,0.4)}30%,70%{box-shadow:0 0 0px rgba(204,34,0,0)}}@keyframes btnPulse2{0%,100%{box-shadow:0 0 0px rgba(255,255,255,0)}35%{box-shadow:0 0 18px rgba(255,255,255,0.9),0 0 35px rgba(255,255,255,0.5)}50%,70%{box-shadow:0 0 0px rgba(255,255,255,0)}}@keyframes fireGlow{0%,100%{opacity:0.8;transform:scaleX(1)}50%{opacity:1;transform:scaleX(1.05)}}@keyframes btnPulse3{0%,100%{box-shadow:0 0 0px rgba(255,255,255,0)}55%{box-shadow:0 0 18px rgba(255,255,255,0.9),0 0 35px rgba(255,255,255,0.5)}70%,85%{box-shadow:0 0 0px rgba(255,255,255,0)}}button{cursor:pointer;transition:all 0.15s}button:active{transform:scale(0.96)!important}:root{--sab:env(safe-area-inset-bottom,0px)}`}</style>

            {/* Background */}
      <div style={{position:"fixed",inset:0,zIndex:0,background:"#000"}} />

      {fx === "m" && <Mist />}

      {/* ADMIN SCREEN */}
      {adminMode && (
        <div style={{position:"fixed",inset:0,zIndex:999,background:"rgba(0,0,0,0.97)",overflow:"auto",padding:"20px",fontFamily:"monospace"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div style={{color:"#cc2200",fontSize:18,letterSpacing:3}}>🚩 FLAGGED QUESTIONS ({adminReports.length})</div>
            <button onClick={() => setAdminMode(false)} style={{background:"rgba(180,15,5,0.5)",border:"1px solid #cc2200",borderRadius:8,color:"#fff",padding:"6px 16px",cursor:"pointer",fontFamily:"monospace"}}>Close</button>
          </div>
          <button onClick={() => {
            const text = adminReports.map((r,i) => `${i+1}. Q: ${r.q}\n   Options: ${r.a?.join(" | ")}\n   Correct index: ${r.correct}\n   Date: ${r.d}`).join("\n\n");
            navigator.clipboard.writeText(text).then(() => alert("Copied to clipboard!"));
          }} style={{background:"rgba(0,100,0,0.5)",border:"1px solid green",borderRadius:8,color:"#0f0",padding:"8px 20px",cursor:"pointer",fontFamily:"monospace",marginBottom:16,display:"block"}}>
            📋 Copy All to Clipboard
          </button>
          {adminReports.length === 0 ? (
            <div style={{color:"#666"}}>No flagged questions yet.</div>
          ) : adminReports.map((r, i) => (
            <div key={i} style={{marginBottom:16,padding:"12px",background:"rgba(255,255,255,0.05)",borderRadius:8,border:"1px solid rgba(255,255,255,0.1)"}}>
              <div style={{color:"#e8e0d4",fontSize:13,marginBottom:6}}><span style={{color:"#cc2200"}}>#{i+1}</span> {r.q}</div>
              {r.a?.map((opt, j) => (
                <div key={j} style={{color: j === r.correct ? "#22c55e" : "#666",fontSize:11,marginLeft:12}}>
                  {j === r.correct ? "✓" : " "} {j}: {opt}
                </div>
              ))}
              <div style={{color:"#444",fontSize:10,marginTop:4}}>{r.d}</div>
            </div>
          ))}
        </div>
      )}
      {fx === "b" && <Splat />}
      
      {roundTransition && (
        <div style={{position:"fixed",inset:0,zIndex:90,background:"rgba(0,0,0,0.92)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",animation:"rtIn 0.4s ease-out"}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:18,letterSpacing:6,color:"rgba(210,20,0,0.7)",textTransform:"uppercase",marginBottom:8}}>Entering</div>
          <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:38,letterSpacing:4,color:"#fff",textShadow:"0 0 40px rgba(245,30,0,0.7)",animation:"pR 1s ease-in-out infinite"}}>{RN[rd]}</div>
          <div style={{width:60,height:1,background:"linear-gradient(90deg,transparent,#cc2200,transparent)",margin:"14px 0"}} />
          <div style={{fontFamily:"'Inter',sans-serif",fontSize:18,color:"rgba(245,30,0,0.5)",letterSpacing:3}}>{"☠".repeat(rd+1)}</div>
        </div>
      )}

      {/* ── MINI GAMES MENU ── */}
      {scr === "minigames" && (
        <div style={{position:"fixed",inset:0,background:"#080808",zIndex:200,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Cinzel',serif"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <button onClick={() => { Au.p("close"); navTo("title"); }} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.25)",borderRadius:8,color:"rgba(255,255,255,0.6)",fontSize:11,letterSpacing:2,padding:"6px 12px",cursor:"pointer"}}>← BACK</button>
            <div style={{color:"rgba(255,80,80,0.9)",fontSize:12,letterSpacing:4}}>MINI GAMES</div>
            <div style={{width:60}} />
          </div>
          <div style={{textAlign:"center",padding:24,width:"100%",maxWidth:360}}>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.95)",letterSpacing:4,marginBottom:28}}>CHOOSE YOUR NIGHTMARE</div>
            <div style={{display:"flex",flexDirection:"column",gap:14,width:"100%"}}>
              <button onClick={() => { Au.p("continue"); Hap.light(); navTo("slashersmash"); }} style={{width:"100%",padding:"20px 0",background:"transparent",border:"1px solid rgba(255,150,0,0.5)",borderRadius:14,color:"#ffaa44",fontFamily:"'Cinzel',serif",fontSize:14,letterSpacing:4,textTransform:"uppercase",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:12}}>
                <span style={{fontSize:22}}>💀</span>
                <div style={{textAlign:"center"}}>
                  <div>SLASHER SMASH</div>
                  <div style={{fontSize:10,letterSpacing:2,color:"rgba(255,255,255,0.95)",marginTop:3}}>SMASH FREDDY JASON MICHAEL AND MORE</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
      {scr === "slashersmash" && <SlasherBreakout onExit={() => { Au.p("close"); navTo("minigames"); }} onHighScore={(s) => setSbScore(Math.max(sbScore, s))} highScore={sbScore} />}

      <div style={{width:"100%",maxWidth:420,height:"100vh",display:"flex",flexDirection:"column",position:"relative",zIndex:3,padding:"0 22px 90px",margin:"0 auto",overflow:"hidden"}}>

        {/* RISING EMBERS */}
      <Embers />

      {/* TITLE SCREEN */}
        {scr === "title" && (
          <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",textAlign:"center",gap:16,animation:"fi 0.9s ease-out",padding:"24px 24px 160px"}}>

            {/* ── LOGO BLOCK ── */}
            <div style={{marginBottom:8,display:"flex",flexDirection:"column",alignItems:"center"}}>
              <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:96,letterSpacing:6,color:"#e8ddd4",textShadow:"0 0 30px rgba(245,30,0,0.6),0 0 60px rgba(210,20,0,0.3),4px 5px 0px rgba(0,0,0,1)",lineHeight:1,filter:"drop-shadow(0 0 20px rgba(245,30,0,0.6)) drop-shadow(0 0 50px rgba(210,20,0,0.3))"}}>Horror Trivia</div>
              <div style={{fontFamily:"'Inter',sans-serif",fontWeight:500,fontSize:11,letterSpacing:6,color:"#ff2200",textTransform:"uppercase",marginTop:6,textShadow:"0 0 10px rgba(245,30,0,0.5),4px 5px 0px rgba(0,0,0,1)"}}>Slasher Edition</div>
              <div style={{fontFamily:"'Inter',sans-serif",fontWeight:400,fontSize:9,letterSpacing:3,color:"#ffffff",textTransform:"uppercase",marginTop:4,display:"flex",alignItems:"center"}}>By Siniste<span style={{display:"inline-block",transform:"scaleX(-1)",letterSpacing:0}}>r</span></div>
            </div>

            {/* ── MIDDLE CONTENT BOX ── */}
            <div style={{width:"100%",maxWidth:320,border:"1px solid rgba(204,34,0,0.7)",borderRadius:16,padding:"24px 20px",boxShadow:"0 0 12px rgba(204,34,0,0.5), 0 0 30px rgba(204,34,0,0.2)",display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>

              {/* ── NAME INPUT ── */}
              <input
                value={nm}
                onChange={e => { const v = e.target.value; if (containsProfanity(v)) return; setNm(v); nmRef.current = v; Storage.set("sinister-name", v); Au.p("type"); }}
                placeholder="Enter your name..."
                maxLength={20}
                style={{width:"100%",padding:"12px 16px",background:"rgba(0,0,0,0.6)",border:"1px solid rgba(180,30,30,0.35)",borderRadius:10,color:"#e8ddd4",fontFamily:"'Inter',sans-serif",fontWeight:400,fontSize:17,textAlign:"center",outline:"none",letterSpacing:1.5}}
              />

              {/* Begin the Nightmare */}
              <button onClick={go} style={{...b1,width:"100%",padding:"20px 0",lineHeight:1.2,flexDirection:"column",display:"flex",alignItems:"center",justifyContent:"center",animation:"btnPulse1 3s ease-in-out infinite"}}>
                <span style={{display:"block",fontSize:13,letterSpacing:6}}>BEGIN THE</span>
                <span style={{display:"block",fontSize:20,letterSpacing:6}}>NIGHTMARE</span>
              </button>

              {/* Mini Games + VS Mode side by side */}
              <div style={{display:"flex",gap:12,width:"100%"}}>
                <button
                  onClick={() => { Au.p("continue"); Hap.light(); navTo("minigames"); }}
                  style={{flex:1,padding:"18px 0",background:"transparent",border:"1px solid rgba(255,80,80,0.5)",borderRadius:12,color:"#ff8080",fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:3,textTransform:"uppercase",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,animation:"btnPulse2 3s ease-in-out infinite"}}>
                  <span style={{fontSize:14}}>🎮</span>
                  <span>Mini</span>
                  <span>Games</span>
                </button>
                <button onClick={() => { Au.p("continue"); Hap.light(); setScr("vs"); }} style={{flex:1,padding:"18px 0",background:"transparent",border:"1px solid rgba(255,255,255,0.5)",borderRadius:12,color:"#ffffff",fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:3,textTransform:"uppercase",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,animation:"btnPulse3 3s ease-in-out infinite"}}>
                  <span style={{fontSize:14}}>⚔️</span>
                  <span>VS</span>
                  <span>Mode</span>
                </button>
              </div>

            </div>{/* end middle content box */}

            {/* ── HORROR MASTER CHALLENGE ── */}
            {topPlayer && (
              <div style={{textAlign:"center",marginTop:16}}>
                <div style={{fontFamily:"'Inter',sans-serif",fontWeight:500,fontSize:11,letterSpacing:4,color:"#ffffff",textTransform:"uppercase",marginBottom:3,textShadow:"4px 5px 0px rgba(0,0,0,1)"}}>Current Horror Master</div>
                <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:26,letterSpacing:6,color:"#ff2200",textTransform:"uppercase",textShadow:"0 0 10px rgba(245,30,0,0.5),4px 5px 0px rgba(0,0,0,1)"}}>🔪 {topPlayer.name}{topPlayer.badges && topPlayer.badges.length > 0 && <span style={{fontSize:16,marginLeft:4}}>{topPlayer.badges.join("")}</span>} <span style={{fontSize:18,letterSpacing:2,color:"rgba(255,255,255,0.7)"}}>— {topPlayer.score}</span></div>
                <div style={{fontFamily:"'Inter',sans-serif",fontWeight:500,fontSize:11,letterSpacing:2,color:"#ffffff",textTransform:"uppercase",marginTop:5,textShadow:"4px 5px 0px rgba(0,0,0,1)"}}>Can you dethrone the Horror Master?</div>
                <button onClick={() => { Au.p("continue"); loadB().then(b => { setBd(b); }); loadVsWinsB().then(b => { setVsWinsBd(b); }); setLbTab("alltime"); navTo("bd"); }} style={{marginTop:10,background:"transparent",border:"1px solid rgba(255,255,255,0.5)",borderRadius:8,color:"rgba(255,255,255,0.9)",fontSize:10,fontFamily:"'Inter',sans-serif",letterSpacing:1,padding:"6px 18px",display:"inline-flex",alignItems:"center",gap:4,cursor:"pointer",boxShadow:"0 0 8px rgba(255,255,255,0.15)"}}>
                  <span style={{fontSize:12}}>🏆</span> Leaderboard
                </button>
                <button onClick={() => { Au.p("continue"); setShowBadges(true); }} style={{marginTop:10,background:"transparent",border:"1px solid rgba(255,255,255,0.5)",borderRadius:8,color:"rgba(255,255,255,0.9)",fontSize:10,fontFamily:"'Inter',sans-serif",letterSpacing:1,padding:"6px 18px",display:"inline-flex",alignItems:"center",gap:4,cursor:"pointer",boxShadow:"0 0 8px rgba(255,255,255,0.15)"}}>
                  <span style={{fontSize:12}}>🎖️</span> Earn Your Badges
                </button>
              </div>
            )}

          </div>
        )}

        {/* VS MODE SCREEN */}
        {/* ABOUT SCREEN */}
        {scr === "about" && (
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"40px 24px 30px",animation:"fi 0.5s",overflowY:"auto",maxHeight:"100vh",WebkitOverflowScrolling:"touch"}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:6,color:"#cc2200",textTransform:"uppercase",marginBottom:4}}>About</div>
            <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:42,color:"#e8ddd4",textShadow:"0 0 20px rgba(230,20,0,0.4)",marginBottom:4}}>Sinister</div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:13,color:"rgba(232,224,212,0.5)",letterSpacing:3,marginBottom:24}}>Horror Trivia</div>

            <div style={{width:"100%",maxWidth:340,display:"flex",flexDirection:"column",gap:16}}>

              {/* Creator */}
              <div style={{...cd,padding:"16px 20px",borderRadius:12}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:4,color:"#cc2200",textTransform:"uppercase",marginBottom:8}}>Created By</div>
                <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:28,color:"#e8ddd4"}}>Drew Krotzer</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:12,color:"rgba(232,224,212,0.5)",marginTop:4,letterSpacing:1}}>Concept, Design & Development</div>
              </div>

              {/* How To Play */}
              <div style={{...cd,padding:"16px 20px",borderRadius:12}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:4,color:"#cc2200",textTransform:"uppercase",marginBottom:12}}>How To Play</div>
                {[
                  ["5 Rounds","Each round gets harder — Casual Carnage through to Final Slaughter."],
                  ["10 Questions","Answer 10 slasher questions per round."],
                  ["Beat the Clock","Score more points the faster you answer."],
                  ["5 Wrong = Dead","Five wrong answers in a round ends your game."],
                  ["Streak Bonus","Consecutive correct answers multiply your score."],
                  ["Final Girl","Survive all 5 rounds to claim the Horror Master title."],
                ].map(([title, desc], i, arr) => (
                  <div key={i} style={{display:"flex",gap:12,padding:"7px 0",borderBottom:i<arr.length-1?"1px solid rgba(255,255,255,0.05)":"none",alignItems:"flex-start"}}>
                    <span style={{fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:9,color:"rgba(245,30,0,0.85)",letterSpacing:1,minWidth:90,paddingTop:2}}>{title}</span>
                    <span style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"rgba(210,190,175,0.85)",lineHeight:1.5}}>{desc}</span>
                  </div>
                ))}
              </div>

              {/* Music */}
              <div style={{...cd,padding:"16px 20px",borderRadius:12}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:4,color:"#cc2200",textTransform:"uppercase",marginBottom:8}}>🎵 Music</div>
                <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:24,color:"#e8ddd4"}}>CO.AG Music</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:12,color:"rgba(232,224,212,0.5)",marginTop:4,letterSpacing:1}}>Dark Ambient Background Music</div>
                <button onClick={() => window.open("https://www.youtube.com/@co.agmusic","_blank")} style={{marginTop:8,background:"transparent",border:"1px solid rgba(204,34,0,0.3)",borderRadius:8,color:"#cc2200",fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:2,padding:"6px 14px",cursor:"pointer"}}>▶ Visit Channel</button>

                <div style={{height:1,background:"rgba(204,34,0,0.2)",margin:"14px 0"}} />

                <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:24,color:"#e8ddd4"}}>Twitch Music</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:12,color:"rgba(232,224,212,0.5)",marginTop:4,letterSpacing:1}}>Mini Game Music</div>
                <button onClick={() => window.open("https://www.youtube.com/@PandaBeatsMusic","_blank")} style={{marginTop:8,background:"transparent",border:"1px solid rgba(204,34,0,0.3)",borderRadius:8,color:"#cc2200",fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:2,padding:"6px 14px",cursor:"pointer"}}>▶ Visit Channel</button>

                <div style={{height:1,background:"rgba(204,34,0,0.2)",margin:"14px 0"}} />

                <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:24,color:"#e8ddd4"}}>Dresden, The Flaming</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:12,color:"rgba(232,224,212,0.5)",marginTop:4,letterSpacing:1}}>"Dracula's Dentist" — Trick or Treat</div>
                <button onClick={() => window.open("https://open.spotify.com/artist/02GMeAkbxMT0rccZEWFj8x","_blank")} style={{marginTop:8,background:"transparent",border:"1px solid rgba(204,34,0,0.3)",borderRadius:8,color:"#cc2200",fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:2,padding:"6px 14px",cursor:"pointer"}}>▶ Spotify</button>
              </div>

              {/* Version */}
              <div style={{...cd,padding:"16px 20px",borderRadius:12}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:4,color:"#cc2200",textTransform:"uppercase",marginBottom:8}}>Version</div>
                <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:24,color:"#e8ddd4"}}>Version 1.3</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:12,color:"rgba(232,224,212,0.5)",marginTop:4,letterSpacing:1}}>2,850 Questions · 5 Difficulty Levels</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:11,color:"rgba(232,224,212,0.3)",marginTop:2,letterSpacing:1}}>VS Mode · VS Wins Leaderboard · Global Rankings</div>
              </div>

              {/* Copyright */}
              <div style={{...cd,padding:"16px 20px",borderRadius:12}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:4,color:"#cc2200",textTransform:"uppercase",marginBottom:8}}>Copyright</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:12,color:"rgba(232,224,212,0.5)",lineHeight:1.7,letterSpacing:1}}>
                  © 2026 Drew Krotzer. All rights reserved.{"\n"}
                  All film titles, characters and franchises referenced are the property of their respective owners. This app is an independent fan project.
                </div>
              </div>

              {/* YouTube */}
              <button onClick={() => window.open("https://www.youtube.com/@sinistervids71","_blank")} style={{...cd,padding:"14px 20px",borderRadius:12,border:"1px solid rgba(204,34,0,0.4)",color:"#cc2200",fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:3,textTransform:"uppercase",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                <span>▶</span> Watch on YouTube
              </button>

            </div>

            <button onClick={() => { Au.p("close"); setScr(prevScr && prevScr !== "about" ? prevScr : "title"); }} style={{...b2,marginTop:20,fontSize:13,padding:"10px 24px",color:"#ffffff",border:"1px solid #ffffff"}}>{prevScr === "game" ? "← Back to Game" : "Run Home"}</button>
          </div>
        )}

        {scr === "vs" && (
          <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",padding:"0 24px",gap:16,animation:"fi 0.5s"}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:14,letterSpacing:6,color:"#cc2200",textTransform:"uppercase"}}>⚔️ VS Mode</div>
            <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:36,color:"#e8e0d4",textShadow:"0 0 20px rgba(230,20,0,0.4)",textAlign:"center"}}>Head to Head</div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:14,color:"rgba(232,224,212,0.5)",textAlign:"center",letterSpacing:1}}>10 questions · same time · live scores</div>
            <div style={{width:"100%",height:1,background:"linear-gradient(90deg,transparent,#cc2200,transparent)",margin:"4px 0"}} />

            {vsStatus === "waiting" ? (
              <div style={{textAlign:"center",gap:12,display:"flex",flexDirection:"column",alignItems:"center"}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:14,color:"rgba(232,224,212,0.6)",letterSpacing:2}}>Share this code with your opponent:</div>
                <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:64,color:"#cc2200",letterSpacing:12,textShadow:"0 0 30px rgba(210,20,0,0.6)"}}>{vsCode}</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:13,color:"rgba(232,224,212,0.4)",letterSpacing:2,animation:"tP 1.5s infinite"}}>Waiting for opponent to join...</div>
                <button onClick={() => { if (vsWaitRef.current) { vsWaitRef.current(); vsWaitRef.current = null; } if (vsCode) cancelRoom(vsCode); setVsStatus("idle"); setVsCode(""); }} style={{...b2,marginTop:8,fontSize:13,padding:"10px 24px"}}>Cancel</button>
              </div>
            ) : vsStatus === "creating" ? (
              <div style={{fontFamily:"'Cinzel',serif",fontSize:14,color:"rgba(232,224,212,0.5)",letterSpacing:2,animation:"tP 1.5s infinite"}}>Creating room...</div>
            ) : (
              <>
                <div style={{width:"100%",maxWidth:300,display:"flex",flexDirection:"column",gap:10}}>
                  <button onClick={goCreateVs} style={{...b1,fontSize:16,padding:"14px 0",width:"100%",letterSpacing:4}}>⚔️ Create Match</button>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:11,color:"rgba(232,224,212,0.4)",textAlign:"center",letterSpacing:2}}>You get a 4-digit code to share</div>
                </div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:13,color:"rgba(232,224,212,0.3)",letterSpacing:3}}>— OR —</div>
                <div style={{width:"100%",maxWidth:300,display:"flex",flexDirection:"column",gap:10}}>
                  <input
                    value={vsCodeInput}
                    onChange={e => setVsCodeInput(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE"
                    maxLength={4}
                    style={{background:"rgba(0,0,0,0.4)",border:"1px solid rgba(210,40,40,0.4)",borderRadius:10,color:"#e8e0d4",fontFamily:"'Cinzel',serif",fontSize:24,letterSpacing:8,padding:"12px 16px",textAlign:"center",outline:"none",width:"100%"}}
                  />
                  <button onClick={goJoinVs} style={{...b1,fontSize:16,padding:"14px 0",width:"100%",letterSpacing:4,background:"rgba(80,0,0,0.6)"}}>Join Match</button>
                </div>
                <button onClick={() => { Au.p("click"); setVsStatus("idle"); setScr("title"); }} style={{...b2,marginTop:8,fontSize:13,padding:"10px 24px"}}>Run Home</button>
              </>
            )}
          </div>
        )}

        {/* LEADERBOARD */}
        {scr === "bd" && (
          <div style={{flex:1,display:"flex",flexDirection:"column",paddingTop:60,paddingBottom:30,animation:"fi 0.6s",overflowY:"auto",maxHeight:"100vh",WebkitOverflowScrolling:"touch"}}>
            <h2 style={{fontFamily:"'Cinzel Decorative',serif",fontSize:28,letterSpacing:4,textAlign:"center",animation:"pR 3s ease-in-out infinite",color:"#e8e0d4"}}>🏆 Leaderboard</h2>
            <div style={{width:50,height:1,background:"linear-gradient(90deg,transparent,#cc2200,transparent)",margin:"10px auto 18px"}} />

            {/* Tabs */}
            <div style={{display:"flex",justifyContent:"center",gap:12,marginBottom:18}}>
              {[["alltime","⚔️ All Time"],["vs","⚔️ VS Wins"]].map(([key,label]) => (
                <button key={key} onClick={() => { Au.p("continue"); setLbTab(key); if (key === "vs") loadVsWinsB().then(b => setVsWinsBd(b)); }} style={{padding:"10px 28px",fontFamily:"'Cinzel',serif",fontSize:14,letterSpacing:3,textTransform:"uppercase",borderRadius:10,border:`1px solid ${lbTab===key?"#cc2200":"rgba(180,30,30,0.25)"}`,background:lbTab===key?"rgba(180,15,5,0.5)":"rgba(0,0,0,0.3)",color:lbTab===key?"#e8e0d4":"#666",cursor:"pointer",transition:"all 0.2s"}}>
                  {label}
                </button>
              ))}
            </div>

            {/* All Time Board */}
            {lbTab === "alltime" && (
              bd.length === 0
                ? <p style={{textAlign:"center",color:"#555",fontSize:18,marginTop:30}}>No scores yet!</p>
                : <div style={{display:"flex",flexDirection:"column",gap:3}}>
                    {bd.slice(0,20).map((e,i) => (
                      <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",borderRadius:10,...cd,animation:`fi 0.3s ease-out ${i*0.04}s both`,border:i===0?"1px solid rgba(255,215,0,0.25)":"1px solid transparent"}}>
                        <span style={{fontFamily:"'Cinzel',serif",fontSize:18,width:32,color:i===0?"#ffd700":i===1?"#c0c0c0":i===2?"#cd7f32":"#555",textAlign:"center"}}>{i===0?"🔪":i+1}</span>
                        <div style={{flex:1}}>
                          <span style={{fontSize:18,fontWeight:600,color:i===0?"#ffd700":"#fff"}}>{e.name}</span>{e.badges && e.badges.length > 0 && <span style={{marginLeft:4,fontSize:13}}>{e.badges.join("")}</span>}
                          {i===0&&<div style={{fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:3,color:"rgba(255,215,0,0.6)",textTransform:"uppercase",marginTop:1}}>Horror Master</div>}
                          {e.correct>=50&&<span style={{fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:2,color:"rgba(34,197,94,0.7)",marginLeft:6}}>✓ Survived</span>}
                        </div>
                        <span style={{fontFamily:"'Inter',sans-serif",fontSize:16,color:"#22c55e"}}>{e.score}</span>
                      </div>
                    ))}
                  </div>
            )}

            {/* VS Wins Board */}
            {lbTab === "vs" && (
              <div>
                <div style={{textAlign:"center",fontFamily:"'Cinzel',serif",fontSize:13,color:"rgba(239,68,68,0.7)",letterSpacing:3,marginBottom:14,textTransform:"uppercase"}}>
                  Global Head-to-Head Rankings
                </div>
                {vsWinsBd.length === 0
                  ? <p style={{textAlign:"center",color:"#555",fontSize:18,marginTop:30}}>No VS wins yet — play a head-to-head match!</p>
                  : <div style={{display:"flex",flexDirection:"column",gap:3}}>
                      {vsWinsBd.slice(0,20).map((e,i) => (
                        <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",borderRadius:10,...cd,animation:`fi 0.3s ease-out ${i*0.04}s both`,border:i===0?"1px solid rgba(255,215,0,0.25)":"1px solid transparent"}}>
                          <span style={{fontFamily:"'Cinzel',serif",fontSize:18,width:32,color:i===0?"#ffd700":i===1?"#c0c0c0":i===2?"#cd7f32":"#555",textAlign:"center"}}>{i===0?"🔪":i+1}</span>
                          <div style={{flex:1}}>
                            <span style={{fontSize:18,fontWeight:600,color:i===0?"#ffd700":"#fff"}}>{e.name}</span>
                            {i===0&&<div style={{fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:3,color:"rgba(255,215,0,0.6)",textTransform:"uppercase",marginTop:1}}>VS Horror Master</div>}
                          </div>
                          <span style={{display:"flex",flexDirection:"column",alignItems:"flex-end",lineHeight:1.1}}>
                            <span style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:2,color:"rgba(232,224,212,0.5)",textTransform:"uppercase"}}>Wins</span>
                            <span style={{fontFamily:"'Inter',sans-serif",fontSize:16,color:"#22c55e"}}>{e.wins || 0}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                }
              </div>
            )}

            <button onClick={() => { Au.p("close"); setScr(prevScr && prevScr !== "bd" ? prevScr : "title"); }} style={{...b2,margin:"18px auto 0",color:"#ffffff",border:"1px solid #ffffff"}}>{prevScr === "game" ? "← Back to Game" : "Run Home"}</button>
          </div>
        )}

        {/* ROUND INTRO */}
        {/* ROUND SUMMARY OVERLAY */}
        {roundSummary && (
          <div style={{position:"fixed",inset:0,zIndex:100,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",textAlign:"center",background:"rgba(0,0,0,0.95)",animation:"fi 0.5s",gap:22,padding:"0 32px"}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:22,letterSpacing:6,color:"#cc2200",textTransform:"uppercase",textShadow:"0 0 15px rgba(210,20,0,0.5)"}}>Round {roundSummary.round} Complete</div>
            <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:72,color:"#e8ddd4",textShadow:"0 0 30px rgba(230,20,0,0.4)",lineHeight:1.1}}>
              {RN[roundSummary.round]}
            </div>
            <div style={{width:260,height:1,background:"linear-gradient(90deg,transparent,#cc2200,transparent)"}} />
            <div style={{display:"flex",gap:48,marginTop:8}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:60,color:"#e8ddd4",lineHeight:1.1,display:"block"}}>{10 - roundSummary.wrong}</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:16,letterSpacing:3,color:"rgba(232,224,212,0.6)",textTransform:"uppercase",marginTop:14}}>Correct</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:60,color:"#e8ddd4",lineHeight:1.1,display:"block"}}>{roundSummary.wrong}</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:16,letterSpacing:3,color:"rgba(232,224,212,0.6)",textTransform:"uppercase",marginTop:14}}>Wrong</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:60,color:"#e8ddd4",lineHeight:1.1,display:"block"}}>{roundSummary.score}</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:16,letterSpacing:3,color:"rgba(232,224,212,0.6)",textTransform:"uppercase",marginTop:14}}>Score</div>
              </div>
            </div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:20,color:"rgba(232,224,212,0.6)",letterSpacing:3,marginTop:4}}>
              {roundSummary.wrong === 0 ? "☠ PERFECT ROUND ☠" : roundSummary.wrong <= 2 ? "You survived..." : "Close call..."}
            </div>
            {roundSummary.perfect && (
              <div style={{marginTop:8,padding:"16px 32px",border:"1px solid rgba(255,215,0,0.4)",borderRadius:14,background:"rgba(255,215,0,0.08)",textAlign:"center",animation:"fi 0.5s"}}>
                <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:48,color:"#e8ddd4",textShadow:"0 0 20px rgba(255,215,0,0.6)"}}>+{roundSummary.bonus}</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:16,letterSpacing:3,color:"rgba(255,215,0,0.6)",textTransform:"uppercase",marginTop:6}}>Perfect Round Bonus</div>
              </div>
            )}
            <button onClick={() => {
              Au.p("click");
              setRoundSummary(null);
              setRd(roundSummary.next);
              setRoundTransition(true);
              setTimeout(() => { setRoundTransition(false); setScr("ri"); }, 2200);
            }} style={{...b1,marginTop:8,fontSize:18,padding:"16px 50px",letterSpacing:6}}>
              Continue →
            </button>
          </div>
        )}

        {scr === "ri" && (
          <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",textAlign:"center",gap:20,animation:"fi 0.8s",padding:"0 24px"}}>
            {loading ? (
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
                <div style={{width:50,height:50,border:"2px solid rgba(204,34,0,0.3)",borderTop:"2px solid #cc2200",borderRadius:"50%",animation:"spin 1s linear infinite"}} />
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:14,letterSpacing:4,color:"rgba(232,224,212,0.5)",textTransform:"uppercase"}}>
                  {["Sharpening the blade...","The body count rises...","No escape now...","The killer is close...","Final victim loading..."][rd-1]}
                </div>
              </div>
            ) : apiErr ? (
              <div style={{...cd,padding:"24px 20px",borderRadius:16,width:"100%",maxWidth:300,display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"#cc2200",letterSpacing:3,textTransform:"uppercase"}}>Failed to Load</div>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"#ef4444",lineHeight:1.6}}>{apiErr}</div>
                <button onClick={() => loadQs(rd)} style={{...b1,width:"100%"}}>Try Again</button>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16,width:"100%",maxWidth:300}}>
                {/* Round label */}
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:16,fontWeight:600,letterSpacing:7,color:"rgba(204,34,0,0.8)",textTransform:"uppercase",fontFamily:"'Cinzel',serif"}}>{vsMode ? "⚔️ VS Match" : dailyMode ? "Quick Match" : `Round ${rd} of 5`}</div>

                {/* Big name */}
                <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:vsMode?44:56,letterSpacing:4,color:"#e8ddd4",lineHeight:1,textShadow:"0 0 30px rgba(230,20,0,0.4),4px 5px 0px rgba(0,0,0,1)",textAlign:"center"}}>
                  {vsMode ? <>vs<br/>{vsOpponent || "Opponent"}</> : dailyMode ? "🩸" : RN[rd]}
                </div>

                {/* Difficulty */}
                {!dailyMode && !vsMode && <div style={{fontFamily:"'Inter',sans-serif",fontFamily:"'Inter',sans-serif",fontSize:13,letterSpacing:4,color:"rgba(232,224,212,0.6)",textTransform:"uppercase"}}>{DIFFICULTY_LABELS[rd-1]}</div>}

                {/* Progress pips — hidden in VS mode since VS is a single 10-Q match, not 5 rounds */}
                {!dailyMode && !vsMode && <div style={{display:"flex",gap:8}}>{[1,2,3,4,5].map(i => <div key={i} style={{width:i<=rd?24:12,height:6,borderRadius:3,background:i<rd?"#cc2200":i===rd?"#e8e0d4":"rgba(255,255,255,0.08)"}} />)}</div>}

                {/* Stats box */}
                <div style={{...cd,padding:"16px 20px",borderRadius:12,width:"100%",display:"flex",justifyContent:"space-around"}}>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontFamily:"'Cinzel',serif",fontFamily:"'Cinzel Decorative',serif",fontSize:20,color:"#e8ddd4"}}>{mt}<span style={{fontSize:"0.55em",verticalAlign:"middle"}}>s</span></div>
                    <div style={{fontFamily:"'Inter',sans-serif",fontSize:10,color:"rgba(232,224,212,0.5)",letterSpacing:2,textTransform:"uppercase",marginTop:2,fontFamily:"'Inter',sans-serif"}}>Per Q</div>
                  </div>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontFamily:"'Cinzel',serif",fontFamily:"'Cinzel Decorative',serif",fontSize:20,color:"#e8ddd4"}}>10</div>
                    <div style={{fontFamily:"'Inter',sans-serif",fontSize:10,color:"rgba(232,224,212,0.4)",letterSpacing:2,textTransform:"uppercase",marginTop:2}}>Questions</div>
                  </div>
                  {sc > 0 && <div style={{textAlign:"center"}}>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:20,color:"#22c55e"}}>{sc}</div>
                    <div style={{fontFamily:"'Inter',sans-serif",fontSize:10,color:"rgba(232,224,212,0.4)",letterSpacing:2,textTransform:"uppercase",marginTop:2}}>Score</div>
                  </div>}
                </div>

                <button onClick={sr2} style={{...b1,width:"100%",padding:"18px 0",fontSize:16,letterSpacing:6,marginTop:4}}>
                  BEGIN
                </button>
              </div>
            )}
          </div>
        )}

        {/* GAME */}
        {scr === "game" && cq && (
          <div style={{flex:1,display:"flex",flexDirection:"column",paddingTop:50,paddingBottom:18,animation:shk?"bigShake 0.6s":"none",position:"relative"}}>

            {/* RED EDGE PULSE on low timer */}
            {tm <= 10 && <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:5,animation:`redPulse ${tm<=5?"0.4s":"0.8s"} ease-in-out infinite`,borderRadius:0}} />}

            {/* KILL FEED */}
            {killFeed && (
              <div style={{position:"fixed",top:"18%",left:0,right:0,textAlign:"center",zIndex:60,pointerEvents:"none",animation:"killFeed 2.5s ease-out forwards"}}>
                <span style={{fontFamily:"'Cinzel',serif",fontSize:16,letterSpacing:3,color:"rgba(210,20,0,0.9)",textShadow:"0 0 20px rgba(210,20,0,0.5)"}}>{killFeed}</span>
              </div>
            )}
            {/* v43: VS LIVE SCOREBOARD — big two-sided display above the regular HUD when in VS mode. Pulses on each score. Lead indicator flips color based on who's ahead. */}
            {vsMode && (
              <div style={{display:"flex",alignItems:"stretch",gap:8,marginBottom:10,padding:"8px 10px",background:"linear-gradient(180deg,rgba(15,0,0,0.6) 0%,rgba(0,0,0,0.3) 100%)",border:"1px solid rgba(204,34,0,0.25)",borderRadius:10,boxShadow:"inset 0 0 20px rgba(0,0,0,0.4)"}}>
                {/* MY SIDE */}
                <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"6px 4px",borderRadius:8,background:vsMePulse?"rgba(34,197,94,0.18)":"transparent",transition:"background 0.25s",border:`1px solid ${sc > vsOpponentScore ? "rgba(34,197,94,0.5)" : "transparent"}`,position:"relative"}}>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:2,color:"rgba(232,224,212,0.55)",textTransform:"uppercase",marginBottom:2}}>You</div>
                  <div style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:"#e8ddd4",marginBottom:4,maxWidth:"100%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{nm || "Anonymous"}</div>
                  <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:32,color:"#22c55e",lineHeight:1,textShadow:vsMePulse?"0 0 16px rgba(34,197,94,0.9)":"0 0 6px rgba(34,197,94,0.3)",transform:vsMePulse?"scale(1.12)":"scale(1)",transition:"transform 0.25s, text-shadow 0.25s"}}>{sc}</div>
                  {sc > vsOpponentScore && sc > 0 && (
                    <div style={{position:"absolute",top:-6,right:-4,fontFamily:"'Cinzel',serif",fontSize:9,color:"#22c55e",background:"rgba(0,0,0,0.7)",borderRadius:10,padding:"2px 6px",letterSpacing:1,border:"1px solid rgba(34,197,94,0.5)"}}>+{sc - vsOpponentScore}</div>
                  )}
                  {bonusPop && (
                    <div style={{position:"absolute",bottom:-14,fontFamily:"'Cinzel Decorative',serif",fontSize:14,color:"#f97316",fontWeight:700,pointerEvents:"none",animation:"bonusPop 1.2s ease-out forwards",whiteSpace:"nowrap",textShadow:"0 0 10px rgba(249,115,22,0.9)"}}>{bonusPop} 🔥</div>
                  )}
                </div>
                {/* VS DIVIDER */}
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 2px"}}>
                  <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:14,color:"rgba(204,34,0,0.9)",letterSpacing:2,textShadow:"0 0 10px rgba(204,34,0,0.5)"}}>VS</div>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:8,color:"rgba(232,224,212,0.35)",letterSpacing:1,marginTop:2}}>Q{qi+1}/10</div>
                </div>
                {/* OPPONENT SIDE */}
                <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"6px 4px",borderRadius:8,background:vsOppPulse?"rgba(239,68,68,0.22)":"transparent",transition:"background 0.25s",border:`1px solid ${vsOpponentScore > sc ? "rgba(239,68,68,0.5)" : "transparent"}`,position:"relative"}}>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:2,color:"rgba(232,224,212,0.55)",textTransform:"uppercase",marginBottom:2}}>Opponent</div>
                  <div style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:"#e8ddd4",marginBottom:4,maxWidth:"100%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{vsOpponent || "…"}</div>
                  <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:32,color:"#ef4444",lineHeight:1,textShadow:vsOppPulse?"0 0 16px rgba(239,68,68,0.9)":"0 0 6px rgba(239,68,68,0.3)",transform:vsOppPulse?"scale(1.12)":"scale(1)",transition:"transform 0.25s, text-shadow 0.25s"}}>{vsOpponentScore}</div>
                  {vsOpponentScore > sc && vsOpponentScore > 0 && (
                    <div style={{position:"absolute",top:-6,left:-4,fontFamily:"'Cinzel',serif",fontSize:9,color:"#ef4444",background:"rgba(0,0,0,0.7)",borderRadius:10,padding:"2px 6px",letterSpacing:1,border:"1px solid rgba(239,68,68,0.5)"}}>+{vsOpponentScore - sc}</div>
                  )}
                </div>
              </div>
            )}
            {/* HUD */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{fontFamily:"'Inter',sans-serif",fontSize:16,color:"#888",letterSpacing:2}}>{vsMode ? "⚔️ VS" : dailyMode ? "Quick" : `Rd${rd}`} · Q{qi+1}/10</div>
              {!vsMode && (
                <div style={{position:"relative",display:"flex",alignItems:"center"}}>
                  <div style={{fontFamily:"'Inter',sans-serif",fontSize:26,color:"#22c55e"}}>{sc}</div>
                  {bonusPop && (
                    <div style={{position:"absolute",top:-10,right:-50,fontFamily:"'Cinzel Decorative',serif",fontSize:18,color:"#f97316",fontWeight:700,pointerEvents:"none",animation:"bonusPop 1.2s ease-out forwards",whiteSpace:"nowrap",textShadow:"0 0 10px rgba(249,115,22,0.8)"}}>
                      {bonusPop} 🔥
                    </div>
                  )}
                </div>
              )}
            </div>
            <div style={{width:"100%",height:4,background:"rgba(255,255,255,0.06)",borderRadius:2,overflow:"hidden",marginBottom:4}}>
              <div style={{height:"100%",width:`${pct*100}%`,background:tC,borderRadius:2,transition:"width 1s linear,background 0.5s",boxShadow:pct<=0.25?`0 0 10px ${tC}`:"none"}} />
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <span style={{fontFamily:"'Inter',sans-serif",fontSize:tm<=5?26:18,color:tm<=5?"#ef4444":"#888",animation:tm<=5?"tP 0.6s infinite":"none",letterSpacing:1}}>{tm}s</span>
              {sk >= 2 && (                <div style={{
                  display:"flex",alignItems:"center",gap:4,
                  animation: sk >= 5 ? "tP 0.4s infinite" : sk >= 3 ? "tP 0.7s infinite" : "none",
                  transform: sk >= 8 ? "scale(1.3)" : sk >= 5 ? "scale(1.15)" : "scale(1)",
                  transition:"transform 0.3s"
                }}>
                  <span style={{fontSize: sk>=8?32:sk>=5?26:sk>=3?22:18}}>
                    {sk>=8?"🔥🔥🔥":sk>=5?"🔥🔥":"🔥"}
                  </span>
                  <span style={{
                    fontFamily:"'Cinzel Decorative',serif",
                    fontSize: sk>=8?28:sk>=5?22:sk>=3?18:16,
                    color: sk>=8?"#ff4500":sk>=5?"#f97316":"#eab308",
                    textShadow: sk>=8?"0 0 20px #ff4500,0 0 40px #ea580c":sk>=5?"0 0 14px #f97316,0 0 28px #ea580c":"0 0 8px #eab308",
                    fontWeight:700
                  }}>{sk}x</span>
                </div>
              )}
              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                {Array.from({length:5}).map((_,i) => (
                  <span key={i} style={{
                    fontSize:20,
                    opacity: i < roundWrong ? 1 : 0.2,
                    filter: i < roundWrong ? "drop-shadow(0 0 6px rgba(210,20,0,0.9))" : "none",
                    transform: i < roundWrong ? "scale(1.1)" : "scale(1)",
                    transition:"all 0.3s",
                    animation: i === roundWrong - 1 ? "skullPop 0.5s ease-out" : "none"
                  }}>☠</span>
                ))}
              </div>
            </div>

            {/* CENTRED QUESTION + ANSWERS */}
            <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",gap:10}}>
              <div style={{...cd,padding:"12px 14px",animation:"fi 0.4s"}}>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:"rgba(204,34,0,0.8)",letterSpacing:4,marginBottom:8,textTransform:"uppercase"}}>Question {oq} of 50</div>
                <p style={{fontSize:17,lineHeight:1.6,fontFamily:"'Inter',sans-serif",textTransform:"uppercase",fontWeight:500,letterSpacing:1,color:"#e8ddd4"}}>{cq.q}</p>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {cq.o.map((o, i) => {
                  const picked = slRef.current === i;
                  const right = wasRightRef.current;
                  let bg, bd2, cl, shadow, extraAnim = "";
                  if (!sh) {
                    // not revealed yet
                    bg="transparent"; bd2="rgba(255,255,255,0.55)"; cl="#e8ddd4"; shadow="0 0 8px rgba(255,255,255,0.1)";
                  } else if (picked && right) {
                    // player picked this and it was correct — show green
                    bg="rgba(34,197,94,0.15)"; bd2="#22c55e"; cl="#22c55e"; shadow="0 0 16px rgba(34,197,94,0.6), inset 0 0 10px rgba(34,197,94,0.1)"; extraAnim=",answerPop 0.4s ease-out";
                  } else if (picked && !right) {
                    // player picked this but it was wrong — show red
                    bg="rgba(239,68,68,0.15)"; bd2="#ef4444"; cl="#ef4444"; shadow="0 0 16px rgba(239,68,68,0.6), inset 0 0 10px rgba(239,68,68,0.1)"; extraAnim=",answerShake 0.4s ease-out";
                  } else {
                    // everything else — dim it, no hints
                    bg="transparent"; bd2="rgba(255,255,255,0.08)"; cl="rgba(255,255,255,0.2)"; shadow="none";
                  }
                  const badgeColor = !sh ? "rgba(255,255,255,0.6)" : picked && right ? "#22c55e" : picked && !right ? "#ef4444" : "rgba(255,255,255,0.05)";
                  const badgeText = !sh ? String.fromCharCode(65+i) : picked && right ? "✓" : picked && !right ? "✗" : String.fromCharCode(65+i);
                  return (
                    <button key={i} onClick={() => pk(i)} style={{padding:"11px 14px",background:bg,border:`1px solid ${bd2}`,borderRadius:12,color:cl,fontSize:15,fontFamily:"'Inter',sans-serif",textAlign:"left",textTransform:"uppercase",fontWeight:500,letterSpacing:1,display:"flex",alignItems:"center",gap:11,animation:`fi 0.3s ease-out ${0.06+i*0.05}s both${extraAnim}`,backdropFilter:"blur(8px)",boxShadow:shadow,transition:"background 0.3s, border-color 0.3s, color 0.3s, box-shadow 0.3s"}}>
                      <span style={{width:32,height:32,borderRadius:"50%",border:`2px solid ${badgeColor}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0,fontFamily:"'Inter',sans-serif",color:badgeColor,background:"transparent"}}>{badgeText}</span>{o}
                    </button>
                  );
                })}
              </div>
              {sh && (
                <div style={{marginTop:8,textAlign:"center",animation:"fi 0.3s"}}>
                  <p style={{fontFamily:"'Inter',sans-serif",fontSize:20,color:isOk?"#22c55e":"#ef4444",marginBottom:12}}>{isOk ? cM[(rd*7+qi)%cM.length] : sl===null ? "Time's up..." : wM[(rd*7+qi)%wM.length]}</p>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
                    <button onClick={nx} style={{...b2,fontFamily:"'Inter',sans-serif",padding:"11px 30px",letterSpacing:2,color:"#fff"}}>{qi+1>=rqs.length ? (rd>=5 ? "Face Your Fate" : "Next Round →") : "Continue"}</button>
                    <button onClick={async () => {
                      try {
                        const rep = {q: cq.q, a: cq.o, correct: cq.a, d: new Date().toISOString()};
                        const snap = await getDoc(doc(db,"reports","questions"));
                        const existing = snap.exists() ? snap.data().items : [];
                        existing.push(rep);
                        await setDoc(doc(db,"reports","questions"), {items: existing});
                        alert("Thanks! Question flagged for review.");
                      } catch(e) { alert("Could not submit report."); }
                    }} style={{padding:"8px 12px",background:"rgba(0,0,0,0.3)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,color:"rgba(255,255,255,0.6)",fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:2,cursor:"pointer"}}>
                      🚩 Flag
                    </button>
                  </div>
                </div>
              )}
              <div style={{display:"flex",gap:2,marginTop:8,justifyContent:"center"}}>{Array.from({length:10}).map((_, i) => <div key={i} style={{width:i===qi?10:4,height:3,borderRadius:2,background:i<qi?"#cc2200":i===qi?"#e8e0d4":"rgba(255,255,255,0.06)"}} />)}</div>
            </div>
          </div>
        )}

        {/* END SCREEN */}
        {/* ═══ GAME OVER ═══ */}
        {scr === "gameover" && (
          <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",textAlign:"center",gap:16,animation:"fi 0.8s",padding:"0 24px"}}>
            <div style={{fontFamily:"'Inter',sans-serif",fontFamily:"'Inter',sans-serif",fontSize:11,letterSpacing:6,color:"rgba(204,34,0,0.7)",textTransform:"uppercase"}}>You Have Been</div>
            <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:72,color:"#e8ddd4",textShadow:"0 0 40px rgba(239,68,68,0.6)",lineHeight:1,animation:"pR 2s ease-in-out infinite",letterSpacing:6}}>SLASHED</div>

            <div style={{...cd,padding:"20px 24px",borderRadius:16,width:"100%",maxWidth:300,display:"flex",justifyContent:"space-around",marginTop:8}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"'Cinzel',serif",fontFamily:"'Cinzel Decorative',serif",fontSize:28,color:"#e8ddd4"}}>{sc}</div>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:10,color:"rgba(232,224,212,0.5)",letterSpacing:2,textTransform:"uppercase",marginTop:2}}>Score</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"'Cinzel',serif",fontFamily:"'Cinzel Decorative',serif",fontSize:28,color:"#e8ddd4"}}>{tc}/50</div>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:10,color:"rgba(232,224,212,0.5)",letterSpacing:2,textTransform:"uppercase",marginTop:2}}>Correct</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"'Cinzel',serif",fontFamily:"'Cinzel Decorative',serif",fontSize:28,color:"#e8ddd4"}}>Rd {rd}</div>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:10,color:"rgba(232,224,212,0.5)",letterSpacing:2,textTransform:"uppercase",marginTop:2}}>Died On</div>
              </div>
            </div>

            <div style={{display:"flex",gap:12,marginTop:8,width:"100%",maxWidth:300}}>
              <button onClick={go} style={{...b1,flex:1,padding:"16px 0"}}>Try Again</button>
              <button onClick={() => setScr("title")} style={{flex:1,padding:"16px 0",background:"transparent",border:"1px solid rgba(204,34,0,0.5)",borderRadius:12,color:"rgba(232,224,212,0.7)",fontSize:14,fontFamily:"'Cinzel',serif",letterSpacing:2,cursor:"pointer",boxShadow:"0 0 8px rgba(204,34,0,0.2)"}}>Run Home</button>
            </div>
          </div>
        )}

        {/* ═══ END SCREEN ═══ */}
        {scr === "end" && (
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 24px 30px",animation:"fi 1s",gap:16,textAlign:"center",overflowY:"auto",maxHeight:"100vh",WebkitOverflowScrolling:"touch"}}>

            {/* VS result */}
            {vsMode && (
              <div style={{...cd,padding:"16px 20px",borderRadius:14,width:"100%",maxWidth:300,border:"1px solid rgba(204,34,0,0.7)",boxShadow:"0 0 12px rgba(204,34,0,0.5), 0 0 30px rgba(204,34,0,0.2)"}}>
                {vsOpponentDone ? (
                  <>
                    <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:30,color:"#e8ddd4"}}>
                      {sc > vsOpponentScore ? "⚔️ VICTORY" : sc < vsOpponentScore ? "💀 DEFEATED" : "🩸 DRAW"}
                    </div>
                    <div style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"rgba(232,224,212,0.5)",marginTop:6,letterSpacing:2}}>
                      You: {sc} &nbsp;|&nbsp; {vsOpponent}: {vsOpponentScore}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:24,color:"#e8ddd4",animation:"tP 1.5s infinite"}}>⏳ Waiting for {vsOpponent}...</div>
                    <div style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"rgba(232,224,212,0.4)",marginTop:6,letterSpacing:2}}>
                      Your score: {sc}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Title — solo only; VS end screen already has its own VICTORY/DEFEATED/DRAW card up top */}
            {!vsMode && <div style={{fontFamily:"'Inter',sans-serif",fontFamily:"'Inter',sans-serif",fontSize:11,letterSpacing:6,color:"rgba(204,34,0,0.7)",textTransform:"uppercase"}}>You Survived</div>}
            {myBadges.length > 0 && <div style={{fontSize:22,letterSpacing:3,marginBottom:-8}}>{myBadges.join("")}</div>}
            {!vsMode && <div style={{fontFamily:"'Jolly Lodger',serif",fontSize:34,color:"#e8ddd4",letterSpacing:2,animation:"pR 2s ease-in-out infinite",textShadow:"4px 5px 0px rgba(0,0,0,1)"}}>
              {tc>=43?"Master of Dread":tc>=33?"Horror Savant":tc>=23?"Survivor":tc>=13?"Barely Alive":"Claimed by Darkness"}
            </div>}

            {/* v48: VS session W/L/D scoreboard — resets each new VS session, ticks up per completed match */}
            {vsMode && vsOpponentDone && (
              <>
                <div style={{fontFamily:"'Inter',sans-serif",fontFamily:"'Inter',sans-serif",fontSize:11,letterSpacing:6,color:"rgba(204,34,0,0.7)",textTransform:"uppercase"}}>Session Record</div>
                <div style={{display:"flex",alignItems:"center",gap:14,fontFamily:"'Jolly Lodger',serif",fontSize:32,letterSpacing:2,color:"#e8ddd4",textShadow:"4px 5px 0px rgba(0,0,0,1)"}}>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:11,letterSpacing:2,color:"rgba(232,224,212,0.55)",fontFamily:"'Cinzel',serif",textTransform:"uppercase",textShadow:"none",marginBottom:2}}>{nm || "You"}</div>
                    <div style={{color:"#22c55e",textShadow:"0 0 10px rgba(34,197,94,0.4), 4px 5px 0px rgba(0,0,0,1)"}}>{vsSessionWins}</div>
                  </div>
                  <div style={{fontSize:18,color:"rgba(204,34,0,0.8)",letterSpacing:4,textShadow:"none"}}>–</div>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:11,letterSpacing:2,color:"rgba(232,224,212,0.55)",fontFamily:"'Cinzel',serif",textTransform:"uppercase",textShadow:"none",marginBottom:2}}>{vsOpponent || "Opponent"}</div>
                    <div style={{color:"#ef4444",textShadow:"0 0 10px rgba(239,68,68,0.4), 4px 5px 0px rgba(0,0,0,1)"}}>{vsSessionLosses}</div>
                  </div>
                  <div style={{fontSize:18,color:"rgba(204,34,0,0.8)",letterSpacing:4,textShadow:"none"}}>–</div>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:11,letterSpacing:2,color:"rgba(232,224,212,0.55)",fontFamily:"'Cinzel',serif",textTransform:"uppercase",textShadow:"none",marginBottom:2}}>Draws</div>
                    <div style={{color:"#e8ddd4",textShadow:"0 0 10px rgba(232,221,212,0.3), 4px 5px 0px rgba(0,0,0,1)"}}>{vsSessionDraws}</div>
                  </div>
                </div>
              </>
            )}

            {/* Stats box */}
            <div style={{...cd,padding:"20px 24px",borderRadius:16,width:"100%",maxWidth:300,display:"flex",justifyContent:"space-around"}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"'Cinzel',serif",fontFamily:"'Cinzel Decorative',serif",fontSize:28,color:"#e8ddd4"}}>{sc}</div>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:10,color:"rgba(232,224,212,0.5)",letterSpacing:2,textTransform:"uppercase",marginTop:2}}>Score</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"'Cinzel',serif",fontFamily:"'Cinzel Decorative',serif",fontSize:28,color:"#e8ddd4"}}>{tc}/{vsMode ? 10 : 50}</div>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:10,color:"rgba(232,224,212,0.5)",letterSpacing:2,textTransform:"uppercase",marginTop:2}}>Correct</div>
              </div>
              {bs > 1 && <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"'Cinzel',serif",fontFamily:"'Cinzel Decorative',serif",fontSize:28,color:"#e8ddd4"}}>🔥{bs}</div>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:10,color:"rgba(232,224,212,0.4)",letterSpacing:2,textTransform:"uppercase",marginTop:2}}>Best Streak</div>
              </div>}
            </div>

            {!vsMode && mr && <div style={{fontFamily:"'Inter',sans-serif",fontFamily:"'Inter',sans-serif",fontSize:13,color:"#e8ddd4",letterSpacing:3}}>🏆 Ranked #{mr}</div>}

            {/* Leaderboard — VS shows global VS-wins rankings; solo shows alltime score rankings */}
            {vsMode ? (
              vsWinsBd.length > 0 && (
                <div style={{...cd,padding:"16px",borderRadius:14,width:"100%",maxWidth:300}}>
                  <div style={{fontFamily:"'Inter',sans-serif",fontFamily:"'Inter',sans-serif",fontSize:10,letterSpacing:4,color:"rgba(204,34,0,0.7)",textTransform:"uppercase",marginBottom:10}}>⚔️ VS Wins · Global</div>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}>
                    {vsWinsBd.slice(0,5).map((e,i) => (
                      <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 8px",borderRadius:8,background:e.name===(nm||"Anonymous")?"rgba(204,34,0,0.1)":"transparent"}}>
                        <span style={{fontFamily:"'Cinzel',serif",fontSize:11,width:20,color:i===0?"#ffd700":i===1?"#c0c0c0":i===2?"#cd7f32":"#555",textAlign:"center"}}>{i===0?"🔪":i+1}</span>
                        <span style={{flex:1,fontFamily:"'Inter',sans-serif",fontSize:14,color:e.name===(nm||"Anonymous")?"#eab308":"#999",textAlign:"left"}}>{e.name}</span>
                        <span style={{fontFamily:"'Inter',sans-serif",fontSize:14,color:"#22c55e"}}>Wins {e.wins || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ) : (
              bd.length > 0 && (
                <div style={{...cd,padding:"16px",borderRadius:14,width:"100%",maxWidth:300}}>
                  <div style={{fontFamily:"'Inter',sans-serif",fontFamily:"'Inter',sans-serif",fontSize:10,letterSpacing:4,color:"rgba(204,34,0,0.7)",textTransform:"uppercase",marginBottom:10}}>Leaderboard</div>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}>
                    {bd.slice(0,5).map((e,i) => (
                      <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 8px",borderRadius:8,background:e.name===(nm||"Anonymous")&&e.score===sc?"rgba(204,34,0,0.1)":"transparent"}}>
                        <span style={{fontFamily:"'Cinzel',serif",fontSize:11,width:20,color:i===0?"#ffd700":i===1?"#c0c0c0":i===2?"#cd7f32":"#555",textAlign:"center"}}>{i===0?"🔪":i+1}</span>
                        <span style={{flex:1,fontFamily:"'Inter',sans-serif",fontSize:14,color:e.name===(nm||"Anonymous")&&e.score===sc?"#eab308":"#999",textAlign:"left"}}>{e.name}{e.badges && e.badges.length > 0 && <span style={{marginLeft:4,fontSize:12}}>{e.badges.join("")}</span>}</span>
                        <span style={{fontFamily:"'Inter',sans-serif",fontSize:14,color:"#22c55e"}}>{e.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}

            {vsMode ? (
              <div style={{display:"flex",flexDirection:"column",gap:10,width:"100%",maxWidth:300}}>
                {/* v43: Rematch flow — both players see status based on hostRematch/guestRematch flags on the room doc. When both are true, host regenerates questions and flips status back to "playing"; both sides auto-transition into the new match via the end-screen listener. */}
                {(() => {
                  // Button label + behavior depends on rematch state.
                  if (vsIWantRematch && !vsOpponentWantsRematch) {
                    // I've asked, waiting for them
                    return (
                      <>
                        <div style={{width:"100%",padding:"16px 0",background:"rgba(80,0,0,0.3)",border:"1px solid rgba(204,34,0,0.5)",borderRadius:12,color:"#e8ddd4",fontSize:14,fontFamily:"'Cinzel',serif",letterSpacing:3,textAlign:"center",animation:"tP 1.5s infinite"}}>⚔️ Waiting for {vsOpponent || "opponent"}…</div>
                        <button onClick={async () => {
                          Au.p("click");
                          // Cancel my rematch request
                          if (vsCode) await setRematchFlag(vsCode, vsRole, false);
                          setVsIWantRematch(false);
                        }} style={{width:"100%",padding:"12px 0",background:"transparent",border:"1px solid rgba(255,255,255,0.15)",borderRadius:12,color:"rgba(232,224,212,0.5)",fontSize:12,fontFamily:"'Cinzel',serif",letterSpacing:2,cursor:"pointer"}}>Cancel Rematch</button>
                      </>
                    );
                  }
                  if (!vsIWantRematch && vsOpponentWantsRematch) {
                    // They've asked, prompt me
                    return (
                      <button onClick={async () => {
                        Au.p("continue");
                        if (vsCode) await setRematchFlag(vsCode, vsRole, true);
                        setVsIWantRematch(true);
                      }} style={{...b1,width:"100%",padding:"16px 0",letterSpacing:3,animation:"pR 1.5s ease-in-out infinite"}}>⚔️ {vsOpponent || "Opponent"} wants a rematch! →</button>
                    );
                  }
                  // Default: nobody has asked yet (or both asked and rematch is imminent)
                  return (
                    <button onClick={async () => {
                      Au.p("continue");
                      if (vsCode) await setRematchFlag(vsCode, vsRole, true);
                      setVsIWantRematch(true);
                    }} style={{...b1,width:"100%",padding:"16px 0",letterSpacing:3}}>⚔️ Rematch</button>
                  );
                })()}
                <button onClick={async () => {
                  Au.p("click");
                  if (vsPollRef.current) { vsPollRef.current(); vsPollRef.current = null; }
                  if (vsWaitRef.current) { vsWaitRef.current(); vsWaitRef.current = null; }
                  if (vsEndListenerRef.current) { vsEndListenerRef.current(); vsEndListenerRef.current = null; }
                  if (vsCode) { try { await deleteDoc(doc(db, "vsrooms", vsCode)); } catch(_) {} }
                  setVsMode(false); setVsStatus("idle"); setVsCode(""); setVsRole(null); setVsOpponent(null); setVsOpponentScore(0); setVsOpponentDone(false);
                  setVsIWantRematch(false); setVsOpponentWantsRematch(false);
                  setScr("title");
                }} style={{width:"100%",padding:"12px 0",background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,color:"rgba(232,224,212,0.35)",fontSize:12,fontFamily:"'Cinzel',serif",letterSpacing:2,cursor:"pointer"}}>Run Home</button>
              </div>
            ) : (
              <div style={{display:"flex",gap:12,width:"100%",maxWidth:300}}>
                <button onClick={go} style={{...b1,flex:1,padding:"16px 0"}}>Play Again</button>
                <button onClick={() => setScr("title")} style={{flex:1,padding:"16px 0",background:"transparent",border:"1px solid rgba(204,34,0,0.5)",borderRadius:12,color:"rgba(232,224,212,0.7)",fontSize:14,fontFamily:"'Cinzel',serif",letterSpacing:2,cursor:"pointer",boxShadow:"0 0 8px rgba(204,34,0,0.2)"}}>Run Home</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── BADGES MODAL ── */}
      {showBadges && (
        <div onClick={() => { Au.p("close"); setShowBadges(false); }} style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:500,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",animation:"fi 0.25s ease"}}>
          <div onClick={e => e.stopPropagation()} style={{width:"100%",maxWidth:340,background:"linear-gradient(160deg,#1a0000 0%,#110000 100%)",border:"1px solid rgba(180,30,30,0.35)",borderRadius:16,padding:"22px 20px",position:"relative",maxHeight:"80vh",overflowY:"auto"}}>
            <div style={{fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:16,letterSpacing:5,color:"rgba(245,30,0,0.85)",textTransform:"uppercase",marginBottom:16,textAlign:"center"}}>🎖️ Badges</div>
            {[
              {cat:"Kills",desc:"Games played",badges:[{icon:"🔪",label:"First Kill",req:"Play 1 game"},{icon:"🪓",label:"Serial Killer",req:"Play 10 games"},{icon:"⛓️",label:"Chainmaster",req:"Play 25 games"},{icon:"💀",label:"Death Dealer",req:"Play 50 games"}]},
              {cat:"Survivor",desc:"Correct answers",badges:[{icon:"🩸",label:"Blood Bath",req:"50 correct"},{icon:"👁️",label:"All Seeing",req:"200 correct"},{icon:"😱",label:"Scream Queen",req:"500 correct"},{icon:"👹",label:"Demon",req:"1000 correct"}]},
              {cat:"Perfectionist",desc:"Perfect rounds & games",badges:[{icon:"🎃",label:"Pumpkin King",req:"1 perfect round"},{icon:"⚰️",label:"Gravedigger",req:"5 perfect rounds"},{icon:"🔦",label:"Final Girl",req:"1 perfect game"},{icon:"🪦",label:"Tombstone",req:"5 perfect games"}]},
              {cat:"Horror Master",desc:"Leaderboard rank",badges:[{icon:"⭐",label:"Nightmare",req:"Reach top 10"},{icon:"🌙",label:"Boogeyman",req:"Reach top 3"},{icon:"🔥",label:"Horror Master",req:"Reach #1"}]},
            ].map(({cat, desc, badges}, ci) => (
              <div key={ci} style={{marginBottom:16}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:3,color:"rgba(245,30,0,0.7)",textTransform:"uppercase",marginBottom:6,borderBottom:"1px solid rgba(245,30,0,0.15)",paddingBottom:4}}>{cat} <span style={{color:"rgba(200,180,170,0.5)",letterSpacing:1,fontFamily:"'Inter',sans-serif"}}>— {desc}</span></div>
                {badges.map(({icon, label, req}, bi) => (
                  <div key={bi} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 4px",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                    <span style={{fontSize:18,width:24,textAlign:"center"}}>{icon}</span>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"rgba(230,210,195,0.9)",fontWeight:500}}>{label}</div>
                      <div style={{fontFamily:"'Inter',sans-serif",fontSize:10,color:"rgba(180,160,150,0.6)",marginTop:1}}>{req}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <button onClick={() => { Au.p("close"); setShowBadges(false); }} style={{marginTop:8,width:"100%",padding:"10px 0",background:"transparent",border:"1px solid rgba(180,30,30,0.35)",borderRadius:10,color:"rgba(245,30,0,0.7)",fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:3,cursor:"pointer"}}>CLOSE</button>
          </div>
        </div>
      )}


      {/* ── MINI GAMES / FINAL GIRL / SLASHER SMASH rendered at top level below ── */}

      {/* placeholder */}
      {scr === "minigames" && (
        <div style={{position:"fixed",inset:0,background:"#080808",zIndex:100,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Cinzel',serif"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <button onClick={() => { Au.p("close"); navTo("title"); }} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.25)",borderRadius:8,color:"rgba(255,255,255,0.6)",fontSize:11,letterSpacing:2,padding:"6px 12px",cursor:"pointer"}}>← BACK</button>
            <div style={{color:"rgba(255,80,80,0.9)",fontSize:12,letterSpacing:4}}>MINI GAMES</div>
            <div style={{width:60}} />
          </div>
          <div style={{textAlign:"center",padding:24,width:"100%",maxWidth:360}}>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.95)",letterSpacing:4,marginBottom:28}}>CHOOSE YOUR NIGHTMARE</div>
            <div style={{display:"flex",flexDirection:"column",gap:14,width:"100%"}}>
              <button onClick={() => { Au.p("continue"); Hap.light(); navTo("slashersmash"); }} style={{width:"100%",padding:"20px 0",background:"transparent",border:"1px solid rgba(255,150,0,0.5)",borderRadius:14,color:"#ffaa44",fontFamily:"'Cinzel',serif",fontSize:14,letterSpacing:4,textTransform:"uppercase",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:12}}>
                <span style={{fontSize:22}}>💀</span>
                <div style={{textAlign:"center"}}>
                  <div>SLASHER SMASH</div>
                  <div style={{fontSize:10,letterSpacing:2,color:"rgba(255,255,255,0.95)",marginTop:3}}>SMASH FREDDY JASON MICHAEL AND MORE</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {scr === "slashersmash" && <SlasherBreakout onExit={() => { Au.p("close"); navTo("minigames"); }} onHighScore={(s) => setSbScore(Math.max(sbScore, s))} highScore={sbScore} />}

      {/* FIXED BOTTOM BAR (title screen only) */}
      {scr === "title" && (
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:10,display:"flex",flexDirection:"row",alignItems:"center",justifyContent:"center",gap:8,padding:"7px 16px calc(20px + env(safe-area-inset-bottom))",background:"transparent",borderTop:"none"}}>
        <button onClick={() => { setMu(m => { const next = !m; if (!next) { Au.stopM(); } else { Au.startM(scr === "game" ? rd : 1); } return next; }); handleYtTap(); }} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.5)",borderRadius:8,color:"rgba(255,255,255,0.9)",fontSize:10,fontFamily:"'Inter',sans-serif",letterSpacing:1,padding:"6px 12px",display:"flex",alignItems:"center",gap:4,cursor:"pointer",boxShadow:"0 0 8px rgba(255,255,255,0.15)"}}>
          <span style={{fontSize:12}}>{mu?"🔊":"🔇"}</span> Music
        </button>

        <button onClick={() => window.open("https://www.instagram.com/sinisterdrew/","_blank")} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.5)",borderRadius:8,color:"rgba(255,255,255,0.9)",fontSize:10,fontFamily:"'Inter',sans-serif",letterSpacing:1,padding:"6px 12px",display:"flex",alignItems:"center",gap:4,cursor:"pointer",boxShadow:"0 0 8px rgba(255,255,255,0.15)"}}>
          <span style={{fontSize:12}}>📷</span> Instagram
        </button>
        <button onClick={() => window.open("https://www.youtube.com/@sinistervids71","_blank")} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.5)",borderRadius:8,color:"rgba(255,255,255,0.9)",fontSize:10,fontFamily:"'Inter',sans-serif",letterSpacing:1,padding:"6px 12px",display:"flex",alignItems:"center",gap:4,cursor:"pointer",boxShadow:"0 0 8px rgba(255,255,255,0.15)"}}>
          <span style={{fontSize:12}}>▶</span> YouTube
        </button>
        <button onClick={() => { Au.p("continue"); navTo("about"); }} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.5)",borderRadius:8,color:"rgba(255,255,255,0.9)",fontSize:10,fontFamily:"'Inter',sans-serif",letterSpacing:1,padding:"6px 12px",display:"flex",alignItems:"center",gap:4,cursor:"pointer",boxShadow:"0 0 8px rgba(255,255,255,0.15)"}}>
          <span style={{fontSize:12}}>ℹ️</span> About
        </button>
      </div>
      )}
    </div>
  );
}
