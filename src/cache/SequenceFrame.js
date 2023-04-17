import SequenceBase from '#cache/SequenceBase.js';
import { ByteBuffer } from '#util/ByteBuffer.js';

export default class SequenceFrame {
    static instances = [];

    delay = 0;
    transform = 0;
    groupCount = 0;
    groups = [];
    x = [];
    y = [];
    z = [];

    static unpack(head, tran1, tran2, del) {
        let labels = [];
        let x = [];
        let y = [];
        let z = [];

        const total = head.readWord();
        const count = head.readWord();

        for (let i = 0; i < total; i++) {
            let id = head.readWord();

            let frame = new SequenceFrame();
            frame.delay = del.readByte();

            let baseId = head.readWord();
            frame.transform = SequenceBase.instances[baseId];

            let groupCount = head.readByte();
            let lastGroup = -1;
            let count = 0;
            let flags;
            for (let j = 0; j < groupCount; j++) {
                flags = tran1.readByte();

                if (flags > 0) {
                    if (frame.transform.transformTypes[j] != 0) {
                        for (let group = j - 1; group > lastGroup; group--) {
                            if (frame.transform.transformTypes[group] == 0) {
                                labels[count] = group;
                                x[count] = 0;
                                y[count] = 0;
                                z[count] = 0;
                                count++;
                                break;
                            }
                        }
                    }

                    labels[count] = j;

                    let defaultValue = 0;
                    if (frame.transform.transformTypes[labels[count]] == 3) {
                        defaultValue = 128;
                    }

                    if ((flags & 0x1) != 0) {
                        x[count] = tran2.readSmart();
                    } else {
                        x[count] = defaultValue;
                    }

                    if ((flags & 0x2) != 0) {
                        y[count] = tran2.readSmart();
                    } else {
                        y[count] = defaultValue;
                    }

                    if ((flags & 0x4) != 0) {
                        z[count] = tran2.readSmart();
                    } else {
                        z[count] = defaultValue;
                    }

                    lastGroup = j;
                    count++;
                }
            }

            frame.groupCount = count;
            for (let j = 0; j < count; j++) {
                frame.groups[j] = labels[j];
                frame.x[j] = x[j];
                frame.y[j] = y[j];
                frame.z[j] = z[j];
            }

            SequenceFrame.instances[id] = frame;
        }
    }

    static load(config) {
        const head = config.read('frame_head.dat');
        const tran1 = config.read('frame_tran1.dat');
        const tran2 = config.read('frame_tran2.dat');
        const del = config.read('frame_del.dat');

        SequenceFrame.unpack(head, tran1, tran2, del);
    }

    static loadRaw() {
        const head = ByteBuffer.fromFile('data/cache/raw/models/frame_head.dat');
        const tran1 = ByteBuffer.fromFile('data/cache/raw/models/frame_tran1.dat');
        const tran2 = ByteBuffer.fromFile('data/cache/raw/models/frame_tran2.dat');
        const del = ByteBuffer.fromFile('data/cache/raw/models/frame_del.dat');

        SequenceFrame.unpack(head, tran1, tran2, del);
    }

    static get(id) {
        return this.instances[id];
    }
}
