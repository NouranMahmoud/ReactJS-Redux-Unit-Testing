/* @flow */

/*eslint no-useless-constructor: 0*/

import React from 'react'
import classes from './CompSciAphorisms.scss'

import type {AphorismType} from './CompSciAphorismTypes'

type PropType = {
  aphorism: ?AphorismType,
  all: Array < AphorismType >,
  enlighten: Function,
}

export class CompSciAphorisms extends React.Component {

  constructor(props:PropType) {
    super(props)
  }

  render():Object {
    const {aphorism, ...props} = this.props
    return (
      <div>
        <div>
          <h2 className={classes.aphorismHeader}>
            {aphorism ? aphorism.quote + '\n~' + aphorism.by : ''}
          </h2>
          <button className="btn wisdom" onClick={props.enlighten}>
            Universal Comp Sci Truth
          </button>
        </div>
        {
          props.all.length
            ? <div className={classes.allAphorisms}>
              <h3>
                All Truths
              </h3>
              <ul>
                {this.props.all.map((a:AphorismType, inx:number):Object =>
                  <li key={inx}>
                    {a.quote} <br/> ~ {a.by}
                  </li>
                )}
              </ul>
            </div>
            : null
        }
      </div>
    )
  }
}

CompSciAphorisms.displayName = 'CompSciAphorisms'
CompSciAphorisms.propTypes = {
  all:       React.PropTypes.array.isRequired,
  aphorism:  React.PropTypes.object,
  enlighten: React.PropTypes.func.isRequired
}

export default CompSciAphorisms

