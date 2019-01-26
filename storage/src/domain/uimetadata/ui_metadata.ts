/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { Entity } from "../metadata/entity";
import { Table } from './table';
import { Form } from './form';

export class UiMetadata {
    constructor (public entity: Entity, public table: Table, public form: Form) {}
}