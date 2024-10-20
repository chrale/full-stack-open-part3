const mongoose = require('mongoose')

mongoose.set('strictQuery',false)

const url = process.env.MONGODB_URI

console.log('connecting to ', url)

mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: [3, 'Name must be at least 3 characters long.'],
    required: true
  },
  number: {
    type: String,
    // min phone number length 8 numbers + dash
    minLength: [9, 'Phone number length must be at least 8 numbers and a dash.'],
    validate: {
      validator: function(value) {
        return /^\d{2}-\d{6,}$/.test(value) || /^\d{3}-\d{5,}$/.test(value)
      },
      message: 'Valid phone number must include a dash separating 2 or 3 first numbers from the rest.'
    },
    required: true
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Person = mongoose.model('Person', personSchema)

module.exports = Person