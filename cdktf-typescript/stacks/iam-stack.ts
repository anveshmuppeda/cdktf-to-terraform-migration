import { Construct } from "constructs";
import { TerraformStack } from "cdktf";

import { AwsProvider } from "../.gen/providers/aws/provider";
import { IamRole } from "../.gen/providers/aws/iam-role";
import { IamPolicy } from "../.gen/providers/aws/iam-policy";
import { IamRolePolicyAttachment } from "../.gen/providers/aws/iam-role-policy-attachment";

export class IamStack extends TerraformStack {

  constructor(scope: Construct, id: string) {

    super(scope, id);

    new AwsProvider(this, "aws", {
      region: "us-east-1"
    });

    /*
       IAM Role
    */

    const role = new IamRole(this, "demoRole", {

      name: "cdktf-demo-role",

      assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: {
              Service: "ec2.amazonaws.com"
            },
            Action: "sts:AssumeRole"
          }
        ]
      })

    });

    /*
       IAM Policy
    */

    const policy = new IamPolicy(this, "demoPolicy", {

      name: "cdktf-demo-policy",

      policy: JSON.stringify({

        Version: "2012-10-17",

        Statement: [

          {
            Effect: "Allow",
            Action: [
              "s3:ListBucket"
            ],
            Resource: "*"
          }

        ]

      })

    });

    /*
       Attach Policy to Role
    */

    new IamRolePolicyAttachment(this, "attachPolicy", {

      role: role.name,

      policyArn: policy.arn

    });

  }

}