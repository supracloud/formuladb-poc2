import { Layouts } from "./page";
import { NodeType } from "./node-elements";

export type ThemeCustomClasses = {
    [layout in Exclude<Layouts, undefined>]?: {
        [component in NodeType]?: string[];
    };
}

export interface Theme {
    themeCustomClasses: ThemeCustomClasses;
}
