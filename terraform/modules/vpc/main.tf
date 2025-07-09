module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.7.0"
  name    = var.name
  cidr    = "10.0.0.0/16"

  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
  azs             = [for i in data.aws_availability_zones.this.zone_ids : "${i}"]

  # enable_nat_gateway = false
  # single_nat_gateway = false

  tags = merge({
    Terraform = "1"
  }, var.tags)
  private_subnet_tags = {
    SubnetType = "Private"
  }
  public_subnet_tags = {
    SubnetType = "Public"
  }
}

data "aws_region" "this" {}
data "aws_availability_zones" "this" {
  state = "available"
  filter {
    name   = "region-name"
    values = toset([data.aws_region.this.name])
  }
}
