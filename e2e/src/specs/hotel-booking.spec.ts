    
//     MESSAGES.push('<speak>and also the website language<break time="5s"/></speak>');
//     DURATIONS.push(0);
//     it('should change language', async (done) => {
//         await e2e_utils.handle_element_click(await e2eApi.byCss('#frmdb-editor-i18n-select'), DURATIONS[action_index++]);
//         let languages = await e2eApi.allByCss('[aria-labelledby="frmdb-editor-i18n-select"] .dropdown-item');
//         await browser.sleep(550);
//         await languages[1].click();
//         await browser.sleep(2200);
//         expect(await e2eApi.__old__getPageTitle()).toEqual('Détends ton esprit');
        
//         await (await e2eApi.byCss('#frmdb-editor-i18n-select')).click();
//         languages = await e2eApi.allByCss('[aria-labelledby="frmdb-editor-i18n-select"] .dropdown-item');
//         await languages[0].click();
//         await browser.sleep(2200);
//         expect(await e2eApi.__old__getPageTitle()).toEqual('Relax Your Mind');

//         done();
//     });
    
//     MESSAGES.push('<speak>You can create more powerful customizations by binding Page elements to data from Table Records, which allows dynamic content to be created from your data<break time="4s"/></speak>');
//     DURATIONS.push(0);
//     it('should highlight column for data binding', async (done) => {
//         await e2e_utils.handle_generic_action(DURATIONS[action_index++]);
//         await e2eApi.scrollIframe(350);
//         let arivalDateFormEl = await e2eApi.byCssInFrame('[data-frmdb-value="::start_date"]');
//         await browser.sleep(1051);
//         let departureDateFormEl = await e2eApi.byCssInFrame('[data-frmdb-value="::end_date"]');
//         await e2eApi.clickWithJs(arivalDateFormEl);
//         await browser.sleep(150);
//         await e2eApi.clickWithJs(departureDateFormEl);
//         await browser.sleep(150);
//         await e2eApi.clickWithJs(arivalDateFormEl);
        
//         await browser.sleep(1051);
//         await e2eApi.clickWithJs(departureDateFormEl);
//         //TODO check background color of column in the data grid
        
//         await browser.sleep(1051);
//         //TODO check background color of column in the data grid
//         let nbAdultsFormEl = await e2eApi.byCssInFrame('[data-frmdb-value="::nb_adults"]');
//         await e2eApi.clickWithJs(nbAdultsFormEl);
        
//         await browser.sleep(1051);
//         //TODO check background color of column in the data grid
//         let nbChildrenFormEl = await e2eApi.byCssInFrame('[data-frmdb-value="::nb_children"]');
//         await e2eApi.clickWithJs(nbChildrenFormEl);
//         await browser.sleep(1051);
//         //TODO check background color of column in the data grid

//         done();
//     });
    
//     MESSAGES.push('<speak>For example you can display the room types as a list of cards<break time="20s"/></speak>');
//     DURATIONS.push(0);
//     it('should work with data binding for cards', async (done) => {
//         try {
//             await e2e_utils.handle_generic_action(DURATIONS[action_index++]);
//             await e2eApi.scrollIframe(950);
//             await browser.sleep(150);
//             let el = await e2eApi.byCss('[href="#data-left-panel-tab"]');
//             await el.click();
            
//             console.log(new Date(), 'delete hardcoded cards, leave just the first one');
//             for (let i = 0; i < 3; i++) {
//                 el = await e2eApi.byCssInFrame('.accomodation_area .row .col-lg-3:nth-child(2)');
//                 await e2eApi.clickWithJs(el);
//                 await browser.sleep(956);
//                 el = await e2eApi.byCss('#select-box #select-actions #delete-btn');
//                 await el.click();
//             }
            
//             console.log(new Date(), 'configure data binding for the fist card');
//             el = await e2eApi.byCssInFrame('.accomodation_area .row .col-lg-3:nth-child(1)');
//             await e2eApi.clickWithJs(el);
//             await browser.sleep(956);
//             el = await e2eApi.byCss('[data-key="data-frmdb-table-limit"] input');
//             await el.sendKeys('1');
//             await browser.sleep(956);
//             el = await e2eApi.byCss('[data-key="data-frmdb-table"] select');
//             await el.click();
//             await browser.sleep(956);
//             el = await e2eApi.byCss('[data-key="data-frmdb-table"] select [value="$FRMDB.RoomType[]"]');
//             await el.click();
//             await browser.sleep(956);
            
//             console.log(new Date(), 'configure data binding for img');
//             el = await e2eApi.byCssInFrame('.accomodation_area .row .col-lg-3:nth-child(1) img');
//             await e2eApi.clickWithJs(el);
//             await browser.sleep(956);
//             el = await e2eApi.byCss('[data-key="data-frmdb-value"] select');
//             await el.click();
//             await browser.sleep(956);
//             el = await e2eApi.byCss('[data-key="data-frmdb-value"] select [value="$FRMDB.RoomType[].picture"]');
//             await el.click();
//             await browser.sleep(956);
            
//             console.log(new Date(), 'configure data binding for h4');
//             el = await e2eApi.byCssInFrame('.accomodation_area .row .col-lg-3:nth-child(1) a h4');
//             await e2eApi.clickWithJs(el);
//             await browser.sleep(956);
//             el = await e2eApi.byCss('[data-key="data-frmdb-value"] select');
//             await el.click();
//             await browser.sleep(956);
//             el = await e2eApi.byCss('[data-key="data-frmdb-value"] select [value="$FRMDB.RoomType[].name"]');
//             await el.click();
//             await browser.sleep(956);
            
//             console.log(new Date(), 'repeat card 7 times');
//             el = await e2eApi.byCssInFrame('.accomodation_area .row .col-lg-3:nth-child(1)');
//             await e2eApi.clickWithJs(el);
//             await browser.sleep(956);
//             el = await e2eApi.byCss('[data-key="data-frmdb-table-limit"] input');
//             await el.clear(); await el.sendKeys('7'); await el.sendKeys(Key.ENTER);
//             await browser.sleep(956);
            
//             console.log(new Date(), 'scroll to each of the 7 cards');
//             el = await e2eApi.byCssInFrame('.accomodation_area .row .col-lg-3:nth-child(2)');
//             await e2eApi.clickWithJs(el);
//             await e2eApi.scrollIframe(980);
//             await browser.sleep(550);
//             el = await e2eApi.byCssInFrame('.accomodation_area .row .col-lg-3:nth-child(3)');
//             await e2eApi.clickWithJs(el);
//             await e2eApi.scrollIframe(1000);
//             await browser.sleep(550);
//             el = await e2eApi.byCssInFrame('.accomodation_area .row .col-lg-3:nth-child(4)');
//             await e2eApi.clickWithJs(el);
//             await e2eApi.scrollIframe(1100);
//             await browser.sleep(550);
//             el = await e2eApi.byCssInFrame('.accomodation_area .row .col-lg-3:nth-child(5)');
//             await e2eApi.clickWithJs(el);
//             await e2eApi.scrollIframe(1200);
//             await browser.sleep(550);
//             el = await e2eApi.byCssInFrame('.accomodation_area .row .col-lg-3:nth-child(6)');
//             await e2eApi.clickWithJs(el);
//             await e2eApi.scrollIframe(1300);
//             await browser.sleep(550);
//             el = await e2eApi.byCssInFrame('.accomodation_area .row .col-lg-3:nth-child(7)');
//             await e2eApi.clickWithJs(el);
//             await e2eApi.scrollIframe(1350);
//             await browser.sleep(550);
//         } catch (err) {
//             console.error(err);
//             done.fail(err);
//         }

//         done();
//     });
    
//     MESSAGES.push('<speak>You can use Formulas to perform computations<break time="12s"/></speak>');
//     DURATIONS.push(0);
//     it('should allow basic formula editing', async (done) => {
//         try {
//             await e2e_utils.handle_generic_action(DURATIONS[action_index++]);
            
//             //select booking table
//             let el;
//             await browser.sleep(957);
//             let els = await e2eApi.allByCss('[data-frmdb-value="$frmdb.tables[]._id"]');
//             let found = false;
//             for (el of els) {
//                 let txt = await el.getAttribute('innerText');
//                 if ('Booking' === txt) {
//                     found = true;
//                     await (await e2eApi.byCss('[data-toggle="dropdown"][data-frmdb-value="$frmdb.selectedTableId"]')).click();
//                     await browser.sleep(957);
//                     await el.click();
//                 }
//             }
//             expect(found).toEqual(true);
//             await browser.sleep(957);
            
//             //select day column
//             el = await e2eApi.byCssInShadowDOM('frmdb-data-grid', '.ag-row:nth-child(2) .ag-cell[col-id="days"]');
//             await el.click();
//             await browser.sleep(150);
//             el = await e2eApi.byCssInShadowDOM('frmdb-data-grid', '.ag-row:nth-child(2) .ag-cell[col-id="nb_children"]');
//             await el.click();
//             await browser.sleep(150);
//             el = await e2eApi.byCssInShadowDOM('frmdb-data-grid', '.ag-row:nth-child(2) .ag-cell[col-id="days"]');
//             await el.click();
//             await browser.sleep(957);
            
//             el = await e2eApi.byCss('.editor-textarea');
//             expect(await el.getAttribute('value')).toEqual('DATEDIF(start_date, end_date, "D") + 1');
//             await browser.sleep(250);
            
//             el = await e2eApi.byCss('#toggle-formula-editor');
//             await el.click();
//             await browser.sleep(957);
            
//             el = await e2eApi.byCss('.editor-textarea');
//             await el.click();
//             await browser.sleep(551);
//             await browser.sleep(957);
//             await el.sendKeys('00'); await el.sendKeys(Key.TAB);
//             await browser.sleep(957);
            
//             el = await e2eApi.byCss('#apply-formula-changes');
//             await el.click();
//             await browser.sleep(957);
            
//             var alertDialog = browser.switchTo().alert();
//             let txt = await alertDialog.getText();
//             expect(txt).toContain('Please confirm, apply modifications to DB');
//             await alertDialog.accept();  // Use to accept (simulate clicking ok)
//             await browser.switchTo().defaultContent();
//             await browser.sleep(957);
//             await browser.sleep(957);
            
//             el = await e2eApi.byCssInShadowDOM('frmdb-data-grid', '.ag-row:nth-child(2) .ag-cell[col-id="days"]');
//             await el.click();
//             txt = await el.getAttribute('innerText');
//             expect(txt).toContain('104.00');
//             await browser.sleep(1150);
            
//         } catch (err) {
//             console.error(err);
//             done.fail(err);
//         }

//         done();
//     });
    
//     MESSAGES.push('<speak>Please follow out website for news about the official launch and more details like how to create Tables and Pages, perform data rollups with SUMIF/COUNTIF, define validations and much much more.<break time="2s"/></speak>');
//     DURATIONS.push(0);
//     it('please follow formuladb.io', async (done) => {
//         await e2e_utils.handle_generic_action(DURATIONS[action_index++]);

//         done();
//     });
    
//     it('Should end recording and cleanup', async (done) => {
//         if (browser.params.recordings) {
//             await e2e_utils.wait_for_ffmpeg_stream_to_finish(stream);
//             if (browser.params.audio) {
//                 await e2e_utils.concat_audio(MESSAGES);
//                 await e2e_utils.merge_video_and_audio();
//             } else {
//                 e2e_utils.create_final_video();
//             }
//             await e2e_utils.crop_video();
//             await e2e_utils.create_gif_palette_and_video();
//             e2e_utils.cleanup(test_name);
//         }

//         done();
//     });
    
// });
