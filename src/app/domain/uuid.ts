import { UUID } from 'angular2-uuid';

export function generateUUID(): string {
    return UUID.UUID();
}