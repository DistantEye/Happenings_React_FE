function CElm(props) {
  const con = props.con;
  if (con) {
    return props.children;
  }
  return null;
}

export default CElm;
