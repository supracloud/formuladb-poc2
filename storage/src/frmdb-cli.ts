import { replaceCssClassWithTag } from "./fix-html";

console.log("processing file", process.argv[2]);
replaceCssClassWithTag(process.argv[1], 'frmdb-t-card-media-main');
