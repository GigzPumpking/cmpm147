// project.js - Arknights Gacha Simulator
// Author: Hung Nguyen
// Date: 04/07/2024

function main() {
  const fillers = {
    six_operator: ["SilverAsh", "Siege", "Angelina", "Thorns", "Weedy", "Surtr", 
                   "Mountain", "Skadi", "Skadi the Corrupting Heart", "Nearl the Radiant Knight", 
                   "Shining", "Nightingale", "Ling", "Dusk", "Nian", "Chongyue", "Shu", "Hellagur", 
                   "Degenbrecher", "Specter the Unchained", "Ch'en the Holungday", "Ch'en", "Aak", 
                   "Lee", "Eyjafjalla", "Eyjafjalla the Hvit Aska", "Saria", "Mlynar", "Bagpipe", 
                   "Suzuran", "Kirin R Yato", "Ines", "Gavial the Invincible", "Blaze", "Horn", "Lin", 
                   "Texas the Omertosa", "Exusiai", "Kal'tsit", "Ifrit", "Ash", "Saga", "Penance", 
                   "W", "Ceobe", "Mostima", "Gladiia", "Swire the Elegant Wit", "Blemishine", "Irene", 
                   "Archetto", "Ho'olheyak", "Lumen", "Phantom", "Vigil", "Silence the Paradigmatic", 
                   "Magallan", "Flametail", "Goldenglow", "Passenger", "Executor the Ex Foedere", "Schwarz", 
                   "Reed the Flame Shadow", "Mudrock", "Dorothy", "Jessica the Liberated", "Fiammetta", 
                   "Gnosis", "Ebenholz", "Eunectes", "Hoshiguma", "Mizuki", "Muelyses", "Pallas", 
                   "Pozemka", "Qiubai", "Rosa", "Rosmontis", "Saileach", "Stainless", "Typhon", "Zuo Le", "Ray"],
    five_operator: ["Absinthe", "Akafuyu", "Almond", "Amiya", "Andreana", "Aosta", "April", "Asbestos", "Ashlock", "Astesia", 
                    "Astgenne", "Aurora", "Ayerscarpe", "Beeswax", "Bena", "Bibeak", "Bison", "Blacknight", "Blitz", "Blue Poison", 
                    "Breeze", "Broca", "Bryophyta", "Cantabile", "Cement", "Ceylon", "Chiave", "Cliffheart", "Coldshot", 
                    "Corroserum", "Croissant", "Czerny", "Dagda", "Elysium", "Enforcer", "Erato", "Executor", "FEater", "Firewatch", 
                    "Firewhistle", "Flamebringer", "Flint", "Folinic", "Franka", "Frost", "Glaucus", "Grani", "GreyThroat", 
                    "Greyy the Lightningbearer", "Harmonie", "Heavyrain", "Heidi", "Hibiscus the Purifier", "Highmore", "Honeyberry", 
                    "Hung", "Indra", "Insider", "Iris", "Istina", "Jieyun", "Kafka", "Kazemaru", "Kestrel", "Kiara", "Kjera", 
                    "Kroos the Keen Glint", "La Pluma", "Lappland", "Lava the Purgatory", "Leizi", "Leonhardt", "Liskarm", "Lunacub", 
                    "Manticore", "Mayer", "Melanite", "Meteorite", "Minimalist", "Mint", "Morgan", "Mr. Nothing", "Mulberry", 
                    "Nearl", "Nightmare", "Nine-Colored Deer", "Paprika", "Platinum", "Poncirus", "Pramanix", "Projekt Red", "Provence", 
                    "Proviso", "Ptilopsis", "Puzzle", "Qanipalaat", "Quercus", "Rathalos S Noir Corne", "Reed", "Robin", "Rockrock", 
                    "Santalla", "Savage", "Scene", "Sesa", "Shalem", "Shamare", "Sideroca", "Silence", "Skyfire", "Snowsant", "Sora", 
                    "Specter", "Spuria", "Swire", "Tachanka", "Tequila", "Texas", "Toddifons", "Tomimi", "Tsukinogi", "Tuye", "Valarqvin", 
                    "Vulcan", "Waai Fu", "Warfarin", "Whislash", "Whisperain", "Wild Mane", "Wind Chimes", "Windflit", "Zima"],
    four_operator: ["Aciddrop", "Ambriel", "Arene", "Beanstalk", "Beehunter", "Bubble", 
                    "Chestnut", "Click", "Conviction", "Courier", "Cuora", "Cutter", "Deepcolor", 
                    "Dobermann", "Dur-nar", "Earthspirit", "Estelle", "Ethan", "Frostleaf", 
                    "Gavial", "Gitano", "Gravel", "Greyy", "Gummy", "Haze", "Humus", "Indigo", 
                    "Jackie", "Jaye", "Jessica", "Luo Xiaohei", "Matoimaru", "Matterhorn", "May", 
                    "Meteor", "Mousse", "Myrrh", "Myrtle", "Perfumer", "Pinecone", "Podenco", 
                    "Pudding", "Purestream", "Quartz", "Roberta", "Rope", "Scavenger", "Shaw", 
                    "Shirayuki", "Sussuro", "Totter", "Utage", "Vermeil", "Vigna"],
    three_operator: ["Adnachiel", "Ansel", "Beagle", "Cardigan", 
                     "Catapult", "Fang", "Hibiscus", "Kroos", 
                     "Lava", "Melantha", "Midnight", "Orchid", 
                     "Plume", "Popukar", "Spot", "Steward", "Vanilla"],
    two_operator: ["12F", "Durin", "Noir Corne", "Rangers", "Yato"],
    one_operator: ["Castle-3", "Friston-3", "Justice Knight", "Lancet-2", "THRM-EX", "Terra Research Commission", "U-Official"]
  };
  
  const template = `Doctor,

  Your starting operators in the game are:
  
  2 star operators: $two_operator, $two_operator
  1 star operators: $one_operator
  
  Here are the results of your latest 10-pull on the current banner!
  
  6 star operators: $six_operator
  5 star operators: $five_operator, $five_operator
  4 star operators: $four_operator, $four_operator, $four_operator, $four_operator, $four_operator
  3 star operators: $three_operator, $three_operator
  
  Congratulations!
  
  (Any duplicates are turned into potential tokens for the operator)
  `;
  
  // STUDENTS: You don't need to edit code below this line.
  
  const slotPattern = /\$(\w+)/;
  
  function replacer(match, name) {
    let options = fillers[name];
    if (options) {
      return options[Math.floor(Math.random() * options.length)];
    } else {
      return `<UNKNOWN:${name}>`;
    }
  }
  
  function generate() {
    let story = template;
    while (story.match(slotPattern)) {
      story = story.replace(slotPattern, replacer);
    }
    
    console.log(story);
    
    /* global box */
    $("#box").text(story);
  }

  /* global clicker */
  $("#clicker").click(generate);
  
  generate();
  
}

main();