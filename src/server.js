import express from 'express'
import sql from 'sqlite3'

const sqlite3 = sql.verbose()

// Create an in memory table to use
const db = new sqlite3.Database(':memory:')

// This is just for testing you would not want to create the table every
// time you start up the app feel free to improve this code :)
db.run(`CREATE TABLE todo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task TEXT NOT NULL)`)

const app = express()
app.use(express.static('public'))
app.set('views', 'views')
app.set('view engine', 'pug')
app.use(express.urlencoded({ extended: false }))

/**
 * A get request that displays a webpage with an input box for a new task from the user along with the todo list 
 * of all the tasks that the user still has to do. 
 * 
 * @param {String} The route of the get request.  
 * @param {Callback Function} A function that handles the request and response for the get request.
 */
app.get('/', function (req, res) {
    const local = { tasks: [] }
    db.each('SELECT id, task FROM todo', function (err, row) {
        if (err) {
            console.log(err)
        } else {
            local.tasks.push({ id: row.id, task: row.task })
        }
    }, function (err, numrows) {
        if (!err) {
            res.render('index', local)
        } else {
            console.log(err)
        }
    })
    console.log('GET called')
})

/**
 * Posts the user-provided task to the database in the server and then displays
 * the new task in the todo list. 
 * 
 * @param {String} The route of the post request.
 * @param {Callback Function} A function that handles the request and response for the post request.
 */
app.post('/', function (req, res) {
    console.log('adding todo item')
    const stmt = db.prepare('INSERT INTO todo (task) VALUES (?)')
    stmt.run(req.body.todo)
    stmt.finalize()
    const local = { tasks: [] }
    db.each('SELECT id, task FROM todo', function (err, row) {
        if (err) {
            console.log(err)
        } else {
            local.tasks.push({ id: row.id, task: row.task })
        }
    }, function (err, numrows) {
        if (!err) {
            res.render('index', local)
        } else {
            console.log(err)
        }
    })
})

/**
 * A post request that deletes the task a user specified and then removes the task from the todo list
 * displayed in the web page. 
 * 
 * @param {String} The route of the post request.  
 * @param {Callback Function} A function that handles the request and response for the post request.
 */
app.post('/delete', function (req, res) {
    console.log('deleting todo item')
    const stmt = db.prepare('DELETE FROM todo where id = (?)')
    stmt.run(req.body.id)
    stmt.finalize()
    const local = { tasks:[] }
    db.each('SELECT id, task FROM todo', function (err, row) {
        if (err) {
            console.log(err)
        } else {
            local.tasks.push({ id: row.id, task: row.task })
        }
    }, function (err, numrows) {
        if (!err) {
            res.render('index', local)
        } else {
            console.log(err)
        }
    })
})

// Start the web server
/**
 * Begins listening for requests on the port specified in the function's parameter.
 * 
 * @param {Number} The port number that the server should be getting requests on. 
 * @param {Callback Function} A callback function that logs the port that the server is listening
 * on to the console. 
 */
app.listen(3000, function () {
    console.log('Listening on port 3000...')
})
