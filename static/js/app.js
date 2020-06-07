d3.json("../../samples.json").then(initPage);

//var select = d3.select("#selDataset");
//select.on("change", optionChanged);

function initPage(data){
    data.names.forEach(name => {
        var select = d3.select("#selDataset");
        option = select.append("option");
        option.text(name);
        option.attr("value", name);
    });

    var panelBody = d3.select("#sample-metadata");
    bodyList = panelBody.append("ul");

    //Default metadata
    info = data.metadata[0];
    updateMetadata(info, bodyList);

    //Default data
    sample = data.samples[0];

    //For plotting the bar chart
    plotBarChart(sample, false);

    //For plotting the bubble chart
    plotBubbleChart(sample, false);

}

function optionChanged(value){
    console.log(`Valor selecciondo: ${value}`);
    d3.json("../../samples.json").then(data => {
        info = data.metadata.find(element => element.id == value);
        //Updating the metadata
        var bodyList = d3.select("#sample-metadata > ul");
        updateMetadata(info, bodyList);

        //Updating the bar chart
        sample = data.samples.find(element => element.id == value);
        plotBarChart(sample, true);

        //Updating bubble chart
        plotBubbleChart(sample, true);
    });
}

function updateMetadata(info, bodyList){
    if(bodyList.node().hasChildNodes())
        bodyList.selectAll("li").remove();

    Object.entries(info).forEach(([key, value]) =>{
        item = bodyList.append("li");
        item.text(`${key}: ${value}`);
    });

    bodyList.style("padding-left", "5px");
    d3.selectAll("li").style("list-style-type", "none");
}

function plotBubbleChart(sample, update){

    //Get the bubble color depending on the OTU ID
    var color_array = getBubbleColor(sample.otu_ids);
    
    //Get the bubble depending on the value
    var size_array = getBubbleSize(sample.sample_values);

    if(update){
       Plotly.restyle("bubble", "x", [sample.otu_ids]);
       Plotly.restyle("bubble", "y", [sample.sample_values]);
       Plotly.restyle("bubble", "text", [sample.otu_labels]);
       var marker = {color:color_array, size:size_array, sizemode:"area"};
       Plotly.restyle("bubble", "marker", [marker]);
    }
    else{
        var bubbleData = [{
            x:sample.otu_ids,
            y:sample.sample_values,
            text:sample.otu_labels,
            mode:"markers",
            marker: {
                color: color_array,
                size: size_array,
                sizemode: "area"
              }
        }]
    
        var layout = {
            showlegend:false
        }
        Plotly.newPlot("bubble", bubbleData, layout);
    }
}

function getBubbleColor(otu_ids){
    var color_array = [];
    otu_ids.forEach(id => {
        if(id <= 500)
            color_array.push("rgb(80, 191, 141)");
        else if(id > 500 && id <=1000)
            color_array.push("rgb(34, 178, 194)");
        else if(id > 1000 && id <=1500)
            color_array.push("rgb(55, 59, 194)");
        else if(id > 1500 && id <=2000)
            color_array.push("rgb(84, 117, 135)");
        else if(id > 2000 && id <=2500)
            color_array.push("rgb(186, 172, 47)");
        else
            color_array.push("rgb(125, 94, 77)");
    });
    return color_array;
}

function getBubbleSize(sample_values){
    var size_array = [];
    baseSize = 500
    sample_values.forEach(value => {
        if(value <= 10)
            size_array.push(baseSize/5);
        else if(value > 10 && value <= 20)
            size_array.push(baseSize/4);
        else if(value > 20 && value <= 30)
            size_array.push(baseSize/3);
        else if(value > 30 && value <= 40)
            size_array.push(baseSize/2);
        else if(value > 40 && value <= 50)
            size_array.push(baseSize);
        else if(value > 50 && value <=100)
            size_array.push(baseSize*2);
        else if(value > 100 && value <=150)
            size_array.push(baseSize*4);
        else if(value > 150 && value <=2000)
            size_array.push(baseSize*8);
    });
    return size_array;
}

function plotBarChart(sample, update){
    sample_values = [];
    otu_ids_str = [];
    otu_labels = [];

    length = sample.otu_ids.length;
    if(length > 10)
        length = 10;
        
    //Only the first 10 samples of the subject
    for(var i = 0; i < length; i++){
        otu_ids_str.push(`OTU ${sample.otu_ids[i]}`);
        sample_values.push(sample.sample_values[i]);
        otu_labels.push(sample.otu_labels[i]);
    }

    if(update)
    {
        //Update the plot
        Plotly.restyle("bar", "x", [sample_values]);
        Plotly.restyle("bar", "y", [otu_ids_str]);
        Plotly.restyle("bar", "text", [otu_labels]);
    }
    else
    {
        //Trace for the horizontal bar chart
        var barData = [{
            x:sample_values,
            y:otu_ids_str,
            type:"bar",
            orientation:"h",
            text:otu_labels
        }]
        //Plotting the bar chart
        Plotly.newPlot("bar", barData);
    }
}