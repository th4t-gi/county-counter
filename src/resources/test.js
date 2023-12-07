// import { readFileSync, writeFileSync } from "fs";
// import { writeFile } from "fs/promises";

fetch("https://raw.githubusercontent.com/kjhealy/us-county/master/data/geojson/gz_2010_us_050_00_500k.json")
  .then(v => v.json())
  .then((json) => {
    let features = json.features.map( f => {
      return {
        ...f,
        id: parseInt(f.properties.STATE + f.properties.COUNTY),
        properties: {
          lsad: f.properties.LSAD,
          state: f.properties.STATE,
          name: f.properties.NAME,
          county: f.properties.COUNTY,
          census_area: f.properties.CENSUSAREA,
          geo_id: f.properties.GEO_ID
        }
      }
    })

    const collection = {type: "FeatureCollection", features}
    require("fs").writeFileSync("./base_counties_ids.json", JSON.stringify(collection))
  })

// let json = JSON.parse(str);

// json.features.map((v) => {
//   const random = Boolean(Math.round(Math.random()));
//   v.properties.CLICKED = random;
// });

// writeFile("./test.json");
