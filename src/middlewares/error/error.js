"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
var mongoose_1 = require("mongoose");
var mongodb_1 = require("mongodb");
var ApiError_1 = require("../../utils/ApiError");
var jsonwebtoken_1 = require("jsonwebtoken");
var handleCastErrorDB = function (err) {
    var message = "Invalid ".concat(err.path, ": ").concat(err.value, ".");
    return new ApiError_1.default(400, message);
};
var handleDuplicateFieldsDB = function (err) {
    var value = err.message.match(/(["'])(\\?.)*?\1/)[0];
    var message = "Duplicate field value: ".concat(value, ". Please use another value!");
    return new ApiError_1.default(400, message);
};
var handleValidationErrorDB = function (err) {
    var errors = Object.values(err.errors).map(function (el) { return el.message; });
    var message = "Invalid input data. ".concat(errors.join('. '));
    return new ApiError_1.default(400, message);
};
var handleJWTError = function () { return new ApiError_1.default(401, 'Please log in again!'); };
var sendErrorDev = function (err, req, res) {
    res.status(err.statusCode).json({
        success: false,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};
var sendErrorProd = function (err, req, res) {
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }
    return res.status(500).json({
        success: false,
        message: 'Something went very wrong!',
    });
};
var errorHandler = function (err, req, res, next) {
    err.statusCode = err.statusCode || 500;
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    }
    else if (process.env.NODE_ENV === 'production') {
        var error = __assign({}, err);
        if (err instanceof mongoose_1.Error.CastError)
            error = handleCastErrorDB(err);
        if (err instanceof mongodb_1.MongoError && err.code === 11000)
            error = handleDuplicateFieldsDB(err);
        if (err instanceof mongoose_1.Error.ValidationError)
            error = handleValidationErrorDB(err);
        if (err instanceof jsonwebtoken_1.JsonWebTokenError)
            error = handleJWTError();
        sendErrorProd(error, req, res);
    }
};
exports.errorHandler = errorHandler;
