import { Injectable } from '@angular/core';
import { Form, FormElement } from './domain/uimetadata/form';
import { Table, TableColumn } from './domain/uimetadata/table';

@Injectable()
export class ParserService {
  private INDENT: string = "  ";

  public serializeForm(form: Form): string {
    if (null == form) return '';
    let ret = [];
    this._serializeForm(0, ret, form);
    return ret.join("\n");
  }
  public parseForm(text: string): Form {
    let form = new Form();
    let elementsPath: FormElement[] = [form];

    text.split(/\n/).map(line => {
      let match = line.match(/^(\s*)([\w-=.#]+)(?:: (.*))?/);
      if (null != match) {
        let newEl = new FormElement();
        let m = match[2].match(/([\w-]+)(?:([=#.])(\w+))?/);
        if (null != m) {
          newEl.nodeName = m[1];
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
          newEl.attributes = {};
          match[3].split(/, /).forEach(attrStr => {
            let m = attrStr.match(/([\w-]+)="([\w-]+)"/);
            if (null != m) {
              newEl.attributes[m[1]] = m[2];
            }
          });
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

  public serializeTable(table: Table): string {
    if (null == table) return '';
    let ret = [];
    this._serializeTable(ret, table);
    return ret.join("\n");
  }

  public parseTable(text: string): Table {
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

  private _serializeForm(level: number, ret: string[], formElem: FormElement) {
    if (level > 0) {//do not show top level, it would just waste a level for nothing
      let s = [this.INDENT.repeat(level - 1), formElem.nodeName];
      if (null != formElem.propertyName) s.push('=', formElem.propertyName);
      if (null != formElem.tableName) s.push('#', formElem.tableName);
      if (null != formElem.entityName) s.push('.', formElem.entityName);
      if (formElem.attributes) {
        s.push(": ");
        s.push(Object.entries(formElem.attributes).map(x => `${x[0]}="${x[1]}"`).join(', '));
      }
      ret.push(s.join(''));
    }
    (formElem.childNodes || []).forEach(child => {
      this._serializeForm(level + 1, ret, child);
    });
  }

  private _serializeTable(ret: string[], table: Table) {
    (table.columns || []).forEach(column => {
      let s = [column.name, ": ", column.type, "\n  other stuff"];
      ret.push(s.join(''));
    });
  }

}
