"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DomainApi = /** @class */ (function () {
    function DomainApi() {
        this.projects = [];
    }
    DomainApi.prototype.createProject = function (userInfo, projectName) {
        if (!userInfo)
            throw new Error('createProject not allowed');
        var project = { projectName: projectName };
        this.projects.push(project);
    };
    DomainApi.prototype.getProjects = function (userInfo) {
        if (!userInfo)
            throw new Error('getProjects not allowed');
        return this.projects;
    };
    return DomainApi;
}());
exports.default = DomainApi;
//# sourceMappingURL=DomainApi.js.map