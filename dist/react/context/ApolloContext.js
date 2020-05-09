import { requireReactLazily } from '../react.js';

var contextSymbol = typeof Symbol === 'function' ?
    Symbol.for('__APOLLO_CONTEXT__') :
    '__APOLLO_CONTEXT__';
function resetApolloContext() {
    var React = requireReactLazily();
    Object.defineProperty(React, contextSymbol, {
        value: React.createContext({}),
        enumerable: false,
        configurable: true,
        writable: false,
    });
}
function getApolloContext() {
    var React = requireReactLazily();
    if (!React[contextSymbol]) {
        resetApolloContext();
    }
    return React[contextSymbol];
}

export { getApolloContext, resetApolloContext };
//# sourceMappingURL=ApolloContext.js.map
