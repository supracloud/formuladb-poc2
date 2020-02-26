import { onEvent, onEventChildren, emit } from "@fe/delegated-events";
import { ImageInput, IconInput } from "@fe/component-editor/inputs";
import { updateDOM } from "@fe/live-dom-template/live-dom-template";
import { $FMODAL } from "@fe/directives/data-toggle-modal.directive";
import { BACKEND_SERVICE } from "@fe/backend.service";
import { PremiumIconRespose } from "@storage/icon-api";
import { ServerEventPutIcon } from "@domain/event";

const HTML: string = require('raw-loader!@fe-assets/frmdb-editor/icon-editor.component.html').default;
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/frmdb-editor/icon-editor.component.scss').default;

export class IconEditorComponent extends HTMLElement {
    iconInputProperty: IconInput | null = null;

    connectedCallback() {
        this.innerHTML = `<style>${CSS}</style> ${HTML}`;

        onEvent(this, 'change', '#frmdb-search-premium-icons', async (event) => {
            let res: PremiumIconRespose = await fetch(`/formuladb-api/${BACKEND_SERVICE().tenantName}/${BACKEND_SERVICE().appName}/premium-icons/${event.target!.value}`)
                .then(response => {
                    return response.json();
                });

            let premiumIcons = res.icons
            //for now it seems the API gives svg access just to public domain icons...
            .filter(hit => hit.license_description == "public-domain")
            .map(hit => ({
                iconId: hit.id,
                previewURL: hit.preview_url,
                tags: hit.tags.map(t => t.slug).join(' '),
            }));
            updateDOM({premiumIcons}, this);
            //TODO infinite scroll OR pagination

        });

        onEventChildren(this, 'click', '[data-frmdb-table="$FRMDB.$Icon[]"]', event => {
            if (!this.iconInputProperty) return;
            let iconName = event.target.closest('[data-frmdb-table="$FRMDB.$Icon[]"]').querySelector('frmdb-icon').getAttribute('name');
            this.iconInputProperty.setValue(iconName);
            this.iconInputProperty.emitChange();
            $FMODAL('#icon-editor-modal', 'hide');
            this.iconInputProperty = null;
        });
        
        onEventChildren(this, 'click', '[data-frmdb-premium-icon-id]', async (event) => {
            if (!this.iconInputProperty) return;
            
            let iconId = event.target!.closest('[data-frmdb-premium-icon-id]').getAttribute('data-frmdb-premium-icon-id');
            let ev: ServerEventPutIcon = await BACKEND_SERVICE().putEvent(new ServerEventPutIcon(
                BACKEND_SERVICE().tenantName, BACKEND_SERVICE().appName, iconId)) as ServerEventPutIcon;

            if (ev.state_ == 'ABORT' || ev.error_) {
                alert(`Error adding premium icon: ${ev.state_}, ${ev.error_}`);
                return;
            }

            emit(this, { type: "FrmdbIconsCssChanged"});

            this.iconInputProperty.setValue(ev.savedIconClass);
            this.iconInputProperty.emitChange();
            $FMODAL('#icon-editor-modal', 'hide');
            this.iconInputProperty = null;
        });
    }

    async start(iconInputProperty: IconInput) {
        if (this.iconInputProperty) return;

        this.iconInputProperty = iconInputProperty;
        $FMODAL('#icon-editor-modal');
    }
}
customElements.define('frmdb-icon-editor', IconEditorComponent);
