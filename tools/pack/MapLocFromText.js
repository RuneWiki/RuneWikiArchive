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
    fs.readdirSync('data/src/maps').filter(f => f.startsWith('l')).forEach(file => {
        let map = file.replace('.txt', '');

        if (!fs.existsSync(`data/cache/raw/maps/${map}`)) { // || !fs.existsSync(`data/cache/maps/${map}`)) {
            console.log(`Creating ${map}...`);
            let data = encode(map);
            fs.writeFileSync(`data/cache/raw/maps/${map}`, data.raw);
            // fs.writeFileSync(`data/cache/maps/${map}.gz`, jagexGzip(`data/cache/raw/maps/${map}`).raw);
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
                // fs.writeFileSync(`data/cache/maps/${map}.gz`, jagexGzip(`data/cache/raw/maps/${map}`).raw);
                // fs.writeFileSync(`data/cache/maps/${map}`, compressBz2(data.raw));
            }
        }
    });
}

function encode(map) {
    let locs = {};

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
        let locId = parseInt(values[0]);
        let locType = parseInt(values[1]);
        let locOrientation = parseInt(values[2]);

        if (!locs[locId]) {
            locs[locId] = [];
        }

        locs[locId].push({
            level,
            x,
            z,
            type: locType,
            orientation: locOrientation
        });
    }

    let locIds = Object.keys(locs).map(id => parseInt(id)).sort((a, b) => a - b);

    let data = new ByteBuffer();

    let lastLocId = -1;
    for (let i = 0; i < locIds.length; i++) {
        let locId = locIds[i];
        let locData = locs[locId];

        data.writeSmart(locId - lastLocId);
        lastLocId = locId;

        let lastLocData = 0;
        for (let j = 0; j < locData.length; j++) {
            let loc = locData[j];

            let currentLocData = (loc.level << 12) | (loc.x << 6) | loc.z;
            data.writeSmart(currentLocData - lastLocData + 1);
            lastLocData = currentLocData;

            let locInfo = (loc.type << 2) | loc.orientation;
            data.writeByte(locInfo);
        }

        data.writeSmart(0); // end of this loc
    }

    data.writeSmart(0); // end of map
    return data;
}
