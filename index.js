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
		  id: this.faker.random.uuid(),
		  name: this.faker.name.findName(),
		  email: this.faker.internet.email(),
		  address: this.faker.address.streetAddress(),
		};

		return user;
	}
	get employeeData(){

		var employee = {
		  id: this.faker.random.uuid(),
		  name: this.faker.name.findName(),
		  salary: this.faker.finance.amount(),
		  currency: this.faker.finance.currencyName(),
		};

		return employee;
	}
	get studentData(){

		var student = {
		  id: this.faker.random.uuid(),
		  name: this.faker.name.findName(),
		  email: this.faker.internet.email(),
		  course: this.faker.lorem.word(),
		};

		return student;
	}




}

var jobs=new ScheduleJobs();
console.log(jobs.userData);
console.log(jobs.employeeData);
console.log(jobs.studentData);