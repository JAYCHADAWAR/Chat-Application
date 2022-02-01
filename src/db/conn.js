const mysql = require("mysql");
  
const connection = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database : "chat"
})

connection.connect(function(err) {
    if(err){
      console.log("Error in the connection")
      console.log(err)
    }
    else{
      console.log(`Database Connected`)
     
     
    }
})