'use strict';
class ScheduleJobs{

	constructor(){
		// load faker library to generate 
		this.faker = require('faker');	
	}

	/*
	Generate random data of type user,employee and student.
	*/
	get userData(){

		let user = {
		  uid: this.faker.random.uuid(),
		  name: this.faker.name.findName(),
		  email: this.faker.internet.email(),
		  address: this.faker.address.streetAddress(),
		};

		return user;
	}
	get employeeData(){

		let employee = {
		  uid: this.faker.random.uuid(),
		  name: this.faker.name.findName(),
		  salary: this.faker.finance.amount(),
		  currency: this.faker.finance.currencyName(),
		};

		return employee;
	}
	get studentData(){

		let student = {
		  uid: this.faker.random.uuid(),
		  name: this.faker.name.findName(),
		  email: this.faker.internet.email(),
		  course: this.faker.lorem.word(),
		};

		return student;
	}

	logError(errorMessage){
		let fs = require("fs");
		fs.writeFile("error.log", errorMessage, function(err) {
		    if(err) {
		        return console.log("Error in logging error : " + err);
		    }
		}); 
	}

	// create a server to host index.html file
	createServer(){
		// load required modules, http =>server, ejs =>to combine data and template to generate html, take a reference to this for use in callback functions
		let http = require('http'),ejs=require('ejs'),self = this;

		console.log("creating an http server ....")
		// return a new instance of http.Server.
		return http.createServer(async function(req,res){
			// send a response header to the request, 
			res.writeHead(200,{'Content-type':'text/html'});
			
			// fetch data from database
			var [users,employees,students] = await Promise.all([self.fetchDocuments("users"),self.fetchDocuments("employees"),self.fetchDocuments("students")])

			// render index.html file using ejs to serve at http://localhost:8080
			ejs.renderFile('index.html',{"users":users,"employees":employees,"students":students},"",function(err,html){
				res.end(html);
			})

		}).listen(8080, function() {
			// server created and listening at 8080 port now
			console.log('Listening at: http://localhost:8080');
		}).on("error", function(e){
			console.log("Error while creating server : "+e);
		});
	}


	// connect to mongodb
	dbConnect(callback){
		this.MongoClient = require('mongodb').MongoClient;
		this.uri = 'mongodb://localhost:27017';
		this.MongoClient.connect(this.uri, function(err, client) {
			if(err){
				console.log("Error while connecting to db");
				callback(null);
			}
			else{
			  	console.log("Connected successfully to server");
			  	const db = client.db("scheduleJobs");
			  	callback(db);		 		 
			}
		});

	}
	
	// fetch documents from given collection in mongodb
	async fetchDocuments(collectionName){
		console.log("fetching documents from "+collectionName+" collection");
		return new Promise((resolve, reject)=>{
			this.dbConnect(function(db){
				if(db){
					db.collection(collectionName).find().sort({"_id":-1}).toArray(function(err,items){
						resolve(items);
					});
				}
				else{
					console.log("Error in dbConnect while fetching documents");
				}
			});

		});

	}


	// insert single document to given collection and emit inserted record using socket.io 
	insertDocuments(collectionName,singleDocument,socketio,callback){
		console.log("connecting to db ...");
		this.dbConnect(function(db){
			if(db){
				console.log("successfully connected to mongodb");
				let collection = db.collection(collectionName);
				collection.insert(singleDocument,{w:1},function(err, result) {
					if(err){
						console.log("Error while inserting document : "+err);
					}
					else{
					    console.log("-- Inserted 1 document into "+collectionName+" collection --");
				  		callback(db,collectionName,result,socketio);
					}
				  });
			}
			else{
				console.log("Error in dbConnect while inserting document");
			}
		});
	}

	// emit inserted record using socket.io to listening sockets as in client side 
	emitData(db,collectionName,result,socketio){
		if(result["insertedCount"]>0){
			console.log("emitting "+collectionName+" message using socketio ....");
			socketio.sockets.emit(collectionName, result["ops"][0]);
		}
		else{
			console.log("no data inserted");			
		}

		// console.log("close db connection after emitting message");
		// db.close(); //not working throwing error as no close method for db / need to check
	}

	// initialize HTTP server and initializing socket.io to listen at this server
	initServer(){
		this.server = this.createServer();
		this.server.on('error', function (e) {
		  // Handle your servererror here
		  console.log(e);
		});

		this.socketio = require('socket.io').listen(this.server);
	}

}

let jobs = new ScheduleJobs();
jobs.initServer();

let cron = require('node-cron');

cron.schedule('*/13 * * * * *', function(){
  	console.log('running a task every 13 seconds');
	jobs.insertDocuments("users",jobs.userData,jobs.socketio,jobs.emitData);

});

cron.schedule('*/37 * * * * *', function(){
  	console.log('running a task every 37 seconds');
	jobs.insertDocuments("employees",jobs.employeeData,jobs.socketio,jobs.emitData);
});

cron.schedule('*/59 * * * * *', function(){
  	console.log('running a task every 59 seconds');
	jobs.insertDocuments("students",jobs.studentData,jobs.socketio,jobs.emitData);
});

