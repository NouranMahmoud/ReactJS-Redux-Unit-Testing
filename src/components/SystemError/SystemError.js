/* @flow */
import SweetAlert from 'sweetalert-react'
import React from 'react'

import type {
  SystemErrorStylesType,
  TimeStampedSystemErrorReportsType
} from './SystemErrorTypes'

type PropType = {
  sysErrReports: TimeStampedSystemErrorReportsType,
  isShowSystemError: boolean,
  onModalRequestClose: Function
}

const defaultSystemErrorStyles = {
  content: {
    top:         '10%',
    left:        '50%',
    right:       'auto',
    bottom:      'auto',
    marginRight: '-50%',
    transform:   'translate(-50%, -50%)'
  }
}

export default class SystemError extends React.Component {
  constructor(props:PropType) {
    super(props)
    this.onAfterOpen = this.onAfterOpen.bind(this)
    this.onModalRequestClose = this.onModalRequestClose.bind(this)
  }

  onModalRequestClose: ()=>void = () => {
    this.props.onModalRequestClose && this.props.onModalRequestClose()
  }

  onAfterOpen: ()=>void = () => {
    // this.props.onAfterOpen && this.props.onAfterOpen()
  }

  render():Object {
    const message = "<p>An unrecoverable system error has occurred.</p><br/>" +
                    "<p>You will be redirected to the Login Screen.</p>"
    return (
      <section className="system-error">
        <SweetAlert
          show={this.props.isShowSystemError}
          title="System Error"
          type="error"
          text={message}
          html
          onConfirm={() => {
            console.log('confirm') // eslint-disable-line no-console
            this.onModalRequestClose()
          }}
          onCancel={() => {
            console.log('cancel') // eslint-disable-line no-console
            this.onModalRequestClose()
          }}

          onEscapeKey={():void => this.onModalRequestClose()}
          onOutsideClick={():void => this.onModalRequestClose()}
        />
      </section>)
  }
}

SystemError.displayName = 'SystemError'
SystemError.propTypes = {
  isShowSystemError:   React.PropTypes.bool.isRequired,
  onModalRequestClose: React.PropTypes.func.isRequired,
  sysErrReports:       React.PropTypes.array

  // goToLogin:       React.PropTypes.func.isRequired,
}

