import { DocumentNode } from 'graphql';
import { QueryHookOptions, QueryTuple, QueryResult } from '../../types/types';
import { OperationVariables } from '../../../core/types';
export declare function useBaseQuery<TData = any, TVariables = OperationVariables>(query: DocumentNode, options?: QueryHookOptions<TData, TVariables>, lazy?: boolean): QueryTuple<TData, TVariables> | QueryResult<TData, TVariables>;
//# sourceMappingURL=useBaseQuery.d.ts.map