const { Stack, Duration, CfnOutput } = require('aws-cdk-lib');
const sqs = require('aws-cdk-lib/aws-sqs');
const iam = require('aws-cdk-lib/aws-iam');


class CdkExampleProjectStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    const queue = new sqs.Queue(this, 'CdkExampleProjectQueue', {
      visibilityTimeout: Duration.seconds(300)
    });
    queue.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: [
          'sqs:sendMessage',
        ],
        principals: [new iam.ServicePrincipal('sns.amazonaws.com')],
        resources: ['*'],
      })
    )
    // const mySqsPolicy = new iam.PolicyDocument({
    //   statements: [new iam.PolicyStatement({
    //     actions: [
    //       'sqs:sendMessage',
    //     ],
    //     principals: [new iam.ServicePrincipal('sns.amazonaws.com')],
    //     resources: ['*'],
    //   })],
    // });


    // const queuePolicy = new sqs.CfnQueuePolicy(this, 'MyQueuePolicy', {
    //   policyDocument: mySqsPolicy,
    //   queues: ['queues'],
    // });


    new CfnOutput(this, 'queueArn', {
      value: queue.queueArn,
      description: 'Queue arn'
    });
  }
}

module.exports = { CdkExampleProjectStack }
