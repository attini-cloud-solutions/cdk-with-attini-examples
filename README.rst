cdk-with-attini-examples
==========================

In this project, we see an examples in reference to the `Attini CDK documentation <https://docs.attini.io/knowledge-bank/attini-and-the-aws-cdk.html>`_ so.

#. synthesize-at-package-time
#. synthesize-and-deploy-with-attini-runner
#. synthesize-with-attini-runner


Deployment instructions
-------------------------

#. Log in to AWS using AWS CLI.

#. Have AWS CDK installed on your computer (or use a package container, find more info in `attini-config <https://docs.attini.io/api-reference/attini-configuration.html#package>`_).

#. Install the Attini CLI and Attini Framework.

    .. code-block:: bash

        /bin/bash -c "$(curl -fsSL https://docs.attini.io/blob/attini-cli/install-cli.sh)"
        attini setup --give-admin-access --create-deployment-plan-default-role --create-init-deploy-default-role --accept-license-agreement

#. Decide which deployment option (project) you want to use and open a terminal in that directory.

#. Bootstrap the CDK.

      .. code-block:: bash

          cd cdk-example-project
          cdk bootstrap
          cd ..

#. Configure the Attini environment and run the deployment.

   (If you are using the Attini runner, you might need to create the default ECS cluster, just run ``aws ecs create-cluster``)

      .. code-block:: bash

          attini environment create dev --env-type test
          attini deploy run .


The CDK example project
---------------------------

These 3 Attini projects include an example CDK project in the directory "cdk-example-project".
These projects were generated using the ``cdk init --language=javascript`` command.

Then we changed the following:

#. Un-commented the SQS example resource.
#. Added a Cloud​Formation Output.
#. Created a deployment-plan template (``lib/deployment-plan.js``).

    .. note::
      The deployment-plan template has to be environment agnostic so, we synthesize it in the package phase.

#. Updated ``bin/cdk-example-project.js`` to include our deployment plan.

In "synthesize-and-deploy-with-attini-runner" and "synthesize-with-attini-runner"
we have also:

#. Un-commented the ``env`` configuration for the App.
#. Added ``**/cdk.out/**`` to .attini-ignore file.


  .. note::
    In .attini-ignore we have added a line:

    ``**/node_modules/**``

    Because the node_modules names have ``@`` in them, which is not compatible with S3 object keys, and all
    files in an Attini distribution are stored on S3 during deployment.
