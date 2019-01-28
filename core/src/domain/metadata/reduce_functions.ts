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