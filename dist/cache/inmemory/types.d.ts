import { DocumentNode } from 'graphql';
import { Transaction } from '../core/cache';
import { StoreValue } from '../../utilities/graphql/storeUtils';
import { Modifiers, Modifier, FieldValueGetter } from './entityStore';
export { StoreValue };
export interface IdGetterObj extends Object {
    __typename?: string;
    id?: string;
    _id?: string;
}
export declare type IdGetter = (value: IdGetterObj) => string | null | undefined;
export interface NormalizedCache {
    has(dataId: string): boolean;
    get(dataId: string, fieldName: string): StoreValue;
    merge(dataId: string, incoming: StoreObject): void;
    modify(dataId: string, modifiers: Modifier<any> | Modifiers): boolean;
    delete(dataId: string, fieldName?: string): boolean;
    clear(): void;
    toObject(): NormalizedCacheObject;
    replace(newData: NormalizedCacheObject): void;
    retain(rootId: string): number;
    release(rootId: string): number;
    getFieldValue: FieldValueGetter;
}
export interface NormalizedCacheObject {
    [dataId: string]: StoreObject | undefined;
}
export interface StoreObject {
    __typename?: string;
    [storeFieldName: string]: StoreValue;
}
export declare type SafeReadonly<T> = T extends object ? Readonly<T> : T;
export declare type OptimisticStoreItem = {
    id: string;
    data: NormalizedCacheObject;
    transaction: Transaction<NormalizedCacheObject>;
};
export declare type ReadQueryOptions = {
    store: NormalizedCache;
    query: DocumentNode;
    variables?: Object;
    previousResult?: any;
    rootId?: string;
    config?: ApolloReducerConfig;
};
export declare type DiffQueryAgainstStoreOptions = ReadQueryOptions & {
    returnPartialData?: boolean;
};
export declare type ApolloReducerConfig = {
    dataIdFromObject?: IdGetter;
    addTypename?: boolean;
};
export declare type CacheResolver = (rootValue: any, args: {
    [argName: string]: any;
}, context: any) => any;
export declare type CacheResolverMap = {
    [typeName: string]: {
        [fieldName: string]: CacheResolver;
    };
};
export declare type CustomResolver = CacheResolver;
export declare type CustomResolverMap = CacheResolverMap;
//# sourceMappingURL=types.d.ts.map