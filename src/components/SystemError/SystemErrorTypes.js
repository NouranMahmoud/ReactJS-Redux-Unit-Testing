
import {Url} from 'url'

export type SystemErrorReportType = {
  errorMessageText: string,
  actionThatFailed: ?string,
  fpngErrorCode: ?number,
  httpStatusCode: ?number,
  httpStatusText: ?string,
  reqUrl: Url
}

export type TimeStampedSystemErrorReportType = {
  id: string,
  receivedAt: string, // ISO Data/Time
  sysErrReport: SystemErrorReportType
}

export type SystemErrorOverlayStylesType = {
  position : ?string,
  top: ?number,
  left: ?number,
  right: ?number,
  bottom: ?number,
  backgroundColor: ?string
}

export type SystemErrorContentStylesType = {
  position: ?string,
  top: ?string,
  left: ?string,
  right: ?string,
  bottom: ?string,
  border: ?string,
  background: ?string,
  overflow: ?string,
  WebkitOverflowScrolling: ?string,
  borderRadius: ?string,
  outline: ?string,
  padding: ?string
}

export type SystemErrorStylesType = {
  overlay: ?SystemErrorOverlayStylesType,
  content: ?SystemErrorContentStylesType
}

export type SystemErrorReportPayloadType = TimeStampedSystemErrorReportType

export type TimeStampedSystemErrorReportsType = Array<TimeStampedSystemErrorReportType>

export type SystemErrorStateType = {
  sysErrReports: TimeStampedSystemErrorReportsType
}
