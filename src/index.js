import React, { Component } from "react"
import ReactDOM from "react-dom"
import { BrowserRouter, Switch, Route, withRouter } from "react-router-dom"
import { createStore } from "redux"
import { Provider, connect } from "react-redux"
import { composeWithDevTools } from "redux-devtools-extension"

import registerServiceWorker from "./registerServiceWorker"
import firebase from "./firebase"
import rootReducer from "./reducers"
import { setUser, clearUser } from "./actions/index"

import App from "./components/App"
import Login from "./components/Auth/Login"
import Register from "./components/Auth/Register"
import Spinner from "./Spinner"

import "semantic-ui-css/semantic.min.css"

const store = createStore(rootReducer, composeWithDevTools())
class Root extends Component {
  componentDidMount() {
    console.log(this.props.isLoading)
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.props.setUser(user)
        this.props.history.push("/")
      } else {
        this.props.history.push("/login")
        this.props.clearUser()
      }
    })
  }

  render() {
    return this.props.isLoading ? (
      <Spinner />
    ) : (
      <Switch>
        <Route exact path="/" component={App} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
      </Switch>
    )
  }
}

const mapStateToProps = (state) => ({
  isLoading: state.user.isLoading,
})

const RootWithAuth = withRouter(
  connect(mapStateToProps, { setUser, clearUser })(Root)
)

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <RootWithAuth />
    </BrowserRouter>
  </Provider>,
  document.getElementById("root")
)
registerServiceWorker()
