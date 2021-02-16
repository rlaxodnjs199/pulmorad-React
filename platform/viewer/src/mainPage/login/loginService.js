import Axios from 'axios';

export function login(username, password) {
  const options = {
    url: 'http://snuhpia.org:8000/api/v1/user/authenticate/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      username: username,
      password: password,
    },
  };
  return Axios(options)
    .then(handleResponse)
    .then(user => {
      if (user) {
        return true;
      } else {
        return false;
      }
    });
}

function invalid_login() {}

const handleResponse = response => {
  if (response.statusText !== 'OK') {
    if (response.status === 401) {
      location.reload(true);
    }
    invalid_login();
    return '';
  }
  return response.data.username;
};
