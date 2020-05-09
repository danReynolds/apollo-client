import { InlineFragmentNode, FragmentDefinitionNode, SelectionSetNode, FieldNode } from "graphql";
import { FragmentMap } from '../../utilities/graphql/fragments';
import { StoreValue, StoreObject, Reference, isReference } from '../../utilities/graphql/storeUtils';
import { IdGetter } from "./types";
import { FieldValueToBeMerged } from './helpers';
import { FieldValueGetter, ToReferenceFunction } from './entityStore';
import { SafeReadonly } from '../core/types/common';
export declare type TypePolicies = {
    [__typename: string]: TypePolicy;
};
declare type KeySpecifier = (string | any[])[];
declare type KeyFieldsContext = {
    typename?: string;
    selectionSet?: SelectionSetNode;
    fragmentMap?: FragmentMap;
    policies: Policies;
    keyObject?: Record<string, any>;
};
export declare type KeyFieldsFunction = (object: Readonly<StoreObject>, context: KeyFieldsContext) => KeySpecifier | ReturnType<IdGetter>;
export declare type TypePolicy = {
    keyFields?: KeySpecifier | KeyFieldsFunction | false;
    queryType?: true;
    mutationType?: true;
    subscriptionType?: true;
    fields?: {
        [fieldName: string]: FieldPolicy<any> | FieldReadFunction<any>;
    };
};
export declare type KeyArgsFunction = (args: Record<string, any> | null, context: {
    typename: string;
    fieldName: string;
    field: FieldNode | null;
    policies: Policies;
}) => KeySpecifier | ReturnType<IdGetter>;
export declare type FieldPolicy<TExisting = any, TIncoming = TExisting, TReadResult = TExisting> = {
    keyArgs?: KeySpecifier | KeyArgsFunction | false;
    read?: FieldReadFunction<TExisting, TReadResult>;
    merge?: FieldMergeFunction<TExisting, TIncoming>;
};
declare type StorageType = Record<string, any>;
export interface FieldFunctionOptions<TArgs = Record<string, any>, TVars = Record<string, any>> {
    args: TArgs | null;
    fieldName: string;
    storeFieldName: string;
    field: FieldNode | null;
    variables?: TVars;
    policies: Policies;
    isReference: typeof isReference;
    toReference: ToReferenceFunction;
    readField<T = StoreValue>(nameOrField: string | FieldNode, foreignObjOrRef?: StoreObject | Reference): SafeReadonly<T> | undefined;
    storage: StorageType | null;
    mergeObjects<T extends StoreObject | Reference>(existing: T, incoming: T): T | undefined;
}
export declare type FieldReadFunction<TExisting = any, TReadResult = TExisting> = (existing: SafeReadonly<TExisting> | undefined, options: FieldFunctionOptions) => TReadResult | undefined;
export declare type FieldMergeFunction<TExisting = any, TIncoming = TExisting> = (existing: SafeReadonly<TExisting> | undefined, incoming: SafeReadonly<TIncoming>, options: FieldFunctionOptions) => TExisting;
export declare function defaultDataIdFromObject(object: StoreObject): string | undefined;
export declare type PossibleTypesMap = {
    [supertype: string]: string[];
};
export declare class Policies {
    private config;
    private typePolicies;
    readonly rootIdsByTypename: Record<string, string>;
    readonly rootTypenamesById: Record<string, string>;
    readonly usingPossibleTypes = false;
    constructor(config?: {
        dataIdFromObject?: KeyFieldsFunction;
        possibleTypes?: PossibleTypesMap;
        typePolicies?: TypePolicies;
    });
    identify(object: StoreObject, selectionSet?: SelectionSetNode, fragmentMap?: FragmentMap): [string?, StoreObject?];
    addTypePolicies(typePolicies: TypePolicies): void;
    private setRootTypename;
    addPossibleTypes(possibleTypes: PossibleTypesMap): void;
    private getTypePolicy;
    private getSubtypeSet;
    private getFieldPolicy;
    fragmentMatches(fragment: InlineFragmentNode | FragmentDefinitionNode, typename: string | undefined): boolean;
    getStoreFieldName(typename: string | undefined, nameOrField: string | FieldNode, argsOrVars: Record<string, any>): string;
    private storageTrie;
    readField<V = StoreValue>(objectOrReference: StoreObject | Reference, nameOrField: string | FieldNode, context: ReadMergeContext, typename?: string): SafeReadonly<V>;
    hasMergeFunction(typename: string | undefined, fieldName: string): boolean;
    applyMerges<T extends StoreValue>(existing: T | Reference, incoming: T | FieldValueToBeMerged, context: ReadMergeContext, storageKeys?: [string | StoreObject, string]): T;
}
export interface ReadMergeContext {
    variables: Record<string, any>;
    toReference: ToReferenceFunction;
    getFieldValue: FieldValueGetter;
}
export {};
//# sourceMappingURL=policies.d.ts.map