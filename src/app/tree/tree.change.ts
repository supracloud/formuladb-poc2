import { NodeElement } from "../domain/uimetadata/form";

export class TreeChange{
    constructor(public node:NodeElement){}    
    fromIndex?:number=null;
    toIndex?:number=null;
    remove?:number=null;
}