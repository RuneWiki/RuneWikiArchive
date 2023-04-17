import fs from 'fs';
import { parse } from 'node-html-parser';

let html = [];
function getHtmlFiles(path = 'dump\\www.rune-server.ee\\') {
    let files = fs.readdirSync(path);
    for (let i = 0; i < files.length; ++i) {
        let isDir = fs.lstatSync(path + files[i]).isDirectory();

        if (isDir) {
            getHtmlFiles(path + files[i] + '\\');
        } else if (files[i].includes('.html')) {
            html.push(path + files[i]);
        }
    }
}

if (fs.existsSync('dump/rs-files.csv')) {
    html = fs.readFileSync('dump/rs-files.csv').toString().split('\n');
} else {
    getHtmlFiles();
    fs.writeFileSync('dump/rs-files.csv', html.join('\n'));
}

// TODO: definitively decide if this should be a whitelist or blacklist... pros and cons to both
// list of ignored domains
let domains = [
    // dead domains
    'megaupload.com',
    'imageshack.us',
    'up.ht',
    'tinypic.com',
    'rapidshare.com',
    'uppit.com',
    'upload.ee',
    'screensnapr.com',
    'multiupload.com',

    // not a domain... but leftover bbcode that I want to ignore
    '%5B/quote%5D',

    // people leaving in their local filepaths...
    'c:%5',
    'd:%5',
];

function getUrls() {
    fs.writeFileSync('dump/urls.csv', '');
    for (let i = 0; i < html.length; ++i) {
        let root = parse(fs.readFileSync(html[i]));

        let anchors = root.querySelectorAll('a');
        for (let j = 0; j < anchors.length; ++j) {
            let href = anchors[j].getAttribute('href');
            if (!href) {
                continue;
            }

            // TODO: filter out [quote][/quote]
            // TODO: filter out <br/>

            if (!href.startsWith('http') || // ignore relative URLs (no protocol)
                href.endsWith('/') || // ignore pages
                href.indexOf('.html') !== -1 || // skip html files
                href.indexOf('.htm') !== -1 ||
                href.indexOf('.php') !== -1 ||
                href.indexOf('.aspx') !== -1 ||
                href === 'https://www.discourse.org/') { // ignore forum software tag
                continue;
            }

            let skip = false;
            for (let k = 0; k < domains.length; ++k) {
                if (href.indexOf(domains[k]) !== -1) {
                    skip = true;
                    break;
                }
            }
            if (skip !== false) {
                continue;
            }

            fs.appendFileSync('dump/urls.csv', href + '\n');
        }

        let images = root.querySelectorAll('img');
        for (let j = 0; j < images.length; ++j) {
            let src = images[j].getAttribute('src');
            if (!src) {
                continue;
            }

            if (!src.startsWith('http') || // ignore relative URLs (this forum)
                src.endsWith('/') || // ignore pages
                src.startsWith('https://forum.moparisthebest.com') || // ignore this forum
                src.startsWith('http://www.moparisthebest.com')) { // ignore the old forum
                continue;
            }

            let skip = false;
            for (let k = 0; k < domains.length; ++k) {
                if (src.indexOf(domains[k]) !== -1) {
                    skip = true;
                }
            }
            if (skip) {
                continue;
            }

            fs.appendFileSync('dump/urls.csv', src + '\n');
        }
    }
}
if (!fs.existsSync('dump/urls.csv')) {
    getUrls();
}
let urls = fs.readFileSync('dump/urls.csv').toString().split('\n');

let images = [];
function getImages() {
    for (let i = 0; i < urls.length; ++i) {
        if (urls[i].indexOf('.png') !== -1 || urls[i].indexOf('.jpg') !== -1 || urls[i].indexOf('.jpeg') !== -1 || urls[i].indexOf('.gif') !== -1 || urls[i].indexOf('.bmp') !== -1) {
            images.push(urls[i]);
        }
    }
}
if (fs.existsSync('dump/images.csv')) {
    images = fs.readFileSync('dump/images.csv').toString().split('\n');
} else {
    getImages();
    fs.writeFileSync('dump/images.csv', images.join('\n'));
}

let links = [];
function getLinks() {
    for (let i = 0; i < urls.length; ++i) {
        if (urls[i].indexOf('%5B') !== -1) {
            urls[i] = urls[i].substring(0, urls[i].indexOf('%5B'));
        }

        if (
            // (urls[i].indexOf('mega.co.nz') !== -1 ||
            // urls[i].indexOf('mega.nz') !== -1 ||
            // urls[i].indexOf('mega.io') !== -1)
            // (urls[i].indexOf('pastebin.com') !== -1)
            // (urls[i].indexOf('megaupload.com') !== -1)
            // (urls[i].indexOf('mediafire.com') !== -1)
            (urls[i].indexOf('drive.google.com') !== -1)
            // (urls[i].indexOf('dropbox.com') !== -1 ||
            // urls[i].indexOf('dropboxusercontent.com') !== -1)
            // urls[i].indexOf('.zip') !== -1 ||
            // urls[i].indexOf('.rar') !== -1 ||
            // urls[i].indexOf('.7z') !== -1 ||
            // urls[i].indexOf('.jar') !== -1 ||
            // urls[i].indexOf('.class') !== -1 ||
            // urls[i].indexOf('.java') !== -1 ||
            // urls[i].indexOf('.dat') !== -1 ||
            // urls[i].indexOf('.idx') !== -1) {
            && links.indexOf(urls[i]) === -1) {
            links.push(urls[i]);
        }
    }
}

// if (fs.existsSync('dump/links.csv')) {
// links = fs.readFileSync('dump/links.csv').toString().split('\n');
// } else {
getLinks();
fs.writeFileSync('dump/links.csv', links.join('\n'));
// }
