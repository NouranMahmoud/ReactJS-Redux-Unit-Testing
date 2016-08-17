/* @flow */
import type {
  MapToAnyType
} from 'interfaces/CommonTypes'
import type {AphorismType} from './CompSciAphorismTypes'

import {connect} from 'react-redux'

import CompSciAphorisms from './CompSciAphorisms'

const mapStateToProps = (state:Object):MapToAnyType => {
  return {
    systemErrorData: {
      sysErrReports:     state.systemError.sysErrReports,
      isShowSystemError: false
    }
  }
}

const mapDispatchToProps:{enlighten: Function} = {
}

export default connect(mapStateToProps, mapDispatchToProps)(CompSciAphorisms)
