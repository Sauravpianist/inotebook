const mongoose = require('mongoose');
const mongoURI ="mongodb+srv://inotebook:S2516239%23p@inotebook.730cmgi.mongodb.net/user"

//connecting to mongoose
const connectToMongo = ()=>{
    mongoose.connect(mongoURI, ()=>{
        console.log("connect to mongo  successfully")
    })
}
module.exports = connectToMongo;