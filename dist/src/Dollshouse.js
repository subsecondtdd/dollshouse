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
var fs_1 = __importDefault(require("fs"));
function dollshouse(options) {
    var DollshouseImpl = /** @class */ (function () {
        function DollshouseImpl(configuration) {
            this.configuration = configuration;
            this.characters = new Map();
            this.stoppables = [];
            this.domainApi = options.makeDomainApi();
        }
        DollshouseImpl.prototype.start = function () {
            return __awaiter(this, void 0, void 0, function () {
                var server_1, listen, addr, port;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.configuration.http) return [3 /*break*/, 3];
                            this.sessionStore = options.makeSessionStore();
                            return [4 /*yield*/, options.makeHttpServer(this.domainApi, options.sessionCookieName, this.sessionStore, options.sessionSecret)];
                        case 1:
                            server_1 = _a.sent();
                            listen = util_1.promisify(server_1.listen.bind(server_1));
                            return [4 /*yield*/, listen()];
                        case 2:
                            _a.sent();
                            this.stoppables.push(function () { return __awaiter(_this, void 0, void 0, function () {
                                var stop, close;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            stop = server_1.stop || server_1.close;
                                            close = util_1.promisify(stop.bind(server_1));
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
        /**
         * Creates a new agent that can be used to interact with the system. This method can be called directly from
         * unit testing tools like Mocha or Jest, but if you're using Cucumber, we recommend registering a parameter type
         * that calls {@link getCharacter} instead.
         *
         * @param userInfo - the userInfo to use to identify a character.
         * @param characterName - the name of the character (can be undefined unless you're using a DOM).
         */
        DollshouseImpl.prototype.makeCharacterAgent = function (userInfo, characterName) {
            return __awaiter(this, void 0, void 0, function () {
                var httpOrDomainCharacterAgent, characterAgent, $characterNode;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.makeHttpOrDomainCharacterAgent(userInfo)];
                        case 1:
                            httpOrDomainCharacterAgent = _a.sent();
                            if (!this.configuration.dom) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.makeCharacterNode(characterName, false)];
                        case 2:
                            $characterNode = _a.sent();
                            return [4 /*yield*/, options.makeDomCharacterAgent($characterNode, httpOrDomainCharacterAgent)];
                        case 3:
                            characterAgent = _a.sent();
                            return [3 /*break*/, 5];
                        case 4:
                            characterAgent = httpOrDomainCharacterAgent;
                            _a.label = 5;
                        case 5: return [4 /*yield*/, characterAgent.start()];
                        case 6:
                            _a.sent();
                            this.stoppables.push(characterAgent.stop.bind(characterAgent));
                            return [2 /*return*/, characterAgent];
                    }
                });
            });
        };
        DollshouseImpl.prototype.context = function (modifyContext) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, modifyContext(this.domainApi)];
                });
            });
        };
        DollshouseImpl.prototype.getCharacter = function (characterName) {
            if (this.characters.has(characterName)) {
                return this.characters.get(characterName);
            }
            var character = new Character_1.default(characterName, this.makeCharacterAgent.bind(this));
            this.characters.set(characterName, character);
            return character;
        };
        DollshouseImpl.prototype.makeHttpOrDomainCharacterAgent = function (userInfo) {
            return __awaiter(this, void 0, void 0, function () {
                var cookie, session, sessionId, signed, clientCookie;
                return __generator(this, function (_a) {
                    if (this.configuration.http) {
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
                        return [2 /*return*/, options.makeHttpCharacterAgent(this.baseUrl, clientCookie)];
                    }
                    else {
                        return [2 /*return*/, options.makeDomainCharacterAgent(this.domainApi, userInfo)];
                    }
                    return [2 /*return*/];
                });
            });
        };
        DollshouseImpl.prototype.makeCharacterNode = function (characterName, keepDom) {
            return __awaiter(this, void 0, void 0, function () {
                var loc, div, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            loc = (typeof window === "object") ? window.location.href : undefined;
                            // Prevent previous scenario's URL from interfering
                            window.history.pushState(undefined, undefined, loc);
                            div = document.createElement("div");
                            _a = div;
                            return [4 /*yield*/, fs_1.default.promises.readFile(__dirname + "/browser.html", 'utf-8')];
                        case 1:
                            _a.innerHTML = (_b.sent());
                            document.body.appendChild(div);
                            if (!keepDom) {
                                this.stoppables.push(function () { return div.remove(); });
                            }
                            div.querySelector('.title').innerHTML = characterName;
                            return [2 /*return*/, div.querySelector('.content')];
                    }
                });
            });
        };
        return DollshouseImpl;
    }());
    return DollshouseImpl;
}
exports.default = dollshouse;
//# sourceMappingURL=Dollshouse.js.map