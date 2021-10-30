const mongoose = require('mongoose');


const quizSchema = new mongoose.Schema({
    topic: {
        type: String,
    },
    game: {
        type: String,
        required :true
    },
    code: {
        type: String,
        required: true
    },
    teacher: {
        type: String,
        required: true
    },
    question: {
        type: [String],
        required: true
    },
    answer: {
        type: [String],
        required: true
    },
    option: {
        type: [String],
    },
    date: {
        type: String,
    }

})



module.exports = mongoose.model('Quiz', quizSchema);