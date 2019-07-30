import { FrmdbLayoutType } from "./page";
import { NodeType } from "./node-elements";

export type ThemeCustomClasses = {
    [layout in Exclude<FrmdbLayoutType, undefined>]?: {
        [component in NodeType]?: string[];
    };
}

export interface Theme {
    themeCustomClasses: ThemeCustomClasses;
}
