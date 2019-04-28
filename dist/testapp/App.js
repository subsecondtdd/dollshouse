"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var App = function (_a) {
    var userAgent = _a.userAgent;
    var _b = react_1.default.useState([]), projects = _b[0], setProjects = _b[1];
    var _c = react_1.default.useState(null), error = _c[0], setError = _c[1];
    react_1.default.useEffect(function () {
        userAgent.on("open", updateProjects);
        userAgent.on("projects", updateProjects);
        userAgent.on("error", function (evt) { return setError(new Error("User agent error")); });
        userAgent.start().catch(function (err) { return setError(err); });
        return function () {
            userAgent.stop().catch(function (err) { return setError(err); });
            userAgent.off("error", function (evt) { return setError(new Error("User agent error")); });
            userAgent.off("projects", updateProjects);
            userAgent.off("open", updateProjects);
        };
    }, []);
    function updateProjects() {
        userAgent.getProjects()
            .then(setProjects)
            .catch(setError);
    }
    function createProject() {
        userAgent.createProject("Test Project")
            .catch(setError);
    }
    return react_1.default.createElement("div", null,
        react_1.default.createElement("h1", null, "TestApp"),
        react_1.default.createElement("button", { onClick: createProject }, "Create"),
        react_1.default.createElement("ol", null, projects.map(function (project, n) { return react_1.default.createElement("li", { key: "project-" + n, className: 'project' }, project.projectName); })));
};
exports.default = App;
//# sourceMappingURL=App.js.map