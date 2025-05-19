#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import { MakeenStack } from "../lib/makeen-stack";

const app = new App();
new MakeenStack(app, "MakeenStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
