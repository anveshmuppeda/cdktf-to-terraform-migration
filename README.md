# CDKTF → Terraform HCL Migration Project

## Overview

This project demonstrates a **real Infrastructure as Code (IaC) migration workflow** from **CDK for Terraform (CDKTF)** written in **TypeScript** to **native Terraform HCL**, while maintaining the **same infrastructure and Terraform remote state**.

The migration ensures that the infrastructure remains **unchanged** and Terraform HCL becomes the new source of truth.

The workflow covers:

* Creating infrastructure using **CDKTF stacks**
* Configuring **remote Terraform state using S3 and DynamoDB**
* Deploying infrastructure via CDKTF
* Writing **equivalent Terraform HCL**
* Importing resources into Terraform state when required
* Validating migration using `terraform plan`

---

# Architecture

```
CDKTF (TypeScript)
│
├── s3-stack
│   └── S3 Bucket
│
└── iam-stack
    ├── IAM Role
    ├── IAM Policy
    └── Policy Attachment
         │
         ▼
Terraform Remote State
│
├── S3 Bucket (State Storage)
└── DynamoDB Table (State Lock)
         │
         ▼
Terraform HCL
```

---

# Step 1 — Develop Infrastructure Using CDKTF

Initially, the infrastructure was created using **CDKTF with TypeScript**.

Two stacks were created:

```
cdktf-project
│
├── stacks
│   ├── iam-stack.ts
│   └── s3-stack.ts
│
└── main.ts
```

### Stacks Created

#### IAM Stack

Creates:

* IAM Role
* IAM Policy
* IAM Policy Attachment

#### S3 Stack

Creates:

* S3 bucket used for application infrastructure

---

# Step 2 — Configure Remote Terraform Backend

To manage Terraform state centrally, the backend was configured with:

* **S3 bucket** → stores Terraform state
* **DynamoDB table** → manages state locking

Example configuration used in CDKTF:

```typescript
new S3Backend(iamStack, {
  bucket: "cdktf-statefile-lock-bucket",
  key: "cdktf-migration/iam-stack/terraform.tfstate",
  region: "us-east-1",
  dynamodbTable: "terraform-lock-table",
  encrypt: true
});
```

This results in the following backend structure:

```
S3
cdktf-statefile-lock-bucket
│
├── cdktf-migration/iam-stack/terraform.tfstate
└── cdktf-migration/s3-stack/terraform.tfstate
```

The DynamoDB table ensures **safe concurrent Terraform operations**.

---

# Step 3 — Deploy Infrastructure Using CDKTF

The stacks were deployed using:

```bash
cdktf deploy s3-stack iam-stack
```

This created the infrastructure in AWS:

* S3 Bucket
* IAM Role
* IAM Policy
* IAM Policy Attachment

Terraform state was stored remotely in **S3**.

---

# Step 4 — Develop Equivalent Terraform HCL

Next, equivalent Terraform configuration was created to replace CDKTF.

Directory structure:

```
terraform-hcl
│
├── backend.tf
├── provider.tf
├── iam.tf
└── s3.tf
```

---

# Step 5 — Configure Terraform Backend in HCL

The Terraform configuration must connect to the **same backend used by CDKTF**.

### backend.tf

```hcl
terraform {

  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "cdktf-statefile-lock-bucket"
    key            = "cdktf-migration/iam-stack/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-lock-table"
    encrypt        = true
  }

}
```

This allows Terraform HCL to reuse the **existing Terraform state created by CDKTF**.

---

# Step 6 — Declare Equivalent Resources in HCL

The Terraform resources must use the **same resource names** as CDKTF so that Terraform state matches.

### iam.tf

```hcl
resource "aws_iam_role" "demoRole" {

  name = "cdktf-demo-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = "sts:AssumeRole"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })

}

resource "aws_iam_policy" "demoPolicy" {

  name = "cdktf-demo-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "s3:ListBucket",
        "s3:GetBucketLocation",
        "s3:HeadBucket"
      ]
      Resource = "*"
    }]
  })

}

resource "aws_iam_role_policy_attachment" "attachPolicy" {

  role       = aws_iam_role.demoRole.name
  policy_arn = aws_iam_policy.demoPolicy.arn

}
```

---

### s3.tf

```hcl
resource "aws_s3_bucket" "migrationBucket" {

  bucket = "cdktf-migration-demo-bucket-anvesh"

  tags = {
    env     = "dev"
    project = "cdktf-migration"
  }

}
```

---

# Step 7 — Import Existing S3 Resource Into Terraform State

Initially, the Terraform state contained only IAM resources.

```
terraform state list
```

Output:

```
aws_iam_policy.demoPolicy
aws_iam_role.demoRole
aws_iam_role_policy_attachment.attachPolicy
```

Since the **S3 bucket was created in another CDKTF stack**, Terraform did not yet track it.

The bucket was imported using:

```bash
terraform import aws_s3_bucket.migrationBucket cdktf-migration-demo-bucket-anvesh
```

After import:

```
terraform state list
```

Output:

```
aws_iam_policy.demoPolicy
aws_iam_role.demoRole
aws_iam_role_policy_attachment.attachPolicy
aws_s3_bucket.migrationBucket
```

Now Terraform fully manages all resources.

---

# Step 8 — Initialize Terraform

Initialize Terraform with the remote backend:

```bash
terraform init
```

Terraform connects to the **existing remote state in S3**.

---

# Step 9 — Run Terraform Plan

Run:

```bash
terraform plan
```

Expected output:

```
No changes. Your infrastructure matches the configuration.
```

This confirms:

* Terraform HCL matches the existing infrastructure
* Migration from CDKTF was successful
* Terraform can now manage the infrastructure safely

---

# Final Project Structure

```
cdktf-to-terraform-migration
│
├── cdktf
│   ├── stacks
│   │   ├── iam-stack.ts
│   │   └── s3-stack.ts
│   └── main.ts
│
└── terraform-hcl
    ├── backend.tf
    ├── provider.tf
    ├── iam.tf
    └── s3.tf
```

---

# Key Concepts Demonstrated

This project demonstrates several important DevOps concepts:

* CDKTF infrastructure development
* Multi-stack architecture
* Terraform remote backend configuration
* S3 state management
* DynamoDB state locking
* Terraform state inspection
* Terraform resource import
* IaC migration strategy
* Infrastructure drift validation

---

# Final Result

The infrastructure originally created with **CDKTF** is now fully managed by **Terraform HCL**, without any infrastructure changes.

```
terraform plan
→ No changes
```

This confirms a **successful Infrastructure as Code migration**.

---
