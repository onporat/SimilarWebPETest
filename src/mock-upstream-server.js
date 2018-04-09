const sleep = require('await-sleep')
const express = require('express')
const bodyParser = require('body-parser')

const pid = process.pid

const [port, delay] = process.argv.slice(2)
if (!port || !delay) {
  console.error('Usage: node src/mock-upstream-server.js PORT DELAY')
  process.exit(1)
}

const logger = str => console.log(`PID:${pid} PORT:${port} - ${new Date()} ${str}`)

const loginHandler = (req, res) => {
  logger('/login')
  res.send({ login: 'OK', port })
}
const registerHandler = async (req, res) => {
  logger(`/register - before delay ${req.data}`)
  await sleep(delay)
  logger('/register - after delay')
  res.status(201)
  res.send({ register: 'OK', port })
}

const changePasswordHandler = async (req, res) => {
  logger(`/changePassword - before delay ${JSON.stringify(req.body)}`)
  await sleep(delay)
  logger('/changePassword - after delay')
  res.status(201)
  res.send({ changePassword: 'OK', port })
}

const app = express()
app.use(bodyParser.json())

app.post('/register', registerHandler)
app.post('/changePassword', changePasswordHandler)
app.get('/login', loginHandler)

app.listen(port, () => console.log(`Mock upstream server is listening on port ${port} PID ${pid}`))
