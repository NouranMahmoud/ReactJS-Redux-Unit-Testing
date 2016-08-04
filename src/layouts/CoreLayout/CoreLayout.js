/* @flow */

import React from 'react'
import Header from '../../components/Header'
import classes from './CoreLayout.scss'
import '../../styles/core.scss'

/*eslint-disable flowtype/require-parameter-type*/

export const CoreLayout = ({children}):Object => (
  <div className="container text-center">
    <Header />
    <div className={classes.mainContainer}>
      {children}
    </div>
  </div>
)

CoreLayout.propTypes = {
  children: React.PropTypes.element.isRequired
}

export default CoreLayout
