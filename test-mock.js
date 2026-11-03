const jest = require('jest-mock');
const obj = { random: () => 0.999 };
const spy = jest.spyOn(obj, 'random').mockImplementationOnce(() => 0.5);
console.log(obj.random()); // should be 0.5
console.log(obj.random()); // should be 0.999
