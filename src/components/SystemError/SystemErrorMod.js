/* @flow */

import type {ActionPayloadType} from 'interfaces/CommonTypes'

import type {
  SystemErrorReportPayloadType,
  SystemErrorStateType
} from './SystemErrorTypes'
import moment from 'moment'
import uuid from 'uuid'
import _debug from 'debug'
import isString from 'lodash/isString'
import cloneDeep from 'lodash/cloneDeep'

import {
  createReducer,
  unknownAction,
  unknownActionType
} from 'utilities/reduxStoreUtils'

const debug = _debug('fpng:SystemError:debug')

// ------------------------------------
// Constants
// ------------------------------------
export const SYS_ERROR_ADDED   = '@@fpng/SYS_ERROR_ADDED'
export const SYS_ERROR_CLEARED = '@@fpng/SYS_ERROR_CLEARED'

// ------------------------------------
// Actions
// ------------------------------------
export const raiseSystemError = (sysErrReport:any):ActionPayloadType => {
  if (isString(sysErrReport)) {
    sysErrReport = {
      errorMessageText: sysErrReport,
      actionThatFailed: unknownActionType
    }
  }
  return {
    type:    SYS_ERROR_ADDED,
    payload: {
      id:         uuid.v4(),
      receivedAt: moment.utc().format(),
      sysErrReport
    }
  }
}

export const clearSystemErrors = ():ActionPayloadType => {
  return { type: SYS_ERROR_CLEARED }
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const SYSTEM_ERROR_ACTION_HANDLERS = {
  [SYS_ERROR_ADDED]: (state:SystemErrorStateType,
                      action:{payload: SystemErrorReportPayloadType}):SystemErrorStateType => {
    const sysErrReports = cloneDeep(state.sysErrReports)
    sysErrReports.push(action.payload)

    return ({
      ...state,
      sysErrReports
    })
  },
  [SYS_ERROR_CLEARED]: (state:SystemErrorStateType):SystemErrorStateType => {
    return ({
      ...state,
      sysErrReports: []
    })
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
export const initialState:SystemErrorStateType = {
  sysErrReports: []
}

const reducer:Function =
        createReducer(initialState, SYSTEM_ERROR_ACTION_HANDLERS)
export default function (state:SystemErrorStateType = initialState,
                         action:ActionPayloadType = unknownAction):SystemErrorStateType {
  return reducer(state, action)
}
