import React, { Component } from 'react';

import { Form, Button, Row, Col, Container } from 'react-bootstrap';
import { ApiRequest, SetErrorText }  from '../../services/ApiRequest'
import CElm from '../helper/CElm'

class Profile extends Component {
    constructor(props) {
        super(props);

        this.state = {
                        validated: false,
                        errorText: "",
                        parentCallback: props.callback,
                        tabSwitchCallback : props.tabSwitchCallBack,
                        userId: props.userId
                    };

        this.getData = this.getData.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        this.getData();
    }

    getData() {
        var self = this;

        ApiRequest(('home/'+self.state.userId), 'GET',
                    function(xhr) {
                        // blank out any existing data first
                        self.setState(state => ({
                            data: undefined
                        }));

                        const respText = (xhr.responseText && xhr.responseText !== "") && xhr.responseText;
                        let user = respText && JSON.parse(respText);
                        if (!user || !user.name)
                        {
                            user = undefined; // blank out bad datasets
                        }

                        self.setState(state => ({
                          data: user,
                          validated: false
                        }));
                    },
                    function(xhr) {
                        // TODO error handling?
                    });
    }

    handleSubmit(event) {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        }
        else {
            event.preventDefault(); // we use ajax, avoid submit behaviors getting in the way
            let submitObject = {
                id: form.elements.id.value,
                name: form.elements.name.value,
                role: form.elements.role.value,
                friendlyName: form.elements.friendlyName.value,
                passwordOrHash: form.elements.passwordOrHash.value,
                calendarVisibleToOthers: form.elements.calendarPublic.checked
            };
            var self = this;
            ApiRequest('home', 'PUT',
                        function(xhr) {
                            self.getData();
                        },
                        function(xhr) {
                            SetErrorText(xhr,self);
                        },
                        JSON.stringify(submitObject)
                    );
        }
        this.setState({ validated: true });
    }

    render() {
        const data = this.state.data;

        if (!data)
        {
            return null;
        }

        const calendarPublic = data.calendarVisibleToOthers ? "checked" : "";
        const calendarPrivate = data.calendarVisibleToOthers ? "" : "checked";

        return (
            <Container className="Profile width80Per">
                <Row className="leftTextAlign">
                    <Col>
                        <h1>Update Profile</h1>
                    </Col>
                </Row>

                <Row className="paddingMinor" />

                <Row className="leftTextAlign">
                    <Col>
                        <CElm con={this.state.errorText}>
                            <p className="errorText">{this.state.errorText}</p>
                        </CElm>
                    </Col>
                </Row>

                <Row className="paddingMinor" />

                <Form
                noValidate
                validated={this.state.validated}
                onSubmit={e => this.handleSubmit(e)}
                className="leftTextAlign"
                >
                    <input
                      type="hidden"
                      id="id"
                      name="id"
                      value={data.id}
                    />

                    <input
                      type="hidden"
                      id="role"
                      name="role"
                      value={data.role}
                    />

                    <Row className="width40Per verticalPaddingMinor">
                        <Col>Login: </Col>
                        <Col>
                            <Form.Control
                              type="text"
                              placeholder="Login"
                              id="name"
                              name="name"
                              defaultValue={data.name}
                              required
                            />
                        </Col>
                    </Row>

                    <Row className="width40Per verticalPaddingMinor">
                        <Col>Name: </Col>
                        <Col>
                            <Form.Control
                              type="text"
                              placeholder="User Name"
                              name="friendlyName"
                              id="friendlyName"
                              defaultValue={data.friendlyName}
                              required
                            />
                        </Col>
                    </Row>

                    <Row className="width40Per verticalPaddingMinor">
                        <Col>Password: </Col>
                        <Col>
                            <Form.Control
                              type="password"
                              placeholder="Password"
                              name="passwordOrHash"
                              id="passwordOrHash"
                              defaultValue={data.passwordOrHash}
                            />
                        </Col>
                    </Row>

                    <Row className="width40Per verticalPaddingMinor">
                        <Col>Calendar Visible to Others?</Col>
                    </Row>
                    <Row className="width40Per verticalPaddingMinor">
                        <Col>
                            <Form.Check
                                type="radio"
                                inline
                                label="Yes"
                                value="true"
                                id="calendarPublic"
                                name="calendarVisibleToOthers"
                                defaultChecked={calendarPublic}
                            />
                            <Form.Check
                                type="radio"
                                inline
                                label="No"
                                value="false"
                                id="calendarPrivate"
                                name="calendarVisibleToOthers"
                                defaultChecked={calendarPrivate}
                            />
                        </Col>
                    </Row>

                    <Row className="width40Per verticalPaddingMinor">
                        <Col>
                            <Button variant="primary" type="submit">
                                Submit
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Container>
        );
    }
}

export default Profile;
