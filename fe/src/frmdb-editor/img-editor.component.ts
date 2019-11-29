import { onEvent, onEventChildren, emit } from "@fe/delegated-events";
import { FrmdbSelectPageElement, FrmdbSelectPageElementAction } from "@fe/frmdb-user-events";
import { BACKEND_SERVICE } from "@fe/backend.service";
import { updateDOM } from "@fe/live-dom-template/live-dom-template";
import { searchFreeImages } from "@storage/image-api";
import { ImageInput } from "@fe/component-editor/inputs";

const HTML: string = require('raw-loader!@fe-assets/frmdb-editor/img-editor.component.html').default;
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/frmdb-editor/img-editor.component.scss').default;

export class ImgEditorComponent extends HTMLElement {
    private imageProperty: ImageInput;

    connectedCallback() {
        this.innerHTML = `<style>${CSS}</style> ${HTML}`;

        onEvent(this, 'change', '#frmdb-search-free-images', async (event) => {
            let res = await searchFreeImages(event.target!.value);
            let freeImagesUrls = res.hits.map(hit => hit.previewURL);
            updateDOM({freeImagesUrls}, this);
            //TODO infinite scroll OR pagination
        });

        onEvent(this, 'click', '[data-frmdb-value="mediaObjectsUrls[]"]', event => {
            if (!this.imageProperty) return;
            let src = event.target.src;
            this.imageProperty.setValue(src.indexOf('http') === 0 ? new URL(src).pathname : src);
            this.imageProperty.emitChange();
            ($('#img-editor-modal') as any).modal('hide');
        });
        
        onEvent(this, 'click', '[data-frmdb-value="freeImagesUrls[]"]', event => {
            if (!this.imageProperty) return;
            alert('Coming soon...');
        });
    }

    async start(imageProperty: ImageInput) {
        this.imageProperty = imageProperty;
        let mediaObjectsUrls = await fetch(`/formuladb-api/${BACKEND_SERVICE().tenantName}/${BACKEND_SERVICE().appName}/media`, {
            method: 'GET',
        })
            .then(function (response) {
                return response.json();
            });

        updateDOM({mediaObjectsUrls}, this);
        ($('#img-editor-modal') as any).modal('show');
    }
}
customElements.define('frmdb-img-editor', ImgEditorComponent);
