#!/bin/bash

curl -X POST -H "Content-Type: application/json" http://localhost:8080 -d '{ "id": "CVE-2010-4662" }'
curl -X POST -H "Content-Type: application/json" http://localhost:8080 -d '{ "id": "cve-2021-1675" }'

