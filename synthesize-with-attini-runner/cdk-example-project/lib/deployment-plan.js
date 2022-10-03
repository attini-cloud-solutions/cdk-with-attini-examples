const {
  Stack,
  CfnResource,
  Fn
} = require('aws-cdk-lib');


const ecs = require('aws-cdk-lib/aws-ecs');
const iam = require('aws-cdk-lib/aws-iam');
const logs = require('aws-cdk-lib/aws-logs');

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
            // From this point, its normal Amazon state language but with support for attini types https://docs.attini.io/api-reference/deployment-plan-types.html
            StartAt: "SynthSQS",
            States: {
              SynthSQS: {
                Type: "AttiniRunnerJob",
                Properties: {
                  Runner: "ProjectRunner",
                  Commands: [
                    "cd cdk-example-project",
                    "npm install",
                    "cdk synth --quiet",
                    // The artifact namespace in attini artifact store (s3)
                    "DEPLOYMENT_NAMESPACE=${ATTINI_ARTIFACT_STORE}/${ATTINI_ENVIRONMENT_NAME}/${ATTINI_DISTRIBUTION_NAME}/${ATTINI_DISTRIBUTION_ID}",
                    "TEMPL_S3_PATH=s3://${DEPLOYMENT_NAMESPACE}/CdkExampleSQS.template.json",

                    "aws s3 cp cdk.out/CdkExampleSQS.template.json ${TEMPL_S3_PATH}"
                  ]
                },
                Next: "ParallelAction"
              },
              ParallelAction: {
                Type: "Parallel",
                Branches: [
                  {
                    StartAt: "DeploySQS",
                    States: {
                      DeploySQS: {
                        Type: "AttiniCfn",
                        Properties: {
                          Template: "/../CdkExampleSQS.template.json",
                          StackName: "CdkExampleSQS"
                        },
                        End: true
                      },
                    }
                  },
                  {
                    StartAt: "DeploySQS In Stockholm",
                    States: {
                      "DeploySQS In Stockholm": {
                        Type: "AttiniCfn",
                        Properties: {
                          Template: "/../CdkExampleSQS.template.json",
                          StackName: "CdkExampleSQS",
                          Region: "eu-north-1"
                        },
                        End: true
                      },
                    }
                  }
                ],
                Next: "MergeOutput"
              },
              MergeOutput: {
                Type: "AttiniMergeOutput",
                Next: "DeploySNS"
              },
              DeploySNS: {
                Type: "AttiniCfn",
                Properties: {
                  StackName: "LegacySNS",
                  Template: "/legacy-cfn-template.yaml",
                  Parameters: {
                    "SqsArn.$": "$.output.DeploySQS.queueArn",
                    "SqsArnStockholm.$": "$['output']['DeploySQS In Stockholm']['queueArn']"
                  }
                },
                End: true
              }
            }
          }
        }
      })


    const runnerCustomPolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          actions: [
            "s3:PutObject"
          ],
          resources: [`arn:aws:s3:::attini-artifact-store-${this.region}-${this.account}/*`],
        }),
        new iam.PolicyStatement({
          actions: [
            "sts:AssumeRole"
          ],
          resources: [`arn:aws:iam::${this.account}:role/cdk*`],
        }),
      ],
    });


    const runnerRole = new iam.Role(this, 'Role', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      description: 'Attini runner execution role',
      path: "/attini/",
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AmazonECSTaskExecutionRolePolicy"),
        iam.ManagedPolicy.fromManagedPolicyName(
          this, 'external-policy-by-name', `attini-runner-basic-execution-policy-${this.region}`)
      ],
      inlinePolicies: {
        "inline-policy": runnerCustomPolicy
      }
    });


    const runnerTaskDefinition = new ecs.FargateTaskDefinition(this, 'RunnerTaskDefinition', {
      memoryLimitMiB: 512,
      cpu: 256,
      executionRole: runnerRole,
      taskRole: runnerRole
    });


    runnerTaskDefinition.addContainer("RunnerTaskDefinition", {
      image: ecs.ContainerImage.fromRegistry("public.ecr.aws/attini/attini-labs:attini-and-cdk-example-2022-10-03"),
      logging: ecs.LogDrivers.awsLogs({
        logRetention: logs.RetentionDays.ONE_MONTH,
        streamPrefix: "attini",
      }),
    });


    new CfnResource(this, "ProjectRunner",
      props = {
        type: "Attini::Deploy::Runner",
        properties: {
          TaskDefinitionArn: Fn.ref(runnerTaskDefinition.node.defaultChild.logicalId).toString(),
          RunnerConfiguration: {
            IdleTimeToLive: 600,
          },
        }
      }
    )
  }
}

module.exports = {
  DeploymentPlan
}
