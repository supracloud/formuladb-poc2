import * as moment from 'moment';
import * as formulajs from 'formulajs';
import { funSignature, functionSignature, funSignatureProp, FunctionSignature, getFunctionSignature } from '@core/functions_signature_decorator';
import { toIndexableStringInHouse } from '@domain/collator';
import { _throw } from '@core/throw';
import { TyScalarValues } from '@domain/metadata/types';

export interface NumRange {
    start: number;
    end: number;
}
export function isNumRange(param): param is NumRange {
    return param && param.start && param.end &&
        typeof param.start === 'number' && typeof param.end === 'number';
}
export interface DateRange {
    start: moment.Moment;
    end: moment.Moment;
}
export function isDateRange(param): param is DateRange {
    return param && param.start && param.end &&
        typeof param.start.isSameOrBefore === "function" &&
        typeof param.end.isSameOrBefore === "function"
        ;
}

export const KEY_SEPARATOR = ';;;;';

class _ScalarFunctionsImplementations {

    @funSignature("ID", { types: [{name: "TextType"}]}, 
        "return the text value of an _id column", 
        { name: '_id', types: [{name: "TextType"}] })
    ID(_id: string) {
        return _id ? _id.replace(/^.*?~~/, '') : ''
    }
    @funSignature("KEY", { types: [{name: "TextType"}]}, 
        "combines the input values and returns a text that can be used a a search key", 
        {name: 'value1', types: TyScalarValues}, 
        {name: 'value2', types: TyScalarValues, optional: true}, 
        {name: 'value3', types: TyScalarValues, optional: true}, 
        {name: 'value4', types: TyScalarValues, optional: true})
    KEY(...values: any[]) {
        return toIndexableStringInHouse(values.length > 1 ? values : values[0]);
    }
    ///////////////////////////////////////////////////////////////////////
    // Logical
    ///////////////////////////////////////////////////////////////////////

    AND = formulajs.AND;
    OR = formulajs.OR;
    NOT = formulajs.NOT;
    @funSignatureProp("ISNUMBER", {types:[{name: "BooleanType"}]}, "returns true if value is a number", { name: 'val', types: [{name: "NumberType"}] })
    ISNUMBER = formulajs.ISNUMBER;

    @funSignature("ISBLANK", { types: [{name: "BooleanType"}]}, "returns true if value is empty", { name: 'val', types: [{name: "NumberType"}] })
    ISBLANK(val) {
        return val == "" || val == null;
    }

    @funSignature("IF", { types: [{name: "BooleanType"}]}, "returns a value of the condition is true and a different value  otherwise", { name: 'condition', types: [{name: "BooleanType"}] }, { name: 'true_value', types: [{name: "TextType"}, {name: "NumberType"}] }, { name: 'false_value', types: [{name: "TextType"}, {name: "NumberType"}] })
    IF(...args) {
        return formulajs.IF(...args);
    }
    @funSignature("SWITCH", { types: TyScalarValues}, 
        "compares a value to a list of values and returns something different for each match", 
        { name: 'value_to_compare', types: TyScalarValues }, 
        { name: 'value1', types: TyScalarValues }, 
        { name: 'return1', types: TyScalarValues }, 
        { name: 'value2', types: TyScalarValues, optional: true }, 
        { name: 'return2', types: TyScalarValues, optional: true }, 
        { name: 'value3', types: TyScalarValues, optional: true }, 
        { name: 'return3', types: TyScalarValues, optional: true }, 
        { name: 'value4', types: TyScalarValues, optional: true }, 
        { name: 'return4', types: TyScalarValues, optional: true }
    //TODO: if valueX exists, returnX must exist
    )
    SWITCH(...args) {
        return formulajs.IF(...args);
    }


    ///////////////////////////////////////////////////////////////////////
    // Text
    ///////////////////////////////////////////////////////////////////////
    @funSignature("TEXT", { types: [{name: "TextType"}]}, 
        "formats numbers and dates as text", 
        { name: "value", types: [{name: "TextType"}, {name: "NumberType"}, {name: "DatetimeType"}]}, 
        { name: 'format', types: [{name: "TextType"}] }
    )
    TEXT(expr, format) {
        let num = Number.parseFloat(expr);
        if (!isNaN(num)) {
            return formulajs.TEXT(num, format);
        } else if (expr instanceof Date || (typeof expr === "string" && expr.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d+Z/))) {
            return moment(expr).format(format);
        }
    }

    @funSignature("AS_TEXT", { types: [{name: "TextType"}]}, 
        "convert to text", 
        { name: "value", types: [{name: "TextType"}, {name: "NumberType"}, {name: "DatetimeType"}]}, 
    )
    AS_TEXT(value) {
        return '' + value;
    }

    @funSignature("FIND", {types:[{name: "NumberType"}]}, "searches a text inside another text and returns the starting position where found", { name: 'find_text', types: [{name: "TextType"}] }, { name: 'within_text', types: [{name: "TextType"}] }, { name: 'position', types: [{name: "NumberType"}]})
    FIND(find_text, within_text, position?) {
        position = (position === undefined) ? 0 : position;
        if (!within_text) return null;
        let index = within_text.indexOf(find_text, position - 1);
        return index >= 0 ? index + 1 : undefined;
    }
    @funSignatureProp("CONCATENATE", {types: [{name: "TextType"}]}, 
        "joins two or more text strings into one", 
        { name: 'text1', types: [{name: "TextType"}] }, 
        { name: 'text2', types: [{name: "TextType"}] }, 
        { name: 'text3', types: [{name: "TextType"}], optional: true }, 
        { name: 'text4', types: [{name: "TextType"}], optional: true }, 
        { name: 'text5', types: [{name: "TextType"}], optional: true }, 
        { name: 'text6', types: [{name: "TextType"}], optional: true }, 
        { name: 'text7', types: [{name: "TextType"}], optional: true }, 
    )
    CONCATENATE = formulajs.CONCATENATE;

    @funSignature("REGEXREPLACE", {types: [{name: "TextType"}]}, "replace a portion of a text string using regular expressions", { name: 'text', types: [{name: "TextType"}] }, { name: 'regular_expression', types: [{name: "TextType"}] }, { name: 'replacement', types: [{name: "TextType"}] })
    REGEXREPLACE(text, regular_expression, replacement) {
        return text.replace(new RegExp(regular_expression, 'g'), replacement);
    }
    @funSignatureProp("PROPER", {types: [{name: "TextType"}]}, "sets the first character in each word to uppercase and the rest to lowercase", { name: 'text', types: [{name: "TextType"}] } )
    PROPER = formulajs.PROPER;
    @funSignatureProp("SUBSTITUTE", {types: [{name: "TextType"}]}, "replaces part of a text string with another", { name: 'text', types: [{name: "TextType"}] }, { name: 'old_text', types: [{name: "TextType"}] }, { name: 'new_text', types: [{name: "TextType"}] }, { name: 'occurrence', types: [{name: "TextType"}], optional: true } )
    SUBSTITUTE = formulajs.SUBSTITUTE;

    ///////////////////////////////////////////////////////////////////////
    // List
    ///////////////////////////////////////////////////////////////////////

    @funSignatureProp("SPLIT_TEXT", 
        {types: [{name: "TextListType"}]}, 
        "splits text by delimiter and returns a list of texts", 
        { name: 'text', types: [{name: "TextType"}] },
        { name: 'delimiter', types: [{name: "TextType"}] },
    )
    SPLIT_TEXT(text: string, delimiter: string) {
        return text.split(delimiter);
    }

    @funSignatureProp("LIST_GET", 
        {types: [{name: "TextType"}]}, 
        "returns the element of a list at index", 
        { name: 'list', types: [{name: "TextListType"}] },
        { name: 'index', types: [{name: "NumberType"}] },
    )
    LIST_GET(list: (string|number)[], index: number) {
        return list[index - 1];
    }

    ///////////////////////////////////////////////////////////////////////
    // Math
    ///////////////////////////////////////////////////////////////////////

    @funSignature("FLOOR", { types: [{name: "NumberType"}]}, "rounds the given number down to the nearest multiple of significance", { name: 'number_value', types: [{name: "NumberType"}]}, { name: 'significance', types: [{name: "NumberType"}] })
    //TODO: implement significance
    FLOOR(number_value, significance) { return Math.floor(number_value) }
    @funSignature("MAX", { types: [{name: "NumberType"}]}, "returns the maximum between the input numbers", { name: 'number1', types: [{name: "NumberType"}]}, {name: 'number2', types: [{name: "NumberType"}], optional: true}, {name: 'number3', types: [{name: "NumberType"}], optional: true}, {name: 'number4', types: [{name: "NumberType"}], optional: true})
    MAX(number1, number2) { return Math.max(number1, number2) }
    @funSignature("ABS", {types:[{name: "NumberType"}]}, "returns the absolute value of a number, the number without its sign", { name: 'number_value', types: [{name: "NumberType"}] })
    ABS(number_value) { return Math.abs(number_value) }
    @funSignatureProp("SQRT", { types: [{name: "NumberType"}]}, "returns the square root of a number", { name: 'num', types: [{name: "NumberType"}] })
    SQRT = formulajs.SQRT;
    @funSignatureProp("ROUND", { types: [{name: "NumberType"}]}, "rounds a number to a specified number of decimal places", { name: 'num', types: [{name: "NumberType"}] }, { name: 'digits', types: [{name: "NumberType"}] })
    ROUND = formulajs.ROUND;
    @funSignatureProp("FACT", { types: [{name: "NumberType"}]}, "returns the factorial of a given number", { name: 'expr', types: [{name: "NumberType"}] })
    FACT = formulajs.FACT;

    
    ///////////////////////////////////////////////////////////////////////
    // Date
    ///////////////////////////////////////////////////////////////////////

    @funSignatureProp("TODAY", { types: [{name: "DatetimeType"}]}, "returns the current date")
    TODAY = formulajs.TODAY;
    @funSignatureProp("EOMONTH", { types: [{name: "DatetimeType"}]}, 
        "returns the end of month", 
        { name: 'start_date', types: [{name: "DatetimeType"}]}, 
        { name: 'months', types: [{name: "NumberType"}] }
    )
    EOMONTH = formulajs.EOMONTH;
    @funSignature("DATEDIF", 
        { types: [{name: "NumberType"}]}, 
        "returns the difference between two dates as years, months or days", 
        { name: 'start_date', types: [{name: "DatetimeType"}] }, 
        { name: 'end_date', types: [{name: "DatetimeType"}] }, 
        { name: 'unit', types: [{name: "TextType"}] }
    )
    DATEDIF(start_date, end_date, unit) {
        let start = moment(start_date);
        let end = moment(end_date);
        let diff = end.diff(start);
        let duration = moment.duration(diff);
        switch (unit) {
            case "Y":
                return duration.asYears();
            case "M":
                return duration.asMonths();
            case "D":
                return duration.asDays();
            // case "MD":
            //     return duration.asDays();//TODO
            // case "YM":
            //     return duration.asDays();//TODO
            // case "YD":
            //     return duration.asDays();//TODO
        }
    }

    @funSignature("NUMRANGE", {types:[{name: "NumberRangeType"}]}, "creates a number range value from two numbers", { name: 'start', types: [{name: "NumberType"}]}, { name: 'end', types: [{name: "NumberType"}] })
    NUMRANGE(start: number, end: number): NumRange {
        return { start, end };
    }

    @funSignature("DATERANGE", {types:[{name: "DatetimeRangeType"}]}, "creates a datetime range value from two dates", { name: 'start', types: [{name: "DatetimeType"}]}, { name: 'end', types: [{name: "DatetimeType"}] })
    DATERANGE(start: string, end: string): DateRange {
        return { start: moment(start), end: moment(end) };
    }

    @funSignature("INTERSECTS", {types:[{name: "BooleanType"}]}, "returns true if the input number or date ranges overlap", { name: 'range1', types: [{name: "NumberRangeType"}, {name: "DatetimeRangeType"}]}, { name: 'range2', types: [{name: "NumberRangeType"}, {name: "DatetimeRangeType"}]})
    INTERSECTS(range1: NumRange | DateRange, range2: NumRange | DateRange) {
        if (isNumRange(range1) && isNumRange(range2)) {
            return (range2.start <= range1.start && range1.start <= range2.end)
                || (range2.start <= range1.end && range1.end <= range2.end)
                || (range1.start <= range2.start && range2.end <= range1.end)
                ;
        } else if (isDateRange(range1) && isDateRange(range2)) {
            let start1 = range1.start;
            let end1 = range1.end;
            let start2 = range2.start;
            let end2 = range2.end;
            return (start2.isSameOrBefore(start1) && start1.isSameOrBefore(end2))
                || (start2.isSameOrBefore(end1) && end1.isSameOrBefore(end2))
                || (start1.isSameOrBefore(start2) && end2.isSameOrBefore(end1))
                ;
        } else throw new Error(`Unknown ranges ${JSON.stringify(range1)} ${JSON.stringify(range2)}`);
    }
};

export const ScalarFunctionsImplementations = new _ScalarFunctionsImplementations();
