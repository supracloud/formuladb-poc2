function loadExternalScript(scriptUrl) {
    const scriptElement = document.createElement('script');
    scriptElement.src = scriptUrl;
    scriptElement.onload = resolve;
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

    let dbEditorHeight = 200;
    $('body').append(/*html*/`
        <style>
            :root {
                --db-panel-height: ${dbEditorHeight}px;
            }
            #preview-btn.preview {
                position: fixed;
                top: 5px;
                left: 5px;
                box-shadow: 2px 2px 2px 2px grey;
                z-index: 2000;
                padding: 0; width: 32px; height: 32px; border-radius: 30%;
            }

            #db-left-panel { width: var(--builder-left-panel-width); }
            #db-main { 
                left: var(--builder-left-panel-width);
                width: calc( 100vw - (var(--builder-left-panel-width) + var(--builder-right-panel-width) + var(--builder-canvas-margin))); 
            }
            #db-right-panel { 
                width: var(--builder-right-panel-width); 
                left: calc( 100vw - var(--builder-right-panel-width));
            }
            #db-left-panel, #db-main, #db-right-panel {
                height: var(--db-panel-height); 
                position: fixed; 
                top: 0; 
                background-color: white; 
                z-index: 9456;
            }
        </style>
    `);

    $('#left-panel').prepend($leftPanelBtns).css({ top: 'var(--db-panel-height)' });
    $('#right-panel').prepend($rightPanelBtns).css({ top: 'var(--db-panel-height)' });
    $('#top-panel').remove();
    $('#canvas').css({top: 'var(--db-panel-height)'});
    document.body.style.setProperty('--builder-header-top-height', '0px');


    $('#vvveb-builder').prepend(/* html */`
        <div id="db-left-panel"></div>
        <div id="db-main"></div>
        <div id="db-right-panel"></div>
    `);

    let origPreviewFunc = Vvveb.Gui.preview;
    Vvveb.Gui.preview = function () {
        origPreviewFunc();
        $('#preview-btn').toggleClass('preview');
        if ($('#preview-btn').hasClass('preview')) {
            $('#preview-btn').prependTo('body');
            $('#db-left-panel, #db-main, #db-right-panel').hide();
            document.body.style.setProperty('--db-panel-height', '0px');
        } else {
            $('#fullscreen-btn').before($('#preview-btn'));
            $('#db-left-panel, #db-main, #db-right-panel').show();
            document.body.style.setProperty('--db-panel-height', `${dbEditorHeight}px`);
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
