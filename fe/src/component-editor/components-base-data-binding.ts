import { Component } from "./component-editor.component";
import { $TABLES, $DATA_COLUMNS_FOR_ELEM, $REFERENCE_TO_OPTIONS } from "@fe/fe-functions";
import { entityNameFromDataObjId } from "@domain/metadata/data_obj";

let propsSort = 2500;

export const ComponentsBaseDataBinding: Partial<Component> = {
	name: "Element",
	properties: [
		{
			key: "value",
			inputtype: "SectionInput",
			tab: "left-panel-tab-data",
			name: '',
			sort: propsSort++,
			data: { header: "Value" },
		},
		{
			name: "Repeat for Table",
			key: "data-frmdb-table",
			htmlAttr: "data-frmdb-table",
			tab: "left-panel-tab-data",
			sort: propsSort++,
			inline: true,
			col: 9,
			inputtype: "SelectInput",
			validValues: [],
			data: {
				options: [],
			},
			beforeInit: function (node) {
				let dataFrmdbTableProp = this;
				if (dataFrmdbTableProp) {
					let tables = $TABLES();
					let tablesForReferenceOptions = $REFERENCE_TO_OPTIONS(node);
					dataFrmdbTableProp.validValues = tables.map(t => t.name);
					dataFrmdbTableProp.data.options = [{
						value: '',
						text: '-',
					}].concat(tables.map(t => ({
						value: '$FRMDB.' + t.name + '[]',
						text: t.name,
					}))).concat(tablesForReferenceOptions.map(t => ({
						value: t.value,
						text: t.name,
					})));
				}
			},
		},
		{
			name: "Limit",
			key: "data-frmdb-table-limit",
			htmlAttr: "data-frmdb-table-limit",
			tab: "left-panel-tab-data",
			sort: propsSort++,
			inline: true,
			col: 3,
			inputtype: "NumberInput",
			data: {
				placeholder: "3"
			}
		},
		{
			name: "Bind To Single Record",
			key: "data-frmdb-bind-to-record",
			htmlAttr: "data-frmdb-bind-to-record",
			tab: "left-panel-tab-data",
			sort: propsSort++,
			inline: true,
			col: 12,
			inputtype: "SelectInput",
			validValues: [],
			data: {
				options: [],
			},
			beforeInit: function (node) {
				let dataFrmdbTableProp = this;
				if (dataFrmdbTableProp) {
					let tables = $TABLES();
					dataFrmdbTableProp.validValues = tables.map(t => t.name);
					dataFrmdbTableProp.data.options = [{
						value: '',
						text: '-',
					}].concat(tables.map(t => ({
						value: '$FRMDB.' + t.name + '~~',
						text: t.name,
					})));
				}
			},
		},		
		{
			name: "Parent Record",
			key: "data-frmdb-record",
			htmlAttr: "data-frmdb-record",
			tab: "left-panel-tab-data",
			sort: propsSort++,
			inline: true,
			col: 12,
			inputtype: "TextInput",
			data: {
				disabled: true,
			},
			beforeInit: function (node) {
				if (!node.getAttribute('data-frmdb-record')) {
					let parentRecordEl = node.closest('[data-frmdb-record]');
					if (!parentRecordEl) return;
					this.data.placeholder = parentRecordEl.getAttribute('data-frmdb-record');
					this.name = "Parent Record";
					this.data.disabled = true;
				} else if (node.hasAttribute('data-frmdb-bind-to-record')) {
					this.name = "Bind to Record Id";
					this.data.disabled = false;
				} else {
					let recordId = node.getAttribute('data-frmdb-record');
					this.data.placeholder = recordId;
					this.data.disabled = true;
				}
			},
		},
		{
			name: "Simple Value From Record",
			key: "data-frmdb-value",
			htmlAttr: "data-frmdb-value",
			tab: "left-panel-tab-data",
			sort: propsSort++,
			inline: true,
			col: 12,
			inputtype: "SelectInput",
			validValues: [],
			data: {
				options: []
			},
			beforeInit: function (node) {
				let opts = $DATA_COLUMNS_FOR_ELEM(node);
				this.validValues = opts.map(o => o.value);
				this.data.options = opts;
			},
		},	
		{
			name: "Initialize Width",
			key: "data-frmdb-init",
			htmlAttr: "data-frmdb-init",
			tab: "left-panel-tab-data",
			sort: propsSort++,
			inline: true,
			col: 12,
			inputtype: "TextInput",
		},
		{
			name: "Show Only If",
			key: "data-frmdb-if",
			htmlAttr: "data-frmdb-if",
			tab: "left-panel-tab-data",
			sort: propsSort++,
			inline: true,
			col: 12,
			inputtype: "TextInput",
		},
		{
			name: "Formula Value From Record",
			key: "data-frmdb-value",
			htmlAttr: "data-frmdb-value",
			tab: "left-panel-tab-data",
			sort: propsSort++,
			inline: true,
			col: 12,
			inputtype: "TextInput",
		},
        {
            name: "Rules",
            key: "data-frmdb-rules",
            htmlAttr: "data-frmdb-rules",
            inline: true,
            col: 12,
            sort: propsSort++,
            inputtype: "TextareaInput",
            tab: "left-panel-tab-content",
        },		
		{
			key: "attributes",
			inputtype: "SectionInput",
			tab: "left-panel-tab-data",
			name: '',
			sort: propsSort++,
			data: { header: "Attributes", expanded: false },
		},
		{
			name: "Attribute 1",
			key: "data-frmdb-attr",
			htmlAttr: "data-frmdb-attr",
			tab: "left-panel-tab-data",
			sort: propsSort++,
			inline: true,
			col: 12,
			inputtype: "TextInput",
		},
		{
			name: "Attribute 2",
			key: "data-frmdb-attr2",
			htmlAttr: "data-frmdb-attr2",
			tab: "left-panel-tab-data",
			sort: propsSort++,
			inline: true,
			col: 12,
			inputtype: "TextInput",
		},
		{
			name: "Attribute 3",
			key: "data-frmdb-attr3",
			htmlAttr: "data-frmdb-attr3",
			tab: "left-panel-tab-data",
			sort: propsSort++,
			inline: true,
			col: 12,
			inputtype: "TextInput",
		},
		{
			name: "Attribute 4",
			key: "data-frmdb-attr4",
			htmlAttr: "data-frmdb-attr4",
			tab: "left-panel-tab-data",
			sort: propsSort++,
			inline: true,
			col: 12,
			inputtype: "TextInput",
		},
		{
			key: "properties",
			inputtype: "SectionInput",
			tab: "left-panel-tab-data",
			name: '',
			sort: propsSort++,
			data: { header: "Properties (advanced)", expanded: false },
		},
		{
			name: "Property 1",
			key: "data-frmdb-prop1",
			htmlAttr: "data-frmdb-prop1",
			tab: "left-panel-tab-data",
			sort: propsSort++,
			inline: true,
			col: 12,
			inputtype: "TextInput",
		},
		{
			name: "Property 2",
			key: "data-frmdb-prop2",
			htmlAttr: "data-frmdb-prop2",
			tab: "left-panel-tab-data",
			sort: propsSort++,
			inline: true,
			col: 12,
			inputtype: "TextInput",
		},
		{
			name: "Property 3",
			key: "data-frmdb-prop3",
			htmlAttr: "data-frmdb-prop3",
			tab: "left-panel-tab-data",
			sort: propsSort++,
			inline: true,
			col: 12,
			inputtype: "TextInput",
		},
		{
			name: "Property 4",
			key: "data-frmdb-prop4",
			htmlAttr: "data-frmdb-prop4",
			tab: "left-panel-tab-data",
			sort: propsSort++,
			inline: true,
			col: 12,
			inputtype: "TextInput",
		},
	]
};
