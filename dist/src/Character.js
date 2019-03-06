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
Object.defineProperty(exports, "__esModule", { value: true });
var Character = /** @class */ (function () {
    function Character(name, makeUserAgent) {
        this.name = name;
        this.makeUserAgent = makeUserAgent;
        this.memory = new Map();
    }
    /**
     * Remember something
     *
     * @param key the name of the thing to remember
     * @param value what to remember
     */
    Character.prototype.remember = function (key, value) {
        this.memory.set(key, value);
    };
    /**
     * Recall something previously remembered
     *
     * @param key the name of the thing to recall
     * @return the value that was recalled
     * @throws Error if nothing can be recalled.
     */
    Character.prototype.recall = function (key) {
        if (!this.memory.has(key)) {
            throw new Error(this.name + " does not recall anything about " + key);
        }
        return this.memory.get(key);
    };
    /**
     * Attempts to perform an action on behalf of the character.
     *
     * @param action a function that has a side-effect.
     */
    Character.prototype.attemptsTo = function (action) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!this.userAgent) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, this.makeUserAgent(this.userInfo)];
                    case 1:
                        _a.userAgent = _b.sent();
                        _b.label = 2;
                    case 2: return [4 /*yield*/, action(this.userAgent)];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Queries the userAgent.
     *
     * @param inspection a function that is passed the view model and returns a result derived from it.
     */
    Character.prototype.query = function (inspection) {
        if (!this.userAgent) {
            throw new Error("No viewModel. [" + this.name + "] must attemptTo an action first");
        }
        return inspection(this.userAgent);
    };
    return Character;
}());
exports.default = Character;
//# sourceMappingURL=Character.js.map