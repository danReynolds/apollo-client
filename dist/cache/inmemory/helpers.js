import { isField, isReference } from '../../utilities/graphql/storeUtils.js';
import { DeepMerger } from '../../utilities/common/mergeDeep.js';

function getTypenameFromStoreObject(store, objectOrReference) {
    return isReference(objectOrReference)
        ? store.get(objectOrReference.__ref, "__typename")
        : objectOrReference && objectOrReference.__typename;
}
var FieldNamePattern = /^[_A-Za-z0-9]+/;
function fieldNameFromStoreName(storeFieldName) {
    var match = storeFieldName.match(FieldNamePattern);
    return match && match[0];
}
function isFieldValueToBeMerged(value) {
    var field = value && value.__field;
    return field && isField(field);
}
function makeProcessedFieldsMerger() {
    return new DeepMerger(reconcileProcessedFields);
}
var reconcileProcessedFields = function (existingObject, incomingObject, property) {
    var existing = existingObject[property];
    var incoming = incomingObject[property];
    if (isFieldValueToBeMerged(existing)) {
        existing.__value = this.merge(existing.__value, isFieldValueToBeMerged(incoming)
            ? incoming.__value
            : incoming);
        return existing;
    }
    if (isFieldValueToBeMerged(incoming)) {
        incoming.__value = this.merge(existing, incoming.__value);
        return incoming;
    }
    return this.merge(existing, incoming);
};

export { fieldNameFromStoreName, getTypenameFromStoreObject, isFieldValueToBeMerged, makeProcessedFieldsMerger };
//# sourceMappingURL=helpers.js.map
