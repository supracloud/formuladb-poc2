import { Page } from "./uimetadata/page";
import { KeyValueObj } from "./key_value_obj";

export interface AppPage {
    name: string, 
    html: string,

}
export interface App extends KeyValueObj {
    description: string;
    homePage?: string;
    defaultLocale?: "en" | "ro";
    pages: AppPage[];
}
