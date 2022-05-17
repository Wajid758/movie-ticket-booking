const mongoose = require('mongoose');
const Schema = mongoose.Schema;

movieSchema = new Schema( {
	Mname : {
        type : String,
        required: true
    },
    directedBy : {
        type : String
    },
    genere : {
        type : String,
        required: true
    },
    date : {
        type : String,
        required: true
    },
    image : {
        type : String,
        required: true
    },
    created : {
        type : Date,
        required: true,
        default: Date.now
    }	
}),

Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;