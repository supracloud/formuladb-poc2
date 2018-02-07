
export class Formula {
    EXPRESSION?: SimpleExpression;
    CURRENT_VALUE_OF?: SimpleExpression;
    SUM?: Formula[];
    CONCATENATE?: Formula[];
    IF?: IfFormula;
    FORMAT?: FormatFormula;
    INDEX_OF?: IndexOfFormula;
    TIME_UTILS?: TimeUtilsFormula;
}

export type SimpleExpression = string;

export class IfFormula {
    expression: Formula;
    trueValue: Formula;
    falseValue: Formula;
}

export class FormatFormula {
    // readonly description = 'Formats "values" according to a "format" specifier';
    format: string;
    values: Formula[];
}

export class IndexOfFormula {
    // readonly description = 'Finds the index of the current object among its siblings sorted by "property" with the search interval bounded by "startRange" and "endRange"'
    expression: SimpleExpression;
    startRange: Formula;
    endRange: Formula;
}

export class TimeUtilsFormula {
    operation: 'START_OF_MONTH' | 'END_OF_MONTH';
    // readonly description = 'Returns a DATETIME representing the start of month relative to the DATETIME "property" parameter'
    expression: SimpleExpression;
    // readonly propertyType = PropertyTypeN.DATETIME;
}
