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
var express_session_1 = __importDefault(require("express-session"));
var express_1 = __importDefault(require("express"));
var express_async_handler_1 = __importDefault(require("express-async-handler"));
var DomainUserAgent_1 = __importDefault(require("./DomainUserAgent"));
var http_1 = __importDefault(require("http"));
var body_parser_1 = __importDefault(require("body-parser"));
// @ts-ignore
var ssestream_1 = __importDefault(require("ssestream"));
var stream_1 = require("stream");
function makeHttpServer(domainApi, sessionCookieName, sessionStore, sessionSecret) {
    return __awaiter(this, void 0, void 0, function () {
        var app;
        var _this = this;
        return __generator(this, function (_a) {
            app = express_1.default();
            app.use(express_session_1.default({
                name: sessionCookieName,
                secret: sessionSecret,
                store: sessionStore,
                resave: true,
                saveUninitialized: true,
            }));
            app.use(body_parser_1.default.json());
            app.post("/projects", express_async_handler_1.default(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var projectName, userInfo, userAgent, id;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            projectName = req.body.projectName;
                            userInfo = req.session.userInfo;
                            userAgent = new DomainUserAgent_1.default(domainApi, userInfo);
                            return [4 /*yield*/, userAgent.createProject(projectName)];
                        case 1:
                            id = _a.sent();
                            res.end(id);
                            return [2 /*return*/];
                    }
                });
            }); }));
            app.get("/projects", express_async_handler_1.default(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var userInfo, userAgent, projects;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            userInfo = req.session.userInfo;
                            userAgent = new DomainUserAgent_1.default(domainApi, userInfo);
                            return [4 /*yield*/, userAgent.getProjects()];
                        case 1:
                            projects = _a.sent();
                            res.json(projects).end();
                            return [2 /*return*/];
                    }
                });
            }); }));
            app.get("/sse", function (req, res) {
                var sse = new ssestream_1.default(req);
                var notifications = new stream_1.PassThrough({ objectMode: true });
                var userInfo = req.session.userInfo;
                var userAgent = new DomainUserAgent_1.default(domainApi, userInfo);
                userAgent.start().catch(function (err) {
                    console.error(err);
                    res.status(500).end();
                });
                userAgent.on("projects", function () { return notifications.write({ event: "projects", data: "x" }); });
                notifications.pipe(sse).pipe(res);
                req.on("close", function () {
                    notifications.unpipe(sse);
                    userAgent.stop().catch(function (err) { return console.error(err); });
                });
            });
            return [2 /*return*/, http_1.default.createServer(app)];
        });
    });
}
exports.default = makeHttpServer;
//# sourceMappingURL=makeHttpServer.js.map