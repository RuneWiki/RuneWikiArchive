import { ByteBuffer } from 'utility.js';
ByteBuffer.setGlobalEndianness(false);

import { Item } from '../src/formats/Item.js';

import fs from 'fs';

let names = [];
function getCount(name) {
    return names.filter(x => x[3] === name).length;
}

Item.instances.map(x => {
    names[x.id] = [];

    let name = x.id.toString();
    if (x.name) {
        name = x.name;
    }
    if (x.linkedId) {
        name = 'cert_' + Item.get(x.linkedId).name;
    }

    names[x.id][0] = name.replaceAll(' ', '_').replaceAll('(', '_').replaceAll(')', '').replaceAll('__', '_').replaceAll('.', '').replaceAll("'", '').replaceAll('-', '_').toLowerCase();
    names[x.id][1] = x.description;
    names[x.id][2] = x.name;
    names[x.id][3] = x.id;
});
fs.writeFileSync('dump/names.json', JSON.stringify(names, null, 2));
