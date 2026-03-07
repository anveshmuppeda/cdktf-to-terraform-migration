import { App, S3Backend } from "cdktf";
import { S3Stack } from "./stacks/s3-stack";
import { IamStack } from "./stacks/iam-stack";

const app = new App();

/*
Stacks
*/

const s3Stack = new S3Stack(app, "s3-stack");
const iamStack = new IamStack(app, "iam-stack");

/*
Remote Backend Configuration
*/

const backendConfig = {
  bucket: "cdktf-statefile-lock-bucket",
  region: "us-east-1",
  dynamodbTable: "terraform-lock-table",
  encrypt: true
};

new S3Backend(s3Stack, {
  ...backendConfig,
  key: "cdktf-migration/s3-stack/terraform.tfstate"
});

new S3Backend(iamStack, {
  ...backendConfig,
  key: "cdktf-migration/iam-stack/terraform.tfstate"
});

app.synth();