import React, { Component } from 'react';
import { Form, Button, Row } from 'react-bootstrap';
import { ApiRequest, SetErrorText }  from '../../../services/ApiRequest'
import CElm from '../../helper/CElm'
import Register from './Register'

class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {  validated: false,
                        errorText: "",
                        parentCallback: props.callback,
                        tab: "login"};
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleTabSwitch = this.handleTabSwitch.bind(this);
    }

    handleTabSwitch(event) {
        if (this.state.tab === "login")
        {
            this.setState({ tab: "register" });
        }
        else {
            this.setState({ tab: "login" });
        }
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
                userName: form.elements.login.value,
                password: form.elements.password.value
            };
            var self = this;
            ApiRequest('login/login', 'POST',
                        function(xhr) {
                              if (xhr.responseText === "false")
                              {
                                  self.setState(state => ({
                                      errorText: "Login or password was invalid"
                                  }));
                              }
                              else {
                                  if (self.state.parentCallback) {
                                      self.state.parentCallback();
                                  }
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
        if (this.state.tab === "login")
        {
        return (
                <div>
                    <span className="bigText">Login</span>
                    <span className="padding">
                        <Button
                            variant="outline-secondary"
                            type="button"
                            onClick={(e) => this.handleTabSwitch(e)}
                            className="nudgeUp"
                        >
                            New User
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

                            <Form.Group as={Row} controlId="password">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                  type="password"
                                  placeholder="Password"
                                  required
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
        else {
            return <Register callback={this.state.parentCallback} tabSwitchCallBack={this.handleTabSwitch}/>
        }
    }
}

export default Login;
