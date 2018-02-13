import { Entity, EntityProperty } from "./common/domain/metadata/entity";
import { Form, NodeElement, NodeType } from './common/domain/uimetadata/form';
import { Table, TableColumn } from './common/domain/uimetadata/table';

export class MwzParser {
  private INDENT: string = "  ";

  public serializeEntity(entity: Entity): string {
    return JSON.stringify(entity, null, 2);
  }

  public parseEntity(text: string): Entity {
    return null;
  }

  public serializeForm(entity: Entity, form: Form): string {
    return 'n/a form;'
  }
  public parseForm(entity: Entity, text: string): Form {
    return null;
  }

  public serializeTable(entity: Entity, table: Table): string {
    return 'n/a table;'
  }

  public parseTable(entity: Entity, text: string): Table {
    return null;
  }
}
