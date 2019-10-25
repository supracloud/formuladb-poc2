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
import { emit, onEvent } from "@fe/delegated-events";

declare var $: null;

export abstract class Input extends HTMLElement {
	value: string;

	init(name): void {
	}

	setValue(value) {
		this.querySelector('input')!.value = value;
	}

	render(elemTagName, data) {
		this.innerHTML = tmpl("tmpl-" + elemTagName, data);
		return this;
	}
};

export class TextInput extends Input {
    static elemTagName = "(frmdb-text-input)";
    inputTagName = "frmdb-text-input";

	init(data) {
		this.render(this.inputTagName, data);

		onEvent(this.querySelector('input')!, 'blur', '*', (event: Event) => {
			emit(this, { type: "FrmdbModifyPageElement", value: this.value});
		});
	}
}


export class TextareaInput extends Input {
    static elemTagName = "(frmdb-textarea-input)";
    inputTagName = "frmdb-textarea-input";

	setValue(value) {
		this.querySelector('textarea')!.value = value;
	}

	init(data) {
		this.render(this.inputTagName, data);
		onEvent(this.querySelector('textarea')!, 'keyup', '*', (event: Event) => {
			emit(this, { type: "FrmdbModifyPageElement", value: this.value});
		});
	}
}


export class CheckboxInput extends Input {
    static elemTagName = "(frmdb-checkbox-input)";
    inputTagName = "frmdb-checkbox-input";
	checked: boolean;

	init(data) {
		this.render(this.inputTagName, data);
		onEvent(this.querySelector('input')!, 'change', '*', (event: Event) => {
			emit(this, { type: "FrmdbModifyPageElement", value: this.checked});
		});
	}
}

export class SelectInput extends Input {
    static elemTagName = "(frmdb-select-input)";
    inputTagName = "frmdb-select-input";

	setValue(value) {
		this.querySelector('select')!.value = value;
	}

	init(data) {
		this.render(this.inputTagName, data);
		onEvent(this.querySelector('textarea')!, 'keyup', '*', (event: Event) => {
			emit(this, { type: "FrmdbModifyPageElement", value: this.value});
		});
	}

}

export class LinkInput extends TextInput {
    static elemTagName = "(frmdb-link-input)";
    inputTagName = "frmdb-link-input";

	init(data) {
		this.render(this.inputTagName, data);
		onEvent(this.querySelector('textarea')!, 'keyup', '*', (event: Event) => {
			emit(this, { type: "FrmdbModifyPageElement", value: this.value});
		});
	}
}

export class RangeInput extends Input {
    static elemTagName = "(frmdb-range-input)";
    inputTagName = "frmdb-range-input";

	init(data) {
		this.render(this.inputTagName, data);
		onEvent(this.querySelector('textarea')!, 'keyup', '*', (event: Event) => {
			emit(this, { type: "FrmdbModifyPageElement", value: this.value});
		});
	}
}

export class NumberInput extends Input {
    static elemTagName = "(frmdb-number-input)";
    inputTagName = "frmdb-number-input";

	init(data) {
		this.render(this.inputTagName, data);
		onEvent(this.querySelector('textarea')!, 'keyup', '*', (event: Event) => {
			emit(this, { type: "FrmdbModifyPageElement", value: this.value});
		});
	}
}

export class CssUnitInput extends Input {
    static elemTagName = "(frmdb-css-unit-input)";
    inputTagName = "frmdb-css-unit-input";

	name: string;
	nb: number = 0;
	unit: string = "px";

	events: Events = {
		change: { handler: this.onChange, selector: "select" },
		keyup: { handler: this.onChange, selector: "input" },
		mouseup: { handler: this.onChange, selector: "input" },
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
		return this.render(this.inputTagName, data);
	}
}

export class ColorInput extends Input {
    static elemTagName = "(frmdb-color-input)";
    inputTagName = "frmdb-color-input";

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
		change: { handler: this.onChange, selector: "input" }
	};

	setValue(value) {
		$('input', this.element).val(this.rgb2hex(value));
	}

	init(data) {
		return this.render(this.inputTagName, data);
	}
}

export class ImageInput extends Input {
    static elemTagName = "(frmdb-image-input)";
    inputTagName = "frmdb-image-input";

	events: Events = {
		change: { handler: this.onChange, selector: "input[type=file]" },
	};

	setValue(value) {

		//don't set blob value to avoid slowing down the page		
		if (value.indexOf("data:image") == -1) {
			$('input[type="text"]', this.element).val(value);
		}
	}


	init(data) {
		return this.render(this.inputTagName, data);
	}
}

export class FileUploadInput extends TextInput {
    static elemTagName = "(frmdb-file-upload-input)";
    inputTagName = "frmdb-file-upload-input";

	events: Events = {
		blur: { handler: this.onChange, selector: "input" },
	};

	init(data) {
		return this.render(this.inputTagName, data);
	}
}

export class RadioInput extends Input {
    static elemTagName = "(frmdb-radio-input)";
    inputTagName = "frmdb-radio-input";

	onChange(event, node) {

		if (event.data && event.data.element) {
			event.data.element.trigger('propertyChange', [this.value, this]);
		}
	}

	events: Events = {
		change: { handler: this.onChange, selector: "input" },
	};

	setValue(value) {
		$('input', this.element).removeAttr('checked');
		if (value)
			$("input[value=" + value + "]", this.element).attr("checked", "true").prop('checked', true);
	}

	init(data) {
		return this.render(this.inputTagName, data);
	}
}

export class RadioButtonInput extends RadioInput {
    static elemTagName = "(frmdb-radio-button-input)";
    inputTagName = "frmdb-radio-button-input";

	setValue(value) {
		$('input', this.element).removeAttr('checked');
		$('btn', this.element).removeClass('active');
		if (value && value != "") {
			($("input[value=" + value + "]", this.element).attr("checked", "true").prop('checked', true).parent() as any).button("toggle");
		}
	}

	init(data) {
		return this.render(this.inputTagName, data);
	}
}

export class ToggleInput extends TextInput {
    static elemTagName = "(frmdb-toggle-input)";
    inputTagName = "frmdb-toggle-input";
	checked: boolean;

	onChange(event: Event, node: HTMLElement) {
		if (event.data && event.data.element) {
			event.data.element.trigger('propertyChange', [this.checked ? this.getAttribute("data-value-on") : this.getAttribute("data-value-off"), this]);
		}
	}

	events: Events = {
		change: { handler: this.onChange, selector: "input" },
	};

	init(data) {
		return this.render(this.inputTagName, data);
	}
}

export class ValueTextInput extends TextInput {
    static elemTagName = "(frmdb-value-text-input)";
    inputTagName = "frmdb-value-text-input";

	events: Events = {
		blur: { handler: this.onChange, selector: "input" },
	};

	init(data) {
		return this.render(this.inputTagName, data);
	}
}

export class GridLayoutInput extends TextInput {
    static elemTagName = "(frmdb-grid-layout-input)";
    inputTagName = "frmdb-grid-layout-input";

	events: Events = {
		blur: { handler: this.onChange, selector: "input" },
	};

	init(data) {
		return this.render(this.inputTagName, data);
	}
}

export class ProductsInput extends TextInput {
    static elemTagName = "(frmdb-products-input)";
    inputTagName = "frmdb-products-input";

	events: Events = {
		blur: { handler: this.onChange, selector: "input" },
	};

	init(data) {
		return this.render(this.inputTagName, data);
	}
}


export class GridInput extends Input {
    static elemTagName = "(frmdb-grid-input)";
    inputTagName = "frmdb-grid-input";


	events: Events = {
		change: { handler: this.onChange, selector: "select" /*'select'*/ },
		click: { handler: this.onChange, selector: "button" /*'select'*/ },
	};


	setValue(value) {
		$('select', this.element).val(value);
	}

	init(data) {
		return this.render(this.inputTagName, data);
	}

}

export class TextValueInput extends Input {
    static elemTagName = "(frmdb-text-value-input)";
    inputTagName = "frmdb-text-value-input";


	events: Events = {
		blur: { handler: this.onChange, selector: "input" },
		click: { handler: this.onChange, selector: "button" /*'select'*/ },
	};

	init(data) {
		return this.render(this.inputTagName, data);
	}

}

export class ButtonInput extends Input {
    static elemTagName = "(frmdb-button-input)";
    inputTagName = "frmdb-button-input";

	events: Events = {
		click: { handler: this.onChange, selector: "button" /*'select'*/ },
	};


	setValue(value) {
		$('button', this.element).val(value);
	}

	init(data) {
		return this.render(this.inputTagName, data);
	}

}

export class SectionInput extends Input {
    static elemTagName = "(frmdb-section-input)";
    inputTagName = "frmdb-section-input";

	events: Events = {
		click: { handler: this.onChange, selector: "button" /*'select'*/ },
	};


	setValue(value) {
		return false;
	}

	init(data) {
		return this.render(this.inputTagName, data);
	}

}

export class ListInput extends Input {
    static elemTagName = "(frmdb-list-input)";
    inputTagName = "frmdb-list-input";

	events: Events = {
		change: { handler: this.onChange, selector: "select" },
	};


	setValue(value) {
		$('select', this.element).val(value);
	}

	init(data) {
		return this.render(this.inputTagName, data);
	}

}

export const Inputs = {
	'TextInput': TextInput,
	'TextareaInput': TextareaInput,
	'CheckboxInput': CheckboxInput,
	'SelectInput': SelectInput,
	'LinkInput': LinkInput,
	'RangeInput': RangeInput,
	'NumberInput': NumberInput,
	'CssUnitInput': CssUnitInput,
	'ColorInput': ColorInput,
	'ImageInput': ImageInput,
	'FileUploadInput': FileUploadInput,
	'RadioInput': RadioInput,
	'RadioButtonInput': RadioButtonInput,
	'ToggleInput': ToggleInput,
	'ValueTextInput': ValueTextInput,
	'GridLayoutInput': GridLayoutInput,
	'ProductsInput': ProductsInput,
	'GridInput': GridInput,
	'TextValueInput': TextValueInput,
	'ButtonInput': ButtonInput,
	'SectionInput': SectionInput,
	'ListInput': ListInput,
};

customElements.define("frmdb-text-input", TextInput);
customElements.define("frmdb-textarea-input", TextareaInput);
customElements.define("frmdb-checkbox-input", CheckboxInput);
customElements.define("frmdb-select-input", SelectInput);
customElements.define("frmdb-link-input", LinkInput);
customElements.define("frmdb-range-input", RangeInput);
customElements.define("frmdb-number-input", NumberInput);
customElements.define("frmdb-css-unit-input", CssUnitInput);
customElements.define("frmdb-color-input", ColorInput);
customElements.define("frmdb-image-input", ImageInput);
customElements.define("frmdb-file-upload-input", FileUploadInput);
customElements.define("frmdb-radio-input", RadioInput);
customElements.define("frmdb-radio-button-input", RadioButtonInput);
customElements.define("frmdb-toggle-input", ToggleInput);
customElements.define("frmdb-value-text-input", ValueTextInput);
customElements.define("frmdb-grid-layout-input", GridLayoutInput);
customElements.define("frmdb-products-input", ProductsInput);
customElements.define("frmdb-grid-input", GridInput);
customElements.define("frmdb-text-value-input", TextValueInput);
customElements.define("frmdb-button-input", ButtonInput);
customElements.define("frmdb-section-input", SectionInput);
customElements.define("frmdb-list-input", ListInput);

export function createInput(inputtype: keyof typeof Inputs): Input {
	return document.createElement(Inputs[inputtype].elemTagName) as Input;
}
