import fs from 'fs';

import { fromBase37 } from '../util/Base37.js';

let files = fs.readdirSync('dump/cache');
files.map(x => {
    let name = fromBase37(BigInt(x));
    fs.renameSync('dump/cache/' + x, 'dump/cache/' + name);
});
