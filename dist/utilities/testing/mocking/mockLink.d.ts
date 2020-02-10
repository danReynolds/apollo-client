/// <reference types="zen-observable" />
import { Observable } from '../../../utilities/observables/Observable';
import { ApolloLink } from '../../../link/core/ApolloLink';
import { Operation, GraphQLRequest, FetchResult } from '../../../link/core/types';
export declare type ResultFunction<T> = () => T;
export interface MockedResponse {
    request: GraphQLRequest;
    result?: FetchResult | ResultFunction<FetchResult>;
    error?: Error;
    delay?: number;
    newData?: ResultFunction<FetchResult>;
}
export declare class MockLink extends ApolloLink {
    operation: Operation;
    addTypename: Boolean;
    private mockedResponsesByKey;
    constructor(mockedResponses: ReadonlyArray<MockedResponse>, addTypename?: Boolean);
    addMockedResponse(mockedResponse: MockedResponse): void;
    request(operation: Operation): Observable<FetchResult> | null;
    private normalizeMockedResponse;
}
interface MockApolloLink extends ApolloLink {
    operation?: Operation;
}
export declare function mockSingleLink(...mockedResponses: Array<any>): MockApolloLink;
export {};
//# sourceMappingURL=mockLink.d.ts.map