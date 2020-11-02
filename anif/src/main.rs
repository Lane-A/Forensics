use std::io::Read;
use std::fs::File;
use std::io;
use std::io::prelude::*;
extern crate hex;
extern crate hex_d_hex;


fn write_out(f: &str, d:std::vec::Vec<std::string::String>) -> io::Result<()> {
    let mut out = File::create(f)?;
    for x in 0..d.len() {
        write!(out, "{}", d[x]).expect("Writing failed");
    }
    Ok(())
}


fn main() {

    const FILE_ISO :&str = "./FAT_Imposter.iso";

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

    //Starting sector of root directory
    let caord = format!("{}{}{}{}", data[47], data[46], data[45], data[44]);
    let caord_final = u32::from_str_radix(&caord, 16).unwrap();
    println!("Cluster Address Of Root Directory: {}", caord_final);

    //starting sector of the data section (2 fats plus reserved)
    let ssotds_final = spf_final * nof_final + sra_final;
    println!("Starting Sector of the data Section: {}", ssotds_final);

    //start looking for the file
    let mut mega_pointer: usize = ssotds_final as usize * bps_final as usize;
    //println!("Megapointer: {}", mega_pointer);


    let mut temp_pointer = 0;
    //println!("Temp Pointer: {}", temp_pointer);


    let mut original_mega_pointer = mega_pointer;
    //method 2

    let mut s_file : std::vec::Vec<usize> = Vec::new();

    //original mega pointer


    let mut cluster_address = 0;
    while mega_pointer + 1024 < size as usize {


        //write all data from cluster to cluster

    //if beginning of file
        let temp = format!("{}{}{}", data[mega_pointer + 0], data[mega_pointer + 1], data[mega_pointer + 2]);

        //Find all file starting locations and push them into a Vec

        //512 find if a file starting match

        //spc*bps "Cluster steps"

        //keep track of the steps takes = cluster address of that starting file + 2
        if temp.eq("FFD8FF"){
            //chack file type
            let super_temp = format!("{}{}{}{}", data[mega_pointer + 6], data[mega_pointer + 7], data[mega_pointer + 8], data[mega_pointer + 9]);
            if super_temp.eq("4A464946") {
                println!("FileType: JFIF");
                s_file.push(cluster_address + 2);
                println!("Starting CLuster Address: {}", (cluster_address + 2));
            }
            if super_temp.eq("58464946") {
                println!("Filetype: XFIF");
                s_file.push(cluster_address + 2);
                println!("Starting CLuster Address: {}", (cluster_address + 2));
            }
        }
        //jump 512
        mega_pointer += 512;
        cluster_address += 1;
    }
    println!("Cluster #s: {:?}", s_file);

    //set mega pointer to the beginning of the fat table
    mega_pointer = ffat_final as usize * bps_final as usize;















    for x in 0..s_file.len() {
        let mut cluster_things : std::vec::Vec<u32> = Vec::new();

        temp_pointer = 4 * (s_file[x]);
      //  println!("initial temp pointer: {}", temp_pointer);

        let mut eof = false;
        let mut first = true;
        let mut im_over_it = true;

        while !eof {

            
            if format!("{}{}{}{}", data[mega_pointer + temp_pointer + 3], data[mega_pointer + temp_pointer + 2], data[mega_pointer + temp_pointer + 1], data[mega_pointer + temp_pointer + 0]).eq("00000000") && first{
                        eof = true;
            }
            else{
                if format!("{}{}{}{}", data[mega_pointer + temp_pointer + 3], data[mega_pointer + temp_pointer + 2], data[mega_pointer + temp_pointer + 1], data[mega_pointer + temp_pointer + 0]).eq("0FFFFFFF") {
                    first = false;
                    eof = true;

                }
                else{
                    //save cluster #s
                    if im_over_it {
                        cluster_things.push(s_file[x] as u32);
                        im_over_it = false;
                    }
                    
                    cluster_things.push(u32::from_str_radix(&format!("{}{}{}{}", data[mega_pointer + temp_pointer + 3], data[mega_pointer + temp_pointer + 2],data[mega_pointer + temp_pointer + 1],data[mega_pointer + temp_pointer + 0]) , 16).unwrap() );
                  //  println!("Das next Cluster {}", u32::from_str_radix(&format!("{}{}{}{}", data[mega_pointer + temp_pointer + 3], data[mega_pointer + temp_pointer + 2],data[mega_pointer + temp_pointer + 1],data[mega_pointer + temp_pointer + 0]) , 16).unwrap());
                   // println!("Das hex {}", format!("{}{}{}{}", data[mega_pointer + temp_pointer + 3], data[mega_pointer + temp_pointer + 2],data[mega_pointer + temp_pointer + 1],data[mega_pointer + temp_pointer + 0]));

                    temp_pointer = 4 * u32::from_str_radix(&format!("{}{}{}{}", data[mega_pointer + temp_pointer + 3], data[mega_pointer + temp_pointer + 2],data[mega_pointer + temp_pointer + 1],data[mega_pointer + temp_pointer + 0]) , 16).unwrap() as usize;
                   // println!("Temp pointer: {}", temp_pointer);
                    first = false;
                }
            }

        }


        //write all data from cluster to cluster

            //write all the things

            let mut super_temp_pointer = 0;
            let mut p_file: std::vec::Vec<std::string::String> = Vec::new();
            println!("Writing file {}", x);
            for y in 0..cluster_things.len() {
                    if y.eq(&0) {
                        println!("Starting CLuster: {}", cluster_things[0]);
                    }
                    if y.eq(&(cluster_things.len() - 1)) {
                        println!("Ending CLuster: {:?}", cluster_things.last() );
                    }
                    super_temp_pointer = original_mega_pointer + (512 * (cluster_things[y] as usize - 2)) ;
                    for z in 0..512 {
                        p_file.push(format!("{}", data[super_temp_pointer + z]));
                    }

            }

            let file_name: &str = &x.to_string() as &str;

            write_out(file_name, p_file);



    }

    //get file name
    let mut mega_pointer: usize = ssotds_final as usize * bps_final as usize;

    let mut directory_things_nums : std::vec::Vec<usize> = Vec::new();
    let mut directory_things_strs : std::vec::Vec<std::vec::Vec<char>> = Vec::new();

    while mega_pointer + 1024 < size as usize {
        let ultra_temp = format!("{}", data[mega_pointer + 11]);
        if ultra_temp.eq("0F"){
            let super_ultra_temp = format!("{}{}{}", data[mega_pointer + 32 + 8], data[mega_pointer + 32 + 9], data[mega_pointer + 32 + 10]);
            if super_ultra_temp.eq("4A5047"){
                 //21 20 27 26
                let super_ultra_temp_plus = format!("{}{}{}{}", data[mega_pointer + 32 + 21], data[mega_pointer + 32 + 20], data[mega_pointer + 32 + 27], data[mega_pointer + 32 + 26]);
                let sutp = u32::from_str_radix(&super_ultra_temp_plus, 16).unwrap();
                directory_things_nums.push(sutp as usize);
                let mut directory_things_str_cnvs : std::vec::Vec<char> = Vec::new();

                let hex_string = &format!("{}{}{}{}{}{}{}{}{}{}{}", data[mega_pointer + 32 + 0], data[mega_pointer + 32 + 1], data[mega_pointer + 32 + 2], data[mega_pointer + 32 + 3], data[mega_pointer + 32 + 4], data[mega_pointer + 32 + 5], data[mega_pointer + 32 + 6], data[mega_pointer + 32 + 7], data[mega_pointer + 32 + 8], data[mega_pointer + 32 + 9], data[mega_pointer + 32 + 10]);
                let hex_string_dc = *hex_d_hex::dhex(&hex_string);

                for n in 0..hex_string_dc.len() {
                    directory_things_str_cnvs.push(hex_string_dc[n] as char);

                }

                directory_things_strs.push(directory_things_str_cnvs);
               // let thing  = hex::decode(&format!("{}{}{}{}{}{}{}{}{}{}", data[mega_pointer + 32 + 0], data[mega_pointer + 32 + 1], data[mega_pointer + 32 + 2], data[mega_pointer + 32 + 3], data[mega_pointer + 32 + 4], data[mega_pointer + 32 + 5], data[mega_pointer + 32 + 6], data[mega_pointer + 32 + 7], data[mega_pointer + 32 + 8], data[mega_pointer + 32 + 9]));
              //  directory_things_strs.push(&thing);
            }
            //long file name

        }
    
        mega_pointer = mega_pointer + 64;
    }

    //println!("{:?}", directory_things_nums);
    //println!("{:?}", directory_things_strs);
    let mut file_num = 0;
    for x in 0..s_file.len() {
        for y in 0..directory_things_nums.len() {
            if s_file[x].eq(&directory_things_nums[y]) {
                println!("File name for file {} = {:?}", x, directory_things_strs[y]);
            }
        }
    }


}