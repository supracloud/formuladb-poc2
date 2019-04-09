import { Page } from "./uimetadata/page";
import { KeyValueObj } from "./key_value_obj";

export interface App extends KeyValueObj {
    description: string;
    homePage?: string;
    locale?: "en" | "ro";
    page: Partial<Page>;
}
