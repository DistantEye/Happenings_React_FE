import React, { Component } from 'react';
import { Button, Row, Col, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import UserDropDown from '../../helper/UserDropDown';
import { ApiRequest }  from '../../../services/ApiRequest'

class CalendarViewOther extends Component {
    constructor(props) {
        super(props);

        this.state = {
                        userData: props.userData
                    };

        this.getData = this.getData.bind(this);
        this.handleOnChange = this.handleOnChange.bind(this);
    }

    componentDidMount() {
        this.getData();
    }

    handleOnChange(event)
    {
        this.setState({
            userId: event.target.value
        });
    }

    getData() {
        var self = this;

        // create or update we need some extra data for dropdowns

        ApiRequest(('happening/getUserList'), 'GET',
                    function(xhr) {
                        const respText = (xhr.responseText && xhr.responseText !== "") && xhr.responseText;
                        const userSet = respText && JSON.parse(respText);
                        if (!userSet || (typeof userSet !== "object") || Object.keys(userSet).length === 0)
                        {
                            throw new Error("Couldn't parse userSet from (happening/getUserList)");
                        }

                        let userKeys = Object.keys(userSet);
                        let parsedUserSet = [];

                        for (let i = 0; i < userKeys.length; i++)
                        {
                            let key = userKeys[i];
                            parsedUserSet[i] = [String(key), String(userSet[key])];
                        }

                        self.setState({
                            userSet: parsedUserSet
                        });
                    },
                    function(xhr) {
                        // TODO error handling?
                    });
    }

    render() {
        const userSet = this.state.userSet;

        if (!userSet)
        {
            return null;
        }

        const userId = this.state.userId ? this.state.userId : userSet[0][0];
        const qs = userId ? "?userId="+userId : "";
        const qsLv = userId ? "&userId="+userId : "";

        return (
            <Container className="CalendarViewOther leftTextAlign">
                <Row>
                    <Col>
                        <h1>About</h1>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        View Calendar For:
                        <span className="paddingMinor"></span>
                        <UserDropDown
                                name="userId"
                                userSet={userSet}
                                className="width10Per inLineBlock"
                                changeCallBack={e => this.handleOnChange(e)}
                                />
                        <span className="paddingMinor"></span>
                        <LinkContainer to={"/calendar"+qs}>
                            <Button className="nudgeUpMinor">View Calendar</Button>
                        </LinkContainer>
                        <span className="paddingMinor"></span>
                        <LinkContainer to={"/calendar?listView=true"+qsLv}>
                            <Button className="nudgeUpMinor">View Calendar (List View)</Button>
                        </LinkContainer>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default CalendarViewOther;
