declare const _default: <TArgs extends any[], TResult>(reject: (reason: any) => any, cb: (...args: TArgs) => TResult) => (...args: TArgs) => TResult;
export default _default;
export declare function withWarning(func: Function, regex: RegExp): Promise<any>;
export declare function withError(func: Function, regex: RegExp): any;
//# sourceMappingURL=wrap.d.ts.map