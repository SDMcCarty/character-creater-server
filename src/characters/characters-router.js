const express = require('express')
const path = require('path')
const CharactersService = require('./characters-service')
const { requireAuth } = require('../middleware/jwt-auth')
const { contentSecurityPolicy } = require('helmet')

const charactersRouter = express.Router()
const jsonBodyParser = express.json()

charactersRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    console.log(req.user.id)
    CharactersService.getCharactersForUser(
      req.app.get('db'), 
      req.user.id
    )
      .then(characters => {
        console.log(characters)
        const serializedCharacters = characters.map(character => CharactersService.serializeCharacter(character))
        res.json(serializedCharacters)
      })
      .catch(err => {
        console.log(err)
        next()
      })
  })
  .post(jsonBodyParser, (req, res, next) => {
    const { user_id, first_name, last_name, status, major_trait } = req.body
    const newCharacter = { user_id, first_name, last_name, status, major_trait }

    newCharacter.id = req.id
    newCharacter.created = req.created

    CharactersService.insertCharacter(
      req.app.get('db'),
      newCharacter
    )
      .then(character => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${character.id}`))
          .json(CharactersService.serializeCharacter(character))
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