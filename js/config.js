function loadFile(event){
    console.log("[!] Got picture!");
    console.log(`%c ________________________________________
< thank youuuuuuuuuu mooooooooooooooooo >
 ----------------------------------------
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`, "font-family:monospace")
    var image = document.getElementById("output");
    // Get image from output 
    image.src = URL.createObjectURL(event.target.files[0])
    // load inputted image into the image src and display
}

// main function for interacting with face api
async function handle(event) {
    console.log("-----------Loading picture-------------");
    document.getElementById("output").src = "img/loading.gif";
    $('#emotion').html("Loading...");
    // target the output element ID and change content
    event.preventDefault();
    // stop the page from reloading

    var myform = document.getElementById("image-form");
        var payload = new FormData(myform);
    console.log(`%c ________________________________________
< Posting your image to Azure to get emotions... >
 ----------------------------------------
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`, "font-family:monospace")
        const resp = await fetch("https://spotifyfaceapp.azurewebsites.net/api/imageparser?code=HPEACydXT9FLjCQwejBqYYerVU5rJCjUayUz4i8tK6s9ahY55XnCKw==", {
            method: 'POST',
            body: payload
        });

        var data = await resp.json();
        //sets emotion to the first result of the request

        try {
          var emotion = data.result[0].faceAttributes.emotion;
        }
        catch(err) {
          alert("Please submit a picture with a real face! Try again.");
          window.location.reload();
        }


        var resultString = `
        <h3> Emotions in your image: </h3><br />
        <p> 😠 Anger: ${emotion.anger}</p>
        <p> ️😄 Happiness: ${emotion.happiness}</p>
        <p> 😮 Surprise: ${emotion.surprise}</p>
        <p> 😒 Contempt: ${emotion.contempt}</p>
        <p> 🤢 Disgust: ${emotion.disgust}</p>
        <p> 😱 Fear: ${emotion.fear}</p>
        <p> 😥 Sadness: ${emotion.sadness}</p>
        <p> 😐 Neutral: ${emotion.neutral}</p>
        `;

        var valence = emotion.happiness + emotion.surprise - emotion.anger - emotion.contempt - emotion.disgust - emotion.fear - emotion.sadness;

        if (valence < emotion.neutral) {
            valence = 0.5
        } else if (valence > 1) {
            valence = 1
        } else if (valence < 0) {
            valence = 0
        }
            console.log(`%c ________________________________________
< You will be able to see your emotions soon! >
 ----------------------------------------
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`, "font-family:monospace")
        $('#emotion').html(resultString);
        $('#hidden-emotion').html(valence);
}