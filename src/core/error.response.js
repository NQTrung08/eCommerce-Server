
const statusCode = require('./statusCode')
const reasonPhrases = require('./reasonPhrases')

class ErrorResponse extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }

}

class ConflictError extends ErrorResponse {

  constructor(message = reasonPhrases.CONFLICT, status = statusCode.CONFLICT) {
    super(message, status)
  }

}

class BadRequestError extends ErrorResponse {
  constructor(message = reasonPhrases.BAD_REQUEST, status = statusCode.BAD_REQUEST) {
    super(message, status)
  }
}


class InternalServerError extends ErrorResponse {
  constructor(message = reasonPhrases.INTERNAL_SERVER_ERROR, status = statusCode.INTERNAL_SERVER_ERROR) {
    super(message, status)
  }
}

class NotFoundError extends ErrorResponse {
  constructor(message = reasonPhrases.NOT_FOUND, status = statusCode.NOT_FOUND) {
    super(message, status)
  }
}

class AuthFailureError extends ErrorResponse {
  constructor(message = reasonPhrases.UNAUTHORIZED, status = statusCode.UNAUTHORIZED) {
    super(message, status)
  }
}

class InvalidError extends ErrorResponse {
  constructor(message = reasonPhrases.UNAUTHORIZED, status = statusCode.UNAUTHORIZED) {
    super(message, status)
  }
}


module.exports = {
  ConflictError,
  BadRequestError,
  InternalServerError,
  AuthFailureError,
  NotFoundError,
  InvalidError,
}