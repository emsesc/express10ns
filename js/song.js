//look at the above example and the APPController declaration for syntax
//both API and UI modules take in no parameters
//Remember that in the revealing module pattern, we have to explicitly reveal any variables or methods we want to be public.

//spotify api call
//api controller gets the access_token to be passed into the next private method to get spotify data and finally
//get the recommendations

const APIController = (function() {
  const clientId = "3d587cbc3d534a7a8d1ee805440a6e43";
  const clientSecret = "c239943d4b7840ccb6f1a9d8ac514c99";

    // private methods
    const _getToken = async () => {
        console.log("[!] Getting the token to get you authorized...")
        //https://developer.spotify.com/documentation/general/guides/authorization-guide/#client-credentials-flow
        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
              	//content-type: how should the parameters be encoded?
                'Content-Type' : 'application/x-www-form-urlencoded', 
              	
              	//btoa() encodes a string in base64
              	//what is the string that needs to be encoded?
                'Authorization' : 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
						
          	//what request body parameters are needed?
            //the format should be a string, no spaces. ex/  'parameter_name=value'
            body: 'grant_type=client_credentials'
        });

        const data = await result.json();
        return data.access_token;
    }

    const _getPlaylistItems = async (token, playlistId, limit) => {
        console.log("[?] Getting 5 songs out of a playlist...")
        //https://developer.spotify.com/documentation/web-api/reference/playlists/get-playlists-tracks/
        //set the query parameter limit to this limit ^ param
        const queryString = `limit=${limit}`

        //hint: the api endpoint should include the playlistId parameter somewhere
	      //'https://api.spotify.com/v1/playlists/' + playlistId + '/tracks'        
        const result = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks` + '?' + queryString, {
            method: 'GET',
            headers: {
                'Authorization' : 'Bearer ' + token
            }
        });

        const data = await result.json();
        return data.items;
    }

    const _getRecommendations = async(token, seedTracks, limit) => {
        console.log('[?] Getting your personalized recommendation based on your emotions..')
        //uses emotion data to set a minimum and max valence
        const emotion = document.querySelector('#hidden-emotion').value;
        
        //default values
        let minValence = 0;
        let maxValence = 1;

        //if sad, then range from 0 to 0.33
        if (emotion < .33){
            maxValence = .33;
        }
        
        //if happy, range from .66 to 1
        else if (emotion > .66){
            minValence = .66;
        }
        
        //if neutral, range from .33 to .66
        else{
            minValence = .33;
            maxValence = .66;
        }

        //make api call below, which is kind of like the one in the azure function that called for the face api
        let params = new URLSearchParams({
	          'min_popularity': '70',
	          'limit': limit,
            'seed_tracks' : seedTracks,
            'min_valence' : minValence,
            'max_valence' : maxValence
        })

        const result = await fetch('https://api.spotify.com/v1/recommendations' + '?' + params.toString(),{
        /*The await expression causes async function execution to pause until a Promise is settled 
        (that is, fulfilled or rejected), and to resume execution of the async function after fulfillment. 
        When resumed, the value of the await expression is that of the fulfilled Promise*/
            method: 'GET',
            //we don't need a body since we're not posting anything. we just want data returned by passing in the params
            headers: {
                'Authorization' : 'Bearer ' + token
            }
        });
        const data = await result.json();
        return data.tracks[0];
      }

      //this reveals methods we want to be public:
      return {
        //public method has the same name but NO UNDERSCORE
        getToken() {
          //inside the method I'm calling the private method and returning the result
            return _getToken();
        },
      	getPlaylistItems(token, playlistId, limit) {
            return _getPlaylistItems(token, playlistId, limit);
        },
        getRecommendations(token, seedTracks, limit) {
            return _getRecommendations(token, seedTracks, limit);
        }
      }
})();

// calling the public methods!
//these are all valid calls after they were revealed in the return method which can also be written like this:
/* return {
        getToken: _getToken,
        getPlaylistItems: _getPlaylistItems,
        getRecommendations: _getRecommendations 
}*/

//APIController.getToken();
//APIController.getPlaylistItems(token, playlistId, limit);
//APIController.getRecommendations(token, seedTracks, limit);

// UI Module
// This module displays one song
const UIController = (function() {
  //object to hold references to html selectors
  const DOMElements = {
      button: '#song-button',
      divSongDetail: '#song-detail'
  }

  //public methods
return {

  //the inputField is an object containing references to the html fields 
   inputField: {
      songButton: document.querySelector(DOMElements.button),
      songDetail: document.querySelector(DOMElements.divSongDetail)
    },

    // need method to create the song detail
    createTrackDetail(img, title, artist) {
        const detailDiv = document.querySelector(DOMElements.divSongDetail)

        console.log("[!] Putting your song in Step 3!")

        // any time user clicks a new song, we need to clear out the song detail div
        //?
        detailDiv.innerHTML = '';

        const html = 
        `
        <div class="songdisplay">
            <img class="songcovers" src="${img}" alt=""> 
            </br>    
            <h4>           
            ${title}- ${artist}
            </h4>
        </div> 
        `;

      
        //stick the html string into detailDiv
        //insertAdjacentHTML is needed becuase we are displaying more than one song as the user continues to press the button
        detailDiv.insertAdjacentHTML('afterend', html);
    }

  }
})()

//APPController controls the actual logic of the app and controls when the APICalls are made and the UI input fields are changed.
//takes the modules as parameters
const APPController = (function(UICtrl, APICtrl) {
    // get input field object ref
  	//hint: u need to use the UICtrl parameter... something like UICtrl.<objectName>

    const DOMInputs = UICtrl.inputField;

    //create event listener and button to call Spotify API on submit
    const buttonElement = DOMInputs.songButton;
    buttonElement.addEventListener('click', async(event) => {
                    console.log(`%c ________________________________________
< Thank you for clicking! New song coming... >
 ----------------------------------------
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`, "font-family:monospace")
        const token = await APIController.getToken();
        //api related functions are async and therefore need to be called with await
        const playlistId = "37i9dQZF1DXcBWIGoYBM5M";
        //playlist of top 50 hits

        const tracks = await APIController.getPlaylistItems(token, playlistId, 5);
        //get five tracks

        let seedTracks = tracks.map(a => a.track.id) 
        //array of IDs of the 5 received tracks

        const recommendedTrack = await APIController.getRecommendations(token, seedTracks, 1);
        //call api to get 1 track
        
        //creating a new trackDetail to display the song  
        UICtrl.createTrackDetail(recommendedTrack.album.images[2].url, 
            recommendedTrack.name, recommendedTrack.artists[0].name);
    });
})(UIController, APIController)