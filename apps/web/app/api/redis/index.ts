import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

function getRedis() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
}

export function getGenerateRatelimit() {
  return new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(5, "10 m"),
  })
}

export function getRecapRatelimit() {
  return new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(10, "10 m"),
  })
}
