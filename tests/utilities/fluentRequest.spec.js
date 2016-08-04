/* @flow */

import type {OptionsType} from 'utilities/fluentRequest'
import _debug from 'debug'
import {
  Request,
  defaultOpts,
  get, post, put,
  getRootContext,
  setRootContext,
  responseFail
} from 'utilities/fluentRequest'
import urlUtil, {Url} from 'url'
import {expect} from 'chai';
import {cloneDeep} from 'lodash'
import fetchMock from 'fetch-mock'

'use strict'

const debug = _debug('test:fluentRequest')

describe('fluentRequest', function () { // Can't use '() ==> here...
  this.timeout(300); // ... because this 'this' would be wrong.

  const jsonType = 'application/json; charset=utf-8'
  const defaultRootContext = '//unit-test'
  const testUrlStr = '//unit-test-full-url/is/there/anybody/out/there'
  const testPartialUrlStr = 'turtles'
  let origDefaultContext = null;
  let testOptions:OptionsType = cloneDeep(defaultOpts)

  before(() => {
    origDefaultContext = setRootContext('', urlUtil.parse(defaultRootContext))
  })

  after(() => {
    setRootContext('', origDefaultContext)
  })

  beforeEach(() => {
    testOptions = cloneDeep(defaultOpts)
    testOptions.isMocking = true;
    fetchMock.restore()
  })

  it('Request constructor w/ partial Url using default rootContext', () => {
    const request = new Request(urlUtil.parse(testPartialUrlStr))
    const expectedUrl = getRootContext().format() + testPartialUrlStr

    expect(request.getOptions()).to.be.eql(testOptions)
    // console.log("URL: " + JSON.stringify(request.getUrl(), null, 2))
    expect(request.getUrl().format()).to.be.eql(expectedUrl)
  })

  it('Request partial Url and options with rootContext differing from default', () => {
    testOptions.rootContextKey = 'test'

    const utUrl = urlUtil.parse('//unit-test-root-context-key/')
    let previousRootContext = setRootContext(testOptions.rootContextKey, utUrl)

    const request = new Request(urlUtil.parse(testPartialUrlStr), testOptions)
    const expectedUrl = getRootContext(testOptions.rootContextKey).format() + testPartialUrlStr

    expect(request.getOptions()).to.be.eql(testOptions)
    // console.log("URL: " + JSON.stringify(request.getUrl(), null, 2))
    expect(request.getUrl().format()).to.be.eql(expectedUrl)
    expect(previousRootContext).to.be.null

    // Clear
    previousRootContext = setRootContext(testOptions.rootContextKey)
    expect(previousRootContext).to.be.eql(utUrl)
    const clearedContext = getRootContext(testOptions.rootContextKey)
    expect(clearedContext).to.be.null
  })

  describe('Check HTTP method', () => {
    beforeEach(() => {
      testOptions = cloneDeep(defaultOpts)
    })

    it('Request with bad HTTP option in ctor options', () => {
      expect(() => {
        testOptions.httpMethod = 'BREAK-ALL-THE-INTERNETS'
        return new Request(urlUtil.parse(testPartialUrlStr), testOptions)
      }).to.throw(Error, /^Illegal HTTP method: `BREAK-ALL-THE-INTERNETS`$/)
    })

    it('Request with bad HTTP option in setOptions()', () => {
      expect(() => {
        return new Request(urlUtil.parse(testPartialUrlStr), testOptions)
          .setOptions({httpMethod: 'BREAK-ALL-THE-INTERNETS'})
      }).to.throw(Error, /^Illegal HTTP method: `BREAK-ALL-THE-INTERNETS`$/)
    })

    it('Request with bad HTTP option in setOption()', () => {
      expect(() => {
        return new Request(urlUtil.parse(testPartialUrlStr), testOptions)
          .setOption('httpMethod', 'BREAK-ALL-THE-INTERNETS')
      }).to.throw(Error, /^Illegal HTTP method: `BREAK-ALL-THE-INTERNETS`$/)
    })
  })

  describe('queryParams', () => {
    it('setQueryParams()', () => {
      const expectedUrl = getRootContext().format() + testPartialUrlStr +
        '?pet=turtle&name=Yertle&son=Nick&daughter=Corinne'

      const request = new Request(urlUtil.parse(testPartialUrlStr), testOptions)
        .setQueryParams({
            pet:  'turtle',
            name: 'Yertle'
          }
        )
        .setQueryParams({
            son:      'Nick',
            daughter: 'Corinne'
          }
        )
        .setQueryParams({})

      expect(request.getUrl().format()).to.be.equal(expectedUrl)
    })

    it('Pass queryParams in ctor options', () => {
      const expectedUrl = getRootContext().format() + testPartialUrlStr +
        '?pet=turtle&name=Yertle&son=Nick&daughter=Corinne'

      testOptions.queryParams = {
        pet:      'turtle',
        name:     'Yertle',
        son:      'Nick',
        daughter: 'Corinne'
      }
      const request = new Request(urlUtil.parse(testPartialUrlStr), testOptions)

      expect(request.getUrl().format()).to.be.equal(expectedUrl)
    })
    
  })

  describe('queryParam', () => {
    it('setQueryParam()', () => {
      const expectedUrl = getRootContext().format() +
                          testPartialUrlStr + 
                          '?pet=turtle&name=Yertle'

      const request = new Request(urlUtil.parse(testPartialUrlStr), testOptions)
        .setQueryParam('pet', 'turtle')
        .setQueryParam('name', 'Yertle')

      expect(request.getUrl().format()).to.be.equal(expectedUrl)
    })

  })

  describe('# get', () => {
    describe('mock', () => {
      it('mock()', () => {
        const request = new Request(urlUtil.parse(testUrlStr), testOptions)
          .mock({
            body:    {
              "fluent-request": "rocks!"
            },
            headers: {
              'Content-Type': jsonType
            }
          })
        return request
          .execute()
          .catch(reason => {
            responseFail(reason, "Failed mock() test")
            expect.fail()
          })
          .then(response => {
            expect(response).to.isObject
            expect(response.status).to.equal(200)
            expect(fetchMock.called(request.getUrl().format())).to.be.true
            expect(fetchMock.lastUrl().trim()).to.equal(request.url.format())
            expect(fetchMock.lastOptions().method).to.equal('GET')
            expect(response.headers.get("content-type")).to.equal(jsonType)
          })
      })
    })

    describe('execute', () => {
      it('execute()', () => {
        const request = new Request(urlUtil.parse(testUrlStr), testOptions)
          .mock({
            body: JSON.stringify({ "fluent-request": "rocks!" }),
            headers: {
              'Content-Type': jsonType
            }
          })
        return request
          .execute()
          .then(response => {
            expect(response).to.isObject
            expect(response.status).to.equal(200)
            expect(fetchMock.called(request.getUrl().format())).to.be.true
            expect(fetchMock.lastUrl().trim()).to.equal(request.url.format())
            expect(fetchMock.lastOptions().method).to.equal('GET')
            expect(response.headers.get("content-type")).to.equal(jsonType)
            return response.json()
          })
          .then((json:Object) => {
            expect(json).to.be.an('object').and
              .to.have.property('fluent-request')
              .that.is.an('string')
              .that.equals('rocks!')
          })
      })
    })

    describe('text', () => {
      it('text()', () => {
        const request = new Request(urlUtil.parse(testUrlStr), testOptions)
          .mock({
            body:    {
              "fluent-request": "rocks!"
            },
            headers: {
              'Content-Type': jsonType
            }
          })
        return request
          .text()
          .then(text => {
            expect(fetchMock.called(request.getUrl().format())).to.be.true
            expect(fetchMock.lastUrl().trim()).to.equal(request.url.format())
            expect(fetchMock.lastOptions().method).to.equal('GET')
            expect(text).to.be.a('string')
              .and.include('fluent-request')
              .and.include('rocks!')
          })
      })
    })

    describe('json', () => {
      it('json()', () => {
        const request = new Request(urlUtil.parse(testUrlStr), testOptions)
          .mock({
            body:    {
              "fluent-request": "rocks!"
            },
            headers: {
              'Content-Type': jsonType
            }
          })
        return request
          .json()
          .then(jsonData => {
            expect(fetchMock.called(request.getUrl().format())).to.be.true
            expect(fetchMock.lastUrl().trim()).to.equal(request.url.format())
            expect(fetchMock.lastOptions().method).to.equal('GET')
            expect(jsonData).to.be.an('object').and
              .to.have.property('fluent-request')
              .that.is.an('string')
              .that.equals('rocks!')
          })
      })
    })

    describe('get.json', () => {
      it('json()', () => {
        const request = get(urlUtil.parse(testUrlStr), testOptions)
          .mock({
            body:    {
              "fluent-request": "rocks!"
            },
            headers: {
              'Content-Type': jsonType
            }
          })
        return request
          .json()
          .then(jsonData => {
            expect(fetchMock.called(request.getUrl().format())).to.be.true
            expect(fetchMock.lastUrl().trim()).to.equal(request.url.format())
            expect(fetchMock.lastOptions().method).to.equal('GET')
            expect(jsonData).to.be.an('object').and
              .to.have.property('fluent-request')
              .that.is.an('string')
              .that.equals('rocks!')
          })
      })
    })
  })

  describe('# post', () => {
    it('json', () => {
      testOptions.httpMethod = 'POST'
      const request = new Request(urlUtil.parse(testUrlStr), testOptions)
        .setMimeType('json')
        .setPayload({
          pet:      'turtle',
          name:     'Yertle',
          son:      'Nick',
          daughter: 'Corinne'
        })
        .mock({
          body:    {
            "fluent-request": "rocks!"
          },
          headers: {
            'Content-Type': jsonType
          }
        })
      return request
        .then(response => {
          expect(response).to.isObject
          expect(response.status).to.equal(200)
          expect(response.headers.get("content-type")).to.equal(jsonType)
          expect(fetchMock.called(request.getUrl().format())).to.be.true
          expect(fetchMock.lastUrl().trim()).to.equal(request.url.format())
          expect(fetchMock.lastOptions().method).to.equal('POST')
          expect(fetchMock.lastOptions().body).to.equal('{"pet":"turtle","name":"Yertle","son":"Nick","daughter":"Corinne"}')
          return response.json()
        })
        .then(jsonData => {
          expect(jsonData).to.be.an('object').and
            .to.have.property('fluent-request')
            .that.is.an('string')
            .that.equals('rocks!')
        })
    })

    it('urlencoded', () => {
      testOptions.httpMethod = 'POST'
      const request = new Request(urlUtil.parse(testUrlStr), testOptions)
        .setPayload('pet=turtle')
        .setPayload('name=Yertle')
        .mock({
          body:    {
            "fluent-request": "rocks!"
          },
          headers: {
            'Content-Type': jsonType
          }
        })

      return request
        .then(response => {
          expect(response).to.isObject
          expect(response.status).to.equal(200)
          expect(response.headers.get("content-type")).to.equal(jsonType)
          expect(fetchMock.called(request.getUrl().format())).to.be.true
          expect(fetchMock.lastUrl().trim()).to.equal(request.url.format())
          expect(fetchMock.lastOptions().method).to.equal('POST')
          expect(fetchMock.lastOptions().body).to.equal("pet=turtle&name=Yertle")
          return response.json()
        })
        .then(jsonData => {
          expect(jsonData).to.be.an('object').and
            .to.have.property('fluent-request')
            .that.is.an('string')
            .that.equals('rocks!')
        })
    })

    it('GET should ignore body', () => {
      const request = get(urlUtil.parse(testUrlStr), testOptions)
        .setPayload('pet=turtle')
        .setPayload('name=Yertle')
        .mock({
          body:    {
            "fluent-request": "rocks!"
          },
          headers: {
            'Content-Type': jsonType
          }
        })
      return request
        .then(response => {
          expect(response).to.isObject
          expect(response.status).to.equal(200)
          expect(response.headers.get("content-type")).to.equal(jsonType)
          expect(fetchMock.called(request.getUrl().format())).to.be.true
          expect(fetchMock.lastUrl().trim()).to.equal(request.url.format())
          expect(fetchMock.lastOptions().method).to.equal('GET')
          expect(fetchMock.lastOptions().body).to.be.undefined
          return response.json()
        })
        .then(jsonData => {
          expect(jsonData).to.be.an('object').and
            .to.have.property('fluent-request')
            .that.is.an('string')
            .that.equals('rocks!')
        })
    })

    it('post.json', () => {
      const request = post(urlUtil.parse(testUrlStr), testOptions)
        .setMimeType('json')
        .setPayload({
          pet:      'turtle',
          name:     'Yertle',
          son:      'Nick',
          daughter: 'Corinne'
        })
        .mock({
          body:    {
            "fluent-request": "rocks!"
          },
          headers: {
            'Content-Type': jsonType
          }
        })
      return request
        .then(response => {
          expect(response).to.isObject
          expect(response.status).to.equal(200)
          expect(response.headers.get("content-type")).to.equal(jsonType)
          expect(fetchMock.called(request.getUrl().format())).to.be.true
          expect(fetchMock.lastUrl().trim()).to.equal(request.url.format())
          expect(fetchMock.lastOptions().method).to.equal('POST')
          expect(fetchMock.lastOptions().body).to.equal('{"pet":"turtle","name":"Yertle","son":"Nick","daughter":"Corinne"}')
          return response.json()
        })
        .then(jsonData => {
          expect(jsonData).to.be.an('object').and
            .to.have.property('fluent-request')
            .that.is.an('string')
            .that.equals('rocks!')
        })
    })

    it('put.json', () => {
      const request = put(urlUtil.parse(testUrlStr), testOptions)
        .setMimeType('json')
        .setPayload({
          pet:      'turtle',
          name:     'Yertle',
          son:      'Nick',
          daughter: 'Corinne'
        })
        .mock({
          body:    {
            "fluent-request": "rocks!"
          },
          headers: {
            'Content-Type': jsonType
          }
        })
      return request
        .then(response => {
          expect(response).to.isObject
          expect(response.status).to.equal(200)
          expect(response.headers.get("content-type")).to.equal(jsonType)
          expect(fetchMock.called(request.getUrl().format())).to.be.true
          expect(fetchMock.lastUrl().trim()).to.equal(request.url.format())
          expect(fetchMock.lastOptions().method).to.equal('PUT')
          expect(fetchMock.lastOptions().body).to.equal('{"pet":"turtle","name":"Yertle","son":"Nick","daughter":"Corinne"}')
          return response.json()
        })
        .then(jsonData => {
          expect(jsonData).to.be.an('object').and
            .to.have.property('fluent-request')
            .that.is.an('string')
            .that.equals('rocks!')
        })
    })

  })

  describe('# setHeader', () => {
    it('setHeader(key, value)', () => {
      testOptions.httpMethod = 'POST'
      const request = new Request(urlUtil.parse(testUrlStr), testOptions)
        .setHeader('content-type', 'application/x-www-form-urlencoded')
        .setHeader('x-fluent-request', 'hello')
        .setPayload({pet:'turtle'})
        .setPayload({name:'Yertle'})
        .mock({
          body:    {
            "fluent-request": "rocks!"
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Fetch-Io': 'hello'
          }
        })
      return request
        .then(response => {
          expect(response).to.isObject
          expect(response.status).to.equal(200)
          expect(response.headers.get("content-type")).to.equal('application/x-www-form-urlencoded')
          expect(response.headers.get('X-Fetch-Io')).to.equal('hello')
          expect(fetchMock.called(request.getUrl().format())).to.be.true
          expect(fetchMock.lastUrl().trim()).to.equal(request.url.format())
          expect(fetchMock.lastOptions().method).to.equal('POST')
          expect(fetchMock.lastOptions().body).to.equal("pet=turtle&name=Yertle")

          return response.json()
        })
        .then(jsonData => {
          expect(jsonData).to.be.an('object').and
            .to.have.property('fluent-request')
            .that.is.an('string')
            .that.equals('rocks!')
        })
    })

    it('setHeaders(obj)', () => {
      testOptions.httpMethod = 'POST'
      const request = new Request(urlUtil.parse(testUrlStr), testOptions)
        .setHeaders({
          'content-type': 'application/x-www-form-urlencoded',
          'x-fetch-io':   'hello'
        })
        .setPayload({pet:'turtle'})
        .setPayload({name:'Yertle'})
        .mock({
          body:    {
            "fluent-request": "rocks!"
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Fetch-Io': 'hello'
          }
        })
      return request
        .then(response => {
          expect(response).to.isObject
          expect(response.status).to.equal(200)
          expect(response.headers.get("content-type")).to.equal('application/x-www-form-urlencoded')
          expect(response.headers.get('X-Fetch-Io')).to.equal('hello')
          expect(fetchMock.called(request.getUrl().format())).to.be.true
          expect(fetchMock.lastUrl().trim()).to.equal(request.url.format())
          expect(fetchMock.lastOptions().method).to.equal('POST')
          expect(fetchMock.lastOptions().body).to.equal("pet=turtle&name=Yertle")
          return response.json()
        })
        .then(jsonData => {
          expect(jsonData).to.be.an('object').and
            .to.have.property('fluent-request')
            .that.is.an('string')
            .that.equals('rocks!')
        })
    })
  })

// describe('# append', () => {
//   it('append(key, value)', () => {
//     return request
//     .post(host + '/post')
//     .append('name', 'haoxin')
//     .append('desc', 'hello world')
//     .then(res => {
//       equal(res.status, 200)
//       equal(res.headers.get('Content-Type'), jsonType)
//       return res.json()
//     })
//     .then(body => {
//       assert.ok(body.headers['Content-Type'].startsWith('multipart/form-data'))
//       keysEqual(body.form, ['name', 'desc'])
//       equal(body.form.name, 'haoxin')
//       equal(body.form.desc, 'hello world')
//     })
//   })
// })
//
// describe('# prefix', () => {
//   it('basic', () => {
//     const req = new Fetch({
//       prefix: host + '/get'
//     })
//
//     return req
//     .get('')
//     .then(res => {
//       equal(res.status, 200)
//       equal(res.headers.get('Content-Type'), jsonType)
//       return res.json()
//     })
//     .then(body => {
//       equal(body.url, host + '/get')
//     })
//   })
// })
//
// describe('# afterJSON', () => {
//   it('basic', () => {
//     const req = new Fetch({
//       afterJSON: json => {
//         json.meta = 'json handler'
//       }
//     })
//
//     return req
//     .get(host + '/get')
//     .json()
//     .then(json => {
//       equal(json.meta, 'json handler')
//     })
//   })
// })
//
// describe('beforeRequest', () => {
//   it('basic', () => {
//     let called = false
//
//     const req = new Fetch({
//       beforeRequest: () => {
//         called = true
//       }
//     })
//
//     return req
//     .get(host + '/get')
//     .json()
//     .then(() => {
//       equal(called, true)
//     })
//   })
//
//   it('canceled', () => {
//     const req = new Fetch({
//       beforeRequest: () => {
//         return false
//       }
//     })
//
//     return req
//     .get(host + '/get')
//     .json()
//     .catch(err => {
//       equal(err.message, 'request canceled by beforeRequest')
//     })
//     .then(() => {
//       throw new Error('this should not be called')
//     })
//   })
//
//   it('canceled - check url', () => {
//     const req = new Fetch({
//       beforeRequest: (url) => {
//         return !url.includes('😄')
//       }
//     })
//
//     return req
//     .get(host + '/get?emoji=😄')
//     .catch(err => {
//       equal(err.message, 'request canceled by beforeRequest')
//     })
//     .then(() => {
//       throw new Error('this should not be called')
//     })
//   })
//
//   it('canceled - check body', () => {
//     const req = new Fetch({
//       beforeRequest: (url, body) => {
//         return !body.includes('😄')
//       }
//     })
//
//     return req
//     .post(host + '/post')
//     .send({emoji: '😄'})
//     .catch(err => {
//       equal(err.message, 'request canceled by beforeRequest')
//     })
//     .then(() => {
//       throw new Error('this should not be called')
//     })
//   })
// })
//
// describe('afterResponse', () => {
//   it('basic', () => {
//     let called = false
//
//     const req = new Fetch({
//       afterResponse: () => {
//         called = true
//       }
//     })
//
//     return req
//     .get(host + '/get')
//     .json()
//     .then(() => {
//       equal(called, true)
//     })
//   })
// })
})
