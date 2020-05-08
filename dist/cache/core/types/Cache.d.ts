import { DataProxy } from './DataProxy';
export declare namespace Cache {
    type WatchCallback = (newData: any) => void;
    interface ReadOptions<TVariables = any> extends DataProxy.Query<TVariables> {
        rootId?: string;
        previousResult?: any;
        optimistic: boolean;
    }
    interface WriteOptions<TResult = any, TVariables = any> extends DataProxy.Query<TVariables> {
        dataId: string;
        result: TResult;
    }
    interface DiffOptions extends ReadOptions {
        returnPartialData?: boolean;
    }
    interface WatchOptions extends ReadOptions {
        immediate?: boolean;
        callback: WatchCallback;
    }
    export import DiffResult = DataProxy.DiffResult;
    export import WriteQueryOptions = DataProxy.WriteQueryOptions;
    export import WriteFragmentOptions = DataProxy.WriteFragmentOptions;
    export import Fragment = DataProxy.Fragment;
}
//# sourceMappingURL=Cache.d.ts.map