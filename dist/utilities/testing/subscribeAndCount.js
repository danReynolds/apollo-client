import { asyncMap } from '../../utilities/observables/observables';
export default function subscribeAndCount(reject, observable, cb) {
    var handleCount = 0;
    var subscription = asyncMap(observable, function (result) {
        try {
            return cb(++handleCount, result);
        }
        catch (e) {
            setImmediate(function () {
                subscription.unsubscribe();
                reject(e);
            });
        }
    }).subscribe({
        error: reject,
    });
    return subscription;
}
//# sourceMappingURL=subscribeAndCount.js.map