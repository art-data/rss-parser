// lambda's node environment hasn't been updated recently.
// we'll use babel to turn this contemporary javascript into old-school javascript.
// see gulpfile.js for more details
require('babel-polyfill')

const AWS = require('aws-sdk')
const request = require('request-promise')
const date_format = require('date-format')
const config = require('./config.json')
import do_all_promises from 'do_all_promises'

// since this is running on lambda, it's automatically authorized to write to s3
let s3 = new AWS.S3()

// function to get the json list of blogs from s3
// see readme for config details
const get_config = function () {
  return new Promise(function (resolve, reject) {
    let config_params = {
      Bucket: (config.config_bucket || 'art-data'),
      Key: (config.config_file || 'art-blogs.json')
    }
    s3.getObject(config_params, function (err, data) {
      if (err) { reject(err) }
      resolve(JSON.parse(data.Body))
    })
  })
}

// accepts a date and a blog
// returns an s3 key to upload to
const gen_key = function (date, blog) {
  const date_dir = (config.output_key_prefix || 'downloads/') + date + '/'
  const dir = date_dir + blog.name + '/'
  const key = (dir + (blog.key || 'feed.rss'))
  return key
}

// accepts an s3 key and a value
// resolves when the upload is done
const put_blog = function (key, body) {
  return new Promise(function (resolve, reject) {
    let params = {
      Bucket: (config.output_bucket || 'art-data'),
      Key: key,
      Body: body
    }
    s3.upload(params, function (err, data) {
      if (err) { reject(err); return }
      resolve(data)
    })
  })
}

// accepts one blog and the date
// resolves when that blog is on s3
const get_blog = function (date, blog) {
  return new Promise(function (resolve, reject) {
    let key = gen_key(date, blog)

    request(blog.url)
      .then(function (blog_body) {
        put_blog(key, blog_body)
          .then(resolve)
          .catch(reject)
      })
      .catch(reject)
  })
}

// accepts an array of blogs (ie art-blogs.json)
// resolves when all the blogs are on s3
const get_blogs = function (blogs) {
  return new Promise(function (resolve, reject) {
    const now = new Date()
    const date = date_format(now, 'YYYY-MM-dd hh:mm:ss')

    // gather blog promises into a Promise.all-able array
    let blog_promises = blogs.map(function (blog) {
      return get_blog(date, blog)
    })

    resolve(blog_promises)
  })
}

// this function is called by aws lambda
exports.handler = function (event, context) {
  get_config()
    .then(get_blogs)
    .then(do_all_promises)
    .then(context.succeed)
    .catch(context.fail)
}

