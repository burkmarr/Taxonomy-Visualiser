var tombio;

(function() {
    tombio = {
        pop: null,
        nameFormat: null,
        authority: false,
        nbnLineage: null,
        infowidth: 700,
        infoheight: 500,
        zoom: null,
        controlsOut: false,
        controlsOffset: 0,
        source: null,
        url: null,
        jsonobject: null,
        lastNode: null,
        depthFactor: 1,
        nodeButtonsShown: false,
        data: [],
        r: 10,
        r2: 40,
        r3: 20,
        depthpx: 150,
        margin: { top: 20, right: 120, bottom: 20, left: 120 },
        width: null,
        height: null,
        i: 0,
        duration: 750,
        matchingTaxa: null,
        tree: d3.layout.tree(),
        diagonal: d3.svg.diagonal().projection(function (d) { return [d.y, d.x]; }),  //swapping x & y creates paths going left to right instead of default top to bottom
        svg: null,
        popupNode: null,
        gbifpagelimit: 20,
        gbifranks: ["kingdom", "phylum", "class", "order", "family", "genus", "species"],
        atlasranks: ["kingdom", "phylum", "class", "order", "family", "genus", "species", "subspecies"],
        allranks: ["kingdom",
            "subkingdom",
            "infrakingdom",
            "phylum",
            "subphylum",
            "class",
            "subclass",
            "infraclass",
            "division",
            "subdivision",
            "superorder",
            "order",
            "suborder",
            "infraorder",
            "section",
            "subsection",
            "superfamily",
            "epifamily",
            "family",
            "subfamily",
            "infrafamily",
            "supertribe",
            "tribe",
            "subtribe",
            "infratribe",
            "genus",
            "genus aggregate",
            "subgenus",
            "species",
            "subspecies"],
        gbifButtons: [
            { name: "children", icon: "children-icon.png", func: getChildren, toolTip: "Get children" },
            { name: "delete", icon: "delete-icon.png", func: deleteNode, toolTip: "Delete taxon and any decendents" },
            { name: "delete-children", icon: "delete-children-icon.png", func: deleteChildren, toolTip: "Delete taxon's children" },
            { name: "delete-childless-children", icon: "delete-childless-children-icon.png", func: deleteChildlessChildren, toolTip: "Delete taxon's childless children" },
            { name: "expand", icon: "contract-icon.png", func: expandContractNode, toolTip: "Expand/contract" }
        ],
        nbnButtons: [
            { name: "children", icon: "children-icon.png", func: getChildren, toolTip: "Get children" },
            { name: "delete", icon: "delete-icon.png", func: deleteNode, toolTip: "Delete taxon and any decendents" },
            { name: "delete-children", icon: "delete-children-icon.png", func: deleteChildren, toolTip: "Delete taxon's children" },
            { name: "delete-childless-children", icon: "delete-childless-children-icon.png", func: deleteChildlessChildren, toolTip: "Delete taxon's childless children" },
            //{ name: "parent", icon: "parent-icon.png", func: getParent, toolTip: "Get parent" },
            { name: "expand", icon: "contract-icon.png", func: expandContractNode, toolTip: "Expand/contract" },
            { name: "select", icon: "select-icon.png", func: selectNBNTaxon, toolTip: "Use this taxon" }
        ],
        atlasButtons: [
            { name: "children", icon: "children-icon.png", func: getChildren, toolTip: "Get children" },
            { name: "delete", icon: "delete-icon.png", func: deleteNode, toolTip: "Delete taxon and any decendents" },
            { name: "delete-children", icon: "delete-children-icon.png", func: deleteChildren, toolTip: "Delete taxon's children" },
            { name: "delete-childless-children", icon: "delete-childless-children-icon.png", func: deleteChildlessChildren, toolTip: "Delete taxon's childless children" },
            //{ name: "parent", icon: "parent-icon.png", func: getParent, toolTip: "Get parent" },
            { name: "expand", icon: "contract-icon.png", func: expandContractNode, toolTip: "Expand/contract" },
            { name: "select", icon: "select-icon.png", func: selectAtlasTaxon, toolTip: "Use this taxon" }
        ],
        nbnKingdoms: [
            {
                "name": "Plantae",
                "authority": "Haeckel, 1866",
                "rank": "Kingdom",
                "nameStatus": "Recommended",
                "versionForm": "Well-formed",
                "ptaxonVersionKey": "NHMSYS0021059028"
            },
            {
                "name": "Animalia",
                "commonName": "Animal",
                "rank": "Kingdom",
                "nameStatus": "Recommended",
                "versionForm": "Well-formed",
                "ptaxonVersionKey": "NBNSYS0100001342"
            },
            {
                "name": "Chromista",
                "rank": "Kingdom",
                "nameStatus": "Recommended",
                "versionForm": "Well-formed",
                "ptaxonVersionKey": "NHMSYS0020787081"
            },
            {
                "name": "Ascomycota",
                "authority": "Caval.-Sm.",
                "rank": "Phylum",
                "nameStatus": "Recommended",
                "versionForm": "Well-formed",
                "ptaxonVersionKey": "NHMSYS0020535046"
            },
            {
                "name": "Basidiomycota",
                "authority": "R.T. Moore",
                "rank": "Phylum",
                "nameStatus": "Recommended",
                "versionForm": "Well-formed",
                "ptaxonVersionKey": "NHMSYS0020535073"
            },
            {
                "name": "Fungi",
                "commonName": "Fungi",
                "rank": "Kingdom",
                "nameStatus": "Recommended",
                "versionForm": "Well-formed",
                "ptaxonVersionKey": "NBNSYS0000172214"
            }
            //Bacteria
            //Protozoa
        ]
    }
    tombio.height = jQuery(window).height();
    //tombio.tree.size([tombio.height, tombio.width]);
    tombio.tree.nodeSize([30, 30]);
})();

jQuery(document).ready(function () {
    jQuery.get(taxv1path + "taxv1-import.html?ver=" + tombiover, function (data) {
        jQuery("#tombiod3").html(data.replace(/##taxv1path##/g, taxv1path));

        jQueryStyling();

        d3Setup();

        //Initialise
        sourceChanged();
    });
});

function d3Setup() {

    tombio.zoom = d3.behavior.zoom();
    tombio.svg = d3.select("#mainsvg")
        .attr("width", 3000)
        .attr("height", 2000)
        .call(tombio.zoom.on("zoom", function () {
            tombio.svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
        }))
        .on("click", function () {
            hideNodeButtons(tombio.lastNode);
        })
        .append("g")
        .attr("transform", "translate(" + tombio.margin.left + "," + tombio.margin.top + ")");
}

function jQueryStyling() {

    //jQuery("#header").fadeTo(3000, 0.2)
    //jQuery("#navigation").fadeTo(3000, 0.2)
    //jQuery("#comments").fadeTo(3000, 0.2)
    //jQuery("#footer").fadeTo(3000, 0.2)
    //jQuery("#main .tabs").fadeTo(3000, 0.2)
    //jQuery(".submitted").fadeTo(3000, 0.2)
    //jQuery("#tombioMain").fadeIn(1000);

    tombio.pop = jQuery('#pop');

    jQuery("#tombioMain").height(jQuery(window).height());
    jQuery(window).resize(function () {
        jQuery("#tombioMain").height(jQuery(window).height());
        tombio.height = jQuery(window).height();
    });

    jQuery("#closeVis")
        .click(function (event) {
            tombio.controlsOut = false;
            jQuery("#taxControlUpDown").attr("src", taxv1path + "resources/down.png");
            jQuery("#tombioMain").fadeOut(1000);
        });

    function showVis(fadeTime) {

        if (fadeTime) {
            jQuery("#tombioMain").fadeIn(1000);
        } else {
            jQuery("#tombioMain").show();
        }
        //Initialise position of taxControls and attach handler for hide/show
        tombio.controlsOffset = jQuery("#taxControls").height() - 62;

        jQuery("#taxControls").animate({
            top: "-" + tombio.controlsOffset + "px"
        }, 0);
    }

    jQuery("#showVis")
      .button()
      .text("Show visualisation")
      .click(function () {
          showVis(1000)
      });

    jQuery("#tombioInfoDialog").dialog({
        title: "General information",
        modal: true,
        width: tombio.infowidth,
        height: tombio.infoheight,
        resizable: false,
        draggable: true,
        autoOpen: false,
        open: function () {
            jQuery("#tombioInfoAccordion")
                .accordion({
                    heightStyle: 'fill'
                });
        },
        show: {
            effect: "slideDown",
            duration: 500
        },
        hide: {
            effect: "slideUp",
            duration: 500
        }
    });

    jQuery("#taxInfo")
      .button()
      .text("Information")
      .click(function (event) {
          jQuery("#tombioInfoDialog").dialog("open");
      });
    

    jQuery("#jsonview").dialog({
        title: "Last JSON query and response",
        autoOpen: false,
        modal: false,
        width: 650,
        height: 500,
        show: {
            effect: "slideDown",
            duration: 500
        },
        hide: {
            effect: "slideUp",
            duration: 500
        }
    });

    jQuery("#taxSearch").addClass("ui-widget ui-widget-content ui-corner-all");

    jQuery("#taxButton")
      .button()
      .text("Search")
      .click(function (event) {
          taxSearch();
      });

    jQuery("#jsonShow")
      .button()
      .text("Show last JSON query")
      .click(function (event) {
          jQuery("#jsonview").dialog("open");
      });

    jQuery("#taxClear")
      .button()
      .text("Clear")
      .click(function () {
          sourceChanged();
      });

    jQuery("#taxCentre")
      .button()
      .text("Re-centre")
      .click(function () {
          centre(tombio.duration);
      });

    jQuery("#taxSource").selectmenu({
        change: function () {
            sourceChanged();
        }
    });
    tombio.source = jQuery("#taxSource").val();

    jQuery("#nameFormat").selectmenu({
        change: function () {
            nameFormatChanged();
        }
    });
    tombio.nameFormat = jQuery("#nameFormat").val();

    jQuery('#authority').click(function () {
        nameFormatChanged();
    });

    jQuery("#nbnSourceFilter").selectmenu();
    jQuery("#nbnFormedFilter").selectmenu();

    jQuery("#depthSlider").slider({
        orientation: "horizontal",
        range: "min",
        min: 0.2,
        max: 2.5,
        value: 0.8,
        step: 0.05,
        stop: function (event, ui) {
            tombio.depthFactor = ui.value;
            update(tombio.matchingTaxa);
        }
    });

    var spinner = $("#gbifPaging").spinner({
        step: 10,
        numberFormat: "n",
        min: 10,
        max: 500
    }).width(30);

    jQuery("#taxControlUpDown").click(function () {

        var op, img;
        if (tombio.controlsOut) {
            op = "-=";
            img = "down.png";
        } else {
            op = "+=";
            img = "up.png";
        }
        jQuery("#taxControlUpDown").attr("src", taxv1path + "resources/" + img);
        jQuery("#taxControls").animate({
            top: op + tombio.controlsOffset + "px"
        }, tombio.duration);

        tombio.controlsOut = !tombio.controlsOut; 
    });

    if (!showFrontPage) {
        jQuery("#closeVis").hide();
        showVis();
    }
}

function nameFormatChanged() {
    tombio.authority = jQuery("#authority").is(':checked');
    tombio.nameFormat = jQuery("#nameFormat").val();

    //console.log("Authority: " + tombio.authority);
    update(tombio.matchingTaxa);
}

function sourceChanged() {

    tombio.source = jQuery("#taxSource").val();
    tombio.matchingTaxa = null;
    clearSVG();
    tombio.matchingTaxa = { name: tombio.source.toUpperCase(), parent: null, children: [], x0: tombio.height / 2, y0: 0, type: "root" + tombio.source.toUpperCase(), authority: "", commonName: "" };
    update(tombio.matchingTaxa);
    centre(0);
}

function taxSearch() {
    //http://www.catalogueoflife.org/col/webservice?name=Apus //returns XML (no CORS)
    //http://jsonplaceholder.typicode.com/posts/1

    //http://api.gbif.org/v1/species/match?name=atypus&verbose=true&strict=true
    //http://api.gbif.org/v1/species/search?q=atypus
    //http://api.gbif.org/v1/species/match?name=atypus
    //http://api.gbif.org/v1/species/2167233/children
    //http://api.gbif.org/v1/species/5171650/parents

    if (tombio.source == "nbn") {
        
        if (jQuery("#taxSearch").val() == "x") {
            //For testing when NBN web service is down!
            tombio.url = taxv1path + "json examples/NNB Search result.json";
            jQuery.ajax({
                url: tombio.url,
                type: 'get',
                async: true,
                success: function (jsonobject) {
                    tombio.jsonobject = jsonobject;
                    processNBNSearch(tombio.jsonobject);
                    //JSON display
                    showJSON();
                }
            });        
        } else {
            //NBN web service is not CORS enabled so have to go via a tombio server
            //call which is.
            jQuery.growl.notice({ title: "", message: "Searching the NBN taxonomy for '" + jQuery("#taxSearch").val()  + "'" });

            tombio.url = 'https://data.nbn.org.uk/api/taxa?rows=100&q=';
            tombio.url += jQuery("#taxSearch").val();
            tombio.url = encodeURIComponent(tombio.url);
            tombio.url = 'http://www.tombio.uk/tombio-rest-call?' + tombio.url;

            jQuery.get(tombio.url, function (data) {
                //console.log("data is...: " + data);
                //Removes the BOM passed from tombio PHP server call which causes jQuery and D3 JSON
                //parsing to fail.
                var jsonstring = data.replace(/[\u200B-\u200D\uFEFF]/g, '');
                tombio.jsonobject = (jQuery.parseJSON(jsonstring));
                processNBNSearch(tombio.jsonobject);
                //JSON display
                showJSON();
            });
        }

    } else if (tombio.source == "gbif") {
        jQuery.growl.notice({ title: "", message: "Searching the GBIF backbone taxonomy for '" + jQuery("#taxSearch").val() + '"' });

        tombio.url = 'http://api.gbif.org/v1/species/match?name=' + jQuery("#taxSearch").val();
        tombio.url += "&verbose=true&strict=true";

        d3.json(tombio.url, function (error, jsonobject) {
            if (error) return console.warn(error);

            tombio.jsonobject = jsonobject;
            processGBIFSearch(tombio.jsonobject);
            //JSON display
            showJSON();
        });
    } else if (tombio.source == "atlas") {
        jQuery.growl.notice({ title: "", message: "Searching the NBN Atlas taxonomy for '" + jQuery("#taxSearch").val() + '"' });

        tombio.url = 'https://species-ws.nbnatlas.org/search?q=' + jQuery("#taxSearch").val();
        tombio.url += "&pageSize=100";
            tombio.url += "&fq=taxonomicStatus:accepted";

        d3.json(tombio.url, function (error, jsonobject) {
            if (error) return console.warn(error);

            tombio.jsonobject = jsonobject;

            //JSON display
            showJSON();

            processAtlasSearch(tombio.jsonobject);
        });

    }
}

function processAtlasSearch(jsonobject) {

    var searchResults = jsonobject.searchResults.results;

    if (searchResults.length == 0) {
        jQuery.growl.warning({ title: "", message: "No taxa in the NBN Atlas taxonomy matched your search term" });
    }

    if (!tombio.matchingTaxa.children) tombio.matchingTaxa.children = [];

    //Find searchNode if it exists
    var searchNode;
    for (var i = 0; i < tombio.matchingTaxa.children.length; i++) {
        if (tombio.matchingTaxa.children[i].name == "search") {
            searchNode = tombio.matchingTaxa.children[i];
            break;
        }
    }
    //Create searchNode if it doesn't exist
    if (!searchNode) {
        searchNode = { name: "search", parent: "atlas", children: [], type: "atlasSearch"};
        tombio.matchingTaxa.children.push(searchNode);
        var exactNode = { name: "exact matches", parent: "search", children: [], type: "atlasSearch" };
        var fuzzyNode = { name: "fuzzy matches", parent: "search", children: [], type: "atlasSearch" };
        searchNode.children = [exactNode, fuzzyNode];
    } else {
        //Empty the exact and fuzzy nodes
        expandNode(searchNode);
        var exactNode = searchNode.children[0];
        exactNode.children = [];
        exactNode._children = null;
        var fuzzyNode = searchNode.children[1];
        fuzzyNode.children = [];
        fuzzyNode._children = null;
    }
    
    for (var i = 0; i < searchResults.length; i++) {

        var taxon = searchResults[i];

        var isExact = jQuery("#taxSearch").val().toLowerCase() == taxon.name.toLowerCase() ||
                        jQuery("#taxSearch").val().toLowerCase() == taxon.commonNameSingle.toLowerCase()
        if (isExact) {
            console.log(taxon.name, taxon.class, taxon.commonNameSingle)
            var searchSubnode = exactNode;
        } else {
            var searchSubnode = fuzzyNode;
        }

        var matchClass = null;
        if (!taxon.class) {
            matchClass = searchSubnode;
        } else {
            for (j = 0; j < searchSubnode.children.length; j++) {
                var searchClass = searchSubnode.children[j];
                if (searchClass.name == taxon.class) {
                    matchClass = searchClass;
                    if (!matchClass.children) {
                        if (matchClass._children) {
                            matchClass.children = matchClass._children;
                            matchClass._children = null;
                        } else {
                            matchClass.children = [];
                        }
                    }
                    break;
                }
            }
        }

        if (!matchClass) {
            matchClass = {
                name: taxon.class,
                parent: searchSubnode.name,
                children: [],
                //offset: 0,
                type: "atlasSearchClass"
            }
            searchSubnode.children.push(matchClass);
        }

        var matchTaxon = null;
        for (j = 0; j < matchClass.children.length; j++) {
            var searchTaxon = matchClass.children[j];
            
            if (searchTaxon.name == taxon.name) {
                //The taxon is already represented
                matchTaxon = searchTaxon;
                break;
            }
        }

        if (!matchTaxon) {
            matchTaxon = {
                name: taxon.commonNameSingle.length > 0 ? taxon.name + " (" + taxon.commonNameSingle + ")" : taxon.name,
                parent: matchClass.name,
                offset: 0,
                type: "atlasSearchMatch",
                taxonObj: taxon
            }
            matchClass.children.push(matchTaxon);
        }
    }

    tombio.matchingTaxa.x0 = tombio.height / 2;
    tombio.matchingTaxa.y0 = 0;

    contractNode(fuzzyNode);

    update(tombio.matchingTaxa);
}

function processNBNSearch(jsonobject) {

    if (jsonobject.results.length == 0) {
        jQuery.growl.warning({ title: "", message: "No taxa in the NBN species database matched your search term" });
    }

    if (!tombio.matchingTaxa.children) tombio.matchingTaxa.children = [];

    var searchNode;
    for (var i = 0; i < tombio.matchingTaxa.children.length; i++) {
        if (tombio.matchingTaxa.children[i].name == "search") {
            searchNode = tombio.matchingTaxa.children[i];
            break;
        }
    }
    if (!searchNode) {
        searchNode = { name: "search", parent: "nbn", children: [], type: "nbnSearch", authority: "", commonName: "" };
        tombio.matchingTaxa.children.push(searchNode);
    }

    if (!searchNode.children) {
        if (searchNode._children) {
            searchNode.children = searchNode._children;
            searchNode._children = null;
        } else {
            searchNode.children = [];
        }
    }
    
    for (var i = 0; i < jsonobject.results.length; i++) {

        var taxon = jsonobject.results[i];
        //console.log("taxon: " + taxon.name + " (" + taxon.ptaxonVersionKey + ")");

        var matchingTaxonGroup = null;
        for (var j = 0; j < searchNode.children.length; j++) {
            if (searchNode.children[j].name == taxon.taxonOutputGroupName) {
                matchingTaxonGroup = searchNode.children[j];
                break;
            }
        }
        if (!matchingTaxonGroup) {
            matchingTaxonGroup = {
                name: taxon.taxonOutputGroupName,
                parent: "search",
                children: [],
                type: "nbnSearchGroup",
                authority: "",
                commonName: ""
            };
            searchNode.children.push(matchingTaxonGroup);
        }
        if (!matchingTaxonGroup.children) {
            if (matchingTaxonGroup._children) {
                matchingTaxonGroup.children = matchingTaxonGroup._children;
                matchingTaxonGroup._children = null;
            } else {
                matchingTaxonGroup.children = [];
            }
        }

        //Check that not already included
        var nameFound = false;
        for (var j = 0; j < matchingTaxonGroup.children.length; j++) {
            if (matchingTaxonGroup.children[j].name == taxon.name) {
                nameFound = true;
                break;
            }
        }
        if (!nameFound) {
            matchingTaxonGroup.children.push({ 
                name: taxon.name,
                parent: taxon.taxonOutputGroupName,
                children: [],
                taxonKey: taxon.ptaxonVersionKey,
                type: "nbnSearchMatch",
                authority: "",
                commonName: ""
            });
        }
    }

    tombio.matchingTaxa.x0 = tombio.height / 2;
    tombio.matchingTaxa.y0 = 0;
    update(tombio.matchingTaxa);
}

function processNBNChildren(jsonobject, d) {

    //Make array of names of current children
    var currentChildren = [];
    if (d.children) {
        for (var i = 0; i < d.children.length; i++) {
            currentChildren.push(d.children[i].name);
        }
    } else {
        d.children = [];
    }

    //Inform if no children
    if (jsonobject.length == 0) {
        jQuery.growl.warning({ title: "", message: d.name + " has no children in the NBN taxonomy" });
    }

    //Process the results
    for (var i = 0; i < jsonobject.length; i++) {

        var taxon = jsonobject[i];

        //Skip if taxon doesn't match filters.
        var bSkip = false;
        if (jQuery("#nbnSourceFilter").val() == "recommended" && taxon.nameStatus != "Recommended") bSkip = true;
        if (jQuery("#nbnFormedFilter").val() == "well-formed" && taxon.versionForm != "Well-formed") bSkip = true;
        if (bSkip) console.log("Skipping " + taxon.name);

        //Check that child isn't already represented
        if (jQuery.inArray(taxon.name, currentChildren) == -1 && !bSkip) {

            var newTaxon = {
                name: taxon.name,
                parent: d.name,
                children: [],
                taxonKey: taxon.ptaxonVersionKey,
                rank: taxon.rank.toLowerCase(),
                offset: 0,
                type: "",
                authority: taxon.authority ? taxon.authority : "",
                commonName: taxon.commonName ? taxon.commonName : ""
            };
            if (!d.children) d.children = []
            d.children.push(newTaxon);
        }
    }

    d.children.sort(function (a, b) {

        var iRankA = tombio.allranks.indexOf(a.rank);
        var iRankB = tombio.allranks.indexOf(b.rank);

        if (iRankA == -1) iRankA = 1000;
        if (iRankB == -1) iRankB = 1000;

        if (iRankA != iRankB) {
            //First sort by position of rank in list
            return iRankA - iRankB;
        } else if (a.rank < b.rank) {
            //Next sort alphabetically by rank name
            return -1;
        } else if (b.rank < a.rank) {
            return 1;
        } else if (a.name < b.name) {
            //Next sort alphabetically by name
            return -1;
        } else {
            return 1;
        }  
    })

    tombio.matchingTaxa.x0 = tombio.height / 2;
    tombio.matchingTaxa.y0 = 0;

    if (tombio.matchingTaxa.children.length > 0) {
        update(d);
    }
}

function processGBIFSearch(jsonobject) {

    var searchResults = [];

    //Pre-process the search results
    if (jsonobject.matchType == "EXACT") {
        //Delete the alternatives collection
        delete jsonobject.alternatives;
        //Make an array of one object from response
        searchResults.push(jsonobject);
    } else if (jsonobject.alternatives) {
        for (var i = 0; i < jsonobject.alternatives.length; i++) {
            if (jsonobject.alternatives[i].matchType == "EXACT") {
                searchResults.push(jsonobject.alternatives[i]);
            }
        }
    }

    //Notify if nothing found
    if (searchResults.length == 0) {
        jQuery.growl.warning({title: "", message: "No taxa in the GBIF backbone taxonomy matched your search term" });
        //jQuery.growl.error({ message: "The kitten is attacking!" });
        //jQuery.growl.notice({ message: "Nothing matched search term" });
        //jQuery.growl.warning({ message: "The kitten is ugly!" });
    }

    //Process the results
    for (var i = 0; i < searchResults.length; i++) {

        var taxon = searchResults[i];
        var taxonRank = taxon.rank.toLowerCase();
        var ignoreRank = true;

        lastMatched = tombio.matchingTaxa;

        for (k = 0; k < tombio.gbifranks.length; k++) {
            var rank = tombio.gbifranks[k];

            console.log("Checking rank " + rank);

            if (taxon[rank]) {
                var matched = false;
                if (!lastMatched.children) {
                    if (lastMatched._children) {
                        lastMatched.children = lastMatched._children;
                        lastMatched._children = null;
                    } else {
                        lastMatched.children = [];
                    } 
                }
                for (var j = 0; j < lastMatched.children.length; j++) {
                    if (lastMatched.children[j].name == taxon[rank]) {
                        matched = true;
                        break;
                    }
                }

                if (matched) {
                    lastMatched = lastMatched.children[j];
                } else {
                    var newTaxon = {
                        name: taxon[rank],
                        parent: lastMatched.name,
                        children: [],
                        taxonKey: taxon[rank + "Key"],
                        rank: rank,
                        offset: 0,
                        type: "",
                        authority: "", //taxon.authorship ? taxon.authorship : "",
                        commonName: "" //taxon.vernacularName ? taxon.vernacularName : ""
                    };
                    lastMatched.children.push(newTaxon);
                    lastMatched = newTaxon;
                }

                if (rank == taxonRank) {
                    break;
                }
            }
        }
    }

    tombio.matchingTaxa.x0 = tombio.height / 2;
    tombio.matchingTaxa.y0 = 0;


    if (tombio.matchingTaxa.children && tombio.matchingTaxa.children.length > 0) {
        update(tombio.matchingTaxa);
    }

    //console.log(tombio.jsonobject);
}

function processAtlasChildren(jsonobject, d) {

    //console.log("d", d)
    //console.log("jsonobject", jsonobject)
    //console.log("results", jsonobject.searchResults.results)

    //Make array of names of current children
    var currentChildren = [];
    if (d.children) {
        for (var i = 0; i < d.children.length; i++) {
            currentChildren.push(d.children[i].name);
        }
    } else {
        d.children = [];
    }

    //Inform if no children
    if (jsonobject.searchResults.results.length == 0) {
        jQuery.growl.warning({ title: "", message: d.name + " has no children in the NBN Atlas taxonomy" });
    }
    //Process the results
    for (var i = 0; i < jsonobject.searchResults.results.length; i++) {

        var taxon = jsonobject.searchResults.results[i];

        //The atlas web services do not have a way to fetch immediate children of a taxon regardless of rank. You 
        //must specify a rank. So we haved specified a rank (from atlasranks) that is guaranteed to fetch results 
        //now we work backwards from there to get the immediate child.
        var taxonDecendent = null;
        var taxonGuid = null;
        var nextrank = d.rank;
        do {
            nextrank = tombio.allranks[tombio.allranks.indexOf(nextrank) + 1];
            if (nextrank == taxon.rank) {
                taxonDecendent = taxon.name;
                taxonGuid = taxon.guid;
            } else {
                taxonDecendent = taxon[nextrank];
                taxonGuid = taxon[nextrank + "Guid"];
            }
        }
        while (!taxonDecendent);

        //Check that child isn't already represented
        if (jQuery.inArray(taxonDecendent, currentChildren) == -1) {

            var newTaxon = {
                name: taxonDecendent,
                parent: d.name,
                children: [],
                taxonKey: taxonGuid,
                rank: nextrank.toLowerCase(),
                offset: 0,
                type: "",
                authority: (taxonDecendent == taxon.name) && taxon.author ? taxon.author : "",
                commonName: (taxonDecendent == taxon.name) && taxon.commonNameSingle ? taxon.commonNameSingle : ""
            };
            if (!d.children) d.children = []
            d.children.push(newTaxon);
            currentChildren.push(taxonDecendent);
        }
    }

    d.children.sort(function (a, b) {

        var iRankA = tombio.allranks.indexOf(a.rank);
        var iRankB = tombio.allranks.indexOf(b.rank);

        if (iRankA == -1) iRankA = 1000;
        if (iRankB == -1) iRankB = 1000;

        if (iRankA != iRankB) {
            //First sort by position of rank in list
            return iRankA - iRankB;
        } else if (a.rank < b.rank) {
            //Next sort alphabetically by rank name
            return -1;
        } else if (b.rank < a.rank) {
            return 1;
        } else if (a.name < b.name) {
            //Next sort alphabetically by name
            return -1;
        } else {
            return 1;
        }
    })

    tombio.matchingTaxa.x0 = tombio.height / 2;
    tombio.matchingTaxa.y0 = 0;

    if (tombio.matchingTaxa.children.length > 0) {
        update(d);
    }
}

function processGBIFChildren(jsonobject, d) {
    
    //If the current array of children has
    //an ellipsis on the end, remove it.
    if (d.children && d.children.length > 0 && d.children[d.children.length - 1].name == "...") {
        d.children.pop();
    }

    //Make array of names of current children
    var currentChildren = [];
    if (d.children) {
        for (var i = 0; i < d.children.length; i++) {
            currentChildren.push(d.children[i].name);
        }
    }

    //Inform if no children
    if (jsonobject.results.length == 0 && jsonobject.offset == 0) {
        jQuery.growl.warning({ title: "", message: d.name + " has no children in the GBIF backbone taxonomy" });
    }

    //Process the results
    for (var i = 0; i < jsonobject.results.length; i++) {

        var taxon = jsonobject.results[i];
        if (!taxon.canonicalName) {
            taxon.canonicalName = 'incertae sedis'; //There is a Kingdom with no canonical name
        }
        //Check that child isn't already represented
        if (jQuery.inArray(taxon.canonicalName, currentChildren) == -1) {

            var newTaxon = {
                name: taxon.canonicalName,
                parent: d.name,
                children: [],
                taxonKey: taxon.nubKey,
                rank: taxon.rank.toLowerCase(),
                offset: 0,
                type: "",
                authority: taxon.authorship ? taxon.authorship : "",
                commonName: taxon.vernacularName ? taxon.vernacularName : ""
            };
                if (!d.children) d.children = [];
                d.children.push(newTaxon);
        }
    }
    if (!jsonobject.endOfRecords) {
        //console.log("Old offset: " + d.offset);
        d.offset = jsonobject.offset + jsonobject.limit;
        //console.log("New offset: " + d.offset);
        var ellipsis = { name: "...", parent: d.name, authority: "", commonName: ""};
        d.children.push(ellipsis);
    } else {
        //Marks that end of records has been reached
        //Indicate with the offset attribute - but only if there are some children

        if (d.children && d.children.length > 0) {
            d.offset = -1;
        }
    }

    tombio.matchingTaxa.x0 = tombio.height / 2;
    tombio.matchingTaxa.y0 = 0;

    if (tombio.matchingTaxa.children.length > 0) {
        update(d);
    }
}

function selectNBNTaxon(d) {
    //https://data.nbn.org.uk/api/taxa/NBNSYS0000160328/taxonomy
    //https://data.nbn.org.uk/api/taxa/NBNSYS0000160328

    makePop();

    //Contract search node
    var searchNode;
    for (var i = 0; i < tombio.matchingTaxa.children.length; i++) {
        if (tombio.matchingTaxa.children[i].name == "search") {
            searchNode = tombio.matchingTaxa.children[i];
            break;
        }
    }
    searchNode._children = searchNode.children;
    searchNode.children = null;
    update(tombio.matchingTaxa);

    //Old way of backtracking (before I realised there was a taxonomy call)
    //tombio.nbnLineage = null;
    //backtrackNBNTaxon(d.taxonKey);

    //Get the ancestors of selected search item
    tombio.url = 'http://www.tombio.uk/tombio-rest-call?https://data.nbn.org.uk/api/taxa/';
    tombio.url += d.taxonKey;
    tombio.url += '/taxonomy';

    jQuery.growl.notice({ title: "", message: "Retrieving ancestors of " + d.name + " from the NBN taxonomy"});

    jQuery.get(tombio.url, function (data) {

        if (data != "") {

            //Removes the BOM passed from tombio PHP server call 
            //which causes jQuery and D3 JSON parsing to fail.
            var jsonstring = data.replace(/[\u200B-\u200D\uFEFF]/g, '');

            tombio.jsonobject = (jQuery.parseJSON(jsonstring));
            //JSON display
            showJSON();
            
            var ancestors = tombio.jsonobject;

            //console.log(ancestors);

            //Sadly the result of the called to 'taxonomy' which retrieves the ancestors,
            //does not return the taxon itself, so we have to add this in with a second call.
            tombio.url = 'http://www.tombio.uk/tombio-rest-call?https://data.nbn.org.uk/api/taxa/';
            tombio.url += d.taxonKey;

            jQuery.get(tombio.url, function (data) {

                if (data != "") {
                    //Removes the BOM passed from tombio PHP server call 
                    //which causes jQuery and D3 JSON parsing to fail.
                    var jsonstring = data.replace(/[\u200B-\u200D\uFEFF]/g, '');

                    var selectedTaxon = (jQuery.parseJSON(jsonstring));
                    //JSON display
                    //showJSON();

                    ancestors.push(selectedTaxon);

                    lastMatched = tombio.matchingTaxa;
                    ancestors.forEach(function (ancestor) {

                        //console.log(ancestor.name);

                        var ancestorTaxon = {
                            name: ancestor.name,
                            children: [],
                            taxonKey: ancestor.ptaxonVersionKey,
                            type: "",
                            rank: ancestor.rank.toLowerCase(),
                            authority: ancestor.authority ? ancestor.authority : "",
                            commonName: ancestor.commonName ? ancestor.commonName : ""
                        }

                        if (!lastMatched.children) {
                            if (lastMatched._children) {
                                lastMatched.children = lastMatched._children;
                                lastMatched._children = null;
                            } else {
                                lastMatched.children = [];
                            }
                        }
                        bMatched = false;
                        for (var i = 0; i < lastMatched.children.length; i++) {
                            if (lastMatched.children[i].name != "search") {
                                if (lastMatched.children[i].name == ancestorTaxon.name && lastMatched.children[i].rank == ancestorTaxon.rank) {
                                    lastMatched = lastMatched.children[i];
                                    bMatched = true;
                                    break;
                                }
                            }
                        }
                        if (!bMatched) {
                            //console.log("Adding " + ancestorTaxon.name + " to " + lastMatched.name);
                            lastMatched.children.push(ancestorTaxon);
                            lastMatched = ancestorTaxon;
                        }
                    });
                    update(tombio.matchingTaxa);
                }
            });            
        }
    });
    
}

function selectAtlasTaxon(d) {
    makePop();

    jQuery.growl.notice({ title: "", message: "Displaying ancestors of " + d.name + " from the NBN Atlas taxonomy" });

    //Contract search node
    var searchNode;
    for (var i = 0; i < tombio.matchingTaxa.children.length; i++) {
        if (tombio.matchingTaxa.children[i].name == "search") {
            searchNode = tombio.matchingTaxa.children[i];
            break;
        }
    }
    searchNode._children = searchNode.children;
    searchNode.children = null;
    update(tombio.matchingTaxa);

    var lastMatched = tombio.matchingTaxa;
    var taxon = d.taxonObj;

    //Enrich the taxon object to include property corresponding to it's rank (simplifies rest of code)
    taxon[taxon.rank] = taxon.name;

    for (k = 0; k < tombio.allranks.length; k++) {

        var rank = tombio.allranks[k];

        //Ignore this rank if it is not in our taxon.
        if (!taxon[rank]) continue;

        expandNode(lastMatched);

        var matched = false;
        for (var j = 0; j < lastMatched.children.length; j++) {
            if (lastMatched.children[j].name == taxon.name) {
                lastMatched.children[j].taxonKey = taxon.guid; //Ensure that higher taxa have full guid where available
                matched = true;
                break;
            } else if (lastMatched.children[j].name == taxon[rank]) {
                matched = true;
                break;
            }
        }

        if (matched) {
            lastMatched = lastMatched.children[j];
        } else {
            var newTaxon = {
                name: taxon[rank],
                parent: lastMatched.name,
                children: [],
                taxonKey:  rank == taxon.rank ? taxon.guid : taxon[rank + "Guid"],
                rank: rank,
                offset: 0,
                type: "",
                authority: rank == taxon.rank ? (taxon.author ? taxon.author : "") : "",
                commonName: rank == taxon.rank ? (taxon.commonNameSingle ? taxon.commonNameSingle : "") : ""
            };

            lastMatched.children.push(newTaxon);
            lastMatched = newTaxon;
        }

        if (rank == taxon.rank) {
            break;
        }
    }
    update(tombio.matchingTaxa);
}

function backtrackNBNTaxon(urlExtension) {

    tombio.url = 'http://www.tombio.uk/tombio-rest-call?https://data.nbn.org.uk/api/taxa/';
    tombio.url += urlExtension;

    jQuery.get(tombio.url, function (data) {

        //If there's no parent, data will be set to an empty string
        if (data != "") {
            //Removes the BOM passed from tombio PHP server call 
            //which causes jQuery and D3 JSON parsing to fail.
            var jsonstring = data.replace(/[\u200B-\u200D\uFEFF]/g, '');

            tombio.jsonobject = (jQuery.parseJSON(jsonstring));

            //JSON display
            showJSON();

            var newTaxon = {
                name: tombio.jsonobject.name,
                children: [],
                taxonKey: tombio.jsonobject.ptaxonVersionKey,
                type: "",
                rank: tombio.jsonobject.rank.toLowerCase(),
                authority: tombio.jsonobject.authority ? tombio.jsonobject.authority : "",
                commonName: tombio.jsonobject.commonName ? tombio.jsonobject.commonName : ""
            }

            if (!tombio.nbnLineage) {
                tombio.nbnLineage = newTaxon;
            } else {
                tombio.nbnLineage.parent = tombio.jsonobject.name;
                newTaxon.children.push(tombio.nbnLineage);
                tombio.nbnLineage = newTaxon;
            }
        }
        
        if (data == "" || tombio.jsonobject.rank == "Kingdom") {

            //At this point full lineage of selected taxon is known. Now we traverse
            //down the existing hierarchy and only add each taxon in the lineage if it
            //doesn't already exists.
            lastMatched = tombio.matchingTaxa;
            while (tombio.nbnLineage) {

                if (!lastMatched.children) {
                    if (lastMatched._children) {
                        lastMatched.children = lastMatched._children;
                        lastMatched._children = null;
                    } else {
                        lastMatched.children = [];
                    }
                }

                bMatched = false;
                for (var i = 0; i < lastMatched.children.length; i++) {
                    if (lastMatched.children[i].name != "search") {
                        if (lastMatched.children[i].name == tombio.nbnLineage.name && lastMatched.children[i].rank == tombio.nbnLineage.rank) {
                            lastMatched = lastMatched.children[i];
                            tombio.nbnLineage = tombio.nbnLineage.children[0];
                            bMatched = true;
                            break;
                        }
                    }
                }

                if (!bMatched) {
                    lastMatched.children.push(tombio.nbnLineage);
                    tombio.nbnLineage = null;
                }
            }
            update(tombio.matchingTaxa);
        } else {
            jQuery.growl.notice({ title: "", message: "Retrieving parent of " + newTaxon.name });
            backtrackNBNTaxon(tombio.jsonobject.ptaxonVersionKey + "/parent");
        }
    });
}

function clearSVG() {
    tombio.svg.selectAll("*")
        .transition()
        .duration(tombio.duration)
        .style("opacity", 0)
        .remove();
}

function rankFont(rank) {

    var iGenus = tombio.allranks.indexOf("genus");
    var iRank = tombio.allranks.indexOf(rank);

    if (iRank >= iGenus) {
        return "italic";
    } else {
        return "normal";
    }
}

function update(source) {

    //Because our tree goes left to right - not right to left, we swap x and y coordinates
    //for nodes.

    //Set up ordinal colour scales
    var colourRanks = tombio.gbifranks.slice();
    colourRanks.reverse();
    colourRanks.push("subspecies");
    var rankscale = d3.scale.category10()
        .domain(colourRanks);

    //Compute the new tree layout
    //var nodes = tombio.tree.nodes(tombio.matchingTaxa).reverse(),
    var nodes = tombio.tree.nodes(tombio.matchingTaxa),
        links = tombio.tree.links(nodes);

    //Calculate depth factor based on name format options and user specified
    //depth.
    var depthFactor = tombio.depthFactor;
    if (tombio.nameFormat == "both") {
        if (tombio.authority) {
            depthFactor = depthFactor * 2;
        } else {
            depthFactor = depthFactor * 1.7;
        }
    } else {
        if (tombio.authority) {
            depthFactor = depthFactor * 1.3;
        }
    }

    nodes.forEach(function (d) {
        // Normalize for fixed-depth.
        d.y = d.depth * tombio.depthpx * depthFactor;

        //The following transformation in the y axis (x coordinate because we are
        //chaging from top->bottom to left->right) where we use
        //tombio.tree.nodeSize([30, 30]);
        //instead of
        //tombio.tree.size([height, width]);
        d.x = d.x + tombio.height / 2;
    });

    // Update the nodes
    var node = tombio.svg.selectAll("g.node")
        .data(nodes, function (d) {
            //If id already set, return that, else return new integer ID
            return d.id || (d.id = ++tombio.i);
        });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function (d) {
            return "translate(" + source.y0 + "," + source.x0 + ")";
        })
        .on("click", function (d) {
            d3.event.stopPropagation();
            nodeClick(d);
        })
        .on("mouseover", function (d) {
            toolTip(taxonTip(d));
        })
        .on("mousemove", function (d) {
            toolTip(taxonTip(d));
        })
        .on("mouseout", function (d) {
            toolTip("");
        });

    nodeEnter.append("circle")
        .attr("r", 1e-6)
        //.attr("class", function (d) { return d.rank; })
        .style("fill-opacity", 0.7)
        .style("fill", function (d) {
            if (d.name == "...") {
                return "white";
            } else if (d.type.match("^(nbn|atlas)")) {
                return "pink";
            } else {
                return rankscale(d.rank);
            }
        });

    nodeEnter.append("text")
        .attr("x", function (d) { return d.children ? -13 : 13; }) //d.children || d._children
        .attr("dy", ".35em")
        .attr("text-anchor", function (d) { return d.children ? "end" : "start"; })
        .style("fill-opacity", 1e-6);

    // Transition nodes to their new position.

    //(text-anchor cannot be transitions, so do text position first without a transition
    // - required to move text to opposite side of circle when children are retrieved).
    var nameText = node.select("text")
        .attr("text-anchor", function (d) { return d.children ? "end" : "start"; })
        .attr("x", function (d) {
            if (d.name == "...") {
                return -5;
            } else {
                return d.children ? -13 : 13;
            }
        })
        .attr("y", function (d) {
            if (d.name == "...") {
                return -3;
            } else {
                return 0;
            }
        })
        .style("font-weight", function (d) {
            if (d.name == "...") {
                return "bold";
            } else {
                return "normal";
            }
        })
        .text("");

    //Next seems long-winded, but necessary to show correct italicisation.
    if (tombio.nameFormat == "scientific") {
        nameText
            .append("tspan")
            .style("font-style", function (d) {
                return rankFont(d.rank);
            })
            .text(function (d) {
                return d.name;
            })
            .append("tspan")
            .style("font-style", "normal")
            .text(function (d) {
                if (tombio.authority) {
                    return d.authority ? " " + d.authority : "";
                } else {
                    return "";
                }
            });
    } else if (tombio.nameFormat == "common") {
        nameText
            .append("tspan")
            .text(function (d) {
                if (d.commonName != "") {
                    return toTitleCase(d.commonName);
                } else {
                    return "";
                }
            })
            .append("tspan")
            .style("font-style", function (d) {
                return rankFont(d.rank);
            })
            .text(function (d) {
                if (!d.commonName || d.commonName == "") {
                    return d.name;
                }
            })
            .append("tspan")
            .style("font-style", "normal")
            .text(function (d) {
                if (tombio.authority && d.commonName == "") {
                    return d.authority ? " " + d.authority : "";
                } else {
                    return "";
                }
            });
    } else if (tombio.nameFormat == "both") {
        nameText
           .append("tspan")
            .style("font-style", function (d) {
                return rankFont(d.rank);
            })
            .text(function (d) {
                return d.name;
            })
            .append("tspan")
            .style("font-style", "normal")
            .text(function (d) {
                if (tombio.authority) {
                    return d.authority ? " " + d.authority : "";
                } else {
                    return "";
                }
            })
           .append("tspan")
            .style("font-style", "normal")
            .text(function (d) {
                if (d.commonName && d.commonName != "") {
                    return " (" + toTitleCase(d.commonName) + ")";
                } else {
                    return "";
                }
            })
    }


    //The rest can transition
    var nodeUpdate = node.transition()
        .duration(tombio.duration)
        .attr("transform", function (d) { return "translate(" + d.y + "," + d.x + ")"; });

    nodeUpdate.select("circle")
        .attr("r", tombio.r)
        .style("stroke", function (d) { return d._children ? "black" : "#888"; })
        .style("stroke-width", function (d) { return d._children ? 3 : 2; });


    nodeUpdate.select("text")
        .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(tombio.duration)
        .attr("transform", function (d) { return "translate(" + source.y + "," + source.x + ")"; })
        .remove();

    nodeExit.select("circle")
        .attr("r", 1e-6);

    nodeExit.select("text")
        .style("fill-opacity", 1e-6);

    // Update the links…
    var link = tombio.svg.selectAll("path.link")
        .data(links, function (d) { return d.target.id; });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function (d) {
            var o = { x: source.x0, y: source.y0 };
            return tombio.diagonal({ source: o, target: o });
        });

    // Transition links to their new position.
    link.transition()
        .duration(tombio.duration)
        .attr("d", tombio.diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(tombio.duration)
        .attr("d", function (d) {
            var o = { x: source.x, y: source.y };
            return tombio.diagonal({ source: o, target: o });
        })
        .remove();

    // Stash the old positions for transition.
    nodes.forEach(function (d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });

    //Set up the node buttons. These must be set up last every time
    //new graphics elements are made so that they appear on top.
    if (tombio.popupNode) {
        tombio.popupNode.remove();
    }
    tombio.popupNode = tombio.svg.append("g")
        .attr("id", "popupNode");

    var nodeButtons = tombio[tombio.source + "Buttons"];

    nodeButtons.forEach(function (nodeButton) {

        nodeButton.g = tombio.popupNode.append("g").attr("opacity", 0)
            .on("mouseover", function (d) {
                toolTip(nodeButton.toolTip);
            })
            .on("mousemove", function (d) {
                toolTip(nodeButton.toolTip);
            })
            .on("mouseout", function (d) {
                toolTip("");
            });

        nodeButton.g.append("circle")
           .attr("r", tombio.r3)
           .attr("cx", 0)
           .attr("cy", 0);

        nodeButton.g.append("image")
            .attr("x", -10)
            .attr("y", -10)
            .attr("width", "20px")
            .attr("height", "20px")
            .attr("xlink:href", taxv1path + "resources/" + nodeButton.icon);
    });
    
    tombio.nodeButtonsShown = false;
}

function nodeClick(d) {

    makePop();

    if (d.name == "...") {
        //If the node is an ellipsis, just do search
        //for more children.
        getChildren(d.parent);
    } else {
        //Otherwise popup relevant buttons.
        if (tombio.nodeButtonsShown & d == tombio.lastNode) {
            hideNodeButtons(tombio.lastNode);
        } else {
            showNodeButtons(d);
            tombio.lastNode = d;
        }
    }  
}

function hideNodeButtons(d) {

    if (!d) return; //Can get here if SVG clicked before any node is selected.

    var nodeButtons = tombio[tombio.source + "Buttons"];

    //for (var i = 0; i < nodeButtons.length; ++i) {
    //The below does not work correctly with for loop - the assignment
    //of the function results in last function getting assigned to all.
    //Works with forEach for some reason.
    var i = 0;
    nodeButtons.forEach(function (nodeButton) {

        nodeButton.g
           .transition()
           .duration(tombio.duration)
           .attr("transform", "translate(" + d.y + "," + d.x + ") scale(0)")
           .attr("opacity", 0);
    });

    tombio.nodeButtonsShown = false;
}

function showNodeButtons(d)
{
    var nodeButtons = tombio[tombio.source + "Buttons"];

    //First move all buttons to origin of selected node and
    //assign click function
    nodeButtons.forEach(function (nodeButton) {
        nodeButton.g
            .attr("transform", "translate(" + d.y + "," + d.x + ") scale(0)")
            .attr("opacity", 0)
            .on("click", function () {
                nodeButton.func(d);
            });
    });

    //Tailor nodeButton sets depending on what type of
    //node is clicked.
    var useNodeButtons = [];
    nodeButtons.forEach(function (nodeButton) {

        if (nodeButton.name == "delete") {
            if (d.parent) {
                useNodeButtons.push(nodeButton);
            }
        } else if (nodeButton.name == "expand") {
            if (d.parent && (d.children || d._children)) {
                useNodeButtons.push(nodeButton);
            }
        } else if (nodeButton.name == "children") {
            if (!d._children && (!d.offset || d.offset > -1) && !d.type.match("^(nbn|atlas)")) { //d.offset set to -1 indicates end of paging
                useNodeButtons.push(nodeButton);
            }
        } else if (nodeButton.name == "delete-children") {
            if (!d._children && d.children && d.children.length > 0) {
                useNodeButtons.push(nodeButton);
            }
        } else if (nodeButton.name == "delete-childless-children") {
            if (!d._children && d.children && d.children.length > 0 && !d.type.match("^nbn") && d.type!="rootNBN") {
                useNodeButtons.push(nodeButton);
            }
        } else if (nodeButton.name == "select") {
            if (d.type == "nbnSearchMatch" || d.type == "atlasSearchMatch") {
                useNodeButtons.push(nodeButton);
            }
        } else {
            useNodeButtons.push(nodeButton);
        }
    });

    //for (var i = 0; i < nodeButtons.length; ++i) {
    //The below does not work correctly with for loop - the assignment
    //of the function results in last function getting assigned to all.
    //Works with forEach for some reason.
    var i = 0;
    useNodeButtons.forEach(function (nodeButton) {

        var deltaDeg = 360 / useNodeButtons.length;
        var deltaRad = deltaDeg * Math.PI / 180;
        var cumulativeRad = i * deltaRad;
        var x = d.x + tombio.r2 * Math.cos(cumulativeRad);
        var y = d.y + tombio.r2 * Math.sin(cumulativeRad);
        i++;

        if (nodeButton.name == "expand") {
            if (d._children) {
                nodeButton.g.select("image")
                    .attr("xlink:href", taxv1path + "resources/expand-icon.png");
            } else {
                nodeButton.g.select("image")
                    .attr("xlink:href", taxv1path + "resources/contract-icon.png");
            }
        }

        nodeButton.g
            .attr("transform", "translate(" + d.y + "," + d.x + ") scale(0)")
            .attr("opacity", 0)
            .on("click", function () {
                nodeButton.func(d);
            })
            .transition()
            .ease("bounce")
            .duration(tombio.duration)
            .attr("transform", "translate(" + y + "," + x + ") scale(1)")
            .attr("opacity", 1);
    });

    tombio.nodeButtonsShown = true;
}

function getChildren(d) {

    makePop();

    if (tombio.source == "nbn") {

        if (d.name == "NBN") {

            jQuery.growl.warning({ title: "", message: "There is no NBN web service call to retrieve top level taxa - start with a search" });

            //If we're getting the children of the root, there is no NBN rest query to do this, so we
            //use a pre-prepared object.

            //jQuery.growl.notice({ title: "", message: "No NBN web service call to do this, so using known plant, animal and fungi root taxa" });
            //tombio.jsonobject = tombio.nbnKingdoms;
            //processNBNChildren(tombio.jsonobject, d);
        } else {
            jQuery.growl.notice({ title: "", message: "Retrieving children of " + d.name + " in the NBN taxonomy" });

            //NBN web service is not CORS enabled so have to go via a tombio server
            //call which is.
            tombio.url = 'http://www.tombio.uk/tombio-rest-call?';
            tombio.url += 'https://data.nbn.org.uk/api/taxa/' + d.taxonKey + '/children';

            jQuery.get(tombio.url, function (data) {
                //Removes the BOM passed from tombio PHP server call which causes jQuery and D3 JSON
                //parsing to fail.
                var jsonstring = data.replace(/[\u200B-\u200D\uFEFF]/g, '');
                var jsonobject = (jQuery.parseJSON(jsonstring));

                processNBNChildren(jsonobject, d);

                //JSON display
                tombio.jsonobject = jsonobject;
                showJSON();
            });
        }
    } else if (tombio.source == "gbif") {

        if (d.name == "GBIF") {

            jQuery.growl.notice({ title: "", message: "Retrieving all Kingdoms from GBIF backbone taxonomy"});

            //This to enable user to list all Kingdoms from the GBIF root
            tombio.url = 'http://api.gbif.org/v1/species/search?rank=KINGDOM&datasetKey=d7dddbf4-2cf0-4f39-9b2a-bb099caae36c';
        } else {

            jQuery.growl.notice({ title: "", message: "Retrieving children of " + d.name + " in the GBIF backbone taxonomy" });

            tombio.url = 'http://api.gbif.org/v1/species/' + d.taxonKey + '/children';
            if (d.offset > 0) {
                tombio.url += '?offset=' + d.offset;
            } else {
                tombio.url += '?offset=0';
            }
            tombio.url += '&limit=' + jQuery("#gbifPaging").val();
        }
        d3.json(tombio.url, function (error, jsonobject) {
            if (error) return console.warn(error);

            processGBIFChildren(jsonobject, d);

            //JSON display
            tombio.jsonobject = jsonobject;
            showJSON();
        });
    } else if (tombio.source == "atlas") {

        if (d.name == "ATLAS") {
            //Code in here to get all phylla
            tombio.url = "https://species-ws.nbnatlas.org/search.json?pageSize=99999&q=&fq=rank:kingdom AND taxonomicStatus:accepted" 
            jQuery.growl.notice({ title: "", message: "Retrieving all taxa of rank 'kingdom' in the NBN ATLAS taxonomy" });
        } else {
            //The current taxon rank could be anything from the array allranks, but for the purposes of the initial fetch of children,
            //we will only work with ranks found in atlasranks. So we need to find the next rank in allranks that is also in atlasranks.
            //(This is because the atlas web services do not have a way to fetch immediate children of a taxon regardless of rank. You 
            //must specify a rank. So we specify a rank (from atlasranks) that is guaranteed to fetch results and then work backwards
            //from there to get the immediate child.)
            var nextrank = null;
            var nextAllRank = d.rank;
            do {
                nextAllRank = tombio.allranks[tombio.allranks.indexOf(nextAllRank) + 1];
                if (tombio.atlasranks.indexOf(nextAllRank) > -1)
                    nextrank = nextAllRank;
            }
            while (!nextrank)

            //var nextrank = tombio.atlasranks[tombio.atlasranks.indexOf(d.rank) + 1];

            tombio.url = "https://species-ws.nbnatlas.org/search.json?pageSize=99999&q=&fq=rkid_" + d.rank + ":" + d.taxonKey + " AND rank:" + nextrank + " AND taxonomicStatus:accepted"
            jQuery.growl.notice({ title: "", message: "Retrieving children of rank " + nextrank + " of " + d.rank + " " + d.name + " in the NBN ATLAS taxonomy" });
        }
        d3.json(tombio.url, function (error, jsonobject) {
            if (error) return console.warn(error);

            processAtlasChildren(jsonobject, d);

            //JSON display
            tombio.jsonobject = jsonobject;
            showJSON();
        });
    }
}

function getParent(d) {
  
    makePop();
    console.log("Get parent");
}

function expandContractNode (d) {

    makePop();

    //Set d._children to null if node is to be contracted
    if (d.children) {
        d._children = d.children;
        d.children = null;
    } else {
        d.children = d._children;
        d._children = null;
    }
    update(d);
}

function expandNode(d) {
    if (!d.children) {
        if (d._children) {
            d.children = d._children;
            d._children = null;
        } else {
            d.children = [];
        }
    }
}

function contractNode(d) {
    if (!d._children) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d._children = [];
        }
    }
}

function deleteNode(d) {

    makePop();

    // Find and remove item from an array
    var i = d.parent.children.indexOf(d);
    if (i != -1) {
        d.parent.children.splice(i, 1);
    }

    //Reset parent's paging - but only if it's already at -1
    if (d.parent.offset && d.parent.offset == -1) {
        d.parent.offset = 0;
    }
    
    //d.parent.children = null;
    update(d);
}

function deleteChildren(d) {

    makePop();

    d.children = [];
    d.offset = 0; //Reset paging flag
    update(d);
}

function deleteChildlessChildren(d) {

    makePop();

    var remainingChildren = [];

    d.children.forEach(function (child) {
        if ((child.children && child.children.length > 0) || child._children) {
            remainingChildren.push(child);
        }
    });
    d.children = remainingChildren;
    d.offset = 0; //Reset paging flag
    update(d);
}

function showJSON() {

    var url;
    if (tombio.url.substring(0, 38) == "http://www.tombio.uk/tombio-rest-call?") {
        url = tombio.url.substring(38);
    } else {
        url = tombio.url;
    }

    jQuery("#jsonquery").html(url);
    jQuery("#jsonresponse").html(syntaxHighlight(tombio.jsonobject));
}

function syntaxHighlight(json) {
    if (typeof json != 'string') {
        json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

function centre(duration) {

    tombio.zoom
        .translate([100, 0])
        .scale(1);
    tombio.svg
        .transition()
        .duration(duration)
        .attr('transform', 'translate(' + tombio.zoom.translate() + ') scale(' + tombio.zoom.scale() + ')');
}

function saveAsImage() {
    
    //From http://techslides.com/save-svg-as-an-image
    //More stuff here: http://bl.ocks.org/vicapow/758fce6aa4c5195d24be

    var html = d3.select("svg")
            .attr("version", 1.1)
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .node().parentNode.innerHTML;

    //console.log(html);
    var imgsrc = 'data:image/svg+xml;base64,' + btoa(html);
    //var img = '<img src="' + imgsrc + '">';
    //d3.select("#svgdataurl").html(img);


    var canvas = document.querySelector("canvas"),
        context = canvas.getContext("2d");

    var image = new Image;
    image.src = imgsrc;
    image.onload = function () {
        context.drawImage(image, 0, 0);

        var canvasdata = canvas.toDataURL("image/png");

        //var pngimg = '<img src="' + canvasdata + '">';
        //d3.select("#pngdataurl").html(pngimg);

        var a = document.createElement("a");
        a.download = "sample.png";
        a.href = canvasdata;
        a.click();
    };

}

function toolTip(str) {
    jQuery('#toolTips').html(str);
}

function toTitleCase(str) {
    if (!str) return "";
    return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
}

function taxonTip(d) {

    if (d.rank) {
        return toTitleCase(d.rank) + " - " + d.name;
    } else if (d.name == "...") {
        return "Get next 'page' of taxa from GBIF"
    } else {
        return d.name;
    }
}

function makePop() {
    if (jQuery("#sounds").is(':checked')) {
        tombio.pop[0].play();
    }
}

