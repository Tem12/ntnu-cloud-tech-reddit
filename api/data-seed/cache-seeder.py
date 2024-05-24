import redis

r = redis.Redis(host="localhost", port=6379, db=0)

r.set(1, 5)
r.set(2, 451)
r.set(3, 2)
r.set(4, 20)
r.set(5, 14)
r.set(6, 25)
r.set(7, 758)
r.set(8, 5)
r.set(9, 86)
r.set(10, 2)
r.set(11, 56)
r.set(12, 156)

print('Redis cache successfully seeded')
