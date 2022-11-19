import mongoose from 'mongoose'
import {Password} from "./../services/password"

// An interface that describes the proerties 
// that are requried to create a new user
interface UserAttrs {
  email: string;
  password: string
}

// interface for properties that a user model has
interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc
}

// porpertes that a usre Documnet has
interface UserDoc extends mongoose.Document {
    email: string;
    password: string;
}

const userSchema = new mongoose.Schema({
    email:{
        type: String, // to mongoose not TS
        required:true
    },
    password:{
        type:String,
        required:true
    }},
    {
    toJSON: {
        // customize how to stringify json
        transform(doc, ret){
            // keep consistent cross all pods, dbs
            ret.id = ret._id;
            delete ret._id;
            delete ret.password; // remove property (JS)
            delete ret.__v;
        }
    }
  }
)

const buildUser = (attrs: UserAttrs) => {
    // in order to do type check
    // we need this miiddleawre function
  return new User(attrs)
}

userSchema.statics.build = buildUser

userSchema.pre('save', async function(done){
    // don't use arrow function
    if(this.isModified('password')){ 
        // no move if it just a modfiction made to email
        const hashed = await Password.toHash(this.get('password'))
        this.set('password', hashed)
    }
    done()

})

const User = mongoose.model<UserDoc, UserModel>('User', userSchema)
export {User} 
