import * as moment from 'moment';
import * as formulajs from 'formulajs';

export const ScalarFunctionsImplementations = {
    //TODO: implement significance
    FLOOR: function (x, significance) { return Math.floor(x) },
    MAX: function (x, y) { return Math.max(x, y) },
    ABS: function (x) { return Math.abs(x) },
    TEXT: function TEXT(expr, format) {
        //TODO
    },
    FIND: function (find_text, within_text, position?) {
        position = (position === undefined) ? 0 : position;
        if (!within_text) return null;
        let index = within_text.indexOf(find_text, position - 1);
        return index >= 0 ? index + 1 : undefined;
    },
    ISNUMBER: formulajs.ISNUMBER,
    CONCATENATE: formulajs.CONCATENATE,
    REGEXREPLACE: function REGEXREPLACE(expr, regex, replacement) {
        //TODO
    },
    EOMONTH: function EOMONTH(expr, numMonths) {
        //TODO
    },
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
    OVERLAP(start_date_1, end_date_1, start_date_2, end_date_2, max_interval) {
        let start1 = moment(start_date_1);
        let end1 = moment(end_date_1);
        let start2 = moment(start_date_2);
        let end2 = moment(end_date_2);
        return (start2.isSameOrBefore(start1) && start1.isSameOrBefore(end2))
            || (start2.isSameOrBefore(end1) && end1.isSameOrBefore(end2))
            || (start2.isSameOrBefore(start1) && end1.isSameOrBefore(end2))
            ;
    }
};
