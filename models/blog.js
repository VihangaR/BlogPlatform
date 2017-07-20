var mongoose = require("mongoose");

// SCHEMA SETUP (Blueprint of how it should look like)
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

// Taking the Schema (Blueprint) and combiling it into a model with a bunch of methods (find, create)
var Blog = mongoose.model("Blog", blogSchema);
// This is what is returned if this file is requested
module.exports = Blog;