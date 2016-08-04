/* @flow */

import type {AphorismType, AphorismRequestStateType} from './CompSciAphorismTypes'
import type { ActionPayloadType } from 'interfaces/CommonTypes'

import url, {Url} from 'url'
import cloneDeep from 'lodash/cloneDeep'

import {createReducer, unknownAction} from 'utilities/reduxStoreUtils'

import {
  get, post, put,
  getRootContext, setRootContext,
  responseFail
} from 'utilities/fluentRequest'

// ------------------------------------
// Constants
// ------------------------------------
export const REQUEST_APHORISM       = 'REQUEST_APHORISM'
export const REQUEST_APHORISM_ERROR = 'REQUEST_APHORISM_ERROR'
export const RECEIVE_APHORISM       = 'RECEIVE_APHORISM'

// ------------------------------------
// Actions
// ------------------------------------
const _requestAphorism = ():any => {
  return {
    type: REQUEST_APHORISM
  }
}

const _requestAphorismError = ():any => {
  return {
    type: REQUEST_APHORISM_ERROR
  }
}

const _receiveAphorism = (aphorism:AphorismType):ActionPayloadType => {
  return {
    type:    RECEIVE_APHORISM,
    payload: aphorism
  }
}

let enlightenment = 0
const _testOnlyModuleReset = () => {
  enlightenment = 0
}
const getPathToEnlightenment = ():Url => {
  enlightenment = enlightenment % 3
  let pathToEnlightenment = null
  switch (enlightenment) {
    case 0: {
      pathToEnlightenment = '57a36afe3b00003b159034b3'
      break
    }
    case 1: {
      pathToEnlightenment = '57a376cc3b0000b4169034c5'
      break
    }
    case 2: {
      pathToEnlightenment = '57a377ab3b0000d7169034ca'
      break
    }
    default: {
      pathToEnlightenment = '57a36afe3b00003b159034b3'
      break
    }
  }
  enlightenment++
  return url.parse(pathToEnlightenment)
}

export const enlighten = ():Function => {
  return (dispatch:Function):any /* Promise */ => {
    dispatch(_requestAphorism())
    const aphorismAPI = getPathToEnlightenment()

    return get(aphorismAPI, {'rootContextKey': 'mockey'})
      .json()
      .then((data:AphorismType):any /* Promise*/ => {
        return dispatch(_receiveAphorism(data))
      })
      .catch((reason:Error):any /* Promise*/ => {
        responseFail(reason, 'Failed to obtain aphorism')
        return dispatch(_requestAphorismError(reason.message))
      })
      .catch(
        (reason:Error):any /* Promise*/ => dispatch(_requestAphorismError(reason.message)))
  }
}

// Private functions that are solely exposed for UT'ing purposes
export const ut = {
  _receiveAphorism,
  _requestAphorism,
  _requestAphorismError,
  _testOnlyModuleReset
}

const APHORISM_ACTION_HANDLERS = {
  [REQUEST_APHORISM]: (state:AphorismRequestStateType):AphorismRequestStateType => {
    return ({
      ...state,
      aphorism: {
        ...state.aphorism,
        fetching: true
      }
    })
  },
  [RECEIVE_APHORISM]: (state:AphorismRequestStateType, action:{payload: AphorismType}):AphorismRequestStateType => {
    const aphorisms = cloneDeep(state.aphorism.all)
    aphorisms.push(action.payload)
    return ({
      ...state,
      aphorism: {
        ...state.aphorism,
        all:      aphorisms,
        current:  action.payload,
        fetching: false
      }
    })
  },
  [REQUEST_APHORISM_ERROR]: (state:AphorismRequestStateType):AphorismRequestStateType => {
    return ({
      ...state,
      aphorism: {
        ...state.aphorism,
        fetching:   false,
        fetchError: true
      }
    })
  }
}

export const initialState:AphorismRequestStateType = {
  aphorism: {
    fetching:   false,
    fetchError: false,
    current:    null,
    all:        []
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const reducer = createReducer(initialState, APHORISM_ACTION_HANDLERS)
export default function (state:AphorismRequestStateType = initialState,
                         action:ActionPayloadType = unknownAction):AphorismRequestStateType {
  return reducer(state, action)
}

(function () {
  setRootContext('mockey', url.parse('http://www.mocky.io/v2/'))
})()
