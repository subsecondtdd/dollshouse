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
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
var events_1 = require("events");
var HttpUserAgent = /** @class */ (function (_super) {
    __extends(HttpUserAgent, _super);
    function HttpUserAgent(baseUrl, cookie, fetcher, makeEventSource) {
        var _this = _super.call(this) || this;
        _this.baseUrl = baseUrl;
        _this.cookie = cookie;
        _this.fetcher = fetcher;
        _this.makeEventSource = makeEventSource;
        _this.emitProjects = _this.emitProjects.bind(_this);
        return _this;
    }
    HttpUserAgent.prototype.createProject = function (projectName) {
        return __awaiter(this, void 0, void 0, function () {
            var headers, res, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        headers = {
                            "Content-Type": "application/json"
                        };
                        if (this.cookie) {
                            headers.Cookie = this.cookie;
                        }
                        return [4 /*yield*/, this.fetcher.fetch(this.baseUrl + "/projects", {
                                method: "POST",
                                body: JSON.stringify({
                                    projectName: projectName
                                }),
                                headers: headers
                            })];
                    case 1:
                        res = _a.sent();
                        if (!!res.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, res.text()];
                    case 2:
                        errorMessage = _a.sent();
                        throw new Error(errorMessage);
                    case 3: return [2 /*return*/, res.text()];
                }
            });
        });
    };
    HttpUserAgent.prototype.getProjects = function () {
        return __awaiter(this, void 0, void 0, function () {
            var headers, res, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        headers = {
                            "Content-Type": "application/json"
                        };
                        if (this.cookie) {
                            headers.Cookie = this.cookie;
                        }
                        return [4 /*yield*/, this.fetcher.fetch(this.baseUrl + "/projects", {
                                method: "GET",
                                headers: headers
                            })];
                    case 1:
                        res = _a.sent();
                        if (!!res.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, res.text()];
                    case 2:
                        errorMessage = _a.sent();
                        throw new Error(errorMessage);
                    case 3: return [2 /*return*/, res.json()];
                }
            });
        });
    };
    HttpUserAgent.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.es = this.makeEventSource(this.baseUrl + "/sse", this.cookie);
                this.es.onopen = function () { return _this.emit("open"); };
                this.es.onerror = function (evt) { return _this.emit("error", evt.data); };
                this.es.addEventListener("projects", this.emitProjects);
                return [2 /*return*/];
            });
        });
    };
    HttpUserAgent.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.es.removeEventListener("projects", this.emitProjects);
                this.es.close();
                this.es = null;
                return [2 /*return*/];
            });
        });
    };
    HttpUserAgent.prototype.emitProjects = function () {
        this.emit("projects");
    };
    return HttpUserAgent;
}(events_1.EventEmitter));
exports.default = HttpUserAgent;
//# sourceMappingURL=HttpUserAgent.js.map