import React, { Component } from 'react';
import moment from 'moment';
import queryString from 'query-string';
import DateTime from 'react-datetime';

import { ApiRequest }  from '../../../services/ApiRequest';
import { Button, Row, Col, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import InsideCalendarBox from './InsideCalendarBox';
import UserDropDown from '../../helper/UserDropDown';

class Calendar extends Component {
    constructor(props) {
        super(props);

        const parsed = queryString.parse(props.location.search);

        const listView = parsed.listView;
        const userId = parsed.userId;

        let startDate = parsed.startDate;
        let endDate = parsed.endDate;

        if (!listView) {
            startDate = startDate ? moment(startDate) : moment().startOf('month');
            endDate = endDate ? moment(startDate) : moment().endOf('month');
        }
        else {
            startDate = startDate ? startDate : "";
            endDate = endDate ? endDate : "";
        }

        this.state = {
                        userData: props.userData,
                        listView: listView ? true : false,
                        userId: userId ? userId : undefined,
                        startDate: startDate,
                        endDate: endDate,
                        currentUserId: props.userData.id
                    };

        this.getData = this.getData.bind(this);
        this.handleToggle = this.handleToggle.bind(this);
        this.handleOnStartDateChange = this.handleOnStartDateChange.bind(this);
        this.handleOnEndDateChange = this.handleOnEndDateChange.bind(this);
        this.handleUpdateFilter = this.handleUpdateFilter.bind(this);
        this.handleLimitUserChange = this.handleLimitUserChange.bind(this);
        this.addMonthAndUpdate = this.addMonthAndUpdate.bind(this);
        this.removeViewAs = this.removeViewAs.bind(this);
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
                            userSet: parsedUserSet,
                            userDict: userSet
                        });
                    },
                    function(xhr) {
                        // TODO error handling?
                    });

        const userId = self.state.userId;
        const listView = self.state.listView;
        const startDate = self.state.startDate;
        const endDate = self.state.endDate;

        let target = 'calendar/getFiltered?isCalendarMode='+!listView;

        if (startDate)
        {
            target = target + "&startDate=" + moment(startDate).toDate().toLocaleString();
        }

        if (endDate)
        {
            target = target + "&endDate=" + moment(endDate).toDate().toLocaleString();
        }

        if (userId)
        {
            target = target + "&userId=" + userId;
        }

        ApiRequest(target, 'GET',
                    function(xhr) {
                        const respText = (xhr.responseText && xhr.responseText !== "") && xhr.responseText;
                        const happenings = respText && JSON.parse(respText);
                        if (!Array.isArray(happenings))
                        {
                            throw new Error("Couldn't parse userSet from (" + target + ")");
                        }

                        self.setState({
                            data: happenings,
                            new_startDate: startDate,
                            new_endDate: endDate
                        });
                    },
                    function(xhr) {
                        // TODO error handling?
                    });
    }

    handleOnStartDateChange(event)
    {
        this.setState({
            new_startDate: event._d
        });
    }

    handleOnEndDateChange(event)
    {
        this.setState({
            new_endDate: event._d
        });
    }

    handleLimitUserChange(event)
    {
        this.setState({
            new_userId: event.target.value
        });
    }

    handleUpdateFilter(event)
    {
        this.setState(prevState => ({
            startDate: prevState.new_startDate,
            endDate: prevState.new_endDate,
        }), function() {
            this.getData(); // will be safely called after the toggle is done.
        });
    }

    handleUpdateFilterLv(event)
    {
        this.setState((prevState) => ({
            startDate: prevState.new_startDate,
            endDate: prevState.new_endDate,
            userId: prevState.new_userId
        }), function() {
            this.getData(); // will be safely called after the toggle is done.
        });
    }

    addMonthAndUpdate(value)
    {
        this.setState(prevState => ({
            startDate: moment(prevState.startDate).add(value, 'month'),
            endDate: moment(prevState.endDate).add(value, 'month'),
        }), function() {
            this.getData(); // will be safely called after the toggle is done.
        });
    }

    handleToggle(event) {
        this.setState(function(prevState, props) {
            let startDate = prevState.startDate;
            let endDate = prevState.endDate;
            let userId = prevState.userId;

            const parsed = queryString.parse(props.location.search);
            let startDateP = parsed.startDate;
            let endDateP = parsed.endDate;

            if (prevState.listView) {
                startDate = startDate ? moment(startDate) : moment().startOf('month');
                endDate = endDate ? moment(startDate) : moment().endOf('month');
                userId = userId ? userId : undefined;
            }
            else {
                startDate = startDateP ? startDateP : "";
                endDate = endDateP ? endDateP : "";
            }

            return {
                listView: !prevState.listView,
                startDate: startDate,
                endDate: endDate,
                userId: userId
            }
        }, function() {
            this.getData(); // will be safely called after the toggle is done.
        });
    }

    removeViewAs(event) {
        this.setState(prevState => ({
            userId: prevState.currentUserId
        }), function() {
            this.getData(); // will be safely called after the toggle is done.
        });
    }

    render() {
        const data = this.state.data;
        let userId = this.state.userId;
        const currentUserId = this.state.currentUserId;
        const userDict = this.state.userDict;
        const userSet = this.state.userSet;

        if (!data || !userSet)
        {
            return null;
        }

        const startDate = this.state.startDate;
        const endDate = this.state.endDate;
        const newStartDate = this.state.new_startDate;
        const newEndDate = this.state.new_endDate;

        const startDateDisplay = newStartDate && newStartDate !== startDate  ? newStartDate : startDate;
        const endDateDisplay = newEndDate && newEndDate !== endDate  ? newEndDate : endDate;

        if (!this.state.listView) {

            const startOfMonth = moment(startDate).startOf('month');
            const endOfMonth = moment(startDate).endOf('month');
            const monthStartOffset = startOfMonth.day();
            const endOfWeekOffset = 7 - monthStartOffset;

            userId = userId ? userId : currentUserId; // fallback if null

            let disableViewAs = <></>;
            if (currentUserId !== userId && userId && userDict)
            {
                disableViewAs = (
                    <>
                        <Row>
                            <Col>
                                Viewing as: ({userDict[userId]})
                                <span className="paddingMinor"> </span>
                                <button
                                    type="button"
                                    className="link-button"
                                    onClick={e => this.removeViewAs(e)}
                                >
                                    (Cancel)
                                </button>
                            </Col>
                        </Row>
                        <Row className="paddingMinor" />
                    </>
                );
            }

            // TODO this might be easier to work out on the backend, is at least worth a try
            // restructure data into an arrayset of the right rows/cols length
            let monthLength = endOfMonth.date();
            let numWeeks = 1 + Math.ceil(((monthLength - endOfWeekOffset) / 7));
            let adjustedDataSet = [];
            adjustedDataSet[0] = [];

            for (let i = 0; i < monthStartOffset; i++)
            {
                adjustedDataSet[0][i] = (<Col className="thickBorder stackBox" key={"colKey"+i}></Col>);
            }

            // actual month start from 1 to end of week 1
            let dataIdx = 0;
            for (let i = 0; i < endOfWeekOffset; i++)
            {
                let currLen = adjustedDataSet[0].length;
                let day = dataIdx++;
                const hapLength = data && data[day] ? data[day].length : -1;
                adjustedDataSet[0][currLen] = (<Col className="thickBorder stackBox" key={"colKey"+currLen}>
                                                    <InsideCalendarBox
                                                        data={data}
                                                        day={day}
                                                        monthName={moment(startDate).format("MMMM")}
                                                        key={day+"-"+hapLength}
                                                    />
                                                </Col>);
            }

            for (let x = 1; x < numWeeks; x++)
            {
                adjustedDataSet[x] = [];
                for (let i = 0; i < 7; i++)
                {
                    if (dataIdx < monthLength)
                    {
                        let day = dataIdx++;
                        const hapLength = data && data[day] ? data[day].length : -1;
                        adjustedDataSet[x][i] = (<Col className="thickBorder stackBox" key={"colKey"+i}>
                                                        <InsideCalendarBox
                                                            data={data}
                                                            day={day}
                                                            monthName={moment(startDate).format("MMMM")}
                                                            key={day+"-"+hapLength}
                                                        />
                                                 </Col>);
                    }
                    else {
                        adjustedDataSet[x][i] = (<Col className="thickBorder stackBox" key={"colKey"+i}></Col>);
                    }
                }
            }

            let finalizedDataSet = [];
            for (let i = 0; i < adjustedDataSet.length; i++)
            {
                finalizedDataSet[i] = (<Row key={"rowKey"+i} className="calendarRow">
                                            {adjustedDataSet[i]}
                                        </Row>);
            }

            const calendar = (<>
                                {finalizedDataSet}
                            </>);

            return (
                <Container fluid className="Calendar leftTextAlign maxHeight maxWidth">
                    <Container className="leftTextAlign">
                        <Row>
                            <Col>
                                <h1>Calendar - {moment(startDate).format("MMMM")}</h1>
                            </Col>
                        </Row>

                        <Row className="paddingMinor" />

                        {disableViewAs}

                        <Row>
                            <Col>
                                <button
                                    type="button"
                                    className="link-button"
                                    onClick={e => this.handleToggle(e)}>
                                        List View
                                    </button>
                            </Col>
                        </Row>

                        <Row className="paddingMinor" />

                        <Row>
                            <Col>
                                <span className="paddingMinor">Start:</span>
                                <DateTime
                                    name="startTime"
                                    id="startTime"
                                    value={startDateDisplay}
                                    onChange={e => this.handleOnStartDateChange(e)}
                                    className="width20Per inLineBlock"
                                />
                                <span className="paddingMinor">End:</span>
                                <DateTime
                                    name="endTime"
                                    id="endTime"
                                    value={endDateDisplay}
                                    onChange={e => this.handleOnEndDateChange(e)}
                                    className="width20Per inLineBlock"
                                />
                                <span className="paddingMinor" />
                                <Button
                                    className="nudgeUpMinor"
                                    onClick={e => this.handleUpdateFilter(e)}
                                    >
                                    Update Filter
                                </Button>
                            </Col>
                        </Row>

                        <Row className="paddingMinor" />

                        <Row>
                            <Col>
                                <Button
                                    className="nudgeUpMinor"
                                    onClick={e => this.addMonthAndUpdate(-1)}
                                    >
                                    Previous Month
                                </Button>
                                <span className="paddingMinor" />
                                <Button
                                    className="nudgeUpMinor"
                                    onClick={e => this.addMonthAndUpdate(1)}
                                    >
                                    Next Month
                                </Button>
                            </Col>
                        </Row>

                        <Row className="paddingMinor" />
                    </Container>
                    <Container fluid className="maxWidth maxHeight">
                        {calendar}
                    </Container>
                </Container>
            );
        }
        else {
            let rows = (<Row><Col xs="auto" className="bold">No results found</Col></Row>);
            const rData = data[0]; // text mode only uses the first row
            if (rData.length > 0)
            {
                rows = (<>
                        <Row className="bold">
                            <Col>Happening Name</Col>
                            <Col>Happening Start Time</Col>
                            <Col>RSVP Status </Col>
                            <Col> </Col>
                        </Row>
                        <Row className="paddingMinor" />
                        {
                        rData.map(function(item,index) {
                            return (
                                    <Row className="paddingMinor"
                                        key={"happening"+index}
                                        >
                                        <Col>
                                            {item.name}
                                        </Col>

                                        <Col>
                                            {moment(item.startTime).format('MMMM DD, YYYY hh:mm:ss A')}
                                        </Col>

                                        <Col>
                                            {item.userStatus}
                                        </Col>

                                        <Col>
                                            <LinkContainer to={"/happening/"+item.id}>
                                                <Button className="nudgeUpMinor">View</Button>
                                            </LinkContainer>
                                        </Col>
                                    </Row>
                                );
                            })
                        }</>);

            }

            return (
                <Container className="Calendar leftTextAlign">
                    <Row>
                        <Col>
                            <h1>Happenings View</h1>
                        </Col>
                    </Row>

                    <Row className="paddingMinor" />
                    <Row>
                        <Col>
                            <button
                                type="button"
                                className="link-button"
                                onClick={e => this.handleToggle(e)}
                            >
                                Calendar View
                            </button>
                        </Col>
                    </Row>

                    <Row className="paddingMinor" />
                    <Row>
                        <Col>
                            <span className="paddingMinor">Limit User:</span>
                            <UserDropDown
                                    name="userId"
                                    userSet={userSet}
                                    className="width10Per inLineBlock"
                                    selectedId={userId}
                                    changeCallBack={e => this.handleLimitUserChange(e)}
                                    addBlank="true"
                                    />
                            <span className="paddingMinor">Start:</span>
                            <DateTime
                                name="startTime"
                                id="startTime"
                                value={startDateDisplay}
                                onChange={e => this.handleOnStartDateChange(e)}
                                className="width20Per inLineBlock"
                            />
                            <span className="paddingMinor">End:</span>
                            <DateTime
                                name="endTime"
                                id="endTime"
                                value={endDateDisplay}
                                onChange={e => this.handleOnEndDateChange(e)}
                                className="width20Per inLineBlock"
                            />
                            <span className="paddingMinor" />
                            <Button
                                className="nudgeUpMinor"
                                onClick={e => this.handleUpdateFilterLv(e)}
                                >
                                Update Filter
                            </Button>
                        </Col>
                    </Row>

                    <Row className="paddingMinor" />

                    {rows}
                </Container>
            );
        }
    }
}

export default Calendar;
