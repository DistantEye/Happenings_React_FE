import React from 'react';

import {
  Container,
  Navbar,
  Nav
} from 'react-bootstrap';

import ReminderCount from './ReminderCount';
import RouterNavItem from './RouterNavItem';

function TopBar(props) {
    const userData = props.userData;

    if (!userData) { return null; }

    // store relevant info in tag agnostic way
    const linkArray = [
        {
            key:     "CalendarMain",
            to:      "/Calendar/Index",
            inner:   "Calendar",
            display: true
        },
        {
            key:     "CreateHappening",
            to:      "/Happening/Write/",
            inner:   "Create Happening",
            exact:   true,
            display: true
        },
        {
            key:     "Invitations",
            to:      "/Invitation/Index",
            inner:   "Pending Invitations",
            display: true
        },
        {
            key:     "CalendarViewOther",
            to:      "/Calendar/ViewOther",
            inner:   "View Other Calendars",
            display: true
        },
        {
            key:     "Profile",
            to:      "/Profile",
            inner:   "Profile",
            display: true
        },
        {
            key:     "Admin",
            to:      "/Admin/Index",
            inner:   "Admin",
            display: (userData.role === "Admin")
        },
        {
            key:     "Reminders",
            to:      "/Reminders",
            inner:   (<>Reminders <ReminderCount numActive={props.numActive}></ReminderCount></>),
            display: true
        },
        {
            key:     "Logout",
            to:      "/Logout",
            inner:   "Logout",
            display: true
        },

    ];

    return (
        <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
            <Container>
                <Navbar.Brand className="brandText">
                    Happenings
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav defaultActiveKey="/Calendar/Index" as="ul" >
                        {linkArray.map(function(item,index) {
                            if (!item.display)
                            {
                                return null;
                            }

                            return (
                                    <RouterNavItem
                                        to={item.to}
                                        exact={item.exact}
                                        key={item.key}
                                    >
                                        {item.inner}
                                    </RouterNavItem>
                                );
                        })}

                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default TopBar;
