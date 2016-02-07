# downloader

This thingy should download a bunch of files and then put them in an s3 bucket.

It runs on AWS Lambda.

the official lambda return value is an array that contains successful s3 responses and/or errors. 

Website download or upload failures will not cause a lambda failure. Not finding the config file *will* cause a lambda failure.

## building it

run `npm install` then `gulp` in this folder to build a lambda-ready .zip file in ./dist/aws.zip.

Gulp will look for a config file at ./pub/config.json.

The defaults are as follows:

```json
{
  "output_key_prefix": "downloads/",
  "output_bucket": "art-data",

  "config_bucket": "art-data",
  "config_file": "art-blogs.json"
}
```

## website config

It looks in s3 for a json config file.

That config file should look something like this:

```json
[
  {
    "name": "website-one",
    "url":  "http://website.one.com/whatever",
    "key": "this is optional. The default is 'feed.rss'"
  },
  {
    "name": "website-two",
    "url":  "http://website.two.com/whatever"
  }
]
```

The results are saved in an s3 bucket.

The output keys look something like:

```js
`${config.output_key_prefix || 'downloads/'}/${date}/${website.name}/${website.key || 'feed.rss' }`
```

