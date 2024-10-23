import { Grid, Typography } from "@mui/material";
import { memo, useEffect, useState, useRef } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import Form from "../components/Form.js";
import {useSnackbar} from "../utils/index.js";
import colors from "../_colors.scss";

import { getCollectionData, getCollectionDataStatistics } from "../api/index.js";

const AgroLab = () => {
    const { success, error } = useSnackbar();
    const [data, setData] = useState(null);
    const [sortedData, setSortedData] = useState(null);
    const [pageRefreshTime, setPageRefreshTime] = useState(new Date());


    // Get Data
    useEffect(() => {
        const organization = 'agrolab';
        const project = 'wheat';
        const collection = 'sensors';
        const params = JSON.stringify({
            "attributes": ["timestamp", "soil_quality"],
            "filters": [
                {
                    "property_name": "soil_quality",
                    "operator": "gte",
                    "property_value": 0.8
                }
            ],
            "order_by": {
                "field":"timestamp",
                "order":"asc"
            }
        });
        // const order_by = {"field":"soil_moisture","order":"desc"};
        const accessKey = '******';

        const fetchData = async (organization, project, collection, accessKey, params) => {
            try {
                const response = await getCollectionData(organization, project, collection, accessKey, params);
                setData(response);
                console.log('Data fetched:', response);
                success("Data fetched successfully!");
            } catch (error) {
                error('Error fetching data:', error);
                throw error;
            };
        };
        fetchData(organization, project, collection, accessKey, params);
    }, []);

    const minutesAgo = Math.floor((new Date() - pageRefreshTime) / 60000);

    // const timestamp = data.map(item => item.timestamp);
    // console.log('Timestamps1:', timestamp);
    // const soilmoist = data.map(item => item.soil_moisture);
    // console.log('Soil Moisture1:', soilmoist);
        
    // Get the current year and month
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();

    // Get the number of days in the current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthsInYear = 12;

    // Generate ten random percentages that sum up to 100%
    const generateRandomPercentages = (num) => {
        const arr = Array.from({ length: num }, () => Math.random());
        const sum = arr.reduce((a, b) => a + b, 0);
        return arr.map(value => (value / sum) * 100);
    };

    const generateRandomNumbers = (length, min=0, max=1) => {
        return Array.from({ length }, () => (Math.random() * (max - min)) + min);
    };

    const generateTimesOfDay = () => {
        const times = [];
        for (let i = 0; i < 24; i++) {
            const hour = i < 10 ? `0${i}` : i;
            times.push(`${hour}:00`);
        }
        return times;
    };

    const generateTimesOfDayUntilNow = () => {
        const now = new Date();
        const hours = [];
        for (let i = 0; i <= now.getHours(); i++) {
            const hour = i < 10 ? `0${i}` : i;
            hours.push(`${hour}:00`);
        }
        return { hours, count: hours.length };
    };
    const { hours, count } = generateTimesOfDayUntilNow();
    
    // Form Parameters
    const monthNames = [
        { value: "January", text: "January" },
        { value: "February", text: "February" },
        { value: "March", text: "March" },
        { value: "April", text: "April" },
        { value: "May", text: "May" },
        { value: "June", text: "June" },
        { value: "July", text: "July" },
        { value: "August", text: "August" },
        { value: "September", text: "September" },
        { value: "October", text: "October" },
        { value: "November", text: "November" },
        { value: "December", text: "December" }
      ];
    
    const formRef = useRef();
    const [value, setValue] = useState("");

    const formContent = [
		
		{   customType: "dropdown",
			id: "time period sort",
            label: "Sort By:",
            items: [
                { value: "Week", text: "Week" },
                { value: "Month", text: "Month" },
                { value: "Year", text: "Year" },
            ],
            value: value,
            defaultValue: "Month",
            onChange: (event) => {
                console.log(`Status changed to ${event.target.value}`);
            },
        },
        {
			customType: "date-picker",
			id: "from",
			type: "desktop",
			label: "From:",
            background: "grey",
		},
        {
			customType: "date-picker",
			id: "to",
			type: "desktop",
			label: "To:",
            background: "grey",
		},
	];

    const onChange = (event) => setValue(event.target.value);
    const annualYield = ((Math.random() * 5) + 2).toFixed(2);

    return (
        <Grid container display="flex" direction="row" justifyContent="space-around" spacing={2}>
            <Grid item xs={12} md={4} alignItems="center" flexDirection="column">
                <Card
                    title="Annual Crop Yield"
                    footer={(
                        <Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
                            <Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
                                {`🕗 updated ${minutesAgo} minutes ago`}
                            </Typography>
                        </Grid>
                    )}
                >
                    <Typography variant="h4" component="h4" align="center" sx={{ fontWeight: "bold" }}>
                        {`${annualYield} T`}
                        <Typography variant="body2" component="p" sx={{ fontSize: "0.6em" }}>
                            <span style={{ color: colors.secondary }}>6%</span> increase from {year - 1}
                        </Typography>
                    </Typography>
                </Card>
            </Grid>
            <Grid item xs={12} md={4} alignItems="center" flexDirection="column">
                <Card
                    title="Monthly Irrigation"
                    footer={(
                        <Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
                            <Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
                                {`🕗 updated ${minutesAgo} minutes ago`}
                            </Typography>
                        </Grid>
                    )}
                >
                    <Typography variant="h4" component="h4" align="center" sx={{ fontWeight: "bold" }}>
                        {`${Math.floor(Math.random() * 500) + 300} Litres`}
                        <Typography variant="body2" component="p" sx={{ fontSize: "0.6em" }}>
                            <span style={{ color: colors.error }}>10%</span> decrease since last {monthNames[month - 1].text}  
                        </Typography>                          
                    </Typography>
                </Card>
            </Grid>
            <Grid item xs={12} md={4} alignItems="center" flexDirection="column">
                <Card
                    title="Temperature"
                    footer={(
                        <Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
                            <Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
                                {`🕗 updated ${minutesAgo} minutes ago`}
                            </Typography>
                        </Grid>
                    )}
                >
                    <Typography variant="h4" component="h4" align="center" sx={{ fontWeight: "bold", textAlign: "center" }}>
                        {`${Math.floor(Math.random() * 10) + 20}°C`}
                        <Typography variant="body2" component="p" sx={{ fontSize: "0.6em" }}>
                            <span style={{ color: colors.warning }}>Sunny</span> <span style={{ color: colors.third }}>skies</span> in your area
                        </Typography>
                    </Typography>
                </Card>
            </Grid>
            <Grid item xs={12} md={4} alignItems="center" flexDirection="column" mt={4}>
                <Card
                    title="Monthly Crop Yield Distribution"
                    footer={(
                        <Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
                            <Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
                                {`🕗 updated ${minutesAgo} minutes ago`}
                            </Typography>
                        </Grid>
                    )}
                >
                    <Plot
                        scrollZoom
                        data={[
                            {
                                x: Array.from({ length: 4 }, (_, i) => `Week ${i + 1}`),
                                y: generateRandomNumbers(4, 25, 35),
                                type: "bar",
                                title: "bar",
                                color: "secondary", 
                            },
                        ]}
                        title="Total Crop Yield per Week"
                        showLegend={false}
                        displayBar={false}
                        height="400px"
                        yaxis={{ title: "Tonnes" }}   
                    />
                </Card>
            </Grid>                        
            <Grid item xs={12} md={4} alignItems="center" flexDirection="column" mt={4}>
                <Card
                    title="Soil Moisture"
                    footer={(
                        <Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
                            <Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
                                {`🕗 updated ${minutesAgo} minutes ago`}
                            </Typography>
                        </Grid>
                    )}
                >
                    <Plot
                        scrollZoom
                        data={[
                            {
                                x: hours,//generateHoursUntilNow(), // generateTimesOfDay(), // Generate an array of each hour in the day
                                y: generateRandomNumbers(count, 0, 100),
                                type: "scatter", // One of: scatter, bar, pie
                                title: "scatter",
                                mode: "lines+markers", // For scatter one of: lines, markers, text and combinations (e.g. lines+markers)
                                color: "secondary",
                            }
                        ]}
                        title={`${monthNames[month].text} ${day}`}
                        showLegend={false}
                        displayBar={false}
                        height="400px"
                        xaxis={{
                            // title: "Time of Day",
                            tickangle: 45,
                        }}
                        yaxis={{
                            title: "Soil Moisture (%)",
                        }}
                    />
                </Card>
            </Grid>
            <Grid item xs={12} md={4} alignItems="center" flexDirection="column" mt={4}>
                <Card
                    title="Daily Humidity"
                    footer={(
                        <Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
                            <Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
                                {`🕗 updated ${minutesAgo} minutes ago`}
                            </Typography>
                        </Grid>
                    )}
                >
                    <Plot
                        scrollZoom
                        data={[
                            {
                                x: hours, //generateTimesOfDay(), // Generate an array of each hour in the day
                                y: generateRandomNumbers(count, 0, 90), // Example y values
                                type: "scatter", // One of: scatter, bar, pie
                                title: "scatter",
                                mode: "lines+markers", // For scatter one of: lines, markers, text and combinations (e.g. lines+markers)
                                color: "secondary",
                            }
                        ]}
                        title={`${monthNames[month].text} ${day}`}
                        showLegend={false}
                        displayBar={false}
                        height="400px"
                        xaxis={{
                            // title: "Time of Day",
                            tickangle: 45,
                        }}
                        yaxis={{
                            title: "Humidity (%)",
                        }}
                    />
                </Card>
            </Grid>
            <Grid item xs={12} md={12} mt={4}>
                <Card
                    title="Annual Yield Per Field"
                    footer={(
                        <Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
                            <Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
                                {`🕗 updated ${minutesAgo} minutes ago`}
                            </Typography>
                        </Grid>
                    )}
                >
                    <Plot
                        showLegend
                        scrollZoom
                        data={[
                            {
                                labels: Array.from({ length: 4 }, (_, i) => `Field ${i + 1}`), // Generate labels from "field 1" to "field 10"
                                values: generateRandomPercentages(4),
                                type: "pie",
                                title: "pie",
                            },
                        ]}
                        displayBar={false}
                    />
                </Card>
            </Grid>
            <Grid item xs={12} sm={12} md={6} mt={4}>
                <Card
                    title="Seasonal Temperature Distribution"
                    footer={(
                        <Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
                            <Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
                                {`🕗 updated ${minutesAgo} minutes ago`}
                            </Typography>
                        </Grid>
                    )}
                >
                    <Grid container flexDirection="row" sx={{ position: 'relative', width: '100%'}}>
                        <Grid item sx={{ position: 'relative', width: '85%',  zIndex: 1}}> 
                            <Plot
                                scrollZoom
                                data={[
                                    {
                                        y:  generateRandomNumbers(daysInMonth, 20, 40),
                                        type: "box", // One of: scatter, bar, pie
                                        title: "June",
                                        color: "secondary",
                                    },
                                    {
                                        y: generateRandomNumbers(daysInMonth, 32, 42),
                                        type: "box", // One of: scatter, bar, pie
                                        title: "July",
                                        color: "secondary",
                                    },
                                    {
                                        y: generateRandomNumbers(daysInMonth, 28, 38),
                                        type: "box", // One of: scatter, bar, pie
                                        title: "August",
                                        color: "secondary",
                                    },
                                ]}
                                title="Summer Time"
                                showLegend={false}
                                yaxis={{
                                    title: "Temperature (°C)",
                                }}
                            />
                        </Grid>   
                        <Grid
                            item
                            md={7}
                            sx={{
                                position: 'absolute', 
                                top: 0,
                                right: -85,
                                width: '52%',
                                height: '50%',
                                zIndex: 10,
                                
                            }}
                        >
                            <Form ref={formRef} content={formContent.slice(1)} />
                        </Grid>
                    </Grid>
                </Card>
            </Grid>
            <Grid item xs={12} sm={12} md={6} mt={4}>
                <Card
                    title="Precipitation"
                    footer={(
                        <Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
                            <Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
                                {`🕗 updated ${minutesAgo} minutes ago`}
                            </Typography>
                        </Grid>
                    )}
                >
                    <Grid container flexDirection="row" sx={{ position: 'relative', width: '100%'}}>
                        <Grid item sx={{ position: 'relative', width: '90%',  zIndex: 1}}> 
                            <Plot
                                scrollZoom
                                data={[
                                    {
                                        x: Array.from({ length: 4 }, (_, i) => `week ${i + 1}`),
                                        y: generateRandomNumbers(monthsInYear, 0, 10),
                                        type: "bar", // One of: scatter, bar, pie
                                        title: "Field 1",
                                        color: "primary",
                                    },
                                    {
                                        x: Array.from({ length: 4 }, (_, i) => `week ${i + 1}`),
                                        y: generateRandomNumbers(monthsInYear, 0, 10),
                                        type: "bar", // One of: scatter, bar, pie
                                        title: "Field 2",
                                        color: "secondary",
                                    },
                                    {
                                        x: Array.from({ length: 4 }, (_, i) => `week ${i + 1}`),
                                        y: generateRandomNumbers(monthsInYear, 0, 10),
                                        type: "bar",
                                        title: "Field 3",
                                        color: "third",
                                    },
                                    {
                                        x: Array.from({ length: 4 }, (_, i) => `week ${i + 1}`),
                                        y: generateRandomNumbers(monthsInYear, 0, 10),
                                        type: "bar",
                                        title: "Field 4",
                                        color: "green",
                                    },
                                ]}
                                title="Average Precipitation per Week"
                                yaxis={{
                                    title: "Precipitation (mm)",
                                }}
                            />
                        </Grid>
                        <Grid
                            item
                            md={7}
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                right: -70,
                                width: '52%',
                                height: '50%',
                                zIndex: 20,
                                display: 'grid',
                            }}
                        >
                            <Form ref={formRef} content={formContent}/>
                        </Grid>
                    </Grid>
                </Card>
            </Grid>
            <Grid item width="100%" mt={4}>
                <Card
                    title="Soil Quality"
                    footer={(
                        <Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
                            <Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
                                {`🕗 updated ${minutesAgo} minutes ago`}
                            </Typography>
                        </Grid>
                    )}
                >
                    <Plot
                        scrollZoom
                        data={[
                            {
                                x: monthNames.map(month => month.text).slice(0, 10), //Array.from({ length: monthsInYear }, (_, i) => i + 1),
                                y: generateRandomNumbers(monthsInYear-2, 0, 100),
                                texts: ["One", "Two", "Three"], // Text for each data point
                                type: "scatter", // One of: scatter, bar, pie
                                title: "Field 1",
                                mode: "lines", // For scatter one of: lines, markers, text and combinations (e.g. lines+markers)
                                color: "primary",
                            },
                            {
                                x: monthNames.map(month => month.text).slice(0, 10), //Array.from({ length: monthsInYear }, (_, i) => i + 1),
                                y: generateRandomNumbers(monthsInYear-2, 0, 100),
                                type: "scatter", // One of: scatter, bar, pie
                                title: "Field 2",
                                mode: "lines", // For scatter one of: lines, markers, text and combinations (e.g. lines+markers)
                                color: "secondary",
                            },
                            {
                                x: monthNames.map(month => month.text).slice(0, 10), //Array.from({ length: monthsInYear }, (_, i) => i + 1),
                                y: generateRandomNumbers(monthsInYear-2, 0, 100),
                                type: "scatter", // One of: scatter, bar, pie
                                title: "FIeld 3",
                                mode: "lines", // For scatter one of: lines, markers, text and combinations (e.g. lines+markers)
                                color: "third",
                            },
                        ]}
                        title="Average Soil Quality per Month"
                        xaxis= {{
                            //title: "Month",
                            tickmode: "linear",
                            tick0: 1,
                            dtick: 1,
                        }}
                        yaxis= {{
                            title: "Soil Quality (%)",
                            tickmode: "linear",
                            tick0: 0,
                            dtick: 5,
                        }}
                    />
                </Card>
            </Grid>
            <Grid item width="100%" mt={4}>
                <Card
                    title="Soil Quality"
                    footer={(
                        <Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
                            <Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
                                {`🕗 updated ${minutesAgo} minutes ago`}
                            </Typography>
                        </Grid>
                    )}
                >
                    {data &&(
                        <Plot
                            scrollZoom
                            data={[
                                {
                                    x: data.map(item => item.timestamp),
                                    y: data.map(item => item.soil_quality),
                                    texts: ["One", "Two", "Three"], // Text for each data point
                                    type: "scatter", // One of: scatter, bar, pie
                                    title: "Field 1",
                                    mode: "lines", // For scatter one of: lines, markers, text and combinations (e.g. lines+markers)
                                    color: "secondary",
                                },
                            ]}
                            title="Average Soil Quality per Month"
                            // xaxis={{
                            //     tick0: 1,
                            //     dtick:1,
                            // }}
                        />
                    )}
                </Card>
            </Grid>
        </Grid>
    );
};

export default memo(AgroLab);
