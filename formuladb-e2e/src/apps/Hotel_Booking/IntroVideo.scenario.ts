import { FullTestWithVideo, Scroll, Click, SendKeys, StepWithVideo, GoTo, Sleep, Step, Scenario, ScenarioFocused, CheckExists, ClickWithJs, CheckColor, CheckDataGridHighlighted, AcceptAlert } from "../../api";
import { Key } from "protractor";

FullTestWithVideo("Hotel_Booking app intro video", () => {
    Scenario("App overview", () => {
        Step(`Welcome to the Hotel Booking app intro video`, async () => {
            await GoTo(`formuladb-apps/Hotel_Booking/index.html`);
            await CheckExists(`iframe#app h1:contains(Relax Your Mind)`);
        });
    });

    Scenario("Editor overview", () => {
        Scenario("Go to editor page", () => {
            StepWithVideo(`Using the FormulaDB editor you can customize the Hotel Booking app`, async () => {
                await GoTo(`formuladb/editor.html#/formuladb-apps/Hotel_Booking/index.html`);
                await CheckExists(`iframe#app h1:contains(Relax Your Mind)`);
            });    
        });

        Scenario(`Pages list`, async () => {
            await StepWithVideo(`In the top left panel you can find the list of pages`, async () => {
                await Click(`[title="App Page List"]`);
            });
            await StepWithVideo("the home page", async () => {
                await Click(`[title="App Page List"] ::parent .dropdown-item:contains(index.html)`);
            });
            await StepWithVideo("the about page", async () => {
                await Click(`[title="App Page List"]`);
                await Click(`[title="App Page List"] ::parent .dropdown-item:contains(about.html)`);
            });
            await StepWithVideo("the galley page", async () => {
                await Click(`[title="App Page List"]`);
                await Click(`[title="App Page List"] ::parent .dropdown-item:contains(gallery.html)`);
            });
            await StepWithVideo("the contact page", async () => {
                await Click(`[title="App Page List"]`);
                await Click(`[title="App Page List"] ::parent .dropdown-item:contains(contact.html)`);
            });
        });

        Step(`Tables list`, async () => {
            await StepWithVideo(`And the list of tables`, async () => {
                await Click(`[title="App Table List"]`);
            });
            await StepWithVideo(`RoomType table`, async () => {
                await Click(`[title="App Table List"] ::parent .dropdown-item:nth-child(1):contains(RoomType)`);
                await Click(`frmdb-data-grid::shadowRoot .ag-cell[col-id="name"]:contains(Economy Si)`);
            });
            await StepWithVideo(`Room table`, async () => {
                await Click(`[title="App Table List"]`);
                await Click(`[title="App Table List"] ::parent .dropdown-item:nth-child(2):contains(Room)`);
                await Click(`frmdb-data-grid::shadowRoot .ag-cell:contains(202.00)`);
            });
            await StepWithVideo(`Booking table`, async () => {
                await Click(`[title="App Table List"]`);
                await Click(`[title="App Table List"] ::parent .dropdown-item:contains(Booking)`);
                await Click(`frmdb-data-grid::shadowRoot .ag-cell:contains(Room~~SigleDeluxe1)`);
            });
        });

        Step(`Simple static changes`, async () => {
            await StepWithVideo(`Let's go into Preview mode`, async () => {
                await Click('#preview-btn');
                await Sleep(200);//TODO wait until we are in preview mode
            });

            await StepWithVideo(`You can get started quickly with simple changes like change the color palette and the theme`, async () => {

                await Click('#frmdb-editor-color-palette-select');
                await Click('[aria-labelledby="frmdb-editor-color-palette-select"] .dropdown-item:nth-child(3)');
                await CheckColor(89, 49, 150, 1, `iframe .navbar-brand i`);
    
                await Click('#frmdb-editor-theme-select');
                await Click('[theme="sketchy"]');
    
                await Click('#frmdb-editor-theme-select');
                await Click('[theme="lux"]');
                //TODO add assertions
    
                await Click('#frmdb-editor-color-palette-select');
                await Click('[aria-labelledby="frmdb-editor-color-palette-select"] .dropdown-item:nth-child(7)');
                await CheckColor(255, 193, 7, 1, `iframe .navbar-brand i`);
            });

            await StepWithVideo(`You also can change the language of your website`, async () => {

                await Click('#frmdb-editor-i18n-select');
                await Click('[aria-labelledby="frmdb-editor-i18n-select"] .dropdown-item:nth-child(2)');
                await Click('iframe#app h1:contains(Détends ton esprit)');
        
                await Click('#frmdb-editor-i18n-select');
                await Click('[aria-labelledby="frmdb-editor-i18n-select"] .dropdown-item:nth-child(1)');
                await Click('iframe#app h1:contains(Relax Your Mind)');
        
            });

            await StepWithVideo(`Let's go back to normal editor mode`, async () => {
                await Click('#preview-btn');
                await Sleep(400);//TODO wait until we are out of preview mode
            });

            await StepWithVideo(`Edit the static text in your pages`, async () => {
                //TODO
            })

            await StepWithVideo(`Change images and backgrounds`, async () => {
                //TODO
            })

            await StepWithVideo(`Add static elements, remove, clone, move elements on the page`, async () => {
                //TODO
            })
        });
    });

    Scenario("Data Binding", () => {
        Scenario('Highlight', () => {
            Step(`You can create more powerful customizations by binding Page elements to data from Table Records, which allows dynamic content to be created from your data. For example Arrival Data, Departure Date, Nb Adults are mapped to the corresponding columns in the Booking table.`, async () => {

                await Click('iframe#app [data-frmdb-value="::start_date"]');
                await CheckDataGridHighlighted('start_date');
        
                await Click(`iframe#app [data-frmdb-value="::end_date"]`);
                await CheckDataGridHighlighted('end_date');
        
                await Click(`iframe#app [data-frmdb-value="::nb_adults"]`);
                await CheckDataGridHighlighted('nb_adults');
        
                await Click(`iframe#app [data-frmdb-value="::nb_children"]`);
                await CheckDataGridHighlighted('nb_children');
            });
        });

        Scenario("Configure data binding", () => {

            StepWithVideo(`Any page element, simple or complex, can be mapped to table records and cells, for example you can display the room types as a list of cards`, async () => {
                await Scroll(`iframe#app`, 450);
                //TODO, perhaps add more examples from the existing app
            });
    
            StepWithVideo(`Let's first remove the existing card deck`, async () => {
                // await Click(`iframe#app h2:contains(Hotel Accomodation) ::parent ::parent .card-deck > .card:nth-child(2) > h4`);
                await Click(`iframe#app h2:contains(Hotel Accomodation) ::parent ::parent `);
                await Click(`frmdb-highlight-box::shadowRoot [title="Remove element"]`);
            });
            StepWithVideo(`We add a new card deck`, async () => {
                await Click(`iframe#app .container:contains(Hotel Accomodation)`);
                await Click(`frmdb-highlight-box::shadowRoot [title="Add element after"]`);
                await Click(`frmdb-add-element .nav-item:contains(Cards)`);
                await Click(`frmdb-add-element iframe h3:contains(Card Deck with image overlay) #DeckWithOverlayAndFooter + .card-deck`);
            })
            StepWithVideo(`We use "Repeat For Table" to create a card for each RoomType`, async () => {
                await Click(`iframe#app .container:contains(Hotel Accomodation) .card-deck h4:contains(Card Title 1)`);
                await ClickWithJs(`iframe#app .container:contains(Hotel Accomodation) .card-deck .card:contains(Card Title 1)`);
                await Click(`frmdb-element-editor [title="Page Element Data Binding"]`);
                await SendKeys(`frmdb-element-editor .form-group:contains(Limit) input`, `1`);
                await Click(`frmdb-element-editor .form-group:contains(Repeat for Table) select`);
                await Click(`frmdb-element-editor .form-group:contains(Repeat for Table) select option:contains(RoomType)`);
                await CheckExists(`iframe#app .container:contains(Hotel Accomodation) .card-deck > .card[data-frmdb-table="$FRMDB.RoomType[]"]`);
            });
            StepWithVideo(`And display the image, name and price for each row in the RoomType table`, async () => {
                await Click(`iframe#app .container:contains(Hotel Accomodation) .card-deck .card:contains(Card Title 1) .card-img-overlay`);
                await Click(`frmdb-element-editor .form-group:contains(Value From Record) select`);
                await Click(`frmdb-element-editor .form-group:contains(Value From Record) select option:contains(RoomType.picture)`);
                await CheckExists(`iframe#app .container:contains(Hotel Accomodation) .card-deck > .card .card-img-overlay[data-frmdb-value="$FRMDB.RoomType[].picture"]`);
    
                await Click(`iframe#app .container:contains(Hotel Accomodation) .card-deck .card h4:contains(Card Title 1)`);
                await Click(`frmdb-element-editor .form-group:contains(Value From Record) select`);
                await Click(`frmdb-element-editor .form-group:contains(Value From Record) select option:contains(RoomType.name)`);
                await CheckExists(`iframe#app .container:contains(Hotel Accomodation) .card-deck > .card h4[data-frmdb-value="$FRMDB.RoomType[].name"]`);
            });
            StepWithVideo(`We can remove the last 3 example cards from the deck`, async () => {
                await ClickWithJs(`iframe#app .container:contains(Hotel Accomodation) .card:contains(Card Title 2)`);
                await Click(`frmdb-highlight-box::shadowRoot [title="Remove element"]`);
                await ClickWithJs(`iframe#app .container:contains(Hotel Accomodation) .card:contains(Card Title 3)`);
                await Click(`frmdb-highlight-box::shadowRoot [title="Remove element"]`);
                await ClickWithJs(`iframe#app .container:contains(Hotel Accomodation) .card:contains(Card Title 4)`);
                await Click(`frmdb-highlight-box::shadowRoot [title="Remove element"]`);
            });
            StepWithVideo(`Now let's display seven room types`, async () => {
                await ClickWithJs(`iframe#app .container:contains(Hotel Accomodation) .card-deck .card:contains(Card Title 1)`);
                await Click(`frmdb-element-editor [title="Page Element Data Binding"]`);
                await SendKeys(`frmdb-element-editor .form-group:contains(Limit) input`, `7`);
            });
        });
    });

    Scenario("Formula Editor", () => {
        Scenario("Simple scalar formula", () => {
            Step(`You can use Formulas to perform basic computations`, async () => {

                await Click(`[title="App Table List"]`);
                await Click(`[title="App Table List"] ::parent .dropdown-item:contains(Booking)`);
                await Click(`frmdb-data-grid::shadowRoot .ag-cell[col-id="days"]:contains(4.0)`);
                await CheckExists(`frmdb-formula-editor::shadowRoot textarea[readonly]:value(/DATEDIF.start_date, end_date, "D". \\+ [0-9]+/)`);
                    
                await Click(`frmdb-formula-editor::shadowRoot #toggle-formula-editor`);
                let nb = Math.round(Math.random()*100)*100;
                await SendKeys(`frmdb-formula-editor::shadowRoot textarea:not([readonly]):value(/DATEDIF.start_date, end_date, "D". \\+ [0-9]+/)`, 
                    Key.BACK_SPACE.repeat(50) + 'DATEDIF(start_date, end_date, "D") + ' + nb + Key.TAB);
                    
                await Click('frmdb-formula-editor::shadowRoot #apply-formula-changes.bg-success[data-frmdb-dirty="true"]');
                await AcceptAlert('Please confirm, apply modifications to DB');
                await CheckExists(`frmdb-data-grid::shadowRoot .ag-cell[col-id="days"]:contains(${nb+4}.00)`);
            });
        });

    });

    Scenario("Combine with other apps", () => {
        StepWithVideo(`Other apps can be useful in combination with the Hotel Booking app`, async () => {
            await GoTo(`/formuladb-apps/formuladb.io`);
        });
        StepWithVideo(`For example Blog app, so you can easily publish content for your visitors`, async () => {
            //TODO
        });
        StepWithVideo(`And Reporting app which gives you an overview of your apps, tables and website visitors`, async () => {
            //TODO
        });
    });
});
