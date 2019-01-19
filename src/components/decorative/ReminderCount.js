import React, { Component } from 'react';
import { Badge } from 'react-bootstrap';

class ReminderCount extends Component {
  constructor(props) {
    super(props);
    this.state = {numActive: -1};
  }

  componentDidMount() {
      this.reminderPull = setInterval(
        () => this.tick(),
        1000
      );
  }

  componentWillUnmount() {
      clearInterval(this.reminderPull);
  }

  tick() {
    this.setState({
      numActive: -1
    });
  }

  render() {
    const numActive = this.state.numActive;
    if (numActive && numActive > 0) {
        return (
          <Badge>
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
