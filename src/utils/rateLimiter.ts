import {
  FixedWindow,
  RatelimiterStrategy,
  SlidingWindow,
  TokenBucket,
} from "./rateLimiterStrategys";

type RateLimiterType = "FIXED_WINDOW" | "SLIDING_WINDOW" | "TOKEN_BUCKET";

class RateLimiterStrategysFactory {
  static create(strategy: RateLimiterType) {
    switch (strategy) {
      case "FIXED_WINDOW":
        return new FixedWindow();
      case "SLIDING_WINDOW":
        return new SlidingWindow();
      case "TOKEN_BUCKET":
        return new TokenBucket();
      default:
        throw new Error("Invalid Strategy ");
    }
  }
}

class RateLimiter {
  constructor(private readonly strategy: RatelimiterStrategy) {}

  async allowRequest(
    userId: string,
    windowSec: number,
    limit: number,
  ): Promise<boolean> {
    return this.strategy.allowRequest(userId, windowSec, limit);
  }
}

export function rateLimiter(strategy: RateLimiterType = "SLIDING_WINDOW") {
  const ratelimiterStrategy = RateLimiterStrategysFactory.create(strategy);

  return new RateLimiter(ratelimiterStrategy);
}
