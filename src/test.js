const WKTStringQuery = require('./WKTStringQuery')
const KNNQuery = require('./KNNQuery')
const PrefixQuery = require('./PrefixQuery')
const MemberExtraction = require('./MemberExtraction')
const terraformer = require('terraformer')
const terraformerparser = require('terraformer-wkt-parser')


const normalizeString = require('stringnormalizer');




let locationEntryCollection = 'http://193.190.127.240/locationdata/node0.jsonld#collection'
let gemeenteEntryCollection = "http://193.190.127.240/gemeentedata/node0.jsonld#collection"
let streetEntryCollection = "http://193.190.127.240/streetdata/node0.jsonld#collection"

let wktString = "POLYGON((3.6847281484712084 51.06377171235174,3.7890982656587084 51.06377171235174,3.7890982656587084 51.00331867056843,3.6847281484712084 51.00331867056843,3.6847281484712084 51.06377171235174))"
let wktPoint = "POINT( 3.6847281484712084 51.06377171235174 )"
let query = new PrefixQuery.PrefixQuery()
// let extractAddresses = new MemberExtraction().extractAddresses
// let extractIds = new MemberExtraction().extractIds
let extractAddressInfoFromData = new MemberExtraction.MemberExtraction().extractAddressInfoFromData
let fetchAddressInfo = new MemberExtraction.MemberExtraction().fetchAddressInfo

query.on("node", function(node){ console.log(node) } )

query.on("data", async function(data) {
  // let collections = data.collections
  // let nodes = data.nodes
  // let quads = data.quads

  // let addresses = extractAddressInfoFromData(data, wktString)

  // for (let address of addresses){
  //   let [gemeenteQuads, streetQuads] = await fetchAddressInfo(address)
  //   console.log(gemeenteQuads)
  // }


  // for (let collection of collections){
  //   let positionMapping = new Map()
  //   let positionIdentifiers = []
    
  //   let addressMap = extractAddresses(quads, collection.members)
  //   for (let addressEntry of Array.from(addressMap.entries())){
  //     for (let quad of addressEntry[1]){
  //       if (quad.predicate.value === POSITIONPREDICATE){
  //         positionIdentifiers.push(quad.object.value)
  //         positionMapping.set(quad.subject.value, quad.object.value)
  //       }
  //     }
  //   }

  //   let positionLocationMapping = new Map()
  //   let positions = extractIds(quads, positionIdentifiers)
  //   for (let positionEntry of positions.entries()){
  //     for (let quad of positionEntry[1]){
  //       if (quad.predicate.value === POSITIONPREDICATEWKTREPRESENTATION){
  //         positionLocationMapping.set(quad.subject.value, quad.object.value)
  //       }
  //     }
  //   }

  //   let searchLocation = new terraformer.Primitive(terraformerparser.parse(wktString)) 

  //   for (let addressEntry of Array.from(addressMap.entries())){
  //     let id = addressEntry[0]
  //     let locationWKT = positionLocationMapping.get(positionMapping.get(addressEntry[0]))

  //     let addresslocation = terraformerparser.parse(locationWKT);
  //     if (isContained(searchLocation, addresslocation) ){ //|| isOverlapping(searchLocation, addresslocation)){
  //       console.log(id, locationWKT)
  //     }
  //   }
  // }

})
query.query(gemeenteEntryCollection, "Halle")



// let geojson = terraformerparser.parse(wktString)
// let primitive = new terraformer.Primitive(geojson)
// console.log(primitive)
// console.log(primitive.contains)


// var classobj = terraformer.Primitive.prototype;
// console.log(Object.getOwnPropertyNames(classobj).filter(function (x) {
//   return typeof classobj[x] === 'function'
// }));