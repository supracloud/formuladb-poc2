function loadExternalScript(scriptUrl) {
    const scriptElement = document.createElement('script');
    scriptElement.src = scriptUrl;
    // scriptElement.onload = resolve;
    document.body.appendChild(scriptElement);
}

function customizeEditor() {
    $('.drag-elements').hide();
    $('#filemanager').css({height: '100%'});
    $('#filemanager .tree').css({height: '100%'});
    $('#preview-btn').toggleClass('bg-light');

    $('#logo').remove();
    $('#toggle-file-manager-btn').parent().remove();
    $('#designer-mode-btn').remove();
    $('#download-btn').remove();

    let $leftPanelBtns = $('#undo-btn').parent();
    $leftPanelBtns.append($('#preview-btn').css({'z-index': 9678}));
    $leftPanelBtns.append($('#fullscreen-btn'));
    $leftPanelBtns.addClass('w-100');
    let $rightPanelBtns = $('#mobile-view').parent();
    $rightPanelBtns.prepend($('#save-btn'));
    $rightPanelBtns.addClass('w-100');

    document.body.style.setProperty('--db-panel-height', `220px`);
    $('#left-panel').prepend($leftPanelBtns).css({ top: 'var(--db-panel-height)' });
    $('#right-panel').prepend($rightPanelBtns).css({ top: 'var(--db-panel-height)' });
    $('#top-panel').remove();
    $('#canvas').css({top: 'var(--db-panel-height)'});
    document.body.style.setProperty('--builder-header-top-height', '0px');
    
    $('#vvveb-builder').prepend(/* html */`<frmdb-db-editor></frmdb-db-editor>`);

    let origPreviewFunc = Vvveb.Gui.preview;
    let prevPanelHeight = document.body.style.getPropertyValue('--db-panel-height');
    Vvveb.Gui.preview = function () {
        origPreviewFunc();
        $('#preview-btn').toggleClass('preview');
        if ($('#preview-btn').hasClass('preview')) {
            $('#preview-btn').prependTo('body');
            $('#db-left-panel, #db-main, #db-right-panel').hide();
            prevPanelHeight = document.body.style.getPropertyValue('--db-panel-height');
            document.body.style.setProperty('--db-panel-height', '0px');
        } else {
            $('#fullscreen-btn').before($('#preview-btn'));
            $('#db-left-panel, #db-main, #db-right-panel').show();
            document.body.style.setProperty('--db-panel-height', `${prevPanelHeight}`);
        }
    }

    Vvveb.Gui.toggleDatabaseEditor = function () {
        $("#vvveb-builder").toggleClass("bottom-panel-expand");
    };
    $('#toggleEditorJsExecute label small').text('Run js on edit');
    $('#code-editor-btn').contents().filter(function () {
        return this.nodeType == Node.TEXT_NODE && this.nodeValue.indexOf('Code') >= 0;
    })[0].nodeValue = " HTML";

    $('#code-editor-btn').parent()
    .removeClass('btn-group')
    .addClass('d-flex')
    .prepend(/* html */`
        <button id="database-editor-btn" data-view="mobile" class="btn btn-sm btn-light btn-sm" title="Code editor" data-vvveb-action="toggleDatabaseEditor">
            <i class="la la-database"></i> Database
        </button>

        <div class="" style="flex-basis: 60%">
            <textarea style="width: 100%; height: calc(var(--builder-bottom-panel-height) - 5px)">asdcascdasnlk  asdcnasncdladsc</textarea>
        </div>
    `)

    loadExternalScript('/formuladb/frmdb-data-grid.js');
    loadExternalScript('/formuladb/frmdb-editor.js');
}

$(document).ready(function () {
    // customizeOld();
    customizeEditor();
});

/** Any widgets that show/hide DOM elements must stop auto-play in order to let the user edit */
function stopAutoplayForEditing() {
    $('.owl-carousel').trigger('stop.owl.autoplay');
}

function resumeAutoplayForPreview() {
    $('.owl-carousel').trigger('play.owl.autoplay',[500]);
}
