'use strict';

const StatusCode = require('./statusCode')
const ReasonPhrases = require('./reasonPhrases')

class SuccessReponse {
  constructor({message, statusCode = StatusCode.OK, reasonPhrases = ReasonPhrases.OK, data = {}}) {
    this.message = !message ? reasonPhrases : message;
    this.status = statusCode
    this.data = data;
  }

  send(res, headers = {}) {
    return res.status(this.status).json(this)  
  }

}

class OK extends SuccessReponse {
  constructor({message, data}) {
    super({message, data})
  }
}

class CREATED extends SuccessReponse {
  constructor({message, data, statusCode = StatusCode.CREATED, reasonPhrases = ReasonPhrases.CREATED}) {
    super({message, data, statusCode, reasonPhrases})
  }
}


module.exports = {
  OK,
  CREATED,
  SuccessReponse
}