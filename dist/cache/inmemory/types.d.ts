import { DocumentNode } from 'graphql';
import { Transaction } from '../core/cache';
import { Modifier, Modifiers } from '../core/types/common';
import { StoreValue, StoreObject } from '../../utilities/graphql/storeUtils';
import { FieldValueGetter, ToReferenceFunction } from './entityStore';
import { KeyFieldsFunction } from './policies';
export { StoreObject, StoreValue };
export interface IdGetterObj extends Object {
    __typename?: string;
    id?: string;
    _id?: string;
}
export declare type IdGetter = (value: IdGetterObj) => string | undefined;
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
    toReference: ToReferenceFunction;
}
export interface NormalizedCacheObject {
    [dataId: string]: StoreObject | undefined;
}
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
    dataIdFromObject?: KeyFieldsFunction;
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