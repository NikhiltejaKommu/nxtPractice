const express = require("express");

const path = require("path");

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "cricketTeam.db");
const app = express();
app.use(express.json());

let db = null;

const initializationDBServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Activated");
    });
  } catch (e) {
    console.log(`We got an error i.e "${e.message}"`);
    process.exit(1);
  }
};
initializationDBServer();

// Returning Players (GET)

app.get("/players/", async (request, response) => {
  const getPlayers = ` 
        SELECT * 
        FROM cricket_team;
    `;
  const playersData = await db.all(getPlayers);
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  };
  let playersArr = [];
  for (let doObject of playersData) {
    let camelCaseObj = convertDbObjectToResponseObject(doObject);
    playersArr.push(camelCaseObj);
  }

  response.send(playersArr);
});

// Creating Player

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { player_name, jersey_number, role } = playerDetails;
  const addPlayerQuery = `
    INSERT INTO 
    cricket_team (player_name,jersey_number,role)
    VALUES(
        '${player_name}',

        ${jersey_number},

        '${role}'
    )
  ;`;
  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

/// Getting player based on player_id

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const getPlayer = `
        SELECT 
          *
        FROM
          cricket_team
        WHERE 
        player_id = ${playerId};
    `;
  const playerDetails = await db.all(getPlayer);
  response.send(playerDetails);
});

// Updating player data

app.put("/players/:playerId/", async (request, response) => {
  const { player_id } = request.params;

  const playerData = request.body;
  const { playerName, jerseyNumber, role } = playerData;
  const updateData = `
    UPDATE cricket_team
    SET 
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
  `;
  await db.run(updateData);
  response.send("Player Details Updated");
});

// Deleting
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayer = `
        DELETE FROM 
        cricket_team
        WHERE player_id = ${playerId};
    `;
  await db.run(deletePlayer);
  response.send("Player Removed");
});

module.exports = app;
