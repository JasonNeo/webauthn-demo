'use strict';

/* Handle for register form submission */
$('#register').submit(function(event) {
  event.preventDefault();

  const username = this.username.value;
  const name     = this.name.value;

  if(!username || !name) {
      alert('Name or username is missing!')
      return;
  }

  getMakeCredentialsChallenge({username, name})
    .then((response) => {
      const publicKey = preformatMakeCredReq(response);
      return navigator.credentials.create({ publicKey })
    })
    .then((newCred) => {
      const makeCredResponse = publicKeyCredentialToJSON(newCred);
      return sendWebAuthnResponse(makeCredResponse);
    })
    .then((response) => {
        if(response.status === 'ok') {
            loadMainContainer();
        } else {
            alert(`Server responed with error. The message is: ${response.message}`);
        }
    })
    .catch((error) => alert(error));
});

const getMakeCredentialsChallenge = (formBody) => {
  return fetch('/webauthn/register', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formBody)
  })
  .then((response) => response.json())
  .then((response) => {
      if(response.status !== 'ok')
          throw new Error(`Server responed with error. The message is: ${response.message}`);

      return response;
  });
};

const sendWebAuthnResponse = (body) => {
  return fetch('/webauthn/response', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
  })
  .then((response) => response.json())
  .then((response) => {
      if(response.status !== 'ok')
          throw new Error(`Server responed with error. The message is: ${response.message}`);

      return response;
  });
};

/* Handle for login form submission */
$('#login').submit(function(event) {
  event.preventDefault();

  const username = this.username.value;

  if(!username) {
      alert('Username is missing!')
      return
  }

  getGetAssertionChallenge({username})
      .then((response) => {
          const publicKey = preformatGetAssertReq(response);
          return navigator.credentials.get({ publicKey })
      })
      .then((response) => {
          const getAssertionResponse = publicKeyCredentialToJSON(response);
          return sendWebAuthnResponse(getAssertionResponse)
      })
      .then((response) => {
          if(response.status === 'ok') {
              loadMainContainer()   
          } else {
              alert(`Server responed with error. The message is: ${response.message}`);
          }
      })
      .catch((error) => alert(error))
});

const getGetAssertionChallenge = (formBody) => {
  return fetch('/webauthn/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formBody)
  })
  .then((response) => response.json())
  .then((response) => {
      if(response.status !== 'ok')
          throw new Error(`Server responed with error. The message is: ${response.message}`);

      return response
  })
};