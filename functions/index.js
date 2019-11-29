const functions = require('firebase-functions');
const fs = require('fs');
const express = require('express');
const app = express();
const { config, engine } = require('express-edge');
let Cloudant = require('@cloudant/cloudant');

var cloudant = new Cloudant({
    url: 'https://1c227427-2d20-422e-b738-f56b9b6350a7-bluemix.cloudantnosqldb.appdomain.cloud',
    plugins: { iamauth: { iamApiKey: 'Tt8FrhyiNOGUmvKF4ZQWWWIDnkFJfKinF-7lEdZhgCjy' } }
});

let db = cloudant.use('test');
// Automatically sets view engine and adds dot notation to app.render
app.use(engine);
app.set('views', './views');
app.set('etag', false);

app.get('/', (req, res) => {
    res.render('login');
});

app.get('/sign', (req, res) => {

    res.render('sign');
});

app.post('/sign', async (req, res) => {
    let body = req.body;
    let doc = {
        _id: body.id,
        classes: []
    };
    res.json(await db.insert(doc));
});

app.get('/home', (req, res) => {
    res.render('home');
});


app.get('/database/:id', async (req, res) => {
    try{
        let doc = await db.get(req.params['id']);
        res.json(doc);
    }catch (e) {
        res.json(e);
    }

});

app.post('/database', async (req, res) => {
    try{
        let result = await db.insert(req.body);
        res.json(result);
    }catch (e) {
        res.json(e);
    }
});

app.post('/join', async (req, res) => {
    let body = req.body;
    let doc = await db.find({
        selector: {
            code: {
                '$eq': body.code
            }
        }
    });

    let docs = doc.docs;

    if (docs.length > 0){

        let profile = await db.get(body.id);
        profile.classes.push({
            id: docs[0]._id
        });

        res.json(await db.insert(profile));
    }else {
        res.json({
            ok: false
        });
    }

});

app.post('/create', async (req, res) => {
    let body = req.body;
    let code = generate(4);
    let doc = await db.insert({
        code: code,
        name: body.name,
        activities: []
    });

    let profile = await db.get(body.id);
    profile.classes.push({
        id: doc.id,
        code: code,
        name: body.name
    });

    let result = await db.insert(profile);

    res.json(result);
});


function generate(len){
    let keys = [];
    for(let i = 0; i < len; i++){
        let val = Math.floor(Math.random() * 52);
        if(val > 25) val += 'A'.charCodeAt(0) - 26;
        else val += 'a'.charCodeAt(0);
        keys.push(String.fromCharCode(val));
    }
    return keys.join('');
}


app.post('/insertActivity', async (req, res) => {

    let body = req.body;
    let now = new Date();

    let activity = {
        'user_name': body.activity.user_name,
        'user_email': body.activity.user_email,
        'activity_name': body.activity.activity_name,
        'date': body.activity.date,
        'insert_time': now.toISOString()
    };

    let doc = await db.get(body.class_id);
    doc.activities.push(activity);

    res.json(await db.insert(doc));
});


exports.app = functions.https.onRequest(app);





