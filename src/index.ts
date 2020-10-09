import fs from "fs";
import { add, parseJSON } from "date-fns";

const rawCsv = fs.readFileSync("data/raw.csv", "utf8");

const initialReplacer = (match: string) => ` ${match[1]},`;

const matchEndTime = (startTime: string) => {
  const endTime = add(parseJSON(`2000-03-15T${startTime}:00Z`), {
    hours: 1,
    minutes: 30,
  });

  const hour = endTime.getHours();
  const minute = endTime.getMinutes();
  return `${hour < 10 ? `0${hour}` : hour}:${minute === 0 ? `00` : minute}`;
};

const matchDataString = (
  date: RegExpMatchArray | null,
  time: RegExpMatchArray | null,
  venue: RegExpMatchArray | null
) => {
  return `,${date ? date[0] : "DATE"},${time ? time[0] : "START"}-${
    time ? matchEndTime(time[0]) : "END"
  },${venue ? venue[0] : "VENUE"}`;
};

const titleRow =
  "First Name,Surname,Date of Session (in dd/mm/yyyy format),Time of Session (From - To in hh:mm as 24 hour format),Location of Session";

const selections = rawCsv.split("\n\n\n\n\n\n").filter((item) => item);

const allSelections = selections.map((selection) => {
  const selectionSplit = selection.split(
    "Name,Mobile phone,Squad number,Position,Response"
  );
  const [matchData, playerData] = selectionSplit;
  const date = matchData.match(/(\d\d[/]\d\d[/]\d\d\d\d)/);
  const time = matchData.match(/(\d\d:\d\d)/);
  const venue = matchData.match(/(?<=Venue,)(.*)(?=\n)/);
  const matchString = matchDataString(date, time, venue);

  const presentPlayers = playerData.split("\n").filter((playerRow) => {
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
