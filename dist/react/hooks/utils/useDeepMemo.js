import { equal } from '@wry/equality';
import { requireReactLazily } from '../../react.js';

function useDeepMemo(memoFn, key) {
    var React = requireReactLazily();
    var useRef = React.useRef;
    var ref = useRef();
    if (!ref.current || !equal(key, ref.current.key)) {
        ref.current = { key: key, value: memoFn() };
    }
    return ref.current.value;
}

export { useDeepMemo };
//# sourceMappingURL=useDeepMemo.js.map
