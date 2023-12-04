import { PrismaClient } from "@prisma/client";
import { performance } from "perf_hooks";
import * as util from "util";

let prisma: any;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  prisma = new PrismaClient().$extends({
    query: {
      $allModels: {
        async $allOperations({ operation, model, args, query }) {
          const start = performance.now();
          const result = await query(args);
          const end = performance.now();
          const time = end - start;
          console.log(
            util.inspect(
              { model, operation, args, time },
              { showHidden: false, depth: null, colors: true }
            )
          );
          return result;
        },
      },
    },
  });
}

export default prisma;

// Prisma BigInt serialization
BigInt.prototype.toJSON = function () {
  return this.toString();
};
