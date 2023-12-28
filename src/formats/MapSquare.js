import Jimp from 'jimp';
import { LocDef } from '#formats/LocDef.js';

function fillImage(image, color, x, y, w, h) {
    for (let i = x; i < x + w; ++i) {
        for (let j = y; j < y + h; ++j) {
            image.setPixelColor(color, i, j);
        }
    }
}

function setPixel(image, color, x, y, zoom = 1, sizeZoom) {
    if (zoom == 1) {
        image.setPixelColor(color, x, y);
    } else {
        fillImage(image, color, x * zoom, y * zoom, sizeZoom || zoom, sizeZoom || zoom);
    }
}

function getNoise(x, y) {
    let n = x + y * 57;
    n = (n << 13) ^ n;
    return (1.0 - ((n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0);
}

function getSmoothNoise2D(x, y) {
    let corners = getNoise(x - 1, y - 1) + getNoise(x + 1, y - 1) + getNoise(x - 1, y + 1) + getNoise(x + 1, y + 1);
    let sides = getNoise(x - 1, y) + getNoise(x + 1, y) + getNoise(x, y - 1) + getNoise(x, y + 1);
    let center = getNoise(x, y);
    return (corners / 16) + (sides / 8) + (center / 4);
}

const sin = [];
const cos = [];
for (let i = 0; i < 2048; i++) {
    sin[i] = Math.floor(Math.sin(i * 0.0030679615) * 65536.0);
    cos[i] = Math.floor(Math.cos(i * 0.0030679615) * 65536.0);
}

function getCosineLerp(a, b, x, scale) {
    let f = (65536 - cos[Math.floor((x * 1024) / scale)]) >> 1;
    return ((a * (65536 - f)) >> 16) + ((b * f) >> 16);
}

function getSmoothNoise(x, z, scale) {
    let intX = Math.floor(x / scale);
    let intZ = Math.floor(z / scale);
    let fracX = x & (scale - 1);
    let fracZ = z & (scale - 1);
    let v1 = getSmoothNoise2D(intX, intZ);
    let v2 = getSmoothNoise2D(intX + 1, intZ);
    let v3 = getSmoothNoise2D(intX, intZ + 1);
    let v4 = getSmoothNoise2D(intX + 1, intZ + 1);
    let i1 = getCosineLerp(v1, v2, fracX / scale);
    let i2 = getCosineLerp(v3, v4, fracX / scale);
    return getCosineLerp(i1, i2, fracZ / scale);
}

function getPerlinNoise(x, z) {
    let value = (getSmoothNoise(x + 45365, z + 91923, 4) - 128) + ((getSmoothNoise(x + 10294, z + 37821, 2) - 128) >> 1) + ((getSmoothNoise(x, z, 1) - 128) >> 2);
    value = Math.floor(value * 0.3) + 35;

    if (value < 10) {
        value = 10;
    } else if (value > 60) {
        value = 60;
    }

    return value;
}

export class MapSquare {
    x;
    z;

    heightmap = [];
    overlay = [];
    overlayTypes = [];
    overlayRotations = [];
    renderFlags = [];
    underlay = [];

    locs = [];

    constructor(land, loc, x, z) {
        this.x = x;
        this.z = z;

        for (let p = 0; p < 4; ++p) {
            this.heightmap[p] = [];
            this.overlay[p] = [];
            this.overlayTypes[p] = [];
            this.overlayRotations[p] = [];
            this.renderFlags[p] = [];
            this.underlay[p] = [];
            this.locs[p] = [];

            for (let x = 0; x < 64; ++x) {
                this.heightmap[p][x] = [];
                this.overlay[p][x] = [];
                this.overlayTypes[p][x] = [];
                this.overlayRotations[p][x] = [];
                this.renderFlags[p][x] = [];
                this.underlay[p][x] = [];
                this.locs[p][x] = [];

                for (let z = 0; z < 64; ++z) {
                    this.locs[p][x][z] = [];
                }
            }
        }

        this.#readLandData(land);
        this.#readLocData(loc);
    }

    #readLandData(stream) {
        if (!stream) {
            return;
        }

        for (let p = 0; p < 4; ++p) {
            for (let x = 0; x < 64; ++x) {
                for (let z = 0; z < 64; ++z) {
                    this.heightmap[p][x][z] = 0;
                    this.renderFlags[p][x][z] = 0;

                    while (stream.available > 0) {
                        let opcode = stream.readByte();
                        if (opcode === 0) {
                            // perlin noise
                            if (p == 0) {
                                this.heightmap[p][x][z] = -getPerlinNoise(x + this.x * 64, z + this.z * 64) * 8;
                            } else {
                                this.heightmap[p][x][z] = this.heightmap[p - 1][x][z] - 240;
                            }
                            break;
                        } else if (opcode === 1) {
                            // heightmap
                            let height = stream.readByte();
                            if (height == 1) {
                                height = 0;
                            }

                            if (p == 0) {
                                this.heightmap[p][x][z] = -height * 8;
                            } else {
                                this.heightmap[p][x][z] = this.heightmap[p - 1][x][z] - height * 8;
                            }
                            break;
                        }

                        if (opcode <= 49) {
                            this.overlay[p][x][z] = stream.readByte();
                            this.overlayTypes[p][x][z] = (opcode - 2) / 4;
                            this.overlayRotations[p][x][z] = (opcode - 2) & 0x3;
                        } else if (opcode <= 81) {
                            this.renderFlags[p][x][z] = opcode - 49;
                        } else {
                            this.underlay[p][x][z] = opcode - 81;
                        }
                    }
                }
            }
        }
    }

    #readLocData(stream) {
        if (!stream) {
            return;
        }

        let locType = -1;
        while (stream.available > 0) {
            let locTypeOff = stream.readSmart();
            if (locTypeOff === 0) {
                break;
            }
            locType += locTypeOff;

            let locInfo = 0;
            while (true) {
                let locInfoOff = stream.readSmart();
                if (locInfoOff === 0) {
                    break;
                }
                locInfo += locInfoOff - 1;

                let x = (locInfo >>> 6) & 0x3f;
                let z = locInfo & 0x3f;
                let p = locInfo >>> 12;

                let objInfo = stream.readByte();
                let objType = objInfo >>> 2;
                let orientation = objInfo & 3;

                this.locs[p][x][z].push({
                    locType,
                    objInfo,
                    objType,
                    orientation
                });
            }
        }
    }

    #drawMinimapTile(image, x, z, plane, zoom, Floor, Loc) {
        const pixelX = x;
        const pixelY = 63 - z;

        let rgb = Jimp.rgbaToInt(0, 0, 0, 255);
        if (this.overlay[plane][x][z] > 0) {
            let def = Floor.get(this.overlay[plane][x][z] - 1);
            rgb = ((def.rgb << 8) | 0x000000FF) >>> 0;
        } else if (this.underlay[plane][x][z] > 0) {
            let def = Floor.get(this.underlay[plane][x][z] - 1);
            if (def) {
                rgb = ((def.rgb << 8) | 0x000000FF) >>> 0;
            } else {
                console.log(plane, x, z);
                return;
            }
        }

        if (rgb == 0x000000FF || rgb == 0xFF00FFFF) {
            return;
        }

        setPixel(image, rgb, pixelX, pixelY, zoom);
    }

    #drawMinimapLoc(image, x, z, plane, zoom, Loc) {
        const wallRGB = 0xEEEEEEFF;
        const doorRGB = 0xEE0000FF;
        const pixelX = x;
        const pixelY = 63 - z;

        let wall = this.locs[plane][x][z].find(loc => loc.objType == LocDef.WALL_STRAIGHT || loc.objType == LocDef.WALL_DIAGONALCORNER || loc.objType == LocDef.WALL_L || loc.objType == LocDef.WALL_SQUARECORNER || loc.objType == LocDef.WALL_DIAGONAL);
        if (wall) {
            const loc = Loc.get(wall.locType);
            if (!loc) {
                return;
            }

            if (loc.mapscene == 22) {
                return;
            }

            if (loc.mapscene) {
                const mapscene = loc.mapsceneImage.src.clone();
                if (zoom != 4) {
                    mapscene.scale(zoom / 4, Jimp.RESIZE_NEAREST_NEIGHBOR);
                }

                const offsetX = ((loc.sizeX * zoom) - mapscene.getWidth()) / 2;
                const offsetY = ((loc.sizeZ * zoom) - mapscene.getHeight()) / 2 + zoom;
                image.blit(mapscene, (pixelX * zoom) + offsetX, ((pixelY - loc.sizeZ) * zoom) + offsetY);
                return;
            }

            let rgb = wallRGB;
            if (wall.objType == LocDef.WALL_STRAIGHT || wall.objType == LocDef.WALL_L) {
                if (wall.orientation === 0) {
                    for (let i = 0; i < zoom; ++i) {
                        setPixel(image, rgb, pixelX * zoom, pixelY * zoom + (i * 1));
                    }
                } else if (wall.orientation == 1) {
                    for (let i = 0; i < zoom; ++i) {
                        setPixel(image, rgb, pixelX * zoom + (i * 1), pixelY * zoom);
                    }
                } else if (wall.orientation == 2) {
                    for (let i = 0; i < zoom; ++i) {
                        setPixel(image, rgb, pixelX * zoom + (zoom - 1), pixelY * zoom + (i * 1));
                    }
                } else if (wall.orientation == 3) {
                    for (let i = 0; i < zoom; ++i) {
                        setPixel(image, rgb, pixelX * zoom + (i * 1), pixelY * zoom + (zoom - 1));
                    }
                }
            }

            if (wall.objType == LocDef.WALL_L) {
                setPixel(image, rgb, pixelX * zoom, pixelY * zoom);

                if (wall.orientation === 0) {
                    for (let i = 0; i < zoom; ++i) {
                        setPixel(image, rgb, pixelX * zoom + (i * 1), pixelY * zoom);
                    }
                } else if (wall.orientation === 1) {
                    for (let i = 0; i < zoom; ++i) {
                        setPixel(image, rgb, pixelX * zoom + (zoom - 1), pixelY * zoom + (i * 1));
                    }
                } else if (wall.orientation === 2) {
                    for (let i = 0; i < zoom; ++i) {
                        setPixel(image, rgb, pixelX * zoom + (i * 1), pixelY * zoom + (zoom - 1));
                    }
                } else if (wall.orientation === 3) {
                    for (let i = 0; i < zoom; ++i) {
                        setPixel(image, rgb, pixelX * zoom, pixelY * zoom + (i * 1));
                    }
                }
            }

            if (wall.objType == LocDef.WALL_SQUARECORNER) {
                if (wall.orientation === 0) {
                    setPixel(image, rgb, pixelX * zoom, pixelY * zoom);
                } else if (wall.orientation == 1) {
                    setPixel(image, rgb, pixelX * zoom + (zoom - 1), pixelY * zoom);
                } else if (wall.orientation == 2) {
                    setPixel(image, rgb, pixelX * zoom + (zoom - 1), pixelY * zoom + (zoom - 1));
                } else if (wall.orientation == 3) {
                    setPixel(image, rgb, pixelX * zoom, pixelY * zoom + (zoom - 1));
                }
            }

            if (wall.objType == LocDef.WALL_DIAGONAL) {
                if (wall.orientation === 0 || wall.orientation == 2) {
                    for (let i = 0, j = zoom - 1; i < zoom; ++i, --j) {
                        setPixel(image, rgb, pixelX * zoom + (i * 1), pixelY * zoom + j);
                    }
                } else {
                    for (let i = 0; i < zoom; ++i) {
                        setPixel(image, rgb, pixelX * zoom + (i * 1), pixelY * zoom + (i * 1));
                    }
                }
            }
        }

        let object = this.locs[plane][x][z].find(loc => loc.objType == LocDef.CENTREPIECE_STRAIGHT);
        if (object) {
            const loc = Loc.get(object.locType);
            if (!loc) {
                return;
            }

            if (loc.mapscene && loc.mapscene != 22) {
                const mapscene = loc.mapsceneImage.src.clone();
                if (zoom != 4) {
                    mapscene.scale(zoom / 4, Jimp.RESIZE_NEAREST_NEIGHBOR);
                }

                const offsetX = ((loc.sizeX * zoom) - mapscene.getWidth()) / 2;
                const offsetY = ((loc.sizeZ * zoom) - mapscene.getHeight()) / 2 + zoom;
                image.blit(mapscene, (pixelX * zoom) + offsetX, ((pixelY - loc.sizeZ) * zoom) + offsetY);
                return;
            }
        }

        let ground = this.locs[plane][x][z].find(loc => loc.objType == LocDef.GROUNDDECOR);
        if (ground) {
            const loc = Loc.get(ground.locType);
            if (!loc) {
                return;
            }

            if (loc.mapscene && loc.mapscene != 22) {
                const mapscene = loc.mapsceneImage.src.clone();
                if (zoom != 4) {
                    mapscene.scale(zoom / 4, Jimp.RESIZE_NEAREST_NEIGHBOR);
                }

                const offsetX = ((loc.sizeX * zoom) - mapscene.getWidth()) / 2;
                const offsetY = ((loc.sizeZ * zoom) - mapscene.getHeight()) / 2 + zoom;
                image.blit(mapscene, (pixelX * zoom) + offsetX, ((pixelY - loc.sizeZ) * zoom) + offsetY);
                return;
            }
        }
    }

    createMinimap(Floor, Loc, zoom = 1, plane = 0) {
        const image = new Jimp(64 * zoom, 64 * zoom, 0x666666FF);
        fillImage(image, 0x000000FF, 0, 0, image.getWidth(), image.getHeight());

        // draw map
        for (let x = 0; x < 64; ++x) {
            for (let z = 0; z < 64; ++z) {
                if ((this.renderFlags[plane][x][z] & 0x18) == 0) {
                    this.#drawMinimapTile(image, x, z, plane, zoom, Floor, Loc);
                }

                if (plane < 3 && (this.renderFlags[plane + 1][x][z] & 0x8) != 0) {
                    this.#drawMinimapTile(image, x, z, plane + 1, zoom, Floor, Loc);
                }
            }
        }

        // draw mapscenes
        for (let x = 0; x < 64; ++x) {
            for (let z = 0; z < 64; ++z) {
                if ((this.renderFlags[plane][x][z] & 0x18) == 0) {
                    this.#drawMinimapLoc(image, x, z, plane, zoom, Loc);
                }

                if (plane < 3 && (this.renderFlags[plane + 1][x][z] & 0x8) != 0) {
                    this.#drawMinimapLoc(image, x, z, plane + 1, zoom, Loc);
                }
            }
        }

        return image;
    }

    #drawHeightmapTile(image, x, z, plane, zoom, Floor) {
        const pixelX = x;
        const pixelY = 63 - z;

        let rgb = Jimp.rgbaToInt(0, 0, 0, 255);
        if (this.overlay[plane][x][z] > 0) {
            let def = Floor.get(this.overlay[plane][x][z] - 1);
            rgb = ((def.rgb << 8) | 0x000000FF) >>> 0;
        } else if (this.underlay[plane][x][z] > 0) {
            let def = Floor.get(this.underlay[plane][x][z] - 1);
            if (def) {
                rgb = ((def.rgb << 8) | 0x000000FF) >>> 0;
            }
        }

        if (rgb == 0x000000FF || rgb == 0xFF00FFFF) {
            return;
        }

        if (this.heightmap[plane][x][z] == 0) {
            return;
        }

        let height = Math.floor(Math.abs(this.heightmap[plane][x][z]) / 2048 * 255);
        if (height < 0 || height > 255) {
            console.log(height, this.heightmap[plane][x][z]);
        }
        setPixel(image, Jimp.rgbaToInt(height, height, height, 255), pixelX, pixelY, zoom);
    }

    createHeightmap(Floor, zoom = 1, plane = 0) {
        const image = new Jimp(64 * zoom, 64 * zoom, 0x666666FF);
        image.greyscale();
        fillImage(image, 0x000000FF, 0, 0, image.getWidth(), image.getHeight());

        // draw map
        for (let x = 0; x < 64; ++x) {
            for (let z = 0; z < 64; ++z) {
                if ((this.renderFlags[plane][x][z] & 0x18) == 0) {
                    this.#drawHeightmapTile(image, x, z, plane, zoom, Floor);
                }

                if (plane < 3 && (this.renderFlags[plane + 1][x][z] & 0x8) != 0) {
                    this.#drawHeightmapTile(image, x, z, plane + 1, zoom, Floor);
                }
            }
        }

        return image;
    }
}
