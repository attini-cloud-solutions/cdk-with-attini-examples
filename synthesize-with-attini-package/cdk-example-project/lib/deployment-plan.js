const { Stack, CfnResource } = require('aws-cdk-lib');

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
            // From this point, the its normal Amazon state language but with support for attini types https://docs.attini.io/api-reference/deployment-plan-types.html
            StartAt: "DeploySQS",
            States: {
              DeploySQS: {
                Type: "AttiniCfn",
                Properties: {
                  StackName: "CdkExampleSQS",
                  Template: "/cdk.out/CdkExampleSQS.template.json"
                },
                Next: "DeploySNS"
              },
              DeploySNS: {
                Type: "AttiniCfn",
                Properties: {
                  StackName: "LegacySNS",
                  Template: "/legacy-cfn-template.yaml",
                  Parameters: {
                      "SqsArn.$": "$.output.DeploySQS.queueArn"
                  }
                },
                End: true
              }
            }
          }
        }
      })
  }
}

module.exports = { DeploymentPlan }
