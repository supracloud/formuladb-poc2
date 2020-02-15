import { getKeyValueStoreFactory } from "@storage/key_value_store_impl_selector";
import { I18nBe } from "./i18n-be";

describe('I18nBe', () => {

    it("Should translate and cache the results in memory and in DB", async () => {
        let kvsFactory = await getKeyValueStoreFactory();
        let i18nBe = new I18nBe(kvsFactory);
        let res = await i18nBe.translateText(["Friendly"], 'fr');
        expect(res).toEqual({'Friendly': 'Amical'})
    });
});
