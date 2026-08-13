"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XmlManipulationError = exports.FileOperationError = exports.SecurityError = exports.ValidationError = exports.McpWordError = void 0;
class McpWordError extends Error {
    code;
    details;
    constructor(message, code = 'INTERNAL_ERROR', details) {
        super(message);
        this.name = 'McpWordError';
        this.code = code;
        this.details = details;
    }
}
exports.McpWordError = McpWordError;
class ValidationError extends McpWordError {
    constructor(message, details) {
        super(message, 'INVALID_INPUT', details);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class SecurityError extends McpWordError {
    constructor(message, details) {
        super(message, 'SECURITY_VIOLATION', details);
        this.name = 'SecurityError';
    }
}
exports.SecurityError = SecurityError;
class FileOperationError extends McpWordError {
    constructor(message, details) {
        super(message, 'FILE_OPERATION_FAILED', details);
        this.name = 'FileOperationError';
    }
}
exports.FileOperationError = FileOperationError;
class XmlManipulationError extends McpWordError {
    constructor(message, details) {
        super(message, 'XML_MANIPULATION_FAILED', details);
        this.name = 'XmlManipulationError';
    }
}
exports.XmlManipulationError = XmlManipulationError;
//# sourceMappingURL=errors.js.map