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
import { BLOBS, FrmdbBlob } from "@fe/frmdb-editor/blobs";
import { ComponentProperty, Component } from "./component-editor.component";

declare var $: null;

export abstract class Input extends HTMLElement {
	abstract inputTagName: string;
	value: string;
	property: ComponentProperty;
	component: Component;

	init(data): void {
		this.render(this.inputTagName, data);
		onEvent(this, 'change', 'input,textarea,select', (event: Event) => {
			emit(this, { type: "FrmdbModifyPageElement", value: (event.target as any).value });
		});
		onEvent(this, 'click', 'button', (event: Event) => {
			emit(this, { type: "FrmdbModifyPageElement", value: (event.target as any).value });
		});
	}

	emitChange() {
		let input = this.querySelector('input,textarea,select');
		if (input) {
			input.dispatchEvent(new Event('change', {bubbles: true}));
		}
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
		super.init(data);
		this.render(/*html*/`
			<div>
				<input name="{%=key%}" type="text" 
				{% if (typeof disabled !== 'undefined' && disabled) { %}disabled{% } %} 
				{% if (typeof placeholder !== 'undefined' && placeholder != false) { %}placeholder="{%=placeholder%}"{% } %} 
				class="form-control"/>
			</div>
		`, data);
	}
}


export class TextareaInput extends Input {
	static elemTagName = "frmdb-textarea-input";
	inputTagName = "frmdb-textarea-input";

	setValue(value) {
		this.querySelector('textarea')!.value = value;
	}

	init(data) {
		super.init(data);
		this.render(/*html*/`
			<div>
				<textarea name="{%=key%}" rows="3" class="form-control"/>
			</div>
		`, data);
	}
}


export class CheckboxInput extends Input {
	static elemTagName = "frmdb-checkbox-input";
	inputTagName = "frmdb-checkbox-input";
	checked: boolean;

	init(data) {
		super.init(data);
		this.render(/*html*/`
			<div class="custom-control custom-checkbox">
				<input name="{%=key%}" class="custom-control-input" type="checkbox" id="{%=key%}_check">
				<label class="custom-control-label" for="{%=key%}_check">{% if (typeof text !== 'undefined') { %} {%=text%} {% } %}</label>
			</div>
		`, data);
		onEvent(this.querySelector('input')!, 'change', '*', (event: Event) => {
			emit(this, { type: "FrmdbModifyPageElement", value: this.checked });
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
		super.init(data);
		this.render(/*html*/`
			<div>
				<select class="form-control ">
					{% for ( var i = 0; i < options.length; i++ ) { %}
					<option value="{%=options[i].value%}">{%=options[i].text%}</option>
					{% } %}
				</select>
			</div>
		`, data);
	}
}


export class ResponsiveClassSelectInput extends Input {
	static elemTagName = "frmdb-responsive-class-select-input";
	inputTagName = "frmdb-responsive-class-select-input";
	state: {
		values: {pre: string, brk: string, post: string}[],
		isResponsive: boolean,
		data: {pre: string[], post: string[]},
	} = {values: [], isResponsive: false, data: {pre: [], post: []}};

	setValue(value: string) {
		this.state.values = value.split(/ +/).map(v => {
			let pre, brk, post;
			let className = v;
			for (let x of this.state.data.pre) {
				if (className.indexOf(x) === 0) {
					pre = x;
					className = className.replace(`${x}-`, '');
					break;
				}
			}
			for (let x of ['', 'sm', 'md', 'lg']) {
				if (className.indexOf(x) === 0) {
					brk = x;
					className = className.replace(`${x}-`, '');
					break;
				}
			}
			for (let x of this.state.data.post) {
				if (className.indexOf(x) === 0) {
					post = x;
					className = className.replace(`${x}`, '');
					break;
				}
			}
			if (className != '') console.warn(`Was not able to match className ${v} to ${JSON.stringify(this.state.data)}`);
			return {pre, brk, post};
		});
		this.renderHtml();
	}

	renderHtml() {
		this.innerHTML = tmpl(/*html*/`
			<input type="checkbox" class="toggle-checkbox" data-id="isResponsive">
			{% for ( let brk of ["all", "sm", "md", "lg"]) { %}
			<div data-id="{%=brk}" class="d-flex {%= isResponsive ? ('all' == brk ? 'd-none' : '') : ('all' != brk ? 'd-none' : '') %} flex-nowrap">
				{% if (brk === 'all') { %}
				{% } else if (brk === 'sm') { %} 
				<i class="fa fa-mobile-alt"></i>
				{% } else if (brk === 'md') { %} 
				<i class="fa fa-tablet-alt fa-rotate-90"></i>
				{% } else if (brk === 'lg') { %} 
				<i class="fa fa-laptop"></i>
				{% } %} 
				<select data-id="all-pre" class="form-control">
					{% for ( var i = 0; i < options.length; i++ ) { %}
					<option value="{%=data.pre_options[i].value%}">{%=options[i].text%}</option>
					{% } %}
				</select>
				{% if (brk === 'all') { %}
				<span>-</span>
				{% } else if (brk === 'sm') { %} 
				<span>-sm-</span>
				{% } else if (brk === 'md') { %} 
				<span>-md-</span>
				{% } else if (brk === 'lg') { %} 
				<span>-lg-</span>
				{% } %} 
				<select data-id="all-post" class="form-control">
					{% for ( var i = 0; i < options.length; i++ ) { %}
					<option value="{%=data.post_options[i].value%}">{%=options[i].text%}</option>
					{% } %}
				</select>
			</div>
		</select>

		`, this.state);
	}
	init(data) {
		this.state.data = data;
		onEvent(this, 'change', 'input,textarea,select', (event: Event) => {
			emit(this, { type: "FrmdbModifyPageElement", value: (event.target as any).value });
		});

		this.renderHtml();
	}
}

export class LinkInput extends TextInput {
	static elemTagName = "frmdb-link-input";
	inputTagName = "frmdb-link-input";

	init(data) {
		super.init(data);
	}
}

export class RangeInput extends Input {
	static elemTagName = "frmdb-range-input";
	inputTagName = "frmdb-range-input";

	init(data) {
		super.init(data);
		this.render(/*html*/`
			<div>
				<input name="{%=key%}" type="range" min="{%=min%}" max="{%=max%}" step="{%=step%}" class="form-control"/>
			</div>
		`, data);
	}
}

export class NumberInput extends Input {
	static elemTagName = "frmdb-number-input";
	inputTagName = "frmdb-number-input";

	init(data) {
		super.init(data);
		this.render(/*html*/`
			<input name="{%=key%}" type="number" 
				{% if (typeof value !== 'undefined') { %} value="{%=value%}" {% } %} 
				{% if (typeof min !== 'undefined' && min != false) { %}min="{%=min%}"{% } %} 
				{% if (typeof max !== 'undefined' && max != false) { %}max="{%=max%}"{% } %} 
				{% if (typeof step !== 'undefined' && step != false) { %}step="{%=step%}"{% } %} 
				{% if (typeof disabled !== 'undefined' && disabled) { %}disabled{% } %} 
				{% if (typeof placeholder !== 'undefined' && placeholder != false) { %}placeholder="{%=placeholder%}"{% } %} 
			class="form-control"/>
		`, data);
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
		super.init(data);
		this.render(/*html*/`
			<div class="input-group" id="cssunit-{%=key%}">
				<input name="number" type="number"  {% if (typeof value !== 'undefined' && value != false) { %} value="{%=value%}" {% } %} 
					{% if (typeof min !== 'undefined' && min != false) { %}min="{%=min%}"{% } %} 
					{% if (typeof max !== 'undefined' && max != false) { %}max="{%=max%}"{% } %} 
					{% if (typeof step !== 'undefined' && step != false) { %}step="{%=step%}"{% } %} 
				class="form-control"/>
				<div class="input-group-append">
				<select class="form-control  small-arrow" name="unit">
					<option value="em">em</option>
					<option value="px">px</option>
					<option value="%">%</option>
					<option value="rem">rem</option>
					<option value="auto">auto</option>
				</select>
				</div>
			</div>
		`, data);

		onEvent(this, ['change', 'keyup',/*'mouseup'*/], 'select, input', (event: Event) => {
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
		super.init(data);
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
	public frmdbBlob?: FrmdbBlob;

	setValue(value: string) {
		if (value.indexOf('blob:') !== 0 && this.frmdbBlob) {
			BLOBS.removeBlob(this.frmdbBlob);//if we choose a regular URL, remove the cached blob
		}

		(this.querySelector('input[type="text"]') as HTMLInputElement).value = value;
		(this.querySelector('img') as HTMLImageElement).src = value;
		let lbl = this.querySelector('label') as HTMLLabelElement;
		lbl.textContent = value;
		lbl.title = value;
	}

	emitChange() {
		let input = this.querySelector('input[type="text"]');
		if (input) {
			input.dispatchEvent(new Event('change', {bubbles: true}));
		}
	}

	setBlob(fileName: string, blob: Blob): FrmdbBlob {
		if (this.frmdbBlob) {
			BLOBS.removeBlob(this.frmdbBlob);
		}

		this.frmdbBlob = BLOBS.addImgBlob(fileName, blob);
		this.setValue(this.frmdbBlob.url);
		this.emitChange();
		return this.frmdbBlob;
	}

	init(data) {
		onEvent(this, 'change', 'input[type="text"]', (event: Event) => {
			emit(this, { type: "FrmdbModifyPageElement", value: (event.target as any).value });
		});
		onEvent(this, 'change', 'input[type="file"]', (event: Event) => {
			let fileInput: HTMLInputElement = event?.target as HTMLInputElement;
            if (fileInput.files && fileInput.files[0]) {
				let f = fileInput.files[0];
				this.setBlob(f.name, f);
            }
		});

		return this.render(/*html*/`
			<div>
				<a id="frmdb-chose-image-button" href="javascript:void(0)">
					<img style="width: 100%; border-radius: 5px; border: 1px solid grey;" />
				</a>
				<input hidden name="{%=key%}" type="text" class="form-control"/>
				<div class="custom-file col">
					<label class="custom-file-label" for="customFile">Choose file</label>
					<input type="file" class="custom-file-input">
				</div>
			</div>		
		`, data);
	}
}

export class IconInput extends Input {
	static elemTagName = "frmdb-icon-input";
	inputTagName = "frmdb-icon-input";

	setValue(value) {
		(this.querySelector('input[type="text"]') as HTMLInputElement).value = value;
		(this.querySelector('frmdb-icon') as HTMLElement).setAttribute('name', value);
	}

	init(data) {
		super.init(data);
		return this.render(/*html*/`
			<div class="d-flex flex-column align-items-center">
				<a id="frmdb-chose-icon-button" href="javascript:void(0)">
					<h1><frmdb-icon></frmdb-icon></h1>
				</a>
				<input disabled name="{%=key%}" type="text" class="form-control ml-2"/>
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
		super.init(data);
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
			let i = this.querySelector("input[value=" + value + "]") as HTMLInputElement;
			if (i) {
				i.setAttribute("checked", "true");
				i.checked = true;
				// i.parentElement.button("toggle");
			}
		}
	}

	init(data) {
		super.init(data);
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
		super.init(data);
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
			emit(this, {
				type: "FrmdbModifyPageElement", value:
					this.checked ? this.getAttribute("data-value-on")! : this.getAttribute("data-value-off")!
			});
		});
	}
}

export class ValueTextInput extends TextInput {
	static elemTagName = "frmdb-value-text-input";
	inputTagName = "frmdb-value-text-input";

	init(data) {
		super.init(data);
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
						<i class="frmdb-i-fa-trash frmdb-i-lg"></i> Remove
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
		super.init(data);
		this.render(/*html*/`
			<div class="row">
				<div class="mb-1 col-12">
				
					<label>Flexbox</label>
					<select class="form-control " name="col">
						
						<option value="">None</option>
						{% for ( var i = 1; i <= 12; i++ ) { %}
						<option value="{%=i%}" {% if ((typeof col !== 'undefined') && col == i) { %} selected {% } %}>{%=i%}</option>
						{% } %}
						
					</select>
					<br/>
				</div>

				<div class="col-6">
					<label>Extra small</label>
					<select class="form-control " name="col-xs">
						
						<option value="">None</option>
						{% for ( var i = 1; i <= 12; i++ ) { %}
						<option value="{%=i%}" {% if ((typeof col_xs !== 'undefined') && col_xs == i) { %} selected {% } %}>{%=i%}</option>
						{% } %}
						
					</select>
					<br/>
				</div>
				
				<div class="col-6">
					<label>Small</label>
					<select class="form-control " name="col-sm">
						
						<option value="">None</option>
						{% for ( var i = 1; i <= 12; i++ ) { %}
						<option value="{%=i%}" {% if ((typeof col_sm !== 'undefined') && col_sm == i) { %} selected {% } %}>{%=i%}</option>
						{% } %}
						
					</select>
					<br/>
				</div>
				
				<div class="col-6">
					<label>Medium</label>
					<select class="form-control " name="col-md">
						
						<option value="">None</option>
						{% for ( var i = 1; i <= 12; i++ ) { %}
						<option value="{%=i%}" {% if ((typeof col_md !== 'undefined') && col_md == i) { %} selected {% } %}>{%=i%}</option>
						{% } %}
						
					</select>
					<br/>
				</div>
				
				<div class="col-6 mb-1">
					<label>Large</label>
					<select class="form-control " name="col-lg">
						
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
						<i class="frmdb-i-fa-trash frmdb-i-lg"></i> Remove
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
		super.init(data);
		this.render(/*html*/`
			<div>
				<button class="btn btn-sm btn-primary">
					<i class="la  {% if (typeof icon !== 'undefined') { %} {%=icon%} {% } else { %} la-plus {% } %} frmdb-i-lg"></i> {%=text%}
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
			<label class="header border-bottom" data-header="{%=key%}" for="header_{%=key%}"><span>&ensp;{%=header%}</span> <div class="header-arrow"></div></label> 
			<input class="header_check" type="checkbox" {% if (typeof expanded !== 'undefined' && expanded == false) { %} {% } else { %}checked="true"{% } %} id="header_{%=key%}"> 
			<div class="section" data-section="{%=key%}"></div>		
		`, data);
	}
}

export class ListInput extends Input {
	static elemTagName = "frmdb-list-input";
	inputTagName = "frmdb-list-input";

	init(data) {
		super.init(data);
		this.render(/*html*/`
			<div class="row">

				{% for ( var i = 0; i < options.length; i++ ) { %}
				<div class="col-6">
					<div class="input-group">
						<input name="{%=key%}_{%=i%}" type="text" class="form-control" value="{%=options[i].text%}"/>
						<div class="input-group-append">
							<button class="input-group-text btn btn-sm btn-danger">
								<i class="frmdb-i-fa-trash frmdb-i-lg"></i>
							</button>
						</div>
					</div>
					<br/>
				</div>
				{% } %}


				{% if (typeof hide_remove === 'undefined') { %}
				<div class="col-12">
				
					<button class="btn btn-sm btn-outline-primary">
						<i class="frmdb-i-fa-trash frmdb-i-lg"></i> Add new
					</button>
					
				</div>
				{% } %}
					
			</div>
		`, data);
	}
}


export class ParamListInput extends Input {
	static elemTagName = "frmdb-param-list-input";
	inputTagName = "frmdb-param-list-input";

	setValue(value) {}

	getParameterValues() {
		let ret: {name:string, value:string}[] = [];
		for (let paramEl of Array.from(this.querySelectorAll('.parameter'))) {
			let input = paramEl.querySelector('input') as HTMLInputElement;
			let textarea = paramEl.querySelector('textarea') as HTMLTextAreaElement;
			ret.push({name: input.value, value: textarea.value});
		}
		return ret;
	}

	init(data) {
		onEvent(this, 'change', 'input', (event: Event) => {
			let input = event.target as HTMLInputElement;
			emit(this, { type: "FrmdbModifyPageElement", value: input.value });
		});
		onEvent(this, 'change', 'textarea', (event: Event) => {
			let textarea = event.target as HTMLTextAreaElement;
			emit(this, { type: "FrmdbModifyPageElement", value: textarea.value });
		});
		
		this.render(/*html*/`
				{% for ( let [i, param] of params.entries() ) { %}
					<div class="parameter">
						<div class="input-group">
							<input name="{%=key%}_{%=i%}_paramName" readonly disabled type="text" class="form-control" value="{%=param.name%}"/>
						</div>
						<div class="input-group">
							<textarea name="{%=key%}_{%=i%}_paramValue" rows="1" class="form-control">{%=param.value%}</textarea>
						</div>
					</div>
				{% } %}
				<div class="parameter">
					<div class="input-group">
						<label for="{%=key%}_100_paramName">New attribute:</label>
					</div>
					<div class="input-group">
						<input name="{%=key%}_100_paramName" type="text" class="form-control" value="" placeholder="attribute-name"/>
					</div>
					<div class="input-group">
						<textarea name="{%=key%}_100_paramValue" rows="1" class="form-control" placeholder="attribute value"></textarea>
					</div>
				</div>
					
			</div>
		`, data);
	}
}

export const Inputs = {
	'TextInput': TextInput,
	'TextareaInput': TextareaInput,
	'CheckboxInput': CheckboxInput,
	'SelectInput': SelectInput,
	'ResponsiveClassSelectInput': ResponsiveClassSelectInput,
	'LinkInput': LinkInput,
	'RangeInput': RangeInput,
	'NumberInput': NumberInput,
	'CssUnitInput': CssUnitInput,
	'ColorInput': ColorInput,
	'ImageInput': ImageInput,
	'IconInput': IconInput,
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
	'ParamListInput': ParamListInput,
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
customElements.define("frmdb-icon-input", IconInput);
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
customElements.define("frmdb-param-list-input", ParamListInput);
customElements.define("frmdb-responsive-class-select-input", ResponsiveClassSelectInput);

export function createInput(inputtype: keyof typeof Inputs): Input {
	return document.createElement(Inputs[inputtype].elemTagName) as Input;
}
