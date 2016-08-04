/* @flow */

// promiseTime() measures the time a Promise takes to resolve.
// This is provided here in lieu of installing npmjs.com/package/promise-time.
// That package uses incorrect modular system for us to leverage
export const promiseTime:Function = (fn:Function):Function => {
  // This function cannot(!) be a 'this'-binding () ==> {}
  const ret = function ():any /* Promise */ {
    const start   = Date.now()
    const promise = fn(...arguments)

    const retPromise = promise.then(
      (res:any):any => {
        retPromise.time = Date.now() - start
        return res
      },
      (err:Error) => {
        retPromise.time = Date.now() - start
        throw err
      })

    return retPromise
  }

  ret.displayName = fn.name

  return ret
}

(function (Promise:Function /* Strange, but true... according to Flow */) {
  "use strict"

  // This function cannot(!) be a 'this'-binding () ==> {}
  Promise.spread = function (promises:Array, fulfilled:Function, rejected:?Function):Promise {
    return Promise.all(promises).spread(fulfilled, rejected)
  }

  // This function cannot(!) be a 'this'-binding () ==> {}
  // eslint-disable-next-line no-extend-native
  Promise.prototype.spread = function (fulfilled:Function, rejected:?Function):Promise {
    return this.then((allResults:Array):Promise => {
      return fulfilled(...allResults)
    }, rejected)
  }

  /**
   * promise.always() runs regardless of the result of the promise chain (reject or fulfillment
   * will both trigger this call).
   * IMPORTANT: In a chain of promise then'ables, all then()'s return another Promise instance.
   * Therefore, always will run it order of chained then's. In this example: always() runs
   * 2nd, with 3rd and 4th run after the always(), not last. It's just that if the 1st had an
   * error, it would also return 99 and stop:
   *
   * doSomething().then(function(result) {
           console.log('first result', result);
           return 88;
         }).always(function(secondResult) {
           console.log('second result', secondResult);
           return 99;
         }).then(function(thirdResult) {
           console.log('third result', thirdResult);
           return 200;
         }).then(function(fourthResult) {
           // on and on...
         })
   *
   * If you want always() to run last of all successes OR an error occurs in any then's
   * prior (typical), you MUST make it the last member of the chain:
   *
   * doSomething().then(function(result) {
            console.log('first result', result);
            return 88;
         }).then(function(secondResult) {
            console.log('second result', secondResult);
            return 99;
         }).then(function(thirdResult) {
            console.log('third result', thirdResult);
            return 200;
         }).always(function(fourthResult) {
            // on and on...
         })
   *
   *
   * @param callback function to execute regardless of reject/failure.
   * @returns {*|Promise}
   */
  // eslint-disable-next-line no-extend-native
  Promise.prototype.always = (callback:Function):Promise => {
    return this.then((value:any):any => {
      return Promise.resolve(callback()).then(():Promise => {
        return value
      })
    }, (reason:Error):Promise => {
      return Promise.resolve(callback()).then(():Promise => {
        throw reason
      })
    })
  }
})(Promise)

