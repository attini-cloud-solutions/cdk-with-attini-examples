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
            // From this point, its normal Amazon state launge but with support for attini types https://docs.attini.io/api-reference/deployment-plan-types.html
            StartAt: "Synth",
            States: {
              Synth: {
                Type: "AttiniRunnerJob",
                Properties: {
                  Runner: "ProjectRunner",
                  Commands: [
                    "cd cdk-example-project",
                    "npm install",
                    "cdk synth --quiet",
                    // The articat namesapce in attini artifact store (s3)
                    "DEPLOYMENT_NAMESPACE=${ATTINI_ARTIFACT_STORE}/${ATTINI_ENVIRONMENT_NAME}/${ATTINI_DISTRIBUTION_NAME}/${ATTINI_DISTRIBUTION_ID}",
                    "TEMPL_S3_PATH=s3://${DEPLOYMENT_NAMESPACE}/CdkExampleProjectStack.template.json",

                    "aws s3 cp cdk.out/CdkExampleProjectStack.template.json ${TEMPL_S3_PATH}"
                  ]
                },
                Next: "Deploy"
              },
              Deploy: {
                Type: "AttiniCfn",
                Properties: {
                  Template: "/../CdkExampleProjectStack.template.json",
                  StackName: "CdkExampleProjectStack"
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
          resources: [ `arn:aws:s3:::attini-artifact-store-${this.region}-${this.account}/*` ],
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
      taskRole: runnerRole,
      runtimePlatform: {
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
        cpuArchitecture: ecs.CpuArchitecture.ARM64,
      },
    });

    const container = runnerTaskDefinition.addContainer("RunnerTaskDefinition", {
      image: ecs.ContainerImage.fromRegistry("public.ecr.aws/amazonlinux/amazonlinux:latest"),
      environment: {
        "ATTINI_SCRIPT_TIMEOUT": "20"
      },
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
            JobTimeout: 3600,
            LogLevel: "INFO",
            MaxConcurrentJobs: 5
          },
          Installation: {
            // Workaround for bug, split into multible lines later.
            Commands: [
              "yum install -y amazon-linux-extras tar gzip unzip jq; curl -sL https://rpm.nodesource.com/setup_16.x | bash -; yum install -y nodejs; npm install -g aws-cdk; curl 'https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip' -o 'awscliv2.zip'; unzip awscliv2.zip; ./aws/install"
            ]
          }
        }
      }
    )
  }
}

module.exports = {
  DeploymentPlan
}