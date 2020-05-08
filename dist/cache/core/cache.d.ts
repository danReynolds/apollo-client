import { DocumentNode } from 'graphql';
import { StoreObject } from '../../utilities/graphql/storeUtils';
import { DataProxy } from './types/DataProxy';
import { Cache } from './types/Cache';
import { Modifier, Modifiers } from './types/common';
export declare type Transaction<T> = (c: ApolloCache<T>) => void;
export declare abstract class ApolloCache<TSerialized> implements DataProxy {
    abstract read<T, TVariables = any>(query: Cache.ReadOptions<TVariables>): T | null;
    abstract write<TResult = any, TVariables = any>(write: Cache.WriteOptions<TResult, TVariables>): void;
    abstract diff<T>(query: Cache.DiffOptions): Cache.DiffResult<T>;
    abstract watch(watch: Cache.WatchOptions): () => void;
    abstract reset(): Promise<void>;
    abstract evict(dataId: string, fieldName?: string): boolean;
    abstract restore(serializedState: TSerialized): ApolloCache<TSerialized>;
    abstract extract(optimistic?: boolean): TSerialized;
    abstract removeOptimistic(id: string): void;
    abstract performTransaction(transaction: Transaction<TSerialized>): void;
    abstract recordOptimisticTransaction(transaction: Transaction<TSerialized>, id: string): void;
    transformDocument(document: DocumentNode): DocumentNode;
    identify(object: StoreObject): string | undefined;
    modify(modifiers: Modifier<any> | Modifiers, dataId?: string, optimistic?: boolean): boolean;
    gc(): string[];
    transformForLink(document: DocumentNode): DocumentNode;
    readQuery<QueryType, TVariables = any>(options: DataProxy.Query<TVariables>, optimistic?: boolean): QueryType | null;
    private getFragmentDoc;
    readFragment<FragmentType, TVariables = any>(options: DataProxy.Fragment<TVariables>, optimistic?: boolean): FragmentType | null;
    writeQuery<TData = any, TVariables = any>(options: Cache.WriteQueryOptions<TData, TVariables>): void;
    writeFragment<TData = any, TVariables = any>(options: Cache.WriteFragmentOptions<TData, TVariables>): void;
}
//# sourceMappingURL=cache.d.ts.map