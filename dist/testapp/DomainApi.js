"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TestDomainApi = /** @class */ (function () {
    function TestDomainApi() {
        this.projects = [];
    }
    TestDomainApi.prototype.createProject = function (userInfo, projectName) {
        if (!userInfo)
            throw new Error('createProject not allowed');
        var project = { projectName: projectName };
        this.projects.push(project);
    };
    TestDomainApi.prototype.getProjects = function (userInfo) {
        if (!userInfo)
            throw new Error('getProjects not allowed');
        return this.projects;
    };
    return TestDomainApi;
}());
exports.default = TestDomainApi;
//# sourceMappingURL=DomainApi.js.map