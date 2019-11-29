
firebase.auth().onAuthStateChanged(async function(user) {
    if (user) {
        // User is signed in.
        user.updateProfile({
            displayName: $('#nameField')[0].value
        });

        let res = await $.post('https://distribuited-project.web.app/sign', {
            id: user.uid
        });
        if(res.ok){
            window.location.href = 'home';
        }


    } else {
        // No user is signed in.
    }
});

async function sign(){

    let name = $('#nameField')[0].value;
    let email = $('#emailField')[0].value;
    let password = $('#passwordField')[0].value;
    let confirm = $('#confirmField')[0].value;


    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
        // Handle Errors here.
        let errorCode = error.code;
        let errorMessage = error.message;
        // ...
    });


}