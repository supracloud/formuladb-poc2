/*
Copyright 2017 Ziadin Givan

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

https://github.com/givanz/Vvvebjs
*/

import { createInput, Input } from "./inputs";
import { incrementSort, ComponentEditorComponent, incrementCommonPropsSort } from "@fe/component-editor/component-editor.component";
import { Undo } from "@fe/frmdb-editor/undo";

declare var $: null, jQuery: null;

const bgcolorClasses = ["bg-primary", "bg-secondary", "bg-success", "bg-danger", "bg-warning", "bg-info", "bg-light", "bg-dark", "bg-white"]

const bgcolorSelectOptions =
    [{
        value: "Default",
        text: ""
    },
    {
        value: "bg-primary",
        text: "Primary"
    }, {
        value: "bg-secondary",
        text: "Secondary"
    }, {
        value: "bg-success",
        text: "Success"
    }, {
        value: "bg-danger",
        text: "Danger"
    }, {
        value: "bg-warning",
        text: "Warning"
    }, {
        value: "bg-info",
        text: "Info"
    }, {
        value: "bg-light",
        text: "Light"
    }, {
        value: "bg-dark",
        text: "Dark"
    }, {
        value: "bg-white",
        text: "White"
    }];

function changeNodeName(node: HTMLElement, newNodeName: string) {
    var newNode;
    newNode = document.createElement(newNodeName);
    let attributes = node.attributes;

    for (let i = 0, len = attributes.length; i < len; i++) {
        newNode.setAttribute(attributes[i].nodeName, attributes[i].nodeValue);
    }

    newNode.innerHTML = node.innerHTML;
    node.parentElement!.replaceChild(newNode, node);

    return newNode;
}

function grabImage(element: HTMLElement) {
    if (element.tagName.toLowerCase() === 'img') {
        return element.getAttribute('src');
    }
    const img = element.querySelector('img');
    if (img) return img.getAttribute('src');

    if (element.classList.contains('card-img-overlay')) {
        let imgEl = element.previousElementSibling as HTMLImageElement;
        if (imgEl && imgEl.tagName.toLowerCase() === 'img') return imgEl.getAttribute('src');
    }

    let cssPropertyImgUrl = element.style.getPropertyValue('--frmdb-bg-img');
    if (cssPropertyImgUrl) {
        return cssPropertyImgUrl.replace(/^\s*url\(['"']/, '').replace(/['"']\)\s*$/, '');
    }

    // for (let el of [element].concat(Array.from(element.querySelectorAll("div")))) {
    //     if (getComputedStyle(el).backgroundImage !== 'none') {
    //         return (getComputedStyle(el).backgroundImage||'').replace(/^url\(['"']/, '').replace(/['"']\)$/, '');
    //     }
    // }
}

export function frmdbSetImageSrc(element: HTMLElement, value: string) {
    if (element.tagName.toLowerCase() === 'img') {
        Undo.addMutation({
            type: 'attributes',
            target: element,
            attributeName: 'src',
            oldValue: element.getAttribute('src'),
            newValue: value
        });
        element.setAttribute('src', value);
    }
    const img = element.querySelector('img');
    if (img) {
        Undo.addMutation({
            type: 'attributes',
            target: img,
            attributeName: 'src',
            oldValue: img.getAttribute('src'),
            newValue: value
        });
        img.setAttribute('src', value);
    }

    if (element.classList.contains('card-img-overlay')) {
        let imgEl = element.previousElementSibling as HTMLImageElement;
        if (imgEl && imgEl.tagName.toLowerCase() === 'img') {
            Undo.addMutation({
                type: 'attributes',
                target: imgEl,
                attributeName: 'src',
                oldValue: imgEl.getAttribute('src'),
                newValue: value
            });
            imgEl.setAttribute('src', value);
        }
    }

    let cssPropertyImgUrl = element.style.getPropertyValue('--frmdb-bg-img');
    if (cssPropertyImgUrl) {
        let newPropValue = `url('${value}')`;
        Undo.addMutation({
            type: 'style.property',
            target: element,
            propertyName: '--frmdb-bg-img',
            oldValue: element.style.getPropertyValue('--frmdb-bg-img'),
            newValue: newPropValue
        });
        element.style.setProperty('--frmdb-bg-img', newPropValue);
    }

    // for (let el of [element].concat(Array.from(element.querySelectorAll("div")))) {
    //     if (getComputedStyle(el).backgroundImage !== 'none') {
    //         return (getComputedStyle(el).backgroundImage||'').replace(/^url\(['"']/, '').replace(/['"']\)$/, '');
    //     }
    // }
}

function grabIcon(element: HTMLElement) {
    if (element.tagName.toLowerCase() === 'i') {
        return element.getAttribute('class');
    }
}

// ComponentsGroup['Basic Components'] =
// ["html/container", "html/gridrow", "html/button", "html/buttongroup", "html/buttontoolbar", "html/heading", "html/image", "html/jumbotron", "html/alert", "html/card", "html/listgroup", "html/hr", "html/taglabel", "html/badge", "html/progress", "html/navbar", "html/breadcrumbs", "html/pagination", "html/form", "html/textinput", "html/textareainput", "html/selectinput", "html/fileinput", "html/checkbox", "html/radiobutton", "html/table", "html/paragraph", "html/link", "html/video", "html/button"];

export function addComponents(Components: ComponentEditorComponent, baseUrl: string) {

    Components.extend("_base", "html/container", {
        classes: ["container", "container-fluid"],
        image: "icons/container.svg",
        html: '<div class="container" style="min-height:150px;"><div class="m-5">Container</div></div>',
        name: "Container",
        properties: [
            {
                name: "Type",
                key: "type",
                htmlAttr: "class",
                inputtype: "SelectInput",
                validValues: ["container", "container-fluid"],
                data: {
                    options: [{
                        value: "container",
                        text: "Default"
                    }, {
                        value: "container-fluid",
                        text: "Fluid"
                    }]
                }
            },
            {
                name: "Background",
                key: "background",
                htmlAttr: "class",
                validValues: bgcolorClasses,
                inputtype: "SelectInput",
                data: {
                    options: bgcolorSelectOptions
                }
            },
            {
                name: "Background Color",
                key: "background-color",
                htmlAttr: "style",
                inputtype: "ColorInput",
            },
            {
                name: "Text Color",
                key: "color",
                htmlAttr: "style",
                inputtype: "ColorInput",
            }],
    });

    Components.extend("_base", "html/heading", {
        image: "icons/heading.svg",
        name: "Heading",
        nodes: ["h1", "h2", "h3", "h4", "h5", "h6"],
        html: "<h1>Heading</h1>",

        properties: [
            {
                name: "Size",
                key: "size",
                inputtype: "SelectInput",

                onChange: function (node, value) {

                    return changeNodeName(node, "h" + value);
                },

                init: function (node: HTMLElement) {
                    var regex;
                    regex = /H(\d)/.exec(node.nodeName);
                    if (regex && regex[1]) {
                        return regex[1]
                    }
                    return 1
                },

                data: {
                    options: [{
                        value: "1",
                        text: "1"
                    }, {
                        value: "2",
                        text: "2"
                    }, {
                        value: "3",
                        text: "3"
                    }, {
                        value: "4",
                        text: "4"
                    }, {
                        value: "5",
                        text: "5"
                    }, {
                        value: "6",
                        text: "6"
                    }]
                },
            }]
    });
    Components.extend("_base", "html/link", {
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
    });
    Components.extend("_base", "html/card-img-overlay", {
        classes: ["card-img-overlay"],
        name: "Card Image Overlay",
        html: '<img src="' + baseUrl + 'icons/image.svg" height="128" width="128">',
        /*
        afterDrop: function (node)
        {
            node.attr("src", '');
            return node;
        },*/
        image: "icons/image.svg",
        properties: [

        ]
    });
    Components.extend("_base", "html/image", {
        nodes: ["img"],
        name: "Image",
        html: '<img src="' + baseUrl + 'icons/image.svg" height="128" width="128">',
        /*
        afterDrop: function (node)
        {
            node.attr("src", '');
            return node;
        },*/
        image: "icons/image.svg",
        properties: [{
            name: "Width",
            key: "width",
            htmlAttr: "width",
            inputtype: "TextInput",
        }, {
            name: "Height",
            key: "height",
            htmlAttr: "height",
            inputtype: "TextInput",
        }, {
            name: "Alt",
            key: "alt",
            htmlAttr: "alt",
            inputtype: "TextInput",
        }]
    });
    Components.add("html/hr", {
        image: "icons/hr.svg",
        nodes: ["hr"],
        name: "Horizontal Rule",
        html: "<hr>",
        properties: [],
    });
    Components.extend("_base", "html/label", {
        name: "Label",
        nodes: ["label"],
        html: '<label for="">Label</label>',
        properties: [{
            name: "For id",
            htmlAttr: "for",
            key: "for",
            inputtype: "TextInput",
        }]
    });
    Components.extend("_base", "html/button", {
        classes: ["btn", "btn-link"],
        name: "Button",
        image: "icons/button.svg",
        html: '<button type="button" class="btn btn-primary">Primary</button>',
        properties: [{
            name: "Link To",
            key: "href",
            htmlAttr: "href",
            inputtype: "LinkInput",
        }, {
            name: "Type",
            key: "type",
            htmlAttr: "class",
            inputtype: "SelectInput",
            validValues: ["btn-default", "btn-primary", "btn-info", "btn-success", "btn-warning", "btn-info", "btn-light", "btn-dark", "btn-outline-primary", "btn-outline-info", "btn-outline-success", "btn-outline-warning", "btn-outline-info", "btn-outline-light", "btn-outline-dark", "btn-link"],
            data: {
                options: [{
                    value: "btn-default",
                    text: "Default"
                }, {
                    value: "btn-primary",
                    text: "Primary"
                }, {
                    value: "btn btn-info",
                    text: "Info"
                }, {
                    value: "btn-success",
                    text: "Success"
                }, {
                    value: "btn-warning",
                    text: "Warning"
                }, {
                    value: "btn-info",
                    text: "Info"
                }, {
                    value: "btn-light",
                    text: "Light"
                }, {
                    value: "btn-dark",
                    text: "Dark"
                }, {
                    value: "btn-outline-primary",
                    text: "Primary outline"
                }, {
                    value: "btn btn-outline-info",
                    text: "Info outline"
                }, {
                    value: "btn-outline-success",
                    text: "Success outline"
                }, {
                    value: "btn-outline-warning",
                    text: "Warning outline"
                }, {
                    value: "btn-outline-info",
                    text: "Info outline"
                }, {
                    value: "btn-outline-light",
                    text: "Light outline"
                }, {
                    value: "btn-outline-dark",
                    text: "Dark outline"
                }, {
                    value: "btn-link",
                    text: "Link"
                }]
            }
        }, {
            name: "Size",
            key: "size",
            htmlAttr: "class",
            inputtype: "SelectInput",
            validValues: ["btn-lg", "btn-sm"],
            data: {
                options: [{
                    value: "",
                    text: "Default"
                }, {
                    value: "btn-lg",
                    text: "Large"
                }, {
                    value: "btn-sm",
                    text: "Small"
                }]
            }
        }, {
            name: "Target",
            key: "target",
            htmlAttr: "target",
            inputtype: "TextInput",
        }, {
            name: "Disabled",
            key: "disabled",
            htmlAttr: "class",
            inputtype: "ToggleInput",
            validValues: ["disabled"],
            data: {
                on: "disabled",
                off: ""
            }
        }]
    });
    Components.extend("_base", "html/buttongroup", {
        classes: ["btn-group"],
        name: "Button Group",
        image: "icons/button_group.svg",
        html: '<div class="btn-group" role="group" aria-label="Basic example"><button type="button" class="btn btn-secondary">Left</button><button type="button" class="btn btn-secondary">Middle</button> <button type="button" class="btn btn-secondary">Right</button></div>',
        properties: [{
            name: "Size",
            key: "size",
            htmlAttr: "class",
            inputtype: "SelectInput",
            validValues: ["btn-group-lg", "btn-group-sm"],
            data: {
                options: [{
                    value: "",
                    text: "Default"
                }, {
                    value: "btn-group-lg",
                    text: "Large"
                }, {
                    value: "btn-group-sm",
                    text: "Small"
                }]
            }
        }, {
            name: "Alignment",
            key: "alignment",
            htmlAttr: "class",
            inputtype: "SelectInput",
            validValues: ["btn-group", "btn-group-vertical"],
            data: {
                options: [{
                    value: "",
                    text: "Default"
                }, {
                    value: "btn-group",
                    text: "Horizontal"
                }, {
                    value: "btn-group-vertical",
                    text: "Vertical"
                }]
            }
        }]
    });
    Components.extend("_base", "html/buttontoolbar", {
        classes: ["btn-toolbar"],
        name: "Button Toolbar",
        image: "icons/button_toolbar.svg",
        html: '<div class="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">\
                        <div class="btn-group mr-2" role="group" aria-label="First group">\
                        <button type="button" class="btn btn-secondary">1</button>\
                        <button type="button" class="btn btn-secondary">2</button>\
                        <button type="button" class="btn btn-secondary">3</button>\
                        <button type="button" class="btn btn-secondary">4</button>\
                        </div>\
                        <div class="btn-group mr-2" role="group" aria-label="Second group">\
                        <button type="button" class="btn btn-secondary">5</button>\
                        <button type="button" class="btn btn-secondary">6</button>\
                        <button type="button" class="btn btn-secondary">7</button>\
                        </div>\
                        <div class="btn-group" role="group" aria-label="Third group">\
                        <button type="button" class="btn btn-secondary">8</button>\
                        </div>\
                        </div>'
    });
    Components.extend("_base", "html/alert", {
        classes: ["alert"],
        name: "Alert",
        image: "icons/alert.svg",
        html: '<div class="alert alert-warning alert-dismissible fade show" role="alert">\
                        <button type="button" class="close" data-dismiss="alert" aria-label="Close">\
                        <span aria-hidden="true">&times;</span>\
                        </button>\
                        <strong>Holy guacamole!</strong> You should check in on some of those fields below.\
                        </div>',
        properties: [{
            name: "Type",
            key: "type",
            htmlAttr: "class",
            validValues: ["alert-primary", "alert-secondary", "alert-success", "alert-danger", "alert-warning", "alert-info", "alert-light", "alert-dark"],
            inputtype: "SelectInput",
            data: {
                options: [{
                    value: "alert-primary",
                    text: "Default"
                }, {
                    value: "alert-secondary",
                    text: "Secondary"
                }, {
                    value: "alert-success",
                    text: "Success"
                }, {
                    value: "alert-danger",
                    text: "Danger"
                }, {
                    value: "alert-warning",
                    text: "Warning"
                }, {
                    value: "alert-info",
                    text: "Info"
                }, {
                    value: "alert-light",
                    text: "Light"
                }, {
                    value: "alert-dark",
                    text: "Dark"
                }]
            }
        }]
    });
    Components.extend("_base", "html/badge", {
        classes: ["badge"],
        image: "icons/badge.svg",
        name: "Badge",
        html: '<span class="badge badge-primary">Primary badge</span>',
        properties: [{
            name: "Color",
            key: "color",
            htmlAttr: "class",
            validValues: ["badge-primary", "badge-secondary", "badge-success", "badge-danger", "badge-warning", "badge-info", "badge-light", "badge-dark"],
            inputtype: "SelectInput",
            data: {
                options: [{
                    value: "",
                    text: "Default"
                }, {
                    value: "badge-primary",
                    text: "Primary"
                }, {
                    value: "badge-secondary",
                    text: "Secondary"
                }, {
                    value: "badge-success",
                    text: "Success"
                }, {
                    value: "badge-warning",
                    text: "Warning"
                }, {
                    value: "badge-danger",
                    text: "Danger"
                }, {
                    value: "badge-info",
                    text: "Info"
                }, {
                    value: "badge-light",
                    text: "Light"
                }, {
                    value: "badge-dark",
                    text: "Dark"
                }]
            }
        }]
    });
    Components.extend("_base", "html/card", {
        classes: ["card"],
        image: "icons/panel.svg",
        name: "Card",
        html: '<div class="card">\
                        <img class="card-img-top" src="../libs/builder/icons/image.svg" alt="Card image cap" width="128" height="128">\
                        <div class="card-body">\
                        <h4 class="card-title">Card title</h4>\
                        <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card\'s content.</p>\
                        <a href="#" class="btn btn-primary">Go somewhere</a>\
                        </div>\
                        </div>'
    });
    Components.extend("_base", "html/listgroup", {
        name: "List Group",
        image: "icons/list_group.svg",
        classes: ["list-group"],
        html: '<ul class="list-group">\n  <li class="list-group-item">\n    <span class="badge">14</span>\n    Cras justo odio\n  </li>\n  <li class="list-group-item">\n    <span class="badge">2</span>\n    Dapibus ac facilisis in\n  </li>\n  <li class="list-group-item">\n    <span class="badge">1</span>\n    Morbi leo risus\n  </li>\n</ul>'
    });
    Components.extend("_base", "html/listitem", {
        name: "List Item",
        classes: ["list-group-item"],
        html: '<li class="list-group-item"><span class="badge">14</span> Cras justo odio</li>'
    });
    Components.extend("_base", "html/breadcrumbs", {
        classes: ["breadcrumb"],
        name: "Breadcrumbs",
        image: "icons/breadcrumbs.svg",
        html: '<ol class="breadcrumb">\
                        <li class="breadcrumb-item active"><a href="#">Home</a></li>\
                        <li class="breadcrumb-item active"><a href="#">Library</a></li>\
                        <li class="breadcrumb-item active">Data 3</li>\
                        </ol>'
    });
    Components.extend("_base", "html/breadcrumbitem", {
        classes: ["breadcrumb-item"],
        name: "Breadcrumb Item",
        html: '<li class="breadcrumb-item"><a href="#">Library</a></li>',
        properties: [{
            name: "Active",
            key: "active",
            htmlAttr: "class",
            validValues: ["", "active"],
            inputtype: "ToggleInput",
            data: {
                on: "active",
                off: ""
            }
        }]
    });
    Components.extend("_base", "html/pagination", {
        classes: ["pagination"],
        name: "Pagination",
        image: "icons/pagination.svg",
        html: '<nav aria-label="Page navigation example">\
                        <ul class="pagination">\
                        <li class="page-item"><a class="page-link" href="#">Previous</a></li>\
                        <li class="page-item"><a class="page-link" href="#">1</a></li>\
                        <li class="page-item"><a class="page-link" href="#">2</a></li>\
                        <li class="page-item"><a class="page-link" href="#">3</a></li>\
                        <li class="page-item"><a class="page-link" href="#">Next</a></li>\
                        </ul>\
                        </nav>',

        properties: [{
            name: "Size",
            key: "size",
            htmlAttr: "class",
            inputtype: "SelectInput",
            validValues: ["btn-lg", "btn-sm"],
            data: {
                options: [{
                    value: "",
                    text: "Default"
                }, {
                    value: "btn-lg",
                    text: "Large"
                }, {
                    value: "btn-sm",
                    text: "Small"
                }]
            }
        }, {
            name: "Alignment",
            key: "alignment",
            htmlAttr: "class",
            inputtype: "SelectInput",
            validValues: ["justify-content-center", "justify-content-end"],
            data: {
                options: [{
                    value: "",
                    text: "Default"
                }, {
                    value: "justify-content-center",
                    text: "Center"
                }, {
                    value: "justify-content-end",
                    text: "Right"
                }]
            }
        }]
    });
    Components.extend("_base", "html/pageitem", {
        classes: ["page-item"],
        html: '<li class="page-item"><a class="page-link" href="#">1</a></li>',
        name: "Pagination Item",
        properties: [{
            name: "Link To",
            key: "href",
            htmlAttr: "href",
            child: ".page-link",
            inputtype: "TextInput",
        }, {
            name: "Disabled",
            key: "disabled",
            htmlAttr: "class",
            validValues: ["disabled"],
            inputtype: "ToggleInput",
            data: {
                on: "disabled",
                off: ""
            }
        }]
    });
    Components.extend("_base", "html/progress", {
        classes: ["progress"],
        name: "Progress Bar",
        image: "icons/progressbar.svg",
        html: '<div class="progress"><div class="progress-bar w-25"></div></div>',
        properties: [{
            name: "Background",
            key: "background",
            htmlAttr: "class",
            validValues: bgcolorClasses,
            inputtype: "SelectInput",
            data: {
                options: bgcolorSelectOptions
            }
        },
        {
            name: "Progress",
            key: "background",
            child: ".progress-bar",
            htmlAttr: "class",
            validValues: ["", "w-25", "w-50", "w-75", "w-100"],
            inputtype: "SelectInput",
            data: {
                options: [{
                    value: "",
                    text: "None"
                }, {
                    value: "w-25",
                    text: "25%"
                }, {
                    value: "w-50",
                    text: "50%"
                }, {
                    value: "w-75",
                    text: "75%"
                }, {
                    value: "w-100",
                    text: "100%"
                }]
            }
        },
        {
            name: "Progress background",
            key: "background",
            child: ".progress-bar",
            htmlAttr: "class",
            validValues: bgcolorClasses,
            inputtype: "SelectInput",
            data: {
                options: bgcolorSelectOptions
            }
        }, {
            name: "Striped",
            key: "striped",
            child: ".progress-bar",
            htmlAttr: "class",
            validValues: ["", "progress-bar-striped"],
            inputtype: "ToggleInput",
            data: {
                on: "progress-bar-striped",
                off: "",
            }
        }, {
            name: "Animated",
            key: "animated",
            child: ".progress-bar",
            htmlAttr: "class",
            validValues: ["", "progress-bar-animated"],
            inputtype: "ToggleInput",
            data: {
                on: "progress-bar-animated",
                off: "",
            }
        }]
    });
    Components.extend("_base", "html/jumbotron", {
        classes: ["jumbotron"],
        image: "icons/jumbotron.svg",
        name: "Jumbotron",
        html: '<div class="jumbotron">\
                        <h1 class="display-3">Hello, world!</h1>\
                        <p class="lead">This is a simple hero unit, a simple jumbotron-style component for calling extra attention to featured content or information.</p>\
                        <hr class="my-4">\
                        <p>It uses utility classes for typography and spacing to space content out within the larger container.</p>\
                        <p class="lead">\
                        <a class="btn btn-primary btn-lg" href="#" role="button">Learn more</a>\
                        </p>\
                        </div>'
    });
    Components.extend("_base", "html/navbar", {
        classes: ["navbar"],
        image: "icons/navbar.svg",
        name: "Nav Bar",
        html: '<nav class="navbar navbar-expand-lg navbar-light bg-light">\
                        <a class="navbar-brand" href="#">Navbar</a>\
                        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">\
                        <span class="navbar-toggler-icon"></span>\
                        </button>\
                        \
                        <div class="collapse navbar-collapse" id="navbarSupportedContent">\
                        <ul class="navbar-nav mr-auto">\
                        <li class="nav-item active">\
                        <a class="nav-link" href="#">Home <span class="sr-only">(current)</span></a>\
                        </li>\
                        <li class="nav-item">\
                        <a class="nav-link" href="#">Link</a>\
                        </li>\
                        <li class="nav-item">\
                        <a class="nav-link disabled" href="#">Disabled</a>\
                        </li>\
                        </ul>\
                        <form class="form-inline my-2 my-lg-0">\
                        <input class="form-control mr-sm-2" type="text" placeholder="Search" aria-label="Search">\
                        <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>\
                        </form>\
                        </div>\
                        </nav>',

        properties: [{
            name: "Color theme",
            key: "color",
            htmlAttr: "class",
            validValues: ["navbar-light", "navbar-dark"],
            inputtype: "SelectInput",
            data: {
                options: [{
                    value: "",
                    text: "Default"
                }, {
                    value: "navbar-light",
                    text: "Light"
                }, {
                    value: "navbar-dark",
                    text: "Dark"
                }]
            }
        }, {
            name: "Background color",
            key: "background",
            htmlAttr: "class",
            validValues: bgcolorClasses,
            inputtype: "SelectInput",
            data: {
                options: bgcolorSelectOptions
            }
        }, {
            name: "Placement",
            key: "placement",
            htmlAttr: "class",
            validValues: ["fixed-top", "fixed-bottom", "sticky-top"],
            inputtype: "SelectInput",
            data: {
                options: [{
                    value: "",
                    text: "Default"
                }, {
                    value: "fixed-top",
                    text: "Fixed Top"
                }, {
                    value: "fixed-bottom",
                    text: "Fixed Bottom"
                }, {
                    value: "sticky-top",
                    text: "Sticky top"
                }]
            }
        }]
    });

    Components.extend("_base", "html/form", {
        nodes: ["form"],
        image: "icons/form.svg",
        name: "Form",
        html: '<form><div class="form-group"><label>Text</label><input type="text" class="form-control"></div></div></form>',
        properties: [{
            name: "Style",
            key: "style",
            htmlAttr: "class",
            validValues: ["", "form-search", "form-inline", "form-horizontal"],
            inputtype: "SelectInput",
            data: {
                options: [{
                    value: "",
                    text: "Default"
                }, {
                    value: "form-search",
                    text: "Search"
                }, {
                    value: "form-inline",
                    text: "Inline"
                }, {
                    value: "form-horizontal",
                    text: "Horizontal"
                }]
            }
        }, {
            name: "Action",
            key: "action",
            htmlAttr: "action",
            inputtype: "TextInput",
        }, {
            name: "Method",
            key: "method",
            htmlAttr: "method",
            inputtype: "TextInput",
        }]
    });

    Components.extend("_base", "html/textinput", {
        name: "Text Input",
        attributes: { "type": "text" },
        image: "icons/text_input.svg",
        html: '<div class="form-group"><label>Text</label><input type="text" class="form-control"></div></div>',
        properties: [{
            name: "Value",
            key: "value",
            htmlAttr: "value",
            inputtype: "TextInput",
        }, {
            name: "Placeholder",
            key: "placeholder",
            htmlAttr: "placeholder",
            inputtype: "TextInput",
        }]
    });

    Components.extend("_base", "html/selectinput", {
        nodes: ["select"],
        name: "Select Input",
        image: "icons/select_input.svg",
        html: '<div class="form-group"><label>Choose an option </label><select class="form-control"><option value="value1">Text 1</option><option value="value2">Text 2</option><option value="value3">Text 3</option></select></div>',

        beforeInit: function (node: HTMLElement) {
            let properties: any[] = [];
            var i = 0;

            for (let opt of Array.from(node.querySelectorAll('option'))) {

                let data = { "value": opt.value, "text": opt.text };

                i++;
                properties.push({
                    name: "Option " + i,
                    key: "option" + i,
                    //index: i - 1,
                    optionNode: opt,
                    inputtype: "TextValueInput",
                    data: data,
                    onChange: function (node, value, input) {

                        let option: HTMLOptionElement = this.optionNode;

                        //if remove button is clicked remove option and render row properties
                        if (input.nodeName == 'BUTTON') {
                            option.remove();
                            Components.render("html/selectinput", document.createElement('<todo-selectinput-selected-element>'));
                            return node;
                        }

                        if (input.name == "value") option.setAttribute("value", value);
                        else if (input.name == "text") option.textContent = value;

                        return node;
                    },
                });
            };

            //remove all option properties
            this.properties = this.properties.filter(function (item) {
                return item.key.indexOf("option") === -1;
            });

            //add remaining properties to generated column properties
            properties.push(this.properties[0]);

            this.properties = properties;
            return node;
        },

        properties: [{
            name: "Option",
            key: "option1",
            inputtype: "TextValueInput",
        }, {
            name: "Option",
            key: "option2",
            inputtype: "TextValueInput",
        }, {
            name: "",
            key: "addChild",
            inputtype: "ButtonInput",
            data: { text: "Add option", icon: "la-plus" },
            onChange: function (node) {
                let opt = document.createElement('option');
                opt.textContent = 'Text';
                opt.setAttribute('value', "value");
                node.append(opt);

                //render component properties again to include the new column inputs
                Components.render("html/selectinput", document.createElement('<todo-selectinput-selected-element>'));

                return node;
            }
        }]
    });
    Components.extend("_base", "html/textareainput", {
        name: "Text Area",
        image: "icons/text_area.svg",
        html: '<div class="form-group"><label>Your response:</label><textarea class="form-control"></textarea></div>'
    });
    Components.extend("_base", "html/radiobutton", {
        name: "Radio Button",
        attributes: { "type": "radio" },
        image: "icons/radio.svg",
        html: '<label class="radio"><input type="radio"> Radio</label>',
        properties: [{
            name: "Name",
            key: "name",
            htmlAttr: "name",
            inputtype: "TextInput",
        }]
    });
    Components.extend("_base", "html/checkbox", {
        name: "Checkbox",
        attributes: { "type": "checkbox" },
        image: "icons/checkbox.svg",
        html: '<label class="checkbox"><input type="checkbox"> Checkbox</label>',
        properties: [{
            name: "Name",
            key: "name",
            htmlAttr: "name",
            inputtype: "TextInput",
        }]
    });
    Components.extend("_base", "html/fileinput", {
        name: "Input group",
        attributes: { "type": "file" },
        image: "icons/text_input.svg",
        html: '<div class="form-group">\
                        <input type="file" class="form-control">\
                        </div>'
    });
    Components.extend("_base", "html/table", {
        nodes: ["table"],
        classes: ["table"],
        image: "icons/table.svg",
        name: "Table",
        html: '<table class="table">\
                        <thead>\
                        <tr>\
                        <th>#</th>\
                        <th>First Name</th>\
                        <th>Last Name</th>\
                        <th>Username</th>\
                        </tr>\
                        </thead>\
                        <tbody>\
                        <tr>\
                        <th scope="row">1</th>\
                        <td>Mark</td>\
                        <td>Otto</td>\
                        <td>@mdo</td>\
                        </tr>\
                        <tr>\
                        <th scope="row">2</th>\
                        <td>Jacob</td>\
                        <td>Thornton</td>\
                        <td>@fat</td>\
                        </tr>\
                        <tr>\
                        <th scope="row">3</th>\
                        <td>Larry</td>\
                        <td>the Bird</td>\
                        <td>@twitter</td>\
                        </tr>\
                        </tbody>\
                        </table>',
        properties: [
            {
                name: "Type",
                key: "type",
                htmlAttr: "class",
                validValues: ["table-primary", "table-secondary", "table-success", "table-danger", "table-warning", "table-info", "table-light", "table-dark", "table-white"],
                inputtype: "SelectInput",
                data: {
                    options: [{
                        value: "Default",
                        text: ""
                    }, {
                        value: "table-primary",
                        text: "Primary"
                    }, {
                        value: "table-secondary",
                        text: "Secondary"
                    }, {
                        value: "table-success",
                        text: "Success"
                    }, {
                        value: "table-danger",
                        text: "Danger"
                    }, {
                        value: "table-warning",
                        text: "Warning"
                    }, {
                        value: "table-info",
                        text: "Info"
                    }, {
                        value: "table-light",
                        text: "Light"
                    }, {
                        value: "table-dark",
                        text: "Dark"
                    }, {
                        value: "table-white",
                        text: "White"
                    }]
                }
            },
            {
                name: "Responsive",
                key: "responsive",
                htmlAttr: "class",
                validValues: ["table-responsive"],
                inputtype: "ToggleInput",
                data: {
                    on: "table-responsive",
                    off: ""
                }
            },
            {
                name: "Small",
                key: "small",
                htmlAttr: "class",
                validValues: ["table-sm"],
                inputtype: "ToggleInput",
                data: {
                    on: "table-sm",
                    off: ""
                }
            },
            {
                name: "Hover",
                key: "hover",
                htmlAttr: "class",
                validValues: ["table-hover"],
                inputtype: "ToggleInput",
                data: {
                    on: "table-hover",
                    off: ""
                }
            },
            {
                name: "Bordered",
                key: "bordered",
                htmlAttr: "class",
                validValues: ["table-bordered"],
                inputtype: "ToggleInput",
                data: {
                    on: "table-bordered",
                    off: ""
                }
            },
            {
                name: "Striped",
                key: "striped",
                htmlAttr: "class",
                validValues: ["table-striped"],
                inputtype: "ToggleInput",
                data: {
                    on: "table-striped",
                    off: ""
                }
            },
            {
                name: "Inverse",
                key: "inverse",
                htmlAttr: "class",
                validValues: ["table-inverse"],
                inputtype: "ToggleInput",
                data: {
                    on: "table-inverse",
                    off: ""
                }
            },
            {
                name: "Head options",
                key: "head",
                htmlAttr: "class",
                child: "thead",
                inputtype: "SelectInput",
                validValues: ["", "thead-inverse", "thead-default"],
                data: {
                    options: [{
                        value: "",
                        text: "None"
                    }, {
                        value: "thead-default",
                        text: "Default"
                    }, {
                        value: "thead-inverse",
                        text: "Inverse"
                    }]
                }
            }]
    });
    Components.extend("_base", "html/tablerow", {
        nodes: ["tr"],
        name: "Table Row",
        html: "<tr><td>Cell 1</td><td>Cell 2</td><td>Cell 3</td></tr>",
        properties: [{
            name: "Type",
            key: "type",
            htmlAttr: "class",
            inputtype: "SelectInput",
            validValues: ["", "success", "danger", "warning", "active"],
            data: {
                options: [{
                    value: "",
                    text: "Default"
                }, {
                    value: "success",
                    text: "Success"
                }, {
                    value: "error",
                    text: "Error"
                }, {
                    value: "warning",
                    text: "Warning"
                }, {
                    value: "active",
                    text: "Active"
                }]
            }
        }]
    });
    Components.extend("_base", "html/tablecell", {
        nodes: ["td"],
        name: "Table Cell",
        html: "<td>Cell</td>"
    });
    Components.extend("_base", "html/tableheadercell", {
        nodes: ["th"],
        name: "Table Header Cell",
        html: "<th>Head</th>"
    });
    Components.extend("_base", "html/tablehead", {
        nodes: ["thead"],
        name: "Table Head",
        html: "<thead><tr><th>Head 1</th><th>Head 2</th><th>Head 3</th></tr></thead>",
        properties: [{
            name: "Type",
            key: "type",
            htmlAttr: "class",
            inputtype: "SelectInput",
            validValues: ["", "success", "danger", "warning", "info"],
            data: {
                options: [{
                    value: "",
                    text: "Default"
                }, {
                    value: "success",
                    text: "Success"
                }, {
                    value: "anger",
                    text: "Error"
                }, {
                    value: "warning",
                    text: "Warning"
                }, {
                    value: "info",
                    text: "Info"
                }]
            }
        }]
    });
    Components.extend("_base", "html/tablebody", {
        nodes: ["tbody"],
        name: "Table Body",
        html: "<tbody><tr><td>Cell 1</td><td>Cell 2</td><td>Cell 3</td></tr></tbody>"
    });

    Components.add("html/gridcolumn", {
        name: "Grid Column",
        image: "icons/grid_row.svg",
        classesRegex: ["col-"],
        html: '<div class="col-sm-4"><h3>col-sm-4</h3></div>',
        properties: [{
            name: "Column",
            key: "column",
            inputtype: "GridInput",
            data: { hide_remove: true },

            beforeInit: function (node) {
                let _class = node.getAttribute("class");

                var reg = /col-([^-\$ ]*)?-?(\d+)/g;
                var match;

                while ((match = reg.exec(_class!)) != null) {
                    this.data["col" + ((match[1] != undefined) ? "_" + match[1] : "")] = match[2];
                }
            },

            onChange: function (node, value, input) {
                var _class = node.getAttribute("class")!;

                //remove previous breakpoint column size
                _class = _class.replace(/col-\\d+?/, '');
                //add new column size
                if (value) _class += ' col-' + value;
                node.setAttribute("class", _class);

                return node;
            },
        },
        ]
    });
    Components.add("html/gridrow", {
        name: "Grid Row",
        image: "icons/grid_row.svg",
        classes: ["row"],
        html: '<div class="row"><div class="col-sm-4"><h3>col-sm-4</h3></div><div class="col-sm-4 col-5"><h3>col-sm-4</h3></div><div class="col-sm-4"><h3>col-sm-4</h3></div></div>',
        children: [{
            name: "html/gridcolumn",
            classesRegex: ["col-"],
        }],
        beforeInit: function (node) {
            let properties: any[] = [];
            var i = 0;
            var j = 0;

            node.querySelectorAll('[class*="col-"]').forEach(function (colEl) {
                let _class = colEl.getAttribute("class");

                var reg = /col-([^-\$ ]*)?-?(\d+)/g;
                var match;
                var data = {};

                while ((match = reg.exec(_class!)) != null) {
                    data["col" + ((match[1] != undefined) ? "_" + match[1] : "")] = match[2];
                }

                i++;
                properties.push({
                    name: "Column " + i,
                    key: "column" + i,
                    //index: i - 1,
                    columnNode: colEl,
                    col: 12,
                    inline: true,
                    inputtype: "GridInput",
                    data: data,
                    onChange: function (node: HTMLElement, value, input: Input) {

                        //column = $('[class*="col-"]:eq(' + this.index + ')', node);
                        var column: HTMLElement = this.colEl;

                        //if remove button is clicked remove column and render row properties
                        if (input.nodeName == 'BUTTON') {
                            column.remove();
                            Components.render("html/gridrow", document.createElement('<todo-gridrow-selected-element>'));
                            return node;
                        }

                        //if select input then change column class
                        _class = column.getAttribute("class");

                        //remove previous breakpoint column size
                        _class = _class!.replace(/col-\\d+?/, '');
                        //add new column size
                        if (value) _class += ' col-' + value;
                        column.setAttribute("class", _class);

                        //console.log(this, node, value, input, input.name);

                        return node;
                    },
                });
            });

            //remove all column properties
            this.properties = this.properties.filter(function (item) {
                return item.key.indexOf("column") === -1;
            });

            //add remaining properties to generated column properties
            properties.push(this.properties[0]);

            this.properties = properties;
            return node;
        },

        properties: [{
            name: "Column",
            key: "column1",
            inputtype: "GridInput",
        }, {
            name: "Column",
            key: "column1",
            inline: true,
            col: 12,
            inputtype: "GridInput",
        }, {
            name: "",
            key: "addChild",
            inputtype: "ButtonInput",
            data: { text: "Add column", icon: "frmdb-i-fa-plus" },
            onChange: function (node) {
                let div = document.createElement('div');
                div.classList.add('col-3');
                div.innerHTML = "Col-3";
                node.append(div);

                //render component properties again to include the new column inputs
                Components.render("html/gridrow", document.createElement('<todo-gridrow-selected-element>'));

                return node;
            }
        }]
    });

    Components.extend("_base", "html/paragraph", {
        nodes: ["p"],
        name: "Paragraph",
        image: "icons/paragraph.svg",
        html: '<p>Lorem ipsum</p>',
        properties: []
    });

    Components.extend("_base", "html/video", {
        nodes: ["video"],
        name: "Video",
        html: '<video width="320" height="240" playsinline loop autoplay><source src="https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4"><video>',
        dragHtml: '<img  width="320" height="240" src="' + baseUrl + 'icons/video.svg">',
        image: "icons/video.svg",
        properties: [{
            name: "Src",
            child: "source",
            key: "src",
            htmlAttr: "src",
            inputtype: "LinkInput",
        }, {
            name: "Width",
            key: "width",
            htmlAttr: "width",
            inputtype: "TextInput",
        }, {
            name: "Height",
            key: "height",
            htmlAttr: "height",
            inputtype: "TextInput",
        }, {
            name: "Muted",
            key: "muted",
            htmlAttr: "muted",
            inputtype: "CheckboxInput",
        }, {
            name: "Loop",
            key: "loop",
            htmlAttr: "loop",
            inputtype: "CheckboxInput",
        }, {
            name: "Autoplay",
            key: "autoplay",
            htmlAttr: "autoplay",
            inputtype: "CheckboxInput",
        }, {
            name: "Plays inline",
            key: "playsinline",
            htmlAttr: "playsinline",
            inputtype: "CheckboxInput",
        }, {
            name: "Controls",
            key: "controls",
            htmlAttr: "controls",
            inputtype: "CheckboxInput",
        }]
    });


    Components.extend("_base", "html/button", {
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
    });

    Components.extend("_base", "_base", {
        properties: [
            {
                name: "Font family",
                key: "font-family",
                htmlAttr: "style",
                sort: incrementSort(),
                col: 6,
                inline: true,
                inputtype: "SelectInput",
                data: {
                    options: [{
                        value: "",
                        text: "extended"
                    }, {
                        value: "Ggoogle ",
                        text: "google"
                    }]
                }
            }]
    });

    Components.extend("_base", "html/header", {
        image: "icons/header.svg",
        nodes: ['header'],
        name: "Header",
        html: "<header>"
    });

    Components.extend("_base", "html/footer", {
        image: "icons/footer.svg",
        nodes: ['footer'],
        name: "Footer",
        html: "<footer>"
    });

    Components.extend("_base", "html/section", {
        image: "icons/section.svg",
        nodes: ['section'],
        name: "Section",
        html: "<section>"
    });

    Components.extend("_base", "html/element", {
        image: "icons/tag.svg",
        nodes: [],
        name: "Element",
        html: "<tagName>"
    });

    Components.extend("_base", "_base", {
        name: "Element",
        properties: [
            {
                name: "Class (Advanced, for web developers)",
                key: "class",
                htmlAttr: "class",
                sort: incrementCommonPropsSort(),
                inline: true,
                col: 12,
                inputtype: "TextareaInput",
                tab: "left-panel-tab-content",
            },
        ]
    });
}
