import React from 'react';
import { Badge } from 'react-bootstrap';

function ReminderCount(props) {
    const numActive = props.numActive || 0; // should not be strictly needed but is better to be explicit
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

export default ReminderCount;
