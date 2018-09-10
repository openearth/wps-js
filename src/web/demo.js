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
    var jsonInput = {"type":"FeatureCollection","features":[{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[3.2299804687499996,51.52925135518991],[3.427734375,51.172455303299],[4.3011474609375,51.26535213392538],[4.29840087890625,51.42832700421254],[3.6090087890625004,51.515579783755925],[3.7628173828124996,51.67255514839674],[3.93310546875,51.80691653515817],[4.04296875,51.80691653515817],[4.119873046875,51.87309959004367],[4.42474365234375,51.82559340146247],[4.29290771484375,52.05924589011585],[4.64447021484375,52.399067302933304],[4.87518310546875,52.826001860971836],[5.438232421875,53.108865487028616],[5.847473144531249,53.32759237756109],[6.30615234375,53.337433437129675],[6.712646484375,53.28492154619624],[7.086181640625,53.1928702436326],[7.283935546874999,53.199451902831555],[7.218017578125001,53.44880683542759],[6.8994140625,53.75520681580145],[5.44921875,65.25670649344259],[-9.4921875,63.39152174400882],[0.85693359375,52.01869808104436],[3.2299804687499996,51.52925135518991]]]}}]};

    var inputs = [];
    var inputGenerator = new InputGenerator();
    var input = inputGenerator.createComplexDataInput_wps_1_0_and_2_0(
      'json_input',
      'application/json',
      undefined,
      undefined,
      false,
      JSON.stringify(jsonInput)
    );
    inputs.push(input);

    var outputs = [];

    var outputGenerator = new OutputGenerator();
    var identifier = 'json_output';
    var asReference = false;
    var mimeType = 'application/json';
    var complexOutput = outputGenerator.createComplexOutput_WPS_1_0(
      identifier,
      mimeType,
      undefined,
			undefined,
      undefined,
      asReference,
      'title',
      'abstract'
    );
    outputs.push(complexOutput);

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
