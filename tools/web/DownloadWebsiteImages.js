import * as cheerio from 'cheerio';
import fs from 'fs';
import axios from 'axios';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36';

const download = async url => axios.get(url, { responseType: 'arraybuffer', headers: { 'User-Agent': USER_AGENT } });
const sleep = ms => new Promise(r => setTimeout(r, ms));

let images = [];

function parseDir(path) {
    fs.readdirSync(path).filter(x => x == 'client_cgi_world_2_plugin__1_lores_0_rand_19096516.html').forEach(file => {
        if (fs.statSync(`${path}/${file}`).isDirectory()) {
            parseDir(`${path}/${file}`);
            return;
        }
    
        let $ = cheerio.load(fs.readFileSync(`${path}/${file}`));
        let img = $('img');
        for (let i = 0; i < img.length; i++) {
            let src = img[i].attribs.src;
            if (src && !images.includes(src)) {
                images.push(src);
            }
        }
    });    
}

parseDir('dump/www');

for (let i = 0; i < images.length; i++) {
    try {
        let filename = images[i].split('.com/').pop().toLowerCase();
        let path = filename.split('/');
        filename = path.pop();
        path = path.join('/');

        if (!fs.existsSync(`dump/img/${path}`)) {
            fs.mkdirSync(`dump/img/${path}`, { recursive: true });
        }

        if (fs.existsSync(`dump/img/${path}/${filename}`)) {
            continue;
        }

        let url = 'https://web.archive.org/web/20040531im_/' + images[i];
        console.log('downloading', filename);
        let content = await download(url);
        await sleep(50);
        console.log('saved from', content.request.path);
        fs.writeFileSync(`dump/img/${path}/${filename}`, content.data);
    } catch (err) {
        if (err.response) {
            console.log('Failed to download ' + images[i], err.response.status);
        } else {
            console.log('Failed to download ' + images[i], err);
        }
    }
}
