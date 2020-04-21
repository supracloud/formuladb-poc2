import { onEvent, onEventChildren, emit } from "@fe/delegated-events";
import { BACKEND_SERVICE } from "@fe/backend.service";
import { updateDOM } from "@fe/live-dom-template/live-dom-template";
import { searchFreeImages, searchPremiumImages } from "@storage/image-api";
import { $FRMDB_MODAL } from "@fe/directives/data-toggle-modal.directive";

const HTML: string = require('raw-loader!@fe-assets/frmdb-editor/img-editor.component.html').default;
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/frmdb-editor/img-editor.component.scss').default;

export interface ImagePropertyListener {
    setImgSrc(src: string);
    setBlob(name: string, blob: Blob): Promise<string | undefined>;
}

export class ImgEditorComponent extends HTMLElement {
    private imagePropertyListener: ImagePropertyListener;
    private modal: HTMLElement;

    connectedCallback() {
        this.innerHTML = `<style>${CSS}</style> ${HTML}`;
        this.modal = this.querySelector('#img-editor-modal') as HTMLElement;

        onEvent(this, 'change', '#frmdb-search-free-images', async (event) => {
            let res = await searchFreeImages(event.target!.value);

            let freeImagesUrls = res.hits.map(hit => {
                let tags = (hit.tags?.split(/\s*,\s*/)||[])
                    .concat(hit.pageURL?.replace(/\/$/, '').replace(/http.*\//, '')
                        .split(/-/)
                    ).join(',').replace(/[^a-z0-9]+/g, '_');
                return{
                    previewURL: hit.previewURL,
                    webformatURL: hit.webformatURL,
                    largeImageURL: hit.largeImageURL,
                    imgId: `${hit.id}__${tags}`,
                }
            });
            updateDOM({freeImagesUrls}, this);
            //TODO infinite scroll OR pagination
        });

        onEvent(this, 'change', '#frmdb-search-available-images', async (event) => {
            let searchTerm = event.target!.value;
            let mediaObjectsUrls = this.availableImages.filter(x => x.indexOf(searchTerm) >= 0);
            updateDOM({mediaObjectsUrls}, this);
        });

        onEvent(this, 'change', '#frmdb-search-premium-images', async (event) => {
            let res = await searchPremiumImages(event.target!.value);
            let premiumImagesUrls = res.data.map(hit => ({
                previewURL: hit.previewURL,
                imageId: hit.imageId,
            }));
            updateDOM({premiumImagesUrls}, this);
            //TODO infinite scroll OR pagination
        });

        onEvent(this, 'click', '[data-frmdb-value="mediaObjectsUrls[]"]', event => {
            if (!this.imagePropertyListener) return;
            let src = event.target.src;
            this.imagePropertyListener.setImgSrc(src.indexOf('http') === 0 ? new URL(src).pathname : src);
            $FRMDB_MODAL(this.modal, "hide");
        });

        onEvent(this, 'click', '[data-frmdb-download-url]', async (event) => {
            if (!this.imagePropertyListener) return;
            let imgUrl: string = event.target.dataset.frmdbDownloadUrl;
            if (!imgUrl) { console.error(`Cannot get imgUrl`, event); return;}
            let imgId = event.target.closest('[data-frmdb-img-id]')?.getAttribute('data-frmdb-img-id');
            if (!imgId) { console.error(`Cannot get imgId`, event); return;}
            let imgExt = imgUrl.match(/.*\.([a-z]+?)$/)?.[1];
            if (!imgExt) { console.error(`Cannot get imgExt`, event); return;}
            imgId = imgId + '.' + imgExt;
            let res = await fetch(imgUrl, {method: 'GET'})
            let imgBlob: Blob = await res.blob();
            await this.imagePropertyListener.setBlob(imgId, imgBlob);
            $FRMDB_MODAL(this.modal, "hide");
        });

        onEvent(this, 'click', '[data-frmdb-premium-image-select]', async (event) => {
            let size = event.target.getAttribute('data-frmdb-premium-image-select');
        });
    }

    availableImages: string[] = [];
    async start(imageProperty: ImagePropertyListener) {
        this.imagePropertyListener = imageProperty;
        let mediaObjectsUrls = await fetch(`/formuladb-api/${BACKEND_SERVICE().appName}/media`, {
            method: 'GET',
        })
            .then(function (response) {
                return response.json();
            });

        updateDOM({mediaObjectsUrls}, this);
        this.availableImages = mediaObjectsUrls;
        $FRMDB_MODAL(this.modal);
    }
}
customElements.define('frmdb-img-editor', ImgEditorComponent);
