import React from 'react'
import {Center} from 'react-layout-components'

export default class NotFound extends React.Component {
  render() {
    return (
      <div className="container text-center">
        <Center>
          <h1>
            <br/><br/>
            <a href="https://www.youtube.com/watch?v=CMNry4PE93Y">I like turtles.</a>
            <br/><br/>
            <small>Oh yeah... 404.</small>
          </h1>
        </Center>
      </div>
    )
  }
}
