import { App } from "@domain/app";
import { Schema, Entity } from "@domain/metadata/entity";
import { KeyValueStoreFactoryI, KeyObjStoreI } from "@storage/key_value_store_i";
import * as fs from 'fs';
import * as jsyaml from 'js-yaml';
import { $User, $Dictionary } from "@domain/metadata/default-metadata";
import { CircularJSON } from "@domain/json-stringify";

import { Storage } from '@google-cloud/storage';
const STORAGE = new Storage({
    projectId: "seismic-plexus-232506",
});


interface SchemaNoEntities {
    _id: string;
    entityIds: string[]; 
}

export class MetadataStore {
    constructor(private envName: string, public kvsFactory: KeyValueStoreFactoryI) { }

    private async writeFile(fileName: string, content: string) {
        return new Promise((resolve, reject) => {
            fs.writeFile(fileName, content, function(err) {
                if(err) {
                    console.error(err);
                    reject(err);
                }
                resolve();
            }); 
        });
    }

    private toYaml(input: Entity | Schema | App | SchemaNoEntities): string {
        return jsyaml.safeDump(input, {
            indent: 4,
            flowLevel: 4,
        });
    }

    private async readFile(fileName: string): Promise<string> {
        return new Promise((resolve, reject) => {
            fs.readFile(fileName, 'utf8', function(err, data) {
                if(err) {
                    console.error(err);
                    reject(err);
                }
                resolve(data);
            }); 
        });
    }


    private async delFile(fileName: string): Promise<string> {
        return new Promise((resolve, reject) => {
            fs.unlink(fileName, function(err) {
                if(err) {
                    console.error(err);
                    reject(err);
                }
                resolve();
            }); 
        });
    }

    async putApp(tenantName: string, appName: string, app: App): Promise<App> {
        await this.writeFile(`/wwwroot/git/formuladb-apps/${appName}/app.yaml`, this.toYaml(app));

        return app;
    }
    async putSchema(tenantName: string, appName: string, schema: Schema): Promise<Schema> {
        await Promise.all(Object.values(schema.entities)
            .map(entity => this.writeFile(`/wwwroot/git/formuladb-apps/${appName}/${entity._id}.yaml`, 
                this.toYaml(schema)))
            .concat(this.writeFile(`/wwwroot/git/formuladb-apps/${appName}/schema.yaml`, this.toYaml({
                _id: schema._id,
                entityIds: Object.keys(schema.entities),
            })))
        );

        return schema;
    }


    public async getSchema(tenantName: string, appName: string): Promise<Schema | null> {
        let schemaNoEntities: SchemaNoEntities = jsyaml.safeLoad(
            await this.readFile(`/wwwroot/git/formuladb-apps/${appName}/schema.yaml`)
        );
        let entitiesStr: string[] = await Promise.all(schemaNoEntities.entityIds.map(entityId => 
            this.readFile(`/wwwroot/git/formuladb-apps/${appName}/${entityId}.yaml`)
        ));
        let entities: Entity[] = entitiesStr.map(entityStr => jsyaml.safeLoad(entityStr));

        let schema: Schema = {
            _id: schemaNoEntities._id,
            entities: entities.reduce((acc, ent, i) => {
                acc[ent._id] = ent; return acc;
            }, {}),
        }
        return schema;
    }

    public getEntities(tenantName: string, appName: string): Promise<Entity[]> {
        return this.getSchema(tenantName, appName).then(s => s ? Object.values(s.entities) : []);
    }

    private getDefaultEntity(path: string): Entity | null {
        switch (path) {
            case $User._id:
                return $User;
            case $Dictionary._id:
                return $Dictionary;
            default:
                return null;
        }
    }

    public async getEntity(tenantName: string, appName: string, entityId: string): Promise<Entity | null> {
        let str = await this.readFile(`/wwwroot/git/formuladb-apps/${appName}/${entityId}.yaml`);
        let entity: Entity = jsyaml.safeLoad(str);
        return entity;
    }

    public async putEntity(tenantName: string, appName: string, entity: Entity): Promise<Entity> {
        await this.writeFile(`/wwwroot/git/formuladb-apps/${appName}/${entity._id}.yaml`, 
        jsyaml.safeDump(entity, {
            indent: 4,
            flowLevel: 4,
        }))

        return entity;
    }

    public async delEntity(tenantName: string, appName: string, entityId: string): Promise<Entity> {
        let schemaNoEntities: SchemaNoEntities = jsyaml.safeLoad(
            await this.readFile(`/wwwroot/git/formuladb-apps/${appName}/schema.yaml`)
        );
        schemaNoEntities.entityIds = schemaNoEntities.entityIds.filter(e => e != entityId);
        await this.writeFile(`/wwwroot/git/formuladb-apps/${appName}/schema.yaml`, this.toYaml(schemaNoEntities));
        
        let entityFile = `/wwwroot/git/formuladb-apps/${appName}/${entityId}.yaml`;
        let entity = await jsyaml.safeLoad(entityFile);
        await this.delFile(entityFile);
        
        return entity;
    }

    async getApp(tenantName: string, appName: string): Promise<App | null> {
        let app: App = jsyaml.safeLoad(
            await this.readFile(`/wwwroot/git/formuladb-apps/${appName}/app.yaml`)
        );
        return app;
    }

    async newPage(newPageName: string, startTemplateUrl: string) {
        let [tenantName, appName, pageName] = startTemplateUrl.split(/\//).filter(x => x);
        let content = await this.readFile(`/wwwroot/git/formuladb-apps/${appName}/${pageName}`);
        await this.writeFile(`/wwwroot/git/formuladb-apps/${appName}/${newPageName}`, content);
    }

    async savePageHtml(pagePath: string, html: string): Promise<void> {
        let [tenantName, appName, pageName] = pagePath.split(/\//).filter(x => x);
        await this.writeFile(`/wwwroot/git/formuladb-apps/${appName}/${pageName}`, html);
    }

    async deletePage(deletedPagePath: string): Promise<void> {
        let [tenantName, appName, pageName] = deletedPagePath.split(/\//).filter(x => x);
        this.delFile(`/wwwroot/git/formuladb-apps/${appName}/${pageName}`);
    }

    async saveMediaObject(tenantName: string, appName: string, mediaType: string, name: string, base64Content: string): Promise<void> {

        let newGcFile = STORAGE.bucket('formuladb-static-assets').file(`${this.envName}/${tenantName}/${appName}/${name}`);

        await new Promise((resolve, reject) => {
            let stream = newGcFile.createWriteStream({
                resumable: false,
                validation: false,
                contentType: "text/html",
                metadata: {
                    'Cache-Control': 'public, max-age=31536000'
                }
            });
            stream.write(new Buffer(base64Content, 'base64'))
            stream.end();
            stream.on("finish", () => resolve(true));
            stream.on("error", reject);
        });

    }

}
