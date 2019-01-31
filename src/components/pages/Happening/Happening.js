import React, { Component } from 'react';
import moment from 'moment';

import { Form, Button, Row, Col, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom'

import { ApiRequest, SetErrorText }  from '../../../services/ApiRequest'
import CElm from '../../helper/CElm'

class Happening extends Component {
    constructor(props) {
        super(props);

        this.state = {
                        validated: false,
                        errorText: "",
                        lastErrorCode: undefined,
                        id: props.match.params.id,
                        userData: props.userData
                    };

        this.getData = this.getData.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleJoin = this.handleJoin.bind(this);
        this.handleLeave = this.handleLeave.bind(this);
    }

    componentDidMount() {
        this.getData();
    }

    getData() {
        var self = this;

        if (!self.state.id)
        {
            return; // stop trying if you didn't get passed the right params
        }

        ApiRequest(('happening/getWithCurrUser/'+self.state.id), 'GET',
                    function(xhr) {
                        // blank out any existing data first
                        self.setState({
                            data: undefined,
                            lastErrorCode: undefined
                        });

                        const respText = (xhr.responseText && xhr.responseText !== "") && xhr.responseText;
                        let happening = respText && JSON.parse(respText);
                        if (!happening || !happening.name)
                        {
                            happening = undefined; // blank out bad datasets
                        }

                        self.setState({
                          data: happening,
                          validated: false
                        });
                    },
                    function(xhr) {
                        self.setState({
                            lastErrorCode: xhr.status
                        });
                        SetErrorText(xhr,self);
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
                happeningId: form.elements.happeningId.value,
                happeningName: form.elements.happeningName.value,
                date: form.elements.date.value,
                userId: form.elements.userId.value,
                userName: form.elements.userName.value,
                status: form.elements.status.value,
                reminderXMinsBefore: form.elements.reminderXMinsBefore.value,
                isPrivate: form.elements.calendarPrivate.checked
            };
            var self = this;
            ApiRequest('happening/updatehappeningmember', 'POST',
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

    handleJoin(event) {
        const form = event.currentTarget.form;

        event.preventDefault(); // we use ajax, avoid submit behaviors getting in the way
        let submitObject = {
            happeningId: form.elements.happeningId.value,
            userId: form.elements.userId.value
        };
        var self = this;
        ApiRequest('happening/addhappeningmember', 'POST',
                    function(xhr) {
                        self.getData();
                    },
                    function(xhr) {
                        SetErrorText(xhr,self);
                    },
                    JSON.stringify(submitObject)
                );

    }

    handleLeave(event) {
        const form = event.currentTarget.form;

        event.preventDefault(); // we use ajax, avoid submit behaviors getting in the way
        let submitObject = {
            happeningId: form.elements.happeningId.value,
            userId: form.elements.userId.value
        };
        var self = this;
        ApiRequest('happening/removehappeningmember', 'POST',
                    function(xhr) {
                        self.getData();
                    },
                    function(xhr) {
                        SetErrorText(xhr,self);
                    },
                    JSON.stringify(submitObject)
                );

    }

    render() {
        const data = this.state.data;

        if (this.state.lastErrorCode && this.state.lastErrorCode === 404)
        {
            return (
                <Container className="Happening width80Per leftTextAlign">
                    <Row>
                        <Col>
                            <h1 className="errorText">Not Found</h1>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <p className="errorText">No happening could be found for this id</p>
                        </Col>
                    </Row>

                    <Row className="padding" />
                    <Row>
                        <Col>
                            <Link to="/calendar">
                                Back to Calendar
                            </Link>
                        </Col>
                    </Row>
                </Container>
            );
        }

        if (!data)
        {
            return null;
        }


        const calendarPrivate = data.currentUserInfo && data.currentUserInfo.isPrivate ? "checked" : "";
        const calendarPublic = data.currentUserInfo && data.currentUserInfo.isPrivate ? "" : "checked";

        // reference issues make CElm unusable, so we do our forms up top
        let variableForm = !data.currentUserInfo ?
            (
                <Form>
                    <input
                      type="hidden"
                      id="userId"
                      name="userId"
                      value={this.state.userData.id}
                    />
                    <input
                      type="hidden"
                      id="happeningId"
                      name="happeningId"
                      value={data.id}
                    />
                    <Row className="width40Per verticalPaddingMinor">
                        <Col>
                            <Button variant="primary" onClick={(e) => this.handleJoin(e)}>
                                Join Happening
                            </Button>
                        </Col>
                    </Row>
                </Form>
            )
            :
            (
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
                      value={data.currentUserInfo.id}
                    />


                    <input
                      type="hidden"
                      id="happeningId"
                      name="happeningId"
                      value={data.id}
                    />

                    <input
                      type="hidden"
                      id="happeningName"
                      name="happeningName"
                      value={data.name}
                    />

                    <input
                      type="hidden"
                      id="date"
                      name="date"
                      value={data.startTime}
                    />

                    <input
                      type="hidden"
                      id="userId"
                      name="userId"
                      value={this.state.userData.id}
                    />

                    <input
                      type="hidden"
                      id="userName"
                      name="userName"
                      value={this.state.userData.name}
                    />

                    <Row className="width40Per verticalPaddingMinor">
                        <Col className="bold">Manage Membership:</Col>
                    </Row>

                    <Row className="verticalPaddingMinor">
                        <Col xs={2}>
                            <Form.Control
                                  as="select"
                                  id="status"
                                  name="status"
                                  defaultValue={data.currentUserInfo.status}
                            >
                                  <option>NoResponse</option>
                                  <option>Yes</option>
                                  <option>No</option>
                                  <option>Maybe</option>
                            </Form.Control>
                        </Col>

                        <Col xs={5}>
                            <span className="paddingMinor">Reminder</span>
                            <Form.Control
                                  type="number"
                                  id="reminderXMinsBefore"
                                  name="reminderXMinsBefore"
                                  defaultValue={data.currentUserInfo.reminderXMinsBefore}
                                  className="width40Per inLineBlock"
                            />
                             <span className="paddingMinor">Mins Before</span>
                        </Col>
                    </Row>

                    <Row className="width40Per verticalPaddingMinor">
                        <Col>
                            Calendar Private? <span className="paddingMinor"></span>
                            <Form.Check
                                type="radio"
                                inline
                                label="Yes"
                                value="true"
                                id="calendarPublic"
                                name="calendarVisibleToOthers"
                                defaultChecked={calendarPrivate}
                            />
                            <Form.Check
                                type="radio"
                                inline
                                label="No"
                                value="false"
                                id="calendarPrivate"
                                name="calendarVisibleToOthers"
                                defaultChecked={calendarPublic}
                            />
                        </Col>
                    </Row>

                    <Row className="width40Per verticalPaddingMinor">
                        <Col>
                            <Button variant="primary" type="submit">
                                Update
                            </Button>
                        <span className="paddingMinor"></span>
                            <Button variant="primary" onClick={(e) => this.handleLeave(e)}>
                                Leave Happening
                            </Button>
                        </Col>
                    </Row>
                </Form>
        );

        return (
            <Container className="Happening width80Per leftTextAlign">
                <Row>
                    <Col>
                        <h1>View Happening</h1>
                    </Col>
                </Row>

                <Row className="paddingMinor" />

                <Row>
                    <Col>
                        <CElm con={this.state.errorText}>
                            <p className="errorText">{this.state.errorText}</p>
                        </CElm>
                    </Col>
                </Row>

                <Row className="paddingMinor" />

                <CElm con={this.state.userData.role === 'Admin' || this.state.userData.id === data.ControllingUserId}>
                    <>
                        <Row>
                            <Col>
                                <Link to={"/Happening/Write/"+this.state.id}>Edit Happening</Link>
                            </Col>
                        </Row>
                        <Row className="paddingMinor" />
                    </>
                </CElm>

                <Row className="width40Per verticalPaddingMinor">
                    <Col className="width20Per bold">Name: </Col>
                    <Col>
                        {data.name}
                    </Col>
                </Row>

                <Row className="width40Per verticalPaddingMinor">
                    <Col className="width20Per bold">Desc: </Col>
                    <Col>
                        {data.description}
                    </Col>
                </Row>

                <Row className="width40Per verticalPaddingMinor">
                    <Col className="width20Per bold">Organizer: </Col>
                    <Col>
                        {data.controllingUser}
                    </Col>
                </Row>

                <Row className="verticalPaddingMinor">
                    <Col xs={1} className="width20Per bold">Time: </Col>
                    <Col>
                        {moment(data.startTime).format('MMMM DD, YYYY hh:mm:ss A')}
                        <span className="padding">to</span>
                        {moment(data.endTime).format('MMMM DD, YYYY hh:mm:ss A')}
                    </Col>
                </Row>

                {variableForm}

                <Row className="padding" />
                <Link to="/calendar">
                    Back to Calendar
                </Link>
            </Container>
        );
    }
}

export default Happening;
