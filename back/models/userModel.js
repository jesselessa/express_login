const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    email : {
        unique : true,
        type : String,
    },

    password : {
        type : String,
        minLength : 8,
        maxLength : 100,
    },

    firstname : {
        type : String,
        minLength : 1,
        maxLength : 30,
    },

    surname : {
        type: String,
        minLength : 1,
        maxLength : 30,
    },

    birthdate : {
        type: String,
        minLength : 1,
        maxLength : 10,
    }
})

const User = mongoose.model("User", UserSchema);

module.exports = User;
