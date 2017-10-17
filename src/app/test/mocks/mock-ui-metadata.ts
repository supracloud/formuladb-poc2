import * as metadata from './mock-metadata';
import {Entity} from '../../domain/metadata/entity'
import {Form} from '../../domain/uimetadata/form'

// export function mockForm(entity: Entity): Form {
//   let arr:any[] = [];
//   for (let i:number = 0; i < nbEntities; i++) {
//     let ret = {};
//     entity.properties.forEach((p, index) => {
//       if (p.type == "integer") {
//         ret[p.name] = Math.random() * 100;
//       } else if (p.type == "decimal") {
//         ret[p.name] = Math.random() * 100;
//       } else if (p.type == "float") {
//         ret[p.name] = Math.random() * 112.45;
//       } else if (p.type == "string") {
//         ret[p.name] = p.name + Math.random() * 10000;
//       } else if (p.type == "text") {
//         ret[p.name] = p.name + "_" + p.name + "_" + Math.random() * 10000;
//       } else if (p.type == "datetime") {
//         ret[p.name] = new Date();
//       } else if (p.type == "reference") {
//         console.error("references not currently mocked: TODO");
//       }
//     });
//     arr.push(ret);
//   }

//   return arr;
// }
