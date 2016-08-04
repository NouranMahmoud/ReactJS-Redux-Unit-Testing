import aphorismReducer, {
  REQUEST_APHORISM, RECEIVE_APHORISM, SAVE_CURRENT_APHORISM,
  initialState, enlighten,
  ut
} from 'routes/CompSciAphorisms/CompSciAphorismsMod'

// http://redux.js.org/docs/recipes/WritingTests.html
// Disregard any reference to nock as that is a server-side
// only solution; using fetch-mock instead.
import fetchMock from 'fetch-mock'
import url from 'url'
import cloneDeep from 'lodash/cloneDeep'

import {
  getRootContext, setRootContext
} from 'utilities/fluentRequest'
import {reducerSpy} from '../../testReducerUtilities.spec'
 
describe('(Route/Module) CompSciAphorism/CompSciAphorismMod Aphorism', () => {
  describe('Actions', () => {
    afterEach(() => {
      ut._testOnlyModuleReset()
    })

    // NOTE: Probably want to verify that state hasn't been mutated).
    describe('Basic reduce tests', () => {
      it('Should be a function.', () => {
        expect(aphorismReducer).to.be.a('function')
      })

      it('Should initialize with `initialState`.', () => {
        expect(aphorismReducer(undefined, { type: 'Idunno' })).to.equal(initialState)
      })

      it('Passing `undefined` to reducer should produce initialState', () => {
        let state = aphorismReducer(undefined, { type: 'Idunno' })
        expect(state).to.eql(initialState)
        state = aphorismReducer(state, {type: '@@@@@@@'})
        expect(state).to.eql(initialState)
      })
    })

    describe('requestAphorism', () => {
      it('Expected to export a constant REQUEST_APHORISM.', () => {
        expect(REQUEST_APHORISM).to.equal('REQUEST_APHORISM')
      })
  
      it('Expected to be exported as a function.', () => {
        expect(ut._requestAphorism).to.be.a('function')
      })

      it('Expected to return an action with type "REQUEST_APHORISM".', () => {
        expect(ut._requestAphorism()).to.have.property('type', REQUEST_APHORISM)
      })
      
      it('Mutate state through reducer expected to produce `fetching` truth.', () => {
        const expected = {
          aphorism: {
            fetching: true, fetchError: false, current: null, all: []
          }
        }
        let state      = aphorismReducer(initialState, ut._requestAphorism())
        expect(state).to.eql(expected)
        // Pull an unexpected type through to be sure state remains unchanged
        state = aphorismReducer(state, { type: '@@@@@@@' })
        expect(state).to.eql(expected)
      })
    })

    describe('receiveAphorism', () => {
      afterEach(() => {
        ut._testOnlyModuleReset()
      })
      it('Expected to export a constant RECEIVE_APHORISM.', () => {
        expect(RECEIVE_APHORISM).to.equal('RECEIVE_APHORISM')
      })
  
      it('Expected to be exported as a function.', () => {
        expect(ut._receiveAphorism).to.be.a('function')
      })

      it('Expected to return an action with type "RECEIVE_APHORISM".', () => {
        expect(ut._receiveAphorism({quote: "Yowsa!", by: "Zippy the Pinhead"}))
          .to.have.property('type', RECEIVE_APHORISM)
      })

      it('Expected the first argument to be assigned to the "payload.value" property.', () => {
        expect(ut._receiveAphorism({quote: "Yowsa!", by: "Zippy the Pinhead"}))
          .to.have.property('payload').and.eql({quote: "Yowsa!", by: "Zippy the Pinhead"})
      })

      it('Mutate state through reducer expected to produce `fetching` falsity ' +
         'with `aphorism-like` wisdom.', () => {
        const expected = {
          aphorism: {
            fetching  : false,
            fetchError: false,
            current   : {quote: "Yowsa!", by: "Zippy the Pinhead"},
            all      : [{quote: "Yowsa!", by: "Zippy the Pinhead"}],
          }
        }
        let state = aphorismReducer(initialState,
          ut._receiveAphorism({quote: "Yowsa!", by: "Zippy the Pinhead"}))

        expect(state).to.eql(expected)
      })
    })

    describe('enlighten (thunk)', function () { // Can't use '() ==> here...
      this.timeout(300) // ... because this 'this' would be wrong.
      
      const stateHolder = {
        state: cloneDeep(initialState)
      }
      const aphorismAPI = url.parse('http://www.mocky.io/v2/57a36afe3b00003b159034b3')
      const { dispatchSpy, getStateSpy } = reducerSpy(aphorismReducer, stateHolder)
      
      afterEach(() => {
        stateHolder.state = cloneDeep(initialState)
        dispatchSpy.reset()
        getStateSpy.reset()
        ut._testOnlyModuleReset()
      })

      it('Expected to be exported as a function.', () => {
        expect(enlighten).to.be.a('function')
      })

      it('Expected to return a function (is a thunk).', () => {
        expect(enlighten()).to.be.a('function')
      })

      it('Thunk expected to return a Promise.', () => {
        return expect(enlighten()(dispatchSpy)).to.eventually.be.fulfilled
      })

      it('Confirm all expected thunk dispatches', () => {
        var expectedAphorismPayload = {quote: "Yowsa!", by: "Zippy the Pinhead"};
        return enlighten()(dispatchSpy)
          .then(() => {
            dispatchSpy.should.have.been.calledTwice
            dispatchSpy.should.have.been.calledWithExactly({
              type: REQUEST_APHORISM
            })
            dispatchSpy.should.have.been.calledWith({
              type:    RECEIVE_APHORISM,
              payload: expectedAphorismPayload
            })
            // mocking setup using fully configured request in fluentRequest.
            expect(fetchMock.called(aphorismAPI.format())).to.be.true
          })
      })

      it('Final state mutation expected to contain a aphorism.', () => {
        return enlighten()(dispatchSpy)
          .then(() => {
            dispatchSpy.should.have.been.calledTwice;
            expect(fetchMock.called(aphorismAPI.format())).to.be.true
            var expected = {quote: "Yowsa!", by: "Zippy the Pinhead"}
            expect(getStateSpy().aphorism.current).to.eql(expected)
            expect(getStateSpy().aphorism.all[0]).to.eql(expected)
          })
      })
    })
  })
})
