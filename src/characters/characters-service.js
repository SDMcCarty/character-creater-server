const xss = require('xss')

const CharactersService = {
  getCharacter(db, character_id) {
    return db
      .from('characters')
      .select('*')
      .where('id', character_id)
      .first()
  },
  
  getAllCharacters(db) {
    return db
      .from('characters')
      .select('*')
  }, //is this something app should do?

  getById(db, id) {
    return this.getAllCharacters(db)
      .from('characters')
      .where('user_id', id)
  },

  getCharactersForUser(db, user_id) {
    return db
      .from('characters')
      .select('*')
      .where('characters.user_id', user_id)
  },

  insertCharacter(db, newCharacter) {
    return db
      .insert(newCharacter)
      .into('characters')
      .returning('*')
      .then(([character]) => character)
      .then(character => 
        CharactersService.getCharacter(db, character.id)
      )
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

module.exports = CharactersService