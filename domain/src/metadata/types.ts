export interface BaseType { name: string }
export interface UndefinedType extends BaseType { name: "UndefinedType" }
export interface NumberType extends BaseType { name: "NumberType" }
export interface NumberAggType extends BaseType { name: "NumberAggType" }
export interface TextType extends BaseType { name: "TextType" }
export interface TextListType extends BaseType { name: "TextListType" }
export interface TextEnumType extends BaseType { name: "TextEnumType", values: string[] }
export interface RichTextType extends BaseType { name: "RichTextType" }
export interface TextAggType extends BaseType { name: "TextAggType" }
export interface BooleanType extends BaseType { name: "BooleanType" }
export interface DatetimeType extends BaseType { name: "DatetimeType", timeMandatory?: boolean }
export interface OptionsType extends BaseType { name: "OptionsType" }
export interface NumberRangeType extends BaseType { name: "NumberRangeType" }
export interface DatetimeRangeType extends BaseType { name: "DatetimeRangeType" }
export interface MediaType extends BaseType { name: "MediaType" }
export interface TableNameType extends BaseType { name: "TableNameType", tableName: string }
interface ColumnBaseType extends BaseType {
    tableName: string;
    columnName: string;
    actualType: ColumnTypes;
}
export interface TableAndColumnNameType extends ColumnBaseType { name: "TableAndColumnNameType" }
export interface CurrentTableColumnNameType extends ColumnBaseType { name: "CurrentTableColumnNameType" }
export interface ReferencedTableColumnNameType extends ColumnBaseType { name: "ReferencedTableColumnNameType" }
export interface RefToColumnNameType extends ColumnBaseType { name: "RefToColumnNameType", referencedTableName: string }
export interface KeyColumnNameType extends ColumnBaseType { name: "KeyColumnNameType" }
export interface ActionType extends BaseType { name: "ActionType" }
export interface TriggerType extends BaseType { name: "TriggerType" }
export interface InputColumnType extends BaseType { name: "InputColumnType" }
export interface LookupType extends BaseType { name: "LookupType" }
export interface ChildTableType extends BaseType { name: "ChildTableType" }
export interface FunctionNameType extends BaseType { name: "FunctionNameType" }

export class AllTypesSet {
    UndefinedType: UndefinedType;
    NumberType: NumberType;
    NumberAggType: NumberAggType;
    TextType: TextType;
    TextEnumType: TextEnumType;
    TextListType: TextListType;
    RichTextType: RichTextType;
    TextAggType: TextAggType;
    BooleanType: BooleanType;
    DatetimeType: DatetimeType;
    OptionsType: OptionsType;
    NumberRangeType: NumberRangeType;
    DatetimeRangeType: DatetimeRangeType;
    MediaType: MediaType;
    TableNameType: TableNameType;
    TableAndColumnNameType: TableAndColumnNameType;
    CurrentTableColumnNameType: CurrentTableColumnNameType;
    ReferencedTableColumnNameType: ReferencedTableColumnNameType;
    RefToColumnNameType: RefToColumnNameType;
    KeyColumnNameType: KeyColumnNameType;
    ActionType: ActionType;
    TriggerType: TriggerType;
    InputColumnType: InputColumnType;
    LookupType: LookupType;
    ChildTableType: ChildTableType;
    FunctionNameType: FunctionNameType;
};
export type TypesSet = Partial<AllTypesSet>;
export type AllTypesSetPartial = Partial<{ [k in keyof AllTypesSet]:
    Partial<AllTypesSet[k]> & Pick<AllTypesSet[k], "name"> }>
export type AnyType = AllTypesSet[keyof AllTypesSet];
export type PartialType<T extends AnyType> = (Partial<T> & Pick<T, "name">) | keyof AllTypesSet;

export type AstNodeAllowedPartialTypesSet = AllTypesSetPartial;
export type AstNodeReturnTypes = AnyType;

export function types2set(types: PartialType<AnyType>[]): AstNodeAllowedPartialTypesSet {
    let typesSet = {} as AllTypesSetPartial;
    for (let t of types) {
        if (typeof t === "string") {
            Object.assign(typesSet, { [t]: { name: t } } as TypesSet);
        } else {
            Object.assign(typesSet, { [t.name]: t } as TypesSet);
        }
    }
    return typesSet;
}
export function putTypeInSet(typesSet: AllTypesSetPartial, t: PartialType<AnyType>) {
    if (t == null || typesSet == null) {
        throw new Error(`Received empty type or type set ${t}, ${typesSet}`);
    }
    else if (typeof t === "string") {
        Object.assign(typesSet, { [t]: { name: t } } as TypesSet);
    } else {
        Object.assign(typesSet, { [t.name]: t } as TypesSet);
    }
}
export function hasTypeInSet(typesSet: AllTypesSetPartial, t: PartialType<AnyType>): boolean {
    for (let [k, v] of Object.entries(typesSet)) {
        if (typeof t === "string") {
            if (t === v?.name) return true;
        } else {
            if (t.name === v?.name) return true;
        }
    }
    return false;
}
export function isEqual(t1: PartialType<AnyType>, t2: PartialType<AnyType>) {
    if (typeof t1 === "string") {
        if (typeof t2 === "string") return t1 == t2;
        else return t1 == t2.name;
    } else {
        if (typeof t2 === "string") return t1.name == t2;
        else return t1.name == t2.name;
    }
}
export function isAssignableTo(tys1: PartialType<AnyType>[] | undefined, tys2: PartialType<AnyType>[] | undefined): boolean {
    if (!tys1 || !tys2) return false;

    for (let t2 of tys2) {
        let t2Found = false;
        for (let t1 of tys1) {
            if (isEqual(t1, t2)) {
                t2Found = true; break;
            }

            if (typeof t2 === "object" && "actualType" in t2 && t2.actualType) {
                if (isEqual(t1, t2.actualType)) { t2Found = true; break; }
            }
            if (typeof t1 === "object" && "actualType" in t1 && t1.actualType) {
                if (isEqual(t1.actualType, t2)) { t2Found = true; break; }
            }
            if (typeof t1 === "object" && t1.name === "CurrentTableColumnNameType"
                && typeof t2 === "object" && t2.name === "RefToColumnNameType") {
                    //t2 is a more specialized type of "current table column" so it is assignable to t1, but not the other way around, t1 needs to be more generic than t2
                    t2Found = true; 
                    break;
                }
        }

        if (!t2Found) return false;
    }
    return true;
}
export function types2str(tys: PartialType<AnyType>[]): string {
    return (tys || []).map(t => typeof t === "object" ? t.name : t)
        .map(n => n.replace(/Type$/, '')).join(', ');
}

export type ScalarValueTypes = NumberType | TextType | BooleanType | DatetimeType;
export const ScalarValueTypeNames = ["NumberType", "TextType", "BooleanType", "DatetimeType"];
export function isScalarValueTypes(param: BaseType): param is ScalarValueTypes {
    return ScalarValueTypeNames.includes(param.name);
}
export type AggregateValueTypes = NumberAggType | TextAggType;
export const AggregateValueTypeNames = ["NumberAggType", "TextAggType"];
export function isAggregateValueTypes(param: BaseType): param is AggregateValueTypes {
    return AggregateValueTypeNames.includes(param.name);
}
export type IdentifierTypes = TableNameType | TableAndColumnNameType
    | CurrentTableColumnNameType | ReferencedTableColumnNameType | RefToColumnNameType | KeyColumnNameType;
export const IdentifierTypeNames = ["TableNameType", "TableAndColumnNameType", "CurrentTableColumnNameType",
    "ReferencedTableColumnNameType", "RefToColumnNameType", "KeyColumnNameType"];
export function isIdentifierTypes(param: BaseType): param is IdentifierTypes {
    return IdentifierTypeNames.includes(param.name);
}
export type FunctionParameterTypes = ScalarValueTypes
    | Pick<IdentifierTypes, "name">
    | TextEnumType
    | RichTextType
    | NumberRangeType
    | DatetimeRangeType
    | TextListType;

export type FunctionReturnTypes = ScalarValueTypes | TextAggType | TextListType | NumberAggType | NumberRangeType | DatetimeRangeType | InputColumnType | ActionType | TriggerType;
export const FunctionReturnTypeNames = ScalarValueTypeNames
    .concat(["TextAggType", "NumberAggType", "NumberRangeType", "DatetimeRangeType", "InputColumnType"]);
export function isFunctionReturnTypes(param: BaseType): param is FunctionReturnTypes {
    return FunctionReturnTypeNames.includes(param.name);
}

export type FormulaReturnTypes = ScalarValueTypes | TextAggType | NumberAggType | InputColumnType | ActionType | TriggerType;
export const FormulaReturnTypeNames = ScalarValueTypeNames
    .concat(["TextAggType", "NumberAggType", "InputColumnType"]);
export function isFormulaReturnTypes(param: BaseType): param is FormulaReturnTypes {
    return FormulaReturnTypeNames.includes(param.name);
}

export type ColumnInputTypes = ScalarValueTypes | TextEnumType | RichTextType | MediaType;
export type ColumnTypes = ColumnInputTypes | TriggerType | ChildTableType;

export type NumericColumnTypes = NumberType | NumberAggType;
export const NumericColumnTypeNames = ["NumberType", "NumberAggType"];
export function isNumericColumnTypes(param: BaseType): param is NumericColumnTypes {
    return NumericColumnTypeNames.includes(param.name);
}

export const TyScalarValues: ScalarValueTypes[] = [{ name: "NumberType" }, { name: "TextType" }, { name: "BooleanType" }];
