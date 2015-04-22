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

```html
<script type='text/javascript' src='LocalDB.js'>
```

Create a collection

```javascript
var books = new LDB.Collection('books');
```

Adding documents

```javascript
var item = {
  author: 'Author name',
  title: 'Book title test'
};

books.save(item, function(_item){
  console.log('New item:', _item);
});
```

Multiple items

```javascript
var items = [{
  author: 'Author name',
  title: 'Book title test'
},{
  author: 'Another author',
  title: 'New book'
}];

books.save(items, function(_items){
  console.log('New items:', _items);
});
```

Find and Update

```javascript
books.find({ author: 'Author name' }, function(results){
  if(results[0]){
    results[0].author = 'New name';
    results[0].save();
  }
});
```

Update

```javascript
books.update({ author: 'Author name' }, function(updated_items){
  console.log(updated_items);
});
```

Delete

```javascript
books.find({ author: 'Author name' }, function(items){
  for(var i in items){
    items[i].delete();
  }
});
```

Drop collection

```javascript
books.drop();
```

Drop all collections
```javascript
LDB.clear();
```

Show collections
```javascript
LDB.showCollections();
```

# TODO
Configuration for REST API.
Extra functionalities.
