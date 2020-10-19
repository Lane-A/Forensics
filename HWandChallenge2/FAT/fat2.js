const fs = require('fs');


var file = fs.createWriteStream('outputPT2.txt');
var info = [];
var hex = [];
var Megapointer = 549376;

            ///obtain drive data
           var data = fs.readFileSync('FAT_FS.iso', 'hex');

            ///////work with the data
            var i = 0;
            while (i < data.length){
                hex.push(data.slice(i, i + 2).toLocaleUpperCase());
                i = i + 2;
            }

            ///number of partitions
            //bytes per sector
            var bps = parseInt("0x" + hex[12] + hex[11]);

            //sectors per cluster
            var spc = parseInt("0x" + hex[13]);

            //size of reserved area in the reserved area.
            var sra = parseInt("0x" + hex[15] + hex[14]);

            //start address of 1st FAT
            var ffat = sra;

            //# of fats
            var nof =  parseInt("0x" + hex[16]);


            //Sectors/FAT
            var spf = parseInt("0x" + hex[39] + hex[38] + hex[37] + hex[36]);

            //Starting clustor of root directory
            var caord = parseInt("0x" + hex[47] + hex[46] + hex[45] + hex[44]);

            //starting sector of the data section (2 fats plus reserved)
            var ssotds = spf*nof + sra;

            //start looking for the file
            var tempPointer = 0;
            //counter for finding the the ending cluster address of the file

            var foundFile = false;

            tempPointer = 0;
           

            //find start of file
            while(!foundFile){
                if (hex[Megapointer + tempPointer + 11] == "0F"){
                    tempPointer = tempPointer + 32;
                }
                else if(hex[Megapointer + tempPointer + 11] == "10"){
                    tempPointer = tempPointer + 32;
                    
                }
                else{
                    var string = ""
                    for (var i = 0; i < 11; i++){
                        if (hex[Megapointer + tempPointer + i] == "20"){
                            //skip
                        }
                        else{
                            string = string + String.fromCharCode(parseInt("0x" + hex[Megapointer + tempPointer + i]));
                            console.log(string);
                        }
                    }
                    if (string == "HOMEWORKJPG"){
                        console.log("File found")
                        foundFile = true;
                        var nextCluster = parseInt("0x" + hex[Megapointer + tempPointer + 21]
                        + hex[Megapointer + tempPointer + 20]
                        + hex[Megapointer + tempPointer + 27]
                        + hex[Megapointer + tempPointer + 26]);
                        console.log(nextCluster);

                        var sof = parseInt("0x" + hex[Megapointer + tempPointer + 31] 
                        + hex[Megapointer + tempPointer + 30]
                        + hex[Megapointer + tempPointer + 29]
                        + hex[Megapointer + tempPointer + 28] );

                        info.push("Size of file = " + sof);
                        tempPointer = nextCluster;
                        info.push("Curr Cluster of file in fat: " + nextCluster);
                        //find the cluster where the file is at and change mega pointer
                    }
                    
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

