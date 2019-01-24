import React, { Component } from 'react';
import { Form, Button, Row } from 'react-bootstrap';
import { ApiRequest, SetErrorText }  from '../../../services/ApiRequest';
import CElm from '../../helper/CElm';

class Register extends Component {
    constructor(props) {
        super(props);

        this.state = {  validated: false,
                        errorText: "",
                        parentCallback: props.callback,
                        tabSwitchCallback : props.tabSwitchCallBack};
        this.handleSubmit = this.handleSubmit.bind(this);
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
                name: form.elements.login.value,
                friendlyName: form.elements.userName.value,
                passwordOrHash: form.elements.password.value,
                calendarVisibleToOthers: form.elements.calendarPublic.checked
            };
            var self = this;
            ApiRequest('login/register', 'POST',
                        function(xhr) {
                            if (self.state.parentCallback) {
                                self.state.parentCallback();
                            }
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
        const { validated } = this.state;

        return (
                <div>
                    <span className="bigText">Register</span>
                    <span className="padding">
                        <Button
                            variant="outline-secondary"
                            type="button"
                            onClick={(e) => this.state.tabSwitchCallback(e)}
                            className="nudgeUp"
                        >
                            Existing User
                        </Button>
                    </span>
                    <br/>
                    <CElm con={this.state.errorText}>
                        <p className="errorText">{this.state.errorText}</p>
                    </CElm>
                    <div className="padding">
                        <Form
                        noValidate
                        validated={validated}
                        onSubmit={e => this.handleSubmit(e)}
                        >
                            <Form.Group as={Row} controlId="login">
                                <Form.Label>Login</Form.Label>
                                <Form.Control
                                  type="text"
                                  placeholder="Login"
                                  required
                                />
                            </Form.Group>

                            <Form.Group as={Row} controlId="userName">
                                <Form.Label>User Name</Form.Label>
                                <Form.Control
                                  type="text"
                                  placeholder="User Name"
                                  required
                                />
                            </Form.Group>

                            <Form.Group as={Row} controlId="password">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                  type="password"
                                  placeholder="Password"
                                  required
                                />
                            </Form.Group>

                            <Form.Group as={Row}>
                                Calendar Visible to Others?
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Check
                                    type="radio"
                                    inline
                                    label="Yes"
                                    value="true"
                                    id="calendarPublic"
                                    name="calendarVisibleToOthers"
                                    checked="checked"
                                />
                                <Form.Check
                                    type="radio"
                                    inline
                                    label="No"
                                    value="false"
                                    id="calendarPrivate"
                                    name="calendarVisibleToOthers"
                                />
                            </Form.Group>

                            <Form.Group as={Row}>
                                    <Button variant="primary" type="submit">
                                        Submit
                                    </Button>
                            </Form.Group>
                        </Form>
                    </div>
                </div>
            );
    }

}

export default Register;
