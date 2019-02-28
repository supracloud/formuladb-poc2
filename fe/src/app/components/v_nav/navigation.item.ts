export interface NavigationItem extends Node {
    linkName: string;
    path: string;
    active: boolean;
    collapsed: boolean;
    onPath?: boolean;
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