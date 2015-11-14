xml.instruct!

xml.rss "version" => "2.0", "xmlns:dc" => "http://purl.org/dc/elements/1.1/" do
 xml.channel do

   if params[:author]
     xml.title       "Recent spectra by "+params[:author]+" at SpectralWorkbench.org"
   else
     xml.title       "Recent spectra at SpectralWorkbench.org"
   end
   xml.link        url_for :only_path => false, :controller => 'spectrums'
   xml.description "Recently posted open sourcespectra from SpectralWorkbench.org, a Public Laboratory open source research initiative"

   @spectrums.each do |spectrum|
     xml.item do
       xml.title       spectrum.title
       xml.author      spectrum.author
       xml.pubDate     spectrum.created_at.to_s(:rfc822)
       xml.category    "spectrum"
       xml.link        url_for :only_path => false, :controller => 'spectrums', :action => 'show', :id => spectrum.id
       xml.image "https://spectralworkbench.org"+spectrum.photo.url(:large)
       xml.description "<iframe width='500px' height='400px' border='0' src='https://spectralworkbench.org/spectra/embed/"+spectrum.id.to_s+"'></iframe><br />"+RDiscount.new(spectrum.notes).to_s+"<br />See original post: https://spectralworkbench.org/spectra/"+spectrum.id.to_s
       xml.guid        url_for :only_path => false, :controller => 'spectrums', :action => 'show', :id => spectrum.id
     end
   end

 end
end

