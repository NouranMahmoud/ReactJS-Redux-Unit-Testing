export default ():Object => ({
  path: '*',
  getComponent(nextState, next) {
    require.ensure(['./NotFound'],
      (require) => {
        const NotFound = require('./NotFound').default
        next(null, NotFound)
      }, 'notFound' /* Webpack named bundle */)
  }
})
