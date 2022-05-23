const express = require('express')
const App = express()
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const cheerio = require('cheerio');
const axios = require('axios');
App.use(cors())
const server = http.createServer(App)
const io = new Server(server, {
    cors: {
        origin: 'http://127.0.0.1:3000',
        methods: ['GET', 'POST']
    }
})


var dolres = 0;
let timeServer = "";
let dataRevision = "";
fetchTime = async () => {

    const page = await axios.get('http://www.tgju.org');

    const $ = cheerio.load(page.data);
    dataRevision = $('html').attr('data-revision');
    let dt = $('#server-time').attr('data-server');

    let time_clock, time_clock_fn_d = 0;
    let datetime_date = dt.split(' ')[0].split('-');
    let datetime_time = dt.split(' ')[1].split(':');
    let datetime_full = new Date(Date.UTC(datetime_date[0], datetime_date[1], datetime_date[2], datetime_time[0], datetime_time[1], datetime_time[2]));
    setInterval(async function () {
        if (!time_clock_fn_d || time_clock_fn_d === 0)
            time_clock_fn_d = datetime_full;
        time_clock_fn_d.setSeconds(time_clock_fn_d.getSeconds() + 1);
        let result = time_clock_fn_d.getFullYear() + '-' + (time_clock_fn_d.getMonth() < 10 ? ('0' + time_clock_fn_d.getMonth()) : time_clock_fn_d.getMonth()) + '-' + (time_clock_fn_d.getDate() < 10 ? ('0' + time_clock_fn_d.getDate()) : time_clock_fn_d.getDate()) + ' ' + (time_clock_fn_d.getHours() < 10 ? ('0' + time_clock_fn_d.getHours()) : time_clock_fn_d.getHours()) + ':' + (time_clock_fn_d.getMinutes() < 10 ? ('0' + time_clock_fn_d.getMinutes()) : time_clock_fn_d.getMinutes()) + ':' + (time_clock_fn_d.getSeconds() < 10 ? ('0' + time_clock_fn_d.getSeconds()) : time_clock_fn_d.getSeconds());


        timeServer = result;
        // console.log(timeServer)

    }, 1000);


};


fetchApi = async () => {

    setInterval(async () => {

        if (timeServer && dataRevision) {
            timeServer = timeServer.replace(/-/g, "");
            timeServer = timeServer.replace(/:/g, "");
            timeServer = timeServer.replace(/ /g, "");

            const fetchResult = await axios.get('http://call5.tgju.org/ajax.json?' + dataRevision + "-" + timeServer + "-" + "asd");
            // console.log(fetchResult)
            // console.log("price_dollar_rl: " + fetchResult.data.current.price_dollar_rl.p);
            // console.log("crypto-usdt: " + fetchResult.data.current['crypto-tether-irr'].p);
           const price = parseFloat(fetchResult.data.current['crypto-tether-irr'].p.replace(/,/g, ''));
            dolres = price
        }

    }, 1000);

};


fetchTime();

fetchApi();

io.on('connection', (socket) => {
    console.log('user connection');
    setInterval(() => {
        socket.emit("resive_data", dolres)
    }, 3000);
})

server.listen(3100, () => {
    console.log('run server');
})