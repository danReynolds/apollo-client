import Observable from 'zen-observable';
import { __extends, __assign } from 'tslib';
import { InvariantError, invariant } from 'ts-invariant';
import 'symbol-observable';
import { getOperationDefinition } from '../utilities/graphql/getFromAST.js';
import { isNonEmptyArray } from '../utilities/common/arrays.js';
import { ApolloError } from '../errors/ApolloError.js';
import { NetworkStatus, isNetworkRequestInFlight } from './networkStatus.js';
import { equal } from '@wry/equality';
import { tryFunctionOrLogError } from '../utilities/common/errorHandling.js';
import { cloneDeep } from '../utilities/common/cloneDeep.js';
import { iterateObserversSafely } from '../utilities/observables/iteration.js';
import { Reobserver } from './Reobserver.js';

var hasError = function (storeValue, policy) {
    if (policy === void 0) { policy = 'none'; }
    return storeValue && (storeValue.networkError ||
        (policy === 'none' && isNonEmptyArray(storeValue.graphQLErrors)));
};
var ObservableQuery = (function (_super) {
    __extends(ObservableQuery, _super);
    function ObservableQuery(_a) {
        var queryManager = _a.queryManager, options = _a.options, _b = _a.shouldSubscribe, shouldSubscribe = _b === void 0 ? true : _b;
        var _this = _super.call(this, function (observer) {
            return _this.onSubscribe(observer);
        }) || this;
        _this.observers = new Set();
        _this.subscriptions = new Set();
        _this.observer = {
            next: function (result) {
                if (_this.lastError || _this.isDifferentFromLastResult(result)) {
                    _this.updateLastResult(result);
                    iterateObserversSafely(_this.observers, 'next', result);
                }
            },
            error: function (error) {
                _this.updateLastResult(__assign(__assign({}, _this.lastResult), { errors: error.graphQLErrors, networkStatus: NetworkStatus.error, loading: false }));
                iterateObserversSafely(_this.observers, 'error', _this.lastError = error);
            },
        };
        _this.isTornDown = false;
        _this.options = options;
        _this.queryId = queryManager.generateQueryId();
        _this.watching = shouldSubscribe;
        var opDef = getOperationDefinition(options.query);
        _this.queryName = opDef && opDef.name && opDef.name.value;
        _this.queryManager = queryManager;
        return _this;
    }
    Object.defineProperty(ObservableQuery.prototype, "variables", {
        get: function () {
            return this.options.variables;
        },
        enumerable: true,
        configurable: true
    });
    ObservableQuery.prototype.result = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var observer = {
                next: function (result) {
                    resolve(result);
                    _this.observers.delete(observer);
                    if (!_this.observers.size) {
                        _this.queryManager.removeQuery(_this.queryId);
                    }
                    setTimeout(function () {
                        subscription.unsubscribe();
                    }, 0);
                },
                error: reject,
            };
            var subscription = _this.subscribe(observer);
        });
    };
    ObservableQuery.prototype.getCurrentResult = function () {
        var _a = this, lastResult = _a.lastResult, lastError = _a.lastError, fetchPolicy = _a.options.fetchPolicy;
        var isNetworkFetchPolicy = fetchPolicy === 'network-only' ||
            fetchPolicy === 'no-cache';
        var networkStatus = lastError ? NetworkStatus.error :
            lastResult ? lastResult.networkStatus :
                isNetworkFetchPolicy ? NetworkStatus.loading :
                    NetworkStatus.ready;
        var result = {
            data: !lastError && lastResult && lastResult.data || void 0,
            error: lastError,
            loading: isNetworkRequestInFlight(networkStatus),
            networkStatus: networkStatus,
        };
        if (this.isTornDown) {
            return result;
        }
        var _b = this.getCurrentQueryResult(), data = _b.data, partial = _b.partial;
        Object.assign(result, { data: data, partial: partial });
        var queryStoreValue = this.queryManager.getQueryStoreValue(this.queryId);
        if (queryStoreValue) {
            var networkStatus_1 = queryStoreValue.networkStatus;
            if (hasError(queryStoreValue, this.options.errorPolicy)) {
                return Object.assign(result, {
                    data: void 0,
                    networkStatus: networkStatus_1,
                    error: new ApolloError({
                        graphQLErrors: queryStoreValue.graphQLErrors,
                        networkError: queryStoreValue.networkError,
                    }),
                });
            }
            if (queryStoreValue.variables) {
                this.options.variables = __assign(__assign({}, this.options.variables), queryStoreValue.variables);
            }
            Object.assign(result, {
                loading: isNetworkRequestInFlight(networkStatus_1),
                networkStatus: networkStatus_1,
            });
            if (queryStoreValue.graphQLErrors && this.options.errorPolicy === 'all') {
                result.errors = queryStoreValue.graphQLErrors;
            }
        }
        if (!partial) {
            this.updateLastResult(result);
        }
        return result;
    };
    ObservableQuery.prototype.isDifferentFromLastResult = function (newResult) {
        return !equal(this.lastResultSnapshot, newResult);
    };
    ObservableQuery.prototype.getLastResult = function () {
        return this.lastResult;
    };
    ObservableQuery.prototype.getLastError = function () {
        return this.lastError;
    };
    ObservableQuery.prototype.resetLastResults = function () {
        delete this.lastResult;
        delete this.lastResultSnapshot;
        delete this.lastError;
        this.isTornDown = false;
    };
    ObservableQuery.prototype.resetQueryStoreErrors = function () {
        var queryStore = this.queryManager.getQueryStoreValue(this.queryId);
        if (queryStore) {
            queryStore.networkError = undefined;
            queryStore.graphQLErrors = [];
        }
    };
    ObservableQuery.prototype.refetch = function (variables) {
        var fetchPolicy = this.options.fetchPolicy;
        if (fetchPolicy === 'cache-only') {
            return Promise.reject(process.env.NODE_ENV === "production" ? process.env.NODE_ENV === "production" ? new InvariantError(25) : new InvariantError(3) : process.env.NODE_ENV === "production" ? new InvariantError(26) : new InvariantError('cache-only fetchPolicy option should not be used together with query refetch.'));
        }
        if (fetchPolicy !== 'no-cache' &&
            fetchPolicy !== 'cache-and-network') {
            fetchPolicy = 'network-only';
        }
        if (variables && !equal(this.options.variables, variables)) {
            this.options.variables = __assign(__assign({}, this.options.variables), variables);
        }
        return this.newReobserver(false).reobserve({
            fetchPolicy: fetchPolicy,
            variables: this.options.variables,
            pollInterval: 0,
        }, NetworkStatus.refetch);
    };
    ObservableQuery.prototype.fetchMore = function (fetchMoreOptions) {
        var _this = this;
        var combinedOptions = __assign(__assign({}, (fetchMoreOptions.query ? fetchMoreOptions : __assign(__assign(__assign({}, this.options), fetchMoreOptions), { variables: __assign(__assign({}, this.options.variables), fetchMoreOptions.variables) }))), { fetchPolicy: "no-cache" });
        var qid = this.queryManager.generateQueryId();
        return this.queryManager.fetchQuery(qid, combinedOptions, NetworkStatus.fetchMore).then(function (fetchMoreResult) {
            _this.updateQuery(function (previousResult) {
                var data = fetchMoreResult.data;
                var updateQuery = fetchMoreOptions.updateQuery;
                return updateQuery ? updateQuery(previousResult, {
                    fetchMoreResult: data,
                    variables: combinedOptions.variables,
                }) : data;
            });
            return fetchMoreResult;
        }).finally(function () {
            _this.queryManager.stopQuery(qid);
            _this.reobserve();
        });
    };
    ObservableQuery.prototype.subscribeToMore = function (options) {
        var _this = this;
        var subscription = this.queryManager
            .startGraphQLSubscription({
            query: options.document,
            variables: options.variables,
        })
            .subscribe({
            next: function (subscriptionData) {
                var updateQuery = options.updateQuery;
                if (updateQuery) {
                    _this.updateQuery(function (previous, _a) {
                        var variables = _a.variables;
                        return updateQuery(previous, {
                            subscriptionData: subscriptionData,
                            variables: variables,
                        });
                    });
                }
            },
            error: function (err) {
                if (options.onError) {
                    options.onError(err);
                    return;
                }
                process.env.NODE_ENV === "production" || (process.env.NODE_ENV === "production" || invariant.error('Unhandled GraphQL subscription error', err));
            },
        });
        this.subscriptions.add(subscription);
        return function () {
            if (_this.subscriptions.delete(subscription)) {
                subscription.unsubscribe();
            }
        };
    };
    ObservableQuery.prototype.setOptions = function (newOptions) {
        return this.reobserve(newOptions);
    };
    ObservableQuery.prototype.setVariables = function (variables) {
        if (equal(this.variables, variables)) {
            return this.observers.size
                ? this.result()
                : Promise.resolve();
        }
        this.options.variables = variables;
        if (!this.observers.size) {
            return Promise.resolve();
        }
        var fetchPolicy = this.options.fetchPolicy;
        if (fetchPolicy !== 'cache-first' &&
            fetchPolicy !== 'no-cache' &&
            fetchPolicy !== 'network-only') {
            fetchPolicy = 'cache-and-network';
        }
        return this.reobserve({
            fetchPolicy: fetchPolicy,
            variables: variables,
        }, NetworkStatus.setVariables);
    };
    ObservableQuery.prototype.updateQuery = function (mapFn) {
        var _this = this;
        var queryManager = this.queryManager;
        var previousResult = this.getCurrentQueryResult(false).data;
        var newResult = tryFunctionOrLogError(function () { return mapFn(previousResult, {
            variables: _this.variables,
        }); });
        if (newResult) {
            queryManager.cache.writeQuery({
                query: this.options.query,
                data: newResult,
                variables: this.variables,
            });
            queryManager.broadcastQueries();
        }
    };
    ObservableQuery.prototype.getCurrentQueryResult = function (optimistic) {
        if (optimistic === void 0) { optimistic = true; }
        var _a, _b;
        var fetchPolicy = this.options.fetchPolicy;
        if (fetchPolicy === 'no-cache' ||
            fetchPolicy === 'network-only') {
            return {
                data: (_a = this.lastResult) === null || _a === void 0 ? void 0 : _a.data,
                partial: false,
            };
        }
        var _c = this.queryManager.cache.diff({
            query: this.options.query,
            variables: this.variables,
            previousResult: (_b = this.lastResult) === null || _b === void 0 ? void 0 : _b.data,
            returnPartialData: true,
            optimistic: optimistic,
        }), result = _c.result, complete = _c.complete;
        return {
            data: (complete || this.options.returnPartialData) ? result : void 0,
            partial: !complete,
        };
    };
    ObservableQuery.prototype.startPolling = function (pollInterval) {
        this.getReobserver().updateOptions({ pollInterval: pollInterval });
    };
    ObservableQuery.prototype.stopPolling = function () {
        if (this.reobserver) {
            this.reobserver.updateOptions({ pollInterval: 0 });
        }
    };
    ObservableQuery.prototype.updateLastResult = function (newResult) {
        var previousResult = this.lastResult;
        this.lastResult = newResult;
        this.lastResultSnapshot = this.queryManager.assumeImmutableResults
            ? newResult
            : cloneDeep(newResult);
        if (!isNonEmptyArray(newResult.errors)) {
            delete this.lastError;
        }
        return previousResult;
    };
    ObservableQuery.prototype.onSubscribe = function (observer) {
        var _this = this;
        if (observer === this.observer) {
            return function () { };
        }
        try {
            var subObserver = observer._subscription._observer;
            if (subObserver && !subObserver.error) {
                subObserver.error = defaultSubscriptionObserverErrorCallback;
            }
        }
        catch (_a) { }
        var first = !this.observers.size;
        this.observers.add(observer);
        if (observer.next && this.lastResult)
            observer.next(this.lastResult);
        if (observer.error && this.lastError)
            observer.error(this.lastError);
        if (first) {
            this.reobserve().catch(function (_) {
            });
        }
        return function () {
            if (_this.observers.delete(observer) && !_this.observers.size) {
                _this.tearDownQuery();
            }
        };
    };
    ObservableQuery.prototype.getReobserver = function () {
        return this.reobserver || (this.reobserver = this.newReobserver(true));
    };
    ObservableQuery.prototype.newReobserver = function (shareOptions) {
        var _this = this;
        var _a = this, queryManager = _a.queryManager, queryId = _a.queryId;
        queryManager.setObservableQuery(this);
        return new Reobserver(this.observer, shareOptions ? this.options : __assign({}, this.options), function (currentOptions, newNetworkStatus) {
            queryManager.setObservableQuery(_this);
            return queryManager.fetchQueryObservable(queryId, currentOptions, newNetworkStatus);
        }, !queryManager.ssrMode && (function () { return !queryManager.checkInFlight(queryId); }));
    };
    ObservableQuery.prototype.reobserve = function (newOptions, newNetworkStatus) {
        this.isTornDown = false;
        return this.getReobserver().reobserve(newOptions, newNetworkStatus);
    };
    ObservableQuery.prototype.tearDownQuery = function () {
        var queryManager = this.queryManager;
        if (this.reobserver) {
            this.reobserver.stop();
            delete this.reobserver;
        }
        this.isTornDown = true;
        this.subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
        this.subscriptions.clear();
        queryManager.stopQuery(this.queryId);
        this.observers.clear();
    };
    return ObservableQuery;
}(Observable));
function defaultSubscriptionObserverErrorCallback(error) {
    process.env.NODE_ENV === "production" || (process.env.NODE_ENV === "production" || invariant.error('Unhandled error', error.message, error.stack));
}

export { ObservableQuery, hasError };
//# sourceMappingURL=ObservableQuery.js.map
