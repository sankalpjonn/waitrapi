// redis
var redisConfig = {}
redisConfig['host'] = 'tsepak-cache.edve4d.0001.apse1.cache.amazonaws.com'
redisConfig['port'] = 6379
redisConfig['db'] = 11

var esHost = "localhost:9200"
var goodboxServerAddress = "http://chat.tsepak.com"

module.exports.redisConfig = redisConfig;
module.exports.esHost = esHost
module.exports.goodboxServerAddress = goodboxServerAddress
