## steps to run nominatim server
* clone the below repo
```bash
git clone https://github.com/osm-search/Nominatim.git
```
* go inside the cloned directory and run this cmd's
```bash
sudo apt update && sudo apt upgrade -y
wget -O data/country_osm_grid.sql.gz https://nominatim.org/data/country_grid.sql.gz
sudo apt install -y build-essential pkg-config libicu-dev python3-dev python3.13-venv
sudo apt install -y build-essential git wget curl unzip bzip2 libpq-dev postgresql postgresql-contrib postgis osm2pgsql python3 python3-pip
```
* then u need to create another directory outside this dir called nominatim-project
```bash
mkdir ~/nominatim-project
cd ~/nominatim-project
sudo -u postgres createuser -s nominatim
sudo -u postgres createdb -E UTF8 -O nominatim nominatim
sudo -u postgres psql -d nominatim -c "CREATE EXTENSION postgis;"
sudo -u postgres psql -d nominatim -c "CREATE EXTENSION hstore;"
```
* then u create data dir inside this one and paste the osm file that we initially downloaded in tileserver
```bash
mkdir data
mv southern-zone-latest.osm.pbf data/
```
* then u create a python virtual env inside nominatim-project directory and import the osm data with the below command
```bash
python3 -m venv venv
source venv/bin/activate
pip install nominatim-db nominatim-api
nominatim import --osm-file ~/nominatim-project/data/southern-zone-250904.osm.pbf 
```
* then again u should be in activated python venv and run this cmd's to run nominatim that we imported now
```bash
pip install SQLAlchemy asyncpg falcon uvicorn
```
* then create system call by doing
```bash
sudo nano /etc/systemd/system/nominatim.service
[Unit]
Description=Nominatim Service
After=network.target

[Service]
User=charangowak911
WorkingDirectory=/home/charangowak911/nominatim-project
ExecStart=/home/charangowak911/nominatim-project/venv/bin/nominatim serve --server 0.0.0.0:8088
Restart=always

[Install]
WantedBy=multi-user.target
```
* replace the workingdir,user and execstart with yours
* after that u can start with this cmd's and check status
```bash
sudo systemctl daemon-reexec
sudo systemctl enable nominatim
sudo systemctl start nominatim
```
