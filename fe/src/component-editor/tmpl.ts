const cache = {};

export function tmpl(str, data?) {
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    let fn = cache[str];
    if (!fn) {
        fn =
            // Generate a reusable function that will serve as a template
            // generator (and which will be cached).
            new Function("obj",
                "var p=[],print=function(){p.push.apply(p,arguments);};" +

                // Introduce the data as local variables using with(){}
                "with(obj){p.push('" +

                // Convert the template into pure JavaScript
                str
                    .replace(/[\r\t\n]/g, " ")
                    .split("{%").join("\t")
                    .replace(/((^|%})[^\t]*)'/g, "$1\r")
                    .replace(/\t=(.*?)%}/g, "',$1,'")
                    .split("\t").join("');")
                    .split("%}").join("p.push('")
                    .split("\r").join("\\'")
                + "');}return p.join('');");

        cache[str] = fn;
    }

    // Provide some basic currying to the user
    try {
        return data ? fn(data) : fn;
    } catch (err) {
        console.warn(err, fn, data);
        return '';
    }
};
