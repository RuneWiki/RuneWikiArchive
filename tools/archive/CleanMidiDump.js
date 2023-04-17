import fs from 'fs';
import zlib from 'zlib';

fs.readdirSync('dump/cache/midis').forEach(file => {
    const path = `dump/cache/midis/${file}`;
    const raw = fs.readFileSync(path);

    // not a gzip file!
    if (raw[0] != 0x1F && raw[1] != 0x8B) {
        fs.unlinkSync(path);
        return;
    }

    try {
        const data = zlib.gunzipSync(raw);
        if (data[0] != 'M'.charCodeAt(0) && data[1] != 'T'.charCodeAt(0) && data[2] != 'h'.charCodeAt(0) && data[3] != 'd'.charCodeAt(0)) {
            if (data[0] == 'R'.charCodeAt(0) && data[1] == 'I'.charCodeAt(0) && data[2] == 'F'.charCodeAt(0) && data[3] == 'F'.charCodeAt(0)) {
                // RIFF header preceeding MIDI
                return;
            }

            // not a midi file
            fs.unlinkSync(path);
        }
    } catch (err) {
        if (err.code == 'Z_BUF_ERROR') {
            // bad gzip file
            fs.unlinkSync(path);
        }
    }
});
