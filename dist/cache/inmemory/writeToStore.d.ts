import { SelectionSetNode, DocumentNode } from 'graphql';
import { FragmentMap } from '../../utilities/graphql/fragments';
import { Policies, ReadMergeContext } from './policies';
import { NormalizedCache } from './types';
export interface WriteContext extends ReadMergeContext {
    readonly store: NormalizedCache;
    readonly written: {
        [dataId: string]: SelectionSetNode[];
    };
    readonly fragmentMap?: FragmentMap;
    merge<T>(existing: T, incoming: T): T;
}
export interface StoreWriterConfig {
    policies: Policies;
}
export declare class StoreWriter {
    private policies;
    constructor(config: StoreWriterConfig);
    writeQueryToStore({ query, result, dataId, store, variables, }: {
        query: DocumentNode;
        result: Object;
        dataId?: string;
        store?: NormalizedCache;
        variables?: Object;
    }): NormalizedCache;
    private processSelectionSet;
    private processFieldValue;
}
//# sourceMappingURL=writeToStore.d.ts.map