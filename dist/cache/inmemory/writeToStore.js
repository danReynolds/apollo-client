import { __assign } from 'tslib';
import { invariant } from 'ts-invariant';
import { createFragmentMap, getFragmentFromSelection } from '../../utilities/graphql/fragments.js';
import { getTypenameFromResult, makeReference, isField, resultKeyNameFromField } from '../../utilities/graphql/storeUtils.js';
import { getOperationDefinition, getDefaultValues, getFragmentDefinitions } from '../../utilities/graphql/getFromAST.js';
import { shouldInclude } from '../../utilities/graphql/directives.js';
import { cloneDeep } from '../../utilities/common/cloneDeep.js';
import { makeProcessedFieldsMerger } from './helpers.js';
import { defaultNormalizedCacheFactory } from './entityStore.js';

var StoreWriter = (function () {
    function StoreWriter(config) {
        this.policies = config.policies;
    }
    StoreWriter.prototype.writeQueryToStore = function (_a) {
        var query = _a.query, result = _a.result, _b = _a.dataId, dataId = _b === void 0 ? 'ROOT_QUERY' : _b, _c = _a.store, store = _c === void 0 ? defaultNormalizedCacheFactory() : _c, variables = _a.variables;
        var operationDefinition = getOperationDefinition(query);
        store.retain(dataId);
        var merger = makeProcessedFieldsMerger();
        return this.writeSelectionSetToStore({
            result: result || Object.create(null),
            dataId: dataId,
            selectionSet: operationDefinition.selectionSet,
            context: {
                store: store,
                written: Object.create(null),
                merge: function (existing, incoming) {
                    return merger.merge(existing, incoming);
                },
                variables: __assign(__assign({}, getDefaultValues(operationDefinition)), variables),
                fragmentMap: createFragmentMap(getFragmentDefinitions(query)),
            },
        });
    };
    StoreWriter.prototype.writeSelectionSetToStore = function (_a) {
        var dataId = _a.dataId, result = _a.result, selectionSet = _a.selectionSet, context = _a.context;
        var policies = this.policies;
        var store = context.store, written = context.written;
        var sets = written[dataId] || (written[dataId] = []);
        if (sets.indexOf(selectionSet) >= 0)
            return store;
        sets.push(selectionSet);
        var typename = getTypenameFromResult(result, selectionSet, context.fragmentMap) ||
            store.get(dataId, "__typename");
        store.merge(dataId, policies.applyMerges(makeReference(dataId), this.processSelectionSet({
            result: result,
            selectionSet: selectionSet,
            context: context,
            typename: typename,
        }), store.getFieldValue, context.variables));
        return store;
    };
    StoreWriter.prototype.processSelectionSet = function (_a) {
        var _this = this;
        var result = _a.result, selectionSet = _a.selectionSet, context = _a.context, typename = _a.typename;
        var mergedFields = Object.create(null);
        if (typeof typename === "string") {
            mergedFields.__typename = typename;
        }
        selectionSet.selections.forEach(function (selection) {
            var _a;
            if (!shouldInclude(selection, context.variables)) {
                return;
            }
            var policies = _this.policies;
            if (isField(selection)) {
                var resultFieldKey = resultKeyNameFromField(selection);
                var value = result[resultFieldKey];
                if (typeof value !== 'undefined') {
                    var storeFieldName = policies.getStoreFieldName(typename, selection, context.variables);
                    var incomingValue = _this.processFieldValue(value, selection, context);
                    mergedFields = context.merge(mergedFields, (_a = {},
                        _a[storeFieldName] = policies.hasMergeFunction(typename, selection.name.value) ? {
                            __field: selection,
                            __typename: typename,
                            __value: incomingValue,
                        } : incomingValue,
                        _a));
                }
                else if (policies.usingPossibleTypes &&
                    !(selection.directives &&
                        selection.directives.some(function (_a) {
                            var name = _a.name;
                            return name && (name.value === 'defer' || name.value === 'client');
                        }))) {
                    process.env.NODE_ENV === "production" || invariant.warn("Missing field " + resultFieldKey + " in " + JSON.stringify(result, null, 2).substring(0, 100));
                }
            }
            else {
                var fragment = getFragmentFromSelection(selection, context.fragmentMap);
                if (policies.fragmentMatches(fragment, typename)) {
                    mergedFields = context.merge(mergedFields, _this.processSelectionSet({
                        result: result,
                        selectionSet: fragment.selectionSet,
                        context: context,
                        typename: typename,
                    }));
                }
            }
        });
        return mergedFields;
    };
    StoreWriter.prototype.processFieldValue = function (value, field, context) {
        var _this = this;
        if (!field.selectionSet || value === null) {
            return process.env.NODE_ENV === 'production' ? value : cloneDeep(value);
        }
        if (Array.isArray(value)) {
            return value.map(function (item, i) { return _this.processFieldValue(item, field, context); });
        }
        if (value) {
            var dataId = this.policies.identify(value, field.selectionSet, context.fragmentMap);
            if (typeof dataId === 'string') {
                this.writeSelectionSetToStore({
                    dataId: dataId,
                    result: value,
                    selectionSet: field.selectionSet,
                    context: context,
                });
                return makeReference(dataId);
            }
        }
        return this.processSelectionSet({
            result: value,
            selectionSet: field.selectionSet,
            context: context,
            typename: getTypenameFromResult(value, field.selectionSet, context.fragmentMap),
        });
    };
    return StoreWriter;
}());

export { StoreWriter };
//# sourceMappingURL=writeToStore.js.map
