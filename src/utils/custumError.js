import { StatusCodes } from 'http-status-codes';

export class customError extends Error {
  constructor(message, comingFrom) {
    super(message);

    this.statusCodes = undefined;
    this.status = 'error';
    this.comingFrom = comingFrom;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, customError);
    }
  }

  serializeError() {
    return {
      message: this.message,
      comingFrom: this.comingFrom,
      status: this.status,
      statusCodes: this.statusCodes,
    };
  }
}

export class BadRequestError extends customError {
  statusCodes = StatusCodes.BAD_REQUEST;

  constructor(message, comingFrom) {
    super(message, comingFrom);
  }
}

export class NotAuthenticated extends customError {
  statusCodes = StatusCodes.UNAUTHORIZED;

  constructor(message, comingFrom) {
    super(message, comingFrom);
  }
}

export class FileToLarge extends customError {
  statusCodes = StatusCodes.REQUEST_TOO_LONG;

  constructor(message, comingFrom) {
    super(message, comingFrom);
  }
}
export class NotFoundError extends customError {
  statusCodes = StatusCodes.NOT_FOUND;

  constructor(message, comingFrom) {
    super(message, comingFrom);
  }
}

export class AlreadyExist extends customError {
  statusCodes = StatusCodes.FORBIDDEN;

  constructor(message, comingFrom) {
    super(message, comingFrom);
  }
}
