import { ByteBuffer } from '#util/ByteBuffer.js';
import fs from 'fs';

fs.mkdirSync('data/cache/raw/maps', { recursive: true });
// fs.mkdirSync('data/cache/maps', { recursive: true });

if (process.argv[2]) {
    let map = process.argv[2];
    console.log(`Creating ${map}...`);
    let data = encode(map);
    fs.writeFileSync(`dump/cache/raw/${map}`, data.raw);
} else {
    fs.readdirSync('data/src/maps').filter(f => f.startsWith('m')).forEach(file => {
        let map = file.replace('.txt', '');

        if (!fs.existsSync(`data/cache/raw/maps/${map}`)) { // || !fs.existsSync(`data/cache/maps/${map}`)) {
            console.log(`Creating ${map}...`);
            let data = encode(map);
            fs.writeFileSync(`data/cache/raw/maps/${map}`, data.raw);
            // fs.writeFileSync(`data/cache/maps/${map}`, compressBz2(data.raw));
            return;
        }

        let stat = fs.statSync(`data/src/maps/${file}`);
        let rawStat = fs.statSync(`data/cache/raw/maps/${map}`);

        if (stat.mtimeMs > rawStat.mtimeMs) {
            let data = encode(map);
            let raw = fs.readFileSync(`data/cache/raw/maps/${map}`);

            if (ByteBuffer.crc32(data) !== ByteBuffer.crc32(raw)) {
                console.log(`Updating ${map}...`);
                fs.writeFileSync(`data/cache/raw/maps/${map}`, data.raw);
                // fs.writeFileSync(`data/cache/maps/${map}`, compressBz2(data.raw));
            }
        }
    });
}

function encode(map) {
    let levelHeightmap = [];
    let levelTileOverlayIds = [];
    let levelTileOverlayShape = [];
    let levelTileOverlayRotation = [];
    let levelTileFlags = [];
    let levelTileUnderlayIds = [];

    for (let level = 0; level < 4; level++) {
        if (!levelTileFlags[level]) {
            levelHeightmap[level] = [];
            levelTileOverlayIds[level] = [];
            levelTileOverlayShape[level] = [];
            levelTileOverlayRotation[level] = [];
            levelTileFlags[level] = [];
            levelTileUnderlayIds[level] = [];
        }

        for (let x = 0; x < 64; x++) {
            if (!levelTileFlags[level][x]) {
                levelHeightmap[level][x] = [];
                levelTileOverlayIds[level][x] = [];
                levelTileOverlayShape[level][x] = [];
                levelTileOverlayRotation[level][x] = [];
                levelTileFlags[level][x] = [];
                levelTileUnderlayIds[level][x] = [];
            }

            for (let z = 0; z < 64; z++) {
                levelHeightmap[level][x][z] = 0;
                levelTileOverlayIds[level][x][z] = -1;
                levelTileOverlayShape[level][x][z] = -1;
                levelTileOverlayRotation[level][x][z] = -1;
                levelTileFlags[level][x][z] = -1;
                levelTileUnderlayIds[level][x][z] = -1;
            }
        }
    }

    const text = Buffer.from(fs.readFileSync(`data/src/maps/${map}.txt`)).toString().split('\n');
    for (let i = 0; i < text.length; i++) {
        const line = text[i];
        if (line.length == 0 || line.startsWith(';') || line.startsWith('#') || line.startsWith('//')) {
            continue;
        }

        const parts = line.split(':');
        const coords = parts[0].split(' ');
        const level = parseInt(coords[0]);
        const x = parseInt(coords[1]);
        const z = parseInt(coords[2]);

        const values = parts[1].split(',').map(v => v.trim());
        levelHeightmap[level][x][z] = parseInt(values[0]);
        const overlay = values[1].split(' ');
        levelTileOverlayIds[level][x][z] = parseInt(overlay[0]);
        levelTileOverlayShape[level][x][z] = parseInt(overlay[1]);
        levelTileOverlayRotation[level][x][z] = parseInt(overlay[2]);
        levelTileFlags[level][x][z] = parseInt(values[2]);
        levelTileUnderlayIds[level][x][z] = parseInt(values[3]);
    }

    // iterate through the map and calculate the size of the data
    let size = 64 * 64 * 4;
    for (let level = 0; level < 4; level++) {
        for (let x = 0; x < 64; x++) {
            for (let z = 0; z < 64; z++) {
                let height = levelHeightmap[level][x][z];
                let overlay = levelTileOverlayIds[level][x][z];

                if (overlay != -1) {
                    size += 1;
                }

                if (height != 0) {
                    size += 1;
                }
            }
        }
    }

    let data = ByteBuffer.alloc(size);
    for (let level = 0; level < 4; level++) {
        for (let x = 0; x < 64; x++) {
            for (let z = 0; z < 64; z++) {
                let height = levelHeightmap[level][x][z];
                let overlay = levelTileOverlayIds[level][x][z];
                let shape = levelTileOverlayShape[level][x][z];
                let rotation = levelTileOverlayRotation[level][x][z];
                let flags = levelTileFlags[level][x][z];
                let underlay = levelTileUnderlayIds[level][x][z];

                if (height == 0 && overlay == -1 && flags == -1 && underlay == -1) {
                    // default values
                    data.writeByte(0);
                    continue;
                }

                if (overlay != -1) {
                    let opcode = 2;
                    opcode += shape << 2;
                    opcode += rotation;
                    data.writeByte(opcode);
                    data.writeByte(overlay);
                }

                if (flags != -1) {
                    data.writeByte(flags + 49);
                }

                if (underlay != -1) {
                    data.writeByte(underlay + 81);
                }

                if (height != 0) {
                    // specific height
                    data.writeByte(1);
                    data.writeByte(height);
                } else {
                    // perlin noise
                    data.writeByte(0);
                }
            }
        }
    }

    return data;
}
