//global variables

//enumerations
var OrderStatuses = {
    ORDER_RECEIVED : 0,
    ORDER_PROCESSING : 1,
    ORDER_BILL_REQUESTED: 2,
    ORDER_COMPLETED : 3
}

//utility methods
function getCustomizationData(items, callback)
{
  var j = 0;
  var customizationData = {};
  for(var i=0; i<items.length; i++)
  {
    (function(cntr) {
        // here the value of i was passed into as the argument cntr
        // and will be captured in this function closure so each
        // iteration of the loop can have it's own value
        var query = new Parse.Query("Customization")
        query.limit = 1000;
        query.equalTo("itemId", {
            __type: "Pointer",
            className: "Menu",
            objectId: items[cntr].toJSON()['objectId']
        });
        query.find({
          success: function(customizations) {
              if(customizations.length > 0)
              {
                var categoryHashMap = {};
                for(var k=0; k<customizations.length; k++)
                {
                  if(categoryHashMap[customizations[k].toJSON()['category']])
                  {
                    categoryHashMap[customizations[k].toJSON()['category']]['values'].push({"name": customizations[k].toJSON()['name'], "price": customizations[k].toJSON()['price']})
                  }
                  else {
                    categoryHashMap[customizations[k].toJSON()['category']] = {"type": customizations[k].toJSON()['type'], "values": [{"name": customizations[k].toJSON()['name'], "price": customizations[k].toJSON()['price']}]}
                    if(customizations[k].toJSON()['min'])
                      categoryHashMap[customizations[k].toJSON()['category']]['min'] = customizations[k].toJSON()['min']
                    if(customizations[k].toJSON()['max'])
                      categoryHashMap[customizations[k].toJSON()['category']]['max'] = customizations[k].toJSON()['max']
                  }
                }
                customizationData[customizations[0].toJSON()['itemId']['objectId']] = []
                for(var key in categoryHashMap)
                {
                  customizationData[customizations[0].toJSON()['itemId']['objectId']].push({"category": key, "customization": categoryHashMap[key]})
                }
              }
              j += 1
            },
            error: function(error) {
              callback(undefined, error)
            }
        });
    })(i);
  }
  var interval = setInterval(function(){
    if(j == items.length)
    {
      clearInterval(interval);
      callback(customizationData, undefined)
    }
  }, 100);
}

function getMenuItems(businessId, callback)
{
  var query = new Parse.Query("Menu")
  query.limit = 1000;
  query.ascending("category", "nonVeg")
  query.equalTo("businessId", {
      __type: "Pointer",
      className: "Business",
      objectId: businessId
  });
  query.find({
    success: function(results) {
        callback(results, undefined)
      },
      error: function(error) {
        callback(undefined, error)
      }
  });
}

function getOrders(businessId, status, callback)
{
  var query = new Parse.Query("Order");
  var start = new Date();
  start.setHours(0,0,0,0);

  query.equalTo("businessId", {
      __type: "Pointer",
      className: "Business",
      objectId: businessId
  });
  if(status == "pending")
  {
      query.notEqualTo("status", 3)
  }
  else if(status == "completed")
  {
      query.equalTo("status", 3)
  }
  query.greaterThan("createdAt", start)
  query.limit(1000);
  query.find({
    success: function(results) {
        callback(results, undefined)
      },
      error: function(error) {
        callback(undefined, error)
      }
    });
}

//business apis
Parse.Cloud.define('business-categories', function(req, res){

})

Parse.Cloud.define('business-orders', function(req, res){
  // getting all orders placed on the current day
  if(req.user)
  {
    getOrders(req.user.get('businessid'), req.params['status'], function(result, error){
      if(error)
      {
        res.success({"status": "failure", "error": error})
      }
      else {
        res.success({"status": "success", "orders": result})
      }
    });
  }
  else {
    res.success({"status": "failure", "error": "User not logged in"})
  }
});

Parse.Cloud.define('business-updateorder', function(req, res){

});

Parse.Cloud.define('business-orderhistory', function(req, res){

});


//consumer apis
Parse.Cloud.define('user-businessmenu', function(req, res){
  getMenuItems(req.params.businessId, function(result, error){
    if(error)
    {
      res.success({"status": "failure"})
    }
    else {
      getCustomizationData(result, function(data, error){
        if(error)
        {
          res.success({"status": "failure"})
        }
        res.success({"status": "success", "items": result, "customizations": data})
      })
    }
  });
});

Parse.Cloud.define('user-order', function(req, res){

});
