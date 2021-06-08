import * as _ from 'lodash';
import { ClassSetInput, ClassSetInputData } from "./inputs";
import './inputs';
import { HTMLTools } from "@core/html-tools";
import { setClassSetValidValues } from './components-utils';

const htmlTools = new HTMLTools(document, new DOMParser());

describe('components-utils', () => {

    it('setClassSetValidValues', () => { 
		document.body.innerHTML = /*html*/`
			<frmdb-class-set-input></frmdb-class-set-input>
			<div>bla bla</div>
		`;

		let inputEl: ClassSetInput = document.querySelector('frmdb-class-set-input') as ClassSetInput;
        let el: HTMLElement = document.querySelector('div') as HTMLElement;

        let prop = {
            beforeInit: setClassSetValidValues,
            validValues: [] as string[],
            data: {
                isResponsive: true,
                prefix: "p" as string | string[],
                fragments: [
                    [
                        {classFragment: 'f1', label: 'Fragment 1'},
                        {classFragment: 'f2', label: 'Fragment 2'},
                    ]
                ]
            } as ClassSetInputData
        }
        prop.beforeInit(el);
        expect(prop.validValues).toEqual([
            'p-f1', 'p-f2', 'p-md-f1', 'p-md-f2', 'p-lg-f1', 'p-lg-f2',
        ]);

        prop.data.prefix = [{ classFragment: 'p1', label: 'p1lbl' }, { classFragment: 'p2', label: 'p2lbl' }];
        prop.validValues = [];
        prop.beforeInit(el);
        expect(prop.validValues).toEqual([
            'p1-f1', 'p1-f2', 'p1-md-f1', 'p1-md-f2', 'p1-lg-f1', 'p1-lg-f2',
            'p2-f1', 'p2-f2', 'p2-md-f1', 'p2-md-f2', 'p2-lg-f1', 'p2-lg-f2',
        ]);

        prop.data.prefix = 'p',
        prop.validValues = [];
        prop.data.isResponsive = false;
        prop.beforeInit(el);
        expect(prop.validValues).toEqual([
            'p-f1', 'p-f2',
        ]);

        prop.data.prefix = [{ classFragment: 'p1', label: 'p1lbl' }, { classFragment: 'p2', label: 'p2lbl' }];
        prop.validValues = [];
        prop.data.isResponsive = false;
        prop.beforeInit(el);
        expect(prop.validValues).toEqual([
            'p1-f1', 'p1-f2',
            'p2-f1', 'p2-f2',
        ]);

	});
});
