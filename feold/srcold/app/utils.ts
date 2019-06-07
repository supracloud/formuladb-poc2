export declare type SmartChange<T> = {
    previousValue?: T;
    currentValue: T;
    firstChange: boolean;
    constructor(previousValue: T | null, currentValue: T, firstChange: boolean);
    isFirstChange(): boolean;
}

export declare type SmartChanges<T> = {
    [Key in keyof T]?: SmartChange<T[Key]>;
};
