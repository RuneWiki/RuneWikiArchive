import {} from 'dotenv/config';

import { ByteBuffer } from 'utility.js';
ByteBuffer.setGlobalEndianness(false);
ByteBuffer.setGlobalTerminator('\n');

import fs from 'fs';

function serializeItems(instances) {
    console.log('Serializing NPC definitions');

    let idx = new ByteBuffer();
    let dat = new ByteBuffer();

    let count = instances.length;

    idx.writeWord(count);
    dat.writeWord(count);

    instances.map(x => {
        let start = dat.offset;

        if (typeof x.modelIndices !== 'undefined') {
            dat.writeByte(1); // opcode
            dat.writeByte(x.modelIndices.length);
            for (let n = 0; n < x.modelIndices.length; ++n) {
                dat.writeWord(x.modelIndices[n]);
            }
        }

        if (typeof x.name !== 'undefined') {
            dat.writeByte(2); // opcode
            dat.writeStringTerminated(x.name);
        }

        if (typeof x.description !== 'undefined') {
            dat.writeByte(3); // opcode
            dat.writeStringTerminated(x.description);
        }

        if (typeof x.size !== 'undefined') {
            dat.writeByte(12);
            dat.writeByte(x.size);
        }

        if (typeof x.standSeq !== 'undefined') {
            dat.writeByte(13);
            dat.writeWord(x.standSeq);
        }

        if (typeof x.walkSeq !== 'undefined') {
            dat.writeByte(14);
            dat.writeWord(x.walkSeq);
        }

        if (x.disposeAlpha === true) {
            dat.writeByte(16);
        }

        if (typeof x.turnAroundSeq !== 'undefined') {
            dat.writeByte(17);
            dat.writeWord(x.walkSeq);
            dat.writeWord(x.turnAroundSeq);
            dat.writeWord(x.turnRightSeq);
            dat.writeWord(x.turnLeftSeq);
        }

        if (typeof x.options !== 'undefined') {
            for (let i = 0; i < x.options.length; ++i) {
                if (!x.options[i]) {
                    continue;
                }

                dat.writeByte(30 + i);
                dat.writeStringTerminated(x.options[i]);
            }
        }

        if (typeof x.newColors !== 'undefined') {
            dat.writeByte(40);
            dat.writeByte(x.newColors.length);
            for (let i = 0; i < x.newColors.length; ++i) {
                dat.writeWord(x.oldColors[i]);
                dat.writeWord(x.newColors[i]);
            }
        }

        if (typeof x.headModelIndices !== 'undefined') {
            dat.writeByte(60);
            dat.writeByte(x.headModelIndices.length);
            for (let i = 0; i < x.headModelIndices.length; ++i) {
                dat.writeWord(x.headModelIndices[i]);
            }
        }

        if (x.showOnMinimap === false) {
            dat.writeByte(93);
        }

        if (typeof x.level !== 'undefined') {
            dat.writeByte(95);
            dat.writeWord(x.level);
        }

        if (typeof x.scaleX !== 'undefined') {
            dat.writeByte(97);
            dat.writeWord(x.scaleX);
        }

        if (typeof x.scaleY !== 'undefined') {
            dat.writeByte(98);
            dat.writeWord(x.scaleY);
        }

        dat.writeByte(0); // end of NPC

        // record size in idx
        let end = dat.offset;
        idx.writeWord(end - start);
    });

    console.log('Serialized NPC definitions');
    return { idx, dat };
}

let files = fs.readdirSync(`${process.env.ASSET_DIR}/npcs`);
let instances = [];
files.map(x => {
    instances.push(JSON.parse(fs.readFileSync(`${process.env.ASSET_DIR}/npcs/` + x)));
});
instances.sort((a, b) => a.id - b.id);

let npc = serializeItems(instances);

fs.writeFileSync('data/src/lostcity/npc.idx', npc.idx.raw);
fs.writeFileSync('data/src/lostcity/npc.dat', npc.dat.raw);
