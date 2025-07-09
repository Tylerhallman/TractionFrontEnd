output "instances_public_ips" {
  description = "Public elastic ip"
  value = [for instance in module.ec2_instance : instance.public_ip]
}

