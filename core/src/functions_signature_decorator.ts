import { FunctionParameterTypes, FunctionReturnTypes } from "@domain/metadata/types";
import { Entity, EntityProperty } from "@domain/metadata/entity";

export interface FunctionContext {
    entityOfCurrentRecord: Entity;
    propertyInCurrentRecord: EntityProperty;
    referencedEntity: Entity;
}

export interface FunctionReturn {
    types: FunctionReturnTypes[];
    has$Identifier?: boolean;
    hasNon$Identifier?: boolean;
}

export interface FunctionParameter {
    name: string;
    types: FunctionParameterTypes[];
    deny$Identifier?: boolean;
    denyNon$Identifier?: boolean;
    optional?: boolean;
}

export interface FunctionSignature {
    name: string;
    ret: FunctionReturn;
    description: string;
    params: FunctionParameter[];
}
const FunctionSignatures: { [fn: string]: FunctionSignature } = {};
export function functionSignature(name: string, ret: FunctionReturn, desc: string, ...params: FunctionParameter[]) {
    let optionalParamsStarted = false;
    for (let [i, p] of params.entries()) {
        if (optionalParamsStarted && !p.optional) throw new Error("all parameters following an optional parameter must be optional");
        if (p.optional) optionalParamsStarted = true;
    }
    FunctionSignatures[name] = { name, description: desc, ret, params };
}
export function getFunctionSignature(fName: string): FunctionSignature | undefined {
    return FunctionSignatures[fName];
}
export function funSignature(fName: string, ret: FunctionReturn, desc: string, ...params: FunctionParameter[]) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        functionSignature(fName, ret, desc, ...params);
    };
}
export function funSignatureProp(fName: string, ret: FunctionReturn, desc: string, ...params: FunctionParameter[]) {
    return function (
        target: any,
        propertyKey: string
    ) {
        functionSignature(fName, ret, desc, ...params);
    };
}
