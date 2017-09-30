//var fortune = require('../lib/fortune.js');
var expect = require('chai').expect;
var assert = require('chai').assert;

//var cheese = 'cheese';
var cheese = 3;

suite('Fortune cookie tests', function(){
    //test('getFortune() should return a fortune', function(){
    //    expect(typeof fortune.getFortune() === 'string');

    test('hard code success test, check defined variable is string', function(){
	//expect(typeof cheese === 'string');
	assert.typeOf(cheese, 'string', 'cheese is a string'); // with optional message

    });
});
