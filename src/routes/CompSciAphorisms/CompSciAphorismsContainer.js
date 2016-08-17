/* @flow */
import type {
  MapToAnyType
} from 'interfaces/CommonTypes'
import type {AphorismType} from './CompSciAphorismTypes'

import {connect} from 'react-redux'
import {enlighten} from './CompSciAphorismsMod'

import CompSciAphorisms from './CompSciAphorisms'

const mapStateToProps = (state:Object):MapToAnyType => {
  return {
    systemErrorData: {
      sysErrReports:     state.systemError.sysErrReports,
      isShowSystemError: false
    },

    aphorismData: state.aphorisms.aphorism.current,
    all:          state.aphorisms.aphorism.all
  }
}

const mapDispatchToProps:{enlighten: Function} = {
  enlighten
}

export default connect(mapStateToProps, mapDispatchToProps)(CompSciAphorisms)
