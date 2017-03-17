(function() {

  /**
   * Obtains parameters from the hash of the URL
   * @return Object
   */
  function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }

  function updateNum(num) {
    var content = search.innerHTML.replace(/^\s+|\s*(<br *\/?>)?\s*$/g,"");
    var contentList = content.split(/\s*<br ?\/?>\s*/);
    var lastSong = contentList[contentList.length - 2];
    num = [parseInt(lastSong.charAt(lastSong.length - 2))];
    console.log(num);
    return num;
  }

  function addRowFn(num) {
    var content = search.innerHTML.replace(/^\s+|\s*(<br *\/?>)?\s*$/g,"");
    var contentList = content.split(/\s*<br ?\/?>\s*/);
    var lastSong = contentList[contentList.length - 2];
    num = [parseInt(lastSong.charAt(lastSong.length - 2)) + 1];
    var newSong = "song" + num[0];
    $(search).append('Song ' + num[0] + ': <br>');
    $(search).append('<input type="text" id=' + newSong + ' size = 35>');
    $(search).append('<br>');
  }

  function getStats(songIDs) {
    if(typeof songIDs != 'undefined' && songIDs.length != 0) {
      $.ajax({
        url: '/getStats',
        data: {
          'songs': songIDs,
          'access': access_token
        }
      }).done(function(data) {

      })
    }
  }

  function getRecs(songIDs) {
    if(typeof songIDs != 'undefined' && songIDs.length != 0) {
      $.ajax({
        url: '/recs',
        data: {
          'songs': songIDs,
          'access': access_token
        }
      }).done(function(data) {
        if (data.songs != 'error') {
          console.log(data.songs.length);
          resultsPlaceholder.innerHTML = resultsTemplate(
          {
            song1: data.songs[0].name,
            song1Link: data.songs[0].preview_url,
            song1Artist:data.songs[0].artists[0].name,
            song2: data.songs[1].name,
            song2Link: data.songs[1].preview_url,
            song2Artist:data.songs[1].artists[0].name,
            song3: data.songs[2].name,
            song3Link: data.songs[2].preview_url,
            song3Artist:data.songs[2].artists[0].name,
            song4: data.songs[3].name,
            song4Link: data.songs[3].preview_url,
            song4Artist:data.songs[3].artists[0].name,
          });
          resultIDs = [
            data.songs[0].id,
            data.songs[1].id,
            data.songs[2].id,
            data.songs[3].id
          ]
          getStats(resultIDs);
          $('#results').show();
          $('#container').show();
        }
      });
    }
    $('#searching').hide();
    $('html, body').animate({scrollTop:$(document).height()}, 'slow');
  }

  function searchSong(num, i, songIDs) {
    songName = "song" + i;
    console.log(songName);
    var song = document.getElementById(songName).value;
    $.ajax({
      url: '/search',
      data: {
        'song': song,
        'access': access_token
      }
    }).done(function(data) {
      if (data.song == 'error') {
        num[0] -= 1;
      } else {
        console.log(data.preview);
        songIDs.push(data.song.id);
        console.log(songIDs);
      }
      if (songIDs.length == num[0]) {
        console.log('searching complete!');
        getRecs(songIDs);
      }
    });
  }

  function searchAll(num) {
    $('#searching').show();
    var songName = "";
    var songIDs = [];
    num = updateNum(num);
    console.log(songIDs);
    for (var i=1; i < num[0]+1; i++) {
      searchSong(num, i, songIDs);
    }
  }

  var userProfileSource = document.getElementById('user-profile-template').innerHTML,
      userProfileTemplate = Handlebars.compile(userProfileSource),
      userProfilePlaceholder = document.getElementById('user-profile');

  var resultsSource = document.getElementById('results-template').innerHTML,
      resultsTemplate = Handlebars.compile(resultsSource),
      resultsPlaceholder = document.getElementById('results');

  var dataSource = document.getElementById('data-template').innerHTML,
      dataTemplate = Handlebars.compile(dataSource),
      dataPlaceholder = document.getElementById('song-data');

  var params = getHashParams();

  var access_token = params.access_token,
      refresh_token = params.refresh_token,
      error = params.error;

  var num = [3]; // keeps track of how many songs

  if (error) {
    alert('There was an error during the authentication');
  } else {
    if (access_token) {
        $.ajax({
          url: 'https://api.spotify.com/v1/me',
          headers: {
            'Authorization': 'Bearer ' + access_token
          },
          success: function(response) {
            userProfilePlaceholder.innerHTML = userProfileTemplate(response);

            $('#login').hide();
            $('#loggedinSearch').show();
            $('#user-profile').hide();
            $('#searching').hide();
            $('#container').hide();

          }
      });
    } else {
        // render initial screen
        $('#login').show();
        $('#loggedinSearch').hide();
    }

    document.getElementById('submit').addEventListener('click', function() {
      searchAll(num);
    }, false);

    document.getElementById('addRow').addEventListener('click', function() {
      addRowFn(num);
    }, false);
  }
})();

