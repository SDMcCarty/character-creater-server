const express = require('express')
const UsersService =require('./users-service')
const { requireAuth } = require('../middleware/jwt-auth')

const usersRouter = express.Router()

//for adding users

  module.exports = usersRouter