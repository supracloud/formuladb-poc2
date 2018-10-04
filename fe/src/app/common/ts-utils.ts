/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

export type StringOmit<L1 extends string, L2 extends string> = ({[P in L1]: P } &
    {[P in L2]: never } & { [key: string]: never })[L1];

export type PickOmit<O, K extends keyof O> = Pick<O, StringOmit<keyof O, K>>;

export function obj2MapES5<V>(o: {[x: string]: V}): Map<string, V> {
    return Object.keys(o).reduce((m, k) => m.set(k, o[k]), new Map())
}

export const X1 = 'X1';
export const NN = {
    X1: X1,
}
export function isType<K extends keyof typeof NN, T>(t: K, p: any): p is T {
    return p !== null && p.frmdbt_ === t;
}
