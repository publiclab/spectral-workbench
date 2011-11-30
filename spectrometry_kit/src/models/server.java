class Server {
  /**
   * Save the current spectrum to the server
   */
  public void upload() {
    //save CSV and JSON:
    String spectraFolder = "spectra/";
    SpectrumPresentation presenter = new SpectrumPresentation(spectrum.buffer);
    
    PrintWriter csv = createWriter(spectraFolder + presenter.generateFileName(typedText, "csv"));
    csv.print(presenter.toCsv());
    csv.close();

    PrintWriter json = createWriter(spectraFolder + presenter.generateFileName(typedText, "json"));
    json.print(presenter.toJson(presenter.generateFileName(typedText, null)));
    json.close();

    //save PNG:
    save(spectraFolder + presenter.generateFileName(typedText, "png")); // this just saves the main pixel buffer

    //save just a subregion as PNG:
    PGraphics pg;
    //store 100 lines of history?
    pg = createGraphics(video.width, 100, P2D);
    pg.beginDraw();
    for (int y=0;y<100;y++) {
      for (int x=0;x<video.width;x++) {
        pg.set(x,y,pixels[spectrum.samplerow*video.width+y*video.width+x]);
      }
    }
    pg.endDraw();
    pg.save(spectraFolder + presenter.generateFileName(typedText + "-alt", "png"));

    //save to web:
    String webTitle = presenter.generateFileName("untitled",null);
    try {
      String response;
      println(serverUrl+"/spectrums/create?spectrum[title]="+webTitle+"&spectrum[author]=anonymous");
      URL u = new URL(serverUrl+"/spectrums/create?spectrum[title]="+webTitle+"&spectrum[author]=anonymous&client=0.5");
      //this.postData(u,presenter.toJson(presenter.generateFileName(typedText, null)).getBytes());

      response = postData(u,bufferImage(pg.get()),presenter.generateFileName(typedText,"png"));
      //clear label buffer
      typedText = "saved: type to label next spectrum";
      println(serverUrl+"/spectra/edit/"+response);
      link(serverUrl+"/spectra/edit/"+response);
    } catch (MalformedURLException e) {
      println("ERROR " +e.getMessage());
    } catch (IOException e) {
      println("ERROR " +e.getMessage());
    }
  }
  /**
   * POST pData to pUrl
   * @return the response
   * Customized for sending pngs with name="spectrum[photo]"
   * ... possibly lead if we switch to ImageIO: http://pastebin.com/f6783c437
   */
  public String postData(URL pUrl, byte[] pData, String filename) {
    // http://wiki.processing.org/w/Saving_files_to_a_web_server
    try {
        URLConnection c = pUrl.openConnection();
        c.setDoOutput(true);
        c.setDoInput(true);
        c.setUseCaches(false);
    
        // set request headers
        final String boundary = "AXi93A";
        c.setRequestProperty("Content-Type", "multipart/form-data; boundary="+boundary);
 
        // open a stream which can write to the url
        DataOutputStream dstream = new DataOutputStream(c.getOutputStream());
 
        // write content to the server, begin with the tag that says a content element is comming
        dstream.writeBytes("--"+boundary+"\r\n");
 
        // describe the content
        // dstream.writeBytes("Content-Disposition: form-data; name=\"data\"; filename=\"whatever\" \r\nContent-Type: text/json\r\nContent-Transfer-Encoding: binary\r\n\r\n");
        dstream.writeBytes("Content-Disposition: form-data; name=\"photo\"; filename=\""+filename+"\" \r\nContent-Type: image/png\r\nContent-Transfer-Encoding: binary\r\n\r\n");
        dstream.write(pData ,0, pData.length);
 
        // close the multipart form request
        dstream.writeBytes("\r\n--"+boundary+"--\r\n\r\n");
        dstream.flush();
        dstream.close();
 
        // read the output from the URL
        BufferedReader in = new BufferedReader(new InputStreamReader(c.getInputStream()));
        StringBuilder sb = new StringBuilder(in.readLine());
        String s = in.readLine();
        while (s != null) {
            s = in.readLine();
            sb.append(s);
        }
        return sb.toString();
    } catch (Exception e) {
        e.printStackTrace();
        return null;
    }
  }
}
