import { Grid, Typography } from "@mui/material";
import { memo, useState, useRef } from "react";

import { PrimaryBackgroundButton } from "../components/Buttons.js";
import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import Form from "../components/Form.js";
import colors from "../_colors.scss";

// import { CollectionDataManagement } from 'eco-ready-services.js';

const AgroLab = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    //Get Data
    // useEffect(() => {
    //     const organization = 'living_lab_agro';
    //     const project = 'irrigation';
    //     const collection = 'sensors_data';
    //     const accessKey = '******';

    //     const getData = async (organization, project, collection, accessKey) => {
    //         try {
    //             const data = await CollectionDataManagement.getData(organization, project, collection, accessKey);
    //             return data;
    //         } catch (error) {
    //             console.error('Error fetching data:', error);
    //             throw error;
    //         };
    //     };
    //     getData(organization, project, collection, accessKey);
    // }, []);
        
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
                { value: "Week", label: "Week" },
                { value: "Month", label: "Month" },
                { value: "Year", label: "Year" },
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

    return (
        <Grid container display="flex" direction="row" justifyContent="space-around" spacing={2}>
            <Grid item xs={7} md={4} alignItems="center" flexDirection="column">
                <Card
                    title="Annual Crop Yield"
                    footer={(
                        <Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
                            <Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
                                {"🕗 updated 4 min ago"}
                            </Typography>
                        </Grid>
                    )}
                >
                    <Typography variant="h4" component="h4" align="center" sx={{ fontWeight: "bold" }}>
                        {`${((Math.random() * 5) + 2).toFixed(2)} T`}
                        <Typography variant="body2" component="p" sx={{ fontSize: "0.6em" }}>
                            <span style={{ color: colors.secondary }}>6%</span> increase from {year - 1}
                        </Typography>
                    </Typography>
                </Card>
            </Grid>
            <Grid item xs={7} md={4} alignItems="center" flexDirection="column">
                <Card
                    title="Monthly Irrigation"
                    footer={(
                        <Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
                            <Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
                                {"🕗 updated 4 min ago"}
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
            <Grid item xs={7} md={4} alignItems="center" flexDirection="column">
                <Card
                    title="Temperature"
                    footer={(
                        <Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
                            <Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
                                {"🕗 updated 4 min ago"}
                            </Typography>
                        </Grid>
                    )}
                >
                    <Typography variant="h4" component="h4" align="center" sx={{ fontWeight: "bold" }}>
                        {`${Math.floor(Math.random() * 10) + 20}°C`}
                        <Typography variant="body2" component="p" sx={{ fontSize: "0.6em" }}>
                            <span style={{ color: colors.warning }}>Sunny</span> <span style={{ color: colors.third }}>skies</span> at your area
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
                                {"🕗 updated 4 min ago"}
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
                    />
                </Card>
            </Grid>                        
            <Grid item xs={12} md={4} alignItems="center" flexDirection="column" mt={4}>
                <Card
                    title="Soil Moisture"
                    footer={(
                        <Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
                            <Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
                                {"🕗 updated 4 min ago"}
                            </Typography>
                        </Grid>
                    )}
                >
                    <Plot
                        scrollZoom
                        data={[
                            {
                                x: Array.from({ length: 24 }, (_, i) => i + 1), // Generate a range of values for the number of days in the current month
                                y: generateRandomNumbers(24, 0, 100),
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
                    />
                </Card>
            </Grid>
            <Grid item xs={12} md={4} alignItems="center" flexDirection="column" mt={4}>
                <Card
                    title="Daily Humidity"
                    footer={(
                        <Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
                            <Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
                                {"🕗 updated 4 min ago"}
                            </Typography>
                        </Grid>
                    )}
                >
                    <Plot
                        scrollZoom
                        data={[
                            {
                                x: Array.from({ length: 24 }, (_, i) => i + 1), // Generate a range of values for the number of days in the current month
                                y: generateRandomNumbers(24, 0, 90), // Example y values
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
                    />
                </Card>
            </Grid>
            <Grid item xs={12} md={12} mt={4}>
                <Card
                    title="Annual Yield Per Field"
                    footer={(
                        <Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
                            <Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
                                {"🕗 updated 4 min ago"}
                            </Typography>
                        </Grid>
                    )}
                >
                    <Plot
                        showLegend
                        scrollZoom
                        data={[
                            {
                                labels: Array.from({ length: 4 }, (_, i) => `field ${i + 1}`), // Generate labels from "field 1" to "field 10"
                                values: generateRandomPercentages(10),
                                type: "pie",
                                title: "pie",
                            },
                        ]}
                       
                    />
                </Card>
            </Grid>
            <Grid item xs={12} md={6} mt={4}>
                <Card
                    title="Seasonal Temperature Distribution"
                    footer={(
                        <Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
                            <Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
                                {"🕗 updated 4 min ago"}
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
            <Grid item xs={12} md={6} mt={4}>
                <Card
                    title="Precipitation"
                    footer={(
                        <Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
                            <Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
                                {"🕗 updated 4 min ago"}
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
                                title="Average Percipitation per Week"
                            />
                        </Grid>
                        <Grid
                            item
                            md={7}
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                right: -85,
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
                                {"🕗 updated 4 min ago"}
                            </Typography>
                        </Grid>
                    )}
                >
                    <Plot
                        scrollZoom
                        data={[
                            {
                                x: Array.from({ length: monthsInYear }, (_, i) => i + 1),
                                y: generateRandomNumbers(monthsInYear),
                                texts: ["One", "Two", "Three"], // Text for each data point
                                type: "scatter", // One of: scatter, bar, pie
                                title: "Field 1",
                                mode: "lines", // For scatter one of: lines, markers, text and combinations (e.g. lines+markers)
                                color: "primary",
                            },
                            {
                                x: Array.from({ length: monthsInYear }, (_, i) => i + 1),
                                y: generateRandomNumbers(monthsInYear),
                                type: "scatter", // One of: scatter, bar, pie
                                title: "Field 2",
                                mode: "lines", // For scatter one of: lines, markers, text and combinations (e.g. lines+markers)
                                color: "secondary",
                            },
                            {
                                x: Array.from({ length: monthsInYear }, (_, i) => i + 1),
                                y: generateRandomNumbers(monthsInYear),
                                type: "scatter", // One of: scatter, bar, pie
                                title: "FIeld 3",
                                mode: "lines", // For scatter one of: lines, markers, text and combinations (e.g. lines+markers)
                                color: "third",
                            },
                        ]}
                        title="Average Soil Quality per Month"
                    />
                </Card>
            </Grid>
        </Grid>
    );
};

export default memo(AgroLab);
