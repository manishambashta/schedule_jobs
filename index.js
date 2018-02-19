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

		var user = {
		  uid: this.faker.random.uuid(),
		  name: this.faker.name.findName(),
		  email: this.faker.internet.email(),
		  address: this.faker.address.streetAddress(),
		};

		return user;
	}
	get employeeData(){

		var employee = {
		  uid: this.faker.random.uuid(),
		  name: this.faker.name.findName(),
		  salary: this.faker.finance.amount(),
		  currency: this.faker.finance.currencyName(),
		};

		return employee;
	}
	get studentData(){

		var student = {
		  uid: this.faker.random.uuid(),
		  name: this.faker.name.findName(),
		  email: this.faker.internet.email(),
		  course: this.faker.lorem.word(),
		};

		return student;
	}

	createServer(){
		// load required modules, http =>server, ejs =>to combine data and template to generate html, take a reference to this for use in callback functions
		var http = require('http'),ejs=require('ejs'),self = this;

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
		});
	}


	initServer(){
		this.server = this.createServer();
		this.socketio = require('socket.io').listen(this.server);
		// this.listenServer(this.socketio);		
	}

	async fetchDocuments(collectionName){
		return new Promise((resolve, reject)=>{
			this.dbConnect(function(db){
				console.log("inside db connect method for fetching docs");
				var assert = require('assert');
				// callback(db.collection(collectionName).find().toArray());
				db.collection(collectionName).find().toArray(function(err,items){
					resolve(items);
				});
			});

		});
		// console.log("fetch documents from mongodb");
	}


	dbConnect(callback){
		var assert = require('assert');
		this.MongoClient = require('mongodb').MongoClient;
		this.uri = 'mongodb://localhost:27017';
		this.MongoClient.connect(this.uri, function(err, client) {
			assert.equal(null, err);
		  	console.log("Connected successfully to server");
		  	const db = client.db("scheduleJobs");
		  	callback(db);		 		 
		  // console.log(db);
		  // client.close();
		});

	}
	
	emitData(db,collectionName,result,socketio){
		// if(result.insertedCount>0){
			console.log(result["ops"][0]);
			socketio.sockets.volatile.emit(collectionName, result["ops"][0]);
		// }

		console.log(result);
		console.log("at the end of method emitData");
		// db.close(); not working throwing error as no close method for db / need to check
	}

	insertDocuments(collectionName,singleDocument,socketio,callback){
		console.log("connecting to db ...");
		this.dbConnect(function(db){
			console.log("successfully connected to mongodb");
			var collection = db.collection(collectionName);
			collection.insert(singleDocument,{w:1},function(err, result) {
			    console.log("-- Inserted 1 document into "+collectionName+" collection --");
		  		callback(db,collectionName,result,socketio);
			  });
		});
	}

}

var jobs=new ScheduleJobs();
jobs.initServer();

var cron = require('node-cron');

cron.schedule('*/1 * * * *', function(){
  	console.log('running a task every 1 minute');
  	// console.log('running a task every minute at 13');
	jobs.insertDocuments("users",jobs.userData,jobs.socketio,jobs.emitData);

});

cron.schedule('*/2 * * * *', function(){
  	console.log('running a task every 2 minutes');
  	// console.log('running a task every minute at 37');
	jobs.insertDocuments("employees",jobs.employeeData,jobs.socketio,jobs.emitData);
});

cron.schedule('*/3 * * * *', function(){
  	console.log('running a task every 3 minutes');
  	// console.log('running a task every minute at 59');
	jobs.insertDocuments("students",jobs.studentData,jobs.socketio,jobs.emitData);
});

