import { App } from "cdktf";

import { S3Stack } from "./stacks/s3-stack";
import { IamStack } from "./stacks/iam-stack";

const app = new App();

new S3Stack(app, "s3-stack");

new IamStack(app, "iam-stack");

app.synth();