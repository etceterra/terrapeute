import mongoose from 'mongoose'


export default mongoose.connect('mongodb://localhost:27017/terrapeute', {useNewUrlParser: true, useUnifiedTopology: true })
