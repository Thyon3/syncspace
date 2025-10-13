import mongoose, { mongo } from 'mongoose'; 

const userSchema = new mongoose.Schema ({

    name: {
        type: String, 
        required: true , 
        unique: true, 

    }, 
    email:{
        type: String, 
        required:true, 
        unique:true, 
    }, 
    hashPassword: {
        type: String, 
        required: true, 
    }, 
    profilePic :{
        type: String, 
        required: false, 
    }
} , {
    timestamps:true, 
}); 

const User =  mongoose.model('User', userSchema); 

export default User; 