import { Npc } from '../src/formats/Npc.js';
import fs, { Dir } from 'fs';
import { Directions, Position } from '../src/util/Position.js';

fs.writeFileSync('dump/npc-225.json', JSON.stringify(Npc.instances, null, 2));

let conversion = JSON.parse(fs.readFileSync('data/ref/npc-conversion.json'));
let osrsList = JSON.parse(fs.readFileSync('dump/NPCList_OSRS.json'));
let variants = {};
let nomatches = [];
let matched = [];
let osrsNpcs = [];
for (let i = 0; i < osrsList.length; ++i) {
    let def = osrsList[i];
    let pos = new Position(def.x, def.y, def.p);

    let region = pos.file_x() + '_' + pos.file_y();
    // Accounts for Zanaris being in a new area
    if ((pos.file_x() === 49 || pos.file_x() === 50) && (pos.file_y() === 148 || pos.file_y() === 149)) {
        // Remove Lumbridge cave NPCs
        continue;
    }
    if ((pos.file_x() === 37 || pos.file_x() === 38) && (pos.file_y() === 68 || pos.file_y() === 69)) {
        // Reposition Zanaris NPCs
        let x = 49 + (pos.file_x() - 37);
        let y = 148 + (pos.file_y() - 68);
        region = x + '_' + y;
        let localX = pos.x - (pos.file_x() << 6);
        let localY = pos.y - (pos.file_y() << 6);
        def.x = localX + (x << 6);
        def.y = localY + (y << 6);
    }
    // Account for Observatory Dungeon being in a new area
    if (pos.file_x() === 36 && pos.file_y() === 146) {
        let x = 37 + (pos.file_x() - 36);
        let y = 147 + (pos.file_y() - 146);
        region = x + '_' + y;
        let localX = pos.x - (pos.file_x() << 6);
        let localY = pos.y - (pos.file_y() << 6);
        def.x = localX + (x << 6);
        def.y = localY + (y << 6);
    }
    // Get rid of entries that are in newer areas
    if (!fs.existsSync('data/maps/m' + region)) {
        continue;
    }

    // Only match ones that exist in this revision
    let name = def.name;
    if (name === '<col=00ffff>Boulder</col>') {
        name = 'Boulder';
    } else if (name === 'Ducklings') {
        name = 'Duckling';
    } else if (name === 'Cow calf') {
        name = 'Cow';
    } else if (name === 'Hill Giant') {
        name = 'Giant';
    } else if (name === 'Black bear') {
        name = 'Bear';
    } else if (name === 'Grizzly bear') {
        name = 'Bear';
    } else if (name === 'Da Vinci') {
        name = 'DeVinci';
    } else if (name === 'Tracker gnome 1') {
        name = 'Gnome';
    } else if (name === 'Tracker gnome 2') {
        name = 'Gnome';
    } else if (name === 'Tracker gnome 3') {
        name = 'Gnome';
    } else if (name === "Gertrude's cat") {
        name = 'Gertrudes cat';
    } else if (name === 'Undead tree') {
        name = 'Tree';
    } else if (name === 'Rod Fishing spot') {
        name = 'Fishing spot';
    } else if (name === 'Entrana firebird') {
        name = 'Entrana Fire Bird';
    } else if (name === 'Iban') {
        name = 'Lord Iban';
    } else if (name === 'Disciple of Iban') {
        name = 'Iban disciple';
    } else if (name === 'Zombie rat') {
        name = 'Giant rat';
    } else if (name === 'Lava dragon') {
        name = 'Red dragon';
    } else if (name === 'Escaping slave') {
        name = 'Escaping slave.';
    } else if (name === 'Al Shabim') {
        name = 'Al Shabim.';
    } else if (name === 'Charlie the Tramp') {
        name = 'Tramp';
    } else if (name === 'Swan') {
        name = 'Duck';
    } else if (name === 'Red Sheep') {
        name = 'Diseased sheep'
    } else if (name === 'Green Sheep') {
        name = 'Diseased sheep'
    } else if (name === 'Blue Sheep') {
        name = 'Diseased sheep'
    } else if (name === 'Yellow Sheep') {
        name = 'Diseased sheep'
    }
    if (!name || !name.length) {
        name = def.id.toString();
    }
    let match = Npc.filter(name);
    if (!match.length || def.id === 10638 || def.id === 10639) {
        if (nomatches.indexOf(name + '.' + region) === -1) {
            nomatches.push(name + '.' + region);
        }
        continue;
    }

    // save list of OSRS NPCs
    if (osrsNpcs.findIndex(x => x.id === def.id) === -1) {
        osrsNpcs.push({
            id: def.id,
            name: def.name,
            level: def.combatLevel,
            actions: def.actions
        });
    }

    def.name = name;

    // Save variants to help convert IDs between 225 <-> OSRS
    if (!variants[name]) {
        variants[name] = [];
    }
    if (variants[name].findIndex(x => x.id === def.id) === -1) {
        variants[name].push({ id: def.id, name });
        variants[name].sort((a, b) => a.id - b.id);
    }

    // Save match
    matched.push(def);
}

osrsNpcs.sort((a, b) => a.id - b.id);
fs.writeFileSync('dump/npc-osrs.json', JSON.stringify(osrsNpcs, null, 2));
fs.writeFileSync('dump/variants.json', JSON.stringify(variants, null, 2));
// fs.writeFileSync('dump/variants.json', JSON.stringify(Object.values(variants).filter(x => x.length > 1), null, 2));

// Now convert ID
for (let i = 0; i < matched.length; ++i) {
    let def = matched[i];
    let variant = variants[def.name].findIndex(x => x.id === def.id);
    let match = [];
    let converted = conversion.findIndex(x => x.osrs === def.id);
    if (converted === -1) {
        match = Npc.filter(def.name);
    } else {
        match = [ Npc.get(conversion[converted].rs2) ];
    }
    if (variant >= match.length) {
        variant = match.length - 1;
    }
    match = match[0]; // match[variant];
    matched[i] = {
        // name: match.name,
        // osrs: def.id,
        id: match.id,
        x: def.x,
        y: def.y,
        p: def.p,
        wander: 5,
        dir: -1,
        // regionX: def.x >> 6,
        // regionY: def.y >> 6
    }
}

let otherList = JSON.parse(fs.readFileSync('dump/spawns-runetopic.json'));
matched = matched.map(x => {
    let match = otherList.findIndex(y => x.x === y.x && x.y === y.y && x.p === y.z && y.direction > 0);
    if (match === -1) {
        return x;
    }

    switch (Math.floor(otherList[match].direction / 256)) {
    case 1:
        x.dir = Directions.SOUTH_WEST;
        break;
    case 2:
        x.dir = Directions.WEST;
        break;
    case 3:
        x.dir = Directions.NORTH_WEST;
        break;
    case 4:
        x.dir = Directions.NORTH;
        break;
    case 5:
        x.dir = Directions.NORTH_EAST;
        break;
    case 6:
        x.dir = Directions.EAST;
        break;
    case 7:
        x.dir = Directions.SOUTH_EAST;
        break;
    }
    return x;
});

fs.writeFileSync('data/npc-spawns.json', JSON.stringify(matched, null, 2));
fs.writeFileSync('dump/nomatch.json', JSON.stringify(nomatches, null, 2));
