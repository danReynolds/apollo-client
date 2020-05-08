import { invariant } from 'ts-invariant';

function toPromise(observable) {
    var completed = false;
    return new Promise(function (resolve, reject) {
        observable.subscribe({
            next: function (data) {
                if (completed) {
                    process.env.NODE_ENV === "production" || (process.env.NODE_ENV === "production" || invariant.warn("Promise Wrapper does not support multiple results from Observable"));
                }
                else {
                    completed = true;
                    resolve(data);
                }
            },
            error: reject,
        });
    });
}

export { toPromise };
//# sourceMappingURL=toPromise.js.map
