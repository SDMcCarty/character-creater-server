const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const supertest = require('supertest')

describe('Users Endpoints', function() {
  let db

  const {
    testUsers,
    testCharacters,
  } = helpers.makeCharactersFixtures()

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  describe(`GET users/:user_id`, () => {
    context('given no characters', () => {
     it(`responds with 200, and empty array when no characters`, () => {
       return supertest(app)
         .get('/api/users/2/characters')
         .expect(200, [])
     })
    })

    context('given characters in DB', () => {
     beforeEach('insert characters', () => {
       return helpers.seedCharactersTables(
         db,
         testUsers,
         testCharacters
       )
     })

     it('responds with 200 and all characters for a user', () => {
       const expectedCharacters = testCharacters.filter(character => character.user_id === testUsers[0].id)
       console.log('length', expectedCharacters.length)
       return supertest(app)
        .get('/api/users/1/characters')
        .expect(200, expectedCharacters)
     })


    })

   })

})