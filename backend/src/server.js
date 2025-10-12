

import express from "express"; 
import dotenv from 'dotenv'; 

dotenv.config(); 
const app = express(); 

const port = process.env.PORT || 3000; 


app.get('/', (req, res)=>{
    res.send('thi si \ t'); 
}); 

app.get('/fuck', (req, res)=>{
    res.send('oh this is fucked up '); 
})


app.listen(port , ()=>{
    console.log( `server is running on http://localhost:${port}`); 
})