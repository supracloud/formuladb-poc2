import { incrementSort, ComponentEditorComponent } from "./component-editor.component";

export function addComponents(Components: ComponentEditorComponent, baseUrl: string) {
    Components.extend("_base", "_base", {
        properties: [
            {
                key: "display_header",
                inputtype: "SectionInput",
                name: '',
                sort: incrementSort(),
                tab: 'left-panel-tab-style',
                data: { header: "Display" },
            }, {
                name: "Display",
                key: "display",
                htmlAttr: "style",
                sort: incrementSort(),
                tab: 'left-panel-tab-style',
                col: 6,
                inline: true,
                inputtype: "SelectInput",
                validValues: ["block", "inline", "inline-block", "none"],
                data: {
                    options: [{
                        value: "block",
                        text: "Block"
                    }, {
                        value: "inline",
                        text: "Inline"
                    }, {
                        value: "inline-block",
                        text: "Inline Block"
                    }, {
                        value: "none",
                        text: "none"
                    }]
                }
            }, {
                name: "Position",
                key: "position",
                htmlAttr: "style",
                sort: incrementSort(),
                tab: 'left-panel-tab-style',
                col: 6,
                inline: true,
                inputtype: "SelectInput",
                validValues: ["static", "fixed", "relative", "absolute"],
                data: {
                    options: [{
                        value: "static",
                        text: "Static"
                    }, {
                        value: "fixed",
                        text: "Fixed"
                    }, {
                        value: "relative",
                        text: "Relative"
                    }, {
                        value: "absolute",
                        text: "Absolute"
                    }]
                }
            }, {
                name: "Top",
                key: "top",
                htmlAttr: "style",
                sort: incrementSort(),
                tab: 'left-panel-tab-style',
                col: 6,
                inline: true,
                parent: "",
                inputtype: "CssUnitInput",
            }, {
                name: "Left",
                key: "left",
                htmlAttr: "style",
                sort: incrementSort(),
                tab: 'left-panel-tab-style',
                col: 6,
                inline: true,
                parent: "",
                inputtype: "CssUnitInput",
            }, {
                name: "Bottom",
                key: "bottom",
                htmlAttr: "style",
                sort: incrementSort(),
                tab: 'left-panel-tab-style',
                col: 6,
                inline: true,
                parent: "",
                inputtype: "CssUnitInput",
            }, {
                name: "Right",
                key: "right",
                htmlAttr: "style",
                sort: incrementSort(),
                tab: 'left-panel-tab-style',
                col: 6,
                inline: true,
                parent: "",
                inputtype: "CssUnitInput",
            }, {
                name: "Float",
                key: "float",
                htmlAttr: "style",
                sort: incrementSort(),
                tab: 'left-panel-tab-style',
                col: 12,
                inline: true,
                inputtype: "RadioButtonInput",
                data: {
                    extraclass: "btn-group-sm btn-group-fullwidth",
                    options: [{
                        value: "none",
                        icon: "frmdb-i-fa-close",
                        //text: "None",
                        title: "None",
                        checked: true,
                    }, {
                        value: "left",
                        //text: "Left",
                        title: "Left",
                        icon: "frmdb-i-fa-align-left",
                        checked: false,
                    }, {
                        value: "right",
                        //text: "Right",
                        title: "Right",
                        icon: "frmdb-i-fa-align-right",
                        checked: false,
                    }],
                }
            }, {
                name: "Opacity",
                key: "opacity",
                htmlAttr: "style",
                sort: incrementSort(),
                tab: 'left-panel-tab-style',
                col: 12,
                inline: true,
                parent: "",
                inputtype: "RangeInput",
                data: {
                    max: 1, //max zoom level
                    min: 0,
                    step: 0.1
                },
            }, {
                name: "Background Color",
                key: "background-color",
                sort: incrementSort(),
                tab: 'left-panel-tab-style',
                col: 6,
                inline: true,
                htmlAttr: "style",
                inputtype: "ColorInput",
            }, {
                name: "Text Color",
                key: "color",
                sort: incrementSort(),
                tab: 'left-panel-tab-style',
                col: 6,
                inline: true,
                htmlAttr: "style",
                inputtype: "ColorInput",
            }]
    });

    //Typography
    Components.extend("_base", "_base", {
        properties: [
            {
                name: '',
                key: "typography_header",
                inputtype: "SectionInput",
                sort: incrementSort(),
                tab: 'left-panel-tab-style',
                data: { header: "Typography" },
            }, {
                name: "Font family",
                key: "font-family",
                htmlAttr: "style",
                sort: incrementSort(),
                tab: 'left-panel-tab-style',
                col: 6,
                inline: true,
                inputtype: "SelectInput",
                data: {
                    options: [{
                        value: "",
                        text: "Default"
                    }, {
                        value: "Arial, Helvetica, sans-serif",
                        text: "Arial"
                    }, {
                        value: 'Lucida Sans Unicode", "Lucida Grande", sans-serif',
                        text: 'Lucida Grande'
                    }, {
                        value: 'Palatino Linotype", "Book Antiqua", Palatino, serif',
                        text: 'Palatino Linotype'
                    }, {
                        value: '"Times New Roman", Times, serif',
                        text: 'Times New Roman'
                    }, {
                        value: "Georgia, serif",
                        text: "Georgia, serif"
                    }, {
                        value: "Tahoma, Geneva, sans-serif",
                        text: "Tahoma"
                    }, {
                        value: 'Comic Sans MS, cursive, sans-serif',
                        text: 'Comic Sans'
                    }, {
                        value: 'Verdana, Geneva, sans-serif',
                        text: 'Verdana'
                    }, {
                        value: 'Impact, Charcoal, sans-serif',
                        text: 'Impact'
                    }, {
                        value: 'Arial Black, Gadget, sans-serif',
                        text: 'Arial Black'
                    }, {
                        value: 'Trebuchet MS, Helvetica, sans-serif',
                        text: 'Trebuchet'
                    }, {
                        value: 'Courier New", Courier, monospace',
                        text: 'Courier New", Courier, monospace'
                    }, {
                        value: 'Brush Script MT, sans-serif',
                        text: 'Brush Script'
                    }]
                }
            }, {
                name: "Font weight",
                key: "font-weight",
                htmlAttr: "style",
                sort: incrementSort(),
                tab: 'left-panel-tab-style',
                col: 6,
                inline: true,
                inputtype: "SelectInput",
                data: {
                    options: [{
                        value: "",
                        text: "Default"
                    }, {
                        value: "100",
                        text: "Thin"
                    }, {
                        value: "200",
                        text: "Extra-Light"
                    }, {
                        value: "300",
                        text: "Light"
                    }, {
                        value: "400",
                        text: "Normal"
                    }, {
                        value: "500",
                        text: "Medium"
                    }, {
                        value: "600",
                        text: "Semi-Bold"
                    }, {
                        value: "700",
                        text: "Bold"
                    }, {
                        value: "800",
                        text: "Extra-Bold"
                    }, {
                        value: "900",
                        text: "Ultra-Bold"
                    }],
                }
            }, {
                name: "Text align",
                key: "text-align",
                htmlAttr: "style",
                sort: incrementSort(),
                tab: 'left-panel-tab-style',
                col: 12,
                inline: true,
                inputtype: "RadioButtonInput",
                data: {
                    extraclass: "btn-group-sm btn-group-fullwidth",
                    options: [{
                        value: "none",
                        icon: "frmdb-i-fa-close",
                        //text: "None",
                        title: "None",
                        checked: true,
                    }, {
                        value: "left",
                        //text: "Left",
                        title: "Left",
                        icon: "frmdb-i-fa-align-left",
                        checked: false,
                    }, {
                        value: "center",
                        //text: "Center",
                        title: "Center",
                        icon: "frmdb-i-fa-align-center",
                        checked: false,
                    }, {
                        value: "right",
                        //text: "Right",
                        title: "Right",
                        icon: "frmdb-i-fa-align-right",
                        checked: false,
                    }, {
                        value: "justify",
                        //text: "justify",
                        title: "Justify",
                        icon: "frmdb-i-fa-align-justify",
                        checked: false,
                    }],
                },
            }, {
                name: "Line height",
                key: "line-height",
                htmlAttr: "style",
                sort: incrementSort(),
                tab: 'left-panel-tab-style',
                col: 6,
                inline: true,
                inputtype: "CssUnitInput",
            }, {
                name: "Letter spacing",
                key: "letter-spacing",
                htmlAttr: "style",
                sort: incrementSort(),
                tab: 'left-panel-tab-style',
                col: 6,
                inline: true,
                inputtype: "CssUnitInput",
            }, {
                name: "Text decoration",
                key: "text-decoration-line",
                htmlAttr: "style",
                sort: incrementSort(),
                tab: 'left-panel-tab-style',
                col: 12,
                inline: true,
                inputtype: "RadioButtonInput",
                data: {
                    extraclass: "btn-group-sm btn-group-fullwidth",
                    options: [{
                        value: "none",
                        icon: "frmdb-i-fa-close",
                        //text: "None",
                        title: "None",
                        checked: true,
                    }, {
                        value: "underline",
                        //text: "Left",
                        title: "underline",
                        icon: "frmdb-i-fa-long-arrow-down",
                        checked: false,
                    }, {
                        value: "overline",
                        //text: "Right",
                        title: "overline",
                        icon: "frmdb-i-fa-long-arrow-up",
                        checked: false,
                    }, {
                        value: "line-through",
                        //text: "Right",
                        title: "Line Through",
                        icon: "frmdb-i-fa-strikethrough",
                        checked: false,
                    }, {
                        value: "underline overline",
                        //text: "justify",
                        title: "Underline Overline",
                        icon: "frmdb-i-fa-arrows-v",
                        checked: false,
                    }],
                },
            }, {
                name: "Decoration Color",
                key: "text-decoration-color",
                sort: incrementSort(),
                tab: 'left-panel-tab-style',
                col: 6,
                inline: true,
                htmlAttr: "style",
                inputtype: "ColorInput",
            }, {
                name: "Decoration style",
                key: "text-decoration-style",
                htmlAttr: "style",
                sort: incrementSort(),
                tab: 'left-panel-tab-style',
                col: 6,
                inline: true,
                inputtype: "SelectInput",
                data: {
                    options: [{
                        value: "",
                        text: "Default"
                    }, {
                        value: "solid",
                        text: "Solid"
                    }, {
                        value: "wavy",
                        text: "Wavy"
                    }, {
                        value: "dotted",
                        text: "Dotted"
                    }, {
                        value: "dashed",
                        text: "Dashed"
                    }, {
                        value: "double",
                        text: "Double"
                    }],
                }
            }]
    })

    //Size
    Components.extend("_base", "_base", {
        properties: [{
            key: "size_header",
            inputtype: "SectionInput",
            name: '',
            sort: incrementSort(),
            tab: 'left-panel-tab-style',
            data: { header: "Size", expanded: false },
        }, {
            name: "Width",
            key: "width",
            htmlAttr: "style",
            sort: incrementSort(),
            tab: 'left-panel-tab-style',
            col: 6,
            inline: true,
            inputtype: "CssUnitInput",
        }, {
            name: "Height",
            key: "height",
            htmlAttr: "style",
            sort: incrementSort(),
            tab: 'left-panel-tab-style',
            col: 6,
            inline: true,
            inputtype: "CssUnitInput",
        }, {
            name: "Min Width",
            key: "min-width",
            htmlAttr: "style",
            sort: incrementSort(),
            tab: 'left-panel-tab-style',
            col: 6,
            inline: true,
            inputtype: "CssUnitInput",
        }, {
            name: "Min Height",
            key: "min-height",
            htmlAttr: "style",
            sort: incrementSort(),
            tab: 'left-panel-tab-style',
            col: 6,
            inline: true,
            inputtype: "CssUnitInput",
        }, {
            name: "Max Width",
            key: "max-width",
            htmlAttr: "style",
            sort: incrementSort(),
            tab: 'left-panel-tab-style',
            col: 6,
            inline: true,
            inputtype: "CssUnitInput",
        }, {
            name: "Max Height",
            key: "max-height",
            htmlAttr: "style",
            sort: incrementSort(),
            tab: 'left-panel-tab-style',
            col: 6,
            inline: true,
            inputtype: "CssUnitInput",
        }]
    });

    //Margin
    Components.extend("_base", "_base", {
        properties: [{
            key: "margins_header",
            inputtype: "SectionInput",
            name: '',
            sort: incrementSort(),
            tab: 'left-panel-tab-style',
            data: { header: "Margin", expanded: false },
        }, {
            name: "Top",
            key: "margin-top",
            htmlAttr: "style",
            sort: incrementSort(),
            tab: 'left-panel-tab-style',
            col: 6,
            inline: true,
            inputtype: "CssUnitInput",
        }, {
            name: "Right",
            key: "margin-right",
            htmlAttr: "style",
            sort: incrementSort(),
            tab: 'left-panel-tab-style',
            col: 6,
            inline: true,
            inputtype: "CssUnitInput",
        }, {
            name: "Bottom",
            key: "margin-bottom",
            htmlAttr: "style",
            sort: incrementSort(),
            tab: 'left-panel-tab-style',
            col: 6,
            inline: true,
            inputtype: "CssUnitInput",
        }, {
            name: "Left",
            key: "margin-left",
            htmlAttr: "style",
            sort: incrementSort(),
            tab: 'left-panel-tab-style',
            col: 6,
            inline: true,
            inputtype: "CssUnitInput",
        }]
    });

    //Padding
    Components.extend("_base", "_base", {
        properties: [{
            key: "paddings_header",
            inputtype: "SectionInput",
            name: '',
            sort: incrementSort(),
            tab: 'left-panel-tab-style',
            data: { header: "Padding", expanded: false },
        }, {
            name: "Top",
            key: "padding-top",
            htmlAttr: "style",
            sort: incrementSort(),
            tab: 'left-panel-tab-style',
            col: 6,
            inline: true,
            inputtype: "CssUnitInput",
        }, {
            name: "Right",
            key: "padding-right",
            htmlAttr: "style",
            sort: incrementSort(),
            tab: 'left-panel-tab-style',
            col: 6,
            inline: true,
            inputtype: "CssUnitInput",
        }, {
            name: "Bottom",
            key: "padding-bottom",
            htmlAttr: "style",
            sort: incrementSort(),
            tab: 'left-panel-tab-style',
            col: 6,
            inline: true,
            inputtype: "CssUnitInput",
        }, {
            name: "Left",
            key: "padding-left",
            htmlAttr: "style",
            sort: incrementSort(),
            tab: 'left-panel-tab-style',
            col: 6,
            inline: true,
            inputtype: "CssUnitInput",
        }]
    });


    //Border
    Components.extend("_base", "_base", {
        properties: [{
            key: "border_header",
            inputtype: "SectionInput",
            name: '',
            sort: incrementSort(),
            tab: 'left-panel-tab-style',
            data: { header: "Border", expanded: false },
        }, {
            name: "Style",
            key: "border-style",
            htmlAttr: "style",
            sort: incrementSort(),
            tab: 'left-panel-tab-style',
            col: 12,
            inline: true,
            inputtype: "SelectInput",
            data: {
                options: [{
                    value: "",
                    text: "Default"
                }, {
                    value: "solid",
                    text: "Solid"
                }, {
                    value: "dotted",
                    text: "Dotted"
                }, {
                    value: "dashed",
                    text: "Dashed"
                }],
            }
        }, {
            name: "Width",
            key: "border-width",
            htmlAttr: "style",
            sort: incrementSort(),
            tab: 'left-panel-tab-style',
            col: 6,
            inline: true,
            inputtype: "CssUnitInput",
        }, {
            name: "Color",
            key: "border-color",
            sort: incrementSort(),
            tab: 'left-panel-tab-style',
            col: 6,
            inline: true,
            htmlAttr: "style",
            inputtype: "ColorInput",
        }]
    });



    //Border radius
    Components.extend("_base", "_base", {
        properties: [{
            key: "border_radius_header",
            inputtype: "SectionInput",
            name: '',
            sort: incrementSort(),
            tab: 'left-panel-tab-style',
            data: { header: "Border radius", expanded: false },
        }, {
            name: "Top Left",
            key: "border-top-left-radius",
            htmlAttr: "style",
            sort: incrementSort(),
            tab: 'left-panel-tab-style',
            col: 6,
            inline: true,
            inputtype: "CssUnitInput",
        }, {
            name: "Top Right",
            key: "border-top-right-radius",
            htmlAttr: "style",
            sort: incrementSort(),
            tab: 'left-panel-tab-style',
            col: 6,
            inline: true,
            inputtype: "CssUnitInput",
        }, {
            name: "Bottom Left",
            key: "border-bottom-left-radius",
            htmlAttr: "style",
            sort: incrementSort(),
            tab: 'left-panel-tab-style',
            col: 6,
            inline: true,
            inputtype: "CssUnitInput",
        }, {
            name: "Bottom Right",
            key: "border-bottom-right-radius",
            htmlAttr: "style",
            sort: incrementSort(),
            tab: 'left-panel-tab-style',
            col: 6,
            inline: true,
            inputtype: "CssUnitInput",
        }]
    });
}
