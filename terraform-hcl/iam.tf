resource "aws_iam_role" "demoRole" {

  name = "cdktf-demo-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = "sts:AssumeRole"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

}

resource "aws_iam_policy" "demoPolicy" {

  name = "cdktf-demo-policy"

  policy = jsonencode({

    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:ListBucket",
          "s3:GetBucketLocation",
          "s3:HeadBucket"
        ]
        Resource = "*"
      }
    ]

  })

}

resource "aws_iam_role_policy_attachment" "attachPolicy" {

  role       = aws_iam_role.demoRole.name
  policy_arn = aws_iam_policy.demoPolicy.arn

}