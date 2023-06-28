const dstv_plans = [
    { plan: "dstv-padi", text: "DStv Padi", price: 2500 },
    { plan: "dstv-yanga" , text: "DStv Yanga", price: 3500},
    { plan: "dstv-confam", text: "DStv Confam", price: 6200},
    { plan: "dstv6", text: "DStv Asian", price: 8300},
    { plan: "dstv79", text: "DStv Compact", price: 10500},
    { plan: "dstv7", text: "DStv Compact Plus", price: 16600},
    { plan: "dstv3", text: "DStv Premium", price: 24500},
    { plan: "dstv10", text: "DStv Premium Asia", price: 27500},
    { plan: "dstv9", text: "DStv Premium-French", price: 36600},
    { plan: "confam-extra", text: "DStv Confam + ExtraView", price: 9600},
    { plan: "yanga-extra", text: "DStv Yanga + ExtraView", price: 6900},
    { plan: "padi-extra", text: "DStv Padi + ExtraView", price: 5900},
    { plan: "com-asia", text: "DStv Compact + Asia", price: 18800},
    { plan: "dstv30", text: "DStv Compact + Extra View", price: 13900},
    { plan: "com-frenchtouch", text: "DStv Compact + French Touch", price: 13800},
    { plan: "dstv33", text: "DStv Premium – Extra View", price: 27900},
    { plan: "dstv40", text: "DStv Compact Plus – Asia", price: 24900},
    { plan: "com-frenchtouch-extra", text: "DStv Compact + French Touch + ExtraView", price: 17200},
    { plan: "com-asia-extra", text: "DStv Compact + Asia + ExtraView", price: 22200},
    { plan: "dstv43", text: "DStv Compact Plus + French Plus", price: 28200},
    { plan: "complus-frenchtouch", text: "DStv Compact Plus + French Touch", price: 19900},
    { plan: "dstv45", text: "DStv Compact Plus – Extra View", price: 20000},
    { plan: "complus-french-extraview", text: "DStv Compact Plus + FrenchPlus + Extra View", price: 31600},
    { plan: "dstv47", text: "DStv Compact + French Plus", price: 22100},
    { plan: "dstv48", text: "DStv Compact Plus + Asia + ExtraView", price: 28300},
    { plan: "dstv61", text: "DStv Premium + Asia + Extra View", price: 36200},
    { plan: "dstv62", text: "DStv Premium + French + Extra View", price: 33050},
    { plan: "hdpvr-access-service", text: "DStv HDPVR Access Service", price: 2900},
    { plan: "frenchplus-addon", text: "DStv French Plus Add-on", price: 11600},
    { plan: "asia-addon", text: "DStv Asian Add-on", price: 8300},
    { plan: "frenchtouch-addon", text: "DStv French Touch Add-on", price: 3300},
    { plan: "extraview-access", text: "DStv ExtraView Access", price: 3400},
    { plan: "french11", text: "DStv French 11", price: 5150}
];

const gotv_plans = [
    { plan: "gotv-smallie", text: "GOtv Smallie", price: 1100 },
    { plan: "gotv-jinja", text: "GOtv Jinja", price: 2250 },
    { plan: "gotv-jolli", text: "GOtv Jolli", price: 3300 },
    { plan: "gotv-max", text: "GOtv Max", price: 4850 },
    { plan: "gotv-supa", text: "GOtv Supa", price: 6400 },
];

const startimes_plans = [
    { plan: "nova", text: "Startimes Nova", price: 1200 },
    { plan: "basic", text: "Startimes Basic", price: 2100 },
    { plan: "smart", text: "Startimes Smart", price: 2800 },
    { plan: "classic", text: "Startimes Classic", price: 3100 },
    { plan: "super", text: "Startimes Super", price: 5300 },
]

const cables = [dstv_plans, gotv_plans, startimes_plans];

module.exports = cables;