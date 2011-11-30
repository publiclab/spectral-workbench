// Begin header view:
// Right now, this defines both the presentation (the buttons)
// and the functions they represent.
class Header {

  public PImage logo;
  public int rightOffset = 0; // where to put new buttons (shifts as buttons are added)
  public Button[] buttons; // we should store all buttons in here instead of explicitly defining, as below:
  public Button learnButton;
  public Button saveButton;
  public Button analyzeButton;
  public Button heatmapButton;
  public Button setupButton;
  public Button baselineButton;
  public Button videoButton;
  public int margin = 4;

  public Header() {
    logo = loadImage("logo-small.png");
    learnButton = addButton("Learn");
    saveButton = addButton("Save");
    heatmapButton = addButton("Heatmap");
    setupButton = addButton("Setup");
    analyzeButton = addButton("Analyze");
    analyzeButton.down();
    baselineButton = addButton("Baseline");
    baselineButton.fillColor = #444444;
    videoButton = addButton("Video input");
    videoButton.fillColor = #444444;
  }

  public Button addButton(String buttonName) {
    // buttons.push(); // add pButton to buttons array
    Button button = new Button(buttonName,width-rightOffset-margin,margin,headerHeight-8);
    rightOffset += button.width+margin;
    button.x -= button.width; 
    return button;
  }

  public void mousePressed() {
    // eventually define these in the button definitions...
    // Save:
    if (saveButton.mouseOver()) {
      server.upload();
    }
    if (analyzeButton.mouseOver()) {
      controller = "analyze";
      heatmapButton.up();
      setupButton.up();
      analyzeButton.down();
    }
    if (setupButton.mouseOver()) {
      controller = "setup";
      heatmapButton.up();
      setupButton.down();
      analyzeButton.up();
    }
    if (heatmapButton.mouseOver()) {
      controller = "heatmap";
      heatmapButton.down();
      setupButton.up();
      analyzeButton.up();
    }
    if (baselineButton.mouseOver()) {
      spectrum.storeReference();
    }
    if (videoButton.mouseOver()) {
      video.changeDevice(video.device+1);
    }
    if (learnButton.mouseOver()) {
      link("http://publiclaboratory.org/wiki/spectral-workbench");
    }
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
    learnButton.draw();
    analyzeButton.draw();
    heatmapButton.draw();
    setupButton.draw();
    baselineButton.draw();
    videoButton.draw();
  }
}


