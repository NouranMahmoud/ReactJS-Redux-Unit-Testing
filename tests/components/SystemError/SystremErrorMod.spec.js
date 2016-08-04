/* @flow */

import type {
  ActionPayloadType,
  RequestIssueReportType
} from 'interfaces/CommonTypes'


import type {
  SystemErrorStateType,
  SystemErrorReportType,
  TimeStampedSystemErrorReportType,
  SystemErrorReportPayloadType
} from 'components/SystemError'

// http://redux.js.org/docs/recipes/WritingTests.html
import url from 'url'
import MockDate from 'mockdate'
import moment from 'moment'
import cloneDeep from 'lodash/cloneDeep'
import uuid from 'uuid'

import { systemErrorReducer,
  SYS_ERROR_ADDED, SYS_ERROR_CLEARED,
  systemErrorInitialState,
  raiseSystemError,
  clearSystemErrors} from 'components/SystemError'

describe('SystemError/SystemErrorMod', () => {
  describe('Actions', function () { // Can't use '() ==> here...
    this.timeout(100); // ... because this 'this' would be wrong.

    const systemErrorReport:SystemErrorReportType = {
      reqUrl:           url.parse('//unit-test/'),
      httpStatusCode:   666,
      httpStatusText:   'The devil made me do it.',
      fpngErrorCode:    999,
      errorMessageText: "Entering Dante's Inferno"
    }

    describe('Basic reduce tests', () => {
      it('Expected to be a function.', () => {
        expect(systemErrorReducer).to.be.a('function')
      })

      it('Expected to initialize with `initialState`.', () => {
        expect(systemErrorReducer(undefined, undefined)).to.equal(systemErrorInitialState)
      })

      it('Mutate state through reducer expected to produce current or initial state', () => {
        let state = systemErrorReducer(undefined, { type: 'Yow!' })
        expect(state).to.eql(systemErrorInitialState)
        state = systemErrorReducer(state, { type: '@@@@@@@' })
        expect(state).to.eql(systemErrorInitialState)
      })

      describe('raiseSystemError', () => {
        const mockUuid = '00000000-dead-beef-0000-000000000000'
        const mockNowMsFromEpoch = 961041600000
        beforeEach(() => {
          // Mock Date.now() including (moment!). Fixed to the ms.
          MockDate.set(mockNowMsFromEpoch)
          sinon.stub(uuid, 'v4', function () {
            return mockUuid
          })
        })

        afterEach(() => {
          MockDate.reset()
          uuid.v4.restore()
        })

        it('Expected to export a constant SYS_ERROR_ADDED.', () => {
          expect(SYS_ERROR_ADDED).to.equal('@@fpng/SYS_ERROR_ADDED')
        })

        it('Expected to be exported as a function.', () => {
          expect(raiseSystemError).to.be.a('function')
        })

        it('Expected to return an action with type "SYS_ERROR_ADDED".', () => {
          expect(raiseSystemError(systemErrorReport))
            .to.have.property('type', SYS_ERROR_ADDED)
        })

        it('Expected to return an action with time-stamped, system error payload.', () => {
          expect(raiseSystemError(systemErrorReport))
            .to.have.property('payload').eql({
            id:           mockUuid,
            receivedAt:   moment(mockNowMsFromEpoch).utc().format(),
            sysErrReport: systemErrorReport
          })
        })

        it('Mutate state through reducer expected to produce registered error', () => {
          const capturedSystemError:TimeStampedSystemErrorReportType = {
            id: mockUuid,
            receivedAt: moment(mockNowMsFromEpoch).utc().format(),
            sysErrReport: systemErrorReport
          }
          const testStartState   = cloneDeep(systemErrorInitialState)
          const expected         = cloneDeep(testStartState)
          expected.sysErrReports = [capturedSystemError]

          const state = systemErrorReducer(testStartState,
            raiseSystemError(systemErrorReport))

          expect(state).to.eql(expected)
        })
      })

      describe('clearSystemErrors', () => {

        it('Expected to export a constant SYS_ERROR_CLEARED.', () => {
          expect(SYS_ERROR_CLEARED).to.equal('@@fpng/SYS_ERROR_CLEARED')
        })

        it('Expected to be exported as a function.', () => {
          expect(clearSystemErrors).to.be.a('function')
        })

        it('Expected to return an action with type "SYS_ERROR_CLEARED".', () => {
          expect(clearSystemErrors())
            .to.have.property('type', SYS_ERROR_CLEARED)
        })

        it('Mutate state through reducer expected to remove all collected errors.', () => {
          const testStartState   = cloneDeep(systemErrorInitialState)

          let state = systemErrorReducer(testStartState,
            raiseSystemError(systemErrorReport))

          state = systemErrorReducer(state, clearSystemErrors(systemErrorReport))

          expect(state).to.eql(systemErrorInitialState)
        })
      })
    })
  })
})
