var express = require('express');
const cors = require('cors')
var bodyParser = require('body-parser');
var mysql = require('mysql2');
var path = require('path');
const { database, port, host } = require('./config').loadConfig();
var connection = mysql.createConnection(database);
const startupQueries = [];

var app = express();

app.use(cors());

// set up ejs view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '../public'));

// For checkpoint 1 demo
app.get('/success', function(req, res) {
  res.send({'message': 'Success!'});
});

app.get('/not-implemented', function(req, res) {
  res.send({'message': 'API is not implemented!'});
});

// Retrieve user information based on Email provided (Using Stored Procedure)
// Input: Email
// Output: Friends' Email, School Name, Ranking, Tests, Progress
var dropProcedure = 'DROP PROCEDURE IF EXISTS GetUserDetails';

startupQueries.push({ stage: 'drop GetUserDetails', sql: dropProcedure });

var sqlProcedure = `
  CREATE PROCEDURE GetUserDetails(IN UserEmail VARCHAR(255))
  BEGIN
    DECLARE UserDetailExist INT;
    SELECT COUNT(*) INTO UserDetailExist
    FROM User
    WHERE Email = UserEmail;

    IF UserDetailExist > 0 THEN
      SELECT User.Email, FriendEmail, SchoolName, SchoolRank, TestId, LearnedProgress
      FROM User
      LEFT JOIN IsFriendWith ON User.Email = IsFriendWith.Email
      LEFT JOIN School ON User.TargetSchoolId = School.SchoolId
      LEFT JOIN (
        SELECT Email, TestId, AVG(PercentLearned) AS LearnedProgress
        FROM Learns
        GROUP BY TestId, Email
      ) AS tt ON User.Email = tt.Email
      WHERE User.Email = UserEmail;
    ELSE
      SELECT 'No user details found' AS ErrorMessage;
    END IF;
  END`;

startupQueries.push({ stage: 'create GetUserDetails', sql: sqlProcedure });

app.get('/api/User', function(req, res) {
  var Email = req.query.Email;

  var sql = 'CALL GetUserDetails(?)';

  connection.query(sql, [Email], function(err, results) {
    if (err) {
      console.error('Error fetching data:', err.code);
      res.status(500).send({ message: 'Error fetching data', error: err.code });
      return;
    }
    res.json(results);
  });
});

// Retrieve word information based on WordId and TestId
// Input: WordId, TestId
// Output: Word, PartOfSpeech, Description, Stem, Example, Source
app.get('/api/Word', function(req, res) {
  var WordId = req.query.WordId;
  var TestId = req.query.TestId;

  var sql = ' SELECT Word, PartOfSpeech, Description, Stem, Example, Source FROM Meaning LEFT JOIN Words ON Meaning.WordId = Words.WordId AND Meaning.TestId = Words.TestId WHERE Words.WordId = ? AND Words.TestId = ?';

  connection.query(sql, [WordId, TestId], function(err, results) {
    if (err) {
      console.error('Error fetching data:', err.code);
      res.status(500).send({ message: 'Error fetching data', error: err.code });
      return;
    }
    res.json(results);
  });
});

// Retrieve word information based on WordId and TestId
// Input: WordId, TestId
// Output: Word, PartOfSpeech, Description, Stem, Example, Source
app.get('/api/search/Word', function(req, res) {
  var Word = req.query.Word + "%";

  var sql = 'SELECT DISTINCT Word, Words.WordId, Words.TestId, Stem FROM Meaning LEFT JOIN Words ON Meaning.WordId = Words.WordId AND Meaning.TestId = Words.TestId WHERE Words.Word LIKE ? ORDER BY Words.Word LIMIT 10;';


  connection.query(sql, [Word], function(err, results) {
    if (err) {
      console.error('Error fetching data:', err.code);
      res.status(500).send({ message: 'Error fetching data', error: err.code });
      return;
    }
    res.json(results);
  });
});

// Create a new user with the provided detail (using Stored Procedure + Transaction)
var dropProcedure = 'DROP PROCEDURE IF EXISTS CreateUserIfNotExists';

startupQueries.push({ stage: 'drop CreateUserIfNotExists', sql: dropProcedure });

var createProcedureQuery = `
  CREATE PROCEDURE CreateUserIfNotExists(
    IN p_Email VARCHAR(255),
    IN p_Password VARCHAR(255),
    IN p_FirebaseUID VARCHAR(255),
    IN p_Username VARCHAR(255),
    IN p_FirstName VARCHAR(255),
    IN p_LastName VARCHAR(255),
    IN p_JoinedTime DATETIME,
    IN p_TargetSchoolId INT
  )

  BEGIN
    DECLARE userExists BOOLEAN;

    SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
    START TRANSACTION;

    SELECT EXISTS(
      SELECT 1 FROM User u
      WHERE u.Email = p_Email
    ) INTO userExists;

    IF NOT userExists THEN
      INSERT INTO User (Email, Password, FirebaseUID, Username, FirstName, LastName, JoinedTime, TargetSchoolId)
      VALUES (p_Email, p_Password, p_FirebaseUID, p_Username, p_FirstName, p_LastName, p_JoinedTime, p_TargetSchoolId);
    END IF;

    COMMIT;
  END`;

startupQueries.push({ stage: 'create CreateUserIfNotExists', sql: createProcedureQuery });

app.post('/api/User/new', (req, res) => {
  var { Email, Password, FirebaseUID, Username, FirstName, LastName, JoinedTime, TargetSchoolId } = req.body;

  FirebaseUID = FirebaseUID === undefined ? null : FirebaseUID;
  Username = Username === undefined ? null : Username;
  FirstName = FirstName === undefined ? null : FirstName;
  LastName = LastName === undefined ? null : LastName;
  JoinedTime = JoinedTime === undefined ? null : JoinedTime;
  TargetSchoolId = TargetSchoolId === undefined ? null : TargetSchoolId;

  var sql = 'CALL CreateUserIfNotExists(?, ?, ?, ?, ?, ?, ?, ?)';
  connection.query(sql, [Email, Password, FirebaseUID, Username, FirstName, LastName, JoinedTime, TargetSchoolId], (err, results) => {
  if (err) {
    console.error('Error execution', err.code);
    connection.query('ROLLBACK;', (rollbackErr) => {
      if (rollbackErr) {
        console.error('Error rolling back transaction:', rollbackErr.code);
      }
      res.status(500).send({ message: 'Error creating user', error: err.code });
    });
  } else {
    res.redirect('/success');
  }
  });
});

// Modify the target school ID for a user
app.post('/api/User/modify', function(req, res) {
  var Email= req.body.Email;
  var newSchoolId = req.body.TargetSchoolId;

  var sql = 'UPDATE User SET TargetSchoolId = ? WHERE Email = ?';

  connection.query(sql, [newSchoolId, Email], function(err, result) {
    if (err) {
      console.error('Error modifying record:', err.code);
      res.status(500).send({ message: 'Error modifying record', error: err.code });
      return;
    }
    if(result.affectedRows === 0) {
      res.status(404).send({ message: 'Record not found' });
    } else {
      res.send({ message: 'Record modified successfully' });
    }
  });
});

// Retrieve friends of a user and their last active time and progress (derived from learning records)
// Input: Email
// Output: Friends' Email, Last Active Time, Progress for Each Test
app.get('/api/IsFriendWith', function(req, res) {
  var Email= req.query.Email;

  var sql = 'SELECT FriendEmail, LastActiveTime, TestId, Progress FROM IsFriendWith LEFT JOIN (SELECT Email, MAX(LastLearnedTime) AS LastActiveTime FROM Learns GROUP BY Email) p ON p.Email = IsFriendWith.FriendEmail LEFT JOIN (SELECT Email, TestId, AVG(PercentLearned) AS Progress FROM Learns GROUP BY Email, TestId) pp ON pp.Email = IsFriendWith.FriendEmail WHERE IsFriendWith.Email = ?';

  connection.query(sql, [Email], function(err, results) {
    if (err) {
      console.error('not-implemented', err.code);
      res.status(500).send({ message: 'not-implemented', error: err.code });
      return;
    }
    res.json(results);
  });
});

// Retrieve a random word
// Input: TestId
// Output: Word, PartOfSpeech, Description, Stem, Example and Source
app.get('/api/Words/random', function(req, res) {
  var TestId = req.query.TestId;

  var sql = 'SELECT Word, PartOfSpeech, Description, Stem, Example, Source FROM Meaning LEFT JOIN Words ON Meaning.WordId = Words.WordId AND Meaning.TestId = Words.TestId WHERE Meaning.TestId = ? ORDER BY RAND() LIMIT 1';

  connection.query(sql, [TestId], function(err, results) {
    if (err) {
      console.error('not-implemented', err.code);
      res.status(500).send({ message: 'not-implemented', error: err.code });
      return;
    }
    res.json(results);
  });
});

// Authenticate a user based on Email and password
// Input: Email, Password
// Output: User info if there is a match
app.get('/api/User/auth', function(req, res) {
  var Email = req.query.Email;
  var Password = req.query.Password;

  var sql = 'SELECT Email, Username, FirstName, LastName, JoinedTime, TargetSchoolId FROM User WHERE Email = ? AND Password = ?';

  connection.query(sql, [Email, Password], function(err, results) {
    if (err) {
      console.error('not-implemented', err.code);
      res.status(500).send({ message: 'not-implemented', error: err.code });
      return;
    }

    if (results.length == 0) {
      res.status(401).send({ message: 'Invalid email or password' });
      return;
    }
    res.json(results);
  });
});

// Retrieve (num_words) recently learned words for a user
// Input: Email
// Output: Word and the Last Learned Time
app.get('/api/Learns/recent', function(req, res) {
  var Email= req.query.Email;
  var num_words = parseInt(req.query.num_words);

  var sql = 'SELECT Word, LastLearnedTime FROM Learns LEFT JOIN Words ON Words.TestId = Learns.TestId AND Words.WordId = Learns.WordId WHERE Email = ? ORDER BY LastLearnedTime DESC LIMIT ?';

  connection.query(sql, [Email, num_words], function(err, results) {
    if (err) {
      console.error('not-implemented', err.code);
      res.status(500).send({ message: 'not-implemented', error: err.code });
      return;
    }
    res.json(results);
  });
});

// Retrieve 10 words that are learned the least for a user and TestId
// Input: Email, TestId
// Output: Word, TestId,  PercentLearned
app.get('/api/Learns/least', function(req, res) {
  var Email= req.query.Email;
  var num_words = parseInt(req.query.num_words);
  var TestId = req.query.TestId;

  var sql = 'SELECT Word, Learns.TestId, PercentLearned FROM Learns LEFT JOIN Words ON Words.TestId = Learns.TestId AND Words.WordId = Learns.WordId WHERE Email = ? AND Learns.TestId = ? ORDER BY PercentLearned ASC LIMIT ?';

  connection.query(sql, [Email, TestId, num_words], function(err, results) {
    if (err) {
      console.error('not-implemented', err.code);
      res.status(500).send({ message: 'not-implemented', error: err.code });
      return;
    }
    res.json(results);
  });
});

// Retrieve the overall progress (percentage of words that are learned over 80%)
// Input: Email, testId
// Output: TestId and Overall Progress
app.get('/api/Learns/progress', function(req, res) {
  var Email= req.query.Email;
  var TestId= req.query.TestId;

  var sql = 'SELECT TestId, (COUNT(CASE WHEN PercentLearned > 80 THEN 1 END) / COUNT(*)) AS Progress FROM Learns WHERE Email = ? AND TestId = ? GROUP BY TestId';

  connection.query(sql, [Email, TestId], function(err, results) {
    if (err) {
      console.error('not-implemented', err.code);
      res.status(500).send({ message: 'not-implemented', error: err.code });
      return;
    }
    res.json(results);
  });
});

// Retrieve information for a single school based on the SchoolId
// Input: SchoolId
// Output: Schools' information
app.get('/api/School/', function(req, res) {
  var SchoolId= req.query.SchoolId;

  var sql = 'SELECT SchoolName, SchoolRank, Country, Size, Score FROM School WHERE SchoolId = ?';

  connection.query(sql, [SchoolId], function(err, results) {
    if (err) {
      console.error('not-implemented', err.code);
      res.status(500).send({ message: 'not-implemented', error: err.code });
      return;
    }
    res.json(results);
  });
});

// Retrieve information for the multiple schools within given range of SchoolId
// Input: start SchoolId, end SchoolId
// Output: Schools' information
app.get('/api/Schools/', function(req, res) {
  var s_SchoolId= req.query.s_SchoolId;
  var e_SchoolId= req.query.e_SchoolId;

  var sql = 'SELECT SchoolId, SchoolName, SchoolRank, Country, Size, Score FROM School WHERE SchoolId BETWEEN ? AND ?';

  connection.query(sql, [s_SchoolId, e_SchoolId], function(err, results) {
    if (err) {
      console.error('not-implemented', err.code);
      res.status(500).send({ message: 'not-implemented', error: err.code });
      return;
    }
    res.json(results);
  });
});

// Retrieve the 10 most popular words for a given testId (based on the number of user haved learned)
// Input: TestId
// Output: the 10 most popular words (word, stem), counts
app.get('/api/Stat/popular-word', function(req, res) {
  var TestId = req.query.TestId;

  var sql = 'SELECT Words.Word, Words.Stem, COUNT(Learns.Email) AS UserCount FROM Learns JOIN Words ON Learns.WordId = Words.WordId AND Learns.TestId = Words.TestId WHERE Learns.TestId = ? GROUP BY Words.WordId ORDER BY UserCount DESC LIMIT 10';

  connection.query(sql, [TestId], function(err, results) {
    if(err) {
      console.error('not-implemented', err.code);
      res.status(500).send({ message: 'not-implemented', error: err.code});
      return;
    }
    res.json(results);
  });
});

// Retrieve the number of users
// Input: none
// Output: number of users
app.get('/api/Stat/num-users', function(req, res) {
  var sql = 'SELECT COUNT(*) AS UserCount FROM User';

  connection.query(sql, function(err, results) {
    if(err) {
      console.error('not-implemented', err.code);
      res.status(500).send({ message: 'not-implemented', error: err.code});
      return;
    }
    res.json(results);
  });
});

// Retrieve the 10 most popular school
// Input: none
// Output: most popular school based on the number of users targeting it (School Name and User Count)
app.get('/api/Stat/popular-school', function(req, res) {
  var sql = 'SELECT School.SchoolName, School.SchoolRank, School.Country, COUNT(User.TargetSchoolId) AS UserCount FROM User JOIN School ON User.TargetSchoolId = School.SchoolId GROUP BY School.SchoolId ORDER BY UserCount DESC LIMIT 10';

  connection.query(sql, function(err, results) {
    if(err) {
      console.error('not-implemented', err.code);
      res.status(500).send({ message: 'not-implemented', error: err.code});
     return;
    }
    res.json(results);
  });
});

// Retrieve information for multiple words within a given range of WordId and TestId
// Input: start word Id, end word Id, testId
// Output:
app.get('/api/Words', function(req, res) {
  var TestId = req.query.TestId;
  var s_WordId = req.query.s_WordId;
  var e_WordId = req.query.e_WordId;

  var sql = 'SELECT WordId, TestId, Word, Stem FROM Words WHERE TestId = ? AND WordId BETWEEN ? AND ?';

  connection.query(sql, [TestId, s_WordId, e_WordId], function(err, results) {
    if(err) {
      console.error('not-implemented', err.code);
      res.status(500).send({ message: 'not-implemented', error: err.code});
      return;
    }
    res.json(results);
  });
});


// Pulling a word to study
// Input: email, testId
// Output: percentage, last learned time
app.get('/api/Study', function(req, res) {
  var Email = req.query.Email;
  var TestId = req.query.TestId;

  var sql = 'SELECT Words.WordId, Words.TestId, Words.Word, Learns.PercentLearned, Learns.LastLearnedTime FROM Learns JOIN Words ON Learns.WordId = Words.WordId AND Learns.TestId = Words.TestId WHERE Learns.Email = ? AND Learns.TestId = ? ORDER BY RAND() LIMIT 12';

  connection.query(sql, [Email, TestId], function(err, results) {
    if(err) {
      console.error('not-implemented', err.code);
      res.status(500).send({ message: 'not-implemented', error: err.code});
      return;
    }
    res.json(results);
  });
});

// Updating the learning percentage
// Input: email, testId, wordId, percentage to update
app.post('/api/Learns/modify', function(req, res) {
  const { Email, TestId, WordId, PercentLearned, LastLearnedTime } = req.body;

  // Correct SQL UPDATE statement
  const update_sql = 'UPDATE Learns SET PercentLearned = ?, LastLearnedTime = ? WHERE Email = ? AND TestId = ? AND WordId = ?';

  // Correct order of parameters for the SQL query
  connection.query(update_sql, [PercentLearned, LastLearnedTime, Email, TestId, WordId], function(err, result) {
    if (err) {
      console.error('Error updating record:', err.code);
      res.status(500).send({ message: 'Error modifying record', error: err.code });
      return;
    }

    // Check if the record was updated
    if (result.affectedRows === 0) {
      // Correct SQL INSERT statement
      const insert_sql = 'INSERT INTO Learns (PercentLearned, LastLearnedTime, Email, TestId, WordId) VALUES (?, ?, ?, ?, ?)';
      connection.query(insert_sql, [PercentLearned, LastLearnedTime, Email, TestId, WordId], function(err, result) {
        if (err) {
          console.error('Error inserting record:', err.code);
          res.status(500).send({ message: 'Error modifying record', error: err.code });
          return;
        }

        if (result.affectedRows === 0) {
          res.status(404).send({ message: 'Record not found' });
        } else {
          res.send({ message: 'Record modified successfully' });
        }
      });
    } else {
      res.send({ message: 'Record updated successfully' });
    }
  });
});

let server;
let startupFailed = false;

function failStartup(stage, err) {
  if (startupFailed) return;
  startupFailed = true;
  // Never print driver messages, SQL, connection options or bound values.
  const code = err && typeof err.code === 'string' && /^[A-Z0-9_]{1,40}$/.test(err.code)
    ? err.code : 'UNKNOWN';
  console.error(`Backend startup failed (${stage}): ${code}`);
  process.exitCode = 1;
  connection.destroy();
  if (server) server.close();
}

connection.on('error', (err) => failStartup('database connection', err));

// With no queued queries, mysql2 propagates handshake failures to connect().
// Run the existing SQL in order and stop at the first initialization failure.
connection.connect((err) => {
  if (err) return failStartup('database connection', err);

  function initialize(index) {
    if (startupFailed) return;
    if (index < startupQueries.length) {
      const step = startupQueries[index];
      connection.query(step.sql, (err) => {
        if (err) return failStartup(step.stage, err);
        initialize(index + 1);
      });
      return;
    }
    server = app.listen(port, host, () => {
      console.log(`Vocabuddy listening on ${host}:${port}`);
    });
    server.on('error', (err) => failStartup('HTTP listener', err));
  }

  initialize(0);
});
