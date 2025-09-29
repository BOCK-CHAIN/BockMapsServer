## Step to install OSRM server
```bash
sudo docker run -t -v "/home/charangowak911/nominatim-project/data:/data" osrm/osrm-backend osrm-extract -p /opt/car.lua /data/southern-zone-250904.osm.pbf
sudo docker run -t -v "/home/charangowak911/nominatim-project/data:/data" osrm/osrm-backend osrm-partition /data/southern-zone-250904.osrm
sudo docker run -t -v "/home/charangowak911/nominatim-project/data:/data" osrm/osrm-backend osrm-customize /data/southern-zone-250904.osrm
sudo docker run -d --name osrm-server -p 5000:5000 -v "/home/charangowak911/nominatim-project/data:/data" osrm/osrm-backend osrm-routed --algorithm mld /data/southern-zone-250904.osrm
  ```
* u need to replace `/home/charangowak911/nominatim-project/data` with your local path where you have downloaded osm file