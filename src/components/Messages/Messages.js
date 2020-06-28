import React, { Component } from "react"
import { Segment, Comment } from "semantic-ui-react"
import firebase from "../../firebase"

import MessagesHeader from "./MessagesHeader"
import MessageForm from "./MessageForm"
import Message from "./Message"

class Messages extends Component {
  state = {
    messagesRef: firebase.database().ref("messages"),
    messages: [],
    messagesLoading: true,
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    numUniqueUsers: "",
    searchTerm: "",
    searchLoading: false,
    searchResults: [],
    privateChannel: this.props.isPrivateChannel,
    privateMessagesRef: firebase.database().ref("privateMessages"),
  }

  componentDidMount() {
    const { channel, user } = this.state

    if (channel && user) {
      this.addListeners(channel.id)
    }
  }

  addListeners = (channelId) => {
    this.addMessageListener(channelId)
  }

  addMessageListener = (channelId) => {
    let loadedMessage = []
    const ref = this.getMessagesRef()
    ref.child(channelId).on("child_added", (snap) => {
      loadedMessage.push(snap.val())
      this.setState({
        messages: loadedMessage,
        messagesLoading: false,
      })
      this.countUniqueUsers(loadedMessage)
    })
  }

  getMessagesRef = () => {
    const { messagesRef, privateMessagesRef, privateChannel } = this.state
    return privateChannel ? privateMessagesRef : messagesRef
  }

  countUniqueUsers = (messages) => {
    const uniqueUsers = messages.reduce((acc, message) => {
      if (!acc.includes(message.user.name)) {
        acc.push(message.user.name)
      }
      return acc
    }, [])
    const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0
    const numUniqueUsers = `${uniqueUsers.length} user${plural ? "s" : ""}`
    this.setState({
      numUniqueUsers,
    })
  }

  handleSearchChange = (event) => {
    this.setState(
      {
        searchTerm: event.target.value,
        searchLoading: true,
      },
      () => this.handleSearchMessage()
    )
  }

  handleSearchMessage = () => {
    const channelMessages = [...this.state.messages]
    const regex = new RegExp(this.state.searchTerm, "gi")
    const searchResults = channelMessages.reduce((acc, message) => {
      // prettier-ignore
      if ((message.content && message.content.match(regex)) || message.user.name.match(regex)) {
        acc.push(message)
      }
      return acc
    }, [])
    this.setState({ searchResults })
    setTimeout(() => this.setState({ searchLoading: false }), 1000)
  }

  displayMessages = (messages) =>
    messages.length > 0 &&
    messages.map((message) => (
      <Message
        key={message.timestamp}
        message={message}
        user={this.state.user}
      />
    ))

  displayChannelName = (channel) => {
    return channel
      ? `${this.state.privateChannel ? "@" : "#"}${channel.name}`
      : ""
  }

  render() {
    // prettier-ignore
    const { messagesRef, channel, user, messages, numUniqueUsers, 
      searchTerm, searchResults, searchLoading, privateChannel } = this.state

    return (
      <React.Fragment>
        <MessagesHeader
          channelName={this.displayChannelName(channel)}
          numUniqueUsers={numUniqueUsers}
          handleSearchChange={this.handleSearchChange}
          searchLoading={searchLoading}
          isPrivateChannel={privateChannel}
        />

        <Segment>
          <Comment.Group className="messages">
            {searchTerm
              ? this.displayMessages(searchResults)
              : this.displayMessages(messages)}
          </Comment.Group>
        </Segment>

        <MessageForm
          messagesRef={messagesRef}
          currentChannel={channel}
          currentUser={user}
          isPrivateChannel={privateChannel}
          getMessagesRef={this.getMessagesRef}
        />
      </React.Fragment>
    )
  }
}

export default Messages
