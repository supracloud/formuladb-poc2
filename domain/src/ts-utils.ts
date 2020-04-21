/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

export type PickOmit<O, K extends keyof O> = Pick<O, Exclude<keyof O, K>>;
export function objKeysTyped<T extends {[x: string]: any}>(obj: T): (keyof T)[] {
    return Object.keys(obj) as any as (keyof T)[];
}

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

export type ValuesOf<T extends any[]>= T[number];

export async function waitUntil<T>(callback: () => T | Promise<T>, retries = 10, sleepTime = 50): Promise<T> {
    let retryNb = 0;
    return new Promise<T>((resolve, reject) => {
        let interval = setInterval(async () => {
            let x: T | Promise<T> = callback();
            retryNb++;
            if (x instanceof Promise) x = await x;
            if (!x) {
                if (retryNb >= retries) {
                    reject(new Error(`wait retries finished for ` + callback.toString()));
                    clearInterval(interval);
                }
            } else {
                resolve(x);
                clearInterval(interval);
            }
        }, sleepTime)
    });
}

export class LazyInit<T> {
    private value: T | null = null;

    constructor(private callback: () => Promise<T>) {
        callback().then(v => this.value = v);
    }

    public async get(): Promise<T> {
        if (null == this.value) await waitUntil(() => Promise.resolve(this.value), 500);
        if (!this.value) throw new Error(`Timeout initializing ` + this.callback);
        return this.value;
    }
}

export function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            // Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name));
        });
    });
}

export function regexExtract(val: string, regex: RegExp): RegExpMatchArray {
    let ret: RegExpMatchArray | null = val.match(regex);
    if (ret) {
        return ret;
    } else throw new Error(`${val} does not match ${regex}`);
}