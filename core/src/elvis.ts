/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

/**
 * Watch for this issue: https://github.com/Microsoft/TypeScript/issues/16
 * When it is solved we will not need these functions
 */

 export function elvis<T extends Object>(val: T | null | undefined): Partial<T> {
    return null == val ? {} : val;
}

export function elvis_a<K, T extends Array<K>>(val: T | null | undefined): Array<K> {
    return null == val ? [] : val;
}
