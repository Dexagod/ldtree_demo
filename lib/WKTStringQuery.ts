const parserClass = require('treebrowser').Parser
const terraformer = require('terraformer')
const terraformerparser = require('terraformer-wkt-parser')
const EventEmitter = require('events');


export class WKTStringQuery extends EventEmitter {  
  parser = new parserClass()
  terminated = false;
  processedIds : Array<string> = new Array()

  async query(collectionId: string, wktString: string, session = null){
    let searchLocation = new terraformer.Primitive(terraformerparser.parse(wktString)) 
    let results = await this.processId(collectionId)

    for (let collection of results.collections){
      for (let viewRootNodeId of collection.views){
        console.log("querying wtk string on", collection, viewRootNodeId)
        this.handleEmittingMembers(results, viewRootNodeId, null, 0)
        // recursiveQueryNode(viewRootNodeId, searchLocation)
        this.followChildRelations(viewRootNodeId, results.nodes, searchLocation, 0)
      }
    }    
  }

  async recursiveQueryNode(currentNodeId: string, searchLocation: any, followedValue: any, level: number){
    if (this.terminated){ return }
    let results = await this.processId(currentNodeId)
    this.handleEmittingMembers(results, currentNodeId, followedValue, level)
    this.followChildRelations(currentNodeId, results.nodes, searchLocation, level + 1)

  }

  async followChildRelations(nodeId: string, nodesMetadata: any, searchLocation: any, level: number){
    for (let node of nodesMetadata){
      if (node.id === nodeId){
        for (let relation of node.relations){

          if (this.terminated) { return }

          if (relation.type === "https://w3id.org/tree#GeospatiallyContainsRelation"){
            let childValue = terraformerparser.parse(relation.value);
            if (this.isContained(childValue, searchLocation) || this.isOverlapping(childValue, searchLocation)) {
              await this.recursiveQueryNode(relation.node, searchLocation, relation.value, level)
            }
          }
        }
      }
    }
  }


  isContained(containerObject: any, containedObject: any) {
    // if (containedObject instanceof terraformer.Point || containedObject instanceof terraformer.Point)  { console.error("wrong object types for isContained"); return false } // Point cannot contain other polygon or point
    let containerWKTPrimitive = new terraformer.Primitive(containerObject)
    try {
      return (containerWKTPrimitive.contains(containedObject))
    } catch(err){
        return false;
    }
  }

  isOverlapping(containerObject: any, containedObject: any) {
    // if (containerObject instanceof terraformer.Point || containedObject instanceof terraformer.Point)  { console.error("wrong object types for isOverlapping"); return false } // Point cannot contain other polygon or point
    let containerWKTPrimitive = new terraformer.Primitive(containerObject)
    try {
      return (containerWKTPrimitive.intersects(containedObject))
    } catch(err){
        return false;
    }
  }

  async processId(id : string){
    if (this.processedIds.indexOf(id) !== -1){
      return
    }
    this.processedIds.push(id)
    return await this.parser.process(id)
  }



  async handleEmittingMembers(results : any, searchedNodeId : string, nodeValue : any, level : number){
    // for (let collection of results.collections){
    //   this.emit("collection", collection)
    // }

    for (let node of results.nodes){
      if (node.id === searchedNodeId){
        node.value = nodeValue
        node.level = level
        this.emit("node", node)
      }
    }

    this.emit("data", results)

  }

  interrupt(){
    console.log("R-Tree query interrupted")
    this.terminated = true;
  }

}
