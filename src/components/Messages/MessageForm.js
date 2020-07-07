import React, { Component } from "react"
import uuidv4 from "uuid/v4"
import { Segment, Button, Input } from "semantic-ui-react"
import { Picker, emojiIndex } from "emoji-mart"
import "emoji-mart/css/emoji-mart.css"
import firebase from "../../firebase"

import FileModal from "./FileModal"
import ProgressBar from "./ProgressBar"

class MessageForm extends Component {
  state = {
    message: "",
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    loading: false,
    errors: [],
    modal: false,
    uploadState: "",
    uploadTask: null,
    storageRef: firebase.storage().ref(),
    typingRef: firebase.database().ref("typing"),
    percentUploaded: 0,
    emojiPicker: false,
  }

  componentWillUnmount() {
    if (this.state.uploadTask !== null) {
      this.state.uploadTask.cancel()
      this.setState({ uploadTask: null })
    }
  }

  openModal = () => {
    return this.setState({ modal: true })
  }

  closeModal = () => {
    return this.setState({ modal: false })
  }

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value, errors: [] })
  }

  handleKeyDown = (event) => {
    if (event.ctrlKey && event.keyCode === 13) {
      this.sendMessage()
    }
    const { message, typingRef, channel, user } = this.state

    if (message) {
      typingRef.child(channel.id).child(user.uid).set(user.displayName)
    } else {
      typingRef.child(channel.id).child(user.uid).remove()
    }
  }

  handleTogglePicker = () => {
    this.setState({ emojiPicker: !this.state.emojiPicker })
  }

  handleAddEmoji = (emoji) => {
    const oldMessage = this.state.message
    const newMessage = this.colonToUnicode(`${oldMessage} ${emoji.colons}`)
    this.setState({ message: newMessage, emojiPicker: false })
    setTimeout(() => this.messageInputRef.focus(), 0)
  }

  colonToUnicode = (message) => {
    return message.replace(/:[A-Za-z0-9_+-]+:/g, (x) => {
      x = x.replace(/:/g, "")
      let emoji = emojiIndex.emojis[x]
      if (typeof emoji !== "undefine") {
        let unicode = emoji.native
        if (typeof unicode !== "undefined") {
          return unicode
        }
      }
      x = ":" + x + ":"
      return x
    })
  }

  createMessage = (fileurl = null) => {
    const message = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: this.state.user.uid,
        name: this.state.user.displayName,
        avatar: this.state.user.photoURL,
      },
    }
    if (fileurl !== null) {
      message["image"] = fileurl
    } else {
      message["content"] = this.state.message
    }
    return message
  }

  sendMessage = () => {
    const { getMessagesRef } = this.props
    const { message, channel, typingRef, user } = this.state

    if (message) {
      this.setState({ loading: true })
      getMessagesRef()
        .child(channel.id)
        .push()
        .set(this.createMessage())
        .then(() => {
          this.setState({ loading: false, message: "", errors: [] })
          typingRef.child(channel.id).child(user.uid).remove()
        })
        .catch((err) => {
          console.error(err)
          this.setState({
            loading: false,
            errors: this.state.errors.concat(err),
          })
        })
    } else {
      this.setState({
        errors: this.state.errors.concat({ message: "Add a message " }),
      })
    }
  }

  getPath = () => {
    if (this.props.isPrivateChannel) {
      return `chat/private/${this.state.channel.id}`
    } else {
      return `chat/public`
    }
  }

  uploadFile = (file, metadata) => {
    const pathToUpload = this.state.channel.id
    const ref = this.props.getMessagesRef()
    const filePath = `chat/public/${uuidv4()}.jpg`

    this.setState(
      {
        uploadState: "uploading",
        uploadTask: this.state.storageRef.child(filePath).put(file, metadata),
      },
      () => {
        this.state.uploadTask.on(
          "state_changed",
          (snap) => {
            const percentUploaded = Math.round(
              (snap.bytesTransferred / snap.totalBytes) * 100
            )
            this.setState({ percentUploaded })
          },
          (err) => {
            console.error(err)
            this.setState({
              errors: this.state.errors.concat(err),
              uploadState: "error",
              uploadTask: null,
            })
          },
          () => {
            this.state.uploadTask.snapshot.ref
              .getDownloadURL()
              .then((downloadurl) => {
                this.sendFileMessage(downloadurl, ref, pathToUpload)
              })
              .catch((err) => {
                console.error(err)
                this.setState({
                  errors: this.state.errors.concat(err),
                  uploadState: "error",
                  uploadTask: null,
                })
              })
          }
        )
      }
    )
  }

  sendFileMessage = (fileUrl, ref, pathToUpload) => {
    ref
      .child(pathToUpload)
      .push()
      .set(this.createMessage(fileUrl))
      .then(() => {
        this.setState({ uploadState: "done" })
      })
      .catch((err) => {
        console.error(err)
        this.setState({
          errors: this.state.errors.concat(err),
        })
      })
  }

  render() {
    const {
      errors,
      message,
      loading,
      modal,
      uploadState,
      percentUploaded,
      emojiPicker,
    } = this.state

    return (
      <Segment className="message__form">
        {emojiPicker && (
          <Picker
            set="apple"
            onSelect={this.handleAddEmoji}
            className="emojipicker"
            title="pick your emoji"
            emoji="point_up"
          />
        )}
        <Input
          fluid
          ref={(node) => (this.messageInputRef = node)}
          name="message"
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
          value={message}
          style={{ marginBottom: "0.7em" }}
          label={
            <Button
              icon={emojiPicker ? "close" : "add"}
              content={emojiPicker ? "close" : null}
              onClick={this.handleTogglePicker}
            />
          }
          labelPosition="left"
          placeholder="write your message"
          className={
            errors.some((error) => error.message.includes("message"))
              ? "error"
              : ""
          }
        />
        <Button.Group icon widths="2">
          <Button
            onClick={this.sendMessage}
            disabled={loading}
            color="orange"
            content="Add Reply"
            labelPosition="left"
            icon="edit"
          />
          <Button
            disabled={uploadState === "uploading"}
            onClick={this.openModal}
            color="teal"
            content="Upload Media"
            labelPosition="right"
            icon="cloud upload"
          />
        </Button.Group>
        <FileModal
          modal={modal}
          closeModal={this.closeModal}
          uploadFile={this.uploadFile}
        />
        <ProgressBar
          uploadState={uploadState}
          percentUploaded={percentUploaded}
        />
      </Segment>
    )
  }
}

export default MessageForm
