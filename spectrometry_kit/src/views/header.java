// Begin header view:
// Right now, this defines both the presentation (the buttons)
// and the functions they represent.
class Header {

  public PImage logo;
  public int rightOffset = 0; // where to put new buttons (shifts as buttons are added)
  public Button[] buttons;
  public Button setupButton;

  public Header() {
    // we could define all our buttons here... 
    // and they could call functions in the controller?

    //setupButton = new Button("Setup",width-500,0);
    logo = loadImage("logo-small.png");
  }

  public void addButton(Button pButton) {
    // buttons.push(); // add pButton to buttons array
    rightOffset += pButton.width;
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

    int padding = 10;
    noFill();
    stroke(255);
    //rect(width-100,0,100,headerHeight);
    fill(255);
    noStroke();
    //text("Save",width-100+padding,40);
    noFill();
    stroke(255);
    rect(width-200,0,100,headerHeight-1);
    fill(255);
    noStroke();
    text("Setup",width-200+padding,40);
    noFill();
    stroke(255);
    rect(width-350,0,150,headerHeight-1);
    fill(255);
    noStroke();
    text("Heatmap",width-350+padding,40);
  }
}


