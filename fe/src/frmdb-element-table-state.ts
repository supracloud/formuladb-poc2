import { SimpleAddHocQuery } from "@domain/metadata/simple-add-hoc-query";

/** Approach using events */
export class FrmdbElementTableState<OBJT> {
    data: OBJT[];
    query: SimpleAddHocQuery;
}
