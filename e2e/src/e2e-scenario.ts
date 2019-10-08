import * as _ from "lodash";
import { E2EApi } from './e2e-api';
import { browser, Key } from 'protractor';
import * as e2e_utils from "./utils";

export class E2eScenario {
    protected MESSAGES: string[] = [];
    protected DURATIONS: number[] = [];
    protected action_index = 0    
    protected stream: any;

    describe(msg: string, callback: () => any) {
        beforeAll(async () => {
            console.log("SCENARIO: ", msg);
            browser.ignoreSynchronization = true;
            browser.driver.manage().window().maximize();

            if (browser.params.recordings || browser.params.audio) {
                e2e_utils.setup_directories();
            }
            
            if (browser.params.audio) {
                await e2e_utils.create_audio_tracks(this.MESSAGES, this.DURATIONS);
            }
            
            if (browser.params.recordings) {
                this.stream = e2e_utils.create_stream_and_run();
            }
    
        });
    
    }

    step(msg, callback: () => Promise<any>) {
        this.MESSAGES.push(`<speak>${msg}<break time="1s"/></speak>`);
        this.DURATIONS.push(0);
        
        it(msg, async function() {
            console.log("    STEP: ", msg);
            await e2e_utils.handle_generic_action(this.DURATIONS[this.action_index++]);

            await callback();
        })
    }
}
