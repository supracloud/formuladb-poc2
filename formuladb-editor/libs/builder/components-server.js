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

Vvveb.ComponentsGroup['Server Components'] = ["components/products", "components/product", "components/categories", "components/manufacturers", "components/search", "components/user", "components/product_gallery", "components/cart", "components/checkout", "components/filters", "components/product", "components/slider"];


Vvveb.Components.add("components/product", {
    name: "Product",
    attributes: ["data-component-product"],

    image: "icons/map.svg",
    html: '<iframe frameborder="0" src="https://maps.google.com/maps?&z=1&t=q&output=embed"></iframe>',
    
	properties: [
	{
        name: "Id",
        key: "id",
        htmlAttr: "id",
        inputtype: TextInput
    },
	{
        name: "Select",
        key: "id",
        htmlAttr: "id",
        inputtype: SelectInput,
        data:{
			options: [{
                value: "",
                text: "None"
            }, {
                value: "pull-left",
                text: "Left"
            }, {
                value: "pull-right",
                text: "Right"
            }]
       },
    },
	{
        name: "Select 2",
        key: "id",
        htmlAttr: "id",
        inputtype: SelectInput,
        data:{
			options: [{
                value: "",
                text: "nimic"
            }, {
                value: "pull-left",
                text: "gigi"
            }, {
                value: "pull-right",
                text: "vasile"
            }, {
                value: "pull-right",
                text: "sad34"
            }]
       },
    }]
});    

Vvveb.Components.add("components/slider", {
    name: "Slider",
    classes: ["component_slider"],
    image: "icons/slider.svg",
    html: '<div class="form-group"><label>Your response:</label><textarea class="form-control"></textarea></div>',
    properties: [{
        name: "asdasdad",
        key: "src",
        htmlAttr: "src",
        inputtype: FileUploadInput
    }, {
        name: "34234234",
        key: "width",
        htmlAttr: "width",
        inputtype: TextInput
    }, {
        name: "d32d23",
        key: "height",
        htmlAttr: "height",
        inputtype: TextInput
    }]
});
