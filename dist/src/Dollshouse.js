"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Character_1 = __importDefault(require("./Character"));
var util_1 = require("util");
var nanoid_1 = __importDefault(require("nanoid"));
var cookie_signature_1 = __importDefault(require("cookie-signature"));
var cookie_1 = require("cookie");
function dollshouse(options) {
    var DollshouseImpl = /** @class */ (function () {
        function DollshouseImpl(isDom, isHttp) {
            this.isDom = isDom;
            this.isHttp = isHttp;
            this.characters = new Map();
            this.stoppables = [];
        }
        DollshouseImpl.prototype.start = function () {
            return __awaiter(this, void 0, void 0, function () {
                var server_1, listen, addr, port;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.domainApi = options.makeDomainApi();
                            if (!this.isHttp) return [3 /*break*/, 3];
                            this.sessionStore = options.makeSessionStore();
                            return [4 /*yield*/, options.makeHttpServer(this.domainApi, options.sessionCookieName, this.sessionStore, options.sessionSecret)];
                        case 1:
                            server_1 = _a.sent();
                            listen = util_1.promisify(server_1.listen.bind(server_1));
                            return [4 /*yield*/, listen()];
                        case 2:
                            _a.sent();
                            this.stoppables.push(function () { return __awaiter(_this, void 0, void 0, function () {
                                var close;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            close = util_1.promisify(server_1.close.bind(server_1));
                                            return [4 /*yield*/, close()];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                            addr = server_1.address();
                            port = addr.port;
                            this.baseUrl = "http://localhost:" + port;
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        DollshouseImpl.prototype.stop = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _i, _a, stoppable;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _i = 0, _a = this.stoppables.reverse();
                            _b.label = 1;
                        case 1:
                            if (!(_i < _a.length)) return [3 /*break*/, 4];
                            stoppable = _a[_i];
                            return [4 /*yield*/, stoppable()];
                        case 2:
                            _b.sent();
                            _b.label = 3;
                        case 3:
                            _i++;
                            return [3 /*break*/, 1];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        DollshouseImpl.prototype.getCharacter = function (characterName) {
            return __awaiter(this, void 0, void 0, function () {
                var makeHttpOrDomainUserAgent, makeUserAgent, character;
                var _this = this;
                return __generator(this, function (_a) {
                    if (this.characters.has(characterName))
                        return [2 /*return*/, this.characters.get(characterName)];
                    makeHttpOrDomainUserAgent = function (userInfo) { return __awaiter(_this, void 0, void 0, function () {
                        var cookie, session, sessionId, signed, clientCookie;
                        return __generator(this, function (_a) {
                            if (this.isHttp) {
                                cookie = {
                                    originalMaxAge: Number.MAX_SAFE_INTEGER,
                                    maxAge: Number.MAX_SAFE_INTEGER,
                                    path: "/",
                                    httpOnly: true,
                                    expires: false,
                                };
                                session = {
                                    userInfo: userInfo,
                                    cookie: cookie
                                };
                                sessionId = nanoid_1.default();
                                this.sessionStore.set(sessionId, session);
                                signed = 's:' + cookie_signature_1.default.sign(sessionId, options.sessionSecret);
                                clientCookie = cookie_1.serialize(options.sessionCookieName, signed);
                                return [2 /*return*/, options.makeHttpUserAgent(this.baseUrl, clientCookie)];
                            }
                            else {
                                return [2 /*return*/, options.makeDomainUserAgent(this.domainApi, userInfo)];
                            }
                            return [2 /*return*/];
                        });
                    }); };
                    makeUserAgent = function (userInfo) { return __awaiter(_this, void 0, void 0, function () {
                        var userAgent, $characterNode;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, makeHttpOrDomainUserAgent(userInfo)];
                                case 1:
                                    userAgent = _a.sent();
                                    if (this.isDom) {
                                        $characterNode = this.makeCharacterNode(characterName, true);
                                        return [2 /*return*/, options.makeDomUserAgent($characterNode, userAgent)];
                                    }
                                    else {
                                        return [2 /*return*/, userAgent];
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    character = new Character_1.default(characterName, makeUserAgent);
                    this.characters.set(characterName, character);
                    return [2 /*return*/, character];
                });
            });
        };
        DollshouseImpl.prototype.makeCharacterNode = function (characterName, keepDom) {
            var _this = this;
            var loc = (typeof window === "object") ? window.location.href : undefined;
            // Prevent previous scenario's URL from interfering
            window.history.pushState(undefined, undefined, loc);
            var div = document.createElement("div");
            div.innerHTML = "\n        <style>\n        * {\n          box-sizing: border-box;\n        }\n        \n        .dot {\n          height: 12px;\n          width: 12px;\n          background-color: #bbb;\n          border-radius: 50%;\n          display: inline-block;\n        }\n        \n        .character {\n          float: right;\n          color: #777777;\n        }\n        \n        .container {\n          border: 3px solid #f1f1f1;\n          border-top-left-radius: 4px;\n          border-top-right-radius: 4px;\n          margin-bottom: 8px;\n        }\n        \n        .top {\n          padding: 10px;\n          background: #f1f1f1;\n          border-top-left-radius: 4px;\n          border-top-right-radius: 4px;\n        }\n        \n        .content {\n          padding: 10px;\n        }\n\n        .spinner {\n          width: 40px;\n          height: 40px;\n        \n          position: relative;\n          margin: 100px auto;\n        }\n        \n        .double-bounce1, .double-bounce2 {\n          width: 100%;\n          height: 100%;\n          border-radius: 50%;\n          background-color: #333;\n          opacity: 0.6;\n          position: absolute;\n          top: 0;\n          left: 0;\n          \n          -webkit-animation: sk-bounce 2.0s infinite ease-in-out;\n          animation: sk-bounce 2.0s infinite ease-in-out;\n        }\n        \n        .double-bounce2 {\n          -webkit-animation-delay: -1.0s;\n          animation-delay: -1.0s;\n        }\n        \n        @-webkit-keyframes sk-bounce {\n          0%, 100% { -webkit-transform: scale(0.0) }\n          50% { -webkit-transform: scale(1.0) }\n        }\n        \n        @keyframes sk-bounce {\n          0%, 100% { \n            transform: scale(0.0);\n            -webkit-transform: scale(0.0);\n          } 50% { \n            transform: scale(1.0);\n            -webkit-transform: scale(1.0);\n          }\n        }\n        </style>\n        <div class=\"container\">\n          <div class=\"top\">\n            <span class=\"dot\"></span>\n            <span class=\"dot\"></span>\n            <span class=\"dot\"></span>\n            <span class=\"character\">" + characterName + "</span>\n          </div>\n        \n          <div class=\"content\">\n            <div class=\"spinner\">\n              <div class=\"double-bounce1\"></div>\n              <div class=\"double-bounce2\"></div>\n            </div>\n          </div>\n        </div>\n      ";
            document.body.appendChild(div);
            if (!keepDom) {
                this.stoppables.push(function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        div.remove();
                        return [2 /*return*/];
                    });
                }); });
            }
            var htmlElement = div.querySelector('.content');
            if (!htmlElement) {
                throw new Error("No HTML Element?");
            }
            return htmlElement;
        };
        return DollshouseImpl;
    }());
    return DollshouseImpl;
}
exports.default = dollshouse;
//# sourceMappingURL=Dollshouse.js.map