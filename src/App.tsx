import { useState, useEffect, useRef, useCallback, Component } from "react";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
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

async function getSlasherQuestions(roundNum, count=10, seed=null) {
  const QC1=QCLOUD.filter(q=>q.d===1),QC2=QCLOUD.filter(q=>q.d===2),QC3=QCLOUD.filter(q=>q.d===3),QC4=QCLOUD.filter(q=>q.d===4),QC5=QCLOUD.filter(q=>q.d===5);const pools = {1:[...Q1c1,...Q1c14,...Q1c23,...Q1c29,...Q1c3,...Q1c31,...Q1c38,...Q1c4,...Q1c42,...Q1c43,...Q1c49,...Q1c5,...Q1c54,...QC1],2:[...Q2c0,...Q2c1,...Q2c17,...Q2c18,...Q2c2,...Q2c21,...Q2c28,...Q2c29,...Q2c3,...Q2c4,...Q2c40,...Q2c5,...Q2c9,...QC2],3:[...Q3c10,...Q3c11,...Q3c12,...Q3c2,...Q3c21,...Q3c28,...Q3c30,...Q3c31,...Q3c32,...Q3c38,...Q3c39,...Q3c9,...QC3],4:[...Q4c0,...Q4c1,...Q4c10,...Q4c11,...Q4c12,...Q4c13,...Q4c14,...Q4c15,...Q4c2,...Q4c22,...Q4c23,...Q4c24,...Q4c25,...Q4c26,...Q4c27,...Q4c28,...Q4c29,...Q4c3,...Q4c30,...Q4c31,...Q4c32,...Q4c33,...Q4c5,...Q4c6,...Q4c7,...Q4c8,...Q4c9,...Q4c34,...QC4],5:[...Q5c0,...Q5c14,...Q5c17,...Q5c19,...Q5c2,...Q5c24,...Q5c25,...Q5c28,...Q5c29,...Q5c5,...Q5c6,...Q5c7,...QC5]};
  const pool = pools[roundNum] || [];
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
async function saveS(nm, sc, cr, bg=[]) { try { const b = await loadB(); b.push({name: nm, score: sc, correct: cr, badges: bg, d: new Date().toISOString().slice(0,10)}); b.sort((a,c) => c.score - a.score); const t = b.slice(0,100); await setDoc(doc(db,"leaderboards","alltime"), {scores: t}); return t; } catch(e) { console.error("saveS:", e); return []; } }
// v48: VS-wins leaderboard — tracks lifetime VS wins per name across all players globally.
// Stored in leaderboards/vs-wins with shape { scores: [{name, wins, lastWin}] }.
// Dedupes by name (merges all players with the same typed name into one row).
async function loadVsWinsB() {
  try {
    const snap = await getDoc(doc(db, "leaderboards", "vs-wins"));
    return snap.exists() && Array.isArray(snap.data().scores) ? snap.data().scores : [];
  } catch(e) { console.error("loadVsWinsB:", e); return []; }
}
// Credit a single win to the given name. Read-modify-write on the VS-wins doc.
// Race tolerance: if two writes collide, one might overwrite the other, but at worst
// we under-count by one win — not worth adding transaction complexity for.
async function creditVsWin(nm) {
  try {
    const cleanName = (nm || "Anonymous").trim().slice(0, 20);
    const b = await loadVsWinsB();
    const now = new Date().toISOString();
    const existing = b.find(e => e.name === cleanName);
    if (existing) {
      existing.wins = (existing.wins || 0) + 1;
      existing.lastWin = now;
    } else {
      b.push({ name: cleanName, wins: 1, lastWin: now });
    }
    b.sort((a, c) => (c.wins || 0) - (a.wins || 0));
    const t = b.slice(0, 100);
    await setDoc(doc(db, "leaderboards", "vs-wins"), { scores: t });
    return t;
  } catch(e) { console.error("creditVsWin:", e); return []; }
}
async function loadDailyB() { try { const k = "daily-" + new Date().toISOString().slice(0,10); const snap = await getDoc(doc(db,"leaderboards",k)); return snap.exists() ? snap.data().scores : []; } catch(e) { console.error("loadDailyB:", e); return []; } }
async function saveDailyS(nm, sc, cr) { try { const k = "daily-" + new Date().toISOString().slice(0,10); const b = await loadDailyB(); b.push({name: nm, score: sc, correct: cr}); b.sort((a,c) => c.score - a.score); const t = b.slice(0,100); await setDoc(doc(db,"leaderboards",k), {scores: t}); return t; } catch(e) { console.error("saveDailyS:", e); return []; } }

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

  const CW = 340, CH = 420;
  const PADDLE_W = 70, PADDLE_H = 10;
  const BALL_R = 7;
  const BRICK_ROWS = 10, BRICK_COLS = 10;
  const BRICK_W = Math.floor(CW / BRICK_COLS);
  const BRICK_H = 22;
  const BRICK_TOP = 20;
  const GRIP_ZONE = 55;
  const TOTAL_H = CH + GRIP_ZONE;

  const initState = (lvl, currentLives, currentWave = 0) => {
    const lv = SLASHER_LEVELS[lvl];
    const bricks = [];
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        if (lv.bricks[r] && lv.bricks[r][c]) {
          bricks.push({ r, c, alive: true });
        }
      }
    }
    const spd = 3.5 + currentWave * 0.5;
    return {
      paddle: { x: CW / 2 - PADDLE_W / 2, y: CH - 40 },
      ball: { x: CW / 2, y: CH - 60, vx: spd, vy: -spd },
      bricks,
      lives: currentLives,
      score: 0,
      level: lvl,
      started: false,
    };
  };

  const startLevel = (lvl, currentLives, currentWave = 0) => {
    const s = initState(lvl, currentLives, currentWave);
    stateRef.current = s;
    setLives(currentLives);
    setScore(0);
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
      ctx.save();
      ctx.shadowColor = lv.glow;
      ctx.shadowBlur = 8;
      ctx.fillStyle = lv.color;
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
      ctx.strokeStyle = lv.glow;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    });

    // Paddle
    ctx.save();
    ctx.shadowColor = "#ff3300";
    ctx.shadowBlur = 12;
    ctx.fillStyle = "#cc2200";
    ctx.beginPath();
    const pr2=5,px2=s.paddle.x,py2=s.paddle.y,pw2=PADDLE_W,ph2=PADDLE_H;
    ctx.moveTo(px2+pr2,py2);ctx.lineTo(px2+pw2-pr2,py2);ctx.arcTo(px2+pw2,py2,px2+pw2,py2+pr2,pr2);
    ctx.lineTo(px2+pw2,py2+ph2-pr2);ctx.arcTo(px2+pw2,py2+ph2,px2+pw2-pr2,py2+ph2,pr2);
    ctx.lineTo(px2+pr2,py2+ph2);ctx.arcTo(px2,py2+ph2,px2,py2+ph2-pr2,pr2);
    ctx.lineTo(px2,py2+pr2);ctx.arcTo(px2,py2,px2+pr2,py2,pr2);ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Ball
    ctx.save();
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#e8ddd4";
    ctx.beginPath();
    ctx.arc(s.ball.x, s.ball.y, BALL_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ── GRIP ZONE (below play area) ──
    ctx.strokeStyle = "rgba(255,80,80,0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, CH); ctx.lineTo(CW, CH); ctx.stroke();
    ctx.fillStyle = "rgba(255,80,80,0.04)";
    ctx.fillRect(0, CH, CW, GRIP_ZONE);
    // Round grip indicator centered under paddle
    const gripCX = s.paddle.x + PADDLE_W/2;
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

      // Move ball
      s.ball.x += s.ball.vx;
      s.ball.y += s.ball.vy;

      // Wall bounces
      if (s.ball.x - BALL_R < 0) { s.ball.x = BALL_R; s.ball.vx = Math.abs(s.ball.vx); GameSFX.sbBounce(); }
      if (s.ball.x + BALL_R > CW) { s.ball.x = CW - BALL_R; s.ball.vx = -Math.abs(s.ball.vx); GameSFX.sbBounce(); }
      if (s.ball.y - BALL_R < 0) { s.ball.y = BALL_R; s.ball.vy = Math.abs(s.ball.vy); GameSFX.sbBounce(); }

      // Ball lost
      if (s.ball.y > CH + 20) {
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
        // Reset ball
        s.ball.x = s.paddle.x + PADDLE_W / 2;
        s.ball.y = s.paddle.y - 20;
        s.ball.vx = 3.5 * (Math.random() > 0.5 ? 1 : -1);
        s.ball.vy = -3.5;
        s.started = false;
      }

      // Paddle collision
      if (
        s.ball.y + BALL_R >= s.paddle.y &&
        s.ball.y + BALL_R <= s.paddle.y + PADDLE_H + 4 &&
        s.ball.x >= s.paddle.x - 4 &&
        s.ball.x <= s.paddle.x + PADDLE_W + 4 &&
        s.ball.vy > 0
      ) {
        const hitPos = (s.ball.x - s.paddle.x) / PADDLE_W;
        const angle = (hitPos - 0.5) * 2.2;
        const speed = Math.sqrt(s.ball.vx * s.ball.vx + s.ball.vy * s.ball.vy);
        s.ball.vx = speed * Math.sin(angle);
        s.ball.vy = -Math.abs(speed * Math.cos(angle)) * 0.95 - 0.5;
        s.ball.y = s.paddle.y - BALL_R - 1;
        GameSFX.sbPaddleHit();
      }

      // Brick collisions
      let bricksLeft = 0;
      s.bricks.forEach(b => {
        if (!b.alive) return;
        bricksLeft++;
        const bx = b.c * BRICK_W + 2;
        const by = BRICK_TOP + b.r * BRICK_H + 2;
        const bw = BRICK_W - 4;
        const bh = BRICK_H - 4;
        if (
          s.ball.x + BALL_R > bx && s.ball.x - BALL_R < bx + bw &&
          s.ball.y + BALL_R > by && s.ball.y - BALL_R < by + bh
        ) {
          b.alive = false;
          bricksLeft--;
          s.score += 10;
          GameSFX.sbBrickHit();
          setScore(s.score);
          // Bounce direction based on which side was hit
          const fromLeft = s.ball.x < bx + bw / 2;
          const fromTop = s.ball.y < by + bh / 2;
          const overlapX = fromLeft ? (s.ball.x + BALL_R - bx) : (bx + bw - (s.ball.x - BALL_R));
          const overlapY = fromTop ? (s.ball.y + BALL_R - by) : (by + bh - (s.ball.y - BALL_R));
          if (overlapX < overlapY) s.ball.vx *= -1;
          else s.ball.vy *= -1;
          // Speed up slightly
          const spd = Math.sqrt(s.ball.vx**2 + s.ball.vy**2);
          const maxSpd = 8;
          if (spd < maxSpd) {
            s.ball.vx *= 1.02;
            s.ball.vy *= 1.02;
          }
        }
      });

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
    s.paddle.x = Math.max(0, Math.min(CW - PADDLE_W, x - PADDLE_W / 2));
    if (!s.started) {
      s.ball.x = s.paddle.x + PADDLE_W / 2;
    }
  }, []);

  const handleTap = useCallback(() => {
    if (phaseRef.current !== "playing") return;
    const s = stateRef.current;
    if (s && !s.started) s.started = true;
  }, []);

  const nextLevel = () => {
    const nextLvl = level + 1;
    if (nextLvl >= SLASHER_LEVELS.length) {
      const nextWave = waveRef.current + 1;
      waveRef.current = nextWave;
      startLevel(0, lives, nextWave);
    } else {
      startLevel(nextLvl, lives, waveRef.current);
    }
  };

  const titleStyle = {fontSize:22,color:"#e8ddd4",letterSpacing:5,marginBottom:8,fontFamily:"'Cinzel',serif"};
  const subStyle = {fontSize:12,color:"rgba(255,255,255,0.35)",letterSpacing:3,marginBottom:6};
  const btnStyle = {background:"transparent",border:"1px solid rgba(255,80,80,0.5)",borderRadius:12,color:"#ff8080",fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:4,padding:"12px 28px",cursor:"pointer"};
  const btn2Style = {...btnStyle,border:"1px solid rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.4)"};

  return (
    <div style={{position:"fixed",inset:0,background:"#080808",zIndex:100,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Cinzel',serif"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <button onClick={onExit} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.2)",borderRadius:8,color:"rgba(255,255,255,0.5)",fontSize:11,letterSpacing:2,padding:"6px 12px",cursor:"pointer"}}>← EXIT</button>
        <div style={{color:"rgba(255,80,80,0.9)",fontSize:12,letterSpacing:4}}>SLASHER SMASH</div>
        <div style={{color:"rgba(255,255,255,0.3)",fontSize:11,letterSpacing:2}}>BEST: {highScore}</div>
      </div>

      {phase === "intro" && (
        <div style={{textAlign:"center",padding:24}}>
          <div style={{fontSize:42,marginBottom:12}}>💀</div>
          <div style={titleStyle}>SLASHER SMASH</div>
          <div style={{...subStyle,marginBottom:4}}>SMASH THE SLASHERS BRICK BY BRICK</div>
          <div style={{...subStyle,marginBottom:4}}>5 KILLERS — THEY KEEP COMING BACK FASTER</div>
          <div style={{...subStyle,marginBottom:4}}>LIVES REMAINING BONUS EACH ROUND</div>
          <div style={{...subStyle,marginBottom:24}}>TAP TO LAUNCH — MOVE PADDLE TO AIM</div>
          <button onClick={() => { waveRef.current = 0; startLevel(0, 5, 0); }} style={btnStyle}>START</button>
          {highScore > 0 && <div style={{marginTop:16,color:"rgba(255,255,255,0.25)",fontSize:12,letterSpacing:2}}>YOUR BEST: {highScore}</div>}
        </div>
      )}

      {phase === "playing" && (
        <div style={{width:"100%",maxWidth:360,padding:"0 10px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,padding:"0 4px"}}>
            <div style={{display:"flex",gap:3}}>
              {[0,1,2,3,4].map(i => <span key={i} style={{fontSize:16,opacity:i < lives ? 1 : 0.1}}>❤️</span>)}
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{color:"rgba(255,80,80,0.8)",fontSize:12,letterSpacing:4}}>{SLASHER_LEVELS[level]?.name}</div>
              {wave > 0 && <div style={{color:"rgba(255,150,0,0.7)",fontSize:9,letterSpacing:2}}>WAVE {wave + 1}</div>}
            </div>
            <div style={{color:"#e8ddd4",fontSize:15,fontFamily:"'Jolly Lodger',cursive",letterSpacing:3}}>{score}</div>
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
        <div style={{textAlign:"center",padding:24}}>
          <div style={{fontSize:42,marginBottom:12}}>🔪</div>
          <div style={{fontSize:13,color:"rgba(255,80,80,0.7)",letterSpacing:4,marginBottom:4}}>{SLASHER_LEVELS[level]?.name} DEFEATED</div>
          <div style={titleStyle}>ROUND CLEAR</div>
          <div style={{fontSize:38,color:"#e8ddd4",fontFamily:"'Jolly Lodger',cursive",letterSpacing:4,margin:"12px 0"}}>{roundScore}</div>
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
        <div style={{textAlign:"center",padding:24}}>
          <div style={{fontSize:42,marginBottom:12}}>💀</div>
          <div style={{fontSize:20,color:"#ff4444",letterSpacing:4,marginBottom:4}}>GAME OVER</div>
          <div style={{...subStyle,marginBottom:12}}>{SLASHER_LEVELS[level]?.name} got you</div>
          <div style={{fontSize:38,color:"#e8ddd4",fontFamily:"'Jolly Lodger',cursive",letterSpacing:4,margin:"8px 0"}}>{score}</div>
          {score >= highScore && score > 0
            ? <div style={{fontSize:12,color:"#ff4444",letterSpacing:3,marginBottom:20}}>🩸 NEW BEST!</div>
            : <div style={{...subStyle,marginBottom:20}}>BEST: {highScore}</div>
          }
          <div style={{display:"flex",gap:12,justifyContent:"center"}}>
            <button onClick={() => { waveRef.current = 0; startLevel(0, 5, 0); }} style={btnStyle}>TRY AGAIN</button>
            <button onClick={onExit} style={btn2Style}>EXIT</button>
          </div>
        </div>
      )}

      {phase === "allclear" && (
        <div style={{textAlign:"center",padding:24}}>
          <div style={{fontSize:42,marginBottom:12}}>🏆</div>
          <div style={{fontSize:12,color:"rgba(255,80,80,0.7)",letterSpacing:4,marginBottom:4}}>ALL SLASHERS DEFEATED</div>
          <div style={titleStyle}>YOU SURVIVED</div>
          <div style={{fontSize:38,color:"#e8ddd4",fontFamily:"'Jolly Lodger',cursive",letterSpacing:4,margin:"12px 0"}}>{score}</div>
          {score >= highScore && score > 0
            ? <div style={{fontSize:12,color:"#ff4444",letterSpacing:3,marginBottom:20}}>🩸 NEW BEST!</div>
            : <div style={{...subStyle,marginBottom:20}}>BEST: {highScore}</div>
          }
          <div style={{display:"flex",gap:12,justifyContent:"center"}}>
            <button onClick={() => { waveRef.current = 0; startLevel(0, 5, 0); }} style={btnStyle}>PLAY AGAIN</button>
            <button onClick={onExit} style={btn2Style}>EXIT</button>
          </div>
        </div>
      )}
    </div>
  );
}



// ── STAKE THE VAMPIRE ──
// Catapult-style physics with vampires, fire pickups, powder kegs, Master Vampires
const STAKE_LEVELS = [
  // ═════════════════════════════════════════════════
  // ACT I: THE CRYPT — fundamentals (1-5)
  // ═════════════════════════════════════════════════

  // 1. FIRST BLOOD — direct shot tutorial
  {
    name: "FIRST BLOOD",
    par: 1, stakes: 5,
    blocks: [{ x: 240, y: 525, w: 60, h: 15, t: "wood" }],
    vampires: [{ x: 270, y: 503, master: false }],
    bombs: [], kegs: [], pickups: [],
  },

  // 2. DOUBLE KILL — garlic chain
  {
    name: "DOUBLE KILL",
    par: 1, stakes: 5,
    blocks: [{ x: 200, y: 520, w: 130, h: 20, t: "stone" }],
    vampires: [
      { x: 225, y: 498, master: false },
      { x: 305, y: 498, master: false },
    ],
    bombs: [{ x: 265, y: 510 }],
    kegs: [], pickups: [],
  },

  // 3. ARC SHOT — stone wall forces arc
  {
    name: "ARC SHOT",
    par: 1, stakes: 5,
    blocks: [
      { x: 170, y: 380, w: 20, h: 160, t: "stone" },  // tall wall blocks direct path
      { x: 260, y: 525, w: 60, h: 15, t: "wood" },
    ],
    vampires: [{ x: 290, y: 503, master: false }],
    bombs: [], kegs: [], pickups: [],
  },

  // 4. STILT WALKER — tall stilt, hit the base
  {
    name: "STILT WALKER",
    par: 1, stakes: 5,
    blocks: [
      { x: 255, y: 525, w: 20, h: 15, t: "wood" },
      { x: 255, y: 495, w: 20, h: 30, t: "wood" },
      { x: 255, y: 460, w: 20, h: 35, t: "wood" },
      { x: 255, y: 420, w: 20, h: 40, t: "wood" },
      { x: 240, y: 405, w: 50, h: 15, t: "wood" },
    ],
    vampires: [{ x: 265, y: 383, master: false }],
    bombs: [], kegs: [], pickups: [],
  },

  // 5. FIRE STARTER — intro fire pickup + Master
  {
    name: "FIRE STARTER",
    par: 2, stakes: 5,
    blocks: [
      { x: 260, y: 455, w: 22, h: 85, t: "stone" },
      { x: 245, y: 440, w: 60, h: 15, t: "wood" },
    ],
    vampires: [{ x: 275, y: 418, master: true }],
    bombs: [],
    kegs: [],
    pickups: [{ x: 170, y: 320, type: "fire" }],
  },

  // ═════════════════════════════════════════════════
  // ACT II: CASTLE WALLS — masters, kegs, cantilevers (6-10)
  // ═════════════════════════════════════════════════

  // 6. POWDER BASE — keg at stilt base, signature "blow the support"
  {
    name: "POWDER BASE",
    par: 1, stakes: 5,
    blocks: [
      { x: 258, y: 425, w: 20, h: 115, t: "stone" },  // main stilt, reaches ground
      { x: 258, y: 385, w: 20, h: 40, t: "stone" },
      { x: 240, y: 370, w: 60, h: 15, t: "wood" },
      { x: 160, y: 525, w: 30, h: 15, t: "wood" },  // keg pedestal (moved to open area)
    ],
    vampires: [{ x: 270, y: 348, master: false }],
    bombs: [],
    kegs: [{ x: 176, y: 513 }],
    pickups: [],
  },

  // 7. CANTILEVER — wood beam between pillars, destroy one end
  {
    name: "CANTILEVER",
    par: 2, stakes: 5,
    blocks: [
      { x: 165, y: 410, w: 22, h: 130, t: "stone" },  // left pillar
      { x: 290, y: 410, w: 22, h: 130, t: "stone" },  // right pillar
      { x: 160, y: 395, w: 160, h: 15, t: "wood" },   // spanning beam
    ],
    vampires: [
      { x: 200, y: 373, master: false },
      { x: 265, y: 373, master: false },
    ],
    bombs: [],
    kegs: [],
    pickups: [{ x: 140, y: 280, type: "fire" }],
  },

  // 8. THE WEIGHT — Master UNDER a stone block, drop it on him
  {
    name: "THE WEIGHT",
    par: 2, stakes: 5,
    blocks: [
      // Two supporting wood posts
      { x: 180, y: 480, w: 20, h: 60, t: "wood" },
      { x: 280, y: 480, w: 20, h: 60, t: "wood" },
      // Heavy stone block on top
      { x: 170, y: 450, w: 140, h: 30, t: "stone" },
    ],
    vampires: [{ x: 240, y: 518, master: true }],  // underneath the slab
    bombs: [],
    kegs: [],
    pickups: [],
  },

  // 9. KEG CHAIN — two kegs chain-explode
  {
    name: "KEG CHAIN",
    par: 2, stakes: 5,
    blocks: [
      { x: 232, y: 460, w: 22, h: 80, t: "stone" },
      { x: 222, y: 445, w: 42, h: 15, t: "wood" },
      { x: 155, y: 525, w: 32, h: 15, t: "wood" },  // left keg pedestal
      { x: 295, y: 525, w: 32, h: 15, t: "wood" },  // right keg pedestal
    ],
    vampires: [{ x: 243, y: 423, master: true }],
    bombs: [],
    kegs: [
      { x: 171, y: 513 },
      { x: 311, y: 513 },
    ],
    pickups: [{ x: 145, y: 380, type: "fire" }],
  },

  // 10. DOMINO FALL — tall stone tower, hit base, topples
  {
    name: "DOMINO FALL",
    par: 1, stakes: 5,
    blocks: [
      { x: 200, y: 510, w: 30, h: 30, t: "wood" },   // base (vulnerable)
      { x: 205, y: 450, w: 22, h: 60, t: "stone" },
      { x: 205, y: 400, w: 22, h: 50, t: "stone" },
      { x: 205, y: 350, w: 22, h: 50, t: "stone" },
      { x: 205, y: 300, w: 22, h: 50, t: "stone" },
      { x: 195, y: 285, w: 42, h: 15, t: "wood" },
    ],
    vampires: [{ x: 216, y: 263, master: false }],  // on top
    bombs: [],
    kegs: [],
    pickups: [{ x: 130, y: 220, type: "fire" }],
  },

  // ═════════════════════════════════════════════════
  // ACT III: THE TOWERS — verticality, precision (11-15)
  // ═════════════════════════════════════════════════

  // 11. HIGH ROOST — lone vampire way up
  {
    name: "HIGH ROOST",
    par: 1, stakes: 5,
    blocks: [
      { x: 260, y: 260, w: 20, h: 280, t: "stone" },  // very tall
      { x: 240, y: 245, w: 60, h: 15, t: "wood" },
    ],
    vampires: [{ x: 270, y: 223, master: false }],  // HIGH
    bombs: [],
    kegs: [],
    pickups: [],
  },

  // 12. THE BELFRY — high master with nearby garlic + fire pickup
  {
    name: "THE BELFRY",
    par: 2, stakes: 5,
    blocks: [
      { x: 250, y: 300, w: 22, h: 240, t: "stone" },
      { x: 230, y: 285, w: 70, h: 15, t: "wood" },
    ],
    vampires: [{ x: 265, y: 263, master: true }],
    bombs: [{ x: 290, y: 275 }],  // garlic up top next to master
    kegs: [],
    pickups: [{ x: 120, y: 240, type: "fire" }],
  },

  // 13. SEESAW — plank on one pillar, vamps on each end
  {
    name: "SEESAW",
    par: 1, stakes: 5,
    blocks: [
      { x: 220, y: 430, w: 22, h: 110, t: "stone" },  // center pillar
      { x: 150, y: 415, w: 160, h: 15, t: "wood" },   // long plank
    ],
    vampires: [
      { x: 170, y: 393, master: false },  // left end
      { x: 290, y: 393, master: false },  // right end
    ],
    bombs: [],
    kegs: [],
    pickups: [],
  },

  // 14. HANGING COFFINS — three platforms at different heights
  {
    name: "HANGING COFFINS",
    par: 3, stakes: 5,
    blocks: [
      // Left low post and platform
      { x: 150, y: 480, w: 18, h: 60, t: "wood" },
      { x: 135, y: 465, w: 50, h: 15, t: "wood" },
      // Middle medium post and platform
      { x: 235, y: 420, w: 18, h: 120, t: "wood" },
      { x: 220, y: 405, w: 50, h: 15, t: "wood" },
      // Right high post and platform
      { x: 305, y: 350, w: 18, h: 190, t: "wood" },
      { x: 290, y: 335, w: 50, h: 15, t: "wood" },
    ],
    vampires: [
      { x: 160, y: 443, master: false },  // low
      { x: 245, y: 383, master: false },  // medium
      { x: 315, y: 313, master: false },  // high
    ],
    bombs: [],
    kegs: [],
    pickups: [{ x: 120, y: 230, type: "fire" }],
  },

  // 15. CRUMBLING TOWER — keg on small side tower, blast weakens main tower
  {
    name: "CRUMBLING TOWER",
    par: 2, stakes: 5,
    blocks: [
      { x: 235, y: 500, w: 22, h: 40, t: "stone" },   // main tower base
      { x: 235, y: 460, w: 22, h: 40, t: "stone" },
      { x: 235, y: 420, w: 22, h: 40, t: "stone" },
      { x: 235, y: 370, w: 22, h: 50, t: "stone" },
      { x: 235, y: 320, w: 22, h: 50, t: "stone" },
      { x: 225, y: 305, w: 42, h: 15, t: "wood" },
      // Small side post for keg — wood, taller than 40 so keg is elevated
      { x: 160, y: 480, w: 22, h: 60, t: "wood" },
      { x: 155, y: 465, w: 32, h: 15, t: "wood" },
    ],
    vampires: [{ x: 246, y: 283, master: true }],
    bombs: [],
    kegs: [{ x: 171, y: 453 }],  // sits on small wood platform
    pickups: [{ x: 270, y: 220, type: "fire" }],
  },

  // ═════════════════════════════════════════════════
  // ACT IV: CASTLE DRACULA — boss gauntlet (16-20)
  // ═════════════════════════════════════════════════

  // 16. BATTLEMENTS — 4 vamps along a wall top, arc accuracy
  {
    name: "BATTLEMENTS",
    par: 3, stakes: 5,
    blocks: [
      // Long low wall
      { x: 140, y: 440, w: 20, h: 100, t: "stone" },
      { x: 210, y: 440, w: 20, h: 100, t: "stone" },
      { x: 280, y: 440, w: 20, h: 100, t: "stone" },
      { x: 135, y: 425, w: 170, h: 15, t: "wood" },  // wall top
    ],
    vampires: [
      { x: 155, y: 403, master: false },
      { x: 200, y: 403, master: false },
      { x: 245, y: 403, master: true },
      { x: 290, y: 403, master: false },
    ],
    bombs: [{ x: 223, y: 415 }],  // garlic near master
    kegs: [],
    pickups: [{ x: 110, y: 280, type: "fire" }],
  },

  // 17. THE DRAWBRIDGE — wood bridge between two towers
  {
    name: "THE DRAWBRIDGE",
    par: 2, stakes: 5,
    blocks: [
      // Left tower — taller base
      { x: 140, y: 405, w: 22, h: 135, t: "stone" },
      { x: 125, y: 390, w: 55, h: 15, t: "wood" },  // left tower top platform
      // Bridge connecting the two tower tops (rests on both platforms' top edges at y=390)
      { x: 155, y: 375, w: 145, h: 15, t: "wood" },
      // Right tower — taller base
      { x: 290, y: 405, w: 22, h: 135, t: "stone" },
      { x: 275, y: 390, w: 55, h: 15, t: "wood" },  // right tower top platform
    ],
    vampires: [
      { x: 150, y: 368, master: false },  // left tower top (on tower platform above bridge? no — on the bridge left side)
      { x: 200, y: 353, master: false },  // bridge left
      { x: 255, y: 353, master: true },   // bridge right (MASTER)
      { x: 302, y: 368, master: false },  // right tower top
    ],
    bombs: [],
    kegs: [],
    pickups: [{ x: 115, y: 230, type: "fire" }],
  },

  // 18. COFFIN KEEP — 3 Masters, 1 fire pickup, force combos
  {
    name: "COFFIN KEEP",
    par: 3, stakes: 5,
    blocks: [
      // Low left Master on pedestal
      { x: 145, y: 515, w: 40, h: 25, t: "stone" },
      // Middle mid Master
      { x: 230, y: 430, w: 22, h: 110, t: "stone" },
      { x: 210, y: 415, w: 60, h: 15, t: "wood" },
      // High right Master
      { x: 305, y: 330, w: 18, h: 210, t: "stone" },
      { x: 285, y: 315, w: 55, h: 15, t: "wood" },
    ],
    vampires: [
      { x: 165, y: 493, master: true },   // low Master
      { x: 241, y: 393, master: true },   // mid Master
      { x: 313, y: 293, master: true },   // high Master
    ],
    bombs: [{ x: 241, y: 405 }],  // garlic next to mid master (kills Masters)
    kegs: [],
    pickups: [{ x: 110, y: 240, type: "fire" }],  // only 1 fire
  },

  // 19. BLOOD MOON — 5 vamps (2 Masters), kegs scattered
  {
    name: "BLOOD MOON",
    par: 4, stakes: 5,
    blocks: [
      // Ground row - stilt for left master
      { x: 135, y: 420, w: 20, h: 120, t: "stone" },
      { x: 120, y: 405, w: 50, h: 15, t: "wood" },
      // Mid thrall platform
      { x: 200, y: 520, w: 80, h: 20, t: "stone" },
      // Middle keg pedestal
      { x: 215, y: 525, w: 30, h: 15, t: "wood" },
      // Right tall stilt
      { x: 300, y: 350, w: 20, h: 190, t: "stone" },
      { x: 285, y: 335, w: 50, h: 15, t: "wood" },
      // High mid platform — supported by wood post reaching down to mid thrall platform top (y=520)
      { x: 215, y: 330, w: 20, h: 190, t: "wood" },
      { x: 200, y: 315, w: 50, h: 15, t: "wood" },
    ],
    vampires: [
      { x: 145, y: 383, master: true },    // left master
      { x: 220, y: 498, master: false },   // low thrall
      { x: 260, y: 498, master: false },   // low thrall
      { x: 225, y: 293, master: false },   // high mid
      { x: 310, y: 313, master: true },    // right master
    ],
    bombs: [{ x: 245, y: 510 }],  // garlic low center
    kegs: [{ x: 230, y: 513 }],
    pickups: [{ x: 110, y: 200, type: "fire" }],
  },

  // 20. CASTLE SIEGE — BOSS. 6 vamps (3 Masters), kegs, garlic, full gauntlet
  {
    name: "CASTLE SIEGE",
    par: 5, stakes: 5,
    blocks: [
      // Left low pedestal
      { x: 120, y: 515, w: 40, h: 25, t: "stone" },
      // Left keg pedestal
      { x: 175, y: 525, w: 30, h: 15, t: "wood" },
      // Middle tall tower with high master on top
      { x: 230, y: 300, w: 22, h: 240, t: "stone" },
      { x: 212, y: 285, w: 60, h: 15, t: "wood" },
      // Mid platform with 2 thralls — supported by two wood posts
      { x: 200, y: 445, w: 18, h: 95, t: "wood" },   // left post
      { x: 272, y: 445, w: 18, h: 95, t: "wood" },   // right post
      { x: 195, y: 430, w: 100, h: 15, t: "wood" },  // the platform resting on both posts
      // Right keg pedestal
      { x: 298, y: 525, w: 30, h: 15, t: "wood" },
      // Right stilt with master on top
      { x: 305, y: 420, w: 20, h: 120, t: "stone" },
      { x: 290, y: 405, w: 50, h: 15, t: "wood" },
    ],
    vampires: [
      { x: 140, y: 493, master: true },    // LOW left MASTER
      { x: 220, y: 408, master: false },   // mid platform left (thrall)
      { x: 270, y: 408, master: false },   // mid platform right (thrall)
      { x: 241, y: 263, master: true },    // HIGH CENTRAL MASTER (hardest)
      { x: 315, y: 383, master: true },    // right MASTER
      { x: 190, y: 493, master: false },   // low ground thrall
    ],
    bombs: [{ x: 241, y: 275 }],  // garlic near top master
    kegs: [
      { x: 191, y: 513 },  // left keg
      { x: 314, y: 513 },  // right keg
    ],
    pickups: [{ x: 115, y: 190, type: "fire" }],
  },
];
function StakeTheVampire({ onExit, onHighScore, highScore }) {
  const GW = 340, GH = 560;
  const LAUNCH_X = 55, LAUNCH_Y = 490;
  const GROUND_Y = GH - 20;
  const GRAVITY = 0.38;
  const MAX_DRAG = 90;
  const STAKE_R = 5;
  const VAMP_R = 14;
  const BOMB_R = 10;
  const KEG_R = 11;
  const PICKUP_R = 14;

  const [phase, setPhase] = useState("intro"); // intro | playing | levelclear | gameclear | gameover
  const [levelIdx, setLevelIdx] = useState(0);
  const [stakesLeft, setStakesLeft] = useState(5);
  const [totalStars, setTotalStars] = useState(0);
  const [levelStars, setLevelStars] = useState(0);
  const [sessionStars, setSessionStars] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [dragVec, setDragVec] = useState({ x: 0, y: 0 });
  const [onFire, setOnFire] = useState(false); // next shot is a fire arrow (armed)
  const [fireBank, setFireBank] = useState(0); // how many fire arrows the player has collected
  const [onExplosive, setOnExplosive] = useState(false); // explosive arrow armed
  const [explosiveBank, setExplosiveBank] = useState(0); // explosive arrows collected
  const [damageFlash, setDamageFlash] = useState(0); // rerender trigger for master dmg indicator

  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const phaseRef = useRef("intro");
  const stakesRef = useRef(5);
  const stakesUsedRef = useRef(0);
  const projectileRef = useRef(null);
  const blocksRef = useRef([]);
  const vampiresRef = useRef([]);
  const bombsRef = useRef([]);
  const kegsRef = useRef([]);
  const pickupsRef = useRef([]);
  const effectsRef = useRef([]);
  const draggingRef = useRef(false);
  const dragVecRef = useRef({ x: 0, y: 0 });
  const settleTimerRef = useRef(0);
  const onFireRef = useRef(false);
  const fireBankRef = useRef(0);
  const onExplosiveRef = useRef(false);
  const explosiveBankRef = useRef(0);
  const levelGenRef = useRef(0);  // increments on every level reset; used to cancel stale setTimeouts

  const resetLevel = (idx) => {
    // Invalidate any pending chain-reaction setTimeouts from the previous level
    levelGenRef.current += 1;
    const lvl = STAKE_LEVELS[idx];
    const newBlocks = lvl.blocks.map(b => ({ ...b, hp: b.t === "stone" ? 3 : 1, vx: 0, vy: 0, destroyed: false }));
    blocksRef.current = newBlocks;

    // Helper: find block directly below a point (within 8px tolerance)
    const findSupport = (x, bottomY) => {
      let best = null;
      let bestDist = Infinity;
      for (const b of newBlocks) {
        if (b.destroyed) continue;
        if (x >= b.x && x <= b.x + b.w) {
          const dist = b.y - bottomY;
          if (dist >= -1 && dist < 8 && dist < bestDist) {
            best = b;
            bestDist = dist;
          }
        }
      }
      // If no block, check if resting on ground
      if (!best && Math.abs(bottomY - GROUND_Y) < 8) return "ground";
      return best;
    };

    vampiresRef.current = lvl.vampires.map(v => {
      const coffinBottom = v.y + 24; // vampire.y + coffin (centered on v.y + 2, height 22)
      return {
        ...v, vx: 0, vy: 0, dead: false, damage: 0,
        falling: false,
        restingOn: findSupport(v.x, coffinBottom),
      };
    });
    bombsRef.current = lvl.bombs.map(b => ({
      ...b, exploded: false, vy: 0, falling: false,
      restingOn: findSupport(b.x, b.y + 12),
      gen: levelGenRef.current,
    }));
    kegsRef.current = lvl.kegs.map(k => ({
      ...k, exploded: false, vy: 0, falling: false,
      restingOn: findSupport(k.x, k.y + 12),
      gen: levelGenRef.current,
    }));
    pickupsRef.current = lvl.pickups.map(p => ({ ...p, collected: false }));
    effectsRef.current = [];
    projectileRef.current = null;
    stakesRef.current = lvl.stakes;
    stakesUsedRef.current = 0;
    onFireRef.current = false;
    onExplosiveRef.current = false;
    setStakesLeft(lvl.stakes);
    setOnFire(false);
    setOnExplosive(false);
    setDragging(false);
    draggingRef.current = false;
  };

  const startGame = () => {
    setLevelIdx(0);
    setSessionStars([]);
    setTotalStars(0);
    fireBankRef.current = 0;
    setFireBank(0);
    explosiveBankRef.current = 0;
    setExplosiveBank(0);
    resetLevel(0);
    phaseRef.current = "playing";
    setPhase("playing");
  };

  const toggleFireArrow = () => {
    if (phaseRef.current !== "playing") return;
    if (projectileRef.current) return;
    if (fireBankRef.current <= 0) {
      onFireRef.current = false;
      setOnFire(false);
      return;
    }
    onFireRef.current = !onFireRef.current;
    setOnFire(onFireRef.current);
    // Arming fire disarms explosive
    if (onFireRef.current) {
      onExplosiveRef.current = false;
      setOnExplosive(false);
    }
  };

  const toggleExplosiveArrow = () => {
    if (phaseRef.current !== "playing") return;
    if (projectileRef.current) return;
    if (explosiveBankRef.current <= 0) {
      onExplosiveRef.current = false;
      setOnExplosive(false);
      return;
    }
    onExplosiveRef.current = !onExplosiveRef.current;
    setOnExplosive(onExplosiveRef.current);
    if (onExplosiveRef.current) {
      onFireRef.current = false;
      setOnFire(false);
    }
  };

  const getCanvasPoint = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
    return {
      x: (t.clientX - rect.left) * (GW / rect.width),
      y: (t.clientY - rect.top) * (GH / rect.height),
    };
  };

  const onDown = (e) => {
    e.preventDefault();
    if (phaseRef.current !== "playing") return;
    if (projectileRef.current) return;
    // Allow drag if any ammo available (stakes, fire, or explosive)
    if (stakesRef.current <= 0 && fireBankRef.current <= 0 && explosiveBankRef.current <= 0) return;
    draggingRef.current = true;
    setDragging(true);
    dragVecRef.current = { x: 0, y: 0 };
    setDragVec({ x: 0, y: 0 });
  };

  const onMove = (e) => {
    if (!draggingRef.current) return;
    if (e.preventDefault && e.cancelable) e.preventDefault();
    const p = getCanvasPoint(e);
    let dx = LAUNCH_X - p.x;
    let dy = LAUNCH_Y - p.y;
    const len = Math.sqrt(dx*dx + dy*dy);
    if (len > MAX_DRAG) {
      dx = (dx / len) * MAX_DRAG;
      dy = (dy / len) * MAX_DRAG;
    }
    dragVecRef.current = { x: dx, y: dy };
    setDragVec({ x: dx, y: dy });
  };

  const onUp = (e) => {
    if (!draggingRef.current) return;
    if (e && e.preventDefault && e.cancelable) e.preventDefault();
    draggingRef.current = false;
    setDragging(false);
    const { x: dx, y: dy } = dragVecRef.current;
    const len = Math.sqrt(dx*dx + dy*dy);
    if (len < 10) {
      setDragVec({ x: 0, y: 0 });
      return;
    }
    // Determine shot type:
    // Priority: armed explosive > armed fire > regular stake > unarmed fire > unarmed explosive
    let shotType = "stake";
    if (onExplosiveRef.current && explosiveBankRef.current > 0) {
      shotType = "explosive";
    } else if (onFireRef.current && fireBankRef.current > 0) {
      shotType = "fire";
    } else if (stakesRef.current > 0) {
      shotType = "stake";
    } else if (fireBankRef.current > 0) {
      shotType = "fire";
    } else if (explosiveBankRef.current > 0) {
      shotType = "explosive";
    } else {
      // No ammo
      setDragVec({ x: 0, y: 0 });
      return;
    }
    const power = 0.18;
    projectileRef.current = {
      x: LAUNCH_X,
      y: LAUNCH_Y,
      vx: dx * power,
      vy: dy * power,
      rot: Math.atan2(dy, dx),
      rotSpeed: 0.3,
      fire: shotType === "fire",
      explosive: shotType === "explosive",
    };
    if (shotType === "fire") {
      fireBankRef.current -= 1;
      setFireBank(fireBankRef.current);
    } else if (shotType === "explosive") {
      explosiveBankRef.current -= 1;
      setExplosiveBank(explosiveBankRef.current);
    } else {
      stakesRef.current -= 1;
      stakesUsedRef.current += 1;
      setStakesLeft(stakesRef.current);
    }
    onFireRef.current = false;
    setOnFire(false);
    onExplosiveRef.current = false;
    setOnExplosive(false);
    setDragVec({ x: 0, y: 0 });
    GameSFX.sbPaddleHit();
  };

  useEffect(() => {
    if (phase !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const step = () => {
      if (phaseRef.current !== "playing") return;

      const proj = projectileRef.current;
      if (proj) {
        proj.vy += GRAVITY;
        proj.x += proj.vx;
        proj.y += proj.vy;
        proj.rot += proj.rotSpeed;

        // Fire trail particles
        if (proj.fire && Math.random() < 0.7) {
          effectsRef.current.push({
            type:"flame",
            x: proj.x + (Math.random() - 0.5) * 4,
            y: proj.y + (Math.random() - 0.5) * 4,
            vx: -proj.vx * 0.2 + (Math.random() - 0.5) * 0.6,
            vy: -proj.vy * 0.2 - 0.5,
            life: 20,
            maxLife: 20,
            r: 3 + Math.random() * 2,
          });
        }

        if (proj.x < 0 || proj.x > GW || proj.y > GH + 20) {
          projectileRef.current = null;
        }

        // Fire pickup collision — adds to fire bank
        if (proj) {
          for (const pu of pickupsRef.current) {
            if (pu.collected) continue;
            const dx = proj.x - pu.x, dy = proj.y - pu.y;
            if (Math.sqrt(dx*dx + dy*dy) < PICKUP_R + STAKE_R) {
              pu.collected = true;
              fireBankRef.current += 1;
              setFireBank(fireBankRef.current);
              GameSFX.sbRoundClear();
              effectsRef.current.push({
                type:"sparkle", x:pu.x, y:pu.y, radius:5, maxRadius:30, alpha:1,
              });
            }
          }
        }

        // Powder keg collision — reward explosive arrow
        if (proj) {
          for (const keg of kegsRef.current) {
            if (keg.exploded) continue;
            const dx = proj.x - keg.x, dy = proj.y - keg.y;
            if (Math.sqrt(dx*dx + dy*dy) < KEG_R + STAKE_R) {
              // Reward: +1 explosive arrow for hitting a keg
              explosiveBankRef.current += 1;
              setExplosiveBank(explosiveBankRef.current);
              detonateKeg(keg);
              projectileRef.current = null;
              break;
            }
          }
        }

        // Garlic bomb collision
        if (proj) {
          for (const bomb of bombsRef.current) {
            if (bomb.exploded) continue;
            const dx = proj.x - bomb.x, dy = proj.y - bomb.y;
            if (Math.sqrt(dx*dx + dy*dy) < BOMB_R + STAKE_R) {
              detonateBomb(bomb);
              projectileRef.current = null;
              break;
            }
          }
        }

        // Vampire collision
        if (proj) {
          for (const v of vampiresRef.current) {
            if (v.dead) continue;
            const dx = proj.x - v.x, dy = proj.y - v.y;
            if (Math.sqrt(dx*dx + dy*dy) < VAMP_R + STAKE_R) {
              if (proj.explosive) {
                // Explosive detonates — AoE kills in blast radius
                detonateExplosive(proj.x, proj.y);
                projectileRef.current = null;
                break;
              }
              if (proj.fire) {
                // Fire kills anything
                killVampire(v);
                effectsRef.current.push({
                  type:"explosion", x:v.x, y:v.y,
                  radius:6, maxRadius:35, alpha:1, fire:true,
                });
              } else if (v.master) {
                // Master — stakes damage, don't kill in 1
                v.damage += 1;
                setDamageFlash(f => f + 1);
                if (v.damage >= 2) {
                  killVampire(v);
                } else {
                  effectsRef.current.push({
                    type:"spark", x:proj.x, y:proj.y,
                    age:0,
                  });
                  GameSFX.sbBounce();
                }
              } else {
                killVampire(v);
                GameSFX.sbRoundClear();
              }
              projectileRef.current = null;
              break;
            }
          }
        }

        // Block collision
        if (proj) {
          for (const b of blocksRef.current) {
            if (b.destroyed) continue;
            if (proj.x > b.x - STAKE_R && proj.x < b.x + b.w + STAKE_R &&
                proj.y > b.y - STAKE_R && proj.y < b.y + b.h + STAKE_R) {
              if (proj.explosive) {
                // Explosive arrow detonates on contact
                detonateExplosive(proj.x, proj.y);
                projectileRef.current = null;
                break;
              }
              if (b.t === "wood") {
                b.hp -= proj.fire ? 2 : 1;
                if (b.hp <= 0) b.destroyed = true;
                projectileRef.current = null;
                GameSFX.sbBounce();
              } else {
                // Stone — bounce
                const bcx = b.x + b.w/2, bcy = b.y + b.h/2;
                const ddx = proj.x - bcx, ddy = proj.y - bcy;
                if (Math.abs(ddx / b.w) > Math.abs(ddy / b.h)) {
                  proj.vx = -proj.vx * 0.4;
                  proj.x = ddx > 0 ? b.x + b.w + STAKE_R : b.x - STAKE_R;
                } else {
                  proj.vy = -proj.vy * 0.4;
                  proj.y = ddy > 0 ? b.y + b.h + STAKE_R : b.y - STAKE_R;
                }
                b.hp -= proj.fire ? 1 : 0.5;
                if (b.hp <= 0) b.destroyed = true;
                GameSFX.sbBounce();
              }
              break;
            }
          }
        }

        if (proj && proj.y > GROUND_Y - 5) {
          // Ground hit — explosive detonates
          if (proj.explosive) {
            detonateExplosive(proj.x, GROUND_Y - 5);
          }
          projectileRef.current = null;
        }
      }

      // Blocks falling gravity
      for (const b of blocksRef.current) {
        if (b.destroyed) continue;
        const supportY = b.y + b.h;
        if (supportY >= GROUND_Y) continue;

        // Divide the block into 3 regions: left third, middle third, right third
        // A region is "supported" if any other block's top touches it from below
        const leftStart = b.x;
        const leftEnd = b.x + b.w / 3;
        const midStart = b.x + b.w / 3;
        const midEnd = b.x + 2 * b.w / 3;
        const rightStart = b.x + 2 * b.w / 3;
        const rightEnd = b.x + b.w;
        let supportLeft = false, supportCenter = false, supportRight = false;
        for (const other of blocksRef.current) {
          if (other === b || other.destroyed) continue;
          if (other.y >= supportY && other.y <= supportY + 3) {
            const oL = other.x, oR = other.x + other.w;
            // Does this other block overlap any region?
            if (oR > leftStart && oL < leftEnd) supportLeft = true;
            if (oR > midStart && oL < midEnd) supportCenter = true;
            if (oR > rightStart && oL < rightEnd) supportRight = true;
          }
        }

        // Stability rules:
        // - Narrow blocks (w <= 40 or taller-than-wide): any region works
        // - Wide blocks: center region OR both sides
        const isWide = b.w > 40 && b.w >= b.h;
        let supported;
        if (isWide) {
          supported = supportCenter || (supportLeft && supportRight);
        } else {
          supported = supportLeft || supportCenter || supportRight;
        }

        if (!supported) {
          b.vy += GRAVITY;
          b.y += b.vy;
          if (b.y + b.h >= GROUND_Y) {
            b.y = GROUND_Y - b.h;
            b.vy = 0;
          }
        }
      }

      // ── FALLING OBJECTS (vampires, bombs, kegs) ──
      // Helper: find what an item at (x, bottomY) is resting on right now
      const findCurrentSupport = (x, bottomY) => {
        for (const b of blocksRef.current) {
          if (b.destroyed) continue;
          if (x >= b.x && x <= b.x + b.w) {
            const dist = b.y - bottomY;
            if (dist >= -2 && dist < 4) return b;
          }
        }
        if (Math.abs(bottomY - GROUND_Y) < 3) return "ground";
        return null;
      };

      // Vampires fall if their support is gone or moving
      for (const v of vampiresRef.current) {
        if (v.dead) continue;
        const coffinBottom = v.y + 24;
        if (!v.falling) {
          // Check if support is still valid
          const r = v.restingOn;
          const lost = r === null || (r !== "ground" && (r.destroyed || Math.abs(r.vy) > 0.3));
          if (lost) {
            // Try to re-find support at current position
            const newSup = findCurrentSupport(v.x, coffinBottom);
            if (newSup && newSup !== "ground" && Math.abs(newSup.vy) > 0.3) {
              v.falling = true;
            } else if (!newSup) {
              v.falling = true;
            } else {
              v.restingOn = newSup;
            }
          }
        }
        if (v.falling) {
          v.vy += GRAVITY;
          v.y += v.vy;
          // Check landing
          const sup = findCurrentSupport(v.x, v.y + 24);
          if (sup) {
            if (sup === "ground") {
              v.y = GROUND_Y - 24;
            } else {
              v.y = sup.y - 24;
            }
            // Hard landing from height = dies
            if (v.vy > 5) {
              killVampire(v);
              continue;
            }
            v.vy = 0;
            v.falling = false;
            v.restingOn = sup;
          } else if (v.y > GH + 30) {
            // Fell off screen
            v.dead = true;
          }
        }
      }

      // Bombs fall — and detonate on hard impact
      for (const bomb of bombsRef.current) {
        if (bomb.exploded) continue;
        const bombBottom = bomb.y + 12;
        if (!bomb.falling) {
          const r = bomb.restingOn;
          const lost = r === null || (r !== "ground" && (r.destroyed || Math.abs(r.vy) > 0.3));
          if (lost) {
            const newSup = findCurrentSupport(bomb.x, bombBottom);
            if (!newSup) bomb.falling = true;
            else bomb.restingOn = newSup;
          }
        }
        if (bomb.falling) {
          bomb.vy += GRAVITY;
          bomb.y += bomb.vy;
          const sup = findCurrentSupport(bomb.x, bomb.y + 12);
          if (sup) {
            // Bomb hitting hard = detonate
            if (bomb.vy > 3) {
              detonateBomb(bomb);
              continue;
            }
            bomb.y = (sup === "ground" ? GROUND_Y : sup.y) - 12;
            bomb.vy = 0;
            bomb.falling = false;
            bomb.restingOn = sup;
          } else if (bomb.y > GH + 30) {
            bomb.exploded = true;
          }
        }
      }

      // Kegs fall — and detonate on hard impact
      for (const keg of kegsRef.current) {
        if (keg.exploded) continue;
        const kegBottom = keg.y + 12;
        if (!keg.falling) {
          const r = keg.restingOn;
          const lost = r === null || (r !== "ground" && (r.destroyed || Math.abs(r.vy) > 0.3));
          if (lost) {
            const newSup = findCurrentSupport(keg.x, kegBottom);
            if (!newSup) keg.falling = true;
            else keg.restingOn = newSup;
          }
        }
        if (keg.falling) {
          keg.vy += GRAVITY;
          keg.y += keg.vy;
          const sup = findCurrentSupport(keg.x, keg.y + 12);
          if (sup) {
            if (keg.vy > 3) {
              detonateKeg(keg);
              continue;
            }
            keg.y = (sup === "ground" ? GROUND_Y : sup.y) - 12;
            keg.vy = 0;
            keg.falling = false;
            keg.restingOn = sup;
          } else if (keg.y > GH + 30) {
            keg.exploded = true;
          }
        }
      }

      // Falling blocks crush vampires
      for (const v of vampiresRef.current) {
        if (v.dead) continue;
        for (const b of blocksRef.current) {
          if (b.destroyed) continue;
          if (Math.abs(b.vy) < 0.1) continue;
          if (v.x > b.x && v.x < b.x + b.w &&
              v.y > b.y && v.y < b.y + b.h) {
            killVampire(v);
            break;
          }
        }
      }

      // Effects update
      effectsRef.current = effectsRef.current.filter(ef => {
        if (ef.type === "explosion" || ef.type === "sparkle") {
          ef.radius += (ef.maxRadius - ef.radius) * 0.15;
          ef.alpha -= 0.025;
          return ef.alpha > 0;
        }
        if (ef.type === "kegblast") {
          ef.radius += (ef.maxRadius - ef.radius) * 0.12;
          ef.alpha -= 0.02;
          return ef.alpha > 0;
        }
        if (ef.type === "shockwave") {
          ef.radius += (ef.maxRadius - ef.radius) * 0.18;
          ef.alpha -= 0.04;
          return ef.alpha > 0;
        }
        if (ef.type === "ember") {
          ef.x += ef.vx;
          ef.y += ef.vy;
          ef.vy += 0.15;
          ef.vx *= 0.96;
          ef.life -= 1;
          return ef.life > 0;
        }
        if (ef.type === "flame") {
          ef.x += ef.vx;
          ef.y += ef.vy;
          ef.life -= 1;
          ef.vy += 0.05;
          return ef.life > 0;
        }
        if (ef.type === "bloodsplat") {
          ef.age = (ef.age || 0) + 1;
          return ef.age < 40;
        }
        if (ef.type === "spark") {
          ef.age = (ef.age || 0) + 1;
          return ef.age < 15;
        }
        return false;
      });

      settleTimerRef.current += 1;
      if (!projectileRef.current && settleTimerRef.current > 30) {
        const alive = vampiresRef.current.filter(v => !v.dead).length;
        if (alive === 0) {
          onLevelClear();
        } else if (stakesRef.current === 0 && fireBankRef.current === 0 && explosiveBankRef.current === 0) {
          // Out of all ammo — fail
          if (effectsRef.current.length === 0) {
            const gen = levelGenRef.current;
            setTimeout(() => {
              if (gen !== levelGenRef.current) return;
              onLevelFail();
            }, 800);
            settleTimerRef.current = -10000;
          }
        }
      }
      if (projectileRef.current) settleTimerRef.current = 0;

      draw(ctx);
      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [phase, levelIdx]);

  const detonateBomb = (bomb) => {
    // Abort if this bomb belongs to a stale level (prevents ghost explosions after level transition)
    if (bomb.gen !== undefined && bomb.gen !== levelGenRef.current) return;
    if (bomb.exploded) return;
    bomb.exploded = true;
    effectsRef.current.push({
      type:"explosion", x:bomb.x, y:bomb.y,
      radius:6, maxRadius:55, alpha:1,
    });
    for (const v of vampiresRef.current) {
      if (v.dead) continue;
      const dx = v.x - bomb.x, dy = v.y - bomb.y;
      if (Math.sqrt(dx*dx + dy*dy) < 60) {
        killVampire(v); // Garlic kills Masters too
      }
    }
    for (const b of blocksRef.current) {
      if (b.destroyed) continue;
      const cx = b.x + b.w/2, cy = b.y + b.h/2;
      const dx = cx - bomb.x, dy = cy - bomb.y;
      if (Math.sqrt(dx*dx + dy*dy) < 60) {
        b.hp -= 2;
        if (b.hp <= 0) b.destroyed = true;
      }
    }
    // Chain-trigger other bombs/kegs in radius (guarded against level reset)
    const gen = levelGenRef.current;
    for (const b of bombsRef.current) {
      if (b.exploded || b === bomb) continue;
      const dx = b.x - bomb.x, dy = b.y - bomb.y;
      if (Math.sqrt(dx*dx + dy*dy) < 70) {
        setTimeout(() => {
          if (gen !== levelGenRef.current) return;
          if (!b.exploded) detonateBomb(b);
        }, 80);
      }
    }
    for (const k of kegsRef.current) {
      if (k.exploded) continue;
      const dx = k.x - bomb.x, dy = k.y - bomb.y;
      if (Math.sqrt(dx*dx + dy*dy) < 70) {
        setTimeout(() => {
          if (gen !== levelGenRef.current) return;
          if (!k.exploded) detonateKeg(k);
        }, 80);
      }
    }
    GameSFX.fgHit();
  };

  const detonateKeg = (keg) => {
    // Abort if this keg belongs to a stale level
    if (keg.gen !== undefined && keg.gen !== levelGenRef.current) return;
    if (keg.exploded) return;
    keg.exploded = true;
    const BLAST_R = 130;  // much bigger
    effectsRef.current.push({
      type:"kegblast", x:keg.x, y:keg.y,
      radius:10, maxRadius:BLAST_R, alpha:1,
    });
    // Extra visual: shockwave ring
    effectsRef.current.push({
      type:"shockwave", x:keg.x, y:keg.y,
      radius:5, maxRadius:BLAST_R * 1.3, alpha:1,
    });
    // Extra visual: ember particles
    for (let i = 0; i < 14; i++) {
      const ang = (i / 14) * Math.PI * 2 + Math.random() * 0.4;
      const spd = 3 + Math.random() * 3;
      effectsRef.current.push({
        type:"ember",
        x: keg.x, y: keg.y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: 30, maxLife: 30,
        r: 2 + Math.random() * 2,
      });
    }
    for (const v of vampiresRef.current) {
      if (v.dead) continue;
      const dx = v.x - keg.x, dy = v.y - keg.y;
      if (Math.sqrt(dx*dx + dy*dy) < BLAST_R) {
        killVampire(v);
      }
    }
    for (const b of blocksRef.current) {
      if (b.destroyed) continue;
      const cx = b.x + b.w/2, cy = b.y + b.h/2;
      const dx = cx - keg.x, dy = cy - keg.y;
      const d = Math.sqrt(dx*dx + dy*dy);
      if (d < BLAST_R) {
        // Closer = more damage. Inner radius destroys completely.
        if (d < BLAST_R * 0.6) {
          b.destroyed = true;
        } else {
          b.hp -= 3;
          if (b.hp <= 0) b.destroyed = true;
        }
      }
    }
    // Chain reaction — wider radius (guarded against level reset)
    const gen = levelGenRef.current;
    for (const k of kegsRef.current) {
      if (k.exploded || k === keg) continue;
      const dx = k.x - keg.x, dy = k.y - keg.y;
      if (Math.sqrt(dx*dx + dy*dy) < BLAST_R + 20) {
        setTimeout(() => {
          if (gen !== levelGenRef.current) return;
          if (!k.exploded) detonateKeg(k);
        }, 150);
      }
    }
    for (const b of bombsRef.current) {
      if (b.exploded) continue;
      const dx = b.x - keg.x, dy = b.y - keg.y;
      if (Math.sqrt(dx*dx + dy*dy) < BLAST_R + 10) {
        setTimeout(() => {
          if (gen !== levelGenRef.current) return;
          if (!b.exploded) detonateBomb(b);
        }, 150);
      }
    }
    GameSFX.fgHit();
  };

  const detonateExplosive = (x, y) => {
    const BLAST_R = 70;
    effectsRef.current.push({
      type:"kegblast", x, y,
      radius:8, maxRadius:BLAST_R, alpha:1,
    });
    effectsRef.current.push({
      type:"shockwave", x, y,
      radius:5, maxRadius:BLAST_R * 1.3, alpha:1,
    });
    for (let i = 0; i < 10; i++) {
      const ang = (i / 10) * Math.PI * 2 + Math.random() * 0.4;
      const spd = 2 + Math.random() * 2.5;
      effectsRef.current.push({
        type:"ember",
        x, y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: 25, maxLife: 25,
        r: 1.5 + Math.random() * 2,
      });
    }
    for (const v of vampiresRef.current) {
      if (v.dead) continue;
      const dx = v.x - x, dy = v.y - y;
      if (Math.sqrt(dx*dx + dy*dy) < BLAST_R) {
        killVampire(v);
      }
    }
    for (const b of blocksRef.current) {
      if (b.destroyed) continue;
      const cx = b.x + b.w/2, cy = b.y + b.h/2;
      const dx = cx - x, dy = cy - y;
      const d = Math.sqrt(dx*dx + dy*dy);
      if (d < BLAST_R) {
        if (d < BLAST_R * 0.6) {
          b.destroyed = true;
        } else {
          b.hp -= 2;
          if (b.hp <= 0) b.destroyed = true;
        }
      }
    }
    // Chain to bombs and kegs (guarded against level reset)
    const gen = levelGenRef.current;
    for (const bomb of bombsRef.current) {
      if (bomb.exploded) continue;
      const dx = bomb.x - x, dy = bomb.y - y;
      if (Math.sqrt(dx*dx + dy*dy) < BLAST_R + 10) {
        setTimeout(() => {
          if (gen !== levelGenRef.current) return;
          if (!bomb.exploded) detonateBomb(bomb);
        }, 100);
      }
    }
    for (const k of kegsRef.current) {
      if (k.exploded) continue;
      const dx = k.x - x, dy = k.y - y;
      if (Math.sqrt(dx*dx + dy*dy) < BLAST_R + 10) {
        setTimeout(() => {
          if (gen !== levelGenRef.current) return;
          if (!k.exploded) detonateKeg(k);
        }, 100);
      }
    }
    GameSFX.fgHit();
  };

  const killVampire = (v) => {
    v.dead = true;
    effectsRef.current.push({ type:"bloodsplat", x:v.x, y:v.y, age:0 });
  };

  const onLevelClear = () => {
    if (phaseRef.current !== "playing") return;
    const lvl = STAKE_LEVELS[levelIdx];
    if (!lvl) return; // v39: defensive guard - should never happen but prevents crash
    const used = stakesUsedRef.current;
    let stars = 0;
    if (used <= lvl.par) stars = 3;
    else if (used === lvl.par + 1) stars = 2;
    else stars = 1;
    setLevelStars(stars);
    // v39: clamp sessionStars to STAKE_LEVELS.length so a stray double-fire can't blow up gameclear render
    setSessionStars(prev => {
      const next = [...prev, stars];
      return next.length > STAKE_LEVELS.length ? next.slice(0, STAKE_LEVELS.length) : next;
    });
    setTotalStars(t => t + stars);
    phaseRef.current = "levelclear";
    setPhase("levelclear");
  };

  const onLevelFail = () => {
    if (phaseRef.current !== "playing") return;
    phaseRef.current = "gameover";
    setPhase("gameover");
  };

  const nextLevel = () => {
    // v39: guard against double-fire from rapid button clicks after level clear
    if (phaseRef.current !== "levelclear") return;
    const next = levelIdx + 1;
    if (next >= STAKE_LEVELS.length) {
      const finalStars = totalStars;
      onHighScore(finalStars * 100);
      phaseRef.current = "gameclear";
      setPhase("gameclear");
      return;
    }
    setLevelIdx(next);
    resetLevel(next);
    phaseRef.current = "playing";
    setPhase("playing");
  };

  const retryLevel = () => {
    resetLevel(levelIdx);
    phaseRef.current = "playing";
    setPhase("playing");
  };

  const draw = (ctx) => {
    const now = performance.now();

    // ── SKY ──
    const sky = ctx.createLinearGradient(0, 0, 0, GH);
    sky.addColorStop(0, "#1a0820");
    sky.addColorStop(0.5, "#280818");
    sky.addColorStop(1, "#08030a");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, GW, GH);

    // Stars
    ctx.fillStyle = "rgba(255,240,200,0.35)";
    for (let i = 0; i < 40; i++) {
      const sx = (i * 71) % GW;
      const sy = (i * 37) % 180;
      const sz = (i % 4 === 0) ? 1.5 : 1;
      ctx.fillRect(sx, sy, sz, sz);
    }

    // ── MOON ──
    const moonX = GW - 55, moonY = 65, moonR = 28;
    const glow = ctx.createRadialGradient(moonX, moonY, moonR, moonX, moonY, moonR + 35);
    glow.addColorStop(0, "rgba(255,230,170,0.25)");
    glow.addColorStop(1, "rgba(255,230,170,0)");
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(moonX, moonY, moonR + 35, 0, Math.PI*2); ctx.fill();
    const moonGrad = ctx.createRadialGradient(moonX - 8, moonY - 8, 2, moonX, moonY, moonR);
    moonGrad.addColorStop(0, "#fff5e0");
    moonGrad.addColorStop(0.6, "#e8d0a0");
    moonGrad.addColorStop(1, "#b89060");
    ctx.fillStyle = moonGrad;
    ctx.beginPath(); ctx.arc(moonX, moonY, moonR, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "rgba(120,80,50,0.35)";
    ctx.beginPath(); ctx.arc(moonX - 10, moonY - 5, 4, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(moonX + 6, moonY + 4, 5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(moonX - 2, moonY + 12, 3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(moonX + 12, moonY - 10, 2.5, 0, Math.PI*2); ctx.fill();

    // Bats
    const drawBat = (x, y, size, phase) => {
      ctx.save();
      ctx.translate(x, y);
      const flap = Math.sin(phase) * 0.35;
      ctx.fillStyle = "#0a0205";
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.35, size * 0.5, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.1);
      ctx.quadraticCurveTo(-size * 1.2, -size * 0.6 - flap * size * 0.4, -size * 1.8, -size * 0.2 - flap * size * 0.3);
      ctx.quadraticCurveTo(-size * 1.5, size * 0.1, -size * 1.3, 0);
      ctx.quadraticCurveTo(-size * 1.4, size * 0.15, -size * 1.1, size * 0.1);
      ctx.quadraticCurveTo(-size * 0.9, size * 0.25, -size * 0.8, size * 0.1);
      ctx.quadraticCurveTo(-size * 0.6, size * 0.2, -size * 0.5, size * 0.05);
      ctx.quadraticCurveTo(-size * 0.3, size * 0.15, 0, size * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.1);
      ctx.quadraticCurveTo(size * 1.2, -size * 0.6 - flap * size * 0.4, size * 1.8, -size * 0.2 - flap * size * 0.3);
      ctx.quadraticCurveTo(size * 1.5, size * 0.1, size * 1.3, 0);
      ctx.quadraticCurveTo(size * 1.4, size * 0.15, size * 1.1, size * 0.1);
      ctx.quadraticCurveTo(size * 0.9, size * 0.25, size * 0.8, size * 0.1);
      ctx.quadraticCurveTo(size * 0.6, size * 0.2, size * 0.5, size * 0.05);
      ctx.quadraticCurveTo(size * 0.3, size * 0.15, 0, size * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-size * 0.2, -size * 0.35);
      ctx.lineTo(-size * 0.15, -size * 0.55);
      ctx.lineTo(-size * 0.05, -size * 0.35);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(size * 0.2, -size * 0.35);
      ctx.lineTo(size * 0.15, -size * 0.55);
      ctx.lineTo(size * 0.05, -size * 0.35);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };
    drawBat(moonX - 20, moonY + 15, 10, now * 0.012);
    drawBat(moonX + 18, moonY - 8, 8, now * 0.015 + 1);
    drawBat(moonX - 5, moonY + 30, 6, now * 0.018 + 2);
    drawBat(moonX + 28, moonY + 18, 7, now * 0.013 + 3);

    // Mountains
    ctx.fillStyle = "#15060f";
    ctx.beginPath();
    ctx.moveTo(0, GH - 200);
    ctx.lineTo(40, GH - 235); ctx.lineTo(90, GH - 215); ctx.lineTo(140, GH - 255);
    ctx.lineTo(190, GH - 220); ctx.lineTo(240, GH - 245); ctx.lineTo(290, GH - 210);
    ctx.lineTo(GW, GH - 230); ctx.lineTo(GW, GH - 180); ctx.lineTo(0, GH - 180);
    ctx.closePath(); ctx.fill();

    // Castle
    ctx.fillStyle = "#080105";
    ctx.fillRect(0, GH - 180, GW, 160);
    for (let x = 0; x < GW; x += 16) {
      ctx.fillRect(x, GH - 185, 10, 5);
    }
    const drawTower = (tx, ty, tw, th) => {
      ctx.fillStyle = "#080105";
      ctx.fillRect(tx, ty, tw, th);
      ctx.strokeStyle = "rgba(30,10,20,0.8)";
      ctx.lineWidth = 1;
      ctx.strokeRect(tx, ty, tw, th);
      ctx.fillStyle = "#1a0810";
      ctx.beginPath();
      ctx.moveTo(tx - 3, ty); ctx.lineTo(tx + tw / 2, ty - 18); ctx.lineTo(tx + tw + 3, ty);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(40,20,30,0.8)"; ctx.stroke();
      ctx.strokeStyle = "#2a1020"; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tx + tw / 2, ty - 18); ctx.lineTo(tx + tw / 2, ty - 26);
      ctx.stroke();
      const winX = tx + tw / 2 - 4, winY = ty + 15;
      ctx.fillStyle = "rgba(255,100,30,0.7)";
      ctx.shadowColor = "rgba(255,120,40,0.8)"; ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(winX, winY + 10); ctx.lineTo(winX, winY + 2);
      ctx.quadraticCurveTo(winX + 4, winY - 2, winX + 8, winY + 2);
      ctx.lineTo(winX + 8, winY + 10); ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    };
    drawTower(30, GH - 250, 22, 70);
    drawTower(GW - 52, GH - 270, 22, 90);

    // Ground
    ctx.fillStyle = "#15060e";
    ctx.fillRect(0, GROUND_Y, GW, GH - GROUND_Y);
    ctx.fillStyle = "#1e0a14";
    for (let gy = GROUND_Y + 2; gy < GH; gy += 6) {
      for (let gx = ((gy % 12 === 0) ? 0 : 4); gx < GW; gx += 10) {
        ctx.beginPath(); ctx.arc(gx, gy, 3, 0, Math.PI*2); ctx.fill();
      }
    }
    ctx.strokeStyle = "rgba(80,50,70,0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, GROUND_Y); ctx.lineTo(GW, GROUND_Y); ctx.stroke();

    // Blocks
    for (const b of blocksRef.current) {
      if (b.destroyed) continue;
      if (b.t === "wood") {
        const wgrad = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
        wgrad.addColorStop(0, "#5a3a20");
        wgrad.addColorStop(0.4, "#4a2e18");
        wgrad.addColorStop(1, "#2a1608");
        ctx.fillStyle = wgrad;
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.strokeStyle = "rgba(20,10,0,0.5)";
        ctx.lineWidth = 1;
        if (b.h >= b.w) {
          for (let gy = b.y + 4; gy < b.y + b.h - 2; gy += Math.max(4, Math.floor(b.h / 4))) {
            ctx.beginPath(); ctx.moveTo(b.x + 2, gy); ctx.lineTo(b.x + b.w - 2, gy); ctx.stroke();
          }
        } else {
          for (let gx = b.x + 4; gx < b.x + b.w - 2; gx += Math.max(4, Math.floor(b.w / 4))) {
            ctx.beginPath(); ctx.moveTo(gx, b.y + 2); ctx.lineTo(gx, b.y + b.h - 2); ctx.stroke();
          }
        }
        ctx.fillStyle = "#2a2a30";
        if (b.h >= b.w) {
          ctx.fillRect(b.x, b.y, b.w, 3);
          ctx.fillRect(b.x, b.y + b.h - 3, b.w, 3);
          ctx.fillStyle = "#5a5a65";
          ctx.fillRect(b.x + 2, b.y + 1, 2, 1);
          ctx.fillRect(b.x + b.w - 4, b.y + 1, 2, 1);
          ctx.fillRect(b.x + 2, b.y + b.h - 2, 2, 1);
          ctx.fillRect(b.x + b.w - 4, b.y + b.h - 2, 2, 1);
        } else {
          ctx.fillRect(b.x, b.y, 3, b.h);
          ctx.fillRect(b.x + b.w - 3, b.y, 3, b.h);
          ctx.fillStyle = "#5a5a65";
          ctx.fillRect(b.x + 1, b.y + 2, 1, 2);
          ctx.fillRect(b.x + 1, b.y + b.h - 4, 1, 2);
          ctx.fillRect(b.x + b.w - 2, b.y + 2, 1, 2);
          ctx.fillRect(b.x + b.w - 2, b.y + b.h - 4, 1, 2);
        }
        ctx.strokeStyle = "#1a0a00";
        ctx.lineWidth = 1;
        ctx.strokeRect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1);
      } else {
        const sgrad = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
        sgrad.addColorStop(0, "#4a4a55");
        sgrad.addColorStop(0.5, "#3a3a42");
        sgrad.addColorStop(1, "#1a1a22");
        ctx.fillStyle = sgrad;
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.fillStyle = "rgba(255,255,255,0.05)";
        for (let i = 0; i < 5; i++) {
          const sx = b.x + ((i * 13 + Math.floor(b.y)) % (b.w - 2)) + 1;
          const sy = b.y + ((i * 23 + Math.floor(b.x)) % (b.h - 2)) + 1;
          ctx.fillRect(sx, sy, 1, 1);
        }
        ctx.strokeStyle = "#6a6a75";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(b.x + 1, b.y + 1); ctx.lineTo(b.x + b.w - 1, b.y + 1); ctx.stroke();
        ctx.strokeStyle = "#0a0a12";
        ctx.strokeRect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1);
        if (b.hp < 3) {
          ctx.strokeStyle = "rgba(0,0,0,0.7)";
          ctx.beginPath();
          ctx.moveTo(b.x + 3, b.y + 4);
          ctx.lineTo(b.x + b.w/2, b.y + b.h/2);
          ctx.lineTo(b.x + b.w - 5, b.y + b.h - 3);
          ctx.stroke();
        }
        if (b.hp < 2) {
          ctx.strokeStyle = "rgba(0,0,0,0.6)";
          ctx.beginPath();
          ctx.moveTo(b.x + b.w - 4, b.y + 3);
          ctx.lineTo(b.x + b.w/2 - 2, b.y + b.h/2);
          ctx.lineTo(b.x + 4, b.y + b.h - 4);
          ctx.stroke();
          ctx.fillStyle = "#0a0a12";
          ctx.beginPath();
          ctx.moveTo(b.x + b.w - 6, b.y);
          ctx.lineTo(b.x + b.w, b.y);
          ctx.lineTo(b.x + b.w, b.y + 6);
          ctx.closePath(); ctx.fill();
        }
      }
    }

    // Powder kegs
    for (const keg of kegsRef.current) {
      if (keg.exploded) continue;
      const kx = keg.x, ky = keg.y;
      // Barrel body
      const kgrad = ctx.createLinearGradient(kx - 10, ky, kx + 10, ky);
      kgrad.addColorStop(0, "#3a2010");
      kgrad.addColorStop(0.5, "#5a3018");
      kgrad.addColorStop(1, "#2a1808");
      ctx.fillStyle = kgrad;
      ctx.fillRect(kx - 10, ky - 12, 20, 24);
      // Metal bands
      ctx.fillStyle = "#1a1a1e";
      ctx.fillRect(kx - 10, ky - 12, 20, 2);
      ctx.fillRect(kx - 10, ky - 2, 20, 2);
      ctx.fillRect(kx - 10, ky + 10, 20, 2);
      // Highlight on top
      ctx.fillStyle = "rgba(255,200,100,0.2)";
      ctx.fillRect(kx - 8, ky - 10, 2, 20);
      // Skull marking
      ctx.font = "8px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(255,50,50,0.8)";
      ctx.fillText("☠", kx, ky + 2);
      // Fuse
      ctx.strokeStyle = "#5a4a30";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(kx, ky - 12);
      ctx.quadraticCurveTo(kx + 4, ky - 18, kx + 6, ky - 22);
      ctx.stroke();
      // Fuse spark
      const flick = Math.sin(now * 0.02) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(255,${180 + flick * 60},${flick * 80},${0.8 + flick * 0.2})`;
      ctx.shadowColor = "rgba(255,160,40,1)";
      ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(kx + 6, ky - 22, 2 + flick * 1.5, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Garlic bombs
    for (const bomb of bombsRef.current) {
      if (bomb.exploded) continue;
      const bx = bomb.x, by = bomb.y;
      ctx.save();
      ctx.shadowColor = "rgba(255,240,200,0.4)";
      ctx.shadowBlur = 6;
      const ggrad = ctx.createRadialGradient(bx - 3, by - 2, 1, bx, by, 11);
      ggrad.addColorStop(0, "#fefadf");
      ggrad.addColorStop(0.6, "#ece0b8");
      ggrad.addColorStop(1, "#b8a880");
      ctx.fillStyle = ggrad;
      ctx.beginPath(); ctx.ellipse(bx, by, 10, 12, 0, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(140,120,80,0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(bx, by - 11); ctx.quadraticCurveTo(bx - 5, by, bx - 2, by + 11); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx, by - 11); ctx.quadraticCurveTo(bx + 5, by, bx + 2, by + 11); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx - 8, by); ctx.quadraticCurveTo(bx, by + 2, bx + 8, by); ctx.stroke();
      ctx.strokeStyle = "#5a4a30";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(bx, by - 10); ctx.lineTo(bx + 2, by - 15); ctx.stroke();
      const flick = Math.sin(now * 0.015) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(255,${180 + flick * 60},${flick * 80},${0.7 + flick * 0.3})`;
      ctx.shadowColor = "rgba(255,180,60,0.9)";
      ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.arc(bx + 2, by - 15, 2 + flick, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // Fire pickups (floating fireball)
    for (const pu of pickupsRef.current) {
      if (pu.collected) continue;
      const px = pu.x, py = pu.y + Math.sin(now * 0.003) * 3; // bob
      // Outer glow
      const fg = ctx.createRadialGradient(px, py, 3, px, py, 20);
      fg.addColorStop(0, "rgba(255,180,60,0.7)");
      fg.addColorStop(1, "rgba(255,80,20,0)");
      ctx.fillStyle = fg;
      ctx.beginPath(); ctx.arc(px, py, 20, 0, Math.PI*2); ctx.fill();
      // Fire emoji at center
      ctx.save();
      ctx.shadowColor = "#ffaa00";
      ctx.shadowBlur = 14;
      ctx.font = "18px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🔥", px, py);
      ctx.restore();
      // Orbiting sparks
      for (let i = 0; i < 3; i++) {
        const sa = now * 0.004 + i * 2.1;
        const sr = 14;
        const sx = px + Math.cos(sa) * sr;
        const sy = py + Math.sin(sa * 1.3) * sr * 0.7;
        ctx.fillStyle = "rgba(255,200,80,0.9)";
        ctx.beginPath(); ctx.arc(sx, sy, 1.5, 0, Math.PI*2); ctx.fill();
      }
    }

    // Vampires + coffins
    for (const v of vampiresRef.current) {
      if (v.dead) continue;
      const cx = v.x, cy = v.y;
      const coffinW = 36, coffinH = 22;
      const coffinX = cx - coffinW / 2;
      const coffinY = cy + 2;
      const shoulderX = 6, shoulderY = 5;
      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.beginPath();
      ctx.moveTo(coffinX + shoulderX, coffinY + coffinH + 2);
      ctx.lineTo(coffinX + coffinW - shoulderX, coffinY + coffinH + 2);
      ctx.lineTo(coffinX + coffinW - 2, coffinY + coffinH);
      ctx.lineTo(coffinX + 2, coffinY + coffinH);
      ctx.closePath(); ctx.fill();
      // Coffin body — Master vampires get a reddish tint
      const cofGrad = ctx.createLinearGradient(coffinX, coffinY, coffinX, coffinY + coffinH);
      if (v.master) {
        cofGrad.addColorStop(0, "#6a1010");
        cofGrad.addColorStop(1, "#1a0404");
      } else {
        cofGrad.addColorStop(0, "#4a2a1a");
        cofGrad.addColorStop(1, "#1a0a04");
      }
      ctx.fillStyle = cofGrad;
      ctx.beginPath();
      ctx.moveTo(coffinX + shoulderX, coffinY);
      ctx.lineTo(coffinX + coffinW - shoulderX, coffinY);
      ctx.lineTo(coffinX + coffinW, coffinY + shoulderY);
      ctx.lineTo(coffinX + coffinW - 2, coffinY + coffinH);
      ctx.lineTo(coffinX + 2, coffinY + coffinH);
      ctx.lineTo(coffinX, coffinY + shoulderY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = v.master ? "#c83030" : "#7a4a2a";
      ctx.lineWidth = 1;
      ctx.stroke();
      // Cross on lid
      ctx.fillStyle = v.master ? "#e8c090" : "#c8a070";
      ctx.fillRect(cx - 1.5, coffinY + 5, 3, 11);
      ctx.fillRect(cx - 4, coffinY + 8, 9, 3);
      ctx.fillStyle = "rgba(255,230,180,0.3)";
      ctx.fillRect(cx - 1.5, coffinY + 5, 1, 11);

      // Master aura
      if (v.master) {
        const pulse = 0.7 + 0.3 * Math.sin(now * 0.004);
        const aura = ctx.createRadialGradient(cx, cy - 3, 5, cx, cy - 3, 30);
        aura.addColorStop(0, `rgba(255,40,40,${0.35 * pulse})`);
        aura.addColorStop(1, "rgba(255,40,40,0)");
        ctx.fillStyle = aura;
        ctx.beginPath(); ctx.arc(cx, cy - 3, 30, 0, Math.PI*2); ctx.fill();
      }

      // Vampire head emoji
      ctx.save();
      ctx.shadowColor = v.master ? "rgba(255,20,20,0.9)" : "rgba(255,50,50,0.6)";
      ctx.shadowBlur = v.master ? 12 : 8;
      ctx.font = v.master ? "18px serif" : "16px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🧛", cx, coffinY - 4);
      ctx.restore();

      // Master crown
      if (v.master) {
        ctx.font = "10px serif";
        ctx.fillText("👑", cx, coffinY - 16);
      }

      // Damage counter
      if (v.master && v.damage > 0) {
        ctx.fillStyle = "#ff4040";
        ctx.font = "bold 9px 'Cinzel', serif";
        ctx.fillText(`${v.damage}/2`, cx, coffinY - 22);
      }
    }

    // Projectile
    const proj = projectileRef.current;
    if (proj) {
      ctx.save();
      ctx.translate(proj.x, proj.y);
      ctx.rotate(proj.rot);
      if (proj.explosive) {
        // Explosive arrow — dark gray shaft, barrel tip, sparking fuse
        // Shaft
        const pgrad = ctx.createLinearGradient(-10, 0, 10, 0);
        pgrad.addColorStop(0, "#1a1a20");
        pgrad.addColorStop(0.5, "#3a3a42");
        pgrad.addColorStop(1, "#2a2a30");
        ctx.fillStyle = pgrad;
        ctx.fillRect(-10, -2, 12, 4);
        // Barrel tip (mini keg at tip)
        ctx.fillStyle = "#5a3018";
        ctx.fillRect(2, -4, 10, 8);
        ctx.strokeStyle = "#1a0a00";
        ctx.lineWidth = 1;
        ctx.strokeRect(2, -4, 10, 8);
        // Metal bands on barrel
        ctx.fillStyle = "#1a1a1e";
        ctx.fillRect(4, -4, 1, 8);
        ctx.fillRect(9, -4, 1, 8);
        // Sparking fuse at back
        const flick = Math.sin(performance.now() * 0.05) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255,${180 + flick * 60},${flick * 80},1)`;
        ctx.shadowColor = "rgba(255,160,40,1)";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(-12, 0, 2 + flick * 1.2, 0, Math.PI * 2);
        ctx.fill();
      } else if (proj.fire) {
        // Fire arrow — glowing, orange/red
        ctx.shadowColor = "#ff6020";
        ctx.shadowBlur = 12;
        const pgrad = ctx.createLinearGradient(-10, 0, 10, 0);
        pgrad.addColorStop(0, "#ff2200");
        pgrad.addColorStop(0.5, "#ffaa20");
        pgrad.addColorStop(1, "#ffee80");
        ctx.fillStyle = pgrad;
        ctx.fillRect(-10, -2, 16, 4);
        ctx.fillStyle = "#ffff80";
        ctx.beginPath();
        ctx.moveTo(6, -3); ctx.lineTo(13, 0); ctx.lineTo(6, 3); ctx.closePath();
        ctx.fill();
      } else {
        const pgrad = ctx.createLinearGradient(-10, 0, 10, 0);
        pgrad.addColorStop(0, "#6a3f1a");
        pgrad.addColorStop(0.5, "#c8a070");
        pgrad.addColorStop(1, "#9a6a3a");
        ctx.fillStyle = pgrad;
        ctx.fillRect(-10, -2, 16, 4);
        ctx.fillStyle = "#e8c090";
        ctx.beginPath();
        ctx.moveTo(6, -3); ctx.lineTo(13, 0); ctx.lineTo(6, 3); ctx.closePath();
        ctx.fill();
        ctx.shadowColor = "#ffcc44";
        ctx.shadowBlur = 6;
        ctx.fillStyle = "rgba(255,200,100,0.3)";
        ctx.fillRect(-14, -1, 4, 2);
      }
      ctx.restore();
    }

    // Effects
    for (const ef of effectsRef.current) {
      if (ef.type === "explosion") {
        ctx.save();
        ctx.globalAlpha = ef.alpha;
        const eg = ctx.createRadialGradient(ef.x, ef.y, 0, ef.x, ef.y, ef.radius);
        eg.addColorStop(0, "rgba(255,220,120,1)");
        eg.addColorStop(0.4, "rgba(255,120,40,0.8)");
        eg.addColorStop(1, "rgba(180,40,20,0)");
        ctx.fillStyle = eg;
        ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.radius, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      } else if (ef.type === "kegblast") {
        ctx.save();
        ctx.globalAlpha = ef.alpha;
        const eg = ctx.createRadialGradient(ef.x, ef.y, 0, ef.x, ef.y, ef.radius);
        eg.addColorStop(0, "rgba(255,255,200,1)");
        eg.addColorStop(0.2, "rgba(255,180,60,1)");
        eg.addColorStop(0.6, "rgba(200,60,30,0.6)");
        eg.addColorStop(1, "rgba(60,20,10,0)");
        ctx.fillStyle = eg;
        ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.radius, 0, Math.PI*2); ctx.fill();
        // Smoke ring
        ctx.strokeStyle = `rgba(80,40,20,${ef.alpha * 0.6})`;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.radius * 0.9, 0, Math.PI*2); ctx.stroke();
        ctx.restore();
      } else if (ef.type === "shockwave") {
        ctx.save();
        ctx.globalAlpha = ef.alpha * 0.7;
        ctx.strokeStyle = "rgba(255,220,140,1)";
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.radius, 0, Math.PI*2); ctx.stroke();
        ctx.strokeStyle = "rgba(255,160,60,0.5)";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.radius * 0.95, 0, Math.PI*2); ctx.stroke();
        ctx.restore();
      } else if (ef.type === "ember") {
        const t = ef.life / ef.maxLife;
        ctx.save();
        ctx.globalAlpha = t;
        ctx.shadowColor = "#ff8030";
        ctx.shadowBlur = 5;
        const c = ctx.createRadialGradient(ef.x, ef.y, 0, ef.x, ef.y, ef.r);
        c.addColorStop(0, "rgba(255,240,120,1)");
        c.addColorStop(0.6, "rgba(255,120,40,0.9)");
        c.addColorStop(1, "rgba(180,40,10,0)");
        ctx.fillStyle = c;
        ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.r, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      } else if (ef.type === "sparkle") {
        ctx.save();
        ctx.globalAlpha = ef.alpha;
        const eg = ctx.createRadialGradient(ef.x, ef.y, 0, ef.x, ef.y, ef.radius);
        eg.addColorStop(0, "rgba(255,220,120,1)");
        eg.addColorStop(1, "rgba(255,180,60,0)");
        ctx.fillStyle = eg;
        ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.radius, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      } else if (ef.type === "flame") {
        const t = ef.life / ef.maxLife;
        ctx.save();
        ctx.globalAlpha = t;
        const c = ctx.createRadialGradient(ef.x, ef.y, 0, ef.x, ef.y, ef.r);
        c.addColorStop(0, "rgba(255,240,120,1)");
        c.addColorStop(0.5, "rgba(255,120,30,0.7)");
        c.addColorStop(1, "rgba(180,40,10,0)");
        ctx.fillStyle = c;
        ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.r * (0.5 + t * 0.5), 0, Math.PI*2); ctx.fill();
        ctx.restore();
      } else if (ef.type === "bloodsplat") {
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - ef.age / 40);
        ctx.fillStyle = "#aa0010";
        for (let i = 0; i < 6; i++) {
          const ang = (i / 6) * Math.PI * 2;
          const d = 8 + (ef.age * 0.3);
          const rx = ef.x + Math.cos(ang) * d;
          const ry = ef.y + Math.sin(ang) * d;
          ctx.beginPath(); ctx.arc(rx, ry, 3 + (i % 2), 0, Math.PI*2); ctx.fill();
        }
        ctx.restore();
      } else if (ef.type === "spark") {
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - ef.age / 15);
        ctx.fillStyle = "#ffaa40";
        for (let i = 0; i < 4; i++) {
          const ang = (i / 4) * Math.PI * 2 + ef.age * 0.1;
          const d = 3 + ef.age * 0.4;
          const sx = ef.x + Math.cos(ang) * d;
          const sy = ef.y + Math.sin(ang) * d;
          ctx.beginPath(); ctx.arc(sx, sy, 1.5, 0, Math.PI*2); ctx.fill();
        }
        ctx.restore();
      }
    }

    // Crossbow launcher
    ctx.save();
    const lx = LAUNCH_X, ly = LAUNCH_Y;
    ctx.strokeStyle = "#3a1a08";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lx - 3, ly + 8); ctx.lineTo(lx - 10, GROUND_Y);
    ctx.moveTo(lx + 3, ly + 8); ctx.lineTo(lx + 10, GROUND_Y);
    ctx.stroke();
    const postGrad = ctx.createLinearGradient(lx - 4, 0, lx + 4, 0);
    postGrad.addColorStop(0, "#5a3020");
    postGrad.addColorStop(0.5, "#3a1a08");
    postGrad.addColorStop(1, "#2a1005");
    ctx.fillStyle = postGrad;
    ctx.fillRect(lx - 4, ly + 2, 8, 12);
    const stockGrad = ctx.createLinearGradient(0, ly - 4, 0, ly + 4);
    stockGrad.addColorStop(0, "#6a4020");
    stockGrad.addColorStop(1, "#3a1a08");
    ctx.fillStyle = stockGrad;
    ctx.beginPath();
    ctx.moveTo(lx - 16, ly - 3);
    ctx.lineTo(lx + 10, ly - 3);
    ctx.lineTo(lx + 12, ly);
    ctx.lineTo(lx + 10, ly + 3);
    ctx.lineTo(lx - 16, ly + 3);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#1a0a00";
    ctx.lineWidth = 1; ctx.stroke();
    ctx.strokeStyle = "#6a3a1a";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(lx - 4, ly - 14);
    ctx.quadraticCurveTo(lx + 4, ly - 10, lx + 2, ly - 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(lx - 4, ly + 14);
    ctx.quadraticCurveTo(lx + 4, ly + 10, lx + 2, ly + 2);
    ctx.stroke();
    ctx.lineCap = "butt";
    ctx.strokeStyle = "rgba(255,180,100,0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(lx - 3, ly - 13);
    ctx.quadraticCurveTo(lx + 3, ly - 9, lx + 1, ly - 3);
    ctx.stroke();
    ctx.strokeStyle = "rgba(240,230,200,0.85)";
    ctx.lineWidth = 1.2;
    if (draggingRef.current) {
      const pullX = lx - dragVecRef.current.x;
      const pullY = ly - dragVecRef.current.y;
      ctx.beginPath();
      ctx.moveTo(lx - 4, ly - 14);
      ctx.lineTo(pullX, pullY);
      ctx.lineTo(lx - 4, ly + 14);
      ctx.stroke();
      // Stake on string — variant based on arming
      ctx.save();
      ctx.translate(pullX, pullY);
      ctx.rotate(Math.atan2(dragVecRef.current.y, dragVecRef.current.x) + Math.PI);
      if (onExplosiveRef.current && explosiveBankRef.current > 0) {
        // Explosive variant
        const sg2 = ctx.createLinearGradient(-10, 0, 10, 0);
        sg2.addColorStop(0, "#1a1a20");
        sg2.addColorStop(0.5, "#3a3a42");
        sg2.addColorStop(1, "#2a2a30");
        ctx.fillStyle = sg2;
        ctx.fillRect(-10, -2, 12, 4);
        ctx.fillStyle = "#5a3018";
        ctx.fillRect(2, -4, 10, 8);
        ctx.strokeStyle = "#1a0a00";
        ctx.lineWidth = 1;
        ctx.strokeRect(2, -4, 10, 8);
        ctx.fillStyle = "#1a1a1e";
        ctx.fillRect(4, -4, 1, 8);
        ctx.fillRect(9, -4, 1, 8);
        const flick = Math.sin(performance.now() * 0.05) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255,${180 + flick * 60},${flick * 80},1)`;
        ctx.shadowColor = "rgba(255,160,40,1)";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(-12, 0, 2 + flick * 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (onFireRef.current && fireBankRef.current > 0) {
        ctx.shadowColor = "#ff6020";
        ctx.shadowBlur = 10;
        const sg2 = ctx.createLinearGradient(-10, 0, 10, 0);
        sg2.addColorStop(0, "#ff2200");
        sg2.addColorStop(0.5, "#ffaa20");
        sg2.addColorStop(1, "#ffee80");
        ctx.fillStyle = sg2;
        ctx.fillRect(-10, -2, 16, 4);
        ctx.fillStyle = "#ffff80";
        ctx.beginPath();
        ctx.moveTo(6, -3); ctx.lineTo(13, 0); ctx.lineTo(6, 3); ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else {
        const sg2 = ctx.createLinearGradient(-10, 0, 10, 0);
        sg2.addColorStop(0, "#6a3f1a");
        sg2.addColorStop(0.5, "#c8a070");
        sg2.addColorStop(1, "#9a6a3a");
        ctx.fillStyle = sg2;
        ctx.fillRect(-10, -2, 16, 4);
        ctx.fillStyle = "#e8c090";
        ctx.beginPath();
        ctx.moveTo(6, -3); ctx.lineTo(13, 0); ctx.lineTo(6, 3); ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    } else {
      ctx.beginPath();
      ctx.moveTo(lx - 4, ly - 14);
      ctx.lineTo(lx + 2, ly);
      ctx.lineTo(lx - 4, ly + 14);
      ctx.stroke();
    }
    ctx.restore();

    // Trajectory
    if (draggingRef.current) {
      const dx = dragVecRef.current.x;
      const dy = dragVecRef.current.y;
      const power = 0.18;
      let tx = LAUNCH_X, ty = LAUNCH_Y;
      let tvx = dx * power, tvy = dy * power;
      ctx.fillStyle = (onExplosiveRef.current && explosiveBankRef.current > 0)
        ? "rgba(200,200,220,0.8)"
        : (onFireRef.current && fireBankRef.current > 0)
          ? "rgba(255,100,40,0.8)"
          : "rgba(255,200,60,0.7)";
      for (let i = 0; i < 26; i++) {
        tvy += GRAVITY;
        tx += tvx; ty += tvy;
        if (tx < 0 || tx > GW || ty > GH) break;
        if (i % 2 === 0) {
          ctx.beginPath();
          ctx.arc(tx, ty, 2.5, 0, Math.PI*2);
          ctx.fill();
        }
      }
    }
  };

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  // Global drag tracking: once a drag starts on the canvas,
  // follow pointer/finger anywhere on screen and only fire when user truly releases
  useEffect(() => {
    const handleWindowMove = (e) => {
      if (!draggingRef.current) return;
      onMove(e);
    };
    const handleWindowUp = (e) => {
      if (!draggingRef.current) return;
      onUp(e);
    };
    window.addEventListener("mousemove", handleWindowMove);
    window.addEventListener("mouseup", handleWindowUp);
    window.addEventListener("touchmove", handleWindowMove, { passive: false });
    window.addEventListener("touchend", handleWindowUp);
    window.addEventListener("touchcancel", handleWindowUp);
    return () => {
      window.removeEventListener("mousemove", handleWindowMove);
      window.removeEventListener("mouseup", handleWindowUp);
      window.removeEventListener("touchmove", handleWindowMove);
      window.removeEventListener("touchend", handleWindowUp);
      window.removeEventListener("touchcancel", handleWindowUp);
    };
  }, []);

  const lvl = STAKE_LEVELS[levelIdx];

  return (
    <div style={{position:"fixed",inset:0,background:"#050210",zIndex:100,display:"flex",flexDirection:"column",alignItems:"center",fontFamily:"'Cinzel',serif",overflowY:"auto",overflowX:"hidden",WebkitOverflowScrolling:"touch"}}>
      <div style={{width:"100%",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <button onClick={onExit} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.2)",borderRadius:8,color:"rgba(255,255,255,0.5)",fontSize:11,letterSpacing:2,padding:"6px 12px",cursor:"pointer"}}>← EXIT</button>
        <div style={{color:"rgba(255,80,80,0.9)",fontSize:12,letterSpacing:4}}>STAKE THE VAMPIRE</div>
        <div style={{width:60}} />
      </div>

      {/* v43 fix: removed justifyContent:center + flex:1 that caused bottom UI (NEXT HUNT button) to clip below viewport on short phones. Now top-anchored with padding-bottom so scroll always reaches the bottom. */}
      <div style={{width:"100%",display:"flex",flexDirection:"column",alignItems:"center",padding:"4px 0 40px 0"}}>

      {phase === "intro" && (
        <div style={{textAlign:"center",padding:24,maxWidth:340}}>
          <div style={{fontSize:42,marginBottom:12}}>🧛</div>
          <div style={{fontSize:22,color:"#e8ddd4",letterSpacing:5,marginBottom:16}}>STAKE THE VAMPIRE</div>
          <div style={{color:"rgba(255,255,255,0.5)",fontSize:11,letterSpacing:2,lineHeight:1.9,marginBottom:18}}>
            PULL THE CATAPULT TO AIM · RELEASE TO FIRE<br/>
            5 STAKES PER LEVEL<br/>
            🔥 GRAB FIRE PICKUPS, TAP FIRE BUTTON TO ARM<br/>
            💥 HIT POWDER KEGS TO EARN BOOM ARROWS<br/>
            👑 MASTER VAMPS NEED 2 STAKES OR FIRE<br/>
            🧄 GARLIC BAGS · ☠️ POWDER KEGS
          </div>
          <button onClick={startGame} style={{background:"linear-gradient(180deg, rgba(180,30,30,0.3) 0%, rgba(100,10,10,0.3) 100%)",border:"1px solid rgba(255,80,80,0.6)",borderRadius:12,color:"#ff8080",fontFamily:"'Cinzel',serif",fontSize:14,letterSpacing:4,padding:"14px 32px",cursor:"pointer",boxShadow:"0 3px 10px rgba(100,0,0,0.5)"}}>BEGIN THE HUNT</button>
          {highScore > 0 && <div style={{marginTop:18,color:"rgba(255,200,60,0.5)",fontSize:11,letterSpacing:2}}>BEST: {highScore / 100}★</div>}
        </div>
      )}

      {(phase === "playing" || phase === "levelclear" || phase === "gameover") && lvl && (
        <div style={{width:"100%",maxWidth:380,padding:"6px 10px 12px",display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
          <div style={{display:"flex",justifyContent:"space-between",width:"100%",padding:"0 4px",alignItems:"center"}}>
            <div style={{fontSize:11,color:"rgba(230,220,210,0.7)",letterSpacing:2,fontFamily:"'Cinzel',serif"}}>
              <span style={{color:"#ff4040"}}>LVL {levelIdx+1}/{STAKE_LEVELS.length}</span> · {lvl?.name ?? ""}
            </div>
            <div style={{display:"flex",gap:3,alignItems:"center"}}>
              {Array.from({length:lvl?.stakes ?? 5}).map((_, i) => (
                <span key={i} style={{fontSize:14,color:i < stakesLeft ? "#c8a070" : "#3a2a1a",filter:i<stakesLeft?"drop-shadow(0 0 3px rgba(255,200,100,0.5))":"none"}}>🗡</span>
              ))}
            </div>
          </div>

          <canvas
            ref={canvasRef}
            width={GW}
            height={GH}
            style={{width:"auto",height:"auto",maxWidth:"100%",maxHeight:"calc(100vh - 220px)",borderRadius:10,border:"1px solid rgba(255,80,80,0.15)",display:"block",touchAction:"none",userSelect:"none",WebkitUserSelect:"none",WebkitTouchCallout:"none",WebkitTapHighlightColor:"transparent",cursor:dragging?"grabbing":"grab"}}
            onMouseDown={onDown}
            onMouseMove={onMove}
            onMouseUp={onUp}
            onTouchStart={onDown}
            onTouchMove={onMove}
            onTouchEnd={onUp}
            onTouchCancel={onUp}
          />

          {/* AMMO BUTTONS: fire arrow + explosive arrow */}
          {phase === "playing" && (
            <div style={{width:"100%",display:"flex",justifyContent:"center",alignItems:"center",gap:8,padding:"2px 8px",flexWrap:"wrap"}}>
              <button
                onClick={toggleFireArrow}
                disabled={fireBank <= 0}
                style={{
                  background: onFire ? "linear-gradient(180deg, rgba(255,100,30,0.5) 0%, rgba(200,40,10,0.6) 100%)" : (fireBank > 0 ? "rgba(80,20,10,0.4)" : "rgba(30,20,20,0.3)"),
                  border: "1px solid " + (onFire ? "#ffaa40" : fireBank > 0 ? "rgba(255,120,40,0.5)" : "rgba(120,60,40,0.2)"),
                  borderRadius: 10,
                  color: onFire ? "#fff0a0" : (fireBank > 0 ? "#ffaa60" : "#5a3028"),
                  fontFamily: "'Cinzel', serif",
                  fontSize: 11,
                  letterSpacing: 2,
                  padding: "8px 12px",
                  cursor: fireBank > 0 ? "pointer" : "default",
                  boxShadow: onFire ? "0 0 12px rgba(255,150,50,0.6)" : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <span style={{fontSize:14}}>🔥</span>
                <span>{onFire ? "FIRE ARMED" : "FIRE"}</span>
                <span style={{
                  background: "rgba(0,0,0,0.4)",
                  borderRadius: 10,
                  padding: "2px 7px",
                  fontSize: 10,
                  minWidth: 20,
                  textAlign: "center",
                  color: fireBank > 0 ? "#ffcc44" : "#5a3028",
                }}>×{fireBank}</span>
              </button>

              <button
                onClick={toggleExplosiveArrow}
                disabled={explosiveBank <= 0}
                style={{
                  background: onExplosive ? "linear-gradient(180deg, rgba(180,180,200,0.5) 0%, rgba(80,80,100,0.6) 100%)" : (explosiveBank > 0 ? "rgba(30,30,40,0.5)" : "rgba(20,20,25,0.3)"),
                  border: "1px solid " + (onExplosive ? "#dcdce0" : explosiveBank > 0 ? "rgba(180,180,200,0.5)" : "rgba(80,80,90,0.2)"),
                  borderRadius: 10,
                  color: onExplosive ? "#fff" : (explosiveBank > 0 ? "#c0c0d0" : "#404050"),
                  fontFamily: "'Cinzel', serif",
                  fontSize: 11,
                  letterSpacing: 2,
                  padding: "8px 12px",
                  cursor: explosiveBank > 0 ? "pointer" : "default",
                  boxShadow: onExplosive ? "0 0 12px rgba(200,200,230,0.6)" : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <span style={{fontSize:14}}>💥</span>
                <span>{onExplosive ? "BOOM ARMED" : "BOOM"}</span>
                <span style={{
                  background: "rgba(0,0,0,0.4)",
                  borderRadius: 10,
                  padding: "2px 7px",
                  fontSize: 10,
                  minWidth: 20,
                  textAlign: "center",
                  color: explosiveBank > 0 ? "#ddd" : "#404050",
                }}>×{explosiveBank}</span>
              </button>
            </div>
          )}

          {phase === "levelclear" && (
            <div style={{background:"rgba(0,0,0,0.7)",border:"1px solid rgba(255,200,60,0.5)",borderRadius:10,padding:"14px 18px",textAlign:"center",width:"90%"}}>
              <div style={{fontSize:13,color:"#ffcc44",letterSpacing:3,marginBottom:6,fontFamily:"'Cinzel',serif"}}>LEVEL CLEAR</div>
              <div style={{fontSize:22,marginBottom:10,letterSpacing:4}}>
                {[0,1,2].map(i => <span key={i} style={{color: i < levelStars ? "#ffcc44" : "#3a3028",filter:i<levelStars?"drop-shadow(0 0 6px rgba(255,200,60,0.7))":"none"}}>★</span>)}
              </div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.5)",letterSpacing:2,marginBottom:12}}>
                STAKES USED: {stakesUsedRef.current} · PAR: {lvl?.par ?? "—"}
              </div>
              <div style={{display:"flex",gap:8,justifyContent:"center"}}>
                <button onClick={retryLevel} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.25)",borderRadius:8,color:"rgba(230,220,210,0.7)",fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:2,padding:"8px 16px",cursor:"pointer"}}>RETRY</button>
                <button onClick={nextLevel} style={{background:"rgba(255,80,80,0.15)",border:"1px solid rgba(255,80,80,0.5)",borderRadius:8,color:"#ff8080",fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:2,padding:"8px 20px",cursor:"pointer",fontWeight:"bold"}}>NEXT HUNT →</button>
              </div>
            </div>
          )}

          {phase === "gameover" && (
            <div style={{background:"rgba(0,0,0,0.7)",border:"1px solid rgba(255,80,80,0.5)",borderRadius:10,padding:"14px 18px",textAlign:"center",width:"90%"}}>
              <div style={{fontSize:13,color:"#ff4040",letterSpacing:3,marginBottom:6,fontFamily:"'Cinzel',serif"}}>VAMPIRES SURVIVE</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.5)",letterSpacing:2,marginBottom:12}}>OUT OF STAKES</div>
              <button onClick={retryLevel} style={{background:"rgba(255,80,80,0.15)",border:"1px solid rgba(255,80,80,0.5)",borderRadius:8,color:"#ff8080",fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:2,padding:"10px 20px",cursor:"pointer"}}>TRY AGAIN</button>
            </div>
          )}

          {phase === "playing" && !dragging && !projectileRef.current && (
            <div style={{fontSize:10,color:"rgba(255,200,60,0.5)",letterSpacing:2,marginTop:2}}>PULL THE CATAPULT TO AIM</div>
          )}
        </div>
      )}

      {phase === "gameclear" && (
        <div style={{textAlign:"center",padding:24,maxWidth:340}}>
          <div style={{fontSize:56,marginBottom:12}}>👑</div>
          <div style={{fontSize:24,color:"#ffcc44",letterSpacing:5,marginBottom:8}}>HUNT COMPLETE</div>
          <div style={{color:"rgba(255,220,120,0.7)",fontSize:12,letterSpacing:2,marginBottom:14}}>ALL VAMPIRES DESTROYED</div>
          <div style={{fontSize:22,letterSpacing:4,marginBottom:10}}>
            {totalStars} / {STAKE_LEVELS.length * 3} <span style={{color:"#ffcc44",filter:"drop-shadow(0 0 6px rgba(255,200,60,0.7))"}}>★</span>
          </div>
          <div style={{background:"rgba(0,0,0,0.4)",padding:12,borderRadius:8,marginBottom:16,border:"1px solid rgba(255,200,60,0.2)",maxHeight:220,overflowY:"auto"}}>
            {/* v39: clamp slice to available levels and guard against undefined lookup (prevents white-screen crash when sessionStars somehow exceeds STAKE_LEVELS length) */}
            {sessionStars.slice(0, STAKE_LEVELS.length).map((s, i) => {
              const h = STAKE_LEVELS[i];
              if (!h) return null;
              const safeStars = Math.max(0, Math.min(3, s|0));
              return (
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",fontSize:10,letterSpacing:1,color:"rgba(230,220,210,0.8)"}}>
                  <span>LVL {i+1} · {h.name}</span>
                  <span style={{color:"#ffcc44"}}>{"★".repeat(safeStars)}<span style={{color:"#3a3028"}}>{"★".repeat(3-safeStars)}</span></span>
                </div>
              );
            })}
          </div>
          <button onClick={startGame} style={{background:"rgba(255,80,80,0.15)",border:"1px solid rgba(255,80,80,0.5)",borderRadius:12,color:"#ff8080",fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:4,padding:"12px 28px",cursor:"pointer",marginRight:8}}>HUNT AGAIN</button>
          <button onClick={onExit} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.3)",borderRadius:12,color:"rgba(230,220,210,0.6)",fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:3,padding:"12px 20px",cursor:"pointer"}}>EXIT</button>
        </div>
      )}
      </div>
    </div>
  );
}




// ── CAMP BLOOD: TEXT ADVENTURE ──
const CB_ENDINGS = {
  escaped_road:  { title:"ESCAPED",          sub:"You hit Route 4 and flagged down a trucker. You never looked back.", color:"#44ff88", emoji:"🏃" },
  escaped_boat:  { title:"ESCAPED BY WATER", sub:"You rowed to the far shore in the dark. The lake gave you safe passage.", color:"#44ccff", emoji:"🚣" },
  drowned:       { title:"DROWNED",          sub:"The water took you. Something underneath made sure of that.", color:"#4488ff", emoji:"💧" },
  machete:       { title:"MACHETE'D",        sub:"The last thing you saw was his mask. He tilted his head as if curious.", color:"#ff4444", emoji:"🗡️" },
  burned:        { title:"BURNED ALIVE",     sub:"The lodge went up fast. You were still inside.", color:"#ff8800", emoji:"🔥" },
  hero:          { title:"YOU KILLED JASON", sub:"Against all odds. The lake took him. For now.", color:"#ffdd00", emoji:"🏆" },
  hiding:        { title:"SURVIVED TILL DAWN",sub:"They found the bodies at first light. You were still in the wall cavity. Alive.", color:"#aaaaaa", emoji:"🌅" },
  sacrifice:     { title:"SACRIFICED",       sub:"You called his name at the water's edge. He accepted the offering.", color:"#aa44ff", emoji:"💀" },
  radio:         { title:"RESCUE CALLED",    sub:"Your voice crackled through to the state police. Help came before he did.", color:"#44ffaa", emoji:"📻" },
  pamela:        { title:"YOU FOUND THE TRUTH",sub:"Mrs. Voorhees. You pieced it together in time. That changed everything.", color:"#ff88ff", emoji:"🧠" },
};

const CB_NODES = {

  // ═══════════════════════════════════════════════
  // ACT 1 — SUPPLY CABIN (The Beginning)
  // Goal: gather items, understand the situation
  // ═══════════════════════════════════════════════
  start: {
    text: "CAMP CRYSTAL LAKE — SUMMER 1980\n\nYou're a counselor. Twenty-two. This was supposed to be a fun summer job.\n\nIt's 11pm. The generator died forty minutes ago. Your flashlight is on its last legs. The other counselors — Bill, Brenda, Jack, Marcie, Ned — went to the lake an hour ago. You stayed behind to lock up the supply cabin.\n\nYou heard something in the woods ten minutes ago. You told yourself it was a deer.\n\nThen you found the door to Cabin 3 hanging open. And Ned's shoe in the dirt. Just one shoe.\n\nThrough the trees north of you: slow, heavy footsteps. Getting closer.",
    choices: [
      { label:"Search the supply cabin for anything useful", next:"cabin_search" },
      { label:"Kill the flashlight and press yourself against the cabin wall", next:"wall_listen" },
      { label:"Run north toward the main lodge now", next:"forest_toward_lodge" },
      { label:"Cut east toward the road — forget everyone else", next:"forest_toward_road_unarmed" },
    ]
  },
  cabin_search: {
    jason: true,
    text: "You sweep the dying beam across shelves. Paint thinner. Road flares — a whole box. Rope, fifty feet of it.\n\nOn the wall behind glass: a fire axe.\n\nOn the desk: a hand-drawn camp map, annotated. Someone has circled the old Voorhees place on the east shore.\n\nThe footsteps outside stop. That's worse.",
    choices: [
      { label:"Take the fire axe", next:"take_axe", gives:"axe" },
      { label:"Take the road flares", next:"take_flares", gives:"flares_box" },
      { label:"Take the rope", next:"take_rope", gives:"rope" },
      { label:"Take the map — that circle might matter", next:"take_map", gives:"map" },
      { label:"Take everything you can carry", next:"take_all" },
    ]
  },
  take_axe: {
    jason: true,
    text: "The axe is heavy. Real. The glass panel cracks under your elbow.\n\nYou push it through your belt loop. It bangs against your hip.\n\nSomething scrapes along the outside wall. One slow drag.",
    choices: [
      { label:"Also grab the map before you go", next:"take_axe_map", gives:"map" },
      { label:"Also take the rope", next:"take_axe_rope", gives:"rope" },
      { label:"Get out — back door, now", next:"cabin_exit_armed" },
    ]
  },
  take_axe_map: {
    jason: true,
    text: "Axe in hand, map stuffed in your pocket.\n\nYou slip out the back door. The forest is black and still.\n\nThe drag along the wall has stopped.",
    choices: [
      { label:"Head toward the lake", next:"forest_toward_lake" },
      { label:"Head toward the main lodge", next:"forest_toward_lodge" },
      { label:"Head east to the road", next:"forest_toward_road" },
      { label:"Check Cabin 3 — find out what happened to Ned", next:"cabin3_search" },
    ]
  },
  take_axe_rope: {
    jason: true,
    text: "Axe and rope. You feel slightly less helpless.\n\nYou slip out the back. Cold air. Pines. No moon.\n\nYou stand still for thirty seconds. Nothing moves.",
    choices: [
      { label:"Head toward the lake", next:"forest_toward_lake" },
      { label:"Head toward the main lodge", next:"forest_toward_lodge" },
      { label:"Head east to the road", next:"forest_toward_road" },
      { label:"Circle back and check Cabin 3", next:"cabin3_search" },
    ]
  },
  take_flares: {
    jason: true,
    text: "A box of eight road flares. You pocket them.\n\nWhen you turn back to the door, the silhouette in the window makes no sense.\n\nToo tall. Too wide. Standing completely still.",
    choices: [
      { label:"Throw open the front door and run past him", next:"flare_run_attempt" },
      { label:"Light a flare right now and throw it at the window", next:"flare_throw_window" },
      { label:"Dive out the back window", next:"cabin_back_window" },
    ]
  },
  flare_run_attempt: {
    jason: true,
    text: "You burst through the door. His arm catches you across the chest.\n\nYou go down hard. The flares scatter.\n\nYou grab one, crack it, shove it into his face.",
    choices: [
      { label:"Run while he's blinded — north toward the lodge", next:"forest_toward_lodge" },
      { label:"Run east toward the road", next:"forest_toward_road" },
    ]
  },
  flare_throw_window: {
    text: "The flare erupts red through the glass. He steps back.\n\nYou're out the back door before it closes behind him.\n\nYou have seven flares left.",
    choices: [
      { label:"Head toward the lake", next:"forest_toward_lake" },
      { label:"Head toward the main lodge", next:"forest_toward_lodge" },
      { label:"Head east to the road", next:"forest_toward_road" },
    ]
  },
  take_rope: {
    text: "Fifty feet of nylon climbing rope. You coil it over your shoulder.\n\nIt's not a weapon. But you have a feeling it might matter.\n\nYou slip out the back into the dark.",
    choices: [
      { label:"Also take the axe on your way out", next:"take_rope_axe", gives:"axe" },
      { label:"Also grab the map", next:"take_rope_map", gives:"map" },
      { label:"Just go — head toward the lake", next:"forest_toward_lake" },
      { label:"Head toward the main lodge", next:"forest_toward_lodge" },
    ]
  },
  take_rope_axe: {
    text: "Rope over your shoulder, axe in hand.\n\nThe supply cabin creaks. Something is testing the front door.",
    choices: [
      { label:"Go quietly — toward the lake", next:"forest_toward_lake" },
      { label:"Go quickly — toward the lodge", next:"forest_toward_lodge" },
      { label:"Head for the road, east through the trees", next:"forest_toward_road" },
    ]
  },
  take_rope_map: {
    text: "Rope and map. You unfold the map and find the annotated circle. The old Voorhees property, east shore of the lake.\n\nWhoever left this note wanted someone to find it.",
    gives:"map",
    choices: [
      { label:"Head to the lake — check the east shore", next:"forest_toward_lake" },
      { label:"Head to the lodge first", next:"forest_toward_lodge" },
    ]
  },
  take_map: {
    text: "The map is old. Hand-drawn. Someone — a previous counselor — has annotated it obsessively.\n\nCircled in red: the Voorhees property on the east shore. In the margin: 'SHE CAME BACK. PAMELA. EVERY SUMMER.'\n\nThis is not nothing.",
    gives:"map",
    choices: [
      { label:"Also take the axe", next:"take_map_axe", gives:"axe" },
      { label:"Also take the flares", next:"take_map_flares", gives:"flares_box" },
      { label:"Just go — you have what you need", next:"cabin_exit_map" },
    ]
  },
  take_map_axe: {
    jason: true,
    text: "Map in pocket, axe in hand.\n\nThe front door rattles. Once. Hard.",
    choices: [
      { label:"Out the back, toward the lake", next:"forest_toward_lake" },
      { label:"Out the back, toward the lodge", next:"forest_toward_lodge" },
      { label:"Out the back, toward the road", next:"forest_toward_road" },
    ]
  },
  take_map_flares: {
    text: "Map and flares.\n\nYou slip out the back into the cool night. The footsteps have moved off north.",
    choices: [
      { label:"Follow north — toward the lodge", next:"forest_toward_lodge" },
      { label:"Go to the lake — the map shows something on the east shore", next:"forest_toward_lake" },
      { label:"Head for the road, east", next:"forest_toward_road" },
    ]
  },
  take_all: {
    jason: true,
    text: "Axe, rope, flares. You try to take the map too but the desk drawer is stuck.\n\nA fist comes through the window above it.",
    choices: [
      { label:"Run — back door, now", next:"cabin_back_window_armed" },
      { label:"Swing the axe at the arm", next:"axe_arm" },
    ]
  },
  axe_arm: {
    jason: true,
    text: "The axe bites into the windowsill. His arm withdraws.\n\nYou wrench the axe free and go out the back.\n\nYou run without direction for thirty seconds before you stop and think.",
    choices: [
      { label:"Head toward the lake", next:"forest_toward_lake" },
      { label:"Head toward the lodge", next:"forest_toward_lodge" },
      { label:"Head toward the road", next:"forest_toward_road" },
    ]
  },
  cabin_exit_armed: {
    jason: true,
    text: "You slip out the back door.\n\nCold night. Pines. No moon.\n\nThe footsteps are on the east side of the cabin now.",
    choices: [
      { label:"Go south toward the lake", next:"forest_toward_lake" },
      { label:"Go north toward the lodge", next:"forest_toward_lodge" },
      { label:"Go east toward the road — away from the footsteps", next:"forest_toward_road" },
    ]
  },
  cabin_exit_map: {
    text: "You slip out quietly.\n\nA note on the back of the map reads: 'If anything happens, check the north wall of the Voorhees boathouse. They left evidence.'\n\nYou fold it back into your pocket.",
    choices: [
      { label:"Head toward the lake — find the Voorhees boathouse", next:"forest_toward_lake" },
      { label:"Head toward the main lodge first", next:"forest_toward_lodge" },
      { label:"Head for the road — get out now", next:"forest_toward_road" },
    ]
  },
  cabin_back_window: {
    text: "You hit the ground outside the back window and roll.\n\nYou come up running. Pine needles. Roots. Dark.\n\nYou have your flares. Nothing else.",
    choices: [
      { label:"Run toward the lake", next:"forest_toward_lake" },
      { label:"Run toward the lodge", next:"forest_toward_lodge" },
    ]
  },
  cabin_back_window_armed: {
    text: "You go out the window in a controlled fall and come up running.\n\nAxe. Rope. Flares. You're as armed as you're going to get.",
    choices: [
      { label:"Head toward the lake", next:"forest_toward_lake" },
      { label:"Head toward the lodge", next:"forest_toward_lodge" },
      { label:"Head toward the road", next:"forest_toward_road" },
    ]
  },
  wall_listen: {
    text: "You press yourself flat against the cabin wall, flashlight off.\n\nHeavy footsteps. Thirty feet. Twenty. They stop just at the corner.\n\nYou hold your breath.\n\nThey move on north.",
    choices: [
      { label:"Wait a full minute, then go back inside and search", next:"cabin_search" },
      { label:"Move now while he's headed north — go to the lake", next:"wall_listen_move" },
      { label:"Move now — follow him toward the lodge to see where he goes", next:"tail_jason_north" },
    ]
  },
  wall_listen_move: {
    jason: true,
    text: "You move carefully through the dark. Every twig. Every root.\n\nYou pass Cabin 3. The door is open. Something has happened inside.\n\nAnd Cabin 2. Through the window: Ned, still in the bunk. Not sleeping.",
    choices: [
      { label:"Check Cabin 3 — find out what happened", next:"cabin3_approach" },
      { label:"Keep going toward the lake", next:"forest_toward_lake" },
      { label:"Double back to the supply cabin — you need something first", next:"cabin_search" },
    ]
  },

  tail_jason_north: {
    jason: true,
    text: "You follow at a distance. He moves through the trees like he knows every root.\n\nHe stops at the edge of the clearing near Cabin 2.\n\nThrough the window: Ned is on the top bunk. Not moving.\n\nHe doesn't go in. He stands there for a while. Then he moves toward the lodge.",
    choices: [
      { label:"Keep following — where is he going?", next:"tail_jason_lodge" },
      { label:"Break away and go to the lake while his back is turned", next:"forest_toward_lake" },
      { label:"Get into Cabin 2 — Ned might still be alive", next:"cabin2_enter" },
    ]
  },
  tail_jason_lodge: {
    jason: true,
    text: "You trail him through the pines. He's moving toward the main lodge.\n\nHe stops at the generator shed.\n\nHis hand finds the fuel line and tears it out with one pull.\n\nThen he goes around the back of the lodge.",
    choices: [
      { label:"Slip into the lodge through the front while he's around back", next:"lodge_front_dark" },
      { label:"Go to the generator shed — maybe you can restore power", next:"generator_shed" },
      { label:"Back away quietly toward the lake", next:"forest_toward_lake" },
    ]
  },

  // ═══════════════════════════════════════════════
  // FOREST TRANSITIONS
  // ═══════════════════════════════════════════════
  forest_toward_lake: {
    jason: true,
    text: "South through the pines. Half a mile.\n\nYou stop.\n\nSomething is wrong. The normal night sounds — frogs, insects — have gone completely silent. In the years you've camped, you've learned what that means.\n\nYou move slower.\n\nYou smell the water before you see it. The lake is perfectly flat. Black glass.\n\nYou pass Cabin 2 on the way. Through the window: Ned, lying in the top bunk, face up. Not sleeping.\n\nYou don't go in.\n\nAhead: the dock, the boathouse, the dark water.",
    choices: [
      { label:"Go to the dock", next:"dock_arrive" },
      { label:"Go to the boathouse", next:"dock_arrive" },
      { label:"Follow the shore east toward the Voorhees property", next:"shore_east" },
      { label:"Go back and check Cabin 2", next:"dock_arrive" },
    ]
  },
  forest_toward_lodge: {
    jason: true,
    text: "North through the trees. The main lodge is a quarter mile.\n\nYou see light — emergency battery backup, flickering.\n\nThrough the window: the common room. Overturned chairs. A curtain pooling on the floor where someone dragged it.\n\nThe front door is hanging open.",
    choices: [
      { label:"Enter through the open front door", next:"lodge_common_room" },
      { label:"Circle around back — check the generator shed first", next:"generator_shed" },
      { label:"Enter through the side window", next:"lodge_side_window" },
    ]
  },

  forest_toward_road_unarmed: {
    jason: true,
    text: "East through the pines. You have nothing in your hands.\n\nHalfway there, you pass the equipment shed — padlocked. But there's a tire iron on the ground outside it.\n\nYour foot catches something. A length of rope, left by a previous counselor.",
    choices: [
      { label:"Take the tire iron and keep going east", next:"forest_toward_road", gives:"rope" },
      { label:"Take the rope — could be useful", next:"forest_toward_road", gives:"rope" },
      { label:"Keep going — you don't need anything", next:"road_flat_wait_unarmed" },
    ]
  },

  road_flat_wait_unarmed: {
    jason: true,
    text: "You reach the tree line at the road edge.\n\nHe's already there. Standing in the road. Facing the camp.\n\nYou can't go past him. Not like this.",
    choices: [
      { label:"Go back — get something from the supply cabin", next:"cabin_search" },
      { label:"Go to the lodge instead — find another way", next:"forest_toward_lodge" },
      { label:"Wait him out — he'll move", next:"road_flat_wait" },
    ]
  },
  forest_toward_road: {
    jason: true,
    needs:"axe",
    text: "East through the pines. The road is half a mile.\n\nYou can see reflectors. Almost there.\n\nYour foot catches a root. You go down hard. Stay flat.\n\nHeavy footsteps, fifteen feet to your left. Moving parallel to you. Heading east.",
    choices: [
      { label:"Stay completely flat — let him pass", next:"road_flat_wait" },
      { label:"Get up and sprint for the road right now", next:"road_sprint_early_death" },
      { label:"Back away slowly — return to the lodge", next:"forest_toward_lodge" },
    ]
  },
  road_flat_wait: {
    text: "You press your face into the pine needles and breathe through your mouth.\n\nHe passes. Ten feet. Eight. Footsteps fade north.\n\nYou wait three full minutes before you rise.",
    choices: [
      { label:"Walk quietly to the road and head south", next:"road_south_approach" },
      { label:"Approach the phone box at the camp entrance — it's north", next:"phone_box_approach" },
      { label:"Turn back — the lodge might have survivors", next:"forest_toward_lodge" },
    ]
  },
  road_sprint_early_death: {
    text: "You burst up.\n\nHe was right there.",
    ending:"machete"
  },

  // ═══════════════════════════════════════════════
  // ACT 2A — THE CABINS
  // ═══════════════════════════════════════════════
  cabin3_approach: {
    jason: true,
    text: "Cabin 3. The door hangs open. Ned's shoe is in the dirt where you saw it.\n\nYou push the door slowly.\n\nBrenda is inside. She's been here a while. On the floor near the window.\n\nOn the wall, scratched with something sharp: 'JASON DOESNT DIE HES BEEN HERE SINCE 57'",
    choices: [
      { label:"Search the cabin for anything useful", next:"cabin3_search" },
      { label:"Get out — this is a trap", next:"forest_toward_lake" },
      { label:"Look at the wall more carefully", next:"cabin3_wall" },
    ]
  },
  cabin3_search: {
    text: "Under Brenda's bunk: a hunting knife in a sheath. A first aid kit. A lighter.\n\nThe lighter still works.",
    gives:"knife",
    choices: [
      { label:"Take the knife and go to the lake", next:"forest_toward_lake" },
      { label:"Take the knife and go to the lodge", next:"forest_toward_lodge" },
      { label:"Read the wall first", next:"cabin3_wall_armed" },
    ]
  },
  cabin3_wall: {
    text: "'JASON DOESNT DIE HES BEEN HERE SINCE 57'\n\nBelow it, smaller: 'PAMELA BROUGHT HIM BACK. THE LAKE IS HIS. DONT GO ON THE WATER.'\n\nBelow that, different handwriting: 'The above is wrong. She CALLS him. She killed the counselors. Jason was the boy. SHE is what you need to stop.'",
    gives:"jason_truth",
    choices: [
      { label:"Search the cabin for useful items", next:"cabin3_search" },
      { label:"Head to the lake — find out about Pamela", next:"forest_toward_lake" },
      { label:"Head to the lodge — tell someone", next:"forest_toward_lodge" },
    ]
  },
  cabin3_wall_armed: {
    jason: true,
    text: "You read it all. Three different people's theories, scratched into pine.\n\nOne of them knew something real.",
    gives:"jason_truth",
    choices: [
      { label:"Head to the lake", next:"forest_toward_lake" },
      { label:"Head to the lodge", next:"forest_toward_lodge" },
      { label:"Head to the road — get out and warn someone", next:"forest_toward_road" },
    ]
  },
  cabin2_enter: {
    jason: true,
    text: "You push the door.\n\nNed is dead. Has been for a while. But on the nightstand: his wallet, his keys — and a folded piece of paper.\n\n'If you're reading this I'm already gone. The Voorhees woman comes every summer. She camps at the east boathouse. If you go there after midnight you'll find what she leaves behind.'\n\nNed knew.",
    gives:"jason_truth",
    choices: [
      { label:"Search Ned's bunk for anything useful", next:"ned_bunk_search" },
      { label:"Head straight to the east boathouse", next:"shore_east" },
      { label:"Get out and head to the main lodge", next:"forest_toward_lodge" },
    ]
  },
  ned_bunk_search: {
    text: "Under the mattress: Ned's car keys. His truck is in the lot behind the lodge.\n\nA truck could change everything.",
    gives:"car_keys",
    choices: [
      { label:"Go to the lodge and find Ned's truck", next:"forest_toward_lodge" },
      { label:"Head to the east boathouse first", next:"shore_east" },
      { label:"Head to the dock and get a boat", next:"dock_arrive" },
    ]
  },

  // ═══════════════════════════════════════════════
  // ACT 2B — THE LODGE
  // ═══════════════════════════════════════════════
  lodge_common_room: {
    jason: true,
    text: "The common room.\n\nOverturned chairs. A board game scattered. Someone tried to barricade the back hallway — they didn't finish.\n\nThe battery backup lights flicker. One goes dark while you stand there.\n\nYou can go deeper into the lodge or search here first.",
    choices: [
      { label:"Search the common room", next:"lodge_search_common" },
      { label:"Go down the back hallway", next:"lodge_back_hall" },
      { label:"Check the kitchen", next:"lodge_kitchen" },
      { label:"Get upstairs — higher ground", next:"lodge_upstairs" },
      { label:"Try the office — there's a radio there", next:"lodge_office_approach" },
    ]
  },
  lodge_front_dark: {
    jason: true,
    text: "You slip into the lodge. No power at all now — he got to the generator.\n\nThe common room is a black rectangle. You wait for your eyes to adjust.\n\nSomething breathes in the corner.\n\nYou hold absolutely still.",
    choices: [
      { label:"Back away slowly toward the door", next:"lodge_back_out" },
      { label:"Light a road flare", next:"lodge_flare_reveal", needs:"flares_box" },
      { label:"Throw something to the far side to make noise", next:"lodge_throw_distract" },
      { label:"Knife — if you have it, hold it ready and go deeper", next:"lodge_dark_knife", needs:"knife" },
    ]
  },
  lodge_back_out: {
    text: "You back toward the door one step at a time.\n\nWhatever was in the corner shifts.\n\nYou're out the door and running before it reaches you.",
    choices: [
      { label:"Go around back to the generator shed", next:"generator_shed" },
      { label:"Run toward the lake", next:"forest_toward_lake" },
      { label:"Go to the side window — try a different way in", next:"lodge_side_window" },
    ]
  },
  lodge_flare_reveal: {
    jason: true,
    text: "The flare erupts. Red light floods the room.\n\nIt's Jack. What's left of Jack, propped against the corner.\n\nYou have six flares left.\n\nThe room is empty otherwise. You go deeper.",
    choices: [
      { label:"Check the kitchen", next:"lodge_kitchen" },
      { label:"Go to the back hallway", next:"lodge_back_hall" },
      { label:"Find the office and the radio", next:"lodge_office_approach" },
    ]
  },
  lodge_throw_distract: {
    jason: true,
    text: "You grab a coffee mug and throw it hard at the far wall.\n\nSomething large moves toward the sound.\n\nYou run the other direction.",
    choices: [
      { label:"Run to the kitchen and hide", next:"lodge_kitchen_hide" },
      { label:"Run upstairs", next:"lodge_upstairs_run" },
      { label:"Run out the back", next:"generator_shed_approach" },
    ]
  },
  lodge_dark_knife: {
    jason: true,
    text: "Knife in hand you edge into the dark.\n\nYou find the light switch. The battery backup is on a different circuit.\n\nClick. Dim orange light floods the common room.\n\nYou can see now. And you can see everything.",
    choices: [
      { label:"Search the room quickly", next:"lodge_search_common" },
      { label:"Head straight to the office radio", next:"lodge_office_approach" },
      { label:"Get upstairs — higher ground", next:"lodge_upstairs" },
    ]
  },
  lodge_search_common: {
    text: "Behind the reception desk: a first aid kit. A box of waterproof matches. A heavy flashlight.\n\nIn the lost-and-found box: a rain poncho, and under it — a road flare.\n\nIn the drawer: a logbook. The last entry is from three summers ago: 'Counselor reported footprints at the east boathouse. Ignored per management directive.'",
    gives:"flashlight",
    choices: [
      { label:"Read the logbook more carefully", next:"lodge_logbook" },
      { label:"Head to the back hallway", next:"lodge_back_hall" },
      { label:"Get to the office radio", next:"lodge_office_approach" },
      { label:"Go upstairs", next:"lodge_upstairs" },
    ]
  },
  lodge_logbook: {
    text: "You read every entry from the past five summers.\n\nSame pattern: counselors vanish, management reopens, new counselors vanish.\n\nOne entry from 1976: 'PAMELA VOORHEES hired as cook. Note: woman is unstable. Do not discuss her son.'\n\nHer son. Jason.\n\nYou put it together.",
    gives:"jason_truth",
    choices: [
      { label:"Get to the radio now — call this in", next:"lodge_office_approach" },
      { label:"Go to the kitchen — there's more to find", next:"lodge_kitchen" },
      { label:"Upstairs — check the counselor rooms", next:"lodge_upstairs" },
    ]
  },
  lodge_back_hall: {
    jason: true,
    text: "The back hallway is narrow. Four doors.\n\nOne is sealed from the inside with a chair under the handle.\n\nAnother is open. Dark.",
    choices: [
      { label:"Knock quietly on the sealed door", next:"lodge_sealed_door" },
      { label:"Go through the open door", next:"lodge_open_room" },
      { label:"Check the storage closet at the end", next:"lodge_storage" },
      { label:"Turn back — this is a choke point", next:"lodge_common_room" },
    ]
  },
  lodge_sealed_door: {
    text: "You knock twice.\n\nSilence. Then: 'Who's there?'\n\nIt's Marcie.\n\nShe opens the door a crack. Her eyes are wild. She's been in there two hours.",
    choices: [
      { label:"Tell her to come with you", next:"lodge_marcie_join" },
      { label:"Tell her to stay hidden and lock the door again", next:"lodge_marcie_stay" },
      { label:"Ask her what she saw", next:"lodge_marcie_story" },
    ]
  },
  lodge_marcie_story: {
    text: "She talks fast. She saw someone — huge, no mask, wrong proportions — kill Bill at the dock. She ran straight here.\n\nShe says there's a woman. An older woman. She saw her in the trees near the east shore two nights ago. She thought she was a camper.\n\n'She was watching us,' Marcie says. 'She wasn't lost.'",
    gives:"jason_truth",
    choices: [
      { label:"Tell her to come with you — two is better than one", next:"lodge_marcie_join" },
      { label:"Tell her to stay here and lock up", next:"lodge_marcie_stay" },
      { label:"You need to find the radio", next:"lodge_office_approach" },
    ]
  },
  lodge_marcie_join: {
    jason: true,
    text: "Marcie follows you out. She's barefoot — she lost her shoes running.\n\nYou move together through the hallway.\n\nA crash from the kitchen.",
    choices: [
      { label:"Investigate the kitchen — carefully", next:"lodge_kitchen_marcie" },
      { label:"Ignore it and get to the radio", next:"lodge_office_approach" },
      { label:"Both of you run for the back door", next:"lodge_back_door" },
    ]
  },
  lodge_marcie_stay: {
    text: "She nods and reseats the chair. You hear the lock click.\n\nYou feel bad leaving her but there's nothing else to offer.\n\nYou go back out.",
    choices: [
      { label:"Get to the radio", next:"lodge_office_approach" },
      { label:"Check the kitchen", next:"lodge_kitchen" },
      { label:"Go upstairs", next:"lodge_upstairs" },
    ]
  },
  lodge_open_room: {
    jason: true,
    text: "A counselor bedroom. Two bunks. Both empty.\n\nOn the desk: a CB radio handset — not the main unit, a portable one. Batteries might be dead.\n\nUnder the bed: a camp toolbox. Screwdrivers, a hammer, zip ties.",
    choices: [
      { label:"Try the CB radio", next:"portable_radio_try" },
      { label:"Take the hammer — better than nothing", next:"take_hammer", gives:"axe" },
      { label:"Take the zip ties — they might be useful for a trap", next:"take_zip_ties", gives:"rope" },
      { label:"Go back to the hallway", next:"lodge_back_hall" },
    ]
  },
  portable_radio_try: {
    text: "You click it on. Static. Then: voices.\n\n'—all units, be advised we have a missing persons report at Crystal Lake, requesting—'\n\nThe battery dies.\n\nThey know. Someone knows. But no one is coming fast enough.",
    gives:"jason_truth",
    choices: [
      { label:"Get to the main radio in the office — broadcast your location", next:"lodge_office_approach" },
      { label:"Head for the road now — flag someone down", next:"forest_toward_road" },
      { label:"Get Marcie and get out together", next:"lodge_sealed_door" },
    ]
  },
  take_hammer: {
    text: "Solid steel claw hammer. It's not an axe but it's something.",
    choices: [
      { label:"Get to the radio", next:"lodge_office_approach" },
      { label:"Go upstairs", next:"lodge_upstairs" },
      { label:"Head out the back toward the lake", next:"forest_toward_lake" },
    ]
  },
  take_zip_ties: {
    text: "Twenty zip ties in a bundle. You stuff them in your pocket.\n\nYou're thinking about a trap. Not sure what yet.",
    choices: [
      { label:"Get to the radio", next:"lodge_office_approach" },
      { label:"Find somewhere to set something up", next:"lodge_trap_think" },
    ]
  },
  lodge_storage: {
    text: "The storage closet has camp supplies — bug spray, sunscreen, a box of glow sticks.\n\nOne glow stick snapped and activated is better than nothing.",
    choices: [
      { label:"Go back and check the open room", next:"lodge_open_room" },
      { label:"Get to the office radio", next:"lodge_office_approach" },
    ]
  },
  lodge_kitchen: {
    jason: true,
    text: "The industrial kitchen. Stainless steel counters. Knives on a magnetic strip — all of them except the big cleaver, which is on the floor.\n\nOn the prep table: Marcie's jacket. She was here.\n\nThe walk-in freezer door is hanging open. A light inside is still on.",
    choices: [
      { label:"Check the walk-in freezer", next:"lodge_freezer" },
      { label:"Take a kitchen knife from the strip", next:"lodge_kitchen_knife", gives:"knife" },
      { label:"Barricade the kitchen door and hide here", next:"lodge_kitchen_barricade" },
      { label:"Go back and find the office radio", next:"lodge_office_approach" },
    ]
  },
  lodge_kitchen_hide: {
    jason: true,
    text: "You're in the kitchen. Whatever was in the common room is following slowly.\n\nThe walk-in freezer. You could hide in there.",
    choices: [
      { label:"Get in the freezer and pull the door shut", next:"freezer_hide" },
      { label:"Grab a knife first, then decide", next:"lodge_kitchen_knife", gives:"knife" },
      { label:"Knife and run out the kitchen back door", next:"lodge_kitchen_escape", needs:"knife" },
    ]
  },
  lodge_kitchen_knife: {
    jason: true,
    text: "You pull a boning knife from the strip. Eight inches.\n\nIt's not much against him. But it's something.\n\nA floorboard creaks in the hallway.",
    choices: [
      { label:"Check the freezer", next:"lodge_freezer" },
      { label:"Go to the office radio now", next:"lodge_office_approach" },
      { label:"Climb out the kitchen window to the back lot", next:"lodge_back_lot" },
      { label:"Barricade the kitchen door", next:"lodge_kitchen_barricade" },
    ]
  },
  lodge_freezer: {
    text: "The walk-in freezer has camp food supplies on shelves.\n\nAnd Bill.\n\nBill is hanging from one of the overhead hooks. You don't look long.\n\nBut on the shelf next to the door: Bill's keys. And a note in his handwriting: 'Truck key is the square one. Lot behind the lodge. Take it.'",
    gives:"car_keys",
    choices: [
      { label:"Get out of the freezer and find that truck", next:"lodge_back_lot" },
      { label:"Get out and get to the radio first", next:"lodge_office_approach" },
    ]
  },
  freezer_hide: {
    jason: true,
    text: "You pull the heavy door shut. Darkness. Freezing.\n\nFootsteps in the kitchen. Moving slow. Searching.\n\nThey stop right outside the freezer door.\n\nThe handle turns.",
    choices: [
      { label:"Brace against the door with everything you have", next:"freezer_brace" },
      { label:"Let go and press to the side — let him open it", next:"freezer_ambush" },
    ]
  },
  freezer_brace: {
    jason: true,
    text: "He pulls. You push back.\n\nHe's stronger than three of you.\n\nThe door opens four inches. Cold light spills in.\n\nYou let go and throw yourself sideways behind a shelf.",
    choices: [
      { label:"Stay hidden and pray he leaves", next:"freezer_wait" },
      { label:"Throw something at the back of the freezer and run when he looks", next:"freezer_throw_run" },
    ]
  },
  freezer_ambush: {
    jason: true,
    text: "The door swings open. He steps in.\n\nYou're behind it, pressed flat.\n\nHe doesn't see you. He's looking at Bill.",
    choices: [
      { label:"Slip out behind him quietly", next:"lodge_back_lot" },
      { label:"Hit him from behind with whatever you're carrying", next:"freezer_attack", needs:"axe" },
    ]
  },
  freezer_attack: {
    jason: true,
    text: "You hit him square across the back of the skull.\n\nHe staggers into the shelving. It collapses.\n\nYou don't wait to see if he gets up. You run.",
    choices: [
      { label:"Run to the back lot and find the truck", next:"lodge_back_lot" },
      { label:"Run to the radio first", next:"lodge_office_approach" },
    ]
  },
  freezer_wait: {
    jason: true,
    text: "He stands in the freezer doorway for a long time.\n\nThen he leaves.\n\nYou wait ten minutes before you move. You're so cold you can barely flex your hands.",
    choices: [
      { label:"Get out and go to the back lot", next:"lodge_back_lot" },
      { label:"Get to the office radio", next:"lodge_office_approach" },
    ]
  },
  freezer_throw_run: {
    jason: true,
    text: "You hurl a can of beans toward the back wall. He turns.\n\nYou're through the freezer door and sprinting across the kitchen.",
    choices: [
      { label:"Out the kitchen back door to the lot", next:"lodge_back_lot" },
      { label:"Down the hallway to the office", next:"lodge_office_approach" },
    ]
  },
  lodge_kitchen_barricade: {
    text: "You jam a stool under the door handle. It won't hold long.\n\nBut you have a minute.\n\nYou see the kitchen window. It opens to the back lot.",
    choices: [
      { label:"Out the window to the back lot", next:"lodge_back_lot" },
      { label:"Use this minute to search the kitchen properly", next:"lodge_kitchen" },
    ]
  },
  lodge_kitchen_escape: {
    jason: true,
    text: "You go out the kitchen window fast, knife in hand.\n\nCold night air. Gravel under your feet. You're in the back lot.",
    choices: [
      { label:"Look for Ned's truck", next:"lodge_back_lot" },
      { label:"Head toward the lake", next:"forest_toward_lake" },
    ]
  },
  lodge_kitchen_marcie: {
    jason: true,
    text: "You and Marcie enter the kitchen.\n\nThe walk-in freezer is open.\n\nMarcie sees Bill and sits down on the floor. She can't move.",
    choices: [
      { label:"Help Marcie up and get her outside", next:"marcie_outside" },
      { label:"Tell her to stay here while you check the back lot", next:"lodge_back_lot" },
      { label:"Search the kitchen fast while she recovers", next:"lodge_kitchen_knife", gives:"knife" },
    ]
  },
  marcie_outside: {
    text: "You get Marcie on her feet. She's functional. Barely.\n\nYou go out the back together.",
    choices: [
      { label:"Go to the back lot — find the truck", next:"lodge_back_lot" },
      { label:"Head toward the lake together", next:"forest_toward_lake" },
      { label:"Head for the road", next:"forest_toward_road" },
    ]
  },
  lodge_upstairs: {
    jason: true,
    text: "The stairs creak. Every single one.\n\nUpstairs: a long corridor. Staff rooms. At the far end, a window overlooking the whole camp.\n\nFrom up here you can see everything. The dock. The lake. A light at the east shore — small, orange. A campfire.",
    choices: [
      { label:"Watch the light at the east shore", next:"lodge_watch_east" },
      { label:"Check the staff rooms", next:"lodge_staff_rooms" },
      { label:"Find the roof access hatch", next:"lodge_roof" },
    ]
  },
  lodge_upstairs_run: {
    jason: true,
    text: "You hit the stairs and take them three at a time.\n\nBehind you: he doesn't rush. He never rushes. He just walks.\n\nYou have a minute. Maybe two. Use it.",
    choices: [
      { label:"Barricade the stairwell door", next:"lodge_upstairs_barricade" },
      { label:"Get to the roof hatch and out", next:"lodge_roof" },
      { label:"Search the staff rooms fast", next:"lodge_staff_rooms" },
    ]
  },
  lodge_upstairs_barricade: {
    text: "You drag a heavy dresser across the stairwell door.\n\nIt'll hold.\n\nFor a while.",
    choices: [
      { label:"Search the staff rooms while you have time", next:"lodge_staff_rooms" },
      { label:"Get to the roof", next:"lodge_roof" },
      { label:"Watch the east shore from the window", next:"lodge_watch_east" },
    ]
  },
  lodge_watch_east: {
    text: "You watch the orange light.\n\nIt doesn't move the way a fire does. It's steady. Controlled.\n\nSomeone is camped out there. Has been for a while.\n\nBetween the trees at the east shore, you can just make out a shape. A figure. Standing. Watching the lodge.",
    gives:"jason_truth",
    choices: [
      { label:"Get down and go to the east shore — face this directly", next:"shore_east_night" },
      { label:"Get to the office radio and report what you're seeing", next:"lodge_office_approach" },
      { label:"Check the staff rooms first — there's more to learn", next:"lodge_staff_rooms" },
    ]
  },
  lodge_staff_rooms: {
    text: "Five staff rooms. Three are empty.\n\nIn the fourth: a locked trunk, forced open. Inside, a folded letter dated 1958:\n\n'To whoever finds this: My name is Alice Hardy. If you're reading this, they've reopened the camp again. Don't stay. THE WOMAN IN THE WOODS IS THE KILLER. Her son drowned here. His name was Jason. SHE BLAMES ALL OF US.'\n\nIn the fifth room: a window facing the back lot. You can see a truck.",
    gives:"jason_truth",
    choices: [
      { label:"Go to the roof", next:"lodge_roof" },
      { label:"Get out the back and find the truck", next:"lodge_back_lot" },
      { label:"Get to the office and the radio", next:"lodge_office_approach" },
    ]
  },
  lodge_roof: {
    jason: true,
    text: "The roof hatch opens with a shove.\n\nYou're on the roof of the main lodge. The whole camp is below you.\n\nYou can see him — moving through the trees south of the lodge. Slow. Methodical.\n\nYou can also see Ned's truck in the back lot. And the boathouse. And the east shore campfire.",
    choices: [
      { label:"Get back down and get to that truck", next:"lodge_back_lot" },
      { label:"Get back down and go to the east shore campfire", next:"shore_east_night" },
      { label:"Light a flare from up here — maybe someone on Route 4 will see it", next:"roof_flare_signal", needs:"flares_box" },
      { label:"Stay up here till dawn", next:"roof_wait_dawn" },
    ]
  },
  roof_flare_signal: {
    needs:"flares_box",
    text: "You crack a flare and hold it high.\n\nIt burns for three minutes. You see headlights on Route 4 slow down.\n\nThey don't turn in. But they slowed. Someone saw.",
    choices: [
      { label:"Get down and run for the road now — they're still close", next:"road_south_approach" },
      { label:"Light another one — keep signaling", next:"roof_flare_second", needs:"flares_box" },
      { label:"Get to the radio and call it in", next:"lodge_office_approach" },
    ]
  },
  roof_flare_second: {
    needs:"flares_box",
    text: "Second flare.\n\nThe headlights on Route 4 stop. Then turn. They're coming up the camp road.",
    choices: [
      { label:"Get down and run to meet them at the entrance", next:"flag_car" },
      { label:"Stay up here where they can see the flare", next:"roof_wait_help" },
    ]
  },
  roof_wait_help: {
    text: "You hold the flare high. The car reaches the entrance. Stops.\n\nYou see a flashlight playing across the camp.\n\nThen a scream. Then silence.\n\nThe headlights stay on but nothing moves.",
    choices: [
      { label:"Get down — they might still be alive", next:"car_at_entrance" },
      { label:"Stay on the roof and wait for more cars", next:"roof_wait_dawn" },
    ]
  },
  car_at_entrance: {
    jason: true,
    text: "You run to the entrance.\n\nA couple in their fifties. The man is on the ground. The woman is running toward you.\n\n'There's something in the trees,' she says.\n\nYou grab her arm and run.",
    choices: [
      { label:"Run for their car", next:"drive_out" },
      { label:"Pull her toward the main lodge", next:"lodge_common_room" },
    ]
  },
  drive_out: {
    jason: true,
    text: "You run for the car. The keys are in it.\n\nYou get in. She gets in. You floor it.\n\nSomething hits the back bumper hard enough to fishtail the car.\n\nYou keep going.",
    choices: [
      { label:"Drive straight to the nearest police station", next:"drive_escape" },
      { label:"Stop at the highway and flag down another car first", next:"flag_car" },
    ]
  },
  drive_escape: {
    text: "You drive six miles to Blairstown and park in front of the police station.\n\nYou're both alive.\n\nYou sit in the parking lot for twenty minutes before you can open the door.",
    ending:"escaped_road"
  },
  roof_wait_dawn: {
    needs:"axe",
    text: "You stay on the roof.\n\nHe circles the lodge three times through the night. You can see him below.\n\nAround 4am he stops moving.\n\nAt 5:30 a police helicopter responds to a missing persons call and spots the camp.",
    ending:"hiding"
  },
  lodge_trap_think: {
    jason: true,
    text: "You're thinking about the zip ties and the layout of the hallway.\n\nIf you anchor something low across the back hallway — shin height — and he comes through fast—\n\nIt won't kill him. But it might slow him. Might give you enough time.",
    choices: [
      { label:"Set the trap in the back hallway", next:"set_trap_hallway", needs:"rope" },
      { label:"Set the trap on the stairs leading upstairs", next:"set_trap_stairs", needs:"rope" },
      { label:"Forget the trap — get to the radio", next:"lodge_office_approach" },
    ]
  },
  set_trap_hallway: {
    text: "You zip tie the rope across the hallway at shin height between two doorframes.\n\nYou tie it tight. You test it. If he comes through at speed, he'll go down.\n\nThen you go to the office.",
    choices: [
      { label:"Get to the radio", next:"lodge_office_approach" },
      { label:"Go upstairs and wait for him to trigger it", next:"lodge_upstairs" },
    ]
  },
  set_trap_stairs: {
    text: "You tie the rope across the fourth step in the dark.\n\nAnyone coming up at speed in the dark will trip at the landing point.\n\nGood. Now the radio.",
    choices: [
      { label:"Get to the radio", next:"lodge_office_approach" },
    ]
  },
  lodge_office_approach: {
    jason: true,
    text: "The camp director's office is at the end of the ground-floor hallway.\n\nThe door is closed. The lock is a push-button type — not locked.\n\nThrough the door you can hear: static. The emergency radio is still running on its own battery backup.",
    choices: [
      { label:"Go in and use the radio", next:"lodge_office_radio" },
      { label:"Listen at the door first", next:"lodge_office_listen" },
    ]
  },
  lodge_office_listen: {
    jason: true,
    text: "You press your ear to the door.\n\nStatic. Wind outside. The creak of the building.\n\nNothing else.\n\nYou go in.",
    choices: [
      { label:"Use the radio", next:"lodge_office_radio" },
    ]
  },
  lodge_office_radio: {
    jason: true,
    needs:"jason_truth",
    text: "The radio is on the director's desk. You key the transmit:\n\n'Crystal Lake Camp, emergency, multiple casualties, need immediate response—'\n\nA voice crackles back: 'Camp Crystal Lake, we have you. Units en route. ETA eighteen minutes. Stay on the line.'\n\nA window behind you shatters.",
    choices: [
      { label:"Give your exact location and stay on", next:"radio_stay_on" },
      { label:"Drop the radio and run out the back", next:"lodge_back_lot" },
      { label:"Drop the radio and run upstairs", next:"lodge_upstairs_run" },
      { label:"Light a flare at the doorway to hold him back", next:"radio_flare_hold", needs:"flares_box" },
    ]
  },
  radio_stay_on: {
    jason: true,
    text: "You key transmit: 'Camp Crystal Lake main lodge, eighteen minutes, I'll be here—'\n\nThe desk explodes inward. You roll across the floor, still holding the handset.\n\n'—multiple casualties, he's in the office now—'\n\nYou throw yourself out the shattered window.",
    choices: [
      { label:"Run for the back lot and the truck", next:"lodge_back_lot" },
      { label:"Run toward the lake — away from the lodge", next:"forest_toward_lake" },
      { label:"Run toward the road — eighteen minutes isn't long", next:"forest_toward_road" },
    ]
  },
  radio_flare_hold: {
    jason: true,
    needs:"flares_box",
    text: "You crack a flare and hold it in the doorway. He stops.\n\nThe light bothers him. Buys you time.\n\nYou back up to the desk and keep transmitting your location.",
    ending:"radio"
  },
  lodge_back_door: {
    jason: true,
    text: "You go out the back door of the lodge into the lot.\n\nGravel. Dark. A truck is parked at the far end.\n\nSomething moves along the lodge wall to your right.",
    choices: [
      { label:"Run for the truck", next:"lodge_back_lot" },
      { label:"Freeze and don't move", next:"back_lot_freeze" },
      { label:"Cut left toward the tree line", next:"back_lot_treeline" },
    ]
  },
  back_lot_freeze: {
    jason: true,
    text: "You stand completely still.\n\nHe rounds the corner. Fifteen feet away.\n\nHe stops. Tilts his head.\n\nFor a horrible moment, nothing moves.",
    choices: [
      { label:"Run for the truck right now", next:"lodge_back_lot" },
      { label:"Stay still — don't breathe", next:"lodge_back_lot" },
    ]
  },
  back_lot_freeze_2: {
    jason: true,
    text: "He moves on. North, around the other side of the lodge.\n\nYou give it thirty seconds then move.",
    choices: [
      { label:"Go to the truck", next:"lodge_back_lot" },
      { label:"Head toward the lake while he's north", next:"forest_toward_lake" },
    ]
  },
  back_lot_treeline: {
    jason: true,
    text: "You cut left and disappear into the tree line.\n\nHe follows the sound of the gravel.\n\nYou circle wide and come back to the lot from the north end.",
    choices: [
      { label:"Get to the truck", next:"lodge_back_lot" },
      { label:"Head to the lake from here", next:"forest_toward_lake" },
    ]
  },
  lodge_back_lot: {
    jason: true,
    needs:"jason_truth",
    text: "The back lot. Gravel. Two vehicles.\n\nA blue Chevy pickup — that'll be Ned's, if you have his keys.\n\nA camp van with a busted rear tire.\n\nAnd a door in the back fence leading out to the fire road.",
    choices: [
      { label:"Try the truck — it's your best shot", next:"truck_start", needs:"car_keys" },
      { label:"Go through the fire road door on foot", next:"fire_road" },
      { label:"Go back inside and get to the radio first", next:"lodge_office_approach" },
    ]
  },
  truck_start: {
    jason: true,
    needs:"car_keys",
    text: "The key turns. The engine catches on the third try.\n\nYou have headlights and half a tank.\n\nThe back gate is closed — a simple padlock.",
    choices: [
      { label:"Ram the gate with the truck", next:"truck_ram_gate" },
      { label:"Get out and look for the gate key", next:"truck_gate_key" },
      { label:"Back up and use the fire road door on foot", next:"fire_road" },
    ]
  },
  truck_ram_gate: {
    jason: true,
    text: "You floor it.\n\nThe gate tears off its hinges.\n\nYou're on the fire road doing forty miles an hour in the dark with no idea what's ahead.",
    choices: [
      { label:"Keep going — find the main road", next:"fire_road_escape" },
      { label:"Slow down — this road might dead-end", next:"fire_road_slow" },
    ]
  },
  truck_gate_key: {
    jason: true,
    text: "You search the lot. There's a key board inside the back door of the lodge, visible through the window.\n\nYou go in fast.\n\nHe's standing in the hallway.",
    choices: [
      { label:"Grab the key and run", next:"truck_key_grab_run" },
      { label:"Back out — just ram the gate", next:"truck_ram_gate" },
    ]
  },
  truck_key_grab_run: {
    jason: true,
    text: "You throw yourself at the key board. Your hand finds the right key by feel.\n\nHe moves toward you.\n\nYou go out the window before he reaches it.",
    choices: [
      { label:"Get in the truck and use the key on the gate lock", next:"fire_road_escape" },
    ]
  },
  fire_road_escape: {
    needs:"car_keys",
    text: "The fire road runs two miles to Route 4.\n\nYou hit the highway at 60mph and turn toward town.\n\nSix miles later you stop at the first light you see — a diner still open at midnight.\n\nYou go in. Sit at the counter. Order coffee. Cry for a while.",
    ending:"escaped_road"
  },
  fire_road_slow: {
    jason: true,
    text: "You slow the truck.\n\nGood thing — the road ends at a creek crossing. The bridge is barely planks.\n\nYou idle across at five miles an hour.\n\nIn the rearview: headlights at the back gate. Someone turned on the camp van.",
    choices: [
      { label:"Floor it and don't look back", next:"fire_road_escape" },
      { label:"Cut the headlights and hide in the trees by the creek", next:"fire_road_hide" },
    ]
  },
  fire_road_hide: {
    jason: true,
    text: "You pull off the road and cut the engine.\n\nThe van comes slowly. Stops at the creek.\n\nIt idles there for five minutes. Then it reverses back to camp.\n\nYou wait twenty more minutes. Then you drive to Route 4.",
    ending:"escaped_road"
  },
  fire_road: {
    jason: true,
    text: "The fire road runs east through the woods.\n\nYou jog it in the dark, one hand on the trees for guidance.\n\nAfter a mile: a fork. Left goes deeper into camp property. Right goes uphill — toward the highway.",
    choices: [
      { label:"Go right — toward the highway", next:"fire_road_hike" },
      { label:"Go left — you're curious about what's deeper in", next:"fire_road_east" },
    ]
  },
  fire_road_hike: {
    jason: true,
    text: "You hike the fire road for forty minutes.\n\nThe trees close in on both sides. Total darkness.\n\nYou hear him behind you. Maybe. Maybe just the wind.\n\nA light ahead: Route 4.",
    choices: [
      { label:"Run for the light", next:"fire_road_final" },
      { label:"Turn off the road into the trees — circle around", next:"fire_road_circle" },
    ]
  },

  fire_road_circle: {
    needs:"axe",
    text: "You cut into the trees and circle wide.\n\nNothing follows.\n\nYou come back to the road five minutes later and run to Route 4.",
    ending:"escaped_road"
  },

  fire_road_final: {
    needs:"axe",
    text: "You hit Route 4 at a dead sprint.\n\nA pickup slows.\n\nYou get in and don't stop talking for twenty minutes.",
    ending:"escaped_road"
  },
  fire_road_east: {
    jason: true,
    text: "The fire road east leads to an old access point — and a small wooden structure you don't recognize from the map.\n\nA caretaker's cabin. Padlocked. But the window is open.",
    choices: [
      { label:"Go through the window", next:"voorhees_cabin" },
      { label:"This feels wrong — go back and take the right fork", next:"fire_road_hike" },
    ]
  },

  // ═══════════════════════════════════════════════
  // ACT 2C — THE ROAD
  // ═══════════════════════════════════════════════
  road_south_approach: {
    jason: true,
    text: "You reach Route 4. Asphalt. Yellow center line. Beautiful.\n\nSouth is Blairstown — six miles. North is the camp entrance — half a mile.\n\nA car passes. Doesn't stop. Doesn't even slow down.\n\nYou can hear the camp behind you. Still. Too still.",
    choices: [
      { label:"Run south down the road toward Blairstown", next:"road_south_run" },
      { label:"Walk and flag cars — running draws attention", next:"road_flag_south" },
      { label:"Go north to the phone box at the entrance", next:"phone_box_approach" },
    ]
  },
  road_south_run: {
    jason: true,
    text: "You run. A mile. The road is empty.\\n\\nTwo miles. Your lungs are on fire. Nothing.\\n\\nThen: headlights behind you. Getting closer. You can't tell yet—",
    choices: [
      { label:"Keep running — it's a civilian car", next:"road_south_car_approach" },
      { label:"Dive into the ditch — you're not sure what it is", next:"road_flat_wait" },
    ]
  },

  road_south_car_approach: {
    jason: true,
    text: "The headlights slow.\\n\\nA station wagon. Family. The driver's window goes down.\\n\\n'What in the—'",
    choices: [
      { label:"Get in the car", next:"car_escape_talk" },
      { label:"Tell the driver to call the police from their car phone", next:"car_phone_call" },
    ]
  },

  car_escape_talk: {
    needs:"axe",
    text: "You tumble in. The driver — a woman in her forties — takes one look at you.\n\n'What happened?'\n\n'Camp Crystal Lake,' you say. 'Please. Just drive.'\n\nShe drives.\n\nYou make Blairstown at 12:47am and walk into the police station together.",
    ending:"escaped_road"
  },

  car_escape_south: {
    needs:"axe",
    text: "You get in.\n\nThe driver — a woman in her forties — doesn't ask questions. She just drives.\n\nYou make Blairstown at 12:47am.",
    ending:"escaped_road"
  },
  car_phone_call: {
    needs:"jason_truth",
    text: "The driver has a CB unit. They patch through to the state police.\n\nYou give everything you have — your name, the camp, the body count.\n\n'Units are already en route,' the dispatcher says. 'We had a call twenty minutes ago.'\n\nSomeone else got out.",
    ending:"radio"
  },
  road_flag_south: {
    jason: true,
    text: "You walk south and flag every car that passes.\n\nThree pass. Fourth one stops — a family in a station wagon.\n\nThe driver looks at your face and doesn't ask any questions.",
    choices: [
      { label:"Get in and ask them to drive to the police", next:"car_escape_talk" },
      { label:"Ask them to use their radio first", next:"car_phone_call" },
    ]
  },
  phone_box_approach: {
    jason: true,
    text: "The phone box at the camp entrance. A payphone nailed to a post.\n\nYou can see it from thirty feet away.\n\nBut the camp entrance is lit by the entrance sign. You'll be visible.\n\nAnd the figure you can see at the tree line — that's him. Watching the road.",
    choices: [
      { label:"Circle through the ditch — approach from the far side", next:"phone_box_ditch" },
      { label:"Run straight for it — you're fast", next:"phone_box_run_straight" },
      { label:"Wait him out — he'll move eventually", next:"phone_box_wait" },
      { label:"Forget the phone — run south on the road", next:"road_south_run" },
    ]
  },
  phone_box_ditch: {
    jason: true,
    text: "You crawl along the ditch for fifty feet.\n\nYou make the phone box from the far side. He hasn't moved.\n\nYou dial 0.",
    choices: [
      { label:"Give them the location and stay on the line", next:"phone_box_stay" },
      { label:"Give them the location and run south immediately", next:"phone_box_run_south" },
    ]
  },
  phone_box_run_straight: {
    text: "He was closer than he looked.",
    ending:"machete"
  },
  phone_box_wait: {
    jason: true,
    text: "You wait twenty minutes.\n\nHe doesn't move.\n\nHe never moves. He just watches.\n\nYou give up waiting and circle through the ditch.",
    choices: [
      { label:"Circle through the ditch to the phone box", next:"phone_box_ditch" },
      { label:"Just run south on the road instead", next:"road_south_run" },
    ]
  },
  phone_box_stay: {
    jason: true,
    needs:"jason_truth",
    text: "You give them everything. Address. Body count. His description.\n\n'Units en route. Twenty-two minutes.'\n\nThe phone box post shivers. He's pulled out the line at the road junction.\n\nThe line goes dead. But you gave them everything.",
    choices: [
      { label:"Run south and meet the police cars coming", next:"car_escape_south" },
      { label:"Hide in the ditch and wait", next:"ditch_wait" },
    ]
  },
  phone_box_run_south: {
    needs:"jason_truth",
    text: "You gave them the location. Now you run.\n\nA police cruiser finds you on Route 4, seven minutes later.",
    ending:"radio"
  },
  ditch_wait: {
    jason: true,
    needs:"jason_truth",
    text: "You're in the drainage ditch. Wet. Cold. Invisible.\n\nHe walks the road for an hour.\n\nAt 2am, red and blue lights appear to the south.",
    ending:"radio"
  },

  // ═══════════════════════════════════════════════
  // ACT 2D — THE LAKE AND DOCK
  // ═══════════════════════════════════════════════
  dock_arrive: {
    jason: true,
    text: "The dock is a hundred feet of gray wood stretching out over black water.\n\nAt the near end: a rope coil, an overturned tackle box. Bill's fishing rod.\n\nAt the far end: the dock house, a rowboat tied to the near piling. A canoe overturned beside it.\n\nThe lake is perfectly still.",
    choices: [
      { label:"Search the dock carefully", next:"dock_search_thorough" },
      { label:"Get straight into the rowboat and cross", next:"rowboat_into" },
      { label:"Check the dock house", next:"dock_house" },
      { label:"Follow the shore east toward the Voorhees property", next:"shore_east" },
      { label:"Look at the water — something feels wrong about it", next:"dock_water_watch" },
    ]
  },
  dock_search_thorough: {
    jason: true,
    text: "Under the tackle box: Jack's good flashlight. Still works.\n\nAt the base of a dock post, carved: 'JASON 1957'\n\nUnder it, fresher knife marks: 'DO NOT GO ON THE WATER AT NIGHT. SHE WATCHES FROM THE EAST SHORE.'\n\nThe dock creaks behind you.",
    gives:"jason_truth",
    choices: [
      { label:"Spin and face whatever is behind you", next:"dock_face_behind" },
      { label:"Dive forward into the rowboat and push off", next:"rowboat_fast_launch" },
      { label:"Roll off the dock into the water to your left", next:"dock_water_roll" },
    ]
  },
  dock_face_behind: {
    jason: true,
    text: "You spin.\n\nIt's the dock house door, blown open by wind. Nothing else.\n\nYour heart rate drops from about two hundred.\n\nYou look at the dock house.",
    choices: [
      { label:"Go into the dock house", next:"dock_house" },
      { label:"Get in the rowboat and cross", next:"rowboat_into" },
      { label:"Head east along the shore", next:"shore_east" },
    ]
  },
  dock_water_watch: {
    text: "You sit at the dock edge and watch the water.\n\nBlack. Bottomless. Still.\n\nThen — ten feet out — something surfaces. Round. Pale. Looking up at you.\n\nA face.\n\nIt sinks before you can be sure.",
    gives:"jason_truth",
    choices: [
      { label:"Get off the dock — do not take the boat", next:"shore_east" },
      { label:"Take the boat anyway — you need to get across", next:"rowboat_into" },
      { label:"Go to the dock house instead", next:"dock_house" },
    ]
  },
  dock_house: {
    jason: true,
    text: "The dock house smells of motor oil and old fish.\n\nA broken outboard motor. Life preservers. A marine radio, old but intact.\n\nYou try the marine radio. It crackles.\n\nA voice: 'Crystal Lake Marina, this is—' then static. But it's working.",
    choices: [
      { label:"Use the marine radio — call for help", next:"marine_radio_prepare" },
      { label:"Keep listening — you might learn something", next:"marine_radio_listen" },
      { label:"Search the dock house for more supplies", next:"dock_house_search" },
    ]
  },
  marine_radio_prepare: {
    jason: true,
    needs:"jason_truth",
    text: "The radio looks functional. Military surplus. You find the state police emergency frequency in the logbook next to it.\n\nYou sit down. Your hands are shaking.\n\nYou need to transmit everything you know — your name, the camp, the number of casualties. Make it count.",
    choices: [
      { label:"Transmit now — give them everything", next:"marine_radio_transmit" },
      { label:"Listen first — you might learn something", next:"marine_radio_listen" },
    ]
  },

  marine_radio_transmit: {
    needs:"axe",
    text: "You key transmit and give your location, your name, the situation.\n\nA pause. Then: 'Crystal Lake, we read you. We're relaying to state police. Sit tight.'\n\nYou sit in the dark dock house and wait.\n\nAt 3:10am a police boat comes across the lake with lights going.",
    ending:"radio"
  },
  marine_radio_listen: {
    jason: true,
    needs:"rope",
    text: "You listen for ten minutes. Mostly fishing talk.\n\nThen, on a different frequency: a woman's voice, very quiet, almost chanting.\n\n'He never died. He was my son and he never died. The water gave him back. He does what I ask.'\n\nThe transmission ends.",
    gives:"jason_truth",
    choices: [
      { label:"Transmit now — report what you just heard", next:"marine_radio_transmit" },
      { label:"Go to the east shore and find that woman", next:"shore_east_night" },
      { label:"Get out of here on the water now", next:"rowboat_into" },
    ]
  },
  dock_house_search: {
    jason: true,
    text: "Behind the motor: a flare gun with two cartridges.\n\nA life preserver with a rope attached — fifty feet of it.\n\nAnd a key on a hook labeled 'BOATHOUSE EAST' — a key you didn't have before.",
    gives:"key_cabin4",
    choices: [
      { label:"Take the flare gun and go to the east boathouse", next:"shore_east" },
      { label:"Take the flare gun and use the marine radio", next:"marine_radio_prepare" },
      { label:"Take everything and get in the rowboat", next:"rowboat_into" },
    ]
  },
  rowboat_into: {
    jason: true,
    text: "You untie the rowboat. The oars are inside.\n\nYou push off. Every stroke echoes across the still water.\n\nYou're halfway across when the boat drops six inches.\n\nSomething is under it.",
    choices: [
      { label:"Row harder — sprint for the far shore", next:"rowboat_sprint_hard" },
      { label:"Use the axe on whatever is underneath", next:"rowboat_axe_hull", needs:"axe" },
      { label:"Flip over the side and swim", next:"swim_launch" },
      { label:"Hold completely still — maybe it passes", next:"rowboat_go_still" },
    ]
  },
  rowboat_sprint_hard: {
    jason: true,
    text: "You pull with everything you have.\n\nThe boat shudders. Tips. The bow comes up.\n\nYou're going in.",
    choices: [
      { label:"Swim for the far shore — keep going", next:"swim_far_shore" },
      { label:"Swim back — the near shore is closer", next:"swim_near_shore" },
    ]
  },
  rowboat_axe_hull: {
    jason: true,
    needs:"axe",
    text: "You drive the axe through the hull. The boat floods.\n\nA hand comes through the hole. You chop at the wrist. It withdraws.\n\nThe boat is sinking. Thirty seconds.",
    choices: [
      { label:"Swim hard for the far shore", next:"swim_far_shore" },
      { label:"Swim for the inlet — closer and shallower", next:"swim_inlet" },
    ]
  },
  rowboat_go_still: {
    text: "You stop rowing.\n\nThe boat stabilizes.\n\nWhatever was there... stops too.\n\nYou wait three minutes without breathing. Then you row again, slowly.",
    choices: [
      { label:"Continue to the far shore — slowly", next:"far_shore_arrive" },
      { label:"Turn back to the near shore — something's wrong", next:"swim_near_shore" },
    ]
  },
  rowboat_fast_launch: {
    jason: true,
    text: "You throw yourself into the rowboat and push off with your feet.\n\nYou're moving before you have the oars in the locks.\n\nBehind you: footsteps on the dock. Getting faster.",
    choices: [
      { label:"Row hard — don't look back", next:"rowboat_sprint_hard" },
      { label:"Use a flare — blind him from the dock", next:"rowboat_flare_dock", needs:"flares_box" },
    ]
  },
  rowboat_flare_dock: {
    jason: true,
    text: "You crack a flare and throw it back toward the dock.\n\nHe stops at the dock end. Doesn't follow into the water.\n\nYou row steadily across.",
    choices: [
      { label:"Make for the far shore", next:"far_shore_arrive" },
      { label:"Make for the east shore — find the Voorhees property", next:"shore_east_water" },
    ]
  },
  dock_water_roll: {
    jason: true,
    text: "You roll off the dock into black water. It's freezing. It shocks the air out of you.\n\nYou surface. You're ten feet from the rowboat.",
    choices: [
      { label:"Swim to the rowboat and get in", next:"rowboat_into" },
      { label:"Swim toward the east shore — avoid the boat", next:"swim_inlet" },
    ]
  },
  swim_launch: {
    jason: true,
    text: "The water is a physical shock. Black and freezing.\n\nYou surface and start swimming.\n\nThe far shore lights are a hundred yards north.",
    choices: [
      { label:"Swim straight for the far shore lights", next:"swim_far_shore" },
      { label:"Swim east toward the inlet — shallower water", next:"swim_inlet" },
    ]
  },
  swim_far_shore: {
    jason: true,
    needs:"rope",
    text: "You swim hard. Sixty yards. Forty. Twenty.\n\nSomething brushes your leg.\n\nYou kick and sprint the last twenty yards. Your hands hit gravel.",
    choices: [
      { label:"Crawl up the bank and run to Route 4", next:"car_escape_south" },
      { label:"Get up and sprint without stopping", next:"fire_road_hike" },
    ]
  },
  swim_near_shore: {
    text: "You turn back. You make the near shore. You collapse on the dock, shaking.\n\nYou have to try another way.",
    choices: [
      { label:"Go to the east shore on foot", next:"shore_east" },
      { label:"Go to the lodge", next:"forest_toward_lodge" },
      { label:"Head for the road", next:"forest_toward_road" },
    ]
  },
  swim_inlet: {
    jason: true,
    text: "The inlet is shallow — you stand when you're still thirty feet out.\n\nYou wade the last thirty feet, reeds closing around you.\n\nBehind you: a splash. Something large entering the water.",
    choices: [
      { label:"Push through the reeds fast and run up the bank", next:"inlet_escape_run" },
      { label:"Go still in the reeds — he might not follow in shallow water", next:"inlet_hide_reeds" },
    ]
  },
  inlet_escape_run: {
    needs:"axe",
    text: "You burst out of the reeds and up the embankment.\n\nYou run for Route 4 and don't look back.",
    ending:"escaped_road"
  },
  inlet_hide_reeds: {
    jason: true,
    text: "You press into the reeds, chest-deep, motionless.\n\nHe wades in. Waist deep. Stops.\n\nStands there for five minutes.\n\nThen walks out the way he came.",
    choices: [
      { label:"Wait another twenty minutes then go to Route 4", next:"inlet_escape_run" },
      { label:"Move quietly east along the shore to the Voorhees property", next:"shore_east" },
    ]
  },
  far_shore_arrive: {
    text: "You reach the far bank. No dock — just gravel and weeds.\n\nYou pull the rowboat up and look back at Camp Crystal Lake across the water.\n\nThe lights of the lodge flicker and go dark.\n\nRoute 4 is a quarter mile east through scrub.",
    choices: [
      { label:"Walk to Route 4 and flag down a car", next:"road_south_approach" },
      { label:"Rest here a moment and decide your next move", next:"far_shore_rest" },
    ]
  },
  far_shore_rest: {
    text: "You sit on the gravel and breathe.\n\nYou're alive. Wet. Cold. But alive.\n\nFrom across the lake you can hear — very faintly — something in the water.",
    choices: [
      { label:"Walk to Route 4 now", next:"car_escape_south" },
      { label:"Get back in the rowboat and go to the east shore", next:"shore_east_water" },
    ]
  },

  // ═══════════════════════════════════════════════
  // ACT 3 — THE EAST SHORE / VOORHEES PROPERTY
  // Only fully accessible with jason_truth and map
  // ═══════════════════════════════════════════════
  shore_east: {
    jason: true,
    needs:"key_cabin4",
    text: "You follow the shore east on foot. Half a mile.\n\nThe trees close in. The shoreline gets rockier.\n\nThen you see it: an old boathouse, built into the bank. A light inside — not electric. Candles.\n\nNext to it: a small camp. A sleeping bag. A cookfire, burning low. Personal effects.",
    choices: [
      { label:"Go into the boathouse", next:"voorhees_boathouse_exterior", needs:"key_cabin4" },
      { label:"Search the camp outside the boathouse", next:"voorhees_camp_search" },
      { label:"Watch from the tree line — see who comes back", next:"voorhees_watch" },
      { label:"This feels wrong — go back toward the main camp", next:"forest_toward_lodge" },
    ]
  },
  shore_east_night: {
    jason: true,
    needs:"key_cabin4",
    text: "You approach the east shore at night. The orange light is here — a cookfire, low.\n\nThe boathouse is here. A sleeping bag. A small altar of sorts: photographs of a boy, a camp ID badge, pressed flowers.\n\nThe photos are decades old. The boy in them drowned. You can see the camp ID: JASON VOORHEES, AGE 11, JUNIOR COUNSELOR 1957.",
    gives:"jason_truth",
    choices: [
      { label:"Go into the boathouse", next:"voorhees_boathouse_exterior", needs:"key_cabin4" },
      { label:"Search the camp further", next:"voorhees_camp_search" },
      { label:"Wait here — she'll come back", next:"voorhees_watch" },
    ]
  },
  shore_east_water: {
    jason: true,
    needs:"key_cabin4",
    text: "You row to the east shore and land at a crumbling old dock.\n\nA boathouse. Candles in the window.\n\nOn the dock, wet footprints. Recent.",
    choices: [
      { label:"Go into the boathouse", next:"voorhees_boathouse_exterior", needs:"key_cabin4" },
      { label:"Search around outside first", next:"voorhees_camp_search" },
    ]
  },
  voorhees_camp_search: {
    text: "You search the camp.\n\nA journal, decades of entries. She comes here every summer. She's been coming since 1958. She watched every group of counselors.\n\nLast entry, dated two days ago: 'They opened it again. Foolish. Jason is home. He'll do what needs doing. They deserve it. They all deserve it.'\n\nA photograph falls out of the journal. A woman, middle-aged, 1978 photo. On the back: 'PAMELA VOORHEES, CAMP COOK.'",
    gives:"jason_truth",
    choices: [
      { label:"Wait here — she'll be back", next:"voorhees_watch" },
      { label:"Get into the boathouse", next:"voorhees_boathouse_exterior", needs:"key_cabin4" },
      { label:"Take the journal and get to the police", next:"road_south_approach" },
    ]
  },
  voorhees_boathouse_exterior: {
    needs:"key_cabin4",
    text: "The key from the dock house fits.\n\nThe boathouse interior is a shrine. More photographs. A child's shoe. A swimming certificate dated 1956. Candles everywhere.\n\nAnd in the corner: a shortwave radio. Commercial grade.\n\nShe's been monitoring the camp all summer.",
    choices: [
      { label:"Use her radio to call the police", next:"voorhees_radio_call" },
      { label:"Look for something that proves her connection to the killings", next:"voorhees_evidence" },
      { label:"Destroy the shrine and wait for her", next:"voorhees_wait_trap" },
    ]
  },
  voorhees_radio_call: {
    text: "You get through to the state police on her frequency.\n\nYou tell them everything. The camp. The woman. The journal. The shrine.\n\nThey believe you faster than you expected. 'We've been tracking this woman for three years,' the dispatcher says. 'Don't move. We're coming.'",
    choices: [
      { label:"Wait in the boathouse", next:"voorhees_wait_police" },
      { label:"Wait outside where they can find you", next:"voorhees_wait_outside" },
    ]
  },
  voorhees_wait_police: {
    jason: true,
    text: "You wait in the boathouse. Twenty minutes.\n\nShe comes back.\n\nThe door opens.",
    choices: [
      { label:"Confront her directly", next:"pamela_confrontation" },
      { label:"Stay hidden and wait for the police", next:"voorhees_stay_hidden" },
    ]
  },
  voorhees_wait_outside: {
    jason: true,
    text: "You wait outside near the dock.\n\nYou hear the police helicopter before you see it.\n\nShe hears it too. You hear her moving in the boathouse.",
    choices: [
      { label:"Stay put — the helicopter is almost here", next:"voorhees_helicopter_arrive" },
      { label:"Go back inside to stop her from destroying evidence", next:"pamela_confrontation" },
    ]
  },
  voorhees_helicopter_arrive: {
    text: "The helicopter sweeps the east shore with a spotlight.\n\nYou wave both arms.\n\nBehind you, the boathouse door opens. Then closes. Then silence.\n\nShe's gone.\n\nBut you gave them everything they needed to find her.",
    ending:"pamela"
  },
  voorhees_stay_hidden: {
    jason: true,
    text: "You press into the corner behind crates.\n\nShe comes in. Lights more candles. Kneels at the shrine.\n\nShe talks to the photographs. To Jason. For ten minutes.\n\nYou don't breathe.",
    choices: [
      { label:"Stay hidden until the police arrive", next:"voorhees_police_arrive" },
      { label:"Try to slip out past her", next:"pamela_slip_past" },
    ]
  },
  voorhees_police_arrive: {
    text: "You hear engines on the water. Police boats.\n\nShe hears it too. She stands and turns toward the door.\n\nThat's when the door bursts in.",
    ending:"pamela"
  },
  pamela_slip_past: {
    jason: true,
    text: "You inch toward the door.\n\nA floorboard.\n\nShe turns. Her eyes find you in the dark.",
    choices: [
      { label:"Run for it", next:"pamela_run" },
      { label:"Talk to her — you know about Jason", next:"pamela_confrontation" },
    ]
  },
  pamela_run: {
    jason: true,
    text: "You run.\n\nShe's faster than she looks.\n\nYou're both on the dock when you hear the helicopter.",
    choices: [
      { label:"Jump into the water and swim", next:"swim_far_shore" },
      { label:"Turn and face her — you're done running", next:"pamela_confrontation" },
    ]
  },
  voorhees_evidence: {
    text: "Behind the radio: a ledger. Every counselor who ever worked at Crystal Lake, going back to 1958. Date of death. Method.\n\nShe kept records.\n\nTwenty-three years of records.",
    gives:"jason_truth",
    choices: [
      { label:"Take the ledger and call the police", next:"voorhees_radio_call" },
      { label:"Wait for her to come back — with this evidence", next:"voorhees_watch" },
    ]
  },
  voorhees_watch: {
    jason: true,
    text: "You find cover in the tree line and watch.\n\nAn hour passes.\n\nThen: footsteps on the shore path. A woman, middle-aged, carrying firewood. Moving with purpose.\n\nShe goes into the boathouse. Light blooms inside. She begins talking.",
    choices: [
      { label:"Approach the boathouse and listen", next:"pamela_listen_outside" },
      { label:"Go in directly and confront her", next:"pamela_confrontation" },
      { label:"Back away quietly and go to the police", next:"road_south_approach" },
    ]
  },
  pamela_listen_outside: {
    text: "She's talking to the shrine. To Jason.\n\nYou can hear every word.\n\n'They sent another group. All of them foolish. All of them guilty. Not watching. Never watching.'\n\nA pause.\n\n'He'll find them. He always finds them. He's my son and he never left the water.'",
    gives:"jason_truth",
    choices: [
      { label:"Go in and confront her with what you know", next:"pamela_confrontation" },
      { label:"Stay outside and use her own radio to call the police", next:"voorhees_radio_call" },
      { label:"Back away very quietly and get out of here", next:"road_south_approach" },
    ]
  },
  pamela_confrontation: {
    jason: true,
    text: "You face her.\n\nShe's calm. Older than you expected. Tired around the eyes.\n\n'You found it,' she says. Not a question.\n\nShe looks at you the way you look at something you've been expecting for a long time.",
    choices: [
      { label:"'I know about Jason. I know what happened in 1957.'", next:"pamela_talk_jason" },
      { label:"'You killed them. All of them.'", next:"pamela_accuse" },
      { label:"Run — don't engage", next:"pamela_run" },
    ]
  },
  pamela_talk_jason: {
    text: "Her face changes.\n\nFor the first time, something other than certainty.\n\n'Who told you?' she says. 'Who kept the records?'\n\nYou tell her about Alice's letter. The logbook. The wall carvings.\n\nShe sits down. A long silence. 'They never blamed themselves,' she says. 'Not one of them ever blamed themselves.'",
    choices: [
      { label:"'You can stop this. It doesn't have to keep happening.'", next:"pamela_talk_end" },
      { label:"Keep her talking — the police are coming", next:"pamela_stall" },
    ]
  },
  pamela_talk_end: {
    text: "She looks at you for a long time.\n\nThen she stands and walks to the dock.\n\nShe stands at the water's edge for five minutes.\n\nWhen the police boat appears around the point, she doesn't run.",
    ending:"pamela"
  },
  pamela_stall: {
    needs:"jason_truth",
    text: "You keep her talking. Ask about Jason. About 1957. She wants to tell it.\n\nForty minutes pass. You hear the police boat before she does.\n\nWhen the lights come around the point of the east shore, she finally stops talking.",
    ending:"pamela"
  },
  pamela_accuse: {
    jason: true,
    text: "Her face hardens.\n\n'Yes,' she says. 'And you were going to be next.'",
    choices: [
      { label:"She has a knife. You have an axe. Fight.", next:"pamela_fight", needs:"axe" },
      { label:"Run back the way you came", next:"pamela_run" },
      { label:"Light a flare in her face", next:"pamela_flare", needs:"flares_box" },
    ]
  },
  pamela_flare: {
    jason: true,
    text: "You crack the flare and shove it toward her. She stumbles back.\n\nYou run along the shore toward the far dock.",
    choices: [
      { label:"Get back to the main camp and the truck", next:"lodge_back_lot" },
      { label:"Run for the road", next:"road_south_approach" },
    ]
  },
  pamela_fight: {
    needs:"axe",
    text: "It's brutal and short.\n\nShe's strong. Stronger than she looks. But you have the axe.\n\nWhen the police boat arrives twenty minutes later, you're sitting on the dock, unable to stand.\n\nThe detective looks at the scene and at you.\n\n'He'll still be out there,' you say. 'Her son. The water gave him back.'\n\nThe detective writes it down.",
    ending:"hero"
  },
  voorhees_wait_trap: {
    jason: true,
    text: "You set up near the door with the axe. Wait.\n\nAn hour. Two.\n\nShe comes in. The candles light her from below.",
    choices: [
      { label:"Confront her", next:"pamela_confrontation" },
      { label:"Hit her from behind while she's at the shrine", next:"voorhees_ambush" },
    ]
  },
  voorhees_ambush: {
    text: "You swing.\n\nShe goes down.\n\nWhen the police arrive at 4am responding to the radio call, you're sitting outside the boathouse with the axe across your knees.\n\nYou're alive.\n\nShe isn't.",
    ending:"hero"
  },

  // ═══════════════════════════════════════════════
  // THE VOORHEES CABIN (fire road deep end)
  // ═══════════════════════════════════════════════
  voorhees_cabin: {
    text: "Inside the caretaker cabin.\n\nDust everywhere. A cot. A woodstove.\n\nAnd on every wall: newspaper clippings. Crystal Lake. The drowning. The 1958 murders. The 1962 reopening murders. Every reopening and every closure.\n\nThis was her cabin. Before she moved to the east boathouse.",
    gives:"jason_truth",
    choices: [
      { label:"Search more carefully", next:"voorhees_cabin_search" },
      { label:"Take the key on the nail by the door — it might open something", next:"voorhees_cabin_key", gives:"key_cabin4" },
      { label:"Get out and head to the east shore", next:"shore_east" },
    ]
  },
  voorhees_cabin_search: {
    text: "Behind a loose board under the cot: a tin box.\n\nInside: letters. From Pamela Voorhees to someone called Elias. Jason's father, maybe.\n\nThe last letter reads: 'He didn't drown. I know it. The lake kept him. He'll come back when they reopen. He always comes back when they reopen.'\n\nShe believed every word.",
    gives:"jason_truth",
    choices: [
      { label:"Take the key and go to the east boathouse", next:"voorhees_cabin_key", gives:"key_cabin4" },
      { label:"Head to the main lodge with this information", next:"forest_toward_lodge" },
      { label:"Head to the police via the fire road right fork", next:"fire_road_hike" },
    ]
  },
  voorhees_cabin_key: {
    text: "The key is old iron. On the tag, in faded marker: 'E. BOATHOUSE'.\n\nEast boathouse. That's where the light is.",
    choices: [
      { label:"Go to the east boathouse", next:"shore_east" },
      { label:"Go to the main lodge first", next:"forest_toward_lodge" },
    ]
  },
  generator_shed: {
    jason: true,
    text: "The generator shed is twenty feet behind the lodge.\n\nThe door is open. The generator is running — barely. The fuel line has been torn out and reconnected badly.\n\nYou can fix it. Five minutes of work. Power comes back to the lodge.",
    choices: [
      { label:"Fix the fuel line — restore power", next:"generator_restore" },
      { label:"Don't touch it — power draws him back", next:"generator_leave" },
      { label:"Sabotage it completely — darkness is better cover", next:"generator_destroy" },
    ]
  },
  generator_restore: {
    text: "The lights in the lodge come back on.\n\nYou can hear him stop moving. He tilts his head at the light.\n\nYou use the moment to get into the lodge while he's distracted.",
    choices: [
      { label:"Get to the radio in the office", next:"lodge_office_approach" },
      { label:"Get upstairs and see the whole camp", next:"lodge_upstairs" },
    ]
  },
  generator_leave: {
    text: "You leave it and go to the lodge in the dark.",
    choices: [
      { label:"Enter through the front", next:"lodge_front_dark" },
      { label:"Enter through the side window", next:"lodge_side_window" },
    ]
  },
  generator_destroy: {
    text: "You pull the fuel line completely. The generator dies.\n\nTotal darkness across the camp.\n\nYou move through it.",
    choices: [
      { label:"Head to the lodge in the dark", next:"lodge_front_dark" },
      { label:"Head toward the lake instead", next:"forest_toward_lake" },
    ]
  },
  generator_shed_approach: {
    jason: true,
    text: "You slip out the lodge back door and go to the generator shed.",
    choices: [
      { label:"Go into the shed", next:"generator_shed" },
      { label:"Go to the back lot instead", next:"lodge_back_lot" },
    ]
  },
  lodge_side_window: {
    jason: true,
    text: "The side window is unlocked. You ease it open and climb in.\n\nYou're in the dining room. Chairs. Tables. Cold coffee in cups — they were eating dinner when it happened.\n\nA back hallway leads toward the kitchen and the office.",
    choices: [
      { label:"Go to the kitchen", next:"lodge_kitchen" },
      { label:"Get to the office and the radio", next:"lodge_office_approach" },
      { label:"Go carefully to the common room", next:"lodge_common_room" },
    ]
  },
  cabin4_exterior: {
    jason: true,
    text: "Cabin 4 is the farthest from the lodge. Nobody came out here much.\n\nThe door is locked with a padlock. Through the window: someone stacked a lot of gear in here. Camp supplies, a first aid kit — and what looks like a rifle case.",
    choices: [
      { label:"Break the window to get in", next:"lodge_kitchen" },
      { label:"Use the cabin key if you have it", next:"lodge_office_approach", needs:"key_cabin4" },
      { label:"Leave it — head to the lodge", next:"forest_toward_lodge" },
    ]
  },
  cabin4_break_in: {
    jason: true,
    text: "You break the window. The padlock can wait — you climb through.\n\nThe rifle case has a rifle inside it. A .30-06, bolt-action. Four rounds.\n\nThis changes things.",
    gives:"knife",
    choices: [
      { label:"Take the rifle and go find him", next:"hunt_jason" },
      { label:"Take the rifle and get to the road", next:"road_south_approach" },
      { label:"Take the rifle and wait at the lodge", next:"forest_toward_lodge" },
    ]
  },
  cabin4_open: {
    text: "The key fits.\n\nInside: a rifle case. A .30-06 with four rounds.\n\nYou've hunted before. You know this gun.",
    gives:"knife",
    choices: [
      { label:"Go hunt him", next:"hunt_jason" },
      { label:"Get to the road with this", next:"road_south_approach" },
      { label:"Set up at the lodge", next:"forest_toward_lodge" },
    ]
  },
  hunt_jason: {
    jason: true,
    text: "You go looking for him.\n\nFourteen years of hunting, and you track him to the tree line north of the dock.\n\nHe's standing at the water. Looking out at the lake.\n\nYou have a clear shot.",
    choices: [
      { label:"Shoot", next:"shoot_jason" },
      { label:"Wait — this feels too easy. Something is wrong.", next:"hunt_jason_pause" },
    ]
  },
  hunt_jason_pause: {
    jason: true,
    text: "You wait.\n\nHe turns.\n\nHe was facing the water. He was facing away from the camp. That's not what a hunter does.\n\nHe sits down at the dock edge and puts his head in his hands.",
    choices: [
      { label:"Shoot him while you can", next:"shoot_jason" },
      { label:"Lower the rifle", next:"dont_shoot_jason" },
    ]
  },
  shoot_jason: {
    text: "Four shots.\n\nHe goes into the water on the fourth.\n\nYou watch the surface for ten minutes. Nothing comes up.\n\nYou walk to Route 4 and flag down a car.\n\nYou don't tell anyone what you did with the rifle.",
    ending:"hero"
  },
  dont_shoot_jason: {
    text: "You lower the rifle.\n\nHe stays at the dock for an hour.\n\nThen he walks into the lake.\n\nYou watch him go under.\n\nYou walk to Route 4 and flag down a car.\n\nYou don't tell anyone what you saw.",
    ending:"pamela"
  },

  // ─── Misc connectors ───────────────────────────
  flag_car: {
    text: "A station wagon slows for you.\n\nThe driver looks at your face and doesn't ask any questions.\n\nYou make it to Blairstown at 12:53am.",
    ending:"escaped_road"
  },

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

  const btnS = {background:"transparent",border:"1px solid rgba(255,80,80,0.5)",borderRadius:12,color:"#ff8080",fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:3,padding:"12px 28px",cursor:"pointer"};
  const btn2S = {...btnS,border:"1px solid rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.4)"};
  const btn3S = {...btnS,border:"1px solid rgba(100,200,100,0.4)",color:"#88cc88"};

  return (
    <div style={{position:"fixed",inset:0,background:"#060806",zIndex:100,display:"flex",flexDirection:"column",fontFamily:"'Inter',sans-serif",overflow:"hidden"}}>

      {/* Death flash overlay */}
      {deathMsg && (
        <div style={{position:"absolute",inset:0,background:"rgba(180,0,0,0.92)",zIndex:200,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,textAlign:"center",animation:"fi 0.2s"}}>
          <div style={{fontSize:48,marginBottom:16}}>💀</div>
          <div style={{color:"#fff",fontSize:17,lineHeight:1.8,fontFamily:"'Inter',sans-serif",maxWidth:300,marginBottom:24}}>{deathMsg}</div>
          <div style={{color:"rgba(255,255,255,0.5)",fontSize:13,letterSpacing:3}}>
            {livesRef.current > 0 ? `${livesRef.current} ${livesRef.current === 1 ? 'LIFE' : 'LIVES'} REMAINING` : 'NO LIVES LEFT'}
          </div>
          <div style={{display:"flex",gap:6,marginTop:12}}>
            {[0,1,2].map(i => <span key={i} style={{fontSize:20,opacity:i < livesRef.current ? 1 : 0.15}}>❤️</span>)}
          </div>
        </div>
      )}

      <div style={{padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,80,80,0.15)",flexShrink:0}}>
        <button onClick={onExit} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,color:"rgba(255,255,255,0.4)",fontSize:11,letterSpacing:2,padding:"5px 10px",cursor:"pointer"}}>← EXIT</button>
        <div style={{color:"rgba(255,80,80,0.8)",fontSize:11,letterSpacing:4,fontFamily:"'Cinzel',serif"}}>CAMP BLOOD</div>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.25)",display:"flex",alignItems:"center",gap:4}}>
          <div style={{display:"flex",gap:2,marginRight:4}}>
            {[0,1,2].map(i => <span key={i} style={{fontSize:12,opacity:i < lives ? 1 : 0.12}}>❤️</span>)}
          </div>
          {inventory.map(i => <span key={i} title={i}>{ITEM_ICONS[i]||"📦"}</span>)}
          {jasonNear && <span style={{color:"#ff4444",marginLeft:4,animation:"pulse 0.8s infinite"}}>⚠️</span>}
        </div>
      </div>

      {phase === "intro" && (
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,textAlign:"center"}}>
          <div style={{fontSize:42,marginBottom:12}}>🏕️</div>
          <div style={{fontSize:20,color:"#e8ddd4",letterSpacing:6,marginBottom:6,fontFamily:"'Cinzel',serif"}}>CAMP BLOOD</div>
          <div style={{fontSize:13,color:"rgba(255,80,80,0.6)",letterSpacing:4,marginBottom:20,fontFamily:"'Cinzel',serif"}}>CRYSTAL LAKE — SUMMER 1980</div>
          <div style={{color:"#e8ddd4",fontSize:17,lineHeight:2,marginBottom:28,maxWidth:320,fontFamily:"'Inter',sans-serif"}}>
            You are a camp counselor.<br/>
            Jason is real.<br/>
            The others are already dead.<br/>
            Your choices determine what happens next.<br/>
            <span style={{color:"rgba(255,80,80,0.7)",fontSize:15}}>You have 3 lives. Wrong moves cost one.</span><br/>
            <span style={{color:"rgba(255,255,255,0.3)",fontSize:13}}>10 endings. ~20 minutes per full run.</span>
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center",marginBottom:8}}>
            <button onClick={() => startGame(false)} style={btnS}>NEW GAME</button>
            {hasSaveGame && <button onClick={() => startGame(true)} style={btn3S}>CONTINUE</button>}
          </div>
          {endingsRef.current.size > 0 && (
            <div style={{marginTop:16}}>
              <div style={{color:"rgba(255,255,255,0.2)",fontSize:10,letterSpacing:2,marginBottom:8}}>{endingsRef.current.size} OF {totalEndings} ENDINGS FOUND</div>
              <div style={{display:"flex",gap:6,justifyContent:"center"}}>
                {Object.entries(CB_ENDINGS).map(([key,e]) => (
                  <span key={key} style={{fontSize:18,opacity:endingsRef.current.has(key)?1:0.12,filter:endingsRef.current.has(key)?"none":"grayscale(1)"}} title={endingsRef.current.has(key)?e.title:"???"}>{e.emoji}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {phase === "playing" && (
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div ref={logRef} style={{flex:1,overflowY:"auto",padding:"16px",display:"flex",flexDirection:"column",gap:14}}>
            {(() => { const lastTextIdx = log.map((e,i)=>(!e.choice?i:-1)).filter(i=>i>=0).slice(-1)[0]; return log.map((entry, i) => (
              entry.choice
                ? <div key={i} style={{color:"rgba(255,80,80,0.8)",fontSize:16,letterSpacing:0.5,paddingLeft:12,borderLeft:"2px solid rgba(255,80,80,0.4)",fontStyle:"italic",fontFamily:"'Inter',sans-serif"}}>▶ {entry.choice}</div>
                : <div key={i} style={{color: i === lastTextIdx ? "#e8ddd4" : "rgba(255,255,255,0.18)", fontSize:17,lineHeight:1.75,whiteSpace:"pre-line",fontFamily:"'Inter',sans-serif",fontWeight:400,letterSpacing:0.3,transition:"color 0.3s"}}>{entry.text}</div>
            )); })()}
          </div>
          <div style={{padding:"12px 16px 20px",borderTop:"1px solid rgba(255,80,80,0.08)",display:"flex",flexDirection:"column",gap:7,flexShrink:0,background:"rgba(0,0,0,0.5)"}}>
            {choices.map((c,i) => (
              <button key={i} onClick={() => choose(c)} style={{
                background:"rgba(255,255,255,0.02)",
                border:"1px solid rgba(255,255,255,0.1)",
                borderRadius:10,color:"#ddd8ce",
                fontFamily:"'Inter',sans-serif",
                fontSize:15,padding:"11px 16px",
                cursor:"pointer",textAlign:"left",lineHeight:1.4,
              }}>
                <span style={{color:"rgba(255,80,80,0.5)",marginRight:8}}>{i+1}.</span>{c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === "ending" && ending && (
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,textAlign:"center"}}>
          <div style={{fontSize:52,marginBottom:14}}>{ending.emoji}</div>
          {ending.gameOver && <div style={{fontSize:12,color:"#ff4444",letterSpacing:4,marginBottom:8,fontFamily:"'Cinzel',serif"}}>NO LIVES REMAINING</div>}
          <div style={{fontSize:20,color:ending.color,letterSpacing:4,marginBottom:8,fontFamily:"'Cinzel',serif"}}>{ending.title}</div>
          <div style={{color:"rgba(255,255,255,0.35)",fontSize:13,letterSpacing:1,lineHeight:1.8,marginBottom:12,maxWidth:300,fontStyle:"italic"}}>"{ending.sub}"</div>
          <div style={{color:"rgba(255,255,255,0.15)",fontSize:10,letterSpacing:2,marginBottom:24}}>{endingsRef.current.size} of {totalEndings} endings found</div>
          <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:20}}>
            {Object.entries(CB_ENDINGS).map(([key,e]) => (
              <span key={key} style={{fontSize:20,opacity:endingsRef.current.has(key)?1:0.1,filter:endingsRef.current.has(key)?"none":"grayscale(1)"}} title={endingsRef.current.has(key)?e.title:"???"}>
                {e.emoji}
              </span>
            ))}
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
            <div style={{fontFamily:"'Jolly Lodger',cursive",fontSize:28,color:"#e8ddd4",letterSpacing:3}}>{score}</div>
            <div style={{fontSize:12,color:"rgba(255,200,0,0.8)",letterSpacing:2,alignSelf:"center"}}>
              {streak >= 3 ? `🔥 ${streak}x STREAK!` : ""}
            </div>
            <div style={{fontSize:20,color:timerColor,fontFamily:"'Jolly Lodger',cursive",letterSpacing:2}}>{timeLeft}s</div>
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
          <div style={{fontSize:42,color:"#e8ddd4",fontFamily:"'Jolly Lodger',cursive",letterSpacing:4,margin:"12px 0"}}>{score}</div>
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

// ── GRAVEYARD DASH (FROGGER STYLE) ──
const GD_W = 340, GD_H = 460;
const GD_ROWS = 9;      // playfield rows
const GD_CELL = Math.floor(GD_H / (GD_ROWS + 2)); // cell height
const GD_COLS = 10;
const GD_CELL_W = Math.floor(GD_W / GD_COLS);

const GD_KILLERS = [
  { emoji:"🔪", name:"Michael" },
  { emoji:"🗡️", name:"Jason" },
  { emoji:"👻", name:"Ghostface" },
  { emoji:"🎩", name:"Freddy" },
  { emoji:"🪚", name:"Leatherface" },
];

const GD_SAFE_ROWS = new Set([0, 4, 8]); // start, mid safe, top goal
// Row layout (bottom to top):
// Row 0: start safe zone
// Row 1-3: killer lanes (moving killers)
// Row 4: mid safe zone (tombstones to hop on)
// Row 5-7: hazard lanes (moving tombstone slabs to hop)
// Row 8: goal — 5 coffins to fill

function GraveyardDash({ onExit, onHighScore, highScore }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const animRef = useRef(null);
  const lastTimeRef = useRef(null);
  const [phase, setPhase] = useState("intro"); // intro | playing | dead | win | gameover
  const [lives, setLives] = useState(5);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const phaseRef = useRef("intro");
  const livesRef = useRef(5);
  const scoreRef = useRef(0);
  const levelRef = useRef(1);

  const initState = (lvl) => {
    const spd = 1 + (lvl - 1) * 0.18;
    // Lane configs: type, speed, dir, entities
    const lanes = [
      // Row 0: safe start — no entities
      { type: "safe", entities: [] },
      // Row 1-3: killer lanes
      { type: "killer", speed: spd * 1.0, dir: 1,  entities: buildLane(3, lvl) },
      { type: "killer", speed: spd * 0.8, dir: -1, entities: buildLane(2, lvl) },
      { type: "killer", speed: spd * 1.2, dir: 1,  entities: buildLane(4, lvl) },
      // Row 4: mid safe zone — stationary tombstones to rest on
      { type: "safe", entities: [] },
      // Row 5-7: floating slab lanes (like logs — stand on them or fall)
      { type: "slab",  speed: spd * 0.8, dir: -1, entities: buildSlabs(3, lvl) },
      { type: "slab",  speed: spd * 1.1, dir: 1,  entities: buildSlabs(2, lvl) },
      { type: "slab",  speed: spd * 0.7, dir: -1, entities: buildSlabs(3, lvl) },
      // Row 8: goal coffins
      { type: "goal",  entities: [false, false, false, false, false] },
    ];
    return {
      px: Math.floor(GD_COLS / 2), // player col (0-9)
      py: 0,                        // player row (0=bottom safe)
      lanes,
      lives: livesRef.current,
      score: scoreRef.current,
      level: lvl,
      dead: false,
      won: false,
      onSlab: null,   // which slab player is riding
      stepTimer: 0,   // time since last allowed step (brief invuln)
    };
  };

  function buildLane(count, lvl) {
    const entities = [];
    const spacing = GD_W / count;
    for (let i = 0; i < count; i++) {
      const k = GD_KILLERS[Math.floor(Math.random() * GD_KILLERS.length)];
      entities.push({ x: i * spacing + Math.random() * 30, w: GD_CELL_W * 1.2, emoji: k.emoji });
    }
    return entities;
  }

  function buildSlabs(count, lvl) {
    const entities = [];
    const spacing = GD_W / count;
    for (let i = 0; i < count; i++) {
      entities.push({ x: i * spacing, w: GD_CELL_W * 2.5 });
    }
    return entities;
  }

  const startGame = (lvl = 1) => {
    livesRef.current = 5;
    scoreRef.current = 0;
    levelRef.current = lvl;
    setLives(5);
    setScore(0);
    setLevel(lvl);
    const s = initState(lvl);
    stateRef.current = s;
    phaseRef.current = "playing";
    setPhase("playing");
    GameSFX.fgStart();
  };

  const nextLevel = () => {
    const lvl = levelRef.current + 1;
    levelRef.current = lvl;
    setLevel(lvl);
    scoreRef.current += 100; // level clear bonus
    setScore(scoreRef.current);
    const s = initState(lvl);
    stateRef.current = s;
    phaseRef.current = "playing";
    setPhase("playing");
    GameSFX.sbRoundClear();
  };

  // Game loop
  useEffect(() => {
    if (phase !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    lastTimeRef.current = null;

    const loop = (ts) => {
      if (phaseRef.current !== "playing") return;
      if (!lastTimeRef.current) lastTimeRef.current = ts;
      const dt = Math.min((ts - lastTimeRef.current) / 16.67, 3);
      lastTimeRef.current = ts;

      const s = stateRef.current;
      if (!s) return;

      s.stepTimer = Math.max(0, s.stepTimer - dt);

      // Move lane entities
      s.lanes.forEach((lane, ri) => {
        if (lane.type === "killer" || lane.type === "slab") {
          lane.entities.forEach(e => {
            e.x += lane.speed * lane.dir * dt;
            // Wrap around
            if (lane.dir > 0 && e.x > GD_W + e.w) e.x = -e.w;
            if (lane.dir < 0 && e.x < -e.w) e.x = GD_W + e.w;
          });
        }
      });

      // Player position in pixels
      const playerPixelX = s.px * GD_CELL_W + GD_CELL_W / 2;
      const playerRow = s.py;
      const rowY = GD_H - (playerRow + 1) * GD_CELL; // pixel Y of this row

      // Slab riding — if on slab row, move with slab
      if (!s.dead) {
        const lane = s.lanes[playerRow];
        if (lane && lane.type === "slab") {
          // Find slab under player pixel position
          let onSlab = null;
          lane.entities.forEach(e => {
            if (playerPixelX + 4 >= e.x && playerPixelX - 4 <= e.x + e.w) {
              onSlab = e;
            }
          });
          if (onSlab) {
            // Ride: move player float position with the slab
            if (!s.playerFloatX) s.playerFloatX = playerPixelX;
            s.playerFloatX += lane.speed * lane.dir * dt;
            s.px = Math.round((s.playerFloatX - GD_CELL_W / 2) / GD_CELL_W);
            if (s.px < 0 || s.px >= GD_COLS) {
              killPlayer(s);
            }
          } else {
            killPlayer(s);
          }
        } else {
          // Reset float when not on slab
          s.playerFloatX = null;
        }

        // Killer collision check
        if (lane && lane.type === "killer" && s.stepTimer <= 0) {
          const pLeft = playerPixelX - GD_CELL_W * 0.35;
          const pRight = playerPixelX + GD_CELL_W * 0.35;
          lane.entities.forEach(e => {
            if (e.x < pRight && e.x + e.w > pLeft) {
              killPlayer(s);
            }
          });
        }
      }

      draw(ctx, s, dt);

      if (!s.won && phaseRef.current === "playing") {
        animRef.current = requestAnimationFrame(loop);
      }
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [phase]);

  const killPlayer = (s) => {
    if (s.dead) return;
    s.dead = true;
    GameSFX.fgHit();
    livesRef.current -= 1;
    setLives(livesRef.current);
    setTimeout(() => {
      if (livesRef.current <= 0) {
        phaseRef.current = "gameover";
        setPhase("gameover");
        GameSFX.fgGameOver();
        onHighScore(scoreRef.current);
      } else {
        // Respawn
        s.px = Math.floor(GD_COLS / 2);
        s.py = 0;
        s.dead = false;
        s.stepTimer = 30;
        lastTimeRef.current = null; // reset dt so no frame jump on respawn
      }
    }, 700);
  };

  const draw = (ctx, s, dt) => {
    ctx.clearRect(0, 0, GD_W, GD_H);

    // Background — dark graveyard
    ctx.fillStyle = "#0a0f0a";
    ctx.fillRect(0, 0, GD_W, GD_H);

    s.lanes.forEach((lane, ri) => {
      const y = GD_H - (ri + 1) * GD_CELL;
      const h = GD_CELL;

      // Row background
      if (lane.type === "safe") {
        ctx.fillStyle = ri === 0 ? "#0d1a0d" : "#111a11";
      } else if (lane.type === "killer") {
        ctx.fillStyle = "#1a0a0a";
      } else if (lane.type === "slab") {
        ctx.fillStyle = "#050d18";
      } else if (lane.type === "goal") {
        ctx.fillStyle = "#0d0d1a";
      }
      ctx.fillRect(0, y, GD_W, h);

      // Row divider
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      ctx.strokeRect(0, y, GD_W, h);

      // Draw lane contents
      if (lane.type === "killer") {
        lane.entities.forEach(e => {
          ctx.font = `${GD_CELL - 6}px serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(e.emoji, e.x + e.w / 2, y + h / 2);
        });
      }

      if (lane.type === "slab") {
        lane.entities.forEach(e => {
          ctx.fillStyle = "#334455";
          ctx.fillRect(e.x, y + 4, e.w, h - 8);
          ctx.strokeStyle = "#556677";
          ctx.lineWidth = 1;
          ctx.strokeRect(e.x, y + 4, e.w, h - 8);
          // Slab label
          ctx.fillStyle = "rgba(200,220,255,0.4)";
          ctx.font = `10px serif`;
          ctx.textAlign = "center";
          ctx.fillText("🪦", e.x + e.w / 2, y + h / 2);
        });
      }

      if (lane.type === "goal") {
        // 5 coffin spots evenly spaced
        const slotW = GD_W / 5;
        for (let i = 0; i < 5; i++) {
          const filled = lane.entities[i];
          ctx.fillStyle = filled ? "#220022" : "#0a0a1a";
          ctx.fillRect(i * slotW + 3, y + 3, slotW - 6, h - 6);
          ctx.strokeStyle = filled ? "#aa44aa" : "#334";
          ctx.lineWidth = 1;
          ctx.strokeRect(i * slotW + 3, y + 3, slotW - 6, h - 6);
          ctx.font = `${h - 10}px serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(filled ? "⚰️" : "▭", i * slotW + slotW / 2, y + h / 2);
        }
      }

      if (lane.type === "safe" && ri === 4) {
        // Mid safe zone — scattered tombstones
        for (let c = 0; c < GD_COLS; c += 2) {
          ctx.font = `${h - 8}px serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("🪦", c * GD_CELL_W + GD_CELL_W / 2, y + h / 2);
        }
      }
    });

    // Player
    if (!s.dead || Math.floor(Date.now() / 100) % 2 === 0) {
      const px = s.px * GD_CELL_W + GD_CELL_W / 2;
      const py2 = GD_H - (s.py + 1) * GD_CELL + GD_CELL / 2;
      ctx.font = `${GD_CELL - 4}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🧍", px, py2);
    }

    // HUD overlay — score and level
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, GD_W, 22);
    ctx.fillStyle = "#e8ddd4";
    ctx.font = "11px 'Cinzel', serif";
    ctx.textAlign = "left";
    ctx.fillText(`LVL ${s.level}`, 8, 15);
    ctx.textAlign = "right";
    ctx.fillText(`${s.score}`, GD_W - 8, 15);
  };

  const move = (dx, dy) => {
    if (phaseRef.current !== "playing") return;
    const s = stateRef.current;
    if (!s || s.dead) return;

    const newPX = Math.max(0, Math.min(GD_COLS - 1, s.px + dx));
    const newPY = Math.max(0, Math.min(GD_ROWS - 1, s.py + dy));

    // Moving up into goal row
    if (newPY === GD_ROWS - 1) {
      const lane = s.lanes[GD_ROWS - 1];
      const slotW = GD_W / 5;
      const slot = Math.floor((newPX * GD_CELL_W + GD_CELL_W / 2) / slotW);
      const clampedSlot = Math.max(0, Math.min(4, slot));
      if (lane.entities[clampedSlot]) {
        // Already filled — bounce back
        GameSFX.fgHit();
        return;
      }
      lane.entities[clampedSlot] = true;
      scoreRef.current += 50;
      setScore(scoreRef.current);
      GameSFX.fgMilestone(scoreRef.current);
      s.px = Math.floor(GD_COLS / 2);
      s.py = 0;
      s.stepTimer = 20;
      // Check if all coffins filled
      if (lane.entities.every(e => e)) {
        s.won = true;
        phaseRef.current = "win";
        setPhase("win");
        onHighScore(scoreRef.current);
      }
      return;
    }

    s.px = newPX;
    s.py = newPY;
    s.stepTimer = 8;
    scoreRef.current += dy > 0 ? 10 : 0; // score for moving forward
    if (dy > 0) setScore(scoreRef.current);
    GameSFX.fgLaneChange();
  };

  // Touch swipe
  const touchStart = useRef(null);
  const handleTouchStart = (e) => { touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const handleTouchEnd = (e) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > 20) move(dx > 0 ? 1 : -1, 0);
    } else {
      if (Math.abs(dy) > 20) move(0, dy < 0 ? 1 : -1);
    }
    touchStart.current = null;
  };

  // Keyboard
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowUp")    { e.preventDefault(); move(0, 1); }
      if (e.key === "ArrowDown")  { e.preventDefault(); move(0, -1); }
      if (e.key === "ArrowLeft")  { e.preventDefault(); move(-1, 0); }
      if (e.key === "ArrowRight") { e.preventDefault(); move(1, 0); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const btnStyle = { background:"transparent", border:"1px solid rgba(255,80,80,0.5)", borderRadius:12, color:"#ff8080", fontFamily:"'Cinzel',serif", fontSize:13, letterSpacing:3, padding:"12px 28px", cursor:"pointer" };
  const btn2Style = { ...btnStyle, border:"1px solid rgba(255,255,255,0.15)", color:"rgba(255,255,255,0.4)" };

  return (
    <div style={{position:"fixed",inset:0,background:"#080808",zIndex:100,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Cinzel',serif"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <button onClick={onExit} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.2)",borderRadius:8,color:"rgba(255,255,255,0.5)",fontSize:11,letterSpacing:2,padding:"6px 12px",cursor:"pointer"}}>← EXIT</button>
        <div style={{color:"rgba(255,80,80,0.9)",fontSize:12,letterSpacing:4}}>GRAVEYARD DASH</div>
        <div style={{color:"rgba(255,255,255,0.3)",fontSize:11,letterSpacing:2}}>BEST: {highScore}</div>
      </div>

      {phase === "intro" && (
        <div style={{textAlign:"center",padding:24}}>
          <div style={{fontSize:42,marginBottom:12}}>🧍</div>
          <div style={{fontSize:24,color:"#e8ddd4",letterSpacing:5,marginBottom:16}}>GRAVEYARD DASH</div>
          <div style={{color:"rgba(255,255,255,0.4)",fontSize:12,letterSpacing:2,lineHeight:2,marginBottom:24}}>
            CROSS THE GRAVEYARD TO FILL 5 COFFINS<br/>
            DODGE THE KILLERS OR YOU ARE DEAD<br/>
            RIDE THE TOMBSTONE SLABS ACROSS THE TOP<br/>
            SWIPE OR USE ARROW KEYS TO MOVE
          </div>
          <button onClick={() => startGame(1)} style={btnStyle}>ENTER THE GRAVEYARD</button>
          {highScore > 0 && <div style={{marginTop:16,color:"rgba(255,255,255,0.25)",fontSize:12,letterSpacing:2}}>YOUR BEST: {highScore}</div>}
        </div>
      )}

      {phase === "playing" && (
        <div style={{width:"100%",maxWidth:380,padding:"0 20px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,padding:"0 4px"}}>
            <div style={{display:"flex",gap:3}}>
              {[0,1,2,3,4].map(i => <span key={i} style={{fontSize:16,opacity:i < lives ? 1 : 0.1}}>❤️</span>)}
            </div>
            <div style={{color:"rgba(255,80,80,0.8)",fontSize:11,letterSpacing:3}}>LEVEL {level}</div>
            <div style={{color:"#e8ddd4",fontSize:15,fontFamily:"'Jolly Lodger',cursive",letterSpacing:3}}>{score}</div>
          </div>
          <canvas
            ref={canvasRef}
            width={GD_W}
            height={GD_H}
            style={{width:"100%",borderRadius:12,border:"1px solid rgba(255,80,80,0.15)",display:"block",touchAction:"none"}}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          />
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,marginTop:10}}>
            <button onClick={() => move(0,1)} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:12,color:"#fff",fontSize:22,padding:"10px 44px",cursor:"pointer",userSelect:"none"}}>▲</button>
            <div style={{display:"flex",gap:6}}>
              <button onClick={() => move(-1,0)} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:12,color:"#fff",fontSize:22,padding:"10px 24px",cursor:"pointer",userSelect:"none"}}>◀</button>
              <button onClick={() => move(0,-1)} style={{background:"rgba(255,80,80,0.12)",border:"1px solid rgba(255,80,80,0.3)",borderRadius:12,color:"#ff8080",fontSize:22,padding:"10px 24px",cursor:"pointer",userSelect:"none"}}>▼</button>
              <button onClick={() => move(1,0)} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:12,color:"#fff",fontSize:22,padding:"10px 24px",cursor:"pointer",userSelect:"none"}}>▶</button>
            </div>
          </div>
          <div style={{textAlign:"center",color:"rgba(255,255,255,0.12)",fontSize:10,letterSpacing:2,marginTop:4}}>SWIPE OR TAP ARROWS</div>
        </div>
      )}

      {phase === "win" && (
        <div style={{textAlign:"center",padding:24}}>
          <div style={{fontSize:42,marginBottom:12}}>⚰️</div>
          <div style={{fontSize:12,color:"rgba(255,80,80,0.7)",letterSpacing:4,marginBottom:4}}>ALL COFFINS FILLED</div>
          <div style={{fontSize:22,color:"#e8ddd4",letterSpacing:5,marginBottom:12}}>LEVEL {level} CLEAR</div>
          <div style={{fontSize:38,color:"#e8ddd4",fontFamily:"'Jolly Lodger',cursive",letterSpacing:4,margin:"8px 0"}}>{score}</div>
          <div style={{color:"rgba(255,255,255,0.3)",fontSize:11,letterSpacing:3,marginBottom:20}}>NEXT: LEVEL {level + 1} — FASTER KILLERS</div>
          <div style={{display:"flex",gap:12,justifyContent:"center"}}>
            <button onClick={nextLevel} style={btnStyle}>NEXT LEVEL</button>
            <button onClick={onExit} style={btn2Style}>EXIT</button>
          </div>
        </div>
      )}

      {phase === "gameover" && (
        <div style={{textAlign:"center",padding:24}}>
          <div style={{fontSize:42,marginBottom:12}}>💀</div>
          <div style={{fontSize:20,color:"#ff4444",letterSpacing:4,marginBottom:4}}>YOU DIED</div>
          <div style={{color:"rgba(255,255,255,0.3)",fontSize:12,letterSpacing:2,marginBottom:12}}>THE KILLERS GOT YOU</div>
          <div style={{fontSize:38,color:"#e8ddd4",fontFamily:"'Jolly Lodger',cursive",letterSpacing:4,margin:"8px 0"}}>{score}</div>
          {score >= highScore && score > 0
            ? <div style={{fontSize:12,color:"#ff4444",letterSpacing:3,marginBottom:20}}>🩸 NEW BEST!</div>
            : <div style={{color:"rgba(255,255,255,0.25)",fontSize:12,letterSpacing:2,marginBottom:20}}>BEST: {highScore}</div>
          }
          <div style={{display:"flex",gap:12,justifyContent:"center"}}>
            <button onClick={() => startGame(1)} style={btnStyle}>TRY AGAIN</button>
            <button onClick={onExit} style={btn2Style}>EXIT</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [scr, setScr] = useState("title");
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

  const mt = Math.max(30 - (rd - 1) * 4, 14);
  const cq = rqs[qi];
  const oq = (rd - 1) * 10 + qi + 1;
  const pct = tm / mt;
  const tC = pct > 0.5 ? "#22c55e" : pct > 0.25 ? "#eab308" : "#ef4444";

  useEffect(() => { loadB().then(b => { setBd(b); if (b.length > 0) setTopPlayer({name: b[0].name, score: b[0].score}); }); }, []);
  useEffect(() => { if (bd.length > 0) setTopPlayer({name: bd[0].name, score: bd[0].score}); }, [bd]);
  useEffect(() => { if (mu) Au.startM(1); return () => Au.stopM(); }, []);
  useEffect(() => { if (scr === "gameover") {
      if (!dailyModeRef.current) {
        saveS(nm || "Anonymous", sc, tc).then(b => { if (b.length > 0) { setBd(b); setTopPlayer({name: b[0].name, score: b[0].score}); } });
      } else {
        saveDailyS(nm || "Anonymous", sc, tc).then(async db => { setDailyBd(db); await Storage.set("sinister-daily", new Date().toISOString().slice(0,10)); setDailyDone(true); setDailyMode(false); });
      }
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
    setSc(0); setSk(0); setBs(0); setRd(1); setQi(0); setTc(0); setRqs([]); setRoundWrong(0); scRef.current = 0; tcRef.current = 0;
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
    setSc(0); setSk(0); setBs(0); setRd(1); setQi(0); setTc(0); setRoundWrong(0); scRef.current = 0; tcRef.current = 0;
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
          if (t <= 1) { clearInterval(tr.current); setSh(true); setWasRight(false); setSk(0); Au.p("no"); Hap.error(); setShk(true); setTimeout(() => setShk(false), 600); setFx("b"); setTimeout(() => setFx(null), 2000); const kfMsg = kF[Math.floor(Math.random() * kF.length)]; setKillFeed(kfMsg); setTimeout(() => setKillFeed(null), 2500); setRoundWrong(w => { const nw = w+1; if(nw>=5 && !vsMode){Au.stopM(); const saveName = nmRef.current || "Anonymous"; setTimeout(() => { if (!dailyModeRef.current) saveS(saveName, scRef.current, tcRef.current).then(b => { setBd(b); }); else saveDailyS(saveName, scRef.current, tcRef.current).then(db => setDailyBd(db)); }, 100); setTimeout(()=>setScr("gameover"),1800);} return nw; }); return 0; }
          if (t <= 6) { Au.p("hb"); }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(tr.current);
    }
  }, [scr, qi, sh, rqs]);

  const navTo = (dest) => { setPrevScr(scr); setScr(dest); };
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
    setSc(0); setSk(0); setBs(0); setRd(1); setQi(0); setTc(0); setRqs([]); setRoundWrong(0); scRef.current = 0; tcRef.current = 0;
    setScr("ri");
    await loadQs(1);
    setTimeout(() => Au.p("round"), 200);
  };
  const sr2 = () => { if (loading || rqs.length === 0) return; Au.p("continue"); if (mu) { Au.startM(rd); } setQi(0); setSl(null); setSh(false); setWasRight(false); setTm(mt); setFx(null); setRoundWrong(0); setScr("game"); };
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
        if (newW >= 5 && !vsMode) {
          Au.stopM();
          const saveName = nmRef.current || "Anonymous";
          // Use a small delay so React state has settled
          setTimeout(() => {
            if (!dailyModeRef.current) {
              saveS(saveName, scRef.current, tcRef.current).then(b => { setBd(b); });
            } else {
              saveDailyS(saveName, scRef.current, tcRef.current).then(async db => {
                setDailyBd(db);
                await Storage.set("sinister-daily", new Date().toISOString().slice(0,10)); setDailyDone(true);
                setDailyMode(false);
              });
            }
          }, 100);
          setTimeout(() => setScr("gameover"), 1800);
        }
        return newW;
      });
    }
  };
  const nx = async () => {
    Au.p("continue");
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
  if (scr === "campblood") { const exit = () => { Au.p("close"); navTo("minigames"); }; return <MiniGameErrorBoundary onExit={exit}><CampBlood onExit={exit} onHighScore={(s) => setCbScore(Math.max(cbScore, s))} highScore={cbScore} /></MiniGameErrorBoundary>; }
  if (scr === "stakevampire") { const exit = () => { Au.p("close"); navTo("minigames"); }; return <MiniGameErrorBoundary onExit={exit}><StakeTheVampire onExit={exit} onHighScore={(s) => setStakeScore(Math.max(stakeScore, s))} highScore={stakeScore} /></MiniGameErrorBoundary>; }
  if (scr === "graveyarddash") { const exit = () => { Au.p("close"); navTo("minigames"); }; return <MiniGameErrorBoundary onExit={exit}><GraveyardDash onExit={exit} onHighScore={(s) => setGdScore(Math.max(gdScore, s))} highScore={gdScore} /></MiniGameErrorBoundary>; }
  if (scr === "slashersmash") { const exit = () => { Au.p("close"); navTo("minigames"); }; return <MiniGameErrorBoundary onExit={exit}><SlasherBreakout onExit={exit} onHighScore={(s) => setSbScore(Math.max(sbScore, s))} highScore={sbScore} /></MiniGameErrorBoundary>; }
  if (scr === "minigames") return (
    <div style={{position:"fixed",inset:0,background:"#080808",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Cinzel',serif"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <button onClick={() => { Au.p("close"); navTo("title"); }} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.25)",borderRadius:8,color:"rgba(255,255,255,0.6)",fontSize:11,letterSpacing:2,padding:"6px 12px",cursor:"pointer"}}>← BACK</button>
        <div style={{color:"rgba(255,80,80,0.9)",fontSize:12,letterSpacing:4}}>MINI GAMES</div>
        <div style={{width:60}} />
      </div>
      <div style={{textAlign:"center",padding:24,width:"100%",maxWidth:360}}>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.3)",letterSpacing:4,marginBottom:28}}>CHOOSE YOUR NIGHTMARE</div>
        <div style={{display:"flex",flexDirection:"column",gap:14,width:"100%"}}>

          <button onClick={() => { Au.p("continue"); Hap.light(); navTo("campblood"); }} style={{width:"100%",padding:"20px 0",background:"transparent",border:"1px solid rgba(80,140,80,0.4)",borderRadius:14,color:"#88bb88",fontFamily:"'Cinzel',serif",fontSize:14,letterSpacing:4,textTransform:"uppercase",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:12}}>
            <span style={{fontSize:22}}>🏕️</span>
            <div style={{textAlign:"left"}}>
              <div>CAMP BLOOD</div>
              <div style={{fontSize:10,letterSpacing:2,color:"rgba(255,255,255,0.3)",marginTop:3}}>TEXT ADVENTURE — ESCAPE JASON</div>
            </div>
          </button>
          <button onClick={() => { Au.p("continue"); Hap.light(); navTo("slashersmash"); }} style={{width:"100%",padding:"20px 0",background:"transparent",border:"1px solid rgba(255,150,0,0.5)",borderRadius:14,color:"#ffaa44",fontFamily:"'Cinzel',serif",fontSize:14,letterSpacing:4,textTransform:"uppercase",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:12}}>
            <span style={{fontSize:22}}>💀</span>
            <div style={{textAlign:"left"}}>
              <div>SLASHER SMASH</div>
              <div style={{fontSize:10,letterSpacing:2,color:"rgba(255,255,255,0.3)",marginTop:3}}>SMASH FREDDY JASON MICHAEL AND MORE</div>
            </div>
          </button>
          <button onClick={() => { Au.p("continue"); Hap.light(); navTo("graveyarddash"); }} style={{width:"100%",padding:"20px 0",background:"transparent",border:"1px solid rgba(100,200,100,0.4)",borderRadius:14,color:"#88cc88",fontFamily:"'Cinzel',serif",fontSize:14,letterSpacing:4,textTransform:"uppercase",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:12}}>
            <span style={{fontSize:22}}>🪦</span>
            <div style={{textAlign:"left"}}>
              <div>GRAVEYARD DASH</div>
              <div style={{fontSize:10,letterSpacing:2,color:"rgba(255,255,255,0.3)",marginTop:3}}>CROSS THE GRAVEYARD — FILL THE COFFINS</div>
            </div>
          </button>
          <button onClick={() => { Au.p("continue"); Hap.light(); navTo("stakevampire"); }} style={{width:"100%",padding:"20px 0",background:"transparent",border:"1px solid rgba(180,30,30,0.5)",borderRadius:14,color:"#ff6060",fontFamily:"'Cinzel',serif",fontSize:14,letterSpacing:4,textTransform:"uppercase",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:12}}>
            <span style={{fontSize:22}}>🧛</span>
            <div style={{textAlign:"left"}}>
              <div>STAKE THE VAMPIRE</div>
              <div style={{fontSize:10,letterSpacing:2,color:"rgba(255,255,255,0.3)",marginTop:3}}>FLING STAKES AT SLEEPING VAMPIRES</div>
            </div>
          </button>

        </div>
      </div>
    </div>
  );

  return (
    <div style={{width:"100%",minHeight:"100vh",color:"#fff",position:"relative",overflow:screen==="home"?"hidden":"auto",fontFamily:"'Inter',sans-serif"}}>
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
          <div style={{fontFamily:"'Jolly Lodger',cursive",fontSize:38,letterSpacing:4,color:"#fff",textShadow:"0 0 40px rgba(245,30,0,0.7)",animation:"pR 1s ease-in-out infinite"}}>{RN[rd]}</div>
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
            <div style={{fontSize:13,color:"rgba(255,255,255,0.3)",letterSpacing:4,marginBottom:28}}>CHOOSE YOUR NIGHTMARE</div>
            <div style={{display:"flex",flexDirection:"column",gap:14,width:"100%"}}>
              <button onClick={() => { Au.p("continue"); Hap.light(); navTo("slashersmash"); }} style={{width:"100%",padding:"20px 0",background:"transparent",border:"1px solid rgba(255,150,0,0.5)",borderRadius:14,color:"#ffaa44",fontFamily:"'Cinzel',serif",fontSize:14,letterSpacing:4,textTransform:"uppercase",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:12}}>
                <span style={{fontSize:22}}>💀</span>
                <div style={{textAlign:"left"}}>
                  <div>SLASHER SMASH</div>
                  <div style={{fontSize:10,letterSpacing:2,color:"rgba(255,255,255,0.3)",marginTop:3}}>SMASH FREDDY JASON MICHAEL AND MORE</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
      {scr === "slashersmash" && <SlasherBreakout onExit={() => { Au.p("close"); navTo("minigames"); }} onHighScore={(s) => setSbScore(Math.max(sbScore, s))} highScore={sbScore} />}

      <div style={{width:"100%",maxWidth:420,minHeight:"100vh",display:"flex",flexDirection:"column",position:"relative",zIndex:3,padding:"0 22px 90px",margin:"0 auto"}}>

        {/* RISING EMBERS */}
      <Embers />

      {/* TITLE SCREEN */}
        {scr === "title" && (
          <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",textAlign:"center",gap:16,animation:"fi 0.9s ease-out",padding:"0 24px 160px"}}>

            {/* ── LOGO BLOCK ── */}
            <div style={{marginBottom:8,display:"flex",flexDirection:"column",alignItems:"center"}}>
              <div style={{fontFamily:"'Jolly Lodger',cursive",fontSize:96,letterSpacing:6,color:"#e8ddd4",textShadow:"0 0 30px rgba(245,30,0,0.6),0 0 60px rgba(210,20,0,0.3),4px 5px 0px rgba(0,0,0,1)",lineHeight:1,filter:"drop-shadow(0 0 20px rgba(245,30,0,0.6)) drop-shadow(0 0 50px rgba(210,20,0,0.3))"}}>Horror Trivia</div>
              <div style={{fontFamily:"'Inter',sans-serif",fontWeight:500,fontSize:11,letterSpacing:6,color:"#ff2200",textTransform:"uppercase",marginTop:6,textShadow:"0 0 10px rgba(245,30,0,0.5),4px 5px 0px rgba(0,0,0,1)"}}>Slasher Edition</div>
              <div style={{fontFamily:"'Inter',sans-serif",fontWeight:400,fontSize:9,letterSpacing:3,color:"#ffffff",textTransform:"uppercase",marginTop:4,display:"flex",alignItems:"center"}}>By Siniste<span style={{display:"inline-block",transform:"scaleX(-1)",letterSpacing:0}}>r</span></div>
            </div>

            {/* ── MIDDLE CONTENT BOX ── */}
            <div style={{width:"100%",maxWidth:320,border:"1px solid rgba(204,34,0,0.7)",borderRadius:16,padding:"24px 20px",boxShadow:"0 0 12px rgba(204,34,0,0.5), 0 0 30px rgba(204,34,0,0.2)",display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>

              {/* ── NAME INPUT ── */}
              <input
                value={nm}
                onChange={e => { const v = e.target.value; if (containsProfanity(v)) return; setNm(v); nmRef.current = v; Au.p("type"); }}
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
                <div style={{fontFamily:"'Jolly Lodger',cursive",fontSize:26,letterSpacing:6,color:"#ff2200",textTransform:"uppercase",textShadow:"0 0 10px rgba(245,30,0,0.5),4px 5px 0px rgba(0,0,0,1)"}}>🔪 {topPlayer.name}{topPlayer.badges && topPlayer.badges.length > 0 && <span style={{fontSize:16,marginLeft:4}}>{topPlayer.badges.join("")}</span>} <span style={{fontSize:18,letterSpacing:2,color:"rgba(255,255,255,0.7)"}}>— {topPlayer.score}</span></div>
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
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"40px 24px 30px",animation:"fi 0.5s",overflowY:"auto"}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:6,color:"#cc2200",textTransform:"uppercase",marginBottom:4}}>About</div>
            <div style={{fontFamily:"'Jolly Lodger',cursive",fontSize:42,color:"#e8ddd4",textShadow:"0 0 20px rgba(230,20,0,0.4)",marginBottom:4}}>Sinister</div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:13,color:"rgba(232,224,212,0.5)",letterSpacing:3,marginBottom:24}}>Horror Trivia</div>

            <div style={{width:"100%",maxWidth:340,display:"flex",flexDirection:"column",gap:16}}>

              {/* Creator */}
              <div style={{...cd,padding:"16px 20px",borderRadius:12}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:4,color:"#cc2200",textTransform:"uppercase",marginBottom:8}}>Created By</div>
                <div style={{fontFamily:"'Jolly Lodger',cursive",fontSize:28,color:"#e8ddd4"}}>Drew Krotzer</div>
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
                <div style={{fontFamily:"'Jolly Lodger',cursive",fontSize:24,color:"#e8ddd4"}}>CO.AG Music</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:12,color:"rgba(232,224,212,0.5)",marginTop:4,letterSpacing:1}}>Dark Ambient Background Music</div>
                <button onClick={() => window.open("https://www.youtube.com/@co.agmusic","_blank")} style={{marginTop:8,background:"transparent",border:"1px solid rgba(204,34,0,0.3)",borderRadius:8,color:"#cc2200",fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:2,padding:"6px 14px",cursor:"pointer"}}>▶ Visit Channel</button>
              </div>

              {/* Version */}
              <div style={{...cd,padding:"16px 20px",borderRadius:12}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:4,color:"#cc2200",textTransform:"uppercase",marginBottom:8}}>Version</div>
                <div style={{fontFamily:"'Jolly Lodger',cursive",fontSize:24,color:"#e8ddd4"}}>Version 1.0</div>
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
          <div style={{flex:1,display:"flex",flexDirection:"column",paddingTop:60,paddingBottom:30,animation:"fi 0.6s"}}>
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
            <div style={{fontFamily:"'Jolly Lodger',cursive",fontSize:72,color:"#e8ddd4",textShadow:"0 0 30px rgba(230,20,0,0.4)",lineHeight:1.1}}>
              {RN[roundSummary.round]}
            </div>
            <div style={{width:260,height:1,background:"linear-gradient(90deg,transparent,#cc2200,transparent)"}} />
            <div style={{display:"flex",gap:48,marginTop:8}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"'Jolly Lodger',cursive",fontSize:60,color:"#e8ddd4",lineHeight:1.1,display:"block"}}>{10 - roundSummary.wrong}</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:16,letterSpacing:3,color:"rgba(232,224,212,0.6)",textTransform:"uppercase",marginTop:14}}>Correct</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"'Jolly Lodger',cursive",fontSize:60,color:"#e8ddd4",lineHeight:1.1,display:"block"}}>{roundSummary.wrong}</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:16,letterSpacing:3,color:"rgba(232,224,212,0.6)",textTransform:"uppercase",marginTop:14}}>Wrong</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"'Jolly Lodger',cursive",fontSize:60,color:"#e8ddd4",lineHeight:1.1,display:"block"}}>{roundSummary.score}</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:16,letterSpacing:3,color:"rgba(232,224,212,0.6)",textTransform:"uppercase",marginTop:14}}>Score</div>
              </div>
            </div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:20,color:"rgba(232,224,212,0.6)",letterSpacing:3,marginTop:4}}>
              {roundSummary.wrong === 0 ? "☠ PERFECT ROUND ☠" : roundSummary.wrong <= 2 ? "You survived..." : "Close call..."}
            </div>
            {roundSummary.perfect && (
              <div style={{marginTop:8,padding:"16px 32px",border:"1px solid rgba(255,215,0,0.4)",borderRadius:14,background:"rgba(255,215,0,0.08)",textAlign:"center",animation:"fi 0.5s"}}>
                <div style={{fontFamily:"'Jolly Lodger',cursive",fontSize:48,color:"#e8ddd4",textShadow:"0 0 20px rgba(255,215,0,0.6)"}}>+{roundSummary.bonus}</div>
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
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:11,letterSpacing:6,color:"rgba(204,34,0,0.8)",textTransform:"uppercase",fontFamily:"'Cinzel',serif"}}>{vsMode ? "⚔️ VS Match" : dailyMode ? "Quick Match" : `Round ${rd} of 5`}</div>

                {/* Big name */}
                <div style={{fontFamily:"'Jolly Lodger',cursive",fontSize:vsMode?44:56,letterSpacing:4,color:"#e8ddd4",lineHeight:1,textShadow:"0 0 30px rgba(230,20,0,0.4),4px 5px 0px rgba(0,0,0,1)",textAlign:"center"}}>
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
            <div style={{fontFamily:"'Jolly Lodger',cursive",fontSize:72,color:"#e8ddd4",textShadow:"0 0 40px rgba(239,68,68,0.6)",lineHeight:1,animation:"pR 2s ease-in-out infinite",letterSpacing:6}}>SLASHED</div>

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
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 24px 30px",animation:"fi 1s",gap:16,textAlign:"center"}}>

            {/* VS result */}
            {vsMode && (
              <div style={{...cd,padding:"16px 20px",borderRadius:14,width:"100%",maxWidth:300,border:"1px solid rgba(204,34,0,0.7)",boxShadow:"0 0 12px rgba(204,34,0,0.5), 0 0 30px rgba(204,34,0,0.2)"}}>
                {vsOpponentDone ? (
                  <>
                    <div style={{fontFamily:"'Jolly Lodger',cursive",fontSize:30,color:"#e8ddd4"}}>
                      {sc > vsOpponentScore ? "⚔️ VICTORY" : sc < vsOpponentScore ? "💀 DEFEATED" : "🩸 DRAW"}
                    </div>
                    <div style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"rgba(232,224,212,0.5)",marginTop:6,letterSpacing:2}}>
                      You: {sc} &nbsp;|&nbsp; {vsOpponent}: {vsOpponentScore}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{fontFamily:"'Jolly Lodger',cursive",fontSize:24,color:"#e8ddd4",animation:"tP 1.5s infinite"}}>⏳ Waiting for {vsOpponent}...</div>
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
            {!vsMode && <div style={{fontFamily:"'Jolly Lodger',cursive",fontSize:34,color:"#e8ddd4",letterSpacing:2,animation:"pR 2s ease-in-out infinite",textShadow:"4px 5px 0px rgba(0,0,0,1)"}}>
              {tc>=43?"Master of Dread":tc>=33?"Horror Savant":tc>=23?"Survivor":tc>=13?"Barely Alive":"Claimed by Darkness"}
            </div>}

            {/* v48: VS session W/L/D scoreboard — resets each new VS session, ticks up per completed match */}
            {vsMode && vsOpponentDone && (
              <>
                <div style={{fontFamily:"'Inter',sans-serif",fontFamily:"'Inter',sans-serif",fontSize:11,letterSpacing:6,color:"rgba(204,34,0,0.7)",textTransform:"uppercase"}}>Session Record</div>
                <div style={{display:"flex",alignItems:"center",gap:14,fontFamily:"'Jolly Lodger',cursive",fontSize:32,letterSpacing:2,color:"#e8ddd4",textShadow:"4px 5px 0px rgba(0,0,0,1)"}}>
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
            <div style={{fontSize:13,color:"rgba(255,255,255,0.3)",letterSpacing:4,marginBottom:28}}>CHOOSE YOUR NIGHTMARE</div>
            <div style={{display:"flex",flexDirection:"column",gap:14,width:"100%"}}>
              <button onClick={() => { Au.p("continue"); Hap.light(); navTo("slashersmash"); }} style={{width:"100%",padding:"20px 0",background:"transparent",border:"1px solid rgba(255,150,0,0.5)",borderRadius:14,color:"#ffaa44",fontFamily:"'Cinzel',serif",fontSize:14,letterSpacing:4,textTransform:"uppercase",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:12}}>
                <span style={{fontSize:22}}>💀</span>
                <div style={{textAlign:"left"}}>
                  <div>SLASHER SMASH</div>
                  <div style={{fontSize:10,letterSpacing:2,color:"rgba(255,255,255,0.3)",marginTop:3}}>SMASH FREDDY JASON MICHAEL AND MORE</div>
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
