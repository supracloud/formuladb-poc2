/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Dictionary } from "lodash";
import * as _ from "lodash";

export class DAGNode<T extends {id: string}> {
    constructor(
        private nodeCache: Dictionary<DAGNode<T>>,
        public obj: T, 
        public parent: DAGNode<T> | null = null, 
        public children: DAGNode<T>[] = []) {}

    private checkCycle(parent: DAGNode<T>, obj: T) {
        if (parent.obj.id === obj.id) {
            throw new Error("Node " + JSON.stringify(obj) + " already exists (cyclic dependency?) in this DAG " + JSON.stringify(parent.obj, null, 4));            
        } else if (parent.parent) {
            this.checkCycle(parent.parent, obj);
        }
    }
    public addChild(obj: T): DAGNode<T> {
        this.checkCycle(this, obj);
        let child = this.nodeCache[obj.id];
        if (null == child) {
            child = new DAGNode(this.nodeCache, obj, this);
            this.nodeCache[obj.id] = child;
        } else {
            if (!_.isEqual(child.obj, obj)) throw new Error("Obj with " + JSON.stringify(obj) + " already exists in the DAG but with different properties " + JSON.stringify(child.obj));
        }
        this.children.push(child);
        return child;
    }
}

export class DAG<T extends {id: string}> {
    roots: DAGNode<T>[] = [];
    public nodeCache: Dictionary<DAGNode<T>> = {};

    public addRootIfNotExists(obj: T): DAGNode<T> {
        let ret = this.nodeCache[obj.id];
        if (null == ret) {
            ret = new DAGNode(this.nodeCache, obj);
            this.roots.push(ret);
            this.nodeCache[obj.id] = ret;
        } else {
            if (!_.isEqual(ret.obj, obj)) throw new Error("Obj with " + JSON.stringify(obj) + " already exists in the DAG but with different properties " + JSON.stringify(ret.obj));
        }
        return ret;
    }
    public addRoot(obj: T): DAGNode<T> {
        if (this.nodeCache[obj.id]) throw new Error("Root node " + JSON.stringify(obj) + " already exists in DAG " + JSON.stringify(this.roots.map(x => x.obj), null, 4));
        return this.addRootIfNotExists(obj);
    }

    public addParentChild(parent: T, child: T): DAGNode<T> {
        return this.addRootIfNotExists(parent).addChild(child);
    }

    public async traverseFrom(id: string, callback: (obj: T) => {}) {
        for (let node of this.nodeCache[id].children) {
            await callback(node.obj);
        }
        for (let node of this.nodeCache[id].children) {
            await this.traverseFrom(node.obj.id, callback);
        }
    }
}
