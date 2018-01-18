import { Entity, EntityProperty } from "./domain/metadata/entity";
import { Form, NodeElement, NodeType, Str2NodeType, NodeType2Str } from './domain/uimetadata/form';
import { Table, TableColumn } from './domain/uimetadata/table';

export class MwzParser {
  private INDENT: string = "  ";

  public serializeEntity(entity: Entity): string {
    return JSON.stringify(entity, null, 2);
  }

  public parseEntity(text: string): Entity {
    return null;
  }

  public serializeForm(entity: Entity, form: Form): string {
    if (null == form) return '';
    let ret = [];
    this._serializeForm(entity, 0, ret, form);
    return ret.join("\n");
  }
  public parseForm(entity: Entity, text: string): Form {
    if (null == text) return null;

    let form = new Form();
    form._id = 'Form_:' + entity._id;
    form.mwzType = 'Form_';
    let elementsPath: NodeElement[] = [form];

    text.split(/\n/).map(line => {
      if (null != line.match(/^\s*$/)) return;//ignore empty lines

      let match = line.match(/^(\s*)([\w-=.#]+)(?:: (.*))?/);
      if (null != match) {
        let newEl = new NodeElement();
        let m = match[2].match(/([\w-]+)(?:([=#.])(\w+))?/);
        if (null != m) {
          newEl.nodeName = m[1];
          newEl.nodeType = Str2NodeType.get(newEl.nodeName);
          if (null != m[2]) {
            switch (m[2]) {
              case '=':
                newEl.propertyName = m[3];
                break;
              case '#':
                newEl.tableName = m[3];
                break;
              case '.':
                newEl.entityName = m[3];
                break;
            }
          }
        } else throw new Error("Cannot parse element name: " + match[2]);

        if (null != match[3]) {
          newEl.attributes = JSON.parse('{' + match[3] + '}');
        }

        let level = match[1].length / this.INDENT.length + 1;
        let currentLevel = elementsPath.length - 1;

        if (level <= currentLevel) {
          //go up the tree
          for (let i = level; i < currentLevel + 1; i++) {
            elementsPath.pop();
          }

        } else if (level == currentLevel + 1) {
          //it's ok, nothing to do
        } else console.error("Error on levels>", currentLevel, level);

        elementsPath[elementsPath.length - 1].childNodes.push(newEl);
        elementsPath.push(newEl);

      } else console.error("Errr on line>", line);
    });

    return form;
  }

  public serializeTable(entity: Entity, table: Table): string {
    if (null == table) return '';
    let ret = [];
    this._serializeTable(entity, ret, table);
    return ret.join("\n");
  }

  public parseTable(entity: Entity, text: string): Table {
    let table = new Table();
    table.columns = [];
    text.split(/\n/).forEach(line => {
      let match = line.match(/(\w+): (\w+)/);
      if (match) {
        table.columns.push(new TableColumn(match[1], match[2]));
      } else console.error("Errr on line>", line);
    });
    return table;
  }

  private _serializeForm(entity: Entity, level: number, ret: string[], formElem: NodeElement) {
    if (level > 0) {//do not show top level, it would just waste a level for nothing
      let s = [this.INDENT.repeat(level - 1), NodeType2Str.get(formElem.nodeType)];
      if (null != formElem.propertyName) s.push('=', formElem.propertyName);
      if (null != formElem.tableName) s.push('#', formElem.tableName);
      if (null != formElem.entityName) s.push('.', formElem.entityName);
      if (formElem.attributes) {
        s.push(": ");
        s.push(JSON.stringify(formElem.attributes).replace(/^\{/, '').replace(/\}$/, ''));
      }
      ret.push(s.join(''));
    }
    (formElem.childNodes || []).forEach(child => {
      this._serializeForm(entity, level + 1, ret, child);
    });
  }

  private _serializeTable(entity: Entity, ret: string[], table: Table) {
    (table.columns || []).forEach(column => {
      let s = [column.name, ": ", column.type];
      ret.push(s.join(''));
    });
  }
}

// private getForm(path: string): Form {
//   return this.parserService.parseForm(this.mockMetadata.entitiesMap.get(path), mockUiMeta.getFormText(path)) ||
//     getDefaultForm(this.mockMetadata.entitiesMap.get(path), this.mockMetadata.entitiesMap);
// }
