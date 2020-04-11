import { Component } from "./component-editor.component";
import { ParamListInput } from "./inputs";

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
            data: { header: "Raw Attributes (Advanced, for web developers)" },
        },
        {
            name: "Class",
            key: "class",
            htmlAttr: "class",
            inline: true,
            col: 12,
            sort: propsSort++,
            inputtype: "TextareaInput",
            tab: "left-panel-tab-content",
        },
        {
            name: "Style",
            key: "style",
            htmlAttr: "style",
            inline: true,
            col: 12,
            sort: propsSort++,
            inputtype: "TextareaInput",
            tab: "left-panel-tab-content",
        },
        {
            name: "Other Raw Attributes",
            key: "raw_attributes",
            inline: true,
            col: 12,
            sort: propsSort++,
            inputtype: "ParamListInput",
            tab: "left-panel-tab-content",
            data: { params: [] },
            beforeInit: function (node: HTMLElement) {
                let params: { name: string, value: string }[] = [];
                for (let attr of Array.from(node.attributes)) {
                    if (["id", "title", "class", "style"].includes(attr.name)
                        || attr.name.indexOf('data-frmdb') === 0) continue;
                    params.push({ name: attr.name, value: attr.value });
                }

                this.data.params = params;
            },
        },
    ]
};
