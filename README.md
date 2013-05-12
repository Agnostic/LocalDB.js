LocalDB.js
==========

Lightweight NoSQL ODM for modern browsers.

# What is LocalDB.js?

LocalDB.js is a tool that maps the structure of the databases in objects using the localStorage API, no database drivers are required, just add the library and use it!

Useful for web applications, mobile apps or game engines.

# Requeriments

A modern browser that supports localStorage.

# How To Use

Import the library (Supports AMD)

```
<script type='text/javascript' src='LocalDB.js'>
```

Create a collection

```
var books = new LDB.Collection('books');
```

Adding documents

```
var item = {
  author: 'Author name',
  title: 'Book title test'
};

books.save(item, function(_item){
  console.log('New item:', _item);
});
```

Multiple items

```
var items = [{
  author: 'Author name',
  title: 'Book title test'
},{
  autor: 'Another author',
  title: 'New book'
}];

books.save(items, function(_items){
  console.log('New items:', _items);
});
```

Find and Update

```
books.find({ author: 'Author name' }, function(results){
  if(results[0]){
    results[0].author = 'New name';
    results[0].save();
  }
});
```

Update

```
books.update({ author: 'Author name' }, function(updated_items){
  console.log(updated_items);
});
```

Delete

```
books.find({ author: 'Autor name' }, function(items){
  for(var i in items){
    items[i].delete();
  }
});
```

Drop collection

```
books.drop();
```

Drop all collections
```
LDB.clear();
```

Show collections
```
LDB.showCollections();
```

# TO DO
Configuration for REST API.
Extra functionalities.