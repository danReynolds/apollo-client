import { invariant } from 'ts-invariant';
import { NetworkStatus } from './networkStatus.js';

var Reobserver = (function () {
    function Reobserver(observer, options, fetch, shouldFetch) {
        this.observer = observer;
        this.options = options;
        this.fetch = fetch;
        this.shouldFetch = shouldFetch;
    }
    Reobserver.prototype.reobserve = function (newOptions, newNetworkStatus) {
        if (newOptions) {
            this.updateOptions(newOptions);
        }
        else {
            this.updatePolling();
        }
        var concast = this.fetch(this.options, newNetworkStatus);
        if (this.concast) {
            this.concast.removeObserver(this.observer, true);
        }
        concast.addObserver(this.observer);
        return (this.concast = concast).promise;
    };
    Reobserver.prototype.updateOptions = function (newOptions) {
        var _this = this;
        Object.keys(newOptions).forEach(function (key) {
            var value = newOptions[key];
            if (value !== void 0) {
                _this.options[key] = value;
            }
        });
        this.updatePolling();
        return this;
    };
    Reobserver.prototype.stop = function () {
        if (this.concast) {
            this.concast.removeObserver(this.observer);
            delete this.concast;
        }
        if (this.pollingInfo) {
            clearTimeout(this.pollingInfo.timeout);
            this.options.pollInterval = 0;
            this.updatePolling();
        }
    };
    Reobserver.prototype.updatePolling = function () {
        var _this = this;
        var _a = this, pollingInfo = _a.pollingInfo, pollInterval = _a.options.pollInterval;
        if (!pollInterval) {
            if (pollingInfo) {
                clearTimeout(pollingInfo.timeout);
                delete this.pollingInfo;
            }
            return;
        }
        if (pollingInfo &&
            pollingInfo.interval === pollInterval) {
            return;
        }
        process.env.NODE_ENV === "production" ? process.env.NODE_ENV === "production" ? invariant(pollInterval, 57) : invariant(pollInterval, 15) : process.env.NODE_ENV === "production" ? invariant(pollInterval, 58) : invariant(pollInterval, 'Attempted to start a polling query without a polling interval.');
        if (this.shouldFetch === false) {
            return;
        }
        var info = pollingInfo || (this.pollingInfo = {});
        info.interval = pollInterval;
        var maybeFetch = function () {
            if (_this.pollingInfo) {
                if (_this.shouldFetch && _this.shouldFetch()) {
                    _this.reobserve({
                        fetchPolicy: "network-only",
                    }, NetworkStatus.poll).then(poll, poll);
                }
                else {
                    poll();
                }
            }
        };
        var poll = function () {
            var info = _this.pollingInfo;
            if (info) {
                clearTimeout(info.timeout);
                info.timeout = setTimeout(maybeFetch, info.interval);
            }
        };
        poll();
    };
    return Reobserver;
}());

export { Reobserver };
//# sourceMappingURL=Reobserver.js.map
