import fs from 'fs';
import { FileStore } from '#formats/FileStore.js';

if (process.argv.length < 2) {
    process.exit(1);
}

const path = process.argv[2];

const cache = new FileStore(path);

fs.rmSync('dump/maps', { recursive: true, force: true });
fs.mkdirSync('dump/maps', { recursive: true });

Object.keys(cache.maps).forEach(x => {
    Object.keys(cache.maps[x]).forEach(z => {
        let map = cache.maps[x][z];
        let land = cache.read(4, map.landFile, true);
        let loc = cache.read(4, map.locFile, true);

        if (land) {
            fs.writeFileSync(`dump/maps/m${x}_${z}.${map.landVersion}`, land.raw);
        }

        if (loc) {
            fs.writeFileSync(`dump/maps/l${x}_${z}.${map.locVersion}`, loc.raw);
        }
    });
});
