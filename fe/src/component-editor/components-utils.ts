import { Undo } from "@fe/frmdb-editor/undo";
import { Component, ComponentProperty } from "./component-editor.component";
import { Input, ClassSetInputData, ClassInputData } from "./inputs";

export function setClassFromSet(node: HTMLElement, value: string, input: Input, component: Component) {
    let oldValue = node.getAttribute('class');
    for (let c of this.validValues) {
        if (!c) continue;
        node.classList.remove(c);
    }
    let newClasses = value.indexOf(' ') >= 0 ? value.split(/ +/) : [value];
    for (let newClass of newClasses.filter(c => c)) {
        node.classList.add(newClass);
    }
    Undo.addMutation({
        type: 'attributes',
        target: node,
        attributeName: 'class',
        oldValue,
        newValue: node.getAttribute('class')
    });
    return node;
}

export function setClassSetValidValues(node: HTMLElement) {
    let data: ClassSetInputData = this.data;
    let prefs: string[] = typeof data.prefix === "string" ? [data.prefix] : data.prefix.map(p => p.classFragment);
    let brks = data.isResponsive ? ["", '-md', '-lg'] : [''];
    let frags: {[x: string]: string[]} = {};
    for (let [fragPos, opts] of data.fragments.entries()) {
        for (let [optIdx, opt] of opts.entries()) {
            frags[fragPos + '-' + optIdx] = frags[fragPos + '-' + optIdx] || [];
            frags[fragPos + '-' + optIdx][fragPos] = opt.classFragment;
        }
    }    

    this.validValues = [];
    for (let pref of prefs) {
        for (let brk of brks) {
            for (let frg of Object.values(frags)) {
                this.validValues.push(`${pref}${brk}-${frg.join('-')}`)
            }
        }
    }
}

export function setClassInputValidValues(node: HTMLElement) {
    let data: ClassInputData = this.data;
    let frags: {[x: string]: string[]} = {};
    for (let [fragPos, opts] of data.fragments.entries()) {
        for (let [optIdx, opt] of opts.entries()) {
            frags[fragPos + '-' + optIdx] = frags[fragPos + '-' + optIdx] || [];
            frags[fragPos + '-' + optIdx][fragPos] = opt.classFragment;
        }
    }
    
    let pref = this.data.prefix ? `${this.data.prefix}-` : '';

    this.validValues = [];
    for (let frg of Object.values(frags)) {
        this.validValues.push(`${pref}${frg.join('-')}`)
    }
}

export function classInputPropertyNoLbl(prefix: string, suffix: string, orderIncrement: () => number): ComponentProperty {
    return classInputProperty(`${prefix}-${suffix}`, suffix.replace(/^\w/, (c) => c.toUpperCase()), orderIncrement);
}
export function classInputProperty(className: string, label: string, orderIncrement: () => number): ComponentProperty {
    return {
        name: label,
        key: className,
        sort: orderIncrement(),
        htmlAttr: "class",
        validValues: [className],
        inputtype: "ClassInput",
    };
}
export function responsiveClassInputPropertyNoLbl(prefix: string, suffix: string, orderIncrement: () => number): ComponentProperty[] {
    return responsiveClassInputProperty(prefix, suffix, suffix.replace(/^\w/, (c) => c.toUpperCase()), orderIncrement);
}
export function responsiveClassInputProperty(prefix: string, suffix: string, label: string, orderIncrement: () => number): ComponentProperty[] {
    return [
        classInputProperty(`${prefix}-${suffix}`, 
            `${label} <i class="frmdb-i-mobile-alt"></i>
            <i class="frmdb-i-tablet-alt fa-rotate-90"></i>
            <i class="frmdb-i-laptop"></i>`, orderIncrement),
        classInputProperty(`${prefix}-md-${suffix}`, 
            `${label} <i class="frmdb-i-tablet-alt fa-rotate-90"></i>
            <i class="frmdb-i-laptop"></i>`, orderIncrement),
        classInputProperty(`${prefix}-lg-${suffix}`, 
            `${label} <i class="frmdb-i-laptop"></i>`, orderIncrement),
    ];
}
export function sectionStyleProperty(name: string, orderIncrement: () => number): ComponentProperty {
    return {
        name,
        key: name + '-key',
        inputtype: "SectionInput",
        sort: orderIncrement(),
        tab: 'left-panel-tab-style',
        data: { header: name, expanded: false },
    };
}
