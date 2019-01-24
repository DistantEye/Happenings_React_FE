import React, { Component } from 'react';
import { Badge } from 'react-bootstrap';

import { ApiRequest }  from '../../services/ApiRequest'

class ReminderCount extends Component {
  constructor(props) {
    super(props);
    this.state = {numActive: -1};
  }

  componentDidMount() {
      this.reminderPull = setInterval(
        () => this.pull(),
        2000
      );
      this.pull();
  }

  componentWillUnmount() {
      clearInterval(this.reminderPull);
  }

  pull() {
      var self = this;
      ApiRequest('clock/getcount', 'GET',
                  function(xhr) {
                    const respText = (xhr.responseText && xhr.responseText !== "" && Number.isInteger(Number.parseInt(xhr.responseText))) && xhr.responseText;
                    let numActive = respText ? Number.parseInt(respText) : -1;
                    self.setState(state => ({
                      numActive: numActive
                    }));
                  },
                  function(xhr) {
                      // TODO error handling?
                  });
  }

  render() {
    const numActive = this.state.numActive;
    if (numActive && numActive > 0) {
        return (
          <Badge variant="danger">
            {numActive}
          </Badge>
        );
    }
    else {
      return null;
    }
  }
}

export default ReminderCount;
