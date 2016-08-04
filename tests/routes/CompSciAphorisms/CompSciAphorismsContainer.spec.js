// Testing the connected component:
// http://stackoverflow.com/a/36890932
// https://www.pluralsight.com/courses/react-redux-react-router-es6

import React from 'react'
import configureMockStore from 'redux-mock-store';
import {routerMiddleware} from 'react-router-redux'
import thunk from 'redux-thunk'
import url from 'url'
import createBrowserHistory from 'history/lib/createBrowserHistory'
import {useRouterHistory} from 'react-router'

import CompSciAphorisms from 'routes/CompSciAphorisms/CompSciAphorisms'
import CompSciAphorismsContainer from 'routes/CompSciAphorisms/CompSciAphorismsContainer'
import {enlighten, ut} from 'routes/CompSciAphorisms/CompSciAphorismsMod'
import {initialState} from 'routes/CompSciAphorisms/CompSciAphorismsMod'
import {
  getRootContext, setRootContext
} from 'utilities/fluentRequest'

// Use the same middleware you use with Redux's applyMiddleware
const browserHistory = useRouterHistory(createBrowserHistory)()
const middleware = [thunk, routerMiddleware(browserHistory)]
const mockStore = configureMockStore(middleware)
 
describe('Container CompSciAphorismsContainer', () => {

  let store = null

  beforeEach(() => {
    // Setup the entire state, not just the part Redux passes
    // to the connected component.
    store = mockStore({
      aphorism: {
        fetching: false, current: null, aphorisms: [], saved: []
      }
    })
  })

  it('CompSciAphorisms & CompSciAphorismsContainer should exist', () => {
    expect(CompSciAphorisms).to.not.be.null
    expect(CompSciAphorismsContainer).to.not.be.null
  })

  describe('Test react-redux connect() actions', () => {
    it('Test react-redux connect()\'ed store with requestAphorism action.', () => {
      const requestAphorismAction = ut._requestAphorism()
      store.dispatch(requestAphorismAction)

      const mockedActions = store.getActions()
      expect(mockedActions).to.be.eql([requestAphorismAction])
    })

    it('Test react-redux connect()\'ed store with requestAphorism action.', () => {
      const receiveAphorismAction = ut._receiveAphorism({quote: "Yowsa!", by: "Zippy the Pinhead"})
      store.dispatch(receiveAphorismAction)

      const mockedActions = store.getActions()
      expect(mockedActions).to.be.eql([receiveAphorismAction])
    })
    
    it('Test react-redux connect()\'ed store with enlighten action.', () => {
      // Return the promise to handle error
      return store.dispatch(enlighten())
        .then(data => {
          const receiveAphorismPayload = 
                ut._receiveAphorism({quote: "Yowsa!", by: "Zippy the Pinhead"})
          expect(data).to.be.eql(receiveAphorismPayload)  
          const mockedActions = store.getActions()
          expect(mockedActions).to.be.eql([ut._requestAphorism(), receiveAphorismPayload])
        })
    })
  })
})
