import { readFileSync } from "fs";
import { writeFile } from "fs/promises";

const str = readFileSync("./gz_2010_us_050_00_500k.json").toString();

let json = JSON.parse(str);

json.features.map((v) => {
  const random = Boolean(Math.round(Math.random()));
  v.properties.CLICKED = random;
});

writeFile("./test.json");
