import fs from "fs";

const rawCsv = fs.readFileSync("data/raw.csv", "utf8");

const selections = rawCsv.split("\n\n\n\n\n").filter((item) => item);

const initialReplacer = (match: string) => ` ${match[1]},`;

const matchDataString = (
  date: RegExpMatchArray | null,
  time: RegExpMatchArray | null,
  venue: RegExpMatchArray | null
) =>
  `,${date ? date[0] : "DATE"},${time ? time[0] : "TIME"}-XX:XX,${
    venue ? venue[0] : "VENUE"
  }`;

const titleRow =
  "First Name,Surname,Date of Session (in dd/mm/yyyy format),Time of Session (From - To in hh:mm as 24 hour format),Location of Session";

const allSelections = selections.map((selection) => {
  const selectionSplit = selection.split(
    "Name,Mobile phone,Squad number,Position,Response"
  );
  const matchData = selectionSplit[0];
  const date = matchData.match(/(\d\d[/]\d\d[/]\d\d\d\d)/);
  const time = matchData.match(/(\d\d:\d\d)/);
  const venue = matchData.match(/(?<=Venue,)(.*)(?=\n)/);
  const matchString = matchDataString(date, time, venue);

  const presentPlayers = selectionSplit[1].split("\n").filter((playerRow) => {
    if (playerRow.includes("Declined")) return false;
    return playerRow;
  });

  return presentPlayers.map((player) =>
    player
      .split(",")[0]
      .replace(" ", ",")
      .replace(/,.\s/, initialReplacer)
      .trim()
      .replace(", ", ",")
      .concat(matchString)
  );
});

const finalCsvData = Array.prototype.concat.apply([titleRow], allSelections);

fs.writeFileSync("data/report.csv", finalCsvData.join("\n"));
