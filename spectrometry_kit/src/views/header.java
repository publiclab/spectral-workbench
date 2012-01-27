class VideoRowButton extends Button {
  VideoRowButton(String PbuttonName,int Px,int Py,int Pheight) { 
	super(PbuttonName,Px,Py,Pheight,"setup"); 
  }
  void draw() {
    if (controller == forController) { 
	super.draw(); 
    }
  }
  void mousePressed() {
    if (controller == forController && super.mouseOver()) {
      setup.selectingSampleRow = true;
    }
  }
}

class SaveButton extends Button {
  SaveButton(String PbuttonName,int Px,int Py,int Pheight) { 
  	super(PbuttonName,Px,Py,Pheight,"all"); 
  }
  void mousePressed() {
    if (super.mouseOver()) {
      if (controller == "hyperspectral") spectrum.saveHyperspectralCube();
      else server.upload();
    }
  }
}

class AnalyzeButton extends Button {
  AnalyzeButton(String PbuttonName,int Px,int Py,int Pheight) {
  	super(PbuttonName,Px,Py,Pheight,"all"); 
  }
  void mousePressed() {
    if (super.mouseOver()) {
      header.switchController("analyze");
      header.heatmapButton.up();
      header.setupButton.up();
      header.analyzeButton.down();
    }
  }
}

class HeatmapButton extends Button {
  HeatmapButton(String PbuttonName,int Px,int Py,int Pheight) {
  	super(PbuttonName,Px,Py,Pheight,"all"); 
  }
  void mousePressed() {
    if (super.mouseOver()) {
      header.switchController("heatmap");
      header.heatmapButton.down();
      header.setupButton.up();
      header.analyzeButton.up();
    }
  }
}
class HyperspectralButton extends Button {
  HyperspectralButton(String PbuttonName,int Px,int Py,int Pheight) { 
  	super(PbuttonName,Px,Py,Pheight,"all"); 
  }
  void mousePressed() {
    if (super.mouseOver()) {
      header.switchController("hyperspectral");
      header.heatmapButton.up();
      header.setupButton.up();
      header.analyzeButton.up();
    }
  }
}

class SetupButton extends Button {
  SetupButton(String PbuttonName,int Px,int Py,int Pheight) { 
  	super(PbuttonName,Px,Py,Pheight,"all"); 
  }
  void mousePressed() {
    if (super.mouseOver()) {
      header.switchController("setup");
      header.heatmapButton.up();
      header.setupButton.down();
      header.analyzeButton.up();
    }
  }
}

class BaselineButton extends Button {
  BaselineButton(String PbuttonName,int Px,int Py,int Pheight) { 
  	super(PbuttonName,Px,Py,Pheight,"analyze"); 
  }
  void mousePressed() {
    if (super.mouseOver()) spectrum.storeReference();
  }
  void draw() {
    if (controller == forController) super.draw();
  }
}

class WebcamButton extends Button {
  WebcamButton(String PbuttonName,int Px,int Py,int Pheight) { 
  	super(PbuttonName,Px,Py,Pheight,"setup"); 
  }
  void draw() {
    if (video.isLinux && controller == forController) super.draw();
  }
  void mousePressed() {
    if (super.mouseOver() && video.isLinux) {
      video.changeDevice(settings.videoDevice+1);
    }
  }
}

class LearnButton extends Button {
  LearnButton(String PbuttonName,int Px,int Py,int Pheight) { 
  	super(PbuttonName,Px,Py,Pheight,"all"); 
  }
  void mousePressed() {
    if (super.mouseOver()) link("http://publiclaboratory.org/wiki/spectral-workbench");
  }
}

// Begin header view:
// Right now, this defines both the presentation (the buttons)
// and the functions they represent.
class Header {
  public PImage logo;
  public int rightOffset = 0; // where to put new buttons (shifts as buttons are added)
  public ArrayList buttons; 
  public Button learnButton;
  public Button saveButton;
  public Button analyzeButton;
  public Button heatmapButton;
  public Button hyperspectralButton;
  public Button setupButton;

  public Button baselineButton;
  public Button webcamButton;
  public Button videoRowButton;
  public int margin = 4;

  public Header() {
    logo = loadImage("logo-small.png");
    buttons = new ArrayList();
    learnButton = addButton(new LearnButton("Learn",width-rightOffset-margin,margin,headerHeight-8));
    saveButton = addButton(new SaveButton("Save",width-rightOffset-margin,margin,headerHeight-8));

    hyperspectralButton = addButton(new HyperspectralButton("Hyperspectral",width-rightOffset-margin,margin,headerHeight-8));
    analyzeButton = addButton(new AnalyzeButton("Analyze",width-rightOffset-margin,margin,headerHeight-8));
    analyzeButton.down();
    heatmapButton = addButton(new HeatmapButton("Heatmap",width-rightOffset-margin,margin,headerHeight-8));
    setupButton = addButton(new SetupButton("Setup",width-rightOffset-margin,margin,headerHeight-8));

    baselineButton = addButton(new BaselineButton("Baseline",width-rightOffset-margin,margin,headerHeight-8));
    baselineButton.fillColor = #444444;
    webcamButton = addButton(new WebcamButton("Switch webcam",width-rightOffset-margin,margin,headerHeight-8));
    webcamButton.fillColor = #444444;
    videoRowButton = addButton(new VideoRowButton("Adjust sample row",width-rightOffset-margin,margin,headerHeight-8));
    videoRowButton.fillColor = #444444;
  }

  public Button addButton(Button pButton) {
    buttons.add(pButton);
    if (pButton.forController == "all") {
      rightOffset += pButton.width+margin;
      if (pButton.forController == controller) {
        pButton.visible = true;
      }
    }
    pButton.x -= pButton.width; 
    return pButton;
  }
//  public Button addButton(String buttonName) {
//    Button button = new Button(buttonName,width-rightOffset-margin,margin,headerHeight-8,"all");
//    addButton(button);
//    return button;
//  }

  public void mousePressed() {
    for (int i = 0;i < buttons.size();i++) {
      Button b = (Button) buttons.get(i);
      b.mousePressed();
    }
  }

  public void switchController(String Pcontroller) {
    controller = Pcontroller;
    
    for (int i = 0;i < buttons.size();i++) {
      Button b = (Button) buttons.get(i);
      if (b.visible && b.forController != "all" && b.forController != Pcontroller) {
	println("removing "+b.text+":"+b.forController);
        rightOffset -= b.width;
        b.visible = false;
      }
    }
    for (int i = 0;i < buttons.size();i++) {
      Button b = (Button) buttons.get(i);
      if (b.forController == Pcontroller) {
	b.visible = true;
	println("adding "+b.text+":"+b.forController);
        rightOffset += b.width;
        b.x = width-rightOffset-margin;
      }
    }
  }

  public void draw() {
    fill(255);
    noStroke();
    image(logo,14,14);
    textFont(font,24);
    text("PLOTS Spectral Workbench", 55, 40); //display current title
    
    for (int i = 0;i < buttons.size();i++) {
      Button b = (Button) buttons.get(i);
      b.draw();
    }
  }
}


