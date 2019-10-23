import { FrmdbEditorBuilder } from "./frmdb-editor-builder";
import { I18nFe, I18N_FE } from "./i18n-fe";
import { BACKEND_SERVICE } from "./backend.service";
import jsyaml = require("js-yaml");
import { WysiwygEditor } from "./dom-tree/component-editor/wysiwyg-editor";
import { Undo } from "./dom-tree/component-editor/undo";

export class FrmdbEditorGui {
    constructor(private builder: FrmdbEditorBuilder, private iframe: HTMLIFrameElement) {
    }

	init() {
        var self = this;

		$("[data-vvveb-action]").each(function () {
            if (!this.dataset.vvvebAction) return;
			$(this).on('click', self[this.dataset.vvvebAction]);
		});


		// i18n section
		const i18nSelect = jQuery('#frmdb-editor-i18n-select')
		const i18nOptions = jQuery('[aria-labelledby="frmdb-editor-i18n-select"]');
		const currentLanguage = I18N_FE.getLangDesc(localStorage.getItem('editor-lang') || I18N_FE.defaultLanguage);
		i18nSelect.attr('data-i18n', currentLanguage!.lang);
		i18nSelect.html(`<i class="flag-icon flag-icon-${currentLanguage!.flag}"></i>`);
		I18N_FE.languages.forEach(lang =>
			jQuery(`<a class="dropdown-item flag-icon flag-icon-${lang.flag}">${lang.full}</a>`)
				.click(event => {
					const prev = i18nSelect.attr('data-i18n');
					const next = lang.lang;
					localStorage.setItem('editor-lang', next);
					i18nSelect.attr('data-i18n', next);
					i18nSelect.html(`<i class="flag-icon flag-icon-${lang.flag}"></i>`);
					I18N_FE.translateAll(this.iframe.contentWindow!.document, prev, next);
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

	viewport(ev) {
		if (!ev.target || !ev.target.dataset || !ev.target.dataset.view) return;
		$("#canvas").attr("class", ev.target.dataset.view);
	}

	preview() {
		(this.builder.isPreview == true) ? this.builder.isPreview = false : this.builder.isPreview = true;
		this.builder.frameBody[0].classList.toggle('frmdb-editor-on', !this.builder.isPreview);
		$("#iframe-layer").toggle();
		$("#vvveb-builder").toggleClass("preview");
	}

	fullscreen() {
		launchFullScreen(document); // the whole page
	}

	clearComponentSearch() {
		$(".component-search").val("").keyup();
	}

	clearBlockSearch() {
		$(".block-search").val("").keyup();
	}

}

// Toggle fullscreen
export function launchFullScreen(document) {
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
