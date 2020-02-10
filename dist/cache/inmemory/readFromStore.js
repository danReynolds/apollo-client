import { __assign } from 'tslib';
import { InvariantError, invariant } from 'ts-invariant';
import { createFragmentMap } from '../../utilities/graphql/fragments.js';
import { isReference, makeReference, isField, resultKeyNameFromField, isInlineFragment } from '../../utilities/graphql/storeUtils.js';
import { getMainDefinition, getDefaultValues, getQueryDefinition, getFragmentDefinitions } from '../../utilities/graphql/getFromAST.js';
import { shouldInclude } from '../../utilities/graphql/directives.js';
import { addTypenameToDocument } from '../../utilities/graphql/transform.js';
import { mergeDeepArray } from '../../utilities/common/mergeDeep.js';
import { wrap } from 'optimism';
import { maybeDeepFreeze } from '../../utilities/common/maybeDeepFreeze.js';
import { getTypenameFromStoreObject } from './helpers.js';
import { supportsResultCaching } from './entityStore.js';

var StoreReader = (function () {
    function StoreReader(config) {
        var _this = this;
        this.config = config;
        this.config = __assign({ addTypename: true }, config);
        var _a = this, executeSelectionSet = _a.executeSelectionSet, executeSubSelectedArray = _a.executeSubSelectedArray;
        this.executeSelectionSet = wrap(function (options) {
            return executeSelectionSet.call(_this, options);
        }, {
            makeCacheKey: function (_a) {
                var selectionSet = _a.selectionSet, objectOrReference = _a.objectOrReference, context = _a.context;
                if (supportsResultCaching(context.store)) {
                    return context.store.makeCacheKey(selectionSet, JSON.stringify(context.variables), isReference(objectOrReference)
                        ? objectOrReference.__ref
                        : objectOrReference);
                }
            }
        });
        this.executeSubSelectedArray = wrap(function (options) {
            return executeSubSelectedArray.call(_this, options);
        }, {
            makeCacheKey: function (_a) {
                var field = _a.field, array = _a.array, context = _a.context;
                if (supportsResultCaching(context.store)) {
                    return context.store.makeCacheKey(field, array, JSON.stringify(context.variables));
                }
            }
        });
    }
    StoreReader.prototype.readQueryFromStore = function (options) {
        return this.diffQueryAgainstStore(__assign(__assign({}, options), { returnPartialData: false })).result;
    };
    StoreReader.prototype.diffQueryAgainstStore = function (_a) {
        var store = _a.store, query = _a.query, variables = _a.variables, _b = _a.returnPartialData, returnPartialData = _b === void 0 ? true : _b, _c = _a.rootId, rootId = _c === void 0 ? 'ROOT_QUERY' : _c, config = _a.config;
        var policies = this.config.policies;
        var execResult = this.executeSelectionSet({
            selectionSet: getMainDefinition(query).selectionSet,
            objectOrReference: makeReference(rootId),
            context: {
                store: store,
                query: query,
                policies: policies,
                variables: __assign(__assign({}, getDefaultValues(getQueryDefinition(query))), variables),
                fragmentMap: createFragmentMap(getFragmentDefinitions(query)),
            },
        });
        var hasMissingFields = execResult.missing && execResult.missing.length > 0;
        if (hasMissingFields && !returnPartialData) {
            throw execResult.missing[0];
        }
        return {
            result: execResult.result,
            complete: !hasMissingFields,
        };
    };
    StoreReader.prototype.executeSelectionSet = function (_a) {
        var _this = this;
        var selectionSet = _a.selectionSet, objectOrReference = _a.objectOrReference, context = _a.context;
        if (isReference(objectOrReference) &&
            !context.policies.rootTypenamesById[objectOrReference.__ref] &&
            !context.store.has(objectOrReference.__ref)) {
            return {
                result: {},
                missing: [process.env.NODE_ENV === "production" ? new InvariantError(52) : new InvariantError("Dangling reference to missing " + objectOrReference.__ref + " object")],
            };
        }
        var fragmentMap = context.fragmentMap, variables = context.variables, policies = context.policies, store = context.store;
        var objectsToMerge = [];
        var finalResult = { result: null };
        var typename = store.getFieldValue(objectOrReference, "__typename");
        if (this.config.addTypename &&
            typeof typename === "string" &&
            Object.values(policies.rootTypenamesById).indexOf(typename) < 0) {
            objectsToMerge.push({ __typename: typename });
        }
        function getMissing() {
            return finalResult.missing || (finalResult.missing = []);
        }
        function handleMissing(result) {
            var _a;
            if (result.missing)
                (_a = getMissing()).push.apply(_a, result.missing);
            return result.result;
        }
        selectionSet.selections.forEach(function (selection) {
            var _a;
            if (!shouldInclude(selection, variables))
                return;
            if (isField(selection)) {
                var fieldValue = policies.readField(objectOrReference, selection, store.getFieldValue, variables, typename);
                if (fieldValue === void 0) {
                    if (!addTypenameToDocument.added(selection)) {
                        getMissing().push(process.env.NODE_ENV === "production" ? new InvariantError(53) : new InvariantError("Can't find field " + selection.name.value + " on " + (isReference(objectOrReference)
                            ? objectOrReference.__ref + " object"
                            : "object " + JSON.stringify(objectOrReference, null, 2))));
                    }
                }
                else if (Array.isArray(fieldValue)) {
                    fieldValue = handleMissing(_this.executeSubSelectedArray({
                        field: selection,
                        array: fieldValue,
                        context: context,
                    }));
                }
                else if (!selection.selectionSet) {
                    if (process.env.NODE_ENV !== 'production') {
                        assertSelectionSetForIdValue(context.store, selection, fieldValue);
                        maybeDeepFreeze(fieldValue);
                    }
                }
                else if (fieldValue != null) {
                    fieldValue = handleMissing(_this.executeSelectionSet({
                        selectionSet: selection.selectionSet,
                        objectOrReference: fieldValue,
                        context: context,
                    }));
                }
                if (fieldValue !== void 0) {
                    objectsToMerge.push((_a = {},
                        _a[resultKeyNameFromField(selection)] = fieldValue,
                        _a));
                }
            }
            else {
                var fragment = void 0;
                if (isInlineFragment(selection)) {
                    fragment = selection;
                }
                else {
                    process.env.NODE_ENV === "production" ? invariant(fragment = fragmentMap[selection.name.value], 54) : invariant(fragment = fragmentMap[selection.name.value], "No fragment named " + selection.name.value);
                }
                if (policies.fragmentMatches(fragment, typename)) {
                    objectsToMerge.push(handleMissing(_this.executeSelectionSet({
                        selectionSet: fragment.selectionSet,
                        objectOrReference: objectOrReference,
                        context: context,
                    })));
                }
            }
        });
        finalResult.result = mergeDeepArray(objectsToMerge);
        if (process.env.NODE_ENV !== 'production') {
            Object.freeze(finalResult.result);
        }
        return finalResult;
    };
    StoreReader.prototype.executeSubSelectedArray = function (_a) {
        var _this = this;
        var field = _a.field, array = _a.array, context = _a.context;
        var missing;
        function handleMissing(childResult) {
            if (childResult.missing) {
                missing = missing || [];
                missing.push.apply(missing, childResult.missing);
            }
            return childResult.result;
        }
        array = array.map(function (item) {
            if (item === null) {
                return null;
            }
            if (Array.isArray(item)) {
                return handleMissing(_this.executeSubSelectedArray({
                    field: field,
                    array: item,
                    context: context,
                }));
            }
            if (field.selectionSet) {
                return handleMissing(_this.executeSelectionSet({
                    selectionSet: field.selectionSet,
                    objectOrReference: item,
                    context: context,
                }));
            }
            if (process.env.NODE_ENV !== 'production') {
                assertSelectionSetForIdValue(context.store, field, item);
            }
            return item;
        });
        if (process.env.NODE_ENV !== 'production') {
            Object.freeze(array);
        }
        return { result: array, missing: missing };
    };
    return StoreReader;
}());
function assertSelectionSetForIdValue(store, field, fieldValue) {
    if (!field.selectionSet) {
        var workSet_1 = new Set([fieldValue]);
        workSet_1.forEach(function (value) {
            if (value && typeof value === "object") {
                process.env.NODE_ENV === "production" ? invariant(!isReference(value), 55) : invariant(!isReference(value), "Missing selection set for object of type " + getTypenameFromStoreObject(store, value) + " returned for query field " + field.name.value);
                Object.values(value).forEach(workSet_1.add, workSet_1);
            }
        });
    }
}

export { StoreReader };
//# sourceMappingURL=readFromStore.js.map
