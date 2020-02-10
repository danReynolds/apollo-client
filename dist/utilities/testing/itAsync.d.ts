declare const wrappedIt: (message: string, callback: (resolve: (result?: any) => void, reject: (reason?: any) => void) => any, timeout?: number) => void;
export declare function itAsync(...args: Parameters<typeof wrappedIt>): any;
export declare namespace itAsync {
    const only: (message: string, callback: (resolve: (result?: any) => void, reject: (reason?: any) => void) => any, timeout?: number) => void;
    const skip: (message: string, callback: (resolve: (result?: any) => void, reject: (reason?: any) => void) => any, timeout?: number) => void;
    const todo: (message: string, callback: (resolve: (result?: any) => void, reject: (reason?: any) => void) => any, timeout?: number) => void;
}
export {};
//# sourceMappingURL=itAsync.d.ts.map