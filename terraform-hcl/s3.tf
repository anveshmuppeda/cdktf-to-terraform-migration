resource "aws_s3_bucket" "migrationBucket" {

  bucket = "cdktf-migration-demo-bucket-anvesh"

  tags = {
    env     = "dev"
    project = "cdktf-migration"
  }

}