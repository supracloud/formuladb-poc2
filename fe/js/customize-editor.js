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

    $('#top-panel').css({ height: '150px' });
    $('#canvas').css({ top: '150px' });

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
    $leftPanelBtns.append($('#fullscreen-btn'));
    $leftPanelBtns.addClass('w-100');
    let $rightPanelBtns = $('#mobile-view').parent();
    $rightPanelBtns.prepend($('#save-btn'));
    $rightPanelBtns.addClass('w-100');

    $('#left-panel').prepend($leftPanelBtns).css({ top: 0 });
    $('#right-panel').prepend($rightPanelBtns).css({ top: 0 });
    $('#top-panel').remove();
    $('#canvas').css({top: '0'});
    document.body.style.setProperty('--builder-header-top-height', '0px');

    $('body').append(/*html*/`
        <style>
            #preview-btn.preview {
                position: fixed;
                top: 0;
                left: 0;
                box-shadow: 2px 2px 2px 2px grey;
                z-index: 2000;
            }
        </style>
    `);
    let origPreviewFunc = Vvveb.Gui.preview;
    Vvveb.Gui.preview = function () {
        origPreviewFunc();
        $('#preview-btn').toggleClass('preview');
        if ($('#preview-btn').hasClass('preview')) {
            $('#preview-btn').prependTo('body');
        } else {
            $('#fullscreen-btn').before($('#preview-btn'));
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
}

$(document).ready(function () {
    // organizeTopPanel();
    organizeBottomPanel();
});

/** Any widgets that show/hide DOM elements must stop auto-play in order to let the user edit */
function stopAutoplayForEditing() {
    $('.owl-carousel').trigger('stop.owl.autoplay');
}

function resumeAutoplayForPreview() {
    $('.owl-carousel').trigger('play.owl.autoplay',[500]);
}
