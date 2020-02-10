import { __assign, __extends } from 'tslib';
import { isReference, makeReference } from '../../utilities/graphql/storeUtils.js';
import { canUseWeakMap } from '../../utilities/common/canUse.js';
import { equal } from '@wry/equality';
import { DeepMerger } from '../../utilities/common/mergeDeep.js';
import { KeyTrie, dep } from 'optimism';
import { maybeDeepFreeze } from '../../utilities/common/maybeDeepFreeze.js';
import { fieldNameFromStoreName } from './helpers.js';
import { Policies } from './policies.js';

var hasOwn = Object.prototype.hasOwnProperty;
var DELETE = Object.create(null);
var delModifier = function () { return DELETE; };
var EntityStore = (function () {
    function EntityStore(policies, group) {
        var _this = this;
        this.policies = policies;
        this.group = group;
        this.data = Object.create(null);
        this.rootIds = Object.create(null);
        this.refs = Object.create(null);
        this.getFieldValue = function (objectOrReference, storeFieldName) { return maybeDeepFreeze(isReference(objectOrReference)
            ? _this.get(objectOrReference.__ref, storeFieldName)
            : objectOrReference && objectOrReference[storeFieldName]); };
    }
    EntityStore.prototype.toObject = function () {
        return __assign({}, this.data);
    };
    EntityStore.prototype.has = function (dataId) {
        return this.lookup(dataId, true) !== void 0;
    };
    EntityStore.prototype.get = function (dataId, fieldName) {
        this.group.depend(dataId, fieldName);
        if (hasOwn.call(this.data, dataId)) {
            var storeObject = this.data[dataId];
            if (storeObject && hasOwn.call(storeObject, fieldName)) {
                return storeObject[fieldName];
            }
        }
        if (fieldName === "__typename" &&
            hasOwn.call(this.policies.rootTypenamesById, dataId)) {
            return this.policies.rootTypenamesById[dataId];
        }
        if (this instanceof Layer) {
            return this.parent.get(dataId, fieldName);
        }
    };
    EntityStore.prototype.lookup = function (dataId, dependOnExistence) {
        if (dependOnExistence)
            this.group.depend(dataId, "__exists");
        return hasOwn.call(this.data, dataId) ? this.data[dataId] :
            this instanceof Layer ? this.parent.lookup(dataId, dependOnExistence) : void 0;
    };
    EntityStore.prototype.merge = function (dataId, incoming) {
        var _this = this;
        var existing = this.lookup(dataId);
        var merged = new DeepMerger(storeObjectReconciler).merge(existing, incoming);
        this.data[dataId] = merged;
        if (merged !== existing) {
            delete this.refs[dataId];
            if (this.group.caching) {
                var fieldsToDirty_1 = Object.create(null);
                if (!existing)
                    fieldsToDirty_1.__exists = 1;
                Object.keys(incoming).forEach(function (storeFieldName) {
                    if (!existing || existing[storeFieldName] !== merged[storeFieldName]) {
                        fieldsToDirty_1[fieldNameFromStoreName(storeFieldName)] = 1;
                        if (merged[storeFieldName] === void 0 && !(_this instanceof Layer)) {
                            delete merged[storeFieldName];
                        }
                    }
                });
                Object.keys(fieldsToDirty_1).forEach(function (fieldName) { return _this.group.dirty(dataId, fieldName); });
            }
        }
    };
    EntityStore.prototype.modify = function (dataId, modifiers) {
        var _this = this;
        var storeObject = this.lookup(dataId);
        if (storeObject) {
            var changedFields_1 = Object.create(null);
            var needToMerge_1 = false;
            var allDeleted_1 = true;
            var readField_1 = function (fieldName, objOrRef) { return _this.getFieldValue(objOrRef || makeReference(dataId), fieldName); };
            Object.keys(storeObject).forEach(function (storeFieldName) {
                var fieldName = fieldNameFromStoreName(storeFieldName);
                var fieldValue = storeObject[storeFieldName];
                if (fieldValue === void 0)
                    return;
                var modify = typeof modifiers === "function"
                    ? modifiers
                    : modifiers[fieldName];
                if (modify) {
                    var newValue = modify === delModifier ? DELETE :
                        modify(maybeDeepFreeze(fieldValue), {
                            DELETE: DELETE,
                            fieldName: fieldName,
                            storeFieldName: storeFieldName,
                            isReference: isReference,
                            toReference: _this.policies.toReference,
                            readField: readField_1,
                        });
                    if (newValue === DELETE)
                        newValue = void 0;
                    if (newValue !== fieldValue) {
                        changedFields_1[storeFieldName] = newValue;
                        needToMerge_1 = true;
                        fieldValue = newValue;
                    }
                }
                if (fieldValue !== void 0) {
                    allDeleted_1 = false;
                }
            });
            if (needToMerge_1) {
                this.merge(dataId, changedFields_1);
                if (allDeleted_1) {
                    if (this instanceof Layer) {
                        this.data[dataId] = void 0;
                    }
                    else {
                        delete this.data[dataId];
                    }
                    this.group.dirty(dataId, "__exists");
                }
                return true;
            }
        }
        return false;
    };
    EntityStore.prototype.delete = function (dataId, fieldName) {
        var _a;
        return this.modify(dataId, fieldName ? (_a = {},
            _a[fieldName] = delModifier,
            _a) : delModifier);
    };
    EntityStore.prototype.evict = function (dataId, fieldName) {
        var evicted = false;
        if (hasOwn.call(this.data, dataId)) {
            evicted = this.delete(dataId, fieldName);
        }
        if (this instanceof Layer) {
            evicted = this.parent.evict(dataId, fieldName) || evicted;
        }
        return evicted;
    };
    EntityStore.prototype.clear = function () {
        this.replace(null);
    };
    EntityStore.prototype.replace = function (newData) {
        var _this = this;
        Object.keys(this.data).forEach(function (dataId) {
            if (!(newData && hasOwn.call(newData, dataId))) {
                _this.delete(dataId);
            }
        });
        if (newData) {
            Object.keys(newData).forEach(function (dataId) {
                _this.merge(dataId, newData[dataId]);
            });
        }
    };
    EntityStore.prototype.retain = function (rootId) {
        return this.rootIds[rootId] = (this.rootIds[rootId] || 0) + 1;
    };
    EntityStore.prototype.release = function (rootId) {
        if (this.rootIds[rootId] > 0) {
            var count = --this.rootIds[rootId];
            if (!count)
                delete this.rootIds[rootId];
            return count;
        }
        return 0;
    };
    EntityStore.prototype.getRootIdSet = function (ids) {
        if (ids === void 0) { ids = new Set(); }
        Object.keys(this.rootIds).forEach(ids.add, ids);
        if (this instanceof Layer) {
            this.parent.getRootIdSet(ids);
        }
        return ids;
    };
    EntityStore.prototype.gc = function () {
        var _this = this;
        var ids = this.getRootIdSet();
        var snapshot = this.toObject();
        ids.forEach(function (id) {
            if (hasOwn.call(snapshot, id)) {
                Object.keys(_this.findChildRefIds(id)).forEach(ids.add, ids);
                delete snapshot[id];
            }
        });
        var idsToRemove = Object.keys(snapshot);
        if (idsToRemove.length) {
            var root_1 = this;
            while (root_1 instanceof Layer)
                root_1 = root_1.parent;
            idsToRemove.forEach(function (id) { return root_1.delete(id); });
        }
        return idsToRemove;
    };
    EntityStore.prototype.findChildRefIds = function (dataId) {
        if (!hasOwn.call(this.refs, dataId)) {
            var found_1 = this.refs[dataId] = Object.create(null);
            var workSet_1 = new Set([this.data[dataId]]);
            var canTraverse_1 = function (obj) { return obj !== null && typeof obj === 'object'; };
            workSet_1.forEach(function (obj) {
                if (isReference(obj)) {
                    found_1[obj.__ref] = true;
                }
                else if (canTraverse_1(obj)) {
                    Object.values(obj)
                        .filter(canTraverse_1)
                        .forEach(workSet_1.add, workSet_1);
                }
            });
        }
        return this.refs[dataId];
    };
    EntityStore.prototype.makeCacheKey = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return this.group.keyMaker.lookupArray(args);
    };
    return EntityStore;
}());
var CacheGroup = (function () {
    function CacheGroup(caching) {
        this.caching = caching;
        this.d = null;
        this.keyMaker = new KeyTrie(canUseWeakMap);
        this.d = caching ? dep() : null;
    }
    CacheGroup.prototype.depend = function (dataId, storeFieldName) {
        if (this.d) {
            this.d(makeDepKey(dataId, storeFieldName));
        }
    };
    CacheGroup.prototype.dirty = function (dataId, storeFieldName) {
        if (this.d) {
            this.d.dirty(makeDepKey(dataId, storeFieldName));
        }
    };
    return CacheGroup;
}());
function makeDepKey(dataId, storeFieldName) {
    return JSON.stringify([dataId, fieldNameFromStoreName(storeFieldName)]);
}
(function (EntityStore) {
    var Root = (function (_super) {
        __extends(Root, _super);
        function Root(_a) {
            var policies = _a.policies, _b = _a.resultCaching, resultCaching = _b === void 0 ? true : _b, seed = _a.seed;
            var _this = _super.call(this, policies, new CacheGroup(resultCaching)) || this;
            _this.sharedLayerGroup = null;
            _this.sharedLayerGroup = new CacheGroup(resultCaching);
            if (seed)
                _this.replace(seed);
            return _this;
        }
        Root.prototype.addLayer = function (layerId, replay) {
            return new Layer(layerId, this, replay, this.sharedLayerGroup);
        };
        Root.prototype.removeLayer = function (layerId) {
            return this;
        };
        return Root;
    }(EntityStore));
    EntityStore.Root = Root;
})(EntityStore || (EntityStore = {}));
var Layer = (function (_super) {
    __extends(Layer, _super);
    function Layer(id, parent, replay, group) {
        var _this = _super.call(this, parent.policies, group) || this;
        _this.id = id;
        _this.parent = parent;
        _this.replay = replay;
        _this.group = group;
        replay(_this);
        return _this;
    }
    Layer.prototype.addLayer = function (layerId, replay) {
        return new Layer(layerId, this, replay, this.group);
    };
    Layer.prototype.removeLayer = function (layerId) {
        var _this = this;
        var parent = this.parent.removeLayer(layerId);
        if (layerId === this.id) {
            if (this.group.caching) {
                Object.keys(this.data).forEach(function (dataId) {
                    if (_this.data[dataId] !== parent.lookup(dataId)) {
                        _this.delete(dataId);
                    }
                });
            }
            return parent;
        }
        if (parent === this.parent)
            return this;
        return parent.addLayer(this.id, this.replay);
    };
    Layer.prototype.toObject = function () {
        return __assign(__assign({}, this.parent.toObject()), this.data);
    };
    Layer.prototype.findChildRefIds = function (dataId) {
        var fromParent = this.parent.findChildRefIds(dataId);
        return hasOwn.call(this.data, dataId) ? __assign(__assign({}, fromParent), _super.prototype.findChildRefIds.call(this, dataId)) : fromParent;
    };
    return Layer;
}(EntityStore));
function storeObjectReconciler(existingObject, incomingObject, property) {
    var existingValue = existingObject[property];
    var incomingValue = incomingObject[property];
    return equal(existingValue, incomingValue) ? existingValue : incomingValue;
}
function supportsResultCaching(store) {
    return !!(store instanceof EntityStore && store.group.caching);
}
function defaultNormalizedCacheFactory(seed) {
    return new EntityStore.Root({
        policies: new Policies,
        resultCaching: true,
        seed: seed,
    });
}

export { EntityStore, defaultNormalizedCacheFactory, supportsResultCaching };
//# sourceMappingURL=entityStore.js.map
