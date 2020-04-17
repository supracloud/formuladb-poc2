export type ReduceFun =
    | SumReduceFun
    | CountReduceFun
    | TextjoinReduceFun
    | MinReduceFun
    | MaxReduceFun
    | AvgReduceFun
    | FirstReduceFun
    | LastReduceFun
;

export const MinReduceFunN = "MinReduceFunN";
export interface MinReduceFun {
    name: "MinReduceFunN";
}
export const MaxReduceFunN = "MaxReduceFunN";
export interface MaxReduceFun {
    name: "MaxReduceFunN";
}
export const AvgReduceFunN = "AvgReduceFunN";
export interface AvgReduceFun {
    name: "AvgReduceFunN";
}
export const FirstReduceFunN = "FirstReduceFunN";
export interface FirstReduceFun {
    name: "FirstReduceFunN";
}
export const LastReduceFunN = "LastReduceFunN";
export interface LastReduceFun {
    name: "LastReduceFunN";
}

export const SumReduceFunN = "SumReduceFunN";
export interface SumReduceFun {
    name: "SumReduceFunN";
}

export const CountReduceFunN = "CountReduceFunN";
export interface CountReduceFun {
    name: "CountReduceFunN";
}

export const TextjoinReduceFunN = "TextjoinReduceFunN";
export interface TextjoinReduceFun {
    name: "TextjoinReduceFunN";
    delimiter: string;
}

export const ReduceFunDefaultValue = {
    [SumReduceFunN]: 0,
    [CountReduceFunN]: 0,
    [TextjoinReduceFunN]: '',
};

export class SumReduceFunApply {
    constructor(public rFun: SumReduceFun) {}
    add(currentVal: number, newVal: number): number {
        return currentVal + newVal;
    }
    delete(currentVal: number, oldVal: number): number {
        return currentVal - oldVal;
    }
    modify(currentVal: number, oldVal: number, newVal: number) {
        return currentVal - oldVal + newVal;
    }
}

export class CountReduceFunApply {
    constructor(public rFun: CountReduceFun) {}
    add(currentVal: number, newVal: number): number {
        return currentVal + 1;
    }
    delete(currentVal: number, oldVal: number): number {
        return currentVal - 1;
    }
    modify(currentVal: number, oldVal: number, newVal: number) {
        return currentVal;
    }
}

export class TextjoinReduceFunApply {
    constructor(public rFun: TextjoinReduceFun) {}
    currentValues(currentVal: string): string[] {
        let currentValues = currentVal.split(this.rFun.delimiter);
        if (!currentValues[0]) currentValues = currentValues.slice(1);
        return currentValues;
    }
    add(currentVal: string, newVal: string): string {
        return this.currentValues(currentVal).concat(newVal).join(this.rFun.delimiter);
    }
    delete(currentVal: string, oldVal: string): string {
        return this.currentValues(currentVal).filter(x => x !== oldVal).join(this.rFun.delimiter);
    }
    modify(currentVal: string, oldVal: string, newVal: string) {
        return this.add(this.delete(currentVal, oldVal), newVal);
    }
}

export function getReduceFunApply(rFun: SumReduceFun | CountReduceFun | TextjoinReduceFun) {
    switch(rFun.name) {
        case "SumReduceFunN": return new SumReduceFunApply(rFun);
        case "CountReduceFunN": return new CountReduceFunApply(rFun);
        case "TextjoinReduceFunN": return new TextjoinReduceFunApply(rFun);
        default: throw new Error(`Unknown reduce fun ${JSON.stringify(rFun)}`);
    }
}
