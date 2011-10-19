class Filter implements AudioSignal, AudioListener
{
  private float[] leftChannel;
  private float[] rightChannel;
  private Minim minim;
  private FFT fft;
  private AudioInput in;
  private AudioOutput out;
  public int bsize;
  public Filter(PApplet parent)
  {
    bsize = 512;
    minim = new Minim(parent);
    minim.debugOn();
    in = minim.getLineIn(Minim.MONO, bsize);
    out = minim.getLineOut(Minim.MONO, bsize);
    leftChannel = new float[bsize];
    rightChannel= new float[bsize];
    // create an FFT object that has a time-domain buffer 
    // the same size as jingle's sample buffer
    // note that this needs to be a power of two 
    // and that it means the size of the spectrum
    // will be 512. see the online tutorial for more info.
    fft = new FFT(out.bufferSize(), out.sampleRate());
    fft.window(FFT.HAMMING);
    // passes the mic input to the spectrum filter class
    in.addListener(this);
    // passes the result of the spectrum filter class to the audio output
    out.addSignal(this);
  }
  // This part is implementing AudioListener interface, see Minim reference
  synchronized void samples(float[] samp)
  {
    arraycopy(samp,leftChannel);
  }
  synchronized void samples(float[] sampL, float[] sampR)
  {
    arraycopy(sampL,leftChannel);
    arraycopy(sampR,rightChannel);
  }  
  // This part is implementing AudioSignal interface, see Minim reference
  void generate(float[] samp)
  {
    arraycopy(leftChannel,samp);
//    audiocount += 1;
//    if (audiocount > 100) {
//    audiocount = 0;
    if (true) {
    fft.forward(samp);
    loadPixels();

    int index = int (video.width*samplerow); //the middle horizontal strip

    for (int x = 0; x < fft.specSize(); x+=1) {

      int vindex = int (map(x,0,fft.specSize(),0,video.width));
      int pixelColor = pixels[vindex];
      int r = (pixelColor >> 16) & 0xff;
      int g = (pixelColor >> 8) & 0xff;
      int b = pixelColor & 0xff;

      //samp[x] = samp[x] *0;//* map((r+b+g)/3,0,255,0.00,1.00);
      // this version uses the raw incoming light to generate audio:
      //fft.setBand(x,map((r+b+g)/3.00,0,255,0,1));
      // this version uses the *absorption*, i.e. the difference between the last spectrum and the current one
      if (absorption[x] < 0) {
        fft.setBand(x,map(0,0,255,0,1));
      } else {
        fft.setBand(x,map(contrastEnhancedAbsorption[x]/3.00,0,255,0.4,0.7));
      }
//    fft.setBand(x,fft.getBand(x) * map((r+b+g)/3.00,0,255,0.3,0.7));
      index++;
    }
    fft.inverse(samp);
    }
  }
  // this is a stricly mono signal
  void generate(float[] left, float[] right)
  {
    //     arraycopy(leftChannel,left);
    //     arraycopy(rightChannel,right);
    generate(left);
    generate(right);
  }
}

