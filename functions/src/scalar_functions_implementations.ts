import * as moment from 'moment';
import * as formulajs from 'formulajs';

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

export const ScalarFunctionsImplementations = {
    //TODO: implement significance
    FLOOR: function (x, significance) { return Math.floor(x) },
    MAX: function (x, y) { return Math.max(x, y) },
    ABS: function (x) { return Math.abs(x) },
    TEXT: function TEXT(expr, format) {
        if (typeof expr == "number" ) {
            return formulajs.TEXT(expr, format);
        } else if (expr instanceof Date) {
            return moment(expr).format(format);
        }
    },
    FIND: function (find_text, within_text, position?) {
        position = (position === undefined) ? 0 : position;
        if (!within_text) return null;
        let index = within_text.indexOf(find_text, position - 1);
        return index >= 0 ? index + 1 : undefined;
    },
    AND: formulajs.AND,
    OR: formulajs.OR,
    NOT: formulajs.NOT,
    ISNUMBER: formulajs.ISNUMBER,
    CONCATENATE: formulajs.CONCATENATE,
    REGEXREPLACE: formulajs.REGEXREPLACE,
    SUBSTITUTE: formulajs.SUBSTITUTE,
    TODAY: formulajs.TODAY,
    EOMONTH: formulajs.EOMONTH,
    SQRT: function SQRT(expr) {
        //TODO
    },
    ROUND: function ROUND(expr) {
        //TODO
    },
    FACT: function FACT(expr) {
        //TODO
    },
    HLOOKUP: function HLOOKUP(expr) {
        //TODO
    },
    DATEDIF: function DATEDIF(start_date, end_date, unit) {
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
            case "MD":
                return duration.asDays();//TODO
            case "YM":
                return duration.asDays();//TODO
            case "YD":
                return duration.asDays();//TODO
        }
    },
    NUMRANGE: function NUMRANGE(start: number, end: number): NumRange {
        return {start, end};
    },
    DATERANGE: function DATERANGE(start: string, end: string): DateRange {
        return {start: moment(start), end: moment(end)};
    },
    INTERSECTS: function INTERSECTS(range1: NumRange | DateRange, range2: NumRange | DateRange) {
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
        } else throw new Error(`Unknown ranges ${JSON.stringify(range1)}, ${JSON.stringify(range2)}`);
    }
};
