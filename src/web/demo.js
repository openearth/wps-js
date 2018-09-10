// initialize wpsService
var wpsService = new WpsService({
  url: "http://geoprocessing.demo.52north.org:8080/wps/WebProcessingService",
  version: "2.0.0"
});

var capabilities,
    processDescription; // the process description

var capabilitiesCallback = function(response) {

  capabilities = response;

  // extract processes, add them to process-list
  //array of processes
  var processes = response.capabilities.processes;

  var _select = $('<select>');
  $.each(processes, function(index, process) {
    _select.append(
      $('<option></option>').val(process.identifier).html(process.identifier)
    );
  });
  $('#processes').append(_select.html());
  $('#processes_execute').append(_select.html());

  // set value of textarea
  var capabilitiesDocument = capabilities.responseDocument;

  $("textarea#capabilitiesText").val((new XMLSerializer()).serializeToString(capabilitiesDocument));
};

var describeProcessCallback = function(response) {

  processDescription = response;

  //set value of textarea
  var processDocument = processDescription.responseDocument;

  $("textarea#processDescriptionText").val((new XMLSerializer()).serializeToString(processDocument));

};

var clearForms = function(){

  //clear select
  $("#processes option").remove();
  $("#processes_execute option").remove();


  $("#processes").append($('<option></option>').val("default").html("Select a Process"));
  $("#processes_execute").append($('<option></option>').val("default").html("Select a Process"));

  //clear textareas
  $("textarea#capabilitiesText").val("empty");
  $("textarea#processDescriptionText").val("empty");
};

$(document).ready(function() {

  $("#wps").change(function() {
    //clear old textarea values
    clearForms();

    // get selected wps (url)
    var wpsUrl = $('#wps option:selected').text();

    // only eexecute if wpsUrl is a http url
    if(!wpsUrl.startsWith("Select")){
      if($("#wps-version").prop("checked"))
        wps = new WpsService({url : wpsUrl, version : "2.0.0"});
      else
        wps = new WpsService({url : wpsUrl, version : "1.0.0"});

      wps.getCapabilities_GET(capabilitiesCallback);
    }

  });

  $("#processes").change(function() {
    // get selected wps (url)
    var processId = $('#processes option:selected').text();

    // only eexecute if id != default value "Select a Process"
    if(! processId.startsWith("Select"))
      wps.describeProcess_GET(describeProcessCallback, processId);

  });
  $("#processes_execute").change(function() {
    // get selected wps (url)
    /**
     * WPS execute request via HTTP POST
     *
     * @callbackFunction is called with a parameter 'wpsResponse' after the WPS was contacted. The parameter 'wpsResponse' either comprises a JavaScript Object representation of the WPS response or, if an error occured, error properties 'textStatus' and/or 'errorThrown'! .
     *                   Takes the response object as argument
     * @processIdentifier the identifier of the process
     * @responseFormat either "raw" or "document", default is "document"
     * @executionMode either "sync" or "async";
     * @lineage only relevant for WPS 1.0; boolean, if "true" then returned
     *          response will include original input and output definition; false per default
     * @inputs an array of needed Input objects, use JS-object InputGenerator to
     *         create inputs
     * @outputs an array of requested Output objects, use JS-object
     *          OutputGenerator to create inputs
     */
    var processIdentifier = $('#processes option:selected').text();
    var callbackFunction = function(resp) {
      console.log(resp);
    }
    var responseFormat = 'document';
    var executionMode = 'sync';
    var lineage = false;
    var inputs = []
    var inputGenerator = new InputGenerator();
    var input = inputGenerator.createComplexDataInput_wps_1_0_and_2_0(
      'json_input',
      'application/json',
      undefined,
      undefined,
      false,
      JSON.stringify({a: 3})
    );
    inputs.push(input);
    var outputs = [];
    wps.execute(
      callbackFunction,
      processIdentifier,
      responseFormat,
      executionMode,
      lineage,
      inputs,
      outputs
    );
  });

  $("#wps-version").change(function(){
    if (wpsService){
      if($("#wps-version").prop("checked"))
        wpsService.version = "2.0.0";
      else
        wpsService.version = "1.0.0";
    }
  });
});
