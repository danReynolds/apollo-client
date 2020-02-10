function queryFromPojo(obj) {
    return {
        kind: 'Document',
        definitions: [{
                kind: 'OperationDefinition',
                operation: 'query',
                name: {
                    kind: 'Name',
                    value: 'GeneratedClientQuery',
                },
                selectionSet: selectionSetFromObj(obj),
            }],
    };
}
function fragmentFromPojo(obj, typename) {
    return {
        kind: 'Document',
        definitions: [{
                kind: 'FragmentDefinition',
                typeCondition: {
                    kind: 'NamedType',
                    name: {
                        kind: 'Name',
                        value: typename || '__FakeType',
                    },
                },
                name: {
                    kind: 'Name',
                    value: 'GeneratedClientQuery',
                },
                selectionSet: selectionSetFromObj(obj),
            }],
    };
}
function selectionSetFromObj(obj) {
    if (!obj || Object(obj) !== obj) {
        return null;
    }
    if (Array.isArray(obj)) {
        return selectionSetFromObj(obj[0]);
    }
    return {
        kind: 'SelectionSet',
        selections: Object.keys(obj).map(function (key) { return ({
            kind: 'Field',
            name: {
                kind: 'Name',
                value: key,
            },
            selectionSet: selectionSetFromObj(obj[key]) || void 0,
        }); }),
    };
}

export { fragmentFromPojo, queryFromPojo };
//# sourceMappingURL=utils.js.map
