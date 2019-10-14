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

https://github.com/givanz/VvvebJs
*/

import { tmpl } from "./tmpl";

type Events = {
	[evName :string]: {
		handler: (ev: JQuery.TriggeredEvent, value: any, node: JQuery) => void,
		selector: string,
	}
}

export class Input extends HTMLInputElement {
	value: string;
	element: JQuery;
	events: Events;

	init(name) {
	}

	onChange(event: JQuery.TriggeredEvent, node: JQuery) {

		if (event.data && event.data.element) {
			event.data.element.trigger('propertyChange', [this.value, this]);
		}
	}

	renderTemplate(name, data) {
		return tmpl("vvveb-input-" + name, data);
	}

	setValue(value) {
		$('input', this.element).val(value);
	}

	render(name, data) {
		this.element = $(this.renderTemplate(name, data));

		//bind events
		if (this.events)
			for (var i in this.events) {
				let ev = i;
				let fun = this.events[i].handler;
				let el = this.events[i].selector;

				this.element.on(ev, el, { element: this.element, input: this }, fun);
			}

		return this.element;
	}
};

export class TextInput extends Input {

	events: Events = {
		blur: { handler: this.onChange, selector: "input"},
	};

	init(data) {
		return this.render("textinput", data);
	}
}


export class TextareaInput extends Input {

	events: Events = {
		keyup: {handler: this.onChange, selector: "textarea"}
	}

	setValue(value) {
		$('textarea', this.element).val(value);
	}
	
	init(data) {
		return this.render("textareainput", data);
	}
}


export class CheckboxInput extends Input {
	checked: boolean;

	onChange(event: JQuery.TriggeredEvent, node: JQuery) {

		if (event.data && event.data.element) {
			event.data.element.trigger('propertyChange', [this.checked, this]);
		}
	}

    events: Events = {
		change: { handler: this.onChange, selector: "input"}
	}

	init(data) {
		return this.render("checkboxinput", data);
	}
}

export class SelectInput extends Input {

	events = {
		change: { handler: this.onChange, selector: "select" }
	}


	setValue(value) {
		$('select', this.element).val(value);
	}
	
	init(data) {
		return this.render("select", data);
	}

}

export class LinkInput extends TextInput {

	events: Events = {
		change: { handler: this.onChange, selector: "input"}
	}

	init(data) {
		return this.render("textinput", data);
	}
}

export class RangeInput extends Input {

	events: Events = {
		change: { handler: this.onChange, selector: "input"}
	}

	init(data) {
		return this.render("rangeinput", data);
	}
}

export class NumberInput extends Input {

	events: Events = {
		change: { handler: this.onChange, selector: "input"}
	};

	init(data) {
		return this.render("numberinput", data);
	}
}

export class CssUnitInput extends Input {

	name: string;
	nb: number = 0;
	unit: string = "px";

	events: Events = {
		change: { handler: this.onChange, selector: "select"},
		keyup: { handler: this.onChange, selector: "input"},
		mouseup: { handler: this.onChange, selector: "input"},
	};

	onChange(event) {

		if (event.data && event.data.element) {
			let input = event.data.input;
			if (this.value != "") input[this.name] = this.value;// this.name = unit or number	
			if (input['unit'] == "") input['unit'] = "px";//if unit is not set use default px

			var value = "";
			if (input.unit == "auto") {
				$(event.data.element).addClass("auto");
				value = input.unit;
			}
			else {
				$(event.data.element).removeClass("auto");
				value = input.number + input.unit;
			}

			event.data.element.trigger('propertyChange', [value, this]);
		}
	}
	
	setValue(value) {
		this.nb = parseInt(value);
		this.unit = value.replace(this.nb, '');

		if (this.unit == "auto") $(this.element).addClass("auto");

		$('input', this.element).val(this.nb);
		$('select', this.element).val(this.unit);
	}
	
	init(data) {
		return this.render("cssunitinput", data);
	}
}

export class ColorInput extends Input {

	//html5 color input only supports setting values as hex colors even if the picker returns only rgb
	rgb2hex(rgb) {

		if (rgb) {
			rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);

			return (rgb && rgb.length === 4) ? "#" +
				("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
				("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
				("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : rgb;
		}
	}

    events: Events = {
		change: { handler: this.onChange, selector: "input"}
	};

	setValue(value) {
		$('input', this.element).val(this.rgb2hex(value));
	}
	
	init(data) {
		return this.render("colorinput", data);
	}
}

export class ImageInput extends Input {
	
	events: Events = {
		change: {handler: this.onChange, selector: "input[type=file]"},
	};

	setValue(value) {

		//don't set blob value to avoid slowing down the page		
		if (value.indexOf("data:image") == -1) {
			$('input[type="text"]', this.element).val(value);
		}
	}


	init(data) {
		return this.render("imageinput", data);
	}
}

export class FileUploadInput extends TextInput {

	events: Events = {
		blur: {handler: this.onChange, selector: "input"},
	};

	init(data) {
		return this.render("textinput", data);
	}
}

export class RadioInput extends Input {

	onChange(event, node) {

		if (event.data && event.data.element) {
			event.data.element.trigger('propertyChange', [this.value, this]);
		}
	}

    events: Events = {
		change: { handler: this.onChange, selector: "input"},
	};

	setValue(value) {
		$('input', this.element).removeAttr('checked');
		if (value)
			$("input[value=" + value + "]", this.element).attr("checked", "true").prop('checked', true);
	}
	
	init(data) {
		return this.render("radioinput", data);
	}
}

export class RadioButtonInput extends RadioInput {

	setValue(value) {
		$('input', this.element).removeAttr('checked');
		$('btn', this.element).removeClass('active');
		if (value && value != "") {
			($("input[value=" + value + "]", this.element).attr("checked", "true").prop('checked', true).parent() as any).button("toggle");
		}
	}

	init(data) {
		return this.render("radiobuttoninput", data);
	}
}

export class ToggleInput extends TextInput {
	checked: boolean;

	onChange(event: JQuery.TriggeredEvent, node: JQuery) {
		if (event.data && event.data.element) {
			event.data.element.trigger('propertyChange', [this.checked ? this.getAttribute("data-value-on") : this.getAttribute("data-value-off"), this]);
		}
	}

    events: Events = {
		change: { handler: this.onChange, selector: "input"},
	};

	init(data) {
		return this.render("toggle", data);
	}
}

export class ValueTextInput extends TextInput {

	events: Events = {
		blur: {handler: this.onChange, selector: "input"},
	};

	init(data) {
		return this.render("textinput", data);
	}
}

export class GridLayoutInput extends TextInput {

	events: Events = {
		blur: {handler: this.onChange, selector: "input"},
	};

	init(data) {
		return this.render("textinput", data);
	}
}

export class ProductsInput extends TextInput {

	events: Events = {
		blur: {handler: this.onChange, selector: "input"},
};

	init(data) {
		return this.render("textinput", data);
	}
}


export class GridInput extends Input {


	events: Events = {
		change: { handler: this.onChange, selector: "select" /*'select'*/},
		click: {handler: this.onChange, selector: "button" /*'select'*/},
	};


	setValue(value) {
		$('select', this.element).val(value);
	}
	
	init(data) {
		return this.render("grid", data);
	}

}

export class TextValueInput extends Input {


	events: Events = {
		blur: {handler: this.onChange, selector: "input"},
		click: {handler: this.onChange, selector:  "button" /*'select'*/},
	};

	init(data) {
		return this.render("textvalue", data);
	}

}

export class ButtonInput extends Input {

	events: Events = {
		click: {handler: this.onChange, selector:  "button" /*'select'*/},
	};


	setValue(value) {
		$('button', this.element).val(value);
	}
	
	init(data) {
		return this.render("button", data);
	}

}

export class SectionInput extends Input {

	events: Events = {
		click: {handler: this.onChange, selector:  "button" /*'select'*/},
	};


	setValue(value) {
		return false;
	}
	
	init(data) {
		return this.render("sectioninput", data);
	}

}

export class ListInput extends Input {

	events: Events = {
		change: { handler: this.onChange, selector: "select"},
	};


	setValue(value) {
		$('select', this.element).val(value);
	}
	
	init(data) {
		return this.render("listinput", data);
	}

}
