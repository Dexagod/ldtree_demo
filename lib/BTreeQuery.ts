const parserClass = require('treebrowser').Parser
const EventEmitter = require('events');

const normalizeString = require('stringnormalizer');

/**
 * 
 * IMPORTANT NOTICE
 * Addresses are saved as strings, not numbers
 * because there are sometimes weird addresses like 21A.
 * 
 */

export class BTreeQuery extends EventEmitter {  
  parser = new parserClass()
  terminated = false;
  processedIds : Array<string> = []

  //todo:: being able to continue querying on nodes that are stored in the session.
  async query(nodeId : any, value: any){
    console.log("QUERYING BTREE", value)
    this.recursiveQueryNode(nodeId, value, 0)
  }

  async recursiveQueryNode(currentNodeId : any, value : any, level : any) : Promise<Array<any>> {
    if (this.terminated){ return [] }
    let results = await this.processId(currentNodeId)
    this.handleEmittingMembers(results, currentNodeId, level)
    return this.followChildRelations(currentNodeId, results.nodes, value, level + 1)
  }

  async followChildRelations(nodeId : any, nodesMetadata : any, value : any, level : any) : Promise<Array<any>> {
    if (value === null) { return [] }
    let nodes = new Array()
    for (let node of nodesMetadata){
      if (node.id === nodeId){  
        
        let relations = node.relations
        console.log("relations", relations)
        let intervalMap = this.extractRelationIntervals(relations)

        for (let intervalEntry of Array.from(intervalMap.entries())){
          let interval = intervalEntry[1]
          console.log(value, interval['lte'], interval['gt'], value.localeCompare(interval['lte']), value.localeCompare(interval['gt']) )
          if ((interval['lt'] === undefined || value.localeCompare(interval['lt']) < 0) &&
            (interval['lte'] === undefined || value.localeCompare(interval['lte']) <= 0) &&
            (interval['gte'] === undefined || value.localeCompare(interval['gte']) >= 0) &&
            (interval['gt'] === undefined || value.localeCompare(interval['gt']) > 0))
          {
            this.recursiveQueryNode(intervalEntry[0], value, level)
          }
        }
      }
    }
    return nodes;
  }

  extractRelationIntervals(relations : Array<any>){
    let intervals = new Map();
    for (let relation of relations){
      if (relation.type === "https://w3id.org/tree#LesserThanRelation"){
        this.addInterval(intervals, relation.node, "lt", relation.value)
      } else if (relation.type === "https://w3id.org/tree#LesserOrEqualThanRelation"){
        this.addInterval(intervals, relation.node, "lte", relation.value)
      } else if (relation.type === "https://w3id.org/tree#GreaterOrEqualThanRelation"){
        this.addInterval(intervals, relation.node, "gte", relation.value)
      } else if (relation.type === "https://w3id.org/tree#GreaterThanRelation"){
        this.addInterval(intervals, relation.node, "gt", relation.value)
      } 
    }
    return intervals;
  }

  addInterval(intervalMap : Map<any, any>, node : any, predicate : string, value : any){
    let interval = intervalMap.get(node)
    if (interval === undefined){
      intervalMap.set(node, { [predicate] : value})
    } else {
      intervalMap.get(node)[predicate] = value
    }
  }

  async processId(id : any){
    return await this.parser.process(id)
  }

  async handleEmittingMembers(results : any, searchedNodeId : any, level : any){
    for (let node of results.nodes){
      if (node.id === searchedNodeId){
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
