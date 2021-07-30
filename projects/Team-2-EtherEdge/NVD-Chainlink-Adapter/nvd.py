import requests

class CVE:
    
    def __init__(self):
        self._api_endpoint = "https://plasticuproject.pythonanywhere.com/nvd-api/v1/"
        
    def get_launch_info(self,cve):
        response = requests.get(self._api_endpoint + cve).json()
        try:
            cve ={
                "baseScore" : response['impact']['baseMetricV3']['cvssV3']['baseScore'],
                "Description": response['cve']['description']['description_data'][0]['value']
            }
            return cve
        except Exception as error:
            return error
