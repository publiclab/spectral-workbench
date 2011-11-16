class Button {

  public String text;
  public int x = 0;
  public int y = 0;
  public int padding = 10;
  public int width = 100;
  public int height = headerHeight;
  public int fontSize = 24;
  public boolean hovering = false;
  public boolean down = false;
  public color fillColor = #222222;

  public Button(String pText,int pX, int pY, int pHeight) {
    text = pText;
    x = pX;
    y = pY;
    height = pHeight;
    width = int (textWidth(text)+padding*2);
  }

  // can a class instance be passed a block to store/execute?? Surely...
  public Button(String pText,int pX, int pY) {
    text = pText;
    x = pX;
    y = pY;
    width = int (textWidth(text)+padding*2);
  }

  boolean mouseOver() {
    return (mouseX > x && mouseX < x+width && mouseY > y && mouseY < y+height);
  }

  void up() {
    down = false;
  }
  void down() {
    down = true;
  }

  void draw() {
    strokeCap(PROJECT);
    fill(fillColor);
    stroke(20);
    //strokeWeight(1);
    rect(x,y+1,width-1,height-2);
    //hover
    if (hovering) fill(0,0,0,50);
    rect(x,y+1,width-1,height-2);
    //down
    if (down) fill(0,0,0,50);
    rect(x,y+1,width-1,height-2);
    fill(255);
    noStroke();
    text(text,x+padding,y+height-((height-fontSize)/2));
    hover();
    strokeWeight(1);
  }

  void hover() {
    if (mouseOver()) { 
      hovering = true;
    } else {
      hovering = false;
    }
  }

}
