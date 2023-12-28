import fs from 'fs';
import { FileStore } from '#formats/FileStore.js';

const revisions = [
    '254',
    '270',
    '274',
    '289',
    '298',
    '299',
    '306',
    '308',
    '311',
    '317',
    '318',
    '319',
    '321',
    '327',
    '330',
    '332',
    '333',
    '336',
    '337',
    '339',
    '340',
    '345',
    '346',
    '347',
    '350',
    '355',
    '357',
    '358',
    '359',
    '362',
    '363',
    '365',
    '366',
    '367',
    '368',
    '369',
    '372',
    '374',
    '376',
    '377'
];

function decodeLand(data) {
    if (!data) {
        return;
    }

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

                while (true) {
                    let opcode = data.readByte();
                    if (opcode == 0) {
                        // height derived from perlin noise
                        levelHeightmap[level][x][z] = 0;
                        break;
                    }

                    if (opcode == 1) {
                        // height specified
                        levelHeightmap[level][x][z] = data.readByte();
                        break;
                    }

                    if (opcode <= 49) {
                        levelTileOverlayIds[level][x][z] = data.readByteSigned();
                        levelTileOverlayShape[level][x][z] = Math.floor((opcode - 2) / 4);
                        levelTileOverlayRotation[level][x][z] = (opcode - 2) & 0x3;
                    } else if (opcode <= 81) {
                        levelTileFlags[level][x][z] = opcode - 49;
                    } else {
                        levelTileUnderlayIds[level][x][z] = opcode - 81;
                    }
                }
            }
        }
    }

    let text = '';
    for (let level = 0; level < 4; level++) {
        for (let x = 0; x < 64; x++) {
            for (let z = 0; z < 64; z++) {
                let height = levelHeightmap[level][x][z];
                let overlay = levelTileOverlayIds[level][x][z];
                let flags = levelTileFlags[level][x][z];
                let underlay = levelTileUnderlayIds[level][x][z];

                if (height == 0 && overlay == -1 && flags == -1 && underlay == -1) {
                    // default values
                    continue;
                }

                text += `${level} ${x} ${z}: ${levelHeightmap[level][x][z]}, ${levelTileOverlayIds[level][x][z]} ${levelTileOverlayShape[level][x][z]} ${levelTileOverlayRotation[level][x][z]}, ${levelTileFlags[level][x][z]}, ${levelTileUnderlayIds[level][x][z]}\n`;
            }
        }
    }

    return text;
}

function decodeLocs(data) {
    if (!data) {
        return;
    }

    let text = '';

    let locId = -1;
    while (true) {
        let deltaId = data.readSmart();
        if (deltaId == 0) {
            break;
        }

        locId += deltaId;

        let locData = 0;
        while (true) {
            let deltaData = data.readSmart();
            if (deltaData == 0) {
                break;
            }

            locData += deltaData - 1;

            let locX = locData >> 6 & 0x3F;
            let locZ = locData & 0x3F;
            let locPlane = locData >> 12;
            let locInfo = data.readByte();
            let locType = locInfo >> 2;
            let locOrientation = locInfo & 0x3;

            text += `${locPlane} ${locX} ${locZ}: ${locId}, ${locType}, ${locOrientation}\n`;
        }
    }

    const collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
    text = text.trimEnd().split('\n').sort(collator.compare).join('\n');
    if (text.length) {
        text += '\n';
    }

    return text;
}

function decodeCache(revision) {
    console.log(revision);

    let cache = new FileStore(`dump/packed/${revision}`);
    fs.writeFileSync(`data/src/${revision}.json`, JSON.stringify({ locs: cache.locs, maps: cache.maps }, null, 2));

    Object.keys(cache.maps).forEach(x => {
        Object.keys(cache.maps[x]).forEach(z => {
            let map = cache.maps[x][z];
            let land = cache.read(4, map.landFile, true);
            let loc = cache.read(4, map.locFile, true);

            if (land && !fs.existsSync(`data/src/maps/m${x}_${z}.${map.landFile}.${map.landVersion}.txt`)) {
                fs.writeFileSync(`data/src/maps/m${x}_${z}.${map.landFile}.${map.landVersion}.txt`, decodeLand(land));
            }

            if (loc && !fs.existsSync(`data/src/maps/l${x}_${z}.${map.locFile}.${map.locVersion}.txt`)) {
                fs.writeFileSync(`data/src/maps/l${x}_${z}.${map.locFile}.${map.locVersion}.txt`, decodeLocs(loc));
            }
        });
    });
}

fs.mkdirSync('data/src/maps', {recursive: true});
for (let i = 0; i < revisions.length; i++) {
    decodeCache(revisions[i]);
}
