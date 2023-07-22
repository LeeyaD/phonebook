const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
// returns a 'superagent' objt, used to make HTTP reqs to backend
const api = supertest(app)

const Person = require('../models/person')
// mongoose.set("bufferTimeoutMS", 30000)

beforeEach(async () => {
  await Person.deleteMany({})
  let personObject = new Person(helper.initialPeople[0])
  await personObject.save()
  personObject = new Person(helper.initialPeople[1])
  await personObject.save()
})

test('people are returned as json', async () => {
  await api
    .get('/api/persons')
    .expect(200)
    .expect('Content-Type', /application\/json/)
    // regex > string, b/c strs have to match exactly 
}, 100000)

test('all people are returned', async () => {
  const response = await api.get('/api/persons')

  expect(response.body).toHaveLength(helper.initialPeople.length)
})

test('a specific note is within the returned notes', async () => {
  const response = await api.get('/api/persons')

  const names = response.body.map(p => p.name)
  expect(names).toContain(
    'Steve Rogers'
  )
})

test('a valid person can be added', async () => {
  const newPerson = {
    name: 'Shawn Spencer',
    number: '888-88888'
  }
  
  await api
    .post('/api/persons')
    .send(newPerson)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const peopleNow = await helper.peopleInDb()
  expect(peopleNow).toHaveLength(helper.initialPeople.length + 1)
  
  const names = peopleNow.map(p => p.name)
  expect(names).toContain('Shawn Spencer')
})

test('person without name is not added', async () => {
  const newPerson = {
    number: '234-56789'
  }

  await api
    .post('/api/persons')
    .send(newPerson)
    .expect(400)

  const peopleNow = await helper.peopleInDb()
  expect(peopleNow).toHaveLength(helper.initialPeople.length)
})

test('a specific person can be viewed', async () => {
  const people = await helper.peopleInDb()

  const personToView = people[0]


  const resultPerson = await api
    .get(`/api/persons/${personToView.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  expect(resultPerson.body).toEqual(personToView)
})

test('a person can be deleted', async () => {
  const peopleBefore = await helper.peopleInDb()
  const personToDelete = peopleBefore[0]


  await api
    .delete(`/api/persons/${personToDelete.id}`)
    .expect(204)

  const peopleAfter = await helper.peopleInDb()

  expect(peopleAfter).toHaveLength(
    helper.initialPeople.length - 1
  )

  const names = peopleAfter.map(p => p.name)

  expect(names).not.toContain(personToDelete.name)
})


afterAll(async () => {
  await mongoose.connection.close()
})
