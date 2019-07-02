function organizeTopPanel() {
    $('#logo').remove();
    $('#toggle-file-manager-btn').parent().remove();
    $('#designer-mode-btn').remove();
    $('#download-btn').remove();

    let $customTopSubpanel = $('<div></div>').css({
        'background-color': 'red',
    });
    
    $('#mobile-view').parent().add($('#save-btn').parent()).wrapAll('<div></div>');
    $('#preview-btn').parent().parent().after($customTopSubpanel);
    
    $('#top-panel').css({
        display: 'grid',
        'grid-template-columns': `var(--builder-left-panel-width) auto var(--builder-right-panel-width)`,
    });

    $('#top-panel').css({height: '150px'});
    $('#canvas').css({top: '150px'});

    $('#save-btn').attr("title", "Save (Ctrl + S)");
    $('#save-btn').attr("data-vvveb-shortcut", "ctrl+s");
}

function organizeBottomPanel() {
    $('#logo').remove();
    $('#toggle-file-manager-btn').parent().remove();
    $('#designer-mode-btn').remove();
    $('#download-btn').remove();

    let $leftPanelBtns = $('#undo-btn').parent();
    $leftPanelBtns.append($('#preview-btn'));
    $leftPanelBtns.addClass('w-100');
    let $rightPanelBtns = $('#mobile-view').parent();
    $rightPanelBtns.prepend($('#save-btn'));
    $rightPanelBtns.addClass('w-100');

    $('#left-panel').prepend($leftPanelBtns).css({top: 0});
    $('#right-panel').prepend($rightPanelBtns).css({top: 0});
    $('#top-panel').remove();
    $('#canvas').css({
        top: '0',
        height: 'calc( 100vh - var(--builder-bottom-panel-height))',
    });

    Vvveb.Gui.toggleDatabaseEditor = function () {
		$("#vvveb-builder").toggleClass("bottom-panel-expand");
    },
    $('#toggleEditorJsExecute label small').text('Run js on edit');

    $('#code-editor-btn').parent().prepend(/* html */`
        <button id="database-editor-btn" data-view="mobile" class="btn btn-sm btn-light btn-sm" title="Code editor" data-vvveb-action="toggleDatabaseEditor">
            <i class="la la-database"></i> Database editor
        </button>

        <div class="" style="min-width: 45vw">
            <textarea style="width: 100%; height: calc(var(--builder-bottom-panel-height) - 5px)">asdcascdasnlk  asdcnasncdladsc</textarea>
        </div>
    `)
}

$(document).ready(function() {
    // organizeTopPanel();
    organizeBottomPanel();
});
