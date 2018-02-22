import * as _ from "lodash";


export function emit(key, value) {
    throw "emit should never be called, only used to define view map functions";
}

export function isNumberES5(s) {
    return parseInt(s) + '' === s;
}
export function isPlainObjES5(o) {
    return typeof o == 'object' && o.constructor == Object;
}

export function evalTemplateES5(doc, template) {
    throw new Error("evalTemplate not implemented");
}

export function matchesTypeES5(obj, type) {
    throw new Error("matchesPathES5 not implemented");
}

var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
function getFuncParamNames(func): string[] {
  var fnStr = func.toString().replace(STRIP_COMMENTS, '');
  var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
  if(result === null)
     result = [];
  return result;
}

export type MapParamTypes = string | RegExp | number;
export function packMapFunction(mapFunc: (doc, ...a) => void, dependencies: [(...a) => any], params: {[paramName: string]: MapParamTypes}) {
    function getDepName(dep) {
        return dep.toString().match(/function\s+(\w+)\s*\(/)[1];
    }
    getFuncParamNames(mapFunc).forEach(paramName => {
        if (paramName === 'doc') return;
        if (!params[paramName]) throw new Error(mapFunc.toString() + ' missing parameter: ' + paramName);
    });

    let deps = dependencies.map(x => ({n: getDepName(x), f: x.toString().replace(/\n/g, "\n        ")}));
    return [
        'function packedMap(doc) {',
        '    var dependencies = {',
        '        ' + deps.map(({n, f}) => n + ': ' + f).join(',\n        '),
        '    };',
        '    ' + mapFunc.toString()
            .replace(/function.*?\{/, 'function map(doc, dependencies) {')
            .replace(/\w+.emit\s*\(/g, (m, $1) => 'emit(')
            .replace(/\w+.(\w+ES5)/g, (m, $1) => 'dependencies.' + $1)
            .replace(/\n/g, "\n    "),
        '    ' + _.toPairs(params).map(([paramName, value]) => `let ${paramName} = ${value.toString()};`).join("\n    "),
        '   map(doc, dependencies);',
        '}',
    ].join('\n');
}

export function getES5(obj, deepPath) {
    let { path, relativePath } = parseDeepPathES5(deepPath);
    if (null == relativePath || "" == relativePath) return obj;

    let ret = obj;
    relativePath.replace(/\[.*?\]/, '').split(/\//).forEach(function (prop) {
        ret = ret ? ret[prop] : null;
    });
    return ret;
}

export function parseDeepPathES5(deepPath) {
    let match = deepPath.match(/^(\/\w+\/\w+)\/?(.*)/);
    if (null == match || match.length < 2) throw new Error("Not a valid deepPath: " + deepPath);

    if (match.length >= 3 && match[2] != null && match[2] !== '') {
        return { path: match[1], relativePath: match[2] };
    } else return { path: match[1], relativePath: match[2] };
}
