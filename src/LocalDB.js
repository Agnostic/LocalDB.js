/*
*   LocalDB.js v1.0
*   (c) 2013 Gilberto Avalos Osuna
*   avalosagnostic@gmail.com
*/

(function(root){

  /* LocalDB */
  var LDB = function(obj) {
    if (obj instanceof LDB) return obj;
    if (!(this instanceof LDB)) return new LDB(obj);
  };

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = LDB;
    }
    exports.LDB = LDB;
  } else {
    root.LDB = LDB;
  }

  var collections = localStorage.getItem('LocalDB');
  if(!collections){
    LDB.collections = [];
    localStorage.setItem('LocalDB', JSON.stringify(collections));
  } else {
    LDB.collections = JSON.parse(collections);
  }

  LDB.version = '1.0';

  /* Utils */
  var breaker = {};
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  var push             = ArrayProto.push,
      slice            = ArrayProto.slice,
      concat           = ArrayProto.concat,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  var each = LDB.each = LDB.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (LDB.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  LDB.s4 = function(){
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  };

  LDB.uuid = function(){
    return LDB.s4() + LDB.s4() + new Date().getTime() + LDB.s4();
  };

  LDB.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, l = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, l + isSorted) : isSorted);
      } else {
        i = LDB.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < l; i++) if (array[i] === item) return i;
    return -1;
  };

  LDB.identity = function(value) {
    return value;
  };

  LDB.sortedIndex = function(array, obj, iterator, context) {
    iterator = iterator == null ? LDB.identity : lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  var any = LDB.some = LDB.any = function(obj, iterator, context) {
    iterator || (iterator = LDB.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  LDB.filter = LDB.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  LDB.where = function(obj, attrs, first) {
    if (LDB.isEmpty(attrs)) return first ? null : [];
    return LDB[first ? 'find' : 'filter'](obj, function(value) {
      for (var key in attrs) {
        if (attrs[key] !== value[key]) return false;
      }
      return true;
    });
  };

  LDB.find = LDB.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  LDB.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  LDB.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  LDB.map = LDB.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    return results;
  };

  LDB.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : LDB.keys(obj).length;
  };

  LDB.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (LDB.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  LDB.max = function(obj, iterator, context) {
    if (!iterator && LDB.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && LDB.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity, value: -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  LDB.isEmpty = function(obj) {
    if (obj == null) return true;
    if (LDB.isArray(obj) || LDB.isString(obj)) return obj.length === 0;
    for (var key in obj) if (LDB.has(obj, key)) return false;
    return true;
  };

  LDB.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  LDB.isString = function (obj) {
    return toString.call(obj) == '[object String]';
  };

  /* Reset Database */
  LDB.reset = LDB.clear = function(){
    var localdb = localStorage.getItem('LocalDB');
    if( localdb ){
      localdb = JSON.parse(localdb);
      LDB.each(localdb, function(collection){
        localStorage.removeItem('LocalDB_'+collection);
      });
      localStorage.setItem('LocalDB', '[]');
    }
    LDB.collections = [];
  };

  LDB.showCollections = function(){
    return LDB.collections;
  };

  /* Documents */
  var Item = LDB.Item = function (collectionName, fields) {
    var self         = this;
    self.__collection = collectionName;
    LDB.extend(self, fields);
  };

  Item.prototype.save = function () {
    var self = this, items, db;

    items = localStorage.getItem('LocalDB_'+self.__collection);

    if(items){
      items = JSON.parse(items);
    } else {
      items = [];
    }

    if(self._id){
      if( items.length ){
        var updateItem = LDB.find(items, function(item){
          return item._id == self._id;
        });
        if(updateItem){
          LDB.each(self, function(thisItem, key){
            if(key !== '__collection'){
              if(self[key] !== undefined){
                updateItem[key] = self[key];
              }
            }
          });
        }
      }
    } else {
      self._id = LDB.uuid();
      items.push(self);
    }

    localStorage.setItem( 'LocalDB_'+self.__collection, JSON.stringify(items) );

    LDB.each(arguments, function(arg){
      if(typeof arg === 'function'){
        return arg();
      }
    });
  };

  Item.prototype.delete = function () {
    var self = this;
    var items = localStorage.getItem('LocalDB_'+self.__collection);

    if(items){
      items         = JSON.parse(items);
      var new_items = LDB.filter(items, function(item){ return item._id !== self._id; });
      localStorage.setItem('LocalDB_'+self.__collection, JSON.stringify(new_items));
    }

    LDB.each(arguments, function(arg){
      if(typeof arg === 'function'){
        return arg();
      }
    });
  };

  /* Collections */
  var Collection = LDB.Collection = function (name) {
    var self  = this, collection, db;
    self.name = name;

    collection = localStorage.getItem('LocalDB_'+name);

    if(collection){
      self.items = JSON.parse(collection);
    } else {
      self.items = [];
      localStorage.setItem('LocalDB_'+name, '[]');
    }
    var _exists = LDB.find(LDB.collections, function(item){ return item === name; });
    if(!_exists){
      LDB.collections.push(name);
      localStorage.setItem('LocalDB', JSON.stringify(LDB.collections));
    }
  };

  Collection.prototype.find = function () {
    var self = this,
    results  = [];
    self.items = JSON.parse(localStorage.getItem('LocalDB_'+self.name));

    if( self.items.length && typeof arguments[0] === 'object' && LDB.size(arguments[0]) ) {
      var items  = LDB.where(self.items, arguments[0]);
      if(items.length){
        results = LDB.map(items, function(item){
          return new Item(self.name, item);
        });
      }
    } else {
      results = LDB.map(self.items, function(item){
        return new Item(self.name, item);
      });
    }
    LDB.each(arguments, function(arg){
      if(typeof arg === 'function'){
        return arg(results);
      }
    });
  };

  Collection.prototype.save = function () {
    var self = this, db;

    if(!arguments[0]){
      localStorage.setItem( 'LocalDB_'+self.name, JSON.stringify(self.items) );
    } else {
      if(arguments[0].length){
        LDB.each(arguments[0], function(_item){
          var item         = {};
          _item._id        = LDB.uuid();
          item             = new Item(self.name, _item);
          self.items.push(item);
        });
      } else {
        var item         = {};
        arguments[0]._id = LDB.uuid();
        item             = new Item(self.name, arguments[0]);
        self.items.push(item);
      }

      localStorage.setItem( 'LocalDB_'+self.name, JSON.stringify(self.items) );

      LDB.each(arguments, function(arg){
        if(typeof arg === 'function'){
          return arg(item);
        }
      });
    }
  };

  Collection.prototype.update = function () {
    var self = this;
    var upsert = LDB.find(arguments, function(arg){ return arg.upsert; });

    self.items = JSON.parse(localStorage.getItem( 'LocalDB_'+self.name));

    var find = arguments[0],
    update   = arguments[1];

    var items = LDB.where(self.items, find);
    if(LDB.size(items)){
      LDB.each(items, function(item){
        LDB.each(update, function(val, key){
          item[key]         = val;
        });
        item = new Item(self.name, item);
      });
      self.save();
    } else if(upsert){
      self.save( update );
    }

    LDB.each(arguments, function(arg){
      if(typeof arg === 'function'){
        return arg(items || []);
      }
    });
  };

  Collection.prototype.delete = function () {
    var self = this;
    var items = LDB.where(self.items, arguments[0]);
    LDB.each(items, function(item){
      self.items.splice( LDB.indexOf(self.items, item), 1);
    });
    self.save();
    LDB.each(arguments, function(arg){
      if(typeof arg === 'function'){
        return arg();
      }
    });
  };

  Collection.prototype.drop = function() {
    var self = this;
    this.items = [];
    localStorage.setItem( 'LocalDB_'+self.name, '[]' );
  };

})(window);