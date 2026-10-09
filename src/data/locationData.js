export const initialStates = [
  { id: 'ST-01', name: 'Karnataka', code: 'KA', status: 'Active', createdDate: '2025-01-10' },
  { id: 'ST-02', name: 'Kerala', code: 'KL', status: 'Active', createdDate: '2025-01-15' },
];

export const initialDistricts = [
  // --- Karnataka Districts (All 31 Districts) ---
  { id: 'DT-01', name: 'Dakshina Kannada', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-10' },
  { id: 'DT-02', name: 'Uttara Kannada', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-10' },
  { id: 'DT-03', name: 'Udupi', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-11' },
  { id: 'DT-04', name: 'Shivamogga', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-12' },
  { id: 'DT-05', name: 'Bengaluru Urban', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-12' },
  { id: 'DT-06', name: 'Chikkamagaluru', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-15' },
  { id: 'DT-07', name: 'Mysuru', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-18' },
  { id: 'DT-08', name: 'Dharwad', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-05' },
  { id: 'DT-09', name: 'Belagavi', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-08' },
  { id: 'DT-10', name: 'Hassan', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-10' },
  { id: 'DT-11', name: 'Tumakuru', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-12' },
  { id: 'DT-12', name: 'Mandya', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-15' },
  { id: 'DT-13', name: 'Kodagu', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-15' },
  { id: 'DT-14', name: 'Bengaluru Rural', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-15' },
  { id: 'DT-15', name: 'Ramanagara', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-15' },
  { id: 'DT-16', name: 'Bagalkote', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-16' },
  { id: 'DT-17', name: 'Ballari', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-16' },
  { id: 'DT-18', name: 'Vijayanagara', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-16' },
  { id: 'DT-19', name: 'Bidar', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-16' },
  { id: 'DT-20', name: 'Chamarajanagara', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-17' },
  { id: 'DT-21', name: 'Chikkaballapura', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-17' },
  { id: 'DT-22', name: 'Chitradurga', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-17' },
  { id: 'DT-23', name: 'Davanagere', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-18' },
  { id: 'DT-24', name: 'Gadag', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-18' },
  { id: 'DT-25', name: 'Kalaburagi', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-18' },
  { id: 'DT-26', name: 'Haveri', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-19' },
  { id: 'DT-27', name: 'Kolar', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-19' },
  { id: 'DT-28', name: 'Koppal', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-19' },
  { id: 'DT-29', name: 'Raichur', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-20' },
  { id: 'DT-30', name: 'Vijayapura', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-20' },
  { id: 'DT-31', name: 'Yadgir', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-20' },

  // --- Kerala Districts ---
  { id: 'DT-32', name: 'Kasaragod', stateId: 'ST-02', stateName: 'Kerala', status: 'Active', createdDate: '2025-01-25' },
  { id: 'DT-33', name: 'Kannur', stateId: 'ST-02', stateName: 'Kerala', status: 'Active', createdDate: '2025-01-28' },
  { id: 'DT-34', name: 'Kozhikode', stateId: 'ST-02', stateName: 'Kerala', status: 'Active', createdDate: '2025-02-01' },
  { id: 'DT-35', name: 'Ernakulam', stateId: 'ST-02', stateName: 'Kerala', status: 'Active', createdDate: '2025-02-03' },
  { id: 'DT-36', name: 'Thiruvananthapuram', stateId: 'ST-02', stateName: 'Kerala', status: 'Active', createdDate: '2025-02-05' },
  { id: 'DT-37', name: 'Thrissur', stateId: 'ST-02', stateName: 'Kerala', status: 'Active', createdDate: '2025-02-07' },
  { id: 'DT-38', name: 'Wayanad', stateId: 'ST-02', stateName: 'Kerala', status: 'Active', createdDate: '2025-02-09' },
  { id: 'DT-39', name: 'Palakkad', stateId: 'ST-02', stateName: 'Kerala', status: 'Active', createdDate: '2025-02-11' },
];

export const initialTaluks = [
  // 1. Dakshina Kannada Taluks (DT-01)
  { id: 'TK-01', name: 'Mangaluru', districtId: 'DT-01', districtName: 'Dakshina Kannada', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-10' },
  { id: 'TK-02', name: 'Bantwal', districtId: 'DT-01', districtName: 'Dakshina Kannada', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-10' },
  { id: 'TK-03', name: 'Puttur', districtId: 'DT-01', districtName: 'Dakshina Kannada', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-10' },
  { id: 'TK-04', name: 'Sullia', districtId: 'DT-01', districtName: 'Dakshina Kannada', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-11' },
  { id: 'TK-05', name: 'Belthangady', districtId: 'DT-01', districtName: 'Dakshina Kannada', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-11' },
  { id: 'TK-06', name: 'Kadaba', districtId: 'DT-01', districtName: 'Dakshina Kannada', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-12' },
  { id: 'TK-07', name: 'Moodbidri', districtId: 'DT-01', districtName: 'Dakshina Kannada', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-12' },
  { id: 'TK-07B', name: 'Ullal', districtId: 'DT-01', districtName: 'Dakshina Kannada', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-12' },
  { id: 'TK-07C', name: 'Mulki', districtId: 'DT-01', districtName: 'Dakshina Kannada', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-12' },

  // 2. Uttara Kannada Taluks (DT-02)
  { id: 'TK-08', name: 'Sirsi', districtId: 'DT-02', districtName: 'Uttara Kannada', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-10' },
  { id: 'TK-09', name: 'Siddapur', districtId: 'DT-02', districtName: 'Uttara Kannada', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-10' },
  { id: 'TK-10', name: 'Yellapur', districtId: 'DT-02', districtName: 'Uttara Kannada', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-11' },
  { id: 'TK-11', name: 'Kumta', districtId: 'DT-02', districtName: 'Uttara Kannada', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-11' },
  { id: 'TK-12', name: 'Honnavar', districtId: 'DT-02', districtName: 'Uttara Kannada', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-12' },
  { id: 'TK-13', name: 'Bhatkal', districtId: 'DT-02', districtName: 'Uttara Kannada', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-12' },
  { id: 'TK-14', name: 'Ankola', districtId: 'DT-02', districtName: 'Uttara Kannada', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-13' },
  { id: 'TK-15', name: 'Karwar', districtId: 'DT-02', districtName: 'Uttara Kannada', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-14' },
  { id: 'TK-15B', name: 'Haliyal', districtId: 'DT-02', districtName: 'Uttara Kannada', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-14' },
  { id: 'TK-15C', name: 'Joida', districtId: 'DT-02', districtName: 'Uttara Kannada', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-14' },
  { id: 'TK-15D', name: 'Mundgod', districtId: 'DT-02', districtName: 'Uttara Kannada', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-14' },
  { id: 'TK-15E', name: 'Dandeli', districtId: 'DT-02', districtName: 'Uttara Kannada', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-14' },

  // 3. Udupi Taluks (DT-03)
  { id: 'TK-16', name: 'Udupi', districtId: 'DT-03', districtName: 'Udupi', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-11' },
  { id: 'TK-17', name: 'Kundapura', districtId: 'DT-03', districtName: 'Udupi', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-11' },
  { id: 'TK-18', name: 'Karkala', districtId: 'DT-03', districtName: 'Udupi', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-12' },
  { id: 'TK-19', name: 'Byndoor', districtId: 'DT-03', districtName: 'Udupi', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-12' },
  { id: 'TK-20', name: 'Brahmavara', districtId: 'DT-03', districtName: 'Udupi', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-13' },
  { id: 'TK-21', name: 'Kaup', districtId: 'DT-03', districtName: 'Udupi', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-13' },
  { id: 'TK-22', name: 'Hebri', districtId: 'DT-03', districtName: 'Udupi', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-14' },

  // 4. Shivamogga Taluks (DT-04)
  { id: 'TK-23', name: 'Sagar', districtId: 'DT-04', districtName: 'Shivamogga', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-12' },
  { id: 'TK-24', name: 'Thirthahalli', districtId: 'DT-04', districtName: 'Shivamogga', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-12' },
  { id: 'TK-25', name: 'Hosanagara', districtId: 'DT-04', districtName: 'Shivamogga', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-13' },
  { id: 'TK-26', name: 'Shivamogga', districtId: 'DT-04', districtName: 'Shivamogga', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-13' },
  { id: 'TK-27', name: 'Soraba', districtId: 'DT-04', districtName: 'Shivamogga', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-14' },
  { id: 'TK-28', name: 'Bhadravathi', districtId: 'DT-04', districtName: 'Shivamogga', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-15' },
  { id: 'TK-28B', name: 'Shikaripura', districtId: 'DT-04', districtName: 'Shivamogga', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-15' },

  // 5. Bengaluru Urban Taluks (DT-05)
  { id: 'TK-29', name: 'Bengaluru North', districtId: 'DT-05', districtName: 'Bengaluru Urban', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-12' },
  { id: 'TK-30', name: 'Bengaluru South', districtId: 'DT-05', districtName: 'Bengaluru Urban', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-12' },
  { id: 'TK-31', name: 'Bengaluru East', districtId: 'DT-05', districtName: 'Bengaluru Urban', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-13' },
  { id: 'TK-32', name: 'Anekal', districtId: 'DT-05', districtName: 'Bengaluru Urban', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-13' },
  { id: 'TK-32B', name: 'Yelahanka', districtId: 'DT-05', districtName: 'Bengaluru Urban', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-13' },

  // 6. Chikkamagaluru Taluks (DT-06)
  { id: 'TK-33', name: 'Chikkamagaluru', districtId: 'DT-06', districtName: 'Chikkamagaluru', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-15' },
  { id: 'TK-34', name: 'Sringeri', districtId: 'DT-06', districtName: 'Chikkamagaluru', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-15' },
  { id: 'TK-35', name: 'Koppa', districtId: 'DT-06', districtName: 'Chikkamagaluru', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-16' },
  { id: 'TK-36', name: 'Mudigere', districtId: 'DT-06', districtName: 'Chikkamagaluru', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-16' },
  { id: 'TK-36B', name: 'Kadur', districtId: 'DT-06', districtName: 'Chikkamagaluru', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-16' },
  { id: 'TK-36C', name: 'Tarikere', districtId: 'DT-06', districtName: 'Chikkamagaluru', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-16' },
  { id: 'TK-36D', name: 'Narasimharajapura', districtId: 'DT-06', districtName: 'Chikkamagaluru', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-16' },
  { id: 'TK-36E', name: 'Ajjampura', districtId: 'DT-06', districtName: 'Chikkamagaluru', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-16' },

  // 7. Mysuru Taluks (DT-07)
  { id: 'TK-37', name: 'Mysuru', districtId: 'DT-07', districtName: 'Mysuru', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-18' },
  { id: 'TK-38', name: 'Hunsur', districtId: 'DT-07', districtName: 'Mysuru', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-18' },
  { id: 'TK-39', name: 'Nanjangud', districtId: 'DT-07', districtName: 'Mysuru', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-19' },
  { id: 'TK-39B', name: 'Piriyapatna', districtId: 'DT-07', districtName: 'Mysuru', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-19' },
  { id: 'TK-39C', name: 'T. Narasipura', districtId: 'DT-07', districtName: 'Mysuru', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-19' },
  { id: 'TK-39D', name: 'K.R. Nagar', districtId: 'DT-07', districtName: 'Mysuru', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-19' },
  { id: 'TK-39E', name: 'Heggadadevankote', districtId: 'DT-07', districtName: 'Mysuru', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-01-19' },

  // 8. Dharwad Taluks (DT-08)
  { id: 'TK-40', name: 'Dharwad', districtId: 'DT-08', districtName: 'Dharwad', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-05' },
  { id: 'TK-41', name: 'Hubballi Urban', districtId: 'DT-08', districtName: 'Dharwad', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-05' },
  { id: 'TK-41B', name: 'Hubballi Rural', districtId: 'DT-08', districtName: 'Dharwad', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-05' },
  { id: 'TK-41C', name: 'Kundgol', districtId: 'DT-08', districtName: 'Dharwad', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-05' },
  { id: 'TK-41D', name: 'Navalgund', districtId: 'DT-08', districtName: 'Dharwad', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-05' },
  { id: 'TK-41E', name: 'Alnavar', districtId: 'DT-08', districtName: 'Dharwad', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-05' },

  // 9. Belagavi Taluks (DT-09)
  { id: 'TK-42', name: 'Belagavi', districtId: 'DT-09', districtName: 'Belagavi', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-08' },
  { id: 'TK-43', name: 'Gokak', districtId: 'DT-09', districtName: 'Belagavi', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-08' },
  { id: 'TK-43B', name: 'Chikkodi', districtId: 'DT-09', districtName: 'Belagavi', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-08' },
  { id: 'TK-43C', name: 'Athani', districtId: 'DT-09', districtName: 'Belagavi', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-08' },
  { id: 'TK-43D', name: 'Bailhongal', districtId: 'DT-09', districtName: 'Belagavi', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-08' },
  { id: 'TK-43E', name: 'Hukkeri', districtId: 'DT-09', districtName: 'Belagavi', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-08' },
  { id: 'TK-43F', name: 'Khanapur', districtId: 'DT-09', districtName: 'Belagavi', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-08' },
  { id: 'TK-43G', name: 'Ramdurg', districtId: 'DT-09', districtName: 'Belagavi', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-08' },
  { id: 'TK-43H', name: 'Raybag', districtId: 'DT-09', districtName: 'Belagavi', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-08' },
  { id: 'TK-43I', name: 'Saundatti', districtId: 'DT-09', districtName: 'Belagavi', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-08' },

  // 10. Hassan Taluks (DT-10)
  { id: 'TK-44', name: 'Hassan', districtId: 'DT-10', districtName: 'Hassan', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-10' },
  { id: 'TK-45', name: 'Sakleshpur', districtId: 'DT-10', districtName: 'Hassan', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-10' },
  { id: 'TK-45B', name: 'Arsikere', districtId: 'DT-10', districtName: 'Hassan', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-10' },
  { id: 'TK-45C', name: 'Belur', districtId: 'DT-10', districtName: 'Hassan', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-10' },
  { id: 'TK-45D', name: 'Channarayapatna', districtId: 'DT-10', districtName: 'Hassan', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-10' },
  { id: 'TK-45E', name: 'Holenarasipura', districtId: 'DT-10', districtName: 'Hassan', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-10' },
  { id: 'TK-45F', name: 'Arkalgud', districtId: 'DT-10', districtName: 'Hassan', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-10' },
  { id: 'TK-45G', name: 'Alur', districtId: 'DT-10', districtName: 'Hassan', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-10' },

  // 11. Tumakuru Taluks (DT-11)
  { id: 'TK-46', name: 'Tumakuru', districtId: 'DT-11', districtName: 'Tumakuru', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-12' },
  { id: 'TK-47', name: 'Tiptur', districtId: 'DT-11', districtName: 'Tumakuru', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-12' },
  { id: 'TK-47B', name: 'Chikkanayakanahalli', districtId: 'DT-11', districtName: 'Tumakuru', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-12' },
  { id: 'TK-47C', name: 'Gubbi', districtId: 'DT-11', districtName: 'Tumakuru', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-12' },
  { id: 'TK-47D', name: 'Koratagere', districtId: 'DT-11', districtName: 'Tumakuru', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-12' },
  { id: 'TK-47E', name: 'Kunigal', districtId: 'DT-11', districtName: 'Tumakuru', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-12' },
  { id: 'TK-47F', name: 'Madhugiri', districtId: 'DT-11', districtName: 'Tumakuru', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-12' },
  { id: 'TK-47G', name: 'Pavagada', districtId: 'DT-11', districtName: 'Tumakuru', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-12' },
  { id: 'TK-47H', name: 'Sira', districtId: 'DT-11', districtName: 'Tumakuru', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-12' },
  { id: 'TK-47I', name: 'Turuvekere', districtId: 'DT-11', districtName: 'Tumakuru', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-12' },

  // 12. Mandya Taluks (DT-12)
  { id: 'TK-M01', name: 'Mandya', districtId: 'DT-12', districtName: 'Mandya', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-15' },
  { id: 'TK-M02', name: 'Maddur', districtId: 'DT-12', districtName: 'Mandya', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-15' },
  { id: 'TK-M03', name: 'Malavalli', districtId: 'DT-12', districtName: 'Mandya', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-15' },
  { id: 'TK-M04', name: 'Pandavapura', districtId: 'DT-12', districtName: 'Mandya', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-15' },
  { id: 'TK-M05', name: 'Srirangapatna', districtId: 'DT-12', districtName: 'Mandya', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-15' },
  { id: 'TK-M06', name: 'Nagamangala', districtId: 'DT-12', districtName: 'Mandya', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-15' },
  { id: 'TK-M07', name: 'Krishnarajpet', districtId: 'DT-12', districtName: 'Mandya', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-15' },

  // 13. Kodagu Taluks (DT-13)
  { id: 'TK-K01', name: 'Madikeri', districtId: 'DT-13', districtName: 'Kodagu', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-15' },
  { id: 'TK-K02', name: 'Somwarpet', districtId: 'DT-13', districtName: 'Kodagu', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-15' },
  { id: 'TK-K03', name: 'Virajpet', districtId: 'DT-13', districtName: 'Kodagu', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-15' },
  { id: 'TK-K04', name: 'Kushalnagar', districtId: 'DT-13', districtName: 'Kodagu', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-15' },
  { id: 'TK-K05', name: 'Ponnampet', districtId: 'DT-13', districtName: 'Kodagu', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-15' },

  // 14. Bengaluru Rural Taluks (DT-14)
  { id: 'TK-BR01', name: 'Devanahalli', districtId: 'DT-14', districtName: 'Bengaluru Rural', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-15' },
  { id: 'TK-BR02', name: 'Doddaballapura', districtId: 'DT-14', districtName: 'Bengaluru Rural', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-15' },
  { id: 'TK-BR03', name: 'Hosakote', districtId: 'DT-14', districtName: 'Bengaluru Rural', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-15' },
  { id: 'TK-BR04', name: 'Nelamangala', districtId: 'DT-14', districtName: 'Bengaluru Rural', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-15' },

  // 15. Ramanagara Taluks (DT-15)
  { id: 'TK-RM01', name: 'Ramanagara', districtId: 'DT-15', districtName: 'Ramanagara', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-15' },
  { id: 'TK-RM02', name: 'Channapatna', districtId: 'DT-15', districtName: 'Ramanagara', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-15' },
  { id: 'TK-RM03', name: 'Kanakapura', districtId: 'DT-15', districtName: 'Ramanagara', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-15' },
  { id: 'TK-RM04', name: 'Magadi', districtId: 'DT-15', districtName: 'Ramanagara', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-15' },
  { id: 'TK-RM05', name: 'Harohalli', districtId: 'DT-15', districtName: 'Ramanagara', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-15' },

  // 16. Bagalkote Taluks (DT-16)
  { id: 'TK-BG01', name: 'Bagalkote', districtId: 'DT-16', districtName: 'Bagalkote', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-16' },
  { id: 'TK-BG02', name: 'Badami', districtId: 'DT-16', districtName: 'Bagalkote', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-16' },
  { id: 'TK-BG03', name: 'Bilagi', districtId: 'DT-16', districtName: 'Bagalkote', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-16' },
  { id: 'TK-BG04', name: 'Hungund', districtId: 'DT-16', districtName: 'Bagalkote', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-16' },
  { id: 'TK-BG05', name: 'Jamkhandi', districtId: 'DT-16', districtName: 'Bagalkote', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-16' },
  { id: 'TK-BG06', name: 'Mudhol', districtId: 'DT-16', districtName: 'Bagalkote', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-16' },
  { id: 'TK-BG07', name: 'Guledgudda', districtId: 'DT-16', districtName: 'Bagalkote', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-16' },
  { id: 'TK-BG08', name: 'Rabkavi Banhatti', districtId: 'DT-16', districtName: 'Bagalkote', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-16' },
  { id: 'TK-BG09', name: 'Ilkal', districtId: 'DT-16', districtName: 'Bagalkote', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-16' },

  // 17. Ballari Taluks (DT-17)
  { id: 'TK-BL01', name: 'Ballari', districtId: 'DT-17', districtName: 'Ballari', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-16' },
  { id: 'TK-BL02', name: 'Kampli', districtId: 'DT-17', districtName: 'Ballari', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-16' },
  { id: 'TK-BL03', name: 'Kurugodu', districtId: 'DT-17', districtName: 'Ballari', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-16' },
  { id: 'TK-BL04', name: 'Sandur', districtId: 'DT-17', districtName: 'Ballari', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-16' },
  { id: 'TK-BL05', name: 'Siruguppa', districtId: 'DT-17', districtName: 'Ballari', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-16' },

  // 18. Vijayanagara Taluks (DT-18)
  { id: 'TK-VN01', name: 'Hosapete', districtId: 'DT-18', districtName: 'Vijayanagara', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-16' },
  { id: 'TK-VN02', name: 'Harapanahalli', districtId: 'DT-18', districtName: 'Vijayanagara', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-16' },
  { id: 'TK-VN03', name: 'Hagaribommanahalli', districtId: 'DT-18', districtName: 'Vijayanagara', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-16' },
  { id: 'TK-VN04', name: 'Hoovina Hadagali', districtId: 'DT-18', districtName: 'Vijayanagara', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-16' },
  { id: 'TK-VN05', name: 'Kudligi', districtId: 'DT-18', districtName: 'Vijayanagara', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-16' },
  { id: 'TK-VN06', name: 'Kotturu', districtId: 'DT-18', districtName: 'Vijayanagara', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-16' },

  // 19. Bidar Taluks (DT-19)
  { id: 'TK-BD01', name: 'Bidar', districtId: 'DT-19', districtName: 'Bidar', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-16' },
  { id: 'TK-BD02', name: 'Basavakalyan', districtId: 'DT-19', districtName: 'Bidar', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-16' },
  { id: 'TK-BD03', name: 'Bhalki', districtId: 'DT-19', districtName: 'Bidar', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-16' },
  { id: 'TK-BD04', name: 'Humnabad', districtId: 'DT-19', districtName: 'Bidar', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-16' },
  { id: 'TK-BD05', name: 'Aurad', districtId: 'DT-19', districtName: 'Bidar', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-16' },
  { id: 'TK-BD06', name: 'Chitgoppa', districtId: 'DT-19', districtName: 'Bidar', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-16' },
  { id: 'TK-BD07', name: 'Hulsoor', districtId: 'DT-19', districtName: 'Bidar', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-16' },
  { id: 'TK-BD08', name: 'Kamalnagar', districtId: 'DT-19', districtName: 'Bidar', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-16' },

  // 20. Chamarajanagara Taluks (DT-20)
  { id: 'TK-CR01', name: 'Chamarajanagara', districtId: 'DT-20', districtName: 'Chamarajanagara', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-17' },
  { id: 'TK-CR02', name: 'Gundlupete', districtId: 'DT-20', districtName: 'Chamarajanagara', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-17' },
  { id: 'TK-CR03', name: 'Kollegala', districtId: 'DT-20', districtName: 'Chamarajanagara', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-17' },
  { id: 'TK-CR04', name: 'Yelandur', districtId: 'DT-20', districtName: 'Chamarajanagara', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-17' },
  { id: 'TK-CR05', name: 'Hanur', districtId: 'DT-20', districtName: 'Chamarajanagara', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-17' },

  // 21. Chikkaballapura Taluks (DT-21)
  { id: 'TK-CB01', name: 'Chikkaballapura', districtId: 'DT-21', districtName: 'Chikkaballapura', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-17' },
  { id: 'TK-CB02', name: 'Bagepalli', districtId: 'DT-21', districtName: 'Chikkaballapura', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-17' },
  { id: 'TK-CB03', name: 'Chintamani', districtId: 'DT-21', districtName: 'Chikkaballapura', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-17' },
  { id: 'TK-CB04', name: 'Gauribidanur', districtId: 'DT-21', districtName: 'Chikkaballapura', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-17' },
  { id: 'TK-CB05', name: 'Gudibanda', districtId: 'DT-21', districtName: 'Chikkaballapura', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-17' },
  { id: 'TK-CB06', name: 'Sidlaghatta', districtId: 'DT-21', districtName: 'Chikkaballapura', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-17' },

  // 22. Chitradurga Taluks (DT-22)
  { id: 'TK-CD01', name: 'Chitradurga', districtId: 'DT-22', districtName: 'Chitradurga', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-17' },
  { id: 'TK-CD02', name: 'Challakere', districtId: 'DT-22', districtName: 'Chitradurga', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-17' },
  { id: 'TK-CD03', name: 'Hiriyur', districtId: 'DT-22', districtName: 'Chitradurga', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-17' },
  { id: 'TK-CD04', name: 'Holalkere', districtId: 'DT-22', districtName: 'Chitradurga', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-17' },
  { id: 'TK-CD05', name: 'Hosadurga', districtId: 'DT-22', districtName: 'Chitradurga', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-17' },
  { id: 'TK-CD06', name: 'Molakalmuru', districtId: 'DT-22', districtName: 'Chitradurga', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-17' },

  // 23. Davanagere Taluks (DT-23)
  { id: 'TK-DV01', name: 'Davanagere', districtId: 'DT-23', districtName: 'Davanagere', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-18' },
  { id: 'TK-DV02', name: 'Harihara', districtId: 'DT-23', districtName: 'Davanagere', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-18' },
  { id: 'TK-DV03', name: 'Honnali', districtId: 'DT-23', districtName: 'Davanagere', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-18' },
  { id: 'TK-DV04', name: 'Channagiri', districtId: 'DT-23', districtName: 'Davanagere', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-18' },
  { id: 'TK-DV05', name: 'Jagalur', districtId: 'DT-23', districtName: 'Davanagere', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-18' },
  { id: 'TK-DV06', name: 'Nyamathi', districtId: 'DT-23', districtName: 'Davanagere', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-18' },

  // 24. Gadag Taluks (DT-24)
  { id: 'TK-GD01', name: 'Gadag', districtId: 'DT-24', districtName: 'Gadag', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-18' },
  { id: 'TK-GD02', name: 'Nargund', districtId: 'DT-24', districtName: 'Gadag', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-18' },
  { id: 'TK-GD03', name: 'Ron', districtId: 'DT-24', districtName: 'Gadag', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-18' },
  { id: 'TK-GD04', name: 'Shirahatti', districtId: 'DT-24', districtName: 'Gadag', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-18' },
  { id: 'TK-GD05', name: 'Mundargi', districtId: 'DT-24', districtName: 'Gadag', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-18' },
  { id: 'TK-GD06', name: 'Gajendragad', districtId: 'DT-24', districtName: 'Gadag', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-18' },
  { id: 'TK-GD07', name: 'Lakshmeshwar', districtId: 'DT-24', districtName: 'Gadag', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-18' },

  // 25. Kalaburagi Taluks (DT-25)
  { id: 'TK-KL01', name: 'Kalaburagi', districtId: 'DT-25', districtName: 'Kalaburagi', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-18' },
  { id: 'TK-KL02', name: 'Afzalpur', districtId: 'DT-25', districtName: 'Kalaburagi', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-18' },
  { id: 'TK-KL03', name: 'Aland', districtId: 'DT-25', districtName: 'Kalaburagi', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-18' },
  { id: 'TK-KL04', name: 'Chincholi', districtId: 'DT-25', districtName: 'Kalaburagi', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-18' },
  { id: 'TK-KL05', name: 'Chittapur', districtId: 'DT-25', districtName: 'Kalaburagi', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-18' },
  { id: 'TK-KL06', name: 'Jevargi', districtId: 'DT-25', districtName: 'Kalaburagi', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-18' },
  { id: 'TK-KL07', name: 'Sedam', districtId: 'DT-25', districtName: 'Kalaburagi', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-18' },
  { id: 'TK-KL08', name: 'Kamalapur', districtId: 'DT-25', districtName: 'Kalaburagi', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-18' },
  { id: 'TK-KL09', name: 'Shahabad', districtId: 'DT-25', districtName: 'Kalaburagi', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-18' },
  { id: 'TK-KL10', name: 'Kalagi', districtId: 'DT-25', districtName: 'Kalaburagi', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-18' },

  // 26. Haveri Taluks (DT-26)
  { id: 'TK-HV01', name: 'Haveri', districtId: 'DT-26', districtName: 'Haveri', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-19' },
  { id: 'TK-HV02', name: 'Byadgi', districtId: 'DT-26', districtName: 'Haveri', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-19' },
  { id: 'TK-HV03', name: 'Hangal', districtId: 'DT-26', districtName: 'Haveri', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-19' },
  { id: 'TK-HV04', name: 'Hirekerur', districtId: 'DT-26', districtName: 'Haveri', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-19' },
  { id: 'TK-HV05', name: 'Ranebennur', districtId: 'DT-26', districtName: 'Haveri', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-19' },
  { id: 'TK-HV06', name: 'Savanur', districtId: 'DT-26', districtName: 'Haveri', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-19' },
  { id: 'TK-HV07', name: 'Shiggaon', districtId: 'DT-26', districtName: 'Haveri', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-19' },
  { id: 'TK-HV08', name: 'Rattihalli', districtId: 'DT-26', districtName: 'Haveri', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-19' },

  // 27. Kolar Taluks (DT-27)
  { id: 'TK-KR01', name: 'Kolar', districtId: 'DT-27', districtName: 'Kolar', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-19' },
  { id: 'TK-KR02', name: 'Bangarapet', districtId: 'DT-27', districtName: 'Kolar', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-19' },
  { id: 'TK-KR03', name: 'Malur', districtId: 'DT-27', districtName: 'Kolar', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-19' },
  { id: 'TK-KR04', name: 'Mulbagal', districtId: 'DT-27', districtName: 'Kolar', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-19' },
  { id: 'TK-KR05', name: 'Srinivaspura', districtId: 'DT-27', districtName: 'Kolar', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-19' },
  { id: 'TK-KR06', name: 'KGF', districtId: 'DT-27', districtName: 'Kolar', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-19' },

  // 28. Koppal Taluks (DT-28)
  { id: 'TK-KP01', name: 'Koppal', districtId: 'DT-28', districtName: 'Koppal', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-19' },
  { id: 'TK-KP02', name: 'Gangavathi', districtId: 'DT-28', districtName: 'Koppal', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-19' },
  { id: 'TK-KP03', name: 'Kushtagi', districtId: 'DT-28', districtName: 'Koppal', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-19' },
  { id: 'TK-KP04', name: 'Yelburga', districtId: 'DT-28', districtName: 'Koppal', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-19' },
  { id: 'TK-KP05', name: 'Kuknoor', districtId: 'DT-28', districtName: 'Koppal', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-19' },
  { id: 'TK-KP06', name: 'Kanakagiri', districtId: 'DT-28', districtName: 'Koppal', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-19' },
  { id: 'TK-KP07', name: 'Karatagi', districtId: 'DT-28', districtName: 'Koppal', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-19' },

  // 29. Raichur Taluks (DT-29)
  { id: 'TK-RC01', name: 'Raichur', districtId: 'DT-29', districtName: 'Raichur', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-20' },
  { id: 'TK-RC02', name: 'Devadurga', districtId: 'DT-29', districtName: 'Raichur', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-20' },
  { id: 'TK-RC03', name: 'Lingsugur', districtId: 'DT-29', districtName: 'Raichur', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-20' },
  { id: 'TK-RC04', name: 'Manvi', districtId: 'DT-29', districtName: 'Raichur', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-20' },
  { id: 'TK-RC05', name: 'Sindhanur', districtId: 'DT-29', districtName: 'Raichur', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-20' },
  { id: 'TK-RC06', name: 'Maski', districtId: 'DT-29', districtName: 'Raichur', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-20' },
  { id: 'TK-RC07', name: 'Sirwar', districtId: 'DT-29', districtName: 'Raichur', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-20' },

  // 30. Vijayapura Taluks (DT-30)
  { id: 'TK-VJ01', name: 'Vijayapura', districtId: 'DT-30', districtName: 'Vijayapura', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-20' },
  { id: 'TK-VJ02', name: 'Basavana Bagewadi', districtId: 'DT-30', districtName: 'Vijayapura', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-20' },
  { id: 'TK-VJ03', name: 'Indi', districtId: 'DT-30', districtName: 'Vijayapura', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-20' },
  { id: 'TK-VJ04', name: 'Muddebihal', districtId: 'DT-30', districtName: 'Vijayapura', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-20' },
  { id: 'TK-VJ05', name: 'Sindagi', districtId: 'DT-30', districtName: 'Vijayapura', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-20' },
  { id: 'TK-VJ06', name: 'Babaleshwar', districtId: 'DT-30', districtName: 'Vijayapura', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-20' },
  { id: 'TK-VJ07', name: 'Chadchan', districtId: 'DT-30', districtName: 'Vijayapura', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-20' },
  { id: 'TK-VJ08', name: 'Devar Hippargi', districtId: 'DT-30', districtName: 'Vijayapura', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-20' },
  { id: 'TK-VJ09', name: 'Kolhar', districtId: 'DT-30', districtName: 'Vijayapura', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-20' },
  { id: 'TK-VJ10', name: 'Nidagundi', districtId: 'DT-30', districtName: 'Vijayapura', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-20' },
  { id: 'TK-VJ11', name: 'Tikota', districtId: 'DT-30', districtName: 'Vijayapura', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-20' },

  // 31. Yadgir Taluks (DT-31)
  { id: 'TK-YD01', name: 'Yadgir', districtId: 'DT-31', districtName: 'Yadgir', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-20' },
  { id: 'TK-YD02', name: 'Shahapur', districtId: 'DT-31', districtName: 'Yadgir', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-20' },
  { id: 'TK-YD03', name: 'Surpur', districtId: 'DT-31', districtName: 'Yadgir', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-20' },
  { id: 'TK-YD04', name: 'Gurmitkal', districtId: 'DT-31', districtName: 'Yadgir', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-20' },
  { id: 'TK-YD05', name: 'Hunsagi', districtId: 'DT-31', districtName: 'Yadgir', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-20' },
  { id: 'TK-YD06', name: 'Wadgera', districtId: 'DT-31', districtName: 'Yadgir', stateId: 'ST-01', stateName: 'Karnataka', status: 'Active', createdDate: '2025-02-20' },

  // --- Kerala Taluks ---
  // Kasaragod Taluks (DT-32)
  { id: 'TK-48', name: 'Kasaragod', districtId: 'DT-32', districtName: 'Kasaragod', stateId: 'ST-02', stateName: 'Kerala', status: 'Active', createdDate: '2025-01-25' },
  { id: 'TK-49', name: 'Manjeshwaram', districtId: 'DT-32', districtName: 'Kasaragod', stateId: 'ST-02', stateName: 'Kerala', status: 'Active', createdDate: '2025-01-25' },
  { id: 'TK-50', name: 'Hosdurg', districtId: 'DT-32', districtName: 'Kasaragod', stateId: 'ST-02', stateName: 'Kerala', status: 'Active', createdDate: '2025-01-26' },
  { id: 'TK-51', name: 'Vellarikundu', districtId: 'DT-32', districtName: 'Kasaragod', stateId: 'ST-02', stateName: 'Kerala', status: 'Active', createdDate: '2025-01-26' },

  // Kannur Taluks (DT-33)
  { id: 'TK-52', name: 'Kannur', districtId: 'DT-33', districtName: 'Kannur', stateId: 'ST-02', stateName: 'Kerala', status: 'Active', createdDate: '2025-01-28' },
  { id: 'TK-53', name: 'Thalassery', districtId: 'DT-33', districtName: 'Kannur', stateId: 'ST-02', stateName: 'Kerala', status: 'Active', createdDate: '2025-01-28' },
  { id: 'TK-54', name: 'Taliparamba', districtId: 'DT-33', districtName: 'Kannur', stateId: 'ST-02', stateName: 'Kerala', status: 'Active', createdDate: '2025-01-29' },

  // Kozhikode Taluks (DT-34)
  { id: 'TK-55', name: 'Kozhikode', districtId: 'DT-34', districtName: 'Kozhikode', stateId: 'ST-02', stateName: 'Kerala', status: 'Active', createdDate: '2025-02-01' },
  { id: 'TK-56', name: 'Vadakara', districtId: 'DT-34', districtName: 'Kozhikode', stateId: 'ST-02', stateName: 'Kerala', status: 'Active', createdDate: '2025-02-01' },

  // Ernakulam Taluks (DT-35)
  { id: 'TK-57', name: 'Kochi', districtId: 'DT-35', districtName: 'Ernakulam', stateId: 'ST-02', stateName: 'Kerala', status: 'Active', createdDate: '2025-02-03' },
  { id: 'TK-58', name: 'Aluva', districtId: 'DT-35', districtName: 'Ernakulam', stateId: 'ST-02', stateName: 'Kerala', status: 'Active', createdDate: '2025-02-03' },
  { id: 'TK-59', name: 'Kanayannur', districtId: 'DT-35', districtName: 'Ernakulam', stateId: 'ST-02', stateName: 'Kerala', status: 'Active', createdDate: '2025-02-04' },

  // Thiruvananthapuram Taluks (DT-36)
  { id: 'TK-60', name: 'Thiruvananthapuram', districtId: 'DT-36', districtName: 'Thiruvananthapuram', stateId: 'ST-02', stateName: 'Kerala', status: 'Active', createdDate: '2025-02-05' },
  { id: 'TK-61', name: 'Neyyattinkara', districtId: 'DT-36', districtName: 'Thiruvananthapuram', stateId: 'ST-02', stateName: 'Kerala', status: 'Active', createdDate: '2025-02-05' },

  // Thrissur Taluks (DT-37)
  { id: 'TK-62', name: 'Thrissur', districtId: 'DT-37', districtName: 'Thrissur', stateId: 'ST-02', stateName: 'Kerala', status: 'Active', createdDate: '2025-02-07' },
  { id: 'TK-63', name: 'Mukundapuram', districtId: 'DT-37', districtName: 'Thrissur', stateId: 'ST-02', stateName: 'Kerala', status: 'Active', createdDate: '2025-02-07' },

  // Wayanad Taluks (DT-38)
  { id: 'TK-64', name: 'Vythiri', districtId: 'DT-38', districtName: 'Wayanad', stateId: 'ST-02', stateName: 'Kerala', status: 'Active', createdDate: '2025-02-09' },
  { id: 'TK-65', name: 'Sulthan Bathery', districtId: 'DT-38', districtName: 'Wayanad', stateId: 'ST-02', stateName: 'Kerala', status: 'Active', createdDate: '2025-02-09' },

  // Palakkad Taluks (DT-39)
  { id: 'TK-66', name: 'Palakkad', districtId: 'DT-39', districtName: 'Palakkad', stateId: 'ST-02', stateName: 'Kerala', status: 'Active', createdDate: '2025-02-11' },
  { id: 'TK-67', name: 'Ottapalam', districtId: 'DT-39', districtName: 'Palakkad', stateId: 'ST-02', stateName: 'Kerala', status: 'Active', createdDate: '2025-02-11' },
];
