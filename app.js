// connects app to db and brings in middleware for app to use
const config = require('./utils/config')
// imports Express fn that returns an Express app when executed
const express = require('express')
const app = express()
const cors = require('cors')
require('express-async-errors')
const peopleRouter = require('./controllers/people')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

mongoose.set('strictQuery',false)

logger.info('connecting to...', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('Error connecting to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(middleware.requestLogger)
// router object is middleware, here it's only used IF the path starts w/ '/api/persons'
app.use('/api/persons', peopleRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
