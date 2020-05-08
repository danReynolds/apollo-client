import { DocumentNode } from 'graphql';
import { SubscriptionHookOptions } from '../types/types';
import { OperationVariables } from '../../core/types';
export declare function useSubscription<TData = any, TVariables = OperationVariables>(subscription: DocumentNode, options?: SubscriptionHookOptions<TData, TVariables>): {
    variables: TVariables | undefined;
    loading: boolean;
    data?: TData | undefined;
    error?: import("../..").ApolloError | undefined;
};
//# sourceMappingURL=useSubscription.d.ts.map