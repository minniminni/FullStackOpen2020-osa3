require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
//tärkeää, että dotenv käyttöönotto ennen modelin person importia
//Jotta .env:ssä olevat ympäristömuuttujat ovat alustettuja kun moduulin koodia importoidaan.
const Person = require('./models/person')

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))
app.use(cors())
app.use(express.static('build'))

let persons = [
    {
        name: "Arto Hellas",
        number: "040-123456",
        id: 1
    },
    {
        name: "Ada Lovelace",
        number: "39-44-5323523",
        id: 2
    },
    {
        name: "Dan Abramov",
        number: "12-43-234345",
        id: 3
    },
    {
        name: "Mary Poppendieck",
        number: "39-23-6423122",
        id: 4
    }
]

//Yksittäisen puhelintiedon näyttäminen
app.get('/api/persons/:id',(request, response, next) => {
    Person.findById(request.params.id)
    .then(person => {
        if (person) {
            response.json(person.toJSON())
        } else {
          response.status(404).end()
        }
      })
      .catch(error => next(error))
  })

//Poistaa yksilöidyn resurssin
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
      .then(result => {
        response.status(204).end()
      })
      .catch(error => next(error))
  })

//Generoi uuden puhelintiedon tunnisteen
const generateId = () => {
    const maxId = persons.length + 1
    const rndId = Math.floor(Math.random() * Math.floor(50))
    
    return maxId + rndId
}

//Uuden puhelintiedot lisäys + virheiden käsittely
app.post('/api/persons',(request, response, next) => {
    const body = request.body
    const findPerson = persons.find(person => person.name === body.name)

    if(findPerson){
        return response.status(400).json({
            error: 'name must be unique'
        })
    }
    if(!body.name){
        return response.status(400).json({
            error: 'name missing'
        })
    }
    if(!body.number){
        return response.status(400).json({
            error: 'number missing'
        })
    }
    
    const person = new Person ({
        name: body.name,
        number: body.number,
        id: generateId(),
    }) 

    persons = persons.concat(person)

    person.save().then(savedPerson => {
        response.json(savedPerson.toJSON())
    })
    .catch(error => next(error))
})

//Olemassaolevan puhelintiedon MUOKKAUS
app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
    const person = {
        name: body.name,
        number: body.number,
    }
    Person.findByIdAndUpdate(request.params.id, person, {new: true})
    .then(updatePerson => {
        response.json(updatePerson.toJSON())
    })
    .catch(error => next(error))
})

//Hae KAIKKI puhelintiedot
app.get('/api/persons', (request, response, next) => {
    Person.find({}).then(persons => {
        response.json(persons.map(person => person.toJSON()))
    })
    .catch((error) => next(error)) 
})


//Info
app.get('/info',(request, response,next) => {
    const date = new Date()
    Person.countDocuments({}, function(error, count){
        if(error){
            response.send(error)
        }else{
            const content=`<p>Phonebook has info for ${count} people<p/> ${date}`
            response.send(content)
        }
    })
    .catch(error => next(error))
})

//olemattomien osoitteiden käsittely
const unknownEndpoint = (request, response) => {
      response.status(404).send({error: 'unknown endpoint'})
  }

app.use(unknownEndpoint)

//Virheellisten pyyntöjen käsittely
const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if(error.name === 'CastError'){
        return response.status(400).send({error: 'malformatted id'})
    } else if(error.name === 'ValidationError'){
        return response.status(400).json({error: error.message})
    }
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
 console.log(`Server running on port ${PORT}`)   
})
