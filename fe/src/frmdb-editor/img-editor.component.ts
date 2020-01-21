import { onEvent, onEventChildren, emit } from "@fe/delegated-events";
import { FrmdbSelectPageElement, FrmdbSelectPageElementAction } from "@fe/frmdb-user-events";
import { BACKEND_SERVICE } from "@fe/backend.service";
import { updateDOM } from "@fe/live-dom-template/live-dom-template";
import { searchFreeImages } from "@storage/image-api";

const HTML: string = require('raw-loader!@fe-assets/frmdb-editor/img-editor.component.html').default;
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/frmdb-editor/img-editor.component.scss').default;

export interface ImagePropertyListener {
    setImgSrc(src: string);
    setBlob(name: string, blob: Blob): Promise<string | undefined>;
}

export class ImgEditorComponent extends HTMLElement {
    private imagePropertyListener: ImagePropertyListener;

    static observedAttributes = ["img-src"];
    attributeChangedCallback(attrName: string, oldVal, newVal) {
        if ('img-src' === attrName) {
            let inputEl: HTMLInputElement | undefined = this.parentElement!.querySelector('input') as HTMLInputElement | undefined;
            if (!inputEl) return;
            this.imagePropertyListener = {
                setImgSrc: (src: string) => {
                    if (!inputEl) return;
                    inputEl.value = src;
                    inputEl.dispatchEvent(new Event('change', {bubbles: true}));
                },
                setBlob: async (name: string, blob: Blob) => {
                    if (!inputEl) return;
                    let newSrc = await BACKEND_SERVICE().saveMedia(name, blob);
                    return newSrc;
                },
            };
    
            updateDOM({displayImgLink: true, imgSrc: inputEl.value}, this);
        }
    }

    connectedCallback() {
        this.innerHTML = `<style>${CSS}</style> ${HTML}`;

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
            ($('#img-editor-modal') as any).modal('hide');
        });

        onEvent(this, 'click', '[data-frmdb-download-url]', async (event) => {
            if (!this.imagePropertyListener) return;
            let imgUrl = event.target.dataset.frmdbDownloadUrl;
            let res = await fetch(imgUrl, {method: 'GET'})
            let imgBlob: Blob = await res.blob();
            this.imagePropertyListener.setBlob(imgUrl.substring(imgUrl.lastIndexOf('/') + 1), imgBlob);
            ($('#img-editor-modal') as any).modal('hide');
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
        ($('#img-editor-modal') as any).modal('show');
    }
}
customElements.define('frmdb-img-editor', ImgEditorComponent);
