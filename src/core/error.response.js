
const statusCode = require('./statusCode')
const reasonPhrases = require('./reasonPhrases')

class ErrorReponse extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }

}

class ConflictError extends ErrorReponse {

  constructor(message = reasonPhrases.CONFLICT, status = statusCode.CONFLICT) {
    super(message, status)
  }

}

class BadRequestError extends ErrorReponse {

  constructor(message = reasonPhrases.BAD_REQUEST, status = statusCode.BAD_REQUEST) {
    super(message, status)
  }
}


class InternalServerError extends ErrorReponse {
  constructor(message = reasonPhrases.INTERNAL_SERVER_ERROR, status = statusCode.INTERNAL_SERVER_ERROR) {
    super(message, status)
  }
}

module.exports = {
  ConflictError,
  BadRequestError,
  InternalServerError,
}