# Taxonomy-Visualiser
D3 project that visualises GBIF and NBN taxonomies via web services. This was created for the FSC Tomorrow's Biodiversity project by Rich Burkmar in order to try out some D3 features and to demonstrate the utility of web service APIs on taxonomic databases such as GBIF and NBN.

To implement this project with minimum changes, you need to honour the file structure coded into the html and javascript files. So to do that, create a folder '/sites/vis/taxv1' under the root of your website and copy all the contents of the Taxonomy-Visualiser project in there (including the sub-folders).

The file 'taxv1.html' can be used as a test page to fire the whole thing up. You will notice that the 'taxv1.html' file also references some files outside of the main '/sites/vis/taxv1' - namely included D3 and JQuery files/folders under '/sites/vis/various'. Again, to get a test running with minimum changes, reporduce that files structure on your web server and copy the files into there. You can find these files under a GitHub repo called TomBio-JS-Includes. 

You can base any page you create - e.g. a Drupal page - on the 'taxv1.html' file. You can see there is minimal HTML in it - that is mostly injected by the taxv1.js file from a file called 'taxv1-import.html' - that is mainly to facilitate moving easily from the development to the live environment with minimum updating of HTML to main website content (e.g. Drupal).


