
export function kebabCase2CamelCase(attrName: string) {
    let arr = attrName.split('-');
    let capital = arr.map((item, index) => index ? item.charAt(0).toUpperCase() + item.slice(1).toLowerCase() : item);
    return capital.join("");
}
export function camelCase2kebabCase(propName: string) {
    return propName.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}
export function camelCase2SpaceCase(propName: string) {
    return propName.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1 $2');
}
