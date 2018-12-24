import { ScalarFunctions, MapFunctions, MapReduceFunctions, FunctionsList } from "./functions_compiler";
import { Token, TokenType } from "./formula_tokenizer";
import { SchemaDAO } from "./domain/metadata/schema_dao";
import * as Fuse from 'fuse.js';


export class FormulaTokenizerSchemaChecker {
    private fuseOptions: Fuse.FuseOptions<string> = {
        shouldSort: true,
        includeMatches: true,
        threshold: 0.6,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: undefined
    };
    private functionsFuse = new Fuse(FunctionsList, this.fuseOptions);

    constructor(private schemaDAO: SchemaDAO) {
    }

    public checkToken(token: Token) {

        if (TokenType.FUNCTION_NAME === token.type) {
            let functionName = token.value;
            let fn = ScalarFunctions[functionName] || MapFunctions[functionName] || MapReduceFunctions[functionName];
            if (!fn) {
                token.errors.push("Unknown function " + functionName);
                token.foundInSchema = false;
            }
        } else if (TokenType.TABLE_NAME === token.type) {

        } else if (TokenType.COLUMN_NAME === token.type) {
        
        }        
    }

    public getSuggestionsForToken(token: Token) {
        
    }
}