import { FileStore } from '#formats/FileStore.js';
import { ByteBuffer } from '#util/ByteBuffer.js';
import fs from 'fs';

const INDEX_NAMES = ['archives', 'models', 'anims', 'midis', 'maps'];

for (let i = 0; i < INDEX_NAMES.length; ++i) {
    fs.mkdirSync(`dump/cache/${INDEX_NAMES[i]}`, { recursive: true });
}

const revisions = fs.readdirSync('dump/cache/source');
revisions.forEach(rev => {
    console.log(rev);
    const cache = new FileStore(`dump/cache/source/${rev}`);

    for (let index = 0; index <= 4; ++index) {
        for (let entry = 0; entry < cache.count(index); ++entry) {
            let file = cache.read(index, entry);
            if (!file) {
                continue;
            }

            if (index === 0) {
                if (!fs.existsSync(`dump/cache/archives/${entry}.${rev}`)) {
                    file.toFile(`dump/cache/archives/${entry}.${rev}`);
                }
            } else {
                // let crc = ByteBuffer.crc32(file);
                // if (!fs.existsSync(`dump/cache/${INDEX_NAMES[index]}/${crc}`)) {
                //     file.toFile(`dump/cache/${INDEX_NAMES[index]}/${crc}`);
                // }

                let version = file.back().seek(-2).readWord();
                file = file.slice(0, file.length - 2);
                let crc = ByteBuffer.crc32(file);
                if (!fs.existsSync(`dump/cache/${INDEX_NAMES[index]}/${crc}`)) {
                    file.toFile(`dump/cache/${INDEX_NAMES[index]}/${crc}`);
                    console.log(INDEX_NAMES[index], crc, version);
                }
            }
        }
    }

    cache.close();
});
