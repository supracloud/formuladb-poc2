import * as _ from "lodash";
import { tmpl } from "./tmpl";
import { Undo } from "../frmdb-editor/undo";
import { Input, Inputs } from "./inputs";
import { addComponents } from "./components-bootstrap4";
import { onEvent } from "@fe/delegated-events";
import { FrmdbModifyPageElement } from "@fe/frmdb-user-events";

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

	_getCssStyle(element, styleProp) {
		let value = "";
		let el = element.get(0);

		if (el.style && el.style.length > 0 && el.style[styleProp])//check inline
			value = el.style[styleProp];
		else
			if (el.currentStyle)	//check defined css
				value = el.currentStyle[styleProp];
			else if (window.getComputedStyle) {
				value = window.getComputedStyle(el, null).getPropertyValue(styleProp);
			}

		return value;
	}

	getStyle(element, styleProp) {
		return this._getCssStyle(element, styleProp);
	}
}


interface Component {
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
	onChange?: (el: HTMLElement, property: ComponentProperty, value: string | number | boolean, input: Input) => void;
}
interface ComponentProperty {
	name: string;
	key: string;
	htmlAttr?: string;
	sort?: number;
	section?: string;
	col?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
	inline?: boolean;
	inputtype: keyof typeof Inputs,
	group?: string | null;
	input: Input;
	validValues?: string[];
	data?: any;
	child?: string;//selector
	parent?: string;//selector
	beforeInit?: (el: HTMLElement) => void;
	afterInit?: (el: HTMLElement) => void;
	init?: (el: HTMLElement) => void;
	onChange?: (el: HTMLElement, value: string | number | boolean, input: Input, component: Component) => HTMLElement;
}

const HTML: string = require('raw-loader!@fe-assets/component-editor/element-editor.component.html').default;

export class ElementEditorComponent extends HTMLElement {

	constructor() {
		super();

		this.innerHTML = HTML;
		addComponents(this, baseUrl);
	}

	node: HTMLElement;
	set editedEl(el: HTMLElement) {
		this.node = el;
		let cmp = this.matchNode(this.node);
		let componentType = cmp ? cmp.type : defaultComponent;
		this.render(componentType, this.node);
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

		let newData = data;

		let inheritData = this._components[inheritType]
		_.merge(newData, inheritData);

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


	matchNode(node) {
		let component = {};

		if (!node || !node.tagName) return false;

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

		if (tagName === "script" || tagName === "iframe") return false;

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

		let componentsPanel = this;
		let defaultSection = 'content';
		let componentsPanelSections: { [sectionName: string]: HTMLElement } = {};

		this.querySelectorAll(".tab-pane").forEach(function (tab: HTMLElement) {
			let sectionName = this.dataset.section;
			componentsPanelSections[sectionName!] = tab;

		});

		let section: HTMLElement | undefined = componentsPanelSections[defaultSection].querySelector('.section[data-section="default"]') as HTMLElement;

		if (!(preservePropertySections && !section)) {
			componentsPanelSections[defaultSection].innerHTML = tmpl("vvveb-input-sectioninput", { key: "default", header: component.name });
			section = componentsPanelSections[defaultSection].querySelector(".section") as HTMLElement;
		}

		componentsPanelSections[defaultSection].querySelector('[data-header="default"] span')!.innerHTML = component.name;
		section.innerHTML = "";

		if (component.beforeInit) component.beforeInit(selectedEl);

		let nodeElement = selectedEl;

		for (let i in component.properties) {
			let property = component.properties[i];
			let element = nodeElement;

			try {
				if (property.beforeInit) property.beforeInit(element);
			} catch (err) {
				console.warn("Error in beforeInit", component, property, err);
			}

			if (property.child) element = element.querySelector(property.child) as HTMLElement;

			if (property.data) {
				property.data["key"] = property.key;
			} else {
				property.data = { "key": property.key };
			}

			if (typeof property.group === 'undefined') property.group = null;

			property.input.init(property.data);

			if (property.init) {
				property.input.setValue(property.init(element));
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

				property.input.setValue(value);
			}

			onEvent(property.input, "FrmdbModifyPageElement", "*", (event: {detail: FrmdbModifyPageElement}) => {
				this.onPropertyChange(selectedEl, property.input, event.detail.value, component, property);
			})

			let propertySection = defaultSection;
			if (property.section) {
				propertySection = property.section;
			}


			if (property.inputtype == 'SectionInput') {
				section = componentsPanelSections[propertySection].querySelector('.section[data-section="' + property.key + '"]') as HTMLElement;

				if (preservePropertySections && section) {
					section.innerHTML = '';
				} else {
					componentsPanelSections[propertySection].append(property.input);
					section = componentsPanelSections[propertySection].querySelector('.section[data-section="' + property.key + '"]') as HTMLElement;
				}
			}
			else {
				let row = document.createElement('div');
				row.innerHTML = tmpl('frmdb-property', property);
				row.querySelector('.input')!.append(property.input);
				section.append(row);
			}

			// if (property.inputtype.afterInit) {
			// 	property.inputtype.afterInit(property.input);
			// }

		}

		if (component.init) component.init(selectedEl);
	}


	onPropertyChange(selectedEl: HTMLElement, input: Input, value: string | number | boolean, component: Component, property: ComponentProperty) {
		let element = selectedEl;
		if (property.child) element = element.querySelector(property.child) as HTMLElement;
		if (property.parent) element = element.closest(property.parent) as HTMLElement;

		if (property.onChange) {
			element = property.onChange(element, value, input, component);
		}/* else */
		if (property.htmlAttr) {
			let oldValue = element.getAttribute(property.htmlAttr);

			if (property.htmlAttr == "class" && property.validValues) {
				element.classList.remove(property.validValues.join(" "));
				element.classList.add('' + value);
			}
			else if (property.htmlAttr == "style") {
				this.styleManager.setStyle(element, property.key, '' + value);
			}
			else if (property.htmlAttr == "innerHTML") {
				element.innerHTML = '' + value;
			}
			else {
				element.setAttribute(property.htmlAttr, '' + value);
			}

			Undo.addMutation({
				type: 'attributes',
				target: element,
				attributeName: property.htmlAttr,
				oldValue: oldValue,
				newValue: element.getAttribute(property.htmlAttr)
			});
		}

		if (component.onChange) {
			component.onChange(element, property, value, input);
		}

		return element;

	};
};

customElements.define('frmdb-element-editor', ElementEditorComponent);

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
