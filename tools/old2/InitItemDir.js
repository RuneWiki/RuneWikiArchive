import {} from 'dotenv/config';

import { Item } from '../src/formats/Item.js';

import fs from 'fs';

Item.instances.map(x => {
    fs.writeFileSync('data/src/objs/' + x.id + '.json', JSON.stringify(x, null, 2));
});
