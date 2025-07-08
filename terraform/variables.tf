variable "domain" {
  type      = string
}

variable "ports" {
  type        = list(string)
  description = "Ports for EC2 instance"
}

variable "type" {
  type      = string
}

variable "SSH_KEY" {
  type        = string
  description = "The private ssh key for the EC2 instance"
}

variable "SSH_KEY_PUB" {
  type        = string
  description = "The public ssh key for the EC2 instance"
}

variable "AWS_REGION" {
  type      = string
}

variable "REPO_NAME" {
  type      = string
}

variable "FULL_REPO_NAME" {
  type      = string
}

variable "domain-frontend" {
  type      = string
}

variable "SSH_KEY_FRONTEND" {
  type        = string
  description = "The private ssh key for the EC2 instance"
}

variable "SSH_KEY_PUB_FRONTEND" {
  type        = string
  description = "The public ssh key for the EC2 instance"
}