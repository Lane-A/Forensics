var uuidv5 = require('uuidv5');

var sha256 = require('sha256');

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