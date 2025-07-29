# Identity info
data "aws_caller_identity" "current" {}

# KMS Key
resource "aws_kms_key" "solace_decrypt_key" {
  description             = "KMS key for Solace Task A decryption"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid    = "AllowAccountFullAccess",
        Effect = "Allow",
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        },
        Action = "kms:*",
        Resource = "*"
      },
      {
        Sid    = "AllowLambdaDecrypt",
        Effect = "Allow",
        Principal = {
          Service = "lambda.amazonaws.com"
        },
        Action = ["kms:Decrypt"],
        Resource = "*",
        Condition = {
          StringEquals = {
            "kms:ViaService" = "lambda.us-east-1.amazonaws.com"
          }
        }
      }
    ]
  })
}

# KMS Alias
resource "aws_kms_alias" "solace_alias" {
  name          = "alias/solace/decrypt"
  target_key_id = aws_kms_key.solace_decrypt_key.id
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda_exec_role" {
  name = "solace-lambda-decrypt-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Principal = {
          Service = "lambda.amazonaws.com"
        },
        Effect = "Allow",
        Sid    = ""
      }
    ]
  })
}

# IAM Policy (includes GET, PUT, and logging)
resource "aws_iam_policy" "lambda_decrypt_policy" {
  name = "solace-lambda-decrypt-policy"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:ListBucket"
        ],
        Resource = [
          aws_s3_bucket.blob_store.arn,
          "${aws_s3_bucket.blob_store.arn}/*"
        ]
      },
      {
        Effect = "Allow",
        Action = ["kms:Decrypt"],
        Resource = aws_kms_key.solace_decrypt_key.arn
      },
      {
        Effect = "Allow",
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Resource = "*"
      }
    ]
  })
}

# Attach policy to role
resource "aws_iam_role_policy_attachment" "lambda_attach_policy" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = aws_iam_policy.lambda_decrypt_policy.arn
}

# Random suffix for S3 bucket name
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# S3 Bucket with encryption
resource "aws_s3_bucket" "blob_store" {
  bucket        = "solace-decrypt-blob-bucket-${random_id.bucket_suffix.hex}"
  force_destroy = true

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}

# NEW: Bucket Policy to allow Lambda to write to S3
resource "aws_s3_bucket_policy" "allow_lambda_put" {
  bucket = aws_s3_bucket.blob_store.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid       = "AllowLambdaPut",
        Effect    = "Allow",
        Principal = {
          AWS = aws_iam_role.lambda_exec_role.arn
        },
        Action    = ["s3:PutObject"],
        Resource  = "${aws_s3_bucket.blob_store.arn}/*"
      }
    ]
  })
}

# Lambda Function
resource "aws_lambda_function" "decrypt_blob" {
  function_name = "solace-decrypt-blob"
  runtime       = "python3.9"
  handler       = "decrypt_handler.lambda_handler"
  role          = aws_iam_role.lambda_exec_role.arn
  timeout       = 10
  memory_size   = 128

  filename         = "${path.module}/../src/decrypt_handler.zip"
  source_code_hash = filebase64sha256("${path.module}/../src/decrypt_handler.zip")

  environment {
    variables = {
      KMS_KEY_ID = aws_kms_key.solace_decrypt_key.id
      BUCKET     = aws_s3_bucket.blob_store.bucket
    }
  }
}

# Lambda Function URL (for public HTTPS access)
resource "aws_lambda_function_url" "decrypt_blob_url" {
  function_name      = aws_lambda_function.decrypt_blob.function_name
  authorization_type = "NONE"

  cors {
    allow_origins = ["http://localhost:5173"]
    allow_methods = ["POST"]
    allow_headers = ["Content-Type"]
  }
}
