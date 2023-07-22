const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
// returns a 'superagent' objt, used to make HTTP reqs to backend
const api = supertest(app)

const Person = require('../models/person')
// mongoose.set("bufferTimeoutMS", 30000)

beforeEach(async () => {
  await Person.deleteMany({})
  await Person.insertMany(helper.initialPeople)
})

describe('when there are initially some people saved', () => {
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
  
  test('a specific person is within the returned people', async () => {
    const response = await api.get('/api/persons')
  
    const names = response.body.map(p => p.name)
    expect(names).toContain(
      'Steve Rogers'
    )
  })
})

describe('viewing a specific person', () => {
  test('succeeds with valid id', async () => {
    const people = await helper.peopleInDb()
  
    const personToView = people[0]
  
    const resultPerson = await api
      .get(`/api/persons/${personToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  
    expect(resultPerson.body).toEqual(personToView)
  })

  test('fails with status code 404 if person does not exist', async () => {
    const nonExistingId = await helper.nonExistingId()
    await api
      .get(`/api/persons/${nonExistingId}`)
      .expect(404)
  })

  test('fails with status code 400 if id is not valid', async () => {
    const invalidId = 'h4b5a6154c465559015493b6'
    await api
      .get(`/api/persons/${invalidId}`)
      .expect(400)
  })
})

describe('addition of a new person', () => {
  test('succeeds with valid data', async () => {
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

  test('fails with status code 400 if data is invalid', async () => {
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
})

describe('deletion of a person', () => {
  test('succeeds with status code 204 if id is valid', async () => {
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
})


test('person has a property of id', async () => {
  const people = await helper.peopleInDb()
  expect(people[0].id).toBeDefined()
})


afterAll(async () => {
  await mongoose.connection.close()
})
