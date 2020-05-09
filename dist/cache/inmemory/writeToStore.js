import { __assign } from 'tslib';
import { InvariantError } from 'ts-invariant';
import { createFragmentMap, getFragmentFromSelection } from '../../utilities/graphql/fragments.js';
import { makeReference, getTypenameFromResult, isField, resultKeyNameFromField } from '../../utilities/graphql/storeUtils.js';
import { getOperationDefinition, getDefaultValues, getFragmentDefinitions } from '../../utilities/graphql/getFromAST.js';
import { shouldInclude, hasDirectives } from '../../utilities/graphql/directives.js';
import { cloneDeep } from '../../utilities/common/cloneDeep.js';
import { makeProcessedFieldsMerger } from './helpers.js';
import { EntityStore } from './entityStore.js';

var StoreWriter = (function () {
    function StoreWriter(config) {
        this.policies = config.policies;
    }
    StoreWriter.prototype.writeQueryToStore = function (_a) {
        var query = _a.query, result = _a.result, _b = _a.dataId, dataId = _b === void 0 ? 'ROOT_QUERY' : _b, _c = _a.store, store = _c === void 0 ? new EntityStore.Root({
            policies: this.policies,
        }) : _c, variables = _a.variables;
        var operationDefinition = getOperationDefinition(query);
        store.retain(dataId);
        var merger = makeProcessedFieldsMerger();
        this.processSelectionSet({
            result: result || Object.create(null),
            dataId: dataId,
            selectionSet: operationDefinition.selectionSet,
            typename: this.policies.rootTypenamesById[dataId],
            context: {
                store: store,
                written: Object.create(null),
                merge: function (existing, incoming) {
                    return merger.merge(existing, incoming);
                },
                variables: __assign(__assign({}, getDefaultValues(operationDefinition)), variables),
                fragmentMap: createFragmentMap(getFragmentDefinitions(query)),
                toReference: store.toReference,
                getFieldValue: store.getFieldValue,
            },
        });
        return store;
    };
    StoreWriter.prototype.processSelectionSet = function (_a) {
        var _this = this;
        var dataId = _a.dataId, result = _a.result, selectionSet = _a.selectionSet, context = _a.context, typename = _a.typename, _b = _a.out, out = _b === void 0 ? {
            shouldApplyMerges: false,
        } : _b;
        var policies = this.policies;
        var mergedFields = Object.create(null);
        var _c = policies.identify(result, selectionSet, context.fragmentMap), id = _c[0], keyObject = _c[1];
        dataId = dataId || id;
        if (keyObject) {
            mergedFields = context.merge(mergedFields, keyObject);
        }
        if ("string" === typeof dataId) {
            var sets = context.written[dataId] || (context.written[dataId] = []);
            if (sets.indexOf(selectionSet) >= 0)
                return makeReference(dataId);
            sets.push(selectionSet);
        }
        typename = typename ||
            getTypenameFromResult(result, selectionSet, context.fragmentMap) ||
            (dataId && context.store.get(dataId, "__typename"));
        if ("string" === typeof typename) {
            mergedFields.__typename = typename;
        }
        var workSet = new Set(selectionSet.selections);
        workSet.forEach(function (selection) {
            var _a;
            if (!shouldInclude(selection, context.variables))
                return;
            if (isField(selection)) {
                var resultFieldKey = resultKeyNameFromField(selection);
                var value = result[resultFieldKey];
                if (typeof value !== 'undefined') {
                    var storeFieldName = policies.getStoreFieldName(typename, selection, context.variables);
                    var incomingValue = _this.processFieldValue(value, selection, context, out);
                    if (policies.hasMergeFunction(typename, selection.name.value)) {
                        incomingValue = {
                            __field: selection,
                            __typename: typename,
                            __value: incomingValue,
                        };
                        out.shouldApplyMerges = true;
                    }
                    mergedFields = context.merge(mergedFields, (_a = {},
                        _a[storeFieldName] = incomingValue,
                        _a));
                }
                else if (policies.usingPossibleTypes &&
                    !hasDirectives(["defer", "client"], selection)) {
                    throw process.env.NODE_ENV === "production" ? new InvariantError(47) : new InvariantError("Missing field '" + resultFieldKey + "' in " + JSON.stringify(result, null, 2).substring(0, 100));
                }
            }
            else {
                var fragment = getFragmentFromSelection(selection, context.fragmentMap);
                if (fragment && policies.fragmentMatches(fragment, typename)) {
                    fragment.selectionSet.selections.forEach(workSet.add, workSet);
                }
            }
        });
        if ("string" === typeof dataId) {
            var entityRef = makeReference(dataId);
            if (out.shouldApplyMerges) {
                mergedFields = policies.applyMerges(entityRef, mergedFields, context);
            }
            context.store.merge(dataId, mergedFields);
            return entityRef;
        }
        return mergedFields;
    };
    StoreWriter.prototype.processFieldValue = function (value, field, context, out) {
        var _this = this;
        if (!field.selectionSet || value === null) {
            return process.env.NODE_ENV === 'production' ? value : cloneDeep(value);
        }
        if (Array.isArray(value)) {
            return value.map(function (item, i) { return _this.processFieldValue(item, field, context, out); });
        }
        return this.processSelectionSet({
            result: value,
            selectionSet: field.selectionSet,
            context: context,
            out: out,
        });
    };
    return StoreWriter;
}());

export { StoreWriter };
//# sourceMappingURL=writeToStore.js.map
