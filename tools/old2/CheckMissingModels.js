import { FileStore } from '../src/util/FileStore.js';

let cache = new FileStore('data/cache/289');

import fs from 'fs';
let names = JSON.parse(fs.readFileSync('data/model-names.json'));

let count = cache.count(1);
let missing = 0;
for (let i = 0; i < count; ++i) {
    if (!cache.read(1, i)) {
        console.log(names[i], i);
        missing++;
        continue;
    }
}
