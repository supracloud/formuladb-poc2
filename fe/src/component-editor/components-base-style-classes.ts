import { Component, ComponentProperty } from "./component-editor.component";
import { Input } from "./inputs";

let propsSort = 1200;

function setClassFromSet(node: HTMLElement, value: string, input: Input, component: Component) {
    for (let c of this.validValues) {
        node.classList.remove(c);
    }
    node.classList.add(value);
    return node;
}

const TextProperties: ComponentProperty[] = [
    {
        name: 'Text Style Classes',
        key: "text_header",
        inputtype: "SectionInput",
        sort: propsSort++,
        tab: 'left-panel-tab-style',
        data: { header: "Text" },
    },
    {
        name: "Align",
        key: "align",
        htmlAttr: "class",
        inputtype: "SelectInput",
        onChange: setClassFromSet,
        sort: propsSort++,
        validValues: ["text-left", "text-center", "text-right"],
        data: {
            options: [{
                value: "",
                text: "-"
            }, {
                value: "text-left",
                text: "text-left"
            }, {
                value: "text-center",
                text: "text-center"
            }, {
                value: "text-right",
                text: "text-right"
            }]
        }
    },
    {
        name: "Transform",
        key: "transform",
        htmlAttr: "class",
        inputtype: "SelectInput",
        sort: propsSort++,
        onChange: setClassFromSet,
        validValues: ["text-lowercase", "text-uppercase", "text-capitalize"],
        data: {
            options: [{
                value: "",
                text: "-"
            }, {
                value: "text-lowercase",
                text: "text-lowercase"
            }, {
                value: "text-uppercase",
                text: "text-uppercase"
            }, {
                value: "text-capitalize",
                text: "text-capitalize"
            }]
        }
    },
];

const FlexProperties: ComponentProperty[] = [
    {
        name: 'Flex Style Classes',
        key: "flex_header",
        inputtype: "SectionInput",
        sort: propsSort++,
        tab: 'left-panel-tab-style',
        data: { header: "Flex" },
    },
    {
        name: "Alignment Items",
        key: "alignment",
        htmlAttr: "class",
        sort: propsSort++,
        inputtype: "SelectInput",
        onChange: setClassFromSet,
        validValues: ["align-items-start", "align-items-end", "align-items-center", "align-items-baseline", "align-items-stretch"],
        data: {
            options: [{
                value: "",
                text: "-"
            }, {
                value: "align-items-start",
                text: "align-items-start",
            },
            {
                value: "align-items-end",
                text: "align-items-end",
            },
            {
                value: "align-items-center",
                text: "align-items-center",
            },
            {
                value: "align-items-baseline",
                text: "align-items-baseline",
            },
            {
                value: "align-items-stretch",
                text: "align-items-stretch",
            }
            ]
        }
    },
];



export const ComponentsBaseSyleClasses: Partial<Component> = {
    name: "Element",
    //@ts-ignore
    properties:
        TextProperties
        .concat(FlexProperties)
};