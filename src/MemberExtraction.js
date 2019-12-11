"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var terraformer = require('terraformer');
var terraformerparser = require('terraformer-wkt-parser');
var ldfetch = require('ldfetch');
var TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
var MUNICIPALITYNAMETYPE = 'https://data.vlaanderen.be/ns/adres#Gemeentenaam';
var MUNICIPALITYTYPE = 'https://data.vlaanderen.be/ns/adres#Gemeentenaam';
var STREETTYPE = 'https://data.vlaanderen.be/ns/adres#Gemeentenaam';
var ADDRESSTYPE = 'https://data.vlaanderen.be/ns/adres#Adres';
var POSITIONPREDICATE = "https://data.vlaanderen.be/ns/adres#positie";
var POSITIONPREDICATEWKTREPRESENTATION = "http://www.opengis.net/ont/geosparql#asWKT";
var GEMEENTENAAMPREDICATE = 'https://data.vlaanderen.be/ns/adres#heeftGemeentenaam';
var STREETNAMEPREDICATE = 'https://data.vlaanderen.be/ns/adres#heeftStraatnaam';
var HOUSENUMBERPREDICATE = 'https://data.vlaanderen.be/ns/adres#huisnummer';
var MemberExtraction = /** @class */ (function () {
    function MemberExtraction() {
        var _this = this;
        this.fetcher = new ldfetch({});
        this.extractAddresses = function (quads, ids) {
            var returnMap = new Map();
            var addressEntries = new Array();
            for (var _i = 0, quads_1 = quads; _i < quads_1.length; _i++) {
                var quad = quads_1[_i];
                if (quad.predicate.value === TYPE && quad.object.value === ADDRESSTYPE) {
                    addressEntries.push(quad.subject.value);
                }
                if (ids.indexOf(quad.subject.value) !== -1) {
                    var quadsList = returnMap.get(quad.subject.value);
                    if (quadsList !== undefined) {
                        quadsList.push(quad);
                    }
                    else {
                        returnMap.set(quad.subject.value, [quad]);
                    }
                }
            }
            for (var _a = 0, _b = Array.from(returnMap.keys()); _a < _b.length; _a++) {
                var k = _b[_a];
                if (addressEntries.indexOf(k) === -1) {
                    returnMap.delete(k);
                }
            }
            return returnMap;
        };
        this.extractIds = function (quads, ids) {
            var returnMap = new Map();
            for (var _i = 0, quads_2 = quads; _i < quads_2.length; _i++) {
                var quad = quads_2[_i];
                if (ids.indexOf(quad.subject.value) !== -1) {
                    var quadsList = returnMap.get(quad.subject.value);
                    if (quadsList !== undefined) {
                        quadsList.push(quad);
                    }
                    else {
                        returnMap.set(quad.subject.value, [quad]);
                    }
                }
            }
            return returnMap;
        };
        this.extractAddressInfoFromData = function (data, searchWKTString) {
            if (searchWKTString === void 0) { searchWKTString = null; }
            var collections = data.collections;
            var nodes = data.nodes;
            var quads = data.quads;
            var addresses = [];
            for (var _i = 0, collections_1 = collections; _i < collections_1.length; _i++) {
                var collection = collections_1[_i];
                var positionMapping = new Map();
                var positionIdentifiers = [];
                var addressMap = _this.extractAddresses(quads, collection.members);
                for (var _a = 0, _b = Array.from(addressMap.entries()); _a < _b.length; _a++) {
                    var addressEntry = _b[_a];
                    for (var _c = 0, _d = addressEntry[1]; _c < _d.length; _c++) {
                        var quad = _d[_c];
                        if (quad.predicate.value === POSITIONPREDICATE) {
                            positionIdentifiers.push(quad.object.value);
                            positionMapping.set(quad.subject.value, quad.object.value);
                        }
                    }
                }
                var positionLocationMapping = new Map();
                var positions = _this.extractIds(quads, positionIdentifiers);
                for (var _e = 0, _f = Array.from(positions.entries()); _e < _f.length; _e++) {
                    var positionEntry = _f[_e];
                    for (var _g = 0, _h = positionEntry[1]; _g < _h.length; _g++) {
                        var quad = _h[_g];
                        if (quad.predicate.value === POSITIONPREDICATEWKTREPRESENTATION) {
                            positionLocationMapping.set(quad.subject.value, quad.object.value);
                        }
                    }
                }
                var searchLocation = null;
                if (searchWKTString !== null) {
                    searchLocation = new terraformer.Primitive(terraformerparser.parse(searchWKTString));
                }
                for (var _j = 0, _k = Array.from(addressMap.entries()); _j < _k.length; _j++) {
                    var addressEntry = _k[_j];
                    var id = addressEntry[0];
                    var locationWKT = positionLocationMapping.get(positionMapping.get(addressEntry[0]));
                    var location_1 = terraformerparser.parse(locationWKT);
                    if (searchLocation === null || isContained(searchLocation, location_1)) { //|| isOverlapping(searchLocation, addresslocation)){
                        var number = null;
                        var streetId = null;
                        var gemeenteId = null;
                        for (var _l = 0, _m = addressEntry[1]; _l < _m.length; _l++) {
                            var quad = _m[_l];
                            if (quad.predicate.value === HOUSENUMBERPREDICATE) {
                                number = quad.object.value;
                            }
                            else if (quad.predicate.value === STREETNAMEPREDICATE) {
                                streetId = quad.object.value;
                            }
                            else if (quad.predicate.value === GEMEENTENAAMPREDICATE) {
                                gemeenteId = quad.object.value;
                            }
                        }
                        addresses.push(new Address(id, number, location_1, streetId, gemeenteId));
                    }
                }
            }
            return addresses;
        };
        this.fetchAddressInfo = function (address) { return __awaiter(_this, void 0, void 0, function () {
            var gemeenteQuads, streetQuads;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        gemeenteQuads = this.fetcher.get(address.gemeenteId);
                        streetQuads = this.fetcher.get(address.streetId);
                        return [4 /*yield*/, Promise.all([gemeenteQuads, streetQuads])];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); };
        this.extractMunicipalities = function (quads, ids) {
            var returnMap = new Map();
            var municipalityEntries = new Array();
            for (var _i = 0, quads_3 = quads; _i < quads_3.length; _i++) {
                var quad = quads_3[_i];
                if ((quad.predicate.value === TYPE && quad.object.value === MUNICIPALITYTYPE) ||
                    (quad.predicate.value === TYPE && quad.object.value === MUNICIPALITYNAMETYPE)) {
                    municipalityEntries.push(quad.subject.value);
                }
                if (ids.indexOf(quad.subject.value) !== -1) {
                    var quadsList = returnMap.get(quad.subject.value);
                    if (quadsList !== undefined) {
                        quadsList.push(quad);
                    }
                    else {
                        returnMap.set(quad.subject.value, [quad]);
                    }
                }
            }
            for (var _a = 0, _b = Array.from(returnMap.keys()); _a < _b.length; _a++) {
                var k = _b[_a];
                if (municipalityEntries.indexOf(k) === -1) {
                    returnMap.delete(k);
                }
            }
            return returnMap;
        };
        this.extractMunicipalityInfoFromData = function (data) {
            var collections = data.collections;
            var nodes = data.nodes;
            var quads = data.quads;
            var municipalities = [];
            for (var _i = 0, collections_2 = collections; _i < collections_2.length; _i++) {
                var collection = collections_2[_i];
                var municipalitiesNameMapping = new Map();
                var municipalityIdentifiers = [];
                for (var _a = 0, _b = Array.from(_this.extractMunicipalities(quads, collection.members).entries()); _a < _b.length; _a++) {
                    var addressNameEntry = _b[_a];
                    var label = null;
                    var isDerivedOf = null;
                    for (var _c = 0, _d = addressNameEntry[1]; _c < _d.length; _c++) {
                        var quad = _d[_c];
                        if (quad.predicate.value === "http://www.w3.org/2000/01/rdf-schema#label") {
                            label = quad.object.value;
                        }
                        else if (quad.predicate.value === "https://data.vlaanderen.be/ns/adres#isAfgeleidVan") {
                            isDerivedOf = quad.object.value;
                        }
                    }
                    var municipality = {
                        id: addressNameEntry[0],
                        label: label,
                        isDerivedOf: isDerivedOf,
                    };
                    municipalitiesNameMapping.set(municipality.isDerivedOf, municipality);
                    municipalityIdentifiers.push(municipality.isDerivedOf);
                }
                for (var _e = 0, _f = Array.from(_this.extractIds(quads, municipalityIdentifiers).entries()); _e < _f.length; _e++) {
                    var addressEntry = _f[_e];
                    var municipality = { id: addressEntry[0] };
                    var municipalityName = municipalitiesNameMapping.get(addressEntry[0]);
                    for (var _g = 0, _h = addressEntry[1]; _g < _h.length; _g++) {
                        var quad = _h[_g];
                        if (quad.predicate.value === 'http://www.w3.org/2000/01/rdf-schema#seeAlso') {
                            municipality["seeAlso"] = quad.object.value;
                        }
                        else if (quad.predicate.value === 'rdfs:seeAlso') {
                            municipality["seeAlso"] = quad.object.value;
                        }
                    }
                    municipalityName["isDerivedOf"] = municipality;
                    municipalities.push(municipalityName);
                }
            }
            return municipalities;
        };
        this.extractStreetInfoFromData = function (data) {
            var collections = data.collections;
            var nodes = data.nodes;
            var quads = data.quads;
            var relations = [];
            for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
                var node = nodes_1[_i];
                relations = relations.concat(node.relations);
            }
            var streets = new Array();
            for (var _a = 0, collections_3 = collections; _a < collections_3.length; _a++) {
                var collection = collections_3[_a];
                for (var _b = 0, _c = Array.from(_this.extractIds(quads, collection.members).entries()); _b < _c.length; _b++) {
                    var streetNameEntry = _c[_b];
                    var label = null;
                    var wasAttributedTo = null;
                    for (var _d = 0, _e = streetNameEntry[1]; _d < _e.length; _d++) {
                        var quad = _e[_d];
                        if (quad.predicate.value === "http://www.w3.org/2000/01/rdf-schema#label") {
                            label = quad.object.value;
                        }
                        else if (quad.predicate.value === "http://www.w3.org/ns/prov#wasAttributedTo") {
                            wasAttributedTo = quad.object.value;
                        }
                    }
                    var street = new Street(streetNameEntry[0], label, wasAttributedTo);
                    for (var _f = 0, relations_1 = relations; _f < relations_1.length; _f++) {
                        var relation = relations_1[_f];
                        if (relation.type === "https://w3id.org/tree#EqualThanRelation" && relation.value === street.id) {
                            street.addressCollection = relation.node;
                        }
                    }
                    streets.push(street);
                }
            }
            return streets;
        };
    }
    return MemberExtraction;
}());
exports.MemberExtraction = MemberExtraction;
function isContained(containerObject, containedObject) {
    // if (containedObject instanceof terraformer.Point || containedObject instanceof terraformer.Point)  { console.error("wrong object types for isContained"); return false } // Point cannot contain other polygon or point
    var containerWKTPrimitive = new terraformer.Primitive(containerObject);
    try {
        return (containerWKTPrimitive.contains(containedObject));
    }
    catch (err) {
        return false;
    }
}
function isOverlapping(containerObject, containedObject) {
    // if (containerObject instanceof terraformer.Point || containedObject instanceof terraformer.Point)  { console.error("wrong object types for isOverlapping"); return false } // Point cannot contain other polygon or point
    var containerWKTPrimitive = new terraformer.Primitive(containerObject);
    try {
        return (containerWKTPrimitive.intersects(containedObject));
    }
    catch (err) {
        return false;
    }
}
var Address = /** @class */ (function () {
    function Address(id, number, location, streetId, gemeenteId) {
        this.id = id;
        this.number = number;
        this.location = location;
        this.streetId = streetId;
        this.gemeenteId = gemeenteId;
    }
    return Address;
}());
var Street = /** @class */ (function () {
    function Street(id, label, wasAttributedTo) {
        this.id = id;
        this.label = label;
        this.wasAttributedTo = wasAttributedTo;
    }
    return Street;
}());
