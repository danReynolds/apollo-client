import { Cache } from '../core/types/Cache';
import { DiffQueryAgainstStoreOptions, ReadQueryOptions } from './types';
import { Policies } from './policies';
import { MissingFieldError } from '../core/types/common';
export declare type VariableMap = {
    [name: string]: any;
};
export declare type ExecResult<R = any> = {
    result: R;
    missing?: MissingFieldError[];
};
export interface StoreReaderConfig {
    addTypename?: boolean;
    policies: Policies;
}
export declare class StoreReader {
    private config;
    constructor(config: StoreReaderConfig);
    readQueryFromStore<QueryType>(options: ReadQueryOptions): QueryType | undefined;
    diffQueryAgainstStore<T>({ store, query, rootId, variables, returnPartialData, }: DiffQueryAgainstStoreOptions): Cache.DiffResult<T>;
    private executeSelectionSet;
    private executeSubSelectedArray;
}
//# sourceMappingURL=readFromStore.d.ts.map