import React from 'react';
import { OverlayTrigger } from 'react-bootstrap';

function CondOverlayTrigger(props) {
  const {con, children, ...otherProps} = props;
  if (con) {
    return <OverlayTrigger {...otherProps}>{children}</OverlayTrigger>;
  }
  return children;
}

export default CondOverlayTrigger;
