import { DynamoDB } from "@aws-sdk/client-dynamodb";

export function makeDynamoClient() {
  return new DynamoDB({
    // Explicitly specify endpoint to avoid rule evaluation (which uses create Function).
    endpoint: "https://dynamodb.us-east-2.amazonaws.com",
    region: "us-east-2",
    apiVersion: "2012-08-10",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}
