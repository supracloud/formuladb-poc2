export type ReduceFun =
    | SumReduceFun
    | CountReduceFun
    | TextjoinReduceFun
;

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
