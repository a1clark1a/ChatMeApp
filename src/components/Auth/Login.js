import React, { Component } from "react"
import {
  Grid,
  Form,
  Segment,
  Button,
  Header,
  Message,
  Icon,
} from "semantic-ui-react"
import "./Login-Register.css"

import { Link } from "react-router-dom"
import firebase from "../../firebase"

class Login extends Component {
  state = {
    email: "",
    password: "",
    errors: [],
    loading: false,
  }

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value })
  }

  displayError = (errors) =>
    errors.map((error, i) => <p key={i}>{error.message}</p>)

  handleSubmit = (event) => {
    event.preventDefault()
    if (this.isFormValid(this.state)) {
      this.setState({ errors: [], loading: true })
      firebase
        .auth()
        .signInWithEmailAndPassword(this.state.email, this.state.password)
        .then((signedInUser) => {
          this.setState({ loading: false })
        })
        .catch((err) => {
          this.setState({
            errors: this.state.errors.concat(err),
            loading: false,
          })
        })
    }
  }

  isFormValid = ({ email, password }) => email && password

  handleInputError = (errors, inputName) => {
    return errors.some((error) => {
      return error.message.toLowerCase().includes(inputName)
    })
      ? "error"
      : "'"
  }

  render() {
    const { email, password, errors, loading } = this.state

    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column className="app__column">
          <Header
            as="h1"
            icon
            color="blue"
            textAlign="center"
            style={{ fontFamily: "Raleway" }}
          >
            <Icon name="keyboard" color="blue" />
            Login to ChatMeApp
          </Header>
          <Form onSubmit={this.handleSubmit} size="large">
            <Segment stacked>
              <Form.Input
                fluid
                name="email"
                icon="mail"
                iconPosition="left"
                placeholder="Email Address"
                onChange={this.handleChange}
                value={email}
                className={this.handleInputError(errors, "email")}
                type="email"
              />

              <Form.Input
                fluid
                name="password"
                icon="lock"
                iconPosition="left"
                placeholder="Password"
                onChange={this.handleChange}
                value={password}
                className={this.handleInputError(errors, "password")}
                type="password"
              />

              <Button
                className={loading ? "loading" : ""}
                color="blue"
                fluid
                size="large"
              >
                Submit
              </Button>
            </Segment>
          </Form>
          {errors.length > 0 && (
            <Message error>
              <h3>Error</h3>
              {this.displayError(errors)}
            </Message>
          )}
          <Message>
            Don't have an account? <Link to="/register">Register</Link>
          </Message>
        </Grid.Column>
      </Grid>
    )
  }
}

export default Login
