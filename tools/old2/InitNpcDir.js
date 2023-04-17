import { Npcs } from '../src/formats/Npc.js';

import fs from 'fs';

const Npc = Npcs.loadRaw();
Npc.instances.map(x => {
    fs.writeFileSync('data/src/npcs/' + x.id + '.json', JSON.stringify(x, null, 2));
});
