const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const supertest = require('supertest')
const { expect } = require('chai')
const { makeCharactersFixtures, makeCharactersArray } = require('./test-helpers')

describe('Characters Endpoints', function() {
  let db

  const {
    testUsers,
    testCharacters
  } = helpers.makeCharactersFixtures()

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  after('disconnect', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  describe('GET /api/characters/:charater_id', () => {
    context('given character exists', () => {
      beforeEach('insert characters', () => {
        return helpers.seedCharactersTables(
          db,
          testUsers,
          testCharacters
        )
      })

      it('should respond with 200 and the character', () => {
        const expectedCharacter = testCharacters[0]
        //Change Route => add .auth()
        return supertest(app)
          .get('/api/characters/1')
          .expect(200, expectedCharacter)
      })
    })

    context(`given the character doesn't exist`, () => {
      it(`should resond with 404 'Character not found'`, () => {
        return supertest(app)
          .get('/api/characters/4')
          .expect(404, { error: 'Character not found' })
      })
    })
  })

  describe('POST /api/characters', () => {
    beforeEach('insert users', () => {
      return helpers.seedUsers(
        db,
        testUsers,
      )
    })

    it('creates a character, responding with 201 and new chara', function() {
      this.retries(3)
      const testUser = testUsers[0]
      const newCharacter = {
        first_name: 'William',
        last_name: 'Williamson',
        major_trait: 'grandiose',
        age: '33',
        sex: 'Male',
        motivation: 'To the best there ever was, wholely unlike anyone prior',
        fear: 'commitment',
        history: 'Raised by a widower, he quickly learned the value of swerving and standing just to the left at night. He is now honor bound to be better than many, but mostly at cooking.',
        status: 'completed',
        user_id: testUser.id
      }
      return supertest(app)
        .post('/api/characters')
        // .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(newCharacter)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id')
          expect(res.body).to.have.property('modified')
          expect(res.body.first_name).to.eql(newCharacter.first_name)
          expect(res.body.last_name).to.eql(newCharacter.last_name)
          expect(res.body.age).to.eql(newCharacter.age)
          expect(res.body.sex).to.eql(newCharacter.sex)
          expect(res.body.major_trait).to.eql(newCharacter.major_trait)
          expect(res.body.motivation).to.eql(newCharacter.motivation)
          expect(res.body.fear).to.eql(newCharacter.fear)
          expect(res.body.history).to.eql(newCharacter.history)
          expect(res.body.status).to.eql(newCharacter.status)
          expect(res.body.user_id).to.eql(newCharacter.user_id)
          expect(res.headers.location).to.eql(`/api/users/1/characters/${res.body.id}`)
          const expectedDate = new Date().toLocaleString('en', { timezone: 'UTC '})
          const actualDate = new Date(res.body.created).toLocaleString()
          expect(actualDate).to.eql(expectedDate)
        })
        .expect(res => {
          db
            .from('characters')
            .select('*')
            .where({ id: res.body.id })
            .first()
            .then(row => {
              expect(row.first_name).to.eql(newCharacter.first_name)
              expect(row.last_name).to.eql(newCharacter.last_name)
              expect(row.age).to.eql(newCharacter.age)
              expect(row.sex).to.eql(newCharacter.sex)
              expect(row.major_trait).to.eql(newCharacter.major_trait)
              expect(row.motivation).to.eql(newCharacter.motivation)
              expect(row.fear).to.eql(newCharacter.fear)
              expect(row.history).to.eql(newCharacter.history)
              expect(row.status).to.eql(newCharacter.status)
              expect(row.user_id).to.eql(newCharacter.user_id)
              const expectedDate = new Date().toLocaleString('en', { timezone: 'UTC' })
              const actualDate = new Date(row.created).toLocaleString()
              expect(actualDate).to.eql(expectedDate)
            })
        })
    })


  })

  describe.only('PATCH /api/characters/:character_id', () => {
    context('Given no character', () => {
      it('responds with 404', () => {
        const characterId = 12345678
        return supertest(app)
          .patch(`/api/characters/${characterId}`)
          .expect(404, { error: { message: `Character doesn't exist` } })
      })
    })

    context('Given characters in DB', () => {
      const testCharacters = makeCharactersArray()

      beforeEach('insert characters', () => {
        return helpers.seedCharactersTables(
          db,
          testUsers,
          testCharacters
        )
      })

      it('responds with 204 and updates the character', () => {
        const idToUpdate = 2
        const updateCharacter = {
          first_name: 'Updated name',
          last_name: 'Updated last',
          major_trait: 'Updated Trait',
          age: 'Updated Age',
          sex: 'Updated Sex',
          motivation: 'New Motivation',
          fear: 'New Fear',
          history: 'New history',
        }
        const expectedCharacters = {
          ...testCharacters[idToUpdate -1],
          ...updateCharacter
        }

        return supertest(app)
          .patch(`/api/characters/${idToUpdate}`)
          .send(updateCharacter)
          .expect(204)
          .then(res => 
            supertest(app)
              .get(`/api/characters/${idToUpdate}`)
              .expect(expectedCharacters)  
          )
      })

    })

  })

})