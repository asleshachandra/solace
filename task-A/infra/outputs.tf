output "s3_bucket_name" {
  value = aws_s3_bucket.blob_store.bucket
}

output "lambda_function_name" {
  value = aws_lambda_function.decrypt_blob.function_name
}

output "kms_key_id" {
  value = aws_kms_key.solace_decrypt_key.key_id
}

output "lambda_function_url" {
  value = aws_lambda_function_url.decrypt_blob_url.function_url
}
