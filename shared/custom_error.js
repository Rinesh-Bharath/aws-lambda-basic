export class AuthorizationError extends Error {
  constructor (message, statusCode) {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = statusCode;
  }
}

export class ValidationError extends Error {
  constructor (message, statusCode) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = statusCode;
  }
}

export class MenuOrderError extends Error {
  constructor (message, statusCode) {
    super(message);
    this.name = 'MenuOrderError';
    this.statusCode = statusCode;
  }
}
