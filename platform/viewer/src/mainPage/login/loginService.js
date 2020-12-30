import Axios from 'axios';
import Cookies from 'js-cookie';

export function login(username, password) {
  const csrftoken = Cookies.get('csrftoken');
  const options = {
    url: 'http://snuhpia.org:8000/api/v1/user/authenticate/',
    method: 'POST',
    headers: {
      'X-CSRFToken': csrftoken,
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
