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
import { elvis } from "@core/elvis";

declare var $: null;

export abstract class Input extends HTMLElement {
	abstract inputTagName: string;
	value: string;

	init(data): void {
		this.render(this.inputTagName, data);
		onEvent(this, 'change', 'input,textarea,select', (event: Event) => {
			emit(this, { type: "FrmdbModifyPageElement", value: this.value});
		});
		onEvent(this, 'click', 'button', (event: Event) => {
			emit(this, { type: "FrmdbModifyPageElement", value: this.value});
		});
	}

	setValue(value) {
		elvis((this.querySelector('input,select,textarea') as HTMLInputElement 
			| HTMLSelectElement | HTMLTextAreaElement)).value = value;
	}

	render(html, data) {
		this.innerHTML = tmpl(html, data);
		return this;
	}
};

export class TextInput extends Input {
    static elemTagName = "frmdb-text-input";
    inputTagName = "frmdb-text-input";

	init(data) {
		this.render(/*html*/`
			<div>
				<input name="{%=key%}" type="text" 
				{% if (typeof disabled !== 'undefined' && disabled) { %}disabled{% } %} 
				{% if (typeof placeholder !== 'undefined' && placeholder != false) { %}placeholder="{%=placeholder%}"{% } %} 
				class="form-control"/>
			</div>
		`, data);

		onEvent(this.querySelector('input')!, 'blur', '*', (event: Event) => {
			emit(this, { type: "FrmdbModifyPageElement", value: this.value});
		});
	}
}


export class TextareaInput extends Input {
    static elemTagName = "frmdb-textarea-input";
    inputTagName = "frmdb-textarea-input";

	setValue(value) {
		this.querySelector('textarea')!.value = value;
	}

	init(data) {
		this.render(/*html*/`
			<div>
				<textarea name="{%=key%}" rows="3" class="form-control"/>
			</div>
		`, data);
		onEvent(this.querySelector('textarea')!, 'keyup', '*', (event: Event) => {
			emit(this, { type: "FrmdbModifyPageElement", value: this.value});
		});
	}
}


export class CheckboxInput extends Input {
    static elemTagName = "frmdb-checkbox-input";
    inputTagName = "frmdb-checkbox-input";
	checked: boolean;

	init(data) {
		this.render(/*html*/`
			<div class="custom-control custom-checkbox">
				<input name="{%=key%}" class="custom-control-input" type="checkbox" id="{%=key%}_check">
				<label class="custom-control-label" for="{%=key%}_check">{% if (typeof text !== 'undefined') { %} {%=text%} {% } %}</label>
			</div>
		`, data);
		onEvent(this.querySelector('input')!, 'change', '*', (event: Event) => {
			emit(this, { type: "FrmdbModifyPageElement", value: this.checked});
		});
	}
}

export class SelectInput extends Input {
    static elemTagName = "frmdb-select-input";
    inputTagName = "frmdb-select-input";

	setValue(value) {
		this.querySelector('select')!.value = value;
	}
	init(data) {
		this.render(/*html*/`
			<div>
				<select class="form-control custom-select">
					{% for ( var i = 0; i < options.length; i++ ) { %}
					<option value="{%=options[i].value%}">{%=options[i].text%}</option>
					{% } %}
				</select>
			</div>
		`, data);
	}
}

export class LinkInput extends TextInput {
    static elemTagName = "frmdb-link-input";
    inputTagName = "frmdb-link-input";

	init(data) {
		super.init(data);
		onEvent(this.querySelector('textarea')!, 'keyup', '*', (event: Event) => {
			emit(this, { type: "FrmdbModifyPageElement", value: this.value});
		});
	}
}

export class RangeInput extends Input {
    static elemTagName = "frmdb-range-input";
    inputTagName = "frmdb-range-input";

	init(data) {
		this.render(/*html*/`
			<div>
				<input name="{%=key%}" type="range" min="{%=min%}" max="{%=max%}" step="{%=step%}" class="form-control"/>
			</div>
		`, data);
		onEvent(this.querySelector('textarea')!, 'keyup', '*', (event: Event) => {
			emit(this, { type: "FrmdbModifyPageElement", value: this.value});
		});
	}
}

export class NumberInput extends Input {
    static elemTagName = "frmdb-number-input";
    inputTagName = "frmdb-number-input";

	init(data) {
		this.render(/*html*/`
			<div>
				<input name="{%=key%}" type="number" value="{%=value%}" 
					{% if (typeof min !== 'undefined' && min != false) { %}min="{%=min%}"{% } %} 
					{% if (typeof max !== 'undefined' && max != false) { %}max="{%=max%}"{% } %} 
					{% if (typeof step !== 'undefined' && step != false) { %}step="{%=step%}"{% } %} 
					{% if (typeof disabled !== 'undefined' && disabled) { %}disabled{% } %} 
					{% if (typeof placeholder !== 'undefined' && placeholder != false) { %}placeholder="{%=placeholder%}"{% } %} 
				class="form-control"/>
			</div>
		`, data);
		onEvent(this.querySelector('textarea')!, 'keyup', '*', (event: Event) => {
			emit(this, { type: "FrmdbModifyPageElement", value: this.value});
		});
	}
}

export class CssUnitInput extends Input {
    static elemTagName = "frmdb-css-unit-input";
    inputTagName = "frmdb-css-unit-input";

	name: string;
	nb: number = 0;
	unit: string = "px";


	setValue(value) {
		this.nb = parseInt(value);
		this.unit = value.replace(this.nb, '');

		// if (this.unit == "auto") $(this.element).addClass("auto");

		this.querySelector('input')!.value = '' + this.nb;
		this.querySelector('select')!.value = '' + this.unit;
	}

	init(data) {
		this.render(/*html*/`
			<div class="input-group" id="cssunit-{%=key%}">
				<input name="number" type="number"  {% if (typeof value !== 'undefined' && value != false) { %} value="{%=value%}" {% } %} 
					{% if (typeof min !== 'undefined' && min != false) { %}min="{%=min%}"{% } %} 
					{% if (typeof max !== 'undefined' && max != false) { %}max="{%=max%}"{% } %} 
					{% if (typeof step !== 'undefined' && step != false) { %}step="{%=step%}"{% } %} 
				class="form-control"/>
				<div class="input-group-append">
				<select class="form-control custom-select small-arrow" name="unit">
					<option value="em">em</option>
					<option value="px">px</option>
					<option value="%">%</option>
					<option value="rem">rem</option>
					<option value="auto">auto</option>
				</select>
				</div>
			</div>
		`, data);
		
		onEvent(this, ['change','keyup',/*'mouseup'*/], 'select, input', (event: Event) => {
			let el: HTMLInputElement | HTMLSelectElement = event.target! as HTMLInputElement | HTMLSelectElement;
			let input = this;
			if (el.value != "") input[el.name] = el.value;// this.name = unit or number	
			if (input['unit'] == "") input['unit'] = "px";//if unit is not set use default px

			var value = "";
			if (input.unit == "auto") {
				this.classList.add("auto");
				value = input.unit;
			} else {
				this.classList.remove("auto");
				value = input.nb + input.unit;
			}

			emit(this, { type: "FrmdbModifyPageElement", value });
		});

	}
}

export class ColorInput extends Input {
    static elemTagName = "frmdb-color-input";
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

	setValue(value) {
		this.querySelector('input')!.value = this.rgb2hex(value);
	}

	init(data) {
		this.render(/*html*/`
			<div>
				<input name="{%=key%}" type="color" {% if (typeof value !== 'undefined' && value != false) { %} value="{%=value%}" {% } %}  pattern="#[a-f0-9]{6}" class="form-control"/>
			</div>
		`, data);
	}
}

export class ImageInput extends Input {
    static elemTagName = "frmdb-image-input";
    inputTagName = "frmdb-image-input";

	setValue(value) {

		//don't set blob value to avoid slowing down the page		
		if (value.indexOf("data:image") == -1) {
			(this.querySelector('input[type="text"]') as HTMLInputElement).value = value;
		}
	}

	init(data) {
		return this.render(/*html*/`
			<div>
				<input name="{%=key%}" type="text" class="form-control"/>
				<input name="file" type="file" class="form-control"/>
			</div>		
		`, data);
	}
}

export class FileUploadInput extends TextInput {
    static elemTagName = "frmdb-file-upload-input";
    inputTagName = "frmdb-file-upload-input";
}

export class RadioInput extends Input {
    static elemTagName = "frmdb-radio-input";
    inputTagName = "frmdb-radio-input";

	setValue(value) {
		this.querySelectorAll('input').forEach(i => i.removeAttribute('checked'));
		if (value) {
			let i = this.querySelector("input[value=" + value + "]") as HTMLInputElement;
			if (i) {
				i.setAttribute("checked", "true");
				i.checked = true;
			}
		}
	}

	init(data) {
		this.render(/*html*/`
			<div>

				{% for ( var i = 0; i < options.length; i++ ) { %}

				<label class="custom-control custom-radio  {% if (typeof inline !== 'undefined' && inline == true) { %}custom-control-inline{% } %}"  title="{%=options[i].title%}">
				<input name="{%=key%}" class="custom-control-input" type="radio" value="{%=options[i].value%}" id="{%=key%}{%=i%}" {%if (options[i].checked) { %}checked="{%=options[i].checked%}"{% } %}>
				<label class="custom-control-label" for="{%=key%}{%=i%}">{%=options[i].text%}</label>
				</label>

				{% } %}

			</div>		
		`, data);
	}
}

export class RadioButtonInput extends RadioInput {
    static elemTagName = "frmdb-radio-button-input";
    inputTagName = "frmdb-radio-button-input";

	setValue(value) {
		this.querySelector('input')!.removeAttribute('checked');
		this.querySelector('.btn')!.classList.remove('active');
		if (value && value != "") {
			let i = this.querySelector("input[value=" + value + "]")as HTMLInputElement;
			i.setAttribute("checked", "true");
			i.checked = true;
			// i.parentElement.button("toggle");
		}
	}

	init(data) {
		return this.render(/*html*/`
			<div class="btn-group btn-group-toggle  {%if (extraclass) { %}{%=extraclass%}{% } %} clearfix" data-toggle="buttons">

				{% for ( var i = 0; i < options.length; i++ ) { %}

				<label class="btn btn-outline-primary  {%if (options[i].checked) { %}active{% } %}  {%if (options[i].extraclass) { %}{%=options[i].extraclass%}{% } %}" for="{%=key%}{%=i%} " title="{%=options[i].title%}">
				<input name="{%=key%}" class="custom-control-input" type="radio" value="{%=options[i].value%}" id="{%=key%}{%=i%}" {%if (options[i].checked) { %}checked="{%=options[i].checked%}"{% } %}>
				{%if (options[i].icon) { %}<i class="{%=options[i].icon%}"></i>{% } %}
				{%=options[i].text%}
				</label>

				{% } %}
						
			</div>
		`, data);
	}
}

export class ToggleInput extends TextInput {
    static elemTagName = "frmdb-toggle-input";
    inputTagName = "frmdb-toggle-input";
	checked: boolean;

	init(data) {
		this.render(/*html*/`
			<div class="toggle">
				<input type="checkbox" name="{%=key%}" value="{%=on%}" data-value-off="{%=off%}" data-value-on="{%=on%}" class="toggle-checkbox" id="{%=key%}">
				<label class="toggle-label" for="{%=key%}">
					<span class="toggle-inner"></span>
					<span class="toggle-switch"></span>
				</label>
			</div>
		`, data);
		onEvent(this, 'change', 'input,textarea,select', (event: Event) => {
			emit(this, { type: "FrmdbModifyPageElement", value: 
				this.checked ? this.getAttribute("data-value-on")! : this.getAttribute("data-value-off")!
			});
		});
	}
}

export class ValueTextInput extends TextInput {
    static elemTagName = "frmdb-value-text-input";
	inputTagName = "frmdb-value-text-input";
	
	init(data) {
		this.render(/*html*/`
			<div class="row">
				<div class="col-6 mb-1">
					<label>Value</label>
					<input name="value" type="text" value="{%=value%}" class="form-control"/>
				</div>

				<div class="col-6 mb-1">
					<label>Text</label>
					<input name="text" type="text" value="{%=text%}" class="form-control"/>
				</div>

				{% if (typeof hide_remove === 'undefined') { %}
				<div class="col-12">
				
					<button class="btn btn-sm btn-outline-light text-danger">
						<i class="la la-trash la-lg"></i> Remove
					</button>
					
				</div>
				{% } %}

			</div>
		`, data);
	}
}


export class ProductsInput extends TextInput {
    static elemTagName = "frmdb-products-input";
    inputTagName = "frmdb-products-input";
}

export class GridInput extends Input {
    static elemTagName = "frmdb-grid-input";
    inputTagName = "frmdb-grid-input";

	setValue(value) {
		this.querySelector('select')!.value = value;
	}

	init(data) {
		this.render(/*html*/`
			<div class="row">
				<div class="mb-1 col-12">
				
					<label>Flexbox</label>
					<select class="form-control custom-select" name="col">
						
						<option value="">None</option>
						{% for ( var i = 1; i <= 12; i++ ) { %}
						<option value="{%=i%}" {% if ((typeof col !== 'undefined') && col == i) { %} selected {% } %}>{%=i%}</option>
						{% } %}
						
					</select>
					<br/>
				</div>

				<div class="col-6">
					<label>Extra small</label>
					<select class="form-control custom-select" name="col-xs">
						
						<option value="">None</option>
						{% for ( var i = 1; i <= 12; i++ ) { %}
						<option value="{%=i%}" {% if ((typeof col_xs !== 'undefined') && col_xs == i) { %} selected {% } %}>{%=i%}</option>
						{% } %}
						
					</select>
					<br/>
				</div>
				
				<div class="col-6">
					<label>Small</label>
					<select class="form-control custom-select" name="col-sm">
						
						<option value="">None</option>
						{% for ( var i = 1; i <= 12; i++ ) { %}
						<option value="{%=i%}" {% if ((typeof col_sm !== 'undefined') && col_sm == i) { %} selected {% } %}>{%=i%}</option>
						{% } %}
						
					</select>
					<br/>
				</div>
				
				<div class="col-6">
					<label>Medium</label>
					<select class="form-control custom-select" name="col-md">
						
						<option value="">None</option>
						{% for ( var i = 1; i <= 12; i++ ) { %}
						<option value="{%=i%}" {% if ((typeof col_md !== 'undefined') && col_md == i) { %} selected {% } %}>{%=i%}</option>
						{% } %}
						
					</select>
					<br/>
				</div>
				
				<div class="col-6 mb-1">
					<label>Large</label>
					<select class="form-control custom-select" name="col-lg">
						
						<option value="">None</option>
						{% for ( var i = 1; i <= 12; i++ ) { %}
						<option value="{%=i%}" {% if ((typeof col_lg !== 'undefined') && col_lg == i) { %} selected {% } %}>{%=i%}</option>
						{% } %}
						
					</select>
					<br/>
				</div>
				
				{% if (typeof hide_remove === 'undefined') { %}
				<div class="col-12">
				
					<button class="btn btn-sm btn-outline-light text-danger">
						<i class="la la-trash la-lg"></i> Remove
					</button>
					
				</div>
				{% } %}
				
			</div>		
		`, data)
	}
}

export class TextValueInput extends Input {
    static elemTagName = "frmdb-text-value-input";
    inputTagName = "frmdb-text-value-input";

}

export class ButtonInput extends Input {
    static elemTagName = "frmdb-button-input";
    inputTagName = "frmdb-button-input";

	setValue(value) {
		this.querySelector('button')!.value = value;
	}

	init(data) {
		this.render(/*html*/`
			<div>
				<button class="btn btn-sm btn-primary">
					<i class="la  {% if (typeof icon !== 'undefined') { %} {%=icon%} {% } else { %} la-plus {% } %} la-lg"></i> {%=text%}
				</button>
			</div>		
		`, data);
	}

}

export class SectionInput extends Input {
    static elemTagName = "frmdb-section-input";
    inputTagName = "frmdb-section-input";

	setValue(value) {
		return false;
	}

	get section(): HTMLElement {
		return this.querySelector('[data-section]') as HTMLElement;
	}

	init(data) {
		this.render(/*html*/`
			<label class="header" data-header="{%=key%}" for="header_{%=key%}"><span>&ensp;{%=header%}</span> <div class="header-arrow"></div></label> 
			<input class="header_check" type="checkbox" {% if (typeof expanded !== 'undefined' && expanded == false) { %} {% } else { %}checked="true"{% } %} id="header_{%=key%}"> 
			<div class="section" data-section="{%=key%}"></div>		
		`, data);
	}
}

export class ListInput extends Input {
    static elemTagName = "frmdb-list-input";
	inputTagName = "frmdb-list-input";
	
	init(data) {
		this.render(/*html*/`
			<div class="row">

				{% for ( var i = 0; i < options.length; i++ ) { %}
				<div class="col-6">
					<div class="input-group">
						<input name="{%=key%}_{%=i%}" type="text" class="form-control" value="{%=options[i].text%}"/>
						<div class="input-group-append">
							<button class="input-group-text btn btn-sm btn-danger">
								<i class="la la-trash la-lg"></i>
							</button>
						</div>
					</div>
					<br/>
				</div>
				{% } %}


				{% if (typeof hide_remove === 'undefined') { %}
				<div class="col-12">
				
					<button class="btn btn-sm btn-outline-primary">
						<i class="la la-trash la-lg"></i> Add new
					</button>
					
				</div>
				{% } %}
					
			</div>
		`, data);
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
customElements.define("frmdb-products-input", ProductsInput);
customElements.define("frmdb-grid-input", GridInput);
customElements.define("frmdb-text-value-input", TextValueInput);
customElements.define("frmdb-button-input", ButtonInput);
customElements.define("frmdb-section-input", SectionInput);
customElements.define("frmdb-list-input", ListInput);

export function createInput(inputtype: keyof typeof Inputs): Input {
	return document.createElement(Inputs[inputtype].elemTagName) as Input;
}
