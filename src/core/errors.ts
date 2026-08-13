export class McpWordError extends Error {
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, code: string = 'INTERNAL_ERROR', details?: unknown) {
    super(message);
    this.name = 'McpWordError';
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends McpWordError {
  constructor(message: string, details?: unknown) {
    super(message, 'INVALID_INPUT', details);
    this.name = 'ValidationError';
  }
}

export class SecurityError extends McpWordError {
  constructor(message: string, details?: unknown) {
    super(message, 'SECURITY_VIOLATION', details);
    this.name = 'SecurityError';
  }
}

export class FileOperationError extends McpWordError {
  constructor(message: string, details?: unknown) {
    super(message, 'FILE_OPERATION_FAILED', details);
    this.name = 'FileOperationError';
  }
}

export class XmlManipulationError extends McpWordError {
  constructor(message: string, details?: unknown) {
    super(message, 'XML_MANIPULATION_FAILED', details);
    this.name = 'XmlManipulationError';
  }
}
