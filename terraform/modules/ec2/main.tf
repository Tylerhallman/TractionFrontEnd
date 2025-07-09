data "aws_vpc" "this" {
  id = var.vpc_id
}

data "aws_ssm_parameter" "ubuntu_24_04_ami" {
  name = "/aws/service/canonical/ubuntu/server/noble/stable/current/amd64/hvm/ebs-gp3/ami-id"
}

module "key_pair" {
  source = "terraform-aws-modules/key-pair/aws"

  key_name           = "${var.name}-key"
  public_key = var.SSH_KEY_PUB
}

module "ec2_instance" {
  source = "terraform-aws-modules/ec2-instance/aws"

  name  = var.name
  count = 1

  ami                         = data.aws_ssm_parameter.ubuntu_24_04_ami.value
  instance_type               = var.type
  key_name                    = module.key_pair.key_pair_name
  vpc_security_group_ids      = [resource.aws_security_group.this.id]
  subnet_id                   = element(tolist(var.subnet_ids), 0)
  associate_public_ip_address = true
  monitoring                  = true
  user_data_replace_on_change = true
  user_data                   = <<-EOT
    #!/bin/bash

    # Install docker, nginx, git

    sudo apt-get update
    sudo apt-get install ca-certificates curl -y
    sudo install -m 0755 -d /etc/apt/keyrings
    sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    sudo chmod a+r /etc/apt/keyrings/docker.asc

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update

    sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin nginx git certbot htop -y
    sudo groupadd docker
    sudo usermod -aG docker ubuntu

    # Enable docker to start with system

    sudo systemctl enable docker.service
    sudo systemctl enable containerd.service
    sudo systemctl start docker
        
    # Set up ssh access to git account

    cd /home/ubuntu/
    echo "${var.SSH_KEY}" > ./.ssh/id_rsa
    echo "${var.SSH_KEY_PUB}" > ./.ssh/id_rsa.pub
    sudo chmod 600 ./.ssh/id_rsa
    sudo  chown -R ubuntu:ubuntu ./.ssh


    echo "${var.SSH_KEY_FRONTEND}" > ./.ssh/id_rsa2
    echo "${var.SSH_KEY_PUB_FRONTEND}" > ./.ssh/id_rsa2.pub
    sudo chmod 600 ./.ssh/id_rsa2
    sudo  chown -R ubuntu:ubuntu ./.ssh

    echo 'Host github.com-backend
      HostName github.com
      User git
      IdentityFile ~/.ssh/id_rsa
      IdentitiesOnly yes
      
      Host github.com-frontend
      HostName github.com
      User git
      IdentityFile ~/.ssh/id_rsa2
      IdentitiesOnly yes' > ./.ssh/config 

    sudo -u ubuntu ssh -o StrictHostKeyChecking=no -T git@github.com-backend

    # Add key for ssh server access

    echo "${var.SSH_KEY_PUB_FRONTEND}" >> ./.ssh/authorized_keys

    # Pull project repos
    
    sudo -u ubuntu git clone git@github.com:${var.FULL_REPO_NAME}
    cd ./${var.REPO_NAME}
    sudo -u ubuntu git checkout main
    sudo docker compose up -d
    cd ..


    sudo -u ubuntu ssh -o StrictHostKeyChecking=no -T git@github.com-frontend

    sudo -u ubuntu git clone git@github.com:Tylerhallman/Tractionwebplatform.git
    cd ./Tractionwebplatform
    sudo -u ubuntu git checkout frontend_platform
    sudo docker compose up -d

    # Download the certificates

    sudo systemctl stop nginx; sudo  certbot certonly --standalone -d ${var.domain} --staple-ocsp -m example@gmail.com --agree-tos; sudo systemctl restart nginx
    sudo systemctl stop nginx; sudo  certbot certonly --standalone -d ${var.domain-frontend} --staple-ocsp -m example@gmail.com --agree-tos; sudo systemctl restart nginx
    sudo systemctl stop nginx; sudo  certbot certonly --standalone -d www.${var.domain-frontend} --staple-ocsp -m example@gmail.com --agree-tos; sudo systemctl restart nginx


    # Add cronjob for certificates renewal

    echo "0 12 * * * sudo systemctl stop nginx; /usr/bin/certbot renew --quiet; sudo systemctl restart nginx" | crontab -

    # Add nginx .conf files for api

    sudo chmod 777 /etc/nginx/conf.d/

    sudo rm /etc/nginx/sites-enabled/default

    cat << 'EOF' > /etc/nginx/conf.d/app-api.conf
    server {
      listen 80 ;
      server_name ${var.domain};
      return 301 https://$host$request_uri;
    }

    server {
      listen 443 ssl;
      server_name ${var.domain};
      ssl_certificate /etc/letsencrypt/live/${var.domain}/fullchain.pem;
      ssl_certificate_key /etc/letsencrypt/live/${var.domain}/privkey.pem;

      location / {
        proxy_pass http://127.0.0.1:3100/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Optional Timeouts
        send_timeout 5m;
        proxy_read_timeout 240;
        proxy_send_timeout 240;
        proxy_connect_timeout 240;

        if ($request_method = 'OPTIONS') {
          add_header 'Access-Control-Allow-Origin' '*' always;
          add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
          add_header 'Access-Control-Allow-Headers' 'Authorization,Content-Type,Accept,Origin,X-Requested-With' always;
          add_header 'Access-Control-Max-Age' 1728000;
          add_header 'Content-Length' 0;
          add_header 'Content-Type' 'text/plain charset=UTF-8';
          return 204;
        }

        # Optional Headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization,Content-Type,Accept,Origin,X-Requested-With' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;

        proxy_cache_bypass $cookie_session;
        proxy_no_cache $cookie_session;
        proxy_buffers 32 4k;
      }
    }
    EOF

    echo 'server {
    listen 80 default_server;
    server_name localhost;
    return 301 https://$host$request_uri;
    }

    server {
    listen 443 ssl;
    server_name ${var.domain-frontend};
    ssl_certificate /etc/letsencrypt/live/${var.domain-frontend}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${var.domain-frontend}/privkey.pem;

      location / {
          proxy_pass http://127.0.0.1:3000/;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;

          # Optional Timeouts
          send_timeout 5m;
          proxy_read_timeout 240;
          proxy_send_timeout 240;
          proxy_connect_timeout 240;

          # Optional Headers
          add_header Access-Control-Allow-Origin * always;
          add_header Access-Control-Allow-Headers * always;

          proxy_cache_bypass $cookie_session;
          proxy_no_cache $cookie_session;
          proxy_buffers 32 4k;
        }
      }
      
    server {
    listen 443 ssl;
    server_name www.${var.domain-frontend};
    ssl_certificate /etc/letsencrypt/live/www.${var.domain-frontend}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.${var.domain-frontend}/privkey.pem;

      location / {
          proxy_pass http://127.0.0.1:3000/;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;

          # Optional Timeouts
          send_timeout 5m;
          proxy_read_timeout 240;
          proxy_send_timeout 240;
          proxy_connect_timeout 240;

          # Optional Headers
          add_header Access-Control-Allow-Origin * always;
          add_header Access-Control-Allow-Headers * always;

          proxy_cache_bypass $cookie_session;
          proxy_no_cache $cookie_session;
          proxy_buffers 32 4k;
        }
      }' > /etc/nginx/conf.d/app.conf

    sudo systemctl restart nginx


    # sudo -u ubuntu newgrp docker
  EOT

    root_block_device = {
      size = 30
      # tags = {
      #   Name = "my-root-block"
      # }
    }
    enable_volume_tags = false


  # tags = merge({
  #   Terraform = "1"
  # }, var.tags)
}


resource "aws_security_group" "this" {
  name   = "${var.name}-ec2-sg"
  vpc_id = var.vpc_id
  tags = merge({
    Terraform = "1"
  }, var.tags)
}

resource "aws_security_group_rule" "egress" {
  security_group_id = aws_security_group.this.id
  from_port         = 0
  to_port           = 65535
  type              = "egress"
  protocol          = "TCP"
  cidr_blocks       = ["0.0.0.0/0"]
}

# locals {
#   ports = toset(["22", "80", "443", "8080", "65402", "9443"])
# }

resource "aws_security_group_rule" "ingress" {
  for_each          = toset(var.ports)
  security_group_id = aws_security_group.this.id
  from_port         = each.value
  to_port           = each.value
  protocol          = "TCP"
  type              = "ingress"
  cidr_blocks       = ["0.0.0.0/0"]
}

resource "aws_eip" "ip" {
  instance = module.ec2_instance[0].id
  domain   = "vpc"
}

