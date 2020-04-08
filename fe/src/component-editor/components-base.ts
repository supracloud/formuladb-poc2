import { Undo } from "@fe/frmdb-editor/undo";
import { Component } from "./component-editor.component";
import { Input } from "./inputs";

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

export function frmdbSetImageSrc(element: HTMLElement, value: string, input: Input, component: Component): HTMLElement {
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

    return element;
}

function grabIcon(element: HTMLElement) {
    if (element.tagName.toLowerCase() === 'frmdb-icon') {
        return element.getAttribute('name');
    }
}

export const ComponentsBase: Partial<Component> = {
    name: "Element",
    properties: [
        {
            name: "Id",
            key: "id",
            htmlAttr: "id",
            inline: true,
            col: 12,
            inputtype: "TextInput",
            tab: "left-panel-tab-content",
        },
        {
            name: "Title",
            key: "title",
            htmlAttr: "title",
            inline: true,
            col: 12,
            inputtype: "TextInput",
            tab: "left-panel-tab-content",
        },
        {
            name: "Image",
            inline: true,
            col: 12,
            key: "src",
            inputtype: "ImageInput",
            tab: "left-panel-tab-content",
            beforeInit: function (node: HTMLElement) {
                let imgSrc = grabImage(node);
                if (!imgSrc) this.hide = true;
                else this.hide = false;
            },
            onChange: frmdbSetImageSrc,
            init: function (node: HTMLElement) {
                return grabImage(node);
            },
        },
        {
            name: "Icon",
            key: "icon-class",
            inputtype: "IconInput",
            tab: "left-panel-tab-content",
            inline: true,
            col: 12,
            beforeInit: function (node: HTMLElement) {
                let iconName = grabIcon(node);
                if (!iconName) this.hide = true;
                else this.hide = false;
            },
            onChange: function (element: HTMLElement, value: string) {
                Undo.addMutation({
                    type: 'attributes',
                    target: element,
                    attributeName: 'name',
                    oldValue: element.getAttribute('name'),
                    newValue: value
                });
                element.setAttribute('name', value);
                return element;
            },
            init: function (node: HTMLElement) {
                return grabIcon(node);
            },
        },
    ]
};
