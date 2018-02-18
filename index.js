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
	
	dbDisconnect(db,result){
		console.log(result);
		console.log("at the end of method dbDisconnect");
		// db.close(); not working throwing error as no close method for db / need to check
	}

	insertDocuments(collectionName,singleDocument,callback){
		console.log("trying to connect");
		this.dbConnect(function(db){
			console.log("in db connect callback function");
			var collection = db.collection(collectionName);
			collection.insert(singleDocument,{w:1},function(err, result) {
			    console.log("Inserted 1 document into "+collectionName+" collection");
			    // console.log(result);
		  		callback(db,result);
			  });
		});
	}

}

var cron = require('node-cron');

cron.schedule('*/1 * * * *', function(){
	var jobs=new ScheduleJobs();
  	console.log('running a task every minute at 13');
	jobs.insertDocuments("users",jobs.userData,jobs.dbDisconnect)

});

cron.schedule('*/2 * * * *', function(){
	var jobs=new ScheduleJobs();
  	console.log('running a task every minute at 37');
	jobs.insertDocuments("employees",jobs.employeeData,jobs.dbDisconnect)
});

cron.schedule('*/3 * * * *', function(){
	var jobs=new ScheduleJobs();
  	console.log('running a task every minute at 59');
	jobs.insertDocuments("students",jobs.studentData,jobs.dbDisconnect)
});
