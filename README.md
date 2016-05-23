# Taxonomy-Visualiser
D3 project that visualises GBIF and NBN taxonomies via web services. This was created for the FSC Tomorrow's Biodiversity project by Rich Burkmar in order to try out some D3 features and to demonstrate the utility of web service APIs on taxonomic databases such as GBIF and NBN.

To implement this project with minimum changes, you need to honour the file structure coded into the html and javascript files. So to do that, create a folder '/sites/vis/taxv1' under the root of your website and copy all the contents of the Taxonomy-Visualiser project in there (including the sub-folders).

The file 'taxv1.html' can be used as a test page to fire the whole thing up. You will notice that the 'taxv1.html' file also references some files outside of the main '/sites/vis/taxv1' - namely included D3 and JQuery files/folders under '/sites/vis/various'. Again, to get a test running with minimum changes, reporduce that files structure on your web server and copy the files into there. You can find these files. 

You can base any page you create - e.g. a Drupal page - on the 'taxv1.html' file. You can see there is minimal HTML in it - that is mostly injected by the taxv1.js file from a file called 'taxv1-import.html' - that is mainly to facilitate moving easily from the development to the live environment with minimum updating of HTML to main website content (e.g. Drupal). Mainly it's all about getting the includes right.

Because the calls to the Taxonomy web rest services are made directly from Javascript - i.e. the client rather than server side - they only work for web services that have Cross Origin Resource Sharing (CORS) allowed. The headers of the GBIF services allow CORS but the NBN web services do not. To get around this, I created a Tom.bio web service that is used to relay NBN web service calls. So instead of making calls to the NBN web service directly, the javascript calls the services on our server which then makes a server to server call to the NBN (allowed) and then simply relays the results back to the calling client. The Tom.bio web service has headers to allow CORS.

If you copy the code 'as is' then your calls to the NBN web service will go via the Tom.bio web service. The existence of this cannot be guaranteed into the future, so you might want to create your own similar web service. The code is in the folder 'tombio-rest-call'.


