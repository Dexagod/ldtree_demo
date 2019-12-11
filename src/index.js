const normalizeString = require('stringnormalizer');

const jsonld = require('jsonld')
const terraformer = require('terraformer')
const terraformerparser = require('terraformer-wkt-parser')
const WKTStringQuery = require('./WKTStringQuery')
const PrefixQuery = require('./PrefixQuery')
const BTreeQuery = require('./BTreeQuery')


const MemberExtraction = require('./MemberExtraction')
const extractAddressInfoFromData = new MemberExtraction.MemberExtraction().extractAddressInfoFromData
const extractMunicipalityInfoFromData = new MemberExtraction.MemberExtraction().extractMunicipalityInfoFromData
const extractStreetInfoFromData = new MemberExtraction.MemberExtraction().extractStreetInfoFromData

const chroma = require('chroma-js')

// const parser = new require('treebrowser').Parser()


/********************
 * GLOBAL VARIABLES * 
 ********************/

var map;
var markers;
var drawnNodes;
var drawnItems;

var runningQuerys = []
let locationCollectionId = 'http://193.190.127.240/locationdata/node0.jsonld#Collection'
let municipalityCollectionId = 'http://193.190.127.240/gemeentedata/node0.jsonld#Collection'
let streetCollectionId = 'http://193.190.127.240/streetdata/node0.jsonld#Collection'

var currentMunicipalityId = null
var currentStreet = null



window.onload = function(data) {main()}

async function main() {
  let interruptButton = document.getElementById("interruptbutton");
  interruptButton.addEventListener('click', function(click){ interrupt() }, false)
  
  // Create map and center.
  map = L.map('map', {
    zoomControl: false
  }).setView([50.4, 4.3], 8);
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoicnViZW5kZWRlY2tlciIsImEiOiJjamxpMGt4YWYwN2JpM3BsbG5sNWtoMnowIn0.iSu3huC-hUJimNgsIbEhAA', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets'
  }).addTo(map);

  // Setup feature groups
  // DrawItems for the user-drawn items
  drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);

  // DrawnNodes for the user-drawn nodes
  drawnNodes = new L.FeatureGroup();
  map.addLayer(drawnNodes);

  // Markers for the markers
  markers = new L.MarkerClusterGroup({
    spiderfyOnMaxZoom: false,
    chunkedLoading: true,
    disableClusteringAtZoom: 16
  });
  map.addLayer(markers)

  // Change position of HUD elements to topright.
  L.control.zoom({
    position: 'topright'
  }).addTo(map);

  var options = {
    position: 'topright',
    draw: {
      circle: false,
      polyline: false,
      circlemarker: false,
      polygon: false
    },
  };

  // Add leaflet drawcontrol
  var drawControl = new L.Control.Draw(options);
  drawControl.setStyle
  map.addControl(drawControl);
  L.Control.RemoveAll = L.Control.extend({
    options: {
      position: 'topright',
    },
    onAdd: function (map) {
      var controlDiv = L.DomUtil.create('div', 'leaflet-draw-toolbar leaflet-bar');
      L.DomEvent
        .addListener(controlDiv, 'click', L.DomEvent.stopPropagation)
        .addListener(controlDiv, 'click', L.DomEvent.preventDefault)
        .addListener(controlDiv, 'click', function () {
          drawnItems.clearLayers();
          drawnNodes.clearLayers();
          markers.clearLayers();
        });

      var controlUI = L.DomUtil.create('a', 'leaflet-draw-edit-remove', controlDiv);
      controlUI.title = 'Remove All Polygons';
      controlUI.href = '#';
      return controlDiv;
    }
  });
  var removeAllControl = new L.Control.RemoveAll();
  map.addControl(removeAllControl);

  // Eventhandler for user drawn rectangle
  map.on('draw:created', async function (e) {
    if (e.layerType == "rectangle") {

      // Clear board
      clearDrawnNodes();
      clearMarkers();
      clearDrawnItems();
      var myStyle = {
        fillOpacity: 0.1,
        opacity: 0.2,
      };

      var type = e.layerType,
        layer = e.layer,
        wkt = new Wkt.Wkt();

      layer.setStyle(myStyle)
      drawnItems.addLayer(layer);

      wkt.fromObject(layer);
      var userWKT = wkt.write();
      console.log(userWKT)

      // Execute location query with the rectangle;
      queryTreeWKTString(userWKT)
    } else if (e.layerType == "marker") {
      // Execute nearest neighbor query;
      let lat = e["layer"]["_latlng"]["lat"]
      let lng = e["layer"]["_latlng"]["lng"]

      queryTreeKNN(lat, lng)
    }
  });
  map.on('draw:edited', function (e) {
    clearDrawnNodes();
    clearMarkers();

    while (e.hasOwnProperty("layers") || e.hasOwnProperty("_layers")) {
      if (e.hasOwnProperty("layers")) {
        e = e["layers"]
      } else {
        e = e["_layers"]
      }

    }
    var layer = e[Object.keys(e)[0]];
    var wkt = new Wkt.Wkt();

    wkt.fromObject(layer);
    var userWKT = wkt.write();


    queryTreeWKTString(userWKT)
  });


  autocomplete(document.getElementById("municipalityInput"));
  autocomplete(document.getElementById("streetInput"));



  /*execute a function when someone writes in the text field:*/
  document.getElementById("municipalityInput").addEventListener("input", async function(e) {
    newestQuery = e.target.value;
    queryAutocompletionMunicipality(newestQuery);
  });
  
  /*execute a function when someone writes in the text field:*/
   document.getElementById("streetInput").addEventListener("input", async function(e) {
    newestQuery = e.target.value;
    queryAutocompletionStreet(newestQuery);
  });

  document.getElementById("addressNumberInput").addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
      let newestQueryValue = event.target.value;
      console.log('searching for address number', newestQueryValue)
      queryAddressBTree(newestQueryValue);
    }
  });

  // document.getElementById("addressNumberInput").addEventListener("input", async function(e) {
  //   newestQuery = e.target.value;
  //   queryAddressBTree(newestQuery);
  // });
}

function interrupt(){
  for (let query of runningQuerys){
    query.interrupt()
  }
}

async function prepareQuery(){
  currentItems = new Set()
  clearAll();
  await awaitRunningQuerys();
}


let colors = chroma.scale(['green', 'orange', 'blue', 'purple', 'red', 'brown', 'black']).colors(8)


function drawWKT(wktString, level, node) {
  if (level > 7) {
    level = 7
  }

  var myStyle = {
    "color": colors[level],
    "weight": 1,
    opacity: 0.0,
  };
  
  var poly = L.geoJSON(toJson(wktString), {
    style: myStyle,
  });

  if (node !== null){
    poly.bindPopup("Node<br>id: " + node.id + "<br>level: " + node.level + "<br>amount of relations: " + node.relations.length + "<br>remainingItems: " + node.remainingItems)
  }
  poly.addTo(drawnNodes)

}

function drawWKTMarker(lat, long, item, options = null) {

  if (item === null) return 
  
  let divicon = new L.DivIcon({
                className: 'point-div-span',
                html: '<span class="point-div-span" style="color: blue;">'+item.number+'</span>'
            })
  let marker = L.marker([lat, long], {icon: divicon})

  marker.bindPopup('Adres<br>gemeente: ' + item.gemeenteId + "<br>straatnaam: " + item.streetId + "<br>huisnummer: " + item.number);
  markers.addLayer(marker);
}

function toJson(wktString) {
  var wkt = new Wkt.Wkt();
  wkt.read(wktString);
  return wkt.toJson();
}

var sidebarcount = 0;
let sidebarItems = []
function addSideBarItem(title, keyValPairs, onclickfct = null) {
  if (sidebarcount > 30) {
    return
  }
  sidebarcount += 1;

  let sidebarContainer = document.getElementById("autocomplete-items")

  let sidebarItem = document.createElement("div");
  let sidebarItemTitle = document.createElement("h5");

  sidebarItem.className = "sidebarItem";
  sidebarItemTitle.className = "sidebarItemTitle";

  sidebarItemTitle.innerHTML = title

  sidebarItem.appendChild(sidebarItemTitle);

  for (var key in keyValPairs) {
    let sidebarItemP = document.createElement("p");
    sidebarItemP.className = "sidebarItemP";
    sidebarItemP.innerHTML = key + ": " + keyValPairs[key]

    sidebarItem.appendChild(sidebarItemP);
  }

  var clickfct = onclickfct
  if (onclickfct = null){
    sidebarItem.onclick = function (e) {
      map.setView([keyValPairs["lat"], keyValPairs["long"]], 20);
    }
  } else {
    sidebarItem.onclick = clickfct
  }
  

  sidebarContainer.appendChild(sidebarItem);

}

function clearSideBarItems() {
  let sidebarContainer = document.getElementById("autocomplete-items")
  sidebarContainer.innerHTML = ""
  sidebarcount = 0;
}

function autocomplete(inp, field) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus = -1;
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
    var x = document.getElementById("autocomplete-items");
    if (x) x = x.getElementsByTagName("div");
    if (e.keyCode == 40) {
      /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
      currentFocus++;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 38) {
      //up
      /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
      currentFocus--;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 13) {
      /*If the ENTER key is pressed, prevent the form from being submitted,*/
      e.preventDefault();
      if (currentFocus > -1) {
        /*and simulate a click on the "active" item:*/
        if (x) x[currentFocus].click();
      }
    }
  });
  function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = x.length - 1;
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
      }
  }
  function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
          x[i].parentNode.removeChild(x[i]);
      }
      }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function(e) {
      closeAllLists(e.target);
  });
}

var currentItems = new Set()
async function queryAutocompletionMunicipality(newsearch){
  console.log("querying autocomplete municipality", newsearch)

  clearMunicipality()
  await prepareQuery()
  let query = new PrefixQuery.PrefixQuery()
  // query.on("node", node => { console.log(node) } )
  query.on("data", data => {
    let municipalitydata = extractMunicipalityInfoFromData(data)

    municipalitydata.sort(function(a, b) { return a.label.localeCompare(b.label)})

    for (let municipality of municipalitydata){
      if (normalizeString(municipality.label).startsWith(normalizeString(newsearch))){
        if (! currentItems.has(municipality.id)){
          currentItems.add(municipality.id) 
          addSideBarItem(municipality.label, {
            "id": municipality.id,
            "isDerivedOf": municipality.isDerivedOf
          }, function(e){
            clearSideBarItems();
            pickMunicipality(municipality)
          })
        }
      }
    }
  })
  executeQuery(query.query(municipalityCollectionId, newsearch))
}

let prevAddedStreets = []
let prevStreetSearch = null
let prevSessionStreet = null
async function queryAutocompletionStreet(newsearch){
  newsearch = newsearch.trim()
  clearStreet()
  await prepareQuery()

  let query = new PrefixQuery.PrefixQuery()
  // query.on("node", node => { console.log(node) } )
  query.on("data", data => {
    let streets = extractStreetInfoFromData(data)

    streets.sort(function(a, b) { return a.label.localeCompare(b.label)})

    for (let street of streets){
      if (normalizeString(street.label).startsWith(normalizeString(newsearch))){
        if (! currentItems.has(street.id)){
          currentItems.add(street.id) 
          addStreetSidebarItem(street)
          prevAddedStreets.push(street)
        }
      }
    }
  })
  if (! newsearch.startsWith(prevStreetSearch)){
    prevSessionStreet = null;
  }
  prevStreetSearch = newsearch

  updateStreets(newsearch)

  prevSessionStreet = executeQuery(query.query(streetCollectionId, newsearch, await prevSessionStreet))
}

function updateStreets(newsearch){
  let newPrevAddedStreets = []
  for (let street of prevAddedStreets){
    if (normalizeString(street.label).trim().startsWith(normalizeString(newsearch))){
      if (currentMunicipalityId === null || currentMunicipalityId === street.wasAttributedTo){
        if (! currentItems.has(street.id)){
          currentItems.add(street.id) 
          addStreetSidebarItem(street)
        }
      }
      newPrevAddedStreets.push(street)
    }
  }
  prevAddedStreets = newPrevAddedStreets
}

function addStreetSidebarItem(street){
  addSideBarItem(street.label, null, 
    function(e) { 
      if (street.addressCollection !== undefined && street.addressCollection !== null){
        clearSideBarItems();
        currentStreet = street;
        queryAddressBTree();
      }
    }
  )
}


async function queryAddressBTree(addressNumber = null){
  let street = currentStreet
  if (street === null || street === undefined) {return}
  let rootNode = street.addressCollection
  // await prepareQuery()
  let query = new BTreeQuery.BTreeQuery()
  // query.on("node", node => { console.log(node) } )
  query.on("data", data => {
    console.log("data", data)
    let addresses = extractAddressInfoFromData(data)
    addresses = addresses.sort(function(a, b){return a.number - b.number})
    for (let address of addresses){
      let [long, lat] = address.location.coordinates;
      let str = address.gemeenteId + " - " + address.streetId + " - " + address.number;
      let newoptions = {
        riseOnHover: true,
        title: str
      }
      drawWKTMarker(lat, long, address, newoptions)
      addSideBarItem(str, {
        "long": long,
        "lat": lat
      }, function (e) {
        map.setView([lat, long], 20);
      })
    }
  })
  executeQuery(query.query(rootNode, addressNumber))
}

async function queryTreeWKTString(wktString, session = null) {
  await prepareQuery()

  drawWKT(wktString, 8, null)

  let searchArea = new terraformer.Primitive(terraformerparser.parse(wktString))
  let query = new WKTStringQuery.WKTStringQuery()

  query.on("node", node => {
    let level = node["level"]
    if (node.value !== null){
      drawWKT(node.value, level, node)
    }
  })

  query.on("data", data => {
    let addresses = extractAddressInfoFromData(data, wktString)
    for (let address of addresses){
      if (searchArea.contains(address.location)) {
        let [long, lat] = address.location.coordinates;
        let str = address.gemeenteId + " - " + address.streetId + " - " + address.number;
        let newoptions = {
          riseOnHover: true,
          title: str
        }
        drawWKTMarker(lat, long, address, newoptions)
        addSideBarItem(str, {
          "long": long,
          "lat": lat
        }, function (e) {
          map.setView([lat, long], 20);
        })
      }
    }
  })

  executeQuery(query.query(locationCollectionId, wktString))
}

var KNNCOUNT = 100;
var knnmembers = []
async function queryTreeKNN(lat, long) {
  await prepareQuery()
  let query;
  query = new ldtreeBrowser.KNNQuery(lat, long, KNNCOUNT)
  query.on('member', async function(member){
      let ldobj = await jsonld.fromRDF(member)
      ldobj = ldobj[0]
      let memlong = ldobj["http://www.w3.org/2003/01/geo/wgs84_pos#long"][0]["@value"] 
      let memlat = ldobj["http://www.w3.org/2003/01/geo/wgs84_pos#lat"][0]["@value"] 

      //TODO:: Use Hoversin distance?? -> small surfaces overkill?
      var point = new terraformer.Point(memlong, memlat);
      let distance = Math.sqrt(Math.pow(long - memlong, 2) + Math.pow(lat - memlat, 2))

      let wrapper = {}
      wrapper.member = ldobj;
      wrapper.distance = distance

      processMemberKNN(wrapper)
  })

  knnmembers = [];
  let session = await treeclient.executeQuery(query)
  return session;
}

let currentDraw = null;
async function processMemberKNN(wrapper) {
  knnmembers.push(wrapper)
  knnmembers.sort(function (a, b) {
    return a.distance - b.distance
  })
  if (knnmembers.indexOf(wrapper) < KNNCOUNT) {
    await (currentDraw);
    currentDraw = drawknnmembers(knnmembers.slice(0, KNNCOUNT));
  }

}

var lastDrawn = null;
async function drawknnmembers(toDraw) {
  if (toDraw === lastDrawn) {
    return
  }
  lastDrawn = toDraw;
  clearMarkers();
  clearSideBarItems();
  for (var i = 0; i < toDraw.length; i++) {
    let ldobj = toDraw[i]
    let member = ldobj.member
    let str;
    if (member.hasOwnProperty(["http://xmlns.com/foaf/0.1/name"])) {
      str = member["http://xmlns.com/foaf/0.1/name"][0]["@value"];
    } else if (member.hasOwnProperty(["http://example.com/terms#name"])) {
      str = member["http://example.com/terms#name"][0]["@value"];
    } else {
      str = "No name provided"
    }
    let long = member["http://www.w3.org/2003/01/geo/wgs84_pos#long"][0]["@value"]
    let lat = member["http://www.w3.org/2003/01/geo/wgs84_pos#lat"][0]["@value"]
    var point = new terraformer.Point(long, lat);
    let newoptions = {
      riseOnHover: true,
      title: str
    }
    drawWKTMarker(lat, long, null, newoptions)
    addSideBarItem(str, {
      "long": long,
      "lat": lat
    })
  }
  return
}

async function executeQuery(promise){
  document.getElementById("interruptbutton").innerHTML = "Interrupt running queries"
  runningQuerys.push(promise)
  awaitRunningQuerys().then( (e) => {
    document.getElementById("interruptbutton").innerHTML ="No running queries"
  })
  return await promise
}

async function awaitRunningQuerys() {
  await Promise.all(runningQuerys)
  runningQuerys = [];
  return;
}

function clearMarkers() {
  addedMarkerLocations = {}
  markers.clearLayers();
}

function clearDrawnItems() {
  drawnItems.clearLayers();
}

function clearDrawnNodes() {
  drawnNodes.clearLayers();
}

function clearAll() {
  clearMarkers()
  clearDrawnItems();
  clearDrawnNodes();
  clearSideBarItems();
}



function pickMunicipality(municipality){
  console.log("SETTING MUNICIPALITY", municipality)
  document.getElementById("municipalityInput").value = municipality.label
  currentMunicipalityId = municipality["isDerivedOf"].id
  updateStreets(prevStreetSearch)
}

function clearMunicipality(){
  currentMunicipalityId = null
  updateStreets(prevStreetSearch)
}

function clearStreet(){
  currentStreet = null
}





