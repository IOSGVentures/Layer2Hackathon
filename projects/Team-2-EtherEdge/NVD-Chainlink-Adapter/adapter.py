from bridge import Bridge
#from elonmusk import SpaceX
from nvd import CVE
import requests

class Adapter:
    
    def __init__(self, input):
        self.id = input.get('id', '1')
        self.bridge = Bridge()
        self.create_request()

    def create_request(self):
        try:
            data = CVE().get_launch_info(self.id)
            self.result_success(data)
        except Exception as e:
            self.result_error(e)
        finally:
            self.bridge.close()
    
    def result_success(self, data):
        self.result = {
            'jobRunID' : self.id,
            'baseScore' : data["baseScore"],
            'Description' : data["Description"],
            'statusCode' : 200,
        }

    def result_error(self, error):
        self.result = {
            'jobRunID': self.id,
            'status': 'errored',
            'error': f'There was an error: {error}',
            'statusCode': 500,
        }
