#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { CdkExampleSQS } = require('../lib/cdk-example-sqs');
const { DeploymentPlan } = require('../lib/deployment-plan');

const app = new cdk.App();
new CdkExampleSQS(app, 'CdkExampleSQS', {});


const deploymentPlan = new DeploymentPlan(app, 'DeploymentPlan', {});

deploymentPlan.templateOptions = { transforms: ["AttiniDeploymentPlan", "AWS::Serverless-2016-10-31"] }