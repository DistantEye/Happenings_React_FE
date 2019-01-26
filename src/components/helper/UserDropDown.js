import React from 'react';
import { Form } from 'react-bootstrap';

function UserDropDown(props) {
    const userSet = props.userSet;
    const defValue = props.selectedId ? props.selectedId : "";
    const addBlank = props.addBlank === "true" ?
                (
                <option value="00000000-0000-0000-0000-000000000000" key="optionNull"></option>
                )
                    :
                        <></>;

    return (
        <Form.Control
              as="select"
              id={props.name}
              name={props.name}
              defaultValue={defValue}
              className="width20Per inLineBlock"
              onChange={props.changeCallBack}
        >
            {addBlank}
            {userSet.map(function(item,index) {
                return (
                        <option
                            value={item[0]}
                            key={"option"+index}
                            >
                                {item[1]}
                            </option>
                    );
            })}
        </Form.Control>
    );
}

export default UserDropDown;
