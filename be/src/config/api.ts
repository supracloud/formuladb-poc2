import {match} from "path-to-regexp";

function makeRoute(order: number, method: "GET" | "POST" | "DELETE" | "PUT", path: string) {
    return {
        order,
        method,
        path, 
        matchPath: match(path, { encode: encodeURI, decode: decodeURIComponent })
    };
}

/** not used for now, cannot do centralized authorization because of redirects and middleware that may change the actual route url */
export const FrmdbRoutes = {
      "/isauthenticated": makeRoute(1, "GET", "/isauthenticated"),
      "/isadminauthenticated": makeRoute(2, "GET", "/isadminauthenticated"),
      "/isproductionenv": makeRoute(3, "GET", "/isproductionenv"),
      "/login": makeRoute(4, "GET", "/login"),
      "/logout": makeRoute(5, "GET", "/logout"),
      "/formuladb-api/changes-feed/:clientId": makeRoute(6, "POST", "/formuladb-api/changes-feed/:clientId"),
      "/register": makeRoute(7, "GET", "/register"),
      "/": makeRoute(8, "GET", "/"),
      "/*.html": makeRoute(9, "GET", "/*.html"),
     "/*.yaml": makeRoute(10, "GET", "/*.yaml"),
     "/:lang-:look-:primary-:secondary-:theme/:app/:page.html": makeRoute(11, "GET", "/:lang-:look-:primary-:secondary-:theme/:app/:page.html"),
     "/:lang-:look-:primary-:secondary-:theme/:app/formuladb-look.css": makeRoute(12, "GET", "/:lang-:look-:primary-:secondary-:theme/:app/formuladb-look.css"),
     "/:lang-:look-:primary-:secondary-:theme/:app/:fileName([-_a-zA-Z0-9/]+\.(png|jpg|jpeg|svg|gif|webm|eot|ttf|woff|woff2|otf|css|js)$)": makeRoute(13, "GET", "/:lang-:look-:primary-:secondary-:theme/:app/:fileName([-_a-zA-Z0-9/]+\.(png|jpg|jpeg|svg|gif|webm|eot|ttf|woff|woff2|otf|css|js)$)"),
     "/:lang-:look-:primary-:secondary-:theme/:app/static/:fileName([-_a-zA-Z0-9/]+\.(png|jpg|jpeg|svg|gif|webm|eot|ttf|woff|woff2|otf|css|js)$)": makeRoute(14, "GET", "/:lang-:look-:primary-:secondary-:theme/:app/static/:fileName([-_a-zA-Z0-9/]+\.(png|jpg|jpeg|svg|gif|webm|eot|ttf|woff|woff2|otf|css|js)$)"),
     "/:lang-:look-:primary-:secondary-:theme/:app/static/:dirName/:fileName([-_a-zA-Z0-9/]+\.(png|jpg|jpeg|svg|gif|webm|eot|ttf|woff|woff2|otf|css|js)$)": makeRoute(15, "GET", "/:lang-:look-:primary-:secondary-:theme/:app/static/:dirName/:fileName([-_a-zA-Z0-9/]+\.(png|jpg|jpeg|svg|gif|webm|eot|ttf|woff|woff2|otf|css|js)$)"),
     "/:lang-:look-:primary-:secondary-:theme/:app/static/:dirName/:dirName2/:fileName([-_a-zA-Z0-9/]+\.(png|jpg|jpeg|svg|gif|webm|eot|ttf|woff|woff2|otf|css|js)$)": makeRoute(16, "GET", "/:lang-:look-:primary-:secondary-:theme/:app/static/:dirName/:dirName2/:fileName([-_a-zA-Z0-9/]+\.(png|jpg|jpeg|svg|gif|webm|eot|ttf|woff|woff2|otf|css|js)$)"),
     "/:app/:name.yaml": makeRoute(17, "GET", "/:app/:name.yaml"),
     "/formuladb-api/DEBUG/enabled/:debugValue": makeRoute(18, "GET", "/formuladb-api/DEBUG/enabled/:debugValue"),
     "/formuladb-api/DEBUG/:debugValue": makeRoute(19, "POST", "/formuladb-api/DEBUG/:debugValue"),
     "/formuladb-api/themes": makeRoute(20, "GET", "/formuladb-api/themes"),
     "/formuladb-api/looks": makeRoute(21, "GET", "/formuladb-api/looks"),
     "/formuladb-api/translate": makeRoute(22, "POST", "/formuladb-api/translate"),
     "/formuladb-api/:app": makeRoute(23, "GET", "/formuladb-api/:app"),
     "/formuladb-api/:app/schema": makeRoute(24, "GET", "/formuladb-api/:app/schema"),
     "/formuladb-api/:app/media": makeRoute(25, "GET", "/formuladb-api/:app/media"),
     "/formuladb-api/:app/premium-icons/:search": makeRoute(26, "GET", "/formuladb-api/:app/premium-icons/:search"),
     "/formuladb-api/:app/:table/SimpleAddHocQuery": makeRoute(27, "POST", "/formuladb-api/:app/:table/SimpleAddHocQuery"),
     "/formuladb-api/:app/byprefix/:prefix": makeRoute(28, "GET", "/formuladb-api/:app/byprefix/:prefix"),
     "/formuladb-api/:app/obj/:id": makeRoute(29, "GET", "/formuladb-api/:app/obj/:id"),
     "/formuladb-api/:app/centralized-logging/add-event": makeRoute(30, "POST", "/formuladb-api/:app/centralized-logging/add-event"),
     "/formuladb-api/:app/event": makeRoute(31, "POST", "/formuladb-api/:app/event"),
     "/formuladb-api/:app/reference_to_options/:referencedTableAlias": makeRoute(32, "POST", "/formuladb-api/:app/reference_to_options/:referencedTableAlias"),
};
