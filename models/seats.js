const mongoose = require('mongoose');
const Schema = mongoose.Schema;

seatSchema = new Schema( {
	movieId:String,
    moviename:String,
	totalseat: Number,
	selected: String,
	seats:String,
	price: String
}),

Seat = mongoose.model('Seat', seatSchema);

module.exports = Seat;