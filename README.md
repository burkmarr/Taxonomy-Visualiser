# Taxonomy-Visualiser
This is a D3 project that visualises GBIF and NBN Atlas taxonomies via web services. This was created for the FSC Tomorrow's Biodiversity project by Rich Burkmar in order to try out some D3 features and to demonstrate the utility of web service APIs on taxonomic databases such as GBIF and NBN Atlas.

To implement this project with minimum changes, you need to honour the file structure coded into the html and javascript files. So to do that, create a folder '/sites/vis/taxv1' under the root of your website and copy all the contents of the Taxonomy-Visualiser project in there (including the sub-folders).

The file 'taxv1.html' can be used as a test page to fire the whole thing up. 

You can base any page you create - e.g. a Drupal page - on the 'taxv1.html' file. You can see there is minimal HTML in it - that is mostly injected by the taxv1.js file from a file called 'taxv1-import.html' - that is mainly to facilitate moving easily from the development to the live environment with minimum updating of HTML to main website content (e.g. Drupal). Mainly it's all about getting the includes right.

Because the calls to the Taxonomy web rest services are made directly from Javascript - i.e. the client rather than server side - they only work for web services that have Cross Origin Resource Sharing (CORS) allowed. The headers of both GBIF and NBN Atlas services allow CORS. 


