import { DocumentNode } from 'graphql';
import { MutationHookOptions, MutationTuple } from '../types/types';
import { OperationVariables } from '../../core/types';
export declare function useMutation<TData = any, TVariables = OperationVariables>(mutation: DocumentNode, options?: MutationHookOptions<TData, TVariables>): MutationTuple<TData, TVariables>;
//# sourceMappingURL=useMutation.d.ts.map