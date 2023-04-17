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

export default class Image {
    palette = new Uint32Array();
    data = new Uint8Array();
    jpeg = false;
    average = 0;

    width = 0;
    height = 0;
    pixelOrder = 0;
    cropX = 0;
    cropY = 0;
    cropW = 0;
    cropH = 0;

    constructor(dat, idx, sprite = 0) {
        const offsetInIdx = dat.readWord();
        idx.front().seek(offsetInIdx);

        this.cropW = idx.readWord();
        this.cropH = idx.readWord();

        const paletteSize = idx.readByte();
        this.palette = new Uint32Array(paletteSize);
        for (let i = 0; i < paletteSize - 1; ++i) {
            this.palette[i + 1] = idx.readSWord();

            if (this.palette[i + 1] == 0) {
                this.palette[i + 1] = 1;
            }
        }

        if (paletteSize == 2 && this.palette[1] == 1) {
            // this is a completely transparent image
            this.palette = new Uint32Array();
            this.cropW = 0;
            this.cropH = 0;
            return;
        }

        this.average = getAverageRGB(this.palette);

        for (let i = 0; i < sprite && idx.available && dat.available; ++i) {
            idx.seek(2);
            dat.seek(idx.readWord() * idx.readWord());
            idx.seek(1);
        }

        if (!idx.available || !dat.available) {
            // not a valid index
            this.palette = new Uint32Array();
            this.cropW = 0;
            this.cropH = 0;
            return;
        }

        this.cropX = idx.readByte();
        this.cropY = idx.readByte();
        this.width = idx.readWord();
        this.height = idx.readWord();

        this.data = new Uint8Array(this.width * this.height);
        this.pixelOrder = idx.readByte();

        if (this.pixelOrder == 0) {
            for (let i = 0; i < this.width * this.height; ++i) {
                this.data[i] = dat.readByte();
            }
        } else {
            for (let x = 0; x < this.width; ++x) {
                for (let y = 0; y < this.height; ++y) {
                    this.data[x + y * this.width] = dat.readByte();
                }
            }
        }

        if (this.data.every(b => b == 0)) {
            // this is a completely transparent image
            this.data = new Uint8Array();
            this.width = 0;
            this.height = 0;
            this.cropX = 0;
            this.cropY = 0;
            this.cropW = 0;
            this.cropH = 0;
            this.pixelOrder = 0;
            return;
        }
    }

    load(archive, name, sprite = 0) {
        const dat = archive.read(`${name}.dat`);

        if (dat.raw[0] == 0 && dat.raw[1] == 0xD8 && dat.raw[2] == 0xFF && dat.raw[3] == 0xE0) {
            // this is a JPEG image (probably a title screen)
            this.data = dat;
            this.jpeg = true;

            this.data.raw[0] = 0xFF; // fix the JPEG header
            return;
        }

        const idx = archive.read('index.dat');
        return new Image(dat, idx, sprite);
    }

    async convert(crop = true) {
        if (!this.data.length) {
            return null;
        }

        if (this.jpeg) {
            return this.data.raw;
        }

        try {
            let image = new Jimp(this.width, this.height, 0x00000000);

            for (let x = 0; x < this.width; ++x) {
                for (let y = 0; y < this.height; ++y) {
                    let color = this.palette[this.data[x + y * this.width]];
                    if (color == 0) {
                        continue;
                    }

                    // set the color and alpha level
                    image.setPixelColor((color << 8 | 0xFF) >>> 0, x, y);
                }
            }

            if (crop && (this.cropX != 0 || this.cropY != 0 || this.cropW != this.width || this.cropH != this.height)) {
                let cropW = this.cropW;
                let cropH = this.cropH;
                let cropX = this.cropX;
                let cropY = this.cropY;

                if (cropW > this.width) {
                    cropW = this.width;
                }

                if (cropW + cropX > this.width) {
                    cropX = this.width - cropW;
                }

                if (cropH > this.height) {
                    cropH = this.height;
                }

                if (cropH + cropY > this.height) {
                    cropY = this.height - cropH;
                }

                image.crop(cropX, cropY, cropW, cropH);
            }

            return image.getBufferAsync(Jimp.MIME_PNG);
        } catch (err) {
            return null;
        }
    }
}
