const xss = require('xss')

const CharactersService = {
  getCharacter(db, character_id) {
    return db
      .from('characters')
      .select('*')
      .where('id', character_id)
      .first()
  },

  getCharactersForUser(db, user_id) {
    return db
      .from('characters')
      .select('*')
      .where('characters.user_id', user_id)
      .whereNot('characters.status', 'deleted')
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

  updateCharacter(db, id, newCharacterFields) {
    return db('characters')
      .where({ id })
      .update(newCharacterFields)
  },

  serializeCharacter(character) {
    return {
      id: character.id,
      first_name: xss(character.first_name),
      last_name: xss(character.last_name),
      major_trait: xss(character.major_trait),
      age: xss(character.age),
      sex: xss(character.sex),
      motivation: xss(character.motivation),
      fear: xss(character.fear),
      history: xss(character.history),
      created: new Date(character.created),
      modified: new Date(character.modified) || null,
      status: character.status,
      user_id: character.user_id,
    }
  },
}

module.exports = CharactersService