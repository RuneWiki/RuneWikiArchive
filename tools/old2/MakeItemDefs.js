import {} from 'dotenv/config';

import { ByteBuffer } from 'utility.js';
ByteBuffer.setGlobalEndianness(false);
ByteBuffer.setGlobalTerminator('\n');

import fs from 'fs';

function serializeItems(instances) {
    console.log('Serializing item definitions');

    let idx = new ByteBuffer();
    let dat = new ByteBuffer();

    let count = instances.length;

    idx.writeWord(count);
    dat.writeWord(count);

    instances.map(x => {
        let start = dat.offset;

        if (x.modelIndex) {
            dat.writeByte(1); // opcode
            dat.writeWord(x.modelIndex);
        }

        if (x.name) {
            dat.writeByte(2); // opcode
            dat.writeStringTerminated(x.name);
        }

        if (x.description) {
            dat.writeByte(3); // opcode
            dat.writeStringTerminated(x.description);
        }

        if (x.iconZoom) {
            dat.writeByte(4); // opcode
            dat.writeWord(x.iconZoom);
        }

        if (x.iconCameraPitch) {
            dat.writeByte(5); // opcode
            dat.writeWord(x.iconCameraPitch);
        }

        if (x.iconYaw) {
            dat.writeByte(6); // opcode
            dat.writeWord(x.iconYaw);
        }

        if (x.iconX) {
            dat.writeByte(7); // opcode
            dat.writeWord(x.iconX);
        }

        if (x.iconY) {
            dat.writeByte(8); // opcode
            dat.writeWord(x.iconY);
        }

        if (x.opcode9) {
            dat.writeByte(9); // opcode
        }

        if (x.opcode10) {
            dat.writeByte(10); // opcode
            dat.writeWord(x.opcode10);
        }

        if (x.stackable) {
            dat.writeByte(11); // opcode
        }

        if (x.value) {
            dat.writeByte(12); // opcode
            dat.writeDWord(x.value);
        }

        if (x.members) {
            dat.writeByte(16); // opcode
        }

        if (x.maleModel0) {
            dat.writeByte(23); // opcode
            dat.writeWord(x.maleModel0);
            dat.writeByte(x.maleOffsetY);
        }

        if (x.maleModel1) {
            dat.writeByte(24); // opcode
            dat.writeWord(x.maleModel1);
        }

        if (x.femaleModel0) {
            dat.writeByte(25); // opcode
            dat.writeWord(x.femaleModel0);
            dat.writeByte(x.femaleOffsetY);
        }

        if (x.femaleModel1) {
            dat.writeByte(26); // opcode
            dat.writeWord(x.femaleModel1);
        }

        if (x.groundOptions) {
            for (let i = 0; i < x.groundOptions.length; ++i) {
                if (!x.groundOptions[i]) {
                    continue;
                }

                dat.writeByte(30 + i); // opcode
                dat.writeStringTerminated(x.groundOptions[i]);
            }
        }

        if (x.options) {
            for (let i = 0; i < x.options.length; ++i) {
                if (!x.options[i]) {
                    continue;
                }

                dat.writeByte(35 + i); // opcode
                dat.writeStringTerminated(x.options[i]);
            }
        }

        if (x.newColors) {
            dat.writeByte(40); // opcode
            dat.writeByte(x.newColors.length);
            for (let i = 0; i < x.newColors.length; ++i) {
                dat.writeWord(x.oldColors[i]);
                dat.writeWord(x.newColors[i]);
            }
        }

        if (x.maleModel2) {
            dat.writeByte(78); // opcode
            dat.writeWord(x.maleModel2);
        }

        if (x.femaleModel2) {
            dat.writeByte(79); // opcode
            dat.writeWord(x.femaleModel2);
        }

        if (x.maleHeadModelA) {
            dat.writeByte(90); // opcode
            dat.writeWord(x.maleHeadModelA);
        }

        if (x.femaleHeadModelA) {
            dat.writeByte(91); // opcode
            dat.writeWord(x.femaleHeadModelA);
        }

        if (x.maleHeadModelB) {
            dat.writeByte(92); // opcode
            dat.writeWord(x.maleHeadModelB);
        }

        if (x.femaleHeadModelB) {
            dat.writeByte(93); // opcode
            dat.writeWord(x.femaleHeadModelB);
        }

        if (x.iconRoll) {
            dat.writeByte(95); // opcode
            dat.writeWord(x.iconRoll);
        }

        if (x.linkedId) {
            dat.writeByte(97); // opcode
            dat.writeWord(x.linkedId); // linked ID
        }

        if (x.certificateId) {
            dat.writeByte(98); // opcode
            dat.writeWord(x.certificateId); // certificate template ID
        }

        if (x.stackId) {
            for (let i = 0; i < x.stackId.length; ++i) {
                dat.writeByte(100 + i); // opcode
                dat.writeWord(x.stackId[i]);
                dat.writeWord(x.stackAmount[i]);
            }
        }

        dat.writeByte(0); // end of item

        // record size in idx
        let end = dat.offset;
        idx.writeWord(end - start);
    });

    console.log('Serialized item definitions');
    return { idx, dat };
}

let files = fs.readdirSync(`${process.env.ASSET_DIR}/objs`);
let instances = [];
files.map(x => {
    instances.push(JSON.parse(fs.readFileSync(`${process.env.ASSET_DIR}/objs/` + x)));
});
instances.sort((a, b) => a.id - b.id);

let obj = serializeItems(instances);

fs.writeFileSync('data/src/lostcity/obj.idx', obj.idx.raw);
fs.writeFileSync('data/src/lostcity/obj.dat', obj.dat.raw);
