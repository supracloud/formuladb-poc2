import { Entity, Pn, Schema, Fn } from "../../../src/app/common/domain/metadata/entity";
import * as _ from "lodash";

export function makeEntity(id: string, e: any): Entity {
    let ret = _.cloneDeep(e);
    ret._id = id;
    ret.type = 'Entity_';
    return ret;
}

export function makeSchema(...entities: Entity[]): Schema {
    let ret = {_id: "FRMDB_SCHEMA"};
    entities.forEach(e => {ret[e._id] = e});
    return ret as Schema;
}

const A = {
    type_: "Entity_", _id: "/R/A",
    bbbs: {
        bbb: {
            propType_: Pn.REFERENCE_ENTITY,
            entity: { deepPath: '/R/B/categ/@' },
        },
        str: { propType_: Pn.STRING },
        num: { propType_: Pn.NUMBER },
    },
};
const B = {
    type_: "Entity_", _id: "/R/B",
    categ: {
        propType_: Pn.TABLE,
        sum: {
            propType_: Pn.FORMULA,
            formula: Fn.SUM(
                Fn.UNGROUP(
                    Fn.FILTER(
                        Fn.GROUP_BY(Fn.FILTER(`bbbsInAaaInRoot`, `"val > 5"`), `"str"`),
                        `"COUNT > 2"`
                    )
                )
            ),
        }
    }
};

export const SUM_IF_GROUP_IF_Schema = {
    _id: "FRMDB_SCHEMA",
    "/R/A": A,
    "/R/B": B
} as Schema;

export const SUM_IF_GROUP_IF_ExecutionPlan = {
};