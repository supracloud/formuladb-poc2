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

export enum ThemeColors { 
    primary = "primary",
    secondary = "secondary",
    success = "success",
    danger = "danger",
    warning = "warning",
    info = "info",
    light = "light",
    dark = "dark",
}
