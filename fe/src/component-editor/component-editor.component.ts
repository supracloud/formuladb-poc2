import * as _ from "lodash";
import { tmpl } from "./tmpl";
import { Undo } from "../frmdb-editor/undo";
import { Input, Inputs, createInput, SectionInput, ImageInput, ParamListInput } from "./inputs";
import { onEvent, emit, onEventChildren } from "@fe/delegated-events";
import { FrmdbModifyPageElement } from "@fe/frmdb-user-events";
import { ComponentsBase } from "./components-base";
import { ComponentsBaseSyleClasses } from "./components-base-style-classes";
import { ComponentsBaseDataBinding } from "./components-base-data-binding";
import { ComponentLink } from "./component-link";
import { ComponentsBaseRawAttributes } from "./components-base-raw-attributes";

export const defaultComponent = "_base";
export const preservePropertySections = true;
export const baseUrl = "/formuladb";

export const ComponentsGroup = {};
export const BlocksGroup = {};

declare var $: null, jQuery: null;

class StyleManager {
	setStyle(element: HTMLElement, styleProp: string, value: string) {
		let propName = styleProp.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
		element.style[propName] = value;
	}
	
	_getCssStyle(element: HTMLElement, styleProp) {
		let value = "";
		let el = element;
		
		if (el.style && el.style.length > 0 && el.style[styleProp]) {
			//check inline
			value = el.style[styleProp];
		} else {
			value = window.getComputedStyle(el, null).getPropertyValue(styleProp);
		}
		
		return value;
	}
	
	getStyle(element: HTMLElement, styleProp) {
		return this._getCssStyle(element, styleProp);
	}
}


export interface Component {
	type?: string;
	name: string;
	nodes?: string[];
	attributes?: { [x: string]: string };
	classes?: string[];
	classesRegex?: string[];
	html?: string;
	image?: string;
	children?: any[];
	dragHtml?: string;
	properties: ComponentProperty[];
	beforeInit?: (el: HTMLElement) => void;
	init?: (el: HTMLElement) => void;
}
export interface ComponentProperty {
	name: string;
	key: string;
	htmlAttr?: string;
	sort?: number;
	tab?: "left-panel-tab-content" | "left-panel-tab-style" | "left-panel-tab-data";
	col?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
	inline?: boolean;
	inputtype: keyof typeof Inputs,
	validValues?: string[];
	data?: any;
	child?: string;//selector
	parent?: string;//selector
	hide?: boolean;
	beforeInit?: (el: HTMLElement) => void;
	afterInit?: (el: HTMLElement) => void;
	init?: (el: HTMLElement) => void;
	onChange?: (el: HTMLElement, value: string, input: Input, component: Component) => HTMLElement;
}

const HTML: string = require('raw-loader!@fe-assets/component-editor/component-editor.component.html').default;

export class ComponentEditorComponent extends HTMLElement {
	
	componentsInitialized: boolean = false;
	
	constructor() {
		super();
		
		this.innerHTML = HTML;
	}

	connectedCallback() {	
		console.log('ComponentEditorComponent connectedCallback');
		onEventChildren(this, "FrmdbModifyPageElement", "*", (event: CustomEvent<FrmdbModifyPageElement>) => {
			if (!this.selectedEl) return;
			let propertyInput = event.target as Input;
			let newSelectedEl = this.onPropertyChange(this.selectedEl, propertyInput, event.detail.value, propertyInput.component, propertyInput.property);
			if (newSelectedEl != this.selectedEl) {
				emit(this, {type: "FrmdbSelectPageElement", el: newSelectedEl});
			}
		})
	}
	
	initializeComponents() {
		this.extend("_base", "_base", ComponentsBase);
		this.extend("_base", "_base", ComponentsBaseSyleClasses);
		this.extend("_base", "_base", ComponentsBaseRawAttributes);
		this.extend("_base", "_base", ComponentsBaseDataBinding);
		this.extend("_base", ComponentLink.type, ComponentLink); 
	}

	selectedEl: HTMLElement;
	setEditedEl(el: HTMLElement) {
		this.selectedEl = el;
		if (!this.componentsInitialized) {
			this.initializeComponents();
			this.componentsInitialized = true;
		}
		let cmp = this.matchNode(this.selectedEl);
		let componentType = cmp ? cmp.type || 'naa' : defaultComponent;
		this.render(componentType, this.selectedEl);
	}
	
	_components: { [type: string]: Component } = {};
	_nodesLookup = {};
	_attributesLookup = {};
	_classesLookup = {};
	_classesRegexLookup = {};
	styleManager = new StyleManager();
	
	get(type) {
		return this._components[type];
	}
	
	add(type: string, data: Component) {
		data.type = type;
		
		this._components[type] = data;
		
		if (data.nodes) {
			for (let i in data.nodes) {
				this._nodesLookup[data.nodes[i]] = data;
			}
		}
		
		if (data.attributes) {
			if (data.attributes.constructor === Array) {
				for (let i in data.attributes) {
					this._attributesLookup[data.attributes[i]] = data;
				}
			} else {
				for (let i in data.attributes) {
					if (typeof this._attributesLookup[i] === 'undefined') {
						this._attributesLookup[i] = {};
					}
					
					if (typeof this._attributesLookup[i][data.attributes[i]] === 'undefined') {
						this._attributesLookup[i][data.attributes[i]] = {};
					}
					
					this._attributesLookup[i][data.attributes[i]] = data;
				}
			}
		}
		
		if (data.classes) {
			for (let i in data.classes) {
				this._classesLookup[data.classes[i]] = data;
			}
		}
		
		if (data.classesRegex) {
			for (let i in data.classesRegex) {
				this._classesRegexLookup[data.classesRegex[i]] = data;
			}
		}
	}
	
	extend(inheritType, type, data: Partial<Component>) {
		
		let inheritData = this._components[inheritType]
		let newData = inheritData ? {
			...data,
			...inheritData,
			properties: (inheritData.properties || []).concat(data.properties||[])
		} : data;
		
		//sort by order
		newData.properties!.sort(function (a, b) {
			if (typeof a.sort === "undefined") a.sort = 0;
			if (typeof b.sort === "undefined") b.sort = 0;
			
			if (a.sort < b.sort)
			return -1;
			if (a.sort > b.sort)
			return 1;
			return 0;
		});
		/*		 
		let output = array.reduce(function(o, cur) {
			
			// Get the index of the key-value pair.
			let occurs = o.reduce(function(n, item, i) {
				return (item.key === cur.key) ? i : n;
			}, -1);
			
			// If the name is found,
			if (occurs >= 0) {
				
				// append the current value to its list of values.
				o[occurs].value = o[occurs].value.concat(cur.value);
				
				// Otherwise,
			} else {
				
				// add the current item to o (but make sure the value is an array).
				let obj = {name: cur.key, value: [cur.value]};
				o = o.concat([obj]);
			}
			
			return o;
		}, newData.properties);		 
		*/
		
		this.add(type, newData as Component);
	}
	
	
	matchNode(node): Component | null {
		let component;
		
		if (!node || !node.tagName) return null;
		
		if (node.attributes && node.attributes.length) {
			//search for attributes
			for (let i in node.attributes) {
				if (node.attributes[i]) {
					let attr = node.attributes[i].name;
					let value = node.attributes[i].value;
					
					if (attr in this._attributesLookup) {
						component = this._attributesLookup[attr];
						
						//currently we check that is not a component by looking at name attribute
						//if we have a collection of objects it means that attribute value must be checked
						if (typeof component["name"] === "undefined") {
							if (value in component) {
								return component[value];
							}
						} else
						return component;
					}
				}
			}
			
			for (let i in node.attributes) {
				let attr = node.attributes[i].name;
				let value = node.attributes[i].value;
				
				//check for node classes
				if (attr == "class") {
					let classes = value.split(" ");
					
					for (let j in classes) {
						if (classes[j] in this._classesLookup)
						return this._classesLookup[classes[j]];
					}
					
					for (let regex in this._classesRegexLookup) {
						let regexObj = new RegExp(regex);
						if (regexObj.exec(value)) {
							return this._classesRegexLookup[regex];
						}
					}
				}
			}
		}
		
		let tagName = node.tagName.toLowerCase();
		if (tagName in this._nodesLookup) return this._nodesLookup[tagName];
		
		if (tagName === "script" || tagName === "iframe") return null;
		
		let clonedNode = node.cloneNode();
		{
			let child = clonedNode.lastElementChild;
			while (child) {
				clonedNode.removeChild(child);
				child = clonedNode.lastElementChild;
			}
		}
		
		return this._components['html/element']
		// return {
		// 	html: clonedNode.outerHTML,
		// 	image:"icons/code.svg",
		// 	name: clonedNode.tagName + (clonedNode.id ? `#${clonedNode.id}` : '') 
		// 		+ (clonedNode.classList.length > 0 ? '.' + Array.from(clonedNode.classList).join('.') : ''),
		// 	type:"html/tag"			
		// };
	}
	
	render(type: string, selectedEl: HTMLElement) {
		let component = this._components[type];
		
		let tabs: { [tabName: string]: HTMLElement } = {};
		
		this.querySelectorAll(".tab-pane").forEach(function (tab: HTMLElement) {
			tab.innerHTML = '';
			let tabName = tab.id;
			tabs[tabName!] = tab;
		});
		
		if (component.beforeInit) component.beforeInit(selectedEl);
		
		let nodeElement = selectedEl;
		
		let contentTab = this.querySelector(`.tab-pane[id="left-panel-tab-content"]`) as HTMLElement
		let tab: HTMLElement | undefined = undefined;
		let section: HTMLElement | undefined = undefined;
		let componentProperties = [DefaultSection].concat(component.properties);
		for (let i in componentProperties) {
			let property = componentProperties[i];
			if (property.tab) tab = this.querySelector(`.tab-pane[id="${property.tab}"]`) as HTMLElement;
			else tab = contentTab;
			let element = nodeElement;
			
			try {
				if (property.beforeInit) property.beforeInit(element);
			} catch (err) {
				console.warn("Error in beforeInit", component, property, err);
			}

			if (property.hide) continue;
			
			if (property.child) element = element.querySelector(property.child) as HTMLElement;
			
			if (property.data) {
				property.data["key"] = property.key;
			} else {
				property.data = { "key": property.key };
			}
			
			let propertyInput = createInput(property.inputtype);
			propertyInput.property = property;
			propertyInput.component = component;
			propertyInput.init(property.data);
			
			if (property.init) {
				propertyInput.setValue(property.init(element));
			} else if (property.htmlAttr) {
				let value;
				if (property.htmlAttr == "style") {
					//value = element.css(property.key);//jquery css returns computed style
					value = this.styleManager.getStyle(element, property.key);//getStyle returns declared style
				} else
				if (property.htmlAttr == "innerHTML") {
					value = element.innerHTML;
				} else {
					value = element.getAttribute(property.htmlAttr);
				}
				
				//if attribute is class check if one of valid values is included as class to set the select
				if (value && property.htmlAttr == "class" && property.validValues) {
					value = value.split(" ").filter((el) => {
						return property.validValues ? property.validValues.indexOf(el) != -1 : true;
					});
				}
				
				propertyInput.setValue(value);
			}
			
			if (property.inputtype == 'SectionInput') {
				tab.appendChild(propertyInput);
				section = (propertyInput as SectionInput).section;
			}
			else {
				let row = document.createElement('div');
				row.innerHTML = tmpl(/*html*/`
					<div class="form-group {% if (typeof col !== 'undefined' && col != false) { %} col-sm-{%=col%} d-inline-block {% } else { %}row{% } %}" data-key="{%=key%}" {% if (typeof group !== 'undefined' && group != null) { %}data-group="{%=group%}" {% } %}>
						{% if (typeof name !== 'undefined' && name != false) { %}<label class="{% if (typeof inline === 'undefined' ) { %}col-sm-4{% } %} control-label" for="input-model">{%=name%}</label>{% } %}
						<div class="{% if (typeof inline === 'undefined') { %}col-sm-{% if (typeof name !== 'undefined' && name != false) { %}8{% } else { %}12{% } } %} input">
						</div>
					</div>	
				`, property);
				row.querySelector('.input')!.append(propertyInput);
				if (!section) {console.warn("no section exists yet", component, property); continue}
				section.append(row.querySelector('.form-group')!);
			}
		}
		
		if (component.init) component.init(selectedEl);
	}
	
	
	onPropertyChange(selectedEl: HTMLElement, input: Input, value: string | number | boolean, component: Component, property: ComponentProperty) {
		let element = selectedEl;
		if (property.child) element = element.querySelector(property.child) as HTMLElement;
		if (property.parent) element = element.closest(property.parent) as HTMLElement;

		if (property.inputtype === "ImageInput") {
			let imgInput = input as ImageInput;
			if (imgInput.frmdbBlob) imgInput.frmdbBlob.el = selectedEl;
		}
		else if (property.inputtype === "ParamListInput") {
			let propertyInput: ParamListInput = input as ParamListInput;
			let attrs = propertyInput.getParameterValues();
			for (let attr of attrs) {
				element.setAttribute(attr.name, attr.value);
			}
		}
		
		if (property.onChange) {
			element = property.onChange(element, '' + value, input, component);
		}/* else */
		if (property.htmlAttr) {
			let oldValue = element.getAttribute(property.htmlAttr);
			
			if (property.htmlAttr == "class" && property.validValues) {
				element.classList.remove(property.validValues.join(" "));
				element.classList.add('' + value);
			}
			else if (property.htmlAttr === "style") {
				this.styleManager.setStyle(element, property.key, '' + value);
			}
			else if (property.htmlAttr === "innerHTML") {
				oldValue = element.innerHTML;
				element.innerHTML = '' + value;
			}
			else {
				element.setAttribute(property.htmlAttr, '' + value);
			}
			
			if (property.htmlAttr === "innerHTML") {
				Undo.addMutation({
					type: 'characterData',
					target: element,
					oldValue: oldValue || '',
					newValue: value + ''
				});
			} else {		
				Undo.addMutation({
					type: 'attributes',
					target: element,
					attributeName: property.htmlAttr,
					oldValue: oldValue,
					newValue: element.getAttribute(property.htmlAttr)
				});
			}
		}
		
		return element;
	};
};

customElements.define('frmdb-component-editor', ComponentEditorComponent);

export class BlocksClass {
	
	_blocks: {};
	
	get(type) {
		return this._blocks[type];
	}
	
	add(type, data) {
		data.type = type;
		this._blocks[type] = data;
	}
};
export const Blocks = new BlocksClass();



let base_sort = 2000;
export function incrementSort() {
	return base_sort++;
}
let commonPropsSort = 1000;
export function incrementCommonPropsSort() {
	return commonPropsSort++;
}

export const DefaultSection: ComponentProperty = {
	tab: "left-panel-tab-content",
	key: "element_header",
	inputtype: "SectionInput",
	name: 'Element',
	data: { header: "General" },
};

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
