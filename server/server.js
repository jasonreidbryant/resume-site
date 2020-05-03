// const express = require('express')
// const app = express()
// const port = 3000

// app.get('/', (req, res) => res.send('Hello World!'))

// app.listen(port, () => console.log(`Example app listening on port ${port}!`))
require('dotenv').config()

const express = require('express'),
  next = require('next'),
  http = require('http'),
  https = require('https'),
  AWS = require('aws-sdk'),
  dev = process.env.NODE_ENV !== 'production',
  app = next({ dev }),
  handle = app.getRequestHandler(),
  port = process.env.PORT || 3000,
  bodyParser = require('body-parser'),
  environment = process.env.ENVIRONMENT

AWS.config.update({
  region: 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
})
const s3 = new AWS.S3({
  apiVersion: '2012-10-17',
})

// GET FILE
const getAWSJSON = (path, file, res) => {
  const bucket = 'jason-bryant-resume',
    envSpecificFolder = environment != 'PRODUCTION' || 'production' ? 'dev-review-staging' : 'production',
    key = `${path}/${envSpecificFolder}/${file}`
    console.log('key:', key, process.env.AWS_ACCESS_KEY_ID)

  s3
    .getObject({
      Bucket: bucket,
      Key: key
    })
    .on('success', response => {
      res.send(response.data.Body.toString('utf-8'))
    })
    .on('error', response => {
      res.send(response)
    })
    .send()
} //getAWSJSON

app
  .prepare()
  .then(() => {
    const server = express()
    server.use('/assets', express.static('assets'))

    server.get('/locate', (req, res) => {
      console.log(req.body)
      // date time (UTC): city, country
    })

    server.get('/copy', (req, res) => {
      getAWSJSON('website/copy', 'text.json', res)
    })

    // Serve All other Pages
    server.get('*', (req, res) => {
      return handle(req, res)
    })

    server.listen(port, err => {
      if (err) throw err
      console.log('> Ready on http://localhost:' + port)
      if (process.env.NODE_ENV === 'development') {
        https.createServer(sslOptions, server).listen(5001)
        console.log('...and via https on port 5001')
      }
    })
  })
  .catch(ex => {
    console.error(ex.stack)
    process.exit(1)
  })