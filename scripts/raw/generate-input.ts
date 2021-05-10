import { program } from 'commander'
import fs, { ReadStream } from 'fs'
import * as readline from 'readline'
import { BigNumber, utils } from 'ethers'

program
  .version('0.0.0')



const main = async () => {
  let file2 = fs.createReadStream("scripts/raw/2.csv");
  let file3 = fs.createReadStream("scripts/raw/3.csv");
  let file4 = fs.createReadStream("scripts/raw/4.csv");

  let line2 = await countLine(file2);
  console.log("file2 => ", line2);
  let line3 = await countLine(file3);
  console.log("file3 => ", line3);
  let line4 = await countLine(file4);
  console.log("file4 => ", line4);

  let total = line2 + line3 + line4;
  console.log("Total => ", total);

  let rootAmountNumber = 1000000 / ((2*line2) + (3*line3) + (4*line4));
  console.log(rootAmountNumber);
  let rootAmount = utils.parseEther(rootAmountNumber.toString());
  console.log("rootAmount => ", rootAmount.toString());

  let map = new Map<string, string>();

  file2 = fs.createReadStream("scripts/raw/2.csv");
  file3 = fs.createReadStream("scripts/raw/3.csv");
  file4 = fs.createReadStream("scripts/raw/4.csv");

  await writeInJson(map, file2, rootAmount, 2);
  await writeInJson(map, file3, rootAmount, 3);
  await writeInJson(map, file4, rootAmount, 4);

  let jsonObject = {}
  map.forEach((value, key) => {
    // @ts-ignore
    jsonObject[key] = value
  })

  fs.writeFile('scripts/raw/generated.json', JSON.stringify(jsonObject),  function(err) {
    if (err) {
      return console.error(err);
    }
    console.log("File created!");
  });
};

main().then(() => {
  console.log("Done");
});

/**
 * Return number of line from file
 * @param file raw file
 */
async function countLine(file: ReadStream) {
  const rl = readline.createInterface({
    input: file,
    crlfDelay: Infinity
  });
  let count = 0;

  for await (const line of rl) {
    if (utils.isAddress(line)) {
      count++;
    }
  }
  rl.close();
  return count;
}

async function writeInJson(map: Map<String, String>, file: ReadStream, amount: BigNumber, weight: number) {
  const rl = readline.createInterface({
    input: file,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (utils.isAddress(line)) {
      map.set(line.toString(), amount.mul(weight).toString());
    }
  }
}
