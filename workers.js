/* This code adapted from : https://medium.com/young-coder/a-simple-introduction-to-web-workers-in-javascript-b3504f9d9d1c*/ 

/*STEP ONE: 

Create a time consuming task (finding prime numbers in a range) and run in the main thread. After clicking the calculate button, try to do anything on the page  */

/*const submitButton = document.querySelector('input[type="submit"]'); 
submitButton.onclick = doSearch; */

/*function doSearch(e) {
  //prevent default action of form 
  e.preventDefault(); 
  // Get the two numbers in the text boxes. This is the search range.
  var fromNumber = document.getElementById("from").value;
  var toNumber = document.getElementById("to").value;

  var statusDisplay = document.getElementById("status");
  statusDisplay.innerHTML = "Starting new search...";    
  
  // Perform the search.
  var primes = findPrimes(fromNumber, toNumber);

  // Take the results, loop over it,
  // and paste it into one long piece of text.
  var primeList = "";
  for (var i=0; i<primes.length; i++) {
    primeList += primes[i];
    if (i != primes.length-1) primeList += ", ";
  }
  
  // Show the prime number list on the page.
  var primeContainer = document.getElementById("primeContainer");
  primeContainer.innerHTML = primeList;

  var statusDisplay = document.getElementById("status");
  if (primeList.length == 0) {
    statusDisplay.innerHTML = "Search didn't find any results.";
  }
  else {
    statusDisplay.innerHTML = "The results are here!";
  }
}


//the time consuming part 

function findPrimes(fromNumber, toNumber) {

  // Create an array containing all integers
  // between the two specified numbers.
  var list = [];
  for (var i=fromNumber; i<=toNumber; i++) {
    if (i>1) list.push(i);
  }

  // Test for primes.
  var maxDiv = Math.round(Math.sqrt(toNumber));
  var primes = [];

  for (var i=0; i<list.length; i++) {
    var failed = false;
    for (var j=2; j<=maxDiv; j++) {
      if ((list[i] != j) && (list[i] % j == 0)) {
        failed = true;
      } else if ((j==maxDiv) && (failed == false)) {
        primes.push(list[i]);
      }
    }
  }

  return primes;
}*/

/* STEP TWO - move the time consuming part out of the main thread and use a worker. Remember - JS is all about objects. When we are using web workers, we are working with an object called worker. If we want something to run in the background, we create new Worker. */

/* It's also important to keep Web workers and main thread separate. We can create a separate JS file and the worker and the main thread communicate by exchanging messages using the worker's postMessage( ) method. */

/* Revise the doSearch( ) function. Instead of having the primeNumber functionality in the main thread, we'll create a new worker to deal with that. */


let worker;
const submitButton = document.querySelector('input[type="submit"]');
let statusDisplay = document.querySelector('#status'); 
submitButton.onclick = doSearch; 

function doSearch(e) {
  //prevent the default behaviour 
  e.preventDefault(); 
  // Disable the button, so the user can't start more than one search
  // at the same time.
  submitButton.disabled = true;

  // Create the worker.
  worker = new Worker("PrimeNumberWorker.js");

  // Hook up to the onMessage event, so you can receive messages
  // from the worker.
  worker.onmessage = receivedWorkerMessage;

  // Get the number range, and send it to the web worker.
  var fromNumber = document.getElementById("from").value;
  var toNumber = document.getElementById("to").value;

  //postMessage( ) method can only take one value, so we'll use an object literal to store the start and end range. 
  worker.postMessage(
   { from: fromNumber,
     to: toNumber }
  );

  // Let the user know that things are on their way.
  statusDisplay.innerHTML = "A web worker is on the job ("+
   fromNumber + " to " + toNumber + ") ...";
}

function receivedWorkerMessage(event) {
  let message = event.data;

  if (message.messageType == "PrimeList") {
    let primes = message.data;

    // Show the prime number list on the page.
    let primeList = "";
    for (var i=0; i<primes.length; i++) {
      primeList += primes[i];
      if (i != primes.length-1) primeList += ", ";
    }
    let displayList = document.getElementById("primeContainer");
    displayList.innerHTML = primeList;

    if (primeList.length == 0) {
      statusDisplay.innerHTML = "Search failed to find any results.";
    }
    else {
      statusDisplay.innerHTML = "The results are here!";
    }
    searchButton.disabled = false;
  }
  else if (message.messageType == "Progress") {
    statusDisplay.innerHTML = message.data + "% done ...";
  }
}

function workerError(error) {
  statusDisplay.innerHTML = error.message;
}

function cancelSearch() {
  worker.terminate();
  worker = null;
  statusDisplay.innerHTML = "Search cancelled.";
  searchButton.disabled = false;
}