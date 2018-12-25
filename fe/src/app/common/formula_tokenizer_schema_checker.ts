import { ScalarFunctions, MapFunctions, MapReduceFunctions, FunctionsList } from "./functions_compiler";
import { Token, TokenType, Suggestion } from "./formula_tokenizer";
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
            if (!this.schemaDAO.entities().map(e => e._id).find(e => e === token.tableName)) {
                token.errors.push("Unknown table " + token.tableName);
                token.foundInSchema = false;
            }
        } else if (TokenType.COLUMN_NAME === token.type) {
            if (! Object.keys(this.schemaDAO.getEntityForDataObj('' + token.tableName).props).find(p => p == token.columnName)) {
                token.errors.push("Unknown column " + token.columnName + " for table " + token.tableName);
                token.foundInSchema = false;
            }
        }
    }

    /**
     * Example Fuse search results for string array:
[
  {
    "item": 0,
    "matches": [
      {
        "indices": [
          [
            0,
            0
          ]
        ],
        "value": "abc"
      }
    ]
  },
  {
    "item": 2,
    "matches": [
      {
        "indices": [
          [
            0,
            0
          ]
        ],
        "value": "abd"
      }
    ]
  }
]
     * Example Fuse search results for object array:
[
  {
    "item": {
      "title": "HTML5",
      "author": {
        "firstName": "Remy",
        "lastName": "Sharp"
      }
    },
    "matches": [
      {
        "indices": [
          [
            0,
            3
          ]
        ],
        "value": "HTML5",
        "key": "title",
        "arrayIndex": 0
      }
    ]
  }
]
     * @param token the token for which to return suggestions
     */
    public getSuggestionsForToken(token: Token): Suggestion[] {
        let ret: Suggestion[] = [];
        if (TokenType.FUNCTION_NAME === token.type) {
            if (!token.foundInSchema) {
                ret = this.functionsFuse.search(token.value).map((result: any) => {return {
                    suggestion: FunctionsList[result.item],
                    matchedFragments: result.matches[0].indices.map(fuseIdx => {return{startPos: fuseIdx[0], endPos: fuseIdx[1]}})
                } as Suggestion});
            }
            
        } else if (TokenType.TABLE_NAME === token.type) {
            if (!this.schemaDAO.entities().map(e => e._id).find(e => e === token.tableName)) {
                token.errors.push("Unknown table " + token.tableName);
                token.foundInSchema = false;
            }
        } else if (TokenType.COLUMN_NAME === token.type) {
            if (! Object.keys(this.schemaDAO.getEntityForDataObj('' + token.tableName).props).find(p => p == token.columnName)) {
                token.errors.push("Unknown column " + token.columnName + " for table " + token.tableName);
                token.foundInSchema = false;
            }
        }

        return ret;
    }
}