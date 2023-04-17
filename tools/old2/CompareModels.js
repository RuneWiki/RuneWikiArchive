import {} from 'dotenv/config';
import fs from 'fs';
import { ByteBuffer } from 'utility.js';
import { ModelReader } from '../src/formats/Model.js';

let models194 = new ModelReader('dump/194/models');
let models194_crc = [];
models194.metadata.map((model, index) => {
    models194_crc[index] = ByteBuffer.crc32(models194.getModelRaw(index).toNewFormat(false).raw);
});

let models204 = new ModelReader('dump/204/models');
let models204_crc = [];
models204.metadata.map((model, index) => {
    models204_crc[index] = ByteBuffer.crc32(models204.getModelRaw(index).toNewFormat(false).raw);
});

let matched = [];
models194_crc.map((crc, index) => {
    let match = models204_crc.indexOf(crc);
    if (matched.indexOf(match) !== -1) {
        let found = match;
        let last = found + 1;
        while (found !== -1) {
            found = models204_crc.indexOf(crc, last);
            if (found !== -1) {
                match = found;
            }
            last = found + 1;
        }
    }

    if (index === 15) {
        // hat changed slightly
        match = 16;
    } else if (index === 46) {
        // dunno what changed with this chathead
        match = 49;
    } else if (index === 55) {
        // dunno what changed with this chathead
        match = 59;
    } else if (index === 104) {
        // dunno what changed with this chathead
        match = 110;
    } else if (index === 109) {
        // dunno what changed with this chathead
        match = 115;
    } else if (index === 115) {
        // added hair
        match = 121;
    } else if (index === 141) {
        // dunno what changed with these arms
        match = 150;
    } else if (index === 175) {
        // partyhat changed, colored inside instead of white
        match = 187;
    } else if (index === 197) {
        // dunno what changed with this head
        match = 209;
    } else if (index === 206) {
        // helmet color extends down to neck
        match = 218;
    } else if (index === 211) {
        // dunno what changed with this head
        match = 223;
    } else if (index === 224) {
        // new h'ween mask
        match = 3192;
    } else if (index === 269) {
        // amount of beads on necklace changed
        match = 285;
    } else if (index === 301) {
        // ridges on cape added
        match = 317;
    } else if (index === 307) {
        // ridges on cape added
        match = 323;
    } else if (index === 339) {
        // glove colors changed
        match = 356;
    } else if (index === 344) {
        // partyhat changed, colored inside instead of white
        match = 363;
    } else if (index === 375) {
        // helmet color extends down to neck
        match = 394;
    } else if (index === 391) {
        // new h'ween mask
        match = 3188;
    } else if (index === 408) {
        // dunno what changed with these legs
        match = 429;
    } else if (index === 412) {
        // dunno what changed with these legs
        match = 433;
    } else if (index === 427) {
        // amount of beads on necklace changed
        match = 449;
    } else if (index === 428) {
        // dunno what changed with this symbol
        match = 450;
    } else if (index === 457) {
        // ridges on cape added
        match = 479;
    } else if (index === 459) {
        // ridges on cape added
        match = 481;
    } else if (index === 479) {
        // dunno what changed with this scythe
        match = 507;
    } else if (index === 486) {
        // iban's staff got taller
        match = 514;
    } else if (index === 503) {
        // staff got darker at bottom
        match = 534;
    } else if (index === 513) {
        // poison tip
        match = 547;
    } else if (index === 518) {
        // dunno what changed with this staff
        match = 553;
    } else if (index === 519) {
        // staff of saradomin tip changed
        match = 554;
    } else if (index === 521) {
        // dunno what changed with dragon battleaxe
        match = 559;
    } else if (index === 522) {
        // dragon kiteshield (?) recolored
        match = 560;
    } else if (index === 526) {
        // dunno what changed with dragon longsword
        match = 564;
    } else if (index === 527) {
        // dragon sq. shield recolored
        match = 565;
    } else if (index === 567) {
        // door is darker
        match = 607;
    } else if (index === 569) {
        // transparent sheet added to gate?
        match = 609;
    } else if (index === 571) {
        // door is darker
        match = 611;
    } else if (index === 572) {
        // dunno what changed with wall
        match = 612;
    } else if (index === 575) {
        // dunno what changed with wall
        match = 615;
    } else if (index === 582) {
        // dunno what changed with roof
        match = 622;
    } else if (index === 587) {
        // dunno what changed with door
        match = 627;
    } else if (index === 599) {
        // removed part of door under handle
        match = 639;
    } else if (index === 606) {
        // dunno what changed with wall
        match = 646;
    } else if (index === 624) {
        // hinge moved on wall, rounded corner
        match = 664;
    } else if (index === 656) {
        // recolored scrapes
        match = 708;
    } else if (index === 738) {
        // brighter webs
        match = 800;
    } else if (index === 751) {
        // dunno what changed with this entrance
        match = 830;
    } else if (index === 754) {
        // dunno what changed with this entrance
        match = 833;
    } else if (index === 886) {
        // non-flat gate
        match = 969;
    } else if (index === 887) {
        // non-flat gate
        match = 970;
    } else if (index === 1024) {
        // dunno what changed with this dresser
        match = 1145;
    } else if (index === 1028) {
        // book pages on altar
        match = 1152;
    } else if (index === 1030) {
        // dunno what changed with this dresser
        match = 1154;
    } else if (index === 1043) {
        // handles changed on dresser
        match = 1167;
    } else if (index === 1066) {
        // glow from furnace, no chute on model
        match = 1192;
    } else if (index === 1069) {
        // dunno what changed with this table
        match = 1195;
    } else if (index === 1144) {
        // dunno what changed with this table
        match = 1279;
    } else if (index === 1181) {
        // dunno what changed with this gate
        match = 1321;
    } else if (index === 1210) {
        // dunno what changed with this entrance
        match = 1350;
    } else if (index === 1212) {
        // dunno what changed with this entrance
        match = 1352;
    } else if (index === 1214) {
        // entrance opened up
        match = 1354;
    } else if (index === 1251) {
        // no rails on railcart
        match = 1398;
    } else if (index === 1255) {
        // writing on sign
        match = 1402;
    } else if (index === 1279) {
        // stick in middle
        match = 1427;
    } else if (index === 1340) {
        // some water object matches another and the code above didn't find it correctly
        match = 1491;
    } else if (index === 1346) {
        // dunno what changed with this platform
        match = 1498;
    } else if (index === 1357) {
        // fence post made taller
        match = 1509;
    } else if (index === 1401) {
        // dunno what changed with this arch
        match = 1553;
    } else if (index === 1539) {
        // dunno what changed with this tree
        match = 1710;
    } else if (index === 1575) {
        // color and base on totem
        match = 1759;
    } else if (index === 1585) {
        // dunno what changed with this rock
        match = 1773;
    } else if (index === 1606) {
        // dunno what changed with this rock
        match = 1805;
    } else if (index === 1667) {
        // dunno what changed with this figurehead
        match = 1880;
    } else if (index === 1688) {
        // dunno what changed with this object
        match = 1909;
    } else if (index === 1926) {
        // shading
        match = 2151;
    } else if (index === 1929) {
        // shading
        match = 2154;
    } else if (index === 1930) {
        // shading
        match = 2155;
    } else if (index === 1931) {
        // shading
        match = 2156;
    } else if (index === 1933) {
        // shading
        match = 2158;
    } else if (index === 1934) {
        // shading
        match = 2160;
    } else if (index === 1980) {
        // dunno what changed with this support
        match = 2208;
    } else if (index === 1981) {
        // dunno what changed with this support
        match = 2209;
    } else if (index === 1992) {
        // base changed
        match = 2232;
    } else if (index === 2014) {
        // dunno what changed with this fire
        match = 2260;
    } else if (index === 2066) {
        // new pot
        match = 2345;
    } else if (index === 2068) {
        // dunno what changed with this cup
        match = 2347;
    } else if (index === 2080) {
        // dragon kiteshield (left) recolored
        match = 2359;
    } else if (index === 2081) {
        // dragon kiteshield (right) recolored
        match = 2360;
    } else if (index === 2092) {
        // dunno what changed with this object
        match = 2371;
    } else if (index === 2093) {
        // shading/teeth changed on key
        match = 2372;
    } else if (index === 2108) {
        // skull mask changed
        match = 2388;
    } else if (index === 2111) {
        // recolored symbol
        match = 2392;
    } else if (index === 2119) {
        // necklace changed
        match = 2400;
    } else if (index === 2125) {
        // pot changed
        match = 2406;
    } else if (index === 2128) {
        // bread changed
        match = 2409;
    } else if (index === 2143) {
        // texture on spice top changed
        match = 2431;
    } else if (index === 2150) {
        // h'ween mask changed
        match = 2438;
    } else if (index === 2153) {
        // plague mask texture removed
        match = 2442;
    } else if (index === 2157) {
        // dunno what changed with this symbol
        match = 2449;
    } else if (index === 2175) {
        // shading changed on cup
        match = 2468;
    } else if (index === 2177) {
        // shading changed on glass
        match = 2470;
    } else if (index === 2204) {
        // necklace made less bulky
        match = 2506;
    } else if (index === 2212) {
        // necklace made less bulky
        match = 2515;
    } else if (index === 2221) {
        // icing on cake
        match = 2524;
    } else if (index === 2225) {
        // icing on cake
        match = 2531;
    } else if (index === 2226) {
        // liquid now in glass, not part of glass
        match = 2532;
    } else if (index === 2228) {
        // icing on cake
        match = 2535;
    } else if (index === 2260) {
        // dunno what changed with iban's staff
        match = 2569;
    } else if (index === 2266) {
        // second flame on candle
        match = 2575;
    } else if (index === 2267) {
        // necklace made less bulky
        match = 2576;
    } else if (index === 2276) {
        // dunno what changed with this object
        match = 2585;
    } else if (index === 2277) {
        // dunno what changed with this gem
        match = 2586;
    } else if (index === 2278) {
        // dunno what changed with this object
        match = 2587;
    } else if (index === 2279) {
        // dunno what changed with this mask
        match = 2588;
    } else if (index === 2283) {
        // apron changed
        match = 2592;
    } else if (index === 2293) {
        // ridges on cape added
        match = 2603;
    } else if (index === 2308) {
        // dragon kiteshield (?) recolored
        match = 2618;
    } else if (index === 2312) {
        // dunno what changed with chalice
        match = 2623;
    } else if (index === 2317) {
        // recolor stone
        match = 2627;
    } else if (index === 2318) {
        // recolor plant
        match = 2628;
    } else if (index === 2320) {
        // flip trowel
        match = 2630;
    } else if (index === 2323) {
        // partyhat changed
        match = 2635;
    } else if (index === 2325) {
        // christmas cracker changed
        match = 2637;
    } else if (index === 2327) {
        // glass with drink inside changed
        match = 2639;
    } else if (index === 2343) {
        // dunno what changed with glass
        match = 2655;
    } else if (index === 2349) {
        // glass with drink inside changed
        match = 2661;
    } else if (index === 2354) {
        // recolored coins
        match = 2667;
    } else if (index === 2363) {
        // dunno what changed with broken glass
        match = 2676;
    } else if (index === 2369) {
        // recolored boot
        match = 2683;
    } else if (index === 2384) {
        // dunno what changed with display
        match = 2698;
    } else if (index === 2385) {
        // dunno what changed with waterski
        match = 2699;
    } else if (index === 2396) {
        // beads on necklace changed
        match = 2713;
    } else if (index === 2406) {
        // pattern on disc, flattened model
        match = 2724;
    } else if (index === 2419) {
        // less liquid in glass
        match = 2738;
    } else if (index === 2427) {
        // dunno what changed with object
        match = 2746;
    } else if (index === 2439) {
        // stretched model
        match = 2759;
    } else if (index === 2440) {
        // fixed extra meat vertices
        match = 2760;
    } else if (index === 2443) {
        // poison tip
        match = 2763;
    } else if (index === 2451) {
        // recolor shaker
        match = 2771;
    } else if (index === 2467) {
        // staff of saradomin staff changed
        match = 2790;
    } else if (index === 2472) {
        // necklace made less bulky
        match = 2796;
    } else if (index === 2477) {
        // handle on dragon battleaxe changed
        match = 2801;
    } else if (index === 2508) {
        // recolored dragon long
        match = 2834;
    } else if (index === 2510) {
        // recolored boots
        match = 2837;
    } else if (index === 2512) {
        // recolored dragon sq. shield
        match = 2840;
    } else if (index === 2568) {
        // dunno what changed on legs
        match = 2914;
    } else if (index === 2641) {
        // changed hellhound
        match = 2997;
    } else if (index === 2671) {
        // changed back of map
        match = 3044;
    } else if (index === 2672) {
        // changed map
        match = 3048;
    } else if (index === 2760) {
        // trap without spikes
        match = 684;
    }

    matched[index] = match;
});
fs.writeFileSync('dump/match.json', JSON.stringify(matched, null, 2));

matched.map((match, index) => {
    if (match !== -1) {
        return;
    }

    const { obj, mtl } = models194.getModel(index).toObj(index);
    fs.writeFileSync('dump/compare194/' + index + '.obj', obj);
    fs.writeFileSync('dump/compare194/' + index + '.mtl', mtl);
});

models204.metadata.map((model, index) => {
    const { obj, mtl } = models204.getModel(index).toObj(index);
    fs.writeFileSync('dump/models/' + index + '.obj', obj);
    fs.writeFileSync('dump/models/' + index + '.mtl', mtl);
    if (matched.indexOf(index) !== -1) {
        return;
    }

    fs.writeFileSync('dump/compare204/' + index + '.obj', obj);
    fs.writeFileSync('dump/compare204/' + index + '.mtl', mtl);
});

// let files = fs.readdirSync(`data/src/locs`);
// let objects = [];
// for (let i = 0; i < files.length; ++i) {
//     let file = JSON.parse(fs.readFileSync(`data/src/locs/` + files[i]));
//     objects[file.id] = file;
//     objects[file.id].internal_name = files[i].replace('.json', '');
// }

// let matches = [];
// objects.map(object => {
//     if (!object.modelIndices) {
//         return;
//     }

//     object.modelIndices.map(model => {
//         if (object.name && object.name !== object.name.toLowerCase() && object.modelIndices) {
//             return;
//         }

//         if (typeof reordered[model] === 'undefined') {
//             // console.log('object', object.id, object.internal_name, 'no match for model', model);
//             return;
//         }

//         let name = object.internal_name;
//         delete object.description;
//         delete object.name;
//         delete object.id;
//         delete object.internal_name;
//         delete object.modelIndices;
//         matches.push({ name, object, checksum: ByteBuffer.crc32(JSON.stringify(object)) });
//         // fs.appendFileSync('dump/log.txt', 'object ' + object.id + ' ' + object.internal_name + ' "' + object.name + '" matched ' + model + ' to ' + reordered[model] + '\n');
//     });
// });

// let files_compare = fs.readdirSync(`${process.env.ASSET_DIR}/locs`);
// let objects_compare = [];
// for (let i = 0; i < files_compare.length; ++i) {
//     let file = JSON.parse(fs.readFileSync(`${process.env.ASSET_DIR}/locs/` + files_compare[i]));
//     if (!file.modelIndices) {
//         continue;
//     }

//     delete file.description;
//     delete file.name;
//     delete file.id;
//     delete file.internal_name;
//     delete file.modelIndices;
//     objects_compare.push({
//         name: files_compare[i].replace('.json', ''),
//         object: file,
//         checksum: ByteBuffer.crc32(JSON.stringify(file))
//     });
// }

// objects_compare.map(object => {
//     let match = matches.findIndex(x => x.checksum === object.checksum);
//     if (match !== -1) {
//         fs.renameSync(`${process.env.ASSET_DIR}/locs/` + object.name + '.json', `${process.env.ASSET_DIR}/locs/` + matches[match].name + '.json');
//         console.log(object.name);
//     }
// });
