import fs from 'fs';
import { getBase37, fromBase37 } from '../src/util/Base37.js';

let files = fs.readdirSync('data/cache/225');
files.map(file => {
    fs.renameSync('data/cache/225/' + file, 'data/cache/225/' + fromBase37(BigInt(file)));
});
