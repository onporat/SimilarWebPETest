const sleep = require('await-sleep')
const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')
const servers = require('../config/upstream-servers.json')
const port = process.env.PORT || 8080

const metrics = {
  totalGetRequests: 0,
  totalPostRequests: 0,
  totalErrors: 0,
}
let currentGetServer = 0 // currentSerrverIndex

const keepRetry = async (fn, delay = 0) => {
  await sleep(delay)

  try {
    return await fn()
  } catch (e) {
    metrics.totalErrors++
    return keepRetry(fn, delay * 2 || 1000)
  }
}

const getHandler = async (req, res) => {
  metrics.totalGetRequests++

  try {
    const response = await axios.get(servers[currentGetServer] + req.url)
    currentGetServer = (currentGetServer + 1) % servers.length

    res.status(response.status)
    res.send(response.data)
  } catch (error) {
    metrics.totalErrors++
    res.status(500)
    res.end()
  }
}

const postHandler = async (req, res) => {
  metrics.totalPostRequests++

  const postPromises = servers.map(server =>
    keepRetry(() =>
      axios.post(server + req.url, req.body, {
        headers: { 'Content-Type': 'application/json' },
      })
    )
  )
  const response = await Promise.race(postPromises)

  res.status(response.status)
  res.send(response.data)
}

const metricsHandler = (req, res) => {
  res.send(metrics)
}

const app = express()
app.use(bodyParser.json())

app.post('/register', postHandler)
app.post('/changePassword', postHandler)
app.get('/login', getHandler)

app.get('/metrics', metricsHandler)

console.log('upstream servers', servers)
app.listen(port, () => console.log(`Load Balancer is listening on port ${port}`))
