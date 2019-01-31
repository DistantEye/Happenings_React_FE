import React from 'react';

import {
  Container,
  Navbar,
  Nav
} from 'react-bootstrap';

import CElm from '../helper/CElm';
import ReminderCount from './ReminderCount';
import RouterNavItem from './RouterNavItem';

function TopBar(props) {
  return (<Navbar bg="dark" variant="dark">
              <Container>
                <Navbar.Brand className="brandText">
                    Happenings
                </Navbar.Brand>
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav defaultActiveKey="/Calendar/Index" as="ul">

                        <RouterNavItem to="/Calendar/Index">
                            Calendar
                        </RouterNavItem>

                        <RouterNavItem to="/Happening/Write/" exact={true}>
                            Create Happening
                        </RouterNavItem>

                        <RouterNavItem to="/Invitation/Index">
                            Pending Invitations
                        </RouterNavItem>

                        <RouterNavItem to="/Calendar/ViewOther">
                            View Other Calendars
                        </RouterNavItem>

                        <RouterNavItem to="/Profile">
                            Profile
                        </RouterNavItem>

                        <CElm con={props.userData.role === "Admin"}>
                            <RouterNavItem to="/Admin/Index">
                                Admin
                            </RouterNavItem>
                        </CElm>

                        <RouterNavItem to="/Reminders">
                            Reminders <ReminderCount></ReminderCount>
                        </RouterNavItem>

                        <RouterNavItem to="/Logout">
                            Logout
                        </RouterNavItem>

                    </Nav>
                </Navbar.Collapse>
              </Container>
          </Navbar>);
}

export default TopBar;
