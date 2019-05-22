import React, { Component } from 'react';
import moment from 'moment';

import { Form, Button, Row, Col, Container } from 'react-bootstrap';
import { ApiRequest }  from '../../services/ApiRequest';

import CElm from '../helper/CElm';
import Clock from '../decorative/Clock';

class Reminders extends Component {
    constructor(props) {
        super(props);

        this.state = {
                        errorText: "",
                        data: undefined,
                        includeSilenced: false
                    };

        this.handleSilenceToggle = this.handleSilenceToggle.bind(this);
        this.handleIncludeToggle = this.handleIncludeToggle.bind(this);
        this.getData = this.getData.bind(this);
    }

    componentDidMount() {
        this.getData();
    }

    handleIncludeToggle(event) {
        this.setState((prevState) => ({
            includeSilenced: !prevState.includeSilenced
        }), function() {
            this.getData(); // will be safely called after the toggle is done.
        });
    }

    handleSilenceToggle(event) {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        }
        else {
            event.preventDefault(); // we use ajax, avoid submit behaviors getting in the way
            let submitObject = {
                id: form.elements.id.value,
                startRemindAt: form.elements.startRemindAt.value,
                happeningTime: form.elements.happeningTime.value,
                happeningId: form.elements.happeningId.value,
                happeningName: form.elements.happeningName.value,
                isSilenced: !(form.elements.isSilenced.value === 'true'),
                userId: form.elements.userId.value
            };

            var self = this;

            ApiRequest('clock/', 'PUT',
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

        let target = 'clock/getdata';

        if (this.state.includeSilenced)
        {
            target = 'clock/getdata?includeSilenced=true';
        }

        ApiRequest(target, 'GET',
                    function(xhr) {
                        // blank out any existing data first
                        self.setState(state => ({
                            data: undefined
                        }));

                        const respText = (xhr.responseText && xhr.responseText !== "") && xhr.responseText;
                        let reminders = respText && JSON.parse(respText);
                        if (!Array.isArray(reminders) || reminders.length === 0 || !reminders[0].startRemindAt)
                        {
                            reminders = []; // blank out bad datasets to an empty array (we still got a 'response')
                        }


                        self.setState(state => ({
                            data: reminders
                        }));
                    },
                    function(xhr) {
                        // TODO error handling?
                    });
    }

    render() {
        var self = this;

        if (!this.state.data)
        {
            return null;
        }

        const dataSections = (
                             <>
                                {this.state.data.map(function(item,index) {
                                    return (
                                            <FormRow
                                                key={"reminderForm"+index}
                                                formId={"reminderForm"+index}
                                                prefix={"r"+index}
                                                data={item}
                                                submitFunc={self.handleSilenceToggle}
                                                />
                                        );
                                })
                                }
                             </>
                            );

        return (
            <Container className="Reminders">

                <Row className="paddingMinor" />
                <Row>
                    <Col xs={2}>
                        <h1>Reminders</h1>
                    </Col>

                    <Col> </Col>
                    <Col> </Col>
                    <Col> </Col>

                    <Col>
                        <Clock className="clock" />
                    </Col>

                </Row>

                <Row className="paddingMinor" />

                <Row>
                    <Col>
                        <CElm con={!this.state.includeSilenced}>
                            <Button
                                variant="outline-secondary"
                                type="button"
                                onClick={(e) => this.handleIncludeToggle(e)}
                            >
                                Include Silenced
                            </Button>
                        </CElm>
                        <CElm con={this.state.includeSilenced}>
                            <Button
                                variant="outline-secondary"
                                type="button"
                                onClick={(e) => this.handleIncludeToggle(e)}
                            >
                                Exclude Silenced
                            </Button>
                        </CElm>
                    </Col>
                </Row>

                <Row className="paddingMinor" />
                <Row className="paddingMinor" />

                <Row className="bold leftTextAlign">
                    <Col>Name</Col>
                    <Col>Start Time</Col>
                    <Col>Remind At</Col>
                    <Col> </Col>
                </Row>

                {dataSections}
            </Container>
        );
    }
}

function FormRow(props) {
  const formId = props.formId;
  const controlPrefix = props.prefix;
  let data = props.data;

  return (
      <Form
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
            id={controlPrefix+"StartRemindAt"}
            name="startRemindAt"
            value={data.startRemindAt}
          />

          <input
            type="hidden"
            id={controlPrefix+"HappeningTime"}
            name="happeningTime"
            value={data.happeningTime}
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
            id={controlPrefix+"IsSilenced"}
            name="isSilenced"
            value={data.isSilenced}
          />

          <input
            type="hidden"
            id={controlPrefix+"UserId"}
            name="userId"
            value={data.userId}
          />

          <Row className="paddingMinor" />
          <Row className="leftTextAlign">
              <Col>
                  {data.happeningName}
              </Col>

              <Col>
                  {moment(data.happeningTime).format('MMMM DD, YYYY hh:mm:ss A')}
              </Col>

              <Col>
                  {moment(data.startRemindAt).format('MMMM DD, YYYY hh:mm:ss A')}
              </Col>

              <Col>
                  <CElm con={!data.isSilenced}>
                      Not Silenced
                  </CElm>
                  <CElm con={data.isSilenced}>
                      <Button variant="secondary" type="submit" className="nudgeUpMinor">
                          Unsilence
                      </Button>
                  </CElm>
                  <span className="paddingMinor"> </span>
                  <CElm con={data.isSilenced}>
                      Silenced
                  </CElm>
                  <CElm con={!data.isSilenced}>
                      <Button variant="secondary" type="submit" className="nudgeUpMinor">
                          Silence
                      </Button>
                  </CElm>
              </Col>

          </Row>
      </Form>
        );
}

export default Reminders;
