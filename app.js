const express = require("express");
const bodyParser = require("body-parser");
const { urlencoded } = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
const port = 5000;

app.set("view engine", "ejs");
mongoose.set("strictQuery", false);
app.use(urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://shridharkandikatla:Shri8624@cluster0.n2egjwm.mongodb.net/todolist?retryWrites=true&w=majority"
);

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const name1 = new Item({
  name: "Welcome to your todolist!",
});

const name2 = new Item({
  name: "Hit the + button to add a new item.",
});

const name3 = new Item({
  name: "<-- Hit this to delete an item.",
});

const defaultItems = [name1, name2, name3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newItems: foundItems });
    }
  });
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        //create a new list
        list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        //show existing list
        res.render("list", {
          listTitle: foundList.name,
          newItems: foundList.items,
        });
      }
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName == "Today") {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (!err) {
        // console.log("Successfully Deleted");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      function (err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

// app.post("/work", function (req, res) {
//   const item = req.body.newItem;
//   workItems.push(item);
//   res.redirect("/work");
// });

// app.listen(3000, function (err) {
//   console.log("http://localhost:3000/");
// });

app.listen(process.env.PORT || port, () =>
  console.log("Listening on port 5000")
);
