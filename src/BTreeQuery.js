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
/**
 *
 * IMPORTANT NOTICE
 * Addresses are saved as strings, not numbers
 * because there are sometimes weird addresses like 21A.
 *
 */
var BTreeQuery = /** @class */ (function (_super) {
    __extends(BTreeQuery, _super);
    function BTreeQuery() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.parser = new parserClass();
        _this.terminated = false;
        _this.processedIds = [];
        return _this;
    }
    //todo:: being able to continue querying on nodes that are stored in the session.
    BTreeQuery.prototype.query = function (nodeId, value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log("QUERYING BTREE", value);
                this.recursiveQueryNode(nodeId, value, 0);
                return [2 /*return*/];
            });
        });
    };
    BTreeQuery.prototype.recursiveQueryNode = function (currentNodeId, value, level) {
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
                        this.handleEmittingMembers(results, currentNodeId, level);
                        return [2 /*return*/, this.followChildRelations(currentNodeId, results.nodes, value, level + 1)];
                }
            });
        });
    };
    BTreeQuery.prototype.followChildRelations = function (nodeId, nodesMetadata, value, level) {
        return __awaiter(this, void 0, void 0, function () {
            var nodes, _i, nodesMetadata_1, node, relations, intervalMap, _a, _b, intervalEntry, interval;
            return __generator(this, function (_c) {
                if (value === null) {
                    return [2 /*return*/, []];
                }
                nodes = new Array();
                for (_i = 0, nodesMetadata_1 = nodesMetadata; _i < nodesMetadata_1.length; _i++) {
                    node = nodesMetadata_1[_i];
                    if (node.id === nodeId) {
                        relations = node.relations;
                        console.log("relations", relations);
                        intervalMap = this.extractRelationIntervals(relations);
                        for (_a = 0, _b = Array.from(intervalMap.entries()); _a < _b.length; _a++) {
                            intervalEntry = _b[_a];
                            interval = intervalEntry[1];
                            console.log(value, interval['lte'], interval['gt'], value.localeCompare(interval['lte']), value.localeCompare(interval['gt']));
                            if ((interval['lt'] === undefined || value.localeCompare(interval['lt']) < 0) &&
                                (interval['lte'] === undefined || value.localeCompare(interval['lte']) <= 0) &&
                                (interval['gte'] === undefined || value.localeCompare(interval['gte']) >= 0) &&
                                (interval['gt'] === undefined || value.localeCompare(interval['gt']) > 0)) {
                                this.recursiveQueryNode(intervalEntry[0], value, level);
                            }
                        }
                    }
                }
                return [2 /*return*/, nodes];
            });
        });
    };
    BTreeQuery.prototype.extractRelationIntervals = function (relations) {
        var intervals = new Map();
        for (var _i = 0, relations_1 = relations; _i < relations_1.length; _i++) {
            var relation = relations_1[_i];
            if (relation.type === "https://w3id.org/tree#LesserThanRelation") {
                this.addInterval(intervals, relation.node, "lt", relation.value);
            }
            else if (relation.type === "https://w3id.org/tree#LesserOrEqualThanRelation") {
                this.addInterval(intervals, relation.node, "lte", relation.value);
            }
            else if (relation.type === "https://w3id.org/tree#GreaterOrEqualThanRelation") {
                this.addInterval(intervals, relation.node, "gte", relation.value);
            }
            else if (relation.type === "https://w3id.org/tree#GreaterThanRelation") {
                this.addInterval(intervals, relation.node, "gt", relation.value);
            }
        }
        return intervals;
    };
    BTreeQuery.prototype.addInterval = function (intervalMap, node, predicate, value) {
        var _a;
        var interval = intervalMap.get(node);
        if (interval === undefined) {
            intervalMap.set(node, (_a = {}, _a[predicate] = value, _a));
        }
        else {
            intervalMap.get(node)[predicate] = value;
        }
    };
    BTreeQuery.prototype.processId = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.parser.process(id)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    BTreeQuery.prototype.handleEmittingMembers = function (results, searchedNodeId, level) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, node;
            return __generator(this, function (_b) {
                for (_i = 0, _a = results.nodes; _i < _a.length; _i++) {
                    node = _a[_i];
                    if (node.id === searchedNodeId) {
                        node.level = level;
                        this.emit("node", node);
                    }
                }
                this.emit("data", results);
                return [2 /*return*/];
            });
        });
    };
    BTreeQuery.prototype.interrupt = function () {
        console.log("R-Tree query interrupted");
        this.terminated = true;
    };
    return BTreeQuery;
}(EventEmitter));
exports.BTreeQuery = BTreeQuery;
