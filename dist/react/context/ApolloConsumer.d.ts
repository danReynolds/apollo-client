/// <reference types="react" />
import { ApolloClient } from '../../ApolloClient';
export interface ApolloConsumerProps {
    children: (client: ApolloClient<object>) => React.ReactChild | null;
}
export declare const ApolloConsumer: React.FC<ApolloConsumerProps>;
//# sourceMappingURL=ApolloConsumer.d.ts.map