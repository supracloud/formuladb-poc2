/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as _ from "lodash";
import { CircularJSON } from "@domain/json-stringify";
import {
    Expression, CallExpression, BinaryExpression, Identifier, isExpression, isIdentifier,
    ExpressionBase, LogicalExpression, isBinaryExpression, isNumberLiteral, isMemberExpression, MemberExpression, isLiteral
} from "jsep";
import * as jsep from 'jsep';

import {
    Entity, Schema, Pn, extendEntityProperties, queryEntityWithDeepPath,
    FormulaProperty, FormulaExpression, isPropertyWithProperties, isFormulaProperty, EntityProperty, 
} from "@domain/metadata/entity";
import { CompiledFormula } from "@domain/metadata/execution_plan";
import { DataObjRelativePath } from "@domain/metadata/data_obj";
import { compileFormula } from './formula_compiler';
import { SchemaDAO } from "@domain/metadata/schema_dao";
import { DAG } from "@domain/metadata/dag";


export class FormulaCompilerContextType {
    targetEntityName: string;
}

export class FuncCommon {
    context: FormulaCompilerContextType;
    funcExpr: CallExpression;
}

export interface FormulaDAG {
    
}

/**
 * The compiler must produce execution plans for entities
 */
export class SchemaCompiler {
    constructor(private schema: Schema) {
    }

    public compileSchema(): SchemaDAO {
        for (let entity of _.values(this.schema.entities)) {
            this.compileEntity(entity);
        };

        let formulaDAG: DAG<{id: string, entityProp: EntityProperty}> = new DAG();
        // this.createFormulaDAG(formulaDAG);

        return new SchemaDAO(this.schema, formulaDAG);
    }

    private compileEntity(entity: Entity): Entity {
        try {
            // SchemaCompiler.applyInheritanceTo(entity, this.schema.entities);

            // create execution plan
            this.compileFormulas(entity);

            //TODO: detect auto-corrections triggered by unrelated object validations; auto-corrections must be defined on an object property which depends on the current object
            //TODO: detect cycles in observables/observers
        } catch (ex) {
            console.warn(ex, ex.stack);
        }
        return entity;
    }

    public translateRelativePath(relativeDeepPath: DataObjRelativePath) {
        return null;
    }

    public compileFormulas(entity: Entity): Entity {
        _.values(entity.props).forEach(pn => {
            if (isFormulaProperty(pn)) {
                pn.compiledFormula_ = compileFormula(entity._id, pn.name, pn.formula);
            }
        });
        return entity;
    }

    private extractEntityPropertiesFromExpression(node: Expression, entity: Entity, referencedEntityProperties: _.Dictionary<EntityProperty>) {
        switch (node.type) {
    
            case 'ArrayExpression':
                node.elements.forEach(elem => this.extractEntityPropertiesFromExpression(elem, entity, referencedEntityProperties));
                break;
            case 'BinaryExpression':
                this.extractEntityPropertiesFromExpression(node.left, entity, referencedEntityProperties);
                this.extractEntityPropertiesFromExpression(node.right, entity, referencedEntityProperties);
                break;
    
            case 'CallExpression':
                node.arguments.forEach(elem => this.extractEntityPropertiesFromExpression(elem, entity, referencedEntityProperties));
                break;
    
            case 'ConditionalExpression':
                this.extractEntityPropertiesFromExpression(node.test, entity, referencedEntityProperties);
                this.extractEntityPropertiesFromExpression(node.consequent, entity, referencedEntityProperties);
                this.extractEntityPropertiesFromExpression(node.alternate, entity, referencedEntityProperties);
                break;
    
            case 'Identifier':
                if (entity.props[node.name]) referencedEntityProperties[node.name] = entity.props[node.name];
                break;
    
            case 'NumberLiteral':
            case 'StringLiteral':
            case 'Literal':
                break;
    
            case 'LogicalExpression':
                this.extractEntityPropertiesFromExpression(node.left, entity, referencedEntityProperties);
                this.extractEntityPropertiesFromExpression(node.right, entity, referencedEntityProperties);
                break;

            case 'MemberExpression':
                if (isIdentifier(node.object)) {
                    this.extractEntityPropertiesFromExpression(node.object, entity, referencedEntityProperties);
                } else if (isLiteral(node.object) && node.object.raw === '@') {
                    //TODO: self dependencies, how to manage them in the DAG?
                } else {
                    throw new Error("Nested properties '" + node.origExpr + "' are not yet supported in ");
                }
                break;
            case 'ThisExpression':
                break;
    
            case 'UnaryExpression':
                this.extractEntityPropertiesFromExpression(node.argument, entity, referencedEntityProperties);
                break;
    
            case 'Compound':
                throw new Error("Compound expr are not supported: " + node.origExpr);
    
            default:
                throw new Error("Unknown expression: " + CircularJSON.stringify(node));
        }
    }
    private createFormulaDAG(formulaDAG: DAG<{id: string, entityProp: EntityProperty}>) {
        _.values(this.schema.entities).forEach(en => {
            _.values(en.props).forEach(pr => {
                if (Pn.FORMULA === pr.propType_ && null != pr.compiledFormula_) {
                    let compiledFormula: CompiledFormula = pr.compiledFormula_;
                    let childFormulaProperty = {
                        id: en._id + '.' + pr.name,
                        entityProp: pr,
                    }; 

                    if (null == pr.compiledFormula_.triggers) {
                        //scalar formula using only the properties of the current entity, does not reference another entity
                        let referencedEntityProperties: _.Dictionary<EntityProperty> = {};
                        this.extractEntityPropertiesFromExpression(pr.compiledFormula_.rawExpr, en, referencedEntityProperties);
                        _.values(referencedEntityProperties).forEach(refProp => {
                            let parentProperty = {
                                id: en._id + '.' + refProp.name,
                                entityProp: refProp,
                            }
                            formulaDAG.addParentChild(parentProperty, childFormulaProperty);
                        })
                    } else {
                        pr.compiledFormula_.triggers.forEach(t => {
                            let referencedEntity = this.schema.entities[t.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.entityId];
                            let referencedEntityProperties: _.Dictionary<EntityProperty> = {};
                            t.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.keyExpr.forEach(kexpr => {
                                this.extractEntityPropertiesFromExpression(kexpr, referencedEntity, referencedEntityProperties);
                            });
                            this.extractEntityPropertiesFromExpression(t.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.valueExpr, referencedEntity, referencedEntityProperties);
                            _.values(referencedEntityProperties).forEach(refProp => {
                                let parentProperty = {
                                    id: t.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.entityId + '.' + refProp.name,
                                    entityProp: refProp,
                                }
                                formulaDAG.addParentChild(parentProperty, childFormulaProperty);
                            })
                        })
                    }
                }
            })
        });
        
    }
    
    public addReferenceTables(entity: Entity): Entity {
        throw new Error('addReferenceTables not implemented');
    }
    public static applyInheritanceTo(entity: Entity, entities: _.Dictionary<Entity>): Entity {
        _.values(entity.props).forEach(pn => {
            if (isPropertyWithProperties(pn) && pn.referencedEntityName != null) {
                let referencedEntity: Entity = entities[pn.referencedEntityName];
                if (referencedEntity == null) throw new Error("Cannot find entity for " + pn.referencedEntityName);
                extendEntityProperties(pn, queryEntityWithDeepPath(referencedEntity, pn.referencedEntityName));
            }
        });
        return entity;
    }
}
