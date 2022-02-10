const express = require('express');
const db = require('./config/db');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const  PORT = 3306;
app.use(cors());
app.use(express.json())


// Route to register a new user
app.post('/api/register', (req,res)=> {

const username = req.body.username;
const password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync());

db.query("SELECT COUNT(*) AS cnt FROM users WHERE username = ?", username, (err,result)=>{
  if(err) {
  console.log(err)
  }
  if(result[0].cnt == 0){
    db.query("INSERT INTO users (username, password) VALUES (?,?)",[username, password], (err,result)=>{
       if(err) {
       console.log(err);
       res.send(false);
       }
       console.log(result);
       res.send(true);
    });
  } else{
    console.log(err);
    res.send(false);
  }
  });   });


// Route to check a log in credential
app.post('/api/login', (req,res)=> {

const username = req.body.username;
const password = req.body.password;

db.query("SELECT password FROM users WHERE username = ?", username,
(err,result)=>{
  if(err) {
  console.log(err)
  }
  res.send(result)
  });   });


// Route to get all highlights
app.get("/api/getHighlight", (req,res)=>{
db.query("SELECT id, body, username FROM highlights", (err,result)=>{
    if(err) {
    console.log(err)
    }
res.send(result)
});   });


// Route to get all comments of a highlight
app.get("/api/getFromId/:id", (req,res)=>{

const id = req.params.id;
db.query("SELECT id, body, username FROM comments WHERE highlightId = ?", id,
(err,result)=>{
  if(err) {
  console.log(err)
  }
  res.send(result)
  });   });


// Route to save a highlight
app.post('/api/create', (req,res)=> {

const username = req.body.username;
const body = req.body.highlighted;

db.query("INSERT INTO highlights (body, username) VALUES (?,?)",[body,username], (err,result)=>{
   if(err) {
   console.log(err)
   }
   db.query("SELECT id FROM highlights WHERE body = ?", body,
   (err,result)=>{
     if(err) {
     console.log(err)
     }
     res.send(result)
     });
});   })


// Route to save a comment
app.post('/api/saveComment', (req,res)=> {

const highlightId = req.body.highlightId;
const text = req.body.text;

db.query("INSERT INTO comments (body, highlightId) VALUES (?,?)",[text,highlightId], (err,result)=>{
   if(err) {
   console.log(err)
   }
});   })


// Route to delete a highlight
app.delete('/api/deleteHighlight/:id',(req,res)=>{
const id = req.params.id;

db.query("DELETE FROM highlights WHERE id= ?", id, (err,result)=>{
if(err) {
console.log(err)
        } }) })


// Route to delete a comment
app.delete('/api/deleteComment/:id',(req,res)=>{
const id = req.params.id;

db.query("DELETE FROM comments WHERE id= ?", id, (err,result)=>{
if(err) {
console.log(err)
        } }) })


app.listen(PORT, ()=>{
    console.log(`Server is running on ${PORT}`)
})
