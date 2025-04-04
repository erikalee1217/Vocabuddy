var express = require('express');
const cors = require('cors')
var bodyParser = require('body-parser');
var mysql = require('mysql2');
var path = require('path');
var connection = mysql.createConnection({
                host: '35.238.91.109',
                user: 'root',
                password: 'team080',
                database: 'vocab'
});

connection.connect;

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

connection.query(dropProcedure, (err, results) => {
  if (err) {
    console.error('Error dropping existing procedure:', err);
    return;
  }
});

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

app.get('/api/User', function(req, res) {
  var Email = req.query.Email;

  console.log(Email)

  var sql = 'CALL GetUserDetails(?)';

  connection.query(sql, [Email], function(err, results) {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).send({ message: 'Error fetching data', error: err });
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

  console.log(WordId, TestId)

  var sql = ' SELECT Word, PartOfSpeech, Description, Stem, Example, Source FROM Meaning LEFT JOIN Words ON Meaning.WordId = Words.WordId AND Meaning.TestId = Words.TestId WHERE Words.WordId = ? AND Words.TestId = ?';

  connection.query(sql, [WordId, TestId], function(err, results) {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).send({ message: 'Error fetching data', error: err });
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

  console.log(Word, sql)
  connection.query(sql, [Word], function(err, results) {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).send({ message: 'Error fetching data', error: err });
      return;
    }
    res.json(results);
  });
});

// Create a new user with the provided detail (using Stored Procedure + Transaction)
var dropProcedure = 'DROP PROCEDURE IF EXISTS CreateUserIfNotExists';

connection.query(dropProcedure, (err, results) => {
  if (err) {
    console.error('Error dropping existing procedure:', err);
    return;
  }
});

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
      SELECT 1 FROM User u JOIN School s ON u.TargetSchoolId = s.SchoolId
      WHERE u.Email = p_Email AND s.SchoolId = p_TargetSchoolId
    ) INTO userExists;

    IF NOT userExists THEN
      INSERT INTO User (Email, Password, FirebaseUID, Username, FirstName, LastName, JoinedTime, TargetSchoolId)
      VALUES (p_Email, p_Password, p_FirebaseUID, p_Username, p_FirstName, p_LastName, p_JoinedTime, p_TargetSchoolId);
    END IF;

    COMMIT;
  END`;

connection.query(createProcedureQuery, (createProcedureErr) => {
  if (createProcedureErr) {
    console.error('Error creating stored procedure:', createProcedureErr);
    return;
  }
});

app.post('/api/User/new', (req, res) => {
  var { Email, Password, FirebaseUID, Username, FirstName, LastName, JoinedTime, TargetSchoolId } = req.body;

  console.log(Email, Password, FirebaseUID, Username, FirstName, LastName, JoinedTime, TargetSchoolId);

  FirebaseUID = FirebaseUID === undefined ? null : FirebaseUID;
  Username = Username === undefined ? null : Username;
  FirstName = FirstName === undefined ? null : FirstName;
  LastName = LastName === undefined ? null : LastName;
  JoinedTime = JoinedTime === undefined ? null : JoinedTime;
  TargetSchoolId = TargetSchoolId === undefined ? null : TargetSchoolId;

  var sql = 'CALL CreateUserIfNotExists(?, ?, ?, ?, ?, ?, ?, ?)';
  connection.query(sql, [Email, Password, FirebaseUID, Username, FirstName, LastName, JoinedTime, TargetSchoolId], (err, results) => {
  if (err) {
    console.error('Error execution', err);
    connection.query('ROLLBACK;', (rollbackErr) => {
      if (rollbackErr) {
        console.error('Error rolling back transaction:', rollbackErr);
      }
      res.status(500).send({ message: 'Error creating user', error: err });
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

  console.log(Email, newSchoolId);

  var sql = 'UPDATE User SET TargetSchoolId = ? WHERE Email = ?';

  connection.query(sql, [newSchoolId, Email], function(err, result) {
    if (err) {
      console.error('Error modifying record:', err);
      res.status(500).send({ message: 'Error modifying record', error: err });
      return;
    }
    if(result.affectedRows === 0) {
      res.status(404).send({ message: 'Record not found' });
    } else {
      res.send({ message: 'Record modified successfully' });
    }
  });
});

// Retrieve friends of a user and their last active time and progress (using Trigger)
// Input: Email
// Output: Friends' Email, Last Active Time, Progress for Each Test
var dropTriggerSQL = 'DROP TRIGGER IF EXISTS UpdateLastActiveTime';

connection.query(dropTriggerSQL, (err, result) => {
  if (err) {
      console.error('Error dropping existing trigger:', err);
      return;
  }
});

var sqlTrigger = `
  CREATE TRIGGER UpdateLastActiveTime
  AFTER INSERT ON Learns
  FOR EACH ROW
  BEGIN
    IF NEW.PercentLearned > 50 THEN
      UPDATE IsFriendWith
      SET LastActiveTime = NEW.LastLearnedTime
      WHERE FriendEmail = NEW.Email;
    END IF;
  END`;

connection.query(sqlTrigger, (err, results) => {
    if (err) {
      console.error('Error creating trigger:', err);
      return;
    }
    console.log('Trigger created successfully');
});

app.get('/api/IsFriendWith', function(req, res) {
  var Email= req.query.Email;

  console.log(Email)

  var sql = 'SELECT FriendEmail, LastActiveTime, TestId, Progress FROM IsFriendWith LEFT JOIN (SELECT Email, MAX(LastLearnedTime) AS LastActiveTime FROM Learns GROUP BY Email) p ON p.Email = IsFriendWith.FriendEmail LEFT JOIN (SELECT Email, TestId, AVG(PercentLearned) AS Progress FROM Learns GROUP BY Email, TestId) pp ON pp.Email = IsFriendWith.FriendEmail WHERE IsFriendWith.Email = ?';

  connection.query(sql, [Email], function(err, results) {
    if (err) {
      console.error('not-implemented', err);
      res.status(500).send({ message: 'not-implemented', error: err });
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

  console.log(TestId)

  var sql = 'SELECT Word, PartOfSpeech, Description, Stem, Example, Source FROM Meaning LEFT JOIN Words ON Meaning.WordId = Words.WordId WHERE Meaning.TestId = ? ORDER BY RAND() LIMIT 1';

  connection.query(sql, [TestId], function(err, results) {
    if (err) {
      console.error('not-implemented', err);
      res.status(500).send({ message: 'not-implemented', error: err });
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

  console.log(Email, Password);

  var sql = 'SELECT Email, Username, FirstName, LastName, JoinedTime, TargetSchoolId FROM User WHERE Email = ? AND Password = ?';

  connection.query(sql, [Email, Password], function(err, results) {
    if (err) {
      console.error('not-implemented', err);
      res.status(500).send({ message: 'not-implemented', error: err });
      return;
    }
    console.log(results)
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

  console.log(Email, num_words)

  var sql = 'SELECT Word, LastLearnedTime FROM Learns LEFT JOIN Words ON Words.TestId = Learns.TestId AND Words.WordId = Learns.WordId WHERE Email = ? ORDER BY LastLearnedTime DESC LIMIT ?';

  connection.query(sql, [Email, num_words], function(err, results) {
    if (err) {
      console.error('not-implemented', err);
      res.status(500).send({ message: 'not-implemented', error: err });
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

  console.log(Email, num_words)

  var sql = 'SELECT Word, Learns.TestId, PercentLearned FROM Learns LEFT JOIN Words ON Words.TestId = Learns.TestId AND Words.WordId = Learns.WordId WHERE Email = ? AND Learns.TestId = ? ORDER BY PercentLearned ASC LIMIT ?';

  connection.query(sql, [Email, TestId, num_words], function(err, results) {
    if (err) {
      console.error('not-implemented', err);
      res.status(500).send({ message: 'not-implemented', error: err });
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

  console.log(Email, TestId)

  var sql = 'SELECT TestId, (COUNT(CASE WHEN PercentLearned > 80 THEN 1 END) / COUNT(*)) AS Progress FROM Learns WHERE Email = ? AND TestId = ? GROUP BY TestId';

  connection.query(sql, [Email, TestId], function(err, results) {
    if (err) {
      console.error('not-implemented', err);
      res.status(500).send({ message: 'not-implemented', error: err });
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

  console.log(SchoolId)

  var sql = 'SELECT SchoolName, SchoolRank, Country, Size, Score FROM School WHERE SchoolId = ?';

  connection.query(sql, [SchoolId], function(err, results) {
    if (err) {
      console.error('not-implemented', err);
      res.status(500).send({ message: 'not-implemented', error: err });
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

  console.log(s_SchoolId, e_SchoolId)

  var sql = 'SELECT SchoolId, SchoolName, SchoolRank, Country, Size, Score FROM School WHERE SchoolId BETWEEN ? AND ?';

  connection.query(sql, [s_SchoolId, e_SchoolId], function(err, results) {
    if (err) {
      console.error('not-implemented', err);
      res.status(500).send({ message: 'not-implemented', error: err });
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

  console.log(TestId)

  var sql = 'SELECT Words.Word, Words.Stem, COUNT(Learns.Email) AS UserCount FROM Learns JOIN Words ON Learns.WordId = Words.WordId AND Learns.TestId = Words.TestId WHERE Learns.TestId = ? GROUP BY Words.WordId ORDER BY UserCount DESC LIMIT 10';

  connection.query(sql, [TestId], function(err, results) {
    if(err) {
      console.error('not-implemented', err);
      res.status(500).send({ message: 'not-implemented', error: err});
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
      console.error('not-implemented', err);
      res.status(500).send({ message: 'not-implemented', error: err});
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
      console.error('not-implemented', err);
      res.status(500).send({ message: 'not-implemented', error: err});
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

  console.log(TestId, s_WordId, e_WordId)

  var sql = 'SELECT WordId, TestId, Word, Stem FROM Words WHERE TestId = ? AND WordId BETWEEN ? AND ?';

  connection.query(sql, [TestId, s_WordId, e_WordId], function(err, results) {
    if(err) {
      console.error('not-implemented', err);
      res.status(500).send({ message: 'not-implemented', error: err});
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

  console.log(Email, TestId)

  var sql = 'SELECT Words.WordId, Words.TestId, Words.Word, Learns.PercentLearned, Learns.LastLearnedTime FROM Learns JOIN Words ON Learns.WordId = Words.WordId AND Learns.TestId = Words.TestId WHERE Learns.Email = ? AND Learns.TestId = ? ORDER BY RAND() LIMIT 12';

  connection.query(sql, [Email, TestId], function(err, results) {
    if(err) {
      console.error('not-implemented', err);
      res.status(500).send({ message: 'not-implemented', error: err});
      return;
    }
    res.json(results);
  });
});

// Updating the learning percentage
// Input: email, testId, wordId, percentage to update
app.post('/api/Learns/modify', function(req, res) {
  const { Email, TestId, WordId, PercentLearned, LastLearnedTime } = req.body;

  console.log(Email, TestId, WordId, PercentLearned, LastLearnedTime);

  // Correct SQL UPDATE statement
  const update_sql = 'UPDATE Learns SET PercentLearned = ?, LastLearnedTime = ? WHERE Email = ? AND TestId = ? AND WordId = ?';

  // Correct order of parameters for the SQL query
  connection.query(update_sql, [PercentLearned, LastLearnedTime, Email, TestId, WordId], function(err, result) {
    if (err) {
      console.error('Error updating record:', err);
      res.status(500).send({ message: 'Error modifying record', error: err });
      return;
    }

    // Check if the record was updated
    if (result.affectedRows === 0) {
      // Correct SQL INSERT statement
      const insert_sql = 'INSERT INTO Learns (PercentLearned, LastLearnedTime, Email, TestId, WordId) VALUES (?, ?, ?, ?, ?)';
      connection.query(insert_sql, [PercentLearned, LastLearnedTime, Email, TestId, WordId], function(err, result) {
        if (err) {
          console.error('Error inserting record:', err);
          res.status(500).send({ message: 'Error modifying record', error: err });
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

app.listen(80, function () {
    console.log('Node app is running on port 80');
});
