import { Component } from "./component-editor.component";

export const ComponentLink: Partial<Component> = {
    type: "html/link",
    nodes: ["a"],
    name: "Link",
    html: '<a href="#" class="d-inline-block"><span>Link</span></a>',
    image: "icons/link.svg",
    properties: [{
        name: "Url",
        key: "href",
        htmlAttr: "href",
        inputtype: "LinkInput",
        inline: true,
        col: 12
    }, {
        name: "Target",
        key: "target",
        htmlAttr: "target",
        inputtype: "TextInput",
    }]
};
