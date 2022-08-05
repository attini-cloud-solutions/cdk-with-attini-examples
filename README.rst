cdk-with-attini-examples
==========================

In this project, we see an example in reference to Attini CDK documentation so we have 3 examples (attini projects).

#. synthesize-at-package-time
#. synthesize-and-deploy-with-attini-runner
#. synthesize-with-attini-runner


Deployment instructions
-------------------------

#. Log in to AWS with the AWS CLI

#. Have AWS CDK installed on your computer (or use a package container, find more info in attini-setup.yaml)

#. Install the Attini CLI and Attini Framework:

  .. code-block:: bash

      /bin/bash -c "$(curl -fsSL https://docs.attini.io/blob/attini-cli/install-cli.sh)"
      attini setup --give-admin-access --create-deployment-plan-default-role --create-init-deploy-default-role --accept-license-agreement

#. Decide which deployment option you want to use and open a terminal in that directory, then run:

  .. code-block:: bash

      attini deploy run .


The CDK example project
---------------------------

These 3 Attini project includes an example CDK project in the folder directory "cdk-example-project".
These projects were generated using the ``cdk init --language=javascript `` command, then we changed a few things.

#. Un-commented the SQS example resource.
#. Added and a Cloud​Formation Output.
#. Created a deployment-plan template (``lib/deployment-plan.js``).

  .. note::
    The deployment-plan template always have to to environment agnostic so we always synthesize it in the package phase.

#. Updated ``bin/cdk-example-project.js`` to include our deployment plan.

In "synthesize-and-deploy-with-attini-runner" and "synthesize-with-attini-runner"
we have also:

#. Un-commented the ``env`` configuration for the App.
#. Added ``**/cdk.out/**`` to .attini-ignore file.


.. note::

  In .attini-ignore we have added a line:

    ``**/node_modules/**``

  Because the node modules have "@" in them, which is not compatible with S3 object keys. And all
  files in an Attini distribution are stored on S3 during deployment.
