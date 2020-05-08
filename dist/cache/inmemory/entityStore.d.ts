import { KeyTrie } from 'optimism';
import { StoreValue, StoreObject, Reference } from '../../utilities/graphql/storeUtils';
import { NormalizedCache, NormalizedCacheObject } from './types';
import { Policies } from './policies';
import { Modifier, Modifiers, SafeReadonly } from '../core/types/common';
export declare abstract class EntityStore implements NormalizedCache {
    readonly policies: Policies;
    readonly group: CacheGroup;
    protected data: NormalizedCacheObject;
    constructor(policies: Policies, group: CacheGroup);
    abstract addLayer(layerId: string, replay: (layer: EntityStore) => any): EntityStore;
    abstract removeLayer(layerId: string): EntityStore;
    toObject(): NormalizedCacheObject;
    has(dataId: string): boolean;
    get(dataId: string, fieldName: string): StoreValue;
    protected lookup(dataId: string, dependOnExistence?: boolean): StoreObject | undefined;
    merge(dataId: string, incoming: StoreObject): void;
    modify(dataId: string, modifiers: Modifier<any> | Modifiers): boolean;
    delete(dataId: string, fieldName?: string, variables?: Record<string, any>): boolean;
    evict(dataId: string, fieldName?: string, variables?: Record<string, any>): boolean;
    clear(): void;
    replace(newData: NormalizedCacheObject | null): void;
    private rootIds;
    retain(rootId: string): number;
    release(rootId: string): number;
    getRootIdSet(ids?: Set<string>): Set<string>;
    gc(): string[];
    private refs;
    findChildRefIds(dataId: string): Record<string, true>;
    makeCacheKey(...args: any[]): object;
    getFieldValue: <T = StoreValue>(objectOrReference: Reference | StoreObject, storeFieldName: string) => SafeReadonly<T>;
    toReference: (object: StoreObject, mergeIntoStore?: boolean | undefined) => "" | Reference | undefined;
}
export declare type ToReferenceFunction = EntityStore["toReference"];
export declare type FieldValueGetter = EntityStore["getFieldValue"];
declare class CacheGroup {
    readonly caching: boolean;
    private d;
    constructor(caching: boolean);
    depend(dataId: string, storeFieldName: string): void;
    dirty(dataId: string, storeFieldName: string): void;
    readonly keyMaker: KeyTrie<object>;
}
export declare namespace EntityStore {
    class Root extends EntityStore {
        private sharedLayerGroup;
        constructor({ policies, resultCaching, seed, }: {
            policies: Policies;
            resultCaching?: boolean;
            seed?: NormalizedCacheObject;
        });
        addLayer(layerId: string, replay: (layer: EntityStore) => any): EntityStore;
        removeLayer(layerId: string): Root;
    }
}
export declare function supportsResultCaching(store: any): store is EntityStore;
export declare function defaultNormalizedCacheFactory(seed?: NormalizedCacheObject): NormalizedCache;
export {};
//# sourceMappingURL=entityStore.d.ts.map