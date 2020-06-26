const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
  return [
    {
      id: 1,
      user_name: 'test-user-1',
      password: 'password',
      deleted: false,
      email: 'hippityhoppity@bunz.com'
    },
    {
      id: 2,
      user_name: 'test-user-2',
      password: 'password',
      deleted: false,
      email: 'whickitywack@gmail.com'
    },
    {
      id: 3,
      user_name: 'Frank',
      password: 'password',
      deleted: false,
      email: 'frank@frank.org'
    }
  ]
}

function makeCharactersArray(testUsers) {
  return [
    {
      id: 1,
      first_name: 'Quince',
      last_name: 'Quinn',
      age: '23',
      sex: 'Male',
      major_trait: 'fiesty',
      motivation: 'Sponge collection',
      fear: 'deep sea fish',
      history: 'Born in NE, he quickly learned not to go swimminig alone',
      created: '2029-01-22T16:28:32.615Z',
      modified: '1970-01-01T00:00:00.000Z',
      status: 'completed',
      user_id: 3
    },
    {
      id: 2,
      first_name: 'Michiro',
      last_name: 'Fukuzaki',
      major_trait: 'verbose',
      age: '58',
      sex: 'Female',
      motivation: 'Power',
      fear: 'home-made fugu',
      history: 'Once scorned by her father, she decides to play the long game and  builds her empire right under his nose. He tries to leave everything to her brother, but what if her brother was no more?',
      created: '2029-01-22T16:28:32.615Z',
      modified: '2029-01-24T16:28:32.615Z',
      status: 'in-progress',
      user_id: 1
    },
    {
      id: 3,
      first_name: 'P',
      last_name: 'K',
      age: '18',
      sex: 'trans-man',
      major_trait: 'indecisive',
      motivation: 'freedom',
      fear: 'people',
      history: 'Growing up in the wrong body made P afraid. Now, living with three roommates in NY, he is finally learning that what people think does not matter - what he thinks and feels is what counts.',
      created: '2029-01-22T16:28:32.615Z',
      modified: '1970-01-01T00:00:00.000Z',
      status: 'completed',
      user_id: 1
    }
  ]
}

function makeCharactersFixtures() {
  const testUsers = makeUsersArray()
  const testCharacters = makeCharactersArray(testUsers)
  return { testUsers, testCharacters }
}

function cleanTables(db) {
  return db.raw(
    `TRUNCATE
      characters,
      character_creater_users
      RESTART IDENTITY CASCADE`
  )
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))
  return db.into('character_creater_users').insert(preppedUsers)
      .then(() => {
        //update the auto sequence to stay in sync
        db.raw(`SELECT setval('chacracter_creater_users_id_seq', ?)`,
        [users[users.length - 1].id],
        )
      })
}

function seedCharactersTables(db, users, characters=[]) {
  return seedUsers(db, users)
    .then(() => 
      characters.length && db
        .into('characters')
        .insert(characters)
    )
    
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.user_name,
    algorithm: 'HS256'
  })
  return `Bearer ${token}`
}




module.exports = {
  makeUsersArray,
  makeCharactersArray,
  makeCharactersFixtures,

  cleanTables,
  seedUsers,
  seedCharactersTables,
  makeAuthHeader,
}