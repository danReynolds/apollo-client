import { DocumentNode } from 'graphql';
import { isReference, StoreValue, StoreObject, Reference } from '../../../utilities/graphql/storeUtils';
import { ToReferenceFunction } from '../../inmemory/entityStore';
export declare type SafeReadonly<T> = T extends object ? Readonly<T> : T;
export declare type Modifier<T> = (value: T, details: {
    DELETE: any;
    fieldName: string;
    storeFieldName: string;
    isReference: typeof isReference;
    toReference: ToReferenceFunction;
    readField<V = StoreValue>(fieldName: string, objOrRef?: StoreObject | Reference): SafeReadonly<V>;
}) => T;
export declare type Modifiers = {
    [fieldName: string]: Modifier<any>;
};
export declare class MissingFieldError {
    readonly message: string;
    readonly path: (string | number)[];
    readonly query: DocumentNode;
    readonly variables: Record<string, any>;
    constructor(message: string, path: (string | number)[], query: DocumentNode, variables: Record<string, any>);
}
//# sourceMappingURL=common.d.ts.map