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



let pt = new Map();

var file = fs.createWriteStream('output.txt');


fs.createReadStream('mbr_partition_types (1).csv')
        .pipe(csv())
        .on('data', (row) => {
            var tempdata = {
                code: `${row["code"]}`,
                description: `${row["description"]}`,
            }
         pt.set(tempdata.code, tempdata.description);
         //#####################################################################################
         })
        .on('end', () => {
            ///obtain drive data
            console.log("Data successfully recieved");
            fs.readFile('mbr_dump (1).iso', 'hex', function (err,data) {
                if (err) {
                  return console.log(err);
                }
                ///////work with the data
                var hex = [];
                var length = data.length;
                var i = 0;
                while (i < length){
                    hex.push(data.slice(i, i + 2).toLocaleUpperCase());
                    i = i + 2;
                }


                ///number of partitions
                

                console.log(pt);
                var info = [];
                info.push("0");

                var startingTE = 430
                for ( i = 0; i < 4; i++){
                    startingTE = startingTE + 16;
                    info.push("Partition " + (i+1) + " Details:" );
                    console.log(hex[startingTE + 4]);
                    info.push("     Partition Type: " + pt.get(hex[startingTE + 4]))
                    if (hex[startingTE + 4] != "00"){
                        info[0] = parseInt(info[0]) + 1;
                        //get LBA ADDRESS
                        var toHex = "0x";
                        //little endian
                        toHex = toHex + hex[startingTE + 11] + hex[startingTE + 10] + hex[startingTE + 9] + hex[startingTE + 8];
                        info.push("     Partition Address (LBA) : " + parseInt(toHex));
                        toHex = "0x";
                        toHex = toHex + hex[startingTE + 15] + hex[startingTE + 14] + hex[startingTE + 13] + hex[startingTE + 12];
                        info.push("     Number of Sectors in Partition: " + parseInt(toHex));
                    }


                }
                info[0] = "Number of partitions: " + info[0];
                console.log(info);
                //write output file
                file.on('error', function(err) { /* error handling */ });
                info.forEach(function(v) { file.write(v + '\n'); });
                file.end();
                
              });



        });

