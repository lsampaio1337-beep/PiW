function testFormula(speed) {
    let searchDelay = 5.0 - ((speed - 15) / 150) * 4.5;
    searchDelay = Math.max(0.5, Math.min(5.0, searchDelay)); // clamp 0.5 to 5.0
    return searchDelay;
}
console.log("Speed 10:", testFormula(10));
console.log("Speed 15:", testFormula(15));
console.log("Speed 100:", testFormula(100));
console.log("Speed 150:", testFormula(150));
console.log("Speed 165:", testFormula(165));
console.log("Speed 200:", testFormula(200));
