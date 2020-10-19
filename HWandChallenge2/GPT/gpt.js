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


fs.createReadStream('gpt_partition_guids (1).csv')
        .pipe(csv())
        .on('data', (row) => {
            var tempdata = {
                guid: `${row["guid"]}`,
                category: `${row["category"]}`,
                type: `${row["partition_type"]}`,
            }
            tempdata.guid = tempdata.guid.replace('-', '');
            tempdata.guid = tempdata.guid.replace('-', '');
            tempdata.guid = tempdata.guid.replace('-', '');
            tempdata.guid = tempdata.guid.replace('-', '');
         pt.set(tempdata.guid, tempdata.category + " - " + '"' + tempdata.type + '"');
         //#####################################################################################
         })
        .on('end', () => {
            ///obtain drive data
            fs.readFile('gpt_dump (1).iso', 'hex', function (err,data) {
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
                var info = [];
                info.push("0");
                var startingTE = 512;
                var lenOfEntrys = (parseInt("0x" + hex[startingTE + 87] + hex[startingTE + 86] + hex[startingTE + 85] + hex[startingTE + 84]));
                startingTE = 1024;
                while ( startingTE < hex.length){
                    info.push("Partition " + (parseInt(info[0])+1) + " Details:" );
                    //get unicode name (in little endian)
                    var uni = ""
                    for (var y = 56; y < 128; y+=2){
                        if (hex[startingTE + y] == "00" && hex[startingTE + y + 1] == "00"){
                            y = 129;
                        }
                        else{
                            uni = uni + String.fromCharCode(parseInt("0x" + hex[startingTE + y + 1] + hex[startingTE + y] ))
                        }
                    }
                    info.push("     Partition Name: " + uni);

                    var id = hex[startingTE + 3] + hex[startingTE + 2] + hex[startingTE + 1] + hex[startingTE + 0] + hex[startingTE + 5] + hex[startingTE + 4] + hex[startingTE + 7] + 
                    hex[startingTE + 6] + hex[startingTE + 8] + hex[startingTE + 9] + hex[startingTE + 10] + hex[startingTE + 11] + hex[startingTE + 12] + hex[startingTE + 13] + 
                    hex[startingTE + 14] + hex[startingTE + 15];
                    info.push("     Partition GUID: " + id);

                    info.push("     Partition Type: " + pt.get(id));

                    info.push("     Partition Starting Address: " + parseInt("0x" + hex[startingTE + 39] + hex[startingTE + 38]+ hex[startingTE + 37]+ hex[startingTE + 36]+ hex[startingTE + 35]+ hex[startingTE + 34]+ hex[startingTE + 33]+ hex[startingTE + 32]))
                    info.push("     Partition Ending Address: " + parseInt("0x" + hex[startingTE + 47] + hex[startingTE + 46]+ hex[startingTE + 45]+ hex[startingTE + 44]+ hex[startingTE + 43]+ hex[startingTE + 42]+ hex[startingTE + 41]+ hex[startingTE + 40]))
                    info[0] = parseInt(info[0]) + 1;
                    startingTE= startingTE + lenOfEntrys;
                }
                info[0] = "Number of partitions: " + info[0];
                console.log(info);
                //write output file
                file.on('error', function(err) { /* error handling */ });
                info.forEach(function(v) { file.write(v + '\n'); });
                file.end();
                
              });



        });

