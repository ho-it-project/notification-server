"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NestiaSimulator = void 0;
var fetcher_1 = require("@nestia/fetcher");
var typia_1 = __importDefault(require("typia"));
var NestiaSimulator;
(function (NestiaSimulator) {
    NestiaSimulator.assert = function (props) {
        return {
            param: param(props),
            query: query(props),
            body: body(props),
        };
    };
    var param = function (props) {
        return function (name) {
            return function (type) {
                return function (task) {
                    validate(function (exp) { return "URL parameter \"".concat(name, "\" is not ").concat(exp.expected, " type."); })(props)(type === "uuid"
                        ? uuid(task)
                        : type === "date"
                            ? date(task)
                            : task);
                };
            };
        };
    };
    var query = function (props) {
        return function (task) {
            return validate(function () {
                return "Request query parameters are not following the promised type.";
            })(props)(task);
        };
    };
    var body = function (props) {
        return function (task) {
            return validate(function () { return "Request body is not following the promised type."; })(props)(task);
        };
    };
    var uuid = function (task) {
        return function () {
            var value = task();
            return typia_1.default.assert({ value: value }).value;
        };
    };
    var date = function (task) {
        return function () {
            var value = task();
            return typia_1.default.assert({ value: value }).value;
        };
    };
    var validate = function (message, path) {
        return function (props) {
            return function (task) {
                try {
                    task();
                }
                catch (exp) {
                    if (typia_1.default.is(exp))
                        throw new fetcher_1.HttpError(props.method, props.host + props.path, 400, JSON.stringify({
                            method: exp.method,
                            path: path !== null && path !== void 0 ? path : exp.path,
                            expected: exp.expected,
                            value: exp.value,
                            message: message(exp),
                        }));
                    throw exp;
                }
            };
        };
    };
})(NestiaSimulator || (exports.NestiaSimulator = NestiaSimulator = {}));
