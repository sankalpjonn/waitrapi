// redis
var redisConfig = {}
redisConfig['host'] = 'localhost'
redisConfig['port'] = 6379
redisConfig['db'] = 11

var esHost = "localhost:9200"
var goodboxServerAddress = "http://testchat.tsepak.com"

module.exports.redisConfig = redisConfig;
module.exports.esHost = esHost
module.exports.goodboxServerAddress = goodboxServerAddress
