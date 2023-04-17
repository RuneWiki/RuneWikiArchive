import { FileStore } from '../src/util/FileStore.js';
import fs from 'fs';
import bz2 from 'bz2';
const BZIP2_HEADER = new Uint8Array([0x42, 0x5A, 0x68, 0x31]);
import { ByteBuffer } from 'utility.js';
import { FileArchive } from '../src/util/FileArchive.js';
ByteBuffer.setGlobalEndianness(false);

let beta = fs.readdirSync('data/maps/beta/');
let test = fs.readdirSync('data/maps/test/');

let map_counter = 0;
let regions = [];
beta.map(file => {
    let type = file.slice(0, 1);
    let region = file.split('_');
    let x = parseInt(region[0].slice(1));
    let y = parseInt(region[1]);

    if (!regions[x]) {
        regions[x] = [];
    }
    if (!regions[x][y]) {
        regions[x][y] = {};
    }

    if (type === 'l') {
        regions[x][y].loc = map_counter;
        map_counter += 2;
        regions[x][y].locFile = `data/maps/beta/${file}`;
    } else if (type === 'm') {
        regions[x][y].land = regions[x][y].loc + 1;
        regions[x][y].landFile = `data/maps/beta/${file}`;
    }
});
test.map(file => {
    let type = file.slice(0, 1);
    let region = file.split('_');
    let x = parseInt(region[0].slice(1));
    let y = parseInt(region[1]);

    if (!regions[x]) {
        regions[x] = [];
    }
    if (!regions[x][y]) {
        regions[x][y] = {};
    }

    if (type === 'l') {
        regions[x][y].loc = map_counter;
        map_counter += 2;
        regions[x][y].locFile = `data/maps/test/${file}`;
    } else if (type === 'm') {
        regions[x][y].land = regions[x][y].loc + 1;
        regions[x][y].landFile = `data/maps/test/${file}`;
    }
});

let mapIndex = new ByteBuffer();
regions.map((x, regionX) => {
    x.map((y, regionY) => {
        mapIndex.writeByte(regionX);
        mapIndex.writeByte(regionY);
        mapIndex.writeWord(y.land);
        mapIndex.writeWord(y.loc);
        mapIndex.writeByte(0);
    });
});

let versionlist = new FileArchive();
versionlist.add('map_index', mapIndex.raw);

let store = new FileStore('data/cache/test', true, true);
store.write(0, 1, fs.readFileSync('data/cache/194/archives/title'), 0);
store.write(0, 2, fs.readFileSync('data/cache/194/archives/config'), 0);
store.write(0, 3, fs.readFileSync('data/cache/194/archives/interface'), 0);
store.write(0, 4, fs.readFileSync('data/cache/194/archives/media'), 0);
store.write(0, 5, versionlist.write(), 0);
store.write(0, 6, fs.readFileSync('data/cache/194/archives/textures'), 0);
store.write(0, 7, fs.readFileSync('data/cache/194/archives/wordenc'), 0);

regions.map((x, regionX) => {
    x.map((y, regionY) => {
        store.write(4, y.loc, bz2.decompress(ByteBuffer.fromFile(y.locFile).write(BZIP2_HEADER).raw));
        store.write(4, y.land, bz2.decompress(ByteBuffer.fromFile(y.landFile).write(BZIP2_HEADER).raw));
    });
});

console.log(store.read(4, 1));
