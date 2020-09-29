var uuidv5 = require('uuidv5');
import * as TSInMemDb from "ts-in-memory-database"
var sha256 = require('sha256');
var { DateTime } = require("luxon");
/*
var temp = uuidv5('d9b2d63d-a233-4123-847a-76838bf2413a', 'Christopher');
console.log(temp);

var tempdata = 
[
  {
    username: "a",
    password: "b",
    last_access: "c"
  }
];

tempdata[0].username = "77";

console.log(tempdata);

var temp = uuidv5('d9b2d63d-a233-4123-847a-76838bf2413a', 'Peyton');
console.log(temp);

console.log()
*/
var data = 1522831467;
var formatting = "";
var time = DateTime.fromSeconds(parseInt(data), { zone: "America/Chicago"});
var temp = String(time.toISO())
if (temp.indexOf("-05:00") != -1){
    time = time.plus({hours: -1});
}
var time = time.toISO();
formatting = String(time).substring(0, (String(time).length -10)) + "-0600";
data[t].last_access = formatting;
console.log(formatting);