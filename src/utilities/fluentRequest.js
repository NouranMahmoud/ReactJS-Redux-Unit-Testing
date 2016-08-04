/* @flow */

// This package wsa significantly influenced by https://github.com/haoxins/fetch.io.
// Differences are semantic, type safety and the addition of mock creation.

// A good fetch-focused blog: // https://davidwalsh.name/fetch
import type {
  RequestIssueReportType,
  MapToUrlType,
  MapToStringType
} from 'interfaces/CommonTypes'
import RequestIssue from 'errors/RequestIssue'

import 'whatwg-fetch'  // isomorphic-fetch contains the browser-specific whatwg-fetch
import _debug from 'debug'
import urlUtil, {Url} from 'url'
import assign from 'lodash/assign'
import isUndefined from 'lodash/isUndefined'
import isEmpty from 'lodash/isEmpty'
import isObject from 'lodash/isObject'
import isString from 'lodash/isString'
import each from 'lodash/each'
import transform from 'lodash/transform'
import includes from 'lodash/includes'
// import fetchTime from 'promise-time'
import {promiseTime as fetchTime} from 'utilities/promisePlugins'

export type MapToHeaderType = MapToStringType
export type MapToQueryType = MapToStringType

export type OptionsType = {
  afterJSON: ? Function,
  afterRequest: ? Function,
  beforeRequest: ? Function,
  cache: ? string,
  corsMode: ? string,
  credentials: ? string,
  jsonErrorHandler: ? Function,
  httpErrorHandler: ? Function,
  headers: ? MapToHeaderType,
  httpMethod: ? string,
  isMocking: ?boolean,
  queryParams: ?MapToQueryType,
  rootContextKey: ? string // Only provide in ctor Options; not setOptions()
}

const debugUrl                = _debug("reusable:fluentRequest:url")
const debugMocking            = _debug("reusable:fluentRequest:mocking")
const debugRequestTime        = _debug("reusable:fluentRequest:time")
const defaultRootContext:Url  = urlUtil.parse('http://localhost:8080')
const contextMap:MapToUrlType = {
  'default': defaultRootContext
}
let serviceChainFailNumber    = 0

export const setRootContext = (key:string, rootContext:?Url):?Url => {
  key = key || 'default'
  const priorContext = getRootContext(key)
  if (!rootContext) {
    delete contextMap[key]
  }
  else {
    contextMap[key] = rootContext
  }
  return priorContext
}

export const getRootContext = (key:? string):? Url => {
  return contextMap[key || 'default'] || null
}

function getPrettyStackTrace(stack:string):string {
  let prettyStackTrace = stack
  // Cut off junk on front of stack string.
  each(['/internal/', 'at eval (', 'Error\n'], (startOffsetStr:string):?boolean => {
    let start = stack.indexOf(startOffsetStr)
    if (start > -1) {
      start += startOffsetStr.length
      prettyStackTrace = stack.substring(start)
      return false
    }
  })

  // Cut off junk on end of stack string.
  each([')', '\n'], (endOffsetStr:string):?boolean => {
    const end = prettyStackTrace.indexOf(endOffsetStr)
    if (end > -1) {
      prettyStackTrace = prettyStackTrace.substring(0, end)
      return false
    }
  })
  return prettyStackTrace
}

export const responseFail  = (reason:any, message:?string):string => {
  reason = (reason || '')
  message = (message || '')
  try {
    if (reason.skipLogging) {
      return ''
    }

    const serviceChain = reason.serviceChain === undefined
      ? serviceChainFailNumber++ : reason.serviceChain

    if (isObject(reason.message)) {
      message = JSON.stringify(reason.message, null, 2)
    }

    if (reason instanceof Error) {
      message = Error.prototype.name +
                '(' + serviceChain + '): ' +
                message
      message += '\n' + reason.message
      if (isUndefined(reason.serviceChain)) {
        message += '\n' + reason.stack
      }
    }
    else if (typeof reason === 'string') {
      message = reason
    }
    else {
      message = ""
    }
    message += '\n'

    let stack = null
    if (Error.captureStackTrace && typeof Error.captureStackTrace === 'function') {
      let stackTrace = {}
      Error.captureStackTrace(stackTrace, responseFail)
      stack = stackTrace.stack
    }
    else {
      stack = (new Error(message)).stack
    }
    message += 'Stack: ' + getPrettyStackTrace(stack)
    if (reason instanceof Object) {
      reason.serviceChain = serviceChain
    }
  }
  catch (e) {
    message +=
      "Uh-oh! Sumptin' went bad in logging an error! This is embarrassing...\n" +
      e.message
  }
  finally {
    console.error(message)
  }
  return message
}

// For organizations that embed error status within the response JSON.  The JSON has to be
// consulted along with HTTP error code/status.
const _defaultStatusInJsonHandler:Function = (response:Object):Promise => {
  return new Promise((resolve:Function, reject:Function):any /* Promise */ => {
    const contentType = response.headers.get("content-type")
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return response.json()
        .then((json:any):Promise => {
          const jsonStatusOk = json.status === undefined || json.status
          // If the response HTTP status code is not in the 'ok' range (200's)
          // or the status flag in the JSON (curses you FPNG!) isn't OK,
          // toss an error with as much data associated with the error that
          // is available.
          if (!response.ok || !jsonStatusOk) {
            const requestIssueReport:RequestIssueReportType = {
              reqUrl:           urlUtil.parse(response.url || '//url-missing/'),
              statusCode:       response.status,
              statusText:       response.statusText,
              errorCode:        json.errorCode,
              errorMessageText: json.errorMessageText,
              infoMessageText:  json.infoMessageText,
              warnMessageText:  json.warnMessageText
            }
            reject(new RequestIssue(requestIssueReport))
          }
          // Oh! Sweet. All good. Just resolve the model (sans messages & error codes)
          resolve(json.model || json)
        })
        .catch((e:Error):Promise => {
          // Probably caused by response.json() parsing illegal JSON.
          reject(e)
        })
    }
    else if (!response.ok) {
      // For the 500's where the error coming back may not have any 'content-type'
      // header.
      reject(new RequestIssue({
        reqUrl:     urlUtil.parse(response.url || '//url-missing/'),
        statusCode: response.status,
        statusText: response.statusText
      }))
    }
    else {
      reject(new RequestIssue({
        reqUrl:     urlUtil.parse(response.url || '//url-missing/'),
        statusCode: 799,
        statusText: "Wrong error handler! The service isn't returning JSON upon success."
      }))
    }
  })
}

// Hmmm.... this is a whole lot easier... a simple header check.
const _defaultHttpErrorHandler:Function = (response:Object):Object => {
  if (!response.ok) {
    throw new RequestIssue({
      reqUrl:     urlUtil.parse(response.url || '//url-missing/'),
      statusCode: response,
      statusText: response.statusText
    })
  }
  return response
}

const isStatusInJson = false
export const defaultOpts:OptionsType = {
  afterJSON:        null,
  afterRequest:     null,
  beforeRequest:    null,
  cache:            'no-cache',
  corsMode:         'cors',
  credentials:      'omit',
  jsonErrorHandler: isStatusInJson ? _defaultStatusInJsonHandler : _defaultHttpErrorHandler,
  httpErrorHandler: _defaultHttpErrorHandler,
  headers:          { 'Accept': 'application/json' },
  httpMethod:       'GET',
  isStatusInJson:   isStatusInJson,
  isMocking:        false,
  queryParams:      null,
  rootContextKey:   'default'
}

const methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

const _normalizeOptions = (options:OptionsType) => {
  if (options.httpMethod) {
    options.httpMethod = options.httpMethod.trim().toUpperCase()

    if (options.httpMethod && !includes(methods, options.httpMethod)) {
      throw Error('Illegal HTTP method: `' + options.httpMethod + '`')
    }
  }

  options.isMocking = options.isMocking || __MOCK__

  const headers = options.headers
  each(headers, (headerValue:string, headerName:string) => {
    let lowerCase = headerName.toLowerCase()
    if (headerName !== lowerCase) {
      headers[lowerCase] = headerValue
      delete headers[headerName]
    }
  })
}

const _stringify = (obj:?MapToStringType = {}):string => {
  return transform(obj || {}, (result:Array<string>, value:string, key:string):Array<string> => {
    const keyValueProp = key + '=' + value
    result[0] += isEmpty(result[0]) ? keyValueProp : '&' + keyValueProp
    return result
  }, [''])[0]
}

export class Request {

  constructor(url:Url, options:OptionsType = {}) {
    _normalizeOptions(options)

    this.opts = assign({}, defaultOpts, options)

    const rootContext = getRootContext(this.opts.rootContextKey)
    url.pathname = (rootContext.pathname || '') + (url.pathname || '')
    this.url = urlUtil.parse(urlUtil.resolve(rootContext, url))

    if (this.opts.queryParams) {
      this.setQueryParams(this.opts.queryParams)
    }
  }

  setOptions(options:OptionsType):Request {
    if (options.rootContextKey) {
      console.warn("Set rootContextKey in ctor options only; ignored by fluent setOptions()")
      delete options.rootContextKey
    }
    _normalizeOptions(options)

    this.opts = assign({}, this.opts, options)
    return this
  }

  setOption(key:string, value:string):Request {
    if (key === 'rootContextKey') {
      console.warn("Set rootContextKey in ctor options; ignored by fluent setOption()")
      return
    }
    const optionObj = {}
    optionObj[key] = value
    _normalizeOptions(optionObj)
    this.opts[key] = value
  }

  getOptions():OptionsType {
    return this.opts || {}
  }

  getUrl():Url {
    return this.url
  }

  setHeaders(headers:MapToHeaderType):Request {
    each(headers, (header:string, headerKey:string) => {
      this.setHeader(headerKey, header)
    })
    return this
  }

  setHeader(headerKey:string, value:string):Request {
    this.opts.headers[headerKey.toLowerCase()] = value
    return this
  }

  setMimeType(type:string):Request {
    switch (type) {
      case 'json':
        type = 'application/json; charset=utf-8'
        break
      case 'form':
      case 'urlencoded':
        type = 'application/x-www-form-urlencoded; charset=utf-8'
        break
    }

    this.opts.headers['content-type'] = type

    return this
  }

  getMimeType():?string {
    return this.opts.headers['content-type']
  }

  isMimeType(typeToCheck:string):boolean {
    const currentType:?string = this.getMimeType()
    switch (typeToCheck) {
      case 'json':
        return currentType === 'application/json; charset=utf-8'
      case 'form':
      case 'urlencoded':
        return currentType === 'application/x-www-form-urlencoded; charset=utf-8'
      default:
        return false
    }
  }

  setQueryParams(queryParams:MapToQueryType):Request {
    let newQueryParams = _stringify(queryParams)
    if (newQueryParams) {
      newQueryParams = (this.url.query ? '&' : '?') + newQueryParams

      this.url = urlUtil.parse(this.url.format() + newQueryParams)
    }
    return this
  }

  setQueryParam(queryKey:string, queryValue:string):Request {
    const newQueryParams = (this.url.query ? '&' : '?') +
                           queryKey + '=' + queryValue
    this.url = urlUtil.parse(this.url.format() + newQueryParams)
    return this
  }

  setPayload(payload:any):Request {
    if (isObject(payload) && isObject(this._payload)) {
      this._payload = assign(this._payload, payload)
    }
    else if (typeof payload === 'string') {
      const type = this.getMimeType()

      if (!type) {
        this.setMimeType('urlencoded')
      }

      if (this.isMimeType('urlencoded')) {
        this._payload = this._payload ? this._payload + '&' + payload : payload
      }
      else {
        this._payload = (this._payload || '') + payload
      }
    }
    else {
      this._payload = payload
    }

    return this
  }

  appendFormData(key:any, value:?string):Request {
    if (!(this._payload instanceof FormData)) {
      this._payload = new FormData()
    }

    this._payload.append(key, value)

    return this
  }

  // mockedResponseData is responsible for including necessary headers.
  // I.e.: 'content-type'
  mock(mockedResponseData:any):Request {
    this.opts.isMocking = true
    this.opts.mockData = mockedResponseData
    return this
  }

  execute():any /* Promise */ {
    const { opts } = this
    const { httpMethod, beforeRequest, afterResponse } = opts
    opts.method = httpMethod
    opts.mode = opts.corsMode
    try {
      if (!includes(['GET', 'HEAD', 'OPTIONS'], httpMethod)) {
        if (this._payload instanceof FormData) {
          opts.body = this._payload
        }
        else if (isObject(this._payload) && this.isMimeType('json')) {
          opts.body = JSON.stringify(this._payload)
        }
        else if (isObject(this._payload)) {
          opts.body = _stringify(this._payload)
        }
        else {
          opts.body = this._payload
        }
      }
      else {
        delete opts.headers['content-type']
      }

      if (beforeRequest) {
        const isCanceled = !beforeRequest(this.url, opts.body)
        if (isCanceled) {
          return Promise.reject(new Error('request canceled by beforeRequest'))
        }
      }

      if (debugUrl.enabled) {
        debugUrl("URL: " + JSON.stringify(this.url, null, 2))
      }

      if (this.opts.isMocking) {
        require.ensure(['fetch-mock'], (require:Function) => {
          const fetchMock = require('fetch-mock')

          if (this.opts.mockData) {
            fetchMock.mock(this.url.format(), this.opts.mockData, {method: this.opts.httpMethod})
          }
          else /* auto-mocking */ {
            // Read JSON response data available in the __mockData__ map.  The URL's
            // pathname acts as the key. The __mockData__ response data is loaded by karma
            // by karma-json-fixtures-preprocessor using the ./test/resources/mockdata/**/*.json
            // files as source. Obviously, these JS objects are ONLY intended to be
            // available during test operations. See __MOCK__ in config/index.js.
            const response = {
              body:    __mockData__[this.url.pathname],
              // TODO: added headers to __mockData__
              headers: { "content-type": "application/json; charset=utf-8" }
            }
            if (!response.body) {
              console.error("Didn't find mock data for: " +
                            this.url.pathname)
            }
            debugMocking(this.url.pathname + ' data: ' +
                         JSON.stringify(__mockData__[this.url.pathname]))
            fetchMock.mock(this.url.format(), response, {method: this.opts.httpMethod})
          }
        })
      }

      // TODO: support recording for response data; use save-as package.
      if (afterResponse || debugRequestTime.enabled) {
        // fetchTime() is a timer focused on functions that return
        // a Promise.
        const fetchPromise = debugRequestTime.enabled
          ? fetchTime(fetch)(this.url.format(), opts)
          : fetch(this.url.format(), opts)
        return fetchPromise
          .then((response:any):any => {
            debugRequestTime(this.url.pathname + ': +' + fetchPromise.time + 'ms')
            afterResponse && afterResponse()
            return response
          })
      }
      return fetch(this.url.format(), opts)
    }
    catch (e) {
      return Promise.reject(e)
    }
  }

  // The user of this package will kick off the fetch execution by adding
  // one of the following calls to the fluent interface.  From that point
  // forward, only Promises will be returned; not Requests, so it won't
  // be possible to request another one of the following calls.
  then(resolve:Function, reject:?Function):any /* Promise */ {
    return this.execute()
      .then(this.opts.httpErrorHandler)
      .then(resolve, reject)
  }

  catch(reject:Function):any /* Promise */ {
    return this.execute()
      .then(this.opts.httpErrorHandler)
      .catch(reject)
  }

  json(strict:boolean = true):any /* Promise */ {
    // Since this is all async, capture settings at this instant. Don't risk
    // operating on these values that may change during the async operation.
    const isStatusInJson = this.opts.isStatusInJson
    const jsonErrorHandler = this.opts.jsonErrorHandler
    const afterJSON = this.opts.afterJSON

    let executePromise = this.execute()
      .then((res:any):any /* Promise */ => jsonErrorHandler(res))

    // fetch() only allows reading it's data once. If status is embedd in JSON,
    // the jsonErrorHandler has to read the response JSON already and will return
    // the JSON object if all status is thumbs-up.
    // So, the response can only be read here by fetch's JSON reading support iff
    // status isn't expected to be found within the JSON.
    if (!isStatusInJson) {
      executePromise = executePromise.then((res:any):any /* Promise */ => res.json())
    }

    return executePromise
       .then((json:any):any /* Promise */ => {
         if (strict && !isObject(json)) {
           throw new TypeError('Data not strict JSON (not Object): /n' + json)
         }

         if (afterJSON) {
           afterJSON(json)
         }
         return json
       })
      .catch((reason:Error) => {
        if (isString(reason.message)) {
          const badJsonData = reason.message.includes('JSON.parse') ||         // Firefox
                              reason.message.includes('Invalid character') ||  // IE
                              reason.message.includes('Unexpected token') ||   // Chrome
                              reason.message.includes('JSON Parse error') ||   // PhantomJS
                              reason.message.includes('not strict JSON')
          reason.message = {
            statusCode: badJsonData ? 700 : 701,
            statusText: badJsonData ? 'Bad data response' : reason.message
          }
        }
        else if (isObject(reason.message)) {
          reason.message = {
            statusCode: 702,
            statusText: JSON.stringify(reason.message)
          }
        }
        else {
          reason.message = {
            statusCode: 666,
            statusText: 'Something truly confusing is going on...'
          }
        }
        throw reason
      })
      .catch((reason:Error) => {
        responseFail(reason)
        throw reason
      })
  }

  text():any /* Promise */ {
    // Since this is all async, capture settings at this instant. Don't risk
    // operating on these values that may change during the async operation.
    const httpErrorHandler = this.opts.httpErrorHandler

    return this.execute()
      .then(httpErrorHandler)
      .then((res:Object):Object /* Promise */=> res.text())
      .catch((reason:Error) => {
        responseFail(reason)
        throw reason
      })
  }
}

export const get  = (url:Url, options:?OptionsType):Request => {
  return new Request(url, options)
}
export const post = (url:Url, options:?OptionsType):Request => {
  options = options || {}
  options.httpMethod = "POST"
  return new Request(url, options)
}
export const put  = (url:Url, options:?OptionsType):Request => {
  options = options || {}
  options.httpMethod = "PUT"
  return new Request(url, options)
}
