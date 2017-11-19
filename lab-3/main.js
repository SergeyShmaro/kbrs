const sha1 = require('js-sha1'); 

const M = 59;
let A = 0;
let B = 0;
let G = null;

const X = [];
const Y = [];

const checkAAndB = () => {
    return ((4 * Math.pow(A, 3)) + (27 * Math.pow(B, 2))) % M !== 0;
}

const searchAAndB = () => {
    A += parseInt(Math.random() * 10);
    B += parseInt(Math.random() * 10);
    if (!checkAAndB()) {
        searchAAndB();
    }
}

searchAAndB();

const isPrime = n => {
    for (let i = 2; i <= n / 2; i++) {
        if (n % i === 0) {
            return false;
        }
        if (n === 1) {
            return false;
        }
    }
    return true;
}

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
    }
}
makeGroup();

const findm = (Xp, Yp, Xq, Yq) => {
    let result;
    if (Xp === Xq && Yp === Yq) {
        result = ((3 * Xp * Xp + A) % M * findBackModQ(2 * Yp, M)) % M;
    } else {
        result = ((Yp - Yq) % M * findBackModQ(Xp - Xq, M)) % M;
    }
    if (result < 0) {
        result += M;
    }
    return result;
}

const findBackModQ = (n, q) => {
    let result = n;
    for (let i = 0; i < q - 3; i++) {
        result = ((result % q) * (n % q)) % q;
    }
    return result;
}

const powModN = (x, deg, n) => {
    let result = 1;
    for (let i = 0; i < deg; i++) {
        result = ((result % n) * (x % n)) % n; 
    }
    return result;
}

const hex2decModN = (hex, n) => {
    const decNumbers = hex.split('').map(item => parseInt(item, 16));
    const decNumbersVsStepOf16 = decNumbers.map((item, index) => (item % n) * powModN(16, decNumbers.length - index - 1, n));
    return decNumbersVsStepOf16.reduce((a, b) => ((a % n) + (b % n)) % n);
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

const generateRand = (size, lessThan) => {
    let result = parseInt(Math.random() * Math.pow(10, size), 10);
    while (result >= lessThan || result === 0) {
        result = parseInt(Math.random() * Math.pow(10, size), 10);
    }
    return result;
}

const chooseG = () => {
    let size = checkSize(X.length);
    let index = generateRand(size, X.length);
    G = {
        x: X[index],
        y: Y[index]
    }
    if (G.x === 0 && G.y === 0) {
        chooseG();
    }
}

const multPoint = (x, y, n) => {
    let curX = x;
    let curY = y;
    let res = { 
        Xr: x,
        Yr: y
    };
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
        let n = generateRand(size, M);
        res = multPoint(G.x, G.y, n);
        res.n = n;
    }
    return res;
}

const searchExpOfPoint = (x, y) => {
    let result = 1;
    let currentPoint = addPoints(x, y, x, y);
    while ((currentPoint.Xr !== x || currentPoint.Yr !== y) ) 
    {
        result++;
        currentPoint = addPoints(currentPoint.Xr, currentPoint.Yr, x, y);
    }
    return result;
}

const searchQforDSA = (iter = 0) => {
    if (G.x === undefined) {
        chooseG();
    }
    let exp = searchExpOfPoint(G.x, G.y);
    if (isPrime(exp) && exp !== 2 && exp !== 3 && nForDSA % exp !== 0 && Q !== exp) {
        return exp;
    } else if (iter === 5) {
        searchAAndB();
        makeGroup();
        chooseG();
        return searchQforDSA(0);
    } else {
        chooseG();
        return searchQforDSA(iter + 1);
    }
}

const chooseK = q => {
    let result = generateRand(checkSize(q), q);
    while (result === 0 || result === 1) {

        result = generateRand(checkSize(q), q);
    }
    return result;
}

const countR = () => {
    let result = multPoint(G.x, G.y, K);
    let iter = 0;
    while (result.Xr % Q === 0) {
        if (iter === 5) {
            Q = searchQforDSA();
            iter = 0;
        }
        K = chooseK(Q);
        result = multPoint(G.x, G.y, K);
        iter++;
    }
    return result.Xr % Q;
}

const countS = hex => {
    let result = (findBackModQ(K, Q) * (hex2decModN(hex, Q) + (nForDSA * R) % Q)) % Q;
    while (result === 0) {
        K = chooseK(Q);
        R = countR();
        result = (findBackModQ(K, Q) * (hex2decModN(hex, Q) + (nForDSA * R) % Q)) % Q;
    }
    return result;
}

const countW = () => {
    return findBackModQ(S, Q);
}

const countU1 = () => {
    return (hex2decModN(H, Q) * W) % Q;
}

const countU2 = () => {
    return (R * W) % Q;
}

chooseG();
console.log();
console.log('Key change');
console.log(`G = X: ${G.x}; Y: ${G.y}`);
const Pa = generateKey();
const Pb = generateKey();
console.log(`Pa = X: ${Pa.Xr}; Y: ${Pa.Yr}; nA = ${Pa.n}`);
console.log(`Pb = X: ${Pb.Xr}; Y: ${Pb.Yr}; nB = ${Pb.n}`);
const checkPa = multPoint(Pa.Xr, Pa.Yr, Pb.n);
const checkPb = multPoint(Pb.Xr, Pb.Yr, Pa.n);
console.log(`Pa * nB = X: ${checkPa.Xr}; Y: ${checkPa.Yr}`);
console.log(`Pb * nA = X: ${checkPb.Xr}; Y: ${checkPb.Yr}`);

console.log();
console.log("create DSA");
const message = 'hello world';
const H = sha1(message);
const nForDSA = generateRand(checkSize(M), M);
console.log(`nForDSA = ${nForDSA}`);
console.log(`a = ${A}; b = ${B};`)
let Q;
Q = searchQforDSA();
let K = chooseK(Q);
let R = countR();
let S = countS(H);
let PaDSA = multPoint(G.x, G.y, nForDSA);
console.log(`G = X: ${G.x}; Y: ${G.y}`);
console.log(`Pa = X: ${PaDSA.Xr}; Y: ${PaDSA.Yr}`);
console.log(`Q = ${Q}`);
console.log(`K = ${K}`);
console.log(`R = ${R}`);
console.log(`S = ${S}`);
console.log();

console.log("check DSA");
let W = countW();
console.log(`W = ${W}`);
const U1 = countU1();
const U2 = countU2();
console.log(`U1 = ${U1}; U2 = ${U2}`);
const first = multPoint(G.x, G.y, U1);
const second = multPoint(PaDSA.Xr, PaDSA.Yr, U2);
let point = addPoints(first.Xr, first.Yr, second.Xr, second.Yr);
console.log(`U1 * G + U2 * Pa = X: ${point.Xr}; Y: ${point.Yr}`);
console.log(`r* === r : ${point.Xr % Q === R}`);