/// <reference types="zen-observable" />
import { DocumentNode } from 'graphql';
import { ApolloLink } from '../link/core/ApolloLink';
import { FetchResult } from '../link/core/types';
import { Cache } from '../cache/core/types/Cache';
import { Observer, ObservableSubscription, Observable } from '../utilities/observables/Observable';
import { MutationStore } from '../data/mutations';
import { QueryStore } from '../data/queries';
import { QueryOptions, WatchQueryOptions, SubscriptionOptions, MutationOptions } from './watchQueryOptions';
import { ObservableQuery } from './ObservableQuery';
import { QueryListener, ApolloQueryResult, FetchType, OperationVariables } from './types';
import { LocalState } from './LocalState';
import { ApolloCache } from '../cache/core/cache';
export interface QueryInfo {
    listeners: Set<QueryListener>;
    invalidated: boolean;
    newData: Cache.DiffResult<any> | null;
    document: DocumentNode | null;
    lastRequestId: number;
    observableQuery: ObservableQuery<any> | null;
    subscriptions: Set<ObservableSubscription>;
    cancel?: () => void;
}
export declare class QueryManager<TStore> {
    cache: ApolloCache<TStore>;
    link: ApolloLink;
    mutationStore: MutationStore;
    queryStore: QueryStore;
    readonly assumeImmutableResults: boolean;
    private queryDeduplication;
    private clientAwareness;
    private localState;
    private onBroadcast;
    private ssrMode;
    private idCounter;
    private queries;
    private fetchQueryRejectFns;
    constructor({ cache, link, queryDeduplication, onBroadcast, ssrMode, clientAwareness, localState, assumeImmutableResults, }: {
        cache: ApolloCache<TStore>;
        link: ApolloLink;
        queryDeduplication?: boolean;
        onBroadcast?: () => void;
        ssrMode?: boolean;
        clientAwareness?: Record<string, string>;
        localState?: LocalState<TStore>;
        assumeImmutableResults?: boolean;
    });
    stop(): void;
    mutate<T>({ mutation, variables, optimisticResponse, updateQueries: updateQueriesByName, refetchQueries, awaitRefetchQueries, update: updateWithProxyFn, errorPolicy, fetchPolicy, context, }: MutationOptions): Promise<FetchResult<T>>;
    fetchQuery<T>(queryId: string, options: WatchQueryOptions, fetchType?: FetchType, fetchMoreForQueryId?: string): Promise<FetchResult<T>>;
    private markQueryResult;
    queryListenerForObserver<T>(queryId: string, options: WatchQueryOptions, observer: Observer<ApolloQueryResult<T>>): QueryListener;
    private transformCache;
    transform(document: DocumentNode): Readonly<{
        document: Readonly<DocumentNode>;
        hasClientExports: boolean;
        hasForcedResolvers: boolean;
        clientQuery: Readonly<DocumentNode>;
        serverQuery: Readonly<DocumentNode>;
        defaultVars: Readonly<Record<string, any>>;
    }>;
    private getVariables;
    watchQuery<T, TVariables = OperationVariables>(options: WatchQueryOptions, shouldSubscribe?: boolean): ObservableQuery<T, TVariables>;
    query<T>(options: QueryOptions): Promise<ApolloQueryResult<T>>;
    generateQueryId(): string;
    stopQueryInStore(queryId: string): void;
    private stopQueryInStoreNoBroadcast;
    addQueryListener(queryId: string, listener: QueryListener): void;
    updateQueryWatch(queryId: string, document: DocumentNode, options: WatchQueryOptions): () => void;
    addObservableQuery<T>(queryId: string, observableQuery: ObservableQuery<T>): void;
    removeObservableQuery(queryId: string): void;
    clearStore(): Promise<void>;
    resetStore(): Promise<ApolloQueryResult<any>[]>;
    reFetchObservableQueries(includeStandby?: boolean): Promise<ApolloQueryResult<any>[]>;
    observeQuery<T>(queryId: string, options: WatchQueryOptions, observer: Observer<ApolloQueryResult<T>>): Promise<FetchResult<T, Record<string, any>, Record<string, any>>>;
    startGraphQLSubscription<T = any>({ query, fetchPolicy, variables, }: SubscriptionOptions): Observable<FetchResult<T>>;
    stopQuery(queryId: string): void;
    private stopQueryNoBroadcast;
    removeQuery(queryId: string): void;
    getCurrentQueryResult<T>(observableQuery: ObservableQuery<T>, optimistic?: boolean): {
        data: T | undefined;
        partial: boolean;
    };
    getQueryWithPreviousResult<TData, TVariables = OperationVariables>(queryIdOrObservable: string | ObservableQuery<TData, TVariables>): {
        previousResult: any;
        variables: TVariables | undefined;
        document: DocumentNode;
    };
    broadcastQueries(): void;
    getLocalState(): LocalState<TStore>;
    private inFlightLinkObservables;
    private getObservableFromLink;
    private fetchRequest;
    private getQuery;
    private setQuery;
    private invalidate;
    private prepareContext;
    checkInFlight(queryId: string): boolean;
    private pollingInfoByQueryId;
    startPollingQuery(options: WatchQueryOptions, queryId: string, listener?: QueryListener): string;
    stopPollingQuery(queryId: string): void;
}
//# sourceMappingURL=QueryManager.d.ts.map