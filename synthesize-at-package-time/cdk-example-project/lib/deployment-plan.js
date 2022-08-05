const { Stack, Duration, CfnOutput, CfnResource } = require('aws-cdk-lib');
const sqs = require('aws-cdk-lib/aws-sqs');

class DeploymentPlan extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);


    new CfnResource(this, "DeploymentPlan",
      props = {
        type: "Attini::Deploy::DeploymentPlan",
        properties: {
          DeploymentPlan: {
            // From this point, the its normal Amazon state launge but with support for attini types https://docs.attini.io/api-reference/deployment-plan-types.html
            StartAt: "Deploy",
            States: {
              Deploy: {
                End: true,
                Properties: {
                  StackName: "CdkExampleProjectStack",
                  Template: "/cdk.out/CdkExampleProjectStack.template.json"
                },
                Type: "AttiniCfn"
              }
            }
          }
        }
      })

    // example resource
    const queue = new sqs.Queue(this, 'CdkExampleProjectQueue', {
      visibilityTimeout: Duration.seconds(300)
    });

    new CfnOutput(this, 'queueName', {
      value: queue.queueName,
      description: 'Queue name'
    });
  }
}

module.exports = { DeploymentPlan }
