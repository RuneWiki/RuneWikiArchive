import { ByteBuffer } from 'utility.js';
ByteBuffer.setGlobalEndianness(false);

import { FileArchive } from '../util/FileArchive.js';
import { FileStore } from '../util/FileStore.js';
import fs from 'fs';

import tinycolor from 'tinycolor2';

function getRgb(color24) {
    let r = (color24 >> 16) & 0xFF;
    let g = (color24 >> 8) & 0xFF;
    let b = color24 & 0xFF;
    return { r, g, b };
}

function adjustBrightness(color, amount) {
    let d1 = (color >> 16) / 256;
    let d2 = (color >> 8 & 0xff) / 256;
    let d3 = (color & 0xff) / 256;
    d1 = Math.pow(d1, amount);
    d2 = Math.pow(d2, amount);
    d3 = Math.pow(d3, amount);
    let r = Math.round(d1 * 256);
    let g = Math.round(d2 * 256);
    let b = Math.round(d3 * 256);
    return (r << 16) + (g << 8) + b;
}

// let COLOR_PALETTE = [];
// for (let i = 0; i < 512; ++i) {
//     let d1 = (i / 8) / 64 + 0.0078125;
//     let d2 = (i & 7) / 8 + 0.0625;
//     for (let j = 0; j < 128; ++j) {
//         let d3 = j / 128;
//         let d4 = d3;
//         let d5 = d3;
//         let d6 = d3;
//         if (d2 != 0.0) {
//             let d7 = 0;
//             if (d3 < 0.5) {
//                 d7 = d3 * (1.0 + d2);
//             } else {
//                 d7 = (d3 + d2) - d3 * d2;
//             }
//             let d8 = 2 * d3 - d7;
//             let d9 = d1 + 0.33333333333333331;
//             if (d9 > 1.0) {
//                 d9--;
//             }
//             let d10 = d1;
//             let d11 = d1 - 0.33333333333333331;
//             if (d11 < 0.0) {
//                 d11++;
//             }
//             if (6 * d9 < 1.0) {
//                 d4 = d8 + (d7 - d8) * 6 * d9;
//             } else if (2 * d9 < 1.0) {
//                 d4 = d7;
//             } else if (3 * d9 < 2) {
//                 d4 = d8 + (d7 - d8) * (0.66666666666666663 - d9) * 6;
//             } else {
//                 d4 = d8;
//             }
//             if (6 * d10 < 1.0) {
//                 d5 = d8 + (d7 - d8) * 6 * d10;
//             } else if (2 * d10 < 1.0) {
//                 d5 = d7;
//             } else if (3 * d10 < 2) {
//                 d5 = d8 + (d7 - d8) * (0.66666666666666663 - d10) * 6;
//             } else {
//                 d5 = d8;
//             }
//             if (6 * d11 < 1.0) {
//                 d6 = d8 + (d7 - d8) * 6 * d11;
//             } else if (2 * d11 < 1.0) {
//                 d6 = d7;
//             } else if (3 * d11 < 2) {
//                 d6 = d8 + (d7 - d8) * (0.66666666666666663 - d11) * 6;
//             } else {
//                 d6 = d8;
//             }
//         }
//         let r = d4 * 256;
//         let g = d5 * 256;
//         let b = d6 * 256;
//         let k2 = (r << 16) + (g << 8) + b;
//         k2 = adjustBrightness(k2, 0.80000000000000004);
//         let color = tinycolor(getRgb(k2));
//         COLOR_PALETTE.push(color);
//     }
// }

class Model {
    constructor(model) {
        for (let i = 0; i < Object.keys(model).length; ++i) {
            this[Object.keys(model)[i]] = Object.values(model)[i];
        }
    }

    toObj(filename = 'model') {
        let obj = `# RS OBJ file\nmtllib ${filename}.mtl\n`;
        let mtl = '# RS MTL file\n';
        const SCALE = 1 / 128;
        for (let i = 0; i < this.vertexX.length; ++i) {
            obj += `v ${this.vertexX[i] * SCALE} ${this.vertexY[i] * SCALE * -1} ${this.vertexZ[i] * SCALE}\n`;
        }
        // generate materials
        let materials = [];
        for (let i = 0; i < this.triangleVertexA.length; ++i) {
            let color = this.unmodifiedTriangleColor[i];
            if (materials.indexOf(color) == -1) {
                materials.push(this.unmodifiedTriangleColor[i]);
            }
        }
        mtl += `# Material count: ${materials.length}\n`;
        for (let i = 0; i < materials.length; ++i) {
            mtl += `newmtl mat.${materials[i]}\n`;
            let color = COLOR_PALETTE[materials[i]].toRgb();
            mtl += `Kd ${color.r / 255} ${color.g / 255} ${color.b / 255}\n`;
        }
        // generate faces
        let currentMaterial = null;
        for (let i = 0; i < this.triangleVertexA.length; ++i) {
            if (currentMaterial !== this.unmodifiedTriangleColor[i]) {
                currentMaterial = this.unmodifiedTriangleColor[i];
                obj += `usemtl mat.${currentMaterial}\n`;
            }
            obj += `f ${this.triangleVertexA[i] + 1} ${this.triangleVertexB[i] + 1} ${this.triangleVertexC[i] + 1}\n`;
        }
        return { obj, mtl };
    }

    toNewFormat() {
        let stream = new ByteBuffer();

        // write data before header

        // vertexDirectionOffset
        stream.write(this.vertexFlagData.raw);

        // faceTypeOffset
        stream.write(this.triangleTypeData.raw);

        // facePriorityOffset
        if (this.metadata.hasPriorities == 255) {
            stream.write(this.trianglePriorityData.raw);
        }

        // vertexSkinOffset
        if (this.metadata.hasSkins === 1) {
            stream.write(this.triangleSkinData.raw);
        }

        // texturePointerOffset
        if (this.metadata.hasInfo === 1) {
            stream.write(this.triangleInfoData.raw);
        }

        // faceSkinOffset
        if (this.metadata.hasLabels === 1) {
            stream.write(this.vertexLabelData.raw);
        }

        // faceAlphaOffset
        if (this.metadata.hasAlpha === 1) {
            stream.write(this.triangleAlphaData.raw);
        }

        // faceDataOffset
        stream.write(this.vertexIndexData.raw);

        // colorDataOffset
        stream.write(this.triangleColorData.raw);

        // uvMapFaceOffset
        stream.write(this.axisData.raw);

        // xDataOffset
        stream.write(this.xData.raw);

        // yDataOffset
        stream.write(this.yData.raw);

        // zDataOffset
        stream.write(this.zData.raw);

        // header is at the end of the file
        stream.writeWord(this.metadata.vertexCount);
        stream.writeWord(this.metadata.triangleCount);
        stream.writeByte(this.metadata.texturedCount);

        stream.writeByte(this.metadata.hasInfo);
        stream.writeByte(this.metadata.hasPriorities);
        stream.writeByte(this.metadata.hasAlpha);
        stream.writeByte(this.metadata.hasSkins);
        stream.writeByte(this.metadata.hasLabels);

        stream.writeWord(this.xData.length);
        stream.writeWord(this.yData.length);
        stream.writeWord(this.zData.length);
        stream.writeWord(this.vertexIndexData.length);

        return stream;
    }
}

class ModelReader {
    constructor() {
        let archive = new FileArchive(new ByteBuffer(fs.readFileSync('data/194/models')));
        this.head = archive.read('ob_head.dat');
        this.faces = [];
        for (let i = 1; i <= 5; ++i) {
            this.faces.push(archive.read('ob_face' + i + '.dat'));
        }
        this.points = [];
        for (let i = 1; i <= 5; ++i) {
            this.points.push(archive.read('ob_point' + i + '.dat'));
        }
        this.vertices = [];
        for (let i = 1; i <= 2; ++i) {
            this.vertices.push(archive.read('ob_vertex' + i + '.dat'));
        }
        this.axis = archive.read('ob_axis.dat');

        this.loadIndex();
    }

    loadIndex() {
        let count = this.head.readWord();
        this.metadata = [];

        let vertexTextureDataOffset = 0;
        let labelDataOffset = 0;
        let triangleColorDataOffset = 0;
        let triangleInfoDataOffset = 0;
        let trianglePriorityDataOffset = 0;
        let triangleAlphaDataOffset = 0;
        let triangleSkinDataOffset = 0;

        for (let i = 0; i < count; ++i) {
            let index = this.head.readWord();
            let metadata = {};
            metadata.vertexCount = this.head.readWord();
            metadata.triangleCount = this.head.readWord();
            metadata.texturedCount = this.head.readByte();

            metadata.vertexFlagDataOffset = this.points[0].offset;
            metadata.vertexXDataOffset = this.points[1].offset;
            metadata.vertexYDataOffset = this.points[2].offset;
            metadata.vertexZDataOffset = this.points[3].offset;
            metadata.vertexIndexDataOffset = this.vertices[0].offset;
            metadata.triangleTypeDataOffset = this.vertices[1].offset;

            let hasInfo = this.head.readByte();
            metadata.hasInfo = hasInfo;
            let hasPriorities = this.head.readByte();
            metadata.hasPriorities = hasPriorities;
            let hasAlpha = this.head.readByte();
            metadata.hasAlpha = hasAlpha;
            let hasSkins = this.head.readByte();
            metadata.hasSkins = hasSkins;
            let hasLabels = this.head.readByte();
            metadata.hasLabels = hasLabels;

            for (let v = 0; v < metadata.vertexCount; v++) {
                let flags = this.points[0].readByte();

                if ((flags & 1) != 0) {
                    this.points[1].readSmartSigned();
                }

                if ((flags & 2) != 0) {
                    this.points[2].readSmartSigned();
                }

                if ((flags & 4) != 0) {
                    this.points[3].readSmartSigned();
                }
            }

            for (let t = 0; t < metadata.triangleCount; t++) {
                let type = this.vertices[1].readByte();
                if (type == 1) {
                    this.vertices[0].readSmartSigned();
                    this.vertices[0].readSmartSigned();
                }
                this.vertices[0].readSmartSigned();
            }

            metadata.triangleColorDataOffset = triangleColorDataOffset;
            triangleColorDataOffset += metadata.triangleCount * 2;

            if (hasInfo == 1) {
                metadata.triangleInfoDataOffset = triangleInfoDataOffset;
                triangleInfoDataOffset += metadata.triangleCount;
            } else {
                metadata.triangleInfoDataOffset = -1;
            }

            if (hasPriorities == 255) {
                metadata.trianglePriorityDataOffset = trianglePriorityDataOffset;
                trianglePriorityDataOffset += metadata.triangleCount;
            } else {
                metadata.trianglePriorityDataOffset = -hasPriorities - 1;
            }

            if (hasAlpha == 1) {
                metadata.triangleAlphaDataOffset = triangleAlphaDataOffset;
                triangleAlphaDataOffset += metadata.triangleCount;
            } else {
                metadata.triangleAlphaDataOffset = -1;
            }

            if (hasSkins == 1) {
                metadata.triangleSkinDataOffset = triangleSkinDataOffset;
                triangleSkinDataOffset += metadata.triangleCount;
            } else {
                metadata.triangleSkinDataOffset = -1;
            }

            if (hasLabels == 1) {
                metadata.vertexLabelDataOffset = labelDataOffset;
                labelDataOffset += metadata.vertexCount;
            } else {
                metadata.vertexLabelDataOffset = -1;
            }

            metadata.triangleTextureDataOffset = vertexTextureDataOffset;
            vertexTextureDataOffset += metadata.texturedCount;

            this.metadata[index] = metadata;
        }
    }

    getModel(id) {
        let metadata = this.metadata[id];
        if (!metadata) {
            console.error('Metadata not found for model', id);
            return null;
        }

        let model = {};
        model.metadata = metadata;

        let vertexCount = metadata.vertexCount;
        let triangleCount = metadata.triangleCount;
        let texturedCount = metadata.texturedCount;

        model.vertexX = [];
        model.vertexY = [];
        model.vertexZ = [];

        model.triangleVertexA = [];
        model.triangleVertexB = [];
        model.triangleVertexC = [];

        model.textureVertexA = [];
        model.textureVertexB = [];
        model.textureVertexC = [];

        if (metadata.vertexLabelDataOffset >= 0) {
            model.vertexLabel = [];
        }

        if (metadata.triangleInfoDataOffset >= 0) {
            model.triangleInfo = [];
        }

        if (metadata.trianglePriorityDataOffset >= 0) {
            model.trianglePriorities = [];
        } else {
            model.priority = -metadata.trianglePriorityDataOffset - 1;
        }

        if (metadata.triangleAlphaDataOffset >= 0) {
            model.triangleAlpha = [];
        }

        if (metadata.triangleSkinDataOffset >= 0) {
            model.triangleSkin = [];
        }

        model.unmodifiedTriangleColor = [];

        this.points[0].offset = metadata.vertexFlagDataOffset;
        this.points[1].offset = metadata.vertexXDataOffset;
        this.points[2].offset = metadata.vertexYDataOffset;
        this.points[3].offset = metadata.vertexZDataOffset;
        this.points[4].offset = metadata.vertexLabelDataOffset;

        let x = 0;
        let y = 0;
        let z = 0;

        for (let v = 0; v < vertexCount; v++) {
            let flags = this.points[0].readByte();
            let x0 = 0;
            if ((flags & 1) != 0)
                x0 = this.points[1].readSmartSigned();
            let y0 = 0;
            if ((flags & 2) != 0)
                y0 = this.points[2].readSmartSigned();
            let z0 = 0;
            if ((flags & 4) != 0)
                z0 = this.points[3].readSmartSigned();
            model.vertexX[v] = x + x0;
            model.vertexY[v] = y + y0;
            model.vertexZ[v] = z + z0;
            x = model.vertexX[v];
            y = model.vertexY[v];
            z = model.vertexZ[v];
            if (model.vertexLabel != null)
                model.vertexLabel[v] = this.points[4].readByte();
        }

        this.faces[0].offset = metadata.triangleColorDataOffset;
        this.faces[1].offset = metadata.triangleInfoDataOffset;
        this.faces[2].offset = metadata.trianglePriorityDataOffset;
        this.faces[3].offset = metadata.triangleAlphaDataOffset;
        this.faces[4].offset = metadata.triangleSkinDataOffset;
        for (let n = 0; n < triangleCount; n++) {
            model.unmodifiedTriangleColor[n] = this.faces[0].readWord();
            if (model.triangleInfo != null)
                model.triangleInfo[n] = this.faces[1].readByte();
            if (model.trianglePriorities != null)
                model.trianglePriorities[n] = this.faces[2].readByte();
            if (model.triangleAlpha != null)
                model.triangleAlpha[n] = this.faces[3].readByte();
            if (model.triangleSkin != null)
                model.triangleSkin[n] = this.faces[4].readByte();
        }

        this.vertices[0].offset = metadata.vertexIndexDataOffset;
        this.vertices[1].offset = metadata.triangleTypeDataOffset;

        let a = 0;
        let b = 0;
        let c = 0;
        let last = 0;
        for (let k3 = 0; k3 < triangleCount; k3++) {
            let l3 = this.vertices[1].readByte();
            if (l3 == 1) {
                a = this.vertices[0].readSmartSigned() + last;
                last = a;
                b = this.vertices[0].readSmartSigned() + last;
                last = b;
                c = this.vertices[0].readSmartSigned() + last;
                last = c;
                model.triangleVertexA[k3] = a;
                model.triangleVertexB[k3] = b;
                model.triangleVertexC[k3] = c;
            } else if (l3 == 2) {
                b = c;
                c = this.vertices[0].readSmartSigned() + last;
                last = c;
                model.triangleVertexA[k3] = a;
                model.triangleVertexB[k3] = b;
                model.triangleVertexC[k3] = c;
            } else if (l3 == 3) {
                a = c;
                c = this.vertices[0].readSmartSigned() + last;
                last = c;
                model.triangleVertexA[k3] = a;
                model.triangleVertexB[k3] = b;
                model.triangleVertexC[k3] = c;
            } else if (l3 == 4) {
                let j4 = a;
                a = b;
                b = j4;
                c = this.vertices[0].readSmartSigned() + last;
                last = c;
                model.triangleVertexA[k3] = a;
                model.triangleVertexB[k3] = b;
                model.triangleVertexC[k3] = c;
            }
        }

        this.axis.offset = metadata.triangleTextureDataOffset * 6;
        for (let i4 = 0; i4 < texturedCount; i4++) {
            model.textureVertexA[i4] = this.axis.readWord();
            model.textureVertexB[i4] = this.axis.readWord();
            model.textureVertexC[i4] = this.axis.readWord();
        }
        return new Model(model);
    }

    getModelRaw(id, pattern = 0) {
        let metadata = this.metadata[id];
        if (!metadata) {
            console.error('Metadata not found for model', id);
            return null;
        }

        let model = {};
        model.metadata = metadata;

        let vertexCount = metadata.vertexCount;
        let triangleCount = metadata.triangleCount;
        let texturedCount = metadata.texturedCount;

        let vertexLabel = null;
        if (metadata.vertexLabelDataOffset >= 0) {
            vertexLabel = [];
        }

        this.points[0].offset = metadata.vertexFlagDataOffset;
        model.vertexFlagData = this.points[0].read(vertexCount);

        // this data has smart bytes in it, need to read through
        this.points[0].offset = metadata.vertexFlagDataOffset;
        this.points[1].offset = metadata.vertexXDataOffset;
        this.points[2].offset = metadata.vertexYDataOffset;
        this.points[3].offset = metadata.vertexZDataOffset;
        this.points[4].offset = metadata.vertexLabelDataOffset;

        let x = 0;
        let y = 0;
        let z = 0;

        let vertexX = [];
        let vertexY = [];
        let vertexZ = [];
        let startX = this.points[1].offset;
        let startY = this.points[2].offset;
        let startZ = this.points[3].offset;
        for (let v = 0; v < vertexCount; v++) {
            let flags = this.points[0].readByte();
            let x0 = 0;
            if ((flags & 1) != 0)
                x0 = this.points[1].readSmartSigned();
            let y0 = 0;
            if ((flags & 2) != 0)
                y0 = this.points[2].readSmartSigned();
            let z0 = 0;
            if ((flags & 4) != 0)
                z0 = this.points[3].readSmartSigned();
            vertexX[v] = x + x0;
            vertexY[v] = y + y0;
            vertexZ[v] = z + z0;
            x = vertexX[v];
            y = vertexY[v];
            z = vertexZ[v];
            if (vertexLabel != null)
                vertexLabel[v] = this.points[4].readByte();
        }
        let endX = this.points[1].offset;
        let endY = this.points[2].offset;
        let endZ = this.points[3].offset;
        this.points[1].offset = metadata.vertexXDataOffset;
        this.points[2].offset = metadata.vertexYDataOffset;
        this.points[3].offset = metadata.vertexZDataOffset;
        model.xData = this.points[1].read(endX - startX);
        model.yData = this.points[2].read(endY - startY);
        model.zData = this.points[3].read(endZ - startZ);

        // read other data

        this.faces[0].offset = metadata.triangleColorDataOffset;
        model.triangleColorData = this.faces[0].read(triangleCount * 2);

        if (metadata.hasInfo === 1) {
            this.faces[1].offset = metadata.triangleInfoDataOffset;
            model.triangleInfoData = this.faces[1].read(triangleCount);
        }

        if (metadata.hasLabels === 1) {
            this.points[4].offset = metadata.vertexLabelDataOffset;
            model.vertexLabelData = this.points[4].read(vertexCount);

            // convert to modified properties based on observations
            for (let i = 0; i < model.vertexLabelData.length; ++i) {
                let value = model.vertexLabelData.peekByte();
                if (pattern === 1) {
                    switch (value) {
                        case 0x0:
                            model.vertexLabelData.writeByte(0x5);
                            break;
                        case 0x1:
                            model.vertexLabelData.writeByte(0x7);
                            break;
                        case 0x2:
                            model.vertexLabelData.writeByte(0x0);
                            break;
                        case 0x3:
                            model.vertexLabelData.writeByte(0x15);
                            break;
                        case 0x4:
                            model.vertexLabelData.writeByte(0x12);
                            break;
                        case 0x5:
                            model.vertexLabelData.writeByte(0x6);
                            break;
                        case 0x6:
                            model.vertexLabelData.writeByte(0x14);
                            break;
                        case 0x7:
                            model.vertexLabelData.writeByte(0x8);
                            break;
                        case 0x8:
                            model.vertexLabelData.writeByte(0x1);
                            break;
                        case 0x9:
                            model.vertexLabelData.writeByte(0x2);
                            break;
                        case 0xA:
                            model.vertexLabelData.writeByte(0x3);
                            break;
                        case 0xB:
                            model.vertexLabelData.writeByte(0x4);
                            break;
                        case 0xC:
                            model.vertexLabelData.writeByte(0x11);
                            break;
                        case 0xD:
                            model.vertexLabelData.writeByte(0x13);
                            break;
                        case 0xE:
                            model.vertexLabelData.writeByte(0xA);
                            break;
                        case 0xF:
                            model.vertexLabelData.writeByte(0xFF);
                            break;
                        case 0x10:
                            model.vertexLabelData.writeByte(0x9);
                            break;
                        case 0x11:
                            model.vertexLabelData.writeByte(0xFF);
                            break;
                        case 0x12:
                            model.vertexLabelData.writeByte(0x10);
                            break;
                        case 0x13:
                            model.vertexLabelData.writeByte(0xB);
                            break;
                        case 0x14:
                            model.vertexLabelData.writeByte(0x17);
                            break;
                        case 0x15:
                            model.vertexLabelData.writeByte(0xC);
                            break;
                        case 0x17:
                            model.vertexLabelData.writeByte(0xE);
                            break;
                        case 0x18:
                            model.vertexLabelData.writeByte(0xD);
                            break;
                        case 0x19:
                            model.vertexLabelData.writeByte(0xF);
                            break;
                        case 0x1A:
                            model.vertexLabelData.writeByte(0x1B);
                            break;
                        case 0x1B:
                            model.vertexLabelData.writeByte(0x19);
                            break;
                        case 0x1C:
                            model.vertexLabelData.writeByte(0x1A);
                            break;
                        case 0x1D:
                        case 0x1E:
                        case 0x1F:
                        case 0x20:
                        case 0x21:
                        case 0x22:
                        case 0x23:
                        case 0x24:
                        case 0x25:
                        case 0x26:
                        case 0x27:
                        case 0x28:
                        case 0x29:
                        case 0x2A: // possibly not needed
                        case 0x2B:
                        case 0x2C:
                            model.vertexLabelData.writeByte(0xFF);
                            break;
                        case 0x2D:
                            model.vertexLabelData.writeByte(0x0);
                            break;
                        default:
                            model.vertexLabelData.seek(1);
                            break;
                    }
                } else if (pattern === 2) {
                    let clamp = value - 2;
                    if (clamp < -1) {
                        clamp = -1;
                    }
                    model.vertexLabelData.writeByte(clamp);
                } else if (pattern === 3) {
                    model.vertexLabelData.writeByte(0x80);
                } else if (pattern === 4) {
                    switch (value) {
                        case 0x0:
                            model.vertexLabelData.writeByte(0x15);
                            break;
                        case 0x1:
                            model.vertexLabelData.writeByte(0x14);
                            break;
                        case 0x2:
                            model.vertexLabelData.writeByte(0x17);
                            break;
                        case 0x3:
                            model.vertexLabelData.writeByte(0x16);
                            break;
                        case 0x4:
                            model.vertexLabelData.writeByte(0xA);
                            break;
                        case 0x5:
                            model.vertexLabelData.writeByte(0x9);
                            break;
                        default:
                            model.vertexLabelData.seek(1);
                            break;
                    }
                } else if (pattern === 5) {
                    model.vertexLabelData.writeByte(0xFF);
                } else if (pattern === 6) {
                    switch (value) {
                        case 0x0:
                            model.vertexLabelData.writeByte(0xF);
                            break;
                        case 0x1:
                            model.vertexLabelData.writeByte(0x10);
                            break;
                        case 0x2:
                            model.vertexLabelData.writeByte(0x8);
                            break;
                        case 0x3:
                            model.vertexLabelData.writeByte(0x7);
                            break;
                        default:
                            model.vertexLabelData.seek(1);
                            break;
                    }
                } else if (pattern === 7) {
                    model.vertexLabelData.writeByte(value + 1);
                } else if (pattern === 8) {
                    switch (value) {
                        case 0x0:
                            model.vertexLabelData.writeByte(0x13);
                            break;
                        case 0x3:
                            model.vertexLabelData.writeByte(0x14);
                            break;
                        case 0x4:
                            model.vertexLabelData.writeByte(0x15);
                            break;
                        case 0x5:
                            model.vertexLabelData.writeByte(0x16);
                            break;
                        case 0x6:
                            model.vertexLabelData.writeByte(0x17);
                            break;
                        case 0x7:
                            model.vertexLabelData.writeByte(0x18);
                            break;
                        case 0x8:
                            model.vertexLabelData.writeByte(0x19);
                            break;
                        case 0x9:
                            model.vertexLabelData.writeByte(0x1A);
                            break;
                        case 0xA:
                            model.vertexLabelData.writeByte(0x1B);
                            break;
                        case 0xB:
                            model.vertexLabelData.writeByte(0x1C);
                            break;
                        case 0xC:
                            model.vertexLabelData.writeByte(0x1D);
                            break;
                        case 0xD:
                            model.vertexLabelData.writeByte(0x21);
                            break;
                        case 0xE:
                            model.vertexLabelData.writeByte(0x22);
                            break;
                        case 0xF:
                            model.vertexLabelData.writeByte(0x23);
                            break;
                        case 0x10:
                            model.vertexLabelData.writeByte(0x1E);
                            break;
                        case 0x11:
                            model.vertexLabelData.writeByte(0x1F);
                            break;
                        case 0x12:
                            model.vertexLabelData.writeByte(0x20);
                            break;
                        case 0x13:
                            model.vertexLabelData.writeByte(0x28);
                            break;
                        case 0x14:
                            model.vertexLabelData.writeByte(0x27);
                            break;
                        case 0x16:
                            model.vertexLabelData.writeByte(0x11);
                            break;
                        case 0x17:
                            model.vertexLabelData.writeByte(0x12);
                            break;
                        case 0x18:
                            model.vertexLabelData.writeByte(0x0);
                            break;
                        case 0x19:
                            model.vertexLabelData.writeByte(0x1);
                            break;
                        case 0x1A:
                            model.vertexLabelData.writeByte(0x2);
                            break;
                        case 0x1B:
                            model.vertexLabelData.writeByte(0x3);
                            break;
                        case 0x1C:
                            model.vertexLabelData.writeByte(0x4);
                            break;
                        case 0x1D:
                            model.vertexLabelData.writeByte(0x5);
                            break;
                        case 0x1E:
                            model.vertexLabelData.writeByte(0x6);
                            break;
                        case 0x1F:
                            model.vertexLabelData.writeByte(0x7);
                            break;
                        case 0x20:
                            model.vertexLabelData.writeByte(0x8);
                            break;
                        case 0x21:
                            model.vertexLabelData.writeByte(0x9);
                            break;
                        case 0x22:
                            model.vertexLabelData.writeByte(0xA);
                            break;
                        case 0x23:
                            model.vertexLabelData.writeByte(0xB);
                            break;
                        case 0x24:
                            model.vertexLabelData.writeByte(0xC);
                            break;
                        case 0x25:
                            model.vertexLabelData.writeByte(0xD);
                            break;
                        case 0x26:
                            model.vertexLabelData.writeByte(0xE);
                            break;
                        case 0x27:
                            model.vertexLabelData.writeByte(0xF);
                            break;
                        case 0x28:
                            model.vertexLabelData.writeByte(0x10);
                            break;
                        case 0x29:
                            model.vertexLabelData.writeByte(0x24);
                            break;
                        case 0x2A:
                            model.vertexLabelData.writeByte(0x25);
                            break;
                        case 0x2B:
                            model.vertexLabelData.writeByte(0x26);
                            break;
                        default:
                            model.vertexLabelData.seek(1);
                            break;
                    }
                }
            }
        }

        if (metadata.hasPriorities === 255) {
            this.faces[2].offset = metadata.trianglePriorityDataOffset;
            model.trianglePriorityData = this.faces[2].read(triangleCount);
        }

        if (metadata.hasAlpha === 1) {
            this.faces[3].offset = metadata.triangleAlphaDataOffset;
            model.triangleAlphaData = this.faces[3].read(triangleCount);
        }

        if (metadata.hasSkins === 1) {
            this.faces[4].offset = metadata.triangleSkinDataOffset;
            model.triangleSkinData = this.faces[4].read(triangleCount);

            // convert to modified properties based on observations
            for (let i = 0; i < model.triangleSkinData.length; ++i) {
                let value = model.triangleSkinData.peekByte();
                if (pattern === 4) {
                    switch (value) {
                        case 0x0:
                            model.triangleSkinData.writeByte(0xF);
                            break;
                        case 0x1:
                            model.triangleSkinData.writeByte(0x10);
                            break;
                        case 0x2:
                            model.triangleSkinData.writeByte(0x8);
                            break;
                        case 0x3:
                            model.triangleSkinData.writeByte(0x7);
                            break;
                        default:
                            model.triangleSkinData.seek(1);
                            break;
                    }
                } else if (pattern === 8) {
                    switch (value) {
                        case 0x0:
                        case 0x2:
                        case 0x3:
                        case 0x4:
                        case 0x5:
                        case 0x6:
                        case 0x7:
                        case 0x8:
                        case 0x9:
                        case 0xA:
                        case 0xB:
                        case 0xC:
                        case 0xD:
                        case 0xF:
                        case 0x10:
                        case 0x11:
                        case 0x13:
                        case 0x14:
                        case 0x15:
                            model.triangleSkinData.writeByte(0xFF);
                            break;
                        case 0xE:
                            model.triangleSkinData.writeByte(0x3);
                            break;
                        case 0x12:
                            model.triangleSkinData.writeByte(0x4);
                            break;
                        case 0x16:
                            model.triangleSkinData.writeByte(0x5);
                            break;
                        case 0x17:
                            model.triangleSkinData.writeByte(0x0);
                            break;
                        case 0x18:
                            model.triangleSkinData.writeByte(0x1);
                            break;
                        case 0x19:
                            model.triangleSkinData.writeByte(0x2);
                            break;
                        default:
                            model.triangleSkinData.seek(1);
                            break;
                    }
                }
            }
        }

        // this data has smart bytes in it, need to read through like before
        this.vertices[0].offset = metadata.vertexIndexDataOffset;
        this.vertices[1].offset = metadata.triangleTypeDataOffset;
        let a = 0;
        let b = 0;
        let c = 0;
        let last = 0;
        let start = this.vertices[0].offset;
        for (let k3 = 0; k3 < triangleCount; k3++) {
            let l3 = this.vertices[1].readByte();
            if (l3 == 1) {
                a = this.vertices[0].readSmartSigned() + last;
                last = a;
                b = this.vertices[0].readSmartSigned() + last;
                last = b;
                c = this.vertices[0].readSmartSigned() + last;
                last = c;
            } else if (l3 == 2) {
                b = c;
                c = this.vertices[0].readSmartSigned() + last;
                last = c;
            } else if (l3 == 3) {
                a = c;
                c = this.vertices[0].readSmartSigned() + last;
                last = c;
            } else if (l3 == 4) {
                let j4 = a;
                a = b;
                b = j4;
                c = this.vertices[0].readSmartSigned() + last;
                last = c;
            }
        }
        let end = this.vertices[0].offset;
        this.vertices[0].offset = metadata.vertexIndexDataOffset;
        model.vertexIndexData = this.vertices[0].read(end - start);

        this.vertices[1].offset = metadata.triangleTypeDataOffset;
        model.triangleTypeData = this.vertices[1].read(triangleCount);

        this.axis.offset = metadata.triangleTextureDataOffset * 6;
        model.axisData = this.axis.read(texturedCount * 6);

        return new Model(model);
    }
}

import zlib from 'zlib';

// let store = new FileStore('data/289');
// let versionlist = store.read(0, 5, true);
// let version = versionlist.read('model_version');
// let versions = [];
// let crclist = versionlist.read('model_crc');
// let crcs = [];
// for (let i = 0; i < version.length / 2; ++i) {
//     versions.push(version.readWord());
//     crcs.push(crclist.readDWord());
// }

let reader = new ModelReader();
for (let i = 0; i < reader.metadata.length; ++i) {
    if (!reader.metadata[i]) {
        continue;
    }
    fs.writeFileSync('dump/convert.194/' + i, reader.getModelRaw(i).toNewFormat().raw);
}

// let count = 0;
// let matches = [];
// let patterns = [];
// for (let i = 0; i <= 8; ++i) {
//     patterns[i] = [];
// }
// for (let i = 0; i < reader.metadata.length; ++i) {
//     // let i = 148;
//     let oldModel = null;
//     let crc = 0;
//     let compressed = null;
//     let oldCrc = 0;
//     if (fs.existsSync('dump/289/' + i)) {
//         oldCrc = ByteBuffer.crc32(fs.readFileSync('dump/289/' + i));
//     }

//     for (let j = 0; j <= 8; ++j) {
//         let model = reader.getModelRaw(i, j);
//         oldModel = model.toNewFormat().raw;
//         compressed = zlib.gzipSync(oldModel);
//         compressed[9] = 0;
//         crc = ByteBuffer.crc32(compressed);
//         if (crc === crcs[i]) {
//             count++;
//             matches[i] = true;
//             patterns[j].push(i);
//             break;
//         }
//     }
//     if (store.read(1, i, true).length === 0 && matches[i]) {
//         console.log(i, 'was found');
//         fs.writeFileSync('dump/found/' + crc, compressed);
//     }

//     fs.writeFileSync('dump/225-new/' + i, oldModel);
//     // fs.writeFileSync('dump/225/' + i, reader.getModelRaw(i).toNewFormat().raw);
//     // let newModel = store.read(1, i, true);
//     // if (newModel.length) {
//     //     fs.writeFileSync('dump/289/' + i, newModel);
//     // }
//     // fs.writeFileSync('dump/compare/' + crc, compressed);
// }
// fs.writeFileSync('dump/patterns.json', JSON.stringify(patterns, null, 2));
// console.log(patterns);
// console.log(matches[140]);
// console.log(count, reader.metadata.length, versions.length);

// for (let i = 0; i < reader.metadata.length; ++i) {
//     let model = reader.getModel(i);
//     if (!model) {
//         continue;
//     }
//     const { obj, mtl } = model.toObj(i);
//     fs.writeFileSync('dump/' + i + '.obj', obj);
//     fs.writeFileSync('dump/' + i + '.mtl', mtl);
// }

// let files = fs.readdirSync('dump/models.194').filter(x => !x.includes('.mtl'));
// files.sort((a, b) => {
//     let first = parseInt(a.split('.')[0]);
//     let second = parseInt(b.split('.')[0]);
//     if (first < second) {
//         return -1;
//     } else if (first === second) {
//         return 0;
//     } else {
//         return 1;
//     }
// });
// let crcs = [];
// for (let i = 0; i < files.length; ++i) {
//     let file = fs.readFileSync('dump/models.194/' + files[i]).toString().split('\n').slice(2).join('\n');
//     crcs.push(ByteBuffer.crc32(Buffer.from(file)));
// }

// let otherFiles = fs.readdirSync('dump/models.225').filter(x => !x.includes('.mtl'));
// otherFiles.sort((a, b) => {
//     let first = parseInt(a.split('.')[0]);
//     let second = parseInt(b.split('.')[0]);
//     if (first < second) {
//         return -1;
//     } else if (first === second) {
//         return 0;
//     } else {
//         return 1;
//     }
// });
// let otherCrcs = [];
// for (let i = 0; i < otherFiles.length; ++i) {
//     let file = fs.readFileSync('dump/models.225/' + otherFiles[i]).toString().split('\n').slice(2).join('\n');
//     otherCrcs.push(ByteBuffer.crc32(Buffer.from(file)));
// }

// let overall = [];
// let found = [];
// for (let i = 0; i < files.length; ++i) {
//     for (let j = 0; j < otherFiles.length; ++j) {
//         if (crcs[i] === otherCrcs[j]) {
//             let file = fs.readFileSync('dump/models.194/' + files[i]).toString().split('\n').slice(2);
//             file.splice(0, 0, '# RS OBJ file');
//             file.splice(1, 0, 'mtllib ' + otherFiles[j].replace('.obj', '') + '.mtl');
//             file = file.join('\n');
//             fs.writeFileSync('dump/reordered.194/' + otherFiles[j], file);
//             fs.copyFileSync('dump/models.194/' + files[i].replace('.obj', '.mtl'), 'dump/reordered.194/' + otherFiles[j].replace('.obj', '.mtl'));
//             found.push({ old: files[i], new: otherFiles[j] });
//             overall.push(files[i]);
//         }
//     }
// }
// fs.writeFileSync('dump/reordered-194.json', JSON.stringify(found, null, 2));
// console.log(files.length - overall.length, 'unmatched models');

// let unknownFiles = files.filter(x => overall.indexOf(x) === -1);
// fs.writeFileSync('dump/unknown-194.json', JSON.stringify(unknownFiles, null, 2));
// for (let i = 0; i < unknownFiles.length; ++i) {
//     fs.copyFileSync('dump/models.194/' + unknownFiles[i], 'dump/unknown.194/' + unknownFiles[i]);
//     fs.copyFileSync('dump/models.194/' + unknownFiles[i].replace('.obj', '.mtl'), 'dump/unknown.194/' + unknownFiles[i].replace('.obj', '.mtl'));
// }

// let objCount = 0;
// let mtlCount = 0;
// for (let i = 0; i < files.length; ++i) {
//     if (!fs.existsSync('dump/models.289/' + files[i])) {
//         if (files[i].includes('.obj')) {
//             // console.log('model', files[i].slice(0, files[i].length - 4), 'does not exist in 289');
//             // count++;
//         }
//         continue;
//     }

//     if (ByteBuffer.crc32(fs.readFileSync('dump/models.225/' + files[i])) !== ByteBuffer.crc32(fs.readFileSync('dump/models.289/' + files[i]))) {
//         if (files[i].includes('.obj')) {
//             console.log('model', files[i].slice(0, files[i].length - 4), 'is different in 289');
//             objCount++;
//         } else {
//             console.log('material', files[i].slice(0, files[i].length - 4), 'is different in 289');
//             mtlCount++;
//         }
//     }
// }
// console.log('225 has', objCount, 'different models compared to 289');
// console.log('225 has', mtlCount, 'different materials compared to 289');
