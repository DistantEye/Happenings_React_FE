import React, { Component } from 'react';
import {
  Route,
  BrowserRouter,
  Switch
} from 'react-router-dom';

import { Modal } from 'react-bootstrap';

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

    this.state = {isLoggedIn: undefined, userData: undefined, apiResponse: false};

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
    ApiRequest('home/getInfo', 'GET',
                function(xhr) {
                  const respText = (xhr.responseText && xhr.responseText !== "") && xhr.responseText;
                  let data = respText && JSON.parse(respText);
                  let user = data && data.currentUser;

                  self.setState(state => ({
                    apiResponse: true,
                    isLoggedIn: user && user.id,
                    userData: user,
                    systemInfo: data
                  }));
                },
                function(xhr) {
                    // TODO error handling?
                });
  }

  render() {
    const { isLoggedIn, apiResponse } = this.state;

    if (!apiResponse) { return null; } // haven't gotten any response back yet

    let cssInsert = "";

    if (!isLoggedIn) {
      cssInsert = " blur";
    }

    const RenderLogout = (props) => {
      return (
        <Logout callback={this.checkLogin} />
      );
    }

    const userData = this.state.userData;
    const loginId = userData && userData.id;


    const RenderCalendar = ({location}) => {
      return (
        <Calendar location={location} userData={userData} />
      );
    }

    const RenderProfile = (props) => {
      return (
        <Profile userId={loginId} />
      );
    }

    const RenderAdmin = (props) => {
      return (
        <Admin systemInfo={this.state.systemInfo} callback={this.checkLogin} />
      );
    }

    const RenderHappening = ({match}) => {
      return (
        <Happening userData={userData} match={match} />
      );
    }

    const RenderHappeningWrite = ({match,history, location}) => {
      return (
        <HappeningWrite userData={userData} match={match} history={history} location={location} />
      );
    }

    const Refresh = ({ path = '/' }) => (
        <Route
            path={path}
            component={({ history, location, match }) => {
                history.replace({
                    ...location,
                    pathname:location.pathname.substring(match.path.length)
                });
                return null;
            }}
        />
    );

    return (
      <div className="maxHeight">
          <BrowserRouter basename={ process.env.REACT_APP_BASE_PATH}>
            <div className={"App maxHeight" + cssInsert} >
              <TopBar userData={this.state.userData} numActive={this.state.systemInfo && this.state.systemInfo.reminderCount} />
              <div className="content bg-light maxHeight">
                <div className="maxHeight maxWidth">
                    <CElm con={isLoggedIn}>
                        <Switch>
                            <Route path="/calendar/viewOther" component={CalendarViewOther}/>
                            <Route path="/calendar" render={RenderCalendar}/>
                            <Route path="/happening/write/:id?" render={RenderHappeningWrite}/>
                            <Route path="/happening/:id" render={RenderHappening}/>
                            <Route path="/invitation" component={Invitations}/>
                            <Route path="/profile" render={RenderProfile}/>
                            <Route path="/admin" render={RenderAdmin}/>
                            <Route path="/reminders" component={Reminders}/>
                            <Route path="/Logout" render={RenderLogout}/>
                            <Route exact path="/" render={RenderCalendar}/>
                            <Refresh path="/refresh"/>
                        </Switch>
                    </CElm>
                </div>
              </div>
            </div>
          </BrowserRouter>
          <Modal
            show={!isLoggedIn}
            centered
            backdrop="static"
            dialogClassName="largeModal"
          >
            <div className="padding">
              <Login callback={this.checkLogin} systemInfo={this.state.systemInfo} />
            </div>
          </Modal>
      </div>
    );
  }
}

export default App;
