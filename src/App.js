import React, { Component } from 'react';
import {
  Route,
  HashRouter,
  Switch
} from 'react-router-dom';

import { Container } from 'react-bootstrap';

import './App.css';

import TopBar from './components/decorative/TopBar'

import Admin from './components/pages/Admin'
import {
  Calendar,
  CalendarViewOther
} from './components/pages/Calendar'
import {
  Happening,
  HappeningWrite
} from './components/pages/Happening'
import Invitations from './components/pages/Invitations'
import {
  Login,
  Register
} from './components/pages/Login'
import Profile from './components/pages/Profile'
import Reminders from './components/pages/Reminders'

import ApiRequest from './services/ApiRequest'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {isLoggedIn: undefined, userData: undefined};

    this.checkLogin = this.checkLogin.bind(this);
  }

  componentDidMount() {
      this.checkLogin();
      this.loginPull = setInterval(
        () => this.checkLogin(),
        5000
      );
  }

  componentWillUnmount() {
      clearInterval(this.loginPull);
  }

  checkLogin() {
    var self = this;
    ApiRequest('login/getcurrentUser', 'GET',
                function(xhr) {
                  let user = JSON.parse(xhr.responseText);
                  self.setState(state => ({
                    isLoggedIn: !(user == null || user == undefined),
                    userData: user
                  }));
                },
                function(xhr) {
                    // TODO error handling?
                });
  }

  render() {
    const isLoggedIn = this.state.isLoggedIn;

    if (isLoggedIn === undefined) { return null; } // haven't gotten any response back yet

    let cssInsert = "";

    if (!isLoggedIn) {
      cssInsert = " blur";
    }

    return (
      <HashRouter>
        <div className={"App maxHeight" + cssInsert}>
          <TopBar />
          <div className="content bg-light maxHeight">
            <Container className="container-fluid">
                <Switch>
                    <Route path="/calendar/viewOther" component={CalendarViewOther}/>
                    <Route path="/calendar" component={Calendar}/>
                    <Route path="/happening" component={Happening}/>
                    <Route path="/invitation" component={Invitations}/>
                    <Route path="/profile" component={Profile}/>
                    <Route path="/admin" component={Admin}/>
                    <Route path="/reminders" component={Reminders}/>
                    <Route exact path="/" component={Calendar}/>
                </Switch>
            </Container>
          </div>
        </div>
      </HashRouter>
    );
  }
}

export default App;
