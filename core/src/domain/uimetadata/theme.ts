import { Layouts } from "./page";
import { NodeType } from "./form";

export type ThemeCustomClasses = {
    [layout in Layouts]?: {
        [component in NodeType]?: string[];
    };
}

export interface Theme {
    themeCustomClasses: ThemeCustomClasses;
}
