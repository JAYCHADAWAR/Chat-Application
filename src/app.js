const express=require("express");
const path=require("path");
require("./db/conn");
const ejs=require("ejs");
const formidable = require('formidable');
const fs = require('fs');
const app=express();
const port=process.env.PORT || 3000;
const mysql = require("mysql");
const server = require('http').createServer(app)
var bodyParser = require('body-parser');
const session=require('express-session');
const flash=require('connect-flash');
const { CLIENT_SECURE_CONNECTION } = require("mysql/lib/protocol/constants/client");
const io = require('socket.io')(server)
// register new function

  

app.use(bodyParser.urlencoded({ extended: true })); 
const staticpath=path.join(__dirname,"../public");
const temppath=path.join(__dirname,"../templates/views");
const partialpath=path.join(__dirname,"../templates/partials");
console.log(staticpath);
app.use("/css",express.static(path.join(__dirname,"../node_modules/bootsrap/dist/css")))
app.use("/js",express.static(path.join(__dirname,"../node_modules/bootsrap/dist/js")))
app.use("/jq",express.static(path.join(__dirname,"../node_modules/bootsrap/jquery/dist")))
app.use(session({
    secret:'secret',
    
    resave: true,
    saveUninitialized:true,
}))
app.use(express.static(staticpath))
app.set("view engine","ejs");
app.set("views",temppath);
//ejs.registerPartials(partialpath);

const connection = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database : "chat"
})
var users=[];
io.on('connection', socket => {
    console.log('Some client connected',socket.id)
    socket.on("user_connected", function (id) {
        // save in array
        users[id] = socket.id;
        
        // socket ID will be used to send message to individual person
 
        // notify all connected clients
       // io.emit("user_connected", username);
    });
    socket.on("send_message", function (data) {
        // send event to receiver
        var socketId = users[data.receiver];
     
        io.to(socketId).emit("new_message", data);

        // save in database
          console.log(data.sender);
        connection.query("INSERT INTO message VALUES (null,'" + data.sender + "', '" + data.receiver + "', '" + data.message + "', '" + data.date + "')", function (error, result) {
            //
        });
    });
    socket.on("typing",function(data){

           var socketId = users[data.receiver];
           console.log("typing");
           console.log(data.receiver);
           io.to(socketId).emit("new_type", data);
    });
    socket.on("typiof",function(data){

        var socketId = users[data.receiver];
        console.log("typing of");
        io.to(socketId).emit("new_typeof", data);
 });
   
  })

connection.connect(function(err) {
    if(err){
      console.log("Error in the connection")
      console.log(err)
    }
    else
    {
      console.log(`Database Connected`)
                  
                         
    }
})
app.get("/",(req,res)=>{
    res.render("index");
})
app.post("/register",(req,res)=>{
    //console.log(req.body);
    var ins="hey there using chat";
    var sql="insert into users values (null,'"+req.body.name +"','"+req.body.password+"','"+req.body.passwordc+"','"+req.body.email+"','"+ins+"') ";
    connection.query(sql,function(err){
       if (err) throw err
        require.flash('msg','saved');
        res.render('index',{msg:flash('data saved')});
    
    })
})
app.post("/contactus",(req,res)=>{
    const cname=req.body.ctname;
    const cemail=req.body.ctemail;
    const cm=req.body.cttxt;
    var sql="insert into contactus values (null,'"+cname +"','"+cemail+"','"+cm+"') ";
    connection.query(sql,function(err){
       if (err) throw err
      
        res.render('index');
    
    })
})
app.post("/login",(req,res)=>{
    //console.log(req.body);
    const email=req.body.email;
    const pass=req.body.pass;
    console.log(email);
    /*connection.query('SELECT * FROM users WHERE emailid = ? AND password=? ',[email,pass],function(err,rows,fields){
        if (err) throw err
            
        var session=req.session;
            //console.log(rows);
            if (rows.length>0) {
                session.userid=rows[0].id;
               // console.log(session.userid);
                res.render('chatpage',{emaild:rows[0].emailid,name:rows[0].name,status:rows[0].status,dpp:rows[0].dp});
            }
            else { // if user found
                
               
                res.status(301).redirect('/');
 
            } 
           
        
        	
        

    });*/
    connection.query('SELECT * FROM users',function(err,rows,fields){
        if (err) throw err
        var session=req.session;
        console.log(rows);
        for(let i=0;i<rows.length;i++)
            {
                if(rows[i].emailid==email && rows[i].password==pass)
                { 
                   session.userid=rows[i].id;
                    /*var id=rows[i].id;
                    var emaild=rows[i].emailid;
                    var name=rows[i].name;
                    var status=rows[i].status;
                   var dpp=rows[i].dp;
                  var  idd=id;*/
                  console.log("1");
                 
                  
                }
            }
            if(session.userid)
            {
                res.send("1");
            }
            else{
                res.send("0");
            }
           


    });
})
app.post("/logout",(req,res)=>{
    if (req.session) {
        req.session.destroy();
        res.send("1");
      }
      
     
})
app.get("/chatpage",(req,res)=>{
    var emaild,name,status,dpp,idd,id;
    connection.query('SELECT * FROM users',function(err,rows,fields){
        if (err) throw err
        var session=req.session;
        
        console.log(rows);
        for(let i=0;i<rows.length;i++)
            {
                if(rows[i].id==session.userid)
                { 
                  
                     id=rows[i].id;
                    emaild=rows[i].emailid;
                    name=rows[i].name;
                    status=rows[i].status;
                    dpp=rows[i].dp;
                    idd=id;
                  
                  
                }
            }
            
           
            res.render('chatpage',{id,emaild,name,status,dpp,data:rows,idd,chats:"",secusname:"",secuseid:"",pdp:""});

    });

   
})
app.post("/get_message",(req,res)=>{
    var session=req.session;
    console.log(req.body.receiver);
    console.log("userid"+session.userid);
    connection.query("select * from message where outid=? AND incomingid=? OR outid=? AND incomingid=? ORDER BY msgid",[session.userid,req.body.receiver,req.body.receiver,session.userid],function(err,selre,fields){
        if(err) return console.error(err.message);
        console.log(selre);
        console.log(req.body.receiver);
        //session.chat=selre;
        res.send(JSON.stringify(selre));
    });
})
app.post("/get_profilepic",(req,res)=>{

    connection.query("select * from users where id=?",[req.body.receiver],function(err,rres){
        if(err) return console.error(err.message);
       
        console.log(req.body.receiver);
        //session.chat=selre;
        res.send( rres[0].dp);
    });
})
app.post("/chatpage",(req,res)=>{
    var session=req.session;
    console.log(session.userid);
    var chid;
    var namesec;
    var chats;
    var data;
    var id;
    
    connection.query('SELECT * FROM users  ',function(err,rowss,fields){
        if (err) throw err
       
        console.log(rowss);
        data=rowss;
           


    });
    if(req.body.name)
    {
        connection.query('UPDATE users SET name= ? WHERE id= ?',[req.body.name,session.userid],function(error,results,fields){
            if (error){
                return console.error(error.message);
            }

            
        });
        
    }
    if(req.body.email)
    {
        connection.query('UPDATE users SET emailid= ? WHERE id= ?',[req.body.email,session.userid],function(error,results,fields){
            if (error){
                return console.error(error.message);
            }

            
        });

        
    }
    if(req.body.status)
    {
        connection.query('UPDATE users SET status= ? WHERE id= ?',[req.body.status,session.userid],function(error,results,fields){
            if (error){
                return console.error(error.message);
            }

            
        });
        
    }
    if(req.body.secuserid)
    {
        var session=req.session;
        connection.query("select * from users where id=?",[req.body.secuserid],function(err,selname,fields){
            if(err) return console.error(err.message);
            session.namesec=selname[0].name;
            session.secid=req.body.secuserid;
            session.profdp=selname[0].dp;
            console.log(session.namesec);
        });
        connection.query("select * from message where outid=? AND incomingid=? OR outid=? AND incomingid=? ORDER BY msgid",[session.userid,req.body.secuserid,req.body.secuserid,session.userid],function(err,selre,fields){
            if(err) return console.error(err.message);
            console.log(selre);
            session.chat=selre;
        });


    }
    if(req.body.outgoing_id )
    {
       var session=req.session;
       console.log(req.body.mssg);
       var sql="insert into message values (null,'"+req.body.outgoing_id +"','"+req.body.incoming_id+"','"+req.body.mssg+"') ";
       console.log(req.body.outgoing_id);
       connection.query(sql,function(err){
        if (err) throw err
        
        
     
     });
     connection.query("select * from message where outid=? AND incomingid=? OR outid=? AND incomingid=?  ORDER BY msgid DESC",[session.userid,req.body.incoming_id,req.body.incoming_id,session.userid],function(err,selre,fields){
        if(err) return console.error(err.message);
        console.log(selre);
        session.chat=selre;
    });

     

    }
   
    if(req.url="/chatpage")
    {
        var filen;
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var oldpath = files.profileimage.filepath;
            console.log(oldpath);
            var newpath = "./public/images/"+session.userid+files.profileimage.originalFilename;//+;
            console.log(newpath);
            filen=session.userid+files.profileimage.originalFilename;
            fs.rename(oldpath, newpath, function (err) {
                if (err) throw err;
                
              });
              
              connection.query('UPDATE users SET dp=? WHERE id=?',[filen,session.userid],function(err,results,fields){
                if (err){
                    return console.error(error.message);
                }
              })

          });
          console.log(filen);
          /*connection.query('UPDATE users SET dp=? WHERE id=?',[filen,session.userid],function(err,results,fields){
            if (err){
                return console.error(error.message);
            }
          })*/

    }
    console.log("bfhe");
    
    connection.query('SELECT * FROM users WHERE id= ?',[session.userid],function(err,rows,fields){
        if (err){
            return console.error(err.message);
        }
        console.log(rows[0].id);
       
           res.render('chatpage',{id:session.userid,idd:rows[0].id,emaild:rows[0].emailid,name:rows[0].name,status:rows[0].status,dpp:rows[0].dp,data,chats:session.chat,secusname:session.namesec,secuseid:session.secid,pdp:session.profdp});
    });
    
    
})

server.listen(port, () => {
    console.log("running")
  })