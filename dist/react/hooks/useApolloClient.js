import { invariant } from 'ts-invariant';
import { requireReactLazily } from '../react.js';
import { getApolloContext } from '../context/ApolloContext.js';

function useApolloClient() {
    var React = requireReactLazily();
    var client = React.useContext(getApolloContext()).client;
    process.env.NODE_ENV === "production" ? invariant(client, 6) : invariant(client, 'No Apollo Client instance can be found. Please ensure that you ' +
        'have called `ApolloProvider` higher up in your tree.');
    return client;
}

export { useApolloClient };
//# sourceMappingURL=useApolloClient.js.map
