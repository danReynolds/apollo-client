import { InlineFragmentNode, FragmentDefinitionNode, SelectionSetNode, FieldNode } from "graphql";
import { FragmentMap } from '../../utilities/graphql/fragments';
import { StoreValue, Reference, isReference } from '../../utilities/graphql/storeUtils';
import { IdGetter, StoreObject, SafeReadonly } from "./types";
import { FieldValueToBeMerged } from './helpers';
import { FieldValueGetter } from './entityStore';
export declare type TypePolicies = {
    [__typename: string]: TypePolicy;
};
declare type KeySpecifier = (string | any[])[];
declare type KeyFieldsFunction = (object: Readonly<StoreObject>, context: {
    typename: string;
    selectionSet?: SelectionSetNode;
    fragmentMap?: FragmentMap;
    policies: Policies;
}) => KeySpecifier | ReturnType<IdGetter>;
export declare type TypePolicy = {
    keyFields?: KeySpecifier | KeyFieldsFunction | false;
    queryType?: true;
    mutationType?: true;
    subscriptionType?: true;
    fields?: {
        [fieldName: string]: FieldPolicy<any> | FieldReadFunction<any>;
    };
};
declare type KeyArgsFunction = (args: Record<string, any>, context: {
    typename: string;
    fieldName: string;
    field: FieldNode;
    variables: Record<string, any>;
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
    toReference: Policies["toReference"];
    readField<T = StoreValue>(nameOrField: string | FieldNode, foreignObjOrRef?: StoreObject | Reference): SafeReadonly<T>;
    storage: StorageType;
    mergeObjects<T extends StoreObject | Reference>(existing: T, incoming: T): T;
}
export declare type FieldReadFunction<TExisting = any, TReadResult = TExisting> = (existing: SafeReadonly<TExisting> | undefined, options: FieldFunctionOptions) => TReadResult | undefined;
export declare type FieldMergeFunction<TExisting = any, TIncoming = TExisting> = (existing: SafeReadonly<TExisting> | undefined, incoming: SafeReadonly<TIncoming>, options: FieldFunctionOptions) => TExisting;
export declare function defaultDataIdFromObject(object: StoreObject): string;
export declare type PossibleTypesMap = {
    [supertype: string]: string[];
};
export declare class Policies {
    private config;
    private typePolicies;
    readonly rootTypenamesById: Readonly<Record<string, string>>;
    readonly usingPossibleTypes = false;
    constructor(config?: {
        dataIdFromObject?: KeyFieldsFunction;
        possibleTypes?: PossibleTypesMap;
        typePolicies?: TypePolicies;
    });
    toReference: (object: StoreObject, selectionSet?: SelectionSetNode, fragmentMap?: FragmentMap) => Reference;
    identify(object: StoreObject, selectionSet?: SelectionSetNode, fragmentMap?: FragmentMap): string | null;
    addTypePolicies(typePolicies: TypePolicies): void;
    private setRootTypename;
    addPossibleTypes(possibleTypes: PossibleTypesMap): void;
    private getTypePolicy;
    private getSubtypeSet;
    private getFieldPolicy;
    fragmentMatches(fragment: InlineFragmentNode | FragmentDefinitionNode, typename: string): boolean;
    getStoreFieldName(typename: string | undefined, field: FieldNode, variables: Record<string, any>): string;
    private storageTrie;
    readField<V = StoreValue>(objectOrReference: StoreObject | Reference, nameOrField: string | FieldNode, getFieldValue: FieldValueGetter, variables?: Record<string, any>, typename?: string): SafeReadonly<V>;
    hasMergeFunction(typename: string, fieldName: string): boolean;
    applyMerges<T extends StoreValue>(existing: T | Reference, incoming: T | FieldValueToBeMerged, getFieldValue: FieldValueGetter, variables: Record<string, any>, storageKeys?: [string | StoreObject, string]): T;
}
export {};
//# sourceMappingURL=policies.d.ts.map