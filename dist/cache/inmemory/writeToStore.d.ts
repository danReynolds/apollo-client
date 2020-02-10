import { SelectionSetNode, DocumentNode } from 'graphql';
import { FragmentMap } from '../../utilities/graphql/fragments';
import { Policies } from './policies';
import { NormalizedCache } from './types';
export declare type WriteContext = {
    readonly store: NormalizedCache;
    readonly written: {
        [dataId: string]: SelectionSetNode[];
    };
    readonly variables?: any;
    readonly fragmentMap?: FragmentMap;
    merge<T>(existing: T, incoming: T): T;
};
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
    private writeSelectionSetToStore;
    private processSelectionSet;
    private processFieldValue;
}
//# sourceMappingURL=writeToStore.d.ts.map