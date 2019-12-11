"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var MemberExtraction_1 = require("./MemberExtraction");
var parserClass = require('treebrowser').Parser;
var terraformer = require('terraformer');
var terraformerparser = require('terraformer-wkt-parser');
var EventEmitter = require('events');
var TinyQueue = require("tinyqueue");
var extractAddressInfoFromData = new MemberExtraction_1.MemberExtraction().extractAddressInfoFromData;
var KNNQuery = /** @class */ (function (_super) {
    __extends(KNNQuery, _super);
    function KNNQuery() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.MAXKNNITEMS = 50;
        // Eerst alle contained toevoegen
        // dan verste afstand berekenen
        // dan teruggaan en voor alle niet containende nodes kijken wa de afstand is
        // als afstand < 
        _this.parser = new parserClass();
        _this.terminated = false;
        _this.queue = new TinyQueue([], function (a, b) {
            return b.distance - a.distance; // b - a because we want to pop the largest items in the queue
        });
        _this.maxdistance = Infinity;
        _this.processedIds = [];
        return _this;
    }
    KNNQuery.prototype.queryTreeKNN = function (collectionId, long, lat, session) {
        if (session === void 0) { session = null; }
        return __awaiter(this, void 0, void 0, function () {
            var searchLocation, results, _i, _a, collection, _b, _c, viewRootNodeId;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        searchLocation = new terraformer.Primitive({ "type": "Point", "coordinates": [long, lat] });
                        return [4 /*yield*/, this.processId(collectionId)];
                    case 1:
                        results = _d.sent();
                        for (_i = 0, _a = results.collections; _i < _a.length; _i++) {
                            collection = _a[_i];
                            for (_b = 0, _c = collection.views; _b < _c.length; _b++) {
                                viewRootNodeId = _c[_b];
                                this.handleEmittingMembers(results, viewRootNodeId, null, 0);
                                // recursiveQueryNode(viewRootNodeId, searchLocation)
                                this.followChildRelations(viewRootNodeId, results.nodes, searchLocation, 0);
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    KNNQuery.prototype.recursiveQueryNode = function (currentNodeId, searchLocation, followedValue, level) {
        return __awaiter(this, void 0, void 0, function () {
            var results, addresses, _i, addresses_1, address, _a, long, lat, _b, searchlong, searchlat;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this.terminated) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.processId(currentNodeId)];
                    case 1:
                        results = _c.sent();
                        this.handleEmittingMembers(results, currentNodeId, followedValue, level);
                        addresses = extractAddressInfoFromData(results);
                        for (_i = 0, addresses_1 = addresses; _i < addresses_1.length; _i++) {
                            address = addresses_1[_i];
                            _a = address.location.coordinates, long = _a[0], lat = _a[1];
                            _b = searchLocation.coordinates, searchlong = _b[0], searchlat = _b[1];
                            this.addItem(address, getDistancePointPoint(long, lat, searchlong, searchlat));
                        }
                        console.log("results", results.quads.length);
                        return [4 /*yield*/, this.followChildRelations(currentNodeId, results.nodes, searchLocation, level + 1)];
                    case 2:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    KNNQuery.prototype.followChildRelations = function (nodeId, nodesMetadata, searchLocation, level) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, nodesMetadata_1, node, _a, _b, relation, childValue;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _i = 0, nodesMetadata_1 = nodesMetadata;
                        _c.label = 1;
                    case 1:
                        if (!(_i < nodesMetadata_1.length)) return [3 /*break*/, 6];
                        node = nodesMetadata_1[_i];
                        if (!(node.id === nodeId)) return [3 /*break*/, 5];
                        _a = 0, _b = node.relations;
                        _c.label = 2;
                    case 2:
                        if (!(_a < _b.length)) return [3 /*break*/, 5];
                        relation = _b[_a];
                        if (this.terminated) {
                            return [2 /*return*/];
                        }
                        if (!(relation.type === "https://w3id.org/tree#GeospatiallyContainsRelation")) return [3 /*break*/, 4];
                        childValue = terraformerparser.parse(relation.value);
                        if (!this.isContained(childValue, searchLocation)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.recursiveQueryNode(relation.node, searchLocation, relation.value, level)];
                    case 3:
                        _c.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        _a++;
                        return [3 /*break*/, 2];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    KNNQuery.prototype.addItem = function (address, distance) {
        if (this.queue.length < this.MAXKNNITEMS) {
            address.distance = distance;
            this.queue.push(address); // add new address
            if (distance > this.maxdistance) {
                this.maxdistance = distance;
            }
        }
        else {
            if (distance < this.maxdistance) {
                this.queue.pop(); // remove old furthest away address
                address.distance = distance;
                this.queue.push(address); // add new address
                this.maxdistance = this.queue.peek().distance;
            }
        }
    };
    KNNQuery.prototype.isContained = function (containerObject, containedObject) {
        var containerWKTPrimitive = new terraformer.Primitive(containerObject);
        try {
            return (containerWKTPrimitive.contains(containedObject));
        }
        catch (err) {
            return false;
        }
    };
    KNNQuery.prototype.processId = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.processedIds.indexOf(id) !== -1) {
                            return [2 /*return*/];
                        }
                        this.processedIds.push(id);
                        return [4 /*yield*/, this.parser.process(id)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    KNNQuery.prototype.handleEmittingMembers = function (results, searchedNodeId, nodeValue, level) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, node;
            return __generator(this, function (_b) {
                // for (let collection of results.collections){
                //   this.emit("collection", collection)
                // }
                for (_i = 0, _a = results.nodes; _i < _a.length; _i++) {
                    node = _a[_i];
                    if (node.id === searchedNodeId) {
                        node.value = nodeValue;
                        node.level = level;
                        this.emit("node", node);
                    }
                }
                this.emit("data", results);
                return [2 /*return*/];
            });
        });
    };
    KNNQuery.prototype.interrupt = function () {
        console.log("KNN query interrupted");
        this.terminated = true;
    };
    return KNNQuery;
}(EventEmitter));
exports.KNNQuery = KNNQuery;
function getDistancePointPoint(x, y, x2, y2) {
    return HYPOT(x - x2, y - y2);
}
function distancePointBox(x, y, x_min, y_min, x_max, y_max) {
    if (x < x_min) {
        if (y < y_min)
            return HYPOT(x_min - x, y_min - y);
        if (y <= y_max)
            return x_min - x;
        return HYPOT(x_min - x, y_max - y);
    }
    else if (x <= x_max) {
        if (y < y_min)
            return y_min - y;
        if (y <= y_max)
            return 0;
        return y - y_max;
    }
    else {
        if (y < y_min)
            return HYPOT(x_max - x, y_min - y);
        if (y <= y_max)
            return x - x_max;
        return HYPOT(x_max - x, y_max - y);
    }
}
function HYPOT(x, y) { return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)); }
