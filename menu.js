/*
 * 剑锋家菜单 · 80 道当前菜单，50 张菜图 + 30 张文字卡。
 * id 是持久化选择标识，调整排序或菜名时不要改变；精简菜留在 archivedDishes。
 * imageKey 对应 images.js 的图片键；recommendation 展示口味与口感，ingredients 仅供搜索。
 * 多分类共享同一菜品 ID。variants 是同一菜的做法/鱼种，cartName 用于核对与复制。
 * kids 仅表示口味偏好候选，具体辣度与忌口以客人统一备注为准。
 */
(() => {
  const categories = [
  {
    "id": "signature",
    "label": "家里招牌",
    "count": 6
  },
  {
    "id": "signature-set",
    "label": "招牌套餐",
    "count": 10
  },
  {
    "id": "hakka",
    "label": "客家经典",
    "count": 7
  },
  {
    "id": "pork",
    "label": "下饭肉菜",
    "count": 15
  },
  {
    "id": "chicken",
    "label": "鸡肉与蛋",
    "count": 13
  },
  {
    "id": "beef",
    "label": "牛肉好菜",
    "count": 5
  },
  {
    "id": "seafood",
    "label": "鱼虾海鲜",
    "count": 20
  },
  {
    "id": "vegetables",
    "label": "蔬菜小菜",
    "count": 10
  },
  {
    "id": "soup",
    "label": "热汤与粥",
    "count": 9
  },
  {
    "id": "night",
    "label": "宵夜加点",
    "count": 9
  }
];
  const dishes = [
  {
    "id": "dish-001",
    "name": "豆豉蒸排骨",
    "ingredients": "排骨 · 豆豉",
    "categories": [
      "signature",
      "pork"
    ],
    "tags": [],
    "imageKey": "豆豉蒸排骨",
    "recommendation": "豉香鲜嫩",
    "role": "meat",
    "display": "photo",
    "aliases": [
      "蒸排骨"
    ]
  },
  {
    "id": "dish-002",
    "name": "酸甜排骨",
    "ingredients": "排骨 · 酸甜口味",
    "categories": [
      "pork"
    ],
    "tags": [
      "kids"
    ],
    "imageKey": "酸甜排骨",
    "recommendation": "酸甜开胃",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-003",
    "name": "排骨芋头煲",
    "ingredients": "排骨 · 芋头",
    "categories": [
      "pork"
    ],
    "tags": [],
    "imageKey": "排骨芋头煲",
    "recommendation": "软糯浓香",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-005",
    "name": "香煎猪颈肉",
    "ingredients": "猪颈肉 · 香煎",
    "categories": [
      "pork"
    ],
    "tags": [],
    "imageKey": "香煎猪颈肉",
    "recommendation": "嫩脆焦香",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-006",
    "name": "香煎五花肉",
    "ingredients": "五花肉 · 香煎",
    "categories": [
      "pork"
    ],
    "tags": [],
    "imageKey": "香煎五花肉",
    "recommendation": "焦香丰腴",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-007",
    "name": "酸菜炒生肠",
    "ingredients": "酸菜 · 生肠",
    "categories": [
      "pork"
    ],
    "tags": [],
    "imageKey": "酸菜炒生肠",
    "recommendation": "酸香爽脆",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-011",
    "name": "酿苦瓜、辣椒、豆腐",
    "ingredients": "想选哪种酿菜，可在点菜单中备注",
    "categories": [
      "pork",
      "hakka"
    ],
    "tags": [
      "hakka"
    ],
    "imageKey": "酿苦瓜、辣椒、豆腐",
    "recommendation": "酿出家常鲜",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-012",
    "name": "梅菜肉饼",
    "ingredients": "梅菜 · 肉饼",
    "categories": [
      "pork",
      "hakka"
    ],
    "tags": [
      "hakka"
    ],
    "imageKey": "梅菜肉饼",
    "recommendation": "咸香软嫩",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-013",
    "name": "凉拌猪肚",
    "ingredients": "猪肚 · 凉拌",
    "categories": [
      "night"
    ],
    "tags": [],
    "imageKey": "凉拌猪肚",
    "recommendation": "爽脆开胃",
    "role": "side",
    "display": "text"
  },
  {
    "id": "dish-016",
    "name": "猪脚醋煲",
    "ingredients": "猪脚 · 醋香",
    "categories": [
      "pork",
      "signature-set"
    ],
    "tags": [],
    "imageKey": "猪脚醋煲",
    "recommendation": "酸香软糯",
    "role": "meat",
    "display": "photo",
    "aliases": [
      "猪脚醋",
      "猪脚姜"
    ]
  },
  {
    "id": "dish-017",
    "name": "三杯鸡",
    "ingredients": "鸡肉 · 三杯做法",
    "categories": [
      "chicken"
    ],
    "tags": [],
    "imageKey": "三杯鸡",
    "recommendation": "酱香浓郁",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-018",
    "name": "白切鸡",
    "ingredients": "鸡肉 · 白切",
    "categories": [
      "chicken"
    ],
    "tags": [
      "mild"
    ],
    "imageKey": "白切鸡",
    "recommendation": "鲜嫩原香",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-019",
    "name": "盐焗鸡",
    "ingredients": "鸡肉 · 盐焗风味",
    "categories": [
      "chicken",
      "hakka"
    ],
    "tags": [
      "hakka"
    ],
    "imageKey": "盐焗鸡",
    "recommendation": "咸香紧实",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-020",
    "name": "沙姜鸡",
    "ingredients": "鸡肉 · 沙姜",
    "categories": [
      "chicken"
    ],
    "tags": [],
    "imageKey": "沙姜鸡",
    "recommendation": "姜香鲜嫩",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-021",
    "name": "咖喱鸡",
    "ingredients": "鸡肉 · 咖喱",
    "categories": [
      "chicken"
    ],
    "tags": [],
    "imageKey": "咖喱鸡",
    "recommendation": "浓香下饭",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-022",
    "name": "辣子鸡",
    "ingredients": "鸡肉 · 辣椒",
    "categories": [
      "chicken"
    ],
    "tags": [
      "spicy"
    ],
    "imageKey": "辣子鸡",
    "recommendation": "香辣过瘾",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-023",
    "name": "茶树菇蒸鸡",
    "ingredients": "鸡肉 · 茶树菇",
    "categories": [
      "chicken"
    ],
    "tags": [
      "mild"
    ],
    "imageKey": "茶树菇蒸鸡",
    "recommendation": "清鲜入味",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-024",
    "name": "香菇鸡煲",
    "ingredients": "鸡肉 · 香菇",
    "categories": [
      "chicken"
    ],
    "tags": [],
    "imageKey": "香菇鸡煲",
    "recommendation": "浓香滑嫩",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-027",
    "name": "奥尔良烤鸡翅",
    "ingredients": "鸡翅 · 奥尔良风味",
    "categories": [
      "chicken"
    ],
    "tags": [],
    "imageKey": "奥尔良烤鸡翅",
    "recommendation": "甜香入味",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-028",
    "name": "蒸水蛋",
    "ingredients": "鸡蛋 · 清蒸",
    "categories": [
      "chicken"
    ],
    "tags": [
      "mild",
      "kids"
    ],
    "imageKey": "蒸水蛋",
    "recommendation": "柔滑细嫩",
    "role": "meat",
    "display": "text"
  },
  {
    "id": "dish-029",
    "name": "酿蛋",
    "ingredients": "鸡蛋 · 酿制",
    "categories": [
      "signature",
      "chicken",
      "hakka"
    ],
    "tags": [
      "hakka",
      "kids"
    ],
    "imageKey": "酿蛋",
    "recommendation": "蛋香软嫩",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-030",
    "name": "韭菜炒蛋",
    "ingredients": "韭菜 · 鸡蛋",
    "categories": [
      "chicken"
    ],
    "tags": [],
    "imageKey": "韭菜炒蛋",
    "recommendation": "鲜香松软",
    "role": "meat",
    "display": "text"
  },
  {
    "id": "dish-031",
    "name": "姜葱炒牛肉",
    "ingredients": "牛肉 · 姜葱",
    "categories": [
      "beef"
    ],
    "tags": [],
    "imageKey": "姜葱炒牛肉",
    "recommendation": "鲜嫩下饭",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-032",
    "name": "牛腩萝卜煲",
    "ingredients": "牛腩 · 萝卜",
    "categories": [
      "beef"
    ],
    "tags": [],
    "imageKey": "牛腩萝卜煲",
    "recommendation": "软烂浓香",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-033",
    "name": "黑椒牛仔骨",
    "ingredients": "牛仔骨 · 黑椒",
    "categories": [
      "beef"
    ],
    "tags": [],
    "imageKey": "黑椒牛仔骨",
    "recommendation": "椒香浓郁",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-034",
    "name": "孜然炒牛肉",
    "ingredients": "牛肉 · 孜然",
    "categories": [
      "beef"
    ],
    "tags": [],
    "imageKey": "孜然炒牛肉",
    "recommendation": "浓香惹味",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-039",
    "name": "羊肉煲",
    "ingredients": "羊肉 · 煲制",
    "categories": [
      "pork"
    ],
    "tags": [],
    "imageKey": "羊肉煲",
    "recommendation": "醇香入味",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-040",
    "name": "清蒸鱼",
    "ingredients": "鲜鱼 · 清蒸",
    "categories": [
      "seafood",
      "signature-set"
    ],
    "tags": [
      "mild"
    ],
    "imageKey": "清蒸鱼",
    "recommendation": "清鲜嫩滑",
    "role": "meat",
    "display": "photo",
    "aliases": [
      "清蒸鲈鱼",
      "鲈鱼"
    ],
    "defaultVariant": "generic",
    "variants": [
      {
        "id": "generic",
        "label": "鲜鱼",
        "cartName": "清蒸鱼",
        "description": "清鲜嫩滑"
      },
      {
        "id": "bass",
        "label": "鲈鱼",
        "cartName": "清蒸鲈鱼",
        "description": "鲜嫩清香"
      }
    ]
  },
  {
    "id": "dish-041",
    "name": "煎海鱼",
    "ingredients": "海鱼 · 香煎",
    "categories": [
      "seafood"
    ],
    "tags": [],
    "imageKey": "煎海鱼",
    "recommendation": "外香里嫩",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-042",
    "name": "白灼虾",
    "ingredients": "鲜虾 · 白灼",
    "categories": [
      "seafood"
    ],
    "tags": [
      "mild"
    ],
    "imageKey": "白灼虾",
    "recommendation": "清鲜弹嫩",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-044",
    "name": "蒜蓉开边虾",
    "ingredients": "鲜虾 · 蒜蓉",
    "categories": [
      "seafood"
    ],
    "tags": [],
    "imageKey": "蒜蓉开边虾",
    "recommendation": "蒜香鲜甜",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-045",
    "name": "蒜蓉扇贝",
    "ingredients": "扇贝 · 蒜蓉",
    "categories": [
      "seafood"
    ],
    "tags": [],
    "imageKey": "蒜蓉扇贝",
    "recommendation": "蒜香鲜嫩",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-046",
    "name": "蒜蓉蒸鲍鱼",
    "ingredients": "鲍鱼 · 蒜蓉",
    "categories": [
      "seafood"
    ],
    "tags": [],
    "imageKey": "蒜蓉蒸鲍鱼",
    "recommendation": "蒜香弹嫩",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-047",
    "name": "蒜蓉烤生蚝",
    "ingredients": "生蚝 · 蒜蓉 · 烤制",
    "categories": [
      "seafood"
    ],
    "tags": [],
    "imageKey": "蒜蓉烤生蚝",
    "recommendation": "蒜香丰腴",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-049",
    "name": "清蒸生蚝",
    "ingredients": "生蚝 · 清蒸",
    "categories": [
      "seafood"
    ],
    "tags": [
      "mild"
    ],
    "imageKey": "清蒸生蚝",
    "recommendation": "原味鲜甜",
    "role": "meat",
    "display": "text"
  },
  {
    "id": "dish-051",
    "name": "白灼花螺",
    "ingredients": "花螺 · 白灼",
    "categories": [
      "seafood"
    ],
    "tags": [
      "mild"
    ],
    "imageKey": "白灼花螺",
    "recommendation": "清鲜弹脆",
    "role": "meat",
    "display": "text"
  },
  {
    "id": "dish-052",
    "name": "白灼鱿鱼",
    "ingredients": "鱿鱼 · 白灼",
    "categories": [
      "seafood"
    ],
    "tags": [
      "mild"
    ],
    "imageKey": "白灼鱿鱼",
    "recommendation": "清鲜爽弹",
    "role": "meat",
    "display": "text"
  },
  {
    "id": "dish-053",
    "name": "姜葱炒鱿鱼",
    "ingredients": "鱿鱼 · 姜葱",
    "categories": [
      "seafood"
    ],
    "tags": [],
    "imageKey": "姜葱炒鱿鱼",
    "recommendation": "鲜香爽弹",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-054",
    "name": "姜葱炒花甲",
    "ingredients": "花甲 · 姜葱",
    "categories": [
      "seafood"
    ],
    "tags": [],
    "imageKey": "姜葱炒花甲",
    "recommendation": "鲜香入味",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-057",
    "name": "姜葱炒蟹",
    "ingredients": "螃蟹 · 姜葱",
    "categories": [
      "seafood"
    ],
    "tags": [],
    "imageKey": "姜葱炒蟹",
    "recommendation": "鲜香浓郁",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-058",
    "name": "生蚝煎蛋",
    "ingredients": "生蚝 · 鸡蛋",
    "categories": [
      "seafood"
    ],
    "tags": [],
    "imageKey": "生蚝煎蛋",
    "recommendation": "鲜香软嫩",
    "role": "meat",
    "display": "text"
  },
  {
    "id": "dish-060",
    "name": "鱿鱼蒸粉丝",
    "ingredients": "鱿鱼 · 粉丝",
    "categories": [
      "seafood"
    ],
    "tags": [],
    "imageKey": "鱿鱼蒸粉丝",
    "recommendation": "鲜香入味",
    "role": "meat",
    "display": "text"
  },
  {
    "id": "dish-061",
    "name": "苦瓜炒蛋",
    "ingredients": "苦瓜 · 鸡蛋",
    "categories": [
      "vegetables"
    ],
    "tags": [],
    "imageKey": "苦瓜炒蛋",
    "recommendation": "微苦回甘",
    "role": "veg",
    "display": "text"
  },
  {
    "id": "dish-062",
    "name": "炒腰果玉米",
    "ingredients": "腰果 · 玉米",
    "categories": [
      "vegetables"
    ],
    "tags": [],
    "imageKey": "炒腰果玉米",
    "recommendation": "清甜香脆",
    "role": "veg",
    "display": "text"
  },
  {
    "id": "dish-063",
    "name": "腐乳通心菜",
    "ingredients": "通心菜 · 腐乳",
    "categories": [
      "vegetables",
      "signature-set"
    ],
    "tags": [],
    "imageKey": "腐乳通心菜",
    "recommendation": "咸香爽脆",
    "role": "veg",
    "display": "photo",
    "aliases": [
      "腐乳炒通心菜",
      "空心菜",
      "腐乳空心菜"
    ]
  },
  {
    "id": "dish-065",
    "name": "莴笋",
    "ingredients": "莴笋 · 清炒",
    "categories": [
      "vegetables"
    ],
    "tags": [
      "mild"
    ],
    "imageKey": "炒莴笋",
    "recommendation": "清香爽脆",
    "role": "veg",
    "display": "text",
    "aliases": [
      "炒莴笋",
      "清炒莴笋"
    ],
    "defaultVariant": "stir-fry",
    "variants": [
      {
        "id": "stir-fry",
        "label": "清炒",
        "cartName": "清炒莴笋",
        "description": "清香爽口"
      }
    ]
  },
  {
    "id": "dish-066",
    "name": "生菜",
    "ingredients": "生菜 · 清炒",
    "categories": [
      "vegetables"
    ],
    "tags": [
      "mild"
    ],
    "imageKey": "炒生菜",
    "recommendation": "鲜嫩清爽",
    "role": "veg",
    "display": "photo",
    "aliases": [
      "炒生菜",
      "清炒生菜",
      "上汤生菜"
    ],
    "defaultVariant": "stir-fry",
    "variants": [
      {
        "id": "stir-fry",
        "label": "清炒",
        "cartName": "清炒生菜",
        "description": "清香爽口"
      },
      {
        "id": "broth",
        "label": "上汤",
        "cartName": "上汤生菜",
        "description": "汤鲜菜嫩"
      }
    ]
  },
  {
    "id": "dish-067",
    "name": "荷兰豆",
    "ingredients": "荷兰豆 · 清炒",
    "categories": [
      "vegetables"
    ],
    "tags": [
      "mild"
    ],
    "imageKey": "炒荷兰豆",
    "recommendation": "清甜脆嫩",
    "role": "veg",
    "display": "text",
    "aliases": [
      "炒荷兰豆",
      "清炒荷兰豆"
    ],
    "defaultVariant": "stir-fry",
    "variants": [
      {
        "id": "stir-fry",
        "label": "清炒",
        "cartName": "清炒荷兰豆",
        "description": "清香爽口"
      }
    ]
  },
  {
    "id": "dish-069",
    "name": "莲藕",
    "ingredients": "莲藕 · 清炒",
    "categories": [
      "vegetables"
    ],
    "tags": [
      "mild"
    ],
    "imageKey": "炒莲藕",
    "recommendation": "清甜爽脆",
    "role": "veg",
    "display": "text",
    "aliases": [
      "炒莲藕",
      "清炒莲藕"
    ],
    "defaultVariant": "stir-fry",
    "variants": [
      {
        "id": "stir-fry",
        "label": "清炒",
        "cartName": "清炒莲藕",
        "description": "清香爽口"
      }
    ]
  },
  {
    "id": "dish-070",
    "name": "上海青",
    "ingredients": "上海青 · 清炒",
    "categories": [
      "vegetables"
    ],
    "tags": [
      "mild"
    ],
    "imageKey": "炒上海青",
    "recommendation": "清甜鲜嫩",
    "role": "veg",
    "display": "text",
    "aliases": [
      "炒上海青",
      "清炒上海青",
      "上汤上海青",
      "小白菜",
      "青梗菜"
    ],
    "defaultVariant": "stir-fry",
    "variants": [
      {
        "id": "stir-fry",
        "label": "清炒",
        "cartName": "清炒上海青",
        "description": "清香爽口"
      },
      {
        "id": "broth",
        "label": "上汤",
        "cartName": "上汤上海青",
        "description": "汤鲜菜嫩"
      }
    ]
  },
  {
    "id": "dish-071",
    "name": "菠菜",
    "ingredients": "菠菜 · 上汤做法",
    "categories": [
      "vegetables"
    ],
    "tags": [
      "mild"
    ],
    "imageKey": "上汤菠菜",
    "recommendation": "柔嫩清鲜",
    "role": "veg",
    "display": "text",
    "aliases": [
      "上汤菠菜",
      "清炒菠菜",
      "上汤菠菜"
    ],
    "defaultVariant": "broth",
    "variants": [
      {
        "id": "stir-fry",
        "label": "清炒",
        "cartName": "清炒菠菜",
        "description": "清香爽口"
      },
      {
        "id": "broth",
        "label": "上汤",
        "cartName": "上汤菠菜",
        "description": "汤鲜菜嫩"
      }
    ]
  },
  {
    "id": "dish-072",
    "name": "小龙虾",
    "ingredients": "小龙虾 · 口味可备注",
    "categories": [
      "seafood",
      "signature-set"
    ],
    "tags": [],
    "imageKey": "小龙虾",
    "recommendation": "鲜香惹味",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-073",
    "name": "酸菜鱼",
    "ingredients": "鲜鱼 · 酸菜",
    "categories": [
      "seafood"
    ],
    "tags": [],
    "imageKey": "酸菜鱼",
    "recommendation": "酸香开胃",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-075",
    "name": "砂锅粥",
    "ingredients": "砂锅慢煮 · 想加的食材可备注",
    "categories": [
      "soup"
    ],
    "tags": [],
    "imageKey": "砂锅粥",
    "recommendation": "绵滑鲜香",
    "role": "staple",
    "display": "text"
  },
  {
    "id": "dish-078",
    "name": "卤水拼盘",
    "ingredients": "卤味拼盘 · 想吃的食材可备注",
    "categories": [
      "signature",
      "pork",
      "signature-set"
    ],
    "tags": [],
    "imageKey": "卤水拼盘",
    "recommendation": "卤香入味",
    "role": "meat",
    "display": "photo",
    "aliases": [
      "卤味拼盘",
      "卤水"
    ]
  },
  {
    "id": "dish-079",
    "name": "椰子鸡汤",
    "ingredients": "椰子 · 鸡肉",
    "categories": [
      "soup",
      "signature-set"
    ],
    "tags": [
      "mild",
      "kids"
    ],
    "imageKey": "椰子鸡汤",
    "recommendation": "清甜鲜香",
    "role": "soup",
    "display": "photo"
  },
  {
    "id": "dish-081",
    "name": "猪肚鸡汤",
    "ingredients": "猪肚 · 鸡肉",
    "categories": [
      "soup"
    ],
    "tags": [],
    "imageKey": "猪肚鸡汤",
    "recommendation": "醇厚鲜香",
    "role": "soup",
    "display": "text"
  },
  {
    "id": "dish-082",
    "name": "胡萝卜玉米排骨汤",
    "ingredients": "胡萝卜 · 玉米 · 排骨",
    "categories": [
      "soup"
    ],
    "tags": [
      "mild",
      "kids"
    ],
    "imageKey": "胡萝卜玉米排骨汤",
    "recommendation": "清甜鲜香",
    "role": "soup",
    "display": "text"
  },
  {
    "id": "dish-084",
    "name": "莲藕排骨汤",
    "ingredients": "莲藕 · 排骨",
    "categories": [
      "soup"
    ],
    "tags": [
      "mild"
    ],
    "imageKey": "莲藕排骨汤",
    "recommendation": "清香醇厚",
    "role": "soup",
    "display": "text"
  },
  {
    "id": "dish-087",
    "name": "老鸭冬瓜汤",
    "ingredients": "老鸭 · 冬瓜",
    "categories": [
      "soup"
    ],
    "tags": [
      "mild"
    ],
    "imageKey": "老鸭冬瓜汤",
    "recommendation": "清鲜醇香",
    "role": "soup",
    "display": "text"
  },
  {
    "id": "dish-088",
    "name": "番茄蛋花汤",
    "ingredients": "番茄 · 鸡蛋",
    "categories": [
      "soup"
    ],
    "tags": [
      "mild",
      "kids"
    ],
    "imageKey": "番茄蛋花汤",
    "recommendation": "酸甜清鲜",
    "role": "soup",
    "display": "text"
  },
  {
    "id": "dish-090",
    "name": "丝瓜汤",
    "ingredients": "丝瓜 · 汤",
    "categories": [
      "soup"
    ],
    "tags": [
      "mild"
    ],
    "imageKey": "丝瓜汤",
    "recommendation": "清甜柔嫩",
    "role": "soup",
    "display": "text"
  },
  {
    "id": "dish-092",
    "name": "凉拌鸡爪",
    "ingredients": "鸡爪 · 凉拌",
    "categories": [
      "night"
    ],
    "tags": [],
    "imageKey": "凉拌鸡爪",
    "recommendation": "爽脆开胃",
    "role": "side",
    "display": "text"
  },
  {
    "id": "dish-093",
    "name": "酸辣八爪鱼",
    "ingredients": "八爪鱼 · 酸辣",
    "categories": [
      "night"
    ],
    "tags": [
      "spicy"
    ],
    "imageKey": "酸辣八爪鱼",
    "recommendation": "酸辣爽弹",
    "role": "side",
    "display": "text"
  },
  {
    "id": "dish-094",
    "name": "凉拌青瓜",
    "ingredients": "青瓜 · 凉拌",
    "categories": [
      "vegetables"
    ],
    "tags": [],
    "imageKey": "凉拌青瓜",
    "recommendation": "清爽脆嫩",
    "role": "veg",
    "display": "text"
  },
  {
    "id": "dish-095",
    "name": "酸辣毛豆",
    "ingredients": "毛豆 · 酸辣",
    "categories": [
      "night"
    ],
    "tags": [
      "spicy"
    ],
    "imageKey": "酸辣毛豆",
    "recommendation": "酸辣开胃",
    "role": "side",
    "display": "text"
  },
  {
    "id": "dish-set-octopus-shrimp",
    "name": "凉拌八爪鱼虾",
    "ingredients": "八爪鱼 · 鲜虾 · 凉拌",
    "categories": [
      "seafood",
      "signature-set"
    ],
    "tags": [],
    "imageKey": "凉拌八爪鱼虾",
    "recommendation": "清爽鲜弹",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-set-pickled-beans",
    "name": "酸豆角炒生肠",
    "ingredients": "酸豆角 · 生肠",
    "categories": [
      "pork",
      "signature-set"
    ],
    "tags": [],
    "imageKey": "酸豆角炒生肠",
    "recommendation": "酸香爽脆",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-set-squid-snail",
    "name": "白灼鱿鱼+花螺",
    "ingredients": "鱿鱼 · 花螺 · 白灼",
    "categories": [
      "seafood",
      "signature-set"
    ],
    "tags": [
      "mild"
    ],
    "imageKey": "白灼鱿鱼+花螺",
    "recommendation": "清鲜爽弹",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-set-stuffed-egg",
    "name": "酿蛋+苦瓜",
    "ingredients": "鸡蛋 · 苦瓜 · 酿制",
    "categories": [
      "chicken",
      "hakka",
      "signature-set"
    ],
    "tags": [
      "hakka"
    ],
    "imageKey": "酿蛋+苦瓜",
    "recommendation": "鲜嫩回甘",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-lu-goose",
    "name": "碌鹅",
    "ingredients": "鹅肉 · 碌制",
    "recommendation": "酱香入味",
    "categories": [
      "signature",
      "pork"
    ],
    "tags": [],
    "role": "meat",
    "aliases": [
      "碌整鹅"
    ],
    "imageKey": "碌鹅",
    "display": "photo"
  },
  {
    "id": "dish-hakka-tofu",
    "name": "客家酿豆腐",
    "ingredients": "豆腐 · 酿馅",
    "recommendation": "鲜嫩入味",
    "categories": [
      "signature",
      "hakka",
      "pork"
    ],
    "tags": [
      "hakka",
      "kids"
    ],
    "role": "meat",
    "aliases": [
      "酿豆腐"
    ],
    "imageKey": "客家酿豆腐",
    "display": "photo"
  },
  {
    "id": "dish-hakka-pork-soup",
    "name": "客家土猪汤",
    "ingredients": "土猪肉 · 汤",
    "recommendation": "原味鲜香",
    "categories": [
      "signature",
      "hakka",
      "soup"
    ],
    "tags": [
      "hakka",
      "mild",
      "kids"
    ],
    "role": "soup",
    "aliases": [
      "土猪汤",
      "土猪肉汤"
    ],
    "imageKey": "客家土猪汤",
    "display": "photo"
  },
  {
    "id": "dish-char-siu",
    "name": "叉烧肉",
    "ingredients": "猪肉 · 叉烧",
    "recommendation": "甜香柔嫩",
    "categories": [
      "pork"
    ],
    "tags": [
      "kids"
    ],
    "role": "meat",
    "aliases": [
      "叉烧"
    ],
    "imageKey": "叉烧肉",
    "display": "photo"
  },
  {
    "id": "dish-black-bean-fried-fish",
    "name": "豆豉炸鱼",
    "ingredients": "鲜鱼 · 豆豉 · 炸制",
    "recommendation": "豉香酥口",
    "categories": [
      "seafood"
    ],
    "tags": [],
    "role": "meat",
    "imageKey": "豆豉炸鱼",
    "display": "photo"
  },
  {
    "id": "dish-night-edamame",
    "name": "毛豆",
    "ingredients": "毛豆",
    "recommendation": "清香解馋",
    "categories": [
      "night"
    ],
    "tags": [],
    "role": "side",
    "imageKey": "毛豆",
    "display": "text"
  },
  {
    "id": "dish-night-cold-dish",
    "name": "凉拌小菜",
    "ingredients": "凉拌小菜 · 当天准备",
    "recommendation": "爽口开胃",
    "categories": [
      "night"
    ],
    "tags": [],
    "role": "side",
    "aliases": [
      "凉拌"
    ],
    "imageKey": "凉拌小菜",
    "display": "text"
  },
  {
    "id": "dish-night-lamb-skewers",
    "name": "羊肉串（外卖）",
    "ingredients": "羊肉串 · 点外卖",
    "recommendation": "焦香解馋",
    "categories": [
      "night"
    ],
    "tags": [],
    "role": "meat",
    "fulfillment": "takeaway",
    "aliases": [
      "外卖羊肉串",
      "羊肉串"
    ],
    "imageKey": "羊肉串（外卖）",
    "display": "text"
  },
  {
    "id": "dish-night-cold-takeaway",
    "name": "凉拌小菜（外卖）",
    "ingredients": "凉拌小菜 · 点外卖",
    "recommendation": "清爽开胃",
    "categories": [
      "night"
    ],
    "tags": [],
    "role": "side",
    "fulfillment": "takeaway",
    "aliases": [
      "外卖凉拌",
      "凉拌"
    ],
    "imageKey": "凉拌小菜（外卖）",
    "display": "text"
  },
  {
    "id": "dish-night-beef-shank",
    "name": "卤牛腱肉",
    "ingredients": "牛腱肉 · 卤制",
    "recommendation": "卤香紧实",
    "categories": [
      "beef",
      "night"
    ],
    "tags": [],
    "role": "meat",
    "aliases": [
      "卤牛肉",
      "牛腱子"
    ],
    "imageKey": "卤牛腱肉",
    "display": "photo"
  }
];
  const archivedDishes = [
  {
    "id": "dish-004",
    "name": "粉肠排骨煲",
    "ingredients": "粉肠 · 排骨",
    "categories": [
      "pork"
    ],
    "tags": [],
    "imageKey": "粉肠排骨煲",
    "recommendation": "鲜香浓郁",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-008",
    "name": "酸菜炒大肠",
    "ingredients": "酸菜 · 大肠",
    "categories": [
      "pork"
    ],
    "tags": [],
    "imageKey": "酸菜炒大肠",
    "recommendation": "酸香下饭",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-009",
    "name": "卤各种肠",
    "ingredients": "卤肠 · 想吃的部位可备注",
    "categories": [
      "pork"
    ],
    "tags": [],
    "imageKey": "卤各种肠",
    "recommendation": "咸香入味",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-010",
    "name": "猪肉炒青菜",
    "ingredients": "猪肉 · 青菜",
    "categories": [
      "pork"
    ],
    "tags": [],
    "imageKey": "猪肉炒青菜",
    "recommendation": "家常鲜香",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-014",
    "name": "腊肉炒青菜",
    "ingredients": "腊肉 · 青菜",
    "categories": [
      "pork"
    ],
    "tags": [],
    "imageKey": "腊肉炒青菜",
    "recommendation": "腊香下饭",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-015",
    "name": "猪脚煲",
    "ingredients": "猪脚 · 煲制",
    "categories": [
      "pork"
    ],
    "tags": [],
    "imageKey": "猪脚煲",
    "recommendation": "软糯浓香",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-025",
    "name": "萝卜鸡煲",
    "ingredients": "鸡肉 · 萝卜",
    "categories": [
      "chicken"
    ],
    "tags": [],
    "imageKey": "萝卜鸡煲",
    "recommendation": "清甜鲜香",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-026",
    "name": "鸡杂炒青菜",
    "ingredients": "鸡杂 · 青菜",
    "categories": [
      "chicken"
    ],
    "tags": [],
    "imageKey": "鸡杂炒青菜",
    "recommendation": "爽脆鲜香",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-035",
    "name": "牛肉丸",
    "ingredients": "牛肉丸 · 做法可备注",
    "categories": [
      "beef"
    ],
    "tags": [],
    "imageKey": "牛肉丸",
    "recommendation": "弹嫩鲜香",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-036",
    "name": "三杯鸭鹅",
    "ingredients": "鸭 / 鹅 · 想吃哪种可备注",
    "categories": [
      "pork"
    ],
    "tags": [],
    "imageKey": "三杯鸭鹅",
    "recommendation": "酱香浓郁",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-037",
    "name": "焖鸭鹅羊肉",
    "ingredients": "鸭 / 鹅 / 羊肉 · 想吃哪种可备注",
    "categories": [
      "pork"
    ],
    "tags": [],
    "imageKey": "焖鸭鹅羊肉",
    "recommendation": "浓香入味",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-038",
    "name": "卤鸭鹅羊肉",
    "ingredients": "鸭 / 鹅 / 羊肉 · 卤味",
    "categories": [
      "pork"
    ],
    "tags": [],
    "imageKey": "卤鸭鹅羊肉",
    "recommendation": "卤香入味",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-043",
    "name": "黄金虾（炸）",
    "ingredients": "鲜虾 · 酥炸",
    "categories": [
      "seafood"
    ],
    "tags": [],
    "imageKey": "黄金虾（炸）",
    "recommendation": "外酥里嫩",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-048",
    "name": "高压锅生蚝",
    "ingredients": "生蚝 · 压锅",
    "categories": [
      "seafood"
    ],
    "tags": [],
    "imageKey": "高压锅生蚝",
    "recommendation": "原汁鲜甜",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-050",
    "name": "盐焗花螺",
    "ingredients": "花螺 · 盐焗",
    "categories": [
      "seafood"
    ],
    "tags": [],
    "imageKey": "盐焗花螺",
    "recommendation": "咸香弹脆",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-055",
    "name": "姜葱炒田螺",
    "ingredients": "田螺 · 姜葱",
    "categories": [
      "seafood"
    ],
    "tags": [],
    "imageKey": "姜葱炒田螺",
    "recommendation": "鲜香惹味",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-056",
    "name": "姜葱炒圣子皇",
    "ingredients": "贝类 · 姜葱",
    "categories": [
      "seafood"
    ],
    "tags": [],
    "imageKey": "姜葱炒圣子皇",
    "recommendation": "清鲜爽嫩",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-059",
    "name": "番茄鲍鱼煲",
    "ingredients": "番茄 · 鲍鱼",
    "categories": [
      "seafood"
    ],
    "tags": [],
    "imageKey": "番茄鲍鱼煲",
    "recommendation": "酸鲜浓郁",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-064",
    "name": "蒜蓉炒青菜",
    "ingredients": "青菜 · 蒜蓉",
    "categories": [
      "vegetables"
    ],
    "tags": [
      "mild"
    ],
    "imageKey": "蒜蓉炒青菜",
    "recommendation": "蒜香清爽",
    "role": "veg",
    "display": "photo"
  },
  {
    "id": "dish-068",
    "name": "炒麦菜",
    "ingredients": "麦菜 · 清炒",
    "categories": [
      "vegetables"
    ],
    "tags": [
      "mild"
    ],
    "imageKey": "炒麦菜",
    "recommendation": "清香鲜嫩",
    "role": "veg",
    "display": "photo"
  },
  {
    "id": "dish-074",
    "name": "烧烤",
    "ingredients": "想烤的食材，可在点菜单中备注",
    "categories": [
      "pork"
    ],
    "tags": [],
    "imageKey": "烧烤",
    "recommendation": "焦香惹味",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-076",
    "name": "东北一锅炖",
    "ingredients": "一锅热乎菜 · 食材可备注",
    "categories": [
      "pork"
    ],
    "tags": [],
    "imageKey": "东北一锅炖",
    "recommendation": "热乎浓香",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-077",
    "name": "火锅",
    "ingredients": "想吃的锅底和食材，可在点菜单中备注",
    "categories": [
      "pork"
    ],
    "tags": [],
    "imageKey": "火锅",
    "recommendation": "热乎鲜香",
    "role": "meat",
    "display": "photo"
  },
  {
    "id": "dish-080",
    "name": "花旗参鸡汤",
    "ingredients": "花旗参 · 鸡肉",
    "categories": [
      "soup"
    ],
    "tags": [
      "mild"
    ],
    "imageKey": "花旗参鸡汤",
    "recommendation": "微甘清香",
    "role": "soup",
    "display": "photo"
  },
  {
    "id": "dish-083",
    "name": "清蒸猪肉汤",
    "ingredients": "猪肉 · 清蒸",
    "categories": [
      "soup"
    ],
    "tags": [
      "mild"
    ],
    "imageKey": "清蒸猪肉汤",
    "recommendation": "原味鲜香",
    "role": "soup",
    "display": "photo"
  },
  {
    "id": "dish-085",
    "name": "茶树菇汤",
    "ingredients": "茶树菇 · 汤",
    "categories": [
      "soup"
    ],
    "tags": [
      "mild"
    ],
    "imageKey": "茶树菇汤",
    "recommendation": "清鲜菌香",
    "role": "soup",
    "display": "photo"
  },
  {
    "id": "dish-086",
    "name": "红枣枸杞鸡汤",
    "ingredients": "红枣 · 枸杞 · 鸡肉",
    "categories": [
      "soup"
    ],
    "tags": [
      "mild"
    ],
    "imageKey": "红枣枸杞鸡汤",
    "recommendation": "甘甜鲜香",
    "role": "soup",
    "display": "photo"
  },
  {
    "id": "dish-089",
    "name": "紫菜肉丸汤",
    "ingredients": "紫菜 · 肉丸",
    "categories": [
      "soup"
    ],
    "tags": [
      "mild"
    ],
    "imageKey": "紫菜肉丸汤",
    "recommendation": "清鲜弹嫩",
    "role": "soup",
    "display": "photo"
  },
  {
    "id": "dish-091",
    "name": "枸杞汤",
    "ingredients": "枸杞 · 汤",
    "categories": [
      "soup"
    ],
    "tags": [
      "mild"
    ],
    "imageKey": "枸杞汤",
    "recommendation": "清香回甘",
    "role": "soup",
    "display": "photo"
  }
];
  const featured = [
  "dish-029",
  "dish-078",
  "dish-001",
  "dish-lu-goose",
  "dish-hakka-tofu",
  "dish-hakka-pork-soup"
];
  const signatureSet = [
  {
    "label": "椰子鸡汤",
    "id": "dish-079"
  },
  {
    "label": "猪脚醋",
    "id": "dish-016"
  },
  {
    "label": "小龙虾",
    "id": "dish-072"
  },
  {
    "label": "腐乳炒通心菜",
    "id": "dish-063"
  },
  {
    "label": "凉拌八爪鱼虾",
    "id": "dish-set-octopus-shrimp"
  },
  {
    "label": "酸豆角炒生肠",
    "id": "dish-set-pickled-beans"
  },
  {
    "label": "白灼鱿鱼+花螺",
    "id": "dish-set-squid-snail"
  },
  {
    "label": "卤味拼盘",
    "id": "dish-078"
  },
  {
    "label": "清蒸鲈鱼",
    "id": "dish-040",
    "variantId": "bass"
  },
  {
    "label": "酿蛋+苦瓜",
    "id": "dish-set-stuffed-egg"
  }
];
  window.MENU = { version: 4, categories, dishes, archivedDishes, featured, signatureSet };
})();
