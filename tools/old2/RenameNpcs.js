import {} from 'dotenv/config';
import fs from 'fs';

let npcs = [];

let files = fs.readdirSync(`${process.env.ASSET_DIR}/npcs/`);

// load and name npcs
for (let i = 0; i < files.length; ++i) {
    let file = JSON.parse(fs.readFileSync(`${process.env.ASSET_DIR}/npcs/` + files[i]));
    npcs[file.id] = file;

    if (file.name) {
        npcs[file.id].internal_name = file.name.trim().replaceAll(' ', '_').replaceAll('/', '_').replaceAll('(', '_').replaceAll(')', '').replaceAll("'", '').replaceAll('.', '').replaceAll('-', '_').replaceAll('__', '_').toLowerCase();
        npcs[file.id].counter = 1;
    }
}

// count duplicates
for (let i = 0; i < npcs.length; ++i) {
    if (npcs[i].name) {
        let others = npcs.filter(x => x.name === npcs[i].name && x.id > i);
        if (others.length > 0) {
            others.map(other => {
                other.counter++;
            });
            npcs[i].has_more = true;
        }
    }
}

// rename duplicates
for (let i = 0; i < npcs.length; ++i) {
    if (npcs[i].counter > 1 || npcs[i].has_more) {
        npcs[i].internal_name += '_' + npcs[i].counter;
    }
    delete npcs[i].counter;
    delete npcs[i].has_more;
}

// rename files!
npcs.map(npc => {
    if (!npc.internal_name) {
        return;
    }

    if (!fs.existsSync(`${process.env.ASSET_DIR}/npcs/` + npc.internal_name + '.json')) {
        fs.renameSync(`${process.env.ASSET_DIR}/npcs/` + npc.id + '.json', `${process.env.ASSET_DIR}/npcs/` + npc.internal_name + '.json');
    } else {
        console.log(npc.internal_name, npc.id);
    }
});
