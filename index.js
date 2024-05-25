import express from "express";
import bodyParser from "body-parser";
import pg from "pg";


const app = express();
const port = 3000;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "Todo_List",
    password: "Loveyoubigtime",
    port: 5432,
  });
  db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


let currentMemberId = 1;

let members = [
    {id: 1, name: "david", color: "blue"},
];

let items = [];

//...

async function getCurrentMember() {
    const result = await db.query("SELECT * FROM members");
    members = result.rows;
    return members.find((member) => member.id == currentMemberId);
}

app.get("/", async (req, res) => {
    try {
        const currentMember = await getCurrentMember();

        const result = await db.query(
            "SELECT * FROM items WHERE member_id = $1 ORDER BY id ASC",
            [currentMemberId]
        );
        items = result.rows;

        res.render("index.ejs", {
            phoneTaskhead: "All Task",
            listTasks: items,
            members: members,
            color: currentMember.color,
        });
    } catch (err) {
        console.log(err);
    }
});

//...

app.post("/add", async (req, res) => {
    const task = req.body.newTask;
    try {
        await db.query("INSERT INTO items (title, member_id) VALUES ($1, $2)", [task, currentMemberId]);
        res.redirect("/")
    } catch (err) {
        console.log(err);
    }
});

//...

app.post("/edit", async (req, res) => {
    const task = req.body.updatedTaskTitle;
    const id = req.body.updatedTaskId;
    try {
        await db.query("UPDATE items SET title = ($1) WHERE id = $2 AND member_id = $3", [task, id, currentMemberId]);
        res.redirect("/");
    } catch (err) {
        console.log(err);
    }
});

//...

app.post("/delete", async (req, res) => {
    const id = req.body.deleteTaskId;
    try {
        await db.query("DELETE FROM items WHERE id = $1 AND member_id = $2", [id, currentMemberId]);
        res.redirect("/");
    } catch (err) {
        console.log(err);
    }
});


app.post("/member", async (req, res) => {
    if(req.body.add === "Add Family Member") {
        res.render("new.ejs");
    } else {
        currentMemberId = req.body.member;
        res.redirect("/");
    }
});

app.post("/new", async (req, res) => {
    const name = req.body.name;
    const color = req.body.color;

    const result = await db.query(
        "INSERT INTO members (name, color) VALUES($1, $2) RETURNING *;",
        [name, color]
    );

    const id = result.rows[0].id;
    currentMemberId = id;
    res.redirect("/");
    
});

//...
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
