require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const Person = require('./models/person')

app.use(express.static('dist'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
// 'tiny'  :method :url :status :res[content-length] - :response-time ms :body

morgan.token('body', (request, response)=> { 
  return request.method === 'POST' ? JSON.stringify(request.body) : '';
})

// error handling middleware
const errorHandler = (error, request, response, next) => {
  console.error("Error message: ", error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 
  next(error)
}

// getting all the persons
app.get('/api/persons', (request, response) => {
    Person.find({})
      .then (persons =>{
        response.json(persons)
      })    
      .catch(error => next(error));   
})

// getting the info page
app.get('/info', (request, response) => {
    const date = new Date()
  
    Person.countDocuments()
      .then(count => {
        response.send(`
          <p>Phonebook has info for ${count} people</p>
          <p>${date}</p>
        `);
      })  
      .catch(error => next(error)); 
})

// getting single person
app.get('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person.findById(id)
      .then(person=> {
        if (person) {
          response.json(person)
        } else {
          response.status(404).end() // Person not found
        }
      })
      .catch(error => next(error)) // Pass error to error handler
})

// deleting single person
app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person.findByIdAndDelete(id)
      .then(result => {
        response.status(204).end() // Person found and deleted
      })
    .catch(error => next(error)) // Pass error to error handler
})

// add single person
app.post('/api/persons', (request, response) => {
    const body = request.body
    const personName = body.name
    const personNumber = body.number

    // no name or number
    if(!personName){
        return response.status(400).json({
            error: 'name is missing'
        })  
    } else if (!personNumber) {
      return response.status(400).json({
        error: 'number is missing'
        })
    } 

    const person = new Person({
      name: personName,
      number: personNumber,
    })
  
    person.save().then(savedPerson => {
      response.json(savedPerson)
      console.log(`added ${personName} number ${personNumber} to phonebook`)
    })
})

// updating phone number
app.put('/api/persons/:id', (request, response, next) => {
  const personName = request.body.name
  const personNumber = request.body.number

  const person = {
    name: personName,
    number: personNumber,
  }
  
  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
      console.log(`updated ${personName} number ${personNumber} to phonebook`)
    })
    .catch(error => next(error))
})

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})