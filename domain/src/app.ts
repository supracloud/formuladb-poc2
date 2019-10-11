import { KeyValueObj } from "./key_value_obj";

export interface App extends KeyValueObj {
    description: string;
    homePage?: string;
    defaultLocale?: "en" | "ro";
    pages: string[];
}
