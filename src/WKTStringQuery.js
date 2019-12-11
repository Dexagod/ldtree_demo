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
var parserClass = require('treebrowser').Parser;
var terraformer = require('terraformer');
var terraformerparser = require('terraformer-wkt-parser');
var EventEmitter = require('events');
var WKTStringQuery = /** @class */ (function (_super) {
    __extends(WKTStringQuery, _super);
    function WKTStringQuery() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.parser = new parserClass();
        _this.terminated = false;
        _this.processedIds = new Array();
        return _this;
    }
    WKTStringQuery.prototype.query = function (collectionId, wktString, session) {
        if (session === void 0) { session = null; }
        return __awaiter(this, void 0, void 0, function () {
            var searchLocation, results, _i, _a, collection, _b, _c, viewRootNodeId;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        searchLocation = new terraformer.Primitive(terraformerparser.parse(wktString));
                        return [4 /*yield*/, this.processId(collectionId)];
                    case 1:
                        results = _d.sent();
                        for (_i = 0, _a = results.collections; _i < _a.length; _i++) {
                            collection = _a[_i];
                            for (_b = 0, _c = collection.views; _b < _c.length; _b++) {
                                viewRootNodeId = _c[_b];
                                console.log("querying wtk string on", collection, viewRootNodeId);
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
    WKTStringQuery.prototype.recursiveQueryNode = function (currentNodeId, searchLocation, followedValue, level) {
        return __awaiter(this, void 0, void 0, function () {
            var results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.terminated) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.processId(currentNodeId)];
                    case 1:
                        results = _a.sent();
                        this.handleEmittingMembers(results, currentNodeId, followedValue, level);
                        this.followChildRelations(currentNodeId, results.nodes, searchLocation, level + 1);
                        return [2 /*return*/];
                }
            });
        });
    };
    WKTStringQuery.prototype.followChildRelations = function (nodeId, nodesMetadata, searchLocation, level) {
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
                        if (!(this.isContained(childValue, searchLocation) || this.isOverlapping(childValue, searchLocation))) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.recursiveQueryNode(relation.node, searchLocation, relation.value, level)];
                    case 3:
                        _c.sent();
                        _c.label = 4;
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
    WKTStringQuery.prototype.isContained = function (containerObject, containedObject) {
        // if (containedObject instanceof terraformer.Point || containedObject instanceof terraformer.Point)  { console.error("wrong object types for isContained"); return false } // Point cannot contain other polygon or point
        var containerWKTPrimitive = new terraformer.Primitive(containerObject);
        try {
            return (containerWKTPrimitive.contains(containedObject));
        }
        catch (err) {
            return false;
        }
    };
    WKTStringQuery.prototype.isOverlapping = function (containerObject, containedObject) {
        // if (containerObject instanceof terraformer.Point || containedObject instanceof terraformer.Point)  { console.error("wrong object types for isOverlapping"); return false } // Point cannot contain other polygon or point
        var containerWKTPrimitive = new terraformer.Primitive(containerObject);
        try {
            return (containerWKTPrimitive.intersects(containedObject));
        }
        catch (err) {
            return false;
        }
    };
    WKTStringQuery.prototype.processId = function (id) {
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
    WKTStringQuery.prototype.handleEmittingMembers = function (results, searchedNodeId, nodeValue, level) {
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
    WKTStringQuery.prototype.interrupt = function () {
        console.log("R-Tree query interrupted");
        this.terminated = true;
    };
    return WKTStringQuery;
}(EventEmitter));
exports.WKTStringQuery = WKTStringQuery;
