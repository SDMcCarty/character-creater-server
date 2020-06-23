const express = require('express')
const CharactersService = require('./characters-service')

const charactersRouter = express.Router()

charactersRouter
  .route('/:user_id/characters')
  .get(checkUserExists)
  .get((req, res, next) => {
    console.log(`User id ${req.params.user_id}`)
    CharactersService.getCharactersForUser(
      req.app.get('db'), 
      req.params.user_id //req.id? req.user.id mitai kedo tabun chigau yo ne
    )
      .then(characters => {
        console.log(`characters`, characters )
        const serializedCharacters = characters.map(character => CharactersService.serializeCharacter(character))
        console.log('Ser', serializedCharacters)
        res.json(serializedCharacters)
      })
      .catch(next)
  })

  async function checkUserExists(req, res, next) {
    try {
      const user = await CharactersService.getById(
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

//get character by id
//post character from user (user_id is necessary)
//patch character by id
//delete character by id
charactersRouter
  .route('/:user_id/characters/:character_id')
  .get(checkCharacterExists, (req, res, next) => {
    console.log('character id', `${req.params.character_id}`)
    CharactersService.getCharacter(
      req.app.get('db'),
      req.params.character_id
    )
      .then(character => {
        const serializedCharacter = CharactersService.serializeCharacter(character)
        res.json(serializedCharacter)
      })
      .catch(next)
  })

  async function checkCharacterExists(req, res, next) {
    try {
      const character = await CharactersService.getCharacter(
        req.app.get('db'),
        req.params.character_id
      )
      console.log(`character`, character)

      if(!character) 
        return res.status(404).json({
          error: `Character not found`
        })
        res.character = character
        next()
    } catch(error) {
      next(error)
    }
  }
  


  module.exports = charactersRouter