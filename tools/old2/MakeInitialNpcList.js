import { ByteBuffer } from 'utility.js';
ByteBuffer.setGlobalEndianness(false);

import { Npc } from '../src/formats/Npc.js';

import fs from 'fs';

let names = [];
Npc.instances.map(x => {
    names[x.id] = [];

    let name = x.id.toString();
    if (x.name) {
        name = x.name;
    }

    names[x.id][0] = name.replaceAll(' ', '_').replaceAll('(', '_').replaceAll(')', '').replaceAll('__', '_').replaceAll('.', '').replaceAll("'", '').replaceAll('-', '_').toLowerCase();
    names[x.id][1] = x.description;
    names[x.id][2] = x.name;
    names[x.id][3] = x.id;
});
fs.writeFileSync('dump/names.json', JSON.stringify(names, null, 2));
