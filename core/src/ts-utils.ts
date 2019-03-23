/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

export type PickOmit<O, K extends keyof O> = Pick<O, Exclude<keyof O, K>>;

export function obj2MapES5<V>(o: { [x: string]: V }): Map<string, V> {
    return Object.keys(o).reduce((m, k) => m.set(k, o[k]), new Map())
}

export const X1 = 'X1';
export const NN = {
    X1: X1,
}
export function isType<K extends keyof typeof NN, T>(t: K, p: any): p is T {
    return p !== null && p.frmdbt_ === t;
}


export async function waitUntilNotNull<T>(callback: () => Promise<T>, sleepTime = 250): Promise<Exclude<T, null | undefined>> {
    let ret: T = await callback();
    if (ret) return Promise.resolve(ret as Exclude<T, null | undefined>);
    return new Promise<Exclude<T, null | undefined>>(resolve => {
        let interval = setInterval(async () => {
            let x: T = await callback();
            if (x) {
                resolve(x as Exclude<T, null | undefined>);
                clearInterval(interval);
            }
        }, sleepTime)
    });
}
