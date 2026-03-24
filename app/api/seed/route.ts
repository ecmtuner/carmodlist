export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

function makeId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function makeSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).slice(2, 6)
}

type ModDef = {
  category: string; name: string; brand: string; price: number
  isTune?: boolean; tunerName?: string; tunerUrl?: string; vendorUrl?: string
}
type BuildDef = {
  username: string; title: string; year: number; make: string; model: string
  trim?: string; fuel: string; hpStock: number; hpTuned: number; mods: ModDef[]
}

export async function GET() {
  try {
    const userCount = await prisma.user.count()
    if (userCount > 5) {
      return NextResponse.json({ ok: true, message: "Already seeded", userCount })
    }

    const passwordHash = await bcrypt.hash("Demo1234!", 10)

    const usersData = [
      { username: "bmw_mike",     name: "Mike Johnson",  email: "mike@demo.carmodlist.com",  bio: "BMW enthusiast from NJ. F80 M3 owner." },
      { username: "amg_pete",     name: "Pete Williams", email: "pete@demo.carmodlist.com",  bio: "Mercedes AMG addict. Daily driver C63." },
      { username: "porsche_alex", name: "Alex Chen",     email: "alex@demo.carmodlist.com",  bio: "Porsche 911 GT3 track day regular." },
      { username: "m_power_sal",  name: "Sal Russo",     email: "sal@demo.carmodlist.com",   bio: "Built not bought. E46 M3 purist." },
      { username: "turbo_jay",    name: "Jay Kim",       email: "jay@demo.carmodlist.com",   bio: "Boost junkie. N55 is life." },
      { username: "stage2_rob",   name: "Rob Martinez",  email: "rob@demo.carmodlist.com",   bio: "ECU tuning obsessed. B58 supremacy." },
      { username: "trackday_lou", name: "Lou Ferrari",   email: "lou@demo.carmodlist.com",   bio: "Weekend warrior. Cayman GT4 on track." },
      { username: "e85_king",     name: "Danny Park",    email: "danny@demo.carmodlist.com", bio: "E85 or bust. S58 making big numbers." },
    ]

    const userIdMap: Record<string, string> = {}
    for (const u of usersData) {
      const user = await prisma.user.create({ data: { id: makeId(), ...u, password: passwordHash } })
      userIdMap[u.username] = user.id
    }
    const builds: BuildDef[] = [
      { username: "bmw_mike", title: "F80 M3 Competition Build",
        year: 2018, make: "BMW", model: "M3", trim: "Competition", fuel: "E40", hpStock: 444, hpTuned: 620,
        mods: [
          { category: "Engine",     name: "MHD Stage 2 E40 Tune",          brand: "MHD",           price: 599,  isTune: true, tunerName: "ECMTuner", tunerUrl: "https://ecmtuner.com" },
          { category: "Engine",     name: "Wagner Competition Intercooler", brand: "Wagner Tuning", price: 850,  vendorUrl: "https://wagnertuning.com" },
          { category: "Exhaust",    name: "Akrapovic Evolution Exhaust",    brand: "Akrapovic",     price: 3200, vendorUrl: "https://akrapovic.com" },
          { category: "Suspension", name: "KW V3 Coilovers",               brand: "KW Suspension", price: 2400, vendorUrl: "https://kwsuspension.com" },
          { category: "Wheels",     name: "HRE P101 19in Wheels",          brand: "HRE",           price: 4800 },
          { category: "Brakes",     name: "Brembo GT Big Brake Kit",       brand: "Brembo",        price: 3100, vendorUrl: "https://brembo.com" },
        ] },
      { username: "amg_pete", title: "C63 AMG S Daily Beast",
        year: 2020, make: "Mercedes", model: "C63 AMG S", trim: "AMG S", fuel: "Pump", hpStock: 503, hpTuned: 680,
        mods: [
          { category: "Engine",     name: "RENNtech ECU Flash Stage 2",   brand: "RENNtech",  price: 1200, isTune: true, tunerName: "ECMTuner", tunerUrl: "https://ecmtuner.com" },
          { category: "Exhaust",    name: "Weistec W.3 Exhaust System",   brand: "Weistec",   price: 2800 },
          { category: "Suspension", name: "Bilstein B16 PSS10 Coilovers", brand: "Bilstein",  price: 1800 },
          { category: "Engine",     name: "Eventuri Carbon Intake",       brand: "Eventuri",  price: 950,  vendorUrl: "https://eventuri.net" },
          { category: "Wheels",     name: "Vossen HF-2 20in Wheels",      brand: "Vossen",    price: 3600 },
        ] },
      { username: "porsche_alex", title: "GT3 Track Weapon",
        year: 2022, make: "Porsche", model: "911 GT3", fuel: "Pump", hpStock: 502, hpTuned: 502,
        mods: [
          { category: "Suspension", name: "Ohlins TTX36 Track Suspension",     brand: "Ohlins",      price: 5200 },
          { category: "Brakes",     name: "Pagid RSL1 Track Brake Pads",       brand: "Pagid",       price: 420,  vendorUrl: "https://pagid.com" },
          { category: "Wheels",     name: "Forgeline GA1R Center Lock Wheels", brand: "Forgeline",   price: 6800 },
          { category: "Interior",   name: "Sabelt GT-600 Race Seat",           brand: "Sabelt",      price: 1800 },
          { category: "Exterior",   name: "OEM GT3 RS Wing Upgrade",           brand: "Porsche OEM", price: 3200 },
        ] },
      { username: "m_power_sal", title: "E46 M3 Resto-Mod",
        year: 2003, make: "BMW", model: "M3", trim: "E46", fuel: "E30", hpStock: 333, hpTuned: 410,
        mods: [
          { category: "Engine",     name: "Turner Motorsport Stage 2 Tune", brand: "Turner Motorsport", price: 450,  isTune: true, tunerName: "ECMTuner", tunerUrl: "https://ecmtuner.com" },
          { category: "Engine",     name: "Dinan Cold Air Intake",          brand: "Dinan",             price: 480,  vendorUrl: "https://dinancars.com" },
          { category: "Suspension", name: "Vorshlag E46 Camber Plates",     brand: "Vorshlag",          price: 380 },
          { category: "Brakes",     name: "StopTech Trophy Sport Brake Kit",brand: "StopTech",          price: 1600 },
          { category: "Wheels",     name: "BBS CH-R 18in Gunmetal",         brand: "BBS",               price: 2800 },
          { category: "Exhaust",    name: "Supersprint Race Headers",       brand: "Supersprint",       price: 1900 },
        ] },
      { username: "turbo_jay", title: "135i N55 Sleeper",
        year: 2013, make: "BMW", model: "135i", fuel: "E30", hpStock: 300, hpTuned: 480,
        mods: [
          { category: "Engine",     name: "BM3 Stage 2 E30 Map",              brand: "Bootmod3",           price: 450, isTune: true, tunerName: "ECMTuner", tunerUrl: "https://ecmtuner.com" },
          { category: "Engine",     name: "Burger Motorsports JB4 Piggyback", brand: "Burger Motorsports", price: 499 },
          { category: "Engine",     name: "VRSF Intercooler Upgrade",         brand: "VRSF",               price: 580, vendorUrl: "https://vrsf.co" },
          { category: "Exhaust",    name: "Supersprint N55 Downpipe",         brand: "Supersprint",        price: 780 },
          { category: "Suspension", name: "ST XTA Coilovers",                 brand: "ST Suspensions",     price: 1200 },
        ] },
      { username: "stage2_rob", title: "G80 M3 Street/Track",
        year: 2022, make: "BMW", model: "M3", trim: "Competition", fuel: "E40", hpStock: 503, hpTuned: 750,
        mods: [
          { category: "Engine",     name: "MHD E40 Stage 2 Tune",         brand: "MHD",           price: 699,  isTune: true, tunerName: "ECMTuner", tunerUrl: "https://ecmtuner.com" },
          { category: "Engine",     name: "Wagner EVO2 Intercooler",       brand: "Wagner Tuning", price: 1100 },
          { category: "Engine",     name: "Eventuri Carbon Intake System", brand: "Eventuri",      price: 1250 },
          { category: "Exhaust",    name: "MTEK Downpipes",               brand: "MTEK",          price: 1400 },
          { category: "Wheels",     name: "Apex SM-10 20in Satin Black",  brand: "Apex Wheels",   price: 2800 },
          { category: "Suspension", name: "KW V4 Clubsport",              brand: "KW Suspension", price: 4200 },
        ] },
      { username: "trackday_lou", title: "Cayman GT4 Track Build",
        year: 2021, make: "Porsche", model: "Cayman GT4", fuel: "Pump", hpStock: 414, hpTuned: 440,
        mods: [
          { category: "Engine",     name: "Cobb Accessport Tune",           brand: "Cobb Tuning", price: 699,  isTune: true },
          { category: "Exhaust",    name: "Akrapovic Slip-On Race",         brand: "Akrapovic",   price: 4200 },
          { category: "Suspension", name: "Ohlins Road and Track",          brand: "Ohlins",      price: 3800 },
          { category: "Brakes",     name: "Brembo GT-R Big Brake Kit",      brand: "Brembo",      price: 4200 },
          { category: "Wheels",     name: "Forgeline GS1R 20in Centre Lock",brand: "Forgeline",   price: 7200 },
          { category: "Interior",   name: "Recaro Pole Position Seat",      brand: "Recaro",      price: 2100 },
        ] },
      { username: "e85_king", title: "G82 M4 Competition E85",
        year: 2023, make: "BMW", model: "M4", trim: "Competition", fuel: "E85", hpStock: 503, hpTuned: 820,
        mods: [
          { category: "Engine",     name: "Pure Stage 2 Turbos",            brand: "Pure Turbos",   price: 3800, vendorUrl: "https://pureturbos.com" },
          { category: "Engine",     name: "MHD E85 Full Send Tune",         brand: "MHD",           price: 699,  isTune: true, tunerName: "ECMTuner", tunerUrl: "https://ecmtuner.com" },
          { category: "Engine",     name: "Wagner EVO2 Intercooler",        brand: "Wagner Tuning", price: 1100 },
          { category: "Engine",     name: "Fuel-It Stage 3 Port Injection", brand: "Fuel-It",       price: 1800 },
          { category: "Exhaust",    name: "Capristo Exhaust System",        brand: "Capristo",      price: 5200 },
          { category: "Wheels",     name: "HRE FF15 20in Brushed Dark",     brand: "HRE",           price: 5800 },
          { category: "Suspension", name: "KW V4 Clubsport",                brand: "KW Suspension", price: 4200 },
        ] },
      { username: "bmw_mike", title: "M340i Weekend Toy",
        year: 2021, make: "BMW", model: "M340i", fuel: "E30", hpStock: 382, hpTuned: 520,
        mods: [
          { category: "Engine",     name: "MHD Stage 2 E30 Tune",          brand: "MHD",           price: 499, isTune: true, tunerName: "ECMTuner", tunerUrl: "https://ecmtuner.com" },
          { category: "Engine",     name: "VRSF Chargepipe Upgrade",       brand: "VRSF",          price: 180 },
          { category: "Exhaust",    name: "Remus Sport Exhaust",            brand: "Remus",         price: 1600 },
          { category: "Wheels",     name: "BBS CI-R 19in Brilliant Silver", brand: "BBS",           price: 3200 },
          { category: "Suspension", name: "Bilstein B12 Pro-Kit",           brand: "Bilstein",      price: 680 },
        ] },
      { username: "amg_pete", title: "E63 AMG S Wagon",
        year: 2017, make: "Mercedes", model: "E63 AMG S", trim: "Wagon", fuel: "Pump", hpStock: 603, hpTuned: 780,
        mods: [
          { category: "Engine",     name: "Weistec Stage 3 Tune",         brand: "Weistec",       price: 2400, isTune: true, tunerName: "ECMTuner", tunerUrl: "https://ecmtuner.com" },
          { category: "Engine",     name: "Weistec Supercharger Pulley",  brand: "Weistec",       price: 1800 },
          { category: "Exhaust",    name: "Capristo Full Exhaust",        brand: "Capristo",      price: 6800 },
          { category: "Suspension", name: "KW V3 Coilovers",              brand: "KW Suspension", price: 2600 },
          { category: "Wheels",     name: "Vossen M-X2 21in",             brand: "Vossen",        price: 4200 },
        ] },
      { username: "turbo_jay", title: "340i Daily Driver",
        year: 2019, make: "BMW", model: "340i", fuel: "E30", hpStock: 326, hpTuned: 450,
        mods: [
          { category: "Engine",  name: "BM3 Stage 1 E30",           brand: "Bootmod3",  price: 350, isTune: true },
          { category: "Engine",  name: "aFe Momentum Intake",        brand: "aFe Power", price: 320 },
          { category: "Exhaust", name: "Borla ATAK Catback",         brand: "Borla",     price: 1100 },
          { category: "Wheels",  name: "Enkei RPF1 18in Matte Black",brand: "Enkei",    price: 1200 },
        ] },
      { username: "m_power_sal", title: "E90 M3 Track Car",
        year: 2010, make: "BMW", model: "M3", trim: "E90", fuel: "Pump", hpStock: 414, hpTuned: 440,
        mods: [
          { category: "Engine",     name: "Active Autowerke AA Tune",   brand: "Active Autowerke", price: 600,  isTune: true },
          { category: "Suspension", name: "BC Racing BR Coilovers",     brand: "BC Racing",        price: 1100 },
          { category: "Brakes",     name: "StopTech Big Brake Kit",     brand: "StopTech",         price: 2200 },
          { category: "Wheels",     name: "Apex ARC-8 18in Anthracite", brand: "Apex Wheels",      price: 2400 },
          { category: "Exhaust",    name: "Eisenmann Race Exhaust",     brand: "Eisenmann",        price: 2100 },
        ] },
      { username: "stage2_rob", title: "Supra GR A90 Build",
        year: 2021, make: "Toyota", model: "Supra GR", fuel: "E30", hpStock: 382, hpTuned: 550,
        mods: [
          { category: "Engine",     name: "JB4 + BM3 E30 Tune",               brand: "Bootmod3",        price: 800, isTune: true },
          { category: "Engine",     name: "Mishimoto Performance Intercooler", brand: "Mishimoto",       price: 620 },
          { category: "Exhaust",    name: "ARK Performance Exhaust",           brand: "ARK Performance", price: 1400 },
          { category: "Suspension", name: "KW V3 Coilovers",                  brand: "KW Suspension",   price: 2200 },
          { category: "Wheels",     name: "Gram Lights 57CR 19in",            brand: "Gram Lights",     price: 1800 },
        ] },
      { username: "porsche_alex", title: "718 Cayman S Track Prep",
        year: 2019, make: "Porsche", model: "718 Cayman S", fuel: "Pump", hpStock: 350, hpTuned: 420,
        mods: [
          { category: "Engine",     name: "Cobb Accessport Stage 1 Tune", brand: "Cobb Tuning",   price: 699, isTune: true },
          { category: "Suspension", name: "KW V3 Coilovers",              brand: "KW Suspension", price: 2400 },
          { category: "Wheels",     name: "BBS CI-R 20in Matte Black",    brand: "BBS",           price: 3600 },
          { category: "Exhaust",    name: "Akrapovic Slip-On Titanium",   brand: "Akrapovic",     price: 3800 },
          { category: "Brakes",     name: "Pagid RST3 Street Pads",       brand: "Pagid",         price: 380 },
        ] },
      { username: "e85_king", title: "M2 Competition E40 Build",
        year: 2020, make: "BMW", model: "M2 Competition", fuel: "E40", hpStock: 405, hpTuned: 580,
        mods: [
          { category: "Engine",     name: "MHD Stage 2 E40 Tune",       brand: "MHD",           price: 599, isTune: true, tunerName: "ECMTuner", tunerUrl: "https://ecmtuner.com" },
          { category: "Engine",     name: "Wagner Competition FMIC",     brand: "Wagner Tuning", price: 850 },
          { category: "Exhaust",    name: "Akrapovic Evolution Line",    brand: "Akrapovic",     price: 3600 },
          { category: "Suspension", name: "KW V3 Coilovers",             brand: "KW Suspension", price: 2400 },
          { category: "Wheels",     name: "Apex SM-10 18in Gloss Black", brand: "Apex Wheels",   price: 2200 },
        ] },
      { username: "bmw_mike", title: "M235i N55 Quick Build",
        year: 2016, make: "BMW", model: "M235i", fuel: "E30", hpStock: 322, hpTuned: 440,
        mods: [
          { category: "Engine",     name: "BM3 Stage 2 E30 Tune",         brand: "Bootmod3",    price: 450, isTune: true, tunerName: "ECMTuner", tunerUrl: "https://ecmtuner.com" },
          { category: "Engine",     name: "VRSF Front Mount Intercooler", brand: "VRSF",        price: 650, vendorUrl: "https://vrsf.co" },
          { category: "Exhaust",    name: "Supersprint Downpipe",         brand: "Supersprint", price: 820 },
          { category: "Suspension", name: "Bilstein B14 Coilovers",       brand: "Bilstein",    price: 1300 },
        ] },
      { username: "amg_pete", title: "A45 AMG Pocket Rocket",
        year: 2019, make: "Mercedes", model: "A45 AMG", fuel: "Pump", hpStock: 381, hpTuned: 480,
        mods: [
          { category: "Engine",     name: "RENNtech ECU Flash Stage 1+", brand: "RENNtech",      price: 1100, isTune: true, tunerName: "ECMTuner", tunerUrl: "https://ecmtuner.com" },
          { category: "Engine",     name: "Eventuri Black Carbon Intake", brand: "Eventuri",      price: 1050, vendorUrl: "https://eventuri.net" },
          { category: "Exhaust",    name: "Remus Sport Exhaust",          brand: "Remus",         price: 1400 },
          { category: "Suspension", name: "KW V1 Coilovers",              brand: "KW Suspension", price: 1600 },
        ] },
      { username: "trackday_lou", title: "992 Carrera S Touring Build",
        year: 2020, make: "Porsche", model: "911 Carrera S", fuel: "Pump", hpStock: 443, hpTuned: 520,
        mods: [
          { category: "Engine",     name: "Cobb Accessport Stage 2 Tune",  brand: "Cobb Tuning", price: 699,  isTune: true },
          { category: "Exhaust",    name: "Akrapovic Slip-On Race System",  brand: "Akrapovic",   price: 4600 },
          { category: "Suspension", name: "Ohlins Road and Track Coilovers",brand: "Ohlins",      price: 4200 },
          { category: "Wheels",     name: "BBS CH-R 20in Satin Platinum",   brand: "BBS",         price: 4200 },
        ] },
      { username: "turbo_jay", title: "M240i B58 Street Fighter",
        year: 2022, make: "BMW", model: "M240i", fuel: "E30", hpStock: 382, hpTuned: 500,
        mods: [
          { category: "Engine",     name: "MHD Stage 2 E30 Tune",            brand: "MHD",           price: 499, isTune: true, tunerName: "ECMTuner", tunerUrl: "https://ecmtuner.com" },
          { category: "Engine",     name: "VRSF Chargepipe Kit",             brand: "VRSF",          price: 200 },
          { category: "Wheels",     name: "BBS CI-R 19in Brilliant Silver",  brand: "BBS",           price: 3200 },
          { category: "Suspension", name: "KW V1 Coilovers",                 brand: "KW Suspension", price: 1600 },
          { category: "Exhaust",    name: "Supersprint Valvetronic Catback", brand: "Supersprint",   price: 2100 },
        ] },
      { username: "m_power_sal", title: "F82 M4 S55 Track Beast",
        year: 2015, make: "BMW", model: "M4", fuel: "E40", hpStock: 425, hpTuned: 600,
        mods: [
          { category: "Engine",     name: "BM3 Stage 2 E40 Tune",          brand: "Bootmod3",      price: 450, isTune: true, tunerName: "ECMTuner", tunerUrl: "https://ecmtuner.com" },
          { category: "Engine",     name: "Wagner Competition Intercooler", brand: "Wagner Tuning", price: 850 },
          { category: "Suspension", name: "KW V3 Coilovers",               brand: "KW Suspension", price: 2400 },
          { category: "Exhaust",    name: "Akrapovic Slip-On Titanium",    brand: "Akrapovic",     price: 3400 },
          { category: "Wheels",     name: "Apex Arc-8 19in Anthracite",    brand: "Apex Wheels",   price: 2400 },
        ] },
      { username: "stage2_rob", title: "M5 Competition Stage 3 Monster",
        year: 2021, make: "BMW", model: "M5 Competition", fuel: "E40", hpStock: 617, hpTuned: 800,
        mods: [
          { category: "Engine",     name: "MHD Stage 3 E40 Tune",         brand: "MHD",           price: 799,  isTune: true, tunerName: "ECMTuner", tunerUrl: "https://ecmtuner.com" },
          { category: "Engine",     name: "Pure Stage 2 Turbos",          brand: "Pure Turbos",   price: 4200, vendorUrl: "https://pureturbos.com" },
          { category: "Exhaust",    name: "Capristo Full Exhaust System", brand: "Capristo",      price: 5800 },
          { category: "Suspension", name: "KW V3 Coilovers",              brand: "KW Suspension", price: 2600 },
          { category: "Wheels",     name: "HRE P200 21in Brushed Clear",  brand: "HRE",           price: 6200 },
        ] },
      { username: "e85_king", title: "F80 M3 E85 Full Build",
        year: 2018, make: "BMW", model: "M3", trim: "Competition", fuel: "E85", hpStock: 444, hpTuned: 700,
        mods: [
          { category: "Engine",     name: "Fuel-It Stage 3 Port Injection", brand: "Fuel-It",       price: 1800 },
          { category: "Engine",     name: "MHD E85 Stage 3 Tune",           brand: "MHD",           price: 699, isTune: true, tunerName: "ECMTuner", tunerUrl: "https://ecmtuner.com" },
          { category: "Engine",     name: "Wagner Competition Intercooler",  brand: "Wagner Tuning", price: 850 },
          { category: "Exhaust",    name: "Akrapovic Evolution Exhaust",     brand: "Akrapovic",     price: 3200 },
          { category: "Suspension", name: "KW V3 Coilovers",                brand: "KW Suspension", price: 2400 },
        ] },
      { username: "porsche_alex", title: "911 GT3 RS Daily Track",
        year: 2023, make: "Porsche", model: "911 GT3 RS", fuel: "Pump", hpStock: 518, hpTuned: 518,
        mods: [
          { category: "Suspension", name: "Ohlins TTX36 Track Suspension",     brand: "Ohlins",    price: 5200 },
          { category: "Brakes",     name: "Pagid RSL29 Racing Brake Pads",     brand: "Pagid",     price: 580, vendorUrl: "https://pagid.com" },
          { category: "Wheels",     name: "Forgeline GE1R Center Lock",        brand: "Forgeline", price: 7800 },
          { category: "Exhaust",    name: "Akrapovic Titanium Slip-On Race",   brand: "Akrapovic", price: 5200 },
        ] },
      { username: "bmw_mike", title: "X5M E40 Sleeper SUV",
        year: 2019, make: "BMW", model: "X5M", fuel: "E40", hpStock: 600, hpTuned: 780,
        mods: [
          { category: "Engine",     name: "MHD Stage 2 E40 Tune",          brand: "MHD",           price: 699,  isTune: true, tunerName: "ECMTuner", tunerUrl: "https://ecmtuner.com" },
          { category: "Engine",     name: "Wagner EVO2 Intercooler",        brand: "Wagner Tuning", price: 1100 },
          { category: "Exhaust",    name: "Akrapovic Slip-On Exhaust",      brand: "Akrapovic",     price: 4800 },
          { category: "Suspension", name: "KW HLS 4 Hydraulic Lift System", brand: "KW Suspension", price: 3200 },
          { category: "Wheels",     name: "HRE S201H 22in Brushed Dark",    brand: "HRE",           price: 6400 },
        ] },
      { username: "amg_pete", title: "GLE63 AMG S Family Hauler",
        year: 2021, make: "Mercedes", model: "GLE63 AMG S", fuel: "Pump", hpStock: 603, hpTuned: 750,
        mods: [
          { category: "Engine",     name: "Weistec Stage 2 Tune",          brand: "Weistec",       price: 2200, isTune: true, tunerName: "ECMTuner", tunerUrl: "https://ecmtuner.com" },
          { category: "Exhaust",    name: "Capristo Exhaust System",       brand: "Capristo",      price: 5200 },
          { category: "Suspension", name: "KW V3 Coilovers",              brand: "KW Suspension", price: 2800 },
          { category: "Wheels",     name: "Vossen HF-7 22in Gloss Black",  brand: "Vossen",        price: 4800 },
        ] },
    ]
    // Insert builds and mods
    let totalBuilds = 0
    let totalMods = 0

    for (const b of builds) {
      const userId = userIdMap[b.username]
      if (!userId) continue

      const totalCost = b.mods.reduce((sum, m) => sum + m.price, 0)

      const build = await prisma.build.create({
        data: {
          id: makeId(),
          userId,
          slug: makeSlug(b.title),
          title: b.title,
          year: b.year,
          make: b.make,
          model: b.model,
          trim: b.trim,
          fuel: b.fuel,
          hpStock: b.hpStock,
          hpTuned: b.hpTuned,
          isPublic: true,
          totalCost,
        },
      })
      totalBuilds++

      for (const m of b.mods) {
        await prisma.mod.create({
          data: {
            id: makeId(),
            buildId: build.id,
            category: m.category,
            name: m.name,
            brand: m.brand,
            price: m.price,
            isTune: m.isTune ?? false,
            tunerName: m.tunerName,
            tunerUrl: m.tunerUrl,
            vendorUrl: m.vendorUrl,
          },
        })
        totalMods++
      }
    }

    return NextResponse.json({
      ok: true,
      message: "Seeded successfully",
      usersCreated: Object.keys(userIdMap).length,
      buildsCreated: totalBuilds,
      modsCreated: totalMods,
    })
  } catch (error: any) {
    console.error("Seed error:", error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}
