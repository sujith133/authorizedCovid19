let express = require("express");
let sqlite3 = require("sqlite3");
let path = require("path");
let { open } = require("sqlite");
let bcrypt = require("bcrypt");
let jwt = require("jsonwebtoken");
let dbPath = path.join(__dirname, "covid19IndiaPortal.db");

let app = express();
app.use(express.json());
let db = null;
let initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
// POST /login/
app.post("/login/", async (request, response) => {
  const requestBody = request.body;
  let userID = `select * from user where username = '${requestBody.username}'`;
  let userProfile = await db.get(userID);
  if (userProfile !== undefined) {
    let checker = await bcrypt.compare(
      requestBody.password,
      userProfile.password
    );
    if (checker === true) {
      let jwtToken = jwt.sign(requestBody, "The_Secret");
      response.header({ jwtToken });
      console.log(jwtToken);
      response.send({ jwtToken });
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  } else {
    response.status(400);
    response.send("Invalid user");
  }
});

//get /states/
app.get("/states/", async (request, response) => {
  let auth = request.headers["authorization"];
  if (auth !== undefined) {
    let jwTokens = auth.split(" ")[1];
    if (jwTokens !== undefined) {
      jwt.verify(jwTokens, "The_Secret", async (error, user) => {
        if (error) {
          response.status(401);
          response.send("Invalid JWT Token");
        } else {
          let getState = `
    select * from state`;
          let getStates = await db.all(getState);
          let getter = [];
          for (let item of getStates) {
            let objState = {};
            objState.stateId = item.state_id;
            objState.stateName = item.state_name;
            objState.population = item.population;
            getter.push(objState);
          }
          response.send(getter);
        }
      });
    } else {
      response.status(401);
      response.send("Invalid JWT Token");
    }
  } else {
    response.status(401);
    response.send("Invalid JWT Token");
  }
});

//get /states/:stateId/
app.get("/states/:stateId/", async (request, response) => {
  let { stateId } = request.params;
  let auth = request.headers["authorization"];
  if (auth !== undefined) {
    let jwTokens = auth.split(" ")[1];
    if (jwTokens !== undefined) {
      jwt.verify(jwTokens, "The_Secret", async (error, user) => {
        if (error) {
          response.status(401);
          response.send("Invalid JWT Token");
        } else {
          let getState = `
    select * from state where state_id = ${stateId}`;
          let getStates = await db.get(getState);
          let objState = {};
          objState.stateId = getStates.state_id;
          objState.stateName = getStates.state_name;
          objState.population = getStates.population;

          response.send(objState);
        }
      });
    } else {
      response.status(401);
      response.send("Invalid JWT Token");
    }
  } else {
    response.status(401);
    response.send("Invalid JWT Token");
  }
});

//get /districts/:districtId/
app.get("/districts/:districtId/", async (request, response) => {
  let { districtId } = request.params;
  let auth = request.headers["authorization"];
  if (auth !== undefined) {
    let jwTokens = auth.split(" ")[1];
    if (jwTokens !== undefined) {
      jwt.verify(jwTokens, "The_Secret", async (error, user) => {
        if (error) {
          response.status(401);
          response.send("Invalid JWT Token");
        } else {
          let getState = `
    select * from district where district_id = ${districtId}`;
          let getStates = await db.get(getState);
          let objState = {};
          objState.districtId = getStates.district_id;
          objState.districtName = getStates.district_name;
          objState.stateId = getStates.state_id;
          objState.cases = getStates.cases;
          objState.cured = getStates.cured;
          objState.active = getStates.active;
          objState.deaths = getStates.deaths;

          response.send(objState);
        }
      });
    } else {
      response.status(401);
      response.send("Invalid JWT Token");
    }
  } else {
    response.status(401);
    response.send("Invalid JWT Token");
  }
});

app.post("/districts/", async (request, response) => {
  let districtData = request.body;
  let { districtName, stateId, cases, cured, active, deaths } = districtData;
  let auth = request.headers["authorization"];
  if (auth !== undefined) {
    let jwTokens = auth.split(" ")[1];
    if (jwTokens !== undefined) {
      jwt.verify(jwTokens, "The_Secret", async (error, user) => {
        if (error) {
          response.status(401);
          response.send("Invalid JWT Token");
        } else {
          let updater = `insert into district(district_name, state_id, cases, cured, active, deaths) values('${districtName}', ${stateId}, ${cases}, ${cured}, ${active}, ${deaths})`;
          let updatedDistrict = db.run(updater);
          response.send("District Successfully Added");
        }
      });
    } else {
      response.status(401);
      response.send("Invalid JWT Token");
    }
  } else {
    response.status(401);
    response.send("Invalid JWT Token");
  }
});

app.put("/districts/:districtId/", async (request, response) => {
  let { districtId } = request.params;
  let districtData = request.body;
  let { districtName, stateId, cases, cured, active, deaths } = districtData;
  let auth = request.headers["authorization"];
  if (auth !== undefined) {
    let jwTokens = auth.split(" ")[1];
    if (jwTokens !== undefined) {
      jwt.verify(jwTokens, "The_Secret", async (error, user) => {
        if (error) {
          response.status(401);
          response.send("Invalid JWT Token");
        } else {
          let updater = `update district set district_name='${districtName}', state_id=${stateId}, cases=${cases}, cured=${cured}, active=${active}, deaths=${deaths}`;
          let updatedDistrict = db.run(updater);
          response.send("District Details Updated");
        }
      });
    } else {
      response.status(401);
      response.send("Invalid JWT Token");
    }
  } else {
    response.status(401);
    response.send("Invalid JWT Token");
  }
});

app.delete("/districts/:districtId/", async (request, response) => {
  let { districtId } = request.params;
  let auth = request.headers["authorization"];
  if (auth !== undefined) {
    let jwTokens = auth.split(" ")[1];
    if (jwTokens !== undefined) {
      jwt.verify(jwTokens, "The_Secret", async (error, user) => {
        if (error) {
          response.status(401);
          response.send("Invalid JWT Token");
        } else {
          let deleter = `delete from district where district_id=${districtId}`;
          let updatedDistrict = await db.run(deleter);
          response.send("District Removed");
        }
      });
    } else {
      response.status(401);
      response.send("Invalid JWT Token");
    }
  } else {
    response.status(401);
    response.send("Invalid JWT Token");
  }
});

app.get("/districts/:districtId/details/", async (request, response) => {
  let { districtId } = request.params;
  let auth = request.headers["authorization"];
  if (auth !== undefined) {
    let jwTokens = auth.split(" ")[1];
    if (jwTokens !== undefined) {
      jwt.verify(jwTokens, "The_Secret", async (error, user) => {
        if (error) {
          response.status(401);
          response.send("Invalid JWT Token");
        } else {
          let finder = `
  select state.state_name 
  from state 
  left join district on state.state_id = district.state_id 
  where district.district_id=${districtId}`;
          let stateFinder = await db.get(finder);
          let obj = {};
          obj.stateName = stateFinder.state_name;
          response.send(obj);
        }
      });
    } else {
      response.status(401);
      response.send("Invalid JWT Token");
    }
  } else {
    response.status(401);
    response.send("Invalid JWT Token");
  }
});

app.get("/states/:stateId/stats/", async (request, response) => {
  let { stateId } = request.params;
  stateId = parseInt(stateId);
  let auth = request.headers["authorization"];
  if (auth !== undefined) {
    let jwTokens = auth.split(" ")[1];
    if (jwTokens !== undefined) {
      jwt.verify(jwTokens, "The_Secret", async (error, user) => {
        if (error) {
          response.status(401);
          response.send("Invalid JWT Token");
        } else {
          let staters = `
  select 
  SUM(cases) as totalCases, 
  SUM(cured) as totalCured, 
  SUM(active) as totalActive, 
  SUM(deaths) as totalDeaths 
  from district 
  where state_id=${stateId}`;
          let stats = await db.get(staters);
          console.log(stats, typeof stateId);
          response.send(stats);
        }
      });
    } else {
      response.status(401);
      response.send("Invalid JWT Token");
    }
  } else {
    response.status(401);
    response.send("Invalid JWT Token");
  }
});

module.exports = app;
