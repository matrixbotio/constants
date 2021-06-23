package constants

import (
	"io/ioutil"
	"net/http"
	"encoding/json"
	"os"
)

func downloadErr(){
	os.Stderr.WriteString("Unable to download file required for startup. Exiting...\n")
	os.Exit(1)
}

func getJSON(url string, storage interface{}) {
	resp, err := http.Get(url)
	if err != nil {
		downloadErr()
		return
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		downloadErr()
		return
	}
	json.Unmarshal(body, storage)
}
