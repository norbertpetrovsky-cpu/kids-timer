// ── FOOD DATABASE ──
const FOOD_DB = [
  // 🌾 GRAINS
  { id:'pancakes',  emoji:'🥞', name:'Pancakes',   cat:'grains',   type:'solid'  },
  { id:'toast',     emoji:'🍞', name:'Toast',       cat:'grains',   type:'solid'  },
  { id:'porridge',  emoji:'🥣', name:'Porridge',    cat:'grains',   type:'solid'  },
  { id:'rice',      emoji:'🍚', name:'Rice',        cat:'grains',   type:'solid'  },
  { id:'pasta',     emoji:'🍝', name:'Pasta',       cat:'grains',   type:'solid'  },
  { id:'cereal',    emoji:'🥜', name:'Cereal',      cat:'grains',   type:'solid'  },
  { id:'bread',     emoji:'🫓', name:'Bread',       cat:'grains',   type:'solid'  },
  { id:'croissant', emoji:'🥐', name:'Croissant',   cat:'grains',   type:'solid'  },
  { id:'noodles',   emoji:'🍜', name:'Noodles',     cat:'grains',   type:'solid'  },

  // 🥩 PROTEIN
  { id:'chicken',   emoji:'🍗', name:'Chicken',     cat:'protein',  type:'solid'  },
  { id:'egg',       emoji:'🥚', name:'Egg',         cat:'protein',  type:'solid'  },
  { id:'fish',      emoji:'🐟', name:'Fish',        cat:'protein',  type:'solid'  },
  { id:'meatball',  emoji:'🍖', name:'Meatball',    cat:'protein',  type:'solid'  },
  { id:'sausage',   emoji:'🌭', name:'Sausage',     cat:'protein',  type:'solid'  },
  { id:'beef',      emoji:'🥩', name:'Beef',        cat:'protein',  type:'solid'  },
  { id:'shrimp',    emoji:'🍤', name:'Shrimp',      cat:'protein',  type:'solid'  },

  // 🥦 VEGETABLES
  { id:'broccoli',  emoji:'🥦', name:'Broccoli',    cat:'veggies',  type:'solid'  },
  { id:'carrot',    emoji:'🥕', name:'Carrot',      cat:'veggies',  type:'solid'  },
  { id:'corn',      emoji:'🌽', name:'Corn',        cat:'veggies',  type:'solid'  },
  { id:'tomato',    emoji:'🍅', name:'Tomato',      cat:'veggies',  type:'solid'  },
  { id:'cucumber',  emoji:'🥒', name:'Cucumber',    cat:'veggies',  type:'solid'  },
  { id:'potato',    emoji:'🥔', name:'Potato',      cat:'veggies',  type:'solid'  },
  { id:'spinach',   emoji:'🥬', name:'Spinach',     cat:'veggies',  type:'solid'  },
  { id:'peas',      emoji:'🫛', name:'Peas',        cat:'veggies',  type:'solid'  },
  { id:'pepper',    emoji:'🫑', name:'Pepper',      cat:'veggies',  type:'solid'  },

  // 🍎 FRUIT
  { id:'apple',     emoji:'🍎', name:'Apple',       cat:'fruit',    type:'solid'  },
  { id:'banana',    emoji:'🍌', name:'Banana',      cat:'fruit',    type:'solid'  },
  { id:'strawberry',emoji:'🍓', name:'Strawberry',  cat:'fruit',    type:'solid'  },
  { id:'blueberry', emoji:'🫐', name:'Blueberry',   cat:'fruit',    type:'solid'  },
  { id:'orange',    emoji:'🍊', name:'Orange',      cat:'fruit',    type:'solid'  },
  { id:'grapes',    emoji:'🍇', name:'Grapes',      cat:'fruit',    type:'solid'  },
  { id:'watermelon',emoji:'🍉', name:'Watermelon',  cat:'fruit',    type:'solid'  },
  { id:'peach',     emoji:'🍑', name:'Peach',       cat:'fruit',    type:'solid'  },

  // 🧀 DAIRY
  { id:'cheese',    emoji:'🧀', name:'Cheese',      cat:'dairy',    type:'solid'  },
  { id:'milk',      emoji:'🥛', name:'Milk',        cat:'dairy',    type:'liquid' },
  { id:'butter',    emoji:'🧈', name:'Butter',      cat:'dairy',    type:'solid'  },
  { id:'yogurt',    emoji:'🍦', name:'Yogurt',      cat:'dairy',    type:'solid'  },

  // 🍜 OTHER
  { id:'soup',      emoji:'🍲', name:'Soup',        cat:'other',    type:'liquid' },
  { id:'vyvar',     emoji:'🥣', name:'Vývar',       cat:'other',    type:'liquid' },
  { id:'pizza',     emoji:'🍕', name:'Pizza',       cat:'other',    type:'solid'  },
  { id:'sandwich',  emoji:'🥪', name:'Sandwich',    cat:'other',    type:'solid'  },
  { id:'fries',     emoji:'🍟', name:'Fries',       cat:'other',    type:'solid'  },
  { id:'dumpling',  emoji:'🥟', name:'Dumpling',    cat:'other',    type:'solid'  },
  { id:'salad',     emoji:'🥗', name:'Salad',       cat:'other',    type:'solid'  },
  { id:'ricebowl',  emoji:'🍛', name:'Rice Bowl',   cat:'other',    type:'solid'  },
];

const CAT_META = {
  grains:  { label: '🌾 Grains',      color: '#fff8e1', accent: '#ff9800' },
  protein: { label: '🥩 Protein',     color: '#fce4ec', accent: '#e91e63' },
  veggies: { label: '🥦 Vegetables',  color: '#e8f5e9', accent: '#43a047' },
  fruit:   { label: '🍎 Fruit',       color: '#f3e5f5', accent: '#9c27b0' },
  dairy:   { label: '🧀 Dairy',       color: '#e3f2fd', accent: '#1e88e5' },
  other:   { label: '🍜 Other',       color: '#fff3e0', accent: '#ff7043' },
};

const CAT_ORDER = ['grains','protein','veggies','fruit','dairy','other'];
