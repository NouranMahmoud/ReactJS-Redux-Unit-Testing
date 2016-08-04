/* @flow */

import type {
  SystemErrorReportPayloadType as PayloadType,
  SystemErrorReportType as ReportType,
  SystemErrorStateType as StateType,
  TimeStampedSystemErrorReportType as TimeStampedReportType
} from './SystemErrorTypes'

// Public API
export type SystemErrorReportType = ReportType

// Public Functions (separating these two statements appeases flow(1))
import reducer from './SystemErrorMod'
export const systemErrorReducer = reducer

export {
  initialState as systemErrorInitialState,
  raiseSystemError,
  clearSystemErrors
} from './SystemErrorMod'

// Public component (separating these two statements appeases flow(1))
import component from './SystemError'
export default component

// Only used by UT
export type SystemErrorReportPayloadType = PayloadType
export type SystemErrorStateType = StateType
export type TimeStampedSystemErrorReportType = TimeStampedReportType

export {
  SYS_ERROR_ADDED,
  SYS_ERROR_CLEARED
} from './SystemErrorMod'

