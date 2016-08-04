// We only need to import the modules necessary for initial render
import CoreLayout from '../layouts/CoreLayout/CoreLayout'
import Home from './Home'

/*  Note: Instead of using JSX, we recommend using react-router
 PlainRoute objects to build route definitions.
 When creating a new async route, pass the instantiated store!   */
export const createRoutes = (store) => {
  const routes = {
    path:       '/',
    component:  CoreLayout,
    indexRoute: Home,
    getChildRoutes(location, next) {
      require.ensure([], (require) => {
        next(null, [
          // Provide store for async reducers and middleware
          // WITHOUT imports!
          require('./CompSciAphorisms').default(store),
          require('components/404').default(store)
        ])
      })
    }
  }
  return routes
}

export default createRoutes
