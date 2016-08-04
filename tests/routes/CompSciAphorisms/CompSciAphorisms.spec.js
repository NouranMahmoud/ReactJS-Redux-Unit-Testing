import React from 'react'
import CompSciAphorisms from 'routes/CompSciAphorisms/CompSciAphorisms'
import { mount, shallow } from 'enzyme';

// http://www.thereformedprogrammer.net/unit-testing-react-components-that-use-redux/
const props = {
  aphorismData: {quote: "Yowsa!", by: "Zippy the Pinhead"},
  all: [
    {quote: "Yowsa!", by: "Zippy the Pinhead"},
    {quote: "Yow!", by: "Zippy the Pinhead"}]
  ,
  enlighten: sinon.spy(),
}

describe('(Component) CompSciAphorisms', () => {
  it('should exist', () => {
    expect(CompSciAphorisms).to.not.be.null
  })

  it('allows us to set props', () => {
    const wrapper = mount(<CompSciAphorisms {...props} />)
    expect(wrapper.props().aphorismData).to.eql({quote: "Yowsa!", by: "Zippy the Pinhead"})
    wrapper.setProps({ aphorismData:  {quote: "Yow!", by: "Zippy the Pinhead"} });
    expect(wrapper.props().aphorismData.quote).to.equal('Yow!')
  })

  it('Simulate wisdom', () => {
    const wrapper = shallow(<CompSciAphorisms {...props} />)
    wrapper.find('.wisdom').simulate('click')
    expect(props.enlighten.calledOnce).to.be.true
  })

  it('List populated', () => {
    const wrapper = shallow(<CompSciAphorisms {...props} />)
    wrapper.find('li').forEach(function (node) {
      expect(node.text()).to.be.oneOf([
        'Yow! ~ Zippy the Pinhead',
        'Yowsa! ~ Zippy the Pinhead'
      ]);
    });
  })
})
