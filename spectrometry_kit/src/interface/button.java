class Button {

  public String text;
  public int x = 0;
  public int y = 0;
  public int padding = 10;
  public int width = 100;
  public int height = headerHeight;
  public int fontSize = 24;
  public boolean hovering = false;

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

  void draw() {
    if (hovering) fill(24);
    else noFill();
    stroke(255);
    rect(x,y,width,height);
    fill(255);
    noStroke();
    text(text,x+padding,y+height-((height-fontSize)/2));
  }

  void hover() {
    if (mouseOver()) { 
      hovering = true;
    } else {
      hovering = false;
    }
  }

}
