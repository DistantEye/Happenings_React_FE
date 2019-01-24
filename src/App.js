import React, { Component } from 'react';
import {
  Route,
  HashRouter,
  Switch
} from 'react-router-dom';

import { Container, Modal } from 'react-bootstrap';

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
  Logout
} from './components/pages/Login'
import Profile from './components/pages/Profile'
import Reminders from './components/pages/Reminders'

import { ApiRequest }  from './services/ApiRequest'
import CElm from './components/helper/CElm'

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
                  const respText = (xhr.responseText && xhr.responseText !== "") && xhr.responseText;
                  let user = respText && JSON.parse(respText);
                  self.setState(state => ({
                    isLoggedIn: !(!user || user === null || user === undefined),
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

    const RenderLogout = (props) => {
      return (
        <Logout callback={this.checkLogin} />
      );
    }

    const loginId = this.state.userData.id;
    const userData = this.state.userData;

    const RenderProfile = (props) => {
      return (
        <Profile userId={loginId} />
      );
    }

    const RenderHappening = ({match}) => {
      return (
        <Happening userData={userData} match={match}/>
      );
    }

    return (
      <div className="maxHeight">
          <HashRouter>
            <div className={"App maxHeight" + cssInsert} >
              <TopBar userData={this.state.userData} />
              <div className="content bg-light maxHeight">
                <Container className="container-fluid">
                    <CElm con={isLoggedIn}>
                        <Switch>
                            <Route path="/calendar/viewOther" component={CalendarViewOther}/>
                            <Route path="/calendar" component={Calendar}/>
                            <Route path="/happening/:id" render={RenderHappening}/>
                            <Route path="/invitation" component={Invitations}/>
                            <Route path="/profile" render={RenderProfile}/>
                            <Route path="/admin" component={Admin}/>
                            <Route path="/reminders" component={Reminders}/>
                            <Route path="/Logout" render={RenderLogout}/>
                            <Route exact path="/" component={Calendar}/>
                        </Switch>
                    </CElm>
                </Container>
              </div>
            </div>
          </HashRouter>
          <Modal
            show={!isLoggedIn}
            centered
            backdrop="static"
            dialogClassName="largeModal"
          >
            <div className="padding">
              <Login callback={this.checkLogin}/>
            </div>
          </Modal>
      </div>
    );
  }
}

export default App;