import { Component } from "./component-editor.component";

let propsSort = 5000;

export const ComponentsBaseRawAttributes: Partial<Component> = {
    name: "Element",
    properties: [
        {
            name: 'RawAttributes',
            key: "text_header",
            inputtype: "SectionInput",
            tab: 'left-panel-tab-content',
            sort: propsSort++,
            data: { header: "Raw Attributes (Advanced)", expanded: false },
        },
        {
            name: "Class (Advanced, for web developers)",
            key: "class",
            htmlAttr: "class",
            inline: true,
            col: 12,
            sort: propsSort++,
            inputtype: "TextareaInput",
            tab: "left-panel-tab-content",
        },
    ]
};
