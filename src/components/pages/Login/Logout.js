import React, { Component } from 'react';

import { Redirect } from 'react-router-dom';

import { ApiRequest } from '../../../services/ApiRequest'

class Logout extends Component {
  constructor(props) {
    super(props);

    this.state = { finishedXhr: undefined, parentCallback: props.callback };
    this.runApiCall = this.runApiCall.bind(this);
  }

  runApiCall() {
    var self = this;
    ApiRequest('login/logout', 'GET',
                function(xhr) {
                    self.setState(state => ({
                        finishedXhr: true
                    }));
                },
                function(xhr) {
                    // TODO errors for logout should be pretty rare, but maybe something?
                }
            );

  }

  componentDidMount() {
      this.runApiCall();
  }

  render() {
    if (this.state.finishedXhr)
    {
        this.state.parentCallback();
        return <Redirect to="/" />;
    }
    else {
        return null;
    }
  }
}

export default Logout;
