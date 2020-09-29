const csv = require('csv-parser');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const readline = require('readline');
var uuidv5 = require('uuidv5');
var sha256 = require('sha256');
var stream = require('stream');
const { DateTime } = require("luxon");
var LineByLineReader = require('line-by-line');
const { buffer } = require('d3');
lr = new LineByLineReader('dictionary.txt');

const csvWriter = createCsvWriter({
    path: 'database_output.csv',
    header: [
      {id: 'username', title: 'username'},
      {id: 'password', title: 'password'},
      {id: 'last_access', title: 'last_access'},
    ]
  });

const readInterface2 = readline.createInterface({
    input: fs.createReadStream('names.txt'),
    console: false
});

    var start = () => { 
        ///////////////////////////////////////////////////////////////////////////////////////
        //fetch the initial data and store it into a workable object

        //initial variables
        var data = [];
        var n = [];
        var d = []; 

        //load dictionary and names into workable objects
        const data2 = fs.readFileSync('dictionary.txt', 'UTF-8');
        const lines = data2.split(/\r?\n/);
        readInterface2.on('line', function(line) {
           n.push(line);
        });

        fs.createReadStream('database_dump.csv')
        .pipe(csv())
        .on('data', (row) => {
            var tempdata = {
                username: `${row["username"]}`,
                password: `${row["password"]}`,
                last_access: `${row["last_access"]}`
            }
         data.push(tempdata);
         //#####################################################################################
         })
        .on('end', () => {
            d = lines;
            console.log("Data successfully recieved");
        ///////////////////////////////////////////////////////////////////////////////////////
        //manipulate the data
        for(var t = 0; t < data.length; t++){
            //dictionary attack
            for (var i = 0; i < d.length; i++){
                if (String(uuidv5('d9b2d63d-a233-4123-847a-76838bf2413a', d[i])) === String(data[t].username)){
                    data[t].username = d[i];   
                }
                if (String(sha256(d[i])).toUpperCase() === String(data[t].password)){
                    data[t].password = d[i];   
                }
            }
            //names attack
            for (var k = 0; k < n.length; k++){
                if (String(uuidv5('d9b2d63d-a233-4123-847a-76838bf2413a', n[k])) === String(data[t].username)){
                    data[t].username = n[k];   
                }
                if (String(sha256(n[k])).toUpperCase() === String(data[t].password)){
                    data[t].password = n[k];   
                }
            }
        }
        //////////////////////////////////////////////////////////////////////////////////////
        //time converter
        for (var t = 0; t < data.length; t++){
            var formatting = "";
            var time = DateTime.fromSeconds(parseInt(data[t].last_access), { zone: "America/Chicago"});
            var temp = String(time.toISO())
            if (temp.indexOf("-05:00") != -1){
                time = time.plus({hours: -1});
            }
            var time = time.toISO();
            formatting = String(time).substring(0, (String(time).length -10)) + "-0600";
            data[t].last_access = formatting;
        }

        //#####################################################################################



        ///////////////////////////////////////////////////////////////////////////////////////
        //output the data
            csvWriter
            .writeRecords(data)
            .then(()=> { 
                console.log('The CSV file was written successfully')});
        });
        //#####################################################################################
    }

   start();
