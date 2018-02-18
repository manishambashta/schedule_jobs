use strict;

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
		  name: this.faker.name.findName(),
		  email: this.faker.internet.email(),
		  address: this.faker.address.streetAddress(),
		};

		return user;
	}
	get employeeData(){

		var employee = {
		  name: this.faker.name.findName(),
		  employeeId: this.faker.random.uuid(),
		  salary: this.faker.finance.amount(),
		  currency: this.faker.finance.currencyName(),
		};

		return employee;
	}
	get studentData(){

		var student = {
		  name: this.faker.name.findName(),
		  studentId: this.faker.random.uuid(),
		  email: this.faker.internet.email(),
		  course: this.faker.lorem.name(),
		};

		return student;
	}




}

var jobs=new ScheduleJobs();
console.log(jobs.userData);