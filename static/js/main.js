// This ensures that your function is called once after all the DOM elements of the page are ready to be used.
$(document).ready(function(){
  
    // When we type in search box and autocomplete fills 10 rows
    $("#autocomplete-input").autocomplete({
      // When song is getting searched
      source: function(request, response) {
        var results = $.ui.autocomplete.filter(songs, request.term);
        response(results.slice(0, 10));
      },
      // When a song is selected from dropdown
      select: function (event, ui) {
        $("#songID").val(ui.item.id);
      }
    });

  // Get input field
	const inputField = document.getElementById('autocomplete-input');  // Or we can use: document.querySelector() 
	
	const inputHandler = function(e) {
    // If input field is blank then disable it
    if(e.target.value == ""){
      $('#predict_button').attr('disabled', true);
    }
    else{
      $('#predict_button').attr('disabled', false);
    }
  }
  // Now at input field we are adding this function, so it will check whether value in input field is filled or not
  // then only `Search` button will be enabled
  inputField.addEventListener('input', inputHandler);


  // When Search button is clicked
  $('#predict_button').on('click', function(event) {
  	// First check input field is empty or not
    const inputField = document.getElementById('autocomplete-input');
    console.log(inputField.value);
  	if(inputField.value == "" ) {
  		return;
  	}
    // event.preventDefault();
    const selected_model = $('#ml_models').val()
    console.log(selected_model);
    // var selected_model = $('.same-as-selected').text()
    const available_models = ["dt", "rf", "xgb", "lr", "svc"];
    if(selected_model == "" || selected_model == null || !available_models.includes(selected_model)) {
      swal("Please select any model from dropdown!");
      return;
    }

    var songID = $('#songID').val();
    console.log(songID);
    if (songID == "") {
      $('.output').css('display','none');
      $('#autocomplete-input').val('');
      swal("Selected song is not in our database", "Please select a song from dropdown!", "warning");
    }
    else {
      predictForSong(songID, selected_model);
    }
  });
});


// Get prediction for selected song
function predictForSong(song_id, model) {
    const url = '/predict/?song=' + song_id +"&model=" + model;
    // $("#loading").fadeIn();
    $.ajax({
      type:'GET',
      url: url,
      dataType: 'html',
      success: function(response){
        // When results are sucessfully fetched then display it
        console.log(response);
        // Convert string to json
        data = JSON.parse(response);
        // $this.html($this.response('Predict'));
        // $('#text_box')[0].value = "";
        if (data["probability"] == "null") {
          document.getElementById("predict_result").style.backgroundColor = "rgb(100,100,100,0.8)"
          document.getElementById("predict_result").innerHTML = "Error!";
        } else {
          $('#output_div').css('display','block');
          // document.getElementById("predict_result").style.backgroundColor = "rgb(100,100,100,0.8)";
          document.getElementById("predict_result").innerHTML = data["song_name"]+" has a "+ data['probability'] + "% chance of being a billboard hit!";
        }
        // Making autocomplete and input val ''
        $('#autocomplete-input').val('');
        $('#songID').val('');
        // Disable predict button
        $('#predict_button').attr('disabled', true);
      },
      error: function(){
        // Making autocomplete and input val ''
        $('#autocomplete-input').val('');
        $('#songID').val('');
        // Display alert 
        swal("Internal Server Error!", "Cannot fetch information right now", "error");
      },
    });
}