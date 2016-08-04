// Testing the connected component:
// http://stackoverflow.com/a/36890932
// https://www.pluralsight.com/courses/react-redux-react-router-es6

import React from 'react'
import configureMockStore from 'redux-mock-store';
import {routerMiddleware} from 'react-router-redux'
import thunk from 'redux-thunk'
import createBrowserHistory from 'history/lib/createBrowserHistory'
import {useRouterHistory} from 'react-router'

import CompSciAphorisms from 'routes/CompSciAphorisms/CompSciAphorisms'
import CompSciAphorismsContainer from 'routes/CompSciAphorisms/CompSciAphorismsContainer'

// Use the same middleware you use with Redux's applyMiddleware
const browserHistory = useRouterHistory(createBrowserHistory)()
const middleware = [thunk, routerMiddleware(browserHistory)]
const mockStore = configureMockStore(middleware)
 
describe('Container CompSciAphorismsContainer', () => {

  it('CompSciAphorisms & CompSciAphorismsContainer should exist', () => {
    expect(CompSciAphorisms).to.not.be.null
    expect(CompSciAphorismsContainer).to.not.be.null
  })
})
