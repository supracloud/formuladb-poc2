/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Entity } from "../metadata/entity";
import { TablePage } from './table-page';
import { FormPage } from './form-page';

export class UiMetadata {
    constructor (public entity: Entity, public table: TablePage, public form: FormPage) {}
}