import './fixPolyfills';
import { DocumentNode } from 'graphql';
import { ApolloCache, Transaction } from '../core/cache';
import { Cache } from '../core/types/Cache';
import { Modifier, Modifiers } from '../core/types/common';
import { StoreObject } from '../../utilities/graphql/storeUtils';
import { ApolloReducerConfig, NormalizedCacheObject } from './types';
import { PossibleTypesMap, Policies, TypePolicies } from './policies';
export interface InMemoryCacheConfig extends ApolloReducerConfig {
    resultCaching?: boolean;
    possibleTypes?: PossibleTypesMap;
    typePolicies?: TypePolicies;
}
export declare class InMemoryCache extends ApolloCache<NormalizedCacheObject> {
    private data;
    private optimisticData;
    protected config: InMemoryCacheConfig;
    private watches;
    private addTypename;
    private typenameDocumentCache;
    private storeReader;
    private storeWriter;
    readonly policies: Policies;
    constructor(config?: InMemoryCacheConfig);
    restore(data: NormalizedCacheObject): this;
    extract(optimistic?: boolean): NormalizedCacheObject;
    read<T>(options: Cache.ReadOptions): T | null;
    write(options: Cache.WriteOptions): void;
    modify(modifiers: Modifier<any> | Modifiers, dataId?: string, optimistic?: boolean): boolean;
    diff<T>(options: Cache.DiffOptions): Cache.DiffResult<T>;
    watch(watch: Cache.WatchOptions): () => void;
    gc(): string[];
    retain(rootId: string, optimistic?: boolean): number;
    release(rootId: string, optimistic?: boolean): number;
    identify(object: StoreObject): string | undefined;
    evict(dataId: string, fieldName?: string, args?: Record<string, any>): boolean;
    reset(): Promise<void>;
    removeOptimistic(idToRemove: string): void;
    private txCount;
    performTransaction(transaction: (cache: InMemoryCache) => any, optimisticId?: string): void;
    recordOptimisticTransaction(transaction: Transaction<NormalizedCacheObject>, id: string): void;
    transformDocument(document: DocumentNode): DocumentNode;
    protected broadcastWatches(): void;
    private maybeBroadcastWatch;
    private varDep;
    makeVar<T>(value: T): ReactiveVar<T>;
}
export declare type ReactiveVar<T> = (newValue?: T) => T;
//# sourceMappingURL=inMemoryCache.d.ts.map