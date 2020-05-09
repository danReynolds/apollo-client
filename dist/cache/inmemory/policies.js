import { __assign } from 'tslib';
import { invariant, InvariantError } from 'ts-invariant';
import { getFragmentFromSelection } from '../../utilities/graphql/fragments.js';
import { getTypenameFromResult, argumentsObjectFromField, storeKeyNameFromField, getStoreKeyName, isReference, isField } from '../../utilities/graphql/storeUtils.js';
import { canUseWeakMap } from '../../utilities/common/canUse.js';
import { KeyTrie } from 'optimism';
import { fieldNameFromStoreName, isFieldValueToBeMerged } from './helpers.js';

var hasOwn = Object.prototype.hasOwnProperty;
function defaultDataIdFromObject(object) {
    var __typename = object.__typename, id = object.id, _id = object._id;
    if (typeof __typename === "string") {
        if (id !== void 0)
            return __typename + ":" + id;
        if (_id !== void 0)
            return __typename + ":" + _id;
    }
}
var nullKeyFieldsFn = function () { return void 0; };
var simpleKeyArgsFn = function (_args, context) { return context.fieldName; };
var Policies = (function () {
    function Policies(config) {
        if (config === void 0) { config = {}; }
        this.config = config;
        this.typePolicies = Object.create(null);
        this.rootIdsByTypename = Object.create(null);
        this.rootTypenamesById = Object.create(null);
        this.usingPossibleTypes = false;
        this.storageTrie = new KeyTrie(true);
        this.config = __assign({ dataIdFromObject: defaultDataIdFromObject }, config);
        this.setRootTypename("Query");
        this.setRootTypename("Mutation");
        this.setRootTypename("Subscription");
        if (config.possibleTypes) {
            this.addPossibleTypes(config.possibleTypes);
        }
        if (config.typePolicies) {
            this.addTypePolicies(config.typePolicies);
        }
    }
    Policies.prototype.identify = function (object, selectionSet, fragmentMap) {
        var typename = selectionSet && fragmentMap
            ? getTypenameFromResult(object, selectionSet, fragmentMap)
            : object.__typename;
        var context = {
            typename: typename,
            selectionSet: selectionSet,
            fragmentMap: fragmentMap,
            policies: this,
        };
        var id;
        var policy = this.getTypePolicy(typename, false);
        var keyFn = policy && policy.keyFn || this.config.dataIdFromObject;
        while (keyFn) {
            var specifierOrId = keyFn(object, context);
            if (Array.isArray(specifierOrId)) {
                keyFn = keyFieldsFnFromSpecifier(specifierOrId);
            }
            else {
                id = specifierOrId;
                break;
            }
        }
        id = id && String(id);
        return context.keyObject ? [id, context.keyObject] : [id];
    };
    Policies.prototype.addTypePolicies = function (typePolicies) {
        var _this = this;
        Object.keys(typePolicies).forEach(function (typename) {
            var existing = _this.getTypePolicy(typename, true);
            var incoming = typePolicies[typename];
            var keyFields = incoming.keyFields, fields = incoming.fields;
            if (incoming.queryType)
                _this.setRootTypename("Query", typename);
            if (incoming.mutationType)
                _this.setRootTypename("Mutation", typename);
            if (incoming.subscriptionType)
                _this.setRootTypename("Subscription", typename);
            existing.keyFn =
                keyFields === false ? nullKeyFieldsFn :
                    Array.isArray(keyFields) ? keyFieldsFnFromSpecifier(keyFields) :
                        typeof keyFields === "function" ? keyFields : void 0;
            if (fields) {
                Object.keys(fields).forEach(function (fieldName) {
                    var existing = _this.getFieldPolicy(typename, fieldName, true);
                    var incoming = fields[fieldName];
                    if (typeof incoming === "function") {
                        existing.read = incoming;
                    }
                    else {
                        var keyArgs = incoming.keyArgs, read = incoming.read, merge = incoming.merge;
                        existing.keyFn =
                            keyArgs === false ? simpleKeyArgsFn :
                                Array.isArray(keyArgs) ? keyArgsFnFromSpecifier(keyArgs) :
                                    typeof keyArgs === "function" ? keyArgs :
                                        existing.keyFn;
                        if (typeof read === "function")
                            existing.read = read;
                        if (typeof merge === "function")
                            existing.merge = merge;
                    }
                    if (existing.read && existing.merge) {
                        existing.keyFn = existing.keyFn || simpleKeyArgsFn;
                    }
                });
            }
        });
    };
    Policies.prototype.setRootTypename = function (which, typename) {
        if (typename === void 0) { typename = which; }
        var rootId = "ROOT_" + which.toUpperCase();
        var old = this.rootTypenamesById[rootId];
        if (typename !== old) {
            process.env.NODE_ENV === "production" ? invariant(!old || old === which, 34) : invariant(!old || old === which, "Cannot change root " + which + " __typename more than once");
            this.rootIdsByTypename[typename] = rootId;
            this.rootTypenamesById[rootId] = typename;
        }
    };
    Policies.prototype.addPossibleTypes = function (possibleTypes) {
        var _this = this;
        this.usingPossibleTypes = true;
        Object.keys(possibleTypes).forEach(function (supertype) {
            var subtypeSet = _this.getSubtypeSet(supertype, true);
            possibleTypes[supertype].forEach(subtypeSet.add, subtypeSet);
        });
    };
    Policies.prototype.getTypePolicy = function (typename, createIfMissing) {
        if (typename) {
            return this.typePolicies[typename] || (createIfMissing && (this.typePolicies[typename] = Object.create(null)));
        }
    };
    Policies.prototype.getSubtypeSet = function (supertype, createIfMissing) {
        var policy = this.getTypePolicy(supertype, createIfMissing);
        if (policy) {
            return policy.subtypes || (createIfMissing ? policy.subtypes = new Set() : void 0);
        }
    };
    Policies.prototype.getFieldPolicy = function (typename, fieldName, createIfMissing) {
        var typePolicy = this.getTypePolicy(typename, createIfMissing);
        if (typePolicy) {
            var fieldPolicies = typePolicy.fields || (createIfMissing && (typePolicy.fields = Object.create(null)));
            if (fieldPolicies) {
                return fieldPolicies[fieldName] || (createIfMissing && (fieldPolicies[fieldName] = Object.create(null)));
            }
        }
    };
    Policies.prototype.fragmentMatches = function (fragment, typename) {
        var _this = this;
        if (!fragment.typeCondition)
            return true;
        if (!typename)
            return false;
        var supertype = fragment.typeCondition.name.value;
        if (typename === supertype)
            return true;
        if (this.usingPossibleTypes) {
            var workQueue_1 = [this.getSubtypeSet(supertype, false)];
            for (var i = 0; i < workQueue_1.length; ++i) {
                var subtypes = workQueue_1[i];
                if (subtypes) {
                    if (subtypes.has(typename))
                        return true;
                    subtypes.forEach(function (subtype) {
                        var subsubtypes = _this.getSubtypeSet(subtype, false);
                        if (subsubtypes && workQueue_1.indexOf(subsubtypes) < 0) {
                            workQueue_1.push(subsubtypes);
                        }
                    });
                }
            }
        }
        return false;
    };
    Policies.prototype.getStoreFieldName = function (typename, nameOrField, argsOrVars) {
        var field;
        var fieldName;
        if (typeof nameOrField === "string") {
            field = null;
            fieldName = nameOrField;
        }
        else {
            field = nameOrField;
            fieldName = field.name.value;
        }
        var policy = this.getFieldPolicy(typename, fieldName, false);
        var storeFieldName;
        var keyFn = policy && policy.keyFn;
        if (keyFn && typename) {
            var args = field ? argumentsObjectFromField(field, argsOrVars) : argsOrVars;
            var context = { typename: typename, fieldName: fieldName, field: field, policies: this };
            while (keyFn) {
                var specifierOrString = keyFn(args, context);
                if (Array.isArray(specifierOrString)) {
                    keyFn = keyArgsFnFromSpecifier(specifierOrString);
                }
                else {
                    storeFieldName = specifierOrString || fieldName;
                    break;
                }
            }
        }
        if (storeFieldName === void 0) {
            storeFieldName = field
                ? storeKeyNameFromField(field, argsOrVars)
                : getStoreKeyName(fieldName, argsOrVars);
        }
        return fieldName === fieldNameFromStoreName(storeFieldName)
            ? storeFieldName
            : fieldName + ":" + storeFieldName;
    };
    Policies.prototype.readField = function (objectOrReference, nameOrField, context, typename) {
        if (typename === void 0) { typename = context.getFieldValue(objectOrReference, "__typename"); }
        process.env.NODE_ENV === "production" ? invariant(objectOrReference, 35) : invariant(objectOrReference, "Must provide an object or Reference when calling Policies#readField");
        var policies = this;
        var storeFieldName = typeof nameOrField === "string" ? nameOrField
            : policies.getStoreFieldName(typename, nameOrField, context.variables);
        var fieldName = fieldNameFromStoreName(storeFieldName);
        var existing = context.getFieldValue(objectOrReference, storeFieldName);
        var policy = policies.getFieldPolicy(typename, fieldName, false);
        var read = policy && policy.read;
        if (read) {
            var storage = policies.storageTrie.lookup(isReference(objectOrReference)
                ? objectOrReference.__ref
                : objectOrReference, storeFieldName);
            return read(existing, makeFieldFunctionOptions(policies, typename, objectOrReference, nameOrField, storage, context));
        }
        return existing;
    };
    Policies.prototype.hasMergeFunction = function (typename, fieldName) {
        var policy = this.getFieldPolicy(typename, fieldName, false);
        return !!(policy && policy.merge);
    };
    Policies.prototype.applyMerges = function (existing, incoming, context, storageKeys) {
        var policies = this;
        if (isFieldValueToBeMerged(incoming)) {
            var field = incoming.__field;
            var fieldName = field.name.value;
            var merge = policies.getFieldPolicy(incoming.__typename, fieldName, false).merge;
            var storage = storageKeys
                ? policies.storageTrie.lookupArray(storageKeys)
                : null;
            incoming = merge(existing, incoming.__value, makeFieldFunctionOptions(policies, incoming.__typename, null, field, storage, context));
        }
        if (incoming && typeof incoming === "object") {
            if (isReference(incoming)) {
                return incoming;
            }
            if (Array.isArray(incoming)) {
                return incoming.map(function (item) { return policies.applyMerges(void 0, item, context); });
            }
            var e_1 = existing;
            var i_1 = incoming;
            var firstStorageKey_1 = isReference(e_1)
                ? e_1.__ref
                : typeof e_1 === "object" && e_1;
            Object.keys(i_1).forEach(function (storeFieldName) {
                i_1[storeFieldName] = policies.applyMerges(context.getFieldValue(e_1, storeFieldName), i_1[storeFieldName], context, firstStorageKey_1 ? [firstStorageKey_1, storeFieldName] : void 0);
            });
        }
        return incoming;
    };
    return Policies;
}());
function makeFieldFunctionOptions(policies, typename, objectOrReference, nameOrField, storage, context) {
    var toReference = context.toReference, getFieldValue = context.getFieldValue, variables = context.variables;
    var storeFieldName = typeof nameOrField === "string" ? nameOrField :
        policies.getStoreFieldName(typename, nameOrField, variables);
    var fieldName = fieldNameFromStoreName(storeFieldName);
    return {
        args: typeof nameOrField === "string" ? null :
            argumentsObjectFromField(nameOrField, variables),
        field: typeof nameOrField === "string" ? null : nameOrField,
        fieldName: fieldName,
        storeFieldName: storeFieldName,
        variables: variables,
        policies: policies,
        isReference: isReference,
        toReference: toReference,
        storage: storage,
        readField: function (nameOrField, foreignObjOrRef) {
            return policies.readField(foreignObjOrRef || objectOrReference, nameOrField, context);
        },
        mergeObjects: function (existing, incoming) {
            if (Array.isArray(existing) || Array.isArray(incoming)) {
                throw process.env.NODE_ENV === "production" ? new InvariantError(36) : new InvariantError("Cannot automatically merge arrays");
            }
            if (existing && typeof existing === "object" &&
                incoming && typeof incoming === "object") {
                var eType = getFieldValue(existing, "__typename");
                var iType = getFieldValue(incoming, "__typename");
                var typesDiffer = eType && iType && eType !== iType;
                var applied = policies.applyMerges(typesDiffer ? void 0 : existing, incoming, context);
                if (typesDiffer ||
                    !canBeMerged(existing) ||
                    !canBeMerged(applied)) {
                    return applied;
                }
                return __assign(__assign({}, existing), applied);
            }
            return incoming;
        }
    };
}
function canBeMerged(obj) {
    return !!(obj &&
        typeof obj === "object" &&
        !isReference(obj) &&
        !Array.isArray(obj));
}
function keyArgsFnFromSpecifier(specifier) {
    return function (args, context) {
        return args ? context.fieldName + ":" + JSON.stringify(computeKeyObject(args, specifier)) : context.fieldName;
    };
}
function keyFieldsFnFromSpecifier(specifier) {
    var trie = new KeyTrie(canUseWeakMap);
    return function (object, context) {
        var aliasMap;
        if (context.selectionSet && context.fragmentMap) {
            var info = trie.lookupArray([
                context.selectionSet,
                context.fragmentMap,
            ]);
            aliasMap = info.aliasMap || (info.aliasMap = makeAliasMap(context.selectionSet, context.fragmentMap));
        }
        var keyObject = context.keyObject =
            computeKeyObject(object, specifier, aliasMap);
        return context.typename + ":" + JSON.stringify(keyObject);
    };
}
function makeAliasMap(selectionSet, fragmentMap) {
    var map = Object.create(null);
    var workQueue = new Set([selectionSet]);
    workQueue.forEach(function (selectionSet) {
        selectionSet.selections.forEach(function (selection) {
            if (isField(selection)) {
                if (selection.alias) {
                    var responseKey = selection.alias.value;
                    var storeKey = selection.name.value;
                    if (storeKey !== responseKey) {
                        var aliases = map.aliases || (map.aliases = Object.create(null));
                        aliases[storeKey] = responseKey;
                    }
                }
                if (selection.selectionSet) {
                    var subsets = map.subsets || (map.subsets = Object.create(null));
                    subsets[selection.name.value] =
                        makeAliasMap(selection.selectionSet, fragmentMap);
                }
            }
            else {
                var fragment = getFragmentFromSelection(selection, fragmentMap);
                if (fragment) {
                    workQueue.add(fragment.selectionSet);
                }
            }
        });
    });
    return map;
}
function computeKeyObject(response, specifier, aliasMap) {
    var keyObj = Object.create(null);
    var prevKey;
    specifier.forEach(function (s) {
        if (Array.isArray(s)) {
            if (typeof prevKey === "string") {
                var subsets = aliasMap && aliasMap.subsets;
                var subset = subsets && subsets[prevKey];
                keyObj[prevKey] = computeKeyObject(response[prevKey], s, subset);
            }
        }
        else {
            var aliases = aliasMap && aliasMap.aliases;
            var responseName = aliases && aliases[s] || s;
            process.env.NODE_ENV === "production" ? invariant(hasOwn.call(response, responseName), 37) : invariant(hasOwn.call(response, responseName), "Missing field '" + responseName + "' while computing key fields");
            keyObj[prevKey = s] = response[responseName];
        }
    });
    return keyObj;
}

export { Policies, defaultDataIdFromObject };
//# sourceMappingURL=policies.js.map
