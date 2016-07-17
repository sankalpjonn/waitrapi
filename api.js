//global variables

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

function getOrders(params, callback)
{
  var query = new Parse.Query("Order");
  var start = new Date();
  start.setHours(0,0,0,0);

  query.equalTo("businessId", {
      __type: "Pointer",
      className: "Business",
      objectId: params.businessId
  });
  query.equalTo("status", params['status'])
  query.greaterThan("createdAt", start)
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
    getOrders(req.params, function(result, error){
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
      res.success({"status": "success", "orders": result})
    }
  });
});

Parse.Cloud.define('user-order', function(req, res){

});
