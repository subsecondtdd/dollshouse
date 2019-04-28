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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var nanoid_1 = __importDefault(require("nanoid"));
var events_1 = require("events");
var DomainApi = /** @class */ (function (_super) {
    __extends(DomainApi, _super);
    function DomainApi() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.projects = new Map();
        return _this;
    }
    DomainApi.prototype.createProject = function (userInfo, projectName) {
        if (!userInfo) {
            throw new Error('createProject not allowed');
        }
        var project = { projectName: projectName };
        var id = nanoid_1.default();
        this.projects.set(id, project);
        this.emit("projects");
        return id;
    };
    DomainApi.prototype.getProjects = function (userInfo) {
        if (!userInfo) {
            throw new Error('getProjects not allowed');
        }
        return Array.from(this.projects.values());
    };
    return DomainApi;
}(events_1.EventEmitter));
exports.default = DomainApi;
//# sourceMappingURL=DomainApi.js.map