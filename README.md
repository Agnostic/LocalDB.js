LocalDB.js
==========

Lightweight NoSQL ODM for modern browsers.

# What is LocalDB.js?

LocalDB.js is a tool that maps the structure of the databases in objects using the localStorage API.

# Requeriments

A modern browser that supports localStorage.

# How To Use

Import the library (Supports AMD)

```
<script type='text/javascript' src='localDB.js'>
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

books.save(item, function(item){
  console.log('New item:', item);
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

books.save(items, function(item){
  console.log('New items:', item);
});
```