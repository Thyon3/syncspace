import mongoose from 'mongoose'; 
import dotenv from 'dotenv'; 

dotenv.config(); 

const connectDB = async function (){
    try{
        await mongoose.connect(process.env.MONGOOSE_CONNECTION_STRING); 
        console.log('mongoDb connected'); 
    }catch(error){
        console.log('mongoose connection error ', error); 
process.exit(1); 
    }
}

export default connectDB; 