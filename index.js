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
		var http = require('http'),fs = require('fs'),ejs=require('ejs'),thisobj = this;
		return http.createServer(async function(req,res){
			res.writeHead(200,{'Content-type':'text/html'});
			// read from mongodb and parse the result into html and then send html
			// var jobs = new ScheduleJobs();
			console.log("trying to get data from mongodb");
			var [users,employees,students] = await Promise.all([thisobj.fetchDocuments("users"),thisobj.fetchDocuments("employees"),thisobj.fetchDocuments("students")])
			// var users = await thisobj.fetchDocuments("users");
			// var employees = await thisobj.fetchDocuments("employees");
			// var students = await thisobj.fetchDocuments("students");
			ejs.renderFile('index.html',{"users":users,"employees":employees,"students":students},"",function(err,html){
				res.end(html);
			})
			// res.end(fs.readFileSync(__dirname + '/index.html'));
		}).listen(8080, function() {
			console.log('Listening at: http://localhost:8080');
		});
	}

	// listenServer(socketio){
	// 	socketio.on('connection', function (socket) {
	// 	    socket.on('message', function (msg) {
	// 	        console.log('Message Received: ', msg);
	// 	        socket.broadcast.emit('message', msg);
	// 	    });
	// 	});		
	// }

	// emitMessage(socketio,message){
	// 	socketio.sockets.volatile.emit('user', {
	// 	  user: "manish",
	// 	  text: "some text"
	// 	});
	// }

	initServer(){
		this.server = this.createServer();
		this.socketio = require('socket.io').listen(this.server);
		// this.listenServer(this.socketio);		
	}

	// var array = [users,employees,students].promise.all({})

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
	
	dbDisconnect(db,collectionName,result,socketio){
		// if(result.insertedCount>0){
			console.log(result["ops"][0]);
			socketio.sockets.volatile.emit(collectionName, result["ops"][0]);
		// }

		console.log(result);
		console.log("at the end of method dbDisconnect");
		// db.close(); not working throwing error as no close method for db / need to check
	}

	insertDocuments(collectionName,singleDocument,socketio,callback){
		console.log("trying to connect");
		this.dbConnect(function(db){
			console.log("in db connect callback function");
			var collection = db.collection(collectionName);
			collection.insert(singleDocument,{w:1},function(err, result) {
			    console.log("Inserted 1 document into "+collectionName+" collection");
		  		callback(db,collectionName,result,socketio);
			  });
		});
	}

}

var jobs=new ScheduleJobs();
jobs.initServer();
// console.log(jobs.fetchDocuments());

var cron = require('node-cron');

cron.schedule('*/1 * * * *', function(){
  	console.log('running a task every 1 minute');
  	// console.log('running a task every minute at 13');
	jobs.insertDocuments("users",jobs.userData,jobs.socketio,jobs.dbDisconnect);

});

cron.schedule('*/2 * * * *', function(){
  	console.log('running a task every 2 minutes');
  	// console.log('running a task every minute at 37');
	jobs.insertDocuments("employees",jobs.employeeData,jobs.socketio,jobs.dbDisconnect);
});

cron.schedule('*/3 * * * *', function(){
  	console.log('running a task every 3 minutes');
  	// console.log('running a task every minute at 59');
	jobs.insertDocuments("students",jobs.studentData,jobs.socketio,jobs.dbDisconnect);
});

