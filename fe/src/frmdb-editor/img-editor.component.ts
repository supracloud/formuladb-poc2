import { onEvent, onEventChildren, emit } from "@fe/delegated-events";
import { FrmdbSelectPageElement, FrmdbSelectPageElementAction } from "@fe/frmdb-user-events";
import { BACKEND_SERVICE } from "@fe/backend.service";
import { updateDOM } from "@fe/live-dom-template/live-dom-template";
import { searchFreeImages } from "@storage/image-api";
import { NestedModalsMixin } from "@fe/mixins/nested-modal";

const HTML: string = require('raw-loader!@fe-assets/frmdb-editor/img-editor.component.html').default;
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/frmdb-editor/img-editor.component.scss').default;

export interface ImagePropertyListener {
    setImgSrc(src: string);
    setBlob(name: string, blob: Blob): Promise<string | undefined>;
}

export class ImgEditorComponent extends HTMLElement {
    private imagePropertyListener: ImagePropertyListener;
    private modal: NestedModalsMixin;

    connectedCallback() {
        this.innerHTML = `<style>${CSS}</style> ${HTML}`;
        this.modal = new NestedModalsMixin(this.querySelector('#img-editor-modal') as HTMLElement, 1070);

        onEvent(this, 'change', '#frmdb-search-free-images', async (event) => {
            let res = await searchFreeImages(event.target!.value);
            let freeImagesUrls = res.hits.map(hit => ({
                previewURL: hit.previewURL,
                webformatURL: hit.webformatURL,
                largeImageURL: hit.largeImageURL,
            }));
            updateDOM({freeImagesUrls}, this);
            //TODO infinite scroll OR pagination
        });

        onEvent(this, 'click', '[data-frmdb-value="mediaObjectsUrls[]"]', event => {
            if (!this.imagePropertyListener) return;
            let src = event.target.src;
            this.imagePropertyListener.setImgSrc(src.indexOf('http') === 0 ? new URL(src).pathname : src);
            this.modal.close();
        });

        onEvent(this, 'click', '[data-frmdb-download-url]', async (event) => {
            if (!this.imagePropertyListener) return;
            let imgUrl = event.target.dataset.frmdbDownloadUrl;
            let res = await fetch(imgUrl, {method: 'GET'})
            let imgBlob: Blob = await res.blob();
            await this.imagePropertyListener.setBlob(imgUrl.substring(imgUrl.lastIndexOf('/') + 1), imgBlob);
            this.modal.close()
        });
    }

    startDefault() {
        if (!this.imagePropertyListener) return;
        this.start(this.imagePropertyListener);
    }

    async start(imageProperty: ImagePropertyListener) {
        this.imagePropertyListener = imageProperty;
        let mediaObjectsUrls = await fetch(`/formuladb-api/${BACKEND_SERVICE().tenantName}/${BACKEND_SERVICE().appName}/media`, {
            method: 'GET',
        })
            .then(function (response) {
                return response.json();
            });

        updateDOM({mediaObjectsUrls}, this);
        this.modal.open();
}
}
customElements.define('frmdb-img-editor', ImgEditorComponent);
