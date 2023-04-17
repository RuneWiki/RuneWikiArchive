import fs from 'fs';
import { FileStore } from '#formats/FileStore.js';

if (process.argv.length < 2) {
    process.exit(1);
}

const path = process.argv[2];

const cache = new FileStore(path);
cache.close();

delete cache.index_offset;
delete cache.currentSector;
delete cache.archives;

fs.writeFileSync('dump/cache.json', JSON.stringify(cache, null, 2));
