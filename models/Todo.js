const mongoose =require('mongoose')

const TodoSchema = new mongoose.Schema({
    text: String,
    image: String,
    status: String
});

const Todos=mongoose.model("Todos",TodoSchema)
module.exports = Todos;