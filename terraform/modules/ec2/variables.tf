variable "name" {
  type        = string
  description = "Name of the EC2 Instance"
}

variable "subnet_ids" {
  type        = list(string)
  description = "Subnets which EC2 Instance will rezide in"
}

variable "tags" {
  type        = map(any)
  default     = {}
  description = "Tags for resources created"
}

variable "vpc_id" {
  type        = string
  description = "ID of VPC cluster will rezied in"
}

variable "ports" {
  type        = list(string)
  description = "Ports for EC2 instance"
}

variable "type" {
  type        = string
  description = "Type of the EC2 instance"
}

variable "domain" {
  type      = string
}

variable "domain-frontend" {
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

variable "SSH_KEY_FRONTEND" {
  type        = string
  description = "The private ssh key for the EC2 instance"
}

variable "SSH_KEY_PUB_FRONTEND" {
  type        = string
  description = "The public ssh key for the EC2 instance"
}

variable "REPO_NAME" {
  type      = string
}

variable "FULL_REPO_NAME" {
  type      = string
}