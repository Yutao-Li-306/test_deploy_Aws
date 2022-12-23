


var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://Yufei:2001feb27@cluster0-shard-00-00.fwkzc.mongodb.net:27017,cluster0-shard-00-01.fwkzc.mongodb.net:27017,cluster0-shard-00-02.fwkzc.mongodb.net:27017/neufood?ssl=true&replicaSet=atlas-sx2kmu-shard-0&authSource=admin&retryWrites=true&w=majority";
var express = require('express');
var app = express();
var cookieParser = require('cookie-parser')
const bp = require('body-parser');
const PORT = process.env.PORT || 8080;


const { applyPatch } = require('patch-package/dist/applyPatches');
const dotenv = require('dotenv');
//const path = require('path');
const { OAuth2Client } = require('google-auth-library');
dotenv.config();
const CLIENT_ID = '172976540503-l9kdlci6rhsaulg741o8of7gfq8s4did.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID); // process.env.REACT_APP_GOOGLE_CLIENT_ID
var uid = 0;

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://Yufei:2001feb27@cluster0-shard-00-00.fwkzc.mongodb.net:27017,cluster0-shard-00-01.fwkzc.mongodb.net:27017,cluster0-shard-00-02.fwkzc.mongodb.net:27017/neufood?ssl=true&replicaSet=atlas-sx2kmu-shard-0&authSource=admin&retryWrites=true&w=majority";
var express = require('express');
var app = express();
var recipes = [];
app.use(express.json());
app.use(cookieParser());
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));
var cors = require('cors');
const { ExitToApp } = require('@material-ui/icons');
//app.use(cors());
// https://stackoverflow.com/questions/19743396/cors-cannot-use-wildcard-in-access-control-allow-origin-when-credentials-flag-i
app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("neufood");
  dbo.collection("recipes").find({}).toArray(function(err, result) {
    if (err) throw err;
    //console.log(result);
    recipes.push(result);
    db.close();
  });
});
//google auth
const users = [];//store user to mongo db or whatever.
const one_D_array =[];
function upsert(array, item) {
  const i = array.findIndex((_item) => _item.email === item.email);
  if (i > -1) array[i] = item;
  else array.push(item);
}
const curr_email_ = [];
app.post('/api/google-login', async (req, res) => {
  const { token } = req.body;
  const users = {};
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID,
  });
  // get the name email and picture of user, email should be unique key
  const { name, email, picture, sub } = ticket.getPayload(); 
  uid = sub;
  users.name = name;
  users.email = email;
  users.picture = picture;
  users.id = sub;
  console.log(users)
  // send session cookie to frontend
  // res.cookie('session-token', token);
  //console.log(token);
  // find id in db and see if it matches
  MongoClient.connect(url, async function(err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    var user = await dbo.collection("user").find({uid: sub}).toArray();
    if (user.length > 0) { // user is matched
      console.log("Welcome " + user[0].name);
      console.log("Your email is " + user[0].email);
    }
    else { // new user, add to database
      dbo.collection("user").insertOne(
        {"uid": sub, "name": name, "email": email}
      ); 
      console.log("Welcome " + name + " to NeufoodAI!");
      console.log("Thank you for making an account with us!");
    }
  });
  res.send(users); 
  /*users.push(name);
  console.log(users)
  curr_email_.length = 0;
  curr_email_.push(email)
  console.log("curr.email:"+curr_email_) */
});

//get all recipes
app.get('/recipes', function(req, res, next){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    dbo.collection("recipes").find({}).toArray(function(err, result) {
      if (err) throw err;
      //console.log(result);
      //recipes.push(result);
      res.send(result);
      db.close();
    });
  });
    //res.send(recipes);
});

// get user recipe based on pantry
app.get('/recipes/:user_id', function(req, res, next){
  MongoClient.connect(url, async function(err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    function getRecipeArray() {
      return new Promise(function (good) {
        dbo.collection("recipes").find({}).toArray(function(err, result) {
        if (err) throw err;
        good(result);
        });
      });
    }
    function getIngredients() {
      return new Promise(function(good) {
        dbo.collection("ingredients").find({user: req.params.user_id}).toArray(function(err, result) {
          if (err) throw err;
          var resty = [];
          // create new array of ingredients with just the name
          let promise = new Promise(function (finish) {
            for (let i = 0; i < result.length; i++) {
              resty.push(result[i].name);
            }
            finish();
          });
          promise.then(function() {
            good(resty);
          });
        });
      });
     }
    var recipes = await getRecipeArray();
    var ingredients = await getIngredients();
    var result = [];
    for (let i = 0; i < recipes.length; i++) {
      var check = true;
      for (let j = 0; j < recipes[i].ingredients_array.length; j++) {
        if (!ingredients.includes(recipes[i].ingredients_array[j].name)) {
          check = false;
        }
      }
      if (check == true) {
        result.push(recipes[i]);
      }
    }
    res.send(result);
  });
});

//get all ingredients
app.get('/ingredients', function(req, res, next){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    dbo.collection("ingredients").find({}).toArray(function(err, result) {
      if (err) throw err;
      //console.log(result);
      //recipes.push(result);
      res.send(result);
      db.close();
    });
  });
    //res.send(recipes);
});

//20.2 get ingredients list the user has
app.get('/:user_id/ingredients', function(req, res, next){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    //var uid = new require('mongodb').ObjectID(req.params.user_id);
    dbo.collection("ingredients").find({user: req.params.user_id}).toArray(function(err, result) {
      if (err) throw err;
      //console.log(result);
      //recipes.push(result);
      res.send(result);
      db.close();
  });
  
  });
});



 //20.3 delete ingredients
 app.delete('/ingredients/:ingredients_id', function(req, res, next){
  //res.send("Hello");
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    var uid = new require('mongodb').ObjectID(req.params.ingredients_id);
    dbo.collection("ingredients").findOneAndDelete({_id: uid})
    .then(function(result){ 
      if(!result)
            throw new Error('No record found.');
      //if (err) throw err;
      //console.log(result);
      //recipes.push(result);
      res.send("sucessfully delete.");
      db.close();
  });
  
  });
});

//delete recipes
app.delete('/recipes/:recipes_id', function(req, res, next){
  //res.send("Hello");
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    var uid = new require('mongodb').ObjectID(req.params.recipes_id);
    dbo.collection("recipes").findOneAndDelete({_id: uid})
    .then(function(result){ 
      if(!result)
            throw new Error('No record found.');
      //if (err) throw err;
      //console.log(result);
      //recipes.push(result);
      res.send();
      db.close();
  });
  
  });
});

//20.4 update ingredient's quantity
app.put('/ingredients/:ingredients_id/:quantity', function(req, res, next){
  //res.send("Hello");
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    var uid = new require('mongodb').ObjectID(req.params.ingredients_id);
    dbo.collection("ingredients").findOneAndUpdate({_id: uid}, {$set:{quantity: req.params.quantity}})
    .then(function(result){ 
      if(!result)
            throw new Error('No record found.');
      //if (err) throw err;
      //console.log(result);
      //recipes.push(result);
      res.send("sucessful updated");
      db.close();
  });
  
  });
});

//20.4 update ingredient's image
app.put('/ingredients/image/:ingredients_id/:url', function(req, res, next){
  //res.send("Hello");
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    var uid = new require('mongodb').ObjectID(req.params.ingredients_id);
    image_url = "blob:http://localhost:3000/" + req.params.url;
    dbo.collection("ingredients").findOneAndUpdate({_id: uid}, {$set:{image: image_url}})
    
    .then(function(result){ 
      if(!result)
            throw new Error('No record found.');
      //if (err) throw err;
      //console.log(result);
      //recipes.push(result);
      res.send("sucessful updated");
      db.close();
  });
  
  });
});

//20.4 update ingredient's date
app.put('/date/ingredients/:ingredients_id', function(req, res, next){
  //res.send("Hello");
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    var uid = new require('mongodb').ObjectID(req.params.ingredients_id);
    dbo.collection("ingredients").findOneAndUpdate({_id: uid}, {$set:{date: new Date()}})
    .then(function(result){ 
      if(!result)
            throw new Error('No record found.');
      //if (err) throw err;
      //console.log(result);
      //recipes.push(result);
      res.send("sucessful updated");
      db.close();
  });
  
  });
});

//20.4 update ingredient's sharing state
app.put('/sharing/ingredients/:ingredients_id', function(req, res, next){
  //res.send("Hello");
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    var uid = new require('mongodb').ObjectID(req.params.ingredients_id);
    dbo.collection("ingredients").find({user: req.params.user_id}).toArray(function(err, result) {
      if (err) throw err;
      //console.log(result);
      //recipes.push(result);
      dbo.collection("ingredients").findOneAndUpdate({_id: uid}, {$set:{sharing: !result.sharing}})
    .then(function(result2){ 
      if(!result2)
            throw new Error('No record found.');
      //if (err) throw err;
      //console.log(result);
      //recipes.push(result);
      res.send("sucessful updated");
      db.close();
  });
    
  });
    
  
  });
});

//26.6 share ingredients to user
app.put('/ingredients/user/:ingredients_id/:user', function(req, res, next){
  //res.send("Hello");
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    var uid = new require('mongodb').ObjectID(req.params.ingredients_id);
    dbo.collection("ingredients").findOneAndUpdate({_id: uid}, {$push: {user_list: req.params.user}})
    .then(function(result){ 
      if(!result)
            throw new Error('No record found.');
      //if (err) throw err;
      //console.log(result);
      //recipes.push(result);
      res.send("sucessful updated");
      db.close();
  });
  
  });
});

//26.7 share ingredients to pantry
app.put('/ingredients/pantry/:ingredients_id/:pantry', function(req, res, next){
  //res.send("Hello");
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    var uid = new require('mongodb').ObjectID(req.params.ingredients_id);
    dbo.collection("ingredients").findOneAndUpdate({_id: uid}, {$push: {pantry_list: req.params.pantry}})
    .then(function(result){ 
      if(!result)
            throw new Error('No record found.');
      //if (err) throw err;
      //console.log(result);
      //recipes.push(result);
      res.send("sucessful updated");
      db.close();
  });
  
  });
});

async function search(name){
  const SerpApi = require('google-search-results-nodejs');
  const search = new SerpApi.GoogleSearch("c24b4adb8fa00bd7d0522f443ae51b2145b1b289b69ae712026a4381f451c904");
  let img_name = "images of " + name;
  const params = {
    q: img_name,
    location: "United States",
    hl: "en",
    gl: "us",
    google_domain: "google.com"
  };
  let key ="";
  
  const callback = function(data) {
    //let key = "";
    /*
    for (let i = 0; i < data.inline_images.length; i++) {
      if (data.inline_images[i].original) {
        key=(data.inline_images[i].original);
        break;
      }
    }
    */
    key=(data.inline_images[0].original);
  };
  
  const doSomethingAsync = () => {
    return new Promise(resolve => {
      setTimeout(() => resolve(key), 500)
    })
  }
  
  const doSomething = async () => {
    let y  = await doSomethingAsync()
    return y;
  }
  
  search.json(params, callback);
  //console.log('Before')
    return doSomething()
  }
  

//20.7 add ingredients
app.post('/ingredients/:name/:price/:category/:quantity/:user', function(req, res, next){
  //res.send("Hello");
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    //var uid = new require('mongodb').ObjectID(req.params.user);
    search(req.params.name).then(function(url){
    console.log(url)
    dbo.collection("ingredients").insertOne({name: req.params.name, price:req.params.price, 
      category: req.params.category, image: url, quantity:req.params.quantity, user:req.params.user,
      date: new Date(), sharing: false, request_list: [], user_list: [], pantry_list:[]})
    .then(function(result){ 
      if(!result)
            throw new Error('No record found.');
      //if (err) throw err;
      //console.log(result);
      //recipes.push(result);
      res.send();
      db.close();
    })
    
  });
  
  });
});

//20.7 add recipes
app.post('/recipes/:name/:ingredients/:preparation/:nutrition', function(req, res, next){
  //res.send("Hello");
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    //var uid = new require('mongodb').ObjectID(req.params.ingredients_id);
    dbo.collection("recipes").insertOne({name: req.params.name, ingredients:req.params.ingredients, preparation: req.params.preparation, nutrition: req.params.nutrition})
    .then(function(result){ 
      if(!result)
            throw new Error('No record found.');
      //if (err) throw err;
      //console.log(result);
      //recipes.push(result);
      res.send();
      db.close();
  });
  
  });
});

//21.2 get user information
app.get('/user/:user_id', function(req, res, next){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    //var uid = new require('mongodb').ObjectID(req.params.user_id);
    dbo.collection("user").find({uid: req.params.user_id}).toArray(function(err, result) {
      if (err) throw err;
      //console.log(result);
      //recipes.push(result);
      res.send(result);
      db.close();
  });
  
  });
});


//21.3 Add Friend to friend list
app.post('/user/:user_id/:email', function(req, res, next){
  MongoClient.connect(url, async function(err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    function getUserArray() {
      return new Promise(function (good) {
        dbo.collection("user").find({email: req.params.email}).toArray(function(err, result) {
          if (result.length === 0) {
            res.status(400);
            res.send(err);
            good(false);
          }
          else if ((result[0].uid) === (req.params.user_id)) {
            // trying to request themself, return 401 error
            res.status(401);
            res.send(err);
            good(false);
          }
          good(true);
        });
        });
    }
    function checkList() {
      return new Promise(function (good) {
        dbo.collection("user").find({uid: req.params.user_id}).toArray(function(err, result) {
          if (typeof result[0].request_list !== 'undefined') {
            for (var z = 0; z < result[0].request_list.length; z++) {
              if (result[0].request_list[z] === req.params.email) {
                res.status(400);
                res.send(err);
                good(false);
              }
            }
          }
          if (typeof result[0].friends_list !== 'undefined') {
            for (var z = 0; z < result[0].friends_list.length; z++) {
              if (result[0].friends_list[z] === req.params.email) {
                res.status(400);
                res.send(err);
                good(false);
              }
            }
          }
          good(true);
        });
        });
    }
    var found = await getUserArray();
    var check = await checkList();
    if (found==true && check==true) {
      dbo.collection("user").updateOne({uid: req.params.user_id}, {$push: {friends_list: req.params.email}})
    .then(function(result){ 
      if(!result)
            throw new Error('No record found.');
      res.send();
      db.close();
    });
    }
  });
});

// 21.7 Get Friends
app.get('/user/friends/:uid', function(req, res, next){
  MongoClient.connect(url, async function(err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    function getFriendsArray() {
      return new Promise(function (good) {
        dbo.collection("user").find({"uid": req.params.uid}).toArray(function(err, result) {
        if (err) throw err;
        // will need to change if we add more attributes to user
        if (typeof result[0].friends_list !== 'undefined') {
          good(result[0].friends_list);
        }
        else {
          good([]);
        }
        });
      });
    }
    async function getFriends(array) {
      const rest = [];
      for(var i = 0; i < array.length; i++) {
        rest.push(new Promise((resolve, reject) => {
          dbo.collection("user").find({"email": array[i]}).toArray(async function(err, result) {
            if (err) throw err;
            if (result.length != 0) {
              resolve({'name': result[0].name, 'email': result[0].email});
            }
            else { // error case
              resolve({});
            }
          });
        }));
      }
      const weGooo = await Promise.all(rest);
      return weGooo
    }
    var friend = await getFriendsArray();
    var final_list = await getFriends(friend);
    res.send(final_list);
  });
});

//21.4 Delete a friend in the friend list
app.delete('/user/:user_id/:friend_id', function(req, res, next){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    dbo.collection("user").updateOne({uid: req.params.user_id}, { $pull: {friends_list: req.params.friend_id}})
    .then(function(result){ 
      if(!result)
            throw new Error('No record found.');
      res.send();
      db.close();
    });
    });
  });

// 21.7 Get Request List
app.get('/user/request/:uid', function(req, res, next){
  MongoClient.connect(url, async function(err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    function getFriendsArray() {
      return new Promise(function (good) {
        dbo.collection("user").find({"uid": req.params.uid}).toArray(function(err, result) {
        if (err) throw err;
        // will need to change if we add more attributes to user
        if (typeof result[0].request_list !== 'undefined') {
          good(result[0].request_list);
        }
        else {
          good([]);
        }
        });
      });
    }
    async function getFriends(array) {
      const rest = [];
      for(var i = 0; i < array.length; i++) {
        rest.push(new Promise((resolve, reject) => {
          dbo.collection("user").find({"email": array[i]}).toArray(async function(err, result) {
            if (err) throw err;
            if (result.length != 0) {
              resolve({'name': result[0].name, 'email': result[0].email});
            }
            else { // error case
              resolve({});
            }
          });
        }));
      }
      const weGooo = await Promise.all(rest);
      return weGooo
    }
    var friend = await getFriendsArray();
    var final_list = await getFriends(friend);
    res.send(final_list);
  });
});

// 21.12 Add new reuqest to request list
app.post('/user/request/:user_id/:email', function(req, res, next){
  MongoClient.connect(url, async function(err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    function getUserEmail() {
      return new Promise(function (good) {
        dbo.collection("user").find({uid: req.params.user_id}).toArray(function(err, result) {
          if (err) throw err;
          good(result[0].email);
        });
      });
    }
    function getUserArray() {
      return new Promise(function (good) {
        dbo.collection("user").find({email: req.params.email}).toArray(function(err, result) {
          if (result.length === 0) {
            // invalid email, return 400
            res.status(400);
            res.send(err);
            good(false);
          }
          else if ((result[0].uid) === (req.params.user_id)) {
            // trying to request themself, return 401 error
            res.status(401);
            res.send(err);
            good(false);
          }
          good(true);
        });
        });
    }
    function checkList() {
      return new Promise(function (good) {
        dbo.collection("user").find({email: req.params.email}).toArray(function(err, result) {
          if (typeof result[0].request_list !== 'undefined') {
            for (var z = 0; z < result[0].request_list.length; z++) {
              if (result[0].request_list[z] === emails) {
                res.status(400);
                res.send(err);
                good(false);
              }
            }
          }
          if (typeof result[0].friends_list !== 'undefined') {
            for (var z = 0; z < result[0].friends_list.length; z++) {
              if (result[0].friends_list[z] === emails) {
                res.status(400);
                res.send(err);
                good(false);
              }
            }
          }
          good(true);
        });
        });
    }
    var emails = await getUserEmail();
    var found = await getUserArray();
    var check = await checkList();
    if (found==true && check==true) {
      dbo.collection("user").updateOne({email: req.params.email}, {$push: {request_list: emails}})
    .then(function(result){ 
      if(!result)
            throw new Error('No record found.');
      res.send();
      db.close();
    });
    }
  });
});

// 21.13 Delete from request_list
app.delete('/user/request/:user_id/:friend_id', function(req, res, next){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    dbo.collection("user").updateOne({uid: req.params.user_id}, { $pull: {request_list: req.params.friend_id}})
    .then(function(result){ 
      if(!result)
            throw new Error('No record found.');
      res.send();
      db.close();
    });
    });
  });

//26.0 Add new Pantry
app.post('/pantry/:name/:user', function(req, res, next){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    dbo.collection("pantry").insertOne({name: req.params.name, member_list: [req.params.user]})
    .then(function(result){ 
      if(!result)
            throw new Error('No record found.');
      res.send();
      db.close();
    })
  });
});

// 26.1 Delete Pantry
app.delete('/pantry/:pantry_id', function(req, res, next){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    var uid = new require('mongodb').ObjectID(req.params.pantry_id);
    dbo.collection("pantry").findOneAndDelete({_id: uid})
    .then(function(result){ 
      if(!result)
            throw new Error('No record found.');
      res.send();
      db.close();
  });
  });
});


// 26.2 Add Friend to memeber list
app.put('/pantry/:pantry_id/:member_id', function(req, res, next){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    var pantry_id = new require('mongodb').ObjectID(req.params.pantry_id);
    dbo.collection("pantry").updateOne({_id: pantry_id}, {$push: {member_list: req.params.member_id}})
    .then(function(result){ 
      if(!result)
            throw new Error('No record found.');
      res.send();
      db.close();
    });
  });
});

// 26.2 Add Friend to memeber list
app.delete('/pantry/:pantry_id/:member_id', function(req, res, next){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    var pantry_id = new require('mongodb').ObjectID(req.params.pantry_id);
    dbo.collection("pantry").updateOne({_id: pantry_id}, {$pull: {member_list: req.params.member_id}})
    .then(function(result){ 
      if(!result)
            throw new Error('No record found.');
      res.send();
      db.close();
    });
  });
});

//28.2 change ingredient's ownership
app.put('/ingredients/ownership/:ingredients_id/:user', function(req, res, next){
  //res.send("Hello");
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    var uid = new require('mongodb').ObjectID(req.params.ingredients_id);
    dbo.collection("ingredients").findOneAndUpdate({_id: uid}, {$set:{user: req.params.user}})
    .then(function(result){ 
      if(!result)
            throw new Error('No record found.');
      //if (err) throw err;
      //console.log(result);
      //recipes.push(result);
      res.send("sucessful updated");
      db.close();
  });
  
  });
});

//26.5 get pantries the user joined
app.get('/:user_id/pantry', function(req, res, next){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    //var uid = new require('mongodb').ObjectID(req.params.user_id);
    dbo.collection("pantry").find({member_list:{"$in":[req.params.user_id]}}).toArray(function(err, result) {
      if (err) throw err;
      //console.log(result);
      //recipes.push(result);
      res.send(result);
      db.close();
  });
  
  });
});

//26.4 get ingredients base on pantry
app.get('/ingredients/pantry/:pantry_id', function(req, res, next){
  MongoClient.connect(url, async function(err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    var uid = new require('mongodb').ObjectID(req.params.pantry_id);
    function getRequestArray() {
      return new Promise(function (good) {
        dbo.collection("pantry").find({_id: uid}).toArray(function(err, result) {
        if (err) throw err;
        // will need to change if we add more attributes to user
        console.log(result[0].member_list);
        good(result[0].member_list);
        });
      });
    }
    async function getRequest(array) {
      const rest = [];
      //console.log(array.length);
      for(var i = 0; i < array.length; i++) {
        rest.push(new Promise((resolve, reject) => {
          dbo.collection("ingredients").find({user: array[i]}).toArray(async function(err, result) {
            if (err) throw err;
            console.log(result.length);
            if (result.length != 0) {
              const list = [];
              for(var j=0; j<result.length; j++){
              list.push({'category': result[j].category, 'name': result[j].name, 'quantity': result[j].quantity,
              'user': result[j].user, 'date': result[j].date, 'image': result[j].image});
              }
              
                resolve(list);
              
            }
            else { // error case
              resolve({});
            }
          });
        }));
      }
      const weGooo = await Promise.all(rest);
      return weGooo
    }
    var request = await getRequestArray();
    var final_list = await getRequest(request);
    var ffinal = [];
    for(var i=0; i<final_list.length;i++){
      for(var j=0; j<final_list[i].length;j++){
        ffinal.push(final_list[i][j])
      }
    }
   
    res.send(ffinal);
  });
});

//28.3 request for ingredient
app.put('/ingredients/request/:ingredients_id/:user', function(req, res, next){
  //res.send("Hello");
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    var uid = new require('mongodb').ObjectID(req.params.ingredients_id);
    dbo.collection("ingredients").findOneAndUpdate({_id: uid}, {$push: {request_list: req.params.user}})
    .then(function(result){ 
      if(!result)
            throw new Error('No record found.');
      //if (err) throw err;
      //console.log(result);
      //recipes.push(result);
      res.send("sucessful updated");
      db.close();
  });
  
  });
});

//28.3 get request list
app.get('/ingredients/request/:ingredients_id', function(req, res, next){
  MongoClient.connect(url, async function(err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    var uid = new require('mongodb').ObjectID(req.params.ingredients_id);
    function getRequestArray() {
      return new Promise(function (good) {
        dbo.collection("ingredients").find({_id: uid}).toArray(function(err, result) {
        if (err) throw err;
        // will need to change if we add more attributes to user
        console.log(result[0].request_list);
        good(result[0].request_list);
        });
      });
    }
    async function getRequest(array) {
      const rest = [];
      for(var i = 0; i < array.length; i++) {
        rest.push(new Promise((resolve, reject) => {
          dbo.collection("user").find({uid: array[i]}).toArray(async function(err, result) {
            if (err) throw err;
            if (result.length != 0) {
              resolve({'name': result[0].name, 'email': result[0].email});
            }
            else { // error case
              resolve({});
            }
          });
        }));
      }
      const weGooo = await Promise.all(rest);
      return weGooo
    }
    var request = await getRequestArray();
    var final_list = await getRequest(request);
    res.send(final_list);
  });
});


/*
app.get('/ingredients/request/:ingredients_id', function(req, res, next){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    var uid = new require('mongodb').ObjectID(req.params.ingredients_id);
    
    dbo.collection("ingredients").find({_id: uid}).toArray(function(err, result) {
      if (err) throw err;
      //console.log(result);
      //recipes.push(result);
      res.send(result[0].request_list);
      db.close();
      
  });
});
});

*/


// logout for google-api
app.get('/logout', (req, res)=>{
  // remove session cookie
  console.log("logout");
  //res.clearCookie('session-token');
  res.send("yeah");
  //res.redirect('/signin');
})

/*
* Middleware below
*/
// verify with session cookie, if no session cookie, redirect to signin
app.post('/auth', async function checkAuthenticated(req, res, next) {
  let token = req.body.cookies;
  /*async function getToken() {
    // let token = req.cookies['session-token']; <- for some reason this code doesn't work, this would be better to use if can implement
    try {
      token = req.body.cookies.substring(30); // this is the offset from the direct cookie String
    } catch {
      token = "failure";
    }
  } 
  await getToken(); */
  let user = {};
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    user.id = payload.sub;
  }

  verify().then(()=>{
    console.log("authenticated, let user through");
    res.send({data: true});
  }).catch(err=>{
    console.log("not authenticated");
    res.send({data: false});
  })
});

var server = app.listen(PORT,"0.0.0.0",function () {
    var host = server.address().address
    var port = server.address().port
    console.log("site: http://%s:%s", host, port)

  })
