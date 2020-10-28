use std::io::Read;
use std::fs::File;
use std::io;
use std::io::prelude::*;

fn write_out(f: &str, d:std::vec::Vec<std::string::String>) -> io::Result<()> {
    let mut out = File::create(f)?;
    for x in 0..d.len() {
        write!(out, "{}", d[x]).expect("Writing failed");
    }
    Ok(())
}

fn main() {

    const FILE_ISO :&str = "./Challenge_3_Corrupted.iso";

    let mut file: std::fs::File=File::open(FILE_ISO).unwrap();

    let size: u64 = file.metadata().unwrap().len();

    println!("Size: {}", size);

    let mut data = Vec::new();

    let mut buf=[0u8];


    for _x in 0..size {
        file.read(&mut buf).unwrap();
        let to_be_hexed = buf[0];
        let hexed = format!("{:X}", to_be_hexed);
        if hexed.eq("0"){
            data.push( String::from("00"));
        }
        else if hexed.eq("1"){
            data.push( String::from("01"));
        }
        else if hexed.eq("2"){
            data.push( String::from("02"));
        }
        else if hexed.eq("3"){
            data.push( String::from("03"));
        }
        else if hexed.eq("4"){
            data.push( String::from("04"));
        }
        else if hexed.eq("5"){
            data.push( String::from("05"));
        }
        else if hexed.eq("6"){
            data.push( String::from("06"));
        }
        else if hexed.eq("7"){
            data.push( String::from("07"));
        }
        else if hexed.eq("8"){
            data.push( String::from("08"));
        }
        else if hexed.eq("9"){
            data.push( String::from("09"));
        }
        else if hexed.eq("A"){
            data.push( String::from("0A"));
        }
        else if hexed.eq("B"){
            data.push( String::from("0B"));
        }
        else if hexed.eq("C"){
            data.push( String::from("0C"));
        }
        else if hexed.eq("D"){
            data.push( String::from("0D"));
        }
        else if hexed.eq("E"){
            data.push( String::from("0E"));
        }
        else if hexed.eq("F"){
            data.push( String::from("0F"));
        }
        else{
            data.push(hexed);
        }
    }

    println!("Finished Loading File...");

    let bps = format!("{}{}", data[12], data[11]);
    let bps_final = u32::from_str_radix(&bps, 16).unwrap();
    println!("BPS: {}", bps_final);
    //bytes per sector

    //sectors per cluster
    let spc = format!("{}", data[13]);
    let spc_final = u32::from_str_radix(&spc, 16).unwrap();
    println!("SPC: {}", spc_final);

    //size of reserved area in the reserved area.
    let sra = format!("{}{}", data[15], data[14]);
    let sra_final = u32::from_str_radix(&sra, 16).unwrap();
    println!("Size of Sectors of the reserved area: {}", sra_final);

    //start address of 1st FAT
    let ffat_final = sra_final;
    println!("Start Address of 1st FAT: {}", ffat_final);

    //# of fats
    let nof = format!("{}", data[16]);
    let nof_final = u32::from_str_radix(&nof, 16).unwrap();
    println!("# Of FATS: {}", nof_final);


    //Sectors/FAT
    let spf = format!("{}{}{}{}", data[39], data[38], data[37], data[36]);
    let spf_final = u32::from_str_radix(&spf, 16).unwrap();
    println!("Sectors per FAT: {}", spf_final);

    //Starting clustor of root directory
    let caord = format!("{}{}{}{}", data[47], data[46], data[45], data[44]);
    let caord_final = u32::from_str_radix(&caord, 16).unwrap();
    println!("Cluster Address Of Root Directory: {}", caord_final);

    //starting sector of the data section (2 fats plus reserved)
    let ssotds_final = spf_final * nof_final + sra_final;
    println!("Starting Sector of the data Section: {}", ssotds_final);

    //start looking for the file
    let mut mega_pointer: usize = ssotds_final as usize * bps_final as usize;
    println!("Megapointer: {}", mega_pointer);

    let temp_pointer = 0;
    println!("Temp Pointer: {}", temp_pointer);


    let mut pot_files = 0;
    //method 2
    while mega_pointer + 1024 < size as usize {

    //if beginning of file
        let temp = format!("{}{}{}", data[mega_pointer + 0], data[mega_pointer + 1], data[mega_pointer + 2]);

        
        if temp.eq("FFD8FF"){
            //found beginning of file
            println!("Found start of a file");
            let mut found_a_file = false;
            let mut p_file: std::vec::Vec<std::string::String> = Vec::new();
            let mut first_pass = true;
            while !found_a_file {
                // check if at EOF
                if format!("{}{}{}{}{}{}{}{}", data[mega_pointer], data[mega_pointer + 1], data[mega_pointer + 2], data[mega_pointer + 3], data[mega_pointer + 4], data[mega_pointer + 5], data[mega_pointer + 6], data[mega_pointer + 7]).eq("FFD9000000000000"){
                    p_file.push(format!("{}", data[mega_pointer + 0]));
                    p_file.push(format!("{}", data[mega_pointer + 1]));
                    pot_files += 1;
                    
                    let s: &str = &pot_files.to_string() as &str;

                    write_out(s, p_file);
                    //write jpeg
                    println!("Found end of a file");
                    //set mega pointer to nect 512 set
                    found_a_file = true;
                    p_file = Vec::new();

                    //get to next file starting location
                    let mut found_next_spot = false;
                    while !found_next_spot {
                        if format!("{}{}{}", data[mega_pointer], data[mega_pointer + 1], data[mega_pointer + 2]).eq("FFD8FF"){
                            mega_pointer = mega_pointer - 512;
                            found_next_spot = true;
                        }
                        else if mega_pointer + 1024 > size as usize {
                            found_next_spot = true;
                        }
                        else{
                            mega_pointer = mega_pointer + 1;
                        }
                    }
                    println!("at currently{}", mega_pointer);
                }
                //check for if found a new file
                else if format!("{}{}{}", data[mega_pointer], data[mega_pointer + 1], data[mega_pointer + 2]).eq("FFD8FF"){
                    if first_pass {
                        first_pass = false;
                        p_file.push(format!("{}", data[mega_pointer + 0]));
                         mega_pointer = mega_pointer + 1;
                    }
                    else{
                        if mega_pointer % 512 == 0 {
                            //basically ignore the file that was to be written and acta s if the file header was just found
                            p_file = Vec::new();
                            first_pass = true;
                        }
                        else{
                            p_file.push(format!("{}", data[mega_pointer + 0]));
                            mega_pointer = mega_pointer + 1;
                        }
                    }

                }
                else{
                    p_file.push(format!("{}", data[mega_pointer + 0]));
                    mega_pointer = mega_pointer + 1;


                }
            }
        }

         //go till eof or new start of new file

        //if found proper end of file
        //write jpeg

            //set mega pointer to next logical 512 jump


        //else jump 512
        mega_pointer += 512;
    }
    println!("Potential files: {}", pot_files);
}
