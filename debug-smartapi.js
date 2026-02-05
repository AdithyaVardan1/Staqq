const { SmartAPI } = require('smartapi-javascript');
const smartApi = new SmartAPI({ api_key: 'test' });
console.log('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(smartApi)));
console.log('Instance keys:', Object.keys(smartApi));
