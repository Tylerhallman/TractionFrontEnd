resource "aws_s3_bucket_public_access_block" "main" {
  bucket = aws_s3_bucket.main.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket" "main" {
  bucket        = var.name
  force_destroy = "true"

  # versioning {
  #   enabled = "true"
  # }

  tags = merge({
    Terraform = "1"
  }, var.tags)
}

resource "aws_s3_bucket_website_configuration" "main" {
  bucket = aws_s3_bucket.main.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_policy" "main" {
  bucket = aws_s3_bucket.main.id
  policy = <<POLICY
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Sid": "PublicReadGetObject",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::${var.name}/*"
        }
    ]
}
   POLICY
  depends_on = [
    aws_s3_bucket_public_access_block.main
  ]
}
