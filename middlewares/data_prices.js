const mtn_plans = [
    { plan: "500", text: "MTN Data 500MB – 30 Days", price: 190 },
    { plan: "M1024" , text: "MTN Data 1GB – 30 Days", price: 285},
    { plan: "M2024", text: "MTN Data 2GB – 30 Days", price: 500},
    { plan: "3000", text: "MTN Data 3GB – 30 Days", price: 800},
    { plan: "5000", text: "MTN Data 5GB – 30 Days", price: 1300},
    { plan: "mtn-20hrs-1500", text: "MTN Data 6GB – 7 Days", price: 1500},
    { plan: "10000", text: "MTN Data 10GB – 30 Days", price: 2800},
    { plan: "mtn-30gb-8000", text: "MTN Data 30GB – 30 Days", price: 8000},
    { plan: "mtn-40gb-10000", text: "MTN Data 40GB – 30 Days", price: 10000},
    { plan: "mtn-75gb-15000", text: "MTN Data 75GB – 30 Days", price: 15000}
];

const glo_plans = [
    { plan: "glo100x", text: "Glo Data 1GB – 5 Nights", price: 100},
    { plan: "glo200x", text: "Glo Data 1.25GB – 1 Day (Sunday)", price: 200},
    { plan: "G500", text: "Glo Data 1.35GB – 14 Days", price: 495},
    { plan: "G2000", text: "Glo Data 5.8GB – 30 Days", price: 1985},
    { plan: "G1000", text: "Glo Data 2.9GB – 30 Days", price: 995},
    { plan: "G2500", text: "Glo Data 7.7GB – 30 Days", price: 2490},
    { plan: "G3000", text: "Glo Data 10GB – 30 Days", price: 2990},
    { plan: "G4000", text: "Glo Data 13.25GB – 30 Days", price: 3950},
    { plan: "G5000", text: "Glo Data 18.25GB – 30 Days", price: 5000},
    { plan: "G8000", text: "Glo Data 29.5GB – 30 Days", price: 7900},
    { plan: "glo10000", text: "Glo Data 50GB – 30 Days", price: 10000}
];

const airtel_plans = [
    { plan: "AIRTEL500MB", text: "Airtel Data 500MB (Gift) – 30 Days", price: 200},
    { plan: "AIRTEL1GB", text: "Airtel Data 1GB (Gift) – 30 Days", price: 300},
    { plan: "AIRTEL2GB", text: "Airtel Data 2GB (Gift)– 30 Days", price: 600},
    { plan: "AIRTEL5GB", text: "Airtel Data 5GB (Gift)– 30 Days", price: 1400},
    { plan: "AIRTEL10GB", text: "Airtel Data 10GB (Gift)– 30 Days", price: 2800},
    { plan: "AIRTEL15GB", text: "Airtel Data 15GB (Gift)– 30 Days", price: 4300},
    { plan: "AIRTEL20GB", text: "Airtel Data 20GB (Gift)– 30 Days", price: 5500},
    { plan: "airt-1100", text: "Airtel Data 1.5GB – 30 Days", price: 1100},
    { plan: "airt-1300", text: "Airtel Data 2GB – 30 Days", price: 1300},
    { plan: "airt-1650", text: "Airtel Data 3GB – 30 Days", price: 1650},
    { plan: "airt-2200", text: "Airtel Data 4.5GB – 30 Days", price: 2200},
    { plan: "airt-3300", text: "Airtel Data 10GB – 30 Days", price: 3300},
    { plan: "airt-5500", text: "Airtel Data 20GB – 30 Days", price: 5500},
    { plan: "airt-11000", text: "Airtel Data 40GB – 30 Days", price: 10950},
    { plan: "airt-330x", text: "Airtel Data 1GB – 1 Day", price: 330},
    { plan: "airt-550", text: "Airtel Data 750MB – 14 Days", price: 550},
    { plan: "airt-1650-2", text: "Airtel Data 6GB – 7 Days", price: 1650}
];

const etisalat_plans = [
    { plan: "9MOB1000", text: "9mobile Data 1GB – 30 Days", price: 1000},
    { plan: "9MOB34500", text: "9mobile Data 2.5GB – 30 Days", price: 2000},
    { plan: "9MOB8000", text: "9mobile Data 11.5GB – 30 Days", price: 7980},
    { plan: "9MOB5000", text: "9mobile Data 15GB – 30 Days", price: 9950}
];

const networks = [mtn_plans, glo_plans, airtel_plans, etisalat_plans];

module.exports = networks;