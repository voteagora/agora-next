import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

export default redis;

export class ViewTracker {
  private static DEDUP_KEY_PREFIX = "vseen";
  private static COUNTER_KEY_PREFIX = "vcount";
  private static DEDUP_TTL = 24 * 60 * 60; // 24 hours

  static async trackView(
    targetType: "topic",
    targetId: number,
    address?: string,
    ipHash?: string
  ): Promise<boolean> {
    try {
      let viewerKey: string;
      if (address) {
        viewerKey = `user:${address.toLowerCase()}`;
      } else if (ipHash) {
        viewerKey = `ip:${ipHash}`;
      } else {
        // Anonymous - always count as unique
        viewerKey = `anon:${Date.now()}:${Math.random()}`;
      }

      const targetKey = `${targetType}:${targetId}`;
      const dedupKey = `${this.DEDUP_KEY_PREFIX}:${targetKey}:${viewerKey}`;

      const counterKey = `${this.COUNTER_KEY_PREFIX}:${targetKey}`;

      const isNewView = await redis.setnx(dedupKey, "1");

      if (isNewView) {
        await redis.expire(dedupKey, this.DEDUP_TTL);
        await redis.incr(counterKey);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error tracking view in Redis:", error);
      throw error;
    }
  }

  static async getRedisOverlay(
    targetType: "topic",
    targetId: number
  ): Promise<number> {
    try {
      const targetKey = `${targetType}:${targetId}`;
      const counterKey = `${this.COUNTER_KEY_PREFIX}:${targetKey}`;
      const count = await redis.get(counterKey);
      return parseInt((count as string) || "0");
    } catch (error) {
      console.error("Error getting Redis overlay:", error);
      return 0;
    }
  }

  static async getAllTargetsWithOverlay(): Promise<
    Array<{
      targetType: "topic";
      targetId: number;
      overlayCount: number;
    }>
  > {
    try {
      const pattern = `${this.COUNTER_KEY_PREFIX}:*`;
      const keys = await redis.keys(pattern);

      const results = [];

      for (const key of keys) {
        // Parse: vcount:post:123
        const parts = key.split(":");
        if (parts.length !== 3) continue;

        const targetType = parts[1] as "topic";
        const targetId = parseInt(parts[2]);

        if (!targetType || !targetId || isNaN(targetId)) continue;

        const count = parseInt((await redis.get(key)) || "0");

        if (count > 0) {
          results.push({
            targetType,
            targetId,
            overlayCount: count,
          });
        }
      }

      return results;
    } catch (error) {
      console.error("Error getting all targets with overlay:", error);
      return [];
    }
  }

  static async resetCounters(
    targetType: "topic",
    targetId: number
  ): Promise<void> {
    try {
      const targetKey = `${targetType}:${targetId}`;
      const counterKey = `${this.COUNTER_KEY_PREFIX}:${targetKey}`;
      await redis.del(counterKey);
    } catch (error) {
      console.error("Error resetting counters:", error);
      throw error;
    }
  }
}
