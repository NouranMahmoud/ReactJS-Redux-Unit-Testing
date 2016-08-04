/* @flow */

// http://stackoverflow.com/a/32749533
export default class BaseCustomError extends Error {
  extra:any
  constructor(message:any, extra:any) {
    super(message)
    this.name = this.constructor.name
    this.message = message
    if (Error.captureStackTrace && typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor)
    }
    else {
      this.stack = (new Error(message)).stack
    }
    if (extra) {
      this.extra = extra
    }
  }
}
