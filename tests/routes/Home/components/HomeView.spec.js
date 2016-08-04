import React from 'react'
import { HomeView } from 'routes/Home/components/HomeView'
import { render } from 'enzyme'

describe('(View) Home', () => {
  let _component

  beforeEach(() => {
    _component = render(<HomeView />)
  })

  it('Renders a question for the viewer', () => {
    const question = _component.find('h3')
    expect(question).to.exist
    expect(question.text()).to.match(/When does code become/)
    
    const answer = _component.find('h5')
    expect(answer).to.exist
    expect(answer.text()).to.match(/A: When it /)
  })

  it('Renders an awesome duck image', () => {
    const duck = _component.find('img')
    expect(duck).to.exist
    expect(duck.attr('alt')).to.match(/This is a duck, because Redux!/)
  })

})
