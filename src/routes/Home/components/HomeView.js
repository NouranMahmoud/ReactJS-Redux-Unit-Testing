import React from 'react'
import DuckImage from '../assets/Duck.jpg'
import classes from './HomeView.scss'

export const HomeView = () => (
  <div>
    <h3>When does code become <em>legacy</em>?</h3>
    <h5>A: When it isn&#39;t tested.</h5>
    <img
      alt="This is a duck, because Redux!"
      className={classes.duck}
      src={DuckImage}/>
  </div>
)
HomeView.displayName = 'HomeView'
export default HomeView
