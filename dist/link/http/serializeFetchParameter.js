import { InvariantError } from 'ts-invariant';

var serializeFetchParameter = function (p, label) {
    var serialized;
    try {
        serialized = JSON.stringify(p);
    }
    catch (e) {
        var parseError = process.env.NODE_ENV === "production" ? process.env.NODE_ENV === "production" ? new InvariantError(7) : new InvariantError(5) : process.env.NODE_ENV === "production" ? new InvariantError(8) : new InvariantError("Network request failed. " + label + " is not serializable: " + e.message);
        parseError.parseError = e;
        throw parseError;
    }
    return serialized;
};

export { serializeFetchParameter };
//# sourceMappingURL=serializeFetchParameter.js.map
