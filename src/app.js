require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const usersRouter = require('./users/users-router')
const charactersRouter = require('./characters/characters-router')
const authRouter = require('../src/auth/auth-router')

const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

app.use('/api/characters/', charactersRouter) //gets a users characters
app.use('/api/auth', authRouter) //checks auth
app.use('/api/users', usersRouter) //allows users to login/register


app.use(function errorHandler(error, req, res, next) {
  let response
  console.log(error)
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error'} }
  } else {
    console.error(error)
    response = { message: error.message, error }
  }
  res.status(500).json(response)
})

module.exports = app