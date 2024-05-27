sudo apt update

# Install pip
sudo apt install python3-pip -y

# Install docker
sudo apt install ca-certificates curl -y
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update

sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y

# Clone github repository
git clone https://github.com/Tem12/ntnu-cloud-tech-reddit.git reddit
cd reddit

# Install python dependencies
pip install -r api/requirements.txt

# Create .env
echo DB_URL=postgresql://postgres:postgres@localhost:5432/reddit > .env

# Build docker images
make build-images

sudo docker image pull postgres
sudo docker image pull redis

# Start containers
make docker-compose

# Seed the database
# sleep 20
# make seed
