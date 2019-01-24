import React, { Component } from 'react';
import moment from 'moment';

import { Form, Button, Row, Col, Container } from 'react-bootstrap';
import { ApiRequest }  from '../../services/ApiRequest'
import CElm from '../helper/CElm'

class Invitations extends Component {
    constructor(props) {
        super(props);

        this.state = {
                        errorText: "",
                        data: undefined,
                        includeAnswered: false
                    };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleIncludeToggle = this.handleIncludeToggle.bind(this);
        this.getData = this.getData.bind(this);
    }

    componentDidMount() {
        this.getData();
    }

    handleIncludeToggle(event) {
        this.setState({
            includeAnswered: !this.state.includeAnswered
        }, function() {
            this.getData(); // will be safely called after the toggle is done.
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
                isPrivate: form.elements.isPrivate.value
            };

            var self = this;

            ApiRequest('invitation/', 'PUT',
                        function(xhr) {
                            // refresh data afterwards
                            self.getData();
                        },
                        function(xhr) {
                            // TODO error handling?
                        },
                        JSON.stringify(submitObject)
                    );
        }
    }

    getData() {
        var self = this;

        let target = 'invitation/getuserinvitations';

        if (this.state.includeAnswered)
        {
            target = 'invitation/getuserinvitations?includeResolved=true';
        }

        ApiRequest(target, 'GET',
                    function(xhr) {
                        // blank out any existing data first
                        self.setState(state => ({
                            data: undefined
                        }));

                        const respText = (xhr.responseText && xhr.responseText !== "") && xhr.responseText;
                        let invitations = respText && JSON.parse(respText);
                        if (!Array.isArray(invitations) || invitations.length === 0 || !invitations[0].happeningName)
                        {
                            invitations = undefined; // blank out bad datasets
                        }

                        self.setState(state => ({
                          data: invitations
                        }));
                    },
                    function(xhr) {
                        // TODO error handling?
                    });
    }

    render() {
        var self = this;

        let dataSections = (
                            <Row className="bold leftTextAlign">
                                <Col>
                                    <h2>No invitations found</h2>
                                </Col>
                            </Row>
                            );

        if (this.state.data)
        {
            dataSections = (
                                 <>
                                     <Row className="bold leftTextAlign">
                                         <Col xs={2}>Name</Col>
                                         <Col xs={2}>Start Time</Col>
                                         <Col xs={2}>Response</Col>
                                         <Col xs={3}>Reminder Mins Before</Col>
                                         <Col xs={2}>Calendar Private?</Col>
                                     </Row>

                                    {this.state.data.map(function(item,index) {
                                        return (
                                                <FormRow
                                                    key={"invitationForm"+index}
                                                    formId={"invitationForm"+index}
                                                    prefix={"i"+index}
                                                    data={item}
                                                    submitFunc={self.handleSubmit}
                                                    />
                                            );
                                    })
                                    }
                                 </>
                                );
        }

        return (
            <Container className="Invitations">

                <Row className="paddingMinor" />
                <Row>
                    <Col xs={2}>
                        <h1>Invitations</h1>
                    </Col>

                    <Col> </Col>
                    <Col> </Col>
                    <Col> </Col>
                    <Col> </Col>
                    <Col> </Col>
                </Row>

                <Row className="paddingMinor" />

                <Row>
                    <Col>
                        <CElm con={!this.state.includeAnswered}>
                            <Button
                                variant="outline-secondary"
                                type="button"
                                onClick={(e) => this.handleIncludeToggle(e)}
                            >
                                Include Answered
                            </Button>
                        </CElm>
                        <CElm con={this.state.includeAnswered}>
                            <Button
                                variant="outline-secondary"
                                type="button"
                                onClick={(e) => this.handleIncludeToggle(e)}
                            >
                                Exclude Answered
                            </Button>
                        </CElm>
                    </Col>
                </Row>

                <Row className="paddingMinor" />
                <Row className="paddingMinor" />

                {dataSections}
            </Container>
        );
    }
}

function FormRow(props) {
    const formId = props.formId;
    const controlPrefix = props.prefix;
    let data = props.data;

    const calendarPublic = data.isPrivate ? "checked" : "";
    const calendarPrivate = data.isPrivate ? "" : "selected";

    return (
          <Form
          noValidate
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
                id={controlPrefix+"HappeningId"}
                name="happeningId"
                value={data.happeningId}
              />

              <input
                type="hidden"
                id={controlPrefix+"HappeningName"}
                name="happeningName"
                value={data.happeningName}
              />

              <input
                type="hidden"
                id={controlPrefix+"UserId"}
                name="userId"
                value={data.userId}
              />

              <input
                type="hidden"
                id={controlPrefix+"UserName"}
                name="userName"
                value={data.userName}
              />

              <input
                type="hidden"
                id={controlPrefix+"Date"}
                name="date"
                value={data.date}
              />

              <Row className="paddingMinor" />
              <Row className="leftTextAlign">
                  <Col xs={2}>
                      {data.happeningName}
                  </Col>

                  <Col xs={2}>
                      {moment(data.date).format('MMMM DD, YYYY hh:mm:ss A')}
                  </Col>

                  <Col xs={2}>
                      <Form.Control
                            as="select"
                            id={controlPrefix+"Status"}
                            name="status"
                            defaultValue={data.status}
                      >
                            <option>NoResponse</option>
                            <option>Yes</option>
                            <option>No</option>
                            <option>Maybe</option>
                      </Form.Control>
                  </Col>

                  <Col xs={3}>
                      <Form.Control
                            type="number"
                            id={controlPrefix+"ReminderXMinsBefore"}
                            name="reminderXMinsBefore"
                            defaultValue={data.reminderXMinsBefore}
                      />
                  </Col>

                  <Col xs={2}>
                      <Form.Check
                          type="radio"
                          inline
                          label="Yes"
                          value="true"
                          id={controlPrefix+"IsPrivate"}
                          name="isPrivate"
                          defaultChecked={calendarPublic}
                      />
                      <Form.Check
                          type="radio"
                          inline
                          label="No"
                          value="false"
                          id={controlPrefix+"IsPrivate"}
                          name="isPrivate"
                          defaultChecked={calendarPrivate}
                      />
                  </Col>

                  <Col xs={1}>
                      <Button variant="secondary" type="submit" className="nudgeUpMinor">
                          Update
                      </Button>
                  </Col>
              </Row>
          </Form>
        );
}

export default Invitations;
