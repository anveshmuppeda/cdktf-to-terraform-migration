import { App } from "cdktf";
import { S3Stack } from "./stacks/s3-stack";

const app = new App();

new S3Stack(app, "s3-stack");

app.synth();