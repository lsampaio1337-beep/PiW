const gyms = [
  {
    "id": "pewter",
    "name": "Pewter Gym",
    "leader": "Brock",
    "levelRequirement": 7,
    "trainers": [
      {
        "name": "Trainer Jerry",
        "team": [{"id": 74, "level": 6}, {"id": 50, "level": 6}]
      },
      {
        "name": "Leader Brock",
        "team": [{"id": 74, "level": 6}, {"id": 95, "level": 7}]
      }
    ]
  },
  {
    "id": "cerulean",
    "name": "Cerulean Gym",
    "leader": "Misty",
    "levelRequirement": 16,
    "trainers": [
      {
        "name": "Trainer Luis",
        "team": [{"id": 116, "level": 14}, {"id": 90, "level": 14}]
      },
      {
        "name": "Trainer Diana",
        "team": [{"id": 118, "level": 15}]
      },
      {
        "name": "Leader Misty",
        "team": [{"id": 120, "level": 15}, {"id": 121, "level": 16}]
      }
    ]
  },
  {
    "id": "vermilion",
    "name": "Vermilion Gym",
    "leader": "Lt. Surge",
    "levelRequirement": 27,
    "trainers": [
      {
        "name": "Trainer Dwayne",
        "team": [{"id": 25, "level": 24}, {"id": 25, "level": 25}]
      },
      {
        "name": "Trainer Baily",
        "team": [{"id": 100, "level": 25}, {"id": 81, "level": 25}]
      },
      {
        "name": "Trainer Tucker",
        "team": [{"id": 100, "level": 26}]
      },
      {
        "name": "Leader Lt. Surge",
        "team": [{"id": 100, "level": 25}, {"id": 25, "level": 26}, {"id": 26, "level": 27}]
      }
    ]
  },
  {
    "id": "celadon",
    "name": "Celadon Gym",
    "leader": "Erika",
    "levelRequirement": 52,
    "trainers": [
      {
        "name": "Trainer Kay",
        "team": [{"id": 69, "level": 48}, {"id": 43, "level": 48}]
      },
      {
        "name": "Trainer Bridget",
        "team": [{"id": 43, "level": 49}, {"id": 69, "level": 49}]
      },
      {
        "name": "Trainer Tina",
        "team": [{"id": 44, "level": 50}]
      },
      {
        "name": "Trainer Mary",
        "team": [{"id": 70, "level": 50}, {"id": 44, "level": 51}]
      },
      {
        "name": "Leader Erika",
        "team": [{"id": 71, "level": 50}, {"id": 114, "level": 51}, {"id": 45, "level": 52}]
      }
    ]
  },
  {
    "id": "fuchsia",
    "name": "Fuchsia Gym",
    "leader": "Koga",
    "levelRequirement": 76,
    "trainers": [
      {
        "name": "Trainer Kirk",
        "team": [{"id": 96, "level": 71}, {"id": 64, "level": 71}]
      },
      {
        "name": "Trainer Nate",
        "team": [{"id": 96, "level": 72}, {"id": 97, "level": 72}]
      },
      {
        "name": "Trainer Phil",
        "team": [{"id": 28, "level": 72}, {"id": 24, "level": 73}]
      },
      {
        "name": "Trainer Edgar",
        "team": [{"id": 24, "level": 73}, {"id": 28, "level": 74}]
      },
      {
        "name": "Leader Koga",
        "team": [{"id": 109, "level": 73}, {"id": 89, "level": 74}, {"id": 109, "level": 74}, {"id": 110, "level": 76}]
      }
    ]
  },
  {
    "id": "saffron",
    "name": "Saffron Gym",
    "leader": "Sabrina",
    "levelRequirement": 84,
    "trainers": [
      {
        "name": "Trainer Johan",
        "team": [{"id": 64, "level": 80}, {"id": 79, "level": 80}, {"id": 122, "level": 81}]
      },
      {
        "name": "Trainer Tyron",
        "team": [{"id": 122, "level": 81}, {"id": 64, "level": 81}]
      },
      {
        "name": "Trainer Stacy",
        "team": [{"id": 92, "level": 81}, {"id": 93, "level": 82}]
      },
      {
        "name": "Trainer Preston",
        "team": [{"id": 80, "level": 82}]
      },
      {
        "name": "Leader Sabrina",
        "team": [{"id": 64, "level": 82}, {"id": 122, "level": 82}, {"id": 49, "level": 83}, {"id": 65, "level": 84}]
      }
    ]
  },
  {
    "id": "cinnabar",
    "name": "Cinnabar Gym",
    "leader": "Blaine",
    "levelRequirement": 88,
    "trainers": [
      {
        "name": "Trainer Erik",
        "team": [{"id": 37, "level": 84}, {"id": 38, "level": 85}]
      },
      {
        "name": "Trainer Quinn",
        "team": [{"id": 58, "level": 85}, {"id": 77, "level": 85}]
      },
      {
        "name": "Trainer Avery",
        "team": [{"id": 77, "level": 85}, {"id": 78, "level": 86}]
      },
      {
        "name": "Trainer Ramon",
        "team": [{"id": 78, "level": 86}, {"id": 59, "level": 87}]
      },
      {
        "name": "Leader Blaine",
        "team": [{"id": 58, "level": 85}, {"id": 77, "level": 86}, {"id": 78, "level": 87}, {"id": 59, "level": 88}]
      }
    ]
  },
  {
    "id": "viridian",
    "name": "Viridian Gym",
    "leader": "Giovanni",
    "levelRequirement": 90,
    "trainers": [
      {
        "name": "Trainer Cole",
        "team": [{"id": 24, "level": 86}, {"id": 128, "level": 87}]
      },
      {
        "name": "Trainer Takashi",
        "team": [{"id": 67, "level": 87}, {"id": 68, "level": 87}]
      },
      {
        "name": "Trainer Samuel",
        "team": [{"id": 28, "level": 87}, {"id": 111, "level": 88}]
      },
      {
        "name": "Trainer Yuji",
        "team": [{"id": 105, "level": 88}, {"id": 51, "level": 88}]
      },
      {
        "name": "Leader Giovanni",
        "team": [{"id": 111, "level": 87}, {"id": 51, "level": 88}, {"id": 31, "level": 88}, {"id": 34, "level": 89}, {"id": 112, "level": 90}]
      }
    ]
  },
  {
    "id": "elite4",
    "name": "Indigo Plateau",
    "leader": "Elite 4",
    "levelRequirement": 100,
    "trainers": [
      {
        "name": "Elite 4 Lorelei",
        "team": [{"id": 87, "level": 94}, {"id": 91, "level": 94}, {"id": 80, "level": 95}, {"id": 124, "level": 95}, {"id": 131, "level": 96}]
      },
      {
        "name": "Elite 4 Bruno",
        "team": [{"id": 95, "level": 95}, {"id": 107, "level": 95}, {"id": 106, "level": 96}, {"id": 95, "level": 96}, {"id": 68, "level": 97}]
      },
      {
        "name": "Elite 4 Agatha",
        "team": [{"id": 94, "level": 96}, {"id": 42, "level": 96}, {"id": 93, "level": 97}, {"id": 24, "level": 97}, {"id": 94, "level": 98}]
      },
      {
        "name": "Elite 4 Lance",
        "team": [{"id": 130, "level": 97}, {"id": 148, "level": 97}, {"id": 148, "level": 98}, {"id": 142, "level": 98}, {"id": 149, "level": 99}]
      },
      {
        "name": "Champion Rival",
        "team": [{"id": 143, "level": 100}, {"id": 65, "level": 100}, {"id": 112, "level": 100}, {"id": 103, "level": 100}, {"id": 121, "level": 100}, {"id": 59, "level": 100}]
      }
    ]
  }
];
export default gyms;
