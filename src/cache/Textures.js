import { ByteBuffer } from '#util/ByteBuffer.js';
import Image from '#cache/Image.js';

let Textures = [];

let idx = ByteBuffer.fromFile('data/cache/raw/textures/index.dat');

for (let i = 0; i < 50; i++) {
    Textures.push(new Image(ByteBuffer.fromFile(`data/cache/raw/textures/${i}.dat`), idx, 0));
}

export default Textures;
