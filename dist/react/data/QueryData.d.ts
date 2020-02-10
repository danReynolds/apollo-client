import { QueryResult, QueryDataOptions, QueryTuple } from '../types/types';
import { OperationData } from './OperationData';
export declare class QueryData<TData, TVariables> extends OperationData {
    private previousData;
    private currentObservable;
    private forceUpdate;
    private runLazy;
    private lazyOptions?;
    constructor({ options, context, forceUpdate }: {
        options: QueryDataOptions<TData, TVariables>;
        context: any;
        forceUpdate: any;
    });
    execute(): QueryResult<TData, TVariables>;
    executeLazy(): QueryTuple<TData, TVariables>;
    fetchData(): Promise<void> | boolean;
    afterExecute({ queryResult, lazy, }: {
        queryResult: QueryResult<TData, TVariables>;
        lazy?: boolean;
    }): any;
    cleanup(): void;
    getOptions(): any;
    private runLazyQuery;
    private getExecuteResult;
    private getExecuteSsrResult;
    private prepareObservableQueryOptions;
    private initializeObservableQuery;
    private updateObservableQuery;
    private startQuerySubscription;
    private resubscribeToQuery;
    private getQueryResult;
    private handleErrorOrCompleted;
    private removeQuerySubscription;
    private obsRefetch;
    private obsFetchMore;
    private obsUpdateQuery;
    private obsStartPolling;
    private obsStopPolling;
    private obsSubscribeToMore;
    private observableQueryFields;
}
//# sourceMappingURL=QueryData.d.ts.map