var allExports = require('../apollo-client.cjs');
var names = new Set(["ApolloCache","Cache","isReference","makeReference","InMemoryCache","defaultDataIdFromObject"]);
Object.keys(allExports).forEach(function (name) {
  if (names.has(name)) {
    exports[name] = allExports[name];
  }
});
