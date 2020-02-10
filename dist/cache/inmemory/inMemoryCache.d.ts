import './fixPolyfills';
import { DocumentNode } from 'graphql';
import { ApolloCache, Transaction } from '../core/cache';
import { Cache } from '../core/types/Cache';
import { ApolloReducerConfig, NormalizedCacheObject, StoreObject } from './types';
import { Modifiers, Modifier } from './entityStore';
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
    private silenceBroadcast;
    constructor(config?: InMemoryCacheConfig);
    restore(data: NormalizedCacheObject): this;
    extract(optimistic?: boolean): NormalizedCacheObject;
    read<T>(options: Cache.ReadOptions): T | null;
    write(options: Cache.WriteOptions): void;
    modify(dataId: string, modifiers: Modifier<any> | Modifiers, optimistic?: boolean): boolean;
    diff<T>(options: Cache.DiffOptions): Cache.DiffResult<T>;
    watch(watch: Cache.WatchOptions): () => void;
    gc(): string[];
    retain(rootId: string, optimistic?: boolean): number;
    release(rootId: string, optimistic?: boolean): number;
    identify(object: StoreObject): string | null;
    evict(dataId: string, fieldName?: string): boolean;
    reset(): Promise<void>;
    removeOptimistic(idToRemove: string): void;
    performTransaction(transaction: (proxy: InMemoryCache) => any, optimisticId?: string): void;
    recordOptimisticTransaction(transaction: Transaction<NormalizedCacheObject>, id: string): void;
    transformDocument(document: DocumentNode): DocumentNode;
    protected broadcastWatches(): void;
    private maybeBroadcastWatch;
    makeLocalVar<T>(value?: T): LocalVar<T>;
}
export declare type LocalVar<T> = (newValue?: T) => T;
//# sourceMappingURL=inMemoryCache.d.ts.map