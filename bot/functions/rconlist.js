import { Rcon } from "rcon-client";
import config from "../config/config.json" with { type: "json" };

async function rconList() {
  const rcon = await Rcon.connect({
    host: config.RCsettings.host,
    port: config.RCsettings.port,
    password: config.RCsettings.password,
  });

  try {
    const response = await rcon.send("list");

    // "There are 2 of a max of 20 players online: player1, player2"
    // match[1] = 2, match[2] = "player1, player2"
    const match = response.match(
      /There are (\d+) of a max of (\d+) players online: (.+)/,
    );

    if (match) {
      const current = match[1]; // "2"
      const max = match[2]; // "20" (새로 추가된 그룹!)
      const players = match[3]; // "player1, player2" (순서가 하나 밀림);

      return {
        count: parseInt(current),
        max: parseInt(max),
        players: players ? players.split(", ") : [],
      };
    }

    return { count: 0, max: 10, players: [] };
  } finally {
    await rcon.end();
  }
}

async function rconStop() {
  const rcon = await Rcon.connect({
    host: config.RCsettings.host,
    port: config.RCsettings.port,
    password: config.RCsettings.password,
  });

  try {
    await rcon.send("stop");
  } finally {
    await rcon.end();
  }
}

export { rconList, rconStop };
