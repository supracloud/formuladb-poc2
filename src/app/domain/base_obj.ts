import { UUID } from 'angular2-uuid';

export class BaseObj {
    _id?: string;
    _rev?: string;
    mwzType?: string;

    static uuid(): string {
        return UUID.UUID();
    }
}
