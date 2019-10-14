import { FrmdbEditorBuilder } from "./frmdb-editor-builder";
import { I18nFe } from "./i18n-fe";
import { BACKEND_SERVICE } from "./backend.service";
import jsyaml = require("js-yaml");
import { WysiwygEditor } from "./dom-tree/component-editor/wysiwyg-editor";
import { Undo } from "./dom-tree/component-editor/undo";

export class FrmdbEditorGui {
    constructor(private builder: FrmdbEditorBuilder, private iframe: HTMLIFrameElement, private i18n: I18nFe) {
    }

	init() {
        var self = this;

		$("[data-vvveb-action]").each(function () {
            if (!this.dataset.vvvebAction) return;
			$(this).on('click', self[this.dataset.vvvebAction]);
			if (this.dataset.vvvebShortcut) {
                $(document).bind('keydown', this.dataset.vvvebShortcut, self[this.dataset.vvvebAction]);
                //@ts-ignore
				$(self.iframe.contentWindow.document, self.iframe.contentWindow).bind('keydown', this.dataset.vvvebShortcut, self[this.dataset.vvvebAction]);
			}
		});


		// i18n section
		const i18nSelect = jQuery('#frmdb-editor-i18n-select')
		const i18nOptions = jQuery('[aria-labelledby="frmdb-editor-i18n-select"]');
		const currentLanguage = self.i18n.getLangDesc(localStorage.getItem('editor-lang') || self.i18n.defaultLanguage);
		i18nSelect.attr('data-i18n', currentLanguage!.lang);
		i18nSelect.html(`<i class="flag-icon flag-icon-${currentLanguage!.flag}"></i>`);
		self.i18n.languages.forEach(lang =>
			jQuery(`<a class="dropdown-item flag-icon flag-icon-${lang.flag}">${lang.full}</a>`)
				.click(event => {
					const prev = i18nSelect.attr('data-i18n');
					const next = lang.lang;
					localStorage.setItem('editor-lang', next);
					i18nSelect.attr('data-i18n', next);
					i18nSelect.html(`<i class="flag-icon flag-icon-${lang.flag}"></i>`);
					self.i18n.translateAll(this.iframe.contentWindow!.document, prev, next);
					// event.preventDefault();
					// return false;
				}).appendTo(i18nOptions)
		);

		//theme section
		const appName = 'hotel-booking';
		const themeOptions = jQuery('[aria-labelledby="frmdb-editor-color-palette-select"]');
		let themeChangeButton: any = null;
		fetch(`/${BACKEND_SERVICE().tenantName}/${BACKEND_SERVICE().appName}/theme.yaml`).then(re => re.text().then(themesYamlStr => {
			let themes = jsyaml.safeLoad(themesYamlStr);
			themes.forEach(t => {
				if (!themeChangeButton) {
					themeChangeButton = jQuery('#frmdb-editor-color-palette-select');
					themeChangeButton.html(`<i style="color:${t.symbolColor}" class="la la-square"></i>`);
				}
				jQuery(`<a class="dropdown-item" title="${t.name}"><i style="color:${t.symbolColor}" class="la la-square"></i> ${t.name}</a>`)
					.click(event => {
						jQuery("#iframe-wrapper > iframe").contents().find('#frmdb-theme-css')
							.attr('href', `${t.css}?refresh=${new Date().getTime()}`);
						themeChangeButton.html(`<i style="color:${t.symbolColor}" class="la la-square"></i>`);
					})
					.appendTo(themeOptions);
			});
		}));
	}

	undo() {
		if (WysiwygEditor.isActive) {
			WysiwygEditor.undo();
		} else {
			Undo.undo();
		}
		this.builder.selectNode();
	}

	redo() {
		if (WysiwygEditor.isActive) {
			WysiwygEditor.redo();
		} else {
			Undo.redo();
		}
		this.builder.selectNode();
	}

	//show modal with html content
	save() {
		$('#textarea-modal textarea').val(this.builder.getHtml());
		$('#textarea-modal').modal();
	}


	download() {
		filename = /[^\/]+$/.exec(Vvveb.Builder.iframe.src)[0];
		uriContent = "data:application/octet-stream," + encodeURIComponent(Vvveb.Builder.getHtml());

		var link = document.createElement('a');
		if ('download' in link) {
			link.dataset.download = filename;
			link.href = uriContent;
			link.target = "_blank";

			document.body.appendChild(link);
			result = link.click();
			document.body.removeChild(link);
			link.remove();

		} else {
			location.href = uriContent;
		}
	}

	viewport() {
		$("#canvas").attr("class", this.dataset.view);
	}

	togglePageEditor() {
		self.toggleEditor();
	}
	toggleTableEditor() {
		self.toggleEditor(true);
	}
	toggleEditor(isTable) {
		$("#vvveb-builder").toggleClass("bottom-panel-expand");
		$("#toggleEditorJsExecute").toggle();
		Vvveb.CodeEditor.toggle(isTable);
	}

	toggleEditorJsExecute() {
		Vvveb.Builder.runJsOnSetHtml = this.checked;
	}

	preview() {
		(this.isPreview == true) ? this.isPreview = false : this.isPreview = true;
		Vvveb.Builder.frameBody[0].classList.toggle('frmdb-editor-on', !this.isPreview);
		$("#iframe-layer").toggle();
		$("#vvveb-builder").toggleClass("preview");
	}

	fullscreen() {
		launchFullScreen(document); // the whole page
	}

	componentSearch() {
		searchText = this.value;

		$("#left-panel .components-list li ol li").each(function () {
			$this = $(this);

			$this.hide();
			if ($this.data("search").indexOf(searchText) > -1) $this.show();
		});
	}

	clearComponentSearch() {
		$(".component-search").val("").keyup();
	}

	blockSearch() {
		searchText = this.value;

		$("#left-panel .blocks-list li ol li").each(function () {
			$this = $(this);

			$this.hide();
			if ($this.data("search").indexOf(searchText) > -1) $this.show();
		});
	}

	clearBlockSearch() {
		$(".block-search").val("").keyup();
	}

	addBoxComponentSearch() {
		searchText = this.value;

		$("#add-section-box .components-list li ol li").each(function () {
			$this = $(this);

			$this.hide();
			if ($this.data("search").indexOf(searchText) > -1) $this.show();
		});
	}


	addBoxBlockSearch() {
		searchText = this.value;

		$("#add-section-box .blocks-list li ol li").each(function () {
			$this = $(this);

			$this.hide();
			if ($this.data("search").indexOf(searchText) > -1) $this.show();
		});
	}
}

// Toggle fullscreen
function launchFullScreen(document) {
	if (document.documentElement.requestFullScreen) {

		if (document.FullScreenElement)
			document.exitFullScreen();
		else
			document.documentElement.requestFullScreen();
		//mozilla		
	} else if (document.documentElement.mozRequestFullScreen) {

		if (document.mozFullScreenElement)
			document.mozCancelFullScreen();
		else
			document.documentElement.mozRequestFullScreen();
		//webkit	  
	} else if (document.documentElement.webkitRequestFullScreen) {

		if (document.webkitFullscreenElement)
			document.webkitExitFullscreen();
		else
			document.documentElement.webkitRequestFullScreen();
		//ie	  
	} else if (document.documentElement.msRequestFullscreen) {

		if (document.msFullScreenElement)
			document.msExitFullscreen();
		else
			document.documentElement.msRequestFullscreen();
	}
}
