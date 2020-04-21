const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

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
app.get('/api/persons/:id',(request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if(person){
        response.send(`<div>${person.name} <br></br> ${person.number}</div>`)
    }else{
        response.status(404).end()
    }
})

//Poistaa yksilöidyn resurssin
app.delete('/api/persons/:id',(request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    
    response.status(204).end()
})

//Generoi uuden puhelintiedon tunnisteen
const generateId = () => {
    const maxId = persons.length + 1
    const rndId = Math.floor(Math.random() * Math.floor(50))
    
    return maxId + rndId
}

//Uuden puhelintiedot lisäys + virheiden käsittely
app.post('/api/persons',(request, response) => {
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
    
    const person = {
        name: body.name,
        number: body.number,
        id: generateId(),
    }

    persons = persons.concat(person)

    response.json(person)
})

app.get('/api/persons',(request, response) => {
    response.json(persons)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
 console.log(`Server running on port ${PORT}`)   
})

app.get('/info',(req, res) => {
    const date = new Date()
    res.send(
    `<div>Phonebook has info for ${persons.length} people
    </div>
    <div>${date}</div>`
    )
})

const PORT3 = process.env.PORT3 || 3003
app.listen(PORT3, () => {
    console.log(`Server running on port ${PORT3}`)
})