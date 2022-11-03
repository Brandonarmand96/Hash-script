//
//
const csvtojson = require('csvtojson');
const ObjectsToCsv = require('objects-to-csv');
const crypto = require('crypto');
const fs = require('fs');
const prompt = require("prompt-sync")({ sigint: true });

// a function to convert json to chip-00007 standard and save it in new json file
//function creates a sha 256 hash for every object in array and appends it to the Object
//final updated json object is converted to csv file
function chipConverter(json) {
  let team = "";
  json.map((i) => {
    //checking if the row is only team name or valid
    //if it is valid new json is created
    if (parseInt(i["Series Number"]) !== parseInt(i["Series Number"])) {
      team = i["Series Number"];
    } else {
      const attributeArr = i["Attributes"].split(", ")
      const attributesPairArr = []
      attributeArr.map((i) => {
        attributesPairArr.push(i.split(": "))
      })
      const attributesObjArr = [
        {
          "trait_type": "Gender",
          "value": i["Gender"]
        }
      ]
      attributesPairArr.map((i) => {
        let obj = {
          "trait_type": i[0],
          "value": i[1]
        }
        attributesObjArr.push(obj)
      })
      const newJson = {
        "format": "CHIP-0007",
        "name": i["Name"],
        "description": i["Description"],
        "minting_tool": team,
        "sensitive_content": false,
        "series_number": i["Series Number"],
        "series_total": json.length,
        "attributes": attributesObjArr,
        "collection": {
          "name": "Zuri NFT Tickets for Free Lunch",
          "id": i["UUID"],
          "attributes": [
            {
              "type": "description",
              "value": "Rewards for accomplishments during HNGi9."
            }
          ]
        }
      }


      //generate hash
      let hash = crypto.createHash('sha256').update(JSON.stringify(newJson)).digest('hex');
      //append hash to i
      i.hash = hash;
      //saving Newjson to a file
      const fileName = i["Filename"];
      fs.writeFileSync(`./jsons/${fileName}.json`, JSON.stringify(newJson), "utf-8", (err) => {
        if (err) {
          console.log(err);
        }
      })

    }
  })
  //saving updated json with hash to csv
  new ObjectsToCsv(json).toDisk('./csv/output.csv');
}


//const csvfilepath = 'HNGi9 CSV FILE - Sheet1.csv'
const csvfilepath = prompt("Please paste the complete filepath to your csv file and press enter. ");;
csvtojson().fromFile(csvfilepath).then((json) => {
  chipConverter(json)

  fs.writeFileSync('output.json', JSON.stringify(json), "utf-8", (err) => {
    if (err) {
      console.log(err);
    }
  })

})
