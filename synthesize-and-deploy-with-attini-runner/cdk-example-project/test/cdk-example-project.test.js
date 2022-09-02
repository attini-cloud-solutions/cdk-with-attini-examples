const cdk = require('aws-cdk-lib');
const { Template } = require('aws-cdk-lib/assertions');
const CdkExampleProject = require('../lib/cdk-example-sqs.js');

// example test. To run these tests, uncomment this file along with the
// example resource in lib/cdk-example-project-stack.js
test('SQS Queue Created', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new CdkExampleProject.CdkExampleSQS(app, 'CdkExampleProjectQueue');
  // THEN
  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::SQS::Queue', {
    VisibilityTimeout: 300
  });
});
