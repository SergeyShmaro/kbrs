const M = 97;//59;
let A = 2;
let B = 3;
let G = null;

const X = [];
const Y = [];

const checkAAndB = () => {
    //console.log(((4 * Math.pow(A, 3)) + (27 * Math.pow(B, 2))) % M);
    return ((4 * Math.pow(A, 3)) + (27 * Math.pow(B, 2))) % M !== 0;
}

const searchAAndB = () => {
    if (!checkAAndB()) {
        A++;
        searchAAndB();
    }
    if (!checkAAndB()) {
        B++;
        searchAAndB();
    }
}

searchAAndB();

const isFull = n => {
    if (n * 10 === parseInt(n) * 10) {
        return true;
    }
    return false;
}

const makeGroup = () => {
    for (let i = 0; i < M; i++) {
        let right = (Math.pow(i, 3) + A * i + B) % M;
        let iter = 1;
        let left = Math.sqrt(right);
        while (left <= M / 2) {
            if (isFull(left)) {
                X.push(i);
                Y.push(left);
                if (M - left < M) {
                    X.push(i);
                    Y.push((M / 2 - left) + (M / 2));
                }
            } 
            left = Math.sqrt(right + (M * iter));
            iter++;
        }
        // console.log('x = ' + i);
        // //console.log('right = ' + right);
        // console.log('left = ' + left);
    }
}
makeGroup();

const findm = (Xp, Yp, Xq, Yq) => {
    let result;
    if (Xp === Xq && Yp === Yq) {
        result = ((3 * Xp * Xp + A) % M * findBack(2 * Yp)) % M;
    } else {
        result = ((Yp - Yq) % M * findBack(Xp - Xq)) % M;
    }
    if (result < 0) {
        result += M;
    }
    return result;
}

const findBack = n => {
    let result = n;
    for (let i = 0; i < M - 3; i++) {
        result = ((result % M) * (n % M)) % M;
    }
    return result;
}

const addPoints = (Xp, Yp, Xq, Yq) => {
    const m = findm(Xp, Yp, Xq, Yq);
    let result = { };
    if (Xp === Xq && M - Yp === Yq) {
        result.Xr = Infinity;
        result.Yr = Infinity;
    } else if (Xp === Infinity && Xq !== Infinity) {
        result.Xr = Xq;
        result.Yr = Yq;
    } else if (Xp !== Infinity && Xq === Infinity) {
        result.Xr = Xp;
        result.Yr = Yp;
    } else {
        result.Xr = (m * m - Xp - Xq) % M;
        result.Yr = (m * (Xp - result.Xr) - Yp) % M;
    }
    if (result.Xr < 0) {
        result.Xr += M;
    }
    if (result.Yr < 0) {
        result.Yr += M;
    }
    return result;
}

const checkSize = n => {
    let result = 0;
    let x = n;
    while (x >= 1) {
        x /= 10;
        result++;
    }
    return result;
}

const chooseG = () => {
    let size = checkSize(X.length);
    console.log(size);
    let index = parseInt(Math.random() * Math.pow(10, size), 10);
    while (index >= X.length) {
        index = parseInt(Math.random() * Math.pow(10, size), 10);
    }
    console.log(index);
    G = {
        x: X[index],
        y: Y[index]
    }
}

const multPoint = (x, y, n) => {
    let curX = x;
    let curY = y;
    let res = { 
        Xr: x,
        Yr: y
    };
    // let retry = [ 
    //     {
    //         Xr: x,
    //         Yr: y
    //     }
    // ];
    for (let i = 0; i < n - 1; i++) {
        res = addPoints(curX, curY, x, y);
        curX = res.Xr;
        curY = res.Yr;
    }
    return res;
}

const generateKey = () => {
    const size = checkSize(M);
    let res = {
        Xr: -1,
        Yr: -1
    };
    while (res.Xr === Infinity || res.Xr === -1 || (X.indexOf(res.Xr) !== -1 && Y[X.indexOf(res.Xr)] === res.Yr)) {
        let n = parseInt(Math.random() * Math.pow(10, size), 10);
        while (n >= M) {
            n = parseInt(Math.random() * Math.pow(10, size), 10);            
        }
        res = multPoint(G.x, G.y, n);
        res.n = n;
    }

    return res;
}
chooseG();
console.log(/*'G = ' + */G);
const Pa = generateKey();
const Pb = generateKey();
console.log(/*'Pa = ' + */Pa);
console.log(/*'Pb = ' + */Pb);
console.log(multPoint(Pa.Xr, Pa.Yr, Pb.n));
console.log(multPoint(Pb.Xr, Pb.Yr, Pa.n));


//console.log(findBack(4));

// const test = [];
// const testing = () => {
//     for (let i = 0; i < M; i++) {
//         test.push((i * i) % M);
//     }
// }
// testing();

// let x= false;
// test.forEach((item, index) => {
//     for (let i = index + 1; i < test.length / 2; i++) {
//         if (test[index] === test[i]) {
//             x = true;
//         }
//     }
// });
// console.log(x);
// console.log(X.join());
// console.log(Y.join());
// console.log(X.length);
// console.log(Y.length);
// console.log(A);
// console.log(B);

// console.log(X[0] + ' ' + Y[0] )
//console.log(M / 2 - (91 - M / 2))
// console.log(multPoint(46,72,65));
// for (let i = 1; i <= 67; i++) {
//     console.log(multPoint(17, 10, i));
// }
// console.log(multPoint(17,10,10));
//80 10 dolzno 0 87 stalo inf inf
// console.log (addPoints(80, 10, 17, 10));