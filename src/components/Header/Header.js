import React from 'react'
import { IndexLink, Link } from 'react-router'
import classes from './Header.scss'

export const Header = () => (
  <div>
    <h1>React Redux Unit Testing</h1>
    <IndexLink to="/" activeClassName={classes.activeRoute}>
      Home
    </IndexLink>
    {' · '}
    <Link to="/aphorisms" activeClassName={classes.activeRoute}>
      Comp Sci Truth
    </Link>
  </div>
)

export default Header
