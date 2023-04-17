import {} from 'dotenv/config';

import { Object } from '../src/formats/Object.js';

import fs from 'fs';

Object.instances.map(x => {
    fs.writeFileSync('data/src/locs/' + x.id + '.json', JSON.stringify(x, null, 2));
});
