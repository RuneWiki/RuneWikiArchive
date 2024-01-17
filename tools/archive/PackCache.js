import fs from 'fs';
import { FileStore } from '#formats/FileStore.js';
import { verifyCache } from './VerifyCache.js';
import { ByteBuffer } from '#util/ByteBuffer.js';

const revisions = [
    '245',
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

revisions.forEach(rev => {
    console.log(`Packing ${rev}...`);
    fs.mkdirSync(`dump/packed/${rev}`, { recursive: true });
    const cache = new FileStore(`dump/packed/${rev}`, true);

    // fill archives
    for (let i = 1; i <= 8; ++i) {
        if (fs.existsSync(`dump/cache/archives/${i}.${rev}`)) {
            const file = fs.readFileSync(`dump/cache/archives/${i}.${rev}`);
            cache.write(0, i, file, false);
        }
    }
    cache.parse();

    // fill models
    for (let i = 0; i < cache.models.length; ++i) {
        const model = cache.models[i];
        if (model.crc == 0 || model.version == -1) {
            continue;
        }
        if (!fs.existsSync(`dump/cache/models/${model.crc}`)) {
            continue;
        }

        let file = ByteBuffer.fromFile(`dump/cache/models/${model.crc}`);
        if (ByteBuffer.crc32(file) != model.crc) {
            // CRC doesn't match for some reason, maybe the file has a version trailer accidentally appended
            file = file.slice(0, file.length - 2);
            if (ByteBuffer.crc32(file) != model.crc) {
                console.log('Bad model file', i, model.crc);
                continue;
            }

            console.log('Correcting model crc', i);
            file.toFile(`dump/cache/models/${model.crc}`);
        }

        // append version trailer
        file.back().writeWord(model.version + 1);

        // flush to cache
        cache.write(1, i, file, false);
    }

    // fill anims
    for (let i = 0; i < cache.anims.length; ++i) {
        const anim = cache.anims[i];
        if (anim.crc == 0 || anim.version == -1) {
            continue;
        }
        if (!fs.existsSync(`dump/cache/anims/${anim.crc}`)) {
            continue;
        }

        let file = ByteBuffer.fromFile(`dump/cache/anims/${anim.crc}`);
        if (ByteBuffer.crc32(file) != anim.crc) {
            // CRC doesn't match for some reason, maybe the file has a version trailer accidentally appended
            file = file.slice(0, file.length - 2);
            if (ByteBuffer.crc32(file) != anim.crc) {
                console.log('Bad anim file', i, anim.crc);
                continue;
            }

            console.log('Correcting anim crc', i);
            file.toFile(`dump/cache/anims/${anim.crc}`);
        }

        // append version trailer
        file.back().writeWord(anim.version + 1);

        // flush to cache
        cache.write(2, i, file, false);
    }

    // fill midis
    for (let i = 0; i < cache.midis.length; ++i) {
        const midi = cache.midis[i];
        if (midi.crc == 0 || midi.version == -1) {
            continue;
        }
        if (!fs.existsSync(`dump/cache/midis/${midi.crc}`)) {
            continue;
        }

        let file = ByteBuffer.fromFile(`dump/cache/midis/${midi.crc}`);
        if (ByteBuffer.crc32(file) != midi.crc) {
            // CRC doesn't match for some reason, maybe the file has a version trailer accidentally appended
            file = file.slice(0, file.length - 2);
            if (ByteBuffer.crc32(file) != midi.crc) {
                console.log('Bad midi file', i, midi.crc);
                continue;
            }

            console.log('Correcting midi crc', i);
            file.toFile(`dump/cache/midis/${midi.crc}`);
        }

        // append version trailer
        file.back().writeWord(midi.version + 1);

        // flush to cache
        cache.write(3, i, file, false);
    }

    // fill maps
    for (let i = 0; i < cache.rawMaps.length; ++i) {
        const map = cache.rawMaps[i];
        if (map.crc == 0 || map.version == -1) {
            // console.log(map);
            continue;
        }
        if (!fs.existsSync(`dump/cache/maps/${map.crc}`)) {
            continue;
        }

        let file = ByteBuffer.fromFile(`dump/cache/maps/${map.crc}`);
        if (ByteBuffer.crc32(file) != map.crc) {
            // CRC doesn't match for some reason, maybe the file has a version trailer accidentally appended
            file = file.slice(0, file.length - 2);
            if (ByteBuffer.crc32(file) != map.crc) {
                console.log('Bad map file', i, map.crc);
                continue;
            }

            console.log('Correcting map crc', i);
            file.toFile(`dump/cache/maps/${map.crc}`);
        }

        // append version trailer
        file.back().writeWord(map.version + 1);

        // flush to cache
        cache.write(4, i, file, false);
    }

    console.log(`Verifying ${rev}:`);
    verifyCache(cache);
    cache.close();
    console.log();
});
