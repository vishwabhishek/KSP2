export interface DistrictReference {
  division: string;
  headquarters: string;
  region: string;
  portal: string;
  info: string;
}

export const districtReferenceData: Record<string, DistrictReference> = {
  "Bagalkot": {
    division: "Belagavi Division",
    headquarters: "Bagalkot",
    region: "Upper Karnataka (North)",
    portal: "https://bagalkot.nic.in",
    info: "Famous for historical monuments at Badami, Aihole, and Pattadakal. Contains 6 talukas, with SP Office located at Bagalkot."
  },
  "Ballari": {
    division: "Kalaburagi Division",
    headquarters: "Ballari",
    region: "Upper Karnataka (East)",
    portal: "https://ballari.nic.in",
    info: "Rich in iron ore deposits. Home to the UNESCO World Heritage site Hampi. SP Office at Ballari."
  },
  "Belagavi City": {
    division: "Belagavi Division",
    headquarters: "Belagavi",
    region: "Upper Karnataka (North-West)",
    portal: "https://belagavicitypolice.in",
    info: "Police Commissionerate jurisdiction covering the urban limits of Belagavi City. Commissioned to manage urban safety."
  },
  "Belagavi District": {
    division: "Belagavi Division",
    headquarters: "Belagavi",
    region: "Upper Karnataka (North-West)",
    portal: "https://belagavi.nic.in",
    info: "Bordering Maharashtra and Goa. Contains major sugarcane production centers. District police bounds exclude the City limits."
  },
  "Bengaluru City": {
    division: "Bengaluru Division",
    headquarters: "Bengaluru",
    region: "Lower Karnataka (South)",
    portal: "https://bengalurucitypolice.gov.in",
    info: "The capital commissionerate of Karnataka. Capital city police jurisdiction administering 100+ stations."
  },
  "Bengaluru District": {
    division: "Bengaluru Division",
    headquarters: "Bengaluru",
    region: "Lower Karnataka (South)",
    portal: "https://bangalorerural.nic.in",
    info: "Consists of 4 talukas: Devanahalli, Doddaballapura, Hosakote, and Nelamangala. Surrounds the urban core."
  },
  "Bidar": {
    division: "Kalaburagi Division",
    headquarters: "Bidar",
    region: "Upper Karnataka (North-Eastern)",
    portal: "https://bidar.nic.in",
    info: "Known for the Bidar Fort and Bidriware handicrafts. The northernmost district of Karnataka."
  },
  "Chamarajnagar": {
    division: "Mysuru Division",
    headquarters: "Chamarajanagar",
    region: "Lower Karnataka (South)",
    portal: "https://chamarajanagar.nic.in",
    info: "Famous for forest reserves like Bandipur National Park. Southernmost district of the state."
  },
  "Chikkaballapura": {
    division: "Bengaluru Division",
    headquarters: "Chikkaballapura",
    region: "Lower Karnataka (South)",
    portal: "https://chikkaballapur.nic.in",
    info: "Known for Nandi Hills. Carved out of Kolar District in 2007. Includes Muddenahalli, birthplace of Sir M. Visvesvaraya."
  },
  "Chikkamagaluru": {
    division: "Mysuru Division",
    headquarters: "Chikkamagaluru",
    region: "Central Karnataka (Western Ghats)",
    portal: "https://chikkamagaluru.nic.in",
    info: "The birthplace of coffee in India. Baba Budangiri hills located here. Rich biodiversity region."
  },
  "Chitradurga": {
    division: "Bengaluru Division",
    headquarters: "Chitradurga",
    region: "Central Karnataka",
    portal: "https://chitradurga.nic.in",
    info: "Famous for Chitradurga Fort (Kallina Kote - stone fortress). Semi-arid district with rich iron ore."
  },
  "Dakshina Kannada": {
    division: "Mysuru Division",
    headquarters: "Mangaluru",
    region: "Coastal Karnataka",
    portal: "https://dk.nic.in",
    info: "Coastal district bounded by Western Ghats and Arabian Sea. Educational and financial hub."
  },
  "Davanagere": {
    division: "Bengaluru Division",
    headquarters: "Davanagere",
    region: "Central Karnataka",
    portal: "https://davanagere.nic.in",
    info: "Major cotton textile hub, often called the Manchester of Karnataka. Famous for Davanagere Benne Dosa."
  },
  "Dharwad": {
    division: "Belagavi Division",
    headquarters: "Dharwad",
    region: "Upper Karnataka",
    portal: "https://dharwad.nic.in",
    info: "Cultural and educational center of North Karnataka. Known for Dharwad Pedha sweet."
  },
  "Gadag": {
    division: "Belagavi Division",
    headquarters: "Gadag-Betageri",
    region: "Upper Karnataka",
    portal: "https://gadag.nic.in",
    info: "Known for print presses and cooperative movement. Features Western Chalukyan temples."
  },
  "Hassan": {
    division: "Mysuru Division",
    headquarters: "Hassan",
    region: "Lower Karnataka (Western)",
    portal: "https://hassan.nic.in",
    info: "Famous for Hoysala architecture in Belur and Halebidu, and Gommateshwara statue in Shravanabelagola."
  },
  "Haveri": {
    division: "Belagavi Division",
    headquarters: "Haveri",
    region: "Upper Karnataka",
    portal: "https://haveri.nic.in",
    info: "Famous for Byadgi Chillies and Cardamom garlands. Cultural heart of North-West range."
  },
  "Hubballi Dharwad City": {
    division: "Belagavi Division",
    headquarters: "Hubballi",
    region: "Upper Karnataka",
    portal: "https://hublidharwadpolice.karnataka.gov.in",
    info: "Unified Commissionerate managing municipal crime analytics for the dual cities."
  },
  "K.G.F.": {
    division: "Bengaluru Division",
    headquarters: "Kolar Gold Fields",
    region: "Lower Karnataka (East)",
    portal: "https://kolar.nic.in",
    info: "Kolar Gold Fields Police District. Specifically created to govern the historic mining town region."
  },
  "K.Railways": {
    division: "Bengaluru Division",
    headquarters: "Bengaluru",
    region: "Statewide Jurisdiction",
    portal: "https://ksp.karnataka.gov.in",
    info: "Karnataka Railways Police. Statewide jurisdiction covering all railway tracks, stations, and property."
  },
  "Kalaburgi": {
    division: "Kalaburagi Division",
    headquarters: "Kalaburagi",
    region: "Upper Karnataka (North)",
    portal: "https://kalaburagi.nic.in",
    info: "Known for Bahmani heritage, Gulbarga Fort, and pigeon pea (Tur dal) cultivation."
  },
  "Kodagu": {
    division: "Mysuru Division",
    headquarters: "Madikeri",
    region: "Lower Karnataka (Western)",
    portal: "https://kodagu.nic.in",
    info: "Coffee-producing hill station, known as the 'Scotland of India'. Birthplace of River Kaveri."
  },
  "Kolar": {
    division: "Bengaluru Division",
    headquarters: "Kolar",
    region: "Lower Karnataka (East)",
    portal: "https://kolar.nic.in",
    info: "Famous for gold mines and milk production. Excludes K.G.F. police bounds."
  },
  "Koppal": {
    division: "Kalaburagi Division",
    headquarters: "Koppal",
    region: "Upper Karnataka",
    portal: "https://koppal.nic.in",
    info: "Known as 'Kopana Nagara' - historic jain heritage center. Bounded by Tungabhadra river."
  },
  "Mandya": {
    division: "Mysuru Division",
    headquarters: "Mandya",
    region: "Lower Karnataka",
    portal: "https://mandya.nic.in",
    info: "Known as the land of sugar and rice. Bounded by Krishnarajasagara (KRS) dam."
  },
  "Mangaluru City": {
    division: "Mysuru Division",
    headquarters: "Mangaluru",
    region: "Coastal Karnataka",
    portal: "https://mangaluruurban.nic.in",
    info: "Police Commissionerate managing urban crime prevention and harbor security."
  },
  "Mysuru City": {
    division: "Mysuru Division",
    headquarters: "Mysuru",
    region: "Lower Karnataka",
    portal: "https://mysurucitypolice.gov.in",
    info: "Police Commissionerate managing the cultural capital city of Karnataka."
  },
  "Mysuru District": {
    division: "Mysuru Division",
    headquarters: "Mysuru",
    region: "Lower Karnataka",
    portal: "https://mysore.nic.in",
    info: "Excludes Mysuru City limits. Governs major agricultural and forest buffer boundaries."
  },
  "Raichur": {
    division: "Kalaburagi Division",
    headquarters: "Raichur",
    region: "Upper Karnataka (East)",
    portal: "https://raichur.nic.in",
    info: "Doab region between Krishna and Tungabhadra rivers. Houses Raichur Thermal Power Station."
  },
  "Ramanagar": {
    division: "Bengaluru Division",
    headquarters: "Ramanagara",
    region: "Lower Karnataka",
    portal: "https://ramanagara.nic.in",
    info: "Known for silk production (Silk City) and the rocky hills of Ramadevarabetta. Formed in 2007."
  },
  "Shimoga": {
    division: "Bengaluru Division",
    headquarters: "Shivamogga",
    region: "Central Karnataka",
    portal: "https://shivamogga.nic.in",
    info: "Gateway to Western Ghats. Houses the famous Jog Falls and Tunga river banks."
  },
  "Tumakuru": {
    division: "Bengaluru Division",
    headquarters: "Tumakuru",
    region: "Lower Karnataka",
    portal: "https://tumkur.nic.in",
    info: "Known for coconut production and educational institutions like Sri Siddaganga Mutt."
  },
  "Udupi": {
    division: "Mysuru Division",
    headquarters: "Udupi",
    region: "Coastal Karnataka",
    portal: "https://udupi.nic.in",
    info: "Famous for Sri Krishna Temple, Udupi cuisine, and scenic beaches like Malpe."
  },
  "Uttara Kannada": {
    division: "Belagavi Division",
    headquarters: "Karwar",
    region: "Coastal Karnataka / Western Ghats",
    portal: "https://uttarakannada.nic.in",
    info: "Dense forest cover (Western Ghats) meeting the Arabian Sea. Contains Karwar port."
  },
  "Vijayapura": {
    division: "Belagavi Division",
    headquarters: "Vijayapura",
    region: "Upper Karnataka (North)",
    portal: "https://vijayapura.nic.in",
    info: "Famous for the monumental Gol Gumbaz (largest dome in India). Historic capital of Adil Shahi dynasty."
  },
  "Yadgiri": {
    division: "Kalaburagi Division",
    headquarters: "Yadgir",
    region: "Upper Karnataka (North)",
    portal: "https://yadgir.nic.in",
    info: "Carved out of Gulbarga district in 2009. Famous for Yadgir Fort atop a monolithic hill."
  }
};
