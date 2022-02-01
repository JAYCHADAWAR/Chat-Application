"use strict";

var socket = io();
var receiver = "";
var sender = "";
var rname = "";
var sender_name = "";

function myFunction() {
  var id = document.getElementById("uid").value;
  console.log(id);
  alert(id);
  sender_name = document.getElementById("pname").value;
  alert(sender_name);
  console.log(sender_name);
  socket.emit("user_connected", id);
  sender = id;
}

function typing() {
  console.log("typing on");
  socket.emit("typing", {
    receiver: receiver,
    sender: sender
  });
}

function typeingof() {
  console.log("typing of");
  socket.emit("typiof", {
    receiver: receiver,
    sender: sender
  });
}

function sendMessage() {
  // get message
  var message = document.getElementById("msggg").value;
  document.getElementById("msggg").innerHTML = "";
  console.log(sender);
  console.log(receiver);
  var today = new Date(); // send message to server

  socket.emit("send_message", {
    sender: sender,
    receiver: receiver,
    message: message,
    date: today.getHours() + ":" + today.getMinutes()
  });
  console.log("hbdhe");
  document.getElementById('msger-chat').scrollTop += 400; // append your own message

  var msgarea = document.getElementById("msger-chat");
  var html = "<div class='msg right-msg' id='rm'>" + "<div class='msg-img'></div>" + "<div class='msg-bubble'>" + "<div class='msg-info'>" + "<div class='msg-info-name'>" + sender_name + "</div>" + "<div class='msg-info-time'>" + today.getHours() + ":" + today.getMinutes() + "</div>" + "</div>" + "<div class='msg-text'>" + message;
  "</div>" + "</div>" + "</div>";
  msgarea.innerHTML += html;
  document.getElementById('msger-chat').scrollTop += 400; // prevent form from submitting
}

socket.on("new_message", function (data) {
  console.log("new message");
  console.log(data.message);
  var msgarea = document.querySelector('#msger-chat');
  var html = "<div class='msg left-msg' id='rm'>" + "<div class='msg-img'></div>" + "<div class='msg-bubble'>" + "<div class='msg-info'>" + "<div class='msg-info-name'>" + rname + "</div>" + "<div class='msg-info-time'>" + data.date + "</div>" + "</div>" + "<div class='msg-text'>" + data.message;
  "</div>" + "</div>" + "</div>";
  msgarea.innerHTML += html;
  document.getElementById('msger-chat').scrollTop += 200;
});
socket.on("new_type", function (data) {
  console.log("p typein");

  if (data.sender == receiver) {
    document.getElementById("typid").innerHTML = "typing...";
  }
});
socket.on("new_typeof", function (data) {
  if (data.sender == receiver) {
    document.getElementById("typid").innerHTML = "";
  }
});