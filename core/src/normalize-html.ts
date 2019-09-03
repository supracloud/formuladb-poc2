
export function normalizeHTML(html: string): string[] {
    return prettyHtml(html).split(/\n/);
}

export function normalizeHTMLStr(html: string): string {
    return prettyHtml(html);
}

function prettyHtml(str) {

    var div = document.createElement('div');
    div.innerHTML = str.trim();

    let node = format(div, 0);
    return node.innerHTML;
}

function removeWhitespace(node) {
    for (var n = 0; n < node.childNodes.length; n++) {
        var child = node.childNodes[n];
        if
            (
            child.nodeType === 8
            ||
            (child.nodeType === 3 && !/\S/.test(child.nodeValue))
        ) {
            node.removeChild(child);
            n--;
        }
        else if (child.nodeType === 1) {
            removeWhitespace(child);
        }
    }
}
function format(node, level) {

    var indentBefore = new Array(level++ + 1).join('    '),
        indentAfter = new Array(level - 1).join('    '),
        textNode;

    removeWhitespace(node);

    for (var i = 0; i < node.children.length; i++) {
        let childNode = node.children[i];

        textNode = document.createTextNode('\n' + indentBefore);
        node.insertBefore(textNode, childNode);

        format(childNode, level);

        if (node.lastElementChild == childNode) {
            textNode = document.createTextNode('\n' + indentAfter);
            node.appendChild(textNode);
        }
    }

    return node;
}
