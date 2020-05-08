import { invariant, InvariantError } from 'ts-invariant';
import { valueToObjectRepresentation } from './storeUtils.js';

function checkDocument(doc) {
    process.env.NODE_ENV === "production" ? process.env.NODE_ENV === "production" ? invariant(doc && doc.kind === 'Document', 59) : invariant(doc && doc.kind === 'Document', 16) : process.env.NODE_ENV === "production" ? invariant(doc && doc.kind === 'Document', 60) : invariant(doc && doc.kind === 'Document', "Expecting a parsed GraphQL document. Perhaps you need to wrap the query string in a \"gql\" tag? http://docs.apollostack.com/apollo-client/core.html#gql");
    var operations = doc.definitions
        .filter(function (d) { return d.kind !== 'FragmentDefinition'; })
        .map(function (definition) {
        if (definition.kind !== 'OperationDefinition') {
            throw process.env.NODE_ENV === "production" ? process.env.NODE_ENV === "production" ? new InvariantError(61) : new InvariantError(17) : process.env.NODE_ENV === "production" ? new InvariantError(62) : new InvariantError("Schema type definitions not allowed in queries. Found: \"" + definition.kind + "\"");
        }
        return definition;
    });
    process.env.NODE_ENV === "production" ? process.env.NODE_ENV === "production" ? invariant(operations.length <= 1, 63) : invariant(operations.length <= 1, 18) : process.env.NODE_ENV === "production" ? invariant(operations.length <= 1, 64) : invariant(operations.length <= 1, "Ambiguous GraphQL document: contains " + operations.length + " operations");
    return doc;
}
function getOperationDefinition(doc) {
    checkDocument(doc);
    return doc.definitions.filter(function (definition) { return definition.kind === 'OperationDefinition'; })[0];
}
function getOperationName(doc) {
    return (doc.definitions
        .filter(function (definition) {
        return definition.kind === 'OperationDefinition' && definition.name;
    })
        .map(function (x) { return x.name.value; })[0] || null);
}
function getFragmentDefinitions(doc) {
    return doc.definitions.filter(function (definition) { return definition.kind === 'FragmentDefinition'; });
}
function getQueryDefinition(doc) {
    var queryDef = getOperationDefinition(doc);
    process.env.NODE_ENV === "production" ? process.env.NODE_ENV === "production" ? invariant(queryDef && queryDef.operation === 'query', 65) : invariant(queryDef && queryDef.operation === 'query', 19) : process.env.NODE_ENV === "production" ? invariant(queryDef && queryDef.operation === 'query', 66) : invariant(queryDef && queryDef.operation === 'query', 'Must contain a query definition.');
    return queryDef;
}
function getFragmentDefinition(doc) {
    process.env.NODE_ENV === "production" ? process.env.NODE_ENV === "production" ? invariant(doc.kind === 'Document', 67) : invariant(doc.kind === 'Document', 20) : process.env.NODE_ENV === "production" ? invariant(doc.kind === 'Document', 68) : invariant(doc.kind === 'Document', "Expecting a parsed GraphQL document. Perhaps you need to wrap the query string in a \"gql\" tag? http://docs.apollostack.com/apollo-client/core.html#gql");
    process.env.NODE_ENV === "production" ? process.env.NODE_ENV === "production" ? invariant(doc.definitions.length <= 1, 69) : invariant(doc.definitions.length <= 1, 21) : process.env.NODE_ENV === "production" ? invariant(doc.definitions.length <= 1, 70) : invariant(doc.definitions.length <= 1, 'Fragment must have exactly one definition.');
    var fragmentDef = doc.definitions[0];
    process.env.NODE_ENV === "production" ? process.env.NODE_ENV === "production" ? invariant(fragmentDef.kind === 'FragmentDefinition', 71) : invariant(fragmentDef.kind === 'FragmentDefinition', 22) : process.env.NODE_ENV === "production" ? invariant(fragmentDef.kind === 'FragmentDefinition', 72) : invariant(fragmentDef.kind === 'FragmentDefinition', 'Must be a fragment definition.');
    return fragmentDef;
}
function getMainDefinition(queryDoc) {
    checkDocument(queryDoc);
    var fragmentDefinition;
    for (var _i = 0, _a = queryDoc.definitions; _i < _a.length; _i++) {
        var definition = _a[_i];
        if (definition.kind === 'OperationDefinition') {
            var operation = definition.operation;
            if (operation === 'query' ||
                operation === 'mutation' ||
                operation === 'subscription') {
                return definition;
            }
        }
        if (definition.kind === 'FragmentDefinition' && !fragmentDefinition) {
            fragmentDefinition = definition;
        }
    }
    if (fragmentDefinition) {
        return fragmentDefinition;
    }
    throw process.env.NODE_ENV === "production" ? process.env.NODE_ENV === "production" ? new InvariantError(73) : new InvariantError(23) : process.env.NODE_ENV === "production" ? new InvariantError(74) : new InvariantError('Expected a parsed GraphQL query with a query, mutation, subscription, or a fragment.');
}
function getDefaultValues(definition) {
    var defaultValues = Object.create(null);
    var defs = definition && definition.variableDefinitions;
    if (defs && defs.length) {
        defs.forEach(function (def) {
            if (def.defaultValue) {
                valueToObjectRepresentation(defaultValues, def.variable.name, def.defaultValue);
            }
        });
    }
    return defaultValues;
}

export { checkDocument, getDefaultValues, getFragmentDefinition, getFragmentDefinitions, getMainDefinition, getOperationDefinition, getOperationName, getQueryDefinition };
//# sourceMappingURL=getFromAST.js.map
