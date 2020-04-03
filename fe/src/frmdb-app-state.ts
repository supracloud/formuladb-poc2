import { Entity } from "@domain/metadata/entity";

export class FrmdbAppState {
    tables: Entity[] = [];
    pages: { name: string, url: string }[];
    selectedPageName: string;
    selectedPagePath: string;

    constructor(public appName: string) {
        this.pages = [{ name: 'index.html', url: `${appName}/index.html`}];
        this.selectedPageName = this.pages[0].name;
        this.selectedPagePath = this.pages[0].url;
    }
}
