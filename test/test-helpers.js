const bcrypt = require('bcryptjs')

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
      major_trait: 'fiesty',
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
      created: '2029-01-22T16:28:32.615Z',
      modified: '2029-01-24T16:28:32.615Z',
      status: 'in-progress',
      user_id: 1
    },
    {
      id: 3,
      first_name: 'P',
      last_name: 'K',
      major_trait: 'indecisive',
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




module.exports = {
  makeUsersArray,
  makeCharactersArray,
  makeCharactersFixtures,

  cleanTables,
  seedUsers,
  seedCharactersTables,
}