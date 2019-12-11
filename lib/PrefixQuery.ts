const parserClass = require('treebrowser').Parser
const EventEmitter = require('events');

const normalizeString = require('stringnormalizer');


export class PrefixQuery extends EventEmitter {  
  parser = new parserClass()
  terminated = false;
  processedIds : Array<string> = []

  //todo:: being able to continue querying on nodes that are stored in the session.
  async query(collectionId : any, prefixString : any, session : any = null){
    prefixString = normalizeString(prefixString)
    if (session !== null){
      let newNodes = Array();
      for (let nodelist of session.nodes){
        for (let node of await nodelist){
          newNodes.push(this.followChildRelations(node.id, [node], prefixString, node.level, collectionId, node.followedValue))
        }
      }
      session.nodes = newNodes
    } else {
      let results = await this.processId(collectionId)
      session = {}
      session.nodes = new Array();
      for (let collection of results.collections){
        if (collection.id === collectionId){
          for (let viewRootNodeId of collection.views){
            if (this.terminated){ return null }

            this.handleEmittingMembers(results, collectionId, viewRootNodeId, null, 0)
            session.nodes.push(this.followChildRelations(viewRootNodeId, results.nodes, prefixString, 0, collectionId, ""))
          }
        }
      } 
    }
    if (this.terminated){ return null }
    await Promise.all(session.nodes)
    let nodeList = []
    for (let nodes of session.nodes){
      for (let node of nodes){
        nodeList.push(node)
      }
    }   
    return session;
  }

  async recursiveQueryNode(currentNodeId : any, prefixString : any, followedValue : any, level : any, collectionId : any) : Promise<Array<any>> {
    if (this.terminated){ return [] }
    let results = await this.processId(currentNodeId)
    this.handleEmittingMembers(results, collectionId, currentNodeId, followedValue, level)
    return this.followChildRelations(currentNodeId, results.nodes, prefixString, level + 1, collectionId, followedValue)
  }

  async followChildRelations(nodeId : any, nodesMetadata : any, prefixString : any, level : any, collectionId : any, followedValue : any) : Promise<Array<any>> {
    let nodes = new Array()
    for (let node of nodesMetadata){
      if (node.id === nodeId){  
        let followedValueNormalized = normalizeString(followedValue)
        if (followedValueNormalized === prefixString || followedValueNormalized.startsWith(prefixString)){
          node.followedValue = followedValueNormalized
          node.level = level - 1
          return [node]
        }

        if (node.relations.map( (relation:any) => relation.type).indexOf("https://w3id.org/tree#PrefixRelation") === -1){
          node.followedValue = followedValueNormalized
          node.level = level - 1
          return [node]
        }

        for (let relation of node.relations){

          if (this.terminated) { return [] }
          if (relation.type === "https://w3id.org/tree#PrefixRelation"){
            let normalizedRelationValue = normalizeString(relation.value)
            if (prefixString.startsWith(normalizedRelationValue)){
              nodes = nodes.concat(await this.recursiveQueryNode(relation.node, prefixString, relation.value, level, collectionId))
            }
          }
        }
      }
    }
    return nodes;
  }

  async processId(id : any){
    return await this.parser.process(id)
  }

  async handleEmittingMembers(results : any, collectionId : any, searchedNodeId : any, nodeValue : any, level : any){
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
