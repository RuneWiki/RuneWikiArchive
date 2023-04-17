import { compressBz2 } from '#util/Bzip2.js';
import fs from 'fs';

if (process.argv.length < 2) {
    process.exit(1);
}

let files = fs.readdirSync(process.argv[2]);

fs.mkdirSync('dump/compressed', { recursive: true });
for (let file of files) {
    let data = compressBz2(fs.readFileSync(process.argv[2] + '/' + file));
    fs.writeFileSync('dump/compressed/' + file, data);
}
