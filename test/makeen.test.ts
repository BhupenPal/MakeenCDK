import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as Makeen from "../lib/makeen-stack";

describe("MakeenStack", () => {
  const app = new cdk.App();
  const stack = new Makeen.MakeenStack(app, "MyTestStack");
  const template = Template.fromStack(stack);

  const dynamoResources = template.findResources("AWS::DynamoDB::Table");
  const dynamoTableLogicalId = Object.keys(dynamoResources)[0];
  const tableResource = dynamoResources[dynamoTableLogicalId];

  const lambdaResources = template.findResources("AWS::Lambda::Function");
  const lambdaLogicalId = Object.keys(lambdaResources)[0];
  const lambdaResource = lambdaResources[lambdaLogicalId];

  const apiGatewayResources = template.findResources(
    "AWS::ApiGateway::RestApi"
  );
  const apiGatewayLogicalId = Object.keys(apiGatewayResources)[0];
  const apiGatewayResource = apiGatewayResources[apiGatewayLogicalId];

  test("DynamoDB Table Created", () => {
    template.hasResourceProperties("AWS::DynamoDB::Table", {
      KeySchema: [
        {
          AttributeName: "id",
          KeyType: "HASH",
        },
      ],
      AttributeDefinitions: [
        {
          AttributeName: "id",
          AttributeType: "S",
        },
      ],
    });
  });

  test("DynamoDB Table has Deletion Policy", () => {
    expect(tableResource.DeletionPolicy).toBe("Delete");
  });

  test("Lambda Function Created", () => {
    template.hasResourceProperties("AWS::Lambda::Function", {
      Runtime: "nodejs18.x",
      Handler: "text-processor.handler",
      Environment: {
        Variables: {
          TABLE_NAME: {
            Ref: dynamoTableLogicalId,
          },
        },
      },
    });
  });

  test("Lambda Function has Deletion Policy", () => {
    expect(lambdaResource.DeletionPolicy).toBe("Delete");
  });

  test("API Gateway Created", () => {
    template.hasResourceProperties("AWS::ApiGateway::RestApi", {
      Name: "Text Upload Service",
    });
  });

  test("API Gateway has CORS Configuration", () => {
    template.hasResourceProperties("AWS::ApiGateway::Method", {
      HttpMethod: "OPTIONS",
      Integration: {
        IntegrationResponses: [
          {
            ResponseParameters: {
              "method.response.header.Access-Control-Allow-Headers":
                "'Authorization,Content-Type'",
              "method.response.header.Access-Control-Allow-Methods":
                "'OPTIONS,GET,POST'",
              "method.response.header.Access-Control-Allow-Origin": "'*'",
            },
          },
        ],
      },
    });
  });

  test("API Gateway has Health Endpoint", () => {
    template.hasResourceProperties("AWS::ApiGateway::Resource", {
      PathPart: "health",
    });
  });

  test("API Gateway has Upload Endpoint", () => {
    template.hasResourceProperties("AWS::ApiGateway::Resource", {
      PathPart: "upload",
    });
  });

  test("API Gateway has Deletion Policy", () => {
    expect(apiGatewayResource.DeletionPolicy).toBe("Delete");
  });
});
