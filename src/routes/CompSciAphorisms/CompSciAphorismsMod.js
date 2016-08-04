/* @flow */

import type {AphorismType, AphorismRequestStateType} from './CompSciAphorismTypes'
import type { ActionPayloadType } from 'interfaces/CommonTypes'
import {createReducer, unknownAction} from 'utilities/reduxStoreUtils'

// ------------------------------------
// Constants
// ------------------------------------

// ------------------------------------
// Actions
// ------------------------------------

// Private functions that are solely exposed for UT'ing purposes
export const ut = {

}

const ACTION_HANDLERS = {

}

export const initialState:AphorismRequestStateType = {

}

// ------------------------------------
// Reducer
// ------------------------------------
const reducer = createReducer(initialState, ACTION_HANDLERS)
export default function (state:AphorismRequestStateType = initialState,
                         action:ActionPayloadType = unknownAction):AphorismRequestStateType {
  return reducer(state, action)
}
