import { getFragmentQueryDocument } from '../../utilities/graphql/fragments.js';
import { wrap } from 'optimism';

var ApolloCache = (function () {
    function ApolloCache() {
        this.getFragmentDoc = wrap(getFragmentQueryDocument);
    }
    ApolloCache.prototype.transformDocument = function (document) {
        return document;
    };
    ApolloCache.prototype.identify = function (object) {
        return;
    };
    ApolloCache.prototype.modify = function (modifiers, dataId, optimistic) {
        return false;
    };
    ApolloCache.prototype.gc = function () {
        return [];
    };
    ApolloCache.prototype.transformForLink = function (document) {
        return document;
    };
    ApolloCache.prototype.readQuery = function (options, optimistic) {
        if (optimistic === void 0) { optimistic = false; }
        return this.read({
            rootId: options.id || 'ROOT_QUERY',
            query: options.query,
            variables: options.variables,
            optimistic: optimistic,
        });
    };
    ApolloCache.prototype.readFragment = function (options, optimistic) {
        if (optimistic === void 0) { optimistic = false; }
        return this.read({
            query: this.getFragmentDoc(options.fragment, options.fragmentName),
            variables: options.variables,
            rootId: options.id,
            optimistic: optimistic,
        });
    };
    ApolloCache.prototype.writeQuery = function (options) {
        this.write({
            dataId: options.id || 'ROOT_QUERY',
            result: options.data,
            query: options.query,
            variables: options.variables,
        });
    };
    ApolloCache.prototype.writeFragment = function (options) {
        this.write({
            dataId: options.id,
            result: options.data,
            variables: options.variables,
            query: this.getFragmentDoc(options.fragment, options.fragmentName),
        });
    };
    return ApolloCache;
}());

export { ApolloCache };
//# sourceMappingURL=cache.js.map
