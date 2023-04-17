import fs from 'fs';
import zlib from 'zlib';

if (process.argv.length < 2) {
    process.exit(1);
}

let file = fs.readFileSync(process.argv[2]);
fs.writeFileSync('dump/out', zlib.gunzipSync(file));
