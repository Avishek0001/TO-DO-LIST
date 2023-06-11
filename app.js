//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose")
const _ = require("lodash")

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Avishek2001:AvishekKundu2001@cluster0.uhuwjdg.mongodb.net/todoListDB", {useNewUrlParser:true})

const ItemSchema={
  name:String
}

const Item = mongoose.model("Item", ItemSchema )

const item1 = new Item({
  name:"Welcome to your todo list"
})
const item2 = new Item({
  name:"Hit the ADD button for add"
})
const item3 = new Item({
  name:"Hit the DELETE to delete "
})

defaultItems = [item1,item2,item3]



const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];



const listSchema = {
  name:String,
  items: [ItemSchema]
}

const List = mongoose.model("list", listSchema)

app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){

    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Successfully Saved");
        }
      })
      res.redirect("/")
    }else{
    res.render("list", {listTitle: day, newListItems: foundItems});
    
  }
})

});

const day = date.getDate();



app.post("/", function(req, res){

  const Newitem = req.body.newItem;
  const ListItem = req.body.list;

  const item = new Item({
    name:Newitem
  })

  if(ListItem === day){
  item.save()
  res.redirect("/")
  }else{
    List.findOne({name:ListItem},(err,foundList)=>{
      foundList.items.push(item)
      foundList.save()
      res.redirect("/"+ListItem)
    })
  }


});


app.post("/delete",(req,res)=>{
  const checkdItem = req.body.Checkbox;
  const ListName = req.body.ListName;

  if(ListName=== day){

  Item.findByIdAndRemove( checkdItem,(err)=>{
    if(err){
      console.log(err);
    }else{
      console.log("Successfully Find and Deleted");
      res.redirect("/")
    }
  })
  }
  else{
    List.findOneAndUpdate({name:ListName},{$pull:{items:{_id:checkdItem}}},(err,foundList)=>{
        if(!err){
          res.redirect("/"+ListName)
        }
    })

  }


})

app.get("/:customList",function(req,res){
  const userId = _.capitalize(req.params.customList)

  List.findOne({name:userId},(err,foundListedItems)=>{
    if(err){
      console.log(err);
    }else{
      if(!foundListedItems){
        const list = new List({
        name:userId,
        items:defaultItems
      })
      list.save()
      res.redirect("/" + userId)
       }
       else{
        res.render("list",{listTitle:foundListedItems.name, newListItems: foundListedItems.items})
      }
    }
  })


})

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server has started successfully");
});
