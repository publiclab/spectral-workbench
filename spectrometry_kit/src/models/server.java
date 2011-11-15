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
    PGraphics pg;

    pg = createGraphics(80, 80, P3D, spectraFolder + "alt-" + presenter.generateFileName(typedText, "png"));
    pg.beginDraw();
    //pg.background(102);
    //pg.stroke(255);
    //pg.line(40, 40, mouseX, mouseY);
    pg.endDraw();
    save(spectraFolder + presenter.generateFileName(typedText, "png"));
    //save to web:
    try {
      println(serverUrl+"/spectrums/create?title="+typedText);
      URL u = new URL(serverUrl+"/spectrums/create?title="+typedText);
      //URL u = new URL(serverUrl+"/spectrums/create?title="+typedText);
      this.postData(u,presenter.toJson(presenter.generateFileName(typedText, null)).getBytes());
    } catch (MalformedURLException e) {
      println("ERROR " +e.getMessage());
    } catch (IOException e) {
      println("ERROR " +e.getMessage());
    }
    //clear label buffer
    typedText = "saved: type to label next spectrum";
    link(serverUrl+"/spectrums/label/1");
  }
  /**
   * POST pData to pUrl
   * @return the response
   */
  public String postData(URL pUrl, byte[] pData) {
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
        dstream.writeBytes(boundary+"\r\n");
 
        // discribe the content
        dstream.writeBytes("Content-Disposition: form-data; name=\"data\"; filename=\"whatever\" \r\nContent-Type: text/json\r\nContent-Transfer-Encoding: binary\r\n\r\n");
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
