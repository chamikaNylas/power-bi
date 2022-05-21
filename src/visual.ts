"use strict";

import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import * as moment from "moment";
import { GoogleCharts } from 'google-charts';
// ...
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
import DataViewTable = powerbi.DataViewTable;
import DataViewTableRow = powerbi.DataViewTableRow;
import PrimitiveValue = powerbi.PrimitiveValue;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import DataView = powerbi.DataView;
import IVisualHost = powerbi.extensibility.IVisualHost;



// other imports
// ...

export class Visual implements IVisual {
    private target: HTMLElement;
    private host: IVisualHost;
    private table: HTMLParagraphElement;

    constructor(options: VisualConstructorOptions) {

        // constructor body
        this.target = options.element;
        this.host = options.host;
        const new_p: HTMLElement = document.createElement("div");
        new_p.setAttribute("style", "overflow-x:auto;");
        this.table = document.createElement("table");
        this.table.setAttribute("class", "table table-striped");
        //this.table.setAttribute("style","font-family: Arial, Helvetica, sans-serif")
      //  new_p.appendChild(this.createSelectTag());
        new_p.appendChild(this.table);
        this.target.appendChild(new_p);

        //event handler
      //  this.callupdate();


    }

    public update(options: VisualUpdateOptions) {
        
        console.log("options-update", options);
        const dataView: DataView = options.dataViews[0];
        const tableDataView: DataViewTable = dataView.table;

        if (!tableDataView) {
            return
        }
        while (this.table.firstChild) {
            this.table.removeChild(this.table.firstChild);
        }

        //draw header
        const tablethead = document.createElement("thead");
        const tablethedtr = document.createElement("tr");
        tablethead.appendChild(tablethedtr);
        let c = 0;
        // tableDataView.columns.forEach((column: DataViewMetadataColumn) => {
           
        //     const tableHeaderColumn = document.createElement("th");
        //     tableHeaderColumn.setAttribute("scope", "col")
        //     tableHeaderColumn.innerText = column.displayName
        //      if(column.displayName=="ratingWithReview")
        //          tableHeaderColumn.innerText ="Rating"
        //      tablethedtr.appendChild(tableHeaderColumn);
        //      c++;
        // });


        for (var key in this.columnNamesforHeader()) {          
            const tableHeaderColumn = document.createElement("th");
            tableHeaderColumn.setAttribute("scope", "col")
            tableHeaderColumn.innerText = this.columnNamesforHeader()[key];
            tablethedtr.appendChild(tableHeaderColumn);
          }


        //document.getElementById("tr").hidden = true;
        this.table.appendChild(tablethead);


        //draw rows
        const tabletbody = document.createElement("tbody");
        var track=0;
        tableDataView.rows.forEach((row: DataViewTableRow) => {

            console.log("DataViewTableRow", row)
            //  console.log("DataViewMetadataColumn",dataView.table.columns)
            const tableRow = document.createElement("tr");
            let i = 0;

            
            row.forEach((columnValue: PrimitiveValue) => {

                let columnName = dataView.table.columns[i].displayName;
                console.log("colum name",columnName);
                console.log("column Value",columnValue);
                const cell = document.createElement("td");

                if(columnName=="New" && track<1){
                    const tableRow2 = document.createElement("tr");
                    console.log("runing overall");
                    track++;
                    for (var key in this.columnNamesforHeader()) {          
                        const coll2 = document.createElement("td");
                        coll2.innerText = this.columnNamesforHeader()[key];
                        tableRow2.appendChild(coll2);
                        tabletbody.appendChild(tableRow2);
                        
                      }

                }
                else if(columnName!="New"){

                      //check column value 
                    if (columnName == "Overall Analytics") {
                        const valueset=columnValue.toString().split("space");
                        const outerdiv = document.createElement("div");
                        outerdiv.setAttribute("style","display: flex; gap: 10px;")
                        const innerimagdiv = document.createElement("div");
                        
                        const innertextdiv = document.createElement("div");
                        
                        innerimagdiv.append(this.createImageTag(valueset[0]));
                        // creating test element 
                        const name = document.createElement("p");
                        name.setAttribute("style","margin:0;padding:0; font-weight:bold;");
                        name.innerText=valueset[1];
                        const emaildiv = document.createElement("div");
                        emaildiv.setAttribute("style","margin:0;padding:0;");
                        const email = document.createElement("a");
                        email.setAttribute("href","mailto:"+valueset[2]);
                        email.innerText=valueset[2];
                        emaildiv.appendChild(this.createEmailIconTag());
                        emaildiv.appendChild(email);
                        
                        const phonediv = document.createElement("div");
                        phonediv.setAttribute("style","margin:0;padding:0;");
                        const phone = document.createElement("a");
                        phone.setAttribute("style","text-decoration: underline;");
                        phone.innerText=valueset[3];
                        phonediv.appendChild(this.createPhoneIconTag());
                        phonediv.appendChild(phone);
                        
                        innertextdiv.appendChild(name);
                        innertextdiv.appendChild(emaildiv);
                        innertextdiv.appendChild(phonediv);



                        
                        //innertextdiv.innerText=valueset[1] +"\n"+ valueset[2] +"\n"+ valueset[3];
                        outerdiv.appendChild(innerimagdiv);
                        outerdiv.appendChild(innertextdiv);
                        cell.append(outerdiv);

                    }
                    else if (columnName == "Avg. Response Time") {
                        cell.innerText = this.durationFilter(columnValue.toString());
                        cell.append(this.createIconTag());
                    
                    }
                    else if (columnName == "Conversion Rate") {
                        cell.innerText = Math.round(parseFloat(columnValue.toString())).toString() + "%";
                        cell.append(this.createCanvasTag(columnValue.toString()));
                        this.createChart(columnValue.toString(),Math.round(parseFloat(columnValue.toString())));
                    }
                    else if(this.columnNames().some(format => columnName.includes(format))){
                        const valueset=columnValue.toString().split("\n");
                        cell.innerText = valueset[0] +"\n"+"$"+ this.currncyformat(Number(valueset[1]));

                    }

                    else if (columnName == "ratingWithReview") {

                        const valueset=columnValue.toString().split("\n");
                        const reviewdiv = document.createElement("div");
                        reviewdiv.setAttribute("style","margin:0;padding:0;display: flex;");
                        const review = document.createElement("p");
                        review.innerText=parseFloat(valueset[0]).toFixed(1).toString();
                        reviewdiv.appendChild(this.createStarIconTag());
                        reviewdiv.appendChild(review);

                        const ratingdiv = document.createElement("div");
                        ratingdiv.setAttribute("style","margin:0;padding:0;");
                        const rating = document.createElement("p");
                        rating.innerText=valueset[1].toString();
                        ratingdiv.appendChild(rating);
                        cell.appendChild(reviewdiv);
                        cell.appendChild(ratingdiv);                  

                    }
                    else {
                        cell.innerText = columnValue.toString();
                    }

                    tableRow.appendChild(cell);
                                     
               }
               i = i + 1; 
             
            })

            // this.table.appendChild(tableRow);
            tabletbody.appendChild(tableRow);

        });

        this.table.appendChild(tabletbody);

    }

    public durationFilter(val: any) {
        if (val >= 60) {
            let duration = moment.duration(val, "seconds");
            let formatted = duration.format("h[h] m[m] s[s]");
            return formatted;
        } else {
            return "< 1 m  ";
        }
    }

    public piechart() {

    }

    public createImageTag(url: any): HTMLImageElement {

        //<img src="" alt="Circle image" width="50" height="50">
        let image = document.createElement("img");
        image.setAttribute("src", url);
        image.setAttribute("width", "50");
        image.setAttribute("height", "50");
        return image;

    }

    public createIconTag(): HTMLElement {

        let icon = document.createElement("i");
        icon.setAttribute("class", "fas fa-info-circle");
        icon.setAttribute("style", "color:#14c7ce");
        return icon;
    }

    public createPhoneIconTag(): HTMLElement {

        let icon = document.createElement("i");
        icon.setAttribute("class", "fa-solid fa-phone");
        icon.setAttribute("style", "margin-right: 1em;");
        return icon;
    }


    public createEmailIconTag(): HTMLElement {

        let icon = document.createElement("i");
        icon.setAttribute("class","fa-solid fa-envelope");
        icon.setAttribute("style", "margin-right: 1em;");
        return icon;
    }

    public createStarIconTag(): HTMLElement {

        let icon = document.createElement("i");
        icon.setAttribute("class","fas fa-star");
        icon.setAttribute("style", "margin-right: 0.1em;");
        return icon;
    }


    public createCanvasTag(id: string): HTMLElement {
        const canvas = document.createElement("div");
        canvas.id = "myChart" + id
        return canvas;
    }

    public createChart(id: string,value:number) {

        GoogleCharts.load(() => {
            // Define the chart to be drawn.
            var data = new GoogleCharts.api.visualization.DataTable();
            data.addColumn('string', 'Browser');
            data.addColumn('number', 'Percentage');
            data.addRows([
                [, value],
                [, (100-value)],
            ]);

            // Set chart options
            var options = {
                //  'title':'Browser market shares at a specific website, 2014',
                'width': 50,
                'height': 50,
                slices: { 1: { color: '#9ca8c4' }, 0: { color: '#20c997' } },
                pieSliceText: "none",
                legend: 'none',
                backgroundColor: 'transparent'
            };
            const chart = new GoogleCharts.api.visualization.PieChart(document.getElementById('myChart' + id));
            chart.draw(data, options);
        })

    }

    public getIcontitle(name: string): string {
        switch (name) {
            case 'overallHoverMessageNonState':
                return "Overall analytic average response time is calculated by adding the average response time of all the brokers divided by total count of the brokers.";
                break;
            case 'overallHoverMessageState':
                return "Overall analytics average response time is calculated by adding the average response time of all brokers within the selected states divided by the total count of the brokers within the selected states.";
                break;
            case 'BrokerHoverMessage':
                return "Average response time is calculated by considering the first activity by broker on the lead for the last 2 leads.";
                break;
            case 'StateHoverMessage':
                return "State's average response time is calculated by adding the average response time of all brokers under that state divided by total count of brokers within that state.";
                break;
        }
    }

    public currncyformat(num: number): string {
        if (String(num).length < 4) {
            return num.toString();
        }
        else if (String(num).length < 7) {
            return  (num / 1000).toFixed(1) + 'K';
        }
        else {
            return  (num / 1000000).toFixed(1) + 'M';
        }

    }
    public columnNames(): string[]
    {
       var names=[
        "Total Leade",
        "New" ,
        "Qualified",
        "Lodged",
        "OnHold" ,
        "Approved",
        "Settled",
        "Unsuccessful"];

        return names;

    }

    public createSelectTag(): HTMLElement {
        const labeltag = document.createElement("label");
        labeltag.innerText="Response Time";
        labeltag.setAttribute("for","responseTime");
        const selecttag = document.createElement("select");
        selecttag.setAttribute("name","responseTime");
        selecttag.setAttribute("id","responseTime");
        const optiontag1 = document.createElement("option");
        optiontag1.setAttribute("value","less than 5min");
        optiontag1.innerText="less than 5min";
        const optiontag2 = document.createElement("option");
        optiontag2.setAttribute("value","less than 10mins");
        optiontag2.innerText="less than 10mins";
        selecttag.appendChild(optiontag1);
        selecttag.appendChild(optiontag2);
        labeltag.appendChild(selecttag);
        return labeltag;
    }

    public callupdate()
    {
        const selectElement =<HTMLSelectElement> document.getElementById("responseTime");
        selectElement.addEventListener('change', (event:Event) => {
            console.log('You selected: ', event);
            var value = selectElement.options[selectElement.selectedIndex].value;
            console.log("value",value);            
     
       });

    }

    public columnNamesforHeader(): string[]
    {
       var cnames=[
        "",
        "Avg. Response Time",
        "Rating",
        "Conversion Rate",
        "Total Leade",
        "New" ,
        "Qualified",
        "Lodged",
        "OnHold" ,
        "Approved",
        "Settled",
        "Unsuccessful"];

        return cnames;

    }

    

    


}