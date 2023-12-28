import { FileStore } from '#formats/FileStore.js';
import { FloorDef } from '#formats/FloorDef.js';
import { Image } from '#formats/Image.js';
import { LocDef } from '#formats/LocDef.js';
import { MapSquare } from '#formats/MapSquare.js';

import Jimp from 'jimp';

if (process.argv.length < 2) {
    process.exit(1);
}

const path = process.argv[2];

const cache = new FileStore(path);

const textureJag = cache.read(0, 6, true);
const textures = [];
for (let i = 0; i < 50; i++) {
    textures[i] = new Image(textureJag, i.toString());
}

const mediaJag = cache.read(0, 4, true);
const mapscene = [];
for (let i = 0; i < 100; i++) {
    mapscene[i] = new Image(mediaJag, 'mapscene', i.toString());
}

const mapfunction = [];
for (let i = 0; i < 100; i++) {
    mapfunction[i] = new Image(mediaJag, 'mapfunction', i.toString());
}

const configJag = cache.read(0, 2, true);
const Floor = FloorDef.unpack(configJag.read('flo.dat'), textures);
const Loc = LocDef.unpack(configJag.read('loc.dat'), mapscene, mapfunction);

let minX = 999, minY = 999;
let maxX = 0, maxY = 0;
Object.keys(cache.maps).forEach(x => {
    Object.keys(cache.maps[x]).forEach(y => {
        minX = Math.min(minX, parseInt(x));
        minY = Math.min(minY, parseInt(y));
        maxX = Math.max(maxX, parseInt(x));
        maxY = Math.max(maxY, parseInt(y));
    });
});

// specifically exclude some areas
minY = 44;

// add some padding
minX -= 1;
minY -= 1;
maxX += 2;
maxY += 2;

// offset max by min so wasted space is removed
maxX -= minX;
maxY -= minY;
minX *= 64;
minY *= 64;
maxX *= 64;
maxY *= 64;

const zoom = 4;
minX *= zoom;
minY *= zoom;
maxX *= zoom;
maxY *= zoom;

const worldmap = new Jimp(maxX, maxY, 0x666666FF);

// the origin of the worldmap is bottom-left so we need to flip the y-axis
Object.keys(cache.maps).forEach(x => {
    Object.keys(cache.maps[x]).forEach(y => {
        const land = cache.read(4, cache.maps[x][y].landFile, true);
        const loc = cache.read(4, cache.maps[x][y].locFile, true);
        const map = new MapSquare(land, loc, parseInt(x), parseInt(y));

        const scale = 64 * zoom;
        const minimap = map.createMinimap(Floor, Loc, zoom);
        const flippedY = maxY - (parseInt(y) * scale) - scale;

        const mapX = parseInt(x) * scale - minX;
        const mapY = flippedY + minY;
        worldmap.blit(minimap, mapX, mapY);
    });
});

worldmap.write('dump/worldmap.png');
