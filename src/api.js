export const baseUrl = 'http://localhost:3004'
function logErrAndRethrow (err) {
  console.error(err)
  throw err
}

// const Delay = {
//   resolve (value) {
//     return new Promise(resolve => {
//       setTimeout(() => resolve(value), 200)
//     })
//   }
// }

const api = {
  get (path, idToken) {
    return window
      .fetch(`${baseUrl}${path}`, {
        method: 'get',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(res => res.json().then(json => {
        res.data = json
        return res
      }))
      .catch(logErrAndRethrow)
  },

  post (path, body, idToken) {
    return window
      .fetch(`${baseUrl}${path}`, {
        method: 'post',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(body)
      })
      .then(res => res.json().then(json => {
        if (res.ok) {
          res.data = json
          return res
        } else {
          throw new Error(json.error || 'Unknown error')
        }
      }))
      .catch(logErrAndRethrow)
  },

  put (path, body, idToken) {
    return window
      .fetch(`${baseUrl}${path}`, {
        method: 'put',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(body)
      })
      .then(res => res.json().then(json => {
        if (res.ok) {
          res.data = json
          return res
        } else {
          throw new Error(json.error || 'Unknown error')
        }
      }))
      .catch(logErrAndRethrow)
  },

  xhr (url, callback) {
    var xmlhttp = new window.XMLHttpRequest()

    xmlhttp.onreadystatechange = function () {
      if (this.readyState === 4 && this.status === 200) {
        try {
          callback(null, xmlhttp)
        } catch (err) {
          callback(err)
        }
      } else {

      }
    }

    xmlhttp.open('GET', url, true)
    xmlhttp.setRequestHeader('Access-Control-Allow-Origin', '*')
    xmlhttp.send()
  }
}

export default api
