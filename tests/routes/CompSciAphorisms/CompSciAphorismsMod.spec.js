import aphorismReducer, {
  initialState
} from 'routes/CompSciAphorisms/CompSciAphorismsMod'

// http://redux.js.org/docs/recipes/WritingTests.html
// Disregard any reference to nock as that is a server-side
// only solution; using fetch-mock instead.

describe('(Route/Module) CompSciAphorism/CompSciAphorismMod', () => {
  describe('Actions', () => {
 
    it('Expected to be a function.', () => {
      expect(aphorismReducer).to.be.a('function')
    })

    it('Undefined state expected to initialize with `initialState`.', () => {
        expect(aphorismReducer(undefined, { type: 'Idunno' }))
          .to.eql(initialState)
      }
    )

    it('Passing an unknown action to reducer expected to return current state', () => {
      let state = aphorismReducer(undefined, { type: 'Idunno' })
      expect(state).to.eql(initialState)
      state = aphorismReducer(state, { type: '@@@@@@@' })
      expect(state).to.eql(initialState)
    })

  })
})
