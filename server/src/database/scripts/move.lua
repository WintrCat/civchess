local key = KEYS[1];
local currentPath = ARGV[1];
local newPath = ARGV[2];

local val = cjson.decode(
    redis.call("json.get", key, currentPath)
);

if type(val) ~= "table" then
    return
end

if val[1] then
    redis.call("json.set", key, newPath, cjson.encode(val[1]));
    redis.call("json.del", key, currentPath);
end