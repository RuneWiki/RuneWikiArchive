import Jimp from 'jimp';

function setGamma(rgb, gamma) {
    let r = (rgb >> 16 & 0xFF) / 256;
    let g = (rgb >> 8 & 0xFF) / 256;
    let b = (rgb & 0xFF) / 256;

    r = Math.pow(r, gamma);
    g = Math.pow(g, gamma);
    b = Math.pow(b, gamma);

    let intR = Math.floor(r * 256);
    let intG = Math.floor(g * 256);
    let intB = Math.floor(b * 256);
    return intR << 16 | intG << 8 | intB;
}

function getAverageRGB(palette) {
    let r = 0, g = 0, b = 0;
    for (let i = 0; i < palette.length; ++i) {
        r += (palette[i] >> 16) & 0xFF;
        g += (palette[i] >> 8) & 0xFF;
        b += palette[i] & 0xFF;
    }

    let rgb = (r / palette.length) << 16 | (g / palette.length) << 8 | (b / palette.length);
    rgb = Math.floor(setGamma(rgb, 0.9));
    if (rgb == 0) {
        rgb = 1;
    }
    return rgb;
}

export class Image {
    src = null;
    palette = new Uint32Array();
    average = 0;

    constructor(archive, name, index = 0) {
        const dat = archive.read(`${name}.dat`);
        const idx = archive.read('index.dat');

        idx.seek(dat.readWord());
        let cropW = idx.readWord();
        let cropH = idx.readWord();

        const paletteSize = idx.readByte();
        this.palette = new Uint32Array(paletteSize);
        for (let i = 0; i < paletteSize - 1; ++i) {
            this.palette[i + 1] = idx.readSWord();
            if (this.palette[i + 1] == 0) {
                this.palette[i + 1] = 1;
            }

            setGamma(this.palette[i + 1], 1.4);
        }

        this.average = getAverageRGB(this.palette);

        for (let i = 0; i < index; ++i) {
            idx.seek(2);
            dat.seek(idx.readWord() * idx.readWord());
            idx.seek(1);
        }

        if (dat.available <= 0 || idx.available <= 0) {
            return;
        }

        let cropX = idx.readByte();
        let cropY = idx.readByte();
        const width = idx.readWord();
        const height = idx.readWord();

        if (cropW > width) {
            cropW = width;
        }

        if (cropW + cropX > width) {
            cropX = width - cropW;
        }

        if (cropH > height) {
            cropH = height;
        }

        if (cropH + cropY > height) {
            cropY = height - cropH;
        }

        this.src = new Jimp(width, height, 0);
        const pixelOrder = idx.readByte();
        if (pixelOrder == 0) {
            for (let i = 0; i < width * height; ++i) {
                let color = this.palette[dat.readByte()];
                if (color == 0) {
                    continue;
                }

                color = (color << 8 | 0x000000FF) >>> 0; // add alpha
                const x = i % width;
                const y = Math.floor(i / width);
                this.src.setPixelColor(color, x, y);
            }
        } else {
            for (let x = 0; x < width; ++x) {
                for (let y = 0; y < height; ++y) {
                    let color = this.palette[dat.readByte()];
                    if (color == 0) {
                        continue;
                    }

                    color = (color << 8 | 0x000000FF) >>> 0; // add alpha
                    this.src.setPixelColor(color, x, y);
                }
            }
        }

        this.src = this.src.crop(cropX, cropY, cropW, cropH);
    }
}
