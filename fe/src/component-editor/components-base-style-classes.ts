import { Component, ComponentProperty } from "./component-editor.component";
import { Input } from "./inputs";

let propsSort = 1200;

function setClassFromSet(node: HTMLElement, value: string, input: Input, component: Component) {
    for (let c of this.validValues) {
        if (!c) continue;
        node.classList.remove(c);
    }
    node.classList.add(value);
    return node;
}
function setSelectOptions(node: HTMLElement) {
    this.data = this.data || {};
    this.data.options = this.validValues.map(v => {
        let value = v;
        let text = v === "" ? '-' : v;
        return { value, text };
    })
}
function setResponsiveClasses(node: HTMLElement, value: string, input: Input, component: Component) {
    let setOfValues: string[] = [];
    for (let sz of ['sm', 'md', 'lg']) {
        for (let post of this.data.post_options) {
            setOfValues.push(this.data.preffix + '-' + sz + '-' + post);
        }
    }
    for (let c of setOfValues) {
        if (!c) continue;
        node.classList.remove(c);
    }
    node.classList.add(value);
    return node;
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
    {
        name: "Text/Icon Color",
        key: "text_color",
        htmlAttr: "class",
        inputtype: "SelectInput",
        sort: propsSort++,
        onChange: setClassFromSet,
        validValues: ["", "text-primary", "text-secondary", "text-success", "text-danger", "text-warning", "text-info", "text-light", "text-dark", "text-body", "text-muted", "text-white", "text-black-50", "text-white-50"],
        beforeInit: setSelectOptions,
    },
];

const DisplayProperties: ComponentProperty[] = [
    {
        name: 'Display Classes',
        key: "display_header",
        inputtype: "SectionInput",
        sort: propsSort++,
        tab: 'left-panel-tab-style',
        data: { header: "Display" },
    },
    {
        name: "Display",
        key: "display",
        htmlAttr: "class",
        inputtype: "SelectInput",
        onChange: setClassFromSet,
        sort: propsSort++,
        validValues: ["", "d-inline", "d-inline-block", "d-block", "d-flex", 'd-grid'],
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
        data: { header: "Display Flex", expanded: false },
    },
    {
        name: "Alignment Items",
        key: "flex_alignment",
        htmlAttr: "class",
        sort: propsSort++,
        inputtype: "SelectInput",
        onChange: setClassFromSet,
        validValues: ["", "align-items-start", "align-items-end", "align-items-center", "align-items-baseline", "align-items-stretch"],
        beforeInit: setSelectOptions,
    },
    {
        name: "Justify Items",
        key: "flex_justify",
        htmlAttr: "class",
        sort: propsSort++,
        inputtype: "SelectInput",
        onChange: setResponsiveClasses,
        validValues: ["", "justify-content-start", "justify-content-end", "justify-content-center", "justify-content-between", "justify-content-around"],
        beforeInit: setSelectOptions,
    },
    {
        name: "Grow/Shrink",
        key: "flex_grow_shrink",
        htmlAttr: "class",
        sort: propsSort++,
        inputtype: "SelectInput",
        onChange: setClassFromSet,
        validValues: ["", "flex-grow-0", "flex-grow-1", "flex-shrink-0", "flex-shrink-1"],
        beforeInit: setSelectOptions,
    },
    {
        name: "Wrap",
        key: "flex_wrap",
        htmlAttr: "class",
        sort: propsSort++,
        inputtype: "SelectInput",
        onChange: setClassFromSet,
        validValues: ["", "flex-wrap"],
        beforeInit: setSelectOptions,
    },
];


const GridProperties: ComponentProperty[] = [
    {
        name: 'Display Grid Classes',
        key: "grid_header",
        inputtype: "SectionInput",
        sort: propsSort++,
        tab: 'left-panel-tab-style',
        data: { header: "Display Grid" },
    },
];



const SpacingProperties: ComponentProperty[] = [
    {
        name: 'Spacing Classes',
        key: "spacing_header",
        inputtype: "SectionInput",
        sort: propsSort++,
        tab: 'left-panel-tab-style',
        data: { header: "Spacing", expanded: false },
    },
    {
        name: "Padding",
        key: "spacing_p",
        htmlAttr: "class",
        sort: propsSort++,
        inputtype: "SelectInput",
        onChange: setClassFromSet,
        validValues: ["", "p-0", "p-1", "p-2", "p-3", 'p-4', 'p-5'],
        beforeInit: setSelectOptions,
    },
    {
        name: "Padding Horizontal",
        key: "spacing_px",
        htmlAttr: "class",
        sort: propsSort++,
        inputtype: "SelectInput",
        onChange: setClassFromSet,
        validValues: ["", "px-0", "px-1", "px-2", "px-3", 'px-4', 'px-5'],
        beforeInit: setSelectOptions,
    },
    {
        name: "Padding Vertical",
        key: "spacing_py",
        htmlAttr: "class",
        sort: propsSort++,
        inputtype: "SelectInput",
        onChange: setClassFromSet,
        validValues: ["", "py-0", "py-1", "py-2", "py-3", 'py-4', 'py-5'],
        beforeInit: setSelectOptions,
    },
    {
        name: "Padding Top",
        key: "spacing_pt",
        htmlAttr: "class",
        sort: propsSort++,
        inputtype: "SelectInput",
        onChange: setClassFromSet,
        validValues: ["", "pt-0", "pt-1", "pt-2", "pt-3", 'pt-4', 'pt-5'],
        beforeInit: setSelectOptions,
    },
    {
        name: "Padding Bottom",
        key: "spacingP-b",
        htmlAttr: "class",
        sort: propsSort++,
        inputtype: "SelectInput",
        onChange: setClassFromSet,
        validValues: ["", "pb-0", "pb-1", "pb-2", "pb-3", 'pb-4', 'pb-5'],
        beforeInit: setSelectOptions,
    },
    {
        name: "Padding Left",
        key: "spacing_pl",
        htmlAttr: "class",
        sort: propsSort++,
        inputtype: "SelectInput",
        onChange: setClassFromSet,
        validValues: ["", "pl-0", "pl-1", "pl-2", "pl-3", 'pl-4', 'pl-5'],
        beforeInit: setSelectOptions,
    },
    {
        name: "Padding Right",
        key: "spacing_pr",
        htmlAttr: "class",
        sort: propsSort++,
        inputtype: "SelectInput",
        onChange: setClassFromSet,
        validValues: ["", "pr-0", "pr-1", "pr-2", "pr-3", 'pr-4', 'pr-5'],
        beforeInit: setSelectOptions,
    },
    {
        name: "Margin",
        key: "spacing_m",
        htmlAttr: "class",
        sort: propsSort++,
        inputtype: "SelectInput",
        onChange: setClassFromSet,
        validValues: ["", "m-0", "m-1", "m-2", "m-3", 'm-4', 'm-5'],
        beforeInit: setSelectOptions,
    },
    {
        name: "Margin Horizontal",
        key: "spacing_px",
        htmlAttr: "class",
        sort: propsSort++,
        inputtype: "SelectInput",
        onChange: setClassFromSet,
        validValues: ["", "mx-0", "mx-1", "mx-2", "mx-3", 'mx-4', 'mx-5'],
        beforeInit: setSelectOptions,
    },
    {
        name: "Margin Vertical",
        key: "spacing_py",
        htmlAttr: "class",
        sort: propsSort++,
        inputtype: "SelectInput",
        onChange: setClassFromSet,
        validValues: ["", "my-0", "my-1", "my-2", "my-3", 'my-4', 'my-5'],
        beforeInit: setSelectOptions,
    },
    {
        name: "Margin Top",
        key: "spacing_pt",
        htmlAttr: "class",
        sort: propsSort++,
        inputtype: "SelectInput",
        onChange: setClassFromSet,
        validValues: ["", "mt-0", "mt-1", "mt-2", "mt-3", 'mt-4', 'mt-5'],
        beforeInit: setSelectOptions,
    },
    {
        name: "Margin Bottom",
        key: "spacingP-b",
        htmlAttr: "class",
        sort: propsSort++,
        inputtype: "SelectInput",
        onChange: setClassFromSet,
        validValues: ["", "mb-0", "mb-1", "mb-2", "mb-3", 'mb-4', 'mb-5'],
        beforeInit: setSelectOptions,
    },
    {
        name: "Margin Left",
        key: "spacing_pl",
        htmlAttr: "class",
        sort: propsSort++,
        inputtype: "SelectInput",
        onChange: setClassFromSet,
        validValues: ["", "ml-0", "ml-1", "ml-2", "ml-3", 'ml-4', 'ml-5'],
        beforeInit: setSelectOptions,
    },
    {
        name: "Margin Right",
        key: "spacing_pr",
        htmlAttr: "class",
        sort: propsSort++,
        inputtype: "SelectInput",
        onChange: setClassFromSet,
        validValues: ["", "mr-0", "mr-1", "mr-2", "mr-3", 'mr-4', 'mr-5'],
        beforeInit: setSelectOptions,
    },
    {
        name: "Negative Margin",
        key: "spacing_m",
        htmlAttr: "class",
        sort: propsSort++,
        inputtype: "SelectInput",
        onChange: setClassFromSet,
        validValues: ["", "m-n1", "m-n2", "m-n3", 'm-n4', 'm-n5'],
        beforeInit: setSelectOptions,
    },
    {
        name: "Negative Margin Horizontal",
        key: "spacing_px",
        htmlAttr: "class",
        sort: propsSort++,
        inputtype: "SelectInput",
        onChange: setClassFromSet,
        validValues: ["", "mx-n1", "mx-n2", "mx-n3", 'mx-n4', 'mx-n5'],
        beforeInit: setSelectOptions,
    },
    {
        name: "Negative Margin Vertical",
        key: "spacing_py",
        htmlAttr: "class",
        sort: propsSort++,
        inputtype: "SelectInput",
        onChange: setClassFromSet,
        validValues: ["", "my-n1", "my-n2", "my-n3", 'my-n4', 'my-n5'],
        beforeInit: setSelectOptions,
    },
    {
        name: "Negative Margin Top",
        key: "spacing_pt",
        htmlAttr: "class",
        sort: propsSort++,
        inputtype: "SelectInput",
        onChange: setClassFromSet,
        validValues: ["", "mt-n1", "mt-n2", "mt-n3", 'mt-n4', 'mt-n5'],
        beforeInit: setSelectOptions,
    },
    {
        name: "Negative Margin Bottom",
        key: "spacingP-b",
        htmlAttr: "class",
        sort: propsSort++,
        inputtype: "SelectInput",
        onChange: setClassFromSet,
        validValues: ["", "mb-n1", "mb-n2", "mb-n3", 'mb-n4', 'mb-n5'],
        beforeInit: setSelectOptions,
    },
    {
        name: "Negative Margin Left",
        key: "spacing_pl",
        htmlAttr: "class",
        sort: propsSort++,
        inputtype: "SelectInput",
        onChange: setClassFromSet,
        validValues: ["", "ml-n1", "ml-n2", "ml-n3", 'ml-n4', 'ml-n5'],
        beforeInit: setSelectOptions,
    },
    {
        name: "Negative Margin Right",
        key: "spacing_pr",
        htmlAttr: "class",
        sort: propsSort++,
        inputtype: "SelectInput",
        onChange: setClassFromSet,
        validValues: ["", "mr-n1", "mr-n2", "mr-n3", 'mr-n4', 'mr-n5'],
        beforeInit: setSelectOptions,
    },
];


export const ComponentsBaseSyleClasses: Partial<Component> = {
    name: "Element",
    //@ts-ignore
    properties:
        TextProperties
        .concat(SpacingProperties)
        // .concat(DisplayProperties)
        // .concat(FlexProperties)
};
