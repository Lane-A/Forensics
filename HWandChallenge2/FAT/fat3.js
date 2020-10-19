const fs = require('fs');


var file = fs.createWriteStream('outputPT3.txt');
var info = [];
var hex = [];
var Megapointer = 549376;
var currCluster = 4;

            ///obtain drive data
           var data = fs.readFileSync('FAT_FS.iso', 'hex');

            ///////work with the data
            var i = 0;
            while (i < 548864){
                hex.push(data.slice(i, i + 2).toLocaleUpperCase());
                i = i + 2;
            }

            ///number of partitions
            //bytes per sector
            var bps = parseInt("0x" + hex[12] + hex[11]);

            //size of reserved area in the reserved area.
            var sra = parseInt("0x" + hex[15] + hex[14]);

            //start address of 1st FAT
            var ffat = sra;

            //start looking for the file
            var tempPointer = 0;
            //counter for finding the the ending cluster address of the file


            tempPointer = 0;
            
            Megapointer = ffat * bps;

            var save = [];

            var eof = false;
            tempPointer = 4 * currCluster;
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

