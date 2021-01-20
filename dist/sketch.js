// The Orchlab Cello
// Code by Gawain Hewitt gawainhewitt.co.uk December 2020
// A project for Drake Music https://www.drakemusic.org/ for the Orchlab project https://orchlab.org/
// Made using P5.js https://p5js.org/
// currently using an old version of P5.sound as the latest version causes glitches on Chrome browse on Android


var mode;               // store the detected device - i.e. mobile, tablet, computer
var NumberOfButtons;    // the number of buttons or switches we are using
var picSize;            // how big are the images in each case?
var imagePositionX;     // an array to store the position of the images in each case
var imagePositionY;     // an array to store the position of the images in each case
var translatePos1;      // variable to store the first translate argument in
var translatePos2;      // variable to store the second tranlsate arument in
var info;               // is the info screen showing?
var buttonColour;       // colour of buttons
var onButtonColour;     // colour when button pressed
var offButtonColour;    // default colour
var rootColour;         // colour of button for root note
var stringX1;
var stringX2;
var stringY1;
var stringY2;
var stringY3;
var stringY4;

var touchID;          // to store the touch ID's in so I can assign a note or sound to an ID and then check if the touch is still active
var currentTouch;     // to store the current touches so i release the right button on touchended

var synth = new Tone.PolySynth().toDestination();        // call a new tone synth and patch it to the sound
synth.set(
  {
    "volume": 0,
    "detune": 0,
    "portamento": 0,
    "envelope": {
      "attack": 4,
      "attackCurve": "linear",
      "decay": 0.1,
      "decayCurve": "exponential",
      "release": 4,
      "releaseCurve": "exponential",
      "sustain": 0.3
    },
    "oscillator": {
      "partialCount": 0,
      "partials": [],
      "phase": 0,
      "type": "triangle"
    }
  }
);
var notes = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];    // array containing our musical notes (tone.js will respond to these as is)
const now = Tone.now();


function setup() {
  var renderer = createCanvas(windowWidth, windowHeight); // this paired with below solves the issue of full size screen with scroll bars
  renderer.canvas.style.display = 'block'; // see above - this pair solves scroll bars - adds CSS styling as block to the canvas we have made
  buttonState = [0, 0, 0, 0, 0, 0, 0, 0, 0]; // has a "button" been pressed?
  NumberOfButtons = 8; // I use this at times instead of an integer. However if you change this you will want to change the buttonState array as well, and the files in the sound and image arrays to match
  picSize = 150; // default for picsize - is this even necessary to declare as I change it later? no idea. Not doing any harm though...
  imagePositionX = []; // setting up this variable as an array so I can place image position info in it later
  imagePositionY = []; // as above
  info = true; // show the info screen? used at startup
  textSize(width / 20); // how big the text is depending on which screen you are using
  textAlign(CENTER, CENTER); // where the text goes on the screen
  buttonColour = [color(255, 0, 0, 100), color(255, 0, 0, 100), color(255, 0, 0, 100), color(255, 0, 0, 100), color(255, 0, 0, 100), color(255, 0, 0, 100), color(255, 0, 0, 100), color(255, 0, 0, 100), ];
  onButtonColour = [color(255, 0, 255, 100), color(255, 0, 255, 100), color(255, 0, 255, 100), color(255, 0, 255, 100), color(255, 0, 255, 100), color(255, 0, 255, 100), color(255, 0, 255, 100), color(255, 0, 255, 100), ];
  offButtonColour = [color(255, 0, 0, 100), color(255, 0, 0, 100), color(255, 0, 0, 100), color(255, 0, 0, 100), color(255, 0, 0, 100), color(255, 0, 0, 100), color(255, 0, 0, 100), color(255, 0, 0, 100), ];
  rootColour = color(255, 255, 0, 100);
  touchID = [-1, -1, -1, -1, -1, -1, -1, -1]; // using -1 as android uses ints starting at 0 as ID's to store the touch ID's in so I can assign a note or sound to an ID and then check if the touch is still active
  currentTouch = [0, 0, 0, 0, 0, 0, 0, 0]; // to store currently touched things so I can work out which buttons to switch off on touchended

}

function draw() {
  background(150, 150, 180);

  if (width < 500) { // test for portrait mobile
    mode  = 'portrait_mobile';
    picSize = height/4;
    textSize(width / 20);
    translatePos1 = width/2 - picSize;
    translatePos2 = 0;
    imagePositionX = [picSize * 0, picSize * 1, picSize * 0, picSize * 1, picSize * 0, picSize * 1, picSize * 0, picSize * 1];
    imagePositionY = [picSize * 0, picSize * 0, picSize * 1, picSize * 1, picSize * 2, picSize * 2, picSize * 3, picSize * 3];

  }
  else if (width < 1000 && height < 500) { // test for landscape mobile
    mode  = 'landscape_mobile';
    picSize = width/8;
    textSize(width / 20);
    translatePos1 = width/4 + (picSize/4)*2;
    translatePos2 = (height/2 - picSize) + picSize/4;
    imagePositionX = [picSize * 0, picSize, picSize * 2, picSize * 3, picSize * 0, picSize, picSize * 2, picSize * 3];
    imagePositionY = [picSize, picSize * 1.33, picSize, picSize * 1.33, picSize * 1.66, picSize * 2, picSize * 1.66, picSize * 2];
    stringX1 = picSize * 0 - picSize * 1.5;
    stringX2 = picSize * 3 + picSize/4 * 6;
    stringY1 = picSize;
    stringY2 = picSize/3 * 4;
    stringY3 = picSize/3 * 5;
    stringY4 = picSize * 2;

  }
  else if ((height < 1300 && height > 600) && (width < 1000 && width > 600)) { // test for landscape tablet
    mode  = 'portrait_tablet';
    picSize = height/4;
    textSize(width / 20);
    translatePos1 = width/2 - picSize;
    translatePos2 = 0;
    imagePositionX = [picSize * 0, picSize * 1, picSize * 0, picSize * 1, picSize * 0, picSize * 1, picSize * 0, picSize * 1];
    imagePositionY = [picSize * 0, picSize * 0, picSize * 1, picSize * 1, picSize * 2, picSize * 2, picSize * 3, picSize * 3];

  } else if ((width < 1300 && width > 600) && (height < 1000 && height > 600)) { // test for landscape tablet
    mode  = 'landscape_tablet';
    picSize = width/8;
    textSize(width / 20);
    translatePos1 = width/4 + (picSize/4)*2;
    translatePos2 = (height/2 - picSize) + picSize/4;
    imagePositionX = [picSize * 0, picSize, picSize * 2, picSize * 3, picSize * 0, picSize, picSize * 2, picSize * 3];
    imagePositionY = [picSize, picSize * 1.33, picSize, picSize * 1.33, picSize * 1.66, picSize * 2, picSize * 1.66, picSize * 2];
    stringX1 = picSize * 0 - picSize * 1.5;
    stringX2 = picSize * 3 + picSize/4 * 6;
    stringY1 = picSize;
    stringY2 = picSize/3 * 4;
    stringY3 = picSize/3 * 5;
    stringY4 = picSize * 2;

  } else {
    mode  = 'default';
    picSize = width/8;
    textSize(width / 20);
    translatePos1 = width/4 + (picSize/4)*2;
    translatePos2 = (height/2 - picSize) + picSize/4;
    imagePositionX = [picSize * 0, picSize, picSize * 2, picSize * 3, picSize * 0, picSize, picSize * 2, picSize * 3];
    imagePositionY = [picSize, picSize * 1.33, picSize, picSize * 1.33, picSize * 1.66, picSize * 2, picSize * 1.66, picSize * 2];
    stringX1 = picSize * 0 - picSize * 1.5;
    stringX2 = picSize * 3 + picSize/4 * 6;
    stringY1 = picSize;
    stringY2 = picSize/3 * 4;
    stringY3 = picSize/3 * 5;
    stringY4 = picSize * 2;
  }

  // text(mode, 10, 30); displays which mode it detects for debugging

  translate(translatePos1, translatePos2); // move x and y "home" based on the if/else loops above (remember this is cumalitive through this loop)

  // this next bit draws the strings
  strokeWeight(4);
  line(stringX1, stringY1, stringX2, stringY1);
  line(stringX1, stringY2, stringX2, stringY2);
  line(stringX1, stringY3, stringX2, stringY3 );
  line(stringX1, stringY4, stringX2, stringY4);

  for (var i = 0; i < NumberOfButtons; i++) { // this loop draws the circles and sizes them based on the if/else loops above
    fill(buttonColour[i]);
    ellipseMode(RADIUS);
    ellipse(imagePositionX[i], imagePositionY[i], picSize/4);
  }


// this next bit controls the info screen - also remember that translate is cumalative!
  if (info) {
    if ((mode ==='landscape_tablet') || (mode ==='default')) {
      fill(255, 200, 255, 200);
      rect(0, 0, picSize * 4, picSize * 2);
      fill(0);
      text('The Orchlab Percussion Box', picSize * 2, picSize/2);
      text('Use the letters QWERTYUI to play', picSize * 2, picSize);
      text('Or touch the screen', picSize * 2, picSize/4 * 5);
    }
    else if (mode ==='landscape_mobile')
    {
      fill(255, 200, 255, 200);
      rect(0, 0, picSize * 4, picSize * 2);
      fill(0);
      text('The Orchlab Percussion Box', picSize * 2, picSize/2);
      text('Touch the screen to play', picSize * 2, picSize);
    }
    else if ((mode === 'portrait_tablet') || (mode === 'portrait_mobile'))
    {
      fill(255, 200, 255, 200);
      rect(0, 0, picSize * 2, picSize * 4);
      fill(0);
      text('The Orchlab', picSize, picSize);
      text('Percussion Box', picSize, picSize/4 * 5);
      text('Touch the screen', picSize, picSize * 2);
      text('to play', picSize, picSize/4 * 9);
    }
  }
}

function mousePressed() {                 // this is a P5.js event listener. If the mouse is pressed and on one of the buttons, then the corrosponding file number is sent to my buttonPressed function
  for (var i = 0; i < NumberOfButtons; i++) {
    let d = dist(mouseX, mouseY, imagePositionX[i] + translatePos1, imagePositionY[i] + translatePos2);
    if (d < picSize/4) {
      buttonPressed(i);
    }
  }
}

function mouseReleased() {                 // this is a P5.js event listener. If the mouse is pressed and on one of the buttons, then the corrosponding file number is sent to my buttonPressed function
  for (var i = 0; i < NumberOfButtons; i++) {

      endedTrack(i);

  }
}

function touchStarted() {               // same as above but for touch. P5 manages touch/mouse conflicts etc which is nice
  if(info === true){
    Tone.start();
    info = false;
  }
  for (var i = 0; i < NumberOfButtons; i++) {
    for(let j = 0; j < touches.length; j++) {
      let t = dist(touches[j].x, touches[j].y, imagePositionX[i] + translatePos1, imagePositionY[i] + translatePos2);
      if (t < picSize/4) {
            touchID[i] = touches[j].id;
            buttonPressed(i);
      }
    }
  }
  return false;
}

function touchEnded() {             // as coded this currently follows a touch around the screen. So if you click on a "button", move the touch and then let go, it will only release the button when that touch is ended, regardless of position
  if(touches.length < 1){                   // if there are no touch events (as in you released the last one)
      for (var i = 0; i < NumberOfButtons; i++) {
        if(touchID[i] != -1){               //if the touchID number in the array is -1 then no touch - therefore if there is one that is not that number it has previously been touched and needs to be switched off
          endedTrack(i);                    // call the endedTrack function with the correct track number
        }
      }
  }
  else {                                    // if there is still one of more touch event but touchEnded has been triggered
    for (var i = 0; i < NumberOfButtons; i++) {   // this loop sets the currentTouch array to zero to begin tests
      currentTouch[i] = 0;
    }
    for(let j = 0; j < touches.length; j++) {     // step through the live touches
      for (var i = 0; i < NumberOfButtons; i++) { // compare each touch to each "button"
        if(touchID[i] === touches[j].id){         // if there is a match between a live touch and a stored touch
          currentTouch[i] = 1;                    // set that index of the currentTouch array to 1 to show it should remain
        }
      }
    }
    for (var i = 0; i < NumberOfButtons; i++) {   // step through the "buttons"
      if((currentTouch[i] === 0)) { // if there are any where there is no touch
        endedTrack(i);                                          //switch it off!
      }
    }
  }
  return false; /* prevents the mobile browser from processing some default
  * touch events, like swiping left for "back" or scrolling
  * the page.*/
}

// this prevents dragging screen around
function touchMoved() {
  return false;
}

function keyPressed() {     // this listens for key presses on the ol' Qwerty - doesn't seem to allow more than four or five at once. Not sure why
  switch(key) {
    case "q" :
      buttonPressed(0);
      break;
    case "Q" :
      buttonPressed(0);
      break;
    case "w" :
      buttonPressed(1);
      break;
    case "W" :
      buttonPressed(1);
      break;
    case "e" :
      buttonPressed(2);
      break;
    case "E" :
      buttonPressed(2);
      break;
    case "r" :
      buttonPressed(3);
      break;
    case "R" :
      buttonPressed(3);
      break;
    case "t" :
      buttonPressed(4);
      break;
    case "T" :
      buttonPressed(4);
      break;
    case "y" :
      buttonPressed(5);
      break;
    case "Y" :
      buttonPressed(5);
      break;
    case "u" :
      buttonPressed(6);
      break;
    case "U" :
      buttonPressed(6);
      break;
    case "i" :
      buttonPressed(7);
      break;
    case "I" :
      buttonPressed(7);
      break;
  }
}

function keyReleased() {     // this listens for key presses on the ol' Qwerty
  switch(key) {
    case "q" :
      endedTrack(0);
      break;
    case "Q" :
      endedTrack(0);
      break;
    case "w" :
      endedTrack(1);
      break;
    case "W" :
      endedTrack(1);
      break;
    case "e" :
      endedTrack(2);
      break;
    case "E" :
      endedTrack(2);
      break;
    case "r" :
      endedTrack(3);
      break;
    case "R" :
      endedTrack(3);
      break;
    case "t" :
      endedTrack(4);
      break;
    case "T" :
      endedTrack(4);
      break;
    case "y" :
      endedTrack(5);
      break;
    case "Y" :
      endedTrack(5);
      break;
    case "u" :
      endedTrack(6);
      break;
    case "U" :
      endedTrack(6);
      break;
    case "i" :
      endedTrack(7);
      break;
    case "I" :
      endedTrack(7);
      break;
  }
}

function windowResized() {                    // p5 function that is called every time the window is resized - allows the site to respond to changing dimensions
  resizeCanvas(windowWidth, windowHeight);
}

function buttonPressed(i) {             // my function for playing files and setting the buttonstate. At present the images are linked to the onended command for p5sound which calls enndedTrack
  if(info === true){                    // this also needs to be in here as well as in touch started to handle qwerty keys and mouse events
    Tone.start();
    info = false;
  }
  playSynth(i);
  buttonState[i] = 1;
  buttonColour[i] = onButtonColour[i];
}

function endedTrack(i) {                     // when the file stops playing this is called and changes images and buttonState
  buttonColour[i] = offButtonColour[i];
  buttonState[i] = 0;
  touchID[i] = -1;
  currentTouch[i] = 0;
  synth.triggerRelease(notes[i]);
  //stopSynth(i);
}

function playSynth(i) {
  synth.triggerAttack(notes[i], Tone.now());
}

function stopSynth(i) {
  //synth.triggerRelease(notes[i], Tone.now());
  //synth.releaseAll();
}
