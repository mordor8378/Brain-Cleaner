terraform {
  // aws 라이브러리 불러옴
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

# AWS 설정 시작
provider "aws" {
  region = var.region
}
# AWS 설정 끝

# VPC 설정 시작
resource "aws_vpc" "blog_vpc" {
  cidr_block = "10.0.0.0/16"

  # 무조건 켜세요.
  enable_dns_support = true
  # 무조건 켜세요.
  enable_dns_hostnames = true

  tags = {
    Name = "${var.prefix}-blog-vpc"
  }
}

resource "aws_subnet" "blog_subnet_a" {
  vpc_id                  = aws_vpc.blog_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.region}a"
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.prefix}-blog-subnet-a"
  }
}

resource "aws_subnet" "blog_subnet_b" {
  vpc_id                  = aws_vpc.blog_vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "${var.region}b"
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.prefix}-blog-subnet-b"
  }
}

resource "aws_subnet" "blog_subnet_c" {
  vpc_id                  = aws_vpc.blog_vpc.id
  cidr_block              = "10.0.3.0/24"
  availability_zone       = "${var.region}c"
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.prefix}-blog-subnet-c"
  }
}

resource "aws_subnet" "blog_subnet_d" {
  vpc_id                  = aws_vpc.blog_vpc.id
  cidr_block              = "10.0.4.0/24"
  availability_zone       = "${var.region}d"
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.prefix}-blog-subnet-d"
  }
}

resource "aws_internet_gateway" "blog_igw" {
  vpc_id = aws_vpc.blog_vpc.id

  tags = {
    Name = "${var.prefix}-blog-igw"
  }
}

resource "aws_route_table" "blog_rt" {
  vpc_id = aws_vpc.blog_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.blog_igw.id
  }

  tags = {
    Name = "${var.prefix}-blog-rt"
  }
}

resource "aws_route_table_association" "blog_assoc_a" {
  subnet_id      = aws_subnet.blog_subnet_a.id
  route_table_id = aws_route_table.blog_rt.id
}

resource "aws_route_table_association" "blog_assoc_b" {
  subnet_id      = aws_subnet.blog_subnet_b.id
  route_table_id = aws_route_table.blog_rt.id
}

resource "aws_route_table_association" "blog_assoc_c" {
  subnet_id      = aws_subnet.blog_subnet_c.id
  route_table_id = aws_route_table.blog_rt.id
}

resource "aws_route_table_association" "blog_assoc_d" {
  subnet_id      = aws_subnet.blog_subnet_d.id
  route_table_id = aws_route_table.blog_rt.id
}

resource "aws_security_group" "blog_sg" {
  name = "${var.prefix}-blog-sg"

  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "all"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "all"
    cidr_blocks = ["0.0.0.0/0"]
  }

  vpc_id = aws_vpc.blog_vpc.id

  tags = {
    Name = "${var.prefix}-blog-sg"
  }
}

# S3 버킷(braincleaner-images) 리소스를 Terraform으로 관리
resource "aws_s3_bucket" "braincleaner_bucket" {
  bucket = "braincleaner-images" # 이미 수동 생성한 버킷 이름과 일치해야 함

  tags = {
    Name = "braincleaner-images"
    Environment = "dev"
  }
}

# EC2 설정 시작

# EC2 역할 생성
resource "aws_iam_role" "brain_cleaner_ec2_role" {
  name = "${var.prefix}-brain-cleaner-ec2-role"

  # 이 역할에 대한 신뢰 정책 설정. EC2 서비스가 이 역할을 가정할 수 있도록 설정
  assume_role_policy = <<EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "",
        "Action": "sts:AssumeRole",
        "Principal": {
            "Service": "ec2.amazonaws.com"
        },
        "Effect": "Allow"
      }
    ]
  }
  EOF
}

# EC2 역할에 AmazonS3FullAccess 정책을 부착
resource "aws_iam_role_policy_attachment" "s3_full_access" {
  role       = aws_iam_role.brain_cleaner_ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}

# EC2 역할에 AmazonEC2RoleforSSM 정책을 부착
resource "aws_iam_role_policy_attachment" "ec2_ssm" {
  role       = aws_iam_role.brain_cleaner_ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2RoleforSSM"
}

# IAM 인스턴스 프로파일 생성
resource "aws_iam_instance_profile" "brain_cleaner_instance_profile" {
  name = "${var.prefix}brain_cleaner-instance-profile"
  role = aws_iam_role.brain_cleaner_ec2_role.name
}

locals {
  ec2_user_data_base = <<-END_OF_FILE
#!/bin/bash
# 가상 메모리 4GB 설정 - microservice에 대한 최적화
sudo dd if=/dev/zero of=/swapfile bs=128M count=32
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
sudo sh -c 'echo "/swapfile swap swap defaults 0 0" >> /etc/fstab'

# 도커 설치 및 실행/활성화
yum install docker -y
systemctl enable docker
systemctl start docker

# 도커 네트워크 생성
docker network create common

# nginx 설치
docker run -d \
  --name npm_1 \
  --restart unless-stopped \
  --network common \
  -p 80:80 \
  -p 443:443 \
  -p 81:81 \
  -e TZ=Asia/Seoul \
  -v /dockerProjects/npm_1/volumes/data:/data \
  -v /dockerProjects/npm_1/volumes/etc/letsencrypt:/etc/letsencrypt \
  jc21/nginx-proxy-manager:latest

# redis 설치
docker run -d \
  --name=redis_1 \
  --restart unless-stopped \
  --network common \
  -p 6379:6379 \
  -e TZ=Asia/Seoul \
  redis --requirepass ${var.password_1}

# mysql 설치
docker run -d \
  --name mysql_1 \
  --restart unless-stopped \
  -v /dockerProjects/mysql_1/volumes/var/lib/mysql:/var/lib/mysql \
  -v /dockerProjects/mysql_1/volumes/etc/mysql/conf.d:/etc/mysql/conf.d \
  --network common \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=${var.password_1} \
  -e TZ=Asia/Seoul \
  mysql:latest

# MySQL 컨테이너가 준비될 때까지 대기
echo "MySQL이 기동될 때까지 대기 중..."
until docker exec mysql_1 mysql -uroot -p${var.password_1} -e "SELECT 1" &> /dev/null; do
  echo "MySQL이 아직 준비되지 않음. 5초 후 재시도..."
  sleep 5
done
echo "MySQL이 준비됨. 초기화 스크립트 실행 중..."

docker exec mysql_1 mysql -uroot -p${var.password_1} -e "
CREATE USER 'll_local'@'127.0.0.1' IDENTIFIED WITH caching_sha2_password BY '1234';
CREATE USER 'll_local'@'172.18.%.%' IDENTIFIED WITH caching_sha2_password BY '1234';
CREATE USER 'll'@'%' IDENTIFIED WITH caching_sha2_password BY '${var.password_1}';

GRANT ALL PRIVILEGES ON *.* TO 'll_local'@'127.0.0.1';
GRANT ALL PRIVILEGES ON *.* TO 'll_local'@'172.18.%.%';
GRANT ALL PRIVILEGES ON *.* TO 'll'@'%';

CREATE DATABASE blog_prod;

FLUSH PRIVILEGES;
"

echo "${var.github_access_token_1}" | docker login ghcr.io -u ${var.github_access_token_1_owner} --password-stdin

END_OF_FILE
}

# 최신 Amazon Linux 2023 AMI 조회 (프리 티어 호환)
data "aws_ami" "latest_amazon_linux" {
  most_recent = true
  owners = ["amazon"]

  filter {
    name = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }

  filter {
    name = "architecture"
    values = ["x86_64"]
  }

  filter {
    name = "virtualization-type"
    values = ["hvm"]
  }

  filter {
    name = "root-device-type"
    values = ["ebs"]
  }
}

# EC2 인스턴스 생성
resource "aws_instance" "blog_ec2" {
  # 사용할 AMI ID
  ami = data.aws_ami.latest_amazon_linux.id
  # EC2 인스턴스 유형
  instance_type = "t3.micro"
  # 사용할 서브넷 ID
  subnet_id = aws_subnet.blog_subnet_d.id
  # 적용할 보안 그룹 ID
  vpc_security_group_ids = [aws_security_group.blog_sg.id]
  # 퍼블릭 IP 연결 설정
  associate_public_ip_address = true

  # 인스턴스에 IAM 역할 연결
  iam_instance_profile = aws_iam_instance_profile.brain_cleaner_instance_profile.name

  # 인스턴스에 태그 설정
  tags = {
    Name = "${var.prefix}-blog-ec2"
  }

  # 루트 볼륨 설정
  root_block_device {
    volume_type = "gp3"
    volume_size = 12  # 볼륨 크기를 12GB로 설정
  }

  # User data script for blog_ec2
  user_data = <<-EOF
${local.ec2_user_data_base}
EOF
}