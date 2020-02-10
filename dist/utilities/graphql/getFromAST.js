import { __spreadArrays } from 'tslib';
import { invariant, InvariantError } from 'ts-invariant';
import { assign } from '../common/assign.js';
import { valueToObjectRepresentation } from './storeUtils.js';

function checkDocument(doc) {
    process.env.NODE_ENV === "production" ? invariant(doc && doc.kind === 'Document', 18) : invariant(doc && doc.kind === 'Document', "Expecting a parsed GraphQL document. Perhaps you need to wrap the query string in a \"gql\" tag? http://docs.apollostack.com/apollo-client/core.html#gql");
    var operations = doc.definitions
        .filter(function (d) { return d.kind !== 'FragmentDefinition'; })
        .map(function (definition) {
        if (definition.kind !== 'OperationDefinition') {
            throw process.env.NODE_ENV === "production" ? new InvariantError(19) : new InvariantError("Schema type definitions not allowed in queries. Found: \"" + definition.kind + "\"");
        }
        return definition;
    });
    process.env.NODE_ENV === "production" ? invariant(operations.length <= 1, 20) : invariant(operations.length <= 1, "Ambiguous GraphQL document: contains " + operations.length + " operations");
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
    process.env.NODE_ENV === "production" ? invariant(queryDef && queryDef.operation === 'query', 21) : invariant(queryDef && queryDef.operation === 'query', 'Must contain a query definition.');
    return queryDef;
}
function getFragmentDefinition(doc) {
    process.env.NODE_ENV === "production" ? invariant(doc.kind === 'Document', 22) : invariant(doc.kind === 'Document', "Expecting a parsed GraphQL document. Perhaps you need to wrap the query string in a \"gql\" tag? http://docs.apollostack.com/apollo-client/core.html#gql");
    process.env.NODE_ENV === "production" ? invariant(doc.definitions.length <= 1, 23) : invariant(doc.definitions.length <= 1, 'Fragment must have exactly one definition.');
    var fragmentDef = doc.definitions[0];
    process.env.NODE_ENV === "production" ? invariant(fragmentDef.kind === 'FragmentDefinition', 24) : invariant(fragmentDef.kind === 'FragmentDefinition', 'Must be a fragment definition.');
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
    throw process.env.NODE_ENV === "production" ? new InvariantError(25) : new InvariantError('Expected a parsed GraphQL query with a query, mutation, subscription, or a fragment.');
}
function getDefaultValues(definition) {
    if (definition &&
        definition.variableDefinitions &&
        definition.variableDefinitions.length) {
        var defaultValues = definition.variableDefinitions
            .filter(function (_a) {
            var defaultValue = _a.defaultValue;
            return defaultValue;
        })
            .map(function (_a) {
            var variable = _a.variable, defaultValue = _a.defaultValue;
            var defaultValueObj = {};
            valueToObjectRepresentation(defaultValueObj, variable.name, defaultValue);
            return defaultValueObj;
        });
        return assign.apply(void 0, __spreadArrays([{}], defaultValues));
    }
    return {};
}

export { checkDocument, getDefaultValues, getFragmentDefinition, getFragmentDefinitions, getMainDefinition, getOperationDefinition, getOperationName, getQueryDefinition };
//# sourceMappingURL=getFromAST.js.map
