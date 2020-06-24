const express = require('express')
const AuthService = require('./auth-service')
const { requireAuth } = require('../middleware/jwt-auth')

const authRouter = express.Router()
const jsonBodyParser = express.json()

authRouter
  .post('/login', jsonBodyParser, (req, res, next) => {
    const { user_name, password } = req.body
    console.log('username is ', user_name)
    console.log('password is ', password)
    const loginUser = { user_name, password }

    for (const [key, value] of Object.entries(loginUser))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        })
    
    AuthService.getUserWithUserName(
      req.app.get('db'),
      loginUser.user_name
    )
      .then(dbUser => {
        console.log('dbUser', dbUser)
        if(!dbUser)
          return res.status(400).json({
            error: 'Invalid credentials'
          })
        
        return AuthService.comparePasswords(loginUser.password, dbUser.password)
          .then(compareMatch => {
            if(!compareMatch)
              return res.status(400).json({
                error: 'Invalid credentials'
              })
              const sub = dbUser.user_name
              const payload = { user_id: dbUser.id }
              res.send({
                authToken: AuthService.createJwt(sub, payload)
              })
          })
      })
      .catch(next)



  })

module.exports = authRouter