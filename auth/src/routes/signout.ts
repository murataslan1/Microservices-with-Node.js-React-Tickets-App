import express from "express"

const router = express.Router()


router.post('/api/users/signout',(req,res)=>{
    // dump the cookie in FE
    req.session = null;
    res.send({})
})

export {router as signoutRouter}