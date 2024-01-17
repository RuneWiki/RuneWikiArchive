import fs from 'fs';
import child_process from 'child_process';

import { ByteBuffer } from '#util/ByteBuffer.js';

async function jagexGzipAll(paths) {
    for (let i = 0; i < paths.length; i += 50) {
        child_process.execSync(`java -jar JagCompress.jar ${paths.slice(i, i + 50).join(' ')}`);
    }
}

function encode(text) {
    let locs = {};

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

const text = Buffer.from(fs.readFileSync(`data/src/maps/l49_47.251.1.txt`)).toString().split('\n');

fs.mkdirSync('dump/test', { recursive: true });
const targetCrc = -424064450;
const attempts = [];
for (let x = 0; x < 64; x++) {
    for (let z = 0; z < 64; z++) {
        // clone text
        let newText = text.slice();
        newText.push(`0 ${x} ${z}: 2739, 22, 0`);
        const data = encode(newText);
        data.toFile(`dump/test/${x}.${z}`);
        attempts.push(`dump/test/${x}.${z}`);
    }
}

await jagexGzipAll(attempts);

for (let x = 0; x < 64; x++) {
    for (let z = 0; z < 64; z++) {
        const file = ByteBuffer.fromFile(`dump/test/${x}.${z}.gz`);
        if (ByteBuffer.crc32(file) == targetCrc) {
            console.log(x, z);
        }
    }
}
