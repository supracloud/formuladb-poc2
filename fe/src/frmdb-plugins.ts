import _ = require("lodash");

function aosRefreshHard(wnd?: Window) {
    wnd = wnd || window;
    wnd['AOS']?.refreshHard();
}

export var debouncedAOSRefreshHard = _.debounce(aosRefreshHard, 500);
