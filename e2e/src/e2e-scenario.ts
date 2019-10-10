import * as _ from "lodash";
import { E2EApi } from './e2e-api';
import { browser, Key } from 'protractor';
import * as e2e_utils from "./utils";
import * as os from 'os';

export class E2eScenarioWithVideo {
    protected MESSAGES: string[] = [];
    protected DURATIONS: number[] = [];
    protected action_index = 0;
    protected stream: any;

    describe(msg: string, callback: () => void) {
        beforeAll(async () => {
            if (process.platform === "linux" && os.release().toLowerCase().indexOf('microsoft') >= 0) {
                jasmine.DEFAULT_TIMEOUT_INTERVAL = 300000;
            }
            console.log("[E2E] describe: ", msg);
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

        describe(msg, callback);
    }

    step(msg, callback: () => Promise<any>) {
        this.MESSAGES.push(`<speak>${msg}<break time="1s"/></speak>`);
        this.DURATIONS.push(0);
        
        it(msg, async () => {
            try {
                console.log("    [E2E] step: ", msg);
                await e2e_utils.handle_generic_action(this.DURATIONS[this.action_index++]);

                await callback();
            } catch (err) {
                console.warn(err);
                throw err;
            }
        })
    }
}
