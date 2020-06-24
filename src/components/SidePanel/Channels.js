import React, { Component } from "react"
import { Menu, Icon } from "semantic-ui-react"

class Channels extends Component {
  state = {
    channels: [],
  }

  render() {
    const { channels } = this.state

    return (
      <Menu.Menu style={{ paddingBottom: " 2 em" }}>
        <Menu.Item>
          <span>
            <Icon name="exchange" /> Channels
          </span>
          ({channels.length}) <Icon name="add" />
        </Menu.Item>
        {/*Channels here */}
      </Menu.Menu>
    )
  }
}

export default Channels
