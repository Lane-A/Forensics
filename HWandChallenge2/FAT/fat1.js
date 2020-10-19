const fs = require('fs');


var file = fs.createWriteStream('outputPT1.txt');
var info = [];
var hex = [];

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
            info.push("Bytes/Sector: " + bps);

            //sectors per cluster
            var spc = parseInt("0x" + hex[13]);
            info.push("Sectors/Cluster: " + spc);

            //size of reserved area in the reserved area.
            var sra = parseInt("0x" + hex[15] + hex[14]);
            info.push("Size of Sectors of the reserved area: " + sra);

            //start address of 1st FAT
            var ffat = sra;
            info.push("Start Address of 1st FAT: " + ffat);

            //# of fats
            var nof =  parseInt("0x" + hex[16]);
            info.push("# of FATS: " + nof);


            //Sectors/FAT
            var spf = parseInt("0x" + hex[39] + hex[38] + hex[37] + hex[36]);
            info.push("Sectors/FAT: " + spf);

            //Starting clustor of root directory
            var caord = parseInt("0x" + hex[47] + hex[46] + hex[45] + hex[44]);
            info.push("Cluster Address of Root Directory: " + caord);

            //starting sector of the data section (2 fats plus reserved)
            var ssotds = spf*nof + sra;
            info.push("Starting Sector Address of the Data Section: " + ssotds);

            //start looking for the file
            var Megapointer = ssotds*bps;
            var tempPointer = 0;
            //counter for finding the the ending cluster address of the file

            var foundFolder = false;

            tempPointer = 0;
            while(!foundFolder){
                if (hex[Megapointer + tempPointer + 11] == "0F"){
                    tempPointer = tempPointer + 32;
                }
                else if(hex[Megapointer + tempPointer + 11] == "10"){

                    //test if correct direstory

                    var string = ""
                    for (var i = 0; i < 11; i++){
                        if (hex[Megapointer + tempPointer + i] == "20"){
                            //skip
                        }
                        else{
                            string = string + String.fromCharCode(parseInt("0x" + hex[Megapointer + tempPointer + i]));
                        }
                    }
                    if (string == "PHOTOS"){
                        console.log("Directory found")
                        foundFolder = true;
                        var nextCluster = parseInt("0x" + hex[Megapointer + tempPointer + 21]
                        + hex[Megapointer + tempPointer + 20]
                        + hex[Megapointer + tempPointer + 27]
                        + hex[Megapointer + tempPointer + 26]) - 2;
                        console.log(nextCluster);
                        Megapointer = Megapointer + bps*nextCluster;
                        //find the cluster where the file is at and change mega pointer
                    }

                    
                }
                else{
                    tempPointer = tempPointer + 32;
                }

            }

            info.push("Curr Megapointer: " + Megapointer);
            tempPointer = 0;
            /*

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
                        + hex[Megapointer + tempPointer + 26]) - 2;
                        console.log(nextCluster);

                        var sof = parseInt("0x" + hex[Megapointer + tempPointer + 31] 
                        + hex[Megapointer + tempPointer + 30]
                        + hex[Megapointer + tempPointer + 29]
                        + hex[Megapointer + tempPointer + 28] );

                        info.push("Size of file = " + sof);
                        tempPointer = nextCluster;
                        //find the cluster where the file is at and change mega pointer
                    }
                    
                }


            }
            */

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

