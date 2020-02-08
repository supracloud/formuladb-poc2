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

        onEventChildren(this, 'click', '[data-frmdb-table="freeIconsClasses[]"]', event => {
            if (!this.iconInputProperty) return;
            let iconClass = event.target.closest('a').querySelector('i').getAttribute('class');
            this.iconInputProperty.setValue(iconClass);
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

        // let icons: string[] = await fetch(`/formuladb-api/${BACKEND_SERVICE().tenantName}/${BACKEND_SERVICE().appName}/icons`, {
        //     method: 'GET',
        // })
        //     .then(function (response) {
        //         return response.json();
        //     });

        this.iconInputProperty = iconInputProperty;
        $FMODAL('#icon-editor-modal');
        updateDOM({freeIconsClasses: FREE_ICONS.concat([])}, this);
    }
}
customElements.define('frmdb-icon-editor', IconEditorComponent);


const FREE_ICONS = [
    'fa fa-accessible-icon',
    'fa fa-accusoft',
    'fa fa-acquisitions-incorporated',
    'fa fa-ad',
    'fa fa-address-book',
    'fa fa-address-card',
    'fa fa-adjust',
    'fa fa-adn',
    'fa fa-adobe',
    'fa fa-adversal',
    'fa fa-affiliatetheme',
    'fa fa-air-freshener',
    'fa fa-airbnb',
    'fa fa-algolia',
    'fa fa-align-center',
    'fa fa-align-justify',
    'fa fa-align-left',
    'fa fa-align-right',
    'fa fa-alipay',
    'fa fa-allergies',
    'fa fa-amazon',
    'fa fa-amazon-pay',
    'fa fa-ambulance',
    'fa fa-american-sign-language-interpreting',
    'fa fa-amilia',
    'fa fa-anchor',
    'fa fa-android',
    'fa fa-angellist',
    'fa fa-angle-double-down',
    'fa fa-angle-double-left',
    'fa fa-angle-double-right',
    'fa fa-angle-double-up',
    'fa fa-angle-down',
    'fa fa-angle-left',
    'fa fa-angle-right',
    'fa fa-angle-up',
    'fa fa-angry',
    'fa fa-angrycreative',
    'fa fa-angular',
    'fa fa-ankh',
    'fa fa-app-store',
    'fa fa-app-store-ios',
    'fa fa-apper',
    'fa fa-apple',
    'fa fa-apple-alt',
    'fa fa-apple-pay',
    'fa fa-archive',
    'fa fa-archway',
    'fa fa-arrow-alt-circle-down',
    'fa fa-arrow-alt-circle-left',
    'fa fa-arrow-alt-circle-right',
    'fa fa-arrow-alt-circle-up',
    'fa fa-arrow-circle-down',
    'fa fa-arrow-circle-left',
    'fa fa-arrow-circle-right',
    'fa fa-arrow-circle-up',
    'fa fa-arrow-down',
    'fa fa-arrow-left',
    'fa fa-arrow-right',
    'fa fa-arrow-up',
    'fa fa-arrows-alt',
    'fa fa-arrows-alt-h',
    'fa fa-arrows-alt-v',
    'fa fa-artstation',
    'fa fa-assistive-listening-systems',
    'fa fa-asterisk',
    'fa fa-asymmetrik',
    'fa fa-at',
    'fa fa-atlas',
    'fa fa-atlassian',
    'fa fa-atom',
    'fa fa-audible',
    'fa fa-audio-description',
    'fa fa-autoprefixer',
    'fa fa-avianex',
    'fa fa-aviato',
    'fa fa-award',
    'fa fa-aws',
    'fa fa-baby',
    'fa fa-baby-carriage',
    'fa fa-backspace',
    'fa fa-backward',
    'fa fa-bacon',
    'fa fa-balance-scale',
    'fa fa-balance-scale-left',
    'fa fa-balance-scale-right',
    'fa fa-ban',
    'fa fa-band-aid',
    'fa fa-bandcamp',
    'fa fa-barcode',
    'fa fa-bars',
    'fa fa-baseball-ball',
    'fa fa-basketball-ball',
    'fa fa-bath',
    'fa fa-battery-empty',
    'fa fa-battery-full',
    'fa fa-battery-half',
    'fa fa-battery-quarter',
    'fa fa-battery-three-quarters',
    'fa fa-battle-net',
    'fa fa-bed',
    'fa fa-beer',
    'fa fa-behance',
    'fa fa-behance-square',
    'fa fa-bell',
    'fa fa-bell-slash',
    'fa fa-bezier-curve',
    'fa fa-bible',
    'fa fa-bicycle',
    'fa fa-biking',
    'fa fa-bimobject',
    'fa fa-binoculars',
    'fa fa-biohazard',
    'fa fa-birthday-cake',
    'fa fa-bitbucket',
    'fa fa-bitcoin',
    'fa fa-bity',
    'fa fa-black-tie',
    'fa fa-blackberry',
    'fa fa-blender',
    'fa fa-blender-phone',
    'fa fa-blind',
    'fa fa-blog',
    'fa fa-blogger',
    'fa fa-blogger-b',
    'fa fa-bluetooth',
    'fa fa-bluetooth-b',
    'fa fa-bold',
    'fa fa-bolt',
    'fa fa-bomb',
    'fa fa-bone',
    'fa fa-bong',
    'fa fa-book',
    'fa fa-book-dead',
    'fa fa-book-medical',
    'fa fa-book-open',
    'fa fa-book-reader',
    'fa fa-bookmark',
    'fa fa-bootstrap',
    'fa fa-border-all',
    'fa fa-border-none',
    'fa fa-border-style',
    'fa fa-bowling-ball',
    'fa fa-box',
    'fa fa-box-open',
    'fa fa-boxes',
    'fa fa-braille',
    'fa fa-brain',
    'fa fa-bread-slice',
    'fa fa-briefcase',
    'fa fa-briefcase-medical',
    'fa fa-broadcast-tower',
    'fa fa-broom',
    'fa fa-brush',
    'fa fa-btc',
    'fa fa-buffer',
    'fa fa-bug',
    'fa fa-building',
    'fa fa-bullhorn',
    'fa fa-bullseye',
    'fa fa-burn',
    'fa fa-buromobelexperte',
    'fa fa-bus',
    'fa fa-bus-alt',
    'fa fa-business-time',
    'fa fa-buy-n-large',
    'fa fa-buysellads',
    'fa fa-calculator',
    'fa fa-calendar',
    'fa fa-calendar-alt',
    'fa fa-calendar-check',
    'fa fa-calendar-day',
    'fa fa-calendar-minus',
    'fa fa-calendar-plus',
    'fa fa-calendar-times',
    'fa fa-calendar-week',
    'fa fa-camera',
    'fa fa-camera-retro',
    'fa fa-campground',
    'fa fa-canadian-maple-leaf',
    'fa fa-candy-cane',
    'fa fa-cannabis',
    'fa fa-capsules',
    'fa fa-car',
    'fa fa-car-alt',
    'fa fa-car-battery',
    'fa fa-car-crash',
    'fa fa-car-side',
    'fa fa-caret-down',
    'fa fa-caret-left',
    'fa fa-caret-right',
    'fa fa-caret-square-down',
    'fa fa-caret-square-left',
    'fa fa-caret-square-right',
    'fa fa-caret-square-up',
    'fa fa-caret-up',
    'fa fa-carrot',
    'fa fa-cart-arrow-down',
    'fa fa-cart-plus',
    'fa fa-cash-register',
    'fa fa-cat',
    'fa fa-cc-amazon-pay',
    'fa fa-cc-amex',
    'fa fa-cc-apple-pay',
    'fa fa-cc-diners-club',
    'fa fa-cc-discover',
    'fa fa-cc-jcb',
    'fa fa-cc-mastercard',
    'fa fa-cc-paypal',
    'fa fa-cc-stripe',
    'fa fa-cc-visa',
    'fa fa-centercode',
    'fa fa-centos',
    'fa fa-certificate',
    'fa fa-chair',
    'fa fa-chalkboard',
    'fa fa-chalkboard-teacher',
    'fa fa-charging-station',
    'fa fa-chart-area',
    'fa fa-chart-bar',
    'fa fa-chart-line',
    'fa fa-chart-pie',
    'fa fa-check',
    'fa fa-check-circle',
    'fa fa-check-double',
    'fa fa-check-square',
    'fa fa-cheese',
    'fa fa-chess',
    'fa fa-chess-bishop',
    'fa fa-chess-board',
    'fa fa-chess-king',
    'fa fa-chess-knight',
    'fa fa-chess-pawn',
    'fa fa-chess-queen',
    'fa fa-chess-rook',
    'fa fa-chevron-circle-down',
    'fa fa-chevron-circle-left',
    'fa fa-chevron-circle-right',
    'fa fa-chevron-circle-up',
    'fa fa-chevron-down',
    'fa fa-chevron-left',
    'fa fa-chevron-right',
    'fa fa-chevron-up',
    'fa fa-child',
    'fa fa-chrome',
    'fa fa-chromecast',
    'fa fa-church',
    'fa fa-circle',
    'fa fa-circle-notch',
    'fa fa-city',
    'fa fa-clinic-medical',
    'fa fa-clipboard',
    'fa fa-clipboard-check',
    'fa fa-clipboard-list',
    'fa fa-clock',
    'fa fa-clone',
    'fa fa-closed-captioning',
    'fa fa-cloud',
    'fa fa-cloud-download-alt',
    'fa fa-cloud-meatball',
    'fa fa-cloud-moon',
    'fa fa-cloud-moon-rain',
    'fa fa-cloud-rain',
    'fa fa-cloud-showers-heavy',
    'fa fa-cloud-sun',
    'fa fa-cloud-sun-rain',
    'fa fa-cloud-upload-alt',
    'fa fa-cloudscale',
    'fa fa-cloudsmith',
    'fa fa-cloudversify',
    'fa fa-cocktail',
    'fa fa-code',
    'fa fa-code-branch',
    'fa fa-codepen',
    'fa fa-codiepie',
    'fa fa-coffee',
    'fa fa-cog',
    'fa fa-cogs',
    'fa fa-coins',
    'fa fa-columns',
    'fa fa-comment',
    'fa fa-comment-alt',
    'fa fa-comment-dollar',
    'fa fa-comment-dots',
    'fa fa-comment-medical',
    'fa fa-comment-slash',
    'fa fa-comments',
    'fa fa-comments-dollar',
    'fa fa-compact-disc',
    'fa fa-compass',
    'fa fa-compress',
    'fa fa-compress-arrows-alt',
    'fa fa-concierge-bell',
    'fa fa-confluence',
    'fa fa-connectdevelop',
    'fa fa-contao',
    'fa fa-cookie',
    'fa fa-cookie-bite',
    'fa fa-copy',
    'fa fa-copyright',
    'fa fa-cotton-bureau',
    'fa fa-couch',
    'fa fa-cpanel',
    'fa fa-creative-commons',
    'fa fa-creative-commons-by',
    'fa fa-creative-commons-nc',
    'fa fa-creative-commons-nc-eu',
    'fa fa-creative-commons-nc-jp',
    'fa fa-creative-commons-nd',
    'fa fa-creative-commons-pd',
    'fa fa-creative-commons-pd-alt',
    'fa fa-creative-commons-remix',
    'fa fa-creative-commons-sa',
    'fa fa-creative-commons-sampling',
    'fa fa-creative-commons-sampling-plus',
    'fa fa-creative-commons-share',
    'fa fa-creative-commons-zero',
    'fa fa-credit-card',
    'fa fa-critical-role',
    'fa fa-crop',
    'fa fa-crop-alt',
    'fa fa-cross',
    'fa fa-crosshairs',
    'fa fa-crow',
    'fa fa-crown',
    'fa fa-crutch',
    'fa fa-css3',
    'fa fa-css3-alt',
    'fa fa-cube',
    'fa fa-cubes',
    'fa fa-cut',
    'fa fa-cuttlefish',
    'fa fa-d-and-d',
    'fa fa-d-and-d-beyond',
    'fa fa-dashcube',
    'fa fa-database',
    'fa fa-deaf',
    'fa fa-delicious',
    'fa fa-democrat',
    'fa fa-deploydog',
    'fa fa-deskpro',
    'fa fa-desktop',
    'fa fa-dev',
    'fa fa-deviantart',
    'fa fa-dharmachakra',
    'fa fa-dhl',
    'fa fa-diagnoses',
    'fa fa-diaspora',
    'fa fa-dice',
    'fa fa-dice-d20',
    'fa fa-dice-d6',
    'fa fa-dice-five',
    'fa fa-dice-four',
    'fa fa-dice-one',
    'fa fa-dice-six',
    'fa fa-dice-three',
    'fa fa-dice-two',
    'fa fa-digg',
    'fa fa-digital-ocean',
    'fa fa-digital-tachograph',
    'fa fa-directions',
    'fa fa-discord',
    'fa fa-discourse',
    'fa fa-divide',
    'fa fa-dizzy',
    'fa fa-dna',
    'fa fa-dochub',
    'fa fa-docker',
    'fa fa-dog',
    'fa fa-dollar-sign',
    'fa fa-dolly',
    'fa fa-dolly-flatbed',
    'fa fa-donate',
    'fa fa-door-closed',
    'fa fa-door-open',
    'fa fa-dot-circle',
    'fa fa-dove',
    'fa fa-download',
    'fa fa-draft2digital',
    'fa fa-drafting-compass',
    'fa fa-dragon',
    'fa fa-draw-polygon',
    'fa fa-dribbble',
    'fa fa-dribbble-square',
    'fa fa-dropbox',
    'fa fa-drum',
    'fa fa-drum-steelpan',
    'fa fa-drumstick-bite',
    'fa fa-drupal',
    'fa fa-dumbbell',
    'fa fa-dumpster',
    'fa fa-dumpster-fire',
    'fa fa-dungeon',
    'fa fa-dyalog',
    'fa fa-earlybirds',
    'fa fa-ebay',
    'fa fa-edge',
    'fa fa-edit',
    'fa fa-egg',
    'fa fa-eject',
    'fa fa-elementor',
    'fa fa-ellipsis-h',
    'fa fa-ellipsis-v',
    'fa fa-ello',
    'fa fa-ember',
    'fa fa-empire',
    'fa fa-envelope',
    'fa fa-envelope-open',
    'fa fa-envelope-open-text',
    'fa fa-envelope-square',
    'fa fa-envira',
    'fa fa-equals',
    'fa fa-eraser',
    'fa fa-erlang',
    'fa fa-ethereum',
    'fa fa-ethernet',
    'fa fa-etsy',
    'fa fa-euro-sign',
    'fa fa-evernote',
    'fa fa-exchange-alt',
    'fa fa-exclamation',
    'fa fa-exclamation-circle',
    'fa fa-exclamation-triangle',
    'fa fa-expand',
    'fa fa-expand-arrows-alt',
    'fa fa-expeditedssl',
    'fa fa-external-link-alt',
    'fa fa-external-link-square-alt',
    'fa fa-eye',
    'fa fa-eye-dropper',
    'fa fa-eye-slash',
    'fa fa-facebook',
    'fa fa-facebook-f',
    'fa fa-facebook-messenger',
    'fa fa-facebook-square',
    'fa fa-fan',
    'fa fa-fantasy-flight-games',
    'fa fa-fast-backward',
    'fa fa-fast-forward',
    'fa fa-fax',
    'fa fa-feather',
    'fa fa-feather-alt',
    'fa fa-fedex',
    'fa fa-fedora',
    'fa fa-female',
    'fa fa-fighter-jet',
    'fa fa-figma',
    'fa fa-file',
    'fa fa-file-alt',
    'fa fa-file-archive',
    'fa fa-file-audio',
    'fa fa-file-code',
    'fa fa-file-contract',
    'fa fa-file-csv',
    'fa fa-file-download',
    'fa fa-file-excel',
    'fa fa-file-export',
    'fa fa-file-image',
    'fa fa-file-import',
    'fa fa-file-invoice',
    'fa fa-file-invoice-dollar',
    'fa fa-file-medical',
    'fa fa-file-medical-alt',
    'fa fa-file-pdf',
    'fa fa-file-powerpoint',
    'fa fa-file-prescription',
    'fa fa-file-signature',
    'fa fa-file-upload',
    'fa fa-file-video',
    'fa fa-file-word',
    'fa fa-fill',
    'fa fa-fill-drip',
    'fa fa-film',
    'fa fa-filter',
    'fa fa-fingerprint',
    'fa fa-fire',
    'fa fa-fire-alt',
    'fa fa-fire-extinguisher',
    'fa fa-firefox',
    'fa fa-first-aid',
    'fa fa-first-order',
    'fa fa-first-order-alt',
    'fa fa-firstdraft',
    'fa fa-fish',
    'fa fa-fist-raised',
    'fa fa-flag',
    'fa fa-flag-checkered',
    'fa fa-flag-usa',
    'fa fa-flask',
    'fa fa-flickr',
    'fa fa-flipboard',
    'fa fa-flushed',
    'fa fa-fly',
    'fa fa-folder',
    'fa fa-folder-minus',
    'fa fa-folder-open',
    'fa fa-folder-plus',
    'fa fa-font',
    'fa fa-font-awesome',
    'fa fa-font-awesome-alt',
    'fa fa-font-awesome-flag',
    'fa fa-font-awesome-logo-full',
    'fa fa-fonticons',
    'fa fa-fonticons-fi',
    'fa fa-football-ball',
    'fa fa-fort-awesome',
    'fa fa-fort-awesome-alt',
    'fa fa-forumbee',
    'fa fa-forward',
    'fa fa-foursquare',
    'fa fa-free-code-camp',
    'fa fa-freebsd',
    'fa fa-frog',
    'fa fa-frown',
    'fa fa-frown-open',
    'fa fa-fulcrum',
    'fa fa-funnel-dollar',
    'fa fa-futbol',
    'fa fa-galactic-republic',
    'fa fa-galactic-senate',
    'fa fa-gamepad',
    'fa fa-gas-pump',
    'fa fa-gavel',
    'fa fa-gem',
    'fa fa-genderless',
    'fa fa-get-pocket',
    'fa fa-gg',
    'fa fa-gg-circle',
    'fa fa-ghost',
    'fa fa-gift',
    'fa fa-gifts',
    'fa fa-git',
    'fa fa-git-alt',
    'fa fa-git-square',
    'fa fa-github',
    'fa fa-github-alt',
    'fa fa-github-square',
    'fa fa-gitkraken',
    'fa fa-gitlab',
    'fa fa-gitter',
    'fa fa-glass-cheers',
    'fa fa-glass-martini',
    'fa fa-glass-martini-alt',
    'fa fa-glass-whiskey',
    'fa fa-glasses',
    'fa fa-glide',
    'fa fa-glide-g',
    'fa fa-globe',
    'fa fa-globe-africa',
    'fa fa-globe-americas',
    'fa fa-globe-asia',
    'fa fa-globe-europe',
    'fa fa-gofore',
    'fa fa-golf-ball',
    'fa fa-goodreads',
    'fa fa-goodreads-g',
    'fa fa-google',
    'fa fa-google-drive',
    'fa fa-google-play',
    'fa fa-google-plus',
    'fa fa-google-plus-g',
    'fa fa-google-plus-square',
    'fa fa-google-wallet',
    'fa fa-gopuram',
    'fa fa-graduation-cap',
    'fa fa-gratipay',
    'fa fa-grav',
    'fa fa-greater-than',
    'fa fa-greater-than-equal',
    'fa fa-grimace',
    'fa fa-grin',
    'fa fa-grin-alt',
    'fa fa-grin-beam',
    'fa fa-grin-beam-sweat',
    'fa fa-grin-hearts',
    'fa fa-grin-squint',
    'fa fa-grin-squint-tears',
    'fa fa-grin-stars',
    'fa fa-grin-tears',
    'fa fa-grin-tongue',
    'fa fa-grin-tongue-squint',
    'fa fa-grin-tongue-wink',
    'fa fa-grin-wink',
    'fa fa-grip-horizontal',
    'fa fa-grip-lines',
    'fa fa-grip-lines-vertical',
    'fa fa-grip-vertical',
    'fa fa-gripfire',
    'fa fa-grunt',
    'fa fa-guitar',
    'fa fa-gulp',
    'fa fa-h-square',
    'fa fa-hacker-news',
    'fa fa-hacker-news-square',
    'fa fa-hackerrank',
    'fa fa-hamburger',
    'fa fa-hammer',
    'fa fa-hamsa',
    'fa fa-hand-holding',
    'fa fa-hand-holding-heart',
    'fa fa-hand-holding-usd',
    'fa fa-hand-lizard',
    'fa fa-hand-middle-finger',
    'fa fa-hand-paper',
    'fa fa-hand-peace',
    'fa fa-hand-point-down',
    'fa fa-hand-point-left',
    'fa fa-hand-point-right',
    'fa fa-hand-point-up',
    'fa fa-hand-pointer',
    'fa fa-hand-rock',
    'fa fa-hand-scissors',
    'fa fa-hand-spock',
    'fa fa-hands',
    'fa fa-hands-helping',
    'fa fa-handshake',
    'fa fa-hanukiah',
    'fa fa-hard-hat',
    'fa fa-hashtag',
    'fa fa-hat-cowboy',
    'fa fa-hat-cowboy-side',
    'fa fa-hat-wizard',
    'fa fa-haykal',
    'fa fa-hdd',
    'fa fa-heading',
    'fa fa-headphones',
    'fa fa-headphones-alt',
    'fa fa-headset',
    'fa fa-heart',
    'fa fa-heart-broken',
    'fa fa-heartbeat',
    'fa fa-helicopter',
    'fa fa-highlighter',
    'fa fa-hiking',
    'fa fa-hippo',
    'fa fa-hips',
    'fa fa-hire-a-helper',
    'fa fa-history',
    'fa fa-hockey-puck',
    'fa fa-holly-berry',
    'fa fa-home',
    'fa fa-hooli',
    'fa fa-hornbill',
    'fa fa-horse',
    'fa fa-horse-head',
    'fa fa-hospital',
    'fa fa-hospital-alt',
    'fa fa-hospital-symbol',
    'fa fa-hot-tub',
    'fa fa-hotdog',
    'fa fa-hotel',
    'fa fa-hotjar',
    'fa fa-hourglass',
    'fa fa-hourglass-end',
    'fa fa-hourglass-half',
    'fa fa-hourglass-start',
    'fa fa-house-damage',
    'fa fa-houzz',
    'fa fa-hryvnia',
    'fa fa-html5',
    'fa fa-hubspot',
    'fa fa-i-cursor',
    'fa fa-ice-cream',
    'fa fa-icicles',
    'fa fa-icons',
    'fa fa-id-badge',
    'fa fa-id-card',
    'fa fa-id-card-alt',
    'fa fa-igloo',
    'fa fa-image',
    'fa fa-images',
    'fa fa-imdb',
    'fa fa-inbox',
    'fa fa-indent',
    'fa fa-industry',
    'fa fa-infinity',
    'fa fa-info',
    'fa fa-info-circle',
    'fa fa-instagram',
    'fa fa-intercom',
    'fa fa-internet-explorer',
    'fa fa-invision',
    'fa fa-ioxhost',
    'fa fa-italic',
    'fa fa-itch-io',
    'fa fa-itunes',
    'fa fa-itunes-note',
    'fa fa-java',
    'fa fa-jedi',
    'fa fa-jedi-order',
    'fa fa-jenkins',
    'fa fa-jira',
    'fa fa-joget',
    'fa fa-joint',
    'fa fa-joomla',
    'fa fa-journal-whills',
    'fa fa-js',
    'fa fa-js-square',
    'fa fa-jsfiddle',
    'fa fa-kaaba',
    'fa fa-kaggle',
    'fa fa-key',
    'fa fa-keybase',
    'fa fa-keyboard',
    'fa fa-keycdn',
    'fa fa-khanda',
    'fa fa-kickstarter',
    'fa fa-kickstarter-k',
    'fa fa-kiss',
    'fa fa-kiss-beam',
    'fa fa-kiss-wink-heart',
    'fa fa-kiwi-bird',
    'fa fa-korvue',
    'fa fa-landmark',
    'fa fa-language',
    'fa fa-laptop',
    'fa fa-laptop-code',
    'fa fa-laptop-medical',
    'fa fa-laravel',
    'fa fa-lastfm',
    'fa fa-lastfm-square',
    'fa fa-laugh',
    'fa fa-laugh-beam',
    'fa fa-laugh-squint',
    'fa fa-laugh-wink',
    'fa fa-layer-group',
    'fa fa-leaf',
    'fa fa-leanpub',
    'fa fa-lemon',
    'fa fa-less',
    'fa fa-less-than',
    'fa fa-less-than-equal',
    'fa fa-level-down-alt',
    'fa fa-level-up-alt',
    'fa fa-life-ring',
    'fa fa-lightbulb',
    'fa fa-line',
    'fa fa-link',
    'fa fa-linkedin',
    'fa fa-linkedin-in',
    'fa fa-linode',
    'fa fa-linux',
    'fa fa-lira-sign',
    'fa fa-list',
    'fa fa-list-alt',
    'fa fa-list-ol',
    'fa fa-list-ul',
    'fa fa-location-arrow',
    'fa fa-lock',
    'fa fa-lock-open',
    'fa fa-long-arrow-alt-down',
    'fa fa-long-arrow-alt-left',
    'fa fa-long-arrow-alt-right',
    'fa fa-long-arrow-alt-up',
    'fa fa-low-vision',
    'fa fa-luggage-cart',
    'fa fa-lyft',
    'fa fa-magento',
    'fa fa-magic',
    'fa fa-magnet',
    'fa fa-mail-bulk',
    'fa fa-mailchimp',
    'fa fa-male',
    'fa fa-mandalorian',
    'fa fa-map',
    'fa fa-map-marked',
    'fa fa-map-marked-alt',
    'fa fa-map-marker',
    'fa fa-map-marker-alt',
    'fa fa-map-pin',
    'fa fa-map-signs',
    'fa fa-markdown',
    'fa fa-marker',
    'fa fa-mars',
    'fa fa-mars-double',
    'fa fa-mars-stroke',
    'fa fa-mars-stroke-h',
    'fa fa-mars-stroke-v',
    'fa fa-mask',
    'fa fa-mastodon',
    'fa fa-maxcdn',
    'fa fa-mdb',
    'fa fa-medal',
    'fa fa-medapps',
    'fa fa-medium',
    'fa fa-medium-m',
    'fa fa-medkit',
    'fa fa-medrt',
    'fa fa-meetup',
    'fa fa-megaport',
    'fa fa-meh',
    'fa fa-meh-blank',
    'fa fa-meh-rolling-eyes',
    'fa fa-memory',
    'fa fa-mendeley',
    'fa fa-menorah',
    'fa fa-mercury',
    'fa fa-meteor',
    'fa fa-microchip',
    'fa fa-microphone',
    'fa fa-microphone-alt',
    'fa fa-microphone-alt-slash',
    'fa fa-microphone-slash',
    'fa fa-microscope',
    'fa fa-microsoft',
    'fa fa-minus',
    'fa fa-minus-circle',
    'fa fa-minus-square',
    'fa fa-mitten',
    'fa fa-mix',
    'fa fa-mixcloud',
    'fa fa-mizuni',
    'fa fa-mobile',
    'fa fa-mobile-alt',
    'fa fa-modx',
    'fa fa-monero',
    'fa fa-money-bill',
    'fa fa-money-bill-alt',
    'fa fa-money-bill-wave',
    'fa fa-money-bill-wave-alt',
    'fa fa-money-check',
    'fa fa-money-check-alt',
    'fa fa-monument',
    'fa fa-moon',
    'fa fa-mortar-pestle',
    'fa fa-mosque',
    'fa fa-motorcycle',
    'fa fa-mountain',
    'fa fa-mouse',
    'fa fa-mouse-pointer',
    'fa fa-mug-hot',
    'fa fa-music',
    'fa fa-napster',
    'fa fa-neos',
    'fa fa-network-wired',
    'fa fa-neuter',
    'fa fa-newspaper',
    'fa fa-nimblr',
    'fa fa-node',
    'fa fa-node-js',
    'fa fa-not-equal',
    'fa fa-notes-medical',
    'fa fa-npm',
    'fa fa-ns8',
    'fa fa-nutritionix',
    'fa fa-object-group',
    'fa fa-object-ungroup',
    'fa fa-odnoklassniki',
    'fa fa-odnoklassniki-square',
    'fa fa-oil-can',
    'fa fa-old-republic',
    'fa fa-om',
    'fa fa-opencart',
    'fa fa-openid',
    'fa fa-opera',
    'fa fa-optin-monster',
    'fa fa-orcid',
    'fa fa-osi',
    'fa fa-otter',
    'fa fa-outdent',
    'fa fa-page4',
    'fa fa-pagelines',
    'fa fa-pager',
    'fa fa-paint-brush',
    'fa fa-paint-roller',
    'fa fa-palette',
    'fa fa-palfed',
    'fa fa-pallet',
    'fa fa-paper-plane',
    'fa fa-paperclip',
    'fa fa-parachute-box',
    'fa fa-paragraph',
    'fa fa-parking',
    'fa fa-passport',
    'fa fa-pastafarianism',
    'fa fa-paste',
    'fa fa-patreon',
    'fa fa-pause',
    'fa fa-pause-circle',
    'fa fa-paw',
    'fa fa-paypal',
    'fa fa-peace',
    'fa fa-pen',
    'fa fa-pen-alt',
    'fa fa-pen-fancy',
    'fa fa-pen-nib',
    'fa fa-pen-square',
    'fa fa-pencil-alt',
    'fa fa-pencil-ruler',
    'fa fa-penny-arcade',
    'fa fa-people-carry',
    'fa fa-pepper-hot',
    'fa fa-percent',
    'fa fa-percentage',
    'fa fa-periscope',
    'fa fa-person-booth',
    'fa fa-phabricator',
    'fa fa-phoenix-framework',
    'fa fa-phoenix-squadron',
    'fa fa-phone',
    'fa fa-phone-alt',
    'fa fa-phone-slash',
    'fa fa-phone-square',
    'fa fa-phone-square-alt',
    'fa fa-phone-volume',
    'fa fa-photo-video',
    'fa fa-php',
    'fa fa-pied-piper',
    'fa fa-pied-piper-alt',
    'fa fa-pied-piper-hat',
    'fa fa-pied-piper-pp',
    'fa fa-piggy-bank',
    'fa fa-pills',
    'fa fa-pinterest',
    'fa fa-pinterest-p',
    'fa fa-pinterest-square',
    'fa fa-pizza-slice',
    'fa fa-place-of-worship',
    'fa fa-plane',
    'fa fa-plane-arrival',
    'fa fa-plane-departure',
    'fa fa-play',
    'fa fa-play-circle',
    'fa fa-playstation',
    'fa fa-plug',
    'fa fa-plus',
    'fa fa-plus-circle',
    'fa fa-plus-square',
    'fa fa-podcast',
    'fa fa-poll',
    'fa fa-poll-h',
    'fa fa-poo',
    'fa fa-poo-storm',
    'fa fa-poop',
    'fa fa-portrait',
    'fa fa-pound-sign',
    'fa fa-power-off',
    'fa fa-pray',
    'fa fa-praying-hands',
    'fa fa-prescription',
    'fa fa-prescription-bottle',
    'fa fa-prescription-bottle-alt',
    'fa fa-print',
    'fa fa-procedures',
    'fa fa-product-hunt',
    'fa fa-project-diagram',
    'fa fa-pushed',
    'fa fa-puzzle-piece',
    'fa fa-python',
    'fa fa-qq',
    'fa fa-qrcode',
    'fa fa-question',
    'fa fa-question-circle',
    'fa fa-quidditch',
    'fa fa-quinscape',
    'fa fa-quora',
    'fa fa-quote-left',
    'fa fa-quote-right',
    'fa fa-quran',
    'fa fa-r-project',
    'fa fa-radiation',
    'fa fa-radiation-alt',
    'fa fa-rainbow',
    'fa fa-random',
    'fa fa-raspberry-pi',
    'fa fa-ravelry',
    'fa fa-react',
    'fa fa-reacteurope',
    'fa fa-readme',
    'fa fa-rebel',
    'fa fa-receipt',
    'fa fa-record-vinyl',
    'fa fa-recycle',
    'fa fa-red-river',
    'fa fa-reddit',
    'fa fa-reddit-alien',
    'fa fa-reddit-square',
    'fa fa-redhat',
    'fa fa-redo',
    'fa fa-redo-alt',
    'fa fa-registered',
    'fa fa-remove-format',
    'fa fa-renren',
    'fa fa-reply',
    'fa fa-reply-all',
    'fa fa-replyd',
    'fa fa-republican',
    'fa fa-researchgate',
    'fa fa-resolving',
    'fa fa-restroom',
    'fa fa-retweet',
    'fa fa-rev',
    'fa fa-ribbon',
    'fa fa-ring',
    'fa fa-road',
    'fa fa-robot',
    'fa fa-rocket',
    'fa fa-rocketchat',
    'fa fa-rockrms',
    'fa fa-route',
    'fa fa-rss',
    'fa fa-rss-square',
    'fa fa-ruble-sign',
    'fa fa-ruler',
    'fa fa-ruler-combined',
    'fa fa-ruler-horizontal',
    'fa fa-ruler-vertical',
    'fa fa-running',
    'fa fa-rupee-sign',
    'fa fa-sad-cry',
    'fa fa-sad-tear',
    'fa fa-safari',
    'fa fa-salesforce',
    'fa fa-sass',
    'fa fa-satellite',
    'fa fa-satellite-dish',
    'fa fa-save',
    'fa fa-schlix',
    'fa fa-school',
    'fa fa-screwdriver',
    'fa fa-scribd',
    'fa fa-scroll',
    'fa fa-sd-card',
    'fa fa-search',
    'fa fa-search-dollar',
    'fa fa-search-location',
    'fa fa-search-minus',
    'fa fa-search-plus',
    'fa fa-searchengin',
    'fa fa-seedling',
    'fa fa-sellcast',
    'fa fa-sellsy',
    'fa fa-server',
    'fa fa-servicestack',
    'fa fa-shapes',
    'fa fa-share',
    'fa fa-share-alt',
    'fa fa-share-alt-square',
    'fa fa-share-square',
    'fa fa-shekel-sign',
    'fa fa-shield-alt',
    'fa fa-ship',
    'fa fa-shipping-fast',
    'fa fa-shirtsinbulk',
    'fa fa-shoe-prints',
    'fa fa-shopping-bag',
    'fa fa-shopping-basket',
    'fa fa-shopping-cart',
    'fa fa-shopware',
    'fa fa-shower',
    'fa fa-shuttle-van',
    'fa fa-sign',
    'fa fa-sign-in-alt',
    'fa fa-sign-language',
    'fa fa-sign-out-alt',
    'fa fa-signal',
    'fa fa-signature',
    'fa fa-sim-card',
    'fa fa-simplybuilt',
    'fa fa-sistrix',
    'fa fa-sitemap',
    'fa fa-sith',
    'fa fa-skating',
    'fa fa-sketch',
    'fa fa-skiing',
    'fa fa-skiing-nordic',
    'fa fa-skull',
    'fa fa-skull-crossbones',
    'fa fa-skyatlas',
    'fa fa-skype',
    'fa fa-slack',
    'fa fa-slack-hash',
    'fa fa-slash',
    'fa fa-sleigh',
    'fa fa-sliders-h',
    'fa fa-slideshare',
    'fa fa-smile',
    'fa fa-smile-beam',
    'fa fa-smile-wink',
    'fa fa-smog',
    'fa fa-smoking',
    'fa fa-smoking-ban',
    'fa fa-sms',
    'fa fa-snapchat',
    'fa fa-snapchat-ghost',
    'fa fa-snapchat-square',
    'fa fa-snowboarding',
    'fa fa-snowflake',
    'fa fa-snowman',
    'fa fa-snowplow',
    'fa fa-socks',
    'fa fa-solar-panel',
    'fa fa-sort',
    'fa fa-sort-alpha-down',
    'fa fa-sort-alpha-down-alt',
    'fa fa-sort-alpha-up',
    'fa fa-sort-alpha-up-alt',
    'fa fa-sort-amount-down',
    'fa fa-sort-amount-down-alt',
    'fa fa-sort-amount-up',
    'fa fa-sort-amount-up-alt',
    'fa fa-sort-down',
    'fa fa-sort-numeric-down',
    'fa fa-sort-numeric-down-alt',
    'fa fa-sort-numeric-up',
    'fa fa-sort-numeric-up-alt',
    'fa fa-sort-up',
    'fa fa-soundcloud',
    'fa fa-sourcetree',
    'fa fa-spa',
    'fa fa-space-shuttle',
    'fa fa-speakap',
    'fa fa-speaker-deck',
    'fa fa-spell-check',
    'fa fa-spider',
    'fa fa-spinner',
    'fa fa-splotch',
    'fa fa-spotify',
    'fa fa-spray-can',
    'fa fa-square',
    'fa fa-square-full',
    'fa fa-square-root-alt',
    'fa fa-squarespace',
    'fa fa-stack-exchange',
    'fa fa-stack-overflow',
    'fa fa-stackpath',
    'fa fa-stamp',
    'fa fa-star',
    'fa fa-star-and-crescent',
    'fa fa-star-half',
    'fa fa-star-half-alt',
    'fa fa-star-of-david',
    'fa fa-star-of-life',
    'fa fa-staylinked',
    'fa fa-steam',
    'fa fa-steam-square',
    'fa fa-steam-symbol',
    'fa fa-step-backward',
    'fa fa-step-forward',
    'fa fa-stethoscope',
    'fa fa-sticker-mule',
    'fa fa-sticky-note',
    'fa fa-stop',
    'fa fa-stop-circle',
    'fa fa-stopwatch',
    'fa fa-store',
    'fa fa-store-alt',
    'fa fa-strava',
    'fa fa-stream',
    'fa fa-street-view',
    'fa fa-strikethrough',
    'fa fa-stripe',
    'fa fa-stripe-s',
    'fa fa-stroopwafel',
    'fa fa-studiovinari',
    'fa fa-stumbleupon',
    'fa fa-stumbleupon-circle',
    'fa fa-subscript',
    'fa fa-subway',
    'fa fa-suitcase',
    'fa fa-suitcase-rolling',
    'fa fa-sun',
    'fa fa-superpowers',
    'fa fa-superscript',
    'fa fa-supple',
    'fa fa-surprise',
    'fa fa-suse',
    'fa fa-swatchbook',
    'fa fa-swift',
    'fa fa-swimmer',
    'fa fa-swimming-pool',
    'fa fa-symfony',
    'fa fa-synagogue',
    'fa fa-sync',
    'fa fa-sync-alt',
    'fa fa-syringe',
    'fa fa-table',
    'fa fa-table-tennis',
    'fa fa-tablet',
    'fa fa-tablet-alt',
    'fa fa-tablets',
    'fa fa-tachometer-alt',
    'fa fa-tag',
    'fa fa-tags',
    'fa fa-tape',
    'fa fa-tasks',
    'fa fa-taxi',
    'fa fa-teamspeak',
    'fa fa-teeth',
    'fa fa-teeth-open',
    'fa fa-telegram',
    'fa fa-telegram-plane',
    'fa fa-temperature-high',
    'fa fa-temperature-low',
    'fa fa-tencent-weibo',
    'fa fa-tenge',
    'fa fa-terminal',
    'fa fa-text-height',
    'fa fa-text-width',
    'fa fa-th',
    'fa fa-th-large',
    'fa fa-th-list',
    'fa fa-the-red-yeti',
    'fa fa-theater-masks',
    'fa fa-themeco',
    'fa fa-themeisle',
    'fa fa-thermometer',
    'fa fa-thermometer-empty',
    'fa fa-thermometer-full',
    'fa fa-thermometer-half',
    'fa fa-thermometer-quarter',
    'fa fa-thermometer-three-quarters',
    'fa fa-think-peaks',
    'fa fa-thumbs-down',
    'fa fa-thumbs-up',
    'fa fa-thumbtack',
    'fa fa-ticket-alt',
    'fa fa-times',
    'fa fa-times-circle',
    'fa fa-tint',
    'fa fa-tint-slash',
    'fa fa-tired',
    'fa fa-toggle-off',
    'fa fa-toggle-on',
    'fa fa-toilet',
    'fa fa-toilet-paper',
    'fa fa-toolbox',
    'fa fa-tools',
    'fa fa-tooth',
    'fa fa-torah',
    'fa fa-torii-gate',
    'fa fa-tractor',
    'fa fa-trade-federation',
    'fa fa-trademark',
    'fa fa-traffic-light',
    'fa fa-train',
    'fa fa-tram',
    'fa fa-transgender',
    'fa fa-transgender-alt',
    'fa fa-trash',
    'fa fa-trash-alt',
    'fa fa-trash-restore',
    'fa fa-trash-restore-alt',
    'fa fa-tree',
    'fa fa-trello',
    'fa fa-tripadvisor',
    'fa fa-trophy',
    'fa fa-truck',
    'fa fa-truck-loading',
    'fa fa-truck-monster',
    'fa fa-truck-moving',
    'fa fa-truck-pickup',
    'fa fa-tshirt',
    'fa fa-tty',
    'fa fa-tumblr',
    'fa fa-tumblr-square',
    'fa fa-tv',
    'fa fa-twitch',
    'fa fa-twitter',
    'fa fa-twitter-square',
    'fa fa-typo3',
    'fa fa-uber',
    'fa fa-ubuntu',
    'fa fa-uikit',
    'fa fa-umbraco',
    'fa fa-umbrella',
    'fa fa-umbrella-beach',
    'fa fa-underline',
    'fa fa-undo',
    'fa fa-undo-alt',
    'fa fa-uniregistry',
    'fa fa-universal-access',
    'fa fa-university',
    'fa fa-unlink',
    'fa fa-unlock',
    'fa fa-unlock-alt',
    'fa fa-untappd',
    'fa fa-upload',
    'fa fa-ups',
    'fa fa-usb',
    'fa fa-user',
    'fa fa-user-alt',
    'fa fa-user-alt-slash',
    'fa fa-user-astronaut',
    'fa fa-user-check',
    'fa fa-user-circle',
    'fa fa-user-clock',
    'fa fa-user-cog',
    'fa fa-user-edit',
    'fa fa-user-friends',
    'fa fa-user-graduate',
    'fa fa-user-injured',
    'fa fa-user-lock',
    'fa fa-user-md',
    'fa fa-user-minus',
    'fa fa-user-ninja',
    'fa fa-user-nurse',
    'fa fa-user-plus',
    'fa fa-user-secret',
    'fa fa-user-shield',
    'fa fa-user-slash',
    'fa fa-user-tag',
    'fa fa-user-tie',
    'fa fa-user-times',
    'fa fa-users',
    'fa fa-users-cog',
    'fa fa-usps',
    'fa fa-ussunnah',
    'fa fa-utensil-spoon',
    'fa fa-utensils',
    'fa fa-vaadin',
    'fa fa-vector-square',
    'fa fa-venus',
    'fa fa-venus-double',
    'fa fa-venus-mars',
    'fa fa-viacoin',
    'fa fa-viadeo',
    'fa fa-viadeo-square',
    'fa fa-vial',
    'fa fa-vials',
    'fa fa-viber',
    'fa fa-video',
    'fa fa-video-slash',
    'fa fa-vihara',
    'fa fa-vimeo',
    'fa fa-vimeo-square',
    'fa fa-vimeo-v',
    'fa fa-vine',
    'fa fa-vk',
    'fa fa-vnv',
    'fa fa-voicemail',
    'fa fa-volleyball-ball',
    'fa fa-volume-down',
    'fa fa-volume-mute',
    'fa fa-volume-off',
    'fa fa-volume-up',
    'fa fa-vote-yea',
    'fa fa-vr-cardboard',
    'fa fa-vuejs',
    'fa fa-walking',
    'fa fa-wallet',
    'fa fa-warehouse',
    'fa fa-water',
    'fa fa-wave-square',
    'fa fa-waze',
    'fa fa-weebly',
    'fa fa-weibo',
    'fa fa-weight',
    'fa fa-weight-hanging',
    'fa fa-weixin',
    'fa fa-whatsapp',
    'fa fa-whatsapp-square',
    'fa fa-wheelchair',
    'fa fa-whmcs',
    'fa fa-wifi',
    'fa fa-wikipedia-w',
    'fa fa-wind',
    'fa fa-window-close',
    'fa fa-window-maximize',
    'fa fa-window-minimize',
    'fa fa-window-restore',
    'fa fa-windows',
    'fa fa-wine-bottle',
    'fa fa-wine-glass',
    'fa fa-wine-glass-alt',
    'fa fa-wix',
    'fa fa-wizards-of-the-coast',
    'fa fa-wolf-pack-battalion',
    'fa fa-won-sign',
    'fa fa-wordpress',
    'fa fa-wordpress-simple',
    'fa fa-wpbeginner',
    'fa fa-wpexplorer',
    'fa fa-wpforms',
    'fa fa-wpressr',
    'fa fa-wrench',
    'fa fa-x-ray',
    'fa fa-xbox',
    'fa fa-xing',
    'fa fa-xing-square',
    'fa fa-y-combinator',
    'fa fa-yahoo',
    'fa fa-yammer',
    'fa fa-yandex',
    'fa fa-yandex-international',
    'fa fa-yarn',
    'fa fa-yelp',
    'fa fa-yen-sign',
    'fa fa-yin-yang',
    'fa fa-yoast',
    'fa fa-youtube',
    'fa fa-youtube-square',
    'fa fa-zhihu',
];
