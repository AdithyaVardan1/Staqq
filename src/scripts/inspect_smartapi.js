
const { SmartAPI } = require('smartapi-javascript');

const smartapi = new SmartAPI({
    api_key: 'test'
});

console.log('--- SmartAPI Instance Properties ---');
console.log(Object.getOwnPropertyNames(smartapi));
console.log('--- Prototype Methods ---');
console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(smartapi)));
