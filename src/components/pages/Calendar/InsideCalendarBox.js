import React, { Component } from 'react';
import moment from 'moment';

import { Button, Modal  } from 'react-bootstrap';
import { Link } from 'react-router-dom';

class InsideCalendarBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
                        width: window.innerWidth,
                        data: props.data,
                        day: props.day,
                        monthName: props.monthName,
                        show: false
                    };

        this.handleWindowSizeChange = this.handleWindowSizeChange.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleWindowSizeChange);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleWindowSizeChange);
    }

    handleWindowSizeChange() {
        this.setState({ width: window.innerWidth });
    };

    handleClose() {
        this.setState({ show: false });
    }

    handleShow() {
        this.setState({ show: true });
    }


    render() {
        const data = this.state.data;
    	const day = this.state.day;
        const width = this.state.width;
        const monthName = this.state.monthName;

    	if (!data || !data[day])
    	{
    		return (<></>);
    	}

        if (data[day].length === 0)
        {
            return (day+1);
        }

        if (width <= 800)
        {
            return (<>
                        {day+1} <br />
                        <Button variant="secondary" onClick={this.handleShow} aria-label="Expand Happenings">
                            <span aria-hidden="true">+</span>
                        </Button>
                        <Modal
                            show={this.state.show}
                            onHide={this.handleClose}
                            centered
                        >
                            <Modal.Header closeButton>
                                <Modal.Title>
                                    Happenings for {monthName + " " + (day+1)}
                                </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                {data[day].map(function(item,index) {
                                                 return (<span key={"boxIdx"+index}>
                                                     <br />
                                                     <Link to={"/happening/"+item.id}>
                                                         {item.name + " : " + moment(item.startTime).format('MMMM DD, YYYY hh:mm:ss A')}
                                                     </Link>
                                                 </span>)
                                             })}
                            </Modal.Body>
                            <Modal.Footer>
                                <Button onClick={this.handleClose}>Close</Button>
                            </Modal.Footer>
                        </Modal>
                    </>
            );
        }

    	return (<>
                   {day+1}
                   {data[day].map(function(item,index) {
                                    return (<span key={"boxIdx"+index}>
                                        <br />
                                        <Link to={"/happening/"+item.id}>
                                            {item.name + " : " + moment(item.startTime).format('MMMM DD, YYYY hh:mm:ss A')}
                                        </Link>
                                    </span>)
                                })}
                </>);
    }
}

export default InsideCalendarBox;
