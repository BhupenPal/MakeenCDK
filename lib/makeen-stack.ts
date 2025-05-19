import { Construct } from "constructs";
import { Stack, StackProps, RemovalPolicy, CfnOutput } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";

function cleanup(
  resources: (dynamodb.Table | lambda.Function | apigateway.RestApi)[]
) {
  resources.forEach((resource) => {
    resource.applyRemovalPolicy(RemovalPolicy.DESTROY);
  });
}

function setupDynamoDBTable(scope: Construct) {
  const table = new dynamodb.Table(scope, "TextLinesTable", {
    partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
    removalPolicy: RemovalPolicy.DESTROY,
  });

  return table;
}

function setupLambdaFunction(scope: Construct, table: dynamodb.Table) {
  const lambdaFn = new lambda.Function(scope, "TextProcessorFunction", {
    runtime: lambda.Runtime.NODEJS_18_X,
    handler: "text-processor.handler",
    code: lambda.Code.fromAsset("lambda"),
    environment: {
      TABLE_NAME: table.tableName,
    },
  });

  lambdaFn.addToRolePolicy(
    new iam.PolicyStatement({
      actions: ["dynamodb:PutItem"],
      resources: [table.tableArn],
    })
  );

  return lambdaFn;
}

function setupApiGateway(scope: Construct, lambdaFn: lambda.Function) {
  const api = new apigateway.RestApi(scope, "TextUploadApi", {
    restApiName: "Text Upload Service",
    defaultCorsPreflightOptions: {
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowMethods: ["OPTIONS", "GET", "POST"],
      allowHeaders: ["Authorization", "Content-Type"],
    },
  });

  const health = api.root.addResource("health");
  health.addMethod("GET", new apigateway.MockIntegration());

  const upload = api.root.addResource("upload");
  upload.addMethod("POST", new apigateway.LambdaIntegration(lambdaFn));

  return api;
}

export class MakeenStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const table = setupDynamoDBTable(this);
    const lambdaFn = setupLambdaFunction(this, table);
    const api = setupApiGateway(this, lambdaFn);

    cleanup([table, lambdaFn, api]);
  }
}
