export declare class McpWordError extends Error {
    readonly code: string;
    readonly details?: unknown;
    constructor(message: string, code?: string, details?: unknown);
}
export declare class ValidationError extends McpWordError {
    constructor(message: string, details?: unknown);
}
export declare class SecurityError extends McpWordError {
    constructor(message: string, details?: unknown);
}
export declare class FileOperationError extends McpWordError {
    constructor(message: string, details?: unknown);
}
export declare class XmlManipulationError extends McpWordError {
    constructor(message: string, details?: unknown);
}
//# sourceMappingURL=errors.d.ts.map