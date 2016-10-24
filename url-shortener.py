from flask import Flask, request, redirect
import urllib
import json
import requests


app = Flask(__name__)
serverAddress = "http://localhost:1337"
staticServerAddress = "https://menu.waitr.in"
appId = "waitrtestappid"


@app.route("/<handle>")
def return_resource(handle):
    params = urllib.urlencode({"where": json.dumps({"handle": handle})})
    url = "{}/waitr/classes/Business?{}".format(serverAddress, params)
    headers = {"X-Parse-Application-Id": appId}
    response = requests.get(url, headers=headers).json()
    if response.get("results"):
        businessId = response["results"][0]["objectId"]
        return redirect("{}/html/#/restaurant/{}".format(staticServerAddress, businessId))

if __name__ == "__main__":
    app.run(debug=False, port=5000, host="127.0.0.1")
