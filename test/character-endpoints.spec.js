const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const supertest = require('supertest')

describe.only('Characters Endpoints', function() {
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

  describe('GET users/:users_id/characters/:charater_id', () => {
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
        console.log(expectedCharacter)
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


})