import fs from 'fs';

let songs = {};
let jingles = {};
let regions = {
    /// Overworld
    
    /// X: 36
    "36.52": "tree spirits",
    "36.53": "gnome village2",
    "36.54": "gnomeball",

    /// X: 37
    "37.49": "serenade",
    "37.51": "moody",
    "37.52": "tree spirits",
    "37.53": "gnome village2",
    "37.54": "gnomeball",
    "37.55": "gnomeball",

    /// X: 38
    "38.49": "serenade",
    "38.50": "expecting",
    "38.51": "moody",
    "38.52": "neverland",
    "38.53": "gnome village",
    "38.54": "gnome king",
    "38.55": "gnome king",
    
    /// X: 39
    "39.46": "soundscape",
    "39.47": "gaol",
    "39.48": "big chords",
    "39.49": "emotion",
    "39.50": "attack1",
    "39.51": "sad meadow",
    "39.52": "march2",
    "39.53": "waterfall",
    "39.54": "voyage",
    "39.55": "legion",

    /// X: 40
    "40.46": "grumpy",
    "40.47": "in the manor",
    "40.48": "magic dance",
    "40.49": "attack4",
    "40.50": "ballad of enchantment",
    "40.51": "knightly",
    "40.52": "the tower",
    "40.53": "mellow",
    "40.54": "theme",

    /// X: 41
    "41.46": "chompy hunt",
    "41.48": "long ago",
    "41.49": "fanfare3",
    "41.50": "upcoming",
    "41.51": "baroque",
    "41.52": "wonderous",
    "41.53": "lasting",
    "41.54": "talking forest",
    "41.55": "lullaby",

    /// X: 42
    "42.49": "landlubber",
    "42.50": "jungly2",
    "42.51": "riverside",
    "42.52": "trinity",
    "42.53": "magical journey",
    "42.54": "overture",
    "42.55": "monarch waltz",

    /// X: 43
    "43.45": "spooky jungle",
    "43.46": "jungly1",
    "43.47": "jungly3",
    "43.48": "nomad",
    "43.49": "high seas",
    "43.50": "jolly-r",
    "43.51": "fishing",
    "43.52": "background2",
    "43.53": "lightwalk",
    "43.54": "camelot",
    "43.55": "camelot",
    
    /// X: 44
    "44.45": "jungle island",
    "44.46": "ambient jungle",
    "44.47": "tribal",
    "44.48": "tribal background",
    "44.49": "jungle island",
    "44.50": "the shadow",
    "44.51": "the shadow",
    "44.52": "background2",
    "44.53": "fishing",
    "44.54": "ice melody",
    "44.55": "ice melody",

    /// X: 45
    "45.45": "reggae",
    "45.46": "tribal2",
    "45.47": "reggae2",
    "45.48": "spooky jungle",
    "45.49": "sea shanty",
    "45.50": "emperor",
    "45.51": "miles away",
    "45.52": "arrival",
    "45.53": "horizon",
    "45.54": "splendour",
    "45.55": "splendour",

    /// X: 46
    "46.45": "reggae",
    "46.46": "tribal2",
    "46.47": "fanfare2",
    // "46.48": "mudskipper melody",
    "46.49": "attention",
    "46.50": "long way home",
    "46.51": "nightfall",
    "46.52": "fanfare",
    "46.53": "scape soft",
    "46.54": "gnome",
    "46.55": "wonder",
    "46.56": "lightness",
    "46.57": "troubled",
    "46.58": "wilderness4",
    "46.59": "deep wildy",
    "46.60": "sad meadow",
    "46.61": "serene",

    /// X: 47
    "47.47": "newbie melody",
    "47.48": "newbie melody",
    "47.49": "tomorrow",
    "47.50": "sea shanty2",
    "47.51": "wander",
    "47.52": "workshop",
    "47.53": "gnome theme",
    "47.54": "alone",
    "47.55": "inspiration",
    "47.56": "army of darkness",
    "47.57": "legion",
    "47.58": "gaol",
    "47.59": "wilderness3",
    "47.60": "forever",
    "47.61": "book of spells",

    /// X: 48
    "48.47": "newbie melody",
    "48.48": "newbie melody",
    "48.49": "vision",
    "48.50": "unknown land",
    "48.51": "start",
    "48.52": "spooky2",
    "48.53": "dark2",
    "48.54": "forever",
    "48.55": "dangerous",
    "48.56": "deep wildy",
    "48.57": "undercurrent",
    "48.58": "wilderness2",
    "48.59": "wilderness3",
    "48.60": "forever",
    "48.61": "mage arena",

    /// X: 49
    "49.47": "the desert",
    "49.48": "newbie melody",
    "49.49": "book of spells",
    "49.50": "dream1",
    "49.51": "flute salad",
    "49.52": "greatness",
    "49.53": "spirit",
    "49.54": "doorways",
    "49.55": "lightness", // no confirmation if this was right in 2004
    "49.56": "moody",
    "49.57": "wilderness3",
    "49.58": "close quarters",
    "49.59": "wolf mountain",
    "49.60": "scape wild1",
    "49.61": "expanse",

    /// X: 50
    "50.47": "the desert",
    "50.48": "arabian3",
    "50.49": "yesteryear",
    "50.50": "harmony",
    "50.51": "autumn voyage",
    "50.52": "expanse",
    "50.53": "garden",
    "50.54": "adventure",
    "50.55": "crystal sword",
    "50.56": "underground",
    "50.57": "scape wild1",
    "50.58": "shining",
    "50.59": "wolf mountain",
    "50.60": "scape wild1",
    "50.61": "nightfall",

    /// X: 51
    "51.46": "desert voyage",
    "51.47": "desert voyage",
    "51.48": "egypt",
    "51.49": "al kharid",
    "51.50": "arabian",
    "51.51": "arabian2",
    "51.52": "still night",
    "51.53": "medieval",
    "51.54": "parade",
    "51.55": "forbidden",
    "51.56": "underground",
    "51.57": "dark2",
    "51.58": "witching",
    "51.59": "dangerous",
    "51.60": "scape sad1",
    "51.61": "regal2",

    /// X: 52
    "52.47": "desert voyage",
    "52.48": "egypt",
    "52.49": "al kharid",
    "52.50": "duel arena",
    "52.51": "shine",
    "52.52": "venture",
    "52.53": "lullaby",
    "52.54": "parade",
    "52.55": "forbidden",
    "52.56": "underground",
    "52.57": "dark2",
    "52.58": "witching",
    "52.59": "dangerous",
    "52.60": "scape sad1",
    "52.61": "regal2",

    /// Underworld (1)

    /// X: 29
    "29.75": "trawler",

    /// X: 30
    "30.75": "trawler minor",

    /// X: 31
    "31.75": "trawler minor",

    /// X: 32
    // "32.70": "",
    // "32.71": "",
    // "32.72": "",
    // "32.73": "",
    // "32.74": "",
    // "32.75": "",

    /// X: 33
    // "33.70": "",
    "33.71": "iban",
    "33.72": "iban",
    "33.73": "iban",
    // "33.74": "",
    "33.75": "quest", // no song in may 2004

    /// X: 34
    // "34.70": "",
    // "34.71": "",
    // "34.72": "",
    // "34.73": "",
    // "34.74": "",
    "34.75": "quest", // area didn't officially come out until 2005
    // "34.76": "",

    /// X: 35
    // "35.75": "",
    // "35.76": "",

    /// X: 36
    // "36.72": "",
    // "36.73": "",
    // "36.74": "",
    // "36.75": "",
    // "36.76": "",

    /// X: 37
    // "37.72": "",
    "37.73": "voodoo cult",
    // "37.74": "",
    "37.75": "understanding",

    /// X: 38
    // "38.72": "",
    // "38.73": "",
    // "38.74": "",

    /// X: 39
    // "39.72": "",
    // "39.73": "",
    // "39.74": "",
    "39.75": "heart and mind",
    // "39.76": "",

    /// X: 40
    // "40.72": "",
    // "40.73": "",
    // "40.74": "",
    "40.75": "quest",
    // "40.76": "",

    /// X: 41
    // "41.72": "",
    "41.73": "miles away",
    // "41.74": "",
    "41.75": "quest",

    /// X: 42
    // "42.72": "",
    // "42.73": "",
    // "42.74": "",
    "42.75": "zealot",

    /// X: 43
    // "43.72": "",
    "43.73": "emotion",
    // "43.74": "",
    "43.75": "miracle dance",

    /// X: 44
    // "44.72": "",
    // "44.73": "",
    // "44.74": "",
    "44.75": "serene",

    /// X: 45
    // "45.73": "",
    // "45.74": "",
    "45.75": "rune essence",
    // "45.76": "",

    /// X: 46
    // "46.75": "",

    /// X: 47
    // "47.75": "",

    /// Underworld (2)

    /// X: 36
    // "36.146": "",
    // "36.147": "",
    // "36.148": "",
    // "36.149": "",
    // "36.150": "",
    // "36.152": "",
    "36.153": "intrepid",
    "36.154": "intrepid",

    /// X: 37
    // "37.146": "",
    "37.147": "expedition",
    // "37.148": "",
    "37.149": "upass1",
    "37.150": "upass1",
    "37.151": "cursed",
    // "37.152": "",
    // "37.153": "",
    // "37.154": "",

    /// X: 38
    // "38.146": "",
    // "38.147": "",
    // "38.148": "",
    // "38.149": "",
    "38.150": "expecting",
    "38.151": "cursed",
    // "38.152": "",
    // "38.153": "",
    // "38.154": "",
    // "38.155": "",

    /// X: 39
    "39.147": "gaol",
    // "39.148": "",
    // "39.149": "",
    "39.150": "scape sad1",
    // "39.151": "",
    // "39.152": "",
    "39.153": "waterfall",
    // "39.154": "",
    "39.155": "legion",

    /// X: 40
    "40.147": "attack6",
    "40.148": "cavern",
    "40.149": "attack4",
    "40.150": "alone",
    "40.151": "scape sad1",
    // "40.152": "",
    // "40.153": "",
    "40.154": "theme",

    /// X: 41
    "41.146": "chompy hunt",
    // "41.149": "",
    // "41.151": "",
    "41.152": "chain of command",
    "41.153": "chain of command",
    "41.154": "chain of command",

    /// X: 42
    // "42.144": "",
    // "42.145": "",
    // "42.146": "",
    "42.151": "escape",
    "42.152": "trinity",
    "42.153": "attack5",

    /// X: 43
    // "43.144": "",
    "43.145": "voodoo cult",
    "43.146": "jungly1",
    "43.153": "arabique",
    // "43.154": "",

    /// X: 44
    // "44.144": "",
    // "44.145": "",
    // "44.146": "",
    "44.148": "tribal background",
    "44.149": "attack2",
    "44.150": "attack2",
    // "44.151": "",
    "44.152": "underground",
    "44.153": "arabique",
    "44.154": "beyond",
    "44.155": "beyond",

    /// X: 45
    "45.145": "beyond",
    "45.146": "oriental",
    "45.148": "spooky jungle",
    // "45.150": "",
    "45.151": "royale",
    "45.152": "dunjun",
    "45.153": "arabique",
    "45.154": "arabique",
    // "45.155": "",

    /// X: 46
    "46.149": "starlight",
    // "46.150": "",
    "46.152": "dunjun",
    "46.153": "cave background1",
    // "46.154": "",
    // "46.161": "",

    /// X: 47
    // "47.148": "",
    "47.149": "starlight",
    // "47.150": "",
    "47.152": "cave background1",
    "47.153": "cave background1",
    // "47.155": "",
    "47.160": "attack3",
    "47.161": "cavern",

    /// X: 48
    "48.148": "scape cave",
    "48.149": "vision",
    // "48.152": "",
    "48.153": "dark2",
    "48.154": "forever",
    "48.155": "forever",
    "48.156": "forever",

    /// X: 49
    "49.148": "faerie",
    "49.149": "faerie",
    "49.153": "cellar song1",
    "49.154": "scape cave",
    // "49.155": "",
    // "49.156": "",

    /// X: 50
    "50.149": "crystal cave",
    "50.150": "harmony2",
    "50.152": "garden",
    "50.153": "garden",
    "50.154": "scape cave",

    /// X: 51
    "51.147": "lonesome",
    "51.154": "scape cave",

    /// X: 52
    "52.152": "venture2",
    "52.153": "venture2",
    // "52.154": "",
};

// let total = fs.readFileSync('songs.txt', 'ascii').split('\r\n');
// for (let i = 0; i < total.length; ++i) {
//     total[i] = total[i].toLowerCase();
// }

// let files = fs.readdirSync('C:\\Users\\Pazaz\\Desktop\\225-songs\\');
// for (let i = 0; i < Object.values(regions).length; ++i) {
//     let name = Object.values(regions)[i];
//     if (!files.filter(x => x.split('.')[1] === name)[0]) {
//         console.log(name);
//     }
// }

// goal: make a list of songs not used
// step 1: list all songs in regions
// let test = [];
// for (let i = 0; i < Object.values(regions).length; ++i) {
//     let name = Object.values(regions)[i];
//     if (test.indexOf(name) === -1) {
//         test.push(name);
//     }
// }

// step 2: compare regions to files
// let unused = [];
// for (let i = 0; i < files.length; ++i) {
//     // let file = files[i].split('.');
//     // if (file.length < 3) {
//     //     continue;
//     // }

//     // let name = file[1];
//     // if (test.indexOf(name) === -1) {
//     //     unused.push(name);
//     // }
//     // if (total.indexOf(name) === -1) {
//     //     fs.renameSync('dump/midi-named/songs/' + files[i], 'dump/midi-named/songs/unused/' + files[i]);
//     // }
//     fs.renameSync('C:\\Users\\Pazaz\\Desktop\\225-songs\\' + files[i], 'C:\\Users\\Pazaz\\Desktop\\225-songs\\' + files[i].toLowerCase());
//     // let id = file[0];
//     // songs[id] = name;
// }

// // step 3: profit!
// console.log(unused);

// files = fs.readdirSync('dump/midi-named/jingles');
// for (let i = 0; i < files.length; ++i) {
//     let file = files[i].split('.');
//     if (file.length < 3) {
//         continue;
//     }
//     let name = file[1];
//     fs.renameSync('dump/midi-named/jingles/' + files[i], 'dump/midi-named/jingles/' + name + '.mid');
//     let id = file[0];
//     jingles[id] = name;
// }

fs.writeFileSync('data/region-songs.json', JSON.stringify({
    // songs,
    // jingles,
    songs: regions
}, null, 2));
