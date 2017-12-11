import { NodeType } from "../domain/uimetadata/form";

export class TreeState{
    canMoveUp:boolean=true;
    canMoveDown:boolean=true;
    canEdit:boolean=true;
    canDelete:boolean=true;
    canAddChild:boolean=true;
    availableTypes?:NodeType[];
}