# Infrastructure Migration Leadership Guide

### CDKTF → Terraform HCL Migration (20+ Stacks, 100+ Resources)

## Overview

This document outlines the **questions, planning approach, and execution strategy** for leading a migration from **CDK for Terraform (CDKTF)** to **native Terraform HCL** across a large infrastructure containing **20+ stacks and 100+ resources**.

The goal of the migration is to:

* Maintain **existing infrastructure without recreation**
* Reuse the **existing Terraform state**
* Ensure **zero downtime**
* Validate migration with **`terraform plan → No changes`**

This guide helps you prepare for:

* Team ownership discussions
* Migration planning
* Execution strategy
* Risk management

---

# 1. Questions the Team Will Likely Ask You

When you lead the migration effort, your team will likely ask architectural and operational questions.

## 1.1 Why Are We Migrating from CDKTF to Terraform HCL?

Possible reasons include:

* Standardizing infrastructure code
* Wider Terraform community support
* Easier onboarding for new engineers
* Better CI/CD ecosystem integration
* Reduced dependency on TypeScript runtime

Expected explanation:

The migration keeps the **same infrastructure and state**, but changes the **IaC implementation layer**.

---

## 1.2 Will the Migration Cause Downtime?

Expected answer:

No downtime is expected.

Migration will reuse the **existing Terraform state** and validate infrastructure consistency using:

```
terraform plan
```

The expected result should be:

```
No changes. Your infrastructure matches the configuration.
```

---

## 1.3 How Will We Ensure Infrastructure Is Not Recreated?

Strategy:

* Reuse the **existing remote Terraform state**
* Maintain **same resource names and addresses**
* Validate with `terraform plan`
* Import missing resources if necessary

---

## 1.4 How Will Multiple Stacks Be Handled?

Current CDKTF architecture likely looks like:

```
network-stack
iam-stack
eks-stack
app-stack
monitoring-stack
```

Options:

1. Maintain **separate Terraform states per stack** (recommended)
2. Merge multiple states into one (not recommended initially)
3. Convert stacks into modules after migration

Recommended approach:

Keep the **same stack-based state structure during migration**.

---

## 1.5 How Will Terraform State Be Managed?

State should remain in the existing backend:

* **S3 bucket** for state storage
* **DynamoDB table** for state locking

Example backend configuration:

```
backend "s3" {
  bucket         = "infra-state-bucket"
  key            = "env/prod/network.tfstate"
  region         = "us-east-1"
  dynamodb_table = "terraform-lock-table"
}
```

---

## 1.6 What Happens If Resource Addresses Change?

Example:

```
aws_iam_role.demoRole
→ module.iam.aws_iam_role.demoRole
```

Fix:

```
terraform state mv
```

This updates the **state address without recreating infrastructure**.

---

# 2. Questions You Should Ask Your Team

Before starting the migration, gather important details about the current infrastructure.

---

## 2.1 How Many Stacks Exist?

Example inventory:

```
network-stack
iam-stack
eks-stack
application-stack
monitoring-stack
logging-stack
```

Understanding stack boundaries helps define migration order.

---

## 2.2 How Many Resources Exist Per Stack?

Example:

```
Stack Name      Resources
network-stack   20
iam-stack       10
eks-stack       35
app-stack       25
monitoring      15
```

This helps estimate migration complexity.

---

## 2.3 Are There Stack Dependencies?

Example:

```
network-stack → eks-stack → application-stack
iam-stack     → eks-stack
```

Migration should follow dependency order.

---

## 2.4 What Is the Current Backend Structure?

Example:

```
infra-state-bucket
│
├── env/prod/network.tfstate
├── env/prod/iam.tfstate
├── env/prod/eks.tfstate
└── env/prod/app.tfstate
```

Understanding this ensures Terraform HCL connects to the **correct state file**.

---

## 2.5 Are There Multiple Environments?

Confirm environment separation:

```
dev
stage
prod
```

Each environment should have **separate state files**.

---

## 2.6 Is CI/CD Integrated With CDKTF?

Example pipelines may use:

* GitHub Actions
* Jenkins
* GitLab CI

Migration must update pipelines from:

```
cdktf deploy
```

to:

```
terraform plan
terraform apply
```

---

# 3. Recommended Migration Strategy

A safe enterprise migration follows these phases.

---

## Phase 1 — Infrastructure Inventory

Create documentation:

```
Stack Name | Resources | State File
-----------------------------------
network    | 20        | network.tfstate
iam        | 10        | iam.tfstate
eks        | 35        | eks.tfstate
app        | 25        | app.tfstate
```

---

## Phase 2 — Generate Terraform Equivalent

Run:

```
cdktf synth
```

Inspect generated Terraform configuration inside:

```
cdktf.out/stacks/
```

Use this as reference to create HCL.

---

## Phase 3 — Connect Terraform HCL to Existing Backend

Each Terraform stack should reuse the existing state.

Example:

```
backend "s3" {
  bucket         = "infra-state-bucket"
  key            = "env/prod/iam.tfstate"
  region         = "us-east-1"
  dynamodb_table = "terraform-lock-table"
}
```

---

## Phase 4 — Validate Using Terraform Plan

Run:

```
terraform plan
```

Expected result:

```
No changes
```

This confirms migration safety.

---

## Phase 5 — Import Missing Resources

If Terraform does not detect some resources, import them.

Example:

```
terraform import aws_s3_bucket.logs logs-bucket
```

---

## Phase 6 — Update CI/CD Pipelines

Old pipeline:

```
cdktf deploy
```

New pipeline:

```
terraform init
terraform plan
terraform apply
```

---

# 4. Execution Plan for Large Infrastructure

Recommended migration order:

### Step 1 — Small Stack

Start with a simple stack such as:

```
iam-stack
```

---

### Step 2 — Medium Complexity Stacks

Example:

```
s3-stack
monitoring-stack
logging-stack
```

---

### Step 3 — Complex Stacks

Example:

```
network-stack
eks-stack
application-stack
```

---

### Step 4 — Final Validation

Run `terraform plan` across all stacks to confirm:

```
No changes
```

---

# 5. Key Risks to Watch For

## Resource Address Changes

Changing structure may require:

```
terraform state mv
```

---

## State Drift

Manual changes in AWS can cause differences.

Detect using:

```
terraform plan
```

---

## Stack Dependency Failures

Migration order must respect dependencies.

---

## Secret Management

Confirm correct handling of:

* Parameter Store
* Secrets Manager
* Environment variables

---

## Provider Version Differences

Ensure consistent provider versions:

```
required_providers
```

---

# 6. Leadership Review Questions You May Be Asked

## How Will Migration Success Be Verified?

Answer:

```
terraform plan must show no changes
```

---

## What Is the Rollback Plan?

Answer:

The original **CDKTF repository remains unchanged** until Terraform migration is validated.

---

## How Will 100+ Resources Be Migrated Safely?

Answer:

Migration will follow a **stack-by-stack approach**, validating each stack before moving to the next.

---

# 7. Where to Start

Recommended starting checklist:

1. Inventory all stacks
2. Document resources and state files
3. Identify dependencies
4. Start migration with smallest stack
5. Validate using `terraform plan`
6. Resolve differences with imports or state moves

---

# Final Recommendation

Focus on three key principles:

```
State safety
Incremental migration
Clear validation
```

Following these principles ensures a **safe and successful migration from CDKTF to Terraform HCL**.

---
