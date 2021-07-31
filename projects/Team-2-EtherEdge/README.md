Chainlink Python External Adapter for NVD Impact Score and vulnerability description.

This repository implemented chanlink external adapter for getting impact score and vulnerability description from Nation vulnerability database. It is coded by Python and chainlink official template.
Install

pip3 install -r requirements.txt

Run locally:

python3 app.py

open another terminel :

cat test.sh

#!/bin/bash

curl -X POST -H "Content-Type: application/json" http://localhost:8080 -d '{ "id": "CVE-2010-4662" }'
curl -X POST -H "Content-Type: application/json" http://localhost:8080 -d '{ "id": "cve-2021-1675" }'


$ bash test.sh


Example JSON Response:
{
  "Description": "PmWiki before 2.2.21 has XSS.",
  "baseScore": 6.1,
  "jobRunID": "CVE-2010-4662",
  "statusCode": 200
}
{
  "Description": "Windows Print Spooler Elevation of Privilege Vulnerability",
  "baseScore": 8.8,
  "jobRunID": "cve-2021-1675",
  "statusCode": 200
}
