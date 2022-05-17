const express = require('express');
const router = express.Router();
const multer = require('multer');
const User = require('../models/user');
const Movie = require('../models/movie');
const Seat = require('../models/seats');
const fs = require('fs');
const { builtinModules } = require('module');

// image upload
const storage = multer.diskStorage({
	destination : function(req, file, cb){
		cb(null, './uploads')
	},
	filename : function(req, file,cb){
		cb(null, file.fieldname + "_"+ Date.now() + "_" + file.originalname);
	}
});

let upload = multer({
	storage : storage
}).single("image");

// insert into database
router.post('/addmovie', upload, (req,res)=>{
	const movie = new Movie({
		Mname : req.body.Mname,
		directedBy : req.body.direct,
		genere : req.body.genere,
		date : req.body.date,
		image : req.file.filename
	});

	movie.save((err)=>{
		if(err){
			console.log(err)
			res.json({message : err.message , type: 'danger'})
		}else{
			req.session.message = {
				type:'success',
				message : 'Movie added successfully!'
			};
			res.redirect("/movielist");
		}
	})
})


router.get('/', function (req, res, next) {
	return res.render('index.ejs');
});


router.post('/', function (req, res, next) {
	const personInfo = req.body;

	if (!personInfo.email || !personInfo.username || !personInfo.password || !personInfo.passwordConf) {
		res.send();
	} else {
		if (personInfo.password == personInfo.passwordConf) {
			User.findOne({ email: personInfo.email }, function (err, data) {
				if (!data) {
					let c;
					User.findOne({}, function (err, data) {

						if (data) {
							console.log("if");
							c = data.unique_id + 1;
						} else {
							c = 1;
						}

						const newPerson = new User({
							unique_id: c,
							email: personInfo.email,
							username: personInfo.username,
							password: personInfo.password,
							passwordConf: personInfo.passwordConf
						});

						newPerson.save(function (err, Person) {
							if (err)
								console.log(err);
							else
								console.log('Success');
						});

					}).sort({ _id: -1 }).limit(1);
					res.send({ "Success": "You are regestered,You can login now." });
				} else {
					res.send({ "Success": "Email is already used." });
				}

			});
		} else {
			res.send({ "Success": "password is not matched" });
		}
	}
});

router.get('/login', function (req, res, next) {
	return res.render('login.ejs');
});

router.post('/login', function (req, res, next) {
	
	User.findOne({ email: req.body.email }, function (err, data) {
		if (data) {

			if (data.password == req.body.password) {
				//console.log("Done Login");
				req.session.userId = data.unique_id;
				//console.log(req.session.userId);
				res.send({ "Success": "Success!" });

			} else {
				res.send({ "Success": "Wrong password!" });
			}
		} else {
			res.send({ "Success": "This Email Is not regestered!" });
		}
	});
});

router.get('/profile', function (req, res, next) {
	console.log("profile");
	// User.findOne({ unique_id: req.session.userId }, function (err, data) {
	// 	console.log("data");
	// 	console.log(data);
	// 	if (!data) {
	// 		res.redirect('/');
	// 	} else {
	// 		//console.log("found");
	// 		return res.render('data.ejs', { "name": data.username, "email": data.email });
	// 	}
	// });

	Movie.find().exec((err, movies) => {
		if (err) {
			res.json(err)
		} else {
			console.log('movies data - ' + movies)
			res.render('data.ejs', {
				movielist: movies
			})
		}
	})
});

router.get('/logout', function (req, res, next) {
	console.log("logout")
	if (req.session) {
		// delete session object
		req.session.destroy(function (err) {
			if (err) {
				return next(err);
			} else {
				return res.redirect('/login');
			}
		});
	}
});

router.get('/forgetpass', function (req, res, next) {
	res.render("forget.ejs");
});

router.post('/forgetpass', function (req, res, next) {
	//console.log('req.body');
	//console.log(req.body);
	User.findOne({ email: req.body.email }, function (err, data) {
		console.log(data);
		if (!data) {
			res.send({ "Success": "This Email Is not regestered!" });
		} else {
			// res.send({"Success":"Success!"});
			if (req.body.password == req.body.passwordConf) {
				data.password = req.body.password;
				data.passwordConf = req.body.passwordConf;

				data.save(function (err, Person) {
					if (err)
						console.log(err);
					else
						console.log('Success');
					res.send({ "Success": "Password changed!" });
				});
			} else {
				res.send({ "Success": "Password does not matched! Both Password should be same." });
			}
		}
	});

});

router.get('/userlist', function (req, res, next) {
	User.find().exec((err, users) => {
		if (err) {
			res.json(err)
		} else {
			console.log('users data - ' + users)
			res.render('User.ejs', {
				users: users
			})
		}
	})
});

router.get('/movielist', function (req, res, next) {
	Movie.find().exec((err, movie) => {
		if (err) {
			res.json(err)
		} else {
			console.log('movie data - ' + movie)
			res.render('MovieList.ejs', {
				movieList: movie
			})
		}
	})
});

router.get('/movie', function (req, res, next) {
	return res.render('Movie.ejs');
});

router.get('/seats/:id', function (req, res, next) {
	const id = req.params.id;
	// console.log('Seats id : '+ id)
	Movie.findById(id, function(err, seats){
		if(err){
			res.json(err);
		}else{
			if(seats == null){
				res.redirect('/booking/id');
			}
			else{
				console.log("seats booking " + seats)
			res.render('Seat.ejs', {
				seatbooking : seats
			})
			}			
		}
	})
});

router.get('/booking/:id',function (req, res, next) {
	const id = req.params.id;
	console.log('Booking id : '+ id)
	Movie.findById(id, function(err, Bmovie){
		if(err){
			res.json(err);
		}else{
			if(Bmovie == null){
				res.redirect('/profile');
			}
			else{
				console.log("movie booking " + Bmovie)
			res.render('Booking.ejs', {
				moviebooking : Bmovie
			})
			}
		}
	})
});

router.get('/checkout/:id', function (req, res, next) {
	const id = req.params.id;
	console.log('Seats id : '+ id)
	Movie.findById(id, function(err, seats){
		if(err){
			res.json(err);
		}else{
			if(seats == null){
				res.redirect('/booking/id');
			}
			else{
				console.log("seats booking " + seats)
			res.render('Seat.ejs', {
				seatbooking : seats
			})
			}			
		}
	})
});

router.get('/payment/:id', function (req, res, next) {
	let id = req.params.id;
	Movie.findById(id, function(err, payment){
		if(err){
			res.json(err);
		}else{
			if(payment == null){
				res.redirect('/seats/id');
			}
			else{
				console.log("payment Movies - " + payment)
			res.render('Payment.ejs', {
				payment : payment
			})
			}			
		}
	})
});	

router.get('/movieedit/:id', function (req, res, next) {
	const id = req.params.id;
	console.log('editmovie id : '+ id)
	Movie.findById(id, function(err, editmovie){
		if(err){
			res.json(err);
		}else{
			if(editmovie == null){
				res.redirect('/movielist');
			}
			else{
				console.log("Edit Movies - " + editmovie)
			res.render('EditMovie.ejs', {
				editmovie : editmovie
			})
			}			
		}
	})
});

router.post('/updatemovie/:id', upload, function (req, res) {
	let id = req.params.id;
	let new_image = "";
	console.log('update movie first log')
	if(req.file){
		new_image = req.file.filename;
		try{
			fs.unlinkSync("./uploads/" + req.body.old_image);
		}
		catch(err){
			console.log(err);
		}
	}else{
		new_image = req.body.old_image;
	}
	console.log('new Image - ' + new_image)

	Movie.findByIdAndUpdate(id, {
		Mname : req.body.Mname,
		directedBy : req.body.direct,
		genere : req.body.genere,
		date : req.body.date,
		image : new_image
	}, (err , result)=>{
		if(err){
			res.json(err)
		}else{
			console.log('update movie - '+ result)
			req.session.message = {
				type: 'success',
				message : 'Movie Updated Succesfully'
			};
			res.redirect('/profile');
		}
	})
});


router.get('/moviedelete/:id', function(req,res){
	let id = req.params.id;
	Movie.findByIdAndRemove(id, (err, result)=>{
		if(result.image != ''){
			try{
				fs.unlinkSync('./uploads/'+ result.image);
			}
			catch(err){
				console.log(err);
			}
		}

		if(err){
			res.json({message : err.message});
		}else{
			req.session.message = {
				type : 'success',
				message : 'Movie Deleted Successfully!'
			}
			res.redirect('/profile')
		}
	})
});


router.get('/delete/:id', function(req,res){
	let id = req.params.id;
	User.findByIdAndRemove(id, (err, result)=>{
		if(err){
			res.json({message : err.message});
		}else{
			req.session.message = {
				type : 'success',
				message : 'User Deleted Successfully!'
			}
			res.redirect('/userlist')
		}
	})
});

router.post('/bookSeat/:id', (req,res)=>{
	 let id = req.params.id;
	const seats = new Seat({
		movieId : id,
		moviename : req.body.allNameVals,
		totalseat : '120',
		selected : req.body.allNumberVals,
		seats:req.body.allSeatsVals,
		price : req.body.PriceMovie
	});

	console.log(req.body)
	
	seats.save((err)=>{
		if(err){
			console.log(err)
			res.json({message : err.message , type: 'danger'})
		}else{
			res.redirect('/payment')
		}
	})
});

router.get('/bill/:id',upload, function (req, res, next) {
	let id = req.params.id;
	
	Seat.findOne({id : req.body.movieId}, function(err, mv){
		if(err){
			res.json(err);
		}else{
			console.log('Bill details ' + mv)
			if(mv == null){
				res.redirect('/payment/id');
			}
			else{
				console.log("mv booking " + mv)
			res.render('bill.ejs', {
				mv : mv
			})
			}			
		}
	});
});


module.exports = router;