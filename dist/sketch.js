let numberOfButtons = 9;// automatically generate circular synth based on this

let endedTouches = []; // array to store ended touches in
let buttonPositions = []; // position to draw the buttons
let buttonState = []; //store state of the buttons
let buttonColour  = []; // colour of the buttons at any given time
let buttonOffColour = []; // default off colours
let buttonOnColour = []; // default on colours
let synthState = []; // we need to store whether a note is playing because the synth is polyphonic and it will keep accepting on messages with every touch or moved touch and we won't be able to switch them all off
let radius; // radius of the buttons
let offsetT; // to store the difference between x and y readings once menus are taken into account
let r; // radius of the circle around which the buttons will be drawn
let angle = 0; // variable within which to store the angle of each button as we draw it
let step; // this will be calculated and determine the gap between each button around the circle
let ongoingTouches = []; // array to copy the ongoing touch info into
let notes = []; // notes for the synth in this example
var allTheNotes =  ["C1", "C#1", "D1", "D#1", "E1", "F1", "F#1", "G1", "G#1", "A1", "A#1", "B1",
                    "C2", "C#2", "D2", "D#2", "E2", "F2", "F#2", "G2", "G#2", "A2", "A#2", "B2",
                    "C3", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3",
                    "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4",
                    "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "A#5", "B5",
                    "C6", "C#6", "D6", "D#6", "E6", "F6", "F#6", "G6", "G#6", "A6", "A#6", "B6",
                    "C7", "C#7", "D7", "D#7", "E7", "F7", "F#7", "G7", "G#7", "A7", "A#7", "B7",
                    "C8", "C#8", "D8", "D#8", "E8", "F8", "F#8", "G8", "G#8", "A8", "A#8", "B8"]; // all the notes available to us in the code
var major = [0,2,4,5,7,9,11,12,14]; // intervals for a major scale for 9 notes
var pentatonic = [0,2,4,7,9,12,14,16,19]; // intervals for a pentatonic scale for 9 notes
var minor = [0,2,3,5,7,8,10,12,14]; // intervals for a minor scale for 9 notes
var majorBlues = [0,2,3,4,7,9,12,14,15]; // intervals for a major blues scale for 9 notes
var minorBlues = [0,3,5,6,7,10,12,15,17]; // intervals for a minor scale for 9 notes
var scales = ["default", pentatonic, major, minor, majorBlues, minorBlues];
var scale; // variable to store the scale in
var theKey = 0; // this variable sets the default key on load
var octave = 36; //set the default octave on load
let synth; // variable within which to create the synth
let soundOn = false; // have we instigated Tone.start() yet? (needed to allow sound)
let whichKey = [0,0,0,0,0,0,0,0,0]; // array ensures only one trigger per qwerty click
let mouseState = []; // variable to store mouse clicks and drags in
let mouseClick = false;


function setup() {  // setup p5
  step = TWO_PI/numberOfButtons; // in radians the equivalent of 360/6 - this will be used to draw the circles position
  console.log(`step = ${step}`);
  scale = pentatonic; // sets the default scale on load

  document.addEventListener('keydown', handleKeyDown); //add listener for keyboard input
  document.addEventListener('keyup', handleKeyUp); //add listener for keyboard input

  let masterDiv = document.getElementById("container");
  let divPos = masterDiv.getBoundingClientRect(); //The returned value is a DOMRect object which is the smallest rectangle which contains the entire element, including its padding and border-width. The left, top, right, bottom, x, y, width, and height properties describe the position and size of the overall rectangle in pixels.
  let masterLeft = divPos.left; // distance from left of screen to left edge of bounding box
  let masterRight = divPos.right; // distance from left of screen to the right edge of bounding box
  let cnvDimension = masterRight - masterLeft; // size of div -however in some cases this is wrong, so i am now using css !important to set the size and sca;ing - but have kept this to work out size of other elements if needed

  console.log("canvas sixe = " + cnvDimension);

  let cnv = createCanvas(cnvDimension, cnvDimension); // create canvas - because i'm now using css size and !important this sizing actually reduntant
  cnv.id('mycanvas'); // assign id to the canvas so i can style it - this is where the css dynamic sizing is applied
  cnv.parent('p5parent'); //put the canvas in a div with this id if needed - this also needs to be sized

  // *** add vanilla JS event listeners for touch which i want to use in place of the p5 ones as I believe that they are significantly faster
  let el = document.getElementById("p5parent");
  el.addEventListener("touchstart", handleStart, false);
  el.addEventListener("touchend", handleEnd, false);
  el.addEventListener("touchcancel", handleCancel, false);
  el.addEventListener("touchmove", handleMove, false);
  el.addEventListener("mousedown", handleMouseDown);
  el.addEventListener("mouseup", handleMouseUp);
  el.addEventListener("mousemove", handleMouseMove);
  offsetT = el.getBoundingClientRect(); // get the size and position of the p5parent div so i can use offset top to work out where touch and mouse actually need to be

  colorMode(HSB); // specify HSB colormode and set the range to be between 0 and numberOfButtons
  noStroke(); // no stroke on the drawings

  radius = width/8;
  r = width/3;



  for (let i = 0; i < numberOfButtons; i++) { // for each button build mouseState default array
    mouseState.push(0);
  }

  if (window.DeviceOrientationEvent) {      // if device orientation changes we recalculate the offsetT variable
    window.addEventListener("deviceorientation", handleOrientationEvent);
  }

  welcomeScreen(); // initial screen for project - also allows an elegant place to put in the Tone.start() command.
                    // if animating put an if statement in the draw() function otherwise it will instantly overide it
  createButtonPositions(); // generate the default array info depending on number of buttons
}

function handleOrientationEvent() {
  let el = document.getElementById("p5parent");
  offsetT = el.getBoundingClientRect(); // get the size and position of the p5parent div so i can use offset top to work out where touch and mouse actually need to be
}

function welcomeScreen() {
  background(100, 0, 50); // background is grey (remember 5 is maximum because of the setup of colorMode)
  textSize(32);
  textAlign(CENTER, CENTER);
  text("Orchlab Synth Cello. Touch screen or click mouse or use keys QWERTYUIO", width/10, height/10, (width/10) * 8, (height/10) * 8);
}

function createButtonPositions() {
  let _x = [width/5, (width/5) *2.5, (width/5) *4, width/5, (width/5) *2.5, (width/5) *4, width/5, (width/5) *2.5, (width/5) *4];
  let _y = [height/5, height/5, height/5, (height/5) * 2.5, (height/5) * 2.5, (height/5) * 2.5, (height/5) * 4, (height/5) * 4, (height/5) * 4];

  for(let i = 0; i < numberOfButtons; i++) {

    let theNote = scale[i] + octave + theKey; // the note plus the octave plus the offset from the key menu

    //create our buttonPositions array
    buttonPositions.push({
      x: _x[i],
      y: _y[i]
    });

    buttonState.push(0); //create default state of the buttons array
    buttonColour.push(300); // set default colour of the buttons
    buttonOffColour.push(300); // create default off colours
    buttonOnColour.push(60); // create default on colours
    synthState.push(0); //create default state of the synth array
    notes.push(allTheNotes[theNote]); //create the scale that we are using

  }
  console.log(notes);
  console.log("offset height = " + offsetT.top);
}

/*

function draw() {  // p5 draw function - the traditional way to do this in p5 - this is called 60 times a second so needed if want to animate
  background(1, 0, 4); // background is grey (remmember 5 is maximum)

  for (let i = 0; i < buttonPositions.length; i++) {
    fill(buttonColour[i], 4, 4);
    ellipse(buttonPositions[i].x, buttonPositions[i].y, radius * 2);
  }

// ********** this example draws a circle for each touch *************

  for (let t of ongoingTouches) { // cycle through the touches
    //console.log(t) // log the touches if you want to for debugging
    fill(t.identifier % 5, 4, 4); // each touch point's colour relates to touch id. however remember that on iOs the id numbers are huge so this doesn't work so well
    ellipse(t.clientX, t.clientY, 100); //make a circle at the position of the touch
    fill(0, 0, 0); // set colour to black
    //text(t.identifier, t.clientX - 50, t.clientY - 50); // display the touch id on the screen (for debuggin)
  }
  for (let t of endedTouches) { // cycle through the end touches
    let tDiff = millis() - t.time; // set tDiff to tell us how recently we stopped touching
    if (tDiff < 1000) { // if we stopped touching within the last second
      fill(t.id % 5, 4, 4); // set the colour based on the id of the touch that we ended
      ellipse(t.x, t.y, map(tDiff, 0, 1000, 100, 0)); // the circle is drawn smaller and smaller depending on how much time elapsed since touch
    }
  }

// ************************************************************************

}

*/


function drawSynth() { // instead of using the draw function at 60 frames a second we will call this function when something changes
  background(100, 0, 50); // background is grey (remember 5 is maximum)
  for (let i = 0; i < numberOfButtons; i++) {
    fill(buttonColour[i], 70, 70);
    ellipse(buttonPositions[i].x, buttonPositions[i].y, radius * 2);
  }
}

function startAudio() {
    Tone.start(); // we need this to allow audio to start.
    soundOn = true;
    drawSynth();
    synth = new Tone.PolySynth({
      "oscillator": {
        type: 'sawtooth6'
      }
    }).toDestination(); // create a polysynth
    synth.set(  // setup the synth - this is audio stuff really
        {
          "volume": 0, //remember to allow for the cumalative effects of polyphony
          "detune": 0,
          "portamento": 0,
          "envelope": {
            "attack": 25,
            "attackCurve": "linear",
            "decay": 0,
            "decayCurve": "exponential",
            "sustain": 0.3,
            "release": 5,
            "releaseCurve": "exponential"
          },
        }
      );
}

function handleMouseDown(e) {
  mouseClick = true;
  if(soundOn) {
    for (let i = 0; i < numberOfButtons; i++) { // for each button
      let d = dist(e.offsetX, e.offsetY, buttonPositions[i].x, buttonPositions[i].y); // compare the mouse to the button position -
      if (d < radius) { // is the mouse where a button is?
        mouseState[i] = 1;
      }
      handleMouseAndKeys();
    }
  }else{
    startAudio();
  }
}

function handleMouseUp() {
  mouseClick = false;
  for (let i = 0; i < numberOfButtons; i++) { // for each button
    mouseState[i] = 0;
    }
  handleMouseAndKeys();
}

function handleMouseMove(e) {
  for (let i = 0; i < numberOfButtons; i++) { // for each button
    let d = dist(e.offsetX, e.offsetY, buttonPositions[i].x, buttonPositions[i].y); // compare the mouse to the button position - offset for vertical position in DOM
    if ((d < radius) && (mouseClick === true)) { // is the mouse where a button is and is the button clicked?
      mouseState[i] = 1;
    }else{
      mouseState[i] = 0;
    }
  }
  handleMouseAndKeys();
}

function handleMouseAndKeys() {   // this function ensures only one "on" or "off" between mouse and key interactions
  for (let i = 0; i < numberOfButtons; i++) { // for each button
    if((mouseState[i] === 1) && (whichKey[i] === 0)){ // if the button is on
      playSynth(i); // call play synth for that button
     }else if((mouseState[i] === 0) && (whichKey[i] === 1)){ // if the button is on
      playSynth(i); // call play synth for that button
    }else if ((mouseState[i] === 0) && (whichKey[i] === 0)){ // otherwise if the button is off
      stopSynth(i); // call stopsynth for that button
    }else{
      return;
    }
  }
}

function handleStart(e) {
  e.preventDefault(); // prevent default touch actions like scroll
  if(soundOn){
    let _touches = e.changedTouches; //assign the changedTouches to an array called touches
    ongoingTouches.push(copyTouch(_touches[0])); //copy the new touch into the ongoingTouches array
    //console.log(ongoingTouches); // debugging
    touchButton(e);
  }else{
    startAudio();
    let _touches = e.changedTouches; //assign the changedTouches to an array called touches
    ongoingTouches.push(copyTouch(_touches[0])); //copy the new touch into the ongoingTouches array
  }
}

function handleMove(e) {
  e.preventDefault(); // prevent default touch actions like scroll
  let _touches = e.changedTouches; //assign the changedTouches to an array called touches

  for (var i = 0; i < _touches.length; i++) {
    var idx = ongoingTouchIndexById(_touches[i].identifier); //call a function that will compare this touch against the list and assign the return to idx
    if (idx >= 0) { // did we get a match?
      // console.log("continuing touch "+idx); // debugging
    // console.log("index = " + idx);
      ongoingTouches.splice(idx, 1, copyTouch(_touches[i]));  // swap in the new touch record
      // console.log(".");
    } else { // no match
      console.log("can't figure out which touch to continue");
    }
  }
  touchButton(e);
}

function handleEnd(e) {
  e.preventDefault(); // prevent default touch actions like scroll
  let _touches = e.changedTouches; //assign the changedTouches to an array called touches

  for (var i = 0; i < _touches.length; i++) {

    var idx = ongoingTouchIndexById(_touches[i].identifier); //call a function that will compare this touch against the list and assign the return to idx

    if (idx >= 0) { // did we get a match?
      console.log("touchend "+idx);
      ongoingTouches.splice(idx, 1);  // remove it; we're done
    } else { // no match
      console.log("can't figure out which touch to end");
    }
  }
  touchButton(e);
    for (let t of e.changedTouches) { // cycle through the changedTouches array
      // console.log("touch id " + t.identifier + // debugging
      //   " released at x: " + t.clientX +
      //   " y: " + t.clientY)
      endedTouches.push({ //create our ended touches array of objects from which we can call .time, .id, .x, .y
        time: millis(),
        id: t.identifier,
        x: t.clientX,
        y: t.clientY
      });
    }
}

function handleCancel(e) { // this handles touchcancel
  e.preventDefault();  // prevent default touch actions like scroll
  console.log("touchcancel."); //debugging
  var touches = e.changedTouches; //assign the changedTouches to an array called touches

  for (var i = 0; i < touches.length; i++) {
    var idx = ongoingTouchIndexById(touches[i].identifier); //call a function that will compare this touch against the list and assign the return to idx
    ongoingTouches.splice(idx, 1);  // remove it; we're done
  }
}

function copyTouch({ identifier, clientX, clientY }) { // this function is used to facilitate copying touch ID properties
  return { identifier, clientX, clientY };
}

function ongoingTouchIndexById(idToFind) { //compares the more complex stuff to give a simple answer to the question "which touch"
for (var i = 0; i < ongoingTouches.length; i++) {
  var id = ongoingTouches[i].identifier;

  if (id == idToFind) {
    return i;
  }
}
return -1;    // not found
}

function touchButton() { // function to handle the touch interface with the buttons

  let _touches = ongoingTouches; //assign the changedTouches to an array called touches
  let _buttonState = []; // array to store buttonstate in

  for(let i = 0; i < numberOfButtons; i++) {
    _buttonState.push(0);
  }

  //**** first let's check if each touch is on a button, and store the state in our local variable */

  // i'm using offset.top to change the touch reference to take into consideration the DOM elements above it. If needed you can do the same with  left, top, right, bottom, x, y, width, height.

  if(_touches.length != 0){ // if the touches array isn't empty
    for (var t = 0; t < _touches.length; t++) {  // for each touch
      for (let i = 0; i < numberOfButtons; i++) { // for each button
        let d = dist(_touches[t].clientX - offsetT.left, _touches[t].clientY - (offsetT.top * 1.1), buttonPositions[i].x, buttonPositions[i].y); // compare the touch to the button position
        if (d < radius) { // is the touch where a button is?
          _buttonState[i] = 1; // the the button is on
        }else{
          _buttonState[i] = _buttonState[i] + 0; // otherwise add a 0 to the state of that button (another toucch might have put it on you see)
        }
      }
    }
  }

  console.log(_buttonState);

  // ********** now our _buttonState array should accurately reflect the state of the touches and buttons so we can do something with it

  for (let i = 0; i < numberOfButtons; i++) { // for each button
    if(_touches.length === 0){ // if there are no touches at all
      stopSynth(i); // call stop synth for each button
    }else if(_buttonState[i] === 1){ // otherwise if the button is on
      playSynth(i); // call play synth for that button
    }else{ // otherwise if the button is off
      stopSynth(i); // call stopsynth for that button
    }
  }
}

keyMap = {
  'KeyQ' : 0,
  'KeyW' : 1,
  'KeyE' : 2,
  'KeyR' : 3,
  'KeyT' : 4,
  'KeyY' : 5,
  'KeyU' : 6,
  'KeyI' : 7,
  'KeyO' : 8
}

function handleKeyDown(e) {

  let key = e.code;
  console.log("keydown "+key); //debugging

  if(soundOn){
    if (key in keyMap) {
      console.log(`this works ${keyMap[key]}`);
      if(whichKey[keyMap[key]] === 0) {
        whichKey[keyMap[key]] = 1;
        handleMouseAndKeys();
      }
    }
  }else{
    startAudio();
  }
}

function handleKeyUp(e) {
  var key = e.code;
  console.log("keyup "+key); //debugging

  if (key in keyMap) {
    console.log(`this works end ${keyMap[key]}`);
    whichKey[keyMap[key]] = 0;
    handleMouseAndKeys();
  }

}

function playSynth(i) {
  if(synthState[i] === 0) { // if the synth is not playing that note at the moment
    synth.triggerAttack(notes[i]); // play the note
    synthState[i] = 1; // change the array to reflect that the note is playing
    buttonColour[i] = buttonOnColour[i]; //change the colour of the button to on colour
    drawSynth();
  }
}

function stopSynth(i) {
  if(synthState[i] === 1) { // if the synth is playing that note at the moment
    synth.triggerRelease(notes[i]); // stop the note
    synthState[i] = 0; // change the array to reflect that the note is playing
    buttonColour[i] = buttonOffColour[i]; //change the colour of the button to off colour
    drawSynth();
  }
}

 // the following is to do with the select boxes and making them look pretty


 selectBoxes("keymenu"); //make a pretty keymenu
 selectBoxes("scalemenu"); //make a pretty scalemenu
 selectBoxes("octavemenu"); //make a pretty octavemenu

 function selectBoxes(name) {

 var x, i, j, l, ll, selElmnt, a, b, c;
 /* Look for any elements with the class "custom-select": */
 x = document.getElementsByClassName(name);
 l = x.length;
 for (i = 0; i < l; i++) {
   selElmnt = x[i].getElementsByTagName("select")[0];
   ll = selElmnt.length;
   /* For each element, create a new DIV that will act as the selected item: */
   a = document.createElement("DIV");
   a.setAttribute("class", "select-selected");
   a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
   x[i].appendChild(a);
   /* For each element, create a new DIV that will contain the option list: */
   b = document.createElement("DIV");
   b.setAttribute("class", "select-items select-hide");
   for (j = 1; j < ll; j++) {
     /* For each option in the original select element,
     create a new DIV that will act as an option item: */
     c = document.createElement("DIV");
     c.innerHTML = selElmnt.options[j].innerHTML;
     c.addEventListener("click", function(e) {
         /* When an item is clicked, update the original select box,
         and the selected item: */
         var y, i, k, s, h, sl, yl;
         s = this.parentNode.parentNode.getElementsByTagName("select")[0];
         sl = s.length;
         h = this.parentNode.previousSibling;
         for (i = 0; i < sl; i++) {
           if (s.options[i].innerHTML == this.innerHTML) {
             s.selectedIndex = i;
             console.log(name + (" ") + s.selectedIndex); //debugging
             handleMenu(name, s.selectedIndex);   // send the menu name and the index of the selection to the handlemenu function
             h.innerHTML = this.innerHTML;
             y = this.parentNode.getElementsByClassName("same-as-selected");
             yl = y.length;
             for (k = 0; k < yl; k++) {
               y[k].removeAttribute("class");
             }
             this.setAttribute("class", "same-as-selected");
             break;
           }
         }
         h.click();
     });
     b.appendChild(c);
   }
   x[i].appendChild(b);
   a.addEventListener("click", function(e) {
     /* When the select box is clicked, close any other select boxes,
     and open/close the current select box: */
     e.stopPropagation();
     closeAllSelect(this);
     this.nextSibling.classList.toggle("select-hide");
     this.classList.toggle("select-arrow-active");
     //console.log(a.innerHTML);
   });
 }
 }

 function closeAllSelect(elmnt) {
   /* A function that will close all select boxes in the document,
   except the current select box: */
   var x, y, i, xl, yl, arrNo = [];
   x = document.getElementsByClassName("select-items");
   y = document.getElementsByClassName("select-selected");
   xl = x.length;
   yl = y.length;
   for (i = 0; i < yl; i++) {
     if (elmnt == y[i]) {
       arrNo.push(i)
     } else {
       y[i].classList.remove("select-arrow-active");
     }
   }
   for (i = 0; i < xl; i++) {
     if (arrNo.indexOf(i)) {
       x[i].classList.add("select-hide");
     }
   }
 }

 /* If the user clicks anywhere outside the select box,
 then close all select boxes: */
 document.addEventListener("click", closeAllSelect);

 function handleMenu(menu, index) { // function to handle the menu selections and change scales and keys
   if(menu === "keymenu"){
     theKey = index -1; // set the variable to the correct scale - the minus 1 is to offset it to allow for the default menu setting
     console.log("the key is "+theKey); //debugging
     for(var i = 0; i < 9; i++) {
       var theNote = scale[i] + octave + theKey; // the note plus the octave plus the offset from the key menu
       notes[i] = allTheNotes[theNote]; // pick the notes from the all the notes array
     }
   }else if(menu === "scalemenu"){
     console.log("the scale is "+index);
     scale = scales[index];
     console.log(scale);
     for(var i = 0; i < 9; i++) {
       var theNote = scale[i] + octave + theKey; // the note plus the octave plus the offset from the key menu
       notes[i] = allTheNotes[theNote]; // pick the notes from the all the notes array
     }
   } else {
     console.log("the octave is "+index);
     octave = index * 12;                      //octave switching here WORKING HERE
     for(var i = 0; i < 9; i++) {
       var theNote = scale[i] + octave + theKey; // the note plus the octave plus the offset from the key menu
       notes[i] = allTheNotes[theNote]; // pick the notes from the all the notes array
     }
   }
 }
