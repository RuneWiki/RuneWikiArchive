import fs from 'fs';
import { decompressBz2 } from '#util/Bzip2.js';

fs.mkdirSync('dump/songs_midi', { recursive: true });
fs.readdirSync('data/cache/songs').forEach(file => {
    if (!fs.existsSync(`dump/songs_midi/${file}`)) {
        let raw = decompressBz2(fs.readFileSync(`data/cache/songs/${file}`), false);
        fs.writeFileSync(`dump/songs_midi/${file}`, raw);
    }
});

fs.mkdirSync('dump/jingles_midi', { recursive: true });
fs.readdirSync('data/cache/jingles').forEach(file => {
    if (!fs.existsSync(`dump/jingles_midi/${file}`)) {
        let raw = decompressBz2(fs.readFileSync(`data/cache/jingles/${file}`), false);
        fs.writeFileSync(`dump/jingles_midi/${file}`, raw);
    }
});
