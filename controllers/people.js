// this file contains our route handlers
const jwt = require('jsonwebtoken')
const peopleRouter = require('express').Router()
const Person = require('../models/person')
const User = require('../models/user')
const middleware = require('../utils/middleware')

peopleRouter.get('/', async (request, response) => {
  const people = await Person
    .find({}).populate('user', { username: 1, name: 1 })
  response.json(people)
})

peopleRouter.get('/:id', async (request, response, next) => {
  const person = await Person.findById(request.params.id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

peopleRouter.post('/', async (request, response, next) => {
  const body = request.body

  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const user = await User.findById(decodedToken.id)

  const person = new Person({
    name: body.name,
    number: body.number,
    user: user.id
  })

  const savedPerson = await person.save()
  user.contacts = user.contacts.concat(savedPerson._id)
  await user.save()

  response.status(201).json(savedPerson)
})

peopleRouter.delete('/:id', async (request, response, next) => {
  await Person.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

peopleRouter.put('/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

module.exports = peopleRouter