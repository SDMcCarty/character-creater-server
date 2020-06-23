const xss = require('xss')
const { contentSecurityPolicy } = require('helmet')

const UsersService = {
  getAllCharacters(db) {
    return db
      .from('characters')
      .select('*')
  },

  getById(db, id) {
    console.log(`getById ${id}`)
    console.log(typeof id)
    return UsersService.getAllCharacters(db)
      .from('characters')
      .where('user_id', id)
  },

  getCharactersForUser(db, user_id) {
    console.log(user_id)
    return db
      .from('characters')
      .select('*')
      .where('characters.user_id', user_id)
  },

  serializeCharacter(character) {
    return {
      id: character.id,
      first_name: xss(character.first_name),
      last_name: xss(character.last_name),
      major_trait: xss(character.major_trait),
      created: new Date(character.created),
      modified: new Date(character.modified) || null,
      status: character.status,
      user_id: character.user_id
    }
  },
}

module.exports = UsersService