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
function setSelectOptions(node: HTMLElement) {
    this.data.options = this.validValues.map(v => {
        let value = v;
        let text = v === "" ? '-' : v;
        return {value, text};
    })
}

const TextProperties: ComponentProperty[] = [
    {
        name: 'Text Classes',
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
        validValues: ["", "text-left", "text-center", "text-right"],
        beforeInit: setSelectOptions,
    },
    {
        name: "Transform",
        key: "transform",
        htmlAttr: "class",
        inputtype: "SelectInput",
        sort: propsSort++,
        onChange: setClassFromSet,
        validValues: ["", "text-lowercase", "text-uppercase", "text-capitalize"],
        beforeInit: setSelectOptions,
    },
];

const FlexProperties: ComponentProperty[] = [
    {
        name: 'Display Flex Classes',
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
        validValues: ["", "align-items-start", "align-items-end", "align-items-center", "align-items-baseline", "align-items-stretch"],
        beforeInit: setSelectOptions,
    },
    {
        name: "Alignment Items",
        key: "alignment",
        htmlAttr: "class",
        sort: propsSort++,
        inputtype: "SelectInput",
        onChange: setClassFromSet,
        validValues: ["", "align-items-start", "align-items-end", "align-items-center", "align-items-baseline", "align-items-stretch"],
        beforeInit: setSelectOptions,
    },
];


export const ComponentsBaseSyleClasses: Partial<Component> = {
    name: "Element",
    //@ts-ignore
    properties:
        TextProperties
        .concat(FlexProperties)
};
