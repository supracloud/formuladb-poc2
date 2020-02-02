import { incrementCommonPropsSort, style_section, ComponentProperty } from "./component-editor.component";

export const SyleClassesProperties: ComponentProperty[] = [
    {
        name: '',
        key: "text_header",
        inputtype: "SectionInput",
        sort: incrementCommonPropsSort(),
        tab: style_section,
        data: { header: "Text" },
    }, {
        name: "Align",
        key: "align",
        htmlAttr: "class",
        inputtype: "SelectInput",
        sort: incrementCommonPropsSort(),
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
];
