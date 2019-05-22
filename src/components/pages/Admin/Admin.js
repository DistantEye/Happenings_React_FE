import React, { Component } from 'react';
import { Form, Button, Row, Col, Container, Alert } from 'react-bootstrap';
import { CSSTransition } from 'react-transition-group'
import { ApiRequest, SetErrorText }  from '../../../services/ApiRequest'
import CElm from '../../helper/CElm'

import update from 'immutability-helper';

class Admin extends Component {
    constructor(props) {
        super(props);

        this.state = {
                        validatedObj: [false],
                        errorText: "",
                        parentCallback: props.callback,
                        systemInfo: props.systemInfo,
                        openRegistration: props.systemInfo && props.systemInfo.openRegistration, // this value can become stale from the parent so we track it separately
                        data: undefined};

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleOpenRegChange = this.handleOpenRegChange.bind(this);
        this.getData = this.getData.bind(this);
    }

    componentDidMount() {
        this.getData();
    }

    handleDelete(event) {
        const form = event.currentTarget.form;

        const targetId = form.elements.id.value;
        const currUserId = this.state.systemInfo && this.state.systemInfo.currentUser && this.state.systemInfo.currentUser.id;

        ApiRequest(('admin/'+targetId), 'DELETE',
                    (xhr) => {
                        // clear errorText on success
                        this.setState({errorText: ""}, () => {
                            if (targetId !== currUserId)
                            {
                                this.getData();
                            }
                            else
                            {
                                this.state.parentCallback();
                            }
                        });
                    },
                    (xhr) => {
                        SetErrorText(xhr,this);
                    }
                );

    }

    handleOpenRegChange(flag)
    {
        // to future proof against other values that end up in system settings we grab a new copy of SystemDataDto first, change our value, and resubmit it
        ApiRequest('admin/system', 'GET',
                    (xhr) => {

                      let respText = (xhr.responseText && xhr.responseText !== "") && xhr.responseText;
                      let systemData = respText && JSON.parse(respText);
                      if (!systemData || !systemData.id)
                      {
                          systemData = undefined; // blank out bad datasets
                      }
                      else
                      {
                          systemData.openRegistration = flag;

                          ApiRequest('admin/system', 'PUT',
                                      (xhr) => {
                                          respText = (xhr.responseText && xhr.responseText !== "") && xhr.responseText;
                                          systemData = respText && JSON.parse(respText);
                                          const openRegistration = systemData && systemData.openRegistration;

                                          // set timeout for the below message to expire
                                          window.setTimeout(() =>
                                          {
                                              this.setState({successText:undefined});
                                          }, 5000);
                                          this.setState({
                                                            successText: "Open Registration successfully set to: ("+ flag +")",
                                                            openRegistration: openRegistration
                                                        });
                                      },
                                      (xhr) => {
                                          SetErrorText(xhr,this);
                                      },
                                      JSON.stringify(systemData));

                      }
                    },
                    (xhr) => {
                        SetErrorText(xhr,this);
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
                role: form.elements.role.value,
                name: form.elements.name.value,
                friendlyName: form.elements.friendlyName.value,
                calendarVisibleToOthers: form.elements.calendarVisibleToOthers.value,
                passwordOrHash: form.elements.passwordOrHash.value
            };
            var self = this;

            const target = 'admin/';
            let method = 'PUT';

            if (!form.elements.id || !form.elements.id.value)
            {
                submitObject.id = "00000000-0000-0000-0000-000000000000";
                method = 'POST';
            }

            ApiRequest(target, method,
                        function(xhr) {
                              self.setState({errorText: ""}, () => self.getData());
                        },
                        function(xhr) {
                            SetErrorText(xhr,self);
                        },
                        JSON.stringify(submitObject)
                    );
        }
        let temp = update(this.state.validatedObj, {
                        [form.elements.validatedObjIdx.value]: {$set: true}
                    });
        this.setState({
            validatedObj: temp
        });

    }

    getData() {
      var self = this;
      ApiRequest('admin/', 'GET',
                  function(xhr) {
                    // blank out any existing data first
                    self.setState(state => ({
                        data: undefined,
                        validatedObj: [false]
                    }));

                    const respText = (xhr.responseText && xhr.responseText !== "") && xhr.responseText;
                    let users = respText && JSON.parse(respText);
                    if (!Array.isArray(users) || users.length === 0 || !users[0].name)
                    {
                        users = undefined; // blank out bad datasets
                    }

                    let validatedObj = [false];
                    for (let i=0; i< users.length; i++) {
                        validatedObj[i+1] = false;
                    }

                    self.setState(state => ({
                      data: users,
                      validatedObj: validatedObj
                    }));
                  },
                  function(xhr) {
                      SetErrorText(xhr,self);
                  });
    }

    render() {
        var self = this;
        if (!this.state.data)
        {
            return null; // TODO loading placeholder eventually?
        }
        else {
            const openRegistration = this.state.openRegistration !== undefined ? this.state.openRegistration : undefined;
            const oRegYesBox = openRegistration === true ? "checked" : "";
            const oRegNoBox = openRegistration === false ? "checked" : "";

            const dataSections = (
                                 <>
                                    {this.state.data.map(function(item,index) {
                                        return (
                                                <FormRow
                                                    key={"updateForm"+index}
                                                    formId={"updateForm"+index}
                                                    prefix={"u"+index}
                                                    data={item}
                                                    validatedObj={self.state.validatedObj[index+1]}
                                                    validatedIdx={index+1}
                                                    deleteFunc={self.handleDelete}
                                                    submitFunc={self.handleSubmit}
                                                    />
                                            );
                                    })
                                    }
                                 </>
                                );

            return (
                <Container className="Admin">
                    <h1>Administration</h1>
                    <CElm con={this.state.errorText}>
                        <p className="errorText">{this.state.errorText}</p>
                    </CElm>

                    <CSSTransition in={this.state.successText} timeout={400} mountOnEnter unmountOnExit classNames="fadeTrans">
                        <Alert variant="success">
                            {this.state.successText}
                        </Alert>
                    </CSSTransition>


                    <hr />
                    <h2>System Configuration</h2>

                    <Row className="bold">
                        <Col>Users Can Create Accounts for Themselves: </Col>
                    </Row>

                    <Row className="hAlignCenter dispInlineFlex flexNoGrow verticalPaddingMinor">
                        <Col className="noWrap">
                            Yes <input type="radio" name="openRegistration" value="Yes" onClick={() => this.handleOpenRegChange(true)} defaultChecked={oRegYesBox} />
                        </Col>
                        <Col className="noWrap">
                            No <input type="radio" name="openRegistration" value="No" onClick={() => this.handleOpenRegChange(false)} defaultChecked={oRegNoBox} />
                        </Col>
                    </Row>

                    <hr />

                    <h2>Existing Users</h2>

                        <Row className="bold">
                            <Col>Login</Col>
                            <Col>Name</Col>
                            <Col>Password</Col>
                            <Col>Role</Col>
                            <Col>Public Calendar</Col>
                            <Col> </Col>
                            <Col> </Col>
                        </Row>

                        {dataSections}
                    <hr/>
                    <h2>Add new</h2>

                        <Row className="bold">
                            <Col>Login</Col>
                            <Col>Name</Col>
                            <Col>Password</Col>
                            <Col>Role</Col>
                            <Col>Public Calendar</Col>
                            <Col> </Col>
                            <Col> </Col>
                        </Row>

                        <FormRow
                            formId="createForm"
                            prefix="c"
                            validatedObj={this.state.validatedObj[0]}
                            validatedIdx={0}
                            deleteFunc={this.handleDelete}
                            submitFunc={self.handleSubmit}
                            />
                </Container>
                );
        }
    }
}

// avoiding Yo-Yo Antipattern is more important than 1 component per file restrictions

function FormRow(props) {
  const formId = props.formId;
  const controlPrefix = props.prefix;
  const validatedObj = props.validatedObj;
  let data = props.data;

  if(!data)
  {
      data = {
          id: undefined,
          role: "Normal",
          name: "",
          friendlyName: "",
          calendarVisibleToOthers: true,
          passwordOrHash: ""
      }
  }

  const calendarPublic = data.calendarVisibleToOthers ? "checked" : "";
  const calendarPrivate = data.calendarVisibleToOthers ? "" : "checked";

  const actionWord = data.id ? "Update" : "Create";

  return (
      <Form
      noValidate
      validated={validatedObj}
      onSubmit={e => props.submitFunc(e)}
      id={formId}
      key={formId}
      >

          <input
            type="hidden"
            id={controlPrefix+"Id"}
            name="id"
            value={data.id}
          />


          <input
            type="hidden"
            id={controlPrefix+"validatedObjIdx"}
            name="validatedObjIdx"
            value={props.validatedIdx}
          />

          <Row className="padding">
              <Col>
                  <Form.Control
                            type="text"
                            placeholder="Login"
                            id={controlPrefix+"cLogin"}
                            name="name"
                            defaultValue={data.name}
                            required
                          />
              </Col>

              <Col>
                  <Form.Control
                            type="text"
                            placeholder="Name"
                            id={controlPrefix+"cName"}
                            name="friendlyName"
                            defaultValue={data.friendlyName}
                            required
                          />
              </Col>

              <Col>
                  <CElm con={data.id}>
                      <Form.Control
                                type="password"
                                id={controlPrefix+"cPassword"}
                                name="passwordOrHash"
                              />
                  </CElm>
                  <CElm con={!data.id}>
                      <Form.Control
                                type="password"
                                id={controlPrefix+"cPassword"}
                                name="passwordOrHash"
                                required
                              />
                  </CElm>
              </Col>

              <Col>
                  <Form.Control
                        as="select"
                        id={controlPrefix+"cRole"}
                        name="role"
                        defaultValue={data.role}
                  >
                        <option>Normal</option>
                        <option>Admin</option>
                  </Form.Control>
              </Col>

              <Col>
                  <Form.Check
                      type="radio"
                      inline
                      label="Yes"
                      value="true"
                      id={controlPrefix+"cCalendarPublic"}
                      name="calendarVisibleToOthers"
                      defaultChecked={calendarPublic}
                  />
                  <Form.Check
                      type="radio"
                      inline
                      label="No"
                      value="false"
                      id={controlPrefix+"cCalendarPrivate"}
                      name="calendarVisibleToOthers"
                      defaultChecked={calendarPrivate}
                  />
              </Col>

              <Col>
                  <Button variant="primary" type="submit">
                      {actionWord}
                  </Button>
              </Col>

              <CElm con={data.id}>
                  <Col>
                      <Button variant="secondary" onClick={props.deleteFunc}>
                          Delete
                      </Button>
                  </Col>
              </CElm>
              <CElm con={!data.id}>
                  <Col> </Col>
              </CElm>
          </Row>
      </Form>
        );
}


export default Admin;
