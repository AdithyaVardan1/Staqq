
const s = "360ONE,AADHARHFC,AARTIDRUGS,5PAISA,20MICRONS,AARON,3IINFOLTD,AAREYDRUGS,AARTECH,3PLAND,ABB,ABCAPITAL,ACC,ABSLAMC,ABREL,ABDL,ABLBL,ABFRL,ABINFRA,ABCOTS,ADANIPORTS,ADANIPOWER,ADANIENT,ADANIENSOL,ACUTAAS,ACMESOLAR,ACI,ADFFOODS,ADOR,ADROITINFO,AEGISLOG,AFFLE,AETHER,AFCONS,AEROFLEX,AGARIND,AFSL,AEROENTER,AFIL,AERONEU,AIIL,AIAENG,AJANTPHARM,AHLUCONT,AJAXENGG,AJMERA,AIROLAM,AJOONI,AKG,AKASH,ALKEM,ALIVUS,ALKYLAMINE,ALLTIME,ALLCARGO,ALICON,ALLDIGI,AMANTA,ALMONDZ,ALPA,AMBUJACEM,ANGELONE,ANANDRATHI,ANANTRAJ,AMRUTANJAN,ANDHRAPAP,ANDHRSUGAR,AMNPLST,AMBIKCO,AMJLAND,APOLLOHOSP,APLAPOLLO,APARINDS,APOLLOTYRE,APLLTD,APOLLO,APCOTEXIND,APEX,APOLLOPIPE,APOLSINHOT";
const fs = require('fs');

async function check() {
    const data = JSON.parse(fs.readFileSync('angelone_tokens.json', 'utf8'));
    const map = new Map();
    data.forEach(item => {
        const key = `${item.exch_seg}:${item.symbol}`;
        map.set(key, item.token);
    });

    const tickers = s.split(',');
    const missed = [];
    for (const t of tickers) {
        const key = `NSE:${t}-EQ`;
        if (!map.has(key)) {
            missed.push(t);
        }
    }
    console.log('Missed Tickers:', missed);
}

check();
