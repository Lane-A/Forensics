const fs = require('fs');


var file = fs.createWriteStream('outputPT3.txt');
var info = [];
var hex = [];
var Megapointer = 62505856;
var currCluster = 4;

            ///obtain drive data
           var data = fs.readFileSync('challenge _2_dump.iso', 'hex');

            ///////work with the data
            var i = 0;
            while (i < data.length){
                hex.push(data.slice(i, i + 2).toLocaleUpperCase());
                i = i + 2;
            }


            //start looking for the file
            var tempPointer = 0;
            //counter for finding the the ending cluster address of the file


            tempPointer = 0;
        

            var save = [];

            var eof = false;
            tempPointer = 4 * 18;
            while(!eof){

                if (hex[Megapointer + tempPointer + 3] + hex[Megapointer + tempPointer + 2] + 
                    hex[Megapointer + tempPointer + 1] + hex[Megapointer + tempPointer] == "0FFFFFFF"){
                        eof = true;
                        info.push("End Cluster Address of File: " + ((tempPointer/4) + 1));
                    }
                    else{
                        save.push(hex[Megapointer + tempPointer + 3] + hex[Megapointer + tempPointer + 2] + 
                            hex[Megapointer + tempPointer + 1] + hex[Megapointer + tempPointer]);
                        tempPointer = 4 * parseInt("0x" + hex[Megapointer + tempPointer + 3] + hex[Megapointer + tempPointer + 2] + hex[Megapointer + tempPointer + 1] + hex[Megapointer + tempPointer]);

                    }


            }
            

            //found file, go to fat and get end of file cluster location

            //traverse and save file and report end of file
            //check for long file name "0F" at 11 from poiner skip 32
            //10 is directory


            //20 & 21 are high bytes
            //26 & 27 are low bytes
            //21 20 27 26

            //11 is flag

            //0FFFFFFF = eof

            //askii in hex

            //file size is 28-31 LE of file line

            //4hex pairs per entry
            console.log(info);
            //write output file
            
            file.on('error', function(err) { /* error handling */ });
            info.forEach(function(v) { file.write(v + '\n'); });
            file.end();

