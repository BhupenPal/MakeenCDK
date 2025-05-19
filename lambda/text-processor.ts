import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const dynamoClient = new DynamoDBClient();
const TABLE_NAME = process.env.TABLE_NAME!;

export const handler: APIGatewayProxyHandler = async (event) => {
  const headers = event.headers;
  const contentType = headers["content-type"] || headers["Content-Type"];

  if (!contentType || !contentType.includes("text/plain")) {
    return { statusCode: 400, body: "Only text/plain content-type allowed" };
  }

  if (!event.body) {
    return { statusCode: 400, body: "Missing file body" };
  }

  const content = Buffer.from(event.body, "base64").toString("utf-8");
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const suspiciousPatterns = /<script|<\/script|<\?php|<iframe|<img/i;
  if (suspiciousPatterns.test(content)) {
    return {
      statusCode: 400,
      body: "Invalid content: suspicious patterns found",
    };
  }

  for (const line of lines) {
    const item = {
      id: { S: Date.now().toString() + Math.random() },
      line: { S: line },
    };

    const command = new PutItemCommand({
      TableName: TABLE_NAME,
      Item: item,
    });

    await dynamoClient.send(command);
  }

  return { statusCode: 200, body: "File processed successfully" };
};
