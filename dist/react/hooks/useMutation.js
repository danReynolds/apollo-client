import { __assign } from 'tslib';
import { requireReactLazily } from '../react.js';
import { getApolloContext } from '../context/ApolloContext.js';
import { MutationData } from '../data/MutationData.js';

function useMutation(mutation, options) {
    var _a = requireReactLazily(), useContext = _a.useContext, useState = _a.useState, useRef = _a.useRef, useEffect = _a.useEffect;
    var context = useContext(getApolloContext());
    var _b = useState({ called: false, loading: false }), result = _b[0], setResult = _b[1];
    var updatedOptions = options ? __assign(__assign({}, options), { mutation: mutation }) : { mutation: mutation };
    var mutationDataRef = useRef();
    function getMutationDataRef() {
        if (!mutationDataRef.current) {
            mutationDataRef.current = new MutationData({
                options: updatedOptions,
                context: context,
                result: result,
                setResult: setResult
            });
        }
        return mutationDataRef.current;
    }
    var mutationData = getMutationDataRef();
    mutationData.setOptions(updatedOptions);
    mutationData.context = context;
    useEffect(function () { return mutationData.afterExecute(); });
    return mutationData.execute(result);
}

export { useMutation };
//# sourceMappingURL=useMutation.js.map
