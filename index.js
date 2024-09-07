const express = require('express')
const morgan = require('morgan')
const app = express()

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
// 'tiny'  :method :url :status :res[content-length] - :response-time ms :body

morgan.token('body', (request, response)=> { 
  return request.method === 'POST' ? JSON.stringify(request.body) : '';
})

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

// getting all the persons
app.get('/api/persons', (request, response) => {
    response.json(persons)
  })

// getting the info page
app.get('/info', (request, response) => {
    const date = new Date()
    response.send(`
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${date}</p>
    `);
})

// getting single person
app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
})

// deleting single person
app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})


// add single person
app.post('/api/persons', (request, response) => {
    const body = request.body

    // no name or number
    if(!body.name || !body.number){
        return response.status(400).json({
            error: 'name or number is missing'
        })  
    } else if(persons.find(person => person.name == body.name)){
        return response.status(400).json({
            error: 'name already exists in phonebook'
        })
    }
    const randomId = Math.floor(Math.random()*10000)
    
    const person ={
        id: randomId.toString(),
        name : body.name,
        number : body.number 
    }

    persons = persons.concat(person)
    response.json(person)
    
})

const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)