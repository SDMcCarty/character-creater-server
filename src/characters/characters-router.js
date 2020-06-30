const express = require('express')
const path = require('path')
const CharactersService = require('./characters-service')
const { requireAuth } = require('../middleware/jwt-auth')

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
    const { user_id, first_name, last_name, status, major_trait, age, sex, motivation, fear, history } = req.body
    const newCharacter = { user_id, first_name, last_name, status, major_trait, age, sex, motivation, fear, history }

    newCharacter.id = req.id
    newCharacter.created = req.created
    newCharacter.user_id = req.user.id

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
  .route('/:character_id')
  .all((req, res, next) => {
    CharactersService.getCharacter(
      req.app.get('db'),
      req.params.character_id
    )
    .then(character => {
      if (!character) {
        return res.status(404).json({
          error: { message: `Character doesn't exist` }
        })
      }
      res.character = character //saves chara for next
      next()
    })
    .catch(next)
  })
  .get(checkCharacterExists, (req, res, next) => {
    res.json(serializedCharacter = CharactersService.serializeCharacter(res.character))
  })
  .patch(jsonBodyParser, (req, res, next) => {
    console.log(req.body)
    const { id } = req.params
    const { first_name, last_name, major_trait, status, age, sex, motivation, fear, history } = req.body
    console.log(req.body)
    const characterToUpdate = { first_name, last_name, major_trait, status, age, sex, motivation, fear, history }

    CharactersService.updateCharacter(
      req.app.get('db'),
      req.params.character_id,
      characterToUpdate
    )
    .then(numRowsAffected => {
      res.status(204).end()
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