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

function constructOrderText(orderData, businessId, callback)
{
  var text = ""
  var j = 0;
  var total = 0
  for(var i=0; i<orderData.length; i++)
  {
    (function(cntr) {
        // here the value of i was passed into as the argument cntr
        // and will be captured in this function closure so each
        // iteration of the loop can have it's own value
        var query = new Parse.Query("Menu");
        var quantity = orderData[cntr]['itemQuantity'];
        var additional = orderData[cntr]['additional']
        query.get(orderData[cntr]['itemId'], {
          success: function(menu) {
            text += "" + quantity + " X " + menu.toJSON()['name'] + " Rs. " +  menu.toJSON()['price'];
            if(additional)
              text += " *NEW ITEM* " + "\n"
            else
              text += "\n"
            total += menu.toJSON()['price'] * quantity;
            j += 1
            // console.log(total)
          },
          error: function(object, error) {
            console.log(error)
            // The object was not retrieved successfully.
            // error is a Parse.Error with an error code and message.
          }
        });
    })(i);
  }
  var interval = setInterval(function(){
    if(j == orderData.length)
    {
      clearInterval(interval);
      text += "Total : Rs. " + total
      callback(text)
    }
  }, 100);
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


//before save triggers
Parse.Cloud.beforeSave("Order", function(request, response){
  var orderData  = request.object.toJSON().orderData;
  constructOrderText(orderData, request.object.toJSON().businessId.objectId, function(text){
      request.object.set("orderText", text);
      response.success();
  })
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
