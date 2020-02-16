import { BACKEND_SERVICE } from "./backend.service";
import jsyaml = require("js-yaml");
import { Undo } from "./frmdb-editor/undo";

// export class FrmdbEditorGui {
//     constructor(private iframe: HTMLIFrameElement) {
//     }

// 	init() {
//         var self = this;

// 		$("[data-vvveb-action]").each(function () {
//             if (!this.dataset.vvvebAction) return;
// 			$(this).on('click', self[this.dataset.vvvebAction]);
// 		});

// 		//theme section
// 		const appName = 'hotel-booking';
// 		const themeOptions = jQuery('[aria-labelledby="frmdb-editor-color-palette-select"]');
// 		let themeChangeButton: any = null;
// 		fetch(`/${BACKEND_SERVICE().tenantName}/${BACKEND_SERVICE().appName}/theme.yaml`).then(re => re.text().then(themesYamlStr => {
// 			let themes = jsyaml.safeLoad(themesYamlStr);
// 			themes.forEach(t => {
// 				if (!themeChangeButton) {
// 					themeChangeButton = jQuery('#frmdb-editor-color-palette-select');
// 					themeChangeButton.html(`<i style="color:${t.symbolColor}" class="frmdb-i-fa-square"></i>`);
// 				}
// 				jQuery(`<a class="dropdown-item" title="${t.name}"><i style="color:${t.symbolColor}" class="frmdb-i-fa-square"></i> ${t.name}</a>`)
// 					.click(event => {
// 						jQuery("#iframe-wrapper > iframe").contents().find('#frmdb-look-css')
// 							.attr('href', `${t.css}?refresh=${new Date().getTime()}`);
// 						themeChangeButton.html(`<i style="color:${t.symbolColor}" class="frmdb-i-fa-square"></i>`);
// 					})
// 					.appendTo(themeOptions);
// 			});
// 		}));
// 	}

// 	undo() {
// 		if (WysiwygEditor.isActive) {
// 			WysiwygEditor.undo();
// 		} else {
// 			Undo.undo();
// 		}
// 		// this.builder.selectNode();
// 	}

// 	redo() {
// 		if (WysiwygEditor.isActive) {
// 			WysiwygEditor.redo();
// 		} else {
// 			Undo.redo();
// 		}
// 		// this.builder.selectNode();
// 	}
// }

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
