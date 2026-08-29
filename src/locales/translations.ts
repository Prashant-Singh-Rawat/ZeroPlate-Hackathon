export type Language = 'en' | 'hi' | 'mr';

export interface Translations {
  [key: string]: {
    en: string;
    hi: string;
    mr: string;
  };
}

export const translations: Translations = {
  // Brand & Header
  appName: {
    en: 'ZeroPlate',
    hi: 'ZeroPlate',
    mr: 'ZeroPlate',
  },
  appTagline: {
    en: 'Share Food, Share Hope',
    hi: 'अन्न साझा करें, आशा साझा करें',
    mr: 'अन्न वाटा, आशा वाटा',
  },
  donorView: {
    en: 'Donor View',
    hi: 'दाता दृश्य',
    mr: 'दाता दृश्य',
  },
  ngoView: {
    en: 'NGO View',
    hi: 'NGO दृश्य',
    mr: 'NGO दृश्य',
  },
  freeTier: {
    en: 'Free Tier',
    hi: 'निःशुल्क स्तर',
    mr: 'विनामूल्य स्तर',
  },
  priorityPlan: {
    en: 'Priority Plan',
    hi: 'प्राथमिकता योजना',
    mr: 'प्राधान्य योजना',
  },

  // Portal Labels
  donorPortal: {
    en: 'Food Donor Portal',
    hi: 'खाद्य दाता पोर्टल',
    mr: 'अन्नदाता पोर्टल',
  },
  ngoPortal: {
    en: 'NGO Rescue Portal',
    hi: 'NGO बचाव पोर्टल',
    mr: 'NGO मदत पोर्टल',
  },

  // Navigation Links
  dashboard: {
    en: 'Dashboard',
    hi: 'डैशबोर्ड',
    mr: 'डॅशबोर्ड',
  },
  foodDonations: {
    en: 'Food Donations',
    hi: 'खाद्य दान',
    mr: 'अन्नदान',
  },
  addFood: {
    en: 'Add Food',
    hi: 'भोजन जोड़ें',
    mr: 'अन्न जोडा',
  },
  available: {
    en: 'Available',
    hi: 'उपलब्ध',
    mr: 'उपलब्ध',
  },
  reservedPending: {
    en: 'Reserved / Pending',
    hi: 'आरक्षित / लंबित',
    mr: 'राखीव / प्रलंबित',
  },
  completed: {
    en: 'Completed',
    hi: 'पूर्ण',
    mr: 'पूर्ण',
  },
  ngoRequests: {
    en: 'NGO Requests',
    hi: 'NGO अनुरोध',
    mr: 'NGO विनंत्या',
  },
  bookings: {
    en: 'Bookings',
    hi: 'बुकिंग',
    mr: 'बुकिंग',
  },
  impactDashboard: {
    en: 'Impact Dashboard',
    hi: 'प्रभाव डैशबोर्ड',
    mr: 'परिणाम डॅशबोर्ड',
  },
  messages: {
    en: 'Messages',
    hi: 'संदेश',
    mr: 'संदेश',
  },
  findFood: {
    en: 'Find Food',
    hi: 'भोजन खोजें',
    mr: 'अन्न शोधा',
  },
  mapView: {
    en: 'Map View',
    hi: 'मानचित्र दृश्य',
    mr: 'नकाशा दृश्य',
  },
  listView: {
    en: 'List View',
    hi: 'सूची दृश्य',
    mr: 'सूची दृश्य',
  },
  myRequests: {
    en: 'My Requests',
    hi: 'मेरे अनुरोध',
    mr: 'माझ्या विनंत्या',
  },
  subscription: {
    en: 'Subscription',
    hi: 'सदस्यता',
    mr: 'सदस्यता',
  },
  profile: {
    en: 'Profile',
    hi: 'प्रोफ़ाइल',
    mr: 'प्रोफाइल',
  },
  settings: {
    en: 'Settings',
    hi: 'सेटिंग्स',
    mr: 'सेटिंग्ज',
  },
  signOut: {
    en: 'Sign Out',
    hi: 'साइन आउट',
    mr: 'साइन आउट',
  },

  // Settings Page
  settingsHeading: {
    en: 'Settings',
    hi: 'सेटिंग्स',
    mr: 'सेटिंग्ज',
  },
  settingsSubtitle: {
    en: 'Manage your donation preferences, notifications, and account settings.',
    hi: 'अपनी दान प्राथमिकताएं, सूचनाएं और खाता सेटिंग्स प्रबंधित करें।',
    mr: 'आपली दान प्राधान्ये, सूचना आणि खाते सेटिंग्ज व्यवस्थापित करा.',
  },
  unsavedNotice: {
    en: "You have unsaved changes. Don't forget to save before leaving.",
    hi: 'आपके पास बिना सहेजे गए परिवर्तन हैं। छोड़ने से पहले सहेजना न भूलें।',
    mr: 'तुमच्याकडे सेव्ह न केलेले बदल आहेत. बाहेर पडण्यापूर्वी सेव्ह करायला विसरू नका.',
  },
  discard: {
    en: 'Discard',
    hi: 'खारिज करें',
    mr: 'रद्द करा',
  },
  saveNow: {
    en: 'Save Now',
    hi: 'अभी सहेजें',
    mr: 'आता सेव्ह करा',
  },

  // Settings: Notifications Section
  notifications: {
    en: 'Notifications',
    hi: 'सूचनाएं',
    mr: 'सूचना',
  },
  notificationsDesc: {
    en: 'Choose which updates you want to receive.',
    hi: 'चुनें कि आप कौन से अपडेट प्राप्त करना चाहते हैं।',
    mr: 'तुम्हाला कोणते अपडेट्स मिळवायचे आहेत ते निवडा.',
  },
  donationClaimed: {
    en: 'Donation claimed',
    hi: 'दान का दावा किया गया',
    mr: 'दानाचा दावा केला गेला',
  },
  donationClaimedDesc: {
    en: 'Get notified when an NGO or volunteer claims your donation.',
    hi: 'जब कोई NGO या स्वयंसेवक आपके दान का दावा करता है तो सूचित हों।',
    mr: 'जेव्हा एखादी NGO किंवा स्वयंसेवक तुमच्या दानाचा दावा करतो तेव्हा सूचित व्हा.',
  },
  pickupReminders: {
    en: 'Pickup reminders',
    hi: 'पिकअप रिमाइंडर',
    mr: 'पिकअप स्मरणपत्रे',
  },
  pickupRemindersDesc: {
    en: 'Receive reminders before a scheduled pickup.',
    hi: 'निर्धारित पिकअप से पहले अनुस्मारक प्राप्त करें।',
    mr: 'नियोजित पिकअपपूर्वी स्मरणपत्रे मिळवा.',
  },
  newNGORequests: {
    en: 'New NGO requests',
    hi: 'नए NGO अनुरोध',
    mr: 'नवीन NGO विनंत्या',
  },
  newNGORequestsDesc: {
    en: 'Get notified when an NGO requests available food.',
    hi: 'जब कोई NGO उपलब्ध भोजन का अनुरोध करती है तो सूचित हों।',
    mr: 'जेव्हा एखादी NGO उपलब्ध अन्नाची विनंती करते तेव्हा सूचित व्हा.',
  },
  donationCompleted: {
    en: 'Donation completed',
    hi: 'दान पूर्ण हुआ',
    mr: 'दान पूर्ण झाले',
  },
  donationCompletedDesc: {
    en: 'Receive confirmation when a donation is successfully completed.',
    hi: 'दान सफलतापूर्वक पूरा होने पर पुष्टि प्राप्त करें।',
    mr: 'दान यशस्वीरित्या पूर्ण झाल्यावर पुष्टीकरण मिळवा.',
  },
  messagesNotif: {
    en: 'Messages',
    hi: 'संदेश',
    mr: 'संदेश',
  },
  messagesNotifDesc: {
    en: 'Get notified when you receive a new message.',
    hi: 'नया संदेश प्राप्त होने पर सूचित हों।',
    mr: 'नवीन संदेश मिळाल्यावर सूचित व्हा.',
  },
  notificationChannels: {
    en: 'Notification Channels',
    hi: 'अधिसूचना चैनल',
    mr: 'सूचना चॅनेल',
  },
  inAppNotif: {
    en: 'In-app notifications',
    hi: 'इन-ऐप सूचनाएं',
    mr: 'इन-अॅप सूचना',
  },
  emailNotif: {
    en: 'Email notifications',
    hi: 'ईमेल सूचनाएं',
    mr: 'ईमेल सूचना',
  },
  smsNotif: {
    en: 'SMS notifications',
    hi: 'एसएमएस सूचनाएं',
    mr: 'एसएमएस सूचना',
  },

  // Settings: Donation Preferences Section
  donationPreferences: {
    en: 'Donation Preferences',
    hi: 'दान प्राथमिकताएं',
    mr: 'दान प्राधान्ये',
  },
  donationPreferencesDesc: {
    en: 'Set your default preferences when creating food donations.',
    hi: 'खाद्य दान बनाते समय अपनी डिफ़ॉल्ट प्राथमिकताएं सेट करें।',
    mr: 'अन्नदान तयार करताना आपली डीफॉल्ट प्राधान्ये सेट करा.',
  },
  defaultFoodType: {
    en: 'Default Food Type',
    hi: 'डिफ़ॉल्ट भोजन प्रकार',
    mr: 'डीफॉल्ट अन्न प्रकार',
  },
  vegetarian: {
    en: 'Vegetarian',
    hi: 'शाकाहारी',
    mr: 'शाकाहारी',
  },
  nonVegetarian: {
    en: 'Non-Vegetarian',
    hi: 'मांसाहारी',
    mr: 'मांसाहारी',
  },
  both: {
    en: 'Both',
    hi: 'दोनों',
    mr: 'दोन्ही',
  },
  defaultPickupWindow: {
    en: 'Default Pickup Window',
    hi: 'डिफ़ॉल्ट पिकअप समय',
    mr: 'डीफॉल्ट पिकअप वेळ',
  },
  dinnerSurplus: {
    en: '7:00 PM – 9:00 PM (Dinner Surplus)',
    hi: 'शाम 7:00 – 9:00 (रात का बचा भोजन)',
    mr: 'संध्याकाळी 7:00 – 9:00 (रात्रीचे शिल्लक अन्न)',
  },
  lunchSurplus: {
    en: '12:00 PM – 2:00 PM (Lunch Surplus)',
    hi: 'दोपहर 12:00 – 2:00 (दोपहर का भोजन)',
    mr: 'दुपारी 12:00 – 2:00 (दुपारचे अन्न)',
  },
  afternoonSurplus: {
    en: '4:00 PM – 6:00 PM (Afternoon / High Tea)',
    hi: 'शाम 4:00 – 6:00 (दोपहर की चाय)',
    mr: 'संध्याकाळी 4:00 – 6:00 (दुपारचा चहा/अल्पोपहार)',
  },
  lateNightSurplus: {
    en: '9:00 PM – 11:00 PM (Late Night Closing)',
    hi: 'रात 9:00 – 11:00 (देर रात समापन)',
    mr: 'रात्री 9:00 – 11:00 (उशिरा रात्रीचे समापन)',
  },
  flexibleWindow: {
    en: 'Flexible (Within 3 hours of posting)',
    hi: 'लचीला (पोस्ट करने के 3 घंटे के भीतर)',
    mr: 'लवचिक (पोस्ट केल्याच्या ३ तासांच्या आत)',
  },
  minimumDonationQuantity: {
    en: 'Minimum Donation Quantity',
    hi: 'न्यूनतम दान मात्रा',
    mr: 'किमान दान प्रमाण',
  },
  minQuantitySubtext: {
    en: 'Minimum number of portions required for an NGO batch collection.',
    hi: 'NGO बैच संग्रह के लिए आवश्यक भागों की न्यूनतम संख्या।',
    mr: 'NGO बॅच संकलनासाठी आवश्यक जेवणाचे किमान प्रमाण.',
  },
  allowVolunteersToClaim: {
    en: 'Allow volunteers to claim donations',
    hi: 'स्वयंसेवकों को दान का दावा करने की अनुमति दें',
    mr: 'स्वयंसेवकांना दानाचा दावा करण्याची परवानगी द्या',
  },
  allowVolunteersDesc: {
    en: 'Allow verified individual food volunteers to collect and route meals to nearby shelters.',
    hi: 'सत्यापित व्यक्तिगत स्वयंसेवकों को भोजन एकत्र करने और आश्रयों तक पहुंचाने की अनुमति दें।',
    mr: 'प्रमाणित वैयक्तिक स्वयंसेवकांना जेवण गोळा करून जवळच्या निवाऱ्यांपर्यंत पोहोचवण्याची परवानगी द्या.',
  },
  autoNotifyNearbyNGOs: {
    en: 'Automatically notify nearby NGOs',
    hi: 'आस-पास के NGO को स्वचालित रूप से सूचित करें',
    mr: 'जवळपासच्या NGO ला स्वयंचलितपणे सूचित करा',
  },
  autoNotifyDesc: {
    en: 'Broadcast instant radar alerts to verified NGOs within your pickup radius upon publication.',
    hi: 'प्रकाशन पर अपने पिकअप दायरे में सत्यापित NGO को तत्काल रडार अलर्ट भेजें।',
    mr: 'प्रसिद्धीनंतर आपल्या पिकअप त्रिज्येत प्रमाणित NGO ना त्वरित रडार सूचना पाठवा.',
  },

  // Settings: Pickup Preferences Section
  pickupPreferences: {
    en: 'Pickup Preferences',
    hi: 'पिकअप प्राथमिकताएं',
    mr: 'पिकअप प्राधान्ये',
  },
  pickupPreferencesDesc: {
    en: 'Configure how your food donations are collected.',
    hi: 'कॉन्फ़िगर करें कि आपके खाद्य दान कैसे एकत्र किए जाते हैं।',
    mr: 'तुमचे अन्नदान कसे गोळा केले जाते ते कॉन्फिगर करा.',
  },
  preferredPickupRadius: {
    en: 'Preferred Pickup Radius',
    hi: 'पसंदीदा पिकअप दायरा',
    mr: 'पसंतीची पिकअप त्रिज्या',
  },
  within2km: {
    en: 'Within 2 km',
    hi: '2 किमी के भीतर',
    mr: '२ किमी च्या आत',
  },
  within5km: {
    en: 'Within 5 km',
    hi: '5 किमी के भीतर',
    mr: '५ किमी च्या आत',
  },
  within10km: {
    en: 'Within 10 km',
    hi: '10 किमी के भीतर',
    mr: '१० किमी च्या आत',
  },
  within15km: {
    en: 'Within 15 km',
    hi: '15 किमी के भीतर',
    mr: '१५ किमी च्या आत',
  },
  preferredPickupMethod: {
    en: 'Preferred Pickup Method',
    hi: 'पसंदीदा पिकअप विधि',
    mr: 'पसंतीची पिकअप पद्धत',
  },
  ngoPickup: {
    en: 'NGO pickup',
    hi: 'NGO पिकअप',
    mr: 'NGO पिकअप',
  },
  ngoPickupDesc: {
    en: 'Direct collection by NGO vehicle teams',
    hi: 'NGO वाहन टीमों द्वारा प्रत्यक्ष संग्रह',
    mr: 'NGO वाहन पथकांद्वारे थेट संकलन',
  },
  volunteerPickup: {
    en: 'Volunteer pickup',
    hi: 'स्वयंसेवक पिकअप',
    mr: 'स्वयंसेवक पिकअप',
  },
  volunteerPickupDesc: {
    en: 'Individual verified volunteer couriers',
    hi: 'व्यक्तिगत सत्यापित स्वयंसेवक कूरियर',
    mr: 'वैयक्तिक प्रमाणित स्वयंसेवक कुरिअर',
  },
  either: {
    en: 'Either',
    hi: 'कोई भी',
    mr: 'कोणतेही',
  },
  eitherDesc: {
    en: 'Accept both NGOs and verified volunteers',
    hi: 'NGO और सत्यापित स्वयंसेवक दोनों स्वीकार करें',
    mr: 'NGO आणि प्रमाणित स्वयंसेवक दोन्ही स्वीकारा',
  },
  allowPickupBeforeExpiry: {
    en: 'Allow pickup before expiry',
    hi: 'समाप्ति से पहले पिकअप की अनुमति दें',
    mr: 'कालबाह्य होण्यापूर्वी पिकअपला परवानगी द्या',
  },
  allowPickupExpiryDesc: {
    en: 'Authorize expedited early pickups if food safety or temperature thresholds require rapid collection.',
    hi: 'यदि खाद्य सुरक्षा या तापमान सीमा के लिए त्वरित संग्रह की आवश्यकता है तो त्वरित पिकअप अधिकृत करें।',
    mr: 'अन्न सुरक्षा किंवा तापमान मर्यादांमुळे त्वरित संकलनाची गरज असल्यास जलद पिकअप अधिकृत करा.',
  },

  // Settings: Account & Security Section
  accountSecurity: {
    en: 'Account & Security',
    hi: 'खाता और सुरक्षा',
    mr: 'खाते आणि सुरक्षा',
  },
  accountSecurityDesc: {
    en: 'Manage credentials, authentication, and active sessions.',
    hi: 'क्रेडेंशियल्स, प्रमाणीकरण और सक्रिय सत्र प्रबंधित करें।',
    mr: 'क्रेडेंशियल्स, प्रमाणीकरण आणि सक्रिय सत्रे व्यवस्थापित करा.',
  },
  changePassword: {
    en: 'Change Password',
    hi: 'पासवर्ड बदलें',
    mr: 'पासवर्ड बदला',
  },
  changePasswordDesc: {
    en: 'Update your account password',
    hi: 'अपना खाता पासवर्ड अपडेट करें',
    mr: 'आपला खाते पासवर्ड अपडेट करा',
  },
  twoFactorAuth: {
    en: 'Two-Factor Authentication',
    hi: 'टू-फैक्टर प्रमाणीकरण',
    mr: 'दोन-घटक प्रमाणीकरण',
  },
  twoFactorAuthDesc: {
    en: 'Add an extra layer of security',
    hi: 'सुरक्षा की एक अतिरिक्त परत जोड़ें',
    mr: 'सुरक्षेचा अतिरिक्त थर जोडा',
  },
  loginActivity: {
    en: 'Login Activity',
    hi: 'लॉगिन गतिविधि',
    mr: 'लॉगिन क्रियाकलाप',
  },
  loginActivityDesc: {
    en: 'View recent account activity',
    hi: 'हाल की खाता गतिविधि देखें',
    mr: 'अलीकडील खाते क्रियाकलाप पहा',
  },
  logOutAction: {
    en: 'Log Out',
    hi: 'लॉग आउट',
    mr: 'लॉग आउट',
  },
  logOutDesc: {
    en: 'Sign out of this account',
    hi: 'इस खाते से साइन आउट करें',
    mr: 'या खात्यातून साइन आउट करा',
  },

  // Settings: General Section
  general: {
    en: 'General',
    hi: 'सामान्य',
    mr: 'सामान्य',
  },
  generalDesc: {
    en: 'System localization, display, and device telemetry.',
    hi: 'सिस्टम स्थानीयकरण, प्रदर्शन और डिवाइस टेलीमेट्री।',
    mr: 'प्रणाली स्थानिकरण, प्रदर्शन आणि उपकरण टेलीमेट्री.',
  },
  language: {
    en: 'Language',
    hi: 'भाषा',
    mr: 'भाषा',
  },
  appearance: {
    en: 'Appearance',
    hi: 'दिखावट',
    mr: 'दिसणे',
  },
  lightMode: {
    en: 'Light',
    hi: 'लाइट',
    mr: 'लाइट',
  },
  darkMode: {
    en: 'Dark',
    hi: 'डार्क',
    mr: 'डार्क',
  },
  systemMode: {
    en: 'System',
    hi: 'सिस्टम',
    mr: 'सिस्टम',
  },
  locationServices: {
    en: 'Location Services',
    hi: 'स्थान सेवाएं',
    mr: 'स्थान सेवा',
  },
  locationServicesDesc: {
    en: 'Allow platform to use precise GPS telemetry for automatic Haversine distance calculations and pickup routing.',
    hi: 'स्वचालित दूरी गणना और पिकअप रूटिंग के लिए सटीक जीपीएस टेलीमेट्री का उपयोग करने की अनुमति दें।',
    mr: 'स्वयंचलित अंतर गणना आणि पिकअप मार्गासाठी अचूक जीपीएस टेलीमेट्री वापरण्याची परवानगी द्या.',
  },

  // Settings Actions & Modals
  saveChanges: {
    en: 'Save Changes',
    hi: 'परिवर्तन सहेजें',
    mr: 'बदल जतन करा',
  },
  saving: {
    en: 'Saving...',
    hi: 'सहेजा जा रहा है...',
    mr: 'जतन करत आहे...',
  },
  cancel: {
    en: 'Cancel',
    hi: 'रद्द करें',
    mr: 'रद्द करा',
  },
  settingsSavedToast: {
    en: 'Settings saved successfully.',
    hi: 'सेटिंग्स सफलतापूर्वक सहेजी गईं।',
    mr: 'सेटिंग्ज यशस्वीरित्या जतन केल्या.',
  },
  settingsRevertedToast: {
    en: 'Unsaved changes reverted.',
    hi: 'परिवर्तन पूर्ववत किए गए।',
    mr: 'बदल पूर्ववत केले.',
  },
  currentPassword: {
    en: 'Current Password',
    hi: 'वर्तमान पासवर्ड',
    mr: 'सध्याचा पासवर्ड',
  },
  newPassword: {
    en: 'New Password',
    hi: 'नया पासवर्ड',
    mr: 'नवीन पासवर्ड',
  },
  confirmNewPassword: {
    en: 'Confirm New Password',
    hi: 'नए पासवर्ड की पुष्टि करें',
    mr: 'नवीन पासवर्डची पुष्टी करा',
  },
  updatePassword: {
    en: 'Update Password',
    hi: 'पासवर्ड अपडेट करें',
    mr: 'पासवर्ड अपडेट करा',
  },
  passwordUpdatedToast: {
    en: 'Password updated successfully.',
    hi: 'पासवर्ड सफलतापूर्वक अपडेट किया गया।',
    mr: 'पासवर्ड यशस्वीरित्या अपडेट केला.',
  },
  twoFactorEnabledToast: {
    en: 'Two-Factor Authentication enabled.',
    hi: 'टू-फैक्टर प्रमाणीकरण सक्षम किया गया।',
    mr: 'दोन-घटक प्रमाणीकरण सक्षम केले.',
  },
  twoFactorDisabledToast: {
    en: 'Two-Factor Authentication disabled.',
    hi: 'टू-फैक्टर प्रमाणीकरण अक्षम किया गया।',
    mr: 'दोन-घटक प्रमाणीकरण अक्षम केले.',
  },
  recentLoginActivity: {
    en: 'Recent Login Activity',
    hi: 'हाल की लॉगिन गतिविधि',
    mr: 'अलीकडील लॉगिन क्रियाकलाप',
  },
  currentSession: {
    en: 'Current Session',
    hi: 'वर्तमान सत्र',
    mr: 'सध्याचे सत्र',
  },
  activeNow: {
    en: 'Active Now',
    hi: 'अब सक्रिय',
    mr: 'आता सक्रिय',
  },
  close: {
    en: 'Close',
    hi: 'बंद करें',
    mr: 'बंद करा',
  },
  signOutConfirmHeading: {
    en: 'Sign Out',
    hi: 'साइन आउट',
    mr: 'साइन आउट',
  },
  signOutConfirmText: {
    en: 'Are you sure you want to sign out?',
    hi: 'क्या आप निश्चित रूप से साइन आउट करना चाहते हैं?',
    mr: 'तुम्हाला नक्की साइन आउट करायचे आहे का?',
  },
  yesSignOut: {
    en: 'Yes, Sign Out',
    hi: 'हाँ, साइन आउट करें',
    mr: 'होय, साइन आउट करा',
  },

  // Dashboard Stats & Text
  welcomeBack: {
    en: 'Welcome back,',
    hi: 'वापसी पर स्वागत है,',
    mr: 'पुन्हा स्वागत आहे,',
  },
  donorSubtitle: {
    en: 'Turn surplus food into meaningful impact. Route freshly prepared meals to verified local NGOs before expiry.',
    hi: 'अतिरिक्त भोजन को सार्थक प्रभाव में बदलें। समाप्ति से पहले सत्यापित स्थानीय NGO को ताजा भोजन पहुंचाएं।',
    mr: 'शिल्लक अन्नाचे अर्थपूर्ण मदतीत रूपांतर करा. कालबाह्य होण्यापूर्वी प्रमाणित स्थानिक NGO ना ताजे अन्न पोहोचवा.',
  },
  ngoSubtitle: {
    en: 'Find available food near you and help feed your community. Real-time matching based on distance, quantity fit, and pickup deadlines.',
    hi: 'अपने पास उपलब्ध भोजन खोजें और अपने समुदाय को खिलाने में मदद करें। दूरी, मात्रा और समय सीमा पर आधारित मिलान।',
    mr: 'आपल्या जवळ उपलब्ध अन्न शोधा आणि भुकेल्यांना मदत करा. अंतर, प्रमाण आणि मुदतीवर आधारित रिअल-टाइम जुळवणी.',
  },
  addFoodDonation: {
    en: 'Add Food Donation',
    hi: 'भोजन दान जोड़ें',
    mr: 'अन्नदान जोडा',
  },
  viewNGORequests: {
    en: 'View NGO Requests',
    hi: 'NGO अनुरोध देखें',
    mr: 'NGO विनंत्या पहा',
  },
  findFoodNearby: {
    en: 'Find Food Nearby',
    hi: 'आस-पास भोजन खोजें',
    mr: 'जवळपास अन्न शोधा',
  },
  mealsDonated: {
    en: 'Meals Donated',
    hi: 'दान किए गए भोजन',
    mr: 'दान केलेले जेवण',
  },
  activeDonations: {
    en: 'Active Donations',
    hi: 'सक्रिय दान',
    mr: 'सक्रिय दाने',
  },
  successfulPickups: {
    en: 'Successful Pickups',
    hi: 'सफल पिकअप',
    mr: 'यशस्वी पिकअप',
  },
  peopleImpacted: {
    en: 'People Impacted',
    hi: 'प्रभावित लोग',
    mr: 'मदत मिळालेले लोक',
  },
  peopleServed: {
    en: 'People Served',
    hi: 'सेवा प्राप्त लोग',
    mr: 'लाभार्थी लोक',
  },
  availableFoodNearby: {
    en: 'Available Food Nearby',
    hi: 'पास में उपलब्ध भोजन',
    mr: 'जवळ उपलब्ध अन्न',
  },
  pendingRequests: {
    en: 'Pending Requests',
    hi: 'लंबित अनुरोध',
    mr: 'प्रलंबित विनंत्या',
  },
  confirmedPickups: {
    en: 'Confirmed Pickups',
    hi: 'पुष्टि किए गए पिकअप',
    mr: 'निश्चित पिकअप',
  },
  myFoodListings: {
    en: 'My Food Listings',
    hi: 'मेरी खाद्य सूचियां',
    mr: 'माझी अन्न यादी',
  },
  surplusFoodRanked: {
    en: 'Surplus Food Ranked for You',
    hi: 'आपके लिए अनुक्रमित अतिरिक्त भोजन',
    mr: 'तुमच्यासाठी प्राधान्य दिलेले शिल्लक अन्न',
  },
  viewAll: {
    en: 'View All',
    hi: 'सभी देखें',
    mr: 'सर्व पहा',
  },
  actionRequiredRequests: {
    en: 'Action Required: Incoming NGO Request(s)',
    hi: 'कार्रवाई आवश्यक: आने वाले NGO अनुरोध',
    mr: 'कृती आवश्यक: नवीन NGO विनंती',
  },
  actionRequiredDesc: {
    en: 'Local NGOs have submitted requests for your surplus food. Review and accept an NGO to lock pickup.',
    hi: 'स्थानीय NGO ने आपके अतिरिक्त भोजन के लिए अनुरोध सबमिट किए हैं। पिकअप लॉक करने के लिए समीक्षा करें और स्वीकार करें।',
    mr: 'स्थानिक NGO नी तुमच्या अन्नासाठी विनंत्या पाठवल्या आहेत. पिकअप निश्चित करण्यासाठी पुनरावलोकन करा.',
  },
  reviewNGORequests: {
    en: 'Review NGO Requests',
    hi: 'NGO अनुरोधों की समीक्षा करें',
    mr: 'NGO विनंत्यांचे पुनरावलोकन करा',
  },

  // Profile
  orgProfile: {
    en: 'Organization Profile',
    hi: 'संगठन प्रोफ़ाइल',
    mr: 'संस्था प्रोफाइल',
  },
  orgName: {
    en: 'Organization Name:',
    hi: 'संगठन का नाम:',
    mr: 'संस्थेचे नाव:',
  },
  registeredEmail: {
    en: 'Registered Email:',
    hi: 'पंजीकृत ईमेल:',
    mr: 'नोंदणीकृत ईमेल:',
  },
  assignedRole: {
    en: 'Assigned Role:',
    hi: 'सौंपा गया रोल:',
    mr: 'दिलेली भूमिका:',
  },
  locationLabel: {
    en: 'Location:',
    hi: 'स्थान:',
    mr: 'स्थान:',
  },
  statusLabel: {
    en: 'Status:',
    hi: 'स्थिति:',
    mr: 'स्थिती:',
  },
  verifiedActive: {
    en: 'Verified Active',
    hi: 'सत्यापित सक्रिय',
    mr: 'प्रमाणित सक्रिय',
  },
};
