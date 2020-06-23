const express = require('express')
const UsersService =require('./users-service')

const usersRouter = express.Router()

usersRouter
  .route('/:user_id')
  .get(checkUserExists)
  .get((req, res, next) => {
    console.log(`User id ${req.params.user_id}`)
    UsersService.getCharactersForUser(
      req.app.get('db'), 
      req.params.user_id
    )
      .then(characters => {
        console.log(`characters`, characters )
        const serializedCharacters = characters.map(character => UsersService.serializeCharacter(character))
        console.log('Ser', serializedCharacters)
        res.json(serializedCharacters)
      })
      .catch(next)
  })

  async function checkUserExists(req, res, next) {
    try {
      const user = await UsersService.getById(
        req.app.get('db'),
        req.params.user_id
      )

      if(!user) 
        return res.status(404).json({
          error: `User doesn't exist`
        })
        res.user = user
        next()
    } catch(error) {
      next(error)
    }
  }

  module.exports = usersRouter