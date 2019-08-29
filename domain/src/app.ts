import { KeyValueObj } from "./key_value_obj";


export interface AppPage {
    name: string, 
    path: string,
}
export interface App extends KeyValueObj {
    description: string;
    homePage?: string;
    defaultLocale?: "en" | "ro";
    theme?: string,
    pages: string[];
}
