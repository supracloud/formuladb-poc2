import { UUID } from 'angular2-uuid';

export class BaseObj {
    _id?: string;
    _rev?: string;
    _deleted?: boolean;
    mwzType?: string;

    static uuid(): string {
        return UUID.UUID();
    }
}
