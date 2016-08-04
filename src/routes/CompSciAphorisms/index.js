import { injectReducer } from '../../store/reducers'

export default (store) => ({
  path: 'aphorisms',
  getComponent(nextState, cb) {
    require.ensure([
      './CompSciAphorismsContainer',
      './CompSciAphorismsMod'
    ], (require) => {
      const CompSciAphorismsContainer = require('./CompSciAphorismsContainer').default
      const aphorismReducer = require('./CompSciAphorismsMod').default

      injectReducer(store, { key: 'aphorisms', reducer: aphorismReducer })

      cb(null, CompSciAphorismsContainer)
    }, 'aphorisms' /* Webpack named bundle */)
  }
})
