import { KeyValueObj } from "./key_value_obj";
import { Page } from "./uimetadata/page";
import { PickOmit } from "./ts-utils";

export type AppPage = PickOmit<Page, 'html' | '_id'>;
export interface App extends KeyValueObj {
    description: string;
    homePage?: string;
    defaultLocale?: "en" | "ro";
    theme_name: string,
    pages: AppPage[];
}
