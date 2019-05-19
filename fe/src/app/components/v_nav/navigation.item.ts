import { Entity, Pn } from "@domain/metadata/entity";

export interface NavigationItem extends Node {
    linkName: string;
    path: string;
    active: boolean;
    collapsed: boolean;
    onPath?: boolean;
    isNotRootNavItem?: boolean;
    isPureNavGroupingChildren?: boolean;
}

export interface Node {
    id: string;
    children: Node[];
}

export const unflatten = <T extends Node>(flat: T[], parentOf: (n1: T, n2: T) => boolean) => {
    flat.forEach(f => {
        f.children = flat.filter(fc => parentOf(f, fc));
    });
    let unflat: T[] = flat.filter(fp => flat.every(fo => fo.children.every(fc => fc.id !== fp.id)));
    unflat.forEach(u => u.children = unflatten(u.children, parentOf));
    return unflat;
}

export function entites2navItems(entitiesList: Entity[], selectedEntity: Entity, onlyPresentaiontPages?: boolean) {
    let entities = entitiesList.filter(e => onlyPresentaiontPages ? e.isPresentationPage : !e.isPresentationPage);

    let navItemsTree: Map<string, NavigationItem> = new Map(entities.map(e =>
        [e._id, entity2NavSegment(e, selectedEntity)] as [string, NavigationItem]));

    for (let entity of entities) {
        if (entity.pureNavGroupingChildren && entity.pureNavGroupingChildren.length > 0) {
            for (let childEntityId of entity.pureNavGroupingChildren) {
                if (navItemsTree.get(childEntityId)) {
                    navItemsTree.get(childEntityId)!.isNotRootNavItem = true;
                    navItemsTree.get(entity._id)!.children.push(navItemsTree.get(childEntityId)!);
                }
            }
        }
        for (let prop of Object.values(entity.props)) {
            if (prop.propType_ === Pn.CHILD_TABLE && prop.referencedEntityName && navItemsTree.get(prop.referencedEntityName)) {
                navItemsTree.get(prop.referencedEntityName!)!.isNotRootNavItem = true;
                navItemsTree.get(entity._id)!.children.push(navItemsTree.get(prop.referencedEntityName!)!);
            }
        }
    }

    return Array.from(navItemsTree.values()).filter(item => !item.isNotRootNavItem);
}

export function entity2NavSegment(entity: Entity, selectedEntity: Entity): NavigationItem {
    return {
        id: entity._id,
        linkName: entity._id,
        path: entity.isPresentationPage ? entity._id + '/' + entity._id + '~~' + entity._id : entity._id,
        active: selectedEntity._id === entity._id,
        children: [],
        collapsed: selectedEntity._id !== entity._id,
        isPureNavGroupingChildren: entity.pureNavGroupingChildren != null,
    };
}
