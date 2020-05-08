import { invariant } from 'ts-invariant';
import { requireReactLazily } from '../react.js';
import { getApolloContext } from './ApolloContext.js';

var ApolloConsumer = function (props) {
    var React = requireReactLazily();
    var ApolloContext = getApolloContext();
    return React.createElement(ApolloContext.Consumer, null, function (context) {
        process.env.NODE_ENV === "production" ? process.env.NODE_ENV === "production" ? invariant(context && context.client, 23) : invariant(context && context.client, 8) : process.env.NODE_ENV === "production" ? invariant(context && context.client, 24) : invariant(context && context.client, 'Could not find "client" in the context of ApolloConsumer. ' +
            'Wrap the root component in an <ApolloProvider>.');
        return props.children(context.client);
    });
};

export { ApolloConsumer };
//# sourceMappingURL=ApolloConsumer.js.map
