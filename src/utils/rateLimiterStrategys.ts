import crypto from "crypto";
import { redis } from "@/db";

export interface RatelimiterStrategy {
  allowRequest(
    userId: string,
    windowSec: number,
    limit: number,
  ): Promise<boolean>;
}

export class FixedWindow implements RatelimiterStrategy {
  private readonly script = `
    local count = redis.call("INCR", KEYS[1])

    if count == 1 then
      redis.call("EXPIRE", KEYS[1], ARGV[1])
    end

    if count > tonumber(ARGV[2]) then
      return 0
    end

    return 1
  `;

  async allowRequest(
    userId: string,
    windowSec: number,
    limit: number,
  ): Promise<boolean> {
    if (limit <= 0 || windowSec <= 0) {
      throw new Error("Invalid rate limiter configuration");
    }

    const key = `ratelimit:fixed:${userId}`;

    const result = await redis.eval(this.script, {
      keys: [key],
      arguments: [windowSec.toString(), limit.toString()],
    });

    return result === 1;
  }
}

export class SlidingWindow implements RatelimiterStrategy {
  private readonly script = `
    local key = KEYS[1]

    local now = tonumber(ARGV[1])
    local windowMs = tonumber(ARGV[2])
    local limit = tonumber(ARGV[3])
    local requestId = ARGV[4]

    -- Remove requests outside the sliding window
    redis.call(
      "ZREMRANGEBYSCORE",
      key,
      0,
      now - windowMs
    )

    -- Count requests inside the window
    local count = redis.call(
      "ZCARD",
      key
    )

    -- Limit reached
    if count >= limit then
      return 0
    end

    -- Add current request
    redis.call(
      "ZADD",
      key,
      now,
      requestId
    )

    -- Cleanup key after window
    redis.call(
      "EXPIRE",
      key,
      math.ceil(windowMs / 1000)
    )

    return 1
  `;

  async allowRequest(
    userId: string,
    windowSec: number,
    limit: number,
  ): Promise<boolean> {
    if (limit <= 0 || windowSec <= 0) {
      throw new Error("Invalid rate limiter configuration");
    }

    const key = `ratelimit:sliding:${userId}`;

    const now = Date.now();

    const result = await redis.eval(this.script, {
      keys: [key],

      arguments: [
        now.toString(),
        (windowSec * 1000).toString(),
        limit.toString(),
        crypto.randomUUID(),
      ],
    });

    return result === 1;
  }
}

export class TokenBucket implements RatelimiterStrategy {
  private readonly script = `
    local key = KEYS[1]

    local now = tonumber(ARGV[1])
    local windowSec = tonumber(ARGV[2])
    local capacity = tonumber(ARGV[3])

    -- Seconds required to generate one token
    local refillInterval = windowSec / capacity

    local bucket = redis.call(
      "HMGET",
      key,
      "token",
      "lastRefillTimestamp"
    )

    local tokens = bucket[1]
    local lastRefillTimestamp = bucket[2]

    -- First request
    if not tokens then

      redis.call(
        "HSET",
        key,
        "token", capacity - 1,
        "lastRefillTimestamp", now
      )

      redis.call(
        "EXPIRE",
        key,
        windowSec
      )

      return 1
    end

    tokens = tonumber(tokens)
    lastRefillTimestamp = tonumber(lastRefillTimestamp)

    -- Seconds elapsed since last refill
    local elapsed =
      (now - lastRefillTimestamp) / 1000

    -- Number of tokens to add
    local newTokens =
      math.floor(elapsed / refillInterval)

    -- Never exceed capacity
    local availableTokens =
      math.min(
        capacity,
        tokens + newTokens
      )

    -- No token available
    if availableTokens < 1 then
      return 0
    end

    -- Move timestamp forward only
    -- by the amount of time actually consumed
    local newLastRefillTimestamp =
      lastRefillTimestamp +
      newTokens * refillInterval * 1000

    -- Consume one token
    redis.call(
      "HSET",
      key,
      "token", availableTokens - 1,
      "lastRefillTimestamp",
        newLastRefillTimestamp
    )

    redis.call(
      "EXPIRE",
      key,
      windowSec
    )

    return 1
  `;

  async allowRequest(
    userId: string,
    windowSec: number,
    capacity: number,
  ): Promise<boolean> {
    if (capacity <= 0 || windowSec <= 0) {
      throw new Error("Invalid rate limiter configuration");
    }

    const key = `ratelimit:token:${userId}`;

    const result = await redis.eval(this.script, {
      keys: [key],

      arguments: [
        Date.now().toString(),
        windowSec.toString(),
        capacity.toString(),
      ],
    });

    return result === 1;
  }
}
