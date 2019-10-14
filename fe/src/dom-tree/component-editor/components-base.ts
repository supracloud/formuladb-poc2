import { tmpl } from "./tmpl";
import { Undo } from "./undo";
import { SectionInput } from "./inputs";

export const defaultComponent = "_base";
export const preservePropertySections = true;
export const baseUrl = "/formuladb-editor";

export const ComponentsGroup = {};
export const BlocksGroup = {};


export const StyleManager = {
	setStyle: function (element, styleProp, value) {
		return element.css(styleProp, value);
	},


	_getCssStyle: function (element, styleProp) {
		var value = "";
		var el = element.get(0);

		if (el.style && el.style.length > 0 && el.style[styleProp])//check inline
			value = el.style[styleProp];
		else
			if (el.currentStyle)	//check defined css
				value = el.currentStyle[styleProp];
			else if (window.getComputedStyle) {
				value = window.getComputedStyle(el, null).getPropertyValue(styleProp);
			}

		return value;
	},

	getStyle: function (element, styleProp) {
		return this._getCssStyle(element, styleProp);
	}
}

export const ContentManager = {
	getAttr: function (element, attrName) {
		return element.attr(attrName);
	},

	setAttr: function (element, attrName, value) {
		return element.attr(attrName, value);
	},

	setHtml: function (element, html) {
		return element.html(html);
	},

	getHtml: function (element) {
		return element.html();
	},
}


export const Components = {

	_components: {},

	_nodesLookup: {},

	_attributesLookup: {},

	_classesLookup: {},

	_classesRegexLookup: {},

	componentPropertiesElement: "#right-panel .component-properties",

	componentPropertiesDefaultSection: "content",

	get: function (type) {
		return this._components[type];
	},

	add: function (type, data) {
		data.type = type;

		this._components[type] = data;

		if (data.nodes) {
			for (var i in data.nodes) {
				this._nodesLookup[data.nodes[i]] = data;
			}
		}

		if (data.attributes) {
			if (data.attributes.constructor === Array) {
				for (var i in data.attributes) {
					this._attributesLookup[data.attributes[i]] = data;
				}
			} else {
				for (var i in data.attributes) {
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
			for (var i in data.classes) {
				this._classesLookup[data.classes[i]] = data;
			}
		}

		if (data.classesRegex) {
			for (var i in data.classesRegex) {
				this._classesRegexLookup[data.classesRegex[i]] = data;
			}
		}
	},

	extend: function (inheritType, type, data) {

		var newData = data;

        let inheritData = this._components[inheritType]
		if (inheritData) {
			newData = $.extend(true, {}, inheritData, data);
			newData.properties = $.merge($.merge([], inheritData.properties ? inheritData.properties : []), data.properties ? data.properties : []);
		}

		//sort by order
		newData.properties.sort(function (a, b) {
			if (typeof a.sort === "undefined") a.sort = 0;
			if (typeof b.sort === "undefined") b.sort = 0;

			if (a.sort < b.sort)
				return -1;
			if (a.sort > b.sort)
				return 1;
			return 0;
		});
		/*		 
				var output = array.reduce(function(o, cur) {
		
				  // Get the index of the key-value pair.
				  var occurs = o.reduce(function(n, item, i) {
					return (item.key === cur.key) ? i : n;
				  }, -1);
		
				  // If the name is found,
				  if (occurs >= 0) {
		
					// append the current value to its list of values.
					o[occurs].value = o[occurs].value.concat(cur.value);
		
				  // Otherwise,
				  } else {
		
					// add the current item to o (but make sure the value is an array).
					var obj = {name: cur.key, value: [cur.value]};
					o = o.concat([obj]);
				  }
		
				  return o;
				}, newData.properties);		 
		*/

		this.add(type, newData);
	},


	matchNode: function (node) {
		var component = {};

		if (!node || !node.tagName) return false;

		if (node.attributes && node.attributes.length) {
			//search for attributes
			for (var i in node.attributes) {
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

			for (var i in node.attributes) {
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
	},

	render: function (type, $selectedEl: JQuery) {

		var component = this._components[type];

		var componentsPanel = jQuery(this.componentPropertiesElement);
		var defaultSection = this.componentPropertiesDefaultSection;
		var componentsPanelSections = {};

		jQuery(this.componentPropertiesElement + " .tab-pane").each(function () {
			var sectionName = this.dataset.section;
			componentsPanelSections[sectionName!] = $(this);

		});

		var section = componentsPanelSections[defaultSection].find('.section[data-section="default"]');

		if (!(preservePropertySections && section.length)) {
			componentsPanelSections[defaultSection].html('').append(tmpl("vvveb-input-sectioninput", { key: "default", header: component.name }));
			section = componentsPanelSections[defaultSection].find(".section");
		}

		componentsPanelSections[defaultSection].find('[data-header="default"] span').html(component.name);
		section.html("")

		if (component.beforeInit) component.beforeInit($selectedEl.get(0));

		var element: JQuery;

		var fn = function (component, property) {
			return property.input.on('propertyChange', function (event, value, input) {

				var element = $selectedEl;

				if (property.child) element = element.find(property.child);
				if (property.parent) element = element.parent(property.parent);

				if (property.onChange) {
					element = property.onChange(element, value, input, component);
				}/* else */
				if (property.htmlAttr) {
					let oldValue = element.attr(property.htmlAttr);

					if (property.htmlAttr == "class" && property.validValues) {
						element.removeClass(property.validValues.join(" "));
						element = element.addClass(value);
					}
					else if (property.htmlAttr == "style") {
						element = StyleManager.setStyle(element, property.key, value);
					}
					else if (property.htmlAttr == "innerHTML") {
						element = ContentManager.setHtml(element, value);
					}
					else {
						element = element.attr(property.htmlAttr, value);
					}

					Undo.addMutation({
						type: 'attributes',
						target: element.get(0),
						attributeName: property.htmlAttr,
						oldValue: oldValue,
						newValue: element.attr(property.htmlAttr)
					});
				}

				if (component.onChange) {
					element = component.onChange(element, property, value, input);
				}

				return element;
			});
		};

		var nodeElement = $selectedEl;

		for (var i in component.properties) {
			var property = component.properties[i];
			var element = nodeElement;

			try {
				if (property.beforeInit) property.beforeInit(element.get(0))
			} catch (err) {
				console.warn("Error in beforeInit", component, property, err);
			}

			if (property.child) element = element.find(property.child);

			if (property.data) {
				property.data["key"] = property.key;
			} else {
				property.data = { "key": property.key };
			}

			if (typeof property.group === 'undefined') property.group = null;

			property.input = property.inputtype.init(property.data);

			if (property.init) {
				property.inputtype.setValue(property.init(element.get(0)));
			} else if (property.htmlAttr) {
				if (property.htmlAttr == "style") {
					//value = element.css(property.key);//jquery css returns computed style
					var value = StyleManager.getStyle(element, property.key);//getStyle returns declared style
				} else
					if (property.htmlAttr == "innerHTML") {
						var value = ContentManager.getHtml(element);
					} else {
						value = element.attr(property.htmlAttr);
					}

				//if attribute is class check if one of valid values is included as class to set the select
				if (value && property.htmlAttr == "class" && property.validValues) {
					value = value.split(" ").filter(function (el) {
						return property.validValues.indexOf(el) != -1
					});
				}

				property.inputtype.setValue(value);
			}

			fn(component, property);

			var propertySection = defaultSection;
			if (property.section) {
				propertySection = property.section;
			}


			if (property.inputtype == SectionInput) {
				section = componentsPanelSections[propertySection].find('.section[data-section="' + property.key + '"]');

				if (preservePropertySections && section.length) {
					section.html("");
				} else {
					componentsPanelSections[propertySection].append(property.input);
					section = componentsPanelSections[propertySection].find('.section[data-section="' + property.key + '"]');
				}
			}
			else {
				var row = $(tmpl('vvveb-property', property));
				row.find('.input').append(property.input);
				section.append(row);
			}

			if (property.inputtype.afterInit) {
				property.inputtype.afterInit(property.input);
			}

		}

		if (component.init) component.init($selectedEl.get(0));
	}
};

export const Blocks = {

	_blocks: {},

	get: function (type) {
		return this._blocks[type];
	},

	add: function (type, data) {
		data.type = type;
		this._blocks[type] = data;
	},
};
