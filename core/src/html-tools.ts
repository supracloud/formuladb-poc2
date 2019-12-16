
export class HTMLTools {

    constructor(public doc: Document, public domParser: DOMParser) {}

    normalizeHTML(html: string): string[] {
        return this.prettyHtml(html).split(/\n/);
    }

    normalizeHTMLDoc(htmlDoc: string): string[] {
        let doc = this.domParser.parseFromString(htmlDoc, 'text/html');
        this.format(doc.documentElement, 0);
        return this.doc2html(doc).split(/\n/);
    }

    normalizeHTMLStr(html: string): string {
        return this.prettyHtml(html);
    }

    normalizeDOM2HTML(node: Element): string {
        let normalizedNode = this.format(node, 0);
        return normalizedNode.outerHTML.replace(/\n\s*\n/g, "\n");
    }

    document2html(postProcessedHTMLElement?: HTMLElement): string {
        return this.doc2html(this.doc, postProcessedHTMLElement);
    }

    doc2html(doc: Document, postProcessedHTMLElement?: HTMLElement): string {
        let hasDoctpe = (doc.doctype !== null);
        let html = "";

        if (hasDoctpe) html = "<!DOCTYPE "
            + doc.doctype!.name
            //@ts-ignore
            + (doc.doctype.publicId ? ' PUBLIC "' + doc.doctype.publicId + '"' : '')
            //@ts-ignore
            + (!doc.doctype.publicId && doc.doctype.systemId ? ' SYSTEM' : '')
            //@ts-ignore
            + (doc.doctype.systemId ? ' "' + doc.doctype.systemId + '"' : '')
            + ">\n";

        html += this.normalizeDOM2HTML(postProcessedHTMLElement || doc.documentElement) + "\n</html>";

        html = html.replace(/<.*?data-vvveb-helpers.*?>/gi, "");
        html = html.replace(/\s*data-vvveb-\w+(=["'].*?["'])?\s*/gi, "");
        html = html.replace(/\s*<!-- Code injected by live-server(.|\n)+<\/body>/, '</body>');

        return html;
    }


    prettyHtml(str) {
        var div = this.doc.createElement('div');
        div.innerHTML = str.trim();

        let node = this.format(div, 0);
        return node.innerHTML;
    }

    html2dom(str): Element {
        var div = this.doc.createElement('div');
        div.innerHTML = str.trim();
        return div.firstChild as Element;
    }

    removeWhitespace(node) {
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
                this.removeWhitespace(child);
            }
        }
    }
    format(node: Element, level) {

        var indentBefore = new Array(level++ + 1).join('    '),
            indentAfter = new Array(level - 1).join('    '),
            textNode;

        this.removeWhitespace(node);

        for (var i = 0; i < node.children.length; i++) {
            let childNode = node.children[i];

            textNode = this.doc.createTextNode('\n' + indentBefore);
            node.insertBefore(textNode, childNode);

            this.format(childNode, level);

            if (node.lastElementChild == childNode) {
                textNode = this.doc.createTextNode('\n' + indentAfter);
                node.appendChild(textNode);
            }
        }

        return node;
    }
}

export function isHTMLElement(node: Node | null): node is HTMLElement {
    return node != null && (node as any).tagName != null;
}
