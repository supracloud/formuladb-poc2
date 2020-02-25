import { getTestFrmdbEngine } from "@storage/key_value_store_impl_selector";
import { i18nTranslateText } from "./i18n-be";

describe('I18nBe', () => {

    it("Should translate and cache the results in memory and in DB", async () => {
        let frmdbEngine = await getTestFrmdbEngine({_id: 'FRMDB_SCHEMA', entities: {}});
        let res = await i18nTranslateText(frmdbEngine, ["Friendly"], 'fr');
        expect(res).toEqual({'Friendly': 'Amical'})
    });
});
