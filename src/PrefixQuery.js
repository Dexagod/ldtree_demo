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
var EventEmitter = require('events');
var normalizeString = require('stringnormalizer');
var PrefixQuery = /** @class */ (function (_super) {
    __extends(PrefixQuery, _super);
    function PrefixQuery() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.parser = new parserClass();
        _this.terminated = false;
        _this.processedIds = [];
        return _this;
    }
    //todo:: being able to continue querying on nodes that are stored in the session.
    PrefixQuery.prototype.query = function (collectionId, prefixString, session) {
        if (session === void 0) { session = null; }
        return __awaiter(this, void 0, void 0, function () {
            var newNodes, _i, _a, nodelist, _b, _c, node, results, _d, _e, collection, _f, _g, viewRootNodeId, nodeList, _h, _j, nodes, _k, nodes_1, node;
            return __generator(this, function (_l) {
                switch (_l.label) {
                    case 0:
                        prefixString = normalizeString(prefixString);
                        if (!(session !== null)) return [3 /*break*/, 7];
                        newNodes = Array();
                        _i = 0, _a = session.nodes;
                        _l.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        nodelist = _a[_i];
                        _b = 0;
                        return [4 /*yield*/, nodelist];
                    case 2:
                        _c = _l.sent();
                        _l.label = 3;
                    case 3:
                        if (!(_b < _c.length)) return [3 /*break*/, 5];
                        node = _c[_b];
                        newNodes.push(this.followChildRelations(node.id, [node], prefixString, node.level, collectionId, node.followedValue));
                        _l.label = 4;
                    case 4:
                        _b++;
                        return [3 /*break*/, 3];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        session.nodes = newNodes;
                        return [3 /*break*/, 9];
                    case 7: return [4 /*yield*/, this.processId(collectionId)];
                    case 8:
                        results = _l.sent();
                        session = {};
                        session.nodes = new Array();
                        for (_d = 0, _e = results.collections; _d < _e.length; _d++) {
                            collection = _e[_d];
                            if (collection.id === collectionId) {
                                for (_f = 0, _g = collection.views; _f < _g.length; _f++) {
                                    viewRootNodeId = _g[_f];
                                    if (this.terminated) {
                                        return [2 /*return*/, null];
                                    }
                                    this.handleEmittingMembers(results, collectionId, viewRootNodeId, null, 0);
                                    session.nodes.push(this.followChildRelations(viewRootNodeId, results.nodes, prefixString, 0, collectionId, ""));
                                }
                            }
                        }
                        _l.label = 9;
                    case 9:
                        if (this.terminated) {
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, Promise.all(session.nodes)];
                    case 10:
                        _l.sent();
                        nodeList = [];
                        for (_h = 0, _j = session.nodes; _h < _j.length; _h++) {
                            nodes = _j[_h];
                            for (_k = 0, nodes_1 = nodes; _k < nodes_1.length; _k++) {
                                node = nodes_1[_k];
                                nodeList.push(node);
                            }
                        }
                        return [2 /*return*/, session];
                }
            });
        });
    };
    PrefixQuery.prototype.recursiveQueryNode = function (currentNodeId, prefixString, followedValue, level, collectionId) {
        return __awaiter(this, void 0, void 0, function () {
            var results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.terminated) {
                            return [2 /*return*/, []];
                        }
                        return [4 /*yield*/, this.processId(currentNodeId)];
                    case 1:
                        results = _a.sent();
                        this.handleEmittingMembers(results, collectionId, currentNodeId, followedValue, level);
                        return [2 /*return*/, this.followChildRelations(currentNodeId, results.nodes, prefixString, level + 1, collectionId, followedValue)];
                }
            });
        });
    };
    PrefixQuery.prototype.followChildRelations = function (nodeId, nodesMetadata, prefixString, level, collectionId, followedValue) {
        return __awaiter(this, void 0, void 0, function () {
            var nodes, _i, nodesMetadata_1, node, followedValueNormalized, _a, _b, relation, normalizedRelationValue, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        nodes = new Array();
                        _i = 0, nodesMetadata_1 = nodesMetadata;
                        _e.label = 1;
                    case 1:
                        if (!(_i < nodesMetadata_1.length)) return [3 /*break*/, 6];
                        node = nodesMetadata_1[_i];
                        if (!(node.id === nodeId)) return [3 /*break*/, 5];
                        followedValueNormalized = normalizeString(followedValue);
                        if (followedValueNormalized === prefixString || followedValueNormalized.startsWith(prefixString)) {
                            node.followedValue = followedValueNormalized;
                            node.level = level - 1;
                            return [2 /*return*/, [node]];
                        }
                        if (node.relations.map(function (relation) { return relation.type; }).indexOf("https://w3id.org/tree#PrefixRelation") === -1) {
                            node.followedValue = followedValueNormalized;
                            node.level = level - 1;
                            return [2 /*return*/, [node]];
                        }
                        _a = 0, _b = node.relations;
                        _e.label = 2;
                    case 2:
                        if (!(_a < _b.length)) return [3 /*break*/, 5];
                        relation = _b[_a];
                        if (this.terminated) {
                            return [2 /*return*/, []];
                        }
                        if (!(relation.type === "https://w3id.org/tree#PrefixRelation")) return [3 /*break*/, 4];
                        normalizedRelationValue = normalizeString(relation.value);
                        if (!prefixString.startsWith(normalizedRelationValue)) return [3 /*break*/, 4];
                        _d = (_c = nodes).concat;
                        return [4 /*yield*/, this.recursiveQueryNode(relation.node, prefixString, relation.value, level, collectionId)];
                    case 3:
                        nodes = _d.apply(_c, [_e.sent()]);
                        _e.label = 4;
                    case 4:
                        _a++;
                        return [3 /*break*/, 2];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, nodes];
                }
            });
        });
    };
    PrefixQuery.prototype.processId = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.parser.process(id)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    PrefixQuery.prototype.handleEmittingMembers = function (results, collectionId, searchedNodeId, nodeValue, level) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, node;
            return __generator(this, function (_b) {
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
    PrefixQuery.prototype.interrupt = function () {
        console.log("R-Tree query interrupted");
        this.terminated = true;
    };
    return PrefixQuery;
}(EventEmitter));
exports.PrefixQuery = PrefixQuery;
