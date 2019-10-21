
export const FrmdbFonts = {
    LineAwesome: '/formuladb-static/icons/line-awesome/line-awesome.min.css',

}

export function loadFont(fontName: keyof typeof FrmdbFonts) {
    let styleEl = document.head.querySelector(`#frmdb-font-${fontName}`);
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = `frmdb-font-${fontName}`;
        styleEl.appendChild(document.createTextNode(FrmdbFonts[fontName]));
        document.head.appendChild(styleEl);
    }
}