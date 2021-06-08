import { Component } from "./component-editor.component";

export const ComponentButton: Partial<Component> = {
    type: "html/button",
    nodes: ["button"],
    name: "Html Button",
    image: "icons/button.svg",
    html: '<button>Button</button>',
    properties: [{
        name: "Text",
        key: "text",
        htmlAttr: "innerHTML",
        inputtype: "TextInput",
    }, {
        name: "Name",
        key: "name",
        htmlAttr: "name",
        inputtype: "TextInput",
    }, {
        name: "Type",
        key: "type",
        htmlAttr: "type",
        inputtype: "SelectInput",
        data: {
            options: [{
                value: "button",
                text: "button"
            }, {
                value: "reset",
                text: "reset"
            }, {
                value: "submit",
                text: "submit"
            }],
        }
    }, {
        name: "Autofocus",
        key: "autofocus",
        htmlAttr: "autofocus",
        inputtype: "CheckboxInput",
    }, {
        name: "Disabled",
        key: "disabled",
        htmlAttr: "disabled",
        inputtype: "CheckboxInput",
    }]
};
