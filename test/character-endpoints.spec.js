const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const supertest = require('supertest')
const { expect } = require('chai')

describe('Characters Endpoints', function() {
  let db

  const {
    testUsers,
    testCharacters
  } = helpers.makeCharactersFixtures()

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  describe('GET /api/users/:users_id/characters/:charater_id', () => {
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
        return supertest(app)
          .get('/api/users/3/characters/1')
          .expect(200, expectedCharacter)
      })
    })

    context(`given the character doesn't exist`, () => {
      it(`should resond with 404 'Character not found'`, () => {
        return supertest(app)
          .get('/api/users/3/characters/4')
          .expect(404, { error: 'Character not found' })
      })
    })
  })

  describe('POST /api/users/:user_id/characters', () => {
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
        status: 'completed',
        user_id: testUser.id
      }
      return supertest(app)
        .post('/api/users/1/characters')
        // .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(newCharacter)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id')
          expect(res.body).to.have.property('modified')
          expect(res.body.first_name).to.eql(newCharacter.first_name)
          expect(res.body.last_name).to.eql(newCharacter.last_name)
          expect(res.body.major_trait).to.eql(newCharacter.major_trait)
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
              expect(row.major_trait).to.eql(newCharacter.major_trait)
              expect(row.status).to.eql(newCharacter.status)
              expect(row.user_id).to.eql(newCharacter.user_id)
              const expectedDate = new Date().toLocaleString('en', { timezone: 'UTC' })
              const actualDate = new Date(row.created).toLocaleString()
              expect(actualDate).to.eql(expectedDate)
            })
        })
    })


  })

})