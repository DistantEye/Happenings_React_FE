function apiRequest(target, method, onSuccess, onFailure, json) {
  const urlBase = "https://localhost:44345/api/"; // TODO fix this later, env variables are broken
  let postType = '';

  if (method && method.toUpperCase() === "GET") {
      postType = 'GET';
  }
  else if (method && method.toUpperCase() === "PUT") {
      postType = 'PUT';
  }
  else if (method && method.toUpperCase() === "POST") {
      postType = 'POST';
  }
  else if (method && method.toUpperCase() === "DELETE") {
      postType = 'DELETE';
  }
  else {
      throw "Methodtype not recognized!";
  }

  var xhr = new XMLHttpRequest();
  xhr.open(postType, urlBase + target);
  xhr.withCredentials = true;

  if (json) {
      xhr.setRequestHeader('Content-Type', 'application/json');
  }
  else {
      xhr.setRequestHeader('Content-Type', 'text/plain');
  }

  xhr.onload = function() {
    if (xhr.status === 200) {
        onSuccess(xhr);
    }
    else {
        onFailure(xhr);
    }
  };

  if (postType === "PUT" || postType === "POST") {
    xhr.send(json);
  }
  else {
    xhr.send();
  }
}

export default apiRequest;
