
function customizeEditor() {

    //// Code Editor ///////////////////////////////////////////////////////////
    Vvveb.Gui.toggleEditor = function (isTable) {
		$("#bottom-panel").toggle();
		Vvveb.CodeEditor.toggle(isTable);
	};
    $('#bottom-panel').css({
        top: '0px', 
        bottom: 'initial', 
        height: 'var(--db-panel-height)',
        display: 'none',
    });
    
    $('#preview-btn').toggleClass('bg-light');

    //// Controls ///////////////////////////////////////////////////////////
    
    // overwrite preview
    let prevPanelHeight = document.body.style.getPropertyValue('--db-panel-height');
    let orig_preview = Vvveb.Gui.preview;
    Vvveb.Gui.preview = function () {
        orig_preview();
        let dbEditor = $("frmdb-db-editor");
        if (dbEditor.hasClass("preview")) {
            document.body.style.setProperty('--db-panel-height', `${prevPanelHeight}`);
        } else {
            prevPanelHeight = document.body.style.getPropertyValue('--db-panel-height');
            document.body.style.setProperty('--db-panel-height', '0px');
        }
        dbEditor.toggleClass("preview");
        $(window.FrameDocument).find("body").get(0).classList.toggle('frmdb-preview');        
    }

    loadCss();
}



function loadExternalScript(scriptUrl) {
    return new Promise(resolve => {
        const scriptElement = document.createElement('script');
        scriptElement.src = scriptUrl;
        scriptElement.onload = resolve;
        document.body.appendChild(scriptElement);
    });
}

async function customLoadPages() {

}

// load customized editor
$(document).ready(async function () {
    customizeEditor();
    await customLoadPages();

});
