import { replaceCssClassWithTag } from "./fix-html";

for (let filePath of process.argv.slice(2)) {
    if (!filePath.match(/.*\.html$/)) {console.warn(filePath, "is not html"); continue}
    console.log("processing file", filePath);
    replaceCssClassWithTag(filePath, 'frmdb-t-card-media-main');
    replaceCssClassWithTag(filePath, 'frmdb-t-aside');
    replaceCssClassWithTag(filePath, 'frmdb-t-card-action');
    replaceCssClassWithTag(filePath, 'frmdb-t-card-deck');
    replaceCssClassWithTag(filePath, 'frmdb-t-card-icon-main');
    replaceCssClassWithTag(filePath, 'frmdb-t-card-note');
    replaceCssClassWithTag(filePath, 'frmdb-t-cover');
    replaceCssClassWithTag(filePath, 'frmdb-t-footer');
    replaceCssClassWithTag(filePath, 'frmdb-t-header');
    replaceCssClassWithTag(filePath, 'frmdb-t-img');
    replaceCssClassWithTag(filePath, 'frmdb-t-main');
    replaceCssClassWithTag(filePath, 'frmdb-t-main-nav');
    replaceCssClassWithTag(filePath, 'frmdb-t-media-section-main');
    replaceCssClassWithTag(filePath, 'frmdb-t-section-cards-icon');
    replaceCssClassWithTag(filePath, 'frmdb-t-section-divider');
}
