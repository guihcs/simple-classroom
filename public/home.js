
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // User is signed in.



        refresh();
    } else {
        // No user is signed in.

        window.location.href = '/';
    }
});

let currentClassID;

async function loadActivities(id){
    currentClassID = id;
    $('#pageContent').empty();

    $('#pageContent').append(`<div id="listContent" class="list-content"></div>`);
    $('#listContent').append(`
        <div class="title-container">
            <h1 class="content-title"> Your Activities </h1>
            <button class="button add-activity-button" onclick="showModal('#activityModal')">Add Activity</button>
        </div>`
    );


    let doc = await $.get('https://distribuited-project.web.app/database/' + id);

    let activities = doc.activities;

    for (const activity of activities) {
        $('#listContent').append(`
            <div class="list-tile">
                <div class="list-title">${activity.activity_name}</div>
                <div class="list-date">${activity.date}</div>
                <div>${activity.user_name}</div>
            </div>
        `);
    }

}

async function refresh() {
    let user = firebase.auth().currentUser;

    try{
        let doc = await $.get('https://distribuited-project.web.app/database/' + user.uid);

        let classes = doc.classes;

        $('#pageContent').empty();
        $('#pageContent').append(`<h1 class="content-title"> Your Classes </h1>`);
        $('#pageContent').append(`<div id="cardContent" class="card-content"></div>`);
        for (const class1 of classes) {
            $('#cardContent').append(`
            <div class="card" onclick="loadActivities('${class1.id}')">
                <div class="card-title">${class1.name}</div>
                ${class1.hasOwnProperty('code') ? '<div class="card-title">' + class1.code + '</div>' : ''}
            </div>
        `);
        }
    }catch (e) {
        console.log(e);
    }

}

function showDropdown(){
    $('#dropdown')[0].classList.toggle('show');
}

function showModal(modalID){
    $(modalID)[0].classList.toggle('show');
}

function dropDownSelect(value){
    $('#dropdown')[0].classList.toggle('show');
    switch (value) {
        case 'join':{
            showModal('#joinModal');
            break;
        }
        case 'create':{
            showModal('#createClassModal');
            break;
        }
    }
}

async function loadClass(){
    $('#container').empty();

    for (let i = 0; i < 5; i++) {
        $('#container').append('<div> mae de pantana </div>');
    }
}


async function logout(){
    firebase.auth().signOut().then(function() {
        var provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        window.location.href = '/';
    }).catch(function(error) {
        // An error happened.
    });
}


async function createClass(){
    let className = $('#classNameField')[0].value;

    let uid = firebase.auth().currentUser.uid;

    let result = await $.post('https://distribuited-project.web.app/create', {
        id: uid,
        name: className
    });

    if(result.ok){
        showModal('#createClassModal');
        refresh();
    }

}


async function joinClass(){
    let code = $('#codeField')[0].value;

    let uid = firebase.auth().currentUser.uid;

    let result = await $.post('https://distribuited-project.web.app/join', {
        id: uid,
        code: code
    });

    if(result.ok){
        showModal('#joinModal');
        refresh();
    }

}

async function addActivity(){
    let activityName = $('#activityName')[0].value;
    let activityDate = $('#activityDate')[0].value;
    let user = firebase.auth().currentUser;


    let doc = await $.post('https://distribuited-project.web.app/insertActivity', {
        'class_id': currentClassID,
        activity: {
            'user_name': user.displayName,
            'user_email': user.email,
            'activity_name': activityName,
            'date': activityDate
        }
    });

    if(doc.ok){
        showModal('#activityModal');
        await loadActivities(currentClassID);
    }

}