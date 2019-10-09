/**
* © 2019 S.C. FORMULA DATABASE S.R.L.
* License TBD
* 
*/

import { E2eScenarioWithVideo } from "../e2e-scenario";
import { E2EApi } from "../e2e-api";
import { AppIntroVideoScenarioData, AppIntroVideoScenario } from "../app-intro-video-scenario";
import { HotelBookingApp, HotelBookingSchema } from "@test/hotel-booking/metadata";
import { HotelBookingData } from "@test/hotel-booking/data";

let testData: AppIntroVideoScenarioData = {
    app: HotelBookingApp,
    schema: HotelBookingSchema,
    appData: HotelBookingData,
    homePageTitle: "Relax Your Mind",
};

new AppIntroVideoScenario(testData, new E2eScenarioWithVideo(), new E2EApi()).init();
