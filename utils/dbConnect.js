const mongoose = require('mongoose');

////// make the opt of connetion with counter

let cachedDb = null;

export default async function dbConnect() {
    if (cachedDb) {
        return cachedDb;
    }


    try { // try because the program not the owner of db
        const db = await mongoose.connect(process.env.Mongo_DB
        // OLD: mongodb+srv://ahmad:ahmad@cluster0.k6j1txr.mongodb.net/scholar_scrape
            , { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected Successfully");
        cachedDb = db;
        return db;
    } catch (error) {
        console.log("dbConnect: ", error);
    }


}