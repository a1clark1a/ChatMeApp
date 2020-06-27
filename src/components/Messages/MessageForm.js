import React, { Component } from "react"
import uuidv4 from "uuid/v4"
import { Segment, Button, Input } from "semantic-ui-react"
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
    percentUploaded: 0,
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
    const { messagesRef } = this.props
    const { message, channel } = this.state

    if (message) {
      this.setState({ loading: true })
      messagesRef
        .child(channel.id)
        .push()
        .set(this.createMessage())
        .then(() => {
          this.setState({ loading: false, message: "", errors: [] })
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

  uploadFile = (file, metadata) => {
    const pathToUpload = this.state.channel.id
    const ref = this.props.messagesRef
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
    } = this.state

    return (
      <Segment className="message__form">
        <Input
          fluid
          name="message"
          onChange={this.handleChange}
          value={message}
          style={{ marginBottom: "0.7em" }}
          label={<Button icon={"add"} />}
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
