import React, { Component } from 'react';
import DateTime from 'react-datetime';

import { Form, Button, Row, Col, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { ApiRequest, SetErrorText }  from '../../../services/ApiRequest';
import CElm from '../../helper/CElm';
import UserDropDown from '../../helper/UserDropDown';

class HappeningWrite extends Component {
    constructor(props) {
        super(props);

        this.state = {
                        validated: false,
                        errorText: "",
                        lastErrorCode: undefined,
                        id: props.match.params.id,
                        userData: props.userData,
                        history: props.history,
                        location: props.location
                    };

        this.getData = this.getData.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
        this.handleAdd = this.handleAdd.bind(this);
        this.handleRemove = this.handleRemove.bind(this);
        this.handleDeleteHappening = this.handleDeleteHappening.bind(this);
    }

    componentDidMount() {
        this.getData();
    }

    // this could be useful in other routes yes, but is essential for this component because of switches from
    // UpdateComponent to CreateComponent via the navbar
    componentDidUpdate(prevProps) {
        if (this.props.location !== prevProps.location) {
            // because of oddities with the form controls and stickiness (react-bootstrap bug?) we force a hard reload
            let paramId = "";
            if (this.props.match.params.id)
            {
                paramId = "/"+this.props.match.params.id;
            }
            this.state.history.push("/refresh/happening/write"+paramId);
        }
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
                        SetErrorText(xhr,self);
                    });

        if (self.state.id)
        {
            ApiRequest(('happening/getWithData/'+self.state.id), 'GET',
                        function(xhr) {
                            // blank out any existing data first
                            self.setState(state => ({
                                data: undefined,
                                lastErrorCode: undefined
                            }));

                            const respText = (xhr.responseText && xhr.responseText !== "") && xhr.responseText;
                            let happening = respText && JSON.parse(respText);
                            if (!happening || !happening.name)
                            {
                                happening = undefined; // blank out bad datasets
                            }

                            self.setState(state => ({
                              data: happening,
                              validated: false
                            }));
                        },
                        function(xhr) {
                            self.setState({
                                lastErrorCode: xhr.status
                            });
                            SetErrorText(xhr,self);
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
            let selectedIndex = form.elements.controllingUserId.selectedIndex;
            let submitObject = {
                id: form.elements.id.value,
                name: form.elements.name.value,
                description: form.elements.description.value,
                controllingUser: form.elements.controllingUserId.options[selectedIndex].innerHTML,
                controllingUserId: form.elements.controllingUserId.value,
                startTime: form.elements.startTime.value,
                endTime: form.elements.endTime.value,
                isPrivate: form.elements.isPrivate.checked
            };
            var self = this;

            const methodType = this.state.id ? 'PUT' : 'POST';

            ApiRequest('happening/', methodType,
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
                                self.state.history.push("/happening/write/" + happening.id); // no further state updates are needed because this forces a reload?
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

    handleDeleteHappening(event) {
        const form = event.currentTarget.form;

        event.preventDefault(); // we use ajax, avoid submit behaviors getting in the way

        var self = this;
        ApiRequest('happening/'+form.elements.id.value, 'DELETE',
                    function(xhr) {
                        // redirect to calendar
                        self.state.history.push("/calendar");
                    },
                    function(xhr) {
                        SetErrorText(xhr,self);
                    }
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

        if (this.state.lastErrorCode && this.state.lastErrorCode === 404)
        {
            return (
                <Container className="HappeningWrite width80Per leftTextAlign">
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
                id: "00000000-0000-0000-0000-000000000000",
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
                                    selectedId={userData.id}
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
                              placeholder="Name"
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
                                name="controllingUserId"
                                selectedId={data.controllingUserId}
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
                                inputProps={{id: "startTime", name: "startTime"}}
                                className="width20Per inLineBlock"
                            />
                            <span className="padding">to</span>
                            <DateTime
                                defaultValue={data.endTime}
                                inputProps={{id: "endTime", name: "endTime"}}
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
                                defaultChecked={calendarPublic}
                            />
                            <Form.Check
                                type="radio"
                                inline
                                label="Private"
                                value="true"
                                id="calendarPrivate"
                                name="isPrivate"
                                defaultChecked={calendarPrivate}
                            />
                        </Col>
                    </Row>

                    <Row className="width40Per verticalPaddingMinor">
                        <Col>
                            <Button variant="primary" type="submit">
                                {actionWord + " Happening"}
                            </Button>
                        </Col>
                        <CElm con={data.id !== "00000000-0000-0000-0000-000000000000"}>
                            <Button variant="danger" onClick={e => this.handleDeleteHappening(e)}>
                                Delete
                            </Button>
                        </CElm>
                    </Row>
                </Form>

                {extraSection}

                <Row className="padding" />
                <Link to="/calendar">
                    Back to Calendar
                </Link>
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
