import React, { Component } from 'react';

class Clock extends Component {
  constructor(props) {
    super(props);
    this.state = {date: new Date()};
  }

  componentDidMount() {
      this.timePull = setInterval(
        () => this.tick(),
        1000
      );
  }

  componentWillUnmount() {
      clearInterval(this.timePull);
  }

  tick() {
    this.setState({
      date: new Date()
    });
  }

  render() {
    return (
      <p className="Clock">
          {this.state.date.toLocaleTimeString()}
      </p>
    );
  }
}

export default Clock;
