import { KeyValueObj } from "./key_value_obj";

export interface App extends KeyValueObj {
    description: string;
    homePage?: string;
    defaultLocale?: "en" | "ro";
    pages: string[];
    defaultLook?: string;
    defaultPrimaryColor?: string;
    defaultSecondaryColor?: string;
    defaultTheme?: string;
}
