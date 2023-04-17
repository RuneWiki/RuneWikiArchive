let x = 3213;
let z = 3424;
let plane = 0;

console.log(`${plane}_${x >> 6}_${z >> 6}_${x - ((x >> 6) << 6)}_${z - ((z >> 6) << 6)}`);
