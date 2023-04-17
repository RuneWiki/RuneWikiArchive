import { decompressBz2 } from '#util/Bzip2.js';
import fs from 'fs';

if (process.argv.length < 2) {
    process.exit(1);
}

let file = fs.readFileSync(process.argv[2]);
fs.writeFileSync('dump/out', decompressBz2(file, false));
