const { Stack, Duration, CfnOutput } = require('aws-cdk-lib');
const sqs = require('aws-cdk-lib/aws-sqs');
const iam = require('aws-cdk-lib/aws-iam');


class CdkExampleSQS extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

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

    new CfnOutput(this, 'queueArn', {
      value: queue.queueArn,
      description: 'Queue arn'
    });
  }
}

module.exports = { CdkExampleSQS }
