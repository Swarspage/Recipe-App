const MongoStore = require('connect-mongo');
console.log('Type of MongoStore:', typeof MongoStore);
console.log('Keys:', Object.keys(MongoStore));
console.log('Is Create Function?', typeof MongoStore.create);
if (MongoStore.default) {
    console.log('Has Default:', typeof MongoStore.default);
    console.log('Default Create:', typeof MongoStore.default.create);
}
