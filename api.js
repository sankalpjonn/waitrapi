//global variables

//enumerations
var OrderStatuses = {
    ORDER_RECEIVED : 0,
    ORDER_PROCESSING : 1,
    ORDER_BILL_REQUESTED: 2,
    ORDER_COMPLETED : 3
}

//utility methods
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

//before save triggers
Parse.Cloud.beforeSave("Order", function(request, response){
  var query = Parse.Query("Order");
  query.equalTo("businessId", request.object.toJSON()['businessId']);
  query.equalTo("tableNumber", request.object.toJSON()['tableNumber']);
  query.notEqualTo("status", OrderStatuses.ORDER_COMPLETED);
  query.find({
    success: function(results) {
      if(results.length == 0)
        response.success();
      else
        response.error("There is already an order in progress with this table.")
      },
      error: function(error) {
        response.error(error);
      }
    });
});

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
      res.success({"status": "success", "items": result})
    }
  });
});

Parse.Cloud.define('user-order', function(req, res){

});
