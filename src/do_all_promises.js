// accepts an array of promises
// resolves an array of results, including resolutions and/or rejections
// like Promise.all except not all-or-nothing
const do_all_promises = function (promises) {
  return new Promise(function (resolve, reject) {
    Promise.all(promises.map(definitely_do_promise))
      .then(resolve)
  })
}

// accepts a promise that might reject or resolve
// returns a promise that always resolve but will sometimes resolve an error
// essentially turns .reject(error_message) into .resolve(error_message)
// use carefully
const definitely_do_promise = function (promise) {
  return new Promise(function (resolve, reject) {
    promise
      .then(resolve)
      .catch(resolve)
  })
}

export default do_all_promises

