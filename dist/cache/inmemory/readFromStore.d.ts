import { InvariantError } from 'ts-invariant';
import { Cache } from '../core/types/Cache';
import { DiffQueryAgainstStoreOptions, ReadQueryOptions } from './types';
import { Policies } from './policies';
export declare type VariableMap = {
    [name: string]: any;
};
export declare type ExecResult<R = any> = {
    result: R;
    missing?: InvariantError[];
};
export interface StoreReaderConfig {
    addTypename?: boolean;
    policies: Policies;
}
export declare class StoreReader {
    private config;
    constructor(config: StoreReaderConfig);
    readQueryFromStore<QueryType>(options: ReadQueryOptions): QueryType | undefined;
    diffQueryAgainstStore<T>({ store, query, variables, returnPartialData, rootId, config, }: DiffQueryAgainstStoreOptions): Cache.DiffResult<T>;
    private executeSelectionSet;
    private executeSubSelectedArray;
}
//# sourceMappingURL=readFromStore.d.ts.map