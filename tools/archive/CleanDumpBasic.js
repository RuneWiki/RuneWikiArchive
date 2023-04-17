import fs from 'fs';
import zlib from 'zlib';

if (process.argv.length < 2) {
    process.exit(1);
}

const type = process.argv[2];

fs.readdirSync(`dump/cache/${type}`).forEach(file => {
    const path = `dump/cache/${type}/${file}`;
    const raw = fs.readFileSync(path);

    // not a gzip file!
    if (raw[0] != 0x1F && raw[1] != 0x8B) {
        fs.unlinkSync(path);
        return;
    }

    try {
        zlib.gunzipSync(raw);
    } catch (err) {
        if (err.code == 'Z_BUF_ERROR') {
            // bad gzip file
            fs.unlinkSync(path);
        }
    }
});
