import React, { Component } from 'react';
import DateTime from 'react-datetime';

import { Form, Button, Row, Col, Container } from 'react-bootstrap';

import { ApiRequest, SetErrorText }  from '../../../services/ApiRequest';
import CElm from '../../helper/CElm';
import UserDropDown from '../../helper/UserDropDown';

class HappeningWrite extends Component {
    constructor(props) {
        super(props);

        this.state = {
                        validated: false,
                        errorText: "",
                        id: props.match.params.id,
                        userData: props.userData,
                        history: props.history
                    };

        this.getData = this.getData.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
        this.handleAdd = this.handleAdd.bind(this);
        this.handleRemove = this.handleRemove.bind(this);
    }

    componentDidMount() {
        this.getData();
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

        if (self.state.id)
        {
            ApiRequest(('happening/getWithData/'+self.state.id), 'GET',
                        function(xhr) {
                            // blank out any existing data first
                            self.setState(state => ({
                                data: undefined
                            }));

                            const respText = (xhr.responseText && xhr.responseText !== "") && xhr.responseText;
                            let happening = respText && JSON.parse(respText);
                            if (!happening || !happening.name)
                            {
                                happening = undefined; // blank out bad datasets
                            }

                            self.setState(state => ({
                              data: happening
                            }));
                        },
                        function(xhr) {
                            // TODO error handling?
                        });
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
                id: form.elements.id.value,
                name: form.elements.happeningId.value,
                description: form.elements.happeningName.value,
                controllingUser: form.elements.date.value,
                controllingUserId: form.elements.userId.value,
                startTime: form.elements.userName.value,
                endTime: form.elements.status.value,
                isPrivate: form.elements.calendarPrivate.checked
            };
            var self = this;
            ApiRequest('happening/updatehappeningmember', 'POST',
                        function(xhr) {
                            const respText = (xhr.responseText && xhr.responseText !== "") && xhr.responseText;
                            let happening = respText && JSON.parse(respText);
                            if (!happening || !happening.name)
                            {
                                happening = undefined; // blank out bad datasets
                            }

                            if (submitObject.id !== happening.id)
                            {
                                // we've gone from create to edit and need to redirect and update the router
                                self.state.history.push("/happening/write/" + happening.id);
                            }
                            else {
                                self.getData();
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



    handleAdd(event) {
        const form = event.currentTarget;

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

    handleRemove(event) {
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

    handleUpdate(event) {
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
                isPrivate: form.elements.isPrivate.value
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
    }

    render() {
        const self = this;
        let data = this.state.data;
        const userData = this.state.userData;
        const userSet = this.state.userSet;

        if (!userSet || (!data && this.state.id))
        {
            // not doing a create and data hasn't loaded yet
            return null;
        }

        const actionWord = !data ? "Create" : "Update";

        let extraSection = <></>;

        if (!data)
        {
            // make a default object to avoid reference issues and set default values
            data = {
                id: "",
                name: "",
                description: "",
                controllingUser: "",
                controllingUserId: userData.id,
                startTime: undefined,
                endTime: undefined,
                isPrivate: false
            };
        }
        else {

            const membersSections = (
                                    <>
                                        {data.allUserInfo.map(function(item, index) {
                                            return (
                                                    <InvitationEditor
                                                        data={item}
                                                        updateCallBack={self.handleUpdate}
                                                        removeCallBack={self.handleRemove}
                                                        key={"ie"+index}
                                                    />
                                                );
                                        })}
                                    </>
                                    );

            extraSection = (<>

                <Row className="paddingMinor" />

                <Row>
                    <Col>
                        <h3>Users</h3>
                    </Col>
                </Row>

                <Row className="paddingMinor" />

                {membersSections}

                <Row className="paddingMinor" />
                <hr/>

                <Form
                noValidate
                onSubmit={e => this.handleAdd(e)}
                className="leftTextAlign"
                >
                    <input
                      type="hidden"
                      id="happeningId"
                      name="happeningId"
                      value={this.state.id}
                    />

                    <Row>
                        <Col>
                            <UserDropDown
                                    name="userId"
                                    defValue={userData.id}
                                    userSet={userSet}
                                    className="width20Per inLineBlock"
                                    />
                            <span className="paddingMinor"></span>
                            <Button variant="primary" type="submit">
                                Add User
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </>);
        }

        const calendarPrivate = data.isPrivate ? "checked" : "";
        const calendarPublic = data.isPrivate ? "" : "checked";

        return (
            <Container className="HappeningWrite leftTextAlign">
                <Row>
                    <Col>
                        <h1>{actionWord} Happening</h1>
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

                    <Row className="verticalPaddingMinor">
                        <Col xs="1">Name: </Col>
                        <Col>
                            <Form.Control
                              type="text"
                              placeholder="Login"
                              id="name"
                              name="name"
                              defaultValue={data.name}
                              required
                              className="width20Per"
                            />
                        </Col>
                    </Row>

                    <Row className="verticalPaddingMinor">
                        <Col xs="1">Desc: </Col>
                        <Col>
                            <Form.Control
                              as="textarea"
                              placeholder="Description"
                              id="description"
                              name="description"
                              defaultValue={data.description}
                              required
                              className="width60Per"
                            />
                        </Col>
                    </Row>

                    <Row className="verticalPaddingMinor">
                        <Col xs="1">Organizer: </Col>
                        <Col>
                            <UserDropDown
                                name="status"
                                defValue={data.controllingUserId}
                                userSet={userSet}
                                className="width20Per"
                            />
                        </Col>
                    </Row>

                    <Row className="verticalPaddingMinor">
                        <Col xs="1">Time: </Col>
                        <Col>
                            <DateTime
                                defaultValue={data.startTime}
                                name="startTime"
                                id="startTime"
                                className="width20Per inLineBlock"
                            />
                            <span className="padding">to</span>
                            <DateTime
                                defaultValue={data.endTime}
                                name="startTime"
                                id="startTime"
                                className="width20Per inLineBlock"
                            />
                        </Col>
                    </Row>

                    <Row className="width40Per verticalPaddingMinor">
                        <Col>
                            Visibility: <span className="paddingMinor"></span>
                            <Form.Check
                                type="radio"
                                inline
                                label="Public"
                                value="false"
                                id="calendarPublic"
                                name="isPrivate"
                                defaultChecked={calendarPrivate}
                            />
                            <Form.Check
                                type="radio"
                                inline
                                label="Private"
                                value="true"
                                id="calendarPrivate"
                                name="isPrivate"
                                defaultChecked={calendarPublic}
                            />
                        </Col>
                    </Row>

                    <Row className="width40Per verticalPaddingMinor">
                        <Col>
                            <Button variant="primary" type="submit">
                                {actionWord + " Happening"}
                            </Button>
                        </Col>
                    </Row>
                </Form>

                {extraSection}
            </Container>
        );
    }
}

function InvitationEditor(props) {
    const data = props.data;
    const updateCallBack = props.updateCallBack;
    const removeCallBack = props.removeCallBack;

    return (
        <Form
        noValidate
        onSubmit={e => updateCallBack(e)}
        className="leftTextAlign"
        >

            <input
              type="hidden"
              id="validatedObjIdx"
              name="validatedObjIdx"
              value={data.validatedIdx}
            />

            <input
              type="hidden"
              id="id"
              name="id"
              value={data.id}
            />

            <input
              type="hidden"
              id="happeningId"
              name="happeningId"
              value={data.happeningId}
            />

            <input
              type="hidden"
              id="happeningName"
              name="happeningName"
              value={data.happeningName}
            />

            <input
              type="hidden"
              id="date"
              name="date"
              value={data.date}
            />

            <input
              type="hidden"
              id="userId"
              name="userId"
              value={data.userId}
            />

            <input
              type="hidden"
              id="userName"
              name="userName"
              value={data.userName}
            />

            <input
              type="hidden"
              id="reminderXMinsBefore"
              name="reminderXMinsBefore"
              value={data.reminderXMinsBefore}
            />

            <input
              type="hidden"
              id="isPrivate"
              name="isPrivate"
              value={data.isPrivate}
            />

            <Row>
                <Col xs="1" className="bold">
                    {data.userName}
                </Col>
                <Col>
                    <Form.Control
                          as="select"
                          id="status"
                          name="status"
                          defaultValue={data.status}
                          className="width20Per inLineBlock"
                    >
                          <option>NoResponse</option>
                          <option>Yes</option>
                          <option>No</option>
                          <option>Maybe</option>
                    </Form.Control>
                    <span className="paddingMinor"></span>
                    <Button variant="primary" type="submit">
                        Update
                    </Button>
                    <span className="paddingMinor"></span>
                    <Button variant="secondary" onClick={e => removeCallBack(e)}>
                        Remove
                    </Button>
                </Col>
            </Row>
        </Form>
    );
}

export default HappeningWrite;
