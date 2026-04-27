const yahooFinance = require('yahoo-finance2').default;
console.log('Type of default:', typeof yahooFinance);
try {
    const instance = new yahooFinance();
    console.log('Instance created successfully');
} catch (e) {
    console.log('Error creating instance:', e.message);
}
