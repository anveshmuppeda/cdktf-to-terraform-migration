import { Construct } from "constructs";
import { TerraformStack } from "cdktf";
import { AwsProvider } from "../.gen/providers/aws/provider";
import { S3Bucket } from "../.gen/providers/aws/s3-bucket";

export class S3Stack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new AwsProvider(this, "aws", {
      region: "us-east-1"
    });

    new S3Bucket(this, "migrationBucket", {
      bucket: "cdktf-migration-demo-bucket-anvesh",
      tags: {
        project: "cdktf-migration",
        env: "dev"
      }
    });

  }
}