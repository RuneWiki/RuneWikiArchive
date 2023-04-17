import Packet from '#util/Packet.js';

let dat = Packet.fromFile('dump/cache--444661539.dat');
let entry = 0;

while (dat.available > 0) {
    let start = dat.pos;
    let compression = dat.g1();
    let packedSize = dat.g4();
    let unpackedSize = dat.g4();
    dat.pos += packedSize;
    entry++;

    // experimenting...

    let packed = dat.gPacket(packedSize, start + 9, false);
    packed.toFile(`dump/${entry}.packed`);

    let unpacked = packed;
    if (compression === 1) {
        unpacked = new Packet(packed.bunzip2());
    } else if (compression === 2) {
        unpacked = new Packet(packed.gunzip());
    }
    unpacked.toFile(`dump/${entry}.unpacked`);
}
