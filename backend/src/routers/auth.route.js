import express, { Router } from 'express'; 

const router = express.Router(); 

router.get('/login', (req, res)=>{
    res.send('login endpoint'); 
}); 

router.post('/signUp', (req, res)=>{
    res.send('sign up endpoint'); 
})

export default router; 