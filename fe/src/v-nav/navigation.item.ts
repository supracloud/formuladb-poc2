import { Entity, Pn } from "@domain/metadata/entity";
import { I18N } from "@fe/i18n.service";

export interface NavigationItem {
    linkName: string;
    linkNameI18n: string;
    path: string;
    active: boolean;
    collapsed: boolean;
    hasChildren?: boolean;
    onPath?: boolean;
    isNotRootNavItem?: boolean;
    id: string;
    children: NavigationItem[];
    isPureNavGroupingChildren?: boolean;
}


export function entites2navItems(entitiesList: Entity[], selectedEntityId: string, onlyPresentaiontPages?: boolean) {
    let entities = entitiesList.filter(e => onlyPresentaiontPages ? e.isPresentationPage : !e.isPresentationPage);

    let navItemsTree: Map<string, NavigationItem> = new Map(entities.map(e =>
        [e._id, entity2NavSegment(e, selectedEntityId)] as [string, NavigationItem]));

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

    for (let navItem of navItemsTree.values()) {
        navItem.collapsed = navItem.children.length > 0 && navItem.collapsed && !navItem.onPath;
        navItem.hasChildren = navItem.children.length > 0;
    }

    return Array.from(navItemsTree.values()).filter(item => !item.isNotRootNavItem);
}

export function entity2NavSegment(entity: Entity, selectedEntityId: string): NavigationItem {
    return {
        id: entity._id,
        linkName: entity._id,
        linkNameI18n: I18N.tt(entity._id),
        path: entity.isPresentationPage ? entity._id + '/' + entity._id + '~~' + entity._id : entity._id,
        active: selectedEntityId === entity._id,
        children: [],
        collapsed: selectedEntityId !== entity._id,
        isPureNavGroupingChildren: entity.pureNavGroupingChildren != null,
    };
}
