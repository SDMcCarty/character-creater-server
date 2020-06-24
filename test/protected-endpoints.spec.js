const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe.only('Protected Endpoints', function() {
  let db

  const {
    testUsers,
    testCharacters,
  } = helpers.makeCharactersFixtures()

  before('knex instanct', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    })
    app.set('db', db)
  })

  after('disconnet', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  beforeEach('insert characters', () => {
    return helpers.seedCharactersTables(
      db,
      testUsers,
      testCharacters
    )
  })
 
  const protectedEndpoints = [
    {
      name: 'GET /api/users/:user_id/characters/:character_id',
      path: '/api/users/3/characters/1'
    },
    {
      name: 'GET /api/users/:user_id/characters',
      path: '/api/users/1'
    },
  ]
 
  protectedEndpoints.forEach(endpoint => {
    describe(endpoint.name, () => {
      it(`responds with 401 'Missing bearer token' when no token`, () => {
        return supertest(app)
          .get(endpoint.path)
          .expect(401, { error: 'Missing bearer token'})
      })

      it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
        const validUser = testUsers[0]
        const inValidSecret = 'bad-secret'
        return endpoint.method(endpoint.path)
          .set('Authorization', helpers.makeUsersArray(validUser, inValidSecret))
          .expect(401, { error: 'Unuthorized request' })
      })
      //it bou
    })
  })
})

