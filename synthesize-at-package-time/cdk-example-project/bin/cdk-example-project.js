#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { CdkExampleProjectStack } = require('../lib/cdk-example-project-stack');
const { DeploymentPlan } = require('../lib/deployment-plan');

const app = new cdk.App();
new CdkExampleProjectStack(app, 'CdkExampleProjectStack', {

  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});


const deploymentPlan = new DeploymentPlan(app, 'DeploymentPlan', {});

deploymentPlan.templateOptions = { transforms: ["AttiniDeploymentPlan", "AWS::Serverless-2016-10-31"] }