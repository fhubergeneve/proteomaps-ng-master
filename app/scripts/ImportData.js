function BuildColorPalette(selectedpalette){
    var ReverseInterpolators = ["Blues", "Greens", "Greys", "Oranges", "Purples", "Reds", "BuGn", "BuPu", "GnBu", 
                                "OrRd", "PuBuGn", "PuBu", "PuRd", "RdPu", "YlGnBu", "YlGn", "YlOrBr", "YlOrRd", "Spectral"];
    var FirstLayer = Datasets[Object.keys(Datasets)[0]][0];
    var NbInitialNodes = Object.keys(FirstLayer).length;
    var colorScale = d3.scaleSequential(d3["interpolate" + selectedpalette]);
    var TotNodes,
        NbCHildren,
        TotChildren,
        NodeNb;

    CurrentPalette = selectedpalette;

    //d3.select("body").style("background-color", "WhiteSmoke");

    TotNodes = 0;
    TotChildren = 0;
    for(var i in FirstLayer){TotNodes +=  1 + FirstLayer[i]["TotalNumberOfChildren"]};
    colorScale.domain([0, 3 * TotNodes]);

    for(var i in FirstLayer){
        NbCHildren = FirstLayer[i]["TotalNumberOfChildren"];
        BorderColor = (ReverseInterpolators.includes(selectedpalette)) ? "#303030" : "#ffffff";
        txtcolor = (BorderColor == "#ffffff") ? "#303030" : "#ffffff";

        for (var i = 3 * TotChildren; i < (3 * TotChildren) + NbCHildren + 1; i++) {
          ColorPalette.push(colorScale(i));
        }
        TotChildren += NbCHildren;
    }
}


/*
pre-calculates all layers:
start from the last layer of the current dataset and goes to the 1st one
1. Creates an svg group for each layer 
2. Add every polygon to this group and sets its attributes
3. All groups are stored in a list "ListLayers" so that they are easily accessible
By default displays the 1st layer to the user

Calculation is done to prevent re-calculation when the user selects a new layer to display
*/
function DrawAllLayers(){
    var group;
    var polygons;
    var lwd;
    var svg;
    //console.log(Datasets);
    for(var dataset in Datasets){
        if(!Datasets.hasOwnProperty(dataset)){ continue; }
        
        svg = d3.select("#plots")       // Initialize svg
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("id", dataset)
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        scaleX = d3.scaleLinear()           
                 .domain([0.0,1])               //set of possible input values to the scale
                 .range([0, width /*- NbLayers*/]); //set of possible output values that the input values can be converted to

        scaleY = d3.scaleLinear()               // Same for Y axis*/
                 .domain([0.0, 1])
                 .range([0, height /*- NbLayers*/]);

        for( var layer = NbLayers - 1; layer >= 0; layer--){
            lwd = NbLayers - Number(layer) + 1;     /*Calculation of line width (border of polygons). 1st layer = widthest*/

            group = svg.append("g")                 /*Create a group for each layer*/
                    .attr("gid", layer)
                    .attr("fill-opacity", 0)        /*fill and stroke opacity is set for the entire group*/
                    .attr("stroke-opacity", 0)
                    .attr("id", dataset + layer)
                    .attr("pointer-events", "none");

            group.selectAll("polygon")   /*Set polygons attributes. Each polygon is a voronoi cell*/
                    .data(d3.keys(Datasets[dataset][layer]))
                    .enter()
                    .append("polygon")
                    .attr("points", function(d){            // Set new attribute "points" that will contain scaled vertices
                        return Datasets[dataset][layer][d].Vertices.map(function(p){  // ??? Search what map does ???
                            return [scaleX(p.X),scaleY(p.Y)]// scale each vertex (vertices) according to pre-defined parameters
                            .join(",");                     // Format for polygon display: points = (p1x,p1y p2x,p2y ... pnx,pny)
                        }).join(" ");
                    })
                    .attr("lwd", lwd)
                    .attr("stroke", BorderColor)                // Color of lines around polygons
                    .attr("stroke-width", (lwd * width)/1500 )  // Width of these lines
                    .attr("ID", function(d){                    // Set Polygon ID
                                if(!(d in IDIndex)){            // Add the current polygon to the index lookup
                                    IDIndex[d] = {};
                                }
                                IDIndex[d][dataset] = d3.select(this);
                                return d;
                    })
                    .attr("Area", function(d){                                       // Set Area attribute
                        return Datasets[dataset][layer][d].Area;
                    })
                    .attr("Node", function(d){return Datasets[dataset][layer][d].Node;})      
                    .attr("Color", function(d){return ColorPalette[Datasets[dataset][layer][d].Node]})
                    .attr("TxtColor", function(){
                        return tinycolor(d3.select(this).attr("Color")).isDark() ? "#303030" : "#ffffff";  
                    })
                    .attr("BoxColor", function(){
                        return (d3.select(this).attr("TxtColor") == "#ffffff") ? "#303030" : "#ffffff";  
                    })
                    .attr("fill", function(d){

                    /*    if(d3.select(this).attr("Area") < 0){
                            var fillPattern = svg.append("pattern")
                                .attr("id", "rectpattern" + d3.select(this).attr("ID"))
                                .attr("patternUnits", "userSpaceOnUse")
                                .attr("width", 10)
                                .attr("height", 10)
                                .attr("patternTransform", function(){
                                    return "rotate(" + Math.random()*360 + ")"
                                });
                            var fillPatternRectangle = fillPattern.append("rect")
                                .attr("height", 20)
                                .attr("width", 5)
                                .attr("fill", d3.select(this).attr("Color"));

                            return "url(#rectpattern" + d3.select(this).attr("ID") + ")"
                        }
                        else*/ return d3.select(this).attr("Color")
                        })  //Fill polygon with color                 

                    .attr("Parent", function(d){                                     // Set parent attribute
                        return Datasets[dataset][layer][d].Parent;
                    })
                    .attr("Name", function(d){return Datasets[dataset][layer][d].Name;})
                    .attr("Abbreviation", function(d){return Datasets[dataset][layer][d].Abbreviation;})
                    .attr("Description", function(d){return Datasets[dataset][layer][d].Description;})   
                    .attr("Layer", String(layer))                                    // Set layer. easier for mouseover
                    .attr("SwissLipidsLink", function(){ return "http://www.swisslipids.org/#/entity/" + d3.select(this).attr("ID") + "/";})
                    // "mouseover" event
                    .on("mouseover", function() { 
                            var Cell = d3.select(this);
                            CurrentCell = {"ID": Cell.attr("ID"), 
                                           "Name": Cell.attr("Name"),
                                           "Abbreviation": Cell.attr("Abbreviation"),
                                           "Description": Cell.attr("Description"),
                                           "Layer": Cell.attr("Layer"), 
                                           "Color": Cell.attr("Color"), 
                                           "TxtColor": Cell.attr("TxtColor"), 
                                           "BoxColor": Cell.attr("BoxColor"),
                                           "Parent": Cell.attr("Parent"),
                                           "Area": Cell.attr("Area"),
                                           "SwissLipidsLink": Cell.attr("SwissLipidsLink")
                                          };

                            for(var dset in IDIndex[Cell.attr("ID")]){
                                IDIndex[Cell.attr("ID")][dset].attr("fill", CurrentCell.BoxColor);
                            }

                            return tooltip.style("visibility", "visible")   // Display tooltip
                                      .style("border-color", CurrentCell.Color)
                                      .style("background-color", CurrentCell.BoxColor)
                                      .html("<span style='color:" + CurrentCell.Color + ";font-weight:bold'>" + 
                                            CurrentCell.Name + "</span>");
                        })
                    // we move tooltip during of "mousemove"                  
                    .on("mousemove", function() {
                        return tooltip.style("top", (d3.event.pageY - window.pageYOffset - 30) + "px")
                                      .style("left", (d3.event.pageX - window.pageXOffset + 15) + "px");
                      })  
                    // We hide tooltip when leaving polygon
                    .on("mouseout", function() {
                        var Cell = d3.select(this);
                        for(var dset in IDIndex[Cell.attr("ID")]){
                                //IDIndex[Cell.attr("ID")][dset].attr("fill", CurrentCell.Color);
                                IDIndex[Cell.attr("ID")][dset].attr("fill", IDIndex[Cell.attr("ID")][dset].attr("Color"));
                            }    
                        return tooltip.style("visibility", "hidden");
                      })
                    // We display more informations about current polygon on single click
                    .on("click", function(){

                       var AreasHtml = "<span style='color:" + CurrentCell.TxtColor + 
                                        ";text-decoration: underline'>" + "Values:</span></br>";

                       for(var dset in IDIndex[CurrentCell.ID]){
                                AreasHtml += "<span style='color:" + CurrentCell.TxtColor + 
                                                ";font-style:italic'> " + dset + ": </span>" +
                                                "<span style='color:" + CurrentCell.Color + 
                                                ";font-style:italic'> " +
                                                IDIndex[CurrentCell.ID][dset].attr("Area") + 
                                                " </span></br>";
                            }  
                       //console.log(AreasHtml);
                        return tooltip.html("<span style='color:" + CurrentCell.Color + ";font-weight:bold'>" + CurrentCell.Name + "</span></br></br>" +
                                            "<span style='color:" + CurrentCell.TxtColor + "'>ID: </span>" + 
                                            "<span style='color:" + CurrentCell.Color + "'>" + CurrentCell.ID + "</span></br></br>" +
                                            "<span style='color:" + CurrentCell.TxtColor + "'>Parent: </span>" +
                                            "<span style='color:" + CurrentCell.Color + "'>" + CurrentCell.Parent + "</span></br></br>" +
                                            AreasHtml
                                            + "</br></br>" + 
                                            "<span style='color:" + CurrentCell.TxtColor + "'>Description: </span>" +
                                            "<span style='color:" + CurrentCell.Color + "'>" + CurrentCell.Description + "</span>"
                                            );
                      })
                    .on("dblclick", function(){
                        window.open(CurrentCell.SwissLipidsLink);
                    });

            
           group.selectAll("text")   
                    .data(d3.keys(Datasets[dataset][layer]))
                    .enter()
                    .append("text")
                        .text(function(d){
                            return Datasets[dataset][layer][d].Name;})
                        .attr("id", function(d){ return "txt_" + Datasets[dataset][layer][d].Node})
                        .attr("pos", function(d){return Datasets[dataset][layer][d].Node})
                        .style('fill', function(d){
                                return tinycolor(ColorPalette[Datasets[dataset][layer][d].Node]).isDark() ? "#ffffff": "#303030"; 
                        })
                        .style('fill-opacity', 0)
                        .attr("text-anchor", "middle")
                        .attr("size", function(d){
                            var size = Math.max(this.getBoundingClientRect().width, this.getBoundingClientRect().height)  //Select longest value of height / width
                            return ((Datasets[dataset][layer][d].MaxTextSize) / size * width * 25)  ;
                        })
                        .style("font-size", function(d) { return d3.select(this).attr("size");})
                        .attr("x", function(d){return scaleX(Datasets[dataset][layer][d].Centroid.X)})
                        .attr("y", function(d){
                            return scaleY(Datasets[dataset][layer][d].Centroid.Y) + (0.25 * d3.select(this).node().getBBox().height)
                        })
                        .style("font-weight", "bold")
                        .attr("pointer-events", "none");
        }
                svg.append("text")
                .attr("x", width / 2) 
                .attr("y", 0 - (margin.top / 2))            
                .attr("text-anchor", "middle")  
                .style("font-size", (width * 20) / 500 + "px") 
                .style("font-weight", "bold")
                .attr("transform", "translate(" + margin.left / 2 + "," + margin.top + ")")  
                .text(dataset);
    }
    SelectLayerToDisplay(CurrentLayer);
}

/*
Sets all layer opacity:
The opacity of the selected layer depends on its stack position within the svg
Layers above the selected one their lines only (cells borders)
Layers under the selected one display partially their opacity and lines
Then I (re-)calculate a temporary layer (so that it is positioned on top of the svg)
and make it completely transparent. It is only for the mouseover / mouse click
the temporary layer is then removed when function is called 
*/
function SelectLayerToDisplay(LayerToDisplay){

    var opacity =  Math.sqrt(1 / (NbLayers - LayerToDisplay),2);            /*pre-compute opacit of the selected layer*/
    var selection;                                                          // used for selecting svg groups representing each layer
    //var ColorEdges = d3.select("#coledges").property("value") == "true" ? true: false;



    for(var i = 0; i < LayersNames.length; i++){ 
        l = LayersNames[i];
        selection = "g[gid='" + l + "']";                                   // Select all groups of the current layer

        if(l == LayerToDisplay){                                            // If we reach the layer we want to display:
            d3.selectAll(selection).style("fill-opacity", opacity)          // Change its opacity to the calculated one
                                   .style("stroke-opacity", 1)              // Show lines at 100%
                                   .attr("pointer-events", "visibileFill")  // Make it visible to pointer events  
                                   .selectAll("text").style('fill-opacity', function(){
                                        return d3.select("#ShowNames").property("value") == "true" ? 1 : 0});

        }
        else if (l < LayerToDisplay){
            d3.selectAll(selection).style("fill-opacity", 0.0)                // layer smaller than current one (upper) do not show cells
                                   .style("stroke-opacity", 1)              // show their borders
                                   /*.style("stroke-opacity", function(){
                                        return d3.select("#coledges").property("value") == "true" ? 0 : 1;
                                   })    */          
                                   .attr("pointer-events", "none")         // Invisible to pointer events
                                   //.selectAll("text").style('fill-opacity', 0);
                                   .selectAll("text").style("fill-opacity", function(){
                                    if( (d3.select("#ShowParents").property("value") == "true") && (LayersNames[i+1] == LayerToDisplay) ){ return 0.7;}
                                    else{ return 0; }

                                   })
        }
        else{
            d3.selectAll(selection).style("fill-opacity", 0.5)              // layers under show their cells in transparency
                                   .style("stroke-opacity", 0.2)            // borders are light
                                   .attr("pointer-events", "none")         // invisible to pointer event
                                   .selectAll("text").style('fill-opacity', 0);
                                   
        }
    }
}


/*
When colormap is changed, the color of each cell is re-calculated
*/
function ChangeColorMap() {
    selectValue = d3.select('.ColorMapSelector').select('select').property('value')
    highlight = d3.select('.HighlightStyle').select('select').property('value')

    var posvals =  d3.select("#PosVals").property("value") == "true" ? true: false;
    var negvals =  d3.select("#NegVals").property("value") == "true" ? true: false;
//    var ColorEdges = d3.select("#coledges").property("value") == "true" ? true: false;

    ColorPalette = [];
    BuildColorPalette(selectValue);

    /*Update polygon color*/
    d3.selectAll("polygon")
        .attr("Color", function(){
            var cell = d3.select(this);
            if(highlight == "Saturation" && (posvals || negvals)){
                if((cell.attr("Area") < THRESHOLD && posvals) || (cell.attr("Area") > THRESHOLD && negvals)){
                    return tinycolor(ColorPalette[cell.attr("Node")]).desaturate(35).toString(); 
                }
                else if((cell.attr("Area") > THRESHOLD && posvals) || (cell.attr("Area") < THRESHOLD && negvals)){ 
                    return tinycolor(ColorPalette[cell.attr("Node")]).saturate(100).toString();
                }
            }

            else if( (cell.attr("Area") < THRESHOLD && posvals) || (cell.attr("Area") > THRESHOLD && negvals) ){ 
                if(highlight == "Complementary"){return tinycolor(ColorPalette[cell.attr("Node")]).complement();}
                else if(highlight == "Lighten"){return tinycolor(ColorPalette[cell.attr("Node")]).lighten(35).toString();}
                else{return tinycolor(ColorPalette[cell.attr("Node")]).desaturate(100).toString();}
            }
            else return ColorPalette[cell.attr("Node")];
        })

/*        .attr("stroke", function(){
            var cell = d3.select(this);
            if(ColorEdges && ((cell.attr("Area") < THRESHOLD && negvals) || (cell.attr("Area") > THRESHOLD && posvals) )){
                return tinycolor(ColorPalette[cell.attr("Node")]).complement();
            }
            else{return BorderColor;}
        })

        .attr("stroke-width", function(){
            var cell = d3.select(this);
            if(ColorEdges && ((cell.attr("Area") < THRESHOLD && negvals) || (cell.attr("Area") > THRESHOLD && posvals) )){
                return (cell.attr("lwd") * width) / 100;
            }
            else{return (cell.attr("lwd") * width) / 1500;}
        })*/

        //.attr("stroke", BorderColor)                // Color of lines around polygons
        .attr("fill", function(){return d3.select(this).attr("Color")})  //Fill polygon with color 
        .attr("TxtColor", function(){return tinycolor(d3.select(this).attr("Color")).isDark() ? "#303030" : "#ffffff";})
        .attr("BoxColor", function(){return (d3.select(this).attr("TxtColor") == "#ffffff") ? "#303030" : "#ffffff";})
        .attr("fill", function(){return d3.select(this).attr("Color")})  //Fill polygon with color     

    /*Update text color*/
    d3.selectAll("g").selectAll("text") 
      .style('fill', function(){
              return tinycolor(ColorPalette[d3.select(this).attr("pos")]).isDark() ? "#ffffff": "#303030"; 
      });
};




function SizeSelection(){
    var interpolators = ["Plot Size", "Small", "Medium", "Large", "Extra Large"];
    d3.select('.PlotSize')
      .append('select')
      .attr('class','select')
      .on('change', ChangePlotSize)
          .selectAll('option')
          .data(interpolators).enter()
          .append('option')
          .attr("value", function(d){ if(d != interpolators[0]) return d; else {return interpolators[1]} })
          .text(function (d) { return d; })
          .each(function(d) {
            if (d === "Plot Size") {
              d3.select(this).property("disabled", true)
            }
        });
}

function ChangePlotSize(){
  selectValue = d3.select('.PlotSize').select('select').property('value')
  var Size = {"Small" : 250, "Medium": 500, "Large": 1000, "Extra Large": 2500};
  d3.selectAll("svg").remove();
  var selected = Size[selectValue];
  margin = {top: 0.1 * selected, right: 0.1 * selected, bottom: 0.1 * selected, left: 0.1 * selected};
  width = selected - margin.left - margin.right;
  height = selected - margin.top - margin.bottom;
  DrawAllLayers();
}


/*
Selection box letting the user change the
colormap
*/
function ColorSelection(){
    var interpolators = [
      "ColorMap",
      // These are from d3-scale.
      "Viridis",
      "Inferno",
      "Magma",
      "Plasma",
      "Warm",
      "Cool",
      "Rainbow",
      "CubehelixDefault",
      // These are from d3-scale-chromatic
      "Spectral",
      "Blues",
      "Greens",
      "Greys",
      "Oranges",
      "Purples",
      "Reds",
      "BuGn",
      "BuPu",
      "GnBu",
      "OrRd",
      "PuBuGn",
      "PuBu",
      "PuRd",
      "RdPu",
      "YlGnBu",
      "YlGn",
      "YlOrBr",
      "YlOrRd"
    ];

  d3.select('.ColorMapSelector')
    .append('select')
    .attr('class','select')
    .on('change', ChangeColorMap)
        .selectAll('option')
        .data(interpolators).enter()
        .append('option')
        .attr("value", function(d){ if(d != interpolators[0]) return d; else {return interpolators[1]} })
        .text(function (d) { return d; })
        .each(function(d) {
            if (d === "ColorMap") {
              d3.select(this).property("disabled", true)
            }
        });
}



function HighlightStyleSelection(){
    var interpolators = ["Highlight Style", "GreyScale", "Lighten", "Saturation", "Complementary"];
    d3.select('.HighlightStyle')
      .append('select')
      .attr('class','select')
      .on('change', ChangeColorMap)
          .selectAll('option')
          .data(interpolators).enter()
          .append('option')
          .attr("value", function(d){ if(d != interpolators[0]) return d; else {return interpolators[1]} })
          .text(function (d) { return d; })
          .each(function(d) {
            if (d === "Highlight Style") {
              d3.select(this).property("disabled", true)
            }
        });
}


function shownames(){
    d3.select("#ShowNames").property("value", function(){return this.value == "false" ? "true" : "false";})
    SelectLayerToDisplay(CurrentLayer);
}

function showparents(){
    d3.select("#ShowParents").property("value", function(){return this.value == "false" ? "true" : "false";})
    SelectLayerToDisplay(CurrentLayer);
}

function showposvals(){
    d3.select("#PosVals").property("value", function(){return this.value == "false" ? "true" : "false";})
    ChangeColorMap();
}

function shownegvals(){
    d3.select("#NegVals").property("value", function(){return this.value == "false" ? "true" : "false";})
    ChangeColorMap();
}




function ExportLayersToPNG(){
    for(var dataset in Datasets){
        if(!Datasets.hasOwnProperty(dataset)){ continue; }
        var filename = dataset + "_Layer-" + CurrentLayer + "_" + CurrentPalette + ".png";
        var scalefactor = 7500 / width;
        saveSvgAsPng(document.getElementById(dataset), filename, {scale: scalefactor});
    }
}


/*
Creates buttons with layers names
When user selects a layer, it updates the plot to show
the selected layer properly
*/
function LayerSelectionButtons(){
        d3.select(".LayersButtons")               /*Add simple text*/
            .selectAll("button")
            .data(LayersNames)
            .enter().append("button")
            .text(function(d){ return d; })
            .attr("value", function(d, i){
                return i == 0 ? "true" : "false";
            })
            .on("click", function(buttonValue){

                d3.select(".LayersButtons").selectAll("button").attr("value", "false");
                d3.select(this).attr("value", "true");
                CurrentLayer = buttonValue;
                SelectLayerToDisplay(CurrentLayer);
            })
}



