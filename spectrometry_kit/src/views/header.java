// Begin header view:
// Right now, this defines both the presentation (the buttons)
// and the functions they represent.
class Header {

  public PImage logo;
  public int rightOffset = 0; // where to put new buttons (shifts as buttons are added)
  public Button[] buttons;
  public Button saveButton;
  public Button heatmapButton;
  public Button setupButton;
  public Button baselineButton;

  public Header() {
    logo = loadImage("logo-small.png");

    saveButton = addButton("Save");
    heatmapButton = addButton("Heatmap");
    setupButton = addButton("Setup");
    baselineButton = addButton("Baseline");
  }

  public Button addButton(String buttonName) {
    // buttons.push(); // add pButton to buttons array
    Button button = new Button(buttonName,width-rightOffset,0);
    rightOffset += button.width;
    button.x -= button.width; 
    return button;
  }

  public void mousePressed() {
    // break this up into some sort of Button model with registration of x,y,w,h
    // Save:
    if (mouseX > width-100) {
      println("Saving to server (button)");
      server.upload();
    }
    // Setup mode:
    if (mouseX > width-200 && mouseX < width-100) {
      controller = "setup";
    }
    // Heatmap mode:
    if (mouseX > width-350 && mouseX < width-200) {
      switchMode();
      controller = "heatmap";
    }
    if (baselineButton.mouseOver()) {
      spectrum.storeReference();
    }
    //if (mouseX > width-400 && mouseX < width-300) {
      //open("~/Desktop/Safari.app");
      //String script = "tell application \'ScreenSaverEngine\' to activate";
      //println("osascript -e \""+script+"\"");
      //system.run("osascript -e \""+script+"\"");
    //}
  }

  public void draw() {
    // Trigger button hover states:
    // for (int i = 0;i < buttons.length;i++) {
    //   buttons[i].hover();
    // }

    fill(255);
    noStroke();
    image(logo,14,14);
    textFont(font,24);
    text("PLOTS Spectral Workbench: "+typedText, 55, 40); //display current title

    saveButton.draw();
    heatmapButton.draw();
    setupButton.draw();
    baselineButton.draw();
  }
}


