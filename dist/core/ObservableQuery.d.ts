/// <reference types="zen-observable" />
import { NetworkStatus } from './networkStatus';
import { Observable } from '../utilities/observables/Observable';
import { ApolloError } from '../errors/ApolloError';
import { QueryManager } from './QueryManager';
import { ApolloQueryResult, OperationVariables } from './types';
import { WatchQueryOptions, FetchMoreQueryOptions, SubscribeToMoreOptions, ErrorPolicy } from './watchQueryOptions';
export declare type ApolloCurrentQueryResult<T> = ApolloQueryResult<T> & {
    error?: ApolloError;
    partial?: boolean;
};
export interface FetchMoreOptions<TData = any, TVariables = OperationVariables> {
    updateQuery?: (previousQueryResult: TData, options: {
        fetchMoreResult?: TData;
        variables?: TVariables;
    }) => TData;
}
export interface UpdateQueryOptions<TVariables> {
    variables?: TVariables;
}
export declare const hasError: (storeValue: Pick<import("./QueryInfo").QueryInfo, "variables" | "graphQLErrors" | "networkError" | "networkStatus">, policy?: ErrorPolicy) => boolean | Error;
export declare class ObservableQuery<TData = any, TVariables = OperationVariables> extends Observable<ApolloQueryResult<TData>> {
    readonly options: WatchQueryOptions<TVariables>;
    readonly queryId: string;
    readonly queryName?: string;
    readonly watching: boolean;
    get variables(): TVariables | undefined;
    private isTornDown;
    private queryManager;
    private observers;
    private subscriptions;
    private lastResult;
    private lastResultSnapshot;
    private lastError;
    constructor({ queryManager, options, shouldSubscribe, }: {
        queryManager: QueryManager<any>;
        options: WatchQueryOptions<TVariables>;
        shouldSubscribe?: boolean;
    });
    result(): Promise<ApolloQueryResult<TData>>;
    getCurrentResult(): ApolloCurrentQueryResult<TData>;
    isDifferentFromLastResult(newResult: ApolloQueryResult<TData>): boolean;
    getLastResult(): ApolloQueryResult<TData>;
    getLastError(): ApolloError;
    resetLastResults(): void;
    resetQueryStoreErrors(): void;
    refetch(variables?: TVariables): Promise<ApolloQueryResult<TData>>;
    fetchMore<K extends keyof TVariables>(fetchMoreOptions: FetchMoreQueryOptions<TVariables, K> & FetchMoreOptions<TData, TVariables>): Promise<ApolloQueryResult<TData>>;
    subscribeToMore<TSubscriptionData = TData, TSubscriptionVariables = TVariables>(options: SubscribeToMoreOptions<TData, TSubscriptionVariables, TSubscriptionData>): () => void;
    setOptions(newOptions: Partial<WatchQueryOptions<TVariables>>): Promise<ApolloQueryResult<TData>>;
    setVariables(variables: TVariables): Promise<ApolloQueryResult<TData> | void>;
    updateQuery<TVars = TVariables>(mapFn: (previousQueryResult: TData, options: Pick<WatchQueryOptions<TVars>, "variables">) => TData): void;
    private getCurrentQueryResult;
    startPolling(pollInterval: number): void;
    stopPolling(): void;
    private updateLastResult;
    private onSubscribe;
    private reobserver?;
    private getReobserver;
    private newReobserver;
    reobserve(newOptions?: Partial<WatchQueryOptions<TVariables>>, newNetworkStatus?: NetworkStatus): Promise<ApolloQueryResult<TData>>;
    private observer;
    private tearDownQuery;
}
//# sourceMappingURL=ObservableQuery.d.ts.map