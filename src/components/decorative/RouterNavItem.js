import React from 'react';

import {
  Nav
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import PropTypes from 'prop-types';

function RouterNavItem(props) {
  const compType = props.as || 'li';
  return (<Nav.Item as={compType}>
              <LinkContainer to={props.to}>
                  <Nav.Link eventKey={props.to}>
                      {props.children}
                  </Nav.Link>
              </LinkContainer>
          </Nav.Item>);
}

RouterNavItem.propTypes = {
  to: PropTypes.any.isRequired,
}

export default RouterNavItem;