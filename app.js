var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
mongoose.set('useFindAndModify', false);
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
var methodOverride = require("method-override");
var expressSanitizer = require('express-sanitizer');
var Blog = require("./models/blog");
var passport = require("passport");
var User = require("./models/user");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");

// Set port to 5000
app.set('port', (process.env.PORT || 5000));
/////////////////////////////////////////////////////////////////////
// Auth
app.use(require("express-session")({
    secret: "This is my secret n theres no chance u know it",
    resave: false,
    saveUninitialized: false
}));
// Need anytime you use passport (required)
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
// Encoding and decoding the session (required)
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
/////////////////////////////////////////////////////////////////////
// APP CONFIG
// mongoose.connect("mongodb://localhost/restful_blog_app");
mongoose.connect("mongodb+srv://vihanga:qwe123@cluster0.qm2ct.mongodb.net/blog_platform?retryWrites=true&w=majority");


app.use(bodyParser.urlencoded({extended: true}));
// Use ejs as the extension
app.set("view engine", "ejs");
// Use the static files in the public directory
app.use(express.static(__dirname + "/public"));
// Use the method override function (Update route)
app.use(methodOverride("_method"));
app.use(expressSanitizer());

// RESTFUL ROUTES
app.get("/", function(req, res){
    res.redirect("/blogs");
});

// Index route
app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){
        if(err){
            console.log(err);
        } else {
            var login;
            if (req.user){
                var login = true;
                res.render("index", {blogs: blogs, loggedIn: login});
            } else {
                var login = false;
                res.render("index", {blogs: blogs, loggedIn: login});
            }
        }
    });
});
// =========================
// LOGIN ROUTES
// =========================
app.get("/login", function(req, res){
    var login;
    if (req.user){
        var login = true;
        res.render("login", {loggedIn: login});
    } else {
        var login = false;
        res.render("login", {loggedIn: login});
    }
});
// Login logic (post route)
app.post("/login", passport.authenticate("local", {
        successRedirect: "/blogs",
        failureRedirect: "/login"
    }), function(req, res){
});
// Logout logic
app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});
// =========================
// ISLOGGEDIN MIDDLEWARE
// =========================
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.get("/about", function(req, res){
    var login;
    if (req.user){
        var login = true;
        res.render("about", {loggedIn: login});
    } else {
        var login = false;
        res.render("about", {loggedIn: login});
    }
});

app.get("/blogs/new", isLoggedIn, function(req, res){
    var login;
    if (req.user){
        var login = true;
        res.render("new", {loggedIn: login});
    } else {
        var login = false;
        res.render("new", {loggedIn: login});
    }
});

// Show Route
app.get("/blogs/:id", function(req, res){
    Blog.find({}, function(err, blogs){
     Blog.findById(req.params.id, function(err, fBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            var login;
            if (req.user){
                var login = true;
                res.render("show", {blog: fBlog, blogs:blogs, loggedIn: login});
            } else {
                var login = false;
                res.render("show", {blog: fBlog, blogs:blogs, loggedIn: login});
            }
        }
    });
    });
});

// Create route
app.post("/blogs", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            var login;
            if (req.user){
                var login = true;
                res.render("login", {loggedIn: login});
            } else {
                var login = false;
                res.render("login", {loggedIn: login});
            }
        } else {
            res.redirect("/blogs")
        }
    });
});

// EDIT ROUTE
app.get("/blogs/:id/edit", isLoggedIn, function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            var login;
            if (req.user){
                var login = true;
                res.render("edit", {blog:foundBlog, loggedIn: login});
            } else {
                var login = false;
                res.render("edit", {blog:foundBlog, loggedIn: login});
            }
        }
    });
});

// UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    })
});

// DELETE ROUTE
app.delete("/blogs/:id", function(req, res){
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log(err);
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    });
});

// Routing on port 5000
app.listen(app.get('port'), function() {
  console.log('Blogging platform has started on port', app.get('port'));
});