const Person = require('../models/person')

const initialPeople = [
  {
    name: 'Steve Rogers',
    number: '123-45567',
  },
  {
    name: 'Jenny J',
    number: '867-53095',
  },
]

const nonExistingId = async () => {
  const person = new Person({ name: 'willremovethissoon' })
  await person.save()
  await person.deleteOne()

  return person._id.toString()
}

const peopleInDb = async () => {
  const people = await Person.find({})
  return people.map(person => person.toJSON())
}

module.exports = {
  initialPeople, nonExistingId, peopleInDb
}